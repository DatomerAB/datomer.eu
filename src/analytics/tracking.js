import { analytics } from './analytics.js'

const SESSION_KEY = 'par-session-id'
const SESSION_STARTED_KEY = 'par-session-started-at'
const EVENT_TOKEN_KEY = 'par-event-token'
const EVENT_TOKEN_SESSION_KEY = 'par-event-token-session-id'
const EVENT_TOKEN_EXPIRES_KEY = 'par-event-token-expires-at'
const SESSION_TIMEOUT_MS = 30 * 60 * 1000
const TURNSTILE_SCRIPT_ID = 'cf-turnstile-script'
const TURNSTILE_SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

function getTurnstileSiteKey() {
  return import.meta.env.VITE_TURNSTILE_SITE_KEY || ''
}

function generateId() {
  const array = new Uint8Array(16)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array)
  } else {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256)
    }
  }
  return Array.from(array, (b) => b.toString(36).padStart(2, '0')).join('')
}

function getSessionId() {
  if (typeof sessionStorage === 'undefined') return null
  try {
    return sessionStorage.getItem(SESSION_KEY)
  } catch {
    return null
  }
}

function setSessionId(id) {
  if (typeof sessionStorage === 'undefined') return
  try {
    sessionStorage.setItem(SESSION_KEY, id)
    sessionStorage.setItem(SESSION_STARTED_KEY, String(Date.now()))
    clearEventToken()
  } catch {
    // ignore
  }
}

function clearSession() {
  if (typeof sessionStorage === 'undefined') return
  try {
    sessionStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(SESSION_STARTED_KEY)
    clearEventToken()
  } catch {
    // ignore
  }
}

function isSessionExpired() {
  if (typeof sessionStorage === 'undefined') return true
  const started = sessionStorage.getItem(SESSION_STARTED_KEY)
  if (!started) return true
  return Date.now() - Number(started) > SESSION_TIMEOUT_MS
}

export function ensureSession() {
  if (!analytics.hasConsent()) return null
  let id = getSessionId()
  if (!id || isSessionExpired()) {
    id = generateId()
    setSessionId(id)
  }
  return id
}

export function getSessionIdOrNull() {
  if (!analytics.hasConsent()) return null
  const id = getSessionId()
  return id && !isSessionExpired() ? id : null
}

export function resetSession() {
  clearSession()
}

export function getTimeOnSiteMs() {
  if (typeof performance === 'undefined' || !performance.now) return 0
  return Math.round(performance.now())
}

export function getPagePath() {
  if (typeof window === 'undefined') return ''
  return window.location.pathname
}

function clearEventToken() {
  if (typeof sessionStorage === 'undefined') return
  try {
    sessionStorage.removeItem(EVENT_TOKEN_KEY)
    sessionStorage.removeItem(EVENT_TOKEN_SESSION_KEY)
    sessionStorage.removeItem(EVENT_TOKEN_EXPIRES_KEY)
  } catch {
    // ignore
  }
}

function loadTurnstileScript() {
  return new Promise((resolve, reject) => {
    if (window.turnstile) {
      resolve()
      return
    }

    let script = document.getElementById(TURNSTILE_SCRIPT_ID)
    if (script) {
      script.addEventListener('load', resolve, { once: true })
      script.addEventListener('error', () => reject(new Error('Turnstile failed to load')), { once: true })
      return
    }

    script = document.createElement('script')
    script.id = TURNSTILE_SCRIPT_ID
    script.src = TURNSTILE_SCRIPT_SRC
    script.async = true
    script.defer = true
    script.addEventListener('load', resolve, { once: true })
    script.addEventListener('error', () => reject(new Error('Turnstile failed to load')), { once: true })
    document.head.appendChild(script)
  })
}

async function requestTurnstileToken() {
  const siteKey = getTurnstileSiteKey()
  if (!siteKey) return null

  try {
    await loadTurnstileScript()
  } catch {
    return null
  }

  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.left = '-10000px'
  document.body.appendChild(container)

  return new Promise((resolve) => {
    let widgetId
    let timeout
    let settled = false
    const finish = (token) => {
      if (settled) return
      settled = true
      clearTimeout(timeout)
      if (widgetId) {
        try {
          window.turnstile.remove(widgetId)
        } catch {
          // ignore cleanup errors
        }
      }
      container.remove()
      resolve(token || null)
    }
    timeout = setTimeout(() => finish(null), 15000)

    try {
      widgetId = window.turnstile.render(container, {
        sitekey: siteKey,
        action: 'analytics',
        size: 'invisible',
        callback: (token) => finish(token),
        'error-callback': () => finish(null),
        'expired-callback': () => finish(null),
      })
      window.turnstile.execute(widgetId)
    } catch {
      finish(null)
    }
  })
}

async function getEventToken(sessionId) {
  try {
    const cachedToken = sessionStorage.getItem(EVENT_TOKEN_KEY)
    const cachedSessionId = sessionStorage.getItem(EVENT_TOKEN_SESSION_KEY)
    const cachedExpiry = Number(sessionStorage.getItem(EVENT_TOKEN_EXPIRES_KEY))
    if (cachedToken && cachedSessionId === sessionId && cachedExpiry > Date.now()) return cachedToken

    clearEventToken()
    const turnstileToken = await requestTurnstileToken()
    if (!turnstileToken) return null

    const response = await fetch('/api/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, type: 'session', turnstileToken }),
    })
    if (!response.ok) return null

    const result = await response.json()
    if (!result.eventToken || !Number.isFinite(result.expiresAt)) return null
    sessionStorage.setItem(EVENT_TOKEN_KEY, result.eventToken)
    sessionStorage.setItem(EVENT_TOKEN_SESSION_KEY, sessionId)
    sessionStorage.setItem(EVENT_TOKEN_EXPIRES_KEY, String(result.expiresAt))
    return result.eventToken
  } catch {
    return null
  }
}

async function postEvent({ sessionId, type, pagePath, metadata = {}, isActive = () => true }) {
  if (!sessionId || !isActive()) return
  try {
    const eventToken = await getEventToken(sessionId)
    if (!eventToken || !isActive()) return

    const response = await fetch('/api/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, type, pagePath, metadata, eventToken }),
    })
    if (response.status === 401) clearEventToken()
  } catch {
    // ignore network errors
  }
}

export function startTracking() {
  if (typeof window === 'undefined') return () => {}
  if (!analytics.hasConsent()) return () => {}

  const sessionId = ensureSession()
  if (!sessionId) return () => {}

  let active = true
  const sendEvent = (event) => postEvent({ ...event, isActive: () => active })
  const pagePath = getPagePath()
  sendEvent({ sessionId, type: 'pageview', pagePath })

  const heartbeatInterval = 20000
  const heartbeat = setInterval(() => {
    sendEvent({ sessionId, type: 'heartbeat', pagePath: getPagePath() })
  }, heartbeatInterval)

  const handleVisibility = () => {
    if (document.hidden) {
      sendEvent({ sessionId, type: 'hidden', pagePath: getPagePath() })
    } else {
      sendEvent({ sessionId, type: 'visible', pagePath: getPagePath() })
    }
  }
  document.addEventListener('visibilitychange', handleVisibility)

  return () => {
    active = false
    clearInterval(heartbeat)
    document.removeEventListener('visibilitychange', handleVisibility)
  }
}

export function getTrackingPayload() {
  if (!analytics.hasConsent()) {
    return { sessionId: null, timeOnSiteMs: null, pagePath: null }
  }

  return {
    sessionId: getSessionIdOrNull(),
    timeOnSiteMs: getTimeOnSiteMs(),
    pagePath: getPagePath(),
  }
}

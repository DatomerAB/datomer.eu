import { analytics } from './analytics.js'

const SESSION_KEY = 'par-session-id'
const SESSION_STARTED_KEY = 'par-session-started-at'
const SESSION_TIMEOUT_MS = 30 * 60 * 1000

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
  } catch {
    // ignore
  }
}

function clearSession() {
  if (typeof sessionStorage === 'undefined') return
  try {
    sessionStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(SESSION_STARTED_KEY)
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
  return window.location.pathname + window.location.search
}

async function postEvent({ sessionId, type, pagePath, metadata = {} }) {
  if (!sessionId) return
  try {
    await fetch('/api/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, type, pagePath, metadata }),
    })
  } catch {
    // ignore network errors
  }
}

export function startTracking() {
  if (typeof window === 'undefined') return () => {}
  if (!analytics.hasConsent()) return () => {}

  const sessionId = ensureSession()
  if (!sessionId) return () => {}

  const pagePath = getPagePath()
  postEvent({ sessionId, type: 'pageview', pagePath })

  const heartbeatInterval = 20000
  const heartbeat = setInterval(() => {
    postEvent({ sessionId, type: 'heartbeat', pagePath: getPagePath() })
  }, heartbeatInterval)

  const handleVisibility = () => {
    if (document.hidden) {
      postEvent({ sessionId, type: 'hidden', pagePath: getPagePath() })
    } else {
      postEvent({ sessionId, type: 'visible', pagePath: getPagePath() })
    }
  }
  document.addEventListener('visibilitychange', handleVisibility)

  return () => {
    clearInterval(heartbeat)
    document.removeEventListener('visibilitychange', handleVisibility)
  }
}

export function getTrackingPayload() {
  return {
    sessionId: getSessionIdOrNull(),
    timeOnSiteMs: getTimeOnSiteMs(),
    pagePath: getPagePath(),
  }
}

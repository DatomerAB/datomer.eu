import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'

const SCRIPT_ID = 'cf-turnstile-script'
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

function loadTurnstileScript() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      resolve()
      return
    }
    if (window.turnstile) {
      resolve()
      return
    }
    let script = document.getElementById(SCRIPT_ID)
    if (script) {
      const onLoad = () => resolve()
      const onError = () => reject(new Error('Turnstile script failed to load'))
      script.addEventListener('load', onLoad, { once: true })
      script.addEventListener('error', onError, { once: true })
      return
    }
    script = document.createElement('script')
    script.id = SCRIPT_ID
    script.src = SCRIPT_SRC
    script.async = true
    script.defer = true
    script.addEventListener('load', () => resolve(), { once: true })
    script.addEventListener('error', () => reject(new Error('Turnstile script failed to load')), { once: true })
    document.body.appendChild(script)
  })
}

export const Turnstile = forwardRef(function Turnstile(
  { siteKey, onVerify, onError, onExpire, action, theme = 'auto', size = 'compact' },
  ref,
) {
  const containerRef = useRef(null)
  const widgetIdRef = useRef(null)
  const [ready, setReady] = useState(false)

  const resetWidget = () => {
    if (widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.remove(widgetIdRef.current)
      } catch {
        // ignore cleanup errors
      }
      widgetIdRef.current = null
    }
  }

  const renderWidget = () => {
    if (!containerRef.current || widgetIdRef.current || !window.turnstile || !siteKey) return
    try {
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        action,
        theme,
        size,
        callback: (token) => onVerify?.(token),
        'error-callback': (code) => onError?.(code),
        'expired-callback': () => onExpire?.(),
      })
    } catch (err) {
      onError?.(err?.message || 'render_failed')
    }
  }

  useEffect(() => {
    if (!siteKey || typeof window === 'undefined' || import.meta.env.MODE === 'test') return
    let cancelled = false
    loadTurnstileScript()
      .then(() => {
        if (!cancelled) {
          setReady(true)
          renderWidget()
        }
      })
      .catch((err) => {
        if (!cancelled) onError?.(err.message)
      })

    return () => {
      cancelled = true
      resetWidget()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey])

  useImperativeHandle(ref, () => ({
    execute: () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.execute(widgetIdRef.current)
      }
    },
    reset: () => {
      resetWidget()
      renderWidget()
    },
    getResponse: () => {
      if (widgetIdRef.current && window.turnstile) {
        return window.turnstile.getResponse(widgetIdRef.current)
      }
      return null
    },
  }))

  if (!siteKey || typeof window === 'undefined' || import.meta.env.MODE === 'test') return null
  return <div ref={containerRef} className="turnstile-widget" data-turnstile-size={size} data-turnstile-ready={ready} />
})

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'

const SCRIPT_ID = 'cf-turnstile-script'

export const Turnstile = forwardRef(function Turnstile(
  { siteKey, onVerify, onError, onExpire, action, theme = 'auto', size = 'normal' },
  ref,
) {
  const containerRef = useRef(null)
  const widgetIdRef = useRef(null)
  const [scriptLoaded, setScriptLoaded] = useState(
    typeof window !== 'undefined' && !!window.turnstile,
  )

  const renderWidget = () => {
    if (!containerRef.current || widgetIdRef.current || !window.turnstile || !siteKey) return
    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      action,
      theme,
      size,
      callback: (token) => onVerify?.(token),
      'error-callback': () => onError?.(),
      'expired-callback': () => onExpire?.(),
    })
  }

  useEffect(() => {
    if (!siteKey || typeof window === 'undefined' || import.meta.env.MODE === 'test') return
    if (window.turnstile) {
      renderWidget()
      return
    }
    if (document.getElementById(SCRIPT_ID)) {
      const interval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(interval)
          setScriptLoaded(true)
        }
      }, 100)
      const timeout = setTimeout(() => clearInterval(interval), 10000)
      return () => {
        clearInterval(interval)
        clearTimeout(timeout)
      }
    }

    const cbName = `onTurnstileLoaded_${Math.random().toString(36).slice(2)}`
    window[cbName] = () => {
      setScriptLoaded(true)
      delete window[cbName]
    }

    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.src = `https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=${cbName}`
    script.async = true
    script.defer = true
    try {
      document.body.appendChild(script)
    } catch {
      // Some test environments block external scripts; ignore gracefully.
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey])

  useEffect(() => {
    if (scriptLoaded) {
      renderWidget()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptLoaded])

  useImperativeHandle(ref, () => ({
    execute: () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.execute(widgetIdRef.current)
      }
    },
    reset: () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current)
      }
    },
    getResponse: () => {
      if (widgetIdRef.current && window.turnstile) {
        return window.turnstile.getResponse(widgetIdRef.current)
      }
      return null
    },
  }))

  if (!siteKey || typeof window === 'undefined' || import.meta.env.MODE === 'test') return null
  return <div ref={containerRef} className="turnstile-widget" data-turnstile-size={size} />
})

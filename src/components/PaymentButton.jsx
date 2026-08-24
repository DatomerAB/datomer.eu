import { useRef, useState } from 'react'
import { useCheckout } from '../payments/useCheckout.js'
import { useLanguage } from '../i18n/useLanguage.js'
import { Turnstile } from './Turnstile.jsx'

export function PaymentButton({ priceId, mode = 'subscription', children, className = 'button button-primary', disabled = false }) {
  const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || ''
  const { t } = useLanguage()
  const { checkout, loading, error: checkoutError } = useCheckout()
  const turnstileRef = useRef(null)
  const [turnstileToken, setTurnstileToken] = useState(null)
  const [widgetError, setWidgetError] = useState(null)
  const [pendingCheckout, setPendingCheckout] = useState(false)

  const error = checkoutError || widgetError

  const handleClick = () => {
    if (!priceId || loading) return
    setWidgetError(null)
    if (!TURNSTILE_SITE_KEY) {
      checkout(priceId, mode)
      return
    }
    if (turnstileToken) {
      checkout(priceId, mode, turnstileToken)
      return
    }
    const token = turnstileRef.current?.getResponse?.() || null
    if (token) {
      setTurnstileToken(token)
      checkout(priceId, mode, token)
      return
    }
    setPendingCheckout(true)
    turnstileRef.current?.execute?.()
  }

  const handleVerify = (token) => {
    setTurnstileToken(token)
    setWidgetError(null)
    if (pendingCheckout) {
      setPendingCheckout(false)
      checkout(priceId, mode, token)
    }
  }

  const handleError = (code) => {
    setTurnstileToken(null)
    setWidgetError(`${t('payment.challengeFailed')}${code ? ` (${code})` : ''}`)
  }

  return (
    <div className="payment-button-wrap">
      <button
        type="button"
        className={className}
        disabled={disabled || loading || !priceId}
        onClick={handleClick}
      >
        {loading ? t('payment.processing') : children}
      </button>
      {error && <p className="payment-error">{error}</p>}
      {!priceId && !error && !loading && (
        <p className="payment-error">{t('payment.unavailable')}</p>
      )}
      <Turnstile
        ref={turnstileRef}
        siteKey={TURNSTILE_SITE_KEY}
        action="checkout"
        size="compact"
        onVerify={handleVerify}
        onError={handleError}
        onExpire={() => setTurnstileToken(null)}
      />
    </div>
  )
}

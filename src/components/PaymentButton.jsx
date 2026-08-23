import { useCheckout } from '../payments/useCheckout.js'
import { useLanguage } from '../i18n/useLanguage.js'

export function PaymentButton({ priceId, mode = 'subscription', children, className = 'button button-primary', disabled = false }) {
  const { t } = useLanguage()
  const { checkout, loading, error } = useCheckout()

  return (
    <>
      <button
        type="button"
        className={className}
        disabled={disabled || loading || !priceId}
        onClick={() => checkout(priceId, mode)}
      >
        {loading ? t('payment.processing') : children}
      </button>
      {error && <p className="payment-error">{error}</p>}
    </>
  )
}

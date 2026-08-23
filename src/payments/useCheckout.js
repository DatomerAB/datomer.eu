import { useState } from 'react'
import { useLanguage } from '../i18n/useLanguage.js'

export function useCheckout() {
  const { lang, t } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const checkout = async (priceId, mode = 'subscription') => {
    if (!priceId) {
      setError(t('payment.unavailable'))
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, mode, locale: lang }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) {
        throw new Error(data.error || t('payment.error'))
      }
      window.location.href = data.url
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return { checkout, loading, error }
}

import { useState } from 'react'
import { useLanguage } from '../i18n/useLanguage.js'

const STORAGE_KEY = 'par-cookie-consent'

export function CookieConsent() {
  const { t } = useLanguage()
  const [visible, setVisible] = useState(() => {
    if (typeof localStorage === 'undefined' || !localStorage?.getItem) return false
    return !localStorage.getItem(STORAGE_KEY)
  })

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted')
    setVisible(false)
    // Enable GA4 cookies only after consent
    if (window.gtag) {
      window.gtag('consent', 'update', { analytics_storage: 'granted' })
    }
  }

  const handleDecline = () => {
    localStorage.setItem(STORAGE_KEY, 'declined')
    setVisible(false)
    if (window.gtag) {
      window.gtag('consent', 'update', { analytics_storage: 'denied' })
    }
  }

  if (!visible) return null

  return (
    <div className="cookie-banner" role="dialog" aria-live="polite" aria-label="Cookie consent">
      <div className="cookie-banner-inner">
        <p>{t('cookieConsent.text')}</p>
        <div className="cookie-banner-actions">
          <button type="button" className="button button-secondary" onClick={handleDecline}>
            {t('cookieConsent.decline')}
          </button>
          <button type="button" className="button button-primary" onClick={handleAccept}>
            {t('cookieConsent.accept')}
          </button>
        </div>
      </div>
    </div>
  )
}

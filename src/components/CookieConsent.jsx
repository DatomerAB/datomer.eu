import { useEffect, useState } from 'react'
import { useLanguage } from '../i18n/useLanguage.js'
import { analytics } from '../analytics/analytics.js'
import { startTracking } from '../analytics/tracking.js'

const STORAGE_KEY = 'par-cookie-consent'

export function CookieConsent() {
  const { t } = useLanguage()
  const [visible, setVisible] = useState(() => {
    if (typeof localStorage === 'undefined' || !localStorage?.getItem) return false
    return !localStorage.getItem(STORAGE_KEY)
  })

  useEffect(() => {
    if (analytics.hasConsent()) {
      return startTracking()
    }
    return () => {}
  }, [])

  const handleAccept = () => {
    analytics.consent(true)
    setVisible(false)
    startTracking()
  }

  const handleDecline = () => {
    analytics.consent(false)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="cookie-banner" role="dialog" aria-live="polite" aria-label={t('cookieConsent.ariaLabel', { defaultValue: 'Cookie consent' })}>
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

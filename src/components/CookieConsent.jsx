import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../i18n/useLanguage.js'
import { analytics } from '../analytics/analytics.js'
import { resetSession, startTracking } from '../analytics/tracking.js'
import { hasLinkedInChoice, hasLinkedInConsent, isLinkedInEnabled, loadLinkedIn, setLinkedInConsent } from '../analytics/linkedin.js'
import { useBrowserReady } from '../lib/RenderContext.jsx'

const STORAGE_KEY = 'par-cookie-consent'

export function CookieConsent() {
  const ready = useBrowserReady()
  return ready ? <BrowserCookieConsent /> : null
}

function BrowserCookieConsent() {
  const { t } = useLanguage()
  const trackingCleanupRef = useRef(null)
  const linkedInEnabled = isLinkedInEnabled()
  const [analyticsSelected, setAnalyticsSelected] = useState(() => analytics.hasConsent())
  const [marketingSelected, setMarketingSelected] = useState(hasLinkedInConsent)
  const [visible, setVisible] = useState(() => {
    if (typeof localStorage === 'undefined' || !localStorage?.getItem) return false
    return !localStorage.getItem(STORAGE_KEY) || (linkedInEnabled && !hasLinkedInChoice())
  })

  useEffect(() => {
    const openSettings = () => {
      setAnalyticsSelected(analytics.hasConsent())
      setMarketingSelected(hasLinkedInConsent())
      setVisible(true)
    }
    window.addEventListener('par-cookie-settings', openSettings)
    loadLinkedIn()
    if (analytics.hasConsent()) {
      trackingCleanupRef.current = startTracking()
    }

    return () => {
      window.removeEventListener('par-cookie-settings', openSettings)
      trackingCleanupRef.current?.()
      trackingCleanupRef.current = null
    }
  }, [])

  const handleAccept = () => {
    const granted = linkedInEnabled ? analyticsSelected : true
    analytics.consent(granted)
    if (linkedInEnabled) setLinkedInConsent(marketingSelected)
    setVisible(false)
    trackingCleanupRef.current?.()
    trackingCleanupRef.current = granted ? startTracking() : null
    if (!granted) resetSession()
  }

  const handleDecline = () => {
    analytics.consent(false)
    if (linkedInEnabled) setLinkedInConsent(false)
    trackingCleanupRef.current?.()
    trackingCleanupRef.current = null
    resetSession()
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="cookie-banner" role="dialog" aria-live="polite" aria-label={t('cookieConsent.ariaLabel', { defaultValue: 'Cookie consent' })}>
      <div className="cookie-banner-inner">
        <div className="cookie-banner-copy">
          <p>{t('cookieConsent.text')}</p>
          {linkedInEnabled && <>
            <label className="cookie-option">
              <input type="checkbox" checked={analyticsSelected} onChange={event => setAnalyticsSelected(event.target.checked)} />
              {t('cookieConsent.analytics')}
            </label>
            <label className="cookie-option">
              <input type="checkbox" checked={marketingSelected} onChange={event => setMarketingSelected(event.target.checked)} />
              {t('cookieConsent.marketing')}
            </label>
            <p>{t('cookieConsent.linkedinDetails')} <a href="https://www.linkedin.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">{t('cookieConsent.linkedinPrivacy')}</a></p>
          </>}
        </div>
        <div className="cookie-banner-actions">
          <button type="button" className="button button-secondary" onClick={handleDecline}>
            {linkedInEnabled ? t('cookieConsent.rejectAll') : t('cookieConsent.decline')}
          </button>
          <button type="button" className="button button-primary" onClick={handleAccept}>
            {linkedInEnabled ? t('cookieConsent.save') : t('cookieConsent.accept')}
          </button>
        </div>
      </div>
    </div>
  )
}

export function CookieSettingsButton() {
  const { t } = useLanguage()
  return <button type="button" className="button button-secondary" onClick={() => window.dispatchEvent(new Event('par-cookie-settings'))}>
    {t('cookieConsent.settings')}
  </button>
}

export function LinkedInPrivacyNotice() {
  const { t } = useLanguage()
  if (!isLinkedInEnabled()) return null
  return <section>
    <h2>{t('cookieConsent.marketing')}</h2>
    <p>{t('cookieConsent.linkedinDetails')}</p>
    <p>{t('cookieConsent.withdrawal')}</p>
    <p><a href="https://www.linkedin.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">{t('cookieConsent.linkedinPrivacy')}</a></p>
  </section>
}

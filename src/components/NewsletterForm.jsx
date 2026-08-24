import { useState } from 'react'
import { useLanguage } from '../i18n/useLanguage.js'
import { Turnstile } from './Turnstile.jsx'

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || ''

export function NewsletterForm({ source = 'homepage-cta' }) {
  const { t, lang } = useLanguage()
  const [email, setEmail] = useState('')
  const [interests, setInterests] = useState({
    productUpdates: true,
    betaAccess: true,
    changelog: true,
  })
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState(null)

  const getTurnstileResponse = () => {
    const input = document.querySelector(
      '.newsletter-form .turnstile-widget input[name="cf-turnstile-response"]',
    )
    return input?.value || null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return

    const token = getTurnstileResponse()
    if (TURNSTILE_SITE_KEY && !token) {
      setError(t('newsletter.turnstileError'))
      return
    }

    setBusy(true)
    setError(null)

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          type: 'newsletter',
          locale: lang,
          source,
          interests,
          timestamp: new Date().toISOString(),
          turnstileToken: token,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || t('newsletter.error'))
      }

      setDone(true)
      setEmail('')
      setInterests({
        productUpdates: true,
        betaAccess: true,
        changelog: true,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const toggleInterest = (key) => {
    setInterests((current) => ({ ...current, [key]: !current[key] }))
  }

  if (done) {
    return (
      <div className="newsletter-form newsletter-success">
        <p>{t('newsletter.success')}</p>
      </div>
    )
  }

  return (
    <div className="newsletter-block">
      <div className="newsletter-header">
        <strong>{t('newsletter.title')}</strong>
        <span>{t('newsletter.description')}</span>
      </div>
      <form className="newsletter-form" onSubmit={handleSubmit}>
        <label>
          <span className="sr-only">{t('newsletter.emailPlaceholder')}</span>
          <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('newsletter.emailPlaceholder')}
          aria-label={t('newsletter.emailPlaceholder')}
          required
          disabled={busy}
        />
      </label>

      <div className="newsletter-options" aria-label={t('newsletter.title')}>
        <label className="newsletter-option">
          <input
            type="checkbox"
            checked={interests.productUpdates}
            onChange={() => toggleInterest('productUpdates')}
          />
          <span>{t('newsletter.interests.productUpdates')}</span>
        </label>
        <label className="newsletter-option">
          <input
            type="checkbox"
            checked={interests.betaAccess}
            onChange={() => toggleInterest('betaAccess')}
          />
          <span>{t('newsletter.interests.betaAccess')}</span>
        </label>
        <label className="newsletter-option">
          <input
            type="checkbox"
            checked={interests.changelog}
            onChange={() => toggleInterest('changelog')}
          />
          <span>{t('newsletter.interests.changelog')}</span>
        </label>
      </div>

      <Turnstile
        siteKey={TURNSTILE_SITE_KEY}
        action="newsletter"
        size="compact"
        onError={() => setError(t('newsletter.turnstileError'))}
        onExpire={() => setError(null)}
      />

      <button type="submit" className="button button-secondary" disabled={busy}>
        {busy ? t('newsletter.sending') : t('newsletter.submit')}
      </button>

        {error && <span className="waitlist-error">{error}</span>}
      </form>
    </div>
  )
}

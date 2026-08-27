import { useRef, useState } from 'react'
import { useLanguage } from '../i18n/useLanguage.js'
import { Turnstile } from './Turnstile.jsx'
import { getTrackingPayload } from '../analytics/tracking.js'

export function WaitlistForm({ action = 'waitlist-form', source = 'website' }) {
  const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || ''
  const { t, lang } = useLanguage()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [interests, setInterests] = useState({
    productUpdates: true,
    betaAccess: true,
    changelog: true,
  })
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState(null)
  const turnstileRef = useRef(null)

  const toggleInterest = (key) => {
    setInterests((current) => ({ ...current, [key]: !current[key] }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return

    const token = turnstileRef.current?.getResponse?.() || null
    if (TURNSTILE_SITE_KEY && !token) {
      setError(t('waitlist.turnstileError'))
      turnstileRef.current?.execute?.()
      return
    }

    setBusy(true)
    setError(null)
    try {
      const tracking = getTrackingPayload()
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || undefined,
          email: email.trim(),
          type: 'waitlist',
          locale: lang,
          source,
          action,
          interests,
          timestamp: new Date().toISOString(),
          turnstileToken: token,
          ...tracking,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || t('waitlist.error'))
      }
      setDone(true)
      setName('')
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

  if (done) {
    return (
      <div className="waitlist-form waitlist-success">
        <p>{t('waitlist.success')}</p>
      </div>
    )
  }

  return (
    <form className="waitlist-form" onSubmit={handleSubmit}>
      <label>
        <span className="sr-only">{t('waitlist.namePlaceholder')}</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('waitlist.namePlaceholder')}
          aria-label={t('waitlist.namePlaceholder')}
          disabled={busy}
        />
      </label>
      <label>
        <span className="sr-only">{t('cta.waitlistPlaceholder')}</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('cta.waitlistPlaceholder')}
          aria-label={t('cta.waitlistPlaceholder')}
          required
          disabled={busy}
        />
      </label>
      <Turnstile
        ref={turnstileRef}
        siteKey={TURNSTILE_SITE_KEY}
        action="waitlist"
        size="compact"
        onVerify={() => setError(null)}
        onError={(code) => setError(`${t('waitlist.turnstileError')}${code ? ` (${code})` : ''}`)}
        onExpire={() => setError(null)}
      />
      <div className="waitlist-options" aria-label={t('newsletter.title')}>
        <label className="waitlist-option">
          <input
            type="checkbox"
            checked={interests.productUpdates}
            onChange={() => toggleInterest('productUpdates')}
          />
          <span className="waitlist-tick" aria-hidden="true" />
          <span>{t('newsletter.interests.productUpdates')}</span>
        </label>
        <label className="waitlist-option">
          <input
            type="checkbox"
            checked={interests.betaAccess}
            onChange={() => toggleInterest('betaAccess')}
          />
          <span className="waitlist-tick" aria-hidden="true" />
          <span>{t('newsletter.interests.betaAccess')}</span>
        </label>
        <label className="waitlist-option">
          <input
            type="checkbox"
            checked={interests.changelog}
            onChange={() => toggleInterest('changelog')}
          />
          <span className="waitlist-tick" aria-hidden="true" />
          <span>{t('newsletter.interests.changelog')}</span>
        </label>
      </div>

      <button type="submit" className="button button-secondary" disabled={busy}>
        {busy ? t('waitlist.sending') : t('cta.joinWaitlist')}
      </button>
      {error && <span className="form-error">{error}</span>}
    </form>
  )
}

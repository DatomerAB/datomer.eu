import { useState } from 'react'
import { useLanguage } from '../i18n/useLanguage.js'
import { Turnstile } from './Turnstile.jsx'

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || ''

export function WaitlistForm() {
  const { t, lang } = useLanguage()
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState(null)

  const getTurnstileResponse = () => {
    const input = document.querySelector(
      '.waitlist-form .turnstile-widget input[name="cf-turnstile-response"]',
    )
    return input?.value || null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return

    const token = getTurnstileResponse()
    if (TURNSTILE_SITE_KEY && !token) {
      setError(t('waitlist.turnstileError'))
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
          type: 'waitlist',
          locale: lang,
          timestamp: new Date().toISOString(),
          turnstileToken: token,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || t('waitlist.error'))
      }
      setDone(true)
      setEmail('')
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
        siteKey={TURNSTILE_SITE_KEY}
        action="waitlist"
        size="compact"
        onError={() => setError(t('waitlist.turnstileError'))}
        onExpire={() => setError(null)}
      />
      <button type="submit" className="button button-secondary" disabled={busy}>
        {busy ? t('waitlist.sending') : t('cta.joinWaitlist')}
      </button>
      {error && <span className="waitlist-error">{error}</span>}
    </form>
  )
}

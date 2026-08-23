import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../i18n/useLanguage.js'
import { Turnstile } from './Turnstile.jsx'

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || ''

const STORAGE_KEY = 'par-download-info'

const COUNTRY_LIST = [
  { code: 'SE', nameEn: 'Sweden', nameSv: 'Sverige' },
  { code: 'US', nameEn: 'United States', nameSv: 'USA' },
  { code: 'GB', nameEn: 'United Kingdom', nameSv: 'Storbritannien' },
  { code: 'DE', nameEn: 'Germany', nameSv: 'Tyskland' },
  { code: 'FR', nameEn: 'France', nameSv: 'Frankrike' },
  { code: 'NO', nameEn: 'Norway', nameSv: 'Norge' },
  { code: 'DK', nameEn: 'Denmark', nameSv: 'Danmark' },
  { code: 'FI', nameEn: 'Finland', nameSv: 'Finland' },
  { code: 'NL', nameEn: 'Netherlands', nameSv: 'Nederländerna' },
  { code: 'CA', nameEn: 'Canada', nameSv: 'Kanada' },
  { code: 'AU', nameEn: 'Australia', nameSv: 'Australien' },
  { code: 'JP', nameEn: 'Japan', nameSv: 'Japan' },
  { code: 'IN', nameEn: 'India', nameSv: 'Indien' },
  { code: 'BR', nameEn: 'Brazil', nameSv: 'Brasilien' },
  { code: 'ES', nameEn: 'Spain', nameSv: 'Spanien' },
  { code: 'IT', nameEn: 'Italy', nameSv: 'Italien' },
  { code: 'PL', nameEn: 'Poland', nameSv: 'Polen' },
  { code: 'CH', nameEn: 'Switzerland', nameSv: 'Schweiz' },
  { code: 'AT', nameEn: 'Austria', nameSv: 'Österrike' },
  { code: 'BE', nameEn: 'Belgium', nameSv: 'Belgien' },
  { code: 'PT', nameEn: 'Portugal', nameSv: 'Portugal' },
  { code: 'IE', nameEn: 'Ireland', nameSv: 'Irland' },
]

function readStoredForm() {
  if (typeof localStorage === 'undefined') return { name: '', email: '', phone: '', country: '' }
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return { name: '', email: '', phone: '', country: '' }
  try {
    const parsed = JSON.parse(stored)
    return { name: '', email: '', phone: '', country: '', ...parsed }
  } catch {
    return { name: '', email: '', phone: '', country: '' }
  }
}

export function DownloadForm({ downloadUrl, onClose }) {
  const { t, lang } = useLanguage()
  const [form, setForm] = useState(readStoredForm)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState(null)
  const [turnstileToken, setTurnstileToken] = useState(null)
  const [pendingSubmit, setPendingSubmit] = useState(false)
  const turnstileRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    fetch('https://ipapi.co/json/')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data?.country_code) return
        const code = data.country_code.toUpperCase()
        if (COUNTRY_LIST.some((c) => c.code === code)) {
          setForm((f) => ({ ...f, country: code }))
        }
      })
      .catch(() => {
        // ignore geolocation errors
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const submitForm = async (token) => {
    setBusy(true)
    setError(null)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form))
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          type: 'download',
          locale: lang,
          timestamp: new Date().toISOString(),
          turnstileToken: token,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'Submission failed')
      }
      setDone(true)
      if (downloadUrl) {
        const a = document.createElement('a')
        a.href = downloadUrl
        a.download = ''
        document.body.appendChild(a)
        a.click()
        a.remove()
      }
    } catch (err) {
      setError(err.message)
      setTurnstileToken(null)
      turnstileRef.current?.reset()
    } finally {
      setBusy(false)
    }
  }

  const getTurnstileResponse = () => {
    const input = document.querySelector(
      '.download-form .turnstile-widget input[name="cf-turnstile-response"]',
    )
    return input?.value || null
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      const token = getTurnstileResponse()
      if (token) {
        setTurnstileToken(token)
        submitForm(token)
        return
      }
      setPendingSubmit(true)
      return
    }
    submitForm(turnstileToken)
  }

  const handleTurnstileVerify = (token) => {
    setTurnstileToken(token)
    if (pendingSubmit) {
      setPendingSubmit(false)
      submitForm(token)
    }
  }

  const handleTurnstileError = () => {
    setError(t('downloadForm.turnstileError'))
    setTurnstileToken(null)
  }

  const countryName = (c) => (lang === 'sv' ? c.nameSv : c.nameEn)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="download-form-title" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <h2 id="download-form-title">{t('downloadForm.title')}</h2>
        <p>{t('downloadForm.subtitle')}</p>
        {done ? (
          <div className="form-success">
            <p>{t('downloadForm.success')}</p>
            {downloadUrl && (
              <p>
                <a href={downloadUrl} className="button button-primary" download>
                  {t('downloadForm.downloadAgain')}
                </a>
              </p>
            )}
          </div>
        ) : (
          <form className="download-form" onSubmit={handleSubmit}>
            <label>
              <span>{t('downloadForm.name')}</span>
              <input type="text" name="name" value={form.name} onChange={handleChange} required autoComplete="name" />
            </label>
            <label>
              <span>{t('downloadForm.email')}</span>
              <input type="email" name="email" value={form.email} onChange={handleChange} required autoComplete="email" />
            </label>
            <label>
              <span>{t('downloadForm.phone')}</span>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} autoComplete="tel" />
            </label>
            <label>
              <span>{t('downloadForm.country')}</span>
              <select name="country" value={form.country} onChange={handleChange} required>
                <option value="">{t('downloadForm.selectCountry')}</option>
                {COUNTRY_LIST.map((c) => (
                  <option key={c.code} value={c.code}>
                    {countryName(c)}
                  </option>
                ))}
              </select>
            </label>
            {error && <p className="form-error">{error}</p>}
            <Turnstile
              ref={turnstileRef}
              siteKey={TURNSTILE_SITE_KEY}
              action="download"
              onVerify={handleTurnstileVerify}
              onError={handleTurnstileError}
              onExpire={() => setTurnstileToken(null)}
            />
            <button type="submit" className="button button-primary" disabled={busy}>
              {busy ? t('downloadForm.sending') : t('downloadForm.submit')}
            </button>
            <p className="form-consent">{t('downloadForm.consent')}</p>
          </form>
        )}
      </div>
    </div>
  )
}

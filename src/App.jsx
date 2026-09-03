import './App.css'
import { useEffect, useRef, useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { formatHeading, useLocalizedHeading } from './lib/formatHeading.js'
import { useLanguage } from './i18n/useLanguage.js'
import { LanguageSwitcher } from './components/LanguageSwitcher.jsx'
import { DownloadForm } from './components/DownloadForm.jsx'
import { PaymentButton } from './components/PaymentButton.jsx'
import { WaitlistForm } from './components/WaitlistForm.jsx'
import { NewsletterForm } from './components/NewsletterForm.jsx'
import { CookieConsent } from './components/CookieConsent.jsx'
import { Turnstile } from './components/Turnstile.jsx'
import { BlogPage } from './pages/BlogPage.jsx'
import { PressPage } from './pages/PressPage.jsx'
import { ModelAttributionPage } from './pages/ModelAttributionPage.jsx'
import { useExperiment } from './experiments/experiments.js'
import { Icon } from './components/Icon.jsx'

const COMPANY = {
  name: 'Datomer AB',
  orgNumber: '559199-6540',
  address: 'Nyskogavägen 11',
  postcode: '123 64',
  city: 'Farsta',
  country: 'Sweden',
  email: 'hello@datomer.eu',
  domain: 'datomer.eu',
}

// Stripe price IDs (test-mode placeholders). Replace with real Stripe price IDs in Cloudflare Pages secrets/env.
const STRIPE_PRICE_IDS = {
  plusMonthly: import.meta.env.VITE_STRIPE_PLUS_MONTHLY || '',
  plusYearly: import.meta.env.VITE_STRIPE_PLUS_YEARLY || '',
  proMonthly: import.meta.env.VITE_STRIPE_PRO_MONTHLY || '',
  proYearly: import.meta.env.VITE_STRIPE_PRO_YEARLY || '',
}

const FALLBACK_DOWNLOAD_URL =
  'https://github.com/DatomerAB/par-releases/releases/download/v0.1.2-beta.2026090301/Par_0.1.2-beta.2026090301_aarch64.dmg'

function useDownloadUrl() {
  const [url, setUrl] = useState(FALLBACK_DOWNLOAD_URL)

  useEffect(() => {
    let cancelled = false
    // Cache-busted per release so GitHub's CDN serves the fresh latest.json
    // immediately after a new release is published. The RELEASE_TAG placeholder
    // is rewritten by scripts/draft_changelog.py.
    fetch('https://raw.githubusercontent.com/DatomerAB/par-releases/main/latest.json?tag=v0.1.1-beta.2026090301')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data?.version) return
        const version = data.version
        const tag = `v${version}`
        const dmg = `https://github.com/DatomerAB/par-releases/releases/download/${tag}/Par_${version}_aarch64.dmg`
        setUrl(dmg)
      })
      .catch(() => {
        // keep fallback URL
      })
    return () => {
      cancelled = true
    }
  }, [])

  return url
}

function ParLogo() {
  return (
    <svg
      className="brand-symbol"
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Pär"
      role="img"
    >
      <title>Pär</title>
      <defs>
        <linearGradient
          id="silver"
          x1="0"
          y1="0"
          x2="512"
          y2="512"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#8e9aa8" />
          <stop offset="25%" stopColor="#cbd5e1" />
          <stop offset="50%" stopColor="#f8fafc" />
          <stop offset="75%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#8e9aa8" />
        </linearGradient>
      </defs>
      <g
        transform="translate(0,512) scale(0.1,-0.1)"
        fill="url(#silver)"
        stroke="none"
      >
        <path d="M2560 4575 c-8 -2 -49 -9 -90 -15 -361 -58 -704 -304 -928 -666 -160 -258 -256 -552 -303 -934 -9 -68 -13 -504 -16 -1512 l-4 -1417 31 -16 c24 -12 31 -13 35 -3 3 7 6 661 8 1453 4 1576 1 1505 63 1785 56 251 170 515 302 699 79 111 218 256 316 328 142 105 327 186 501 218 125 24 358 16 465 -14 221 -64 379 -197 481 -406 114 -235 139 -545 69 -881 -90 -434 -371 -754 -747 -850 -85 -21 -117 -24 -288 -24 -226 0 -262 -8 -324 -75 -59 -64 -72 -119 -72 -303 0 -84 3 -157 6 -163 8 -12 42 -12 51 2 3 6 7 79 9 162 2 164 11 209 51 257 36 42 49 38 49 -12 0 -24 2 -192 3 -374 2 -296 4 -333 18 -338 43 -16 44 -3 44 401 l0 384 148 -7 c174 -8 285 8 422 59 140 53 233 112 343 216 165 159 276 349 336 579 l27 102 26 -52 c29 -61 127 -199 242 -343 43 -55 88 -113 98 -130 47 -77 2 -137 -135 -179 -103 -32 -152 -68 -168 -129 -15 -57 3 -114 58 -179 l45 -52 -37 -33 c-35 -30 -120 -64 -232 -93 -31 -8 -43 -16 -43 -29 0 -27 18 -37 77 -45 64 -8 131 -31 155 -53 33 -29 22 -59 -35 -102 -101 -74 -118 -132 -87 -291 11 -58 20 -114 20 -125 0 -78 -66 -167 -154 -209 -129 -61 -306 -60 -756 3 -393 55 -358 45 -385 111 -58 142 -235 401 -354 520 -169 167 -321 196 -432 81 -71 -74 -87 -166 -48 -285 69 -209 328 -360 712 -417 60 -8 91 -17 96 -28 14 -26 31 -144 31 -210 0 -53 -5 -72 -34 -124 -87 -156 -128 -363 -124 -622 3 -157 3 -160 25 -163 16 -2 26 4 33 20 12 28 116 536 137 668 8 52 20 108 26 124 16 43 103 123 171 156 132 64 247 76 571 56 159 -10 238 -1 341 40 74 30 147 90 174 144 39 76 42 121 20 257 -26 159 -22 175 65 244 70 54 75 63 75 119 0 45 -41 100 -89 120 l-30 12 57 29 c124 62 146 122 76 206 -51 60 -64 85 -64 118 0 41 39 71 132 99 98 30 164 73 184 121 32 78 13 124 -122 295 -257 325 -302 421 -291 611 29 486 -173 887 -521 1033 -108 46 -216 67 -362 71 -74 2 -142 2 -150 0z m-831 -2719 c97 -50 202 -166 341 -376 34 -52 80 -130 101 -173 l40 -78 -38 6 c-316 52 -472 114 -594 236 -78 77 -112 150 -111 240 0 75 38 142 92 162 40 15 122 6 169 -17z m739 -723 c72 -9 132 -21 132 -25 0 -4 -8 -8 -19 -8 -29 0 -171 -75 -217 -114 l-41 -35 -7 84 c-3 46 -9 90 -12 99 -8 21 0 21 164 -1z m-269 -595 c-21 -102 -38 -150 -25 -73 11 68 39 185 43 181 3 -2 -6 -51 -18 -108z" />
        <path d="M2885 3434 c-89 -46 -118 -131 -75 -218 31 -63 63 -81 142 -81 63 0 69 2 103 35 84 81 64 214 -38 260 -51 24 -92 25 -132 4z" />
      </g>
    </svg>
  )
}

function CompanyAddress({ compact = false }) {
  if (compact) {
    return (
      <address className="company-address company-address-compact">
        {COMPANY.address}, {COMPANY.postcode} {COMPANY.city}, {COMPANY.country} · Org. nr: {COMPANY.orgNumber}
      </address>
    )
  }
  return (
    <address className="company-address">
      <strong>{COMPANY.name}</strong>
      <br />
      {COMPANY.address}, {COMPANY.postcode} {COMPANY.city}, {COMPANY.country}
      <br />
      Org. nr: {COMPANY.orgNumber}
    </address>
  )
}

function DatomerLogo() {
  return (
    <img
      src="/datomer-logo.png"
      alt="Datomer"
      className="datomer-logo"
      width="160"
      height="60"
    />
  )
}

function TopBar({ onDownload }) {
  const { t } = useLanguage()
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <header className="topbar">
      <nav className="nav container" aria-label="Main navigation">
        <Link to="/" className="par-brand" aria-label="Pär home">
          <img
            src="/par-logo.png"
            alt=""
            className="brand-symbol"
            width="44"
            height="44"
          />
          <span className="par-wordmark">Pär</span>
        </Link>

        <div className="nav-links">
          {isHome ? (
            <>
              <a href="#product">{t('nav.product')}</a>
              <a href="#features">{t('nav.features')}</a>
              <a href="#pricing">{t('nav.pricing')}</a>
              <a href="#faq">{t('nav.faq')}</a>
              <Link to="/blog">{t('nav.blog')}</Link>
              <Link to="/models">{t('nav.models')}</Link>
            </>
          ) : (
            <>
              <Link to="/">{t('nav.home')}</Link>
              <Link to="/about">{t('nav.about')}</Link>
              <Link to="/press">{t('nav.press')}</Link>
              <Link to="/contact">{t('nav.contact')}</Link>
              <Link to="/blog">{t('nav.blog')}</Link>
              <Link to="/models">{t('nav.models')}</Link>
            </>
          )}
        </div>

        <div className="header-right" aria-label="Datomer brand group">
          <LanguageSwitcher />
          <button type="button" className="button button-primary" onClick={onDownload}>
            {t('nav.download')}
          </button>
        </div>
      </nav>
    </header>
  )
}

function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-main">
          <div className="footer-brand-group">
            <div className="footer-brand">
              <ParLogo />
              <span>Pär</span>
            </div>
            <p className="footer-tagline">{t('footer.managedBy')}</p>
          </div>

          <nav className="footer-links" aria-label="Site and legal links">
            <Link to="/about">{t('nav.about')}</Link>
            <Link to="/press">{t('nav.press')}</Link>
            <Link to="/contact">{t('nav.contact')}</Link>
            <Link to="/blog">{t('nav.blog')}</Link>
            <span className="footer-links-separator" aria-hidden="true" />
            <Link to="/privacy">{t('footer.legal.privacy')}</Link>
            <Link to="/terms">{t('footer.legal.terms')}</Link>
            <Link to="/cookies">{t('footer.legal.cookies')}</Link>
            <Link to="/models">{t('footer.legal.models')}</Link>
          </nav>

          <div className="footer-company" aria-label="Datomer company details">
            <DatomerLogo />
          </div>
        </div>

        <div className="footer-bottom" aria-label="Datomer address details">
          <p className="footer-legal-line">
            © {new Date().getFullYear()} {COMPANY.name} · {COMPANY.address}, {COMPANY.postcode} {COMPANY.city}, {COMPANY.country} · Org. nr: {COMPANY.orgNumber}
          </p>
        </div>
      </div>
    </footer>
  )
}

function HomePage({ onDownload }) {
  const { t } = useLanguage()
  const formatHeading = useLocalizedHeading()
  const heroVariant = useExperiment('hero-cta-copy', ['control', 'social-proof'])

  const highlights = [
    { icon: 'device', title: t('highlights.localInference.title'), text: t('highlights.localInference.text') },
    { icon: 'lock', title: t('highlights.encryptedVault.title'), text: t('highlights.encryptedVault.text') },
    { icon: 'arrowRight', title: t('highlights.ownTheKeys.title'), text: t('highlights.ownTheKeys.text') },
  ]

  const capabilities = [
    {
      title: t('capabilities.knowsYou.title'),
      text: t('capabilities.knowsYou.text'),
    },
    {
      title: t('capabilities.knowsWorld.title'),
      text: t('capabilities.knowsWorld.text'),
    },
    {
      title: t('capabilities.actsForYou.title'),
      text: t('capabilities.actsForYou.text'),
    },
  ]

  const features = [
    { title: t('features.portability.title'), badge: t('features.portability.badge'), text: t('features.portability.text') },
    { title: t('features.persistentMemory.title'), badge: t('features.persistentMemory.badge'), text: t('features.persistentMemory.text') },
    { title: t('features.contextGraph.title'), badge: t('features.contextGraph.badge'), text: t('features.contextGraph.text') },
    { title: t('features.modelRouting.title'), badge: t('features.modelRouting.badge'), text: t('features.modelRouting.text') },
    { title: t('features.integrations.title'), badge: t('features.integrations.badge'), text: t('features.integrations.text') },
    { title: t('features.fileIntelligence.title'), badge: t('features.fileIntelligence.badge'), text: t('features.fileIntelligence.text') },
    { title: t('features.routines.title'), badge: t('features.routines.badge'), text: t('features.routines.text') },
    { title: t('features.semanticCache.title'), badge: t('features.semanticCache.badge'), text: t('features.semanticCache.text') },
  ]

  const deployments = [
    {
      status: t('deployments.available'),
      title: t('deployments.desktop.title'),
      text: t('deployments.desktop.text'),
      best: t('deployments.desktop.best'),
    },
    {
      status: t('deployments.comingSoon'),
      title: t('deployments.web.title'),
      text: t('deployments.web.text'),
      best: t('deployments.web.best'),
    },
    {
      status: t('deployments.comingSoon'),
      title: t('deployments.cloud.title'),
      text: t('deployments.cloud.text'),
      best: t('deployments.cloud.best'),
    },
  ]

  const [billingInterval, setBillingInterval] = useState('monthly')

  const plans = {
    free: {
      name: t('pricing.free.name'),
      price: t('pricing.free.price'),
      period: t('pricing.free.period'),
      highlight: false,
      cta: t('pricing.free.cta'),
      note: t('pricing.free.note'),
      items: t('pricingFeatures.free'),
      priceId: '',
      mode: 'subscription',
    },
    plus: {
      name: t('pricing.plus.name'),
      monthlyPrice: t('pricing.plus.price'),
      yearlyPrice: t('pricing.plus.yearlyPrice'),
      period: t('pricing.plus.period'),
      yearlyPeriod: t('pricing.plus.yearlyPeriod'),
      yearly: t('pricing.plus.yearly'),
      monthly: t('pricing.plus.monthly'),
      highlight: true,
      cta: t('pricing.plus.cta'),
      items: t('pricingFeatures.plus'),
      monthlyPriceId: STRIPE_PRICE_IDS.plusMonthly,
      yearlyPriceId: STRIPE_PRICE_IDS.plusYearly,
      mode: 'subscription',
    },
    pro: {
      name: t('pricing.pro.name'),
      monthlyPrice: t('pricing.pro.price'),
      yearlyPrice: t('pricing.pro.yearlyPrice'),
      period: t('pricing.pro.period'),
      yearlyPeriod: t('pricing.pro.yearlyPeriod'),
      yearly: t('pricing.pro.yearly'),
      monthly: t('pricing.pro.monthly'),
      highlight: false,
      cta: t('pricing.pro.cta'),
      items: t('pricingFeatures.pro'),
      monthlyPriceId: STRIPE_PRICE_IDS.proMonthly,
      yearlyPriceId: STRIPE_PRICE_IDS.proYearly,
      mode: 'subscription',
    },
    enterprise: {
      name: t('pricing.enterprise.name'),
      price: t('pricing.enterprise.price'),
      period: t('pricing.enterprise.period'),
      yearly: t('pricing.enterprise.yearly'),
      highlight: false,
      cta: t('pricing.enterprise.cta'),
      items: t('pricingFeatures.enterprise'),
      priceId: '',
      mode: 'subscription',
    },
  }

  const pricing = Object.values(plans).map((plan) => {
    const isYearly = billingInterval === 'yearly'
    const hasPriceIds = Boolean(plan.monthlyPriceId)
    return {
      ...plan,
      price: isYearly ? plan.yearlyPrice : (plan.monthlyPrice ?? plan.price),
      period: isYearly ? plan.yearlyPeriod : plan.period,
      yearly: hasPriceIds ? (isYearly ? plan.monthly : plan.yearly) : plan.yearly,
      priceId: hasPriceIds ? (isYearly ? plan.yearlyPriceId : plan.monthlyPriceId) : '',
    }
  })

  const privacyFeatures = t('privacyHome.features')

  const faqs = [
    { question: t('faq.q1'), answer: t('faq.a1') },
    { question: t('faq.q2'), answer: t('faq.a2') },
    { question: t('faq.q3'), answer: t('faq.a3') },
    { question: t('faq.q4'), answer: t('faq.a4') },
    { question: t('faq.q5'), answer: t('faq.a5') },
  ]

  return (
    <main id="top">
      <section className="hero" id="about">
          <div className="container hero-inner">
            <div className="hero-badge">
              <span className="dot" aria-hidden="true" />
              {heroVariant === 'social-proof' ? t('hero.variantBadge') : t('hero.badge')}
            </div>
            <h1>{formatHeading(t('hero.headline'))}</h1>
            <p className="lede">
              {t('hero.lede')}
            </p>

            <div className="cta-row">
              <button type="button" className="button button-primary" onClick={onDownload}>
                {t('hero.downloadMac')}
              </button>
              <a href="#product" className="button button-secondary">
                {t('hero.seeHowItWorks')}
              </a>
            </div>

            <div className="hero-highlights" aria-label="Core promises">
              {highlights.map((item) => (
                <div key={item.title} className="hero-highlight">
                  <span className="hero-highlight-icon" aria-hidden="true"><Icon name={item.icon} /></span>
                  <div>
                    <strong>{formatHeading(item.title)}</strong>
                    <span>{item.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="proof-bar">
          <div className="container proof-grid">
            <div className="proof-item">
              <strong>{t('proof.localFirst.strong')}</strong>
              <span>{t('proof.localFirst.span')}</span>
            </div>
            <div className="proof-item">
              <strong>{t('proof.encrypted.strong')}</strong>
              <span>{t('proof.encrypted.span')}</span>
            </div>
            <div className="proof-item">
              <strong>{t('proof.oneAgent.strong')}</strong>
              <span>{t('proof.oneAgent.span')}</span>
            </div>
          </div>
        </div>

        <section className="section container capabilities-section" id="product">
          <div className="section-heading">
            <p className="eyebrow">{formatHeading(t('capabilities.eyebrow'))}</p>
            <h2>{formatHeading(t('capabilities.headline'))}</h2>
            <p className="section-subtitle">
              {formatHeading(t('capabilities.subtitle'))}
            </p>
          </div>

          <div className="capability-grid">
            {capabilities.map((item) => (
              <article key={item.title} className="capability-card">
                <h3>{formatHeading(item.title)}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section section-alt" id="features">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">{formatHeading(t('features.eyebrow'))}</p>
              <h2>{formatHeading(t('features.headline'))}</h2>
            </div>

            <div className="feature-grid">
              {features.map((feature) => (
                <article key={feature.title} className="feature-card">
                  <div className="feature-card-header">
                    <h3>{formatHeading(feature.title)}</h3>
                    <span className="feature-badge">{feature.badge}</span>
                  </div>
                  <p>{feature.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section container privacy-section">
          <div className="privacy-copy">
            <p className="eyebrow">{formatHeading(t('privacyHome.eyebrow'))}</p>
            <h2>{formatHeading(t('privacyHome.headline'))}</h2>
            <p>
              {t('privacyHome.text')}
            </p>
            <ul className="privacy-list" aria-label="Privacy foundations">
              {Array.isArray(privacyFeatures) && privacyFeatures.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="privacy-visual" aria-hidden="true">
            <div className="privacy-lock">
              <Icon name="lock" />
            </div>
            <div className="privacy-pillars">
              <div className="privacy-pillar">
                <Icon name="device" />
                <strong>{formatHeading(t('privacyHome.pillars.localInference'))}</strong>
              </div>
              <div className="privacy-pillar">
                <Icon name="lock" />
                <strong>{formatHeading(t('privacyHome.pillars.encryptedVault'))}</strong>
              </div>
              <div className="privacy-pillar">
                <Icon name="arrowRight" />
                <strong>{formatHeading(t('privacyHome.pillars.ownTheKeys'))}</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="section container deployments-section">
          <div className="section-heading">
            <p className="eyebrow">{formatHeading(t('deployments.eyebrow'))}</p>
            <h2>{formatHeading(t('deployments.headline'))}</h2>
            <p className="section-subtitle">{formatHeading(t('deployments.subtitle'))}</p>
          </div>

          <div className="deployment-grid">
            {deployments.map((item) => (
              <article key={item.title} className={`deployment-card ${item.status === t('deployments.available') ? 'available' : ''}`}>
                <span className="deployment-status">{item.status}</span>
                <h3>{formatHeading(item.title)}</h3>
                <p>{item.text}</p>
                <span className="deployment-best">{item.best}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="section section-alt" id="pricing">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">{formatHeading(t('pricing.eyebrow'))}</p>
              <h2>{formatHeading(t('pricing.headline'))}</h2>
            </div>

            <div className="billing-toggle" role="group" aria-label={t('pricing.billing.monthly')}>
              <button
                type="button"
                className={billingInterval === 'monthly' ? 'active' : ''}
                onClick={() => setBillingInterval('monthly')}
                aria-pressed={billingInterval === 'monthly'}
              >
                {t('pricing.billing.monthly')}
              </button>
              <button
                type="button"
                className={billingInterval === 'yearly' ? 'active' : ''}
                onClick={() => setBillingInterval('yearly')}
                aria-pressed={billingInterval === 'yearly'}
              >
                {t('pricing.billing.yearly')}
              </button>
            </div>

            <div className="pricing-grid">
              {pricing.map((plan) => (
                <article key={plan.name} className={`pricing-card ${plan.highlight ? 'highlight' : ''}`}>
                  {plan.highlight && <span className="popular-badge">{t('pricing.popularBadge')}</span>}
                  <div className="pricing-header">
                    <h3>{formatHeading(plan.name)}</h3>
                    <div className="pricing-price">
                      <strong>{plan.price}</strong>
                      <span>{plan.period}</span>
                    </div>
                    {plan.yearly && <span className="pricing-yearly">{plan.yearly}</span>}
                  </div>
                  <ul className="pricing-features">
                    {Array.isArray(plan.items) && plan.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  {plan.name === t('pricing.free.name') ? (
                    <button
                      type="button"
                      className="button button-primary"
                      onClick={onDownload}
                    >
                      {plan.cta}
                    </button>
                  ) : plan.name === t('pricing.enterprise.name') ? (
                    <Link
                      to="/contact"
                      className="button button-secondary"
                    >
                      {plan.cta}
                    </Link>
                  ) : (
                    <PaymentButton
                      priceId={plan.priceId}
                      mode={plan.mode}
                      className="button button-primary"
                    >
                      {plan.cta}
                    </PaymentButton>
                  )}
                  {plan.note && <p className="pricing-note">{plan.note}</p>}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section container requirements-section">
          <div className="section-heading narrow">
            <p className="eyebrow">{formatHeading(t('requirements.eyebrow'))}</p>
            <h2>{formatHeading(t('requirements.headline'))}</h2>
          </div>

          <div className="requirements-card">
            <ul>
              {t('requirements.items').map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="requirements-note">
              {t('requirements.note')}
            </p>
          </div>
        </section>

        <section className="section container faq-section" id="faq">
          <div className="section-heading narrow">
            <p className="eyebrow">{formatHeading(t('faq.eyebrow'))}</p>
            <h2>{formatHeading(t('faq.headline'))}</h2>
          </div>

          <div className="faq-list">
            {faqs.map((item, index) => (
              <details key={item.question} className="faq-item" open={index === 0}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="cta-band" id="download">
          <div className="container">
            <div className="cta-row">
              <div className="cta-download-card">
                <p className="eyebrow">{formatHeading(t('cta.eyebrow'))}</p>
                <h2>{formatHeading(t('cta.headline'))}</h2>
                <button type="button" className="button button-primary cta-download" onClick={onDownload}>
                  {t('cta.downloadMac')}
                </button>
              </div>

              <div className="cta-action-card cta-signup-card">
                <p className="cta-action-label">{t('cta.joinWaitlist')}</p>
                <p className="cta-action-hint">{t('cta.waitlistHint')}</p>
                <WaitlistForm />
              </div>
            </div>
          </div>
          <p className="container cta-disclaimer">
            {t('cta.disclaimer')}
          </p>
        </section>
    </main>
  )
}

function AboutPage() {
  const { t } = useLanguage()
  const formatHeading = useLocalizedHeading()

  return (
    <main className="section container legal-page">
      <h1>{formatHeading(t('about.title'))}</h1>
      <p>{t('about.intro')}</p>
      <p>{t('about.mission')}</p>

      <h2>{formatHeading(t('about.companyTitle'))}</h2>
      <CompanyAddress />

      <h2>{formatHeading(t('about.contactTitle'))}</h2>
      <p>
        {t('about.emailLabel')}: <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
      </p>
    </main>
  )
}

function ContactPage() {
  const { t } = useLanguage()
  const formatHeading = useLocalizedHeading()
  const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || ''
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState({ loading: false, success: false, error: '' })
  const turnstileRef = useRef(null)
  const [turnstileToken, setTurnstileToken] = useState(null)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleVerify = (token) => {
    setTurnstileToken(token)
  }

  const handleError = () => {
    setTurnstileToken(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (status.loading) return

    setStatus({ loading: true, success: false, error: '' })

    let token = turnstileToken
    if (TURNSTILE_SITE_KEY && !token) {
      token = turnstileRef.current?.getResponse?.() || null
    }
    if (TURNSTILE_SITE_KEY && !token) {
      turnstileRef.current?.execute?.()
      setStatus({ loading: false, success: false, error: t('contact.turnstileError') })
      return
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, turnstileToken: token }),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error || t('contact.error'))
      }

      setStatus({ loading: false, success: true, error: '' })
      setForm({ name: '', email: '', message: '' })
      turnstileRef.current?.reset?.()
      setTurnstileToken(null)
    } catch (err) {
      setStatus({ loading: false, success: false, error: err.message })
    }
  }

  return (
    <main className="section container legal-page">
      <h1>{formatHeading(t('contact.title'))}</h1>
      <p>
        {t('contact.intro')}{' '}
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
      </p>

      <form className="contact-form" onSubmit={handleSubmit}>
        <label>
          <span>{t('contact.name')}</span>
          <input name="name" value={form.name} onChange={handleChange} required autoComplete="name" />
        </label>
        <label>
          <span>{t('contact.email')}</span>
          <input name="email" type="email" value={form.email} onChange={handleChange} required autoComplete="email" />
        </label>
        <label>
          <span>{t('contact.message')}</span>
          <textarea name="message" value={form.message} onChange={handleChange} required rows="6" />
        </label>
        <Turnstile
          ref={turnstileRef}
          siteKey={TURNSTILE_SITE_KEY}
          action="contact"
          size="compact"
          onVerify={handleVerify}
          onError={handleError}
          onExpire={() => setTurnstileToken(null)}
        />
        <button type="submit" className="button button-primary" disabled={status.loading}>
          {status.loading ? t('contact.sending') : t('contact.submit')}
        </button>
        {status.success && <p className="form-success">{t('contact.success')}</p>}
        {status.error && <p className="form-error">{status.error}</p>}
      </form>

      <CompanyAddress />
    </main>
  )
}

function PrivacyPage() {
  const { t } = useLanguage()
  const formatHeading = useLocalizedHeading()

  return (
    <main className="section container legal-page">
      <h1>{formatHeading(t('privacy.title'))}</h1>
      <p>
        <strong>{t('privacy.updated')}:</strong> 23 August 2026
      </p>
      <p>
        {t('privacy.intro')}
      </p>

      <h2>{t('privacy.controllerTitle')}</h2>
      <CompanyAddress />
      <p>
        {t('about.emailLabel')}: <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
      </p>

      <h2>{t('privacy.whatTitle')}</h2>
      <ul>
        <li>
          <strong>{t('privacy.what.app')}:</strong> {t('privacy.what.appText')}
        </li>
        <li>
          <strong>{t('privacy.what.website')}:</strong> {t('privacy.what.websiteText')}
        </li>
        <li>
          <strong>{t('privacy.what.waitlist')}:</strong> {t('privacy.what.waitlistText')}
        </li>
      </ul>

      <h2>{t('privacy.basisTitle')}</h2>
      <p>{t('privacy.basisText')}</p>

      <h2>{t('privacy.thirdTitle')}</h2>
      <p>{t('privacy.thirdText')}</p>

      <h2>{t('privacy.rightsTitle')}</h2>
      <p>
        {t('privacy.rightsText')}{' '}
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
      </p>
    </main>
  )
}

function TermsPage() {
  const { t } = useLanguage()
  const formatHeading = useLocalizedHeading()

  return (
    <main className="section container legal-page">
      <h1>{formatHeading(t('terms.title'))}</h1>
      <p>
        <strong>{t('terms.updated')}:</strong> 23 August 2026
      </p>
      <p>
        {t('terms.intro')}
      </p>

      <h2>{t('terms.betaTitle')}</h2>
      <p>{t('terms.betaText')}</p>

      <h2>{t('terms.licenseTitle')}</h2>
      <p>{t('terms.licenseText')}</p>

      <h2>{t('terms.dataTitle')}</h2>
      <p>{t('terms.dataText')}</p>

      <h2>{t('terms.liabilityTitle')}</h2>
      <p>{t('terms.liabilityText')}</p>

      <h2>{t('terms.lawTitle')}</h2>
      <p>{t('terms.lawText')}</p>
    </main>
  )
}

function CookiesPage() {
  const { t } = useLanguage()
  const formatHeading = useLocalizedHeading()

  return (
    <main className="section container legal-page">
      <h1>{formatHeading(t('cookies.title'))}</h1>
      <p>
        <strong>{t('cookies.updated')}:</strong> 23 August 2026
      </p>
      <p>{t('cookies.intro')}</p>

      <h2>{t('cookies.typesTitle')}</h2>
      <ul>
        <li>
          <strong>{t('cookies.essential')}:</strong> {t('cookies.essentialText')}
        </li>
        <li>
          <strong>{t('cookies.analytics')}:</strong> {t('cookies.analyticsText')}
        </li>
      </ul>

      <h2>{t('cookies.manageTitle')}</h2>
      <p>{t('cookies.manageText')}</p>
    </main>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function PaymentSuccessPage() {
  const { t } = useLanguage()
  const formatHeading = useLocalizedHeading()

  return (
    <main className="section container legal-page">
      <h1>{formatHeading(t('payment.successTitle', { defaultValue: 'Thank you!' }))}</h1>
      <p>{t('payment.successText', { defaultValue: 'Your payment was received. We have sent a confirmation email with next steps.' })}</p>
      <p>
        <Link to="/" className="button button-primary">
          {t('nav.home')}
        </Link>
      </p>
    </main>
  )
}

function App() {
  const [showDownloadForm, setShowDownloadForm] = useState(false)
  const downloadUrl = useDownloadUrl()

  return (
    <div className="page-shell">
      <ScrollToTop />
      <TopBar onDownload={() => setShowDownloadForm(true)} />
      <Routes>
        <Route path="/" element={<HomePage onDownload={() => setShowDownloadForm(true)} />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/cookies" element={<CookiesPage />} />
        <Route path="/press" element={<PressPage />} />
        <Route path="/models" element={<ModelAttributionPage />} />
        <Route path="/payment-success" element={<PaymentSuccessPage />} />
      </Routes>
      <Footer />
      {showDownloadForm && (
        <DownloadForm downloadUrl={downloadUrl} onClose={() => setShowDownloadForm(false)} />
      )}
      <CookieConsent />
    </div>
  )
}

export default App

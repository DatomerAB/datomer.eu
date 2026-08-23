import './App.css'
import { useEffect, useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useLanguage } from './i18n/LanguageProvider.jsx'
import { LanguageSwitcher } from './components/LanguageSwitcher.jsx'

const COMPANY = {
  name: 'Datomer AB',
  orgNumber: '559199-6540',
  address: 'Nyskogavägen 11',
  postcode: '123 63',
  city: 'Farsta',
  country: 'Sweden',
  email: 'hello@datomer.eu',
  domain: 'datomer.eu',
}

const FALLBACK_DOWNLOAD_URL =
  'https://github.com/DatomerAB/par-releases/releases/download/v0.1.0-beta.2026081301/Par_0.1.0-beta.2026081301_aarch64.dmg'

function useDownloadUrl() {
  const [url, setUrl] = useState(FALLBACK_DOWNLOAD_URL)

  useEffect(() => {
    let cancelled = false
    fetch('https://raw.githubusercontent.com/DatomerAB/par-releases/main/latest.json')
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
        fillRule="evenodd"
        stroke="none"
      >
        <path d="M2560 4575 c-8 -2 -49 -9 -90 -15 -361 -58 -704 -304 -928 -666 -160 -258 -256 -552 -303 -934 -9 -68 -13 -504 -16 -1512 l-4 -1417 31 -16 c24 -12 31 -13 35 -3 3 7 6 661 8 1453 4 1576 1 1505 63 1785 56 251 170 515 302 699 79 111 218 256 316 328 142 105 327 186 501 218 125 24 358 16 465 -14 221 -64 379 -197 481 -406 114 -235 139 -545 69 -881 -90 -434 -371 -754 -747 -850 -85 -21 -117 -24 -288 -24 -226 0 -262 -8 -324 -75 -59 -64 -72 -119 -72 -303 0 -84 3 -157 6 -163 8 -12 42 -12 51 2 3 6 7 79 9 162 2 164 11 209 51 257 36 42 49 38 49 -12 0 -24 2 -192 3 -374 2 -296 4 -333 18 -338 43 -16 44 -3 44 401 l0 384 148 -7 c174 -8 285 8 422 59 140 53 233 112 343 216 165 159 276 349 336 579 l27 102 26 -52 c29 -61 127 -199 242 -343 43 -55 88 -113 98 -130 47 -77 2 -137 -135 -179 -103 -32 -152 -68 -168 -129 -15 -57 3 -114 58 -179 l45 -52 -37 -33 c-35 -30 -120 -64 -232 -93 -31 -8 -43 -16 -43 -29 0 -27 18 -37 77 -45 64 -8 131 -31 155 -53 33 -29 22 -59 -35 -102 -101 -74 -118 -132 -87 -291 11 -58 20 -114 20 -125 0 -78 -66 -167 -154 -209 -129 -61 -306 -60 -756 3 -393 55 -358 45 -385 111 -58 142 -235 401 -354 520 -169 167 -321 196 -432 81 -71 -74 -87 -166 -48 -285 69 -209 328 -360 712 -417 60 -8 91 -17 96 -28 14 -26 31 -144 31 -210 0 -53 -5 -72 -34 -124 -87 -156 -128 -363 -124 -622 3 -157 3 -160 25 -163 16 -2 26 4 33 20 12 28 116 536 137 668 8 52 20 108 26 124 16 43 103 123 171 156 132 64 247 76 571 56 159 -10 238 -1 341 40 74 30 147 90 174 144 39 76 42 121 20 257 -26 159 -22 175 65 244 70 54 75 63 75 119 0 45 -41 100 -89 120 l-30 12 57 29 c124 62 146 122 76 206 -51 60 -64 85 -64 118 0 41 39 71 132 99 98 30 164 73 184 121 32 78 13 124 -122 295 -257 325 -302 421 -291 611 29 486 -173 887 -521 1033 -108 46 -216 67 -362 71 -74 2 -142 2 -150 0z m-831 -2719 c97 -50 202 -166 341 -376 34 -52 80 -130 101 -173 l40 -78 -38 6 c-316 52 -472 114 -594 236 -78 77 -112 150 -111 240 0 75 38 142 92 162 40 15 122 6 169 -17z m739 -723 c72 -9 132 -21 132 -25 0 -4 -8 -8 -19 -8 -29 0 -171 -75 -217 -111 -46 -37 -52 -38 -52 -4 0 40 -26 50 -107 43 -63 -6 -67 -5 -67 15 0 27 35 40 124 45 91 5 117 16 117 48 0 23 -30 38 -104 52 -52 10 -86 10 -86 1 0 -5 14 -19 31 -31 39 -28 41 -52 5 -74 -39 -23 -151 -18 -218 10 -78 33 -158 122 -188 213 -23 70 -20 181 6 246 12 30 40 75 62 101 45 54 139 115 210 138 78 26 231 31 310 11 129 -33 226 -114 271 -229 17 -43 22 -75 22 -150 0 -90 -3 -100 -43 -173 -24 -43 -66 -100 -94 -126 -28 -26 -51 -52 -51 -58 0 -5 23 -10 52 -10 65 0 123 -28 142 -71 15 -32 14 -37 -4 -70 -10 -19 -32 -44 -49 -54 -26 -16 -34 -17 -57 -7 -32 14 -52 4 -52 -28 0 -34 21 -53 60 -53 35 0 73 -28 88 -65 14 -35 -3 -85 -43 -128 -18 -19 -56 -46 -86 -60 -48 -22 -69 -25 -193 -28 -77 -2 -160 -9 -185 -15 -98 -24 -204 -90 -269 -168 -39 -47 -96 -151 -117 -217 -11 -37 -18 -44 -39 -44 -13 0 -26 6 -28 13 -3 6 3 82 12 168 23 210 22 276 -4 347 -31 85 -67 140 -136 209 -83 83 -185 137 -313 164 -64 14 -99 15 -170 7 -102 -12 -184 -45 -260 -105 -50 -39 -74 -68 -110 -127 -47 -79 -65 -147 -65 -245 0 -145 55 -268 164 -366 114 -102 274 -163 556 -211 49 -8 91 -19 94 -24 10 -16 6 -127 -6 -169 -18 -64 -33 -81 -72 -81 -47 0 -72 -28 -72 -80 0 -70 44 -105 131 -105 37 0 50 -5 68 -26 30 -35 29 -79 -4 -112 -16 -16 -41 -29 -57 -29 -42 0 -99 -48 -116 -98 -14 -44 -14 -49 9 -97 14 -28 41 -63 62 -79 36 -27 38 -32 35 -73 -3 -45 -23 -72 -60 -82 -36 -9 -71 14 -83 55 -7 25 -13 29 -44 29 -45 0 -63 -21 -63 -76 0 -59 33 -108 101 -150 79 -49 154 -65 282 -60 129 5 191 25 284 90 128 90 217 250 217 396 0 58 -19 142 -42 190 -24 50 -22 72 10 99 37 31 73 37 117 20 55 -21 70 -54 70 -147 0 -84 13 -124 49 -152 24 -18 39 -21 91 -18 l63 3 3 53 c3 49 5 54 33 68 45 23 73 21 113 -7 52 -36 61 -68 45 -153 -8 -42 -17 -96 -20 -120 -13 -84 -60 -181 -118 -244 -41 -45 -59 -58 -130 -90 -113 -50 -205 -66 -379 -66 -196 0 -302 24 -443 101 -156 85 -260 199 -315 346 -24 66 -27 88 -27 190 0 104 3 123 28 184 35 86 102 175 173 231 67 53 189 112 275 134 92 24 244 24 327 1 140 -40 243 -113 328 -231 35 -50 48 -62 67 -58 13 3 26 13 29 22 8 20 -31 91 -92 169 -77 99 -190 187 -302 236 -55 24 -82 30 -168 33 -56 2 -114 1 -130 -2z" />
      </g>
    </svg>
  )
}

function CompanyAddress() {
  return (
    <address className="company-address">
      <strong>{COMPANY.name}</strong>
      <br />
      {COMPANY.address}
      <br />
      {COMPANY.postcode} {COMPANY.city}
      <br />
      {COMPANY.country}
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
      width="140"
      height="46"
    />
  )
}

function TopBar() {
  const { t } = useLanguage()
  const location = useLocation()
  const isHome = location.pathname === '/'
  const downloadUrl = useDownloadUrl()

  return (
    <header className="topbar">
      <nav className="nav container" aria-label="Main navigation">
        <Link to="/" className="par-brand" aria-label="Pär home">
          <ParLogo />
          <span className="par-wordmark">Pär</span>
        </Link>

        <div className="nav-links">
          {isHome ? (
            <>
              <a href="#product">{t('nav.product')}</a>
              <a href="#features">{t('nav.features')}</a>
              <a href="#pricing">{t('nav.pricing')}</a>
              <a href="#faq">{t('nav.faq')}</a>
            </>
          ) : (
            <>
              <Link to="/">{t('nav.home')}</Link>
              <Link to="/about">{t('nav.about')}</Link>
              <Link to="/contact">{t('nav.contact')}</Link>
            </>
          )}
        </div>

        <div className="header-right" aria-label="Datomer brand group">
          <LanguageSwitcher />
          <Link to="/" className="datomer-link" aria-label="Datomer home">
            <DatomerLogo />
          </Link>
          <a href={downloadUrl} className="button button-primary" download>
            {t('nav.download')}
          </a>
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
        <div>
          <div className="footer-brand">
            <ParLogo />
            <span>Pär</span>
          </div>
          <p>{t('footer.managedBy')}</p>
          <CompanyAddress />
        </div>

        <div className="footer-links">
          <Link to="/about">{t('nav.about')}</Link>
          <Link to="/contact">{t('nav.contact')}</Link>
          <Link to="/privacy">{t('footer.legal.privacy')}</Link>
          <Link to="/terms">{t('footer.legal.terms')}</Link>
          <Link to="/cookies">{t('footer.legal.cookies')}</Link>
        </div>

        <div className="footer-meta">
          <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
          <div className="legal-links">
            <Link to="/privacy">{t('footer.legal.privacy')}</Link>
            <Link to="/terms">{t('footer.legal.terms')}</Link>
            <Link to="/cookies">{t('footer.legal.cookies')}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

function HomePage() {
  const { t } = useLanguage()
  const downloadUrl = useDownloadUrl()

  const highlights = [
    { icon: '🖥️', title: t('highlights.localInference.title'), text: t('highlights.localInference.text') },
    { icon: '🔒', title: t('highlights.encryptedVault.title'), text: t('highlights.encryptedVault.text') },
    { icon: '👤', title: t('highlights.ownTheKeys.title'), text: t('highlights.ownTheKeys.text') },
  ]

  const capabilities = [
    {
      icon: '🧠',
      title: t('capabilities.knowsYou.title'),
      text: t('capabilities.knowsYou.text'),
    },
    {
      icon: '🌍',
      title: t('capabilities.knowsWorld.title'),
      text: t('capabilities.knowsWorld.text'),
    },
    {
      icon: '⚡',
      title: t('capabilities.actsForYou.title'),
      text: t('capabilities.actsForYou.text'),
    },
  ]

  const features = [
    { title: t('features.persistentMemory.title'), badge: t('features.persistentMemory.badge'), text: t('features.persistentMemory.text') },
    { title: t('features.contextGraph.title'), badge: t('features.contextGraph.badge'), text: t('features.contextGraph.text') },
    { title: t('features.modelRouting.title'), badge: t('features.modelRouting.badge'), text: t('features.modelRouting.text') },
    { title: t('features.integrations.title'), badge: t('features.integrations.badge'), text: t('features.integrations.text') },
    { title: t('features.fileIntelligence.title'), badge: t('features.fileIntelligence.badge'), text: t('features.fileIntelligence.text') },
    { title: t('features.routines.title'), badge: t('features.routines.badge'), text: t('features.routines.text') },
    { title: t('features.semanticCache.title'), badge: t('features.semanticCache.badge'), text: t('features.semanticCache.text') },
    { title: t('features.portability.title'), badge: t('features.portability.badge'), text: t('features.portability.text') },
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

  const pricing = [
    {
      name: t('pricing.free.name'),
      price: t('pricing.free.price'),
      period: t('pricing.free.period'),
      highlight: false,
      cta: t('pricing.free.cta'),
      note: t('pricing.free.note'),
      items: t('pricingFeatures.free'),
    },
    {
      name: t('pricing.plus.name'),
      price: t('pricing.plus.price'),
      period: t('pricing.plus.period'),
      yearly: t('pricing.plus.yearly'),
      highlight: true,
      cta: t('pricing.plus.cta'),
      items: t('pricingFeatures.plus'),
    },
    {
      name: t('pricing.pro.name'),
      price: t('pricing.pro.price'),
      period: t('pricing.pro.period'),
      yearly: t('pricing.pro.yearly'),
      highlight: false,
      cta: t('pricing.pro.cta'),
      items: t('pricingFeatures.pro'),
    },
    {
      name: t('pricing.enterprise.name'),
      price: t('pricing.enterprise.price'),
      period: t('pricing.enterprise.period'),
      yearly: t('pricing.enterprise.yearly'),
      highlight: false,
      cta: t('pricing.enterprise.cta'),
      items: t('pricingFeatures.enterprise'),
    },
  ]

  const privacyFeatures = t('privacy.features')

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
              {t('hero.badge')}
            </div>
            <h1>{t('hero.headline')}</h1>
            <p className="lede">
              {t('hero.lede')}
            </p>

            <div className="cta-row">
              <a href={downloadUrl} className="button button-primary" download>
                {t('hero.downloadMac')}
              </a>
              <a href="#product" className="button button-secondary">
                {t('hero.seeHowItWorks')}
              </a>
            </div>

            <div className="hero-highlights" aria-label="Core promises">
              {highlights.map((item) => (
                <div key={item.title} className="hero-highlight">
                  <span className="hero-highlight-icon" aria-hidden="true">{item.icon}</span>
                  <div>
                    <strong>{item.title}</strong>
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
            <p className="eyebrow">{t('capabilities.eyebrow')}</p>
            <h2>{t('capabilities.headline')}</h2>
            <p className="section-subtitle">
              {t('capabilities.subtitle')}
            </p>
          </div>

          <div className="capability-grid">
            {capabilities.map((item) => (
              <article key={item.title} className="capability-card">
                <span className="capability-icon" aria-hidden="true">{item.icon}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section section-alt" id="features">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">{t('features.eyebrow')}</p>
              <h2>{t('features.headline')}</h2>
            </div>

            <div className="feature-grid">
              {features.map((feature) => (
                <article key={feature.title} className="feature-card">
                  <div className="feature-card-header">
                    <h3>{feature.title}</h3>
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
            <p className="eyebrow">{t('privacy.eyebrow')}</p>
            <h2>{t('privacy.headline')}</h2>
            <p>
              {t('privacy.text')}
            </p>
            <ul className="privacy-list" aria-label="Privacy foundations">
              {Array.isArray(privacyFeatures) && privacyFeatures.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="privacy-visual" aria-hidden="true">
            <div className="privacy-lock">
              <span>🔒</span>
            </div>
            <div className="privacy-pillars">
              <div className="privacy-pillar">
                <span>🖥️</span>
                <strong>{t('privacy.pillars.localInference')}</strong>
              </div>
              <div className="privacy-pillar">
                <span>🔒</span>
                <strong>{t('privacy.pillars.encryptedVault')}</strong>
              </div>
              <div className="privacy-pillar">
                <span>👤</span>
                <strong>{t('privacy.pillars.ownTheKeys')}</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="section container deployments-section">
          <div className="section-heading">
            <p className="eyebrow">{t('deployments.eyebrow')}</p>
            <h2>{t('deployments.headline')}</h2>
            <p className="section-subtitle">{t('deployments.subtitle')}</p>
          </div>

          <div className="deployment-grid">
            {deployments.map((item) => (
              <article key={item.title} className={`deployment-card ${item.status === t('deployments.available') ? 'available' : ''}`}>
                <span className="deployment-status">{item.status}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <span className="deployment-best">{item.best}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="section section-alt" id="pricing">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">{t('pricing.eyebrow')}</p>
              <h2>{t('pricing.headline')}</h2>
            </div>

            <div className="pricing-grid">
              {pricing.map((plan) => (
                <article key={plan.name} className={`pricing-card ${plan.highlight ? 'highlight' : ''}`}>
                  {plan.highlight && <span className="popular-badge">{t('pricing.popularBadge')}</span>}
                  <div className="pricing-header">
                    <h3>{plan.name}</h3>
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
                  <button type="button" className={`button ${plan.highlight ? 'button-primary' : 'button-secondary'}`}>
                    {plan.cta}
                  </button>
                  {plan.note && <p className="pricing-note">{plan.note}</p>}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section container requirements-section">
          <div className="section-heading narrow">
            <p className="eyebrow">{t('requirements.eyebrow')}</p>
            <h2>{t('requirements.headline')}</h2>
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
            <p className="eyebrow">{t('faq.eyebrow')}</p>
            <h2>{t('faq.headline')}</h2>
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
          <div className="container cta-inner">
            <div>
              <p className="eyebrow">{t('cta.eyebrow')}</p>
              <h2>{t('cta.headline')}</h2>
            </div>

            <div className="cta-actions">
              <a href="#download" className="button button-primary">
                {t('cta.downloadMac')}
              </a>
              <form className="waitlist-form">
                <label>
                  <span className="sr-only">{t('cta.waitlistPlaceholder')}</span>
                  <input type="email" placeholder={t('cta.waitlistPlaceholder')} aria-label={t('cta.waitlistPlaceholder')} />
                </label>
                <button type="submit" className="button button-secondary">
                  {t('cta.joinWaitlist')}
                </button>
              </form>
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

  return (
    <main className="section container legal-page">
      <h1>{t('about.title')}</h1>
      <p>{t('about.intro')}</p>
      <p>{t('about.mission')}</p>

      <h2>{t('about.companyTitle')}</h2>
      <CompanyAddress />

      <h2>{t('about.contactTitle')}</h2>
      <p>
        {t('about.emailLabel')}: <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
      </p>
    </main>
  )
}

function ContactPage() {
  const { t } = useLanguage()

  return (
    <main className="section container legal-page">
      <h1>{t('contact.title')}</h1>
      <p>
        {t('contact.intro')}{' '}
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
      </p>
      <CompanyAddress />
    </main>
  )
}

function PrivacyPage() {
  const { t } = useLanguage()

  return (
    <main className="section container legal-page">
      <h1>{t('privacy.title')}</h1>
      <p>
        <strong>{t('privacy.updated')}:</strong> 23 August 2026
      </p>
      <p>
        {t('privacy.intro', { defaultValue: `This Privacy Policy explains how ${COMPANY.name} processes personal data in connection with the Pär application and website.` })}
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

  return (
    <main className="section container legal-page">
      <h1>{t('terms.title')}</h1>
      <p>
        <strong>{t('terms.updated')}:</strong> 23 August 2026
      </p>
      <p>
        {t('terms.intro', { defaultValue: `These Terms of Service govern your use of the Pär website and beta software provided by ${COMPANY.name} (${COMPANY.orgNumber}).` })}
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

  return (
    <main className="section container legal-page">
      <h1>{t('cookies.title')}</h1>
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

function App() {
  return (
    <div className="page-shell">
      <ScrollToTop />
      <TopBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/cookies" element={<CookiesPage />} />
      </Routes>
      <Footer />
    </div>
  )
}

export default App

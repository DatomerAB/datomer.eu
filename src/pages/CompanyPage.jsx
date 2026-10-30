import { useEffect } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import { ContactPage, PrivacyPage, TermsPage, CookiesPage } from '../App.jsx'
import { LanguageSwitcher } from '../components/LanguageSwitcher.jsx'
import { CookieConsent } from '../components/CookieConsent.jsx'
import { useLanguage } from '../i18n/useLanguage.js'
import { companyContent } from '../content/company.js'
import { siteLinks } from '../lib/site.js'
import './CompanyPage.css'
import { useSiteUrl } from '../lib/RenderContext.jsx'
import { useLocalizedHeading } from '../lib/formatHeading.js'

export function CompanyPage() {
  const { lang } = useLanguage()
  const c = companyContent[lang]
  const formatHeading = useLocalizedHeading()
  const location = useLocation()
  const url = useSiteUrl()
  const suffix = lang === 'en' ? '' : `?lang=${lang}`
  const home = `/${suffix}`
  const product = `${siteLinks(url).product}/${suffix}`
  useEffect(() => {
    if (!location.hash) window.scrollTo(0, 0)
  }, [lang, location.pathname, location.hash])
  const content = (
    <main id="company-main">
      <section className="company-hero container">
        <div>
          <p className="eyebrow">{formatHeading(c.eyebrow)}</p>
          <h1>{formatHeading(c.headline)}<br /><span>{formatHeading(c.headlineEnd)}</span></h1>
          <p className="company-intro">{c.intro}</p>
          <div className="company-actions">
            <Link className="button button-primary" to={`/contact${suffix}`}>{c.cta}</Link>
            <a className="button button-secondary" href={product}>{c.nav.product} →</a>
          </div>
        </div>
        <aside className="company-process" aria-label={formatHeading(c.processTitle)}>
          <h2>{formatHeading(c.processTitle)}</h2>
          <ol>{c.process.map(([title, text]) => <li key={title}>
            <h3>{formatHeading(title)}</h3><p>{text}</p>
          </li>)}</ol>
        </aside>
      </section>
      <section id="services" className="company-section container">
        <p className="eyebrow">{formatHeading(c.nav.services)}</p>
        <h2>{formatHeading(c.servicesTitle)}</h2><p>{c.servicesIntro}</p>
        <div className="company-service-grid">
          {c.services.map(([title, text], index) => <article key={title}>
            <span className="company-number" aria-hidden="true">0{index + 1}</span>
            <h3>{formatHeading(title)}</h3><p>{text}</p>
          </article>)}
        </div>
      </section>
      <section id="approach" className="company-belief">
        <div className="container company-section">
          <p className="eyebrow">{formatHeading(c.nav.approach)}</p>
          <h2>{formatHeading(c.beliefTitle)}</h2><p className="company-intro">{c.belief}</p>
          <div className="company-two-column">
            <article><h3>{formatHeading(c.missionTitle)}</h3><p>{c.mission}</p></article>
            <article><h3>{formatHeading(c.visionTitle)}</h3><p>{c.vision}</p></article>
          </div>
          <h3>{formatHeading(c.objectivesTitle)}</h3>
          <ul>{c.objectives.map(text => <li key={text}>{text}</li>)}</ul>
        </div>
      </section>
      <section className="company-section container">
        <h2>{formatHeading(c.valuesTitle)}</h2>
        <div className="company-values">{c.values.map(([title, text]) =>
          <article key={title}><h3>{formatHeading(title)}</h3><p>{text}</p></article>)}</div>
      </section>
      <section className="container company-product">
        <a href={product} aria-label="Pär"><img src="/par-logo.png" width="80" height="80" alt="Pär" /></a>
        <div><p className="eyebrow">{formatHeading(c.productEyebrow)}</p><h2>{formatHeading(c.productTitle)}</h2><p>{c.productText}</p>
          <a className="button button-primary" href={product}>{c.productCta} →</a></div>
      </section>
      <section id="about" className="company-section container company-two-column">
        <div><h2>{formatHeading(c.aboutTitle)}</h2><p>{c.aboutText}</p>
          <p><a href="https://www.linkedin.com/company/35694620/">{c.companyLinkedIn} ↗</a></p>
          <p><a href="https://www.linkedin.com/in/jayceee">{c.personalLinkedIn} ↗</a></p>
        </div>
        <div><h2>{formatHeading(c.contactTitle)}</h2><p>{c.contactText}</p>
          <Link className="button button-primary" to={`/contact${suffix}`}>{c.nav.contact}</Link>
          <p className="company-email"><a href="mailto:hello@datomer.eu">hello@datomer.eu</a></p>
        </div>
      </section>
    </main>
  )
  return <div className="company-site">
    <header className="company-header"><div className="container company-nav">
      <Link to={home} aria-label="Datomer AB"><img src="/datomer-logo.png?v=20261010" alt="Datomer AB" width="1166" height="399" /></Link>
      <nav aria-label={c.nav.about}>
        <a href={`${home}#services`}>{c.nav.services}</a>
        <a href={`${home}#approach`}>{c.nav.approach}</a>
        <a href={`${home}#about`}>{c.nav.about}</a>
        <Link to={`/contact${suffix}`}>{c.nav.contact}</Link>
        <a href={product}>Pär ↗</a>
      </nav><LanguageSwitcher />
    </div></header>
    <Routes>
      <Route path="/" element={content} />
      <Route path="/about" element={content} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/cookies" element={<CookiesPage />} />
      <Route path="*" element={<main className="company-section container"><h1>{formatHeading(c.notFound)}</h1><Link to={home}>{c.backHome}</Link></main>} />
    </Routes>
    <footer className="footer company-footer"><div className="container footer-inner">
      <div className="footer-main">
        <div className="footer-brand-group">
          <Link to={home} aria-label="Datomer AB">
            <img className="company-footer-logo" src="/datomer-logo.png?v=20261010" alt="Datomer AB" width="1166" height="399" />
          </Link>
        </div>
        <nav className="footer-links" aria-label={c.details}>
          <Link to={`/about${suffix}`}>{c.nav.about}</Link>
          <Link to={`/contact${suffix}`}>{c.nav.contact}</Link>
          <a href="https://www.linkedin.com/company/35694620/">{c.companyLinkedIn}</a>
          <Link to={`/privacy${suffix}`}>{c.privacy}</Link>
          <Link to={`/terms${suffix}`}>{c.terms}</Link>
          <Link to={`/cookies${suffix}`}>{c.cookies}</Link>
        </nav>
        <div className="footer-company">
          <a className="company-footer-product" href={product}>
            <img src="/par-logo.png" alt="" width="40" height="40" />
            <span>{c.nav.product} →</span>
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <p className="footer-legal-line">© {new Date().getFullYear()} Datomer AB · Nyskogavägen 11, 123 64 Farsta, Sweden · Org. nr: 559199-6540</p>
      </div>
    </div></footer>
    <CookieConsent />
  </div>
}

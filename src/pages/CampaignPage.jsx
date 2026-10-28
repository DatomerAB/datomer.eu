import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/useLanguage.js'
import { ProductPreview } from '../components/ProductPreview.jsx'

export function CampaignPage({ campaign, onDownload, downloadUrl }) {
  const { lang } = useLanguage()
  const c = campaign[lang]
  const suffix = lang === 'sv' ? '?lang=sv' : ''
  return <main>
    <section className="hero campaign-hero">
      <div className="container hero-layout">
        <div className="hero-copy">
        <p className="hero-badge">{c.label}</p>
        <h1>{c.heading}</h1>
        <p className="lede">{c.intro}</p>
        <div className="cta-row">
          <button type="button" className="button button-primary" disabled={!downloadUrl}
            onClick={() => onDownload(downloadUrl)}>{c.download}</button>
          <Link className="hero-guide-link" to={`/get-started${suffix}`}>{c.setup} <span aria-hidden="true">→</span></Link>
        </div>
        <p className="campaign-compatibility">{c.compatibility}</p>
        {!downloadUrl && <p role="alert">{c.unavailable}</p>}
        </div>
        <ProductPreview />
      </div>
    </section>
    <section className="section container">
      <div className="section-heading"><h2>{c.benefitsTitle}</h2></div>
      <div className="capability-grid">
        {c.benefits.map(([title, text]) => <article className="capability-card" key={title}>
          <h3>{title}</h3><p>{text}</p>
        </article>)}
      </div>
    </section>
    <section className="section container legal-page">
      <h2>{c.requirementsTitle}</h2>
      <p>{c.requirements}</p>
      <p>{c.limitation}</p>
      <Link to={`/${suffix}`}>{c.product}</Link>
    </section>
  </main>
}

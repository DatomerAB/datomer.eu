import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/useLanguage.js'
import { productPurpose } from '../content/productPurpose.js'
import { purposePage } from '../content/purposePage.js'

export function PurposePage() {
  const { lang } = useLanguage()
  const c = purposePage[lang]
  const purpose = productPurpose[lang]
  const suffix = lang === 'sv' ? '?lang=sv' : ''

  return <main className="section container legal-page">
    <p className="eyebrow">{c.nav}</p>
    <h1>{c.heading}</h1>
    <p>{c.intro}</p>
    <section aria-labelledby="purpose-belief">
      <h2 id="purpose-belief">{c.beliefTitle}</h2>
      <p>{c.belief}</p>
    </section>
    <section aria-labelledby="purpose-vision">
      <h2 id="purpose-vision">{purpose.visionTitle}</h2>
      <p>{purpose.vision}</p>
    </section>
    <section aria-labelledby="purpose-mission">
      <h2 id="purpose-mission">{purpose.missionTitle}</h2>
      <p>{purpose.mission}</p>
    </section>
    <section aria-labelledby="purpose-objectives">
      <h2 id="purpose-objectives">{c.objectivesTitle}</h2>
      <p>{c.note}</p>
      <h3>{c.priority}</h3>
      <p>{c.priorityIntro}</p>
      <ul>{c.objectives.map(([title, text]) =>
        <li key={title}><strong>{title}: </strong>{text}</li>)}</ul>
    </section>
    <section aria-labelledby="purpose-connections">
      <h2 id="purpose-connections">{c.connectionsTitle}</h2>
      <p>{c.connections}</p>
    </section>
    <p><Link to={`/about${suffix}`}>{c.back}</Link></p>
  </main>
}

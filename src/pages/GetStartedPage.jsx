import { useLanguage } from '../i18n/useLanguage.js'
import { useLocalizedHeading } from '../lib/formatHeading.js'
import { BetaDownloads } from '../components/BetaDownloads.jsx'
import { getGetStartedHtml } from '../content/get-started/index.js'

export function GetStartedPage({ downloadCatalog, onDownload }) {
  const { t, lang } = useLanguage()
  const formatHeading = useLocalizedHeading()
  const html = getGetStartedHtml(lang)

  return (
    <main className="section container legal-page get-started-page">
      <header className="page-header">
        <h1>{formatHeading(t('getStarted.title'))}</h1>
        <p className="lede">{t('getStarted.intro')}</p>
      </header>

      <BetaDownloads catalog={downloadCatalog} onDownload={onDownload} />

      <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />

      <section className="get-started-footer-cta">
        <h2>{formatHeading(t('getStarted.readyTitle'))}</h2>
        <p>{t('getStarted.readyText')}</p>
        <a className="button button-primary" href="#beta-releases-title">{t('getStarted.downloadOptions')}</a>
      </section>
    </main>
  )
}

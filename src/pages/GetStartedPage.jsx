import { useLanguage } from '../i18n/useLanguage.js'
import { useLocalizedHeading } from '../lib/formatHeading.js'
import { getGetStartedHtml } from '../content/get-started/index.js'

export function GetStartedPage({ onDownload }) {
  const { t, lang } = useLanguage()
  const formatHeading = useLocalizedHeading()
  const html = getGetStartedHtml(lang)

  return (
    <main className="section container legal-page get-started-page">
      <header className="page-header">
        <h1>{formatHeading(t('getStarted.title'))}</h1>
        <p className="lede">{t('getStarted.intro')}</p>
        <div className="cta-row">
          <button type="button" className="button button-primary" onClick={onDownload}>
            {t('getStarted.downloadMac')}
          </button>
        </div>
        <p className="get-started-note">{t('getStarted.requirementsNote')}</p>
      </header>

      <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />

      <section className="get-started-footer-cta">
        <h2>{formatHeading(t('getStarted.readyTitle'))}</h2>
        <p>{t('getStarted.readyText')}</p>
        <button type="button" className="button button-primary" onClick={onDownload}>
          {t('getStarted.downloadMac')}
        </button>
      </section>
    </main>
  )
}

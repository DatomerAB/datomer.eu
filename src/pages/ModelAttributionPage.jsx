import { useLanguage } from '../i18n/useLanguage.js'
import { useLocalizedHeading } from '../lib/formatHeading.js'
import models from '../data/models.json'

function ExternalLink({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

function LicenseBadge({ license, licenseUrl }) {
  return (
    <span className="license-badge">
      <ExternalLink href={licenseUrl}>{license}</ExternalLink>
    </span>
  )
}

function ModelTable({ rows, t }) {
  return (
    <div className="model-table-wrap">
      <table className="model-table">
        <thead>
          <tr>
            <th>{t('modelAttribution.modelColumn')}</th>
            <th>{t('modelAttribution.authorsColumn')}</th>
            <th>{t('modelAttribution.licenseColumn')}</th>
            <th>{t('modelAttribution.sourceColumn')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((model) => (
            <tr key={model.short_name || model.name}>
              <td>
                <strong>{model.short_name || model.name}</strong>
                {model.use_case ? (
                  <span className="model-use-case">{model.use_case}</span>
                ) : null}
              </td>
              <td>{model.authors}</td>
              <td>
                <LicenseBadge license={model.license} licenseUrl={model.license_url} />
              </td>
              <td>
                <ExternalLink href={model.source_url || model.url}>
                  {model.source_url || model.url}
                </ExternalLink>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function ModelAttributionPage() {
  const { t } = useLanguage()
  const formatHeading = useLocalizedHeading()

  return (
    <main className="section container legal-page model-attribution-page">
      <p className="eyebrow">{t('modelAttribution.eyebrow')}</p>
      <h1>{formatHeading(t('modelAttribution.title'))}</h1>
      <p>{t('modelAttribution.intro')}</p>

      <h2>{t('modelAttribution.bundledTitle')}</h2>
      <p>{t('modelAttribution.bundledText')}</p>
      <ModelTable rows={models.bundled} t={t} />

      <h2>{t('modelAttribution.embedTitle')}</h2>
      <p>{t('modelAttribution.embedText')}</p>
      <ModelTable rows={models.embedding} t={t} />

      <h2>{t('modelAttribution.optionalTitle')}</h2>
      <p>{t('modelAttribution.optionalText')}</p>
      <p className="ollama-note">{t('modelAttribution.ollamaNote')}</p>
      <ModelTable rows={models.optional} t={t} />

      <h2>{t('modelAttribution.softwareTitle')}</h2>
      <p>{t('modelAttribution.softwareText')}</p>
      <ModelTable rows={models.software} t={t} />

      <p className="attribution-closing">
        {t('modelAttribution.closing')}{' '}
        <a href="https://github.com/DatomerAB/par-public/blob/main/docs/NOTICE.md">
          {t('modelAttribution.noticeLink')}
        </a>
        .
      </p>
    </main>
  )
}

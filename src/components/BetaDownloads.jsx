import './BetaDownloads.css'
import { useLanguage } from '../i18n/useLanguage.js'
import { PLATFORM_SUFFIXES, validDownloadCatalog } from '../lib/betaDownloads.js'

export function BetaDownloads({ catalog, onDownload }) {
  const { t } = useLanguage()
  const labels = {
    'macos-arm64': t('betaDownloads.platforms.macos-arm64'),
    'windows-x64-cpu': t('betaDownloads.platforms.windows-x64-cpu'),
    'windows-x64-gpu': t('betaDownloads.platforms.windows-x64-gpu'),
    'linux-x64-cpu': t('betaDownloads.platforms.linux-x64-cpu'),
  }
  const latest = t('betaDownloads.latest')
  const previous = t('betaDownloads.previous')
  if (!validDownloadCatalog(catalog)) return null
  return (
    <section className="beta-downloads container" aria-labelledby="beta-releases-title">
      <h2 id="beta-releases-title">{t('betaDownloads.title')}</h2>
      <div className="beta-download-grid">
        {Object.entries(PLATFORM_SUFFIXES).filter(([platform]) => catalog.platforms[platform]).map(([platform]) => (
          <section className="beta-download-platform" key={platform}>
            <h3>{labels[platform]}</h3>
            <ul>
              {catalog.platforms[platform].map((entry) => (
                <li key={`${entry.tag}/${entry.name}`}>
                  <div>
                    <strong>{entry.tag.slice(1)}</strong>
                    <span>{entry.tag === catalog.platforms[platform][0].tag ? latest : previous}</span>
                  </div>
                  <a className="button button-secondary" href={entry.url} onClick={(event) => {
                    if (onDownload) {
                      event.preventDefault()
                      onDownload(entry.url)
                    }
                  }}>
                    {t('betaDownloads.download')} {entry.name.split('.').at(-1).toUpperCase()}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </section>
  )
}
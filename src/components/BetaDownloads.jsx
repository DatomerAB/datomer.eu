import { useState } from 'react'
import './BetaDownloads.css'
import { useLanguage } from '../i18n/useLanguage.js'
import { getPlatformPresentation, validDownloadCatalog } from '../lib/betaDownloads.js'

export function BetaDownloads({ catalog, onDownload }) {
  const { t, lang } = useLanguage()
  const [selectedVariants, setSelectedVariants] = useState({})
  const latest = t('betaDownloads.latest')
  const previous = t('betaDownloads.previous')
  if (!validDownloadCatalog(catalog)) return null

  const groups = Object.entries(catalog.platforms).reduce((grouped, [platform, entries]) => {
    const presentation = getPlatformPresentation(platform, catalog.platform_metadata?.[platform], lang)
    const group = grouped.get(presentation.os) || { os: presentation.os, order: presentation.order, variants: [] }
    group.variants.push({ id: platform, label: presentation.variant, order: presentation.variantOrder, entries })
    grouped.set(presentation.os, group)
    return grouped
  }, new Map())
  const sortedGroups = [...groups.values()].sort((left, right) => left.order - right.order || left.os.localeCompare(right.os))
  for (const group of sortedGroups) {
    group.variants.sort((left, right) => left.order - right.order || left.label.localeCompare(right.label))
  }

  return (
    <section className="beta-downloads container" aria-labelledby="beta-releases-title">
      <h2 id="beta-releases-title">{t('betaDownloads.title')}</h2>
      <div className="beta-download-grid">
        {sortedGroups.map((group) => {
          const selectedId = selectedVariants[group.os]
          const variant = group.variants.find((item) => item.id === selectedId) || group.variants[0]
          return (
          <section className="beta-download-platform" key={group.os}>
            <div className="beta-download-platform-heading">
              <h3>{group.os}</h3>
              {group.variants.length > 1 ? (
                <label className="beta-download-variant-control">
                  <span>{t('betaDownloads.variant')}</span>
                  <select
                    aria-label={`${t('betaDownloads.variant')} ${group.os}`}
                    value={variant.id}
                    onChange={(event) => setSelectedVariants((current) => ({ ...current, [group.os]: event.target.value }))}
                  >
                    {group.variants.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                  </select>
                </label>
              ) : <span className="beta-download-variant-label">{variant.label}</span>}
            </div>
            <ul>
              {variant.entries.map((entry) => (
                <li key={`${entry.tag}/${entry.name}`}>
                  <div>
                    <strong>{entry.tag.slice(1)}</strong>
                    <span>{entry.tag === variant.entries[0].tag ? latest : previous}</span>
                  </div>
                  <a className="button button-secondary" href={entry.url} onClick={(event) => {
                    if (onDownload) {
                      event.preventDefault()
                      onDownload(entry.url)
                    }
                  }}>
                    {t('betaDownloads.download')} {entry.name.split('.').at(-1)?.toUpperCase() || ''}
                  </a>
                </li>
              ))}
            </ul>
          </section>
          )
        })}
      </div>
    </section>
  )
}
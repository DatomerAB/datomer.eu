import { useEffect, useState } from 'react'
import snapshot from '../content/beta-downloads.json' with { type: 'json' }

const PLATFORM_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const LOCALE_ID = /^[a-z]{2}(?:-[A-Z]{2})?$/
const RELEASE_TAG = /^v\d+\.\d+\.\d+-beta(?:[.-][0-9.]+)?$/

function validLabel(label) {
  if (typeof label === 'string') return Boolean(label.trim())
  if (!label || typeof label !== 'object' || Array.isArray(label)) return false
  const labels = Object.entries(label)
  return labels.length > 0 && labels.every(([locale, value]) => LOCALE_ID.test(locale) && typeof value === 'string' && value.trim())
}

function localizedLabel(label, language) {
  if (typeof label === 'string') return label
  return label?.[language] || label?.en || Object.values(label || {}).find((value) => typeof value === 'string') || ''
}

function humanizeIdentifier(identifier) {
  return identifier.split('-').filter(Boolean).map((part) => `${part[0].toUpperCase()}${part.slice(1)}`).join(' ')
}

export function getPlatformPresentation(platformId, metadata, language) {
  const [system, ...variantParts] = platformId.split('-')
  return {
    os: localizedLabel(metadata?.os, language) || (system === 'macos' ? 'Mac' : humanizeIdentifier(system || platformId)),
    variant: localizedLabel(metadata?.variant, language) || humanizeIdentifier(variantParts.join('-')),
    order: Number.isFinite(metadata?.order) ? metadata.order : Number.MAX_SAFE_INTEGER,
    variantOrder: Number.isFinite(metadata?.variant_order) ? metadata.variant_order : Number.MAX_SAFE_INTEGER,
  }
}

export function validDownloadCatalog(catalog) {
  if (catalog?.schema_version !== 1 || !catalog.platforms || typeof catalog.platforms !== 'object') return false
  const platforms = Object.entries(catalog.platforms)
  const metadata = catalog.platform_metadata ?? {}
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return false
  const validPlatforms = platforms.length > 0 && platforms.every(([platform, entries]) => (
    PLATFORM_ID.test(platform) && Array.isArray(entries) && entries.length > 0 && entries.every((entry) => {
      try {
        if (!entry || typeof entry.name !== 'string' || !entry.name.trim() || /[\\/]/.test(entry.name)) return false
        const url = new URL(entry.url)
        return RELEASE_TAG.test(entry.tag) && url.origin === 'https://github.com' &&
          decodeURIComponent(url.pathname) === `/DatomerAB/par-releases/releases/download/${entry.tag}/${entry.name}` &&
          !url.search && !url.hash && !url.username && !url.password
      } catch {
        return false
      }
    })
  ))
  return validPlatforms && Object.entries(metadata).every(([platform, presentation]) => (
    Boolean(catalog.platforms[platform]) &&
    validLabel(presentation?.os) &&
    validLabel(presentation?.variant) &&
    (presentation.order === undefined || Number.isFinite(presentation.order)) &&
    (presentation.variant_order === undefined || Number.isFinite(presentation.variant_order))
  ))
}

export function useBetaDownloads() {
  const [catalog, setCatalog] = useState(snapshot)
  useEffect(() => {
    const controller = new AbortController()
    const revision = snapshot.revision || Object.values(snapshot.platforms)[0][0].tag
    fetch(`https://raw.githubusercontent.com/DatomerAB/par-releases/main/downloads.json?revision=${encodeURIComponent(revision)}`, {
      signal: controller.signal,
      cache: 'no-store',
    })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (!controller.signal.aborted && validDownloadCatalog(data)) {
          const platformMetadata = Object.fromEntries(
            Object.keys(data.platforms).flatMap((platform) => {
              const presentation = data.platform_metadata?.[platform] ?? snapshot.platform_metadata?.[platform]
              return presentation ? [[platform, presentation]] : []
            }),
          )
          setCatalog({
            ...data,
            platform_metadata: platformMetadata,
          })
        }
      })
      .catch(() => {})
    return () => controller.abort()
  }, [])
  return catalog
}
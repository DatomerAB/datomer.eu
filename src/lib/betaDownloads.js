import { useEffect, useState } from 'react'
import snapshot from '../content/beta-downloads.json' with { type: 'json' }

export const PLATFORM_SUFFIXES = {
  'macos-arm64': /_aarch64\.dmg$/,
  'windows-x64-cpu': /-cpu\.(exe|msi)$/,
  'windows-x64-gpu': /-gpu\.(exe|msi)$/,
  'linux-x64-cpu': /\.AppImage$/,
}

export function validDownloadCatalog(catalog) {
  if (catalog?.schema_version !== 1 || !catalog.platforms || typeof catalog.platforms !== 'object') return false
  const platforms = Object.entries(catalog.platforms)
  return platforms.length > 0 && platforms.every(([platform, entries]) => (
    PLATFORM_SUFFIXES[platform] && Array.isArray(entries) && entries.length > 0 && entries.every((entry) => {
      try {
        const url = new URL(entry.url)
        return /^v\d+\.\d+\.\d+-beta(?:[.-][0-9.]+)?$/.test(entry.tag) &&
          PLATFORM_SUFFIXES[platform].test(entry.name) && url.origin === 'https://github.com' &&
          decodeURIComponent(url.pathname) === `/DatomerAB/par-releases/releases/download/${entry.tag}/${entry.name}` &&
          !url.search && !url.hash && !url.username && !url.password
      } catch {
        return false
      }
    })
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
        if (!controller.signal.aborted && validDownloadCatalog(data)) setCatalog(data)
      })
      .catch(() => {})
    return () => controller.abort()
  }, [])
  return catalog
}
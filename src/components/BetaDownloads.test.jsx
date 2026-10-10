import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { BetaDownloads } from './BetaDownloads.jsx'
import { validDownloadCatalog } from '../lib/betaDownloads.js'
import { LanguageProvider } from '../i18n/LanguageProvider.jsx'

const entry = (tag, name) => ({ tag, name, url: `https://github.com/DatomerAB/par-releases/releases/download/${tag}/${name}` })
const catalog = {
  schema_version: 1,
  platforms: {
    'macos-arm64': [entry('v1.0.0-beta.9', 'Par_aarch64.dmg')],
    'windows-x64-cpu': [entry('v1.0.0-beta.10', 'Par-cpu.exe'), entry('v1.0.0-beta.8', 'Par-cpu.exe')],
  },
}

describe('Beta downloads', () => {
  it('offers each available platform and its retained previous version', () => {
    const onDownload = vi.fn()
    render(<LanguageProvider><BetaDownloads catalog={catalog} onDownload={onDownload} /></LanguageProvider>)
    expect(screen.getByRole('heading', { name: 'Beta releases' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: /Apple Silicon/ })).toBeTruthy()
    expect(screen.getByRole('heading', { name: /Windows.*CPU/ })).toBeTruthy()
    expect(screen.getByText('Previous')).toBeTruthy()
    fireEvent.click(screen.getAllByRole('link', { name: 'Download EXE' })[0])
    expect(onDownload).toHaveBeenCalledWith(catalog.platforms['windows-x64-cpu'][0].url)
    expect(screen.queryByRole('heading', { name: /Linux/ })).toBeNull()
  })

  it('accepts Windows-only releases and rejects untrusted or empty catalogs', () => {
    expect(validDownloadCatalog({ schema_version: 1, platforms: { 'windows-x64-cpu': catalog.platforms['windows-x64-cpu'] } })).toBe(true)
    expect(validDownloadCatalog({ schema_version: 1, platforms: {} })).toBe(false)
    expect(validDownloadCatalog({ schema_version: 1, platforms: { 'macos-arm64': [{ ...catalog.platforms['macos-arm64'][0], url: 'https://example.com/installer' }] } })).toBe(false)
  })
})
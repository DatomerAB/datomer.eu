import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { BetaDownloads } from './BetaDownloads.jsx'
import { validDownloadCatalog } from '../lib/betaDownloads.js'
import { LanguageProvider } from '../i18n/LanguageProvider.jsx'

const entry = (tag, name) => ({ tag, name, url: `https://github.com/DatomerAB/par-releases/releases/download/${tag}/${name}` })
const catalog = {
  schema_version: 1,
  platform_metadata: {
    'macos-arm64': { os: { en: 'Mac', sv: 'Mac' }, variant: { en: 'Apple Silicon', sv: 'Apple Silicon' }, order: 1 },
    'windows-x64-cpu': { os: { en: 'Windows', sv: 'Windows' }, variant: { en: 'CPU', sv: 'CPU' }, order: 2, variant_order: 1 },
    'windows-x64-gpu': { os: { en: 'Windows', sv: 'Windows' }, variant: { en: 'GPU', sv: 'GPU' }, order: 2, variant_order: 2 },
    'linux-x64-cpu': { os: { en: 'Linux', sv: 'Linux' }, variant: { en: 'CPU', sv: 'CPU' }, order: 3 },
    'freebsd-riscv64-cpu': { os: { en: 'FreeBSD', sv: 'FreeBSD' }, variant: { en: 'CPU', sv: 'CPU' }, order: 4 },
  },
  platforms: {
    'macos-arm64': [entry('v1.0.0-beta.9', 'Par_aarch64.dmg')],
    'windows-x64-cpu': [entry('v1.0.0-beta.10', 'Par-cpu.exe'), entry('v1.0.0-beta.8', 'Par-cpu.exe')],
    'windows-x64-gpu': [entry('v1.0.0-beta.10', 'Par-gpu.exe')],
    'linux-x64-cpu': [entry('v1.0.0-beta.10', 'Par.AppImage')],
    'freebsd-riscv64-cpu': [entry('v1.0.0-beta.10', 'Par-freebsd.pkg')],
  },
}

describe('Beta downloads', () => {
  it('groups platforms from catalog metadata and selects an available variant', () => {
    const onDownload = vi.fn()
    render(<LanguageProvider><BetaDownloads catalog={catalog} onDownload={onDownload} /></LanguageProvider>)
    expect(screen.getByRole('heading', { name: 'Beta releases' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Mac' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Windows' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Linux' })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'FreeBSD' })).toBeTruthy()
    expect(screen.getAllByRole('heading', { name: 'Windows' })).toHaveLength(1)
    expect(screen.getByText('Apple Silicon')).toBeTruthy()
    expect(screen.getByText('Previous')).toBeTruthy()
    fireEvent.change(screen.getByRole('combobox', { name: 'Variant Windows' }), { target: { value: 'windows-x64-gpu' } })
    fireEvent.click(screen.getByRole('link', { name: 'Download EXE' }))
    expect(onDownload).toHaveBeenCalledWith(catalog.platforms['windows-x64-gpu'][0].url)
  })

  it('accepts data-driven platforms and rejects untrusted, malformed, or empty catalogs', () => {
    expect(validDownloadCatalog({
      schema_version: 1,
      platforms: { 'windows-x64-cpu': catalog.platforms['windows-x64-cpu'] },
    })).toBe(true)
    expect(validDownloadCatalog({
      schema_version: 1,
      platforms: { 'freebsd-riscv64-cpu': catalog.platforms['freebsd-riscv64-cpu'] },
      platform_metadata: { 'freebsd-riscv64-cpu': catalog.platform_metadata['freebsd-riscv64-cpu'] },
    })).toBe(true)
    expect(validDownloadCatalog({ schema_version: 1, platforms: {} })).toBe(false)
    expect(validDownloadCatalog({ schema_version: 1, platforms: { 'macos-arm64': [{ ...catalog.platforms['macos-arm64'][0], url: 'https://example.com/installer' }] } })).toBe(false)
    expect(validDownloadCatalog({ schema_version: 1, platforms: { 'windows-x64-cpu': [entry('v1.0.0-beta.10', '../Par.exe')] } })).toBe(false)
    expect(validDownloadCatalog({
      schema_version: 1,
      platforms: { 'windows-x64-cpu': catalog.platforms['windows-x64-cpu'] },
      platform_metadata: { 'windows-x64-cpu': { os: { en: '' }, variant: { en: 'CPU' } } },
    })).toBe(false)
  })
})
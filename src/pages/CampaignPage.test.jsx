import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App.jsx'
import { LanguageProvider } from '../i18n/LanguageProvider.jsx'
import { campaigns } from '../content/campaigns.js'
import { getSiteMetadata, sitemapPaths } from '../lib/siteMetadata.js'
import { CampaignPage } from './CampaignPage.jsx'
import * as betaDownloads from '../lib/betaDownloads.js'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('Mac beta campaign', () => {
  it.each(['en', 'sv'])('uses the existing Mac download dialog in %s without other-platform promotion', lang => {
    vi.stubGlobal('localStorage', { getItem: vi.fn(() => null), setItem: vi.fn() })
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false })))
    render(<MemoryRouter initialEntries={[`/campaigns/mac-beta?lang=${lang}&utm_campaign=mac-beta`]}>
      <LanguageProvider><App /></LanguageProvider>
    </MemoryRouter>)
    const c = campaigns['mac-beta'][lang]
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(c.heading)
    expect(screen.getByText(c.requirements)).toBeVisible()
    expect(screen.getByText(c.limitation)).toBeVisible()
    expect(screen.queryByText(/Windows|Linux/)).not.toBeInTheDocument()
    expect(document.querySelector('#pricing')).not.toBeInTheDocument()
    expect(document.querySelector('input[type="email"]')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: c.download }))
    const dialog = screen.getByRole('dialog', { name: lang === 'en' ? 'Download Pär beta' : 'Ladda ner Pär beta' })
    expect(dialog).toBeVisible()
    expect(within(dialog).getByRole('button', { name: c.download })).toBeVisible()
    expect(screen.getByRole('link', { name: c.setup })).toHaveAttribute('href', `/get-started${lang === 'sv' ? '?lang=sv' : ''}`)
  })

  it('disables the action and reports unavailable Mac downloads rather than selecting Windows', () => {
    vi.stubGlobal('localStorage', { getItem: vi.fn(() => null), setItem: vi.fn() })
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false })))
    vi.spyOn(betaDownloads, 'useBetaDownloads').mockReturnValue({
      platforms: { 'windows-x64-cpu': [{ url: 'https://example.com/windows.exe' }] },
    })
    render(<MemoryRouter initialEntries={['/campaigns/mac-beta']}><LanguageProvider>
      <App />
    </LanguageProvider></MemoryRouter>)
    expect(screen.getByRole('button', { name: 'Download for Mac' })).toBeDisabled()
    expect(screen.getByRole('alert')).toHaveTextContent(campaigns['mac-beta'].en.unavailable)
    fireEvent.click(screen.getByRole('button', { name: 'Download for Mac' }))
    expect(screen.queryByRole('dialog', { name: 'Download Pär beta' })).not.toBeInTheDocument()
  })

  it('shows the localized unavailable message in the reusable layout', () => {
    render(<MemoryRouter><LanguageProvider>
      <CampaignPage campaign={campaigns['mac-beta']} onDownload={vi.fn()} downloadUrl={null} />
    </LanguageProvider></MemoryRouter>)
    expect(screen.getByRole('button', { name: 'Download for Mac' })).toBeDisabled()
    expect(screen.getByRole('alert')).toHaveTextContent(campaigns['mac-beta'].en.unavailable)
  })

  it.each(['en', 'sv'])('has valid noindex product metadata in %s and stays out of discovery submissions', lang => {
    const meta = getSiteMetadata(new URL(`https://par.datomer.eu/campaigns/mac-beta?lang=${lang}&utm_campaign=mac-beta`))
    expect(meta.notFound).toBe(false)
    expect(meta.title).toBe(campaigns['mac-beta'][lang].title)
    expect(meta.robots).toBe('noindex, nofollow')
    expect(meta.canonical).not.toContain('utm_')
    expect(sitemapPaths('product')).not.toContain('/campaigns/mac-beta')
    expect(getSiteMetadata(new URL('https://datomer.eu/campaigns/mac-beta')).notFound).toBe(true)
    expect(getSiteMetadata(new URL('https://par.datomer.eu/campaigns/unknown')).notFound).toBe(true)
  })
})

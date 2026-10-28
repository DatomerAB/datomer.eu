import { afterEach, describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { LanguageProvider } from './i18n/LanguageProvider.jsx'
import SiteApp from './SiteApp.jsx'

afterEach(() => vi.unstubAllGlobals())

function renderSite(address) {
  const url = new URL(address)
  const replace = vi.fn()
  vi.stubGlobal('location', { href: url.href, origin: url.origin, replace })
  vi.stubGlobal('localStorage', { getItem: vi.fn(() => null), setItem: vi.fn() })
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false })))
  render(<MemoryRouter initialEntries={[`${url.pathname}${url.search}${url.hash}`]}>
    <LanguageProvider><SiteApp /></LanguageProvider>
  </MemoryRouter>)
  return replace
}

describe('site entry routing', () => {
  it('renders the company site on datomer.eu with governance and correct metadata', async () => {
    renderSite('https://datomer.eu/')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Put your data to work.')
    expect(screen.getByRole('heading', { name: 'Data governance' })).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'GDPR implementation' })).not.toBeInTheDocument()
    await waitFor(() => expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute('href', 'https://datomer.eu/'))
    expect(document.querySelector('script[type="application/ld+json"]')?.textContent).not.toContain('SoftwareApplication')
  })

  it('retains the product homepage and makes beta requirements clear', async () => {
    renderSite('https://par.datomer.eu/')
    expect(screen.getAllByText('Local Inference')[0]).toBeVisible()
    for (const notice of screen.getAllByText(/Not for Intel Macs/)) expect(notice).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Data governance' })).not.toBeInTheDocument()
    await waitFor(() => expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute('href', 'https://par.datomer.eu/'))
  })

  it('keeps new product objectives separate from work in progress', () => {
    renderSite('https://par.datomer.eu/about')
    expect(screen.getByRole('heading', { name: 'Our vision' })).toBeVisible()
    expect(screen.getByText('In development — not a promise of availability')).toBeVisible()
    expect(screen.getByText(/not a list of features included in every plan/)).toBeVisible()
    expect(screen.getByText(/still needs testing in the installed app/)).toBeVisible()
  })

  it('preserves Swedish purpose and development qualifications', () => {
    renderSite('https://par.datomer.eu/about?lang=sv')
    expect(screen.getByRole('heading', { name: 'Vår vision' })).toBeVisible()
    expect(screen.getByText('Under utveckling — inget löfte om tillgänglighet')).toBeVisible()
  })

  it('redirects old homepage fragments while preserving language', async () => {
    const replace = renderSite('https://datomer.eu/?lang=sv#download')
    await waitFor(() => expect(replace).toHaveBeenCalledWith('https://par.datomer.eu/?lang=sv#download'))
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
  })
})

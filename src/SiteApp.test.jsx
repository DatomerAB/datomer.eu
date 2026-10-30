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
  it.each(['en', 'sv'])('uses the right contact address across both sites in %s', lang => {
    renderSite(`https://par.datomer.eu/contact?lang=${lang}`)
    expect(screen.getByRole('link', { name: 'par@datomer.eu' })).toHaveAttribute('href', 'mailto:par@datomer.eu')
    expect(screen.queryByRole('link', { name: 'hello@datomer.eu' })).not.toBeInTheDocument()
  })

  it.each([
    ['datomer.eu', '/', 'hello@datomer.eu'],
    ['datomer.eu', '/contact', 'hello@datomer.eu'],
    ['datomer.eu', '/privacy', 'hello@datomer.eu'],
    ['par.datomer.eu', '/privacy', 'par@datomer.eu'],
    ['par.datomer.eu', '/about', 'par@datomer.eu'],
    ['par.datomer.eu', '/press', 'par@datomer.eu'],
    ['par.datomer.eu', '/get-started', 'par@datomer.eu'],
  ])('keeps %s%s enquiries at %s', (host, path, email) => {
    renderSite(`https://${host}${path}`)
    const links = [...document.querySelectorAll('a[href^="mailto:"]')]
    expect(links.length).toBeGreaterThan(0)
    for (const link of links) expect(link).toHaveAttribute('href', `mailto:${email}`)
  })

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
    expect(screen.getAllByText('AI on Your Device')[0]).toBeVisible()
    for (const notice of screen.getAllByText(/Not for Intel Macs/)) expect(notice).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Data governance' })).not.toBeInTheDocument()
    await waitFor(() => expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute('href', 'https://par.datomer.eu/'))
  })

  it('keeps purpose on its own page and development details on About', () => {
    renderSite('https://par.datomer.eu/about')
    expect(screen.queryByRole('heading', { name: 'Our vision' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Our purpose →' })).toHaveAttribute('href', '/purpose')
    expect(screen.getByText('In development — not a promise of availability')).toBeVisible()
    expect(screen.getByText(/still need testing in the installed app/)).toBeVisible()
  })

  it('preserves Swedish purpose and development qualifications', () => {
    renderSite('https://par.datomer.eu/about?lang=sv')
    expect(screen.queryByRole('heading', { name: 'Vår vision' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Vårt syfte →' })).toHaveAttribute('href', '/purpose?lang=sv')
    expect(screen.getByText('Under utveckling — inget löfte om tillgänglighet')).toBeVisible()
  })

  it('redirects old homepage fragments while preserving language', async () => {
    const replace = renderSite('https://datomer.eu/?lang=sv#download')
    await waitFor(() => expect(replace).toHaveBeenCalledWith('https://par.datomer.eu/?lang=sv#download'))
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
  })
})

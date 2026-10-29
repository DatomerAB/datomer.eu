import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Link, MemoryRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { LanguageProvider } from '../i18n/LanguageProvider.jsx'
import { SiteMetadata } from './SiteMetadata.jsx'
import SiteApp from '../SiteApp.jsx'
import { onRequest } from '../../functions/_middleware.js'
import { getSiteMetadata } from '../lib/siteMetadata.js'

const SHELL = '<!doctype html><html><head><title>Shell</title><meta name="description" content="Shell"><meta name="robots" content="index, follow"><link rel="icon" href="/par-logo.png"><link rel="apple-touch-icon" href="/par-logo.png"></head><body><div id="root"></div></body></html>'
const COMPANY_PATHS = ['/', '/about', '/contact', '/privacy', '/terms', '/cookies']
const PRODUCT_PATHS = [...COMPANY_PATHS, '/get-started', '/blog', '/press', '/models', '/payment-success', '/purpose']
const CASES = [
  ...['en', 'sv'].flatMap(lang => [
    ...COMPANY_PATHS.map(path => `https://datomer.eu${path}?lang=${lang}&utm_campaign=beta`),
    ...PRODUCT_PATHS.map(path => `https://par.datomer.eu${path}?lang=${lang}&utm_campaign=beta`),
  ]),
  'https://par.datomer.eu/press/?lang=sv',
  'https://datomer.eu/about/?lang=sv',
  'https://par.datomer.eu/press?lang=de',
  'https://datomer.eu/missing?lang=en',
  'https://par.datomer.eu/missing?lang=sv',
  'https://branch.pages.dev/press?lang=sv',
  'https://par.datomer.eu/campaigns/mac-beta?lang=en&utm_campaign=mac-beta',
  'https://par.datomer.eu/campaigns/mac-beta?lang=sv&utm_campaign=mac-beta',
]

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function metadata(document) {
  const attributes = selector => [...document.querySelectorAll(selector)].map(node =>
    Object.fromEntries([...node.attributes].map(attr => [attr.name.toLowerCase(), attr.value])
      .filter(([name]) => !['data-rh', 'data-react-helmet'].includes(name))))
    .sort((a, b) => (a.property || a.name || a.hreflang || a.rel).localeCompare(b.property || b.name || b.hreflang || b.rel))
  return {
    title: [...document.head.querySelectorAll('title')].map(node => node.textContent),
    description: attributes('meta[name="description"]'),
    robots: attributes('meta[name="robots"]'),
    canonical: attributes('link[rel="canonical"]'),
    alternates: attributes('link[rel="alternate"]'),
    openGraph: attributes('meta[property^="og:"]'),
    twitter: attributes('meta[name^="twitter:"]'),
    icons: [...attributes('link[rel="icon"]'), ...attributes('link[rel="apple-touch-icon"]')]
      .map(({ type: _type, ...rest }) => rest),
    structuredData: [...document.querySelectorAll('script[type="application/ld+json"]')]
      .map(node => JSON.parse(node.textContent)),
  }
}

async function assertParity(address, app = <SiteMetadata />) {
  const url = new URL(address)
  const response = await onRequest({
    request: new Request(url),
    env: {},
    next: async () => new Response(SHELL, { headers: { 'content-type': 'text/html' } }),
  })
  const server = new DOMParser().parseFromString(await response.text(), 'text/html')
  vi.stubGlobal('location', { href: url.href, origin: url.origin })
  vi.stubGlobal('localStorage', { getItem: vi.fn(() => null), setItem: vi.fn() })
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false })))
  render(<HelmetProvider><MemoryRouter initialEntries={[`${url.pathname}${url.search}`]}>
    <LanguageProvider>{app}</LanguageProvider>
  </MemoryRouter></HelmetProvider>)
  await waitFor(() => expect(metadata(document)).toEqual(metadata(server)))
  expect(document.documentElement.lang).toBe(server.documentElement.lang)
}

describe('server and browser discovery metadata', () => {
  it.each([
    ['https://datomer.eu/', '/datomer-icon.png?v=20261029'],
    ['https://www.datomer.eu/contact?lang=sv', '/datomer-icon.png?v=20261029'],
    ['https://par.datomer.eu/', '/par-logo.png'],
    ['https://par.datomer.eu/campaigns/mac-beta?lang=sv', '/par-logo.png'],
  ])('uses the correct brand icon for %s', (address, icon) => {
    expect(getSiteMetadata(new URL(address)).icon).toBe(icon)
  })

  it.each(CASES)('has identical metadata and structured data for %s', async address => {
    await assertParity(address)
  })

  it.each(['/press', '/blog'])('keeps %s page components from overriding shared metadata', async path => {
    await assertParity(`https://par.datomer.eu${path}?lang=sv`, <SiteApp />)
  })

  it('updates rather than duplicates robots and language tags during navigation', async () => {
    vi.stubGlobal('location', { origin: 'https://par.datomer.eu' })
    vi.stubGlobal('localStorage', { getItem: vi.fn(() => null), setItem: vi.fn() })
    render(<HelmetProvider><MemoryRouter initialEntries={['/payment-success']}>
      <LanguageProvider>
        <SiteMetadata />
        <Link to="/press?lang=sv">Press</Link>
        <Link to="/missing">Missing</Link>
      </LanguageProvider>
    </MemoryRouter></HelmetProvider>)
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow')
    fireEvent.click(screen.getByRole('link', { name: 'Press' }))
    await waitFor(() => {
      expect(document.title).toBe('Presskit — Pär by Datomer')
      expect(document.querySelector('meta[name="robots"]')?.content).toBe('index, follow, max-image-preview:large, max-snippet:-1')
    })
    expect(document.querySelectorAll('meta[name="robots"]')).toHaveLength(1)
    expect(document.querySelectorAll('link[rel="canonical"]')).toHaveLength(1)
    expect(document.querySelectorAll('link[rel="alternate"]')).toHaveLength(3)
    fireEvent.click(screen.getByRole('link', { name: 'Missing' }))
    await waitFor(() => expect(document.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow'))
  })
})

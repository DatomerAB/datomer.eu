import { describe, it, expect } from 'vitest'
import { siteForUrl, siteLinks, legacyProductDestination } from './site.js'

describe('site identity', () => {
  it.each([
    ['https://datomer.eu', 'company'], ['https://www.datomer.eu', 'company'],
    ['https://par.datomer.eu', 'product'], ['http://127.0.0.1:5173', 'company'],
    ['http://127.0.0.1:5174', 'product'], ['http://localhost:4173', 'company'],
    ['http://localhost:4174', 'product'], ['https://preview.pages.dev', 'product'],
  ])('selects %s as %s', (url, site) => {
    expect(siteForUrl(new URL(url))).toBe(site)
  })

  it.each(['/get-started?lang=sv', '/blog', '/models', '/press', '/purpose?lang=sv', '/payment-success?session_id=test', '/#pricing', '/?lang=sv#download'])('preserves old product links: %s', path => {
    expect(legacyProductDestination(new URL(`https://datomer.eu${path}`))).toBe(`https://par.datomer.eu${path}`)
  })

  it.each(['/', '/about', '/contact', '/privacy', '/api/contact', '/api/stripe-webhook', '/datomer-logo.png', '/#services'])('does not redirect company/API/assets: %s', path => {
    expect(legacyProductDestination(new URL(`https://datomer.eu${path}`))).toBeNull()
  })

  it('keeps preview cross-links local and handles beta alias', () => {
    expect(siteLinks(new URL('http://127.0.0.1:5174'))).toEqual({ company: 'http://127.0.0.1:5173', product: 'http://127.0.0.1:5174' })
    expect(legacyProductDestination(new URL('http://127.0.0.1:5173/beta?lang=sv'))).toBe('http://127.0.0.1:5174/get-started?lang=sv')
  })
})

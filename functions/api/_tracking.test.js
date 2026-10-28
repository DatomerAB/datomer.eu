import { describe, expect, it } from 'vitest'
import { getTrackingMeta } from './_tracking.js'

describe('server-side website context', () => {
  it.each([
    ['datomer.eu', 'company', 'production'],
    ['par.datomer.eu', 'product', 'production'],
    ['preview.pages.dev', 'preview', 'preview'],
  ])('identifies %s from the actual request', (hostname, site, environment) => {
    const meta = getTrackingMeta({
      request: new Request(`https://${hostname}/api/contact`), env: {},
      body: { hostname: 'spoofed', site: 'spoofed' },
    })
    expect(meta).toMatchObject({ hostname, site, environment })
    expect(meta.campaign).toBeUndefined()
  })

  it('omits submitted campaign information without analytics consent', () => {
    expect(getTrackingMeta({
      request: new Request('https://par.datomer.eu/api/waitlist'), env: {},
      body: { campaign: { utm_campaign: 'beta' } },
    }).campaign).toBeUndefined()
  })

  it('preserves sanitized campaign attribution with consent', () => {
    expect(getTrackingMeta({
      request: new Request('https://par.datomer.eu/api/waitlist'), env: {},
      body: { analyticsConsent: true, campaign: { utm_source: 'linkedin', utm_campaign: 'beta', utm_term: 'a@example.com', email: 'a@example.com' } },
    }).campaign).toEqual({ utm_source: 'linkedin', utm_campaign: 'beta' })
  })
})

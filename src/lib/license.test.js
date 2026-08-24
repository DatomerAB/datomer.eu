import { describe, it, expect } from 'vitest'
import { generateLicenseKey, buildLicenseRecord } from './license.js'

describe('license utilities', () => {
  it('generates a valid key for a provided plan', () => {
    const key = generateLicenseKey('plus')

    expect(key).toMatch(/^PÄR-PLUS-[A-Z0-9-]{12,}$/)
  })

  it('builds a license record with the customer email and plan', () => {
    const record = buildLicenseRecord({
      email: 'user@example.com',
      plan: 'plus',
      stripeSessionId: 'cs_test_123',
      locale: 'en',
    })

    expect(record.email).toBe('user@example.com')
    expect(record.plan).toBe('plus')
    expect(record.stripeSessionId).toBe('cs_test_123')
    expect(record.licenseKey).toMatch(/^PÄR-PLUS-/)
  })
})

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { sendSupportEmail } from './_email.js'

describe('sendSupportEmail', () => {
  let fetchSpy

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }))
  })

  afterEach(() => {
    fetchSpy.mockRestore()
  })

  it('sends an email via Resend when RESEND_API_KEY is present', async () => {
    const result = await sendSupportEmail({
      env: {
        RESEND_API_KEY: 're_123',
        RESEND_FROM_EMAIL: 'from@example.com',
        CONTACT_TO_EMAIL: 'support@example.com',
      },
      subject: 'Test subject',
      html: '<p>Test</p>',
      text: 'Test',
      replyTo: 'user@example.com',
    })

    expect(result).toMatchObject({ sent: true, status: 200, body: '{}' })
    expect(fetchSpy).toHaveBeenCalledTimes(1)
    const [url, options] = fetchSpy.mock.calls[0]
    expect(url).toBe('https://api.resend.com/emails')
    const body = JSON.parse(options.body)
    expect(body).toMatchObject({
      from: 'Pär by Datomer <from@example.com>',
      to: ['support@example.com'],
      reply_to: 'user@example.com',
      subject: 'Test subject',
      html: '<p>Test</p>',
      text: 'Test',
    })
  })

  it('sends to a custom recipient list when provided', async () => {
    await sendSupportEmail({
      env: { RESEND_API_KEY: 're_123' },
      to: ['customer@example.com'],
      subject: 'Confirmation',
      html: '<p>Confirmed</p>',
      text: 'Confirmed',
    })

    const [, options] = fetchSpy.mock.calls[0]
    const body = JSON.parse(options.body)
    expect(body.to).toEqual(['customer@example.com'])
  })

  it.each([
    ['company', 'Datomer AB <hello@datomer.eu>'],
    ['product', 'Pär by Datomer <Par@datomer.eu>'],
  ])('selects the configured %s sender without changing the other brand', async (site, expected) => {
    await sendSupportEmail({
      env: {
        RESEND_API_KEY: 're_test',
        RESEND_FROM_EMAIL: 'legacy@example.com',
        RESEND_FROM_NAME: 'Legacy sender',
        RESEND_COMPANY_FROM_EMAIL: 'hello@datomer.eu',
        RESEND_PRODUCT_FROM_EMAIL: 'Par@datomer.eu',
      },
      site,
      subject: 'Test',
      html: '<p>Test</p>',
      text: 'Test',
    })
    expect(JSON.parse(fetchSpy.mock.calls[0][1].body).from).toBe(expected)
  })

  it('preserves the existing sender until a site-specific sender is configured', async () => {
    await sendSupportEmail({
      env: { RESEND_API_KEY: 're_test', RESEND_FROM_EMAIL: 'legacy@example.com', RESEND_FROM_NAME: 'Legacy sender' },
      site: 'company',
      subject: 'Test',
      html: '<p>Test</p>',
      text: 'Test',
    })
    expect(JSON.parse(fetchSpy.mock.calls[0][1].body).from).toBe('Legacy sender <legacy@example.com>')
  })

  it('allows a site-specific display name', async () => {
    await sendSupportEmail({
      env: {
        RESEND_API_KEY: 're_test',
        RESEND_PRODUCT_FROM_EMAIL: 'Par@datomer.eu',
        RESEND_PRODUCT_FROM_NAME: 'Pär',
      },
      subject: 'Test',
      html: '<p>Test</p>',
      text: 'Test',
    })
    expect(JSON.parse(fetchSpy.mock.calls[0][1].body).from).toBe('Pär <Par@datomer.eu>')
  })

  it('returns sent: false when RESEND_API_KEY is missing', async () => {
    const result = await sendSupportEmail({
      env: {},
      subject: 'Test subject',
      html: '<p>Test</p>',
      text: 'Test',
    })

    expect(result).toMatchObject({ sent: false, error: 'missing_api_key' })
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('returns sent: false when Resend request fails', async () => {
    fetchSpy.mockResolvedValueOnce(new Response('{}', { status: 500 }))

    const result = await sendSupportEmail({
      env: { RESEND_API_KEY: 're_123' },
      subject: 'Test subject',
      html: '<p>Test</p>',
      text: 'Test',
    })

    expect(result).toMatchObject({ sent: false, status: 500, body: '{}' })
  })

  it('returns sent: false when fetch throws', async () => {
    fetchSpy.mockRejectedValueOnce(new Error('Network error'))

    const result = await sendSupportEmail({
      env: { RESEND_API_KEY: 're_123' },
      subject: 'Test subject',
      html: '<p>Test</p>',
      text: 'Test',
    })

    expect(result).toMatchObject({ sent: false, error: 'Network error' })
  })
})

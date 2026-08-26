import { describe, expect, it, vi } from 'vitest'
import { sendSupportEmail } from './_email.js'

describe('sendSupportEmail', () => {
  it('sends an email via Resend when RESEND_API_KEY is present', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }))

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

    expect(result).toEqual({ sent: true })
    expect(fetchSpy).toHaveBeenCalledTimes(1)
    const [url, options] = fetchSpy.mock.calls[0]
    expect(url).toBe('https://api.resend.com/emails')
    const body = JSON.parse(options.body)
    expect(body).toMatchObject({
      from: 'from@example.com',
      to: ['support@example.com'],
      reply_to: 'user@example.com',
      subject: 'Test subject',
      html: '<p>Test</p>',
      text: 'Test',
    })

    fetchSpy.mockRestore()
  })

  it('returns sent: false when RESEND_API_KEY is missing', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}'))

    const result = await sendSupportEmail({
      env: {},
      subject: 'Test subject',
      html: '<p>Test</p>',
      text: 'Test',
    })

    expect(result).toEqual({ sent: false })
    expect(fetchSpy).not.toHaveBeenCalled()

    fetchSpy.mockRestore()
  })

  it('returns sent: false when Resend request fails', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 500 }))

    const result = await sendSupportEmail({
      env: { RESEND_API_KEY: 're_123' },
      subject: 'Test subject',
      html: '<p>Test</p>',
      text: 'Test',
    })

    expect(result).toEqual({ sent: false })

    fetchSpy.mockRestore()
  })

  it('returns sent: false when fetch throws', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'))

    const result = await sendSupportEmail({
      env: { RESEND_API_KEY: 're_123' },
      subject: 'Test subject',
      html: '<p>Test</p>',
      text: 'Test',
    })

    expect(result).toEqual({ sent: false })

    fetchSpy.mockRestore()
  })
})

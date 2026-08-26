import { describe, expect, it, vi } from 'vitest'
import { onRequestPost } from './waitlist.js'

vi.mock('./_turnstile.js', () => ({
  verifyTurnstileToken: vi.fn(() => Promise.resolve({ success: true })),
}))

describe('waitlist handler', () => {
  const baseEnv = {
    TURNSTILE_SECRET_KEY: 'secret',
    RESEND_API_KEY: 're_123',
    RESEND_FROM_EMAIL: 'from@example.com',
    CONTACT_TO_EMAIL: 'support@example.com',
  }

  function makeRequest(body) {
    return new Request('http://localhost/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  }

  it('sends a tagged waitlist email', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }))

    const request = makeRequest({
      email: 'waitlist@example.com',
      type: 'waitlist',
      turnstileToken: 'token',
    })

    const response = await onRequestPost({ request, env: baseEnv })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.ok).toBe(true)

    const resendCalls = fetchSpy.mock.calls.filter((call) =>
      String(call[0]).includes('resend.com')
    )
    expect(resendCalls).toHaveLength(2)

    const [, supportOptions] = resendCalls[0]
    const supportBody = JSON.parse(supportOptions.body)
    expect(supportBody.subject).toBe('Waitlist signup: waitlist@example.com')
    expect(supportBody.reply_to).toBe('waitlist@example.com')
    expect(supportBody.to).toEqual(['support@example.com'])
    expect(supportBody.html).toContain('[source: waitlist-form]')
    expect(supportBody.text).toContain('[source: waitlist-form]')

    const [, confirmationOptions] = resendCalls[1]
    const confirmationBody = JSON.parse(confirmationOptions.body)
    expect(confirmationBody.to).toEqual(['waitlist@example.com'])
    expect(confirmationBody.subject).toBe('You are on the Pär waitlist')

    fetchSpy.mockRestore()
  })

  it('sends a tagged newsletter email', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }))

    const request = makeRequest({
      email: 'newsletter@example.com',
      type: 'newsletter',
      source: 'homepage-cta',
      turnstileToken: 'token',
    })

    const response = await onRequestPost({ request, env: baseEnv })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.ok).toBe(true)

    const resendCalls = fetchSpy.mock.calls.filter((call) =>
      String(call[0]).includes('resend.com')
    )
    expect(resendCalls).toHaveLength(2)

    const [, supportOptions] = resendCalls[0]
    const supportBody = JSON.parse(supportOptions.body)
    expect(supportBody.subject).toBe('Newsletter signup: newsletter@example.com')
    expect(supportBody.html).toContain('[source: newsletter-form]')

    const [, confirmationOptions] = resendCalls[1]
    const confirmationBody = JSON.parse(confirmationOptions.body)
    expect(confirmationBody.to).toEqual(['newsletter@example.com'])
    expect(confirmationBody.subject).toBe('You are subscribed to Pär updates')

    fetchSpy.mockRestore()
  })

  it('sends a tagged download email', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }))

    const request = makeRequest({
      name: 'Download User',
      email: 'download@example.com',
      phone: '+123456789',
      country: 'SE',
      type: 'download',
      turnstileToken: 'token',
    })

    const response = await onRequestPost({ request, env: baseEnv })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.ok).toBe(true)

    const resendCalls = fetchSpy.mock.calls.filter((call) =>
      String(call[0]).includes('resend.com')
    )
    expect(resendCalls).toHaveLength(2)

    const [, supportOptions] = resendCalls[0]
    const supportBody = JSON.parse(supportOptions.body)
    expect(supportBody.subject).toBe('Download request: Download User (download@example.com)')
    expect(supportBody.html).toContain('[source: download-form]')
    expect(supportBody.html).toContain('Download User')
    expect(supportBody.html).toContain('SE')

    const [, confirmationOptions] = resendCalls[1]
    const confirmationBody = JSON.parse(confirmationOptions.body)
    expect(confirmationBody.to).toEqual(['download@example.com'])
    expect(confirmationBody.subject).toBe('Thank you for downloading Pär beta')

    fetchSpy.mockRestore()
  })

  it('still returns success when email sending fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 500 }))

    const request = makeRequest({
      email: 'fail@example.com',
      type: 'waitlist',
      turnstileToken: 'token',
    })

    const response = await onRequestPost({ request, env: baseEnv })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.ok).toBe(true)
  })

  it('rejects missing email', async () => {
    const request = makeRequest({ type: 'waitlist' })
    const response = await onRequestPost({ request, env: {} })
    expect(response.status).toBe(400)
  })
})

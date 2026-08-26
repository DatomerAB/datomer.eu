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
    expect(resendCalls).toHaveLength(1)

    const [, options] = resendCalls[0]
    const body = JSON.parse(options.body)
    expect(body.subject).toBe('Waitlist signup: waitlist@example.com')
    expect(body.reply_to).toBe('waitlist@example.com')
    expect(body.to).toEqual(['support@example.com'])
    expect(body.html).toContain('[source: waitlist-form]')
    expect(body.text).toContain('[source: waitlist-form]')

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
    expect(resendCalls).toHaveLength(1)

    const [, options] = resendCalls[0]
    const body = JSON.parse(options.body)
    expect(body.subject).toBe('Newsletter signup: newsletter@example.com')
    expect(body.html).toContain('[source: newsletter-form]')

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
    expect(resendCalls).toHaveLength(1)

    const [, options] = resendCalls[0]
    const body = JSON.parse(options.body)
    expect(body.subject).toBe('Download request: Download User (download@example.com)')
    expect(body.html).toContain('[source: download-form]')
    expect(body.html).toContain('Download User')
    expect(body.html).toContain('SE')

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

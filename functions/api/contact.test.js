import { describe, expect, it, vi } from 'vitest'
import { onRequestPost } from './contact.js'

vi.mock('./_turnstile.js', () => ({
  verifyTurnstileToken: vi.fn(() => Promise.resolve({ success: true })),
}))

describe('contact handler', () => {
  it('sends a tagged support email and returns success', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }))

    const request = new Request('http://localhost/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        message: 'Hello',
        turnstileToken: 'token',
      }),
    })

    const env = {
      TURNSTILE_SECRET_KEY: 'secret',
      RESEND_API_KEY: 're_123',
      RESEND_FROM_EMAIL: 'from@example.com',
      CONTACT_TO_EMAIL: 'to@example.com',
    }

    const response = await onRequestPost({ request, env })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ ok: true })

    const resendCalls = fetchSpy.mock.calls.filter((call) =>
      String(call[0]).includes('resend.com')
    )
    expect(resendCalls).toHaveLength(1)

    const [, options] = resendCalls[0]
    const body = JSON.parse(options.body)
    expect(body.subject).toBe('Contact form: enquiry from Test User')
    expect(body.reply_to).toBe('test@example.com')
    expect(body.to).toEqual(['to@example.com'])
    expect(body.html).toContain('[source: contact-form]')
    expect(body.text).toContain('[source: contact-form]')
    expect(body.html).toContain('Hello')
    expect(body.text).toContain('Hello')

    fetchSpy.mockRestore()
  })

  it('still returns success when email sending fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 500 }))

    const request = new Request('http://localhost/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        message: 'Hello',
        turnstileToken: 'token',
      }),
    })

    const env = {
      TURNSTILE_SECRET_KEY: 'secret',
      RESEND_API_KEY: 're_123',
    }

    const response = await onRequestPost({ request, env })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ ok: true })
  })

  it('rejects missing fields', async () => {
    const request = new Request('http://localhost/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' }),
    })

    const response = await onRequestPost({ request, env: {} })
    expect(response.status).toBe(400)
  })
})

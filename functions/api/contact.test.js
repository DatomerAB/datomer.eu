import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { onRequestPost } from './contact.js'

vi.mock('./_turnstile.js', () => ({
  verifyTurnstileToken: vi.fn(() => Promise.resolve({ success: true })),
}))

describe('contact handler', () => {
  let fetchSpy

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }))
  })

  afterEach(() => {
    fetchSpy.mockRestore()
  })

  it('sends a tagged support email and returns success', async () => {

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
      RESEND_FROM_NAME: 'Pär by Datomer',
      CONTACT_TO_EMAIL: 'to@example.com',
      ENVIRONMENT: 'test',
    }

    const response = await onRequestPost({ request, env })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toEqual({ ok: true })

    const resendCalls = fetchSpy.mock.calls.filter((call) =>
      String(call[0]).includes('resend.com')
    )
    expect(resendCalls).toHaveLength(2)

    const [, supportOptions] = resendCalls[0]
    const supportBody = JSON.parse(supportOptions.body)
    expect(supportBody.subject).toBe('New message from Test — Pär')
    expect(supportBody.from).toBe('Pär by Datomer <from@example.com>')
    expect(supportBody.reply_to).toBe('test@example.com')
    expect(supportBody.to).toEqual(['to@example.com'])
    expect(supportBody.html).toContain('New contact enquiry')
    expect(supportBody.text).toContain('New contact enquiry')
    expect(supportBody.html).toContain('Hello')
    expect(supportBody.text).toContain('Hello')
    expect(supportBody.html).toContain('Action')

    const [, confirmationOptions] = resendCalls[1]
    const confirmationBody = JSON.parse(confirmationOptions.body)
    expect(confirmationBody.to).toEqual(['test@example.com'])
    expect(confirmationBody.subject).toBe('We received your message — Pär')
    expect(confirmationBody.html).toContain('Hi Test')
  })

  it('still returns success when email sending fails', async () => {
    fetchSpy.mockResolvedValue(new Response('{}', { status: 500 }))

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

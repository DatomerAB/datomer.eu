import { describe, expect, it, vi } from 'vitest'
import { onRequestPost } from './contact.js'

vi.mock('./_turnstile.js', () => ({
  verifyTurnstileToken: vi.fn(() => Promise.resolve({ success: true })),
}))

describe('contact handler', () => {
  it('returns success without sending any email', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}'))

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
    expect(resendCalls).toHaveLength(0)

    fetchSpy.mockRestore()
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

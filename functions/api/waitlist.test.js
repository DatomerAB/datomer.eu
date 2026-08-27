import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
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

  let fetchSpy

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }))
  })

  afterEach(() => {
    fetchSpy.mockRestore()
  })

  function makeRequest(body) {
    return new Request('http://localhost/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  }

  function getResendCalls() {
    return fetchSpy.mock.calls.filter((call) => String(call[0]).includes('resend.com'))
  }

  it('sends a tagged waitlist email with beta interest', async () => {
    const request = makeRequest({
      email: 'waitlist@example.com',
      type: 'waitlist',
      interests: { productUpdates: true, betaAccess: true, changelog: true },
      turnstileToken: 'token',
    })

    const response = await onRequestPost({ request, env: baseEnv })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.ok).toBe(true)

    const resendCalls = getResendCalls()
    expect(resendCalls).toHaveLength(2)

    const [, supportOptions] = resendCalls[0]
    const supportBody = JSON.parse(supportOptions.body)
    expect(supportBody.subject).toBe('Subscriber joined the Pär beta waitlist')
    expect(supportBody.reply_to).toBe('waitlist@example.com')
    expect(supportBody.to).toEqual(['support@example.com'])
    expect(supportBody.html).toContain('New signup notification')
    expect(supportBody.html).toContain('Early beta access')

    const [, confirmationOptions] = resendCalls[1]
    const confirmationBody = JSON.parse(confirmationOptions.body)
    expect(confirmationBody.to).toEqual(['waitlist@example.com'])
    expect(confirmationBody.subject).toBe('You are on the Pär beta waitlist — Pär')
  })

  it('sends a tagged waitlist email without beta interest', async () => {
    const request = makeRequest({
      email: 'waitlist@example.com',
      type: 'waitlist',
      interests: { productUpdates: true, betaAccess: false, changelog: true },
      turnstileToken: 'token',
    })

    const response = await onRequestPost({ request, env: baseEnv })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.ok).toBe(true)

    const resendCalls = getResendCalls()
    const [, supportOptions] = resendCalls[0]
    const supportBody = JSON.parse(supportOptions.body)
    expect(supportBody.subject).toBe('Subscriber joined the Pär waitlist')
    expect(supportBody.html).not.toContain('Early beta access')

    const [, confirmationOptions] = resendCalls[1]
    const confirmationBody = JSON.parse(confirmationOptions.body)
    expect(confirmationBody.subject).toBe('You are on the Pär waitlist — Pär')
  })

  it('sends a tagged newsletter email', async () => {
    const request = makeRequest({
      email: 'newsletter@example.com',
      type: 'newsletter',
      source: 'homepage-cta',
      interests: { productUpdates: true, betaAccess: true, changelog: false },
      turnstileToken: 'token',
    })

    const response = await onRequestPost({ request, env: baseEnv })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.ok).toBe(true)

    const resendCalls = getResendCalls()
    expect(resendCalls).toHaveLength(2)

    const [, supportOptions] = resendCalls[0]
    const supportBody = JSON.parse(supportOptions.body)
    expect(supportBody.subject).toBe('Subscriber wants Pär beta access and product updates')
    expect(supportBody.html).toContain('New signup notification')

    const [, confirmationOptions] = resendCalls[1]
    const confirmationBody = JSON.parse(confirmationOptions.body)
    expect(confirmationBody.to).toEqual(['newsletter@example.com'])
    expect(confirmationBody.subject).toBe('Beta access + product updates confirmed — Pär')
  })

  it('sends a tagged download email', async () => {
    const request = makeRequest({
      name: 'Download User',
      email: 'download@example.com',
      phone: '+123456789',
      country: 'SE',
      type: 'download',
      interests: { productUpdates: true, betaAccess: true, changelog: true },
      turnstileToken: 'token',
    })

    const response = await onRequestPost({ request, env: baseEnv })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.ok).toBe(true)

    const resendCalls = getResendCalls()
    expect(resendCalls).toHaveLength(2)

    const [, supportOptions] = resendCalls[0]
    const supportBody = JSON.parse(supportOptions.body)
    expect(supportBody.subject).toBe('Download downloaded the Pär beta')
    expect(supportBody.html).toContain('New signup notification')
    expect(supportBody.html).toContain('Download User')
    expect(supportBody.html).toContain('SE')

    const [, confirmationOptions] = resendCalls[1]
    const confirmationBody = JSON.parse(confirmationOptions.body)
    expect(confirmationBody.to).toEqual(['download@example.com'])
    expect(confirmationBody.subject).toBe('Your Pär beta download — Pär')
  })

  it('still returns success when email sending fails', async () => {
    fetchSpy.mockResolvedValue(new Response('{}', { status: 500 }))

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

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { onRequestPost } from './contact.js'
import { insertSubmission } from './_db.js'

vi.mock('./_db.js', () => ({
  insertSubmission: vi.fn(() => Promise.resolve({ success: true })),
}))

vi.mock('./_turnstile.js', () => ({
  verifyTurnstileToken: vi.fn(() => Promise.resolve({ success: true })),
}))

describe('contact handler', () => {
  let fetchSpy

  beforeEach(() => {
    vi.mocked(insertSubmission).mockClear()
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
    expect(supportBody.subject).toBe('Pär — Product question — Test')
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

  it('stores the company origin and consented campaign for the summary', async () => {
    const pending = []
    const request = new Request('https://datomer.eu/api/contact', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User', email: 'test@example.com', message: 'Hello',
        analyticsConsent: true, campaign: { utm_source: 'linkedin', utm_campaign: 'consulting' },
        hostname: 'spoofed', turnstileToken: 'token',
      }),
    })
    const response = await onRequestPost({
      request, env: { TURNSTILE_SECRET_KEY: 'secret' }, waitUntil: promise => pending.push(promise),
    })
    await Promise.all(pending)
    expect(response.status).toBe(200)
    expect(insertSubmission).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      source: 'contact',
      metadata: expect.objectContaining({
        hostname: 'datomer.eu', site: 'company',
        campaign: { utm_source: 'linkedin', utm_campaign: 'consulting' },
      }),
    }))
  })

  it('derives the subject from the site and ignores topics from another site', async () => {
    const env = { TURNSTILE_SECRET_KEY: 's', RESEND_API_KEY: 're_1', RESEND_FROM_EMAIL: 'f@example.com', CONTACT_TO_EMAIL: 't@example.com' }
    const send = (url, topic) => onRequestPost({
      env,
      request: new Request(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Ann', email: 'a@example.com', message: 'Hi', topic, turnstileToken: 't' }),
      }),
    })
    const subjectOf = () => JSON.parse(fetchSpy.mock.calls.filter((c) => String(c[0]).includes('resend.com')).at(-2)[1].body).subject

    await send('https://datomer.eu/api/contact', 'consulting')
    expect(subjectOf()).toBe('Datomer AB — Consulting enquiry — Ann')
    await send('https://datomer.eu/api/contact', 'press')
    expect(subjectOf()).toBe('Datomer AB — Consulting enquiry — Ann')
    await send('https://par.datomer.eu/api/contact', 'press')
    expect(subjectOf()).toBe('Pär — Press enquiry — Ann')
  })
})

import { describe, expect, it, vi, beforeEach } from 'vitest'
import { createEventSessionToken, onRequestPost } from './event.js'

vi.mock('./_db.js', () => ({
  insertEvent: vi.fn(),
}))

vi.mock('./_turnstile.js', () => ({
  verifyTurnstileToken: vi.fn(),
}))

import { insertEvent } from './_db.js'
import { verifyTurnstileToken } from './_turnstile.js'

function makeRequest(body) {
  return new Request('https://datomer.eu/api/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('event handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    verifyTurnstileToken.mockResolvedValue({ success: true })
  })

  it('waits for the event to be stored before returning success', async () => {
    insertEvent.mockResolvedValueOnce({ success: true })
    const { token } = await createEventSessionToken('abcdefghijklmnop', 'secret')

    const response = await onRequestPost({
      request: makeRequest({ sessionId: 'abcdefghijklmnop', type: 'pageview', pagePath: '/', eventToken: token }),
      env: { ENVIRONMENT: 'production', TURNSTILE_SECRET_KEY: 'secret' },
    })

    expect(response.status).toBe(200)
    expect(insertEvent).toHaveBeenCalledWith(expect.anything(), {
      sessionId: 'abcdefghijklmnop',
      type: 'pageview',
      pagePath: '/',
      metadata: { environment: 'production', hostname: 'datomer.eu', site: 'company', campaign: {}, sessionStartedAt: null },
    })
  })

  it('issues an event token after Turnstile verifies a session', async () => {
    const response = await onRequestPost({
      request: makeRequest({ sessionId: 'abcdefghijklmnop', type: 'session', turnstileToken: 'challenge-token' }),
      env: { TURNSTILE_SECRET_KEY: 'secret' },
    })
    const result = await response.json()

    expect(response.status).toBe(200)
    expect(verifyTurnstileToken).toHaveBeenCalledWith('challenge-token', 'secret')
    expect(result.eventToken).toEqual(expect.any(String))
    expect(result.expiresAt).toBeGreaterThan(Date.now())
  })

  it('derives site identity from the request and only stores allowed campaign metadata', async () => {
    insertEvent.mockResolvedValueOnce({ success: true })
    const { token } = await createEventSessionToken('abcdefghijklmnop', 'secret')
    const request = new Request('https://par.datomer.eu/api/event', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'abcdefghijklmnop', type: 'pageview', pagePath: '/get-started', eventToken: token,
        metadata: {
          hostname: 'datomer.eu', site: 'company', environment: 'spoofed',
          campaign: { utm_source: 'linkedin', utm_campaign: 'beta', email: 'private@example.com', utm_term: 'private@example.com' },
          sessionStartedAt: '2026-01-01T10:00:00.000Z', email: 'private@example.com',
        },
      }),
    })
    const response = await onRequestPost({ request, env: { TURNSTILE_SECRET_KEY: 'secret' } })
    expect(response.status).toBe(200)
    expect(insertEvent.mock.calls[0][1].metadata).toEqual({
      hostname: 'par.datomer.eu', site: 'product', environment: 'production',
      campaign: { utm_source: 'linkedin', utm_campaign: 'beta' },
      sessionStartedAt: '2026-01-01T10:00:00.000Z',
    })
  })

  it('reports storage failure instead of acknowledging a lost event', async () => {
    insertEvent.mockResolvedValueOnce(null)
    const { token } = await createEventSessionToken('abcdefghijklmnop', 'secret')

    const response = await onRequestPost({
      request: makeRequest({ sessionId: 'abcdefghijklmnop', type: 'pageview', pagePath: '/', eventToken: token }),
      env: { TURNSTILE_SECRET_KEY: 'secret' },
    })

    expect(response.status).toBe(503)
    expect(await response.json()).toEqual({ error: 'Could not store event.' })
  })

  it('rejects invalid session IDs', async () => {
    const response = await onRequestPost({
      request: makeRequest({ sessionId: 'short', type: 'pageview', pagePath: '/' }),
      env: {},
    })

    expect(response.status).toBe(400)
    expect(insertEvent).not.toHaveBeenCalled()
  })

  it('rejects unsigned events', async () => {
    const response = await onRequestPost({
      request: makeRequest({ sessionId: 'abcdefghijklmnop', type: 'pageview', pagePath: '/', eventToken: 'invalid' }),
      env: { TURNSTILE_SECRET_KEY: 'secret' },
    })

    expect(response.status).toBe(401)
    expect(insertEvent).not.toHaveBeenCalled()
  })
})
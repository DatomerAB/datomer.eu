import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getTrackingPayload, getSessionIdOrNull, startTracking } from './tracking.js'

function createStorage() {
  const values = new Map()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
    clear: () => values.clear(),
  }
}

describe('tracking payload', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createStorage())
    vi.stubGlobal('sessionStorage', createStorage())
    window.history.replaceState({}, '', '/')
  })

  afterEach(() => {
    delete window.turnstile
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
    window.history.replaceState({}, '', '/')
  })

  it('omits all analytics data when consent is not accepted', () => {
    sessionStorage.setItem('par-session-id', 'prior-consent-session')
    sessionStorage.setItem('par-session-started-at', String(Date.now()))

    expect(getSessionIdOrNull()).toBeNull()
    expect(getTrackingPayload()).toEqual({ sessionId: null, timeOnSiteMs: null, pagePath: null })
  })

  it('includes the consented session and path without query parameters', () => {
    localStorage.setItem('par-cookie-consent', 'accepted')
    sessionStorage.setItem('par-session-id', 'consented-session')
    sessionStorage.setItem('par-session-started-at', String(Date.now()))
    window.history.replaceState({}, '', '/pricing?email=visitor%40example.com')

    const payload = getTrackingPayload()

    expect(payload.sessionId).toBe('consented-session')
    expect(payload.pagePath).toBe('/pricing')
    expect(payload.timeOnSiteMs).toEqual(expect.any(Number))
  })

  it('authorizes a consented session before recording its pageview', async () => {
    localStorage.setItem('par-cookie-consent', 'accepted')
    vi.stubEnv('VITE_TURNSTILE_SITE_KEY', 'site-key')
    const eventCalls = []
    const fetchMock = vi.fn(async (_url, options) => {
      const body = JSON.parse(options.body)
      eventCalls.push(body)
      if (body.type === 'session') {
        return new Response(JSON.stringify({ eventToken: 'signed-session-token', expiresAt: Date.now() + 60_000 }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }
      return new Response('{}', { status: 200 })
    })
    vi.stubGlobal('fetch', fetchMock)
    window.turnstile = {
      render(_container, options) {
        this.options = options
        return 'widget-1'
      },
      execute() {
        this.options.callback('turnstile-proof')
      },
      remove: vi.fn(),
    }

    const stopTracking = startTracking()
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    stopTracking()

    expect(eventCalls[0]).toMatchObject({ type: 'session', turnstileToken: 'turnstile-proof' })
    expect(eventCalls[1]).toMatchObject({ type: 'pageview', eventToken: 'signed-session-token' })
  })
})
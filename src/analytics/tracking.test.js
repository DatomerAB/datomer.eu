import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ensureSession, getTrackingPayload, getSessionIdOrNull, resetSession, startTracking } from './tracking.js'

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

  it('keeps allowed campaign labels across page navigation and clears them with the session', () => {
    localStorage.setItem('par-cookie-consent', 'accepted')
    window.history.replaceState({}, '', '/?utm_source=linkedin&utm_campaign=beta&utm_term=private%40example.com&email=private%40example.com')
    const first = getTrackingPayload()
    expect(first.campaign).toEqual({ utm_source: 'linkedin', utm_campaign: 'beta' })
    window.history.replaceState({}, '', '/get-started')
    expect(getTrackingPayload()).toMatchObject({ campaign: first.campaign, sessionId: first.sessionId })
    resetSession()
    expect(sessionStorage.getItem('par-session-attribution')).toBeNull()
    localStorage.setItem('par-cookie-consent', 'declined')
    expect(getTrackingPayload()).toEqual({ sessionId: null, timeOnSiteMs: null, pagePath: null })
  })

  it('records client-side page changes once and removes the listener on cleanup', async () => {
    localStorage.setItem('par-cookie-consent', 'accepted')
    const sessionId = ensureSession()
    sessionStorage.setItem('par-event-token', 'signed-session-token')
    sessionStorage.setItem('par-event-token-session-id', sessionId)
    sessionStorage.setItem('par-event-token-expires-at', String(Date.now() + 60_000))
    const fetchMock = vi.fn(async () => new Response('{}', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    const stop = startTracking()
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    window.history.replaceState({}, '', '/contact')
    window.dispatchEvent(new Event('par-page-change'))
    window.dispatchEvent(new Event('par-page-change'))
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toMatchObject({
      type: 'pageview', pagePath: '/contact', metadata: { campaign: {} },
    })
    stop()
    window.history.replaceState({}, '', '/privacy')
    window.dispatchEvent(new Event('par-page-change'))
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('does not send page visits or save campaign labels without consent', () => {
    vi.stubGlobal('fetch', vi.fn())
    window.history.replaceState({}, '', '/?utm_campaign=beta')
    const stop = startTracking()
    window.dispatchEvent(new Event('par-page-change'))
    stop()
    expect(fetch).not.toHaveBeenCalled()
    expect(sessionStorage.getItem('par-session-attribution')).toBeNull()
  })
})
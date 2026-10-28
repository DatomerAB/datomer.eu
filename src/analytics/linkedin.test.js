import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { hasLinkedInChoice, isLinkedInEnabled, loadLinkedIn, setLinkedInConsent, trackLinkedInConversion } from './linkedin.js'

describe('LinkedIn website measurement', () => {
  let storage
  let reload

  beforeEach(() => {
    const createElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tag, options) => {
      const element = createElement(tag, options)
      if (tag === 'script') element.type = 'application/json'
      return element
    })
    storage = new Map()
    reload = vi.fn()
    vi.stubGlobal('localStorage', {
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    })
    vi.stubGlobal('window', {
      location: { hostname: 'par.datomer.eu', port: '', reload },
    })
    vi.stubEnv('VITE_LINKEDIN_PARTNER_ID', '123456')
    vi.stubEnv('VITE_LINKEDIN_DOWNLOAD_CONVERSION_ID', '1001')
  })

  afterEach(() => {
    document.getElementById('linkedin-insight-tag')?.remove()
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('is inactive without a real partner ID, including placeholder values', () => {
    for (const id of ['', 'not yet', '0', '<partner-id>']) {
      vi.stubEnv('VITE_LINKEDIN_PARTNER_ID', id)
      expect(isLinkedInEnabled()).toBe(false)
    }
  })

  it('does not load or queue conversions before explicit marketing consent', () => {
    storage.set('par-cookie-consent', 'accepted')
    loadLinkedIn()
    trackLinkedInConversion('download')
    expect(document.getElementById('linkedin-insight-tag')).toBeNull()
    expect(window.lintrk).toBeUndefined()
    expect(hasLinkedInChoice()).toBe(false)
  })

  it('never loads on company or preview domains even with marketing consent', () => {
    for (const host of ['datomer.eu', 'www.datomer.eu', 'branch.datomer-eu.pages.dev']) {
      window.location.hostname = host
      setLinkedInConsent(true)
      expect(isLinkedInEnabled()).toBe(false)
      expect(document.getElementById('linkedin-insight-tag')).toBeNull()
    }
  })

  it('loads once and queues only download conversions without form data', () => {
    setLinkedInConsent(true)
    loadLinkedIn()
    expect(document.querySelectorAll('#linkedin-insight-tag')).toHaveLength(1)
    expect(document.getElementById('linkedin-insight-tag').src).toBe('https://snap.licdn.com/li.lms-analytics/insight.min.js')
    trackLinkedInConversion('download')
    trackLinkedInConversion('waitlist')
    expect(window.lintrk.q).toEqual([
      ['track', { conversion_id: 1001 }],
    ])
  })

  it('does not queue missing or invalid conversion IDs', () => {
    setLinkedInConsent(true)
    vi.stubEnv('VITE_LINKEDIN_DOWNLOAD_CONVERSION_ID', '')
    trackLinkedInConversion('download')
    trackLinkedInConversion('waitlist')
    expect(window.lintrk.q).toEqual([])
  })

  it('stores rejection and reloads to stop an already loaded tag', () => {
    setLinkedInConsent(true)
    setLinkedInConsent(false)
    expect(hasLinkedInChoice()).toBe(true)
    expect(reload).toHaveBeenCalledOnce()
    trackLinkedInConversion('download')
    expect(window.lintrk.q).toEqual([])
  })

  it('fails closed when consent cannot be saved', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {})
    localStorage.setItem = () => { throw new Error('Storage unavailable') }
    setLinkedInConsent(true)
    expect(document.getElementById('linkedin-insight-tag')).toBeNull()
    expect(warning).toHaveBeenCalled()
  })

  it('reports a blocked script without breaking the website', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {})
    setLinkedInConsent(true)
    document.getElementById('linkedin-insight-tag').dispatchEvent(new Event('error'))
    expect(warning).toHaveBeenCalledOnce()
    expect(window.lintrk).toBeUndefined()
    expect(document.getElementById('linkedin-insight-tag')).toBeNull()
  })
})

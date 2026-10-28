import { act } from '@testing-library/react'
import { hydrateRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { renderHomepage } from './entry-prerender.jsx'
import { RenderContext } from './lib/RenderContext.jsx'
import { LanguageProvider } from './i18n/LanguageProvider.jsx'
import SiteApp from './SiteApp.jsx'
import { onRequest } from '../functions/_middleware.js'

afterEach(() => {
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

describe('homepage hydration', () => {
  it.each([
    ['company', 'en', 'https://datomer.eu', 4173, '?lang=en'],
    ['company', 'sv', 'https://datomer.eu', 4173, '?lang=sv'],
    ['product', 'en', 'https://par.datomer.eu', 4174, '?lang=en'],
    ['product', 'sv', 'https://par.datomer.eu', 4174, '?lang=sv'],
    ['company', 'en', 'https://datomer.eu', 4173, ''],
    ['product', 'en', 'https://par.datomer.eu', 4174, ''],
    ['company', 'en', 'https://datomer.eu', 4173, '?lang=en#pricing'],
  ])('hydrates %s/%s before applying browser preferences (%s:%s%s)', async (site, language, origin, port, search) => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(key => ({
        'par-language': 'sv',
        'par-cookie-consent': 'declined',
        'par-experiments': '{"hero-cta-copy":"social-proof"}',
        'par-visitor-id': 'returning-visitor',
      })[key] || null),
      setItem: vi.fn(),
    })
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false })))
    const body = renderHomepage(origin, language)
    const shell = `<!doctype html><html><head><title>Shell</title></head><body><div id="root" data-prerendered="${site}" data-language="${language}">${body}</div></body></html>`
    const response = await onRequest({
      request: new Request(`${origin}/${search.split('#')[0]}`),
      env: { ASSETS: { fetch: async () => new Response(shell, { headers: { 'content-type': 'text/html' } }) } },
      next: vi.fn(),
    })
    const html = await response.text()
    expect(html).toContain(body)
    const parsed = new DOMParser().parseFromString(html, 'text/html')
    const root = parsed.getElementById('root')
    document.body.append(root)
    const initialHeading = root.querySelector('h1')
    const replace = vi.fn()
    vi.stubGlobal('location', { origin: `http://127.0.0.1:${port}`, replace })
    const onRecoverableError = vi.fn()
    const errors = vi.spyOn(console, 'error')
    let hydrated
    try {
      await act(async () => {
        hydrated = hydrateRoot(root,
          <RenderContext.Provider value={{ origin, language }}>
            <HelmetProvider>
              <MemoryRouter initialEntries={[`/${search}`]}>
                <LanguageProvider><SiteApp /></LanguageProvider>
              </MemoryRouter>
            </HelmetProvider>
          </RenderContext.Provider>,
          { onRecoverableError })
      })
      expect(onRecoverableError).not.toHaveBeenCalled()
      expect(errors).not.toHaveBeenCalled()
      if (search.includes('#pricing')) {
        expect(replace).toHaveBeenCalledWith('http://127.0.0.1:4174/?lang=en#pricing')
      } else {
        expect(root.querySelector('h1')).toBe(initialHeading)
        expect(document.documentElement.lang).toBe(search ? language : 'sv')
        expect(root.querySelectorAll('main')).toHaveLength(1)
      }
    } finally {
      if (hydrated) await act(async () => hydrated.unmount())
      errors.mockRestore()
    }
  })
})

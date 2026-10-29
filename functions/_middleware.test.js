import { describe, it, expect, vi } from 'vitest'
import { onRequest } from './_middleware.js'

function makeRequest(path, accept = 'text/html') {
  return new Request(`https://par.datomer.eu${path}`, {
    headers: { accept },
    method: 'GET',
  })
}

function makeContext(request, html) {
  return {
    request,
    env: {},
    next: vi.fn(async () =>
      new Response(html, {
        headers: { 'content-type': 'text/html; charset=utf-8' },
      })
    ),
  }
}

const SHELL = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/par-logo.png" />
    <title>Default</title>
    <meta name="description" content="Default description" />
    <link rel="canonical" href="https://datomer.eu/" />
    <meta property="og:title" content="Old OG title" />
    <meta name="twitter:title" content="Old Twitter title" />
    <script type="module" crossorigin src="/assets/index-ABC.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index-ABC.css">
    <script>window.test = true;</script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`

describe('meta middleware', () => {
  it.each([
    ['datomer.eu', 'company', 'en'],
    ['datomer.eu', 'company', 'sv'],
    ['par.datomer.eu', 'product', 'en'],
    ['par.datomer.eu', 'product', 'sv'],
  ])('serves the generated %s homepage in %s/%s', async (hostname, site, language) => {
    const ctx = makeContext(new Request(`https://${hostname}/?lang=${language}&utm_campaign=beta`), SHELL)
    const body = SHELL.replace('<div id="root"></div>', `<div id="root" data-prerendered="${site}" data-language="${language}"><main><h1>Existing homepage</h1></main></div>`)
    ctx.env.ASSETS = { fetch: vi.fn(async () => new Response(body, {
      headers: { 'content-type': 'text/html', etag: '"original"', 'content-length': '123' },
    })) }
    const response = await onRequest(ctx)
    const html = await response.text()
    expect(response.status).toBe(200)
    expect(ctx.next).not.toHaveBeenCalled()
    expect(ctx.env.ASSETS.fetch.mock.calls[0][0].url).toBe(`https://${hostname}/__prerender/${site}/${language}/index.html`)
    expect(html).toContain('<h1>Existing homepage</h1>')
    expect(html).toContain(`<html lang="${language}">`)
    expect(html).not.toContain('utm_campaign')
    expect(html.match(/rel="canonical"/g)).toHaveLength(1)
    expect(response.headers.has('content-length')).toBe(false)
    expect(response.headers.has('etag')).toBe(false)
  })

  it('can explicitly roll back to the existing shell', async () => {
    const ctx = makeContext(makeRequest('/'), SHELL)
    ctx.env = { PRERENDER_HOMEPAGES: 'false', ASSETS: { fetch: vi.fn() } }
    const response = await onRequest(ctx)
    expect(response.status).toBe(200)
    expect(ctx.env.ASSETS.fetch).not.toHaveBeenCalled()
    expect(ctx.next).toHaveBeenCalledOnce()
    expect(await response.text()).not.toContain('data-prerendered')
  })

  it.each([
    [200, 'text/html', SHELL],
    [404, 'text/html', '<div data-prerendered="product" data-language="en"></div>'],
    [200, 'text/html', '<div data-prerendered="company" data-language="en"></div>'],
    [200, 'text/html', '<div data-prerendered="product" data-language="sv"></div>'],
    [200, 'text/plain', '<div data-prerendered="product" data-language="en"></div>'],
  ])('reports an invalid generated page (%s, %s, %s) instead of an empty success', async (status, type, body) => {
    const ctx = makeContext(makeRequest('/'), SHELL)
    ctx.env.ASSETS = { fetch: vi.fn(async () => new Response(body, {
      status, headers: { 'content-type': type },
    })) }
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    const response = await onRequest(ctx)
    expect(response.status).toBe(503)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(log).toHaveBeenCalledOnce()
    log.mockRestore()
  })

  it('does not prerender non-home routes and keeps preview HTML noindex', async () => {
    const ctx = makeContext(makeRequest('/contact'), SHELL)
    ctx.env.ASSETS = { fetch: vi.fn() }
    await onRequest(ctx)
    expect(ctx.env.ASSETS.fetch).not.toHaveBeenCalled()
    const preview = makeContext(new Request('https://branch.pages.dev/'), SHELL)
    preview.env.ASSETS = { fetch: vi.fn(async () => new Response(
      SHELL.replace('<div id="root"></div>', '<div id="root" data-prerendered="product" data-language="en">Pär</div>'),
      { headers: { 'content-type': 'text/html' } },
    )) }
    expect(await (await onRequest(preview)).text()).toContain('noindex, nofollow')
  })

  it('blocks public access to internal generated variants', async () => {
    const ctx = makeContext(makeRequest('/__prerender/product/en/index.html'), SHELL)
    const response = await onRequest(ctx)
    expect(response.status).toBe(404)
    expect(response.headers.get('x-robots-tag')).toContain('noindex')
    expect(ctx.next).not.toHaveBeenCalled()
  })

  it.each(['en', 'sv'])('serves distinct company metadata in %s without product schema', async lang => {
    const ctx = makeContext(new Request(`https://datomer.eu/?lang=${lang}`), SHELL)
    const res = await onRequest(ctx)
    const text = await res.text()
    expect(text).toContain('<meta property="og:site_name" content="Datomer AB"')
    expect(text).toContain(`href="https://datomer.eu/${lang === 'sv' ? '?lang=sv' : ''}"`)
    expect(text).toContain('href="/datomer-icon.png?v=20261029"')
    expect(text).toContain('content="https://datomer.eu/og-image-datomer.png"')
    expect(text).not.toContain('"@type":"SoftwareApplication"')
    expect(text).not.toContain('noindex')
  })

  it('redirects old product routes, including language and checkout parameters', async () => {
    for (const path of ['/get-started?lang=sv', '/payment-success?session_id=test', '/blog', '/models', '/press']) {
      const ctx = makeContext(new Request(`https://datomer.eu${path}`), SHELL)
      const res = await onRequest(ctx)
      expect(res.status).toBe(301)
      expect(res.headers.get('location')).toBe(`https://par.datomer.eu${path}`)
      expect(ctx.next).not.toHaveBeenCalled()
    }
  })

  it.each(['datomer.eu', 'par.datomer.eu'])('serves a host-owned sitemap and robots for %s', async hostname => {
    const xml = await (await onRequest(makeContext(new Request(`https://${hostname}/sitemap.xml`), ''))).text()
    expect(xml).toContain(`<loc>https://${hostname}/</loc>`)
    expect(xml).toContain(`href="https://${hostname}/?lang=sv"`)
    expect(xml.includes('/get-started</loc>')).toBe(hostname === 'par.datomer.eu')
    expect(xml.includes('/purpose</loc>')).toBe(hostname === 'par.datomer.eu')
    const robots = await (await onRequest(makeContext(new Request(`https://${hostname}/robots.txt`), ''))).text()
    expect(robots).toContain(`Sitemap: https://${hostname}/sitemap.xml`)
  })

  it('prevents indexing preview hosts', async () => {
    const text = await (await onRequest(makeContext(new Request('https://branch.datomer-eu.pages.dev/'), SHELL))).text()
    expect(text).toContain('noindex, nofollow')
  })

  it.each(['Googlebot', 'bingbot', 'OAI-SearchBot'])('serves the same public HTML to %s and visitors', async agent => {
    const url = 'https://par.datomer.eu/press?lang=sv'
    const browser = await (await onRequest(makeContext(new Request(url), SHELL))).text()
    const bot = await (await onRequest(makeContext(new Request(url, {
      headers: { 'User-Agent': agent },
    }), SHELL))).text()
    expect(bot).toBe(browser)
  })

  it('keeps preview robots closed without overriding production training-crawler controls', async () => {
    const preview = await onRequest(makeContext(new Request('https://branch.pages.dev/robots.txt'), ''))
    expect(await preview.text()).toBe('User-agent: *\nDisallow: /\n')
    for (const host of ['datomer.eu', 'par.datomer.eu']) {
      const robots = await (await onRequest(makeContext(new Request(`https://${host}/robots.txt`), ''))).text()
      expect(robots).toBe(`User-agent: *\nAllow: /\nSitemap: https://${host}/sitemap.xml\n`)
      expect(robots).not.toContain('GPTBot')
    }
  })

  it('keeps payment confirmation out of indexes and removes stale robots tags', async () => {
    const ctx = makeContext(makeRequest('/payment-success?session_id=private'), SHELL.replace(
      '</head>', '<meta name="robots" content="index, follow" /></head>',
    ))
    const text = await (await onRequest(ctx)).text()
    expect(text.match(/<meta name="robots"/g)).toHaveLength(1)
    expect(text).toContain('<meta name="robots" content="noindex, nofollow" />')
    expect(text).not.toContain('session_id')
  })

  it('rewrites title and description for /press', async () => {
    const req = makeRequest('/press')
    const ctx = makeContext(req, SHELL)
    const res = await onRequest(ctx)
    const text = await res.text()
    expect(text).toContain('<title>Press Kit — Pär by Datomer</title>')
    expect(text).toContain(
      '<meta name="description" content="Press kit for Pär by Datomer. Download logos, screenshots, and company facts for journalists and reviewers." />'
    )
    expect(text).toContain('<link rel="canonical" href="https://par.datomer.eu/press" />')
    expect(text).toContain('<meta property="og:url" content="https://par.datomer.eu/press" />')
    expect(text).toContain('<meta property="og:image" content="https://par.datomer.eu/og-image-aurora.png" />')
  })

  it('uses Swedish translation with ?lang=sv', async () => {
    const req = makeRequest('/press?lang=sv')
    const ctx = makeContext(req, SHELL)
    const res = await onRequest(ctx)
    const text = await res.text()
    expect(text).toContain('<html lang="sv">')
    expect(text).toContain('<title>Presskit — Pär by Datomer</title>')
    expect(text).toContain('<link rel="canonical" href="https://par.datomer.eu/press?lang=sv" />')
    expect(text).toContain('<meta property="og:locale" content="sv_SE" />')
    expect(text).toContain(
      '<link rel="alternate" hreflang="sv" href="https://par.datomer.eu/press?lang=sv" />'
    )
  })

  it('keeps default meta for unknown routes', async () => {
    const req = makeRequest('/does-not-exist')
    const ctx = makeContext(req, SHELL)
    const res = await onRequest(ctx)
    const text = await res.text()
    expect(text).toContain(
      '<title>Pär by Datomer — Your AI. On your device.</title>'
    )
  })

  it('falls back to English meta for ?lang=de', async () => {
    const req = makeRequest('/press?lang=de')
    const ctx = makeContext(req, SHELL)
    const res = await onRequest(ctx)
    const text = await res.text()
    expect(text).toContain('<html lang="en">')
    expect(text).toContain('<title>Press Kit — Pär by Datomer</title>')
    expect(text).toContain('<meta property="og:locale" content="en_US" />')
    expect(text).not.toContain('Pressekit')
  })

  it('does not emit German hreflang links', async () => {
    const req = makeRequest('/press')
    const ctx = makeContext(req, SHELL)
    const res = await onRequest(ctx)
    const text = await res.text()
    expect(text).not.toContain('hreflang="de"')
    expect(text).toContain(
      '<link rel="alternate" hreflang="sv" href="https://par.datomer.eu/press?lang=sv" />'
    )
  })

  it('rewrites title and description for /get-started', async () => {
    const req = makeRequest('/get-started')
    const ctx = makeContext(req, SHELL)
    const res = await onRequest(ctx)
    const text = await res.text()
    expect(text).toContain('<title>Get Started — Pär by Datomer</title>')
    expect(text).toContain('<link rel="canonical" href="https://par.datomer.eu/get-started" />')
  })

  it('serves Swedish meta for /get-started?lang=sv', async () => {
    const req = makeRequest('/get-started?lang=sv')
    const ctx = makeContext(req, SHELL)
    const res = await onRequest(ctx)
    const text = await res.text()
    expect(text).toContain('<html lang="sv">')
    expect(text).toContain('<title>Kom igång — Pär by Datomer</title>')
  })

  it('injects JSON-LD structured data', async () => {
    const req = makeRequest('/')
    const ctx = makeContext(req, SHELL)
    const res = await onRequest(ctx)
    const text = await res.text()
    expect(text).toContain('"@type":"Organization"')
    expect(text).toContain('"@type":"SoftwareApplication"')
  })

  it('skips non-HTML requests', async () => {
    const req = makeRequest('/og-image.png', 'image/png')
    const nextResponse = new Response('image', {
      headers: { 'content-type': 'image/png' },
    })
    const ctx = {
      request: req,
      env: {},
      next: vi.fn(async () => nextResponse),
    }
    const res = await onRequest(ctx)
    expect(res.headers.get('content-type')).toBe('image/png')
    const text = await res.text()
    expect(text).toBe('image')
  })

  it('works without an explicit text/html accept header', async () => {
    const req = new Request('https://par.datomer.eu/press', {
      headers: { accept: '*/*' },
      method: 'GET',
    })
    const ctx = makeContext(req, SHELL)
    const res = await onRequest(ctx)
    const text = await res.text()
    expect(text).toContain('<title>Press Kit — Pär by Datomer</title>')
  })

  it('skips /api routes', async () => {
    const req = makeRequest('/api/contact')
    const nextResponse = new Response('{}', {
      headers: { 'content-type': 'application/json' },
    })
    const ctx = {
      request: req,
      env: {},
      next: vi.fn(async () => nextResponse),
    }
    const res = await onRequest(ctx)
    expect(res.headers.get('content-type')).toBe('application/json')
  })

  it('preserves Vite asset tags and inline scripts', async () => {
    const req = makeRequest('/press')
    const ctx = makeContext(req, SHELL)
    const res = await onRequest(ctx)
    const text = await res.text()
    expect(text).toContain('/assets/index-ABC.js')
    expect(text).toContain('/assets/index-ABC.css')
    expect(text).toContain('window.test = true')
  })

  it('removes old canonical, OG, Twitter, and JSON-LD tags', async () => {
    const req = makeRequest('/about')
    const ctx = makeContext(
      req,
      SHELL.replace(
        '</head>',
        '    <script type="application/ld+json">{"@type":"Organization"}</script>\n  </head>'
      )
    )
    const res = await onRequest(ctx)
    const text = await res.text()
    expect(text).not.toContain('Old OG title')
    expect(text).not.toContain('Old Twitter title')
    expect(text).not.toContain('<link rel="canonical" href="https://datomer.eu/" />')
    expect(text).not.toContain('{"@type":"Organization"}')
    expect(text).toContain('<link rel="canonical" href="https://par.datomer.eu/about" />')
  })

  it('keeps Swedish and German characters intact and declares UTF-8', async () => {
    const res = await onRequest(makeContext(new Request('https://par.datomer.eu/?lang=sv'), SHELL))
    const text = await res.text()
    expect(res.headers.get('content-type')).toBe('text/html; charset=utf-8')
    expect(text).toContain('<title>Pär by Datomer — Din AI. På din enhet.</title>')
    expect(text).toContain('<html lang="sv">')
    expect(text).not.toMatch(/Ã|â€|�/)
  })

  it('escapes ampersands in titles and keeps JSON-LD script-safe', async () => {
    const text = await (await onRequest(makeContext(makeRequest('/models'), SHELL))).text()
    expect(text).toContain('Models &amp; Licenses')
    expect(text).not.toMatch(/<script type="application\/ld\+json">[^<]*<[^/]/)
  })

  it('returns 404 and noindex for unknown paths, 200 and index for known ones', async () => {
    const unknown = await onRequest(makeContext(new Request('https://datomer.eu/nope'), SHELL))
    expect(unknown.status).toBe(404)
    expect(await unknown.text()).toContain('noindex, nofollow')
    const productOnly = await onRequest(makeContext(new Request('https://par.datomer.eu/blog/'), SHELL))
    expect(productOnly.status).toBe(200)
    const home = await onRequest(makeContext(new Request('https://datomer.eu/'), SHELL))
    expect(home.status).toBe(200)
    expect(await home.text()).toContain('index, follow')
  })

  it('points the company /about route at the home URL and leaves it out of the sitemap', async () => {
    const text = await (await onRequest(makeContext(new Request('https://datomer.eu/about'), SHELL))).text()
    expect(text).toContain('<link rel="canonical" href="https://datomer.eu/" />')
    const xml = await (await onRequest(makeContext(new Request('https://datomer.eu/sitemap.xml'), ''))).text()
    expect(xml).not.toContain('/about</loc>')
  })
})

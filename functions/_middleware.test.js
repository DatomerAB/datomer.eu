import { describe, it, expect, vi } from 'vitest'
import { onRequest } from './_middleware.js'

function makeRequest(path, accept = 'text/html') {
  return new Request(`https://datomer.eu${path}`, {
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
  it('rewrites title and description for /press', async () => {
    const req = makeRequest('/press')
    const ctx = makeContext(req, SHELL)
    const res = await onRequest(ctx)
    const text = await res.text()
    expect(text).toContain('<title>Press Kit — Pär by Datomer</title>')
    expect(text).toContain(
      '<meta name="description" content="Press kit for Pär by Datomer. Download logos, screenshots, and company facts for journalists and reviewers." />'
    )
    expect(text).toContain('<link rel="canonical" href="https://datomer.eu/press" />')
    expect(text).toContain('<meta property="og:url" content="https://datomer.eu/press" />')
    expect(text).toContain('<meta property="og:image" content="https://datomer.eu/og-image-aurora.png" />')
  })

  it('uses Swedish translation with ?lang=sv', async () => {
    const req = makeRequest('/press?lang=sv')
    const ctx = makeContext(req, SHELL)
    const res = await onRequest(ctx)
    const text = await res.text()
    expect(text).toContain('<html lang="sv">')
    expect(text).toContain('<title>Presskit — Pär by Datomer</title>')
    expect(text).toContain('<link rel="canonical" href="https://datomer.eu/press?lang=sv" />')
    expect(text).toContain('<meta property="og:locale" content="sv_SE" />')
    expect(text).toContain(
      '<link rel="alternate" hreflang="sv" href="https://datomer.eu/press?lang=sv" />'
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
    const req = new Request('https://datomer.eu/press', {
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
    expect(text).toContain('<link rel="canonical" href="https://datomer.eu/about" />')
  })
})

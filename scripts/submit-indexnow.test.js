// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest'
import { readFile } from 'node:fs/promises'
import { request, submission, submitSite, verifiedCommit } from './submit-indexnow.mjs'

vi.mock('node:fs/promises', () => ({ readFile: vi.fn() }))
const KEY = 'public-verification-token'
const COMMIT = 'a'.repeat(40)
const ENV = {
  GITHUB_REPOSITORY: 'DatomerAB/datomer.eu',
  GH_TOKEN: 'test-token',
  GITHUB_EVENT_PATH: '/event.json',
  GITHUB_EVENT_NAME: 'check_run',
}
const CHECK = {
  id: 1, name: 'Cloudflare Pages', app: { slug: 'cloudflare-workers-and-pages' },
  head_sha: COMMIT, conclusion: 'success', status: 'completed',
}

afterEach(() => vi.restoreAllMocks())

function siteFetcher(origin, site, overrides = {}) {
  const payload = submission(origin, site, KEY)
  return vi.fn(async (url, options) => {
    if (url.endsWith('/deployment.json')) return Response.json({ commit: COMMIT })
    if (url.endsWith('/indexnow-key.txt')) return new Response(KEY + '\n')
    if (url.endsWith('/sitemap.xml')) return new Response(
      `<urlset>${payload.urlList.filter(url => !url.includes('?')).map(url => `<url><loc>${url}</loc></url>`).join('')}</urlset>`,
    )
    expect(url).toBe('https://api.indexnow.org/indexnow')
    expect(options.method).toBe('POST')
    return new Response('', { status: 200 })
  }).mockImplementationOnce(overrides.first || (async () => Response.json({ commit: COMMIT })))
}

describe('host-owned IndexNow submissions', () => {
  it.each([
    ['https://datomer.eu', 'company', 10],
    ['https://par.datomer.eu', 'product', 22],
  ])('submits only canonical public URLs for %s', async (origin, site, count) => {
    const fetch = siteFetcher(origin, site)
    const result = await submitSite(origin, site, KEY, COMMIT, { fetch })
    expect(result).toEqual({ host: new URL(origin).hostname, urls: count, status: 200 })
    const [url, options] = fetch.mock.calls.at(-1)
    expect(url).toBe('https://api.indexnow.org/indexnow')
    const payload = JSON.parse(options.body)
    expect(payload.keyLocation).toBe(`${origin}/indexnow-key.txt`)
    expect(payload.urlList).toHaveLength(count)
    expect(new Set(payload.urlList).size).toBe(count)
    expect(payload.urlList.every(url => new URL(url).origin === origin)).toBe(true)
    expect(payload.urlList.some(url => /payment-success|\/beta|utm_|session_id/.test(url))).toBe(false)
    expect(payload.urlList).toContain(`${origin}/?lang=sv`)
    if (site === 'product') {
      expect(payload.urlList).toContain(`${origin}/purpose`)
      expect(payload.urlList).toContain(`${origin}/purpose?lang=sv`)
    }
  })

  it.each([
    ['https://preview.pages.dev', 'product', KEY],
    ['https://datomer.eu', 'product', KEY],
    ['https://par.datomer.eu', 'product', 'bad'],
  ])('rejects invalid submission configuration %s/%s', (origin, site, key) => {
    expect(() => submission(origin, site, key)).toThrow()
  })

  it('does not notify search engines if the live deployment is stale', async () => {
    const fetch = siteFetcher('https://datomer.eu', 'company', {
      first: async () => Response.json({ commit: 'b'.repeat(40) }),
    })
    await expect(submitSite('https://datomer.eu', 'company', KEY, COMMIT, { fetch })).rejects.toThrow('Live deployment')
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it.each(['key', 'sitemap'])('does not notify when the live %s is invalid', async bad => {
    const valid = siteFetcher('https://datomer.eu', 'company')
    const fetch = vi.fn(async (url, options) => {
      if (url.endsWith(bad === 'key' ? '/indexnow-key.txt' : '/sitemap.xml')) return new Response('incorrect')
      return valid(url, options)
    })
    await expect(submitSite('https://datomer.eu', 'company', KEY, COMMIT, { fetch })).rejects.toThrow()
    expect(fetch.mock.calls.some(([url]) => url.includes('api.indexnow.org'))).toBe(false)
  })

  it('reports 202 as receipt pending key validation, not indexing success', async () => {
    const valid = siteFetcher('https://datomer.eu', 'company')
    const fetch = vi.fn((url, options) => url.includes('api.indexnow.org')
      ? new Response('', { status: 202 }) : valid(url, options))
    expect((await submitSite('https://datomer.eu', 'company', KEY, COMMIT, { fetch })).status).toBe(202)
  })
})

describe('bounded HTTP retries', () => {
  it('retries network failures, 429 and server errors', async () => {
    const fetch = vi.fn().mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce(new Response('', { status: 429, headers: { 'Retry-After': '2' } }))
      .mockResolvedValueOnce(new Response('', { status: 503 }))
      .mockResolvedValueOnce(new Response('', { status: 200 }))
    const wait = vi.fn()
    await request('https://api.indexnow.org/indexnow', {}, { fetch, wait })
    expect(fetch).toHaveBeenCalledTimes(4)
    expect(wait.mock.calls).toEqual([[1000], [2000], [4000]])
    expect(fetch.mock.calls[0][1].redirect).toBe('error')
    expect(fetch.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal)
  })

  it.each([400, 403, 422])('does not retry HTTP %s validation failures', async status => {
    const fetch = vi.fn(async () => new Response('', { status }))
    await expect(request('https://api.indexnow.org/indexnow', {}, { fetch })).rejects.toThrow(`HTTP ${status}`)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('fails visibly after four temporary errors', async () => {
    const fetch = vi.fn(async () => new Response('', { status: 503 }))
    const wait = vi.fn()
    await expect(request('https://api.indexnow.org/indexnow', {}, { fetch, wait })).rejects.toThrow('HTTP 503')
    expect(fetch).toHaveBeenCalledTimes(4)
    expect(wait.mock.calls).toEqual([[1000], [2000], [4000]])
  })

  it('does not retry earlier than a long Retry-After permits', async () => {
    const fetch = vi.fn(async () => new Response('', { status: 429, headers: { 'retry-after': '99999' } }))
    const wait = vi.fn()
    await expect(request('https://api.indexnow.org/indexnow', {}, { fetch, wait })).rejects.toThrow('rerun later')
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(wait).not.toHaveBeenCalled()
  })
})

describe('production deployment gate', () => {
  function github(event = CHECK, checks = [CHECK]) {
    vi.mocked(readFile).mockResolvedValue(JSON.stringify({ check_run: event }))
    return vi.fn(async url => url.endsWith('/branches/main')
      ? Response.json({ commit: { sha: COMMIT } }) : Response.json({ check_runs: checks }))
  }

  it('accepts a successful trusted check for current main', async () => {
    expect(await verifiedCommit(ENV, { fetch: github() })).toBe(COMMIT)
  })

  it.each([
    { ...CHECK, conclusion: 'failure' },
    { ...CHECK, name: 'Other build' },
    { ...CHECK, app: { slug: 'other-app' } },
  ])('rejects untrusted or unsuccessful check events', async check => {
    await expect(verifiedCommit(ENV, { fetch: github(check) })).rejects.toThrow('Not a successful')
  })

  it('skips preview and obsolete deployment SHAs', async () => {
    const fetch = github({ ...CHECK, head_sha: 'b'.repeat(40) })
    expect(await verifiedCommit(ENV, { fetch })).toBeNull()
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('rejects a newer failed deploy even if an earlier check succeeded', async () => {
    const fetch = github(CHECK, [CHECK, { ...CHECK, id: 2, conclusion: 'failure' }])
    await expect(verifiedCommit(ENV, { fetch })).rejects.toThrow('no successful')
  })

  it('allows manual retries on main only after a successful deployment', async () => {
    const env = { ...ENV, GITHUB_EVENT_NAME: 'workflow_dispatch', GITHUB_REF: 'refs/heads/main' }
    expect(await verifiedCommit(env, { fetch: github() })).toBe(COMMIT)
    await expect(verifiedCommit({ ...env, GITHUB_REF: 'refs/heads/staging' }, { fetch: github() })).rejects.toThrow('must run from main')
  })
})

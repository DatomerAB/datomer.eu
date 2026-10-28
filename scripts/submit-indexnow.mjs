import { readFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { COMPANY_URL, PRODUCT_URL } from '../src/lib/site.js'
import { alternateLinks, sitemapPaths } from '../src/lib/siteMetadata.js'

const ENDPOINT = 'https://api.indexnow.org/indexnow'
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

export async function request(url, options = {}, { fetch: fetcher = fetch, wait = sleep } = {}) {
  for (let attempt = 0; attempt < 4; attempt++) {
    let response
    try {
      response = await fetcher(url, {
        ...options,
        headers: { 'cache-control': 'no-cache', ...options.headers },
        redirect: 'error',
        signal: AbortSignal.timeout(15000),
      })
    } catch (error) {
      if (attempt === 3) throw new Error(`Request failed: ${url}`, { cause: error })
      console.warn(`Request failed for ${url}; retry ${attempt + 1}/3`)
      await wait(1000 * 2 ** attempt)
      continue
    }
    if (response.ok) return response
    const retryable = response.status === 429 || response.status >= 500
    if (!retryable || attempt === 3) throw new Error(`HTTP ${response.status}: ${url}`)
    const retryAfter = response.headers.get('retry-after')
    const parsedDelay = retryAfter && /^\d+$/.test(retryAfter)
      ? Number(retryAfter) * 1000 : Date.parse(retryAfter) - Date.now()
    const delay = Number.isFinite(parsedDelay) ? Math.max(0, parsedDelay) : 1000 * 2 ** attempt
    if (delay > 60000) throw new Error(`Retry-After exceeds this job's retry budget: ${url}; rerun later`)
    console.warn(`HTTP ${response.status} for ${url}; retry ${attempt + 1}/3`)
    await wait(delay)
  }
}

export function submission(origin, site, key) {
  if (![COMPANY_URL, PRODUCT_URL].includes(origin)) throw new Error('Only production hosts can be submitted')
  if (!['company', 'product'].includes(site)) throw new Error('Invalid site')
  if ((site === 'company' ? COMPANY_URL : PRODUCT_URL) !== origin) throw new Error('Site/host mismatch')
  if (!/^[a-zA-Z0-9-]{8,128}$/.test(key)) throw new Error('Invalid IndexNow verification key')
  return {
    host: new URL(origin).hostname,
    key,
    keyLocation: `${origin}/indexnow-key.txt`,
    urlList: sitemapPaths(site).flatMap(path => alternateLinks(path, origin)
      .filter(link => link.hrefLang !== 'x-default').map(link => link.href)),
  }
}

export async function submitSite(origin, site, key, commit, dependencies = {}) {
  if (!/^[a-f0-9]{40}$/.test(commit)) throw new Error('Invalid expected deployment commit')
  const payload = submission(origin, site, key)
  const get = url => request(url, {}, dependencies)
  const marker = await (await get(`${origin}/deployment.json`)).json()
  if (marker.commit !== commit) throw new Error(`Live deployment does not match ${commit} on ${origin}`)
  const liveKey = await (await get(payload.keyLocation)).text()
  if (liveKey.trim() !== key) throw new Error(`Verification key does not match on ${origin}`)
  const sitemap = await (await get(`${origin}/sitemap.xml`)).text()
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1])
  const expected = sitemapPaths(site).map(path => `${origin}${path}`)
  if (locations.length !== expected.length || !expected.every(url => locations.includes(url))) {
    throw new Error(`Live sitemap does not match public routes on ${origin}`)
  }
  const response = await request(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  }, dependencies)
  if (![200, 202].includes(response.status)) throw new Error(`Unexpected IndexNow response: ${response.status}`)
  console.log(`${payload.host}: ${payload.urlList.length} URLs received by IndexNow (HTTP ${response.status}${response.status === 202 ? ', key validation pending' : ''})`)
  return { host: payload.host, urls: payload.urlList.length, status: response.status }
}

export async function verifiedCommit(env = process.env, dependencies = {}) {
  if (env.GITHUB_REPOSITORY !== 'DatomerAB/datomer.eu') throw new Error('Unexpected repository')
  if (!env.GH_TOKEN) throw new Error('Missing GitHub token')
  const event = JSON.parse(await readFile(env.GITHUB_EVENT_PATH, 'utf8'))
  const api = async path => (await request(`https://api.github.com/repos/DatomerAB/datomer.eu/${path}`, {
    headers: { Authorization: `Bearer ${env.GH_TOKEN}`, Accept: 'application/vnd.github+json' },
  }, dependencies)).json()
  const branch = await api('branches/main')
  const commit = branch.commit.sha
  if (env.GITHUB_EVENT_NAME === 'check_run') {
    if (event.check_run?.name !== 'Cloudflare Pages'
      || event.check_run?.app?.slug !== 'cloudflare-workers-and-pages'
      || event.check_run?.conclusion !== 'success') throw new Error('Not a successful Cloudflare deployment')
    if (event.check_run.head_sha !== commit) {
      console.log('Skipping an obsolete or non-main deployment')
      return null
    }
  } else if (env.GITHUB_EVENT_NAME !== 'workflow_dispatch' || env.GITHUB_REF !== 'refs/heads/main') {
    throw new Error('Manual submissions must run from main')
  }
  const checks = await api(`commits/${commit}/check-runs?check_name=Cloudflare%20Pages&per_page=100`)
  const deployment = checks.check_runs.filter(check => check.name === 'Cloudflare Pages'
    && check.app?.slug === 'cloudflare-workers-and-pages' && check.head_sha === commit)
    .sort((a, b) => b.id - a.id)[0]
  if (deployment?.conclusion !== 'success' || deployment.status !== 'completed') {
    throw new Error('Current main has no successful Cloudflare Pages deployment')
  }
  return commit
}

async function main() {
  const commit = await verifiedCommit()
  if (!commit) return
  const key = (await readFile(new URL('../public/indexnow-key.txt', import.meta.url), 'utf8')).trim()
  const results = []
  for (const [origin, site] of [[COMPANY_URL, 'company'], [PRODUCT_URL, 'product']]) {
    try {
      results.push(await submitSite(origin, site, key, commit))
    } catch (error) {
      console.error(`IndexNow notification failed for ${origin}:`, error)
      results.push({ host: new URL(origin).hostname, error: error.message })
    }
  }
  if (process.env.GITHUB_STEP_SUMMARY) {
    const { appendFile } = await import('node:fs/promises')
    await appendFile(process.env.GITHUB_STEP_SUMMARY,
      `## IndexNow notifications\n\nDeployment: \`${commit}\`\n\n`
      + results.map(result => result.error
        ? `- **${result.host}: FAILED** — ${result.error}`
        : `- ${result.host}: ${result.urls} URLs received (HTTP ${result.status})`).join('\n')
      + '\n\nReceipt does not guarantee indexing. This job does not deploy the site.\n')
  }
  if (results.some(result => result.error)) throw new Error('One or more IndexNow notifications failed')
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => {
    console.error(error)
    process.exitCode = 1
  })
}

// Supply crawler metadata before React starts; the hydrated app uses the same definitions.
import { legacyProductDestination } from '../src/lib/site.js'
import { alternateLinks, getSiteMetadata, sitemapPaths } from '../src/lib/siteMetadata.js'
import { escapeAttr, safeJson } from '../src/lib/seoMeta.js'

export async function onRequest(context) {
  const { request, next, env } = context
  const url = new URL(request.url)
  const meta = getSiteMetadata(url)
  const { site, siteUrl, preview } = meta
  const destination = legacyProductDestination(url)
  if (url.pathname.startsWith('/__prerender/')) {
    return new Response('Not Found', {
      status: 404,
      headers: { 'X-Robots-Tag': 'noindex, nofollow' },
    })
  }
  if (['GET', 'HEAD'].includes(request.method) && destination) {
    return Response.redirect(destination, 301)
  }
  if (request.method === 'GET' && url.pathname === '/sitemap.xml') {
    const entries = sitemapPaths(site).map(path => `<url><loc>${siteUrl}${path}</loc>${
      alternateLinks(path, siteUrl).map(({ hrefLang, href }) =>
        `<xhtml:link rel="alternate" hreflang="${hrefLang}" href="${href}" />`
      ).join('')
    }</url>`).join('')
    return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${entries}</urlset>`, {
      headers: { 'content-type': 'application/xml; charset=utf-8' },
    })
  }
  if (request.method === 'GET' && url.pathname === '/robots.txt') {
    return new Response(preview ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`, {
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    })
  }

  const isAsset = /\.(png|jpg|jpeg|gif|svg|webp|ico|css|js|json|xml|txt|pdf|zip|woff2?|ttf|eot|otf|mp4|webm|ogg)$/i.test(url.pathname)
  const isApi = url.pathname.startsWith('/api/')
  if (isAsset || isApi || request.method !== 'GET') return next()

  let res
  let prerendered = false
  if (url.pathname === '/' && env?.ASSETS && env.PRERENDER_HOMEPAGES !== 'false') {
    const assetUrl = new URL(`/__prerender/${site}/${meta.lang}/index.html`, url)
    const candidate = await env.ASSETS.fetch(new Request(assetUrl, {
      headers: { Accept: 'text/html' },
    }))
    const generatedHtml = await candidate.clone().text()
    if (!candidate.ok || !candidate.headers.get('content-type')?.includes('text/html')
      || !generatedHtml.includes(`data-prerendered="${site}"`)
      || !generatedHtml.includes(`data-language="${meta.lang}"`)) {
      console.error(`[prerender] Missing homepage asset: ${site}/${meta.lang}`)
      return new Response('Homepage temporarily unavailable', {
        status: 503,
        headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
      })
    }
    res = candidate
    prerendered = true
  } else {
    res = await next()
  }
  if (!res.headers.get('content-type')?.includes('text/html')) return res

  const html = await res.text()
  const seoInject = [
    `    <link rel="canonical" href="${escapeAttr(meta.canonical)}" />`,
    ...meta.alternates.map(({ hrefLang, href }) =>
      `    <link rel="alternate" hreflang="${hrefLang}" href="${escapeAttr(href)}" />`),
    `    <meta name="robots" content="${meta.robots}" />`,
    `    <meta property="og:site_name" content="${meta.siteName}" />`,
    `    <meta property="og:title" content="${escapeAttr(meta.title)}" />`,
    `    <meta property="og:description" content="${escapeAttr(meta.description)}" />`,
    `    <meta property="og:type" content="website" />`,
    `    <meta property="og:url" content="${escapeAttr(meta.canonical)}" />`,
    `    <meta property="og:image" content="${meta.image}" />`,
    `    <meta property="og:locale" content="${meta.locale}" />`,
    `    <meta name="twitter:card" content="summary_large_image" />`,
    `    <meta name="twitter:title" content="${escapeAttr(meta.title)}" />`,
    `    <meta name="twitter:description" content="${escapeAttr(meta.description)}" />`,
    `    <meta name="twitter:image" content="${meta.image}" />`,
    ...(prerendered ? [] : meta.structuredData.map(data =>
      `    <script type="application/ld+json">${safeJson(data)}</script>`)),
  ].join('\n')

  // Keep the hydrated body intact, including SVG titles and React-owned JSON-LD.
  const headEnd = html.search(/<\/head>/i)
  const headLength = headEnd < 0 ? html.length : headEnd + '</head>'.length
  let newHtml = html.slice(0, headLength)
    .replace(/<html[^>]*>/i, `<html lang="${meta.lang}">`)
    .replace(/(<link rel="(?:icon|apple-touch-icon)"[^>]*href=")[^"]+(")/gi, `$1${meta.icon}$2`)
    .replace(/<title>.*?<\/title>/i, () => `<title>${escapeAttr(meta.title)}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"[^>]*>/i,
      () => `<meta name="description" content="${escapeAttr(meta.description)}" />`
    )
    .replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>\s*/gi, '')
    .replace(/<link\s+rel="alternate"\s+hreflang="[^"]*"\s+href="[^"]*"\s*\/?>\s*/gi, '')
    .replace(/<meta\s+name="robots"\s+content="[^"]*"[^>]*>\s*/gi, '')
    .replace(/<meta\s+property="og:[^"]+"\s+content="[^"]*"\s*\/?>\s*/gi, '')
    .replace(/<meta\s+name="twitter:[^"]+"\s+content="[^"]*"\s*\/?>\s*/gi, '')
    .replace(/<script\s+type="application\/ld\+json">[\s\S]*?<\/script>\s*/gi, '')
    .replace(/(<\/head>)/i, `\n${seoInject}\n  $1`)
  newHtml += html.slice(headLength)

  return new Response(newHtml, {
    status: meta.notFound ? 404 : res.status,
    statusText: meta.notFound ? 'Not Found' : res.statusText,
    headers: {
      ...Object.fromEntries([...res.headers.entries()].filter(([name]) =>
        !['content-length', 'content-encoding', 'etag', 'last-modified'].includes(name))),
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=0, must-revalidate',
    },
  })
}

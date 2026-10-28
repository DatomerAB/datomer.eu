// Cloudflare Pages middleware: inject per-route static meta tags into the SPA
// HTML shell. This ensures social crawlers and search engines that do not
// execute JavaScript still see correct titles, descriptions, canonical URLs,
// Open Graph, Twitter Cards, hreflang links, and JSON-LD for each route.

import { COMPANY_URL, PRODUCT_URL, PRODUCT_PATHS, siteForUrl, legacyProductDestination } from '../src/lib/site.js'
import { companyMeta, companyCanonicalPath } from '../src/lib/companyMeta.js'
import { PRODUCT_DESCRIPTIONS, PRODUCT_TITLES, COMPANY_FACTS, escapeAttr, safeJson } from '../src/lib/seoMeta.js'

const SITE_URL = PRODUCT_URL
const DEFAULT_TITLE = PRODUCT_TITLES.en
const DEFAULT_DESCRIPTION = PRODUCT_DESCRIPTIONS.en

const LOCALE = {
  en: 'en_US',
  sv: 'sv_SE',
  de: 'de_DE',
}

function pageTitle(title) {
  return title === DEFAULT_TITLE ? title : `${title} — Pär by Datomer`
}

// Keep in sync with SUPPORTED_LANGUAGES in src/i18n/LanguageProvider.jsx.
const ENABLED_LANGUAGES = ['en', 'sv']

function metaForRoute(pathname, searchParams, site = 'product') {
  const lang = ENABLED_LANGUAGES.includes(searchParams.get('lang'))
    ? searchParams.get('lang')
    : 'en'
  const basePath = pathname === '' ? '/' : pathname

  const routes = {
    '/': {
      en: { title: PRODUCT_TITLES.en, description: PRODUCT_DESCRIPTIONS.en },
      sv: { title: PRODUCT_TITLES.sv, description: PRODUCT_DESCRIPTIONS.sv },
      de: { title: PRODUCT_TITLES.de, description: PRODUCT_DESCRIPTIONS.de },
    },
    '/about': {
      en: {
        title: pageTitle('About'),
        description:
          'Meet the team behind Pär by Datomer. We build local-first, private AI companions that keep your memory and data on your own device.',
      },
      sv: {
        title: pageTitle('Om oss'),
        description:
          'Lär känna teamet bakom Pär by Datomer. Vi bygger lokala, privata AI-kamrater som håller ditt minne och dina data på din egen enhet.',
      },
      de: {
        title: pageTitle('Über uns'),
        description:
          'Lerne das Team hinter Pär by Datomer kennen. Wir entwickeln lokale, private KI-Begleiter, die dein Gedächtnis und deine Daten auf deinem eigenen Gerät behalten.',
      },
    },
    '/contact': {
      en: {
        title: pageTitle('Contact'),
        description:
          'Get in touch with the Pär by Datomer team. Questions, feedback, press, partnerships, and support.',
      },
      sv: {
        title: pageTitle('Kontakt'),
        description:
          'Kontakta teamet bakom Pär by Datomer. Frågor, feedback, press, samarbeten och support.',
      },
      de: {
        title: pageTitle('Kontakt'),
        description:
          'Kontaktiere das Team von Pär by Datomer. Fragen, Feedback, Presse, Partnerschaften und Support.',
      },
    },
    '/get-started': {
      en: {
        title: pageTitle('Get Started'),
        description:
          'Install Pär on your Mac and start chatting privately in about 10 minutes. Step-by-step setup, model downloads, and troubleshooting.',
      },
      sv: {
        title: pageTitle('Kom igång'),
        description:
          'Installera Pär på din Mac och börja chatta privat på cirka 10 minuter. Steg-för-steg-guide, modellnedladdningar och felsökning.',
      },
    },
    '/blog': {
      en: {
        title: pageTitle('Blog'),
        description:
          'News, updates, and thoughts on local-first AI, privacy, and the future of personal computing from Pär by Datomer.',
      },
      sv: {
        title: pageTitle('Blogg'),
        description:
          'Nyheter, uppdateringar och tankar om lokal AI, integritet och personlig datoranvändning från Pär by Datomer.',
      },
      de: {
        title: pageTitle('Blog'),
        description:
          'Neuigkeiten, Updates und Gedanken zu lokaler KI, Datenschutz und der Zukunft persönlicher Computer von Pär by Datomer.',
      },
    },
    '/press': {
      en: {
        title: pageTitle('Press Kit'),
        description:
          'Press kit for Pär by Datomer. Download logos, screenshots, and company facts for journalists and reviewers.',
      },
      sv: {
        title: pageTitle('Presskit'),
        description:
          'Presskit för Pär by Datomer. Ladda ner logotyper, skärmdumpar och företagsfakta för journalister och recensenter.',
      },
      de: {
        title: pageTitle('Pressekit'),
        description:
          'Pressekit für Pär by Datomer. Logos, Screenshots und Unternehmensfakten für Journalisten und Rezensenten.',
      },
    },
    '/privacy': {
      en: {
        title: pageTitle('Privacy Policy'),
        description:
          'Pär by Datomer privacy policy. Learn how we handle your data, local-first storage, encryption, and your rights.',
      },
      sv: {
        title: pageTitle('Integritetspolicy'),
        description:
          'Integritetspolicy för Pär by Datomer. Lär dig hur vi hanterar dina data, lokal lagring, kryptering och dina rättigheter.',
      },
      de: {
        title: pageTitle('Datenschutzerklärung'),
        description:
          'Datenschutzerklärung von Pär by Datomer. Erfahre, wie wir deine Daten, lokale Speicherung, Verschlüsselung und deine Rechte handhaben.',
      },
    },
    '/terms': {
      en: {
        title: pageTitle('Terms of Service'),
        description:
          'Pär by Datomer terms of service. Read the terms governing use of our website, software, and subscriptions.',
      },
      sv: {
        title: pageTitle('Användarvillkor'),
        description:
          'Användarvillkor för Pär by Datomer. Läs villkoren för användning av vår webbplats, programvara och prenumerationer.',
      },
      de: {
        title: pageTitle('Nutzungsbedingungen'),
        description:
          'Nutzungsbedingungen von Pär by Datomer. Lies die Bedingungen für die Nutzung unserer Website, Software und Abonnements.',
      },
    },
    '/cookies': {
      en: {
        title: pageTitle('Cookie Policy'),
        description:
          'Pär by Datomer cookie policy. Learn about the cookies and analytics tools we use on our website.',
      },
      sv: {
        title: pageTitle('Cookiepolicy'),
        description:
          'Cookiepolicy för Pär by Datomer. Läs om vilka cookies och analysverktyg vi använder på vår webbplats.',
      },
      de: {
        title: pageTitle('Cookie-Richtlinie'),
        description:
          'Cookie-Richtlinie von Pär by Datomer. Erfahre mehr über die Cookies und Analyse-Tools, die wir auf unserer Website verwenden.',
      },
    },
    '/models': {
      en: {
        title: pageTitle('Models & Licenses'),
        description:
          'Open-source AI models used by Pär: Qwen, Mistral, Phi, Nomic, and optional Ollama models. Authors, licenses, and sources.',
      },
      sv: {
        title: pageTitle('Modeller & Licenser'),
        description:
          'AI-modeller med öppen källkod som används av Pär: Qwen, Mistral, Phi, Nomic och valfria Ollama-modeller. Upphovsmän, licenser och källor.',
      },
      de: {
        title: pageTitle('Modelle & Lizenzen'),
        description:
          'Open-Source-KI-Modelle, die von Pär verwendet werden: Qwen, Mistral, Phi, Nomic und optionale Ollama-Modelle. Autoren, Lizenzen und Quellen.',
      },
    },
    '/payment-success': {
      en: {
        title: pageTitle('Payment Successful'),
        description:
          'Thank you for your purchase. Your Pär by Datomer subscription is confirmed.',
      },
      sv: {
        title: pageTitle('Betalning genomförd'),
        description:
          'Tack för ditt köp. Din Pär by Datomer-prenumeration är bekräftad.',
      },
      de: {
        title: pageTitle('Zahlung erfolgreich'),
        description:
          'Danke für deinen Kauf. Dein Pär by Datomer-Abonnement ist bestätigt.',
      },
    },
  }

  const siteUrl = site === 'company' ? COMPANY_URL : SITE_URL
  const data = site === 'company' ? companyMeta(basePath, lang) : routes[basePath]?.[lang] ?? {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  }

  const seoPath = site === 'company' ? companyCanonicalPath(basePath) : basePath
  const canonical = `${siteUrl}${seoPath}`
  const localizedCanonical = lang === 'en' ? canonical : `${canonical}?lang=${lang}`
  const ogUrl = localizedCanonical

  return {
    ...data,
    lang,
    canonical: localizedCanonical,
    ogUrl,
    pathname: seoPath,
  }
}

function hreflangLinks(pathname, siteUrl = SITE_URL) {
  const base = pathname
  const urls = [
    { hrefLang: 'en', href: `${siteUrl}${base}` },
    { hrefLang: 'sv', href: `${siteUrl}${base}?lang=sv` },
    { hrefLang: 'x-default', href: `${siteUrl}${base}` },
  ]
  return urls
    .map(
      (u) =>
        `    <link rel="alternate" hreflang="${u.hrefLang}" href="${u.href}" />`
    )
    .join('\n')
}

function organizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${COMPANY_URL}/#organization`,
    name: COMPANY_FACTS.name,
    url: COMPANY_URL,
    slogan: COMPANY_FACTS.slogan,
    knowsAbout: COMPANY_FACTS.services,
    logo: `${COMPANY_URL}/datomer-logo.png`,
    email: 'hello@datomer.eu',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Nyskogavägen 11',
      postalCode: '123 64',
      addressLocality: 'Farsta',
      addressCountry: 'SE',
    },
    sameAs: [
      'https://github.com/DatomerAB',
      'https://www.linkedin.com/company/35694620/',
    ],
  }
  return `    <script type="application/ld+json">${safeJson(data)}</script>`
}

function softwareJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Pär',
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'macOS',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    author: {
      '@type': 'Organization',
      name: 'Datomer AB',
    },
  }
  return `    <script type="application/ld+json">${safeJson(data)}</script>`
}

const COMPANY_ROUTES = ['/', '/about', '/contact', '/privacy', '/terms', '/cookies']
const PRODUCT_ROUTES = [...COMPANY_ROUTES, ...PRODUCT_PATHS]

export async function onRequest(context) {
  const { request, next, env } = context
  const url = new URL(request.url)
  const site = siteForUrl(url)
  const siteUrl = site === 'company' ? COMPANY_URL : PRODUCT_URL
  const preview = !['datomer.eu', 'www.datomer.eu', 'par.datomer.eu'].includes(url.hostname)
  const destination = legacyProductDestination(url)
  // Generated variants are internal assets, not additional indexable pages.
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
    // The company /about route duplicates the home page, so only the product site lists it.
    const paths = [...(site === 'company' ? ['/', '/contact', '/privacy', '/terms', '/cookies'] : ['/', '/about', '/contact', '/privacy', '/terms', '/cookies']),
      ...(site === 'product' ? PRODUCT_PATHS.filter(path => !['/beta', '/payment-success'].includes(path)) : [])]
    const entries = paths.map(path => `<url><loc>${siteUrl}${path}</loc>${
      ['en', 'sv', 'x-default'].map(lang =>
        `<xhtml:link rel="alternate" hreflang="${lang}" href="${siteUrl}${path}${lang === 'sv' ? '?lang=sv' : ''}" />`
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

  // Only rewrite HTML document responses. Skip API routes, Functions, and
  // static assets by file extension. The actual content-type check below
  // ensures we only transform HTML.
  const isAsset =
    /\.(png|jpg|jpeg|gif|svg|webp|ico|css|js|json|xml|txt|pdf|zip|woff2?|ttf|eot|otf|mp4|webm|ogg)$/i.test(
      url.pathname
    )
  const isApi = url.pathname.startsWith('/api/')

  if (isAsset || isApi || request.method !== 'GET') {
    return next()
  }

  let res
  let prerendered = false
  if (url.pathname === '/' && env?.ASSETS && env.PRERENDER_HOMEPAGES !== 'false') {
    const language = url.searchParams.get('lang') === 'sv' ? 'sv' : 'en'
    const assetUrl = new URL(`/__prerender/${site}/${language}/index.html`, url)
    const candidate = await env.ASSETS.fetch(new Request(assetUrl, {
      headers: { Accept: 'text/html' },
    }))
    const generatedHtml = await candidate.clone().text()
    if (!candidate.ok || !candidate.headers.get('content-type')?.includes('text/html')
      || !generatedHtml.includes(`data-prerendered="${site}"`)
      || !generatedHtml.includes(`data-language="${language}"`)) {
      console.error(`[prerender] Missing homepage asset: ${site}/${language}`)
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
  const contentType = res.headers.get('content-type') || ''
  if (!contentType.includes('text/html')) {
    return res
  }

  const html = await res.text()
  const meta = metaForRoute(url.pathname, url.searchParams, site)
  const normalizedPath = url.pathname.replace(/\/$/, '') || '/'
  // The SPA shell answers every path with 200; report unknown paths as 404 so they never get indexed.
  const notFound = !(site === 'company' ? COMPANY_ROUTES : PRODUCT_ROUTES).includes(normalizedPath)
  const noindex = preview || notFound
  const siteName = site === 'company' ? 'Datomer AB' : 'Pär by Datomer'
  const image = `${siteUrl}/${site === 'company' ? 'og-image-datomer.png' : 'og-image-aurora.png'}`

  const seoInject = [
    `    <link rel="canonical" href="${escapeAttr(meta.canonical)}" />`,
    hreflangLinks(meta.pathname, siteUrl),
    noindex
      ? '    <meta name="robots" content="noindex, nofollow" />'
      : '    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />',
    ``,
    `    <meta property="og:site_name" content="${siteName}" />`,
    `    <meta property="og:title" content="${escapeAttr(meta.title)}" />`,
    `    <meta property="og:description" content="${escapeAttr(meta.description)}" />`,
    `    <meta property="og:type" content="website" />`,
    `    <meta property="og:url" content="${escapeAttr(meta.ogUrl)}" />`,
    `    <meta property="og:image" content="${image}" />`,
    `    <meta property="og:locale" content="${LOCALE[meta.lang]}" />`,
    ``,
    `    <meta name="twitter:card" content="summary_large_image" />`,
    `    <meta name="twitter:title" content="${escapeAttr(meta.title)}" />`,
    `    <meta name="twitter:description" content="${escapeAttr(meta.description)}" />`,
    `    <meta name="twitter:image" content="${image}" />`,
    ``,
    prerendered ? '' : organizationJsonLd(),
    !prerendered && site === 'product' ? softwareJsonLd() : '',
  ].join('\n')

  // Preserve the original <head> contents (Vite scripts, styles, GA) while
  // replacing title/description/html-lang and removing/overwriting SEO tags.
  // Keep the hydrated body intact, including SVG titles and React-owned JSON-LD.
  const headEnd = html.search(/<\/head>/i)
  const headLength = headEnd < 0 ? html.length : headEnd + '</head>'.length
  let newHtml = html.slice(0, headLength)
    .replace(/<html[^>]*>/i, `<html lang="${meta.lang}">`)
    .replace(/(<link rel="(?:icon|apple-touch-icon)"[^>]*href=")[^"]+(")/gi, `$1/${site === 'company' ? 'datomer-logo.png?v=20261010' : 'par-logo.png'}$2`)
    .replace(/<title>.*?<\/title>/i, () => `<title>${escapeAttr(meta.title)}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"[^>]*>/i,
      () => `<meta name="description" content="${escapeAttr(meta.description)}" />`
    )
    // Remove existing canonical, hreflang, OG, Twitter, and JSON-LD tags so
    // we don't produce duplicates when a crawler reads the response.
    .replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>\s*/gi, '')
    .replace(/<link\s+rel="alternate"\s+hreflang="[^"]*"\s+href="[^"]*"\s*\/?>\s*/gi, '')
    .replace(/<meta\s+property="og:[^"]+"\s+content="[^"]*"\s*\/?>\s*/gi, '')
    .replace(/<meta\s+name="twitter:[^"]+"\s+content="[^"]*"\s*\/?>\s*/gi, '')
    .replace(/<script\s+type="application\/ld\+json">[\s\S]*?<\/script>\s*/gi, '')
    .replace(/<meta\s+name="twitter:card"\s+content="[^"]*"\s*\/?>\s*/gi, '')
    // Insert the fresh SEO block before </head>.
    .replace(/(<\/head>)/i, `\n${seoInject}\n  $1`)
  newHtml += html.slice(headLength)

  return new Response(newHtml, {
    status: notFound ? 404 : res.status,
    statusText: notFound ? 'Not Found' : res.statusText,
    headers: {
      ...Object.fromEntries([...res.headers.entries()].filter(([name]) =>
        !['content-length', 'content-encoding', 'etag', 'last-modified'].includes(name))),
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=0, must-revalidate',
    },
  })
}

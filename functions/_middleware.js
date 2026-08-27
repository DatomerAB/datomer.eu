// Cloudflare Pages middleware: inject per-route static meta tags into the SPA
// HTML shell. This ensures social crawlers and search engines that do not
// execute JavaScript still see correct titles, descriptions, canonical URLs,
// Open Graph, Twitter Cards, hreflang links, and JSON-LD for each route.

const SITE_URL = 'https://datomer.eu'
const DEFAULT_TITLE = 'Pär by Datomer — Your AI. On your device.'
const DEFAULT_DESCRIPTION =
  'Pär is the personal AI companion that actually remembers you. Local-first, private by design, running on your own hardware with GGUF or Ollama models.'

const LOCALE = {
  en: 'en_US',
  sv: 'sv_SE',
  de: 'de_DE',
}

function pageTitle(title) {
  return title === DEFAULT_TITLE ? title : `${title} — Pär by Datomer`
}

function metaForRoute(pathname, searchParams) {
  const lang = ['en', 'sv', 'de'].includes(searchParams.get('lang'))
    ? searchParams.get('lang')
    : 'en'
  const basePath = pathname === '' ? '/' : pathname

  const routes = {
    '/': {
      en: {
        title: DEFAULT_TITLE,
        description: DEFAULT_DESCRIPTION,
      },
      sv: {
        title: 'Pär by Datomer — Din AI. På din enhet.',
        description:
          'Pär är den personliga AI-kompisen som verkligen kommer ihåg dig. Lokal först, privat av design, och körs på din egen hårdvara med GGUF- eller Ollama-modeller.',
      },
      de: {
        title: 'Pär by Datomer — Deine KI. Auf deinem Gerät.',
        description:
          'Pär ist der persönliche KI-Begleiter, der sich wirklich an dich erinnert. Lokal zuerst, privat von Grund auf, auf deiner eigenen Hardware mit GGUF- oder Ollama-Modellen.',
      },
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

  const data = routes[basePath]?.[lang] ?? {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  }

  const canonicalPath = basePath === '/' ? '' : basePath
  const canonical = `${SITE_URL}${canonicalPath}`
  const localizedCanonical = lang === 'en' ? canonical : `${canonical}${canonicalPath.includes('?') ? '&' : '?'}lang=${lang}`
  const ogUrl = lang === 'en' ? canonical : `${SITE_URL}${canonicalPath}?lang=${lang}`

  return {
    ...data,
    lang,
    canonical: localizedCanonical,
    ogUrl,
    pathname: basePath,
  }
}

function hreflangLinks(pathname) {
  const base = pathname === '/' ? '' : pathname
  const urls = [
    { hrefLang: 'en', href: `${SITE_URL}${base}` },
    { hrefLang: 'sv', href: `${SITE_URL}${base}?lang=sv` },
    { hrefLang: 'de', href: `${SITE_URL}${base}?lang=de` },
    { hrefLang: 'x-default', href: `${SITE_URL}${base}` },
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
    name: 'Datomer AB',
    url: SITE_URL,
    logo: `${SITE_URL}/par-logo.png`,
    email: 'hello@datomer.eu',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Nyskogavägen 11',
      postalCode: '123 64',
      addressLocality: 'Farsta',
      addressCountry: 'SE',
    },
    sameAs: ['https://github.com/DatomerAB'],
  }
  return `    <script type="application/ld+json">${JSON.stringify(data)}</script>`
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
  return `    <script type="application/ld+json">${JSON.stringify(data)}</script>`
}

export async function onRequest(context) {
  const { request, env, next } = context
  const url = new URL(request.url)

  // Only rewrite HTML document requests (ignore static files, API, Functions)
  const accept = request.headers.get('accept') || ''
  const isHtmlRequest = accept.includes('text/html') || url.pathname === '/'
  const isAsset =
    /\.(png|jpg|jpeg|gif|svg|webp|ico|css|js|json|xml|txt|pdf|zip|woff2?|ttf|eot|otf|mp4|webm|ogg)$/i.test(
      url.pathname
    )
  const isApi = url.pathname.startsWith('/api/')

  if (!isHtmlRequest || isAsset || isApi || request.method !== 'GET') {
    return next()
  }

  const res = await next()
  const contentType = res.headers.get('content-type') || ''
  if (!contentType.includes('text/html')) {
    return res
  }

  const html = await res.text()
  const meta = metaForRoute(url.pathname, url.searchParams)

  const seoInject = [
    `    <link rel="canonical" href="${meta.canonical}" />`,
    hreflangLinks(meta.pathname),
    ``,
    `    <meta property="og:site_name" content="Pär by Datomer" />`,
    `    <meta property="og:title" content="${meta.title}" />`,
    `    <meta property="og:description" content="${meta.description}" />`,
    `    <meta property="og:type" content="website" />`,
    `    <meta property="og:url" content="${meta.ogUrl}" />`,
    `    <meta property="og:image" content="${SITE_URL}/og-image.png" />`,
    `    <meta property="og:locale" content="${LOCALE[meta.lang]}" />`,
    ``,
    `    <meta name="twitter:card" content="summary_large_image" />`,
    `    <meta name="twitter:title" content="${meta.title}" />`,
    `    <meta name="twitter:description" content="${meta.description}" />`,
    `    <meta name="twitter:image" content="${SITE_URL}/og-image.png" />`,
    ``,
    organizationJsonLd(),
    softwareJsonLd(),
  ].join('\n')

  // Preserve the original <head> contents (Vite scripts, styles, GA) while
  // replacing title/description/html-lang and removing/overwriting SEO tags.
  let newHtml = html
    .replace(/<html[^>]*>/i, `<html lang="${meta.lang}">`)
    .replace(/<title>.*?<\/title>/i, `<title>${meta.title}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="description" content="${meta.description}" />`
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

  return new Response(newHtml, {
    status: res.status,
    statusText: res.statusText,
    headers: {
      ...Object.fromEntries(res.headers.entries()),
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=0, must-revalidate',
    },
  })
}

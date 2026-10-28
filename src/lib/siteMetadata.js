import { COMPANY_URL, PRODUCT_URL, PRODUCT_PATHS, siteForUrl } from './site.js'
import { companyMeta, companyCanonicalPath } from './companyMeta.js'
import { PRODUCT_DESCRIPTIONS, PRODUCT_TITLES, COMPANY_FACTS } from './seoMeta.js'
import { campaigns } from '../content/campaigns.js'

const SITE_URL = PRODUCT_URL
const DEFAULT_TITLE = PRODUCT_TITLES.en
const DEFAULT_DESCRIPTION = PRODUCT_DESCRIPTIONS.en

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
        title: pageTitle('Changelog & Updates'),
        description:
          'The latest Pär product updates, release notes, beta news, and launch milestones.',
      },
      sv: {
        title: pageTitle('Ändringslogg och uppdateringar'),
        description:
          'De senaste uppdateringarna av Pär, versionsnyheter, betanyheter och lanseringsmilstolpar.',
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
  return {
    ...data,
    lang,
    canonical: localizedCanonical,
    pathname: seoPath,
  }
}

export function alternateLinks(pathname, siteUrl) {
  return [
    { hrefLang: 'en', href: `${siteUrl}${pathname}` },
    { hrefLang: 'sv', href: `${siteUrl}${pathname}?lang=sv` },
    { hrefLang: 'x-default', href: `${siteUrl}${pathname}` },
  ]
}

export function organizationData() {
  return {
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
}

export function softwareData(lang = 'en') {
  return {
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
    description: PRODUCT_DESCRIPTIONS[lang] || DEFAULT_DESCRIPTION,
    url: SITE_URL,
    author: {
      '@type': 'Organization',
      name: 'Datomer AB',
    },
  }
}

const COMPANY_ROUTES = ['/', '/about', '/contact', '/privacy', '/terms', '/cookies']
const PRODUCT_ROUTES = [...COMPANY_ROUTES, ...PRODUCT_PATHS]

export function sitemapPaths(site) {
  return (site === 'company' ? COMPANY_ROUTES : PRODUCT_ROUTES)
    .filter(path => !['/beta', '/payment-success'].includes(path) && !(site === 'company' && path === '/about'))
}

export function getSiteMetadata(url, language) {
  const site = siteForUrl(url)
  const siteUrl = site === 'company' ? COMPANY_URL : PRODUCT_URL
  const preview = !['datomer.eu', 'www.datomer.eu', 'par.datomer.eu'].includes(url.hostname)
  const normalizedPath = url.pathname.replace(/\/$/, '') || '/'
  const search = new URLSearchParams(url.search)
  if (language) search.set('lang', language)
  const meta = metaForRoute(normalizedPath, search, site)
  const campaign = site === 'product' && normalizedPath.startsWith('/campaigns/')
    ? campaigns[normalizedPath.slice('/campaigns/'.length)]?.[meta.lang] : null
  const notFound = !campaign && !(site === 'company' ? COMPANY_ROUTES : PRODUCT_ROUTES).includes(normalizedPath)
  return {
    ...meta,
    ...(campaign ? { title: campaign.title, description: campaign.description } : {}),
    site,
    siteUrl,
    preview,
    notFound,
    robots: preview || notFound || campaign || normalizedPath === '/payment-success'
      ? 'noindex, nofollow'
      : 'index, follow, max-image-preview:large, max-snippet:-1',
    siteName: site === 'company' ? 'Datomer AB' : 'Pär by Datomer',
    image: `${siteUrl}/${site === 'company' ? 'og-image-datomer.png' : 'og-image-aurora.png'}`,
    icon: site === 'company' ? '/datomer-logo.png?v=20261010' : '/par-logo.png',
    locale: meta.lang === 'sv' ? 'sv_SE' : 'en_US',
    alternates: alternateLinks(meta.pathname, siteUrl),
    structuredData: [organizationData(), ...(site === 'product' ? [softwareData(meta.lang)] : [])],
  }
}

import { Helmet } from 'react-helmet-async'

const SITE_URL = 'https://datomer.eu'
const DEFAULT_TITLE = 'Pär by Datomer — Your AI. On your device.'
const DEFAULT_DESCRIPTION =
  'Pär is the personal AI companion that actually remembers you. Local-first, private by design, running on your own hardware with GGUF or Ollama models.'
const DEFAULT_IMAGE = `${SITE_URL}/og-image-aurora.png`

export function SEO({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  pathname = '',
  image = DEFAULT_IMAGE,
  type = 'website',
  noindex = false,
  lang = 'en',
  jsonLd = null,
}) {
  const url = pathname ? `${SITE_URL}${pathname}` : SITE_URL
  const pageTitle = title === DEFAULT_TITLE ? title : `${title} — Pär by Datomer`

  return (
    <Helmet>
      <html lang={lang} />
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:site_name" content="Pär by Datomer" />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content={lang === 'sv' ? 'sv_SE' : lang === 'de' ? 'de_DE' : 'en_US'} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  )
}

export function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Datomer AB',
    url: SITE_URL,
    logo: `${SITE_URL}/datomer-linkedin-logo.png`,
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
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  )
}

export function SoftwareApplicationJsonLd() {
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
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  )
}

export function HreflangLinks({ pathname }) {
  if (!pathname) return null
  const full = `${SITE_URL}${pathname}`
  return (
    <Helmet
      link={[
        { rel: 'alternate', hrefLang: 'en', href: full },
        { rel: 'alternate', hrefLang: 'sv', href: `${full}?lang=sv` },
        { rel: 'alternate', hrefLang: 'de', href: `${full}?lang=de` },
        { rel: 'alternate', hrefLang: 'x-default', href: full },
      ]}
    />
  )
}

export function FAQPageJsonLd({ faqs }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(data)}</script>
    </Helmet>
  )
}

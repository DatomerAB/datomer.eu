import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'
import { useLanguage } from '../i18n/useLanguage.js'
import { COMPANY_URL, PRODUCT_URL, siteForUrl } from '../lib/site.js'
import { companyMeta } from '../lib/companyMeta.js'
import { companyContent } from '../content/company.js'
import { PRODUCT_DESCRIPTIONS, PRODUCT_TITLES } from '../lib/seoMeta.js'
import { companyCanonicalPath } from '../lib/companyMeta.js'
import { OrganizationJsonLd, SoftwareApplicationJsonLd } from './SEO.jsx'

export function SiteMetadata() {
  const { pathname } = useLocation()
  const { lang, t } = useLanguage()
  const url = new URL(window.location.href)
  const company = siteForUrl(url) === 'company'
  const origin = company ? COMPANY_URL : PRODUCT_URL
  const canonicalPath = company ? companyCanonicalPath(pathname) : pathname
  const canonical = `${origin}${canonicalPath}${lang === 'sv' ? '?lang=sv' : ''}`
  const labelKey = {
    '/about': 'about.title', '/contact': 'contact.title', '/get-started': 'getStarted.title',
    '/blog': 'changelog.title', '/press': 'press.title', '/models': 'modelAttribution.title',
    '/privacy': 'privacy.title', '/terms': 'terms.title', '/cookies': 'cookies.title',
    '/payment-success': 'payment.successTitle',
  }[pathname]
  const title = company ? companyMeta(pathname, lang).title : labelKey
    ? `${t(labelKey)} — Pär by Datomer`
    : PRODUCT_TITLES[lang] ?? PRODUCT_TITLES.en
  const description = company ? companyContent[lang].description : (!labelKey && PRODUCT_DESCRIPTIONS[lang]) || t('hero.lede')
  const image = `${origin}/${company ? 'og-image-datomer.png' : 'og-image-aurora.png'}`
  const preview = !['datomer.eu', 'www.datomer.eu', 'par.datomer.eu'].includes(url.hostname)
  const ownsMetadata = company || !['/press', '/blog'].includes(pathname)
  return <>
    <OrganizationJsonLd />
    {!company && <SoftwareApplicationJsonLd />}
    <Helmet>
      <link rel="icon" href={company ? '/datomer-logo.png?v=20261010' : '/par-logo.png'} />
      <link rel="apple-touch-icon" href={company ? '/datomer-logo.png?v=20261010' : '/par-logo.png'} />
    </Helmet>
    {preview && <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>}
    {ownsMetadata && <Helmet>
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={canonical} />
    <link rel="alternate" hrefLang="en" href={`${origin}${canonicalPath}`} />
    <link rel="alternate" hrefLang="sv" href={`${origin}${canonicalPath}?lang=sv`} />
    <link rel="alternate" hrefLang="x-default" href={`${origin}${canonicalPath}`} />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content={company ? 'Datomer AB' : 'Pär by Datomer'} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonical} />
    <meta property="og:image" content={image} />
    <meta property="og:locale" content={lang === 'sv' ? 'sv_SE' : 'en_US'} />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={image} />
  </Helmet>}</>
}

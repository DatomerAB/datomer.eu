import { Helmet } from 'react-helmet-async'
import { useLanguage } from '../i18n/useLanguage.js'
import { getSiteMetadata } from '../lib/siteMetadata.js'
import { safeJson } from '../lib/seoMeta.js'
import { useSiteUrl } from '../lib/RenderContext.jsx'

export function SiteMetadata() {
  const { lang } = useLanguage()
  const meta = getSiteMetadata(useSiteUrl(), lang)
  return <Helmet>
    <html lang={meta.lang} />
    <title>{meta.title}</title>
    <meta name="description" content={meta.description} />
    <meta name="robots" content={meta.robots} />
    <link rel="icon" href={meta.icon} />
    <link rel="apple-touch-icon" href={meta.icon} />
    <link rel="canonical" href={meta.canonical} />
    {meta.alternates.map(({ hrefLang, href }) =>
      <link key={hrefLang} rel="alternate" hrefLang={hrefLang} href={href} />)}
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content={meta.siteName} />
    <meta property="og:title" content={meta.title} />
    <meta property="og:description" content={meta.description} />
    <meta property="og:url" content={meta.canonical} />
    <meta property="og:image" content={meta.image} />
    <meta property="og:locale" content={meta.locale} />
    <meta name="twitter:title" content={meta.title} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:description" content={meta.description} />
    <meta name="twitter:image" content={meta.image} />
    {meta.structuredData.map(data =>
      <script key={data['@type']} type="application/ld+json">{safeJson(data)}</script>)}
  </Helmet>
}

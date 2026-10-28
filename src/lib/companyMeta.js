import { companyContent } from '../content/company.js'

export function companyMeta(pathname, lang = 'en') {
  const c = companyContent[lang]
  const label = {
    '/contact': c.nav.contact, '/about': c.nav.about,
    '/privacy': c.privacy, '/terms': c.terms, '/cookies': c.cookies,
  }[pathname]
  return {
    title: label ? `${label} — Datomer AB` : c.title,
    description: c.description,
  }
}

// The company /about route renders the home page, so it points search engines at the home URL.
export function companyCanonicalPath(pathname) {
  return pathname === '/about' ? '/' : pathname
}

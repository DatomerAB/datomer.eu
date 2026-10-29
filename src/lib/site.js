export const COMPANY_URL = 'https://datomer.eu'
export const PRODUCT_URL = 'https://par.datomer.eu'
export const CONTACT_EMAILS = { company: 'hello@datomer.eu', product: 'par@datomer.eu' }
export const PRODUCT_PATHS = ['/get-started', '/blog', '/press', '/models', '/payment-success', '/beta', '/purpose']
export const PRODUCT_HASHES = ['#download', '#product', '#features', '#pricing', '#faq']

export function isLocalHost(hostname) {
  return ['localhost', '127.0.0.1', '[::1]'].includes(hostname)
}

export function siteForUrl(url) {
  if (['datomer.eu', 'www.datomer.eu'].includes(url.hostname)) return 'company'
  if (url.hostname === 'par.datomer.eu') return 'product'
  // Two explicit local ports keep navigation and language changes on the same site.
  if (isLocalHost(url.hostname) && ['5173', '4173'].includes(url.port)) return 'company'
  return 'product'
}

export function siteLinks(url) {
  if (isLocalHost(url.hostname)) {
    const company = new URL(url.origin)
    const product = new URL(url.origin)
    const preview = ['4173', '4174'].includes(url.port)
    company.port = preview ? '4173' : '5173'
    product.port = preview ? '4174' : '5174'
    return { company: company.origin, product: product.origin }
  }
  return { company: COMPANY_URL, product: PRODUCT_URL }
}

export function legacyProductDestination(url) {
  if (siteForUrl(url) !== 'company') return null
  const path = url.pathname.replace(/\/$/, '') || '/'
  if (PRODUCT_PATHS.includes(path) || (path === '/' && PRODUCT_HASHES.includes(url.hash))) {
    return `${siteLinks(url).product}${path === '/beta' ? '/get-started' : url.pathname}${url.search}${url.hash}`
  }
  return null
}

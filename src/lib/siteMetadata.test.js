import { describe, expect, it } from 'vitest'
import { alternateLinks, getSiteMetadata, sitemapPaths } from './siteMetadata.js'
import { safeJson } from './seoMeta.js'

describe('shared discovery contracts', () => {
  it('canonicalizes company aliases and trailing slashes without campaign or private parameters', () => {
    const meta = getSiteMetadata(new URL('https://datomer.eu/about/?lang=sv&utm_source=linkedin&email=private'))
    expect(meta.canonical).toBe('https://datomer.eu/?lang=sv')
    expect(meta.title).toBe('Om oss — Datomer AB')
    expect(meta.structuredData.map(data => data['@type'])).toEqual(['Organization'])
    expect(JSON.stringify(meta)).not.toContain('private')
    expect(JSON.stringify(meta)).not.toContain('linkedin&')
  })

  it('preserves product identity, localizes press/changelog and software description', () => {
    const press = getSiteMetadata(new URL('https://par.datomer.eu/press/?lang=sv'))
    expect(press.title).toBe('Presskit — Pär by Datomer')
    expect(press.canonical).toBe('https://par.datomer.eu/press?lang=sv')
    expect(press.locale).toBe('sv_SE')
    expect(press.structuredData.map(data => data['@type'])).toEqual(['Organization', 'SoftwareApplication'])
    expect(press.structuredData[1].description).toContain('Pär är')
    const blog = getSiteMetadata(new URL('https://par.datomer.eu/blog'))
    expect(blog.title).toBe('Changelog & Updates — Pär by Datomer')
  })

  it.each(['https://par.datomer.eu/payment-success?session_id=private', 'https://par.datomer.eu/missing', 'https://preview.pages.dev/'])('keeps %s out of search indexes', address => {
    const meta = getSiteMetadata(new URL(address))
    expect(meta.robots).toBe('noindex, nofollow')
    expect(meta.canonical).not.toContain('session_id')
  })

  it.each(['company', 'product'])('lists only canonical public %s pages in the sitemap', site => {
    const paths = sitemapPaths(site)
    expect(new Set(paths).size).toBe(paths.length)
    expect(paths).toContain('/')
    expect(paths).not.toContain('/payment-success')
    expect(paths).not.toContain('/beta')
    expect(paths.includes('/about')).toBe(site === 'product')
    expect(paths.includes('/press')).toBe(site === 'product')
    for (const path of paths) {
      const origin = site === 'company' ? 'https://datomer.eu' : 'https://par.datomer.eu'
      expect(alternateLinks(path, origin).map(link => link.hrefLang)).toEqual(['en', 'sv', 'x-default'])
      expect(getSiteMetadata(new URL(`${origin}${path}`)).robots).toContain('index, follow')
    }
  })

  it('does not re-enable unsupported language variants', () => {
    const meta = getSiteMetadata(new URL('https://par.datomer.eu/?lang=de'))
    expect(meta.lang).toBe('en')
    expect(meta.canonical).toBe('https://par.datomer.eu/')
    expect(meta.alternates).not.toContainEqual(expect.objectContaining({ hrefLang: 'de' }))
  })

  it('keeps serialized structured data safe inside HTML scripts', () => {
    expect(safeJson({ text: '</script><!--' })).not.toContain('<')
    expect(JSON.parse(safeJson({ text: '</script><!--' })).text).toBe('</script><!--')
  })
})

// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import { renderHomepage } from './entry-prerender.jsx'

describe('homepage rendering without browser globals', () => {
  it.each([
    ['https://datomer.eu', 'en', 'Put your data to work.', 'Data governance'],
    ['https://datomer.eu', 'sv', 'Gör din data användbar.', 'Datastyrning'],
    ['https://par.datomer.eu', 'en', 'Pär', 'AI on Your Device'],
    ['https://par.datomer.eu', 'sv', 'Pär', 'AI På Din Enhet'],
  ])('renders existing %s/%s content in HTML', (origin, language, headline, text) => {
    const html = renderHomepage(origin, language)
    expect(html).toContain(headline)
    expect(html).toContain(text)
    expect(html.match(/<h1(?:\s|>)/g)).toHaveLength(1)
    expect(html.match(/<main(?:\s|>)/g)).toHaveLength(1)
    expect(html).toContain('<footer')
    expect(html).not.toContain('cookie-banner')
    expect(html).not.toContain('utm_')
    expect(html).not.toContain('undefined')
    expect(html).not.toContain('<meta ')
    expect(html).not.toContain('rel="canonical"')
    if (origin === 'https://par.datomer.eu') expect(html).toContain('<title>Pär</title>')
    const otherOrigin = origin === 'https://datomer.eu' ? 'https://par.datomer.eu' : 'https://datomer.eu'
    expect(html).toContain(`href="${otherOrigin}/${language === 'sv' ? '?lang=sv' : ''}"`)
  })

  it('does not make network requests or leak one render into another', () => {
    const fetch = vi.spyOn(globalThis, 'fetch')
    const company = renderHomepage('https://datomer.eu', 'en')
    renderHomepage('https://par.datomer.eu', 'sv')
    expect(renderHomepage('https://datomer.eu', 'en')).toBe(company)
    expect(company).not.toContain('Vår vision')
    expect(fetch).not.toHaveBeenCalled()
    fetch.mockRestore()
  })
})

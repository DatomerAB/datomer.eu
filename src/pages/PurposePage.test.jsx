import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App.jsx'
import { LanguageProvider } from '../i18n/LanguageProvider.jsx'
import { purposePage } from '../content/purposePage.js'
import { productPurpose } from '../content/productPurpose.js'
import { getSiteMetadata, sitemapPaths } from '../lib/siteMetadata.js'

afterEach(() => vi.unstubAllGlobals())

describe('Pär purpose page', () => {
  it.each(['en', 'sv'])('shows the vision, mission and supplied objectives with clear qualifications in %s', lang => {
    vi.stubGlobal('localStorage', { getItem: vi.fn(() => null), setItem: vi.fn() })
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false })))
    render(<MemoryRouter initialEntries={[`/about?lang=${lang}`]}>
      <LanguageProvider><App /></LanguageProvider>
    </MemoryRouter>)
    fireEvent.click(screen.getByRole('link', { name: `${purposePage[lang].nav} →` }))
    const main = within(screen.getByRole('main'))
    expect(main.getByRole('heading', { level: 1, name: purposePage[lang].heading })).toBeVisible()
    const belief = main.getByRole('region', { name: purposePage[lang].beliefTitle })
    expect(within(belief).getByText(purposePage[lang].belief)).toBeVisible()
    expect(main.getByText(productPurpose[lang].vision)).toBeVisible()
    expect(main.getByText(productPurpose[lang].mission)).toBeVisible()
    for (const [, text] of purposePage[lang].objectives) {
      expect(main.getByText((_, node) => node.tagName === 'LI' && node.textContent.includes(text))).toBeVisible()
    }
    expect(main.getByText(purposePage[lang].note)).toBeVisible()
    expect(main.getByText(purposePage[lang].connections)).toBeVisible()
    expect(main.queryByRole('heading', { name: productPurpose[lang].availableTitle })).not.toBeInTheDocument()
    expect(main.queryByRole('heading', { name: productPurpose[lang].developmentTitle })).not.toBeInTheDocument()
    expect(main.getByRole('link', { name: purposePage[lang].back }))
      .toHaveAttribute('href', `/about${lang === 'sv' ? '?lang=sv' : ''}`)
    expect(screen.getByRole('link', { name: purposePage[lang].nav }))
      .toHaveAttribute('href', `/purpose${lang === 'sv' ? '?lang=sv' : ''}`)
  })

  it.each(['en', 'sv'])('provides indexable localized product metadata in %s', lang => {
    const meta = getSiteMetadata(new URL(`https://par.datomer.eu/purpose?lang=${lang}`))
    expect(meta.notFound).toBe(false)
    expect(meta.title).toBe(purposePage[lang].title)
    expect(meta.description).toBe(purposePage[lang].description)
    expect(meta.canonical).toBe(`https://par.datomer.eu/purpose${lang === 'sv' ? '?lang=sv' : ''}`)
    expect(meta.robots).toContain('index, follow')
    expect(sitemapPaths('product')).toContain('/purpose')
    expect(sitemapPaths('company')).not.toContain('/purpose')
  })
})

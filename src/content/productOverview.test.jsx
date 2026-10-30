import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App.jsx'
import { LanguageProvider } from '../i18n/LanguageProvider.jsx'
import { translations } from '../i18n/translations.js'
import { featureGroups, productOverview } from './productOverview.js'

afterEach(() => vi.unstubAllGlobals())

describe('benefit-led product homepage', () => {
  it('groups all existing features exactly once without dropping plan information', () => {
    const keys = featureGroups.flatMap(group => group.features)
    expect(keys).toHaveLength(new Set(keys).size)
    for (const lang of ['en', 'sv']) {
      expect([...keys].sort()).toEqual(Object.keys(translations[lang].features)
        .filter(key => typeof translations[lang].features[key] === 'object').sort())
    }
  })

  it.each(['en', 'sv'])('keeps %s examples, eligibility, development, pricing and anchors accessible', lang => {
    vi.stubGlobal('localStorage', { getItem: vi.fn(() => null), setItem: vi.fn() })
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false })))
    render(<MemoryRouter initialEntries={[`/?lang=${lang}`]}>
      <LanguageProvider><App /></LanguageProvider>
    </MemoryRouter>)
    const c = productOverview[lang]
    const cards = document.querySelectorAll('.usecase-card')
    expect(cards).toHaveLength(3)
    for (const example of c.examples) {
      const card = screen.getByRole('heading', { name: example.title }).closest('article')
      expect(within(card).getByText(example.text)).toBeVisible()
      expect(within(card).getByText(example.outcome)).toBeVisible()
      expect(card.querySelector('.usecase-icon svg')).not.toBeNull()
      expect(card.textContent).not.toMatch(/Plus|Pro|Enterprise|€|\$/)
      if (example.status) {
        expect(within(card).getByText(example.status)).toBeVisible()
        expect(within(card).getByText(example.note)).toBeVisible()
      } else {
        expect(card.querySelector('.usecase-status').textContent).toBe('')
      }
    }
    expect(document.querySelectorAll('.usecase-status span')).toHaveLength(1)
    expect(screen.getByText(c.examplesNote)).toBeVisible()
    expect(screen.getByText(c.featuresNote)).toBeVisible()
    for (const group of featureGroups) {
      const section = screen.getByRole('region', { name: c.groups[group.id][0] })
      for (const key of group.features) {
        const detail = within(section).getByText(translations[lang].features[key].text).closest('article')
        expect(within(detail).getByRole('heading', { level: 4 })).toBeVisible()
        expect(detail.querySelector('.feature-badge')).toBeNull()
        expect(detail.textContent).not.toContain('Plus+')
      }
      expect(document.querySelectorAll('#pricing .pricing-card')).toHaveLength(4)
    }
    expect(document.querySelector('.development-note')).toBeNull()
    expect(screen.getByRole('link', { name: `${c.developmentLink} →` }))
      .toHaveAttribute('href', `/about${lang === 'sv' ? '?lang=sv' : ''}#development`)
    for (const id of ['about', 'product', 'features', 'pricing', 'faq', 'download']) {
      expect(document.getElementById(id)).toBeTruthy()
    }
    const billing = translations[lang].pricing.billing
    fireEvent.click(screen.getByRole('button', { name: billing.yearly }))
    expect(screen.getByRole('button', { name: billing.yearly })).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(screen.getByRole('button', { name: billing.monthly }))
    expect(screen.getByRole('button', { name: billing.monthly })).toHaveAttribute('aria-pressed', 'true')
    const scroll = vi.spyOn(window, 'scrollTo')
    fireEvent.click(screen.getByRole('link', { name: `${c.developmentLink} →` }))
    expect(document.getElementById('development')).not.toBeNull()
    expect(scroll).toHaveBeenLastCalledWith(expect.objectContaining({ behavior: 'instant', top: expect.any(Number) }))
    scroll.mockRestore()
  })
})

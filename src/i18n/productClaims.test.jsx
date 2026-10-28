import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App.jsx'
import { LanguageProvider } from './LanguageProvider.jsx'
import { translations } from './translations.js'
import { productPurpose } from '../content/productPurpose.js'

afterEach(() => vi.unstubAllGlobals())

describe('release-evidenced beta messaging', () => {
  it.each(['en', 'sv'])('keeps %s compatibility and plan claims consistent across the homepage', lang => {
    vi.stubGlobal('localStorage', { getItem: vi.fn(() => null), setItem: vi.fn() })
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false })))
    render(<MemoryRouter initialEntries={[`/?lang=${lang}`]}>
      <LanguageProvider><App /></LanguageProvider>
    </MemoryRouter>)
    const copy = translations[lang]
    const card = screen.getByText(copy.features.portability.text).closest('article')
    expect(within(card).getByText('Plus+')).toBeVisible()
    fireEvent.click(screen.getByText(copy.faq.q4))
    expect(screen.getByText(copy.faq.a4)).toBeVisible()
    expect(copy.faq.a4).toContain('Plus')
    expect(copy.faq.a4).toContain('Enterprise')
    expect(copy.features.portability.badge).not.toMatch(/All Tiers|Alla Nivåer/)
    fireEvent.click(screen.getByText(copy.faq.q3))
    expect(screen.getByText(copy.faq.a3)).toBeVisible()
    expect(copy.faq.a3).toContain('Windows')
    expect(copy.faq.a3).toContain('Linux')
    expect(copy.faq.a3).toContain('ARM')
    expect(copy.cta.disclaimer).not.toMatch(/campaign|kampanj/)
    expect(productPurpose[lang].compatibility).not.toMatch(/campaign|kampanj/)
    expect(screen.getByText(copy.cta.disclaimer)).toBeVisible()
    expect(copy.cta.disclaimer).toContain('M1')
    expect(copy.cta.disclaimer).not.toMatch(/recommended|rekommenderas/)
    expect(screen.getByText(productPurpose[lang].compatibility)).toBeVisible()
    expect(screen.getByText(copy.requirements.note)).toBeVisible()
    expect(copy.requirements.note).not.toMatch(/unsigned|osignerade/)
  })

  it.each(['en', 'sv'])('keeps %s workflow development distinct from current beta availability', lang => {
    vi.stubGlobal('localStorage', { getItem: vi.fn(() => null), setItem: vi.fn() })
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false })))
    render(<MemoryRouter initialEntries={[`/about?lang=${lang}`]}>
      <LanguageProvider><App /></LanguageProvider>
    </MemoryRouter>)
    expect(screen.getByText(productPurpose[lang].developmentStatus)).toBeVisible()
    expect(screen.getByText(productPurpose[lang].developmentText)).toBeVisible()
    expect(screen.getByText(productPurpose[lang].developmentNote)).toBeVisible()
  })
})

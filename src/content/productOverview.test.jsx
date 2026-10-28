import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App.jsx'
import { LanguageProvider } from '../i18n/LanguageProvider.jsx'
import { translations } from '../i18n/translations.js'
import { featureGroups, productOverview } from './productOverview.js'
import { productPurpose } from './productPurpose.js'

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
    for (const [title, text] of c.examples) {
      expect(screen.getByRole('heading', { name: title })).toBeVisible()
      expect(screen.getByText(text)).toBeVisible()
    }
    expect(screen.getByText(c.featuresNote)).toBeVisible()
    for (const group of featureGroups) {
      const section = screen.getByRole('region', { name: c.groups[group.id][0] })
      for (const key of group.features) {
        const detail = within(section).getByText(translations[lang].features[key].text).closest('article')
        expect(within(detail).getByText(translations[lang].features[key].badge)).toBeVisible()
      }
    }
    expect(screen.getByText(productPurpose[lang].developmentStatus)).toBeVisible()
    expect(screen.getByText(productPurpose[lang].developmentText)).toBeVisible()
    for (const id of ['about', 'product', 'features', 'pricing', 'faq', 'download']) {
      expect(document.getElementById(id)).toBeTruthy()
    }
    const billing = translations[lang].pricing.billing
    fireEvent.click(screen.getByRole('button', { name: billing.yearly }))
    expect(screen.getByRole('button', { name: billing.yearly })).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(screen.getByRole('button', { name: billing.monthly }))
    expect(screen.getByRole('button', { name: billing.monthly })).toHaveAttribute('aria-pressed', 'true')
  })
})

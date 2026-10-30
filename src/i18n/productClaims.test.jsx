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
    const privacyPillars = document.querySelectorAll('.privacy-pillar')
    expect(privacyPillars).toHaveLength(3)
    for (const pillar of privacyPillars) {
      expect(pillar.querySelector('.icon svg')).not.toBeNull()
    }
    const windowsCard = screen.getByText(copy.deployments.windows.text).closest('article')
    expect(within(windowsCard).getByText(copy.deployments.windows.title)).toBeVisible()
    expect(within(windowsCard).getByText(copy.deployments.available)).toBeVisible()
    expect(document.querySelectorAll('.deployment-card')).toHaveLength(2)
    expect(screen.queryByRole('heading', { name: 'Pär Cloud' })).not.toBeInTheDocument()
    expect(copy.deployments.windows.text).toContain('ARM')
    expect(copy.deployments.windows.text).not.toMatch(/Linux|Chromebook|browser|webbläsare/)
    expect(screen.queryByRole('heading', { name: 'Pär Web' })).not.toBeInTheDocument()
    const card = screen.getByText(copy.features.portability.text).closest('article')
    expect(within(card).queryByText('Plus+')).not.toBeInTheDocument()
    fireEvent.click(screen.getByText(copy.faq.q4))
    expect(screen.getByText(copy.faq.a4)).toBeVisible()
    expect(copy.faq.a4).toContain('Plus')
    expect(copy.faq.a4).toContain('Enterprise')
    expect(copy.features.portability.text).not.toContain('Plus')
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
    expect(screen.getByText(copy.hero.lede)).toBeVisible()
    expect(screen.getByText(copy.hero.workTitle)).toBeVisible()
    expect(copy.hero.lede).toContain(lang === 'en' ? 'reuse routines' : 'återanvänd rutiner')
    expect(copy.hero.lede).not.toMatch(/financial|ekonomisk/)
    for (const platform of ['mac', 'windows']) {
      expect(screen.getByRole('heading', { name: copy.requirements[`${platform}Title`] })).toBeVisible()
      for (const item of copy.requirements[`${platform}Items`]) {
        expect(screen.getAllByText(item).length).toBeGreaterThan(0)
      }
    }
    expect(copy.requirements.windowsItems.join(' ')).toContain('ARM')
    expect(copy.features.homeHub.text).toContain(lang === 'en' ? 'not a Datomer-hosted server' : 'inte en server som Datomer driver')
    expect(copy.privacyHome.features.join(' ')).toContain(lang === 'en' ? 'multi-factor authentication' : 'flerfaktorsautentisering')
    expect(screen.getByText(copy.privacyHome.text)).toBeVisible()
    expect(copy.privacyHome.text).toContain(lang === 'en' ? 'may send information to their providers' : 'kan skicka information till sina leverantörer')
    expect(screen.getByText(copy.pricing.historyNote)).toBeVisible()
    expect(copy.pricing.historyNote).toContain('Plus')
    expect(JSON.stringify(copy)).not.toMatch(/PII|stripped of personally identifiable|100% offline|Everything stays on your Mac|rensas för valfritt moln/)
    expect(copy.hero.lede).not.toContain(lang === 'en' ? 'own Mac' : 'egen Mac')
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
    expect(screen.getByText(productPurpose[lang].reviewNote)).toBeVisible()
    expect(productPurpose[lang].reviewNote).toContain(lang === 'en' ? 'financial or legal advice' : 'ekonomisk eller juridisk rådgivning')
  })
})

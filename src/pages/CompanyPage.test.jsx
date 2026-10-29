import { afterEach, describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { CompanyPage } from './CompanyPage.jsx'
import { LanguageProvider } from '../i18n/LanguageProvider.jsx'
import { companyContent } from '../content/company.js'
import { SiteMetadata } from '../components/SiteMetadata.jsx'

afterEach(() => vi.unstubAllGlobals())

function renderCompany(path = '/') {
  vi.stubGlobal('localStorage', { getItem: vi.fn(() => null), setItem: vi.fn() })
  vi.stubGlobal('location', { origin: 'http://127.0.0.1:5173' })
  return render(<HelmetProvider><MemoryRouter initialEntries={[path]}>
    <LanguageProvider><SiteMetadata /><CompanyPage /></LanguageProvider>
  </MemoryRouter></HelmetProvider>)
}

describe('company website', () => {
  it.each(['en', 'sv'])('links each logo to its own homepage in %s', lang => {
    renderCompany(`/?lang=${lang}`)
    const suffix = lang === 'sv' ? '?lang=sv' : ''
    for (const image of document.querySelectorAll('img[src*="logo"]')) {
      const link = image.closest('a')
      expect(link).not.toBeNull()
      expect(link.getAttribute('href')).toBe(image.src.includes('datomer-logo')
        ? `/${suffix}` : `http://127.0.0.1:5174/${suffix}`)
    }
    fireEvent.click(screen.getAllByRole('link', { name: 'Datomer AB' })[0])
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(lang === 'sv'
      ? 'Gör din data användbar.' : 'Put your data to work.')
  })

  it('shows all six services, mission, vision, values, product and approved LinkedIn links', () => {
    renderCompany()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Put your data to work.')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Optimize costs and improve efficiency.')
    expect(screen.getByRole('heading', { level: 1 })).not.toHaveTextContent('Keep people in control')
    for (const [title] of companyContent.en.services) expect(screen.getByRole('heading', { name: title })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Our mission' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Our vision' })).toBeVisible()
    expect(screen.getByRole('complementary', { name: companyContent.en.processTitle })).toBeVisible()
    for (const [title] of companyContent.en.process) expect(screen.getByRole('heading', { name: title })).toBeVisible()
    expect(screen.getByRole('link', { name: 'Connect on LinkedIn ↗' })).toHaveAttribute('href', 'https://www.linkedin.com/in/jayceee')
    expect(screen.getByRole('link', { name: 'Explore Pär →' }).href).toMatch(/:5174\/$/)
    expect(document.title).toBe(companyContent.en.title)
    expect(screen.queryByText('AI on Your Device')).not.toBeInTheDocument()
  })

  it('supports Swedish and retains the company site when navigating to contact', () => {
    renderCompany('/?lang=sv')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Gör din data användbar.')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Optimera kostnader och förbättra effektiviteten.')
    fireEvent.click(screen.getByRole('link', { name: 'Prata med oss om dina mål' }))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Kontakt')
    expect(screen.getByRole('textbox', { name: /E-post/i })).toBeVisible()
    expect(document.title).toBe('Kontakt — Datomer AB')
  })

  it('provides a company not-found page', () => {
    renderCompany('/missing')
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeVisible()
  })

  it('keeps English and Swedish content structures in sync', () => {
    function shape(value) {
      if (Array.isArray(value)) return value.map(shape)
      if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, shape(item)]))
      return typeof value
    }
    expect(shape(companyContent.sv)).toEqual(shape(companyContent.en))
  })
})

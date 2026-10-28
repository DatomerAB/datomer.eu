import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { LanguageProvider } from '../i18n/LanguageProvider.jsx'
import { productVisuals } from '../content/productVisuals.js'
import { ProductPreview } from './ProductPreview.jsx'

describe('approved product screenshot', () => {
  it.each(['en', 'sv'])('keeps appearance, plan, online and illustrative-answer qualifications in %s', lang => {
    render(<MemoryRouter initialEntries={[`/?lang=${lang}`]}>
      <LanguageProvider><ProductPreview /></LanguageProvider>
    </MemoryRouter>)
    const c = productVisuals[lang]
    const image = screen.getByRole('img', { name: c.alt })
    expect(image).toHaveAttribute('width', '1216')
    expect(image).toHaveAttribute('height', '768')
    expect(image).toHaveAttribute('fetchpriority', 'high')
    expect(image.getAttribute('srcset')).toContain('640w')
    expect(image.getAttribute('srcset')).toContain('1216w')
    expect(screen.getByText(c.caption)).toBeVisible()
    expect(screen.getByText(c.warning)).toBeVisible()
    expect(c.caption).toContain('Pro')
    expect(c.caption).toContain('internet')
    expect(c.caption).not.toContain('0.1.9-beta')
    expect(screen.getAllByRole('link', { name: c.enlarge })[0])
      .toHaveAttribute('href', '/product/mac-chat-dark-1216.webp')
  })
})

import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import { LanguageProvider } from './i18n/LanguageProvider.jsx'

function Wrapper({ children, initialEntries = ['/'] }) {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <LanguageProvider>{children}</LanguageProvider>
    </MemoryRouter>
  )
}

describe('App renders without raw translation keys', () => {
  it('home page does not show dotted translation placeholders', async () => {
    globalThis.fetch = vi.fn(() => Promise.resolve({ ok: false }))
    render(<App />, { wrapper: Wrapper })
    await new Promise((resolve) => setTimeout(resolve, 0))
    const body = document.body.innerText
    const dottedKeys = (body.match(/\b[a-z][a-zA-Z0-9]*(?:\.[a-z][a-zA-Z0-9]*)+\b/g) || [])
      .filter((k) => k.includes('.') && !k.includes('@') && k !== 'datomer.eu')
    expect(dottedKeys).toEqual([])
  })

  it('privacy page shows title and intro text', () => {
    globalThis.fetch = vi.fn(() => Promise.resolve({ ok: false }))
    render(<App />, { wrapper: ({ children }) => <Wrapper initialEntries={['/privacy']}>{children}</Wrapper> })
    expect(screen.getByText('Privacy Policy')).toBeTruthy()
    expect(screen.getByText(/Data controller/i)).toBeTruthy()
  })
})

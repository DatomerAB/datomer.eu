import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import { LanguageProvider } from './i18n/LanguageProvider.jsx'

function Wrapper({ children, initialEntries = ['/get-started'] }) {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <LanguageProvider>{children}</LanguageProvider>
    </MemoryRouter>
  )
}

describe('Get Started page', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn(() => Promise.resolve({ ok: false }))
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => null),
      setItem: vi.fn(() => {}),
      removeItem: vi.fn(() => {}),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the guide without raw translation keys', async () => {
    render(<App />, { wrapper: Wrapper })
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(screen.getByRole('heading', { name: /Get Started With Pär/i, level: 1 })).toBeTruthy()
    expect(screen.getByRole('heading', { name: /Before you start/i })).toBeTruthy()
    expect(screen.getByText(/Drag Pär onto the Applications folder/i)).toBeTruthy()
  })

  it('renders markdown tables from the synced document', async () => {
    render(<App />, { wrapper: Wrapper })
    await new Promise((resolve) => setTimeout(resolve, 0))

    const tables = document.querySelectorAll('.prose table')
    expect(tables.length).toBeGreaterThanOrEqual(3)
  })

  it('opens the download modal from the page CTA', async () => {
    render(<App />, { wrapper: Wrapper })
    await new Promise((resolve) => setTimeout(resolve, 0))

    // Scoped by name: the cookie consent banner is also role="dialog".
    expect(screen.queryByRole('dialog', { name: /Download Pär beta/i })).toBeNull()
    fireEvent.click(screen.getAllByRole('button', { name: /Download for Mac/i })[0])
    expect(screen.getByRole('dialog', { name: /Download Pär beta/i })).toBeTruthy()
  })

  it('does not render a second download form inline on the page', async () => {
    render(<App />, { wrapper: Wrapper })
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(document.querySelectorAll('form.download-form').length).toBe(0)
  })

  it('strips script tags from rendered markdown', async () => {
    render(<App />, { wrapper: Wrapper })
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(document.querySelectorAll('.prose script').length).toBe(0)
  })

  it('renders the guide body in Swedish with ?lang=sv', async () => {
    render(<App />, {
      wrapper: ({ children }) => (
        <Wrapper initialEntries={['/get-started?lang=sv']}>{children}</Wrapper>
      ),
    })
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(screen.getByRole('heading', { name: /Kom Igång Med Pär/i, level: 1 })).toBeTruthy()
    expect(screen.getByRole('heading', { name: /Innan du börjar/i })).toBeTruthy()
    expect(screen.getByText(/Dra Pär till Program-mappen/i)).toBeTruthy()
    expect(screen.queryByText(/Drag Pär onto the Applications folder/i)).toBeNull()
  })
})

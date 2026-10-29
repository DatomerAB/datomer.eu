import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
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
  it.each(['en', 'sv'])('links header and footer brands to the correct homepages in %s', lang => {
    vi.stubGlobal('localStorage', { getItem: vi.fn(() => null), setItem: vi.fn() })
    vi.stubGlobal('location', { origin: 'https://par.datomer.eu' })
    globalThis.fetch = vi.fn(() => Promise.resolve({ ok: false }))
    render(<App />, { wrapper: ({ children }) => <Wrapper initialEntries={[`/about?lang=${lang}`]}>{children}</Wrapper> })
    const home = lang === 'sv' ? '/?lang=sv' : '/'
    const productLinks = screen.getAllByRole('link', { name: 'Pär home' })
    expect(productLinks).toHaveLength(2)
    for (const link of productLinks) expect(link).toHaveAttribute('href', home)
    expect(screen.getByRole('link', { name: 'Datomer AB' })).toHaveAttribute('href', `https://datomer.eu${home}`)
    fireEvent.click(productLinks[1])
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(lang === 'sv'
      ? 'Din AI. På Din Enhet.' : 'Your AI. On your device.')
    vi.unstubAllGlobals()
  })

  it('keeps the selected Windows installer through the existing download form', async () => {
    vi.stubGlobal('localStorage', { getItem: vi.fn(() => null), setItem: vi.fn(), removeItem: vi.fn() })
    const url = 'https://github.com/DatomerAB/par-releases/releases/download/v1.0.0-beta.10/Par-cpu.exe'
    const catalog = { schema_version: 1, platforms: { 'windows-x64-cpu': [{ tag: 'v1.0.0-beta.10', name: 'Par-cpu.exe', url }] } }
    globalThis.fetch = vi.fn((request) => Promise.resolve({
      ok: String(request).includes('downloads.json') || request === '/api/waitlist',
      json: () => Promise.resolve(String(request).includes('downloads.json') ? catalog : { ok: true }),
    }))
    render(<App />, { wrapper: Wrapper })
    await screen.findByText('1.0.0-beta.10')
    fireEvent.click(await screen.findByRole('link', { name: 'Download EXE' }))
    expect(screen.getByRole('dialog', { name: /Download Pär beta/i })).toBeTruthy()
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    fireEvent.change(screen.getByRole('textbox', { name: /Full name/ }), { target: { value: 'Beta Tester' } })
    fireEvent.change(screen.getByRole('textbox', { name: /Email address/ }), { target: { value: 'beta@example.com' } })
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'SE' } })
    fireEvent.click(screen.getByRole('button', { name: 'Download for Windows' }))
    await waitFor(() => expect(clickSpy).toHaveBeenCalledTimes(1))
    expect(clickSpy.mock.instances[0].href).toBe(url)
    clickSpy.mockRestore()
    vi.unstubAllGlobals()
  })

  it('renders an icon for every home page highlight', () => {
    globalThis.fetch = vi.fn(() => Promise.resolve({ ok: false }))
    render(<App />, { wrapper: Wrapper })
    const highlights = within(screen.getByLabelText('Core promises'))

    for (const title of ['AI on Your Device', 'Protected Local Storage', 'Your Choice to Connect']) {
      const highlight = highlights.getByText(title).closest('.hero-highlight')
      expect(highlight).not.toBeNull()
      expect(highlight.querySelector('.icon svg')).not.toBeNull()
    }
  })

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

  it('home page renders AI disclaimer banner in footer', async () => {
    globalThis.fetch = vi.fn(() => Promise.resolve({ ok: false }))
    render(<App />, { wrapper: Wrapper })
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(screen.getByText(/Pär is an AI assistant/i)).toBeTruthy()
    expect(screen.getByText(/Learn more/i)).toBeTruthy()
  })

  it('terms page renders AI disclaimer section', () => {
    globalThis.fetch = vi.fn(() => Promise.resolve({ ok: false }))
    render(<App />, { wrapper: ({ children }) => <Wrapper initialEntries={['/terms']}>{children}</Wrapper> })
    expect(screen.getByText('AI-Generated Content and EU AI Act Notice')).toBeTruthy()
    expect(screen.getByText(/The outputs it produces may be inaccurate/i)).toBeTruthy()
  })
})

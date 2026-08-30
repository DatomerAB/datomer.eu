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

describe('Models & Licenses page', () => {
  it('renders attribution page without raw translation keys', async () => {
    globalThis.fetch = vi.fn(() => Promise.resolve({ ok: false }))
    render(<App />, {
      wrapper: ({ children }) => <Wrapper initialEntries={['/models']}>{children}</Wrapper>,
    })
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(screen.getAllByText('Models & Licenses').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/Pär is proprietary software/i)).toBeTruthy()
    expect(screen.getByText(/Models bundled or downloadable by Pär/i)).toBeTruthy()
  })

  it('lists key models and licenses', async () => {
    globalThis.fetch = vi.fn(() => Promise.resolve({ ok: false }))
    render(<App />, {
      wrapper: ({ children }) => <Wrapper initialEntries={['/models']}>{children}</Wrapper>,
    })
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(screen.getByText('Qwen 7B')).toBeTruthy()
    expect(screen.getByText('Mistral Nemo 12B')).toBeTruthy()
    expect(screen.getByText('Nomic Embed v1.5')).toBeTruthy()
    expect(screen.getByText('Gemma 3 12B (Ollama)')).toBeTruthy()
  })
})

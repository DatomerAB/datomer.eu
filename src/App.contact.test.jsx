import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import { LanguageProvider } from './i18n/LanguageProvider.jsx'

function Wrapper({ children, initialEntries = ['/contact'] }) {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <LanguageProvider>{children}</LanguageProvider>
    </MemoryRouter>
  )
}

describe('ContactPage form submission', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url) => {
        if (String(url).includes('ipapi') || String(url).includes('github') || String(url).includes('raw.githubusercontent')) {
          return Promise.resolve({ ok: false })
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }) })
      })
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('submits the contact form to /api/contact', async () => {
    render(<App />, { wrapper: Wrapper })

    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Test User' } })
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText(/Message/i), { target: { value: 'Hello!' } })

    fireEvent.click(screen.getByRole('button', { name: /Send message/i }))

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/contact',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"email":"test@example.com"'),
        })
      )
    })

    const body = JSON.parse(globalThis.fetch.mock.calls.find((call) => String(call[0]) === '/api/contact')[1].body)
    expect(body.name).toBe('Test User')
    expect(body.email).toBe('test@example.com')
    expect(body.message).toBe('Hello!')

    expect(screen.getByText(/Thank you. Your message has been sent./i)).toBeTruthy()
  })
})

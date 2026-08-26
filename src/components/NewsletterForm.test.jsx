import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { NewsletterForm } from './NewsletterForm.jsx'
import { LanguageProvider } from '../i18n/LanguageProvider.jsx'

function Wrapper({ children }) {
  return <LanguageProvider>{children}</LanguageProvider>
}

describe('NewsletterForm', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }) }))
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('submits the newsletter form to /api/waitlist with type newsletter', async () => {
    render(<NewsletterForm source="footer" />, { wrapper: Wrapper })

    fireEvent.change(screen.getByPlaceholderText(/Your email/i), {
      target: { value: 'news@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Join the newsletter/i }))

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/waitlist',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"type":"newsletter"'),
        })
      )
    })

    const body = JSON.parse(globalThis.fetch.mock.calls[0][1].body)
    expect(body.email).toBe('news@example.com')
    expect(body.type).toBe('newsletter')
    expect(body.source).toBe('footer')
    expect(body.interests).toEqual({
      productUpdates: true,
      betaAccess: true,
      changelog: true,
    })

    expect(screen.getByText(/You are subscribed/i)).toBeTruthy()
  })
})

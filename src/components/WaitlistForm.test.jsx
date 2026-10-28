import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { WaitlistForm } from './WaitlistForm.jsx'
import { LanguageProvider } from '../i18n/LanguageProvider.jsx'
import { trackLinkedInConversion } from '../analytics/linkedin.js'

vi.mock('../analytics/linkedin.js', () => ({ trackLinkedInConversion: vi.fn() }))

function Wrapper({ children }) {
  return <LanguageProvider>{children}</LanguageProvider>
}

describe('WaitlistForm', () => {
  beforeEach(() => {
    vi.mocked(trackLinkedInConversion).mockClear()
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }) }))
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('submits the waitlist form to /api/waitlist', async () => {
    render(<WaitlistForm />, { wrapper: Wrapper })

    fireEvent.change(screen.getByPlaceholderText(/Enter your email/i), {
      target: { value: 'waiter@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: /Join Waitlist/i }))

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/waitlist',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"type":"waitlist"'),
        })
      )
    })

    const body = JSON.parse(globalThis.fetch.mock.calls[0][1].body)
    expect(body.email).toBe('waiter@example.com')
    expect(body.type).toBe('waitlist')
    expect(body.action).toBe('waitlist-form')
    expect(body.source).toBe('website')
    expect(body.interests).toEqual({
      productUpdates: true,
      betaAccess: true,
      changelog: true,
    })

    expect(screen.getByText(/You are on the list/i)).toBeTruthy()
    expect(trackLinkedInConversion).not.toHaveBeenCalled()
  })

  it('does not count a rejected signup as a conversion', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: false, json: () => Promise.resolve({ error: 'Please try again' }),
    })
    render(<WaitlistForm />, { wrapper: Wrapper })
    fireEvent.change(screen.getByPlaceholderText(/Enter your email/i), { target: { value: 'waiter@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: /Join Waitlist/i }))
    expect(await screen.findByText('Please try again')).toBeTruthy()
    expect(trackLinkedInConversion).not.toHaveBeenCalled()
  })
})

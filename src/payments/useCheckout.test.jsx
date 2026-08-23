import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCheckout } from './useCheckout.js'
import { LanguageProvider } from '../i18n/LanguageProvider.jsx'

function wrapper({ children }) {
  return <LanguageProvider>{children}</LanguageProvider>
}

describe('useCheckout', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    vi.stubGlobal('location', { href: '' })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows a translated error when no priceId is provided', async () => {
    const { result } = renderHook(() => useCheckout(), { wrapper })
    await act(async () => {
      await result.current.checkout('', 'subscription')
    })
    expect(result.current.error).toBe('Payment is not configured yet.')
    expect(result.current.loading).toBe(false)
  })

  it('redirects to the Stripe checkout URL on success', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ url: 'https://checkout.stripe.com/test' }),
    })

    const { result } = renderHook(() => useCheckout(), { wrapper })
    await act(async () => {
      await result.current.checkout('price_123', 'subscription')
    })

    expect(globalThis.location.href).toBe('https://checkout.stripe.com/test')
    expect(result.current.error).toBe(null)
  })

  it('shows an error when the checkout request fails', async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: 'Stripe session creation failed.' }),
    })

    const { result } = renderHook(() => useCheckout(), { wrapper })
    await act(async () => {
      await result.current.checkout('price_123', 'subscription')
    })

    expect(result.current.error).toBe('Stripe session creation failed.')
    expect(result.current.loading).toBe(false)
  })
})

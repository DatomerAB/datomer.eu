import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { forwardRef, useEffect, useImperativeHandle } from 'react'
import { PaymentButton } from './PaymentButton.jsx'
import { LanguageProvider } from '../i18n/LanguageProvider.jsx'

function Wrapper({ children }) {
  return <LanguageProvider>{children}</LanguageProvider>
}

const checkout = vi.fn()
const execute = vi.fn()
const getResponse = vi.fn()

vi.mock('../payments/useCheckout.js', () => ({
  useCheckout: () => ({ checkout, loading: false, error: null }),
}))

const callbacks = {
  onVerify: null,
  onError: null,
}

vi.mock('./Turnstile.jsx', () => ({
  Turnstile: forwardRef(function MockTurnstile(props, ref) {
    useImperativeHandle(ref, () => ({
      execute,
      reset: vi.fn(),
      getResponse,
    }))
    useEffect(() => {
      callbacks.onVerify = props.onVerify
      callbacks.onError = props.onError
    }, [props.onVerify, props.onError])
    return <div data-testid="turnstile" />
  }),
}))

vi.stubEnv('VITE_TURNSTILE_SITE_KEY', '0x4AAAAAAEaZMJCV6o1b_ZFh')

describe('PaymentButton', () => {
  beforeEach(() => {
    checkout.mockClear()
    execute.mockClear()
    getResponse.mockClear()
    callbacks.onVerify = null
    callbacks.onError = null
  })

  it('calls checkout with priceId and mode when Turnstile is disabled', () => {
    vi.stubEnv('VITE_TURNSTILE_SITE_KEY', '')
    render(<PaymentButton priceId="price_123" mode="subscription">Get Plus</PaymentButton>, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('button', { name: /Get Plus/i }))
    expect(checkout).toHaveBeenCalledWith('price_123', 'subscription', null, 'plus')
  })

  it('is disabled when no priceId is provided', () => {
    render(<PaymentButton priceId="" mode="subscription">Get Plus</PaymentButton>, { wrapper: Wrapper })
    expect(screen.getByRole('button', { name: /Get Plus/i })).toBeDisabled()
  })

  it('executes the Turnstile widget when clicked without a token', () => {
    vi.stubEnv('VITE_TURNSTILE_SITE_KEY', '0x4AAAAAAEaZMJCV6o1b_ZFh')
    render(<PaymentButton priceId="price_123" mode="subscription">Get Plus</PaymentButton>, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('button', { name: /Get Plus/i }))
    expect(checkout).not.toHaveBeenCalled()
    expect(execute).toHaveBeenCalled()
    // After verify callback fires, checkout should start automatically.
    act(() => {
      callbacks.onVerify?.('test-token')
    })
    expect(checkout).toHaveBeenCalledWith('price_123', 'subscription', 'test-token', 'plus')
  })

  it('displays the Turnstile error code when the challenge fails', () => {
    vi.stubEnv('VITE_TURNSTILE_SITE_KEY', '0x4AAAAAAEaZMJCV6o1b_ZFh')
    render(<PaymentButton priceId="price_123" mode="subscription">Get Plus</PaymentButton>, { wrapper: Wrapper })
    act(() => {
      callbacks.onError?.('400020')
    })
    expect(screen.getByText(/Security check failed/i)).toHaveTextContent('400020')
  })
})

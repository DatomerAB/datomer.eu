import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PaymentButton } from './PaymentButton.jsx'

const checkout = vi.fn()

vi.mock('../payments/useCheckout.js', () => ({
  useCheckout: () => ({ checkout, loading: false, error: null }),
}))

describe('PaymentButton', () => {
  it('calls checkout with priceId and mode when clicked', () => {
    render(<PaymentButton priceId="price_123" mode="subscription">Get Plus</PaymentButton>)
    fireEvent.click(screen.getByRole('button', { name: /Get Plus/i }))
    expect(checkout).toHaveBeenCalledWith('price_123', 'subscription')
  })

  it('is disabled when no priceId is provided', () => {
    render(<PaymentButton priceId="" mode="subscription">Get Plus</PaymentButton>)
    expect(screen.getByRole('button', { name: /Get Plus/i })).toBeDisabled()
  })
})

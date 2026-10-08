import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CookieConsent } from './CookieConsent.jsx'

const mocks = vi.hoisted(() => ({
  consent: vi.fn(),
  hasConsent: vi.fn(),
  resetSession: vi.fn(),
  startTracking: vi.fn(),
}))

vi.mock('../i18n/useLanguage.js', () => ({
  useLanguage: () => ({ t: (key) => key }),
}))

vi.mock('../analytics/analytics.js', () => ({
  analytics: { consent: mocks.consent, hasConsent: mocks.hasConsent },
}))

vi.mock('../analytics/tracking.js', () => ({
  resetSession: mocks.resetSession,
  startTracking: mocks.startTracking,
}))

function createStorage() {
  const values = new Map()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  }
}

describe('CookieConsent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('localStorage', createStorage())
    mocks.hasConsent.mockReturnValue(false)
  })

  it('cleans up tracking when the consent component unmounts', () => {
    const stopTracking = vi.fn()
    mocks.startTracking.mockReturnValue(stopTracking)
    const view = render(<CookieConsent />)

    fireEvent.click(screen.getByRole('button', { name: 'cookieConsent.accept' }))
    expect(mocks.startTracking).toHaveBeenCalledOnce()

    view.unmount()

    expect(stopTracking).toHaveBeenCalledOnce()
  })

  it('clears stored tracking session when consent is declined', () => {
    render(<CookieConsent />)

    fireEvent.click(screen.getByRole('button', { name: 'cookieConsent.decline' }))

    expect(mocks.consent).toHaveBeenCalledWith(false)
    expect(mocks.resetSession).toHaveBeenCalledOnce()
  })
})
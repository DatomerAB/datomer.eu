import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CookieConsent, CookieSettingsButton } from './CookieConsent.jsx'

const mocks = vi.hoisted(() => ({
  consent: vi.fn(),
  hasConsent: vi.fn(),
  resetSession: vi.fn(),
  startTracking: vi.fn(),
  isLinkedInEnabled: vi.fn(),
  hasLinkedInConsent: vi.fn(),
  hasLinkedInChoice: vi.fn(),
  loadLinkedIn: vi.fn(),
  setLinkedInConsent: vi.fn(),
}))

vi.mock('../analytics/linkedin.js', () => ({
  isLinkedInEnabled: mocks.isLinkedInEnabled,
  hasLinkedInConsent: mocks.hasLinkedInConsent,
  hasLinkedInChoice: mocks.hasLinkedInChoice,
  loadLinkedIn: mocks.loadLinkedIn,
  setLinkedInConsent: mocks.setLinkedInConsent,
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
    mocks.isLinkedInEnabled.mockReturnValue(false)
    mocks.hasLinkedInConsent.mockReturnValue(false)
    mocks.hasLinkedInChoice.mockReturnValue(false)
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

  it('requires a new marketing choice even for visitors who already accepted analytics', () => {
    localStorage.setItem('par-cookie-consent', 'accepted')
    mocks.hasConsent.mockReturnValue(true)
    mocks.isLinkedInEnabled.mockReturnValue(true)
    render(<CookieConsent />)
    expect(screen.getByRole('checkbox', { name: 'cookieConsent.marketing' })).not.toBeChecked()
    fireEvent.click(screen.getByRole('button', { name: 'cookieConsent.save' }))
    expect(mocks.setLinkedInConsent).toHaveBeenCalledWith(false)
    expect(mocks.consent).toHaveBeenCalledWith(true)
  })

  it('allows marketing consent independently of analytics and can reopen settings', () => {
    mocks.isLinkedInEnabled.mockReturnValue(true)
    render(<><CookieConsent /><CookieSettingsButton /></>)
    fireEvent.click(screen.getByRole('checkbox', { name: 'cookieConsent.marketing' }))
    fireEvent.click(screen.getByRole('button', { name: 'cookieConsent.save' }))
    expect(mocks.setLinkedInConsent).toHaveBeenCalledWith(true)
    expect(mocks.consent).toHaveBeenCalledWith(false)
    expect(screen.queryByRole('dialog')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'cookieConsent.settings' }))
    expect(screen.getByRole('dialog')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'cookieConsent.rejectAll' }))
    expect(mocks.setLinkedInConsent).toHaveBeenLastCalledWith(false)
  })
})
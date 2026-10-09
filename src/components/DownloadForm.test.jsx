import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DownloadForm } from './DownloadForm.jsx'
import { LanguageProvider } from '../i18n/LanguageProvider.jsx'

function Wrapper({ children }) {
  return <LanguageProvider>{children}</LanguageProvider>
}

describe('DownloadForm', () => {
  const downloadUrl = 'https://example.com/par.dmg'

  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url) => {
        if (String(url).includes('ipapi')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ country_code: 'se' }),
          })
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }) })
      })
    )
    vi.stubGlobal(
      'localStorage',
      {
        getItem: vi.fn(() => null),
        setItem: vi.fn(() => {}),
        removeItem: vi.fn(() => {}),
      }
    )
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('renders the form and prefills the country from ipapi', async () => {
    render(<DownloadForm downloadUrl={downloadUrl} onClose={() => {}} />, { wrapper: Wrapper })
    expect(screen.getByRole('heading', { name: /Download Pär beta/i })).toBeTruthy()
    await waitFor(() => {
      expect(screen.getByRole('combobox')).toHaveValue('SE')
    })
  })

  it('submits the form and stores the data', async () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    const onClose = vi.fn()
    render(<DownloadForm downloadUrl={downloadUrl} onClose={onClose} />, { wrapper: Wrapper })

    fireEvent.change(screen.getByRole('textbox', { name: /Full name/i }), {
      target: { value: 'Anna Svensson' },
    })
    fireEvent.change(screen.getByRole('textbox', { name: /Email address/i }), {
      target: { value: 'anna@example.com' },
    })
    await waitFor(() => expect(screen.getByRole('combobox')).toHaveValue('SE'))

    fireEvent.click(screen.getByRole('button', { name: /Download for Mac/i }))

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        '/api/waitlist',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('anna@example.com'),
        })
      )
    })

    expect(globalThis.localStorage.setItem).toHaveBeenCalledWith(
      'par-download-info',
      expect.stringContaining('anna@example.com')
    )
    expect(screen.getByText(/Thanks! Your download should start automatically./i)).toBeTruthy()
    expect(clickSpy).toHaveBeenCalledTimes(1)
    expect(clickSpy.mock.instances[0].href).toBe(downloadUrl)
  })

  it('shows storage failures without downloading and allows a successful retry', async () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    render(<DownloadForm downloadUrl={downloadUrl} onClose={() => {}} />, { wrapper: Wrapper })
    fireEvent.change(screen.getByRole('textbox', { name: /Full name/i }), {
      target: { value: 'Download User' },
    })
    fireEvent.change(screen.getByRole('textbox', { name: /Email address/i }), {
      target: { value: 'download@example.com' },
    })
    await waitFor(() => expect(screen.getByRole('combobox')).toHaveValue('SE'))
    const error = 'Could not record your submission. Please try again later.'
    globalThis.fetch.mockResolvedValueOnce({
      ok: false, status: 503, json: () => Promise.resolve({ error }),
    })

    fireEvent.click(screen.getByRole('button', { name: /Download for Mac/i }))

    expect(await screen.findByText(error)).toBeTruthy()
    expect(clickSpy).not.toHaveBeenCalled()
    expect(screen.queryByText(/Thanks! Your download should start automatically./i)).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /Download for Mac/i }))

    expect(await screen.findByText(/Thanks! Your download should start automatically./i)).toBeTruthy()
    expect(clickSpy).toHaveBeenCalledTimes(1)
    expect(screen.queryByText(error)).toBeNull()
  })
})

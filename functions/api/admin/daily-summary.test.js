import { describe, expect, it, vi, beforeEach } from 'vitest'
import { onRequestGet } from './daily-summary.js'

vi.mock('../_email.js', () => ({
  sendSupportEmail: vi.fn(() => Promise.resolve({ sent: true })),
}))

vi.mock('../_db.js', () => ({
  getSubmissionsInRange: vi.fn(() => Promise.resolve([])),
  pruneOldSubmissions: vi.fn(() => Promise.resolve({ meta: { changes: 0 } })),
}))

import { sendSupportEmail } from '../_email.js'
import { getSubmissionsInRange, pruneOldSubmissions } from '../_db.js'

describe('daily-summary admin endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function makeRequest(token, method = 'GET') {
    return new Request('https://example.com/api/admin/daily-summary', {
      method,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
  }

  it('returns 401 when DAILY_SUMMARY_SECRET is missing', async () => {
    const response = await onRequestGet({ request: makeRequest('secret'), env: {} })
    expect(response.status).toBe(401)
    expect(sendSupportEmail).not.toHaveBeenCalled()
  })

  it('returns 401 when token is missing', async () => {
    const response = await onRequestGet({ request: makeRequest(''), env: { DAILY_SUMMARY_SECRET: 'secret' } })
    expect(response.status).toBe(401)
    expect(sendSupportEmail).not.toHaveBeenCalled()
  })

  it('returns 401 when token is invalid', async () => {
    const response = await onRequestGet({ request: makeRequest('wrong'), env: { DAILY_SUMMARY_SECRET: 'secret' } })
    expect(response.status).toBe(401)
    expect(sendSupportEmail).not.toHaveBeenCalled()
  })

  it('sends the summary email and prunes old submissions when token is valid', async () => {
    const rows = [
      {
        id: 1,
        source: 'contact',
        created_at: new Date().toISOString(),
        email: 'contact@example.com',
        name: 'Contact User',
        country: 'SE',
        subject: 'Contact form: enquiry from Contact User',
        message: 'Hello!',
        body: null,
        metadata: null,
      },
    ]
    getSubmissionsInRange.mockResolvedValueOnce(rows)

    const response = await onRequestGet({
      request: makeRequest('secret'),
      env: { DAILY_SUMMARY_SECRET: 'secret', RESEND_API_KEY: 're_123' },
    })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.ok).toBe(true)
    expect(data.count).toBe(1)
    expect(sendSupportEmail).toHaveBeenCalledTimes(1)

    const call = sendSupportEmail.mock.calls[0][0]
    expect(call.to).toEqual(['dailysummary@datomer.eu'])
    expect(call.attachments).toHaveLength(1)
    expect(call.attachments[0].filename).toMatch(/datomer-submissions-\d{4}-\d{2}-\d{2}\.csv/)

    expect(pruneOldSubmissions).toHaveBeenCalledWith(expect.anything(), 30)
  })

  it('respects DAILY_SUMMARY_TO_EMAIL override', async () => {
    getSubmissionsInRange.mockResolvedValueOnce([])

    const response = await onRequestGet({
      request: makeRequest('secret'),
      env: {
        DAILY_SUMMARY_SECRET: 'secret',
        RESEND_API_KEY: 're_123',
        DAILY_SUMMARY_TO_EMAIL: 'other@example.com',
      },
    })

    expect(response.status).toBe(200)
    expect(sendSupportEmail.mock.calls[0][0].to).toEqual(['other@example.com'])
  })

  it('works with POST requests too', async () => {
    getSubmissionsInRange.mockResolvedValueOnce([])

    const response = await onRequestGet({
      request: makeRequest('secret', 'POST'),
      env: { DAILY_SUMMARY_SECRET: 'secret', RESEND_API_KEY: 're_123' },
    })

    expect(response.status).toBe(200)
    expect(sendSupportEmail).toHaveBeenCalledTimes(1)
  })
})

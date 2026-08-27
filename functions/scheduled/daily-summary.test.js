import { describe, expect, it, vi, beforeEach } from 'vitest'
import { scheduled } from './daily-summary.js'

vi.mock('../api/_email.js', () => ({
  sendSupportEmail: vi.fn(() => Promise.resolve({ sent: true })),
}))

vi.mock('../api/_db.js', () => ({
  getSubmissionsSince: vi.fn(() => Promise.resolve([])),
  pruneOldSubmissions: vi.fn(() => Promise.resolve({ meta: { changes: 0 } })),
}))

import { sendSupportEmail } from '../api/_email.js'
import { getSubmissionsSince, pruneOldSubmissions } from '../api/_db.js'

describe('daily-summary scheduled function', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  function makeContext() {
    return {
      waitUntil: vi.fn((promise) => promise),
    }
  }

  it('sends a summary email with CSV attachment to dailysummary@datomer.eu', async () => {
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
      {
        id: 2,
        source: 'download',
        created_at: new Date().toISOString(),
        email: 'download@example.com',
        name: 'Download User',
        country: 'US',
        subject: 'Download request: Download User (download@example.com)',
        message: null,
        body: 'Download details',
        metadata: JSON.stringify({ phone: '+123456789' }),
      },
    ]
    getSubmissionsSince.mockResolvedValueOnce(rows)

    const response = await scheduled(null, { RESEND_API_KEY: 're_123' }, makeContext())

    expect(response.status).toBe(200)
    expect(sendSupportEmail).toHaveBeenCalledTimes(1)

    const call = sendSupportEmail.mock.calls[0][0]
    expect(call.to).toEqual(['dailysummary@datomer.eu'])
    expect(call.subject).toContain('2 submission(s)')
    expect(call.html).toContain('contact')
    expect(call.html).toContain('download')
    expect(call.attachments).toHaveLength(1)
    expect(call.attachments[0].filename).toMatch(/datomer-submissions-\d{4}-\d{2}-\d{2}\.csv/)
    expect(typeof call.attachments[0].content).toBe('string')

    // Decode CSV and verify headers + content.
    const csv = decodeURIComponent(escape(atob(call.attachments[0].content)))
    expect(csv).toContain('category,time,from_email,name,country,subject,message,body,metadata')
    expect(csv).toContain('contact')
    expect(csv).toContain('download')
    expect(csv).toContain('contact@example.com')
    expect(csv).toContain('download@example.com')

    expect(pruneOldSubmissions).toHaveBeenCalledWith(expect.anything(), 30)
  })

  it('sends a no-submissions summary when the database is empty', async () => {
    getSubmissionsSince.mockResolvedValueOnce([])

    const response = await scheduled(null, { RESEND_API_KEY: 're_123' }, makeContext())

    expect(response.status).toBe(200)
    expect(sendSupportEmail).toHaveBeenCalledTimes(1)

    const call = sendSupportEmail.mock.calls[0][0]
    expect(call.to).toEqual(['dailysummary@datomer.eu'])
    expect(call.html).toContain('No submissions')
    expect(call.attachments).toHaveLength(1)
  })
})

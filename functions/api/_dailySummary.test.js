import { describe, expect, it, vi, beforeEach } from 'vitest'
import { runDailySummary, buildCsv, buildHtmlSummary, buildTextSummary } from './_dailySummary.js'

vi.mock('./_email.js', () => ({
  sendSupportEmail: vi.fn(() => Promise.resolve({ sent: true })),
}))

vi.mock('./_db.js', () => ({
  getSubmissionsSince: vi.fn(() => Promise.resolve([])),
  pruneOldSubmissions: vi.fn(() => Promise.resolve({ meta: { changes: 0 } })),
}))

import { sendSupportEmail } from './_email.js'
import { getSubmissionsSince, pruneOldSubmissions } from './_db.js'

describe('daily summary logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('builds a CSV with the expected columns', () => {
    const csv = buildCsv([
      {
        source: 'contact',
        created_at: '2026-08-27T06:00:00.000Z',
        email: 'a@example.com',
        name: 'A',
        country: 'SE',
        subject: 'S',
        message: 'M',
        body: 'B',
        metadata: JSON.stringify({ x: 1 }),
      },
    ])
    expect(csv).toContain('category,time,from_email,name,country,subject,message,body,metadata')
    expect(csv).toContain('contact')
    expect(csv).toContain('a@example.com')
    expect(csv).toContain('{""x"":1}')
  })

  it('escapes CSV values containing commas and quotes', () => {
    const csv = buildCsv([
      {
        source: 'contact',
        created_at: '2026-08-27T06:00:00.000Z',
        email: 'a@example.com',
        name: 'A, B',
        country: 'SE',
        subject: 'He said "hello"',
        message: 'M',
        body: 'B',
        metadata: null,
      },
    ])
    expect(csv).toContain('"A, B"')
    expect(csv).toContain('"He said ""hello"""')
  })

  it('builds HTML and text summaries grouped by source', () => {
    const rows = [
      { source: 'contact', created_at: '2026-08-27T06:00:00.000Z', email: 'a@example.com', name: 'A', country: 'SE', subject: 'S', message: 'Hello', body: null, metadata: null },
      { source: 'download', created_at: '2026-08-27T07:00:00.000Z', email: 'b@example.com', name: 'B', country: 'US', subject: 'D', message: null, body: 'Body', metadata: null },
    ]
    const html = buildHtmlSummary(rows)
    expect(html).toContain('contact (1)')
    expect(html).toContain('download (1)')

    const text = buildTextSummary(rows)
    expect(text).toContain('contact (1)')
    expect(text).toContain('download (1)')
  })

  it('sends the summary email and prunes old submissions', async () => {
    const rows = [
      {
        id: 1,
        source: 'stripe-purchase',
        created_at: new Date().toISOString(),
        email: 'buyer@example.com',
        name: null,
        country: null,
        subject: 'Purchase: Pär plus — buyer@example.com',
        message: null,
        body: 'Plan: plus',
        metadata: JSON.stringify({ plan: 'plus', licenseKey: 'KEY' }),
      },
    ]
    getSubmissionsSince.mockResolvedValueOnce(rows)

    const result = await runDailySummary({ RESEND_API_KEY: 're_123' }, { waitUntil: (p) => p })

    expect(result.ok).toBe(true)
    expect(result.count).toBe(1)
    expect(sendSupportEmail).toHaveBeenCalledTimes(1)

    const call = sendSupportEmail.mock.calls[0][0]
    expect(call.to).toEqual(['dailysummary@datomer.eu'])
    expect(call.attachments[0].filename).toMatch(/datomer-submissions-\d{4}-\d{2}-\d{2}\.csv/)
    expect(pruneOldSubmissions).toHaveBeenCalledWith(expect.anything(), 30)
  })
})

import { describe, expect, it, vi, beforeEach } from 'vitest'
import { runDailySummary, buildCsv, buildEventsCsv, getSummaryWindow, MAX_ATTACHMENT_BYTES } from './_dailySummary.js'
import { buildDailySummaryEmail } from './_emailTemplates.js'

vi.mock('./_email.js', () => ({
  sendSupportEmail: vi.fn(() => Promise.resolve({ sent: true })),
}))

vi.mock('./_db.js', () => ({
  getSubmissionsInRange: vi.fn(() => Promise.resolve([])),
  getEventsInRange: vi.fn(() => Promise.resolve([])),
  pruneOldSubmissions: vi.fn(() => Promise.resolve({ meta: { changes: 0 } })),
}))

import { sendSupportEmail } from './_email.js'
import { getSubmissionsInRange, getEventsInRange, pruneOldSubmissions } from './_db.js'

describe('daily summary logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('anchors the summary window at 06:00 UTC', () => {
    // At 06:30 UTC the window should end at 06:00 UTC today.
    const t1 = new Date('2026-08-27T06:30:00.000Z')
    const w1 = getSummaryWindow(t1)
    expect(w1.end).toBe('2026-08-27T06:00:00.000Z')
    expect(w1.start).toBe('2026-08-26T06:00:00.000Z')

    // At 05:30 UTC the window should end at 06:00 UTC yesterday.
    const t2 = new Date('2026-08-27T05:30:00.000Z')
    const w2 = getSummaryWindow(t2)
    expect(w2.end).toBe('2026-08-26T06:00:00.000Z')
    expect(w2.start).toBe('2026-08-25T06:00:00.000Z')
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
        metadata: JSON.stringify({ x: 1, environment: 'preview', action: 'contact-page', city: 'Stockholm', timeOnSiteMs: 12000 }),
      },
    ])
    expect(csv).toContain('environment,action,category,time,from_email,name,country,city,time_on_site_seconds,subject,message,body,metadata')
    expect(csv).toContain('contact')
    expect(csv).toContain('a@example.com')
    expect(csv).toContain('preview')
    expect(csv).toContain('contact-page')
    expect(csv).toContain('12')
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

  it('builds HTML and text summaries grouped by environment, source and action', () => {
    const rows = [
      { source: 'contact', created_at: '2026-08-27T06:00:00.000Z', email: 'a@example.com', name: 'A', country: 'SE', subject: 'S', message: 'Hello', body: null, metadata: JSON.stringify({ environment: 'production', action: 'contact-page' }) },
      { source: 'download', created_at: '2026-08-27T07:00:00.000Z', email: 'b@example.com', name: 'B', country: 'US', subject: 'D', message: null, body: 'Body', metadata: JSON.stringify({ environment: 'preview', action: 'download-hero' }) },
    ]
    const { html, text } = buildDailySummaryEmail({ rows, dateLabel: '2026-08-27' })
    expect(html).toContain('production · contact · contact-page (1)')
    expect(html).toContain('preview · download · download-hero (1)')
    expect(text).toContain('production · contact · contact-page (1)')
    expect(text).toContain('preview · download · download-hero (1)')
  })

  it('encodes CSV attachment as UTF-8 base64', async () => {
    const rows = [
      {
        id: 1,
        source: 'contact',
        created_at: '2026-08-27T06:00:00.000Z',
        email: 'björn@example.com',
        name: 'Björn Åström',
        country: 'SE',
        subject: 'Hej',
        message: 'Tack!',
        body: null,
        metadata: null,
      },
    ]
    getSubmissionsInRange.mockResolvedValueOnce(rows)

    await runDailySummary({ RESEND_API_KEY: 're_123' }, { waitUntil: (p) => p })

    const call = sendSupportEmail.mock.calls[0][0]
    const csv = new TextDecoder().decode(Uint8Array.from(atob(call.attachments[0].content), (c) => c.charCodeAt(0)))
    expect(csv).toContain('Björn Åström')
    expect(csv).toContain('björn@example.com')
  })

  it('sends the summary email and prunes old submissions when email succeeds', async () => {
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
    getSubmissionsInRange.mockResolvedValueOnce(rows)

    const result = await runDailySummary({ RESEND_API_KEY: 're_123' }, { waitUntil: (p) => p })

    expect(result.ok).toBe(true)
    expect(result.count).toBe(1)
    expect(sendSupportEmail).toHaveBeenCalledTimes(1)

    const call = sendSupportEmail.mock.calls[0][0]
    expect(call.to).toEqual(['dailysummary@datomer.eu'])
    expect(call.attachments[0].filename).toMatch(/datomer-submissions-\d{4}-\d{2}-\d{2}\.csv/)
    expect(pruneOldSubmissions).toHaveBeenCalledWith(expect.anything(), 30)
  })

  it('uses DAILY_SUMMARY_TO_EMAIL when configured', async () => {
    getSubmissionsInRange.mockResolvedValueOnce([])

    await runDailySummary(
      { RESEND_API_KEY: 're_123', DAILY_SUMMARY_TO_EMAIL: 'custom@example.com' },
      { waitUntil: (p) => p }
    )

    const call = sendSupportEmail.mock.calls[0][0]
    expect(call.to).toEqual(['custom@example.com'])
  })

  it('does not prune when email sending fails', async () => {
    sendSupportEmail.mockResolvedValueOnce({ sent: false, status: 500, body: '{}' })
    getSubmissionsInRange.mockResolvedValueOnce([
      { id: 1, source: 'contact', created_at: new Date().toISOString(), email: 'a@example.com' },
    ])

    const result = await runDailySummary({ RESEND_API_KEY: 're_123' }, { waitUntil: (p) => p })

    expect(result.ok).toBe(false)
    expect(pruneOldSubmissions).not.toHaveBeenCalled()
  })

  it('omits the CSV attachment when it exceeds the size limit', async () => {
    const bigRow = {
      id: 1,
      source: 'contact',
      created_at: '2026-08-27T06:00:00.000Z',
      email: 'a@example.com',
      name: 'A',
      country: 'SE',
      subject: 'S',
      message: 'x'.repeat(MAX_ATTACHMENT_BYTES + 1000),
      body: null,
      metadata: null,
    }
    getSubmissionsInRange.mockResolvedValueOnce([bigRow])
    getEventsInRange.mockResolvedValueOnce([])

    await runDailySummary({ RESEND_API_KEY: 're_123' }, { waitUntil: (p) => p })

    const call = sendSupportEmail.mock.calls[0][0]
    expect(call.attachments).toHaveLength(0)
    expect(call.html).toContain('CSV attachment(s) omitted')
  })
})

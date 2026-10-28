import { describe, expect, it } from 'vitest'
import { buildWebsiteSummary } from './_websiteSummary.js'
import { buildDailySummaryEmail } from './_emailTemplates.js'
import { buildCsv, buildEventsCsv } from './_dailySummary.js'

const start = '2026-10-27T05:00:00.000Z'
const end = '2026-10-28T06:00:00.000Z'
const productMeta = { hostname: 'par.datomer.eu', campaign: { utm_source: 'linkedin', utm_medium: 'paid_social', utm_campaign: 'beta' }, sessionStartedAt: '2026-10-28T05:00:00.000Z' }
const companyMeta = { hostname: 'datomer.eu', campaign: {}, sessionStartedAt: '2026-10-27T04:50:00.000Z' }
const event = (type, page, meta, session = 'session-1') => ({ type, page_path: page, session_id: session, metadata: JSON.stringify(meta) })

describe('website summary metrics', () => {
  const events = [
    event('pageview', '/', productMeta),
    event('heartbeat', '/', productMeta),
    event('pageview', '/get-started', productMeta),
    event('hidden', '/get-started', productMeta),
    event('pageview', '/', companyMeta),
    event('pageview', '/legacy', {}),
  ]
  const rows = [
    { source: 'download', metadata: JSON.stringify({ ...productMeta, sessionId: 'session-1', pagePath: '/get-started' }) },
    { source: 'contact', metadata: JSON.stringify({ hostname: 'datomer.eu' }) },
  ]

  it('separates sites, counts only pageviews and distinguishes new sessions from returning sessions', () => {
    const report = buildWebsiteSummary(rows, events, start, end)
    expect(report.sites).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: 'Pär — par.datomer.eu', sessions: 1, newSessions: 1, pageviews: 2, downloads: 1, enquiries: 0 }),
      expect.objectContaining({ label: 'Company — datomer.eu', sessions: 1, newSessions: 0, pageviews: 1, enquiries: 1 }),
      expect.objectContaining({ label: 'Unknown / legacy', pageviews: 1, newSessions: 0 }),
    ]))
    expect(report.pages.find(item => item.label === 'Pär — par.datomer.eu · /')).toMatchObject({ pageviews: 1 })
    expect(report.campaigns.find(item => item.label.includes('utm_campaign=beta'))).toMatchObject({ sessions: 1, pageviews: 2, downloads: 1 })
    expect(report.campaigns.find(item => item.label === 'Company — datomer.eu · Unattributed / legacy')).toMatchObject({ enquiries: 1 })
  })

  it('includes accurate site/page/campaign metrics and limitations in both email formats', () => {
    const { html, text } = buildDailySummaryEmail({ rows, events, dateLabel: '2026-10-28', windowStart: start, windowEnd: end })
    for (const body of [html, text]) {
      expect(body).toContain('Activity by site')
      expect(body).toContain('Activity by page')
      expect(body).toContain('Activity by campaign')
      expect(body).toContain('utm_campaign=beta')
      expect(body).toContain('not first-ever visitors')
      expect(body).toContain(start)
    }
    expect(text).toContain('Pär — par.datomer.eu: 1 sessions; 1 new sessions; 2 page visits; 1 download requests')
  })

  it('exposes site and campaign columns in both CSV exports', () => {
    for (const csv of [buildCsv(rows), buildEventsCsv(events)]) {
      expect(csv).toContain('hostname')
      expect(csv).toContain('par.datomer.eu')
      expect(csv).toContain('utm_campaign=beta')
    }
  })
})

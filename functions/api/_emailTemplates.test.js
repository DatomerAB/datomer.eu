import { describe, expect, it } from 'vitest'
import {
  getFirstName,
  escapeHtml,
  formatInterests,
  buildContactSupportEmail,
  buildContactConfirmationEmail,
  buildWaitlistSupportEmail,
  buildWaitlistConfirmationEmail,
  buildDailySummaryEmail,
} from './_emailTemplates.js'

describe('email templates', () => {
  it('extracts first name', () => {
    expect(getFirstName('Anna Svensson')).toBe('Anna')
    expect(getFirstName('Björn')).toBe('Björn')
    expect(getFirstName('')).toBe('there')
  })

  it('escapes HTML', () => {
    expect(escapeHtml('<script>alert("x")</script>')).toBe('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;')
  })

  it('formats interests', () => {
    expect(formatInterests({ productUpdates: true, betaAccess: true, changelog: false })).toEqual([
      'Product updates',
      'Early beta access',
    ])
    expect(formatInterests({})).toEqual([])
  })

  it('builds a branded contact support email', () => {
    const { subject, html, text, replyTo } = buildContactSupportEmail({
      name: 'Anna Svensson',
      email: 'anna@example.com',
      message: 'Hello, I have a question.',
      action: 'contact-page',
      environment: 'preview',
      country: 'SE',
      city: 'Stockholm',
    })

    expect(subject).toBe('New message from Anna — Pär')
    expect(replyTo).toBe('anna@example.com')
    expect(html).toContain('New contact enquiry')
    expect(html).toContain('anna@example.com')
    expect(html).toContain('Hello, I have a question.')
    expect(html).toContain('Action')
    expect(html).toContain('Environment')
    expect(html).toContain('Datomer AB')
    expect(text).toContain('New contact enquiry')
  })

  it('builds a branded contact confirmation email', () => {
    const { subject, html, text } = buildContactConfirmationEmail({
      name: 'Anna Svensson',
      message: 'Hello',
    })

    expect(subject).toBe('We received your message — Pär')
    expect(html).toContain('Hi Anna')
    expect(html).toContain('privacy, transparency, and ownership')
    expect(text).toContain('Hi Anna')
  })

  it('builds a waitlist support email with interest-based subject', () => {
    const { subject, html, text } = buildWaitlistSupportEmail({
      type: 'waitlist',
      name: 'Anna Svensson',
      email: 'anna@example.com',
      phone: '+46701234567',
      country: 'SE',
      interests: { productUpdates: true, betaAccess: true, changelog: false },
      source: 'homepage-cta',
      action: 'waitlist-hero',
      environment: 'production',
      city: 'Stockholm',
    })

    expect(subject).toBe('Anna joined the Pär beta waitlist')
    expect(html).toContain('Anna')
    expect(html).toContain('Early beta access')
    expect(html).toContain('Product updates')
    expect(html).toContain('Action')
    expect(html).toContain('Environment')
    expect(text).toContain('anna@example.com')
  })

  it('builds a waitlist confirmation email that references selected interests', () => {
    const { subject, html, text } = buildWaitlistConfirmationEmail({
      type: 'waitlist',
      name: 'Anna Svensson',
      email: 'anna@example.com',
      interests: { productUpdates: true, betaAccess: true, changelog: false },
    })

    expect(subject).toBe('You are on the Pär beta waitlist — Pär')
    expect(html).toContain('Hi Anna')
    expect(html).toContain('Early beta access')
    expect(html).toContain('Beta access is limited')
    expect(text).toContain('Hi Anna')
  })

  it('builds a daily summary email for an empty day', () => {
    const { subject, html, text } = buildDailySummaryEmail({ rows: [], dateLabel: '2026-08-27' })

    expect(subject).toBe('Datomer daily summary — 0 submissions — 2026-08-27')
    expect(html).toContain('No submissions in the last 24 hours')
    expect(text).toContain('No submissions in the last 24 hours')
  })

  it('builds a daily summary email grouped by environment, source and action', () => {
    const rows = [
      { source: 'contact', created_at: '2026-08-27T06:00:00.000Z', email: 'a@example.com', name: 'A', country: 'SE', subject: 'S', message: 'Hello', body: null, metadata: JSON.stringify({ environment: 'production', action: 'contact-page', timeOnSiteMs: 12000 }) },
      { source: 'download', created_at: '2026-08-27T07:00:00.000Z', email: 'b@example.com', name: 'B', country: 'US', subject: 'D', message: null, body: 'Body', metadata: JSON.stringify({ environment: 'preview', action: 'download-hero', timeOnSiteMs: 5000 }) },
    ]
    const { subject, html, text } = buildDailySummaryEmail({ rows, dateLabel: '2026-08-27' })

    expect(subject).toBe('Datomer daily summary — 2 submissions — 2026-08-27')
    expect(html).toContain('production · contact · contact-page (1)')
    expect(html).toContain('preview · download · download-hero (1)')
    expect(text).toContain('production · contact · contact-page (1)')
    expect(text).toContain('preview · download · download-hero (1)')
    expect(html).toContain('Average time on site')
  })
})

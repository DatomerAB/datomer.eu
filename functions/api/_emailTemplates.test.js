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
  it.each(['en', 'sv'])('keeps company enquiries separate from product emails in %s', locale => {
    const contact = { name: 'Test User', email: 'test@example.com', message: 'Data strategy', site: 'company', locale }
    for (const email of [buildContactSupportEmail(contact), buildContactConfirmationEmail(contact)]) {
      expect(email.site).toBe('company')
      expect(email.subject).toContain('Datomer AB')
      expect(email.html).toContain('href="https://datomer.eu"')
      expect(email.html).toContain('href="https://par.datomer.eu"')
      expect(email.text).toContain('https://datomer.eu')
      expect(email.text).toContain('https://par.datomer.eu')
    }
  })
  it.each(['company', 'product'])('uses the %s site favicon as the email header icon', site => {
    const email = buildContactConfirmationEmail({ name: 'Test', message: 'Hello', site })
    const document = new DOMParser().parseFromString(email.html, 'text/html')
    const header = document.querySelector('img')
    expect(header.getAttribute('src')).toBe(site === 'company'
      ? 'https://datomer.eu/datomer-icon.png?v=20261029'
      : 'https://par.datomer.eu/par-logo.png')
    expect(header.getAttribute('width')).toBe('80')
    expect(header.getAttribute('height')).toBe('80')
    expect(email.site).toBe(site)
    const address = site === 'company' ? 'hello@datomer.eu' : 'Par@datomer.eu'
    expect(email.html).toContain(`href="mailto:${address}"`)
    expect(email.text).toContain(address)
    expect(email.text).not.toContain(site === 'company' ? 'Par@datomer.eu' : 'hello@datomer.eu')
  })
  it('uses the approved Datomer logo in every shared email while preserving the Par header', () => {
    const contact = { name: 'Brand Tester', email: 'brand@example.com', message: 'Brand preview' }
    const waitlist = { ...contact, type: 'waitlist', interests: {} }
    const emails = [
      buildContactSupportEmail(contact),
      buildContactConfirmationEmail(contact),
      buildWaitlistSupportEmail(waitlist),
      buildWaitlistConfirmationEmail(waitlist),
      buildDailySummaryEmail({ rows: [], events: [], dateLabel: '2026-10-10' }),
    ]
    for (const email of emails) {
      expect(email.html).toContain('src="https://datomer.eu/datomer-logo.png?v=20261010"')
      expect(email.html).toContain('src="https://par.datomer.eu/par-logo.png"')
    }
  })

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
    const { subject, html, text } = buildDailySummaryEmail({ rows: [], events: [], dateLabel: '2026-08-27' })

    expect(subject).toBe('Datomer daily summary — 0 submissions, 0 events — 2026-08-27')
    expect(html).toContain('No recorded submissions or website events in the last 25 hours')
    expect(text).toContain('No recorded submissions or website events in the last 25 hours')
    expect(text).toContain('This does not mean there were no visitors')
  })

  it('builds a daily summary email grouped by environment, source and action', () => {
    const rows = [
      { source: 'contact', created_at: '2026-08-27T06:00:00.000Z', email: 'a@example.com', name: 'A', country: 'SE', subject: 'S', message: 'Hello', body: null, metadata: JSON.stringify({ environment: 'production', action: 'contact-page', timeOnSiteMs: 12000 }) },
      { source: 'download', created_at: '2026-08-27T07:00:00.000Z', email: 'b@example.com', name: 'B', country: 'US', subject: 'D', message: null, body: 'Body', metadata: JSON.stringify({ environment: 'preview', action: 'download-hero', timeOnSiteMs: 5000 }) },
    ]
    const events = [
      { session_id: 's1', created_at: '2026-08-27T06:05:00.000Z', type: 'pageview', page_path: '/', metadata: '{}' },
      { session_id: 's2', created_at: '2026-08-27T06:06:00.000Z', type: 'heartbeat', page_path: '/pricing', metadata: '{}' },
    ]
    const { subject, html, text } = buildDailySummaryEmail({ rows, events, dateLabel: '2026-08-27' })

    expect(subject).toBe('Datomer daily summary — 2 submissions, 2 events — 2026-08-27')
    expect(html).toContain('production · contact · contact-page (1)')
    expect(html).toContain('preview · download · download-hero (1)')
    expect(html).toContain('Website events (2)')
    expect(html).toContain('Unique sessions:')
    expect(html).toContain('>2<')
    expect(text).toContain('production · contact · contact-page (1)')
    expect(text).toContain('preview · download · download-hero (1)')
    expect(html).toContain('Average time on site')
  })

  it('uses action-aware subjects and body copy for download CTAs', () => {
    const topbar = buildWaitlistConfirmationEmail({ type: 'download', name: 'Anna', email: 'anna@example.com', action: 'download-topbar' })
    expect(topbar.subject).toBe('Your Pär free version download — Pär')
    expect(topbar.html).toContain('the free version of Pär')

    const hero = buildWaitlistConfirmationEmail({ type: 'download', name: 'Anna', email: 'anna@example.com', action: 'download-hero' })
    expect(hero.subject).toBe('Your Pär for Mac download — Pär')
    expect(hero.html).toContain('Pär for Mac')

    const pricing = buildWaitlistConfirmationEmail({ type: 'download', name: 'Anna', email: 'anna@example.com', action: 'download-pricing-free' })
    expect(pricing.subject).toBe('Your Pär free tier download — Pär')
    expect(pricing.html).toContain('the Pär free tier')

    const cta = buildWaitlistConfirmationEmail({ type: 'download', name: 'Anna', email: 'anna@example.com', action: 'download-cta-band' })
    expect(cta.subject).toBe('Your Pär Mac beta download — Pär')
    expect(cta.html).toContain('the Pär Mac beta')

    const support = buildWaitlistSupportEmail({ type: 'download', name: 'Anna Svensson', email: 'anna@example.com', action: 'download-pricing-free' })
    expect(support.subject).toBe('Anna downloaded the Pär free tier')
  })

  it.each([
    ['en', 'Hi Anna'],
    ['sv', 'Hej Anna'],
    ['de', 'Hallo Anna'],
  ])('greets by name only once in %s download and waitlist confirmations', (locale, greeting) => {
    const count = (value) => value.split(greeting).length - 1
    const download = buildWaitlistConfirmationEmail({ type: 'download', name: 'Anna', email: 'a@example.com', locale, action: 'download-hero' })
    const waitlist = buildWaitlistConfirmationEmail({ type: 'waitlist', name: 'Anna', email: 'a@example.com', locale, interests: { productUpdates: true, betaAccess: true } })
    for (const email of [download, waitlist]) {
      expect(count(email.html.replace(/<title>.*?<\/title>/, ''))).toBe(1)
      expect(count(email.text)).toBe(1)
    }
  })

  it.each(['product', 'company'])('links to both Datomer and Pär in the %s email footer', (site) => {
    const email = buildContactConfirmationEmail({ name: 'Anna', message: 'Hi', site })
    expect(email.html).toContain('href="https://datomer.eu"')
    expect(email.html).toContain('href="https://par.datomer.eu"')
    expect(email.html).toContain('datomer-icon.png')
    expect(email.text).toContain('Datomer AB: https://datomer.eu')
    expect(email.text).toContain('Pär: https://par.datomer.eu')
  })

  it('does not repeat the title in the plain-text body', () => {
    const { text } = buildWaitlistConfirmationEmail({ type: 'download', name: 'Anna', email: 'a@example.com', action: 'download-hero' })
    expect(text.split('Hi Anna').length - 1).toBe(1)
  })

  it('never puts double quotes inside inline style attributes', () => {
    const { html } = buildContactConfirmationEmail({ name: 'Anna', message: 'Hi' })
    const styles = [...html.matchAll(/style="([^"]*)"/g)].map((m) => m[1])
    expect(styles.some((value) => value.includes('font-family'))).toBe(true)
    expect(html).not.toMatch(/style="[^">]*font-family:[^">]*&quot;/)
    expect(html).not.toMatch(/font-family: [^;"]*"[A-Za-z]/)
  })
})

import { sendSupportEmail } from './_email.js'
import { getSubmissionsInRange, getEventsInRange, pruneOldSubmissions } from './_db.js'
import { buildDailySummaryEmail } from './_emailTemplates.js'

export const DEFAULT_SUMMARY_TO_EMAIL = 'dailysummary@datomer.eu'
export const RETENTION_DAYS = 30
// Resend attachment limit is ~10 MB total; stay safely under it.
export const MAX_ATTACHMENT_BYTES = 9 * 1024 * 1024

export function getSummaryToEmail(env) {
  return env.DAILY_SUMMARY_TO_EMAIL || DEFAULT_SUMMARY_TO_EMAIL
}

function formatLocalTime(iso) {
  try {
    return new Date(iso).toISOString().replace('T', ' ').slice(0, 19)
  } catch {
    return iso
  }
}

function escapeCsv(value) {
  const str = value == null ? '' : String(value)
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

export function getSummaryWindow(referenceTime = new Date()) {
  const t = new Date(referenceTime)
  const end = t
  const start = new Date(end.getTime() - 24 * 60 * 60 * 1000)
  return { start: start.toISOString(), end: end.toISOString() }
}

function parseMetadata(row) {
  try {
    return row.metadata ? JSON.parse(row.metadata) : {}
  } catch {
    return {}
  }
}

function seconds(ms) {
  if (ms == null || Number.isNaN(ms)) return 0
  return Math.round(Number(ms) / 1000)
}

export function buildCsv(rows) {
  const headers = ['environment', 'action', 'category', 'time', 'from_email', 'name', 'country', 'city', 'time_on_site_seconds', 'subject', 'message', 'body', 'metadata']
  const lines = [headers.join(',')]
  for (const row of rows) {
    const metadata = parseMetadata(row)
    const values = [
      metadata.environment || 'unknown',
      metadata.action || 'unspecified',
      row.source,
      formatLocalTime(row.created_at),
      row.email || '',
      row.name || '',
      row.country || metadata.country || '',
      metadata.city || '',
      seconds(metadata.timeOnSiteMs),
      row.subject || '',
      row.message || '',
      row.body || '',
      JSON.stringify(metadata),
    ]
    lines.push(values.map(escapeCsv).join(','))
  }
  return lines.join('\n')
}

export function buildEventsCsv(rows) {
  const headers = ['session_id', 'time', 'type', 'page_path', 'metadata']
  const lines = [headers.join(',')]
  for (const row of rows) {
    const metadata = parseMetadata(row)
    const values = [
      row.session_id || '',
      formatLocalTime(row.created_at),
      row.type || '',
      row.page_path || '',
      JSON.stringify(metadata),
    ]
    lines.push(values.map(escapeCsv).join(','))
  }
  return lines.join('\n')
}

export async function runDailySummary(env, ctx, options = {}) {
  const referenceTime = options.scheduledTime || options.referenceTime || new Date()
  const { start, end } = getSummaryWindow(referenceTime)

  console.log('[daily-summary] running for window', start, 'to', end)

  const rows = await getSubmissionsInRange(env, start, end)
  const events = await getEventsInRange(env, start, end)
  console.log('[daily-summary] found', rows.length, 'submission(s) and', events.length, 'event(s)')

  const csv = buildCsv(rows)
  const csvBytes = new TextEncoder().encode(csv).length
  const csvBase64 = utf8ToBase64(csv)
  const filename = `datomer-submissions-${end.slice(0, 10)}.csv`

  const eventsCsv = buildEventsCsv(events)
  const eventsCsvBytes = new TextEncoder().encode(eventsCsv).length
  const eventsCsvBase64 = utf8ToBase64(eventsCsv)
  const eventsFilename = `datomer-events-${end.slice(0, 10)}.csv`

  const { subject, html: summaryHtml, text: summaryText } = buildDailySummaryEmail({ rows, events, dateLabel: end.slice(0, 10) })
  let html = summaryHtml
  let text = summaryText
  const attachments = []

  const totalAttachmentBytes = csvBytes + eventsCsvBytes
  if (totalAttachmentBytes <= MAX_ATTACHMENT_BYTES) {
    attachments.push({ filename, content: csvBase64 })
    if (events.length > 0) {
      attachments.push({ filename: eventsFilename, content: eventsCsvBase64 })
    }
  } else {
    const note = `CSV attachment(s) omitted because total size exceeds limits (${(totalAttachmentBytes / 1024 / 1024).toFixed(1)} MB). Data is still shown in the body above.`
    html += `<p><strong>Note:</strong> ${note}</p>`
    text += `\n\nNote: ${note}`
    console.warn('[daily-summary]', note)
  }

  const result = await sendSupportEmail({
    env,
    to: [getSummaryToEmail(env)],
    subject,
    html,
    text,
    attachments,
  })

  console.log('[daily-summary] summary email result:', JSON.stringify(result))

  // Only prune after the summary email is successfully accepted by Resend.
  // If sending fails, the next run will still cover the same window and we
  // avoid deleting data before it has been summarised.
  if (result.sent) {
    const prune = async () => {
      const pruneResult = await pruneOldSubmissions(env, RETENTION_DAYS)
      console.log('[daily-summary] prune result:', JSON.stringify(pruneResult))
      return pruneResult
    }

    if (ctx?.waitUntil) {
      ctx.waitUntil(prune())
    } else {
      await prune()
    }
  } else {
    console.error('[daily-summary] email not sent; skipping prune to avoid data loss')
  }

  return { ok: result.sent, count: rows.length, emailResult: result }
}

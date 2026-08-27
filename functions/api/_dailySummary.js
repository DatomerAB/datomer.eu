import { sendSupportEmail } from './_email.js'
import { getSubmissionsSince, pruneOldSubmissions } from './_db.js'

export const SUMMARY_TO_EMAIL = 'dailysummary@datomer.eu'
export const RETENTION_DAYS = 30

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

export function buildCsv(rows) {
  const headers = ['category', 'time', 'from_email', 'name', 'country', 'subject', 'message', 'body', 'metadata']
  const lines = [headers.join(',')]
  for (const row of rows) {
    const metadata = row.metadata ? JSON.parse(row.metadata) : {}
    const values = [
      row.source,
      formatLocalTime(row.created_at),
      row.email || '',
      row.name || '',
      row.country || '',
      row.subject || '',
      row.message || '',
      row.body || '',
      JSON.stringify(metadata),
    ]
    lines.push(values.map(escapeCsv).join(','))
  }
  return lines.join('\n')
}

export function buildHtmlSummary(rows) {
  if (rows.length === 0) {
    return `<p>No submissions in the last 24 hours.</p>`
  }

  const bySource = {}
  for (const row of rows) {
    bySource[row.source] = bySource[row.source] || []
    bySource[row.source].push(row)
  }

  let html = `<h2>Daily submission summary</h2>`
  html += `<p><strong>Total:</strong> ${rows.length} submission(s)</p>`

  for (const [source, items] of Object.entries(bySource)) {
    html += `<h3>${source} (${items.length})</h3>`
    html += `<table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; margin-bottom: 24px;">`
    html += `<tr><th>Time</th><th>Email</th><th>Name</th><th>Country</th><th>Subject</th><th>Message / Body</th></tr>`
    for (const row of items) {
      const snippet = (row.message || row.body || '').slice(0, 200).replace(/\n/g, '<br>')
      html += `<tr>`
      html += `<td>${formatLocalTime(row.created_at)}</td>`
      html += `<td>${row.email || '-'}</td>`
      html += `<td>${row.name || '-'}</td>`
      html += `<td>${row.country || '-'}</td>`
      html += `<td>${row.subject || '-'}</td>`
      html += `<td>${snippet || '-'}${(row.message || row.body || '').length > 200 ? '…' : ''}</td>`
      html += `</tr>`
    }
    html += `</table>`
  }

  html += `<hr /><p><small>Datomer AB · hello@datomer.eu</small></p>`
  return html
}

export function buildTextSummary(rows) {
  if (rows.length === 0) {
    return 'No submissions in the last 24 hours.'
  }

  const bySource = {}
  for (const row of rows) {
    bySource[row.source] = bySource[row.source] || []
    bySource[row.source].push(row)
  }

  let text = `Daily submission summary\nTotal: ${rows.length} submission(s)\n\n`
  for (const [source, items] of Object.entries(bySource)) {
    text += `${source} (${items.length})\n${'='.repeat(source.length + ` (${items.length})`.length)}\n`
    for (const row of items) {
      text += `- Time: ${formatLocalTime(row.created_at)}\n`
      text += `  Email: ${row.email || '-'}\n`
      text += `  Name: ${row.name || '-'}\n`
      text += `  Country: ${row.country || '-'}\n`
      text += `  Subject: ${row.subject || '-'}\n`
      text += `  Message/Body: ${(row.message || row.body || '-').slice(0, 200)}\n\n`
    }
  }

  text += `---\nDatomer AB · hello@datomer.eu`
  return text
}

export async function runDailySummary(env, ctx) {
  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const since = yesterday.toISOString()

  console.log('[daily-summary] running for window', since, 'to', now.toISOString())

  const rows = await getSubmissionsSince(env, since)
  console.log('[daily-summary] found', rows.length, 'submission(s)')

  const csv = buildCsv(rows)
  const csvBase64 = btoa(unescape(encodeURIComponent(csv)))
  const filename = `datomer-submissions-${now.toISOString().slice(0, 10)}.csv`

  const subject = `Datomer daily summary — ${rows.length} submission(s) — ${now.toISOString().slice(0, 10)}`

  const result = await sendSupportEmail({
    env,
    to: [SUMMARY_TO_EMAIL],
    subject,
    html: buildHtmlSummary(rows),
    text: buildTextSummary(rows),
    attachments: [
      {
        filename,
        content: csvBase64,
      },
    ],
  })

  console.log('[daily-summary] summary email result:', JSON.stringify(result))

  if (ctx?.waitUntil) {
    ctx.waitUntil(pruneOldSubmissions(env, RETENTION_DAYS))
  } else {
    await pruneOldSubmissions(env, RETENTION_DAYS)
  }

  return { ok: true, count: rows.length, emailResult: result }
}

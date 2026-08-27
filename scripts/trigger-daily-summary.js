#!/usr/bin/env node
// Manual trigger helper for the daily summary email.
// Usage:
//   node scripts/trigger-daily-summary.js worker
//   node scripts/trigger-daily-summary.js pages <preview-url>
//
// Requires DAILY_SUMMARY_SECRET in the environment.

const USAGE = `Usage:
  node scripts/trigger-daily-summary.js worker
  node scripts/trigger-daily-summary.js pages <host>

Examples:
  node scripts/trigger-daily-summary.js worker
  node scripts/trigger-daily-summary.js pages https://datomer.eu
  node scripts/trigger-daily-summary.js pages https://451ff362.datomer-eu.pages.dev

Set DAILY_SUMMARY_SECRET as an environment variable. For the worker target you
can also set DAILY_SUMMARY_WORKER_URL (defaults to the production Worker).`

const target = process.argv[2]
const host = process.argv[3]
const secret = process.env.DAILY_SUMMARY_SECRET

if (!target || !['worker', 'pages'].includes(target)) {
  console.error(USAGE)
  process.exit(1)
}

if (!secret) {
  console.error('Error: DAILY_SUMMARY_SECRET is not set.')
  process.exit(1)
}

let url
if (target === 'worker') {
  url = process.env.DAILY_SUMMARY_WORKER_URL || 'https://datomer-daily-summary-production.jay-tchinnaswamy.workers.dev/'
} else {
  if (!host) {
    console.error('Error: pages target requires a host argument.\n')
    console.error(USAGE)
    process.exit(1)
  }
  url = `${host.replace(/\/$/, '')}/api/admin/daily-summary`
}

console.log(`Triggering daily summary via ${target}:`)
console.log(`  ${url}`)

const res = await fetch(url, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${secret}`,
    'Content-Type': 'application/json',
  },
})

const bodyText = await res.text()
let body

try {
  body = JSON.parse(bodyText)
} catch {
  body = bodyText
}

console.log(`  status: ${res.status}`)
console.log('  response:', JSON.stringify(body, null, 2))

process.exit(res.ok ? 0 : 1)

import { runDailySummary } from '../_dailySummary.js'

function unauthorized(message) {
  return new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function onRequestGet(context) {
  return handleRequest(context)
}

export async function onRequestPost(context) {
  return handleRequest(context)
}

async function handleRequest(context) {
  const { request, env } = context

  const expectedSecret = env.DAILY_SUMMARY_SECRET
  if (!expectedSecret) {
    console.error('[daily-summary] DAILY_SUMMARY_SECRET is not configured')
    return unauthorized('Daily summary is not configured.')
  }

  const authHeader = request.headers.get('Authorization') || ''
  const token = authHeader.replace(/^Bearer\s+/i, '').trim()

  if (!token || token !== expectedSecret) {
    console.warn('[daily-summary] invalid or missing token')
    return unauthorized('Unauthorized.')
  }

  try {
    const result = await runDailySummary(env, context)
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[daily-summary] handler error:', err.message || err)
    return new Response(JSON.stringify({ error: err.message || 'Unexpected error.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

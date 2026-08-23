import { verifyTurnstileToken } from './_turnstile.js'

export async function onRequestPost(context) {
  const { request, env } = context

  let body
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { name, email, phone, country, type = 'download', locale = 'en', timestamp, turnstileToken } = body

  if (!email) {
    return new Response(JSON.stringify({ error: 'Email is required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (type !== 'waitlist' && (!name || !country)) {
    return new Response(JSON.stringify({ error: 'Name, email, and country are required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const turnstileCheck = await verifyTurnstileToken(turnstileToken, env.TURNSTILE_SECRET_KEY)
  if (!turnstileCheck.success) {
    return new Response(JSON.stringify({ error: turnstileCheck.error }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const payload = {
    name: name ? String(name).trim() : 'Subscriber',
    email: String(email).trim().toLowerCase(),
    phone: phone ? String(phone).trim() : '',
    country: country ? String(country).toUpperCase() : 'XX',
    type,
    locale,
    timestamp: timestamp || new Date().toISOString(),
  }

  // If a webhook URL is configured (e.g. Zapier, Make, Slack), forward the submission.
  if (env.WAITLIST_WEBHOOK_URL) {
    try {
      await fetch(env.WAITLIST_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } catch {
      // Non-blocking: still return success even if webhook fails.
    }
  }

  // TODO: connect to a real store (Airtable, Google Sheets, Supabase, Stripe customer, etc.)
  // For now, return success so the frontend can proceed with the download.
  return new Response(JSON.stringify({ ok: true, payload }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

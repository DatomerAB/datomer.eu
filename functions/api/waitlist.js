import { verifyTurnstileToken } from './_turnstile.js'
import { sendSupportEmail } from './_email.js'

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

  if (type !== 'waitlist' && type !== 'newsletter' && (!name || !country)) {
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

  const labelMap = {
    waitlist: 'waitlist-form',
    newsletter: 'newsletter-form',
    download: 'download-form',
  }
  const sourceLabel = labelMap[payload.type] || payload.type

  const subjectMap = {
    waitlist: `Waitlist signup: ${payload.email}`,
    newsletter: `Newsletter signup: ${payload.email}`,
    download: `Download request: ${payload.name} (${payload.email})`,
  }
  const subject = subjectMap[payload.type] || `Form submission: ${payload.email}`

  const detailsHtml = Object.entries(payload)
    .map(([key, value]) => `<p><strong>${key}:</strong> ${String(value).replace(/\n/g, '<br>')}</p>`)
    .join('\n')

  const detailsText = Object.entries(payload)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n')

  await sendSupportEmail({
    env,
    subject,
    replyTo: payload.email,
    html: `
      <p><strong>[source: ${sourceLabel}]</strong></p>
      <h2>New ${sourceLabel.replace(/-/g, ' ')} submission</h2>
      ${detailsHtml}
    `,
    text: `[source: ${sourceLabel}]\n\nNew ${sourceLabel.replace(/-/g, ' ')} submission\n\n${detailsText}`,
  })

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

  return new Response(JSON.stringify({ ok: true, payload }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

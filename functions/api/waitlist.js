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

  const supportResult = await sendSupportEmail({
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
  console.log('[waitlist] support email result:', JSON.stringify(supportResult))

  const confirmationSubjectMap = {
    waitlist: 'You are on the Pär waitlist',
    newsletter: 'You are subscribed to Pär updates',
    download: 'Thank you for downloading Pär beta',
  }
  const confirmationSubject = confirmationSubjectMap[payload.type] || 'Thank you for signing up'

  const confirmationBodyMap = {
    waitlist: '<p>Thank you for joining the waitlist. We will email you with beta spots, updates, and launch notes.</p>',
    newsletter: '<p>Thank you for subscribing. You will receive product updates, release notes, and early access announcements.</p>',
    download: '<p>Thank you for your interest in the Pär beta. Your download should start automatically. We will email you when updates are available.</p>',
  }
  const confirmationBodyHtml = confirmationBodyMap[payload.type] || '<p>Thank you for signing up.</p>'
  const confirmationBodyText = confirmationBodyHtml.replace(/<[^>]+>/g, '')

  const confirmationResult = await sendSupportEmail({
    env,
    to: [payload.email],
    subject: confirmationSubject,
    html: `
      <h2>Thank you, ${payload.name}</h2>
      ${confirmationBodyHtml}
      <hr />
      <p><small>Datomer AB · hello@datomer.eu</small></p>
    `,
    text: `Thank you, ${payload.name}.\n\n${confirmationBodyText}\n\n---\nDatomer AB · hello@datomer.eu`,
  })
  console.log('[waitlist] confirmation email result:', JSON.stringify(confirmationResult))

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

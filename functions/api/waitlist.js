import { verifyTurnstileToken } from './_turnstile.js'
import { sendSupportEmail } from './_email.js'
import { insertSubmission } from './_db.js'
import { buildWaitlistSupportEmail, buildWaitlistConfirmationEmail } from './_emailTemplates.js'
import { getTrackingMeta } from './_tracking.js'

export async function onRequestPost(context) {
  const { request, env, ctx } = context

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

  const createdAt = timestamp || new Date().toISOString()
  const payload = {
    name: name ? String(name).trim() : 'Subscriber',
    email: String(email).trim().toLowerCase(),
    phone: phone ? String(phone).trim() : '',
    country: country ? String(country).toUpperCase() : 'XX',
    type,
    locale,
    timestamp: createdAt,
  }

  const sourceLabel = `${payload.type}-form`
  const interests = body.interests || {}
  const tracking = getTrackingMeta({ request, env, body })

  const supportEmail = buildWaitlistSupportEmail({
    type: payload.type,
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    country: payload.country,
    interests,
    source: body.source,
    locale: payload.locale,
    action: tracking.action,
    environment: tracking.environment,
    city: tracking.city,
  })
  const supportResult = await sendSupportEmail({ env, ...supportEmail })
  console.log('[waitlist] support email result:', JSON.stringify(supportResult))

  const confirmationEmail = buildWaitlistConfirmationEmail({
    type: payload.type,
    name: payload.name,
    email: payload.email,
    interests,
    locale: payload.locale,
  })
  const confirmationResult = await sendSupportEmail({ env, to: [payload.email], ...confirmationEmail })
  console.log('[waitlist] confirmation email result:', JSON.stringify(confirmationResult))

  const detailsText = [
    `Form: ${payload.type}`,
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone || '-'}`,
    `Country: ${payload.country}`,
    `Action: ${tracking.action}`,
    `Environment: ${tracking.environment}`,
    `City: ${tracking.city}`,
  ].join('\n')

  // Non-blocking: store submission for daily summary.
  ctx?.waitUntil?.(
    insertSubmission(env, {
      source: sourceLabel.replace(/-form$/, ''),
      createdAt,
      email: payload.email,
      name: payload.name,
      country: payload.country,
      subject: supportEmail.subject,
      message: null,
      body: detailsText,
      metadata: {
        type: payload.type,
        phone: payload.phone,
        locale: payload.locale,
        interests: body.interests,
        action: tracking.action,
        environment: tracking.environment,
        sessionId: tracking.sessionId,
        city: tracking.city,
        region: tracking.region,
        timezone: tracking.timezone,
        timeOnSiteMs: tracking.timeOnSiteMs,
        pagePath: tracking.pagePath,
      },
    })
  )

  // 
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

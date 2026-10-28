import { verifyTurnstileToken } from './_turnstile.js'
import { sendSupportEmail } from './_email.js'
import { insertSubmission } from './_db.js'
import { buildContactSupportEmail, buildContactConfirmationEmail } from './_emailTemplates.js'
import { getTrackingMeta } from './_tracking.js'
import { siteForUrl } from '../../src/lib/site.js'
import { resolveTopic, topicContent } from '../../src/content/contactTopics.js'

export async function onRequestPost(context) {
  const { request, env, waitUntil } = context

  let body
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { name, email, message, locale = 'en', topic, turnstileToken } = body

  if (!name || !email || !message) {
    return new Response(JSON.stringify({ error: 'Name, email, and message are required.' }), {
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

  const cleanedName = String(name).trim()
  const cleanedEmail = String(email).trim().toLowerCase()
  const cleanedMessage = String(message).trim()
  const createdAt = new Date().toISOString()
  const tracking = getTrackingMeta({ request, env, body })
  const site = siteForUrl(new URL(request.url))
  const { subject: topicSubject } = topicContent(resolveTopic(topic, site), 'en')

  const supportEmail = buildContactSupportEmail({
    name: cleanedName,
    email: cleanedEmail,
    message: cleanedMessage,
    locale,
    topicSubject,
    action: tracking.action,
    environment: tracking.environment,
    country: tracking.country,
    city: tracking.city,
    site,
  })
  await sendSupportEmail({ env, ...supportEmail })

  const confirmationEmail = buildContactConfirmationEmail({ name: cleanedName, message: cleanedMessage, locale, site })
  await sendSupportEmail({ env, to: [cleanedEmail], ...confirmationEmail })

  // Non-blocking: store submission for daily summary.
  waitUntil?.(
    insertSubmission(env, {
      source: 'contact',
      createdAt,
      email: cleanedEmail,
      name: cleanedName,
      subject: `${topicSubject} — ${cleanedName}`,
      message: cleanedMessage,
      body: `Name: ${cleanedName}\nEmail: ${cleanedEmail}\nMessage:\n${cleanedMessage}`,
      metadata: {
        hostname: tracking.hostname,
        site: tracking.site,
        campaign: tracking.campaign,
        sessionStartedAt: tracking.sessionStartedAt,
        locale,
        action: tracking.action,
        environment: tracking.environment,
        sessionId: tracking.sessionId,
        country: tracking.country,
        city: tracking.city,
        region: tracking.region,
        timezone: tracking.timezone,
        timeOnSiteMs: tracking.timeOnSiteMs,
        pagePath: tracking.pagePath,
      },
    })
  )

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

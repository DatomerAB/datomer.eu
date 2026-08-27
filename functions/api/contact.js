import { verifyTurnstileToken } from './_turnstile.js'
import { sendSupportEmail } from './_email.js'
import { insertSubmission } from './_db.js'
import { buildContactSupportEmail, buildContactConfirmationEmail } from './_emailTemplates.js'

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

  const { name, email, message, locale = 'en', turnstileToken } = body

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

  const supportEmail = buildContactSupportEmail({ name: cleanedName, email: cleanedEmail, message: cleanedMessage })
  await sendSupportEmail({ env, ...supportEmail })

  const confirmationEmail = buildContactConfirmationEmail({ name: cleanedName, message: cleanedMessage })
  await sendSupportEmail({ env, to: [cleanedEmail], ...confirmationEmail })

  // Non-blocking: store submission for daily summary.
  ctx?.waitUntil?.(
    insertSubmission(env, {
      source: 'contact',
      createdAt,
      email: cleanedEmail,
      name: cleanedName,
      subject: `Contact form: enquiry from ${cleanedName}`,
      message: cleanedMessage,
      body: `Name: ${cleanedName}\nEmail: ${cleanedEmail}\nMessage:\n${cleanedMessage}`,
      metadata: { locale },
    })
  )

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

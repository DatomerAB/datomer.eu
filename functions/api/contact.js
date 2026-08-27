import { verifyTurnstileToken } from './_turnstile.js'
import { sendSupportEmail } from './_email.js'
import { insertSubmission } from './_db.js'

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

  await sendSupportEmail({
    env,
    subject: `Contact form: enquiry from ${cleanedName}`,
    replyTo: cleanedEmail,
    html: `
      <p><strong>[source: contact-form]</strong></p>
      <h2>New contact form submission</h2>
      <p><strong>Name:</strong> ${cleanedName}</p>
      <p><strong>Email:</strong> ${cleanedEmail}</p>
      <p><strong>Message:</strong></p>
      <p>${cleanedMessage.replace(/\n/g, '<br>')}</p>
    `,
    text: `[source: contact-form]\n\nNew contact form submission\n\nName: ${cleanedName}\nEmail: ${cleanedEmail}\n\nMessage:\n${cleanedMessage}`,
  })

  await sendSupportEmail({
    env,
    to: [cleanedEmail],
    subject: 'We received your message',
    html: `
      <h2>Thank you, ${cleanedName}</h2>
      <p>We have received your message and will get back to you as soon as possible.</p>
      <p><strong>Your message:</strong></p>
      <p>${cleanedMessage.replace(/\n/g, '<br>')}</p>
      <hr />
      <p><small>Datomer AB · hello@datomer.eu</small></p>
    `,
    text: `Thank you, ${cleanedName}.\n\nWe have received your message and will get back to you as soon as possible.\n\nYour message:\n${cleanedMessage}\n\n---\nDatomer AB · hello@datomer.eu`,
  })

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

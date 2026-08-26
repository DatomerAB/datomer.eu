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

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

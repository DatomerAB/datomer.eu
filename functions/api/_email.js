const RESEND_ENDPOINT = 'https://api.resend.com/emails'
const DEFAULT_FROM_EMAIL = 'onboarding@resend.dev'
const DEFAULT_TO_EMAIL = 'hello@datomer.eu'

export async function sendSupportEmail({ env, to, subject, html, text, replyTo }) {
  if (!env.RESEND_API_KEY) {
    return { sent: false }
  }

  const recipients = Array.isArray(to) && to.length > 0 ? to : [env.CONTACT_TO_EMAIL || DEFAULT_TO_EMAIL]

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL,
        to: recipients,
        ...(replyTo ? { reply_to: replyTo } : {}),
        subject,
        html,
        text,
      }),
    })

    return { sent: response.ok }
  } catch {
    return { sent: false }
  }
}

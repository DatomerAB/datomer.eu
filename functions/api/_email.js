const RESEND_ENDPOINT = 'https://api.resend.com/emails'
const DEFAULT_FROM_EMAIL = 'onboarding@resend.dev'
const DEFAULT_TO_EMAIL = 'hello@datomer.eu'

export async function sendSupportEmail({ env, to, subject, html, text, replyTo }) {
  if (!env.RESEND_API_KEY) {
    console.error('[sendSupportEmail] missing RESEND_API_KEY')
    return { sent: false }
  }

  const recipients = Array.isArray(to) && to.length > 0 ? to : [env.CONTACT_TO_EMAIL || DEFAULT_TO_EMAIL]
  const fromEmail = env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL

  console.log('[sendSupportEmail] sending from', fromEmail, 'to', recipients, 'subject:', subject)

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: recipients,
        ...(replyTo ? { reply_to: replyTo } : {}),
        subject,
        html,
        text,
      }),
    })

    const result = { sent: response.ok }
    console.log('[sendSupportEmail] response status', response.status, 'sent:', result.sent)
    return result
  } catch (err) {
    console.error('[sendSupportEmail] fetch error', err.message || err)
    return { sent: false }
  }
}

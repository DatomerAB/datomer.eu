const RESEND_ENDPOINT = 'https://api.resend.com/emails'
const DEFAULT_FROM_EMAIL = 'hello@datomer.eu'
const DEFAULT_FROM_NAME = 'Pär by Datomer'
const DEFAULT_TO_EMAIL = 'hello@datomer.eu'

function buildFromAddress(email, name) {
  const address = email || DEFAULT_FROM_EMAIL
  const displayName = name || DEFAULT_FROM_NAME
  return `${displayName} <${address}>`
}

export async function sendSupportEmail({ env, to, subject, html, text, replyTo, attachments, site = 'product' }) {
  if (!env.RESEND_API_KEY) {
    console.error('[sendSupportEmail] missing RESEND_API_KEY')
    return { sent: false, error: 'missing_api_key' }
  }

  const prefix = site === 'company' ? 'RESEND_COMPANY' : 'RESEND_PRODUCT'
  const recipients = Array.isArray(to) && to.length > 0
    ? to : [env[`${prefix}_TO_EMAIL`] || env.CONTACT_TO_EMAIL || DEFAULT_TO_EMAIL]
  const siteFromEmail = env[`${prefix}_FROM_EMAIL`]
  const fromEmail = siteFromEmail || env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL
  const siteFromName = site === 'company' ? 'Datomer AB' : DEFAULT_FROM_NAME
  const fromName = env[`${prefix}_FROM_NAME`]
    || (siteFromEmail ? siteFromName : env.RESEND_FROM_NAME || DEFAULT_FROM_NAME)
  const from = buildFromAddress(fromEmail, fromName)

  console.log('[sendSupportEmail] sending from', from, 'to', recipients, 'subject:', subject)

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: recipients,
        ...(replyTo ? { reply_to: replyTo } : {}),
        subject,
        html,
        text,
        ...(attachments ? { attachments } : {}),
      }),
    })

    const responseBody = await response.text().catch(() => '')
    const result = { sent: response.ok, status: response.status, body: responseBody }
    console.log('[sendSupportEmail] response status', response.status, 'sent:', result.sent, 'body:', responseBody)
    return result
  } catch (err) {
    console.error('[sendSupportEmail] fetch error', err.message || err)
    return { sent: false, error: err.message || 'fetch_error' }
  }
}

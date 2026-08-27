import crypto from 'node:crypto'
import { sendSupportEmail } from './_email.js'
import { insertSubmission } from './_db.js'
import { buildPaymentSupportEmail, buildPaymentConfirmationEmail } from './_emailTemplates.js'

// Stripe webhook secrets from the dashboard start with whsec_ and are base64-encoded.
// The HMAC key must be the decoded secret.
function decodeWebhookSecret(secret) {
  if (typeof secret !== 'string' || !secret.startsWith('whsec_')) {
    return secret
  }
  try {
    return atob(secret.slice(6))
  } catch (err) {
    console.error('[stripe-webhook] failed to decode whsec secret:', err.message)
    return secret
  }
}

function verifyStripeSignature({ signature, rawBody, webhookSecret }) {
  const key = decodeWebhookSecret(webhookSecret)

  const elements = signature.split(',').filter(Boolean)
  const signed = Object.fromEntries(elements.map((piece) => piece.split('=')))
  const timestamp = signed.t
  const v1 = signed.v1

  if (!timestamp || !v1) {
    throw new Error('Malformed Stripe signature header.')
  }

  const payload = `${timestamp}.${rawBody}`
  const computed = crypto.createHmac('sha256', key).update(payload, 'utf8').digest('hex')
  return v1 === computed
}

export async function onRequestPost(context) {
  const { request, env, ctx } = context

  const stripeSecret = env.STRIPE_SECRET_KEY
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET

  if (!stripeSecret) {
    console.error('[stripe-webhook] STRIPE_SECRET_KEY is missing')
    return new Response(JSON.stringify({ error: 'Stripe is not configured.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!webhookSecret) {
    console.error('[stripe-webhook] STRIPE_WEBHOOK_SECRET is missing')
    return new Response(JSON.stringify({ error: 'Stripe webhook secret is not configured.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    console.error('[stripe-webhook] missing stripe-signature header')
    return new Response(JSON.stringify({ error: 'Missing Stripe signature.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const rawBody = await request.text()
  let event

  try {
    const valid = verifyStripeSignature({ signature, rawBody, webhookSecret })
    if (!valid) {
      console.error('[stripe-webhook] signature verification failed')
      return new Response(JSON.stringify({ error: 'Invalid Stripe signature.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    event = JSON.parse(rawBody)
  } catch (error) {
    console.error('[stripe-webhook] payload verification error:', error.message)
    return new Response(JSON.stringify({ error: error.message || 'Invalid Stripe webhook payload.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  console.log('[stripe-webhook] received event:', event.type, 'id:', event.id)

  if (event.type !== 'checkout.session.completed') {
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const session = event.data?.object
  const email = session?.customer_details?.email || session?.customer_email || ''
  const plan = session?.metadata?.plan || 'plus'
  const stripeSessionId = session?.id || ''
  const locale = session?.locale || 'en'

  if (!email) {
    console.error('[stripe-webhook] missing customer email in checkout session:', stripeSessionId)
    return new Response(JSON.stringify({ error: 'Missing customer email in Stripe session.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const licenseKey = `PÄR-${String(plan).toUpperCase().replace(/[^A-Z0-9]+/g, '-')}-${Math.random().toString(36).slice(2, 10).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

  const licenseRecord = {
    email: email.trim().toLowerCase(),
    plan: String(plan).toLowerCase(),
    stripeSessionId,
    licenseKey,
    status: 'active',
    issuedAt: new Date().toISOString(),
    locale,
  }

  if (!env.RESEND_API_KEY) {
    console.error('[stripe-webhook] RESEND_API_KEY is missing; skipping purchase emails')
  } else {
    const supportEmail = buildPaymentSupportEmail({ plan, email, licenseKey, stripeSessionId, locale })
    const supportResult = await sendSupportEmail({ env, ...supportEmail })
    console.log('[stripe-webhook] support email result:', JSON.stringify(supportResult))

    const confirmationEmail = buildPaymentConfirmationEmail({ plan, email, licenseKey, locale })
    const confirmationResult = await sendSupportEmail({ env, to: [email], ...confirmationEmail })
    console.log('[stripe-webhook] confirmation email result:', JSON.stringify(confirmationResult))
  }

  const supportText = `[source: stripe-purchase]\n\nNew purchase\n\nPlan: ${plan}\nEmail: ${email}\nLicense key: ${licenseKey}\nSession: ${stripeSessionId}`

  // Non-blocking: store submission for daily summary.
  ctx?.waitUntil?.(
    insertSubmission(env, {
      source: 'stripe-purchase',
      createdAt: licenseRecord.issuedAt,
      email: licenseRecord.email,
      name: null,
      country: null,
      subject: `Purchase: Pär ${plan} — ${email}`,
      message: null,
      body: supportText,
      metadata: { plan: licenseRecord.plan, licenseKey, stripeSessionId, locale: licenseRecord.locale },
    })
  )

  return new Response(JSON.stringify({ received: true, license: licenseRecord }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

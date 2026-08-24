export async function onRequestPost(context) {
  const { request, env } = context

  const stripeSecret = env.STRIPE_SECRET_KEY
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET

  if (!stripeSecret) {
    return new Response(JSON.stringify({ error: 'Stripe is not configured.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!webhookSecret) {
    return new Response(JSON.stringify({ error: 'Stripe webhook secret is not configured.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return new Response(JSON.stringify({ error: 'Missing Stripe signature.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const rawBody = await request.text()
  let event

  try {
    const crypto = await import('node:crypto')
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody, 'utf8')
      .digest('hex')

    const elements = signature.split(',')
    const signed = Object.fromEntries(elements.map((piece) => piece.split('=')))
    const timestamp = signed.t
    const v1 = signed.v1
    const payload = `${timestamp}.${rawBody}`
    const computed = crypto.createHmac('sha256', webhookSecret).update(payload, 'utf8').digest('hex')

    if (v1 !== computed) {
      return new Response(JSON.stringify({ error: 'Invalid Stripe signature.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    event = JSON.parse(rawBody)
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || 'Invalid Stripe webhook payload.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (event.type !== 'checkout.session.completed') {
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const session = event.data?.object
  const email = session?.customer_details?.email || session?.customer_email || ''
  const plan = session?.metadata?.plan || session?.line_items?.data?.[0]?.price?.nickname || 'plus'
  const stripeSessionId = session?.id || ''

  if (!email) {
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
    locale: session?.locale || 'en',
  }

  if (env.RESEND_API_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
          to: [email],
          subject: 'Your Pär license key',
          html: `
            <h2>Thank you for your purchase</h2>
            <p>Your Pär license key is:</p>
            <p><strong>${licenseKey}</strong></p>
            <p>Use this key in the Pär app to activate your subscription.</p>
          `,
          text: `Thank you for your purchase.\n\nYour Pär license key is: ${licenseKey}\n\nUse this key in the Pär app to activate your subscription.`,
        }),
      })
    } catch {
      // Logging is intentionally silent for now; support and later monitoring can add auditing.
    }
  }

  return new Response(JSON.stringify({ received: true, license: licenseRecord }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

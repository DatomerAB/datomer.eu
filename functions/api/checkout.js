export async function onRequestPost(context) {
  const { request, env } = context

  const secretKey = env.STRIPE_SECRET_KEY
  if (!secretKey) {
    return new Response(JSON.stringify({ error: 'Stripe is not configured.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { priceId, mode = 'subscription', locale = 'en' } = body
  if (!priceId) {
    return new Response(JSON.stringify({ error: 'Missing priceId.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const origin = request.headers.get('origin') || env.SITE_URL || 'https://datomer.eu'

  try {
    const session = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'mode': mode,
        'line_items[0][price]': priceId,
        'line_items[0][quantity]': '1',
        'success_url': `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        'cancel_url': `${origin}/#pricing`,
        'locale': locale === 'sv' ? 'sv' : 'en',
      }).toString(),
    })

    const data = await session.json()

    if (!session.ok || !data.url) {
      return new Response(JSON.stringify({ error: data.error?.message || 'Stripe session creation failed.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ url: data.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Unexpected error.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

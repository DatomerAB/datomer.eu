// Temporary debug endpoint to verify the deployed Turnstile secret is recognized by Cloudflare.
// Do not promote this to production.
import { verifyTurnstileToken } from './_turnstile.js'

export async function onRequestPost(context) {
  const { env } = context

  if (!env.TURNSTILE_SECRET_KEY) {
    return new Response(JSON.stringify({ error: 'TURNSTILE_SECRET_KEY is not set' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const result = await verifyTurnstileToken('fake-token-for-secret-check', env.TURNSTILE_SECRET_KEY)

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

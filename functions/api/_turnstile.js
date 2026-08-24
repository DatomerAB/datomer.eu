export async function verifyTurnstileToken(token, secret) {
  if (!secret) return { success: false, error: 'Turnstile secret not configured.' }
  if (!token) return { success: false, error: 'Challenge token missing.' }

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret, response: token }).toString(),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok || !data.success) {
    return { success: false, error: data['error-codes']?.join(', ') || 'Challenge verification failed.' }
  }
  return { success: true }
}

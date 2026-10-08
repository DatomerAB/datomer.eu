import { insertEvent } from './_db.js'
import { verifyTurnstileToken } from './_turnstile.js'

const EVENT_TOKEN_TTL_MS = 30 * 60 * 1000
const EVENT_TYPES = new Set(['pageview', 'heartbeat', 'hidden', 'visible'])
const encoder = new TextEncoder()

function encodeBase64Url(bytes) {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function decodeBase64Url(value) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(base64 + '='.repeat((4 - (base64.length % 4)) % 4))
  return Uint8Array.from(binary, (char) => char.charCodeAt(0))
}

async function getSigningKey(secret) {
  const keyMaterial = await crypto.subtle.digest('SHA-256', encoder.encode(`datomer-event-session-v1:${secret}`))
  return crypto.subtle.importKey('raw', keyMaterial, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'])
}

export async function createEventSessionToken(sessionId, secret, now = Date.now()) {
  const expiresAt = now + EVENT_TOKEN_TTL_MS
  const data = encoder.encode(`${sessionId}.${expiresAt}`)
  const signature = await crypto.subtle.sign('HMAC', await getSigningKey(secret), data)
  return { token: `${expiresAt}.${encodeBase64Url(new Uint8Array(signature))}`, expiresAt }
}

export async function verifyEventSessionToken(sessionId, token, secret, now = Date.now()) {
  if (!secret || typeof token !== 'string') return false
  const [expiresAtText, signatureText, extra] = token.split('.')
  const expiresAt = Number(expiresAtText)
  if (extra !== undefined || !Number.isFinite(expiresAt) || expiresAt <= now || expiresAt > now + EVENT_TOKEN_TTL_MS) {
    return false
  }

  try {
    return await crypto.subtle.verify(
      'HMAC',
      await getSigningKey(secret),
      decodeBase64Url(signatureText),
      encoder.encode(`${sessionId}.${expiresAt}`)
    )
  } catch {
    return false
  }
}

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

  const { sessionId, type = 'heartbeat', pagePath, metadata = {}, turnstileToken, eventToken } = body

  if (!sessionId || !/^[a-zA-Z0-9_-]{8,64}$/.test(sessionId)) {
    return new Response(JSON.stringify({ error: 'Invalid sessionId.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (type === 'session') {
    let verification
    try {
      verification = await verifyTurnstileToken(turnstileToken, env.TURNSTILE_SECRET_KEY)
    } catch {
      return new Response(JSON.stringify({ error: 'Could not verify analytics session.' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    if (!verification.success) {
      return new Response(JSON.stringify({ error: 'Analytics session verification failed.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const session = await createEventSessionToken(sessionId, env.TURNSTILE_SECRET_KEY)
    return new Response(JSON.stringify({ eventToken: session.token, expiresAt: session.expiresAt }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!EVENT_TYPES.has(type)) {
    return new Response(JSON.stringify({ error: 'Invalid event type.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!(await verifyEventSessionToken(sessionId, eventToken, env.TURNSTILE_SECRET_KEY))) {
    return new Response(JSON.stringify({ error: 'Analytics session is not authorized.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (pagePath != null && (typeof pagePath !== 'string' || !pagePath.startsWith('/') || pagePath.length > 512)) {
    return new Response(JSON.stringify({ error: 'Invalid page path.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return new Response(JSON.stringify({ error: 'Invalid event metadata.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const result = await insertEvent(env, {
    sessionId,
    type,
    pagePath,
    metadata: {
      environment: env.ENVIRONMENT || 'unknown',
      ...metadata,
    },
  })

  if (!result) {
    return new Response(JSON.stringify({ error: 'Could not store event.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

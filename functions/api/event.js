import { insertEvent } from './_db.js'

export async function onRequestPost(context) {
  const { request, env, ctx } = context

  let body
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { sessionId, type = 'heartbeat', pagePath, metadata = {} } = body

  if (!sessionId || !/^[a-zA-Z0-9_-]{8,64}$/.test(sessionId)) {
    return new Response(JSON.stringify({ error: 'Invalid sessionId.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  ctx?.waitUntil?.(
    insertEvent(env, {
      sessionId,
      type,
      pagePath,
      metadata: {
        environment: env.ENVIRONMENT || 'unknown',
        ...metadata,
      },
    })
  )

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

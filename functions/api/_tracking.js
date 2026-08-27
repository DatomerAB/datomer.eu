// Privacy-first tracking helpers.
// No third-party services; uses only Cloudflare request.cf data.

export function getClientGeo(request) {
  const cf = request?.cf || {}
  return {
    country: cf.country || 'unknown',
    city: cf.city || 'unknown',
    region: cf.region || 'unknown',
    timezone: cf.timezone || 'unknown',
  }
}

export function getTrackingMeta({ request, env, body = {} }) {
  const geo = getClientGeo(request)
  return {
    environment: env.ENVIRONMENT || 'unknown',
    action: body.action || 'unspecified',
    sessionId: body.sessionId || null,
    country: geo.country,
    city: geo.city,
    region: geo.region,
    timezone: geo.timezone,
    locale: body.locale || 'en',
    timeOnSiteMs: body.timeOnSiteMs ?? null,
    pagePath: body.pagePath || null,
  }
}

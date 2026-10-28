// Privacy-first tracking helpers.
// No third-party services; uses only Cloudflare request.cf data.
import { sanitizeCampaign } from '../../src/lib/campaign.js'

export function getWebsiteContext(request) {
  const hostname = new URL(request.url).hostname
  const site = hostname === 'par.datomer.eu' ? 'product'
    : ['datomer.eu', 'www.datomer.eu'].includes(hostname) ? 'company' : 'preview'
  return { hostname, site }
}

export function getCampaignMeta(input) {
  const started = typeof input.sessionStartedAt === 'string' ? Date.parse(input.sessionStartedAt) : NaN
  return {
    campaign: sanitizeCampaign(input.campaign),
    sessionStartedAt: Number.isFinite(started) && started <= Date.now()
      ? new Date(started).toISOString() : null,
  }
}

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
  const website = getWebsiteContext(request)
  return {
    ...website,
    ...(body.analyticsConsent === true ? getCampaignMeta(body) : {}),
    environment: env.ENVIRONMENT || (website.site === 'preview' ? 'preview' : 'production'),
    action: body.action || 'unspecified',
    sessionId: body.sessionId || null,
    country: geo.country,
    city: geo.city,
    region: geo.region,
    timezone: geo.timezone,
    locale: body.locale || 'en',
    timeOnSiteMs: body.timeOnSiteMs ?? null,
    pagePath: typeof body.pagePath === 'string' && body.pagePath.startsWith('/')
      && body.pagePath.length <= 512 && !/[?#]/.test(body.pagePath) ? body.pagePath : null,
  }
}

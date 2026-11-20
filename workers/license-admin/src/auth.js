import { createRemoteJWKSet, customFetch, jwtVerify } from 'jose'

const remoteJwksByTeam = new Map()

function jsonResponse(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}

function normalizedTeamDomain(value) {
  try {
    const url = new URL(value)
    if (
      url.protocol !== 'https:'
      || !url.hostname.endsWith('.cloudflareaccess.com')
      || url.pathname !== '/'
      || url.search
      || url.hash
    ) return null
    return url.origin
  } catch {
    return null
  }
}

function getRemoteJwks(teamDomain) {
  let jwks = remoteJwksByTeam.get(teamDomain)
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL('/cdn-cgi/access/certs', teamDomain), {
      [customFetch]: (url, options) => fetch(url, options),
    })
    remoteJwksByTeam.set(teamDomain, jwks)
  }
  return jwks
}

async function getAccessIdentity(request, context, env) {
  const access = context?.access
  if (access && typeof access.getIdentity === 'function') {
    try {
      return await access.getIdentity()
    } catch {
      return null
    }
  }

  const token = request.headers.get('Cf-Access-Jwt-Assertion')
  if (!token) return null

  const teamDomain = normalizedTeamDomain(env?.ACCESS_TEAM_DOMAIN)
  const audience = typeof env?.ACCESS_POLICY_AUD === 'string'
    ? env.ACCESS_POLICY_AUD.trim()
    : ''
  if (!teamDomain || !audience) return null

  try {
    const { payload } = await jwtVerify(token, getRemoteJwks(teamDomain), {
      algorithms: ['RS256'],
      audience,
      issuer: teamDomain,
      requiredClaims: ['aud', 'exp', 'iss'],
    })
    return payload
  } catch {
    return null
  }
}

export async function loadAdminPrincipal(
  request,
  context,
  env
) {
  const identity = await getAccessIdentity(request, context, env)
  if (!identity) {
    return { response: jsonResponse({ error: 'Authentication required' }, 401) }
  }
  const email = typeof identity?.email === 'string'
    ? identity.email.trim().toLowerCase()
    : ''
  if (!email || !email.includes('@')) {
    return { response: jsonResponse({ error: 'Authenticated email is required' }, 403) }
  }

  const db = env?.LICENSE_DB
  if (!db) {
    return { response: jsonResponse({ error: 'License database is unavailable' }, 503) }
  }

  try {
    const result = await db
      .prepare('SELECT role FROM admin_user_roles WHERE email = ? COLLATE NOCASE')
      .bind(email)
      .all()
    const roles = (result.results || []).map((row) => row.role)
    return {
      principal: {
        identity: {
          email,
          name: typeof identity.name === 'string' ? identity.name : null,
        },
        roles,
      },
    }
  } catch {
    return { response: jsonResponse({ error: 'Unable to load admin permissions' }, 503) }
  }
}

export function authorizeRoles(principal, allowedRoles) {
  if (principal.roles.includes('security-admin')) return null
  if (allowedRoles.some((role) => principal.roles.includes(role))) return null
  return jsonResponse({ error: 'Insufficient permissions' }, 403)
}

export { jsonResponse }

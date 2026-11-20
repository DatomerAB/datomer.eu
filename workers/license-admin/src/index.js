import { authorizeRoles, loadAdminPrincipal, jsonResponse } from './auth.js'
import {
  CatalogApiError,
  createOffer,
  createProduct,
  createTier,
  listOffers,
  listProducts,
  listTiers,
} from './catalog.js'
import {
  issueLicense,
  LicenseApiError,
  listLicenses,
  reissueLicense,
  revokeLicense,
} from './licenses.js'
import { changeAdminRole, listAdminRoles, RoleApiError } from './roles.js'

const LICENSE_READ_ROLES = ['license-reader', 'license-operator']
const LICENSE_WRITE_ROLES = ['license-operator']
const CATALOG_READ_ROLES = ['license-reader', 'license-operator', 'catalog-admin']
const CATALOG_WRITE_ROLES = ['catalog-admin']

async function requestJson(request) {
  try {
    return await request.json()
  } catch {
    throw new LicenseApiError(400, 'Request body must be valid JSON')
  }
}

function errorResponse(error) {
  if (
    error instanceof LicenseApiError
    || error instanceof CatalogApiError
    || error instanceof RoleApiError
  ) {
    return jsonResponse({ error: error.message }, error.status)
  }
  return jsonResponse({ error: 'Internal error' }, 500)
}

export default {
  async fetch(request, env, context) {
    const url = new URL(request.url)
    const loaded = await loadAdminPrincipal(request, context, env)
    if (loaded.response) return loaded.response

    if (request.method === 'GET' && url.pathname === '/api/me') {
      return jsonResponse({
        ...loaded.principal,
        signing_configuration: {
          private_key_present: typeof env.LICENSE_V2_SIGNING_KEY_PEM === 'string'
            && env.LICENSE_V2_SIGNING_KEY_PEM.length > 0,
          key_id_present: typeof env.LICENSE_V2_KEY_ID === 'string'
            && env.LICENSE_V2_KEY_ID.length > 0,
        },
      })
    }

    if (url.pathname === '/api/admin/roles' && request.method === 'GET') {
      const denied = authorizeRoles(loaded.principal, ['security-admin'])
      if (denied) return denied
      try {
        return jsonResponse({ roles: await listAdminRoles(env.LICENSE_DB) })
      } catch (error) {
        return errorResponse(error)
      }
    }

    if (url.pathname === '/api/admin/roles' && request.method === 'POST') {
      const denied = authorizeRoles(loaded.principal, ['security-admin'])
      if (denied) return denied
      try {
        const result = await changeAdminRole(env.LICENSE_DB, await requestJson(request), {
          email: loaded.principal.identity.email,
          role: 'security-admin',
        })
        return jsonResponse(result, 201)
      } catch (error) {
        return errorResponse(error)
      }
    }

    if (url.pathname === '/api/admin/roles' && request.method === 'GET') {
      const denied = authorizeRoles(loaded.principal, ['security-admin'])
      if (denied) return denied
      try {
        return jsonResponse({ roles: await listAdminRoles(env.LICENSE_DB) })
      } catch (error) {
        return errorResponse(error)
      }
    }

    if (url.pathname === '/api/admin/roles' && request.method === 'POST') {
      const denied = authorizeRoles(loaded.principal, ['security-admin'])
      if (denied) return denied
      try {
        return jsonResponse(await changeAdminRole(
          env.LICENSE_DB,
          await requestJson(request),
          { email: loaded.principal.identity.email, role: 'security-admin' }
        ), 201)
      } catch (error) {
        return errorResponse(error)
      }
    }

    if (url.pathname === '/api/products' && request.method === 'GET') {
      const denied = authorizeRoles(loaded.principal, CATALOG_READ_ROLES)
      if (denied) return denied
      try {
        return jsonResponse({ products: await listProducts(env.LICENSE_DB) })
      } catch (error) {
        return errorResponse(error)
      }
    }

    if (url.pathname === '/api/products' && request.method === 'POST') {
      const denied = authorizeRoles(loaded.principal, CATALOG_WRITE_ROLES)
      if (denied) return denied
      try {
        const actor = {
          email: loaded.principal.identity.email,
          role: loaded.principal.roles.includes('security-admin')
            ? 'security-admin'
            : 'catalog-admin',
        }
        return jsonResponse(await createProduct(env.LICENSE_DB, await requestJson(request), actor), 201)
      } catch (error) {
        return errorResponse(error)
      }
    }

    if (url.pathname === '/api/tiers' && request.method === 'GET') {
      const denied = authorizeRoles(loaded.principal, CATALOG_READ_ROLES)
      if (denied) return denied
      try {
        return jsonResponse({ tiers: await listTiers(env.LICENSE_DB, url.searchParams.get('product_id')) })
      } catch (error) {
        return errorResponse(error)
      }
    }

    if (url.pathname === '/api/tiers' && request.method === 'POST') {
      const denied = authorizeRoles(loaded.principal, CATALOG_WRITE_ROLES)
      if (denied) return denied
      try {
        const actor = {
          email: loaded.principal.identity.email,
          role: loaded.principal.roles.includes('security-admin')
            ? 'security-admin'
            : 'catalog-admin',
        }
        return jsonResponse(await createTier(env.LICENSE_DB, await requestJson(request), actor), 201)
      } catch (error) {
        return errorResponse(error)
      }
    }

    if (url.pathname === '/api/offers' && request.method === 'GET') {
      const denied = authorizeRoles(loaded.principal, CATALOG_READ_ROLES)
      if (denied) return denied
      try {
        return jsonResponse({ offers: await listOffers(env.LICENSE_DB) })
      } catch (error) {
        return errorResponse(error)
      }
    }

    if (url.pathname === '/api/offers' && request.method === 'POST') {
      const denied = authorizeRoles(loaded.principal, CATALOG_WRITE_ROLES)
      if (denied) return denied
      try {
        const actor = {
          email: loaded.principal.identity.email,
          role: loaded.principal.roles.includes('security-admin')
            ? 'security-admin'
            : 'catalog-admin',
        }
        return jsonResponse(await createOffer(env.LICENSE_DB, await requestJson(request), actor), 201)
      } catch (error) {
        return errorResponse(error)
      }
    }

    if (url.pathname === '/api/licenses' && request.method === 'GET') {
      const denied = authorizeRoles(loaded.principal, LICENSE_READ_ROLES)
      if (denied) return denied
      const status = url.searchParams.get('status') || undefined
      if (status && !['active', 'revoked'].includes(status)) {
        return jsonResponse({ error: 'Invalid status filter' }, 400)
      }
      try {
        const licenses = await listLicenses(env.LICENSE_DB, {
          productId: url.searchParams.get('product_id') || undefined,
          status,
        })
        return jsonResponse({ licenses })
      } catch (error) {
        return errorResponse(error)
      }
    }

    if (url.pathname === '/api/licenses' && request.method === 'POST') {
      const denied = authorizeRoles(loaded.principal, LICENSE_WRITE_ROLES)
      if (denied) return denied
      try {
        const actor = {
          email: loaded.principal.identity.email,
          role: loaded.principal.roles.includes('security-admin')
            ? 'security-admin'
            : 'license-operator',
        }
        const result = await issueLicense(
          env.LICENSE_DB,
          env,
          await requestJson(request),
          actor
        )
        return jsonResponse(result, 201)
      } catch (error) {
        return errorResponse(error)
      }
    }

    const licenseAction = url.pathname.match(/^\/api\/licenses\/([^/]+)\/(reissue|revoke)$/)
    if (licenseAction && request.method === 'POST') {
      const denied = authorizeRoles(loaded.principal, LICENSE_WRITE_ROLES)
      if (denied) return denied
      const [, licenseId, action] = licenseAction
      try {
        const actor = {
          email: loaded.principal.identity.email,
          role: loaded.principal.roles.includes('security-admin')
            ? 'security-admin'
            : 'license-operator',
        }
        if (action === 'reissue') {
          return jsonResponse(await reissueLicense(env.LICENSE_DB, env, licenseId, actor))
        }
        const body = await requestJson(request)
        return jsonResponse(
          await revokeLicense(env.LICENSE_DB, licenseId, body.reason, actor)
        )
      } catch (error) {
        return errorResponse(error)
      }
    }

    if (!url.pathname.startsWith('/api/')) {
      if (env.ASSETS) return env.ASSETS.fetch(request)
      return new Response('Admin assets are not configured', { status: 503 })
    }

    return jsonResponse({ error: 'Not found' }, 404)
  },
}

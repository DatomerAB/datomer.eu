import assert from 'node:assert/strict'
import test from 'node:test'
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from 'jose'

import worker from '../src/index.js'

const ACCESS_TEAM_DOMAIN = 'https://datomer-eu-pages.cloudflareaccess.com'
const ACCESS_POLICY_AUD = 'ebfa2ab32df5ad5a65455ca536fb74fb8b640c671ce4d735f4ac04ecfcd7f0db'

function request(path = '/api/me', headers = {}) {
  return new Request(`https://admin.products.datomer.eu${path}`, { headers })
}

function envWithRoles(roles) {
  return {
    LICENSE_DB: {
      prepare(sql) {
        assert.match(sql, /FROM admin_user_roles/)
        return {
          bind(email) {
            assert.equal(email, 'admin@datomer.eu')
            return { all: async () => ({ results: roles.map((role) => ({ role })) }) }
          },
        }
      },
    },
  }
}

function contextFor(email = 'Admin@datomer.eu') {
  return { access: { getIdentity: async () => ({ email, name: 'Admin User' }) } }
}

let accessTestKeysPromise

async function accessTestKeys() {
  if (!accessTestKeysPromise) {
    accessTestKeysPromise = generateKeyPair('RS256').then(async ({ privateKey, publicKey }) => {
      const publicJwk = await exportJWK(publicKey)
      Object.assign(publicJwk, { alg: 'RS256', kid: 'test-access-key', use: 'sig' })
      return { privateKey, publicJwk }
    })
  }
  return accessTestKeysPromise
}

async function signedAccessToken(audience = ACCESS_POLICY_AUD) {
  const { privateKey, publicJwk } = await accessTestKeys()
  const token = await new SignJWT({ email: 'Admin@datomer.eu', name: 'Admin User' })
    .setProtectedHeader({ alg: 'RS256', kid: 'test-access-key', typ: 'JWT' })
    .setIssuer(ACCESS_TEAM_DOMAIN)
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(privateKey)
  return { token, publicJwk }
}

async function withAccessJwks(publicJwk, callback) {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (input) => {
    assert.equal(String(input), `${ACCESS_TEAM_DOMAIN}/cdn-cgi/access/certs`)
    return Response.json({ keys: [publicJwk] })
  }
  try {
    return await callback()
  } finally {
    globalThis.fetch = originalFetch
  }
}

test('rejects requests without Cloudflare Access identity', async () => {
  const response = await worker.fetch(request(), envWithRoles(['security-admin']), {})

  assert.equal(response.status, 401)
  assert.deepEqual(await response.json(), { error: 'Authentication required' })
})

test('protects the static portal path before serving assets', async () => {
  let assetFetches = 0
  const env = {
    ...envWithRoles(['security-admin']),
    ASSETS: { fetch: async () => { assetFetches += 1; return new Response('portal') } },
  }
  const response = await worker.fetch(request('/'), env, {})

  assert.equal(response.status, 401)
  assert.equal(assetFetches, 0)
})

test('fails closed if the license D1 binding is missing', async () => {
  const response = await worker.fetch(request(), {}, contextFor())

  assert.equal(response.status, 503)
})

test('returns only normalized identity and assigned roles', async () => {
  const response = await worker.fetch(
    request(),
    envWithRoles(['license-reader']),
    contextFor()
  )

  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), {
    identity: { email: 'admin@datomer.eu', name: 'Admin User' },
    roles: ['license-reader'],
    signing_configuration: {
      private_key_present: false,
      key_id_present: false,
    },
  })
})

test('loads identity from a valid Cloudflare Access JWT when ctx.access is unavailable', async () => {
  const { token, publicJwk } = await signedAccessToken()
  const env = {
    ...envWithRoles(['license-reader']),
    ACCESS_TEAM_DOMAIN,
    ACCESS_POLICY_AUD,
    LICENSE_V2_SIGNING_KEY_PEM: 'test-private-key-not-returned',
    LICENSE_V2_KEY_ID: 'test-key-id-not-returned',
  }
  const response = await withAccessJwks(publicJwk, () => worker.fetch(
    request('/api/me', { 'Cf-Access-Jwt-Assertion': token }),
    env,
    {}
  ))

  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), {
    identity: { email: 'admin@datomer.eu', name: 'Admin User' },
    roles: ['license-reader'],
    signing_configuration: {
      private_key_present: true,
      key_id_present: true,
    },
  })
})

test('rejects a Cloudflare Access JWT with the wrong application audience', async () => {
  const { token, publicJwk } = await signedAccessToken('wrong-audience')
  const env = {
    ...envWithRoles(['security-admin']),
    ACCESS_TEAM_DOMAIN,
    ACCESS_POLICY_AUD,
  }
  const response = await withAccessJwks(publicJwk, () => worker.fetch(
    request('/api/me', { 'Cf-Access-Jwt-Assertion': token }),
    env,
    {}
  ))

  assert.equal(response.status, 401)
  assert.deepEqual(await response.json(), { error: 'Authentication required' })
})

test('does not disclose protected route existence before authentication', async () => {
  const response = await worker.fetch(request('/api/licenses'), envWithRoles([]), {})

  assert.equal(response.status, 401)
})

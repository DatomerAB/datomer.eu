import assert from 'node:assert/strict'
import { generateKeyPairSync, verify } from 'node:crypto'
import test from 'node:test'

import { signLicense } from '../src/signing.js'

function decodeBase64Url(value) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  return Buffer.from(base64 + '='.repeat((4 - base64.length % 4) % 4), 'base64')
}

function decodeJson(value) {
  return JSON.parse(decodeBase64Url(value).toString('utf8'))
}

test('signs the V2 entitlement snapshot as a verifiable ES256 JWT', async () => {
  const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'prime256v1' })
  const privateKeyPem = privateKey.export({ type: 'pkcs8', format: 'pem' })
  const token = await signLicense({
    subject: 'customer-opaque-42',
    productId: 'par',
    licenseId: '2e6df39a-69a9-4cca-9af0-611c7b4a7278',
    tierId: 'plus',
    tierRevision: 3,
    entitlements: { features: ['history'], limits: { profiles: { value: 3, unit: 'profiles' } } },
    validFrom: '2026-11-13T00:00:00.000Z',
    validUntil: '2027-11-13T00:00:00.000Z',
  }, { privateKeyPem, keyId: 'test-key', now: Date.parse('2026-11-13T12:00:00.000Z') })

  const [encodedHeader, encodedPayload, encodedSignature] = token.split('.')
  const header = decodeJson(encodedHeader)
  const payload = decodeJson(encodedPayload)
  const valid = verify(
    'sha256',
    Buffer.from(`${encodedHeader}.${encodedPayload}`),
    { key: publicKey, dsaEncoding: 'ieee-p1363' },
    decodeBase64Url(encodedSignature)
  )

  assert.equal(valid, true)
  assert.deepEqual(header, { alg: 'ES256', kid: 'test-key', typ: 'par-license+jwt' })
  assert.equal(payload.iss, 'https://license.datomer.eu')
  assert.equal(payload.aud, 'par')
  assert.equal(payload.sub, 'customer-opaque-42')
  assert.equal(payload.tier_revision, '3')
  assert.deepEqual(payload.entitlements.features, ['history'])
})

test('rejects invalid signing configuration and validity intervals', async () => {
  await assert.rejects(
    signLicense({}, { privateKeyPem: '', keyId: '' }),
    /must be configured/
  )

  const { privateKey } = generateKeyPairSync('ec', { namedCurve: 'prime256v1' })
  const privateKeyPem = privateKey.export({ type: 'pkcs8', format: 'pem' })
  await assert.rejects(
    signLicense({
      subject: 'customer-1', productId: 'par', licenseId: 'id', tierId: 'plus',
      tierRevision: 1, entitlements: { features: [], limits: {} },
      validFrom: '2027-01-01T00:00:00Z', validUntil: '2026-01-01T00:00:00Z',
    }, { privateKeyPem, keyId: 'test-key' }),
    /Invalid license validity interval/
  )
})

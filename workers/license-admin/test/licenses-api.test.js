import assert from 'node:assert/strict'
import { generateKeyPairSync, verify } from 'node:crypto'
import test from 'node:test'

import worker from '../src/index.js'

const tierRevisionId = '22222222-2222-4222-8222-222222222222'
const roles = ['license-operator']

class FakeD1 {
  constructor() {
    this.records = new Map()
    this.audit = []
    this.lastChanges = 0
  }

  prepare(sql) {
    const statement = {
      sql,
      values: [],
      bind: (...values) => {
        statement.values = values
        return statement
      },
      first: async () => this.first(statement),
      all: async () => this.all(statement),
      run: async () => this.run(statement),
    }
    return statement
  }

  async first(statement) {
    const { sql, values } = statement
    if (sql.includes('FROM admin_user_roles')) {
      return null
    }
    if (sql.includes('FROM license_tier_revisions AS t')) {
      if (values[0] !== tierRevisionId || values[1] !== 'par') return null
      return {
        tier_revision_id: tierRevisionId,
        product_id: 'par',
        tier_id: 'plus',
        revision: 1,
        available: 1,
        entitlements_json: JSON.stringify({ features: ['history'], limits: {} }),
        product_status: 'active',
      }
    }
    if (sql.includes('FROM license_records WHERE license_id = ?')) {
      return this.records.get(values[0]) || null
    }
    throw new Error(`Unexpected first query: ${sql}`)
  }

  async all(statement) {
    if (statement.sql.includes('FROM admin_user_roles')) {
      return { results: roles.map((role) => ({ role })) }
    }
    if (statement.sql.includes('FROM license_records')) {
      let rows = [...this.records.values()]
      if (statement.sql.includes('product_id = ?')) {
        rows = rows.filter((row) => row.product_id === statement.values[0])
      }
      if (statement.sql.includes('status = ?')) {
        const statusIndex = statement.sql.includes('product_id = ?') ? 1 : 0
        rows = rows.filter((row) => row.status === statement.values[statusIndex])
      }
      return { results: rows }
    }
    throw new Error(`Unexpected all query: ${statement.sql}`)
  }

  async run(statement) {
    if (statement.sql.includes('INSERT INTO license_admin_audit')
      && statement.sql.includes("'reissue'")) {
      const [licenseId, actor, role, entityId, createdAt, existsId] = statement.values
      const record = this.records.get(existsId)
      if (!record || record.status !== 'active') return { meta: { changes: 0 } }
      this.audit.push({ license_id: licenseId, actor, role, action: 'reissue', entity_id: entityId, created_at: createdAt })
      return { meta: { changes: 1 } }
    }
    throw new Error(`Unexpected run query: ${statement.sql}`)
  }

  async batch(statements) {
    const results = []
    for (const statement of statements) {
      if (statement.sql.includes('INSERT INTO license_records')) {
        const [licenseId, productId, subject, tierId, tierRevision, revisionId,
          entitlements, validFrom, validUntil, issuedBy, issuedAt] = statement.values
        this.records.set(licenseId, {
          license_id: licenseId,
          product_id: productId,
          subject,
          tier_id: tierId,
          tier_revision: tierRevision,
          tier_revision_id: revisionId,
          entitlements_json: entitlements,
          valid_from: validFrom,
          valid_until: validUntil,
          issued_by: issuedBy,
          issued_at: issuedAt,
          status: 'active',
          revoked_by: null,
          revoked_at: null,
          revocation_reason: null,
        })
        this.lastChanges = 1
        results.push({ meta: { changes: 1 } })
      } else if (statement.sql.includes('UPDATE license_records')) {
        const [actor, revokedAt, reason, licenseId] = statement.values
        const record = this.records.get(licenseId)
        this.lastChanges = record?.status === 'active' ? 1 : 0
        if (this.lastChanges) {
          Object.assign(record, {
            status: 'revoked', revoked_by: actor, revoked_at: revokedAt,
            revocation_reason: reason,
          })
        }
        results.push({ meta: { changes: this.lastChanges } })
      } else if (statement.sql.includes('INSERT INTO license_admin_audit')) {
        if (statement.sql.includes('changes() = 1') && !this.lastChanges) {
          results.push({ meta: { changes: 0 } })
          continue
        }
        if (statement.sql.includes("'revoke'")) {
          const [licenseId, actor, role, entityId, reason, createdAt] = statement.values
          this.audit.push({
            license_id: licenseId,
            actor,
            role,
            action: 'revoke',
            entity_type: 'license',
            entity_id: entityId,
            reason,
            created_at: createdAt,
          })
          results.push({ meta: { changes: 1 } })
          continue
        }
        const [licenseId, actor, role, action, entityType, entityId, reason, createdAt] = statement.values
        this.audit.push({ license_id: licenseId, actor, role, action, entity_type: entityType, entity_id: entityId, reason, created_at: createdAt })
        results.push({ meta: { changes: 1 } })
      } else {
        throw new Error(`Unexpected batch query: ${statement.sql}`)
      }
    }
    return results
  }
}

function makeEnvironment() {
  const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'prime256v1' })
  return {
    env: {
      LICENSE_DB: new FakeD1(),
      LICENSE_V2_SIGNING_KEY_PEM: privateKey.export({ type: 'pkcs8', format: 'pem' }).toString(),
      LICENSE_V2_KEY_ID: 'test-key',
    },
    publicKey,
  }
}

function accessContext(email = 'operator@datomer.eu') {
  return { access: { getIdentity: async () => ({ email }) } }
}

test('license lifecycle uses D1 metadata and only returns the signed token transiently', async () => {
  const { env, publicKey } = makeEnvironment()
  const body = {
    product_id: 'par',
    tier_revision_id: tierRevisionId,
    subject: 'customer-opaque-42',
    valid_until: '2027-11-13T00:00:00.000Z',
  }
  const issuedResponse = await worker.fetch(new Request('https://admin.products.datomer.eu/api/licenses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }), env, accessContext())
  const issued = await issuedResponse.json()

  assert.equal(issuedResponse.status, 201)
  assert.equal(issued.record.status, 'active')
  assert.equal(env.LICENSE_DB.records.has(issued.record.license_id), true)
  assert.equal(JSON.stringify([...env.LICENSE_DB.records.values()]).includes(issued.token), false)

  const [headerPart, payloadPart, signaturePart] = issued.token.split('.')
  const signingInput = Buffer.from(`${headerPart}.${payloadPart}`)
  const signature = Buffer.from(
    signaturePart.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - signaturePart.length % 4) % 4),
    'base64'
  )
  assert.equal(verify('sha256', signingInput, { key: publicKey, dsaEncoding: 'ieee-p1363' }, signature), true)

  const listedResponse = await worker.fetch(
    new Request('https://admin.products.datomer.eu/api/licenses?product_id=par&status=active'),
    env,
    accessContext()
  )
  assert.equal((await listedResponse.json()).licenses.length, 1)

  const reissueResponse = await worker.fetch(new Request(
    `https://admin.products.datomer.eu/api/licenses/${issued.record.license_id}/reissue`,
    { method: 'POST' }
  ), env, accessContext())
  const reissued = await reissueResponse.json()
  assert.equal(reissueResponse.status, 200)
  assert.equal(reissued.record.license_id, issued.record.license_id)
  assert.ok(reissued.token)

  const revokeResponse = await worker.fetch(new Request(
    `https://admin.products.datomer.eu/api/licenses/${issued.record.license_id}/revoke`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: 'Customer request' }) }
  ), env, accessContext())
  assert.equal(revokeResponse.status, 200)
  assert.equal((await revokeResponse.json()).status, 'revoked')
  assert.deepEqual(env.LICENSE_DB.audit.map((entry) => entry.action), ['issue', 'reissue', 'revoke'])
})

test('license APIs deny roles that are not assigned', async () => {
  const { env } = makeEnvironment()
  roles.splice(0, roles.length, 'license-reader')
  const response = await worker.fetch(new Request('https://admin.products.datomer.eu/api/licenses', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
  }), env, accessContext())
  roles.splice(0, roles.length, 'license-operator')

  assert.equal(response.status, 403)
})

test('license issuance fails closed when the V2 signer is not configured', async () => {
  const { env } = makeEnvironment()
  delete env.LICENSE_V2_SIGNING_KEY_PEM
  delete env.LICENSE_V2_KEY_ID
  const response = await worker.fetch(new Request('https://admin.products.datomer.eu/api/licenses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      product_id: 'par',
      tier_revision_id: tierRevisionId,
      subject: 'customer-opaque-42',
    }),
  }), env, accessContext())

  assert.equal(response.status, 503)
  assert.deepEqual(await response.json(), { error: 'V2 license signing is not configured' })
})

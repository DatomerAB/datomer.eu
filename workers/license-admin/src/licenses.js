import { signLicense } from './signing.js'

export class LicenseApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

const PRODUCT_ID_PATTERN = /^[a-z0-9][a-z0-9._-]{0,63}$/
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function parseEntitlements(value) {
  try {
    const parsed = JSON.parse(value)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('not an object')
    }
    return parsed
  } catch {
    throw new LicenseApiError(500, 'Stored tier entitlements are invalid')
  }
}

function normalizeSubject(value) {
  if (typeof value !== 'string') {
    throw new LicenseApiError(400, 'An opaque subject ID is required')
  }
  const subject = value.trim()
  if (!subject || subject.length > 255 || subject.includes('@')) {
    throw new LicenseApiError(400, 'Subject must be a non-email opaque ID')
  }
  return subject
}

function normalizeDate(value, field, fallback = null) {
  if (value == null || value === '') return fallback
  if (typeof value !== 'string' || !Number.isFinite(Date.parse(value))) {
    throw new LicenseApiError(400, `${field} must be an ISO-8601 timestamp`)
  }
  return new Date(value).toISOString()
}

function asLicense(row) {
  return {
    license_id: row.license_id,
    product_id: row.product_id,
    subject: row.subject,
    tier_id: row.tier_id,
    tier_revision: row.tier_revision,
    tier_revision_id: row.tier_revision_id,
    entitlements: parseEntitlements(row.entitlements_json),
    valid_from: row.valid_from,
    valid_until: row.valid_until,
    issued_by: row.issued_by,
    issued_at: row.issued_at,
    status: row.status,
    revoked_by: row.revoked_by,
    revoked_at: row.revoked_at,
    revocation_reason: row.revocation_reason,
  }
}

function auditStatement(db, { licenseId, actor, role, action, entityType, entityId, reason, createdAt }) {
  return db.prepare(`
    INSERT INTO license_admin_audit (
      license_id, actor_email, actor_role, action, entity_type, entity_id, reason, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(licenseId, actor, role, action, entityType, entityId, reason, createdAt)
}

function requireSigner(env) {
  if (!env?.LICENSE_V2_SIGNING_KEY_PEM || !env?.LICENSE_V2_KEY_ID) {
    throw new LicenseApiError(503, 'V2 license signing is not configured')
  }
}

export async function listLicenses(db, { productId, status } = {}) {
  const conditions = []
  const values = []
  if (productId) {
    conditions.push('product_id = ?')
    values.push(productId)
  }
  if (status) {
    conditions.push('status = ?')
    values.push(status)
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const result = await db.prepare(`
    SELECT * FROM license_records ${where}
    ORDER BY issued_at DESC, license_id LIMIT 200
  `).bind(...values).all()
  return (result.results || []).map(asLicense)
}

export async function issueLicense(db, env, command, actor) {
  requireSigner(env)
  if (!command || typeof command !== 'object' || Array.isArray(command)) {
    throw new LicenseApiError(400, 'A JSON license request is required')
  }
  const productId = command.product_id
  const tierRevisionId = command.tier_revision_id
  if (typeof productId !== 'string' || !PRODUCT_ID_PATTERN.test(productId)) {
    throw new LicenseApiError(400, 'Invalid product_id')
  }
  if (typeof tierRevisionId !== 'string' || !UUID_PATTERN.test(tierRevisionId)) {
    throw new LicenseApiError(400, 'Invalid tier_revision_id')
  }

  const subject = normalizeSubject(command.subject)
  const now = new Date().toISOString()
  const validFrom = normalizeDate(command.valid_from, 'valid_from', now)
  const validUntil = normalizeDate(command.valid_until, 'valid_until')
  if (validUntil && validUntil <= validFrom) {
    throw new LicenseApiError(400, 'valid_until must be after valid_from')
  }

  const tier = await db.prepare(`
    SELECT t.tier_revision_id, t.product_id, t.tier_id, t.revision,
           t.available, t.entitlements_json, p.status AS product_status
    FROM license_tier_revisions AS t
    JOIN license_products AS p ON p.product_id = t.product_id
    WHERE t.tier_revision_id = ? AND t.product_id = ?
  `).bind(tierRevisionId, productId).first()
  if (!tier || tier.product_status !== 'active') {
    throw new LicenseApiError(404, 'Product tier revision was not found')
  }
  if (tier.available !== 1) {
    throw new LicenseApiError(409, 'Tier revision is unavailable for new licenses')
  }

  const entitlements = parseEntitlements(tier.entitlements_json)
  const licenseId = crypto.randomUUID()
  const issuedAt = new Date().toISOString()
  const license = {
    license_id: licenseId,
    product_id: productId,
    subject,
    tier_id: tier.tier_id,
    tier_revision: tier.revision,
    tier_revision_id: tier.tier_revision_id,
    entitlements,
    valid_from: validFrom,
    valid_until: validUntil,
    issued_by: actor.email,
    issued_at: issuedAt,
    status: 'active',
    revoked_by: null,
    revoked_at: null,
    revocation_reason: null,
  }
  const token = await signLicense({
    subject,
    productId,
    licenseId,
    tierId: tier.tier_id,
    tierRevision: tier.revision,
    entitlements,
    validFrom,
    validUntil,
  }, {
    privateKeyPem: env.LICENSE_V2_SIGNING_KEY_PEM,
    keyId: env.LICENSE_V2_KEY_ID,
  })

  await db.batch([
    db.prepare(`
      INSERT INTO license_records (
        license_id, product_id, subject, tier_id, tier_revision, tier_revision_id,
        entitlements_json, valid_from, valid_until, issued_by, issued_at, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `).bind(
      licenseId,
      productId,
      subject,
      tier.tier_id,
      tier.revision,
      tier.tier_revision_id,
      JSON.stringify(entitlements),
      validFrom,
      validUntil,
      actor.email,
      issuedAt
    ),
    auditStatement(db, {
      licenseId,
      actor: actor.email,
      role: actor.role,
      action: 'issue',
      entityType: 'license',
      entityId: licenseId,
      reason: null,
      createdAt: issuedAt,
    }),
  ])

  return { record: license, token }
}

export async function reissueLicense(db, env, licenseId, actor) {
  requireSigner(env)
  if (!UUID_PATTERN.test(licenseId)) throw new LicenseApiError(400, 'Invalid license ID')
  const row = await db.prepare(
    'SELECT * FROM license_records WHERE license_id = ?'
  ).bind(licenseId).first()
  if (!row) throw new LicenseApiError(404, 'License not found')
  if (row.status !== 'active') throw new LicenseApiError(409, 'Revoked license cannot be reissued')

  const record = asLicense(row)
  const token = await signLicense({
    subject: record.subject,
    productId: record.product_id,
    licenseId: record.license_id,
    tierId: record.tier_id,
    tierRevision: record.tier_revision,
    entitlements: record.entitlements,
    validFrom: record.valid_from,
    validUntil: record.valid_until,
  }, {
    privateKeyPem: env.LICENSE_V2_SIGNING_KEY_PEM,
    keyId: env.LICENSE_V2_KEY_ID,
  })

  const auditResult = await db.prepare(`
    INSERT INTO license_admin_audit (
      license_id, actor_email, actor_role, action, entity_type, entity_id, reason, created_at
    ) SELECT ?, ?, ?, 'reissue', 'license', ?, NULL, ?
      WHERE EXISTS (
        SELECT 1 FROM license_records WHERE license_id = ? AND status = 'active'
      )
  `).bind(
    licenseId, actor.email, actor.role, licenseId, new Date().toISOString(), licenseId
  ).run()
  if (auditResult.meta?.changes !== 1) {
    throw new LicenseApiError(409, 'License was revoked before reissue completed')
  }
  return { record, token }
}

export async function revokeLicense(db, licenseId, reason, actor) {
  if (!UUID_PATTERN.test(licenseId)) throw new LicenseApiError(400, 'Invalid license ID')
  if (typeof reason !== 'string' || !reason.trim() || reason.trim().length > 500) {
    throw new LicenseApiError(400, 'A revocation reason of 1-500 characters is required')
  }

  const revokedAt = new Date().toISOString()
  const results = await db.batch([
    db.prepare(`
      UPDATE license_records
      SET status = 'revoked', revoked_by = ?, revoked_at = ?, revocation_reason = ?
      WHERE license_id = ? AND status = 'active'
    `).bind(actor.email, revokedAt, reason.trim(), licenseId),
    db.prepare(`
      INSERT INTO license_admin_audit (
        license_id, actor_email, actor_role, action, entity_type, entity_id, reason, created_at
      ) SELECT ?, ?, ?, 'revoke', 'license', ?, ?, ? WHERE changes() = 1
    `).bind(licenseId, actor.email, actor.role, licenseId, reason.trim(), revokedAt),
  ])
  if (results[0]?.meta?.changes !== 1) {
    const exists = await db.prepare(
      'SELECT 1 AS found FROM license_records WHERE license_id = ?'
    ).bind(licenseId).first()
    if (!exists) throw new LicenseApiError(404, 'License not found')
    throw new LicenseApiError(409, 'License is already revoked')
  }

  const row = await db.prepare(
    'SELECT * FROM license_records WHERE license_id = ?'
  ).bind(licenseId).first()
  return asLicense(row)
}

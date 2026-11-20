export class CatalogApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

const PRODUCT_TYPES = new Set(['desktop', 'cli', 'web', 'api', 'library'])
const ACCESS_MODES = new Set(['online', 'hybrid', 'offline'])
const PURCHASE_TYPES = new Set(['free', 'recurring', 'fixed_term', 'perpetual'])
const INTERVALS = new Set(['monthly', 'yearly'])
const PRODUCT_ID_PATTERN = /^[a-z0-9][a-z0-9._-]{0,63}$/
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function requireObject(value, message) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new CatalogApiError(400, message)
  }
  return value
}

function parseJson(value, label) {
  try {
    return JSON.parse(value)
  } catch {
    throw new CatalogApiError(500, `Stored ${label} is invalid`)
  }
}

function audit(db, actor, action, entityType, entityId, createdAt) {
  return db.prepare(`
    INSERT INTO license_admin_audit (
      license_id, actor_email, actor_role, action, entity_type, entity_id, reason, created_at
    ) VALUES (NULL, ?, ?, ?, ?, ?, NULL, ?)
  `).bind(actor.email, actor.role, action, entityType, entityId, createdAt)
}

function productModel(row) {
  return {
    product_id: row.product_id,
    display_name: row.display_name,
    software_type: row.product_type,
    access_mode: row.access_mode,
    expired_access_policy: row.expired_access_policy,
    free_access: parseJson(row.free_access_json, 'free access policy'),
    max_activations: row.max_activations,
    offline_validity_cap_days: row.offline_validity_cap_days,
    status: row.status,
  }
}

function tierModel(row) {
  return {
    tier_revision_id: row.tier_revision_id,
    product_id: row.product_id,
    tier_id: row.tier_id,
    revision: row.revision,
    display_name: row.display_name,
    order: row.display_order,
    available: row.available === 1,
    trial_eligible: row.trial_eligible === 1,
    entitlements: parseJson(row.entitlements_json, 'tier entitlements'),
    published_at: row.published_at,
  }
}

function offerModel(row) {
  return {
    offer_id: row.offer_id,
    product_id: row.product_id,
    tier_revision_id: row.tier_revision_id,
    revision: row.revision,
    purchase_type: row.purchase_type,
    amount_minor: row.amount_minor,
    currency: row.currency,
    interval: row.interval,
    duration_days: row.duration_days,
    minimum_quantity: row.minimum_quantity,
    stripe_price_id: row.stripe_price_id,
    archived: row.status === 'archived',
  }
}

export async function listProducts(db) {
  const { results = [] } = await db.prepare(
    'SELECT * FROM license_products ORDER BY product_id'
  ).all()
  return results.map(productModel)
}

export async function createProduct(db, input, actor) {
  const body = requireObject(input, 'Product JSON object is required')
  const productId = body.product_id
  const displayName = typeof body.display_name === 'string' ? body.display_name.trim() : ''
  if (typeof productId !== 'string' || !PRODUCT_ID_PATTERN.test(productId)) {
    throw new CatalogApiError(400, 'Invalid product_id')
  }
  if (!displayName || displayName.length > 120) {
    throw new CatalogApiError(400, 'display_name must be 1-120 characters')
  }
  if (!PRODUCT_TYPES.has(body.software_type) || !ACCESS_MODES.has(body.access_mode)) {
    throw new CatalogApiError(400, 'Invalid software_type or access_mode')
  }
  const expiredPolicy = body.expired_access_policy || 'block_paid_operations'
  if (!['block_paid_operations', 'read_only'].includes(expiredPolicy)) {
    throw new CatalogApiError(400, 'Invalid expired_access_policy')
  }
  const freeAccess = body.free_access ?? {
    registration_required: true,
    built_in: false,
    offline_allowed: false,
  }
  if (!freeAccess || typeof freeAccess !== 'object' || Array.isArray(freeAccess)) {
    throw new CatalogApiError(400, 'free_access must be an object')
  }
  const offlineCap = body.offline_validity_cap_days ?? null
  if (body.access_mode === 'hybrid' && !(Number.isInteger(offlineCap) && offlineCap > 0)) {
    throw new CatalogApiError(400, 'Hybrid products require offline_validity_cap_days')
  }
  if (body.access_mode !== 'hybrid' && offlineCap !== null) {
    throw new CatalogApiError(400, 'Only hybrid products can set offline_validity_cap_days')
  }
  const maxActivations = body.max_activations ?? null
  if (maxActivations !== null && !(Number.isInteger(maxActivations) && maxActivations > 0)) {
    throw new CatalogApiError(400, 'max_activations must be a positive integer or null')
  }

  const now = new Date().toISOString()
  try {
    await db.batch([
      db.prepare(`
        INSERT INTO license_products (
          product_id, display_name, product_type, access_mode, expired_access_policy,
          free_access_json, max_activations, offline_validity_cap_days, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)
      `).bind(
        productId, displayName, body.software_type, body.access_mode, expiredPolicy,
        JSON.stringify(freeAccess), maxActivations, offlineCap, now, now
      ),
      audit(db, actor, 'create', 'product', productId, now),
    ])
  } catch (error) {
    if (String(error?.message || '').includes('UNIQUE')) {
      throw new CatalogApiError(409, 'Product already exists')
    }
    throw error
  }

  return {
    product_id: productId,
    display_name: displayName,
    software_type: body.software_type,
    access_mode: body.access_mode,
    expired_access_policy: expiredPolicy,
    free_access: freeAccess,
    max_activations: maxActivations,
    offline_validity_cap_days: offlineCap,
    status: 'active',
  }
}

export async function listTiers(db, productId) {
  const query = productId
    ? db.prepare(`SELECT * FROM license_tier_revisions WHERE product_id = ? ORDER BY display_order, tier_id, revision`).bind(productId)
    : db.prepare('SELECT * FROM license_tier_revisions ORDER BY product_id, display_order, tier_id, revision')
  const { results = [] } = await query.all()
  return results.map(tierModel)
}

export async function createTier(db, input, actor) {
  const body = requireObject(input, 'Tier revision JSON object is required')
  if (typeof body.product_id !== 'string' || !PRODUCT_ID_PATTERN.test(body.product_id)) {
    throw new CatalogApiError(400, 'Invalid product_id')
  }
  const tierId = typeof body.tier_id === 'string' ? body.tier_id.trim() : ''
  const displayName = typeof body.display_name === 'string' ? body.display_name.trim() : ''
  if (!tierId || tierId.length > 128 || !displayName || displayName.length > 120) {
    throw new CatalogApiError(400, 'tier_id and display_name are required')
  }
  const entitlements = requireObject(body.entitlements, 'entitlements must be an object')
  if (!Array.isArray(entitlements.features) || !entitlements.features.every((feature) => typeof feature === 'string')) {
    throw new CatalogApiError(400, 'entitlements.features must be an array of strings')
  }
  if (new Set(entitlements.features).size !== entitlements.features.length) {
    throw new CatalogApiError(400, 'Entitlement feature IDs must be unique')
  }
  if (!entitlements.limits || typeof entitlements.limits !== 'object' || Array.isArray(entitlements.limits)) {
    throw new CatalogApiError(400, 'entitlements.limits must be an object')
  }
  const product = await db.prepare(
    "SELECT 1 AS found FROM license_products WHERE product_id = ? AND status = 'active'"
  ).bind(body.product_id).first()
  if (!product) throw new CatalogApiError(404, 'Active product not found')
  const latest = await db.prepare(`
    SELECT MAX(revision) AS revision FROM license_tier_revisions
    WHERE product_id = ? AND tier_id = ?
  `).bind(body.product_id, tierId).first()
  const revision = (latest?.revision || 0) + 1
  const id = body.tier_revision_id || crypto.randomUUID()
  if (!UUID_PATTERN.test(id)) throw new CatalogApiError(400, 'Invalid tier_revision_id')
  const order = Number.isInteger(body.order) && body.order >= 0 ? body.order : 0
  const available = body.available === false ? 0 : 1
  const trialEligible = body.trial_eligible === true ? 1 : 0
  const now = new Date().toISOString()

  try {
    await db.batch([
      db.prepare(`
        INSERT INTO license_tier_revisions (
          tier_revision_id, product_id, tier_id, revision, display_name, display_order,
          available, trial_eligible, entitlements_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id, body.product_id, tierId, revision, displayName, order, available,
        trialEligible, JSON.stringify(entitlements), now
      ),
      audit(db, actor, 'create', 'tier_revision', id, now),
    ])
  } catch (error) {
    if (String(error?.message || '').includes('UNIQUE')) {
      throw new CatalogApiError(409, 'Tier revision already exists; reload catalog and retry')
    }
    throw error
  }

  return {
    tier_revision_id: id,
    product_id: body.product_id,
    tier_id: tierId,
    revision,
    display_name: displayName,
    order,
    available: available === 1,
    trial_eligible: trialEligible === 1,
    entitlements,
    published_at: null,
  }
}

export async function listOffers(db) {
  const { results = [] } = await db.prepare(
    'SELECT * FROM license_offers ORDER BY product_id, offer_id, revision'
  ).all()
  return results.map(offerModel)
}

export async function createOffer(db, input, actor) {
  const body = requireObject(input, 'Offer JSON object is required')
  if (typeof body.product_id !== 'string' || !PRODUCT_ID_PATTERN.test(body.product_id)) {
    throw new CatalogApiError(400, 'Invalid product_id')
  }
  const tierRevisionId = body.tier_revision_id
  if (typeof tierRevisionId !== 'string' || !UUID_PATTERN.test(tierRevisionId)) {
    throw new CatalogApiError(400, 'Invalid tier_revision_id')
  }
  const purchaseType = body.purchase_type
  if (!PURCHASE_TYPES.has(purchaseType)) throw new CatalogApiError(400, 'Invalid purchase_type')
  const amount = body.amount_minor
  if (!Number.isInteger(amount) || amount < 0) throw new CatalogApiError(400, 'Invalid amount_minor')
  const quantity = body.minimum_quantity ?? 1
  if (!Number.isInteger(quantity) || quantity < 1) throw new CatalogApiError(400, 'Invalid minimum_quantity')
  const currency = body.currency ?? null
  const interval = body.interval ?? null
  const durationDays = body.duration_days ?? null
  const stripePriceId = typeof body.stripe_price_id === 'string' ? body.stripe_price_id.trim() : null

  if (purchaseType === 'free' && (amount !== 0 || currency || interval || durationDays || stripePriceId)) {
    throw new CatalogApiError(400, 'Free offers cannot include payment terms or a Stripe price ID')
  }
  if (purchaseType === 'recurring' && (
    amount <= 0 || !/^[A-Z]{3}$/.test(currency || '') || !INTERVALS.has(interval)
    || durationDays !== null || !stripePriceId
  )) {
    throw new CatalogApiError(400, 'Recurring offers require amount, currency, interval, and Stripe Price ID')
  }
  if (purchaseType === 'fixed_term' && (
    amount <= 0 || !/^[A-Z]{3}$/.test(currency || '') || !Number.isInteger(durationDays)
    || durationDays < 1 || interval || !stripePriceId
  )) {
    throw new CatalogApiError(400, 'Fixed-term offers require amount, currency, duration, and Stripe Price ID')
  }
  if (purchaseType === 'perpetual' && (
    amount <= 0 || !/^[A-Z]{3}$/.test(currency || '') || interval || durationDays || !stripePriceId
  )) {
    throw new CatalogApiError(400, 'Perpetual offers require amount, currency, and Stripe Price ID')
  }

  const tier = await db.prepare(`
    SELECT product_id FROM license_tier_revisions WHERE tier_revision_id = ?
  `).bind(tierRevisionId).first()
  if (!tier || tier.product_id !== body.product_id) {
    throw new CatalogApiError(400, 'Offer tier revision must belong to its product')
  }
  const offerId = body.offer_id || crypto.randomUUID()
  if (!UUID_PATTERN.test(offerId)) throw new CatalogApiError(400, 'Invalid offer_id')
  const latest = await db.prepare(
    'SELECT MAX(revision) AS revision FROM license_offers WHERE offer_id = ?'
  ).bind(offerId).first()
  const revision = (latest?.revision || 0) + 1
  const now = new Date().toISOString()

  try {
    await db.batch([
      db.prepare(`
        INSERT INTO license_offers (
          offer_id, revision, product_id, tier_revision_id, purchase_type,
          amount_minor, currency, interval, duration_days, minimum_quantity,
          stripe_price_id, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)
      `).bind(
        offerId, revision, body.product_id, tierRevisionId, purchaseType,
        amount, currency, interval, durationDays, quantity, stripePriceId, now
      ),
      audit(db, actor, 'create', 'offer', `${offerId}:${revision}`, now),
    ])
  } catch (error) {
    if (String(error?.message || '').includes('UNIQUE')) {
      throw new CatalogApiError(409, 'Offer revision already exists; reload and retry')
    }
    throw error
  }

  return {
    offer_id: offerId,
    product_id: body.product_id,
    tier_revision_id: tierRevisionId,
    revision,
    purchase_type: purchaseType,
    amount_minor: amount,
    currency,
    interval,
    duration_days: durationDays,
    minimum_quantity: quantity,
    stripe_price_id: stripePriceId,
    archived: false,
  }
}

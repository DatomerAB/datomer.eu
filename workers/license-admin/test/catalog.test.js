import assert from 'node:assert/strict'
import test from 'node:test'

import {
  CatalogApiError,
  createOffer,
  createProduct,
  createTier,
} from '../src/catalog.js'

class FakeCatalogD1 {
  constructor() {
    this.batches = []
  }

  prepare(sql) {
    const statement = {
      sql,
      values: [],
      bind: (...values) => { statement.values = values; return statement },
      first: async () => {
        if (sql.includes('FROM license_products')) return { found: 1 }
        if (sql.includes('MAX(revision) AS revision FROM license_tier_revisions')) return { revision: 0 }
        if (sql.includes('SELECT product_id FROM license_tier_revisions')) return { product_id: 'par' }
        if (sql.includes('MAX(revision) AS revision FROM license_offers')) return { revision: 0 }
        throw new Error(`Unexpected query: ${sql}`)
      },
      all: async () => ({ results: [] }),
    }
    return statement
  }

  async batch(statements) {
    this.batches.push(statements)
    return statements.map(() => ({ meta: { changes: 1 } }))
  }
}

const actor = { email: 'catalog-admin@datomer.eu', role: 'catalog-admin' }

test('creates a Pär product and immutable first tier revision with audit statements', async () => {
  const db = new FakeCatalogD1()
  const product = await createProduct(db, {
    product_id: 'par',
    display_name: 'Pär',
    software_type: 'desktop',
    access_mode: 'offline',
  }, actor)
  const tier = await createTier(db, {
    product_id: 'par',
    tier_id: 'plus',
    display_name: 'Plus',
    entitlements: { features: ['history'], limits: {} },
  }, actor)

  assert.equal(product.product_id, 'par')
  assert.equal(tier.product_id, 'par')
  assert.equal(tier.revision, 1)
  assert.equal(db.batches.length, 2)
  assert.equal(db.batches[0].length, 2)
  assert.equal(db.batches[1].length, 2)
})

test('requires a valid provider price ID for recurring offers', async () => {
  const db = new FakeCatalogD1()
  await assert.rejects(
    createOffer(db, {
      product_id: 'par',
      tier_revision_id: '22222222-2222-4222-8222-222222222222',
      purchase_type: 'recurring',
      amount_minor: 200,
      currency: 'USD',
      interval: 'monthly',
      stripe_price_id: '',
    }, actor),
    (error) => error instanceof CatalogApiError && error.status === 400
  )
  assert.equal(db.batches.length, 0)
})

test('creates a free offer only for a tier of the same product', async () => {
  const db = new FakeCatalogD1()
  const offer = await createOffer(db, {
    product_id: 'par',
    tier_revision_id: '22222222-2222-4222-8222-222222222222',
    purchase_type: 'free',
    amount_minor: 0,
  }, actor)

  assert.equal(offer.purchase_type, 'free')
  assert.equal(offer.minimum_quantity, 1)
  assert.equal(db.batches[0].length, 2)
})

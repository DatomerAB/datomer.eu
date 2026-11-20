PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS license_products (
    product_id TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    product_type TEXT NOT NULL,
    access_mode TEXT NOT NULL,
    expired_access_policy TEXT NOT NULL DEFAULT 'block_paid_operations',
    free_access_json TEXT NOT NULL DEFAULT '{"registration_required":true,"built_in":false,"offline_allowed":false}'
        CHECK (json_valid(free_access_json)),
    max_activations INTEGER CHECK (max_activations IS NULL OR max_activations > 0),
    offline_validity_cap_days INTEGER
        CHECK (offline_validity_cap_days IS NULL OR offline_validity_cap_days > 0),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS license_tier_revisions (
    tier_revision_id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES license_products(product_id),
    tier_id TEXT NOT NULL,
    revision INTEGER NOT NULL CHECK (revision > 0),
    display_name TEXT NOT NULL,
    available INTEGER NOT NULL DEFAULT 1 CHECK (available IN (0, 1)),
    trial_eligible INTEGER NOT NULL DEFAULT 0 CHECK (trial_eligible IN (0, 1)),
    entitlements_json TEXT NOT NULL CHECK (json_valid(entitlements_json)),
    created_at TEXT NOT NULL,
    UNIQUE (product_id, tier_id, revision)
);

CREATE TABLE IF NOT EXISTS license_offers (
    offer_id TEXT NOT NULL,
    revision INTEGER NOT NULL CHECK (revision > 0),
    product_id TEXT NOT NULL REFERENCES license_products(product_id),
    tier_revision_id TEXT NOT NULL REFERENCES license_tier_revisions(tier_revision_id),
    purchase_type TEXT NOT NULL,
    amount_minor INTEGER NOT NULL CHECK (amount_minor >= 0),
    currency TEXT,
    interval TEXT,
    duration_days INTEGER CHECK (duration_days IS NULL OR duration_days > 0),
    minimum_quantity INTEGER NOT NULL DEFAULT 1 CHECK (minimum_quantity > 0),
    stripe_price_id TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    created_at TEXT NOT NULL,
    PRIMARY KEY (offer_id, revision)
);

CREATE TABLE IF NOT EXISTS license_campaigns (
    campaign_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    starts_at TEXT NOT NULL,
    ends_at TEXT NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    eligible_product_ids_json TEXT NOT NULL CHECK (json_valid(eligible_product_ids_json)),
    eligible_offer_ids_json TEXT NOT NULL DEFAULT '[]' CHECK (json_valid(eligible_offer_ids_json)),
    promotion_json TEXT CHECK (promotion_json IS NULL OR json_valid(promotion_json)),
    redemption_scope TEXT NOT NULL CHECK (
        redemption_scope IN ('per_customer', 'per_organization', 'global')
    ),
    max_redemptions INTEGER CHECK (max_redemptions IS NULL OR max_redemptions > 0),
    redemptions_per_subject INTEGER NOT NULL DEFAULT 1 CHECK (redemptions_per_subject > 0),
    stacking_allowed INTEGER NOT NULL DEFAULT 0 CHECK (stacking_allowed IN (0, 1)),
    active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    CHECK (ends_at > starts_at)
);

CREATE TABLE IF NOT EXISTS license_records (
    license_id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES license_products(product_id),
    subject TEXT NOT NULL,
    tier_id TEXT NOT NULL,
    tier_revision INTEGER NOT NULL CHECK (tier_revision > 0),
    tier_revision_id TEXT NOT NULL REFERENCES license_tier_revisions(tier_revision_id),
    entitlements_json TEXT NOT NULL CHECK (json_valid(entitlements_json)),
    valid_from TEXT NOT NULL,
    valid_until TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
    issued_by TEXT NOT NULL,
    issued_at TEXT NOT NULL,
    revoked_by TEXT,
    revoked_at TEXT,
    revocation_reason TEXT,
    CHECK (valid_until IS NULL OR valid_until > valid_from),
    CHECK (
        (status = 'active' AND revoked_at IS NULL AND revoked_by IS NULL)
        OR (status = 'revoked' AND revoked_at IS NOT NULL AND revoked_by IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS license_records_product_status_idx
    ON license_records (product_id, status, issued_at DESC);
CREATE INDEX IF NOT EXISTS license_records_subject_idx
    ON license_records (subject, issued_at DESC);

CREATE TABLE IF NOT EXISTS admin_user_roles (
    email TEXT NOT NULL COLLATE NOCASE,
    role TEXT NOT NULL CHECK (
        role IN ('license-reader', 'license-operator', 'catalog-admin', 'security-admin')
    ),
    assigned_by TEXT NOT NULL,
    assigned_at TEXT NOT NULL,
    PRIMARY KEY (email, role)
);

CREATE TABLE IF NOT EXISTS license_admin_audit (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    license_id TEXT,
    actor_email TEXT NOT NULL COLLATE NOCASE,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    reason TEXT,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS license_admin_audit_entity_idx
    ON license_admin_audit (entity_type, entity_id, created_at DESC);

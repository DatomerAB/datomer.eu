ALTER TABLE license_tier_revisions
ADD COLUMN display_order INTEGER NOT NULL DEFAULT 0 CHECK (display_order >= 0);

ALTER TABLE license_tier_revisions
ADD COLUMN published_at TEXT;

ALTER TABLE license_admin_audit
ADD COLUMN actor_role TEXT NOT NULL DEFAULT 'security-admin';

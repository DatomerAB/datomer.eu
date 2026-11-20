const ROLES = new Set([
  'license-reader',
  'license-operator',
  'catalog-admin',
  'security-admin',
])

export class RoleApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

export async function listAdminRoles(db) {
  const { results = [] } = await db.prepare(`
    SELECT email, role, assigned_by, assigned_at
    FROM admin_user_roles
    ORDER BY email COLLATE NOCASE, role
  `).all()
  return results
}

export async function changeAdminRole(db, input, actor) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new RoleApiError(400, 'Role request must be a JSON object')
  }
  const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : ''
  const role = input.role
  const action = input.action
  if (!email || email.length > 255 || !email.includes('@')) {
    throw new RoleApiError(400, 'A valid email is required')
  }
  if (!ROLES.has(role)) throw new RoleApiError(400, 'Unknown admin role')
  if (action !== 'grant' && action !== 'revoke') {
    throw new RoleApiError(400, 'Action must be grant or revoke')
  }

  const now = new Date().toISOString()
  const entityId = `${email}:${role}`
  const audit = (verb) => db.prepare(`
    INSERT INTO license_admin_audit (
      license_id, actor_email, actor_role, action, entity_type, entity_id, reason, created_at
    ) SELECT NULL, ?, ?, ?, 'admin_role', ?, NULL, ? WHERE changes() = 1
  `).bind(actor.email, actor.role, verb, entityId, now)

  const statement = action === 'grant'
    ? db.prepare(`
        INSERT OR IGNORE INTO admin_user_roles (email, role, assigned_by, assigned_at)
        VALUES (?, ?, ?, ?)
      `).bind(email, role, actor.email, now)
    : db.prepare(`
        DELETE FROM admin_user_roles
        WHERE email = ? AND role = ?
          AND (role != 'security-admin' OR (
            SELECT COUNT(*) FROM admin_user_roles WHERE role = 'security-admin'
          ) > 1)
      `).bind(email, role)

  const results = await db.batch([statement, audit(action)])
  const changes = results[0]?.meta?.changes || 0
  if (changes !== 1) {
    if (action === 'revoke' && role === 'security-admin') {
      const target = await db.prepare(`
        SELECT 1 AS found FROM admin_user_roles WHERE email = ? AND role = ?
      `).bind(email, role).first()
      if (target) throw new RoleApiError(409, 'Cannot revoke the last security-admin role')
    }
    throw new RoleApiError(409, `Role ${action} was not applied`)
  }
  return { email, role, action, changed_at: now }
}

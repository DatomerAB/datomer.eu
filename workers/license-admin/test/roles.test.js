import assert from 'node:assert/strict'
import test from 'node:test'

import { changeAdminRole, listAdminRoles, RoleApiError } from '../src/roles.js'

class FakeD1 {
  constructor(seed = []) {
    this.roles = new Map(seed.map(({ email, role }) => [`${email.toLowerCase()}:${role}`, { email: email.toLowerCase(), role, assigned_by: 'bootstrap', assigned_at: '2026-01-01T00:00:00.000Z' }]))
    this.audit = []
    this.lastChanges = 0
  }

  prepare(sql) {
    const statement = {
      sql,
      values: [],
      bind: (...values) => { statement.values = values; return statement },
      first: async () => this.first(statement),
      all: async () => this.all(statement),
    }
    return statement
  }

  async first(statement) {
    if (statement.sql.includes('SELECT 1 AS found FROM admin_user_roles')) {
      const [email, role] = statement.values
      return this.roles.has(`${email.toLowerCase()}:${role}`) ? { found: 1 } : null
    }
    throw new Error(`Unexpected first query: ${statement.sql}`)
  }

  async all(statement) {
    if (statement.sql.includes('FROM admin_user_roles')) return { results: [...this.roles.values()] }
    throw new Error(`Unexpected all query: ${statement.sql}`)
  }

  async batch(statements) {
    const result = []
    for (const statement of statements) {
      const [email, role, assignedBy, assignedAt] = statement.values
      const key = `${String(email).toLowerCase()}:${role}`
      if (statement.sql.includes('INSERT OR IGNORE INTO admin_user_roles')) {
        this.lastChanges = this.roles.has(key) ? 0 : 1
        if (this.lastChanges) this.roles.set(key, { email: String(email).toLowerCase(), role, assigned_by: assignedBy, assigned_at: assignedAt })
        result.push({ meta: { changes: this.lastChanges } })
      } else if (statement.sql.includes('DELETE FROM admin_user_roles')) {
        const hasRole = this.roles.has(key)
        const adminCount = [...this.roles.values()].filter((item) => item.role === 'security-admin').length
        this.lastChanges = hasRole && (role !== 'security-admin' || adminCount > 1) ? 1 : 0
        if (this.lastChanges) this.roles.delete(key)
        result.push({ meta: { changes: this.lastChanges } })
      } else if (statement.sql.includes('INSERT INTO license_admin_audit')) {
        const [actor, actorRole, action, entityId, createdAt] = statement.values
        this.lastChanges = this.lastChanges ? 1 : 0
        if (this.lastChanges) this.audit.push({ actor, actorRole, action, entityId, createdAt })
        result.push({ meta: { changes: this.lastChanges } })
      } else {
        throw new Error(`Unexpected batch query: ${statement.sql}`)
      }
    }
    return result
  }
}

const securityAdmin = { email: 'root@datomer.eu', role: 'security-admin' }

test('security admin can grant and revoke non-final roles with an audit entry', async () => {
  const db = new FakeD1([{ email: securityAdmin.email, role: securityAdmin.role }])
  const granted = await changeAdminRole(db, { email: 'Operator@datomer.eu', role: 'license-operator', action: 'grant' }, securityAdmin)
  assert.deepEqual(granted, { email: 'operator@datomer.eu', role: 'license-operator', action: 'grant', changed_at: granted.changed_at })
  assert.equal((await listAdminRoles(db)).length, 2)

  const revoked = await changeAdminRole(db, { email: 'operator@datomer.eu', role: 'license-operator', action: 'revoke' }, securityAdmin)
  assert.equal(revoked.action, 'revoke')
  assert.equal(db.audit.length, 2)
})

test('does not allow revoking the last security admin', async () => {
  const db = new FakeD1([{ email: securityAdmin.email, role: securityAdmin.role }])
  await assert.rejects(
    changeAdminRole(db, { email: securityAdmin.email, role: 'security-admin', action: 'revoke' }, securityAdmin),
    (error) => error instanceof RoleApiError && error.status === 409
  )
  assert.equal((await listAdminRoles(db)).length, 1)
})

test('rejects duplicate role grants and unknown roles', async () => {
  const db = new FakeD1([{ email: securityAdmin.email, role: securityAdmin.role }])
  await assert.rejects(
    changeAdminRole(db, { email: securityAdmin.email, role: securityAdmin.role, action: 'grant' }, securityAdmin),
    (error) => error instanceof RoleApiError && error.status === 409
  )
  await assert.rejects(
    changeAdminRole(db, { email: 'operator@datomer.eu', role: 'owner', action: 'grant' }, securityAdmin),
    (error) => error instanceof RoleApiError && error.status === 400
  )
})

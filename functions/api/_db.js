const SUBMISSIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source TEXT NOT NULL,
    created_at TEXT NOT NULL,
    email TEXT,
    name TEXT,
    country TEXT,
    subject TEXT,
    message TEXT,
    body TEXT,
    metadata TEXT
  )
`

function getDb(env) {
  // Cloudflare Pages Functions expose D1 bindings on env directly.
  // We use a single binding name: DB.
  return env.DB || null
}

export async function createSubmissionsTable(env) {
  const db = getDb(env)
  if (!db) {
    console.warn('[db] no D1 binding found')
    return
  }
  try {
    await db.exec(SUBMISSIONS_TABLE)
    await db.exec('CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at)')
    await db.exec('CREATE INDEX IF NOT EXISTS idx_submissions_source ON submissions(source)')
  } catch (err) {
    console.error('[db] createSubmissionsTable error:', err.message || err)
  }
}

export async function insertSubmission(env, submission) {
  const db = getDb(env)
  if (!db) {
    console.warn('[db] no D1 binding found; skipping insert')
    return null
  }

  const {
    source,
    createdAt = new Date().toISOString(),
    email,
    name,
    country,
    subject,
    message,
    body,
    metadata,
  } = submission

  try {
    const result = await db
      .prepare(
        `INSERT INTO submissions (source, created_at, email, name, country, subject, message, body, metadata)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        source,
        createdAt,
        email ?? null,
        name ?? null,
        country ?? null,
        subject ?? null,
        message ?? null,
        body ?? null,
        metadata ? JSON.stringify(metadata) : null
      )
      .run()
    return result
  } catch (err) {
    console.error('[db] insertSubmission error:', err.message || err)
    return null
  }
}

export async function getSubmissionsSince(env, isoDate) {
  const db = getDb(env)
  if (!db) {
    console.warn('[db] no D1 binding found; returning empty result')
    return []
  }

  try {
    const { results } = await db
      .prepare('SELECT * FROM submissions WHERE created_at >= ? ORDER BY created_at DESC')
      .bind(isoDate)
      .all()
    return results || []
  } catch (err) {
    console.error('[db] getSubmissionsSince error:', err.message || err)
    return []
  }
}

export async function pruneOldSubmissions(env, days = 30) {
  const db = getDb(env)
  if (!db) {
    console.warn('[db] no D1 binding found; skipping prune')
    return null
  }

  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  try {
    const result = await db
      .prepare('DELETE FROM submissions WHERE created_at < ?')
      .bind(cutoff)
      .run()
    console.log('[db] pruneOldSubmissions removed', result.meta?.changes || 0, 'rows older than', cutoff)
    return result
  } catch (err) {
    console.error('[db] pruneOldSubmissions error:', err.message || err)
    return null
  }
}

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

const EVENTS_TABLE = `
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    type TEXT NOT NULL,
    page_path TEXT,
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
    await db.exec(EVENTS_TABLE)
    await db.exec('CREATE INDEX IF NOT EXISTS idx_events_session_id ON events(session_id)')
    await db.exec('CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at)')
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

export async function getSubmissionsInRange(env, startIso, endIso) {
  const db = getDb(env)
  if (!db) {
    console.warn('[db] no D1 binding found; returning empty result')
    return []
  }

  try {
    const { results } = await db
      .prepare('SELECT * FROM submissions WHERE created_at >= ? AND created_at < ? ORDER BY created_at DESC')
      .bind(startIso, endIso)
      .all()
    return results || []
  } catch (err) {
    console.error('[db] getSubmissionsInRange error:', err.message || err)
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
    const submissionResult = await db
      .prepare('DELETE FROM submissions WHERE created_at < ?')
      .bind(cutoff)
      .run()
    const eventResult = await db
      .prepare('DELETE FROM events WHERE created_at < ?')
      .bind(cutoff)
      .run()
    console.log(
      '[db] pruneOldSubmissions removed',
      submissionResult.meta?.changes || 0,
      'submission(s) and',
      eventResult.meta?.changes || 0,
      'event(s) older than',
      cutoff
    )
    return { submissions: submissionResult, events: eventResult }
  } catch (err) {
    console.error('[db] pruneOldSubmissions error:', err.message || err)
    return null
  }
}

export async function insertEvent(env, event) {
  const db = getDb(env)
  if (!db) {
    console.warn('[db] no D1 binding found; skipping event insert')
    return null
  }

  const {
    sessionId,
    createdAt = new Date().toISOString(),
    type,
    pagePath,
    metadata,
  } = event

  try {
    const result = await db
      .prepare(
        `INSERT INTO events (session_id, created_at, type, page_path, metadata)
         VALUES (?, ?, ?, ?, ?)`
      )
      .bind(
        sessionId,
        createdAt,
        type,
        pagePath ?? null,
        metadata ? JSON.stringify(metadata) : null
      )
      .run()
    return result
  } catch (err) {
    console.error('[db] insertEvent error:', err.message || err)
    return null
  }
}

export async function getEventsSince(env, isoDate) {
  const db = getDb(env)
  if (!db) {
    console.warn('[db] no D1 binding found; returning empty events')
    return []
  }

  try {
    const { results } = await db
      .prepare('SELECT * FROM events WHERE created_at >= ? ORDER BY created_at DESC')
      .bind(isoDate)
      .all()
    return results || []
  } catch (err) {
    console.error('[db] getEventsSince error:', err.message || err)
    return []
  }
}

export async function getSessionTimeOnSite(env, sessionId) {
  const db = getDb(env)
  if (!db || !sessionId) return 0

  try {
    const { results } = await db
      .prepare(
        `SELECT MIN(created_at) AS first_at, MAX(created_at) AS last_at
         FROM events
         WHERE session_id = ?`
      )
      .bind(sessionId)
      .all()
    const row = results?.[0]
    if (!row?.first_at || !row?.last_at) return 0
    const first = new Date(row.first_at).getTime()
    const last = new Date(row.last_at).getTime()
    return Math.max(0, last - first)
  } catch (err) {
    console.error('[db] getSessionTimeOnSite error:', err.message || err)
    return 0
  }
}

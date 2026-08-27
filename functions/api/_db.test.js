import { describe, expect, it, vi, beforeEach } from 'vitest'
import { insertSubmission, getSubmissionsSince, getSubmissionsInRange, pruneOldSubmissions, createSubmissionsTable } from './_db.js'

function makeEnv(results = []) {
  const prepared = {
    bind: vi.fn(() => prepared),
    run: vi.fn(() => Promise.resolve({ meta: { changes: 1 }, success: true })),
    all: vi.fn(() => Promise.resolve({ results })),
  }
  const db = {
    prepare: vi.fn(() => prepared),
    exec: vi.fn(() => Promise.resolve()),
  }
  return { DB: db, prepared }
}

describe('D1 helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates the submissions table', async () => {
    const env = makeEnv()
    await createSubmissionsTable(env)
    expect(env.DB.exec).toHaveBeenCalled()
  })

  it('inserts a submission and returns the result', async () => {
    const env = makeEnv()
    const result = await insertSubmission(env, {
      source: 'contact',
      email: 'test@example.com',
      name: 'Test User',
      message: 'Hello',
    })

    expect(result).toEqual({ meta: { changes: 1 }, success: true })
    expect(env.DB.prepare).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO submissions'))
    expect(env.prepared.bind).toHaveBeenCalledWith(
      'contact',
      expect.any(String),
      'test@example.com',
      'Test User',
      null,
      null,
      'Hello',
      null,
      null
    )
  })

  it('warns and returns null when DB binding is missing', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const result = await insertSubmission({}, { source: 'contact' })
    expect(result).toBeNull()
    expect(consoleSpy).toHaveBeenCalledWith('[db] no D1 binding found; skipping insert')
    consoleSpy.mockRestore()
  })

  it('returns submissions since a given date', async () => {
    const rows = [{ id: 1, source: 'contact', email: 'a@example.com' }]
    const env = makeEnv(rows)
    const result = await getSubmissionsSince(env, '2026-08-01T00:00:00.000Z')
    expect(result).toEqual(rows)
    expect(env.prepared.bind).toHaveBeenCalledWith('2026-08-01T00:00:00.000Z')
  })

  it('returns submissions within a date range', async () => {
    const rows = [
      { id: 1, source: 'contact', email: 'a@example.com' },
      { id: 2, source: 'download', email: 'b@example.com' },
    ]
    const env = makeEnv(rows)
    const result = await getSubmissionsInRange(env, '2026-08-01T00:00:00.000Z', '2026-08-02T00:00:00.000Z')
    expect(result).toEqual(rows)
    expect(env.prepared.bind).toHaveBeenCalledWith('2026-08-01T00:00:00.000Z', '2026-08-02T00:00:00.000Z')
  })

  it('prunes submissions and events older than N days', async () => {
    const env = makeEnv()
    const result = await pruneOldSubmissions(env, 30)
    expect(result).toEqual({
      submissions: { meta: { changes: 1 }, success: true },
      events: { meta: { changes: 1 }, success: true },
    })
    expect(env.DB.prepare).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM submissions'))
    expect(env.DB.prepare).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM events'))
  })
})

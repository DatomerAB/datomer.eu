import { describe, expect, it, vi, beforeEach } from 'vitest'
import worker from './index.js'

vi.mock('../../../functions/api/_dailySummary.js', () => ({
  runDailySummary: vi.fn(() => Promise.resolve({ ok: true, count: 3 })),
}))

import { runDailySummary } from '../../../functions/api/_dailySummary.js'

describe('daily-summary worker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls runDailySummary on scheduled event', async () => {
    const event = { scheduledTime: Date.now() }
    const env = { RESEND_API_KEY: 're_123' }
    const ctx = { waitUntil: vi.fn((p) => p) }

    const result = await worker.scheduled(event, env, ctx)

    expect(runDailySummary).toHaveBeenCalledWith(env, ctx, { scheduledTime: event.scheduledTime })
    expect(result).toEqual({ ok: true, count: 3 })
  })
})

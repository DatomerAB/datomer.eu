import { runDailySummary } from '../../../functions/api/_dailySummary.js'

export default {
  async scheduled(event, env, ctx) {
    console.log('[worker:daily-summary] cron triggered at', event.scheduledTime)
    const result = await runDailySummary(env, ctx, { scheduledTime: event.scheduledTime })
    console.log('[worker:daily-summary] result:', JSON.stringify(result))
    return result
  },

  async fetch(request, env, ctx) {
    const auth = request.headers.get('Authorization') || ''
    const expected = `Bearer ${env.DAILY_SUMMARY_SECRET || ''}`
    if (auth !== expected) {
      return new Response('Unauthorized', { status: 401 })
    }
    console.log('[worker:daily-summary] manual http trigger')
    const result = await runDailySummary(env, ctx, { scheduledTime: Date.now() })
    console.log('[worker:daily-summary] result:', JSON.stringify(result))
    return new Response(JSON.stringify(result), {
      status: result.ok ? 200 : 500,
      headers: { 'Content-Type': 'application/json' },
    })
  },
}

import { runDailySummary } from '../../../functions/api/_dailySummary.js'

export default {
  async scheduled(event, env, ctx) {
    console.log('[worker:daily-summary] cron triggered at', event.scheduledTime)
    const result = await runDailySummary(env, ctx, { scheduledTime: event.scheduledTime })
    console.log('[worker:daily-summary] result:', JSON.stringify(result))
    return result
  },
}

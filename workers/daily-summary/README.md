# datomer-daily-summary Worker

A separate Cloudflare Worker that runs once per day at 06:00 UTC, queries the last 24 hours of form submissions from the shared D1 database, and emails a summary with a CSV attachment to `dailysummary@datomer.eu`.

## Why a separate Worker?

Cloudflare Pages Functions do not support cron triggers or `scheduled` handlers. This Worker shares the same D1 database as the Pages project and is deployed independently.

## Deploy

Set the Resend API key as a secret for each environment:

```bash
# Preview / staging
npx wrangler secret put RESEND_API_KEY --env preview

# Production
npx wrangler secret put RESEND_API_KEY --env production
```

Then deploy:

```bash
# Preview / staging
npm run deploy:preview

# Production
npm run deploy:production
```

## Manual trigger

You can also trigger the summary manually via the protected HTTP endpoint in the Pages project:

```bash
curl -H "Authorization: Bearer $DAILY_SUMMARY_SECRET" \
  https://<your-pages-domain>/api/admin/daily-summary
```

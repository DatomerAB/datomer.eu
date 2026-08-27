# datomer-daily-summary Worker

A separate Cloudflare Worker that runs once per day at 06:00 UTC, queries the last 24 hours of form submissions from the shared D1 database, and emails a summary with a CSV attachment to `dailysummary@datomer.eu`.

## Why a separate Worker?

Cloudflare Pages Functions do not support cron triggers or `scheduled` handlers. This Worker shares the same D1 database as the Pages project and is deployed independently.

## Automated deployment via GitHub Actions

Pushes to `staging` or `main` that touch the Worker or shared summary code automatically deploy the Worker via `.github/workflows/deploy-daily-summary.yml`.

### Required GitHub repository secrets

Create these in **GitHub → Settings → Secrets and variables → Actions → Repository secrets**:

| Secret | Purpose |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token with `Cloudflare Workers:Edit` and `Account:Read` permissions |
| `PREVIEW_RESEND_API_KEY` | Resend API key for the preview/staging Worker |
| `PRODUCTION_RESEND_API_KEY` | Resend API key for the production Worker |
| `PREVIEW_DAILY_SUMMARY_TO_EMAIL` | Optional override for the preview summary recipient |
| `PRODUCTION_DAILY_SUMMARY_TO_EMAIL` | Optional override for the production summary recipient |

### Creating a Cloudflare API token

1. Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens).
2. Click **Create Token** → **Custom token**.
3. Permissions:
   - **Account** → **Cloudflare Workers:Edit**
   - **Account** → **Account:Read**
4. Account Resources: include your account.
5. Create the token and add it as the `CLOUDFLARE_API_TOKEN` GitHub secret.

## Manual deployment

If you prefer to deploy manually:

```bash
# Preview / staging
cd workers/daily-summary
npx wrangler secret put RESEND_API_KEY --env preview
npm run deploy:preview

# Production
npx wrangler secret put RESEND_API_KEY --env production
npm run deploy:production
```

Optional recipient override:

```bash
npx wrangler secret put DAILY_SUMMARY_TO_EMAIL --env preview
npx wrangler secret put DAILY_SUMMARY_TO_EMAIL --env production
```

## Manual trigger

You can also trigger the summary manually via the protected HTTP endpoint in the Pages project:

```bash
curl -H "Authorization: Bearer $DAILY_SUMMARY_SECRET" \
  https://<your-pages-domain>/api/admin/daily-summary
```

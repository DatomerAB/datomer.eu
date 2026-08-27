# Deployment guide

This project deploys through Cloudflare Pages using GitHub branches.

## Branch to environment mapping

- main -> production
- staging -> preview / staging environment

This repo is configured so that:

- pushes to main trigger the production deployment
- pushes to staging trigger the preview/staging deployment

## Required deployment setup

Cloudflare Pages is configured to manage non-secret environment variables through Wrangler for this project. Secret values must be set in the Cloudflare Pages dashboard as encrypted secrets.

### Production environment

Set the production values in the Cloudflare Pages production project and keep secrets encrypted in the dashboard.

Public variables:

- VITE_STRIPE_PLUS_MONTHLY
- VITE_STRIPE_PLUS_YEARLY
- VITE_STRIPE_PRO_MONTHLY
- VITE_STRIPE_PRO_YEARLY
- VITE_STRIPE_PUBLISHABLE_KEY
- VITE_TURNSTILE_SITE_KEY
- RESEND_FROM_EMAIL
- RESEND_FROM_NAME (`Pär by Datomer`)
- ENVIRONMENT (`production`)

Secret values:

- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- TURNSTILE_SECRET_KEY
- RESEND_API_KEY
- DAILY_SUMMARY_SECRET (used by `/api/admin/daily-summary`)

These must be the live-mode values for the production deployment.

### Preview / staging environment

Set the preview values in the Wrangler preview config and keep secrets in Cloudflare as encrypted secrets.

Public variables:

- VITE_STRIPE_PLUS_MONTHLY
- VITE_STRIPE_PLUS_YEARLY
- VITE_STRIPE_PRO_MONTHLY
- VITE_STRIPE_PRO_YEARLY
- VITE_STRIPE_PUBLISHABLE_KEY
- VITE_TURNSTILE_SITE_KEY
- RESEND_FROM_EMAIL
- RESEND_FROM_NAME (`Pär by Datomer`)
- CONTACT_TO_EMAIL
- ENVIRONMENT (`preview`)

Secret values:

- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- TURNSTILE_SECRET_KEY
- RESEND_API_KEY
- DAILY_SUMMARY_SECRET (used by `/api/admin/daily-summary`)

Optional variables:

- WAITLIST_WEBHOOK_URL (forwards form submissions to an external webhook)

These must be the test-mode values for the preview environment.

### Example preview config in Wrangler

```toml
[env.preview]
vars = {
  VITE_STRIPE_PLUS_MONTHLY = "price_1U7zF9R09UqACN9NntgB4JzA",
  VITE_STRIPE_PLUS_YEARLY = "price_1U7zG9R09UqACN9NJ9kBYu6P",
  VITE_STRIPE_PRO_MONTHLY = "price_1U7zHBR09UqACN9Nfgg2h6Hk",
  VITE_STRIPE_PRO_YEARLY = "price_1U7zHrR09UqACN9NaYgW8Byi",
  VITE_STRIPE_PUBLISHABLE_KEY = "pk_test_51U7ZYCR09UqACN9NT2FVNCu5PyCFv4fMIYymJdcRP0HfPgPxwnuJfNwL8PgYAcNXRCJCx8sNh8m3vwFivElEKjyT0028UDEk0d",
  VITE_TURNSTILE_SITE_KEY = "0x4AAAAAAEZ22x8qe4HNWU2O",
  RESEND_FROM_EMAIL = "hello1@datomer.eu",
  CONTACT_TO_EMAIL = "hello@datomer.eu"
}
```

The matching secret values should be created in Cloudflare as secrets, not committed into source control.

## D1 schema migrations

The D1 database has two tables:

- `submissions` — form submissions from contact, waitlist, newsletter, and download flows.
- `events` — anonymous page-view and heartbeat events collected after analytics consent.

After cloning or before the first deployment, apply the schema:

```bash
# Preview / staging
wrangler d1 execute datomer-submissions-preview --env preview --file functions/api/_db/schema.sql

# Production
wrangler d1 execute datomer-submissions-production --env production --file functions/api/_db/schema.sql
```

Run the same command again whenever `schema.sql` changes. Both Pages Functions and the daily-summary Worker share the same D1 binding.

## Daily summary Worker deployment

The daily summary runs as a separate Cloudflare Worker so it can use native cron triggers. Pages Functions do not support cron.

Deploy the Worker after pushing the Pages branch:

```bash
cd workers/daily-summary

# Preview / staging
wrangler deploy --env preview

# Production
wrangler deploy --env production
```

Required Worker variables (already in `workers/daily-summary/wrangler.toml`):

- RESEND_FROM_EMAIL
- RESEND_FROM_NAME (`Pär by Datomer`)
- CONTACT_TO_EMAIL
- DAILY_SUMMARY_TO_EMAIL (`dailysummary@datomer.eu`)
- ENVIRONMENT (`preview` or `production`)

Required Worker secrets (set via `wrangler secret put` in the Worker directory):

- RESEND_API_KEY
- DAILY_SUMMARY_SECRET

The Worker exposes an HTTP endpoint protected by `Authorization: Bearer <DAILY_SUMMARY_SECRET>` for manual testing.

## Pre-flight deployment checklist

Before any push or merge, verify the following:

- [ ] The target Cloudflare Pages project is correct: preview/staging or production.
- [ ] The deployment hostname matches the Turnstile widget hostname.
- [ ] The Turnstile site key matches the exact widget in Cloudflare.
- [ ] The Turnstile secret matches that same widget.
- [ ] The Stripe publishable key matches the correct environment and account.
- [ ] The Stripe secret matches the correct environment and account.
- [ ] All `VITE_STRIPE_*` values are non-empty and valid.
- [ ] The live/preview environment is not mixing test and live keys.
- [ ] The Cloudflare Pages dashboard value matches the repo/public env value for the active environment.
- [ ] The `SITE_URL` is correct for the target host.
- [ ] `ENVIRONMENT` is set to `preview` or `production` for the target.
- [ ] `RESEND_FROM_NAME` is set to `Pär by Datomer`.
- [ ] The D1 schema has been applied for the target environment.
- [ ] The daily-summary Worker has been deployed for the target environment.
- [ ] The site has been redeployed after any Turnstile key/secret change.
- [ ] The pricing buttons render and have valid `priceId` values.
- [ ] The app is not hitting the fallback `Payment is not configured yet.` path.

## Staging deployment flow

1. Work on the staging branch.
2. Run the local checks before pushing:
   - npm test
   - npm run build
3. Confirm the preview/test values are correct for the staging environment.
4. Commit the changes.
5. Push to the origin staging branch.
6. Cloudflare Pages should automatically start the preview build.
7. Watch the Cloudflare build logs.
8. Verify the preview site loads and the pricing flow works in the preview environment.

Example:

```bash
git checkout staging
git add .
git commit -m "chore: release preview updates"
git push origin staging
```

## Production deployment flow

1. Validate the staging branch and confirm the preview URL is working.
2. Merge the approved staging changes into main.
3. Push to the origin main branch.
4. Cloudflare Pages should automatically trigger the production deployment.
5. Verify the live production site after deployment.

Example:

```bash
git checkout main
git merge staging
git push origin main
```

## Pre-deploy verification checklist

Before either deployment, verify all of the following:

- application build succeeds
- tests pass
- pricing buttons render correctly
- the correct Stripe price IDs are used for the target environment
- the correct Stripe publishable key is used for the target environment
- the correct Turnstile site key is used for the target environment
- the matching secret values are configured in Cloudflare for the target environment
- webhook secret matches the target environment
- preview and production secrets are not mixed across environments
- public preview values are in Wrangler, not committed as secrets

## Post-deploy verification checklist

After each deployment, verify:

- the site loads from the expected environment
- the homepage renders correctly
- navigation works
- pricing CTA buttons work
- the correct favicon is present
- checkout redirects are correct
- Stripe test payment flow works in preview
- live production payment flow works in production

## Staging release checklist

Use this checklist before approving a preview/staging deployment:

- [ ] Confirm the deployment target is the staging/preview project, not production
- [ ] Verify preview public values are present in the Wrangler preview config
- [ ] Verify the following preview/public values are set correctly:
  - VITE_STRIPE_PLUS_MONTHLY
  - VITE_STRIPE_PLUS_YEARLY
  - VITE_STRIPE_PRO_MONTHLY
  - VITE_STRIPE_PRO_YEARLY
  - VITE_STRIPE_PUBLISHABLE_KEY
  - VITE_TURNSTILE_SITE_KEY
  - RESEND_FROM_EMAIL
- [ ] Verify the matching encrypted secret values exist in Cloudflare:
  - STRIPE_SECRET_KEY
  - STRIPE_WEBHOOK_SECRET
  - TURNSTILE_SECRET_KEY
  - RESEND_API_KEY
- [ ] Confirm the Stripe values are test-mode keys for preview
- [ ] Confirm the Turnstile site key and secret match the same preview project
- [ ] Run npm test
- [ ] Run npm run build
- [ ] Apply the D1 schema migration to the preview database
- [ ] Push to the staging branch
- [ ] Deploy the daily-summary Worker to preview
- [ ] Check the Cloudflare build logs for success
- [ ] Open the preview URL and confirm the homepage loads
- [ ] Check navigation, pricing toggle, and CTA buttons
- [ ] Submit the contact, waitlist, newsletter, and download forms and confirm branded emails arrive
- [ ] Trigger `/api/admin/daily-summary` and verify the CSV includes environment, action, country, city, and time-on-site
- [ ] Validate the Plus checkout flow with a Stripe test card
- [ ] Validate the Pro checkout flow with a Stripe test card
- [ ] Confirm no Turnstile error 110200 is present
- [ ] Confirm redirect and success state are correct after payment
- [ ] Record any issues or blockers before approving production promotion

## Important notes

- Never use live production Stripe keys in the preview environment.
- Never use preview/test keys in production.
- Do not mix preview and production environment variables in the same project.
- Cloudflare Pages build logs are the source of truth for deployment status.

## Rollback guidance

If a deployment is bad:

1. Revert the offending commit or merge.
2. Push the revert to the relevant branch.
3. Cloudflare Pages will redeploy automatically.

For production, prefer a revert on main. For preview, revert on staging.

## Summary

- main branch = production deployment
- staging branch = preview deployment
- GitHub push triggers the deployment automatically in Cloudflare Pages
- build and payment verification must be completed before promoting to production

---

# Daily summary subsystem

The site stores every form submission in a Cloudflare D1 database and sends a daily summary email at 06:00 UTC with a CSV attachment.

## Components

| Component | File / location | Purpose |
|---|---|---|
| Form storage | `functions/api/_db.js` | Inserts submissions into D1 |
| Summary logic | `functions/api/_dailySummary.js` | Builds CSV/HTML, sends email via Resend |
| Pages admin endpoint | `functions/api/admin/daily-summary.js` | Protected HTTP trigger inside Pages |
| Cron Worker | `workers/daily-summary/` | Separate Cloudflare Worker with a cron trigger |
| Worker source | `workers/daily-summary/src/index.js` | `scheduled` + `fetch` handlers |
| Worker config | `workers/daily-summary/wrangler.toml` | D1 bindings, cron schedule, public vars |
| CI/CD | `.github/workflows/deploy-daily-summary.yml` | Deploys the Worker on pushes to `staging`/`main` |

## Why a separate Worker?

Cloudflare Pages Functions do **not** support cron triggers or `scheduled` handlers. The Worker shares the same D1 database as the Pages project and runs independently.

## Variables and secrets

### Public variables (in `wrangler.toml`)

| Variable | Location | Purpose |
|---|---|---|
| `RESEND_FROM_EMAIL` | `[env.production.vars]` / `[env.preview.vars]` | Sender address for all emails |
| `CONTACT_TO_EMAIL` | `[env.production.vars]` / `[env.preview.vars]` | Internal recipient for contact forms |
| `DAILY_SUMMARY_TO_EMAIL` | `[env.production.vars]` / `[env.preview.vars]` | Recipient of the daily CSV summary |

These are safe to keep in `wrangler.toml` because they are not secret.

### Secrets

Secrets are never committed. They are set via `wrangler secret put` or automatically by GitHub Actions.

| Secret | Where it is used | How to get / create it |
|---|---|---|
| `RESEND_API_KEY` | Worker + Pages Functions | [resend.com/api-keys](https://resend.com/api-keys) |
| `DAILY_SUMMARY_SECRET` | Pages admin endpoint + Worker `fetch` handler | Generate with `openssl rand -hex 32` |

### Cloudflare Pages secrets

Set these in **Cloudflare dashboard → Pages → datomer → Settings → Environment variables** for both **Production** and **Preview**:

- `RESEND_API_KEY`
- `DAILY_SUMMARY_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `TURNSTILE_SECRET_KEY`

### Cloudflare Worker secrets

The GitHub Actions workflow sets these automatically. If you prefer to set them manually:

```bash
cd workers/daily-summary

# Preview
npx wrangler secret put RESEND_API_KEY --env preview
npx wrangler secret put DAILY_SUMMARY_SECRET --env preview

# Production
npx wrangler secret put RESEND_API_KEY --env production
npx wrangler secret put DAILY_SUMMARY_SECRET --env production
```

## GitHub Actions secrets for the Worker

Create these in **GitHub → Settings → Secrets and variables → Actions → Repository secrets**:

| Secret | Purpose |
|---|---|
| `CLOUDFLARE_EMAIL` | Cloudflare account email |
| `CLOUDFLARE_API_KEY` | Cloudflare Global API Key |
| `PREVIEW_RESEND_API_KEY` | Resend key for the preview Worker |
| `PRODUCTION_RESEND_API_KEY` | Resend key for the production Worker |
| `PREVIEW_DAILY_SUMMARY_SECRET` | Manual-trigger password for the preview Worker |
| `PRODUCTION_DAILY_SUMMARY_SECRET` | Manual-trigger password for the production Worker |

### How to get the Cloudflare Global API Key

1. Go to [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens).
2. Scroll to **API Keys**.
3. Next to **Global API Key**, click **View** and complete the security challenge.
4. Copy the key and add it as `CLOUDFLARE_API_KEY` in GitHub.
5. Add the matching Cloudflare account email as `CLOUDFLARE_EMAIL`.

## Manual deployment

If GitHub Actions is not available:

```bash
cd workers/daily-summary

# Preview
npx wrangler secret put RESEND_API_KEY --env preview
npx wrangler secret put DAILY_SUMMARY_SECRET --env preview
npx wrangler deploy --env preview

# Production
npx wrangler secret put RESEND_API_KEY --env production
npx wrangler secret put DAILY_SUMMARY_SECRET --env production
npx wrangler deploy --env production
```

## How to trigger the daily summary manually

### Trigger the Worker directly

```bash
curl -H "Authorization: Bearer <PREVIEW_DAILY_SUMMARY_SECRET>" \
  https://datomer-daily-summary-preview.jay-tchinnaswamy.workers.dev/
```

For production:

```bash
curl -H "Authorization: Bearer <PRODUCTION_DAILY_SUMMARY_SECRET>" \
  https://datomer-daily-summary-production.jay-tchinnaswamy.workers.dev/
```

### Trigger via the Pages admin endpoint

First find the staging preview URL in **Cloudflare Pages → datomer → Deployments**. Then:

```bash
curl -L -H "Authorization: Bearer <DAILY_SUMMARY_SECRET>" \
  https://<preview-url>/api/admin/daily-summary
```

For production:

```bash
curl -L -H "Authorization: Bearer <DAILY_SUMMARY_SECRET>" \
  https://datomer.eu/api/admin/daily-summary
```

## Expected responses

A successful run returns JSON like:

```json
{"ok":true,"count":3,"emailResult":{"sent":true,"status":200,"body":"{\"id\":\"...\"}"}}
```

- `ok`: whether the run completed without errors
- `count`: number of submissions in the last 24 hours
- `emailResult.sent`: whether Resend accepted the email

If `count` is `0`, an email is still sent saying there were no submissions.

## How to check Cloudflare Workers logs

```bash
cd workers/daily-summary
npx wrangler tail --env preview
```

Then trigger the Worker with `curl`. Logs appear in the terminal.

## Testing the full daily summary flow

1. Open the staging site and submit a form.
2. Confirm the user receives a confirmation email.
3. Trigger the daily summary with `curl`.
4. Check `dailysummary@datomer.eu` for the summary email with CSV attachment.
5. Open the CSV and verify the submitted data is present.
6. Check that the D1 table is pruned to the last 30 days after a successful email.

## Daily summary edge cases handled

- Anchored 06:00 UTC window to avoid overlaps/gaps.
- Exclusive end range in the database query.
- CSV attachment capped at 9 MB to stay under Resend limits.
- Submissions are pruned only after the email succeeds.
- Failures are logged via `console.error`.

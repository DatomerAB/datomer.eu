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

Secret values:

- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- TURNSTILE_SECRET_KEY
- RESEND_API_KEY

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
- CONTACT_TO_EMAIL

Secret values:

- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- TURNSTILE_SECRET_KEY
- RESEND_API_KEY

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
- [ ] Push to the staging branch
- [ ] Check the Cloudflare build logs for success
- [ ] Open the preview URL and confirm the homepage loads
- [ ] Check navigation, pricing toggle, and CTA buttons
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

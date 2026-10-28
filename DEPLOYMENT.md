# Deployment guide

This project deploys through Cloudflare Pages using GitHub branches.

## Company and product domain split

Both custom domains use the existing Pages project and deployment:

- `datomer.eu` serves the new Datomer AB company experience.
- `par.datomer.eu` serves the existing Pär website.
- `www.datomer.eu` continues to redirect to the company domain.
- Pages preview hostnames default to the product experience and are marked
  `noindex`; use the documented local ports to review both experiences locally.

The user has connected `par.datomer.eu` to `datomer-eu.pages.dev`. Do not remove
either custom domain or change DNS as part of a frontend deployment.
No deployment is needed for local review. Do not push to `main` or `staging`
until the requested local review is complete: those branches deploy automatically.

### Route ownership

All existing Pär routes remain on the product domain, including `/about`,
`/contact`, `/privacy`, `/terms`, `/cookies`, `/models`, and `/payment-success`.
The company domain has its own homepage/About, contact, and shared legal routes.
The existing legal content is reused; review it for both sites before launch.

Old company-domain product routes (`/get-started`, `/blog`, `/press`, `/models`,
`/payment-success`, and `/beta`) redirect to the corresponding product destination,
preserving query parameters. Legacy homepage fragments (`#download`, `#product`,
`#features`, `#pricing`, and `#faq`) are handled in the browser because fragments
are not sent to the server. The company root itself is not redirected.
API requests, assets, and payment webhooks are not redirected.

Pages middleware supplies host-specific crawler metadata, robots directives, and
sitemaps. React manages metadata after startup and on navigation. Product software
structured data must not appear on the company site. Unknown/preview hosts are
not indexed as a second production site.

Release automation also targets the product domain: `update-beta-downloads.yml`
verifies the deployed catalog revision at `https://par.datomer.eu/`, and
`scripts/draft_changelog.py` generates download links to
`https://par.datomer.eu/#download`. Repository names, GitHub release/catalog URLs,
and the independent daily-summary Worker deployment are unchanged.

### Review and release checklist

1. Follow the local company/product preview instructions in [README.md](README.md).
   Review both languages at desktop and mobile widths, especially service wording,
   logo legibility, LinkedIn destinations, contact, product links, and beta notices.
2. Run `npm run lint`, `npm run test`, and `npm run build`.
3. Before any production deployment, obtain approval for the local preview.
   Then verify both host identities in a Cloudflare preview/runtime. A Vite
   preview alone does not run Pages Functions, crawler metadata, or server redirects.
4. Ensure Turnstile permits the company and product hostnames and that preview
   tests use preview credentials and the preview D1 binding.
5. Test real contact/download submissions in the configured preview, including
   company-versus-product confirmation branding. Use controlled addresses.
6. Test checkout with Stripe test settings, verifying success/cancel URLs and
   language/query preservation. Never use a real purchase to validate the preview.
7. Verify HTTPS, deep links, old product routes and fragments, both sitemaps,
   browser/server metadata, and the unchanged Windows/Linux download options.
8. Review existing Pär feature/pricing claims against the distributed build before
   broader wording changes. Mission/objectives are goals; development text is not
   a promise of availability or a delivery date.
9. After approval, coordinate separate linked changes in `DatomerAB/par-public`
   and, if needed, `DatomerAB/Par` so fallback/setup/release links point to
   `par.datomer.eu`. Keep the independent fallback site and upstream sync intact.
10. Retain the previous deployment for rollback without removing working database
    bindings. Publishing this split changes what `datomer.eu` displays immediately;
    do not promote before the product domain and redirects are verified.

## Website analytics and campaign reporting

### Daily website activity and campaign reporting

Both websites send consented first-party website events to their own `/api/event`
endpoint. React route changes generate pageviews; visibility and heartbeat events
are recorded separately and are not counted as page visits. Pages Functions attach
the actual request hostname/site to events and form submissions before storing them
in the shared D1 database. The daily-summary Worker reads that database, not website
pages. Its deployment workflow includes the shared email/report dependencies.

The email and CSV exports distinguish company, Pär, preview and unknown/legacy
records. The email groups results by site, page and campaign, showing sessions,
sessions started in the report window, page visits, accepted download requests,
stored enquiries and waitlist signups. This does not add LinkedIn waitlist
conversion tracking. Records without a hostname remain unknown; historical
campaigns cannot be reconstructed.

Use public campaign codes in `utm_source`, `utm_medium`, `utm_campaign`,
`utm_content` and `utm_term`, using only letters, digits, dots, underscores or
hyphens (maximum 100 characters per label). Never include personal data.
Campaign labels are saved in session storage only after analytics consent,
preserved through internal navigation and cleared on withdrawal/session reset.
A new tagged URL updates the session attribution for subsequent events/results;
untagged navigation retains it. No ad click IDs or complete query strings are
stored. Sessions are separate per browser tab and hostname and restart after
the existing 30-minute session lifetime. They are not unique people or first-ever
visitors, and counts across pages/campaigns must not be added as unique visitors.

The existing rolling 25-hour report window and 30-day retention remain unchanged.
Consecutive daily reports overlap by one hour; do not sum them as disjoint days.
Page visits require consent and working browser/Turnstile requests. Stored form
totals can include visitors without analytics consent; those results are
unattributed. This is website campaign attribution, not LinkedIn's attribution model.

#### Aggregate traffic, including requests without browser analytics

Cloudflare HTTP Traffic analytics is a separate operational view, not a second
browser tracker. In the Cloudflare dashboard select `datomer.eu`, open
**Analytics > HTTP Traffic**, and filter by hostname for `datomer.eu` and
`par.datomer.eu` where the account plan supports those filters. Review HTML/page
requests separately from assets, bots and threats. HTTP requests and Cloudflare's
visitor estimates are not equivalent to consented sessions or confirmed people.
Available filters, sampling, retention and API access depend on the Cloudflare plan.

Reference: [Cloudflare Zone Analytics](https://developers.cloudflare.com/analytics/account-and-zone-analytics/zone-analytics/).
Aggregate Cloudflare metrics are **not included in the daily email**. Adding them
requires confirming account/zone access, plan-supported GraphQL datasets and an
appropriately scoped analytics-read token stored as a Worker secret. Do not copy
private account credentials into source or treat missing API data as zero traffic.

### Insight Tag activation

The optional Insight Tag is restricted to `par.datomer.eu`. It is never enabled
on the company domain or Cloudflare preview hostnames. For local consent review,
development port `5174` is also allowed when a Partner ID is configured.
Do not use production advertising IDs for local testing.

No tag or tracking pixel loads until the visitor separately opts into LinkedIn
advertising measurement. Existing analytics consent does not grant marketing
consent. Analytics and LinkedIn have independent choices; the Cookies page
allows visitors to reopen settings. Revoking loaded LinkedIn tracking reloads
the page without the tag. Third-party cookies already set may require browser
removal; previously received data is not erased by withdrawing website consent.

To activate after local review:

1. Obtain the Partner ID from the correct LinkedIn Campaign Manager account.
2. Create one **event-specific** website conversion associated with that tag:
   **Beta download request**. Copy its conversion ID.
   Do not add URL rules that also count the same form action.
3. Configure these public, build-time Vite variables in Cloudflare Pages:
   - `VITE_LINKEDIN_PARTNER_ID`
   - `VITE_LINKEDIN_DOWNLOAD_CONVERSION_ID`
   Leave them unset to keep the integration inactive. IDs must be positive
   numeric strings. Changes require a fresh frontend build/deployment.
4. Review the English/Swedish consent and policy wording, LinkedIn terms,
   retention and international-transfer details with the privacy owner.
   Do not enable enhanced conversions, automatic form collection or additional
   LinkedIn tracking through Campaign Manager without a separate privacy review.
   Never place personal data in campaign URLs, query strings or page titles:
   LinkedIn receives page URLs and visitor/device information after opt-in.
5. Test using a controlled advertising/test setup: before consent and after
   rejection there must be no requests to LinkedIn; analytics-only acceptance
   must not enable LinkedIn. On explicit LinkedIn acceptance the script loads
   once. Check that the company site remains untracked by LinkedIn.
6. Submit the download form successfully and verify its conversion in the
   LinkedIn tools. Failed submissions, opening a form, and clicking its button
   without success must not count. Waitlist submissions must not send a LinkedIn
   conversion; the waitlist form remains available. Test withdrawal and reload as well.
7. Obtain deployment approval, publish, and confirm tag/conversion activity in
   Campaign Manager. Ad blockers, declined consent and LinkedIn attribution
   rules mean reported conversions will not equal all database submissions.

Conversions are sent only after successful API responses, with a conversion ID
and no form values. A download conversion means an accepted **download request**,
not proof that the file finished downloading or the Pär app was installed.
No activity from inside the Pär application is connected to this integration.

For the first campaign, link to `https://par.datomer.eu/#download` with non-personal
campaign parameters such as `utm_source=linkedin&utm_medium=paid_social&utm_campaign=par_beta`.
Associate only the beta download request conversion with the first campaign in
Campaign Manager. Waitlist conversion measurement is out of scope for this
campaign. Set an initial budget and audience before launching; compare cost per
download request before increasing spend.

## Branch to environment mapping

- main -> production
- staging -> preview / staging environment

This repo is configured so that:

- pushes to main trigger the production deployment
- pushes to staging trigger the preview/staging deployment

## Required deployment setup

Cloudflare Pages is configured to manage non-secret environment variables through Wrangler for this project. Secret values must be set in the Cloudflare Pages dashboard as encrypted secrets.

### D1 binding ownership

The Cloudflare Pages project is `datomer` (its default hostname is
`datomer-eu.pages.dev`). Pages Functions require the `DB` binding declared in
the root `wrangler.toml` for each environment:

| Environment | Database | Database ID |
| --- | --- | --- |
| production | datomer-submissions-production | 65c67ab8-ca9e-4777-9b38-97989c73a7f8 |
| preview | datomer-submissions-preview | 7a83e626-0984-47bb-9235-cd65c6806813 |

The daily-summary Worker declares its bindings separately in
`workers/daily-summary/wrangler.toml`. A Worker binding does not configure Pages.
Keep the IDs aligned for the same environment, never point preview at production,
and manage Pages bindings in Wrangler rather than duplicating them in the dashboard.
Both databases must contain the `submissions` and `events` tables from
`functions/api/_db/schema.sql` before deployment.

### Download incident: 2026-10-08

Commit `87a2d00` (PR #46, "Fix daily website activity collection") made waitlist
and download submissions await storage before acknowledging success. Its production
deployment `749426e9` completed at 16:44:34 UTC (18:44:34 CEST) on October 8.
The preceding deployment `b5460193` and both subsequent production and preview
configurations had no Pages D1 binding, verified through the Cloudflare API on
October 9. The new storage requirement therefore exposed the missing configuration:
the API returns HTTP 503 with "Could not record your submission. Please try again later."

The October 8 release update `98763fb` (PR #41) changed download references and
changelog content, not the submission backend. Its DMG URL returned HTTP 200 on
October 9. Runner workflow changes were not the source of the new storage gate.
Without a binding, the previous best-effort handler could acknowledge submissions
without storing them; the daily-summary Worker's own binding did not prevent that.

Preview verification on October 9 used `download-db-fix.datomer-eu.pages.dev`
(deployments `92afd5b3` and `c34460e0`). A real browser submission downloaded the
DMG and persisted a server-dated download row. The authenticated report returned
HTTP 200 with `ok: true`, one submission, and successful email acceptance; the
mailbox check confirmed the download, website-event section, and both CSVs.
The report event was a marked synthetic preview fixture, not a real visitor event.
The preview Pages `DAILY_SUMMARY_SECRET` was rotated with approval and stored in
macOS Keychain; production secrets and the Worker's independent secrets were unchanged.
The admin route also requires Cloudflare Access authentication; a bearer token
alone does not satisfy that protection.

### Download and activity verification

1. Run `npm run lint`, `npm run test`, `npm run build`, and the test suite in
  `workers/daily-summary`.
2. Deploy preview with preview build-time variables and verify the deployed `DB`
  UUID, not just the local configuration. Confirm Turnstile keys and hostname match.
3. Submit a download using a controlled address and a genuine Turnstile challenge.
  Confirm HTTP 200, a working DMG, and a `source = 'download'` row whose `created_at`
  is server time even when the client sends a stale timestamp.
4. Confirm a recent website event is stored in the preview database. Trigger the
  authenticated preview daily summary after the records were created and verify
  both submissions and events in the report and CSV attachments. Summary execution
  sends email and, after successful acceptance, prunes data older than 30 days.
  Preserve the existing 25-hour window and website-event reads.
5. Promote only after preview checks succeed; repeat binding, download, and report
  verification in production. Keep the prior deployment available for rollback,
  but ensure rollback does not remove the corrected binding.

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

Secret values:

- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- TURNSTILE_SECRET_KEY
- RESEND_API_KEY

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
  RESEND_FROM_EMAIL = "hello1@datomer.eu"
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

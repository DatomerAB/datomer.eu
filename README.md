# datomer.eu

Public website for **Pär by Datomer** — a subscription-based AI data product for privacy-first data ownership. Built with React, Vite, Cloudflare Pages, D1, and Resend.

Staging deployment refresh: 2026-08-27.

## Tech stack

- **Frontend**: React + Vite + Tailwind CSS
- **Hosting**: Cloudflare Pages
- **Backend**: Cloudflare Pages Functions
- **Database**: Cloudflare D1
- **Email**: Resend
- **Payments**: Stripe
- **Challenge**: Cloudflare Turnstile
- **Scheduled jobs**: Cloudflare Worker (`workers/daily-summary/`)

## Branches

| Branch | Environment |
|---|---|
| `main` | production |
| `staging` | preview / staging |

Pushes to either branch deploy automatically via GitHub Actions and Cloudflare Pages.

## Local development

```bash
npm install
npm run dev
```

Run the test suite:

```bash
npm test
```

Build for production:

```bash
npm run build
```

## Project structure

```
functions/api/          # Pages Function handlers (forms, checkout, email)
functions/api/admin/    # Protected admin endpoints
functions/api/_db/      # D1 schema and helpers
src/                    # React application
src/analytics/          # Consent-aware session and event tracking
workers/daily-summary/  # Separate Cloudflare Worker for daily summary cron
```

## Features

- Multi-language landing page (EN / SV / DE)
- Contact, waitlist, download, newsletter, and payment flows
- Form submissions stored in D1 with action, geo, and time-on-site context
- Branded, localized confirmation emails to users and internal notifications
- Privacy-first analytics: session ID, page path, and heartbeat only after consent
- **Daily summary email** at 06:00 UTC with a categorized CSV attachment of the previous 24 hours of submissions and events

## Daily summary

Every form submission is written to D1. A separate Worker runs daily and emails a categorized CSV summary to `dailysummary@datomer.eu`.

Trigger manually from the Worker:

```bash
curl -H "Authorization: Bearer <PREVIEW_DAILY_SUMMARY_SECRET>" \
  https://datomer-daily-summary-preview.jay-tchinnaswamy.workers.dev/
```

Trigger manually via Pages:

```bash
curl -L -H "Authorization: Bearer <DAILY_SUMMARY_SECRET>" \
  https://<preview-url>/api/admin/daily-summary
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for full setup, secrets, D1 migrations, and testing instructions.

## Environment and branding

Public `ENVIRONMENT` and `RESEND_FROM_NAME` variables ensure the site knows whether it is running in `preview` or `production`, and every email is sent as `Pär by Datomer <hello@datomer.eu>`.

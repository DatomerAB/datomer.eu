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

### Company and product previews

The same codebase serves two sites:

| Address | Experience |
| --- | --- |
| `https://datomer.eu` | Datomer AB company, services, purpose, and contact |
| `https://par.datomer.eu` | Existing Pär product site, downloads, setup, and updates |

Preview them side by side in separate terminals:

```bash
npm run dev:company
npm run dev:product
```

- Company: http://127.0.0.1:5173/
- Product: http://127.0.0.1:5174/
- Add `?lang=sv` to either address to preview Swedish.

The local ports select the site; internal language changes retain that identity.
Links between company and product stay local. `npm run dev` also uses the
company experience when Vite runs on its default port 5173.

For a production-bundle UI preview, run `npm run build`, then use
`npm run preview:company` (port 4173) and `npm run preview:product` (port 4174).
Keep the same hostname (`localhost` or `127.0.0.1`) for both when testing links.

Vite serves the frontend only: it does **not** run `/api/*` Pages Functions or
the production metadata/redirect middleware. Do not expect real form submissions
or checkout to work in these UI previews. They require a separate, properly
configured Cloudflare preview with test services and preview database bindings.
Errors are shown by the existing forms; no local success responses are fabricated.
Middleware behavior is covered by `functions/_middleware.test.js`.

The product's existing pages, feature copy, pricing behavior, download catalog,
and release history are retained. New product purpose/development text lives in
`src/content/productPurpose.js`; it does not certify existing feature claims or
promise unreleased functionality. Company copy lives in `src/content/company.js`.
German remains disabled.

See [DEPLOYMENT.md](DEPLOYMENT.md) for the domain split and pre-production checks.

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

## Model attribution

The `/models` page is kept in sync with the canonical model catalog in the private `Pär` repository (`config/routing.yaml`). When models change:

1. In the `Pär` repository, run `python scripts/sync_attribution.py --write` to regenerate `config/website_models.json`.
2. Copy `config/website_models.json` to this repository as `src/data/models.json`.
3. Add or update translations in `src/i18n/translations.js` if new model categories are introduced.
4. Commit and push to redeploy the site.

## Environment and branding

Public `ENVIRONMENT` and `RESEND_FROM_NAME` variables ensure the site knows whether it is running in `preview` or `production`, and every email is sent as `Pär by Datomer <hello@datomer.eu>`.

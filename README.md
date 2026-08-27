# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

Staging deployment refresh: 2026-08-24.

---

# datomer.eu

Public website for Datomer — a subscription-based AI data product. Built with React, Vite, Cloudflare Pages, D1, and Resend.

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
functions/api/        # Pages Function handlers (forms, checkout, email)
functions/api/admin/  # Protected admin endpoints
src/                  # React application
workers/daily-summary/  # Separate Cloudflare Worker for daily summary cron
```

## Features

- Multi-language landing page (EN / SV / DE)
- Contact, waitlist, download, newsletter, and payment flows
- Form submissions stored in D1
- Confirmation emails to users and internal notifications
- **Daily summary email** at 06:00 UTC with a CSV attachment of the previous 24 hours of submissions

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

See [DEPLOYMENT.md](DEPLOYMENT.md) for full setup, secrets, and testing instructions.

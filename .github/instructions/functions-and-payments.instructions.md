---
description: "Use when changing Cloudflare Pages Functions or the daily-summary Worker in datomer.eu: Stripe webhooks, checkout, Turnstile, email sending, the D1 database, and admin endpoints."
applyTo: ["functions/**", "workers/**", "src/payments/**"]
---

# Serverless functions and payments

Everything under `functions/` runs on Cloudflare Pages with access to secrets, the D1 database, and
the ability to send email and take payments. Treat it as production backend code, not site glue.

## Secrets and configuration

- Secrets come from the environment binding, never from source. No API keys, signing secrets, or
  database credentials in the repo — not even placeholder-looking ones.
- `workers/daily-summary/wrangler.toml` declares bindings; it must not contain secret values.
- Do not log request bodies, email addresses, or Stripe payloads.

## Stripe

- `functions/api/stripe-webhook.js` **must** verify the Stripe signature before acting on any event.
  An unverified webhook is an open endpoint that lets anyone fabricate payment events.
- Handle events idempotently. Stripe retries, and duplicate delivery is normal.
- `functions/api/checkout.js` and `src/payments/stripe.js` must never trust an amount, price, or
  currency sent from the browser. Derive them server-side.
- Never log full Stripe event payloads or customer identifiers.

## Abuse protection

- Public form endpoints (`functions/api/contact.js`, `event.js`) go through `_turnstile.js`
  verification. Adding a new public endpoint means adding the same check.
- `functions/api/admin/**` must require authentication. Confirm any new admin route is gated.

## Database and email

- `functions/api/_db.js` owns schema access; `functions/api/_db/schema.sql` is the source of truth.
  Change both together, and check whether existing rows need migrating.
- Use parameterised queries. Never interpolate user input into SQL.
- Email goes through `_email.js` / `_emailTemplates.js`. Keep templates free of user-supplied HTML.

## Tests

Functions have colocated `.test.js` files and there is no separate integration suite, so these tests
are the only safety net:

```bash
npm run test
npm run lint
```

The daily-summary Worker has its own suite:

```bash
cd workers/daily-summary && npm run test
```

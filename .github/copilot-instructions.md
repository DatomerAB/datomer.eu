# datomer.eu Copilot Instructions

datomer.eu is the marketing site and changelog for Pär. It is built with a static-site generator and deployed to Cloudflare Pages.

## Stack

- Static marketing site.
- Cloudflare Worker for daily-summary emails.
- `src/data/models.json` mirrors Pär model metadata.

## What Pär sends here

- `repository_dispatch` events on Pär release publish.
- `models.json` via `sync-public-content.yml`.
- Brand icons synced to `par-public`.

## Change discipline

- Do not hard-code Pär download URLs; read `https://raw.githubusercontent.com/DatomerAB/par-releases/main/latest.json` at runtime.
- Cache-bust `latest.json` fetches with release tag query params.
- Keep `src/data/models.json` in sync with Pär `config/website_models.json`.
- Keep `src/App.models.test.jsx` assertions in sync with `src/data/models.json`.
- Ensure changelog entries are business-readable.

## Validation

- Run site build and React tests.
- Verify `latest.json` fetch is cache-busted and handles fetch failures gracefully.
- Validate Cloudflare Worker code before deploy.

## Related repos

- `DatomerAB/Par` — canonical source for model catalog, release events, and changelog drafts.
- `DatomerAB/par-releases` — runtime source for `latest.json` and signed DMG URLs.
- `DatomerAB/par-public` — receives brand icons and synced content from here.

## When in doubt

Read this repo's `docs/copilot-memory/*.md` if available, or check `DatomerAB/Par/.github/workflows/publish-to-par-releases.yml` and `sync-public-content.yml` for the upstream contract.

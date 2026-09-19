# datomer.eu Copilot Instructions

Marketing site and changelog for Pär. React + Vite frontend, Cloudflare Pages Functions backend,
deployed to Cloudflare Pages on merge to `main`.

## Where the rules live

Detailed rules are in `.github/instructions/` and attach automatically to matching files. Open
`docs/copilot-memory/PAR_SYNC.md` only when a task needs the upstream contract.

| Scope | Instruction file |
|---|---|
| `functions/**`, `workers/**`, `src/payments/**` | `functions-and-payments.instructions.md` |
| `src/data/**`, `docs/NOTICE.md`, model assertions | `par-sync.instructions.md` |
| `src/**/*.jsx`, `*.js`, `*.css` | `frontend.instructions.md` |

## Non-negotiables

- Secrets come from environment bindings, never from source.
- Verify the Stripe signature before acting on a webhook event.
- Never trust a price or amount sent from the browser.
- Public form endpoints go through Turnstile; `functions/api/admin/**` requires auth.
- Never hand-edit `src/data/models.json` or `docs/NOTICE.md` — they are synced from Pär and will be
  overwritten.
- Never hard-code a Pär download URL. Read `latest.json` at runtime, cache-busted by release tag.

## Validation before declaring done

```bash
npm run lint
npm run test
npm run build
```

For the daily-summary Worker: `cd workers/daily-summary && npm run test`.

For the Python helpers in `scripts/`: `python -m pytest scripts/`.

## Related repos

- `DatomerAB/Par` — private. Source of truth for model catalog, release events, and changelog drafts.
- `DatomerAB/par-releases` — public mirror. Runtime source for `latest.json` and signed DMG URLs.
- `DatomerAB/par-public` — landing site. Receives brand icons synced from here.

A change spanning more than one repo means separate, linked PRs.

## When in doubt

Read the instruction file for the area you are changing, or `docs/copilot-memory/PAR_SYNC.md` for the
upstream contract. Do not guess at the sync direction — getting it backwards means your change is
silently reverted.

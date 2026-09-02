# Pär → datomer.eu Sync

## What we receive from Pär

- `config/website_models.json` → `src/data/models.json`
- `NOTICE.md` → `docs/NOTICE.md`
- Release events via `repository_dispatch` event `release-published`

## Workflows

- `draft-release-changelog.yml` — creates changelog PR from release dispatch.
- `check-par-sync.yml` — validates `src/data/models.json` matches Pär.
- Cloudflare Pages deploy on merge to `main`.

## Source of truth

- Models data: `DatomerAB/Par/config/website_models.json`
- NOTICE: `DatomerAB/Par/NOTICE.md`
- Release metadata: `DatomerAB/Par` release payload

## If you change this repo

- Do not edit `src/data/models.json` manually; it will be overwritten.
- Do not edit `docs/NOTICE.md` manually; it will be overwritten.
- If the changelog format changes, update `scripts/draft_changelog.py`.

## Change impact checklist

- [ ] If the models.json shape changes, update consumers in this repo first.
- [ ] If the release dispatch payload changes, update
      `draft-release-changelog.yml` and this file.
- [ ] If Pär changes `NOTICE.md` format, the `check-par-sync.yml` may fail.

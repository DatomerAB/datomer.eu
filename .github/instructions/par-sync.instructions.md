---
description: "Use when editing content, models data, or release information that datomer.eu receives from the Pär repo — models.json, NOTICE.md, download URLs, changelog entries."
applyTo: ["src/data/**", "src/content/**", "docs/NOTICE.md", "src/App.models.test.jsx"]
---

# Content synced from Pär

Some files here are generated upstream and overwritten by automation. Editing them by hand looks like
it works, then silently reverts on the next sync.

| File | Source of truth |
|---|---|
| `src/data/models.json` | `DatomerAB/Par` → `config/website_models.json` |
| `docs/NOTICE.md` | `DatomerAB/Par` → `NOTICE.md` |
| Release metadata | `DatomerAB/Par` release payload, via `repository_dispatch` |

To change model data or attribution, change it in Pär and let `sync-public-content.yml` propagate it.

## The assertion trap

`src/App.models.test.jsx` asserts against `src/data/models.json`. When a sync updates the data but not
the assertions, the test fails and **blocks release updates on this site**. If you touch either, check
the other.

`check-par-sync.yml` validates that the synced files still match Pär.

## Download URLs

- Never hard-code a DMG URL. Read
  `https://raw.githubusercontent.com/DatomerAB/par-releases/main/latest.json` at runtime.
- Cache-bust that fetch with the release tag (`?tag={{RELEASE_TAG}}`). The GitHub CDN will otherwise
  serve a stale URL after a release and the download button points at the previous build.
- Handle fetch failure gracefully — the site must still render if par-releases is unreachable.

## Changelog

`draft-release-changelog.yml` opens a changelog PR from a Pär release dispatch, rendered by
`scripts/draft_changelog.py` (which has tests in `scripts/test_draft_changelog.py`). Entries are
business-readable: what changed for a user, not commit subjects.

Full background: `docs/copilot-memory/PAR_SYNC.md`.

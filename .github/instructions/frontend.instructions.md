---
description: "Use when writing React components, pages, styles, or i18n content for the datomer.eu marketing site."
applyTo: ["src/**/*.jsx", "src/**/*.js", "src/**/*.css"]
---

# Frontend conventions

React + Vite, plain JSX (no TypeScript). Linting is `oxlint`, tests are `vitest`.

- Components live in `src/components/`, routed pages in `src/pages/`.
- Copy that users read belongs in `src/content/` or `src/i18n/`, not inline in components, so it stays
  translatable.
- `src/experiments/` holds A/B variants. Keep the default path working if an experiment is removed.
- Colocate tests as `*.test.jsx` next to the component.

## Analytics

`src/analytics/` exists for this marketing site. It is scoped to the public website only and must never
be wired to anything that receives data from the Pär application — the product is local-first and sends
no personal data off the device. Do not blur that boundary.

## Validation

```bash
npm run lint
npm run test
npm run build
```

`npm run build` matters: a broken build fails the Cloudflare Pages deploy on merge to `main`.

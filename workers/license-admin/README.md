# Datomer License Admin Worker

Dedicated Cloudflare Worker for the internal, cross-product licensing portal and API.

## Local development

```sh
cd workers/license-admin
npm install
npm test
npx wrangler d1 migrations apply datomer-license-registry-local-v2 --local
npm run dev -- --local
```

Wrangler simulates the local Access identity as `security-admin@datomer.eu`. Seed its role in the local D1 database to test catalog and license writes:

```sh
npx wrangler d1 execute datomer-license-registry-local-v2 --local --command "INSERT INTO admin_user_roles (email, role, assigned_by, assigned_at) VALUES ('security-admin@datomer.eu', 'security-admin', 'local-bootstrap', strftime('%Y-%m-%dT%H:%M:%fZ','now'));"
```

## Cloudflare preview and production setup

Do not run Wrangler commands from the repository root: that directory configures Cloudflare Pages. Run them from `workers/license-admin`.

1. Create separate databases and copy their returned IDs into the matching `LICENSE_DB` bindings in `wrangler.toml`:

   ```sh
   npx wrangler d1 create datomer-license-registry-preview
   npx wrangler d1 create datomer-license-registry-production
   ```

2. Apply the schema to each remote database:

   ```sh
   npx wrangler d1 migrations apply datomer-license-registry-preview --remote --env preview
   npx wrangler d1 migrations apply datomer-license-registry-production --remote --env production
   ```

3. Configure `ACCESS_TEAM_DOMAIN` and `ACCESS_POLICY_AUD` for each environment. Find the AUD in the Access application's **Additional settings**. The Worker verifies `Cf-Access-Jwt-Assertion` against Cloudflare's rotating signing keys when the Static Assets router does not pass `ctx.access` through to the Worker. Set `LICENSE_V2_SIGNING_KEY_PEM` and `LICENSE_V2_KEY_ID` as Worker secrets using `wrangler secret put`; never put key material in `wrangler.toml`, source, D1, or chat. Provision the matching license public key in each product verifier before issuing tokens.
4. Deploy the preview with `npm run deploy:preview`. Protect the Worker with Cloudflare Access for all traffic, allow only approved Datomer emails, enable OTP and independent MFA, and keep `workers.dev` and version preview URLs disabled.
5. Add a preview Custom Domain protected by the same Access policy, test issue/reissue/revoke there, then attach `admin.products.datomer.eu` to production and deploy with `npm run deploy:production` after approval.
6. Bootstrap the first `security-admin` through a reviewed D1 command containing the approved email. Later role changes use the security-admin API.
7. Migrate the Pages Stripe webhook's legacy license issuance to this registry/issuer before claiming that all Datomer products share a central source of truth.

A Custom Domain is reachable at Cloudflare's edge but Access denies unapproved users. If the requirement is no internet-routable hostname at all, Workers Custom Domains do not satisfy it.
Local Worker: `http://127.0.0.1:8787`. The local Access identity is simulated by Wrangler and is not production authentication.

## Current API surface

- `GET /api/me`: authenticated Access identity and assigned roles.
- `GET` and `POST /api/products`, `/api/tiers`, `/api/offers`: catalog read/create.
- `GET /api/licenses`, `POST /api/licenses`: license list/issue.
- `POST /api/licenses/{id}/reissue` and `/revoke`: license lifecycle.
- `GET` and `POST /api/admin/roles`: security-admin role management.

The D1 schema includes campaigns, but campaign API/UI operations are not implemented yet. Signed license tokens are returned to the caller but are not stored in D1. The Worker fails closed when Access identity or the `LICENSE_DB` binding is unavailable.

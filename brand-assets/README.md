# Site icons and email branding

## Approved artwork

- `datomer/icon.svg`: clean vector reconstruction of the red O and two white dots
  from the approved `public/datomer-logo.png`. Solid brand red `#e32743` is sampled
  from the wordmark; the full wordmark is unchanged.
- `datomer/favicon-{16,32,48,180,512}.png` and `favicon.ico`: small-site-icon exports.
  The 512px PNG is also published as `public/datomer-icon.png`.
- `par/logo.png`: byte-for-byte copy of the existing `public/par-logo.png`, not a redesign.
- `par/favicon-{16,32,48,180,512}.png` and `favicon.ico`: exports of the existing Pär mark.
- Each brand has a 512px `sender-avatar.png` on white for provider profile uploads.
  The Pär avatar centers the unchanged artwork with safe space for circular crops.
  These files are artwork, not proof that an inbox avatar is activated.

Regenerate with `python3 scripts/generate-site-icons.py` (Pillow required).
Validate with `python3 -m pytest scripts/`.

The SVG is self-contained and uses Tiny-PS attributes, but has not been certified
by a BIMI issuer. Pär's existing raster logo is preserved; a certificate issuer
will need an approved vector original for a BIMI submission. Do not embed a PNG
inside an SVG and describe it as a compliant BIMI vector.

## Website and email content

Company favicon and Apple touch links use `/datomer-icon.png?v=20261029`.
Pär retains `/par-logo.png`. Shared metadata supplies the same values to server
HTML and React, on all routes and in both languages.

Email headers and footer site links use each site's corresponding icon, with
absolute HTTPS URLs and fixed dimensions. The full Datomer wordmark remains in
the footer. Remote-image blocking by recipients can still hide these images.

## Inbox sender avatars: activation is separate

The visible From domain, authentication and recipient mail provider determine
inbox branding; the website URL or HTML logo cannot set the inbox avatar.
The approved addresses are `hello@datomer.eu` for company enquiries and
`Par@datomer.eu` for products, both for sending and receiving enquiries.
Both use the same domain: two local parts on the same domain do not reliably
provide different default BIMI logos. Separate profile avatars may be set where
the provider supports them, but distinct inbox logos cannot be promised with
this address arrangement. A separate verified From domain would be needed for
reliable separation through default domain-level BIMI; it is not being adopted.

On 2026-10-29, public DNS queries returned NXDOMAIN for `_dmarc.datomer.eu`,
`_dmarc.par.datomer.eu`, `default._bimi.datomer.eu` and
`default._bimi.par.datomer.eu`. MX records pointed to Zoho, while website email
is sent through Resend. These observations do not verify account access, DKIM
alignment or delivery. Recheck DNS before activation.

1. Inventory all legitimate senders (including Zoho and Resend). Verify
   `datomer.eu` in Resend and publish the exact SPF/DKIM records it provides.
   Do not replace existing SPF blindly or add multiple SPF records at one name.
2. Confirm `Par@datomer.eu` and `hello@datomer.eu` can receive mail in Zoho or
   forward to a monitored inbox. Sending-domain verification does not create mailboxes.
3. The Pages `wrangler.toml` prepares these settings in production and preview.
   Verify sending and receiving before deploying this configuration; do not
   duplicate these bindings in the dashboard:

   | Brand | From binding | Enquiry recipient binding | Address |
   | --- | --- | --- | --- |
   | Datomer | `RESEND_COMPANY_FROM_EMAIL` | `RESEND_COMPANY_TO_EMAIL` | `hello@datomer.eu` |
   | Pär | `RESEND_PRODUCT_FROM_EMAIL` | `RESEND_PRODUCT_TO_EMAIL` | `Par@datomer.eu` |

   Default names for site-specific addresses are `Datomer AB` and `Pär by Datomer`.
   Optional `RESEND_COMPANY_FROM_NAME` / `RESEND_PRODUCT_FROM_NAME` override them.
   Without a site-specific address, existing `RESEND_FROM_EMAIL` /
   `RESEND_FROM_NAME` behaviour is preserved. Company contact notifications and
   confirmations carry company context; product contact, download, waitlist,
   payment and existing daily-summary messages use product context.
   Explicit customer recipients and support Reply-To addresses are preserved.
   The independent daily-summary Worker retains its existing configuration;
   it needs its own bindings if its sender is changed.
4. Test delivery and inspect received SPF/DKIM/DMARC results using controlled
   inboxes. Start DMARC monitoring and resolve alignment problems for every
   legitimate sender before enforcing policy. Do not publish an untested reject
   policy: it can block legitimate mail.
5. For Gmail BIMI, obtain a VMC or CMC, prepare issuer-approved SVG artwork, host
   the certified files over HTTPS, and publish the issuer-provided BIMI TXT
   record for `datomer.eu`. This does not distinguish the two local-part addresses.
   Gmail requires DMARC enforcement
   (`p=quarantine` or `p=reject`, applying to 100% of mail). A PNG favicon alone
   is insufficient. VMC and CMC eligibility differ; check with the issuer.
6. Where a mail provider supports an account/profile logo, upload the matching
   `sender-avatar.png`. That profile setting is not a universal inbox-logo mechanism.
   Verify actual Gmail, Outlook and other target inboxes separately; display
   depends on recipient/provider policy, contacts, caching and authentication.

No DNS, provider accounts, certificates or live sender bindings are changed by
the repository update. There is no guarantee of universal avatar display.

Official Gmail requirements:
https://support.google.com/a/answer/10911320

# Human tester scenarios

This document is designed for a person who is testing the site without prior product knowledge. It covers the main user journeys, the key checks, and the expected outcomes.

## New feature: Daily summary subsystem

This section covers the automated daily summary introduced in August 2026. Test it separately from the main site flows.

### Goal

Ensure every form submission is stored, counted, and included in the daily CSV summary email sent to `dailysummary@datomer.eu`.

### Prerequisites

- Staging site is deployed.
- Daily-summary Worker is deployed to preview.
- `DAILY_SUMMARY_SECRET` is configured in Cloudflare Pages preview environment.
- `PREVIEW_DAILY_SUMMARY_SECRET` is configured in GitHub and on the Worker.
- Resend API key is configured for both Pages and Worker preview environments.

### Scenario D1: Submit a contact form

#### Steps
1. Open the staging preview URL.
2. Scroll to the contact section.
3. Fill in all required fields.
4. Complete the Turnstile challenge if shown.
5. Submit the form.

#### Expected outcome
- The user sees a success message.
- A confirmation email is sent to the user's address.
- The submission is stored in D1.

### Scenario D2: Submit the waitlist form

#### Steps
1. Open the staging preview URL.
2. Find the waitlist form.
3. Enter a valid email address.
4. Submit the form.

#### Expected outcome
- The user sees a success message.
- A confirmation email is sent to the user.
- The submission appears in D1 with source `waitlist`.

### Scenario D3: Submit the newsletter form

#### Steps
1. Open the staging preview URL.
2. Find the newsletter signup form.
3. Enter a valid email address.
4. Submit the form.

#### Expected outcome
- The user sees a success message.
- The submission appears in D1 with source `newsletter`.

### Scenario D4: Trigger the daily summary manually

#### Steps
1. Submit at least one form so data exists in D1.
2. Run the Worker trigger command:
   ```bash
   curl -H "Authorization: Bearer <PREVIEW_DAILY_SUMMARY_SECRET>" \
     https://datomer-daily-summary-preview.jay-tchinnaswamy.workers.dev/
   ```
3. Note the JSON response.

#### Expected outcome
- Response shows `ok: true`.
- `count` matches the number of submissions in the last 24 hours.
- `emailResult.sent` is `true`.

### Scenario D5: Verify the summary email

#### Steps
1. Open the inbox for `dailysummary@datomer.eu`.
2. Find the latest daily summary email.
3. Open the email and download the CSV attachment.
4. Open the CSV in a spreadsheet or text editor.

#### Expected outcome
- Email subject contains the date and "Daily summary".
- CSV includes all submitted forms from the last 24 hours.
- Each row has the correct category, time, email, name, and message.
- The email body shows a breakdown by category.

### Scenario D6: Verify the Pages admin endpoint

#### Steps
1. Find the staging preview URL in Cloudflare Pages.
2. Run:
   ```bash
   curl -L -H "Authorization: Bearer <DAILY_SUMMARY_SECRET>" \
     https://<preview-url>/api/admin/daily-summary
   ```

#### Expected outcome
- Response shows `ok: true`.
- The summary email is sent.

### Scenario D7: Empty day behavior

#### Steps
1. Ensure no new submissions exist in the last 24 hours.
2. Trigger the summary manually.

#### Expected outcome
- Response shows `ok: true` and `count: 0`.
- A summary email is still sent stating there were no submissions.

### Scenario D8: Unauthorized access

#### Steps
1. Trigger the Worker without a token:
   ```bash
   curl https://datomer-daily-summary-preview.jay-tchinnaswamy.workers.dev/
   ```
2. Trigger the Pages endpoint with a wrong token:
   ```bash
   curl -L -H "Authorization: Bearer wrong" \
     https://<preview-url>/api/admin/daily-summary
   ```

#### Expected outcome
- Worker returns `401 Unauthorized`.
- Pages endpoint returns `401 Unauthorized`.

### Daily summary test checklist

- [ ] Contact form submission stores in D1.
- [ ] Waitlist form submission stores in D1.
- [ ] Newsletter form submission stores in D1.
- [ ] User receives confirmation email after each form.
- [ ] Worker manual trigger returns `ok: true`.
- [ ] Summary email arrives at `dailysummary@datomer.eu`.
- [ ] CSV attachment contains correct data.
- [ ] Empty day still sends a "no submissions" email.
- [ ] Pages admin endpoint works with correct token.
- [ ] Both endpoints reject requests without valid tokens.

## Goal

The tester should be able to understand the product, navigate the website, evaluate the pricing, and complete the main CTA flows without needing technical or product context.

## Current live staging test status (2026-08-24)

This project was tested against the live preview deployment after the latest staging push.

### Verified working
- Homepage and public routes return successful responses.
- Navigation and page rendering are healthy.
- The pricing UI loads and the CTA buttons render correctly.

### Verified issue
- The live preview checkout flow is still blocked by Cloudflare Turnstile.
- Clicking Get Plus triggers repeated Cloudflare Turnstile error 110200 and the message “Security check failed. Please try again.”
- This is an environment/configuration issue, not a page rendering issue.

### Conclusion
- App code is healthy.
- Preview configuration must be corrected in Cloudflare before the checkout flow can be considered fully functional.

---

## Deployment configuration checklist for Turnstile and Stripe

Use this checklist whenever a payment or challenge flow is failing in preview or production.

### Cloudflare Pages environment checklist
- [ ] Confirm the target deployment is the correct project: preview/staging vs production.
- [ ] Verify the project is using the same hostname that the Turnstile widget was created for.
- [ ] Check that the public vars in Wrangler match the environment you expect to deploy.
- [ ] Check the Cloudflare Pages dashboard for the actual runtime values, not just the repo file.
- [ ] Verify that `VITE_TURNSTILE_SITE_KEY` matches the exact widget used by the site.
- [ ] Verify that `TURNSTILE_SECRET_KEY` matches that same widget secret.
- [ ] Verify `STRIPE_SECRET_KEY` is the correct Stripe secret for the active environment.
- [ ] Verify `VITE_STRIPE_PUBLISHABLE_KEY` matches the same Stripe account and environment.
- [ ] Verify `SITE_URL` is correct for the live host (`https://datomer.eu` for production, preview URL for staging).
- [ ] Confirm preview and production secrets are not mixed across projects.
- [ ] Confirm no old/expired widget pair is still being used after a Turnstile reset or widget recreation.

### Stripe and pricing checklist
- [ ] Confirm each plan has a valid `priceId` in the target environment.
- [ ] Verify the values for `VITE_STRIPE_PLUS_MONTHLY`, `VITE_STRIPE_PLUS_YEARLY`, `VITE_STRIPE_PRO_MONTHLY`, and `VITE_STRIPE_PRO_YEARLY` are not empty.
- [ ] Check whether the deployed environment is using test-mode or live-mode Stripe keys.
- [ ] Confirm the checkout button is not hitting the fallback path because the `priceId` is blank.
- [ ] Validate that the button text and the connected `priceId` belong to the same plan.

### Turnstile diagnosis checklist
- [ ] Open the page and inspect the browser console for Cloudflare Turnstile error codes.
- [ ] Confirm the error is not caused by a hidden or duplicate widget on the page.
- [ ] Verify the site key is the public key from the same widget in Cloudflare.
- [ ] Verify the secret is the private secret from the same widget in Cloudflare.
- [ ] Confirm the hostname used by the challenge matches the deployment domain.
- [ ] Confirm the deployment has been reloaded after updating Cloudflare secret values.
- [ ] If the widget was recreated, ensure the app was redeployed and the correct key is being loaded.

### Production validation checklist
- [ ] Open the production domain and confirm the UI loads.
- [ ] Click the pricing CTA and verify the challenge loads without error.
- [ ] Confirm the backend route `/api/checkout` receives the Turnstile token.
- [ ] Confirm the server verifies the token using the correct `TURNSTILE_SECRET_KEY`.
- [ ] Confirm Stripe checkout starts only after Turnstile passes.
- [ ] Complete a Stripe test checkout in preview before promoting to production.
- [ ] Repeat the same validation in production after deployment.

### Expected final state
- The frontend site key matches the Cloudflare widget.
- The backend secret matches the same widget.
- The Stripe price IDs are present and valid in the target environment.
- The payment flow reaches Stripe only after the Turnstile challenge succeeds.
- Preview and production are not using mixed key pairs.

---

## Scenario 0: Preview configuration sanity check

### Objective
Verify the deployment is using the correct staging preview configuration and that the environment is not mixed with production values.

### Steps
1. Open the Cloudflare Pages project for the staging/preview deployment.
2. Confirm the environment is the preview/staging project, not production.
3. Check that the public preview values are defined in Wrangler for the project.
4. Confirm the secret values exist in the Cloudflare dashboard as encrypted secrets.
5. Verify the Stripe keys are test-mode values.
6. Verify the Turnstile keys are the preview/staging site key and secret pair.

### Expected outcome
- Preview values are configured for the staging environment only.
- Secret values are present in Cloudflare and not committed to the repo.
- Test-mode Stripe and Turnstile keys are used for preview.

### What to look for
- No mixing of preview and production keys.
- No missing site key or secret pair.
- No payment flow blocked by a missing or mismatched challenge configuration.

---

## Scenario 1: First impression and basic navigation

### Objective
Check whether the landing page feels clear, professional, and easy to understand.

### Steps
1. Open the homepage.
2. Look at the top navigation and page headline.
3. Scroll through the page.
4. Click the main navigation links: Product, Features, Pricing, FAQ, Blog.

### Expected outcome
- The site should look polished and easy to understand.
- The headline should explain what the product is.
- The navigation should work without errors.
- Anchors should scroll to the correct sections.

### What to look for
- Content is readable and coherent.
- Buttons are obvious and visually consistent.
- No broken links or empty sections.

---

## Scenario 2: Download flow

### Objective
Check whether a user can discover the download CTA and start the download flow.

### Steps
1. On the homepage, click Download.
2. If a modal appears, review the fields.
3. Fill in the form with realistic values.
4. Complete the Turnstile challenge if present.
5. Submit the form.

### Expected outcome
- The form appears clearly and is easy to use.
- Required fields are obvious.
- The submit flow works without errors.
- The app gives a clear success or next step message.

### What to look for
- No confusing validation errors.
- The user knows what happens next.
- The flow is smooth and not blocked by unexpected steps.

---

## Scenario 3: Pricing page review

### Objective
Check whether the pricing section is understandable and credible.

### Steps
1. Go to the pricing section.
2. Switch between Monthly and Yearly billing.
3. Review the content of each plan.
4. Check which plan is highlighted and why.

### Expected outcome
- The toggle works correctly.
- Pricing displays the correct monthly or yearly values.
- Labels are understandable.
- The highlighted plan is visually obvious.

### What to look for
- No incorrect amount or period mismatch.
- No blank or broken values.
- The selected billing interval is clearly reflected in the view.

---

## Scenario 4: Purchase flow for Plus plan

### Objective
Test the checkout path for the Plus monthly or yearly plan.

### Steps
1. Click Get Plus.
2. Check whether the button is active and clickable.
3. Complete the Turnstile challenge if required.
4. Continue to Stripe checkout using a test card.
5. Complete the payment.
6. Check the redirect after checkout.

### Expected outcome
- The user is taken to Stripe checkout.
- The challenge does not fail unexpectedly.
- Payment can be completed with a test card.
- The page redirects to the success state.

### Test card to use
- Card number: 4242 4242 4242 4242
- Any future expiry date
- Any 3-digit CVC

### What to look for
- The plan is correctly identified.
- The redirect occurs after successful payment.
- There are no confusing error messages.

---

## Scenario 5: Purchase flow for Pro plan

### Objective
Test the Pro pricing path.

### Steps
1. Click Get Pro.
2. Check the button state and price selection.
3. Continue through the Stripe payment flow.
4. Complete the payment with a test card.
5. Confirm the redirect and success screen.

### Expected outcome
- The user can complete the purchase without technical issues.
- The correct plan is selected.
- The success state is clear and easy to understand.

### What to look for
- No mismatch between selected plan and checkout session.
- No dead end or confusing error.

---

## Scenario 6: Contact / sales flow

### Objective
Check whether a user can contact the company if they want a business or custom plan.

### Steps
1. Click Contact sales or navigate to the Contact page.
2. Review the contact form or email route.
3. Attempt to send a message.

### Expected outcome
- The action takes the user to a clear contact route or email flow.
- The message is easy to understand.
- The form or contact link works properly.

### What to look for
- Clear fields and labels.
- Easy completion without friction.
- No misleading or broken contact path.

---

## Scenario 7: Legal and trust pages

### Objective
Check whether the site provides trust and compliance information.

### Steps
1. Open the About page.
2. Open the Privacy page.
3. Open the Terms page.
4. Open the Cookies page.

### Expected outcome
- These pages load correctly.
- Company information is present and readable.
- The legal links are consistent and accurate.

### What to look for
- No missing content.
- No broken links.
- No inconsistent branding or copy.

---

## Scenario 8: Cookie consent behavior

### Objective
Validate the cookie banner and consent flow.

### Steps
1. Load the homepage.
2. Observe the cookie consent banner.
3. Click Accept.
4. Reload the page.
5. Click Decline.

### Expected outcome
- The banner appears and is understandable.
- Accept and Decline both work.
- The page remains usable after consent choice.

### What to look for
- Consent interaction is clear and not blocking.
- The banner does not repeatedly appear unnecessarily.

---

## Scenario 9: Mobile and small-screen usability

### Objective
Check whether the site is usable on a smaller screen.

### Steps
1. Open the page in a narrow browser width or mobile emulation.
2. Verify the navigation and buttons still look usable.
3. Scroll through the page.
4. Try a CTA button.

### Expected outcome
- Content remains readable.
- Buttons and links are still reachable.
- No text overlap or broken layout.

### What to look for
- Responsive behavior is acceptable.
- Important actions remain easy to hit.

---

## Scenario 10: Favicon and browser identity check

### Objective
Verify that the browser tab shows the correct branding.

### Steps
1. Open the homepage in a browser tab.
2. Check the favicon in the browser tab.
3. Check the browser tab title.

### Expected outcome
- The correct brand icon appears in the tab.
- The title is professional and consistent.

### What to look for
- The icon is clear and matches the brand.
- No broken or placeholder icon remains.

---

## Scenario 11: Error handling sanity check

### Objective
Check whether the site behaves sensibly when something goes wrong.

### Steps
1. Try a payment button with a forced error or blocked challenge.
2. Submit the form with empty required fields.
3. Check for validation feedback.

### Expected outcome
- Errors are understandable.
- The user is told what to do next.
- The site does not appear broken or blank.

### What to look for
- Clear messaging.
- No silent failure.
- No confusing technical text unless necessary.

---

## Pass criteria

The tester should be able to complete the following without confusion:

- understand the product from the homepage
- navigate the site
- review pricing and billing options
- trigger a purchase flow
- complete a test checkout with Stripe
- contact the company
- understand the legal/privacy information
- complete the main CTA without needing product background

## Notes for the tester

- Use realistic personal information when testing forms.
- Use the provided Stripe test card when testing checkout.
- Do not rely on product knowledge or internal team context.
- Record any confusion, dead ends, or broken steps.

---

## Suggested bug report format

When you find an issue, record:

- scenario number
- action taken
- expected result
- actual result
- browser/device used
- screenshot if possible
- rough severity (low / medium / high)

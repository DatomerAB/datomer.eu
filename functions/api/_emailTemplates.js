// Shared, branded email templates for all form handlers.
// Every public-facing email uses the same layout, tone, signature, and privacy-first messaging.

const BRAND = {
  company: 'Datomer',
  product: 'Pär',
  tagline: 'Your AI. On Your Device.',
  contactEmail: 'hello@datomer.eu',
  website: 'https://datomer.eu',
  // Aligns with the website design tokens
  bg: '#f7f6f4',
  surface: '#ffffff',
  text: '#252529',
  textSecondary: '#5c6068',
  textMuted: '#8c9099',
  accent: '#e06b6b',
  accentStrong: '#d15757',
  accentLight: '#f9eaea',
  border: 'rgba(37, 37, 41, 0.07)',
  radius: '16px',
  radiusSm: '12px',
  shadow: '0 4px 6px -1px rgba(15, 23, 42, 0.04), 0 2px 4px -2px rgba(15, 23, 42, 0.04)',
  fontStack: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
}

export function getFirstName(name) {
  if (!name) return 'there'
  const first = String(name).trim().split(/\s+/)[0]
  return first || 'there'
}

export function escapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function lineBreaksToHtml(text) {
  return escapeHtml(text).replace(/\n/g, '<br>')
}

function emailButton(href, label) {
  return `<a href="${href}" style="display: inline-block; padding: 12px 24px; background-color: ${BRAND.accent}; color: #ffffff; text-decoration: none; border-radius: 999px; font-weight: 600; font-size: 15px;">${escapeHtml(label)}</a>`
}

export function emailWrapper({ title, previewText, contentHtml, contentText, footerExtra = '' }) {
  const preview = previewText ? escapeHtml(previewText) : `${BRAND.product} by ${BRAND.company}`
  const footerHtml = footerExtra
    ? `<tr><td style="padding: 0 32px 16px; color: ${BRAND.textSecondary}; font-size: 14px; line-height: 1.5; text-align: center;">${footerExtra}</td></tr>`
    : ''
  const footerText = footerExtra ? `${footerExtra}\n\n` : ''

  const html = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${escapeHtml(title)}</title>
  <style type="text/css">
    /* Reset */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    /* Responsive */
    @media screen and (max-width: 600px) {
      .container { width: 100% !important; }
      .card { padding: 24px !important; }
      .hide-mobile { display: none !important; }
    }
  </style>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND.bg}; font-family: ${BRAND.fontStack}; color: ${BRAND.text}; -webkit-font-smoothing: antialiased;">
  <span style="display: none !important; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0;">${preview}</span>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${BRAND.bg};">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="container" style="width: 600px; max-width: 600px;">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom: 28px;">
              <a href="${BRAND.website}" style="text-decoration: none; display: inline-block;">
                <span style="font-size: 26px; font-weight: 800; letter-spacing: -0.04em; color: ${BRAND.text};">${BRAND.product}</span>
                <span style="display: block; font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: ${BRAND.textMuted}; margin-top: 2px;">by ${BRAND.company}</span>
              </a>
            </td>
          </tr>
          <!-- Card -->
          <tr>
            <td class="card" style="background-color: ${BRAND.surface}; border-radius: ${BRAND.radius}; box-shadow: ${BRAND.shadow}; padding: 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding-bottom: 24px;">
                    ${contentHtml}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          ${footerHtml}
          <tr>
            <td style="padding: 28px 32px 0; text-align: center; color: ${BRAND.textMuted}; font-size: 13px; line-height: 1.6;">
              <p style="margin: 0 0 8px;"><strong style="color: ${BRAND.text};">${BRAND.company} AB</strong></p>
              <p style="margin: 0 0 4px;">Email us at <a href="mailto:${BRAND.contactEmail}" style="color: ${BRAND.accent}; text-decoration: none;">${BRAND.contactEmail}</a></p>
              <p style="margin: 0 0 16px;"><a href="${BRAND.website}" style="color: ${BRAND.accent}; text-decoration: none;">${BRAND.website.replace(/^https:\/\//, '')}</a></p>
              <p style="margin: 0; font-size: 12px;">You received this because you interacted with ${BRAND.product}. Your data stays private — we never sell or share it.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  const text = `${title}\n${'='.repeat(title.length)}\n\n${contentText}\n\n${footerText}---\n${BRAND.product} by ${BRAND.company} AB\nEmail: ${BRAND.contactEmail}\nWebsite: ${BRAND.website}\n\nYou received this because you interacted with ${BRAND.product}. Your data stays private — we never sell or share it.`

  return { html, text }
}

export function formatInterests(interests) {
  if (!interests || typeof interests !== 'object') return []
  const labels = {
    productUpdates: 'Product updates',
    betaAccess: 'Early beta access',
    changelog: 'Changelog and release notes',
  }
  return Object.entries(interests)
    .filter(([, checked]) => checked)
    .map(([key]) => labels[key] || key)
}

function interestsSentence(interests) {
  const list = formatInterests(interests)
  if (list.length === 0) return ''
  if (list.length === 1) return list[0]
  if (list.length === 2) return `${list[0]} and ${list[1]}`
  return `${list.slice(0, -1).join(', ')}, and ${list[list.length - 1]}`
}

// --- Contact form ---

export function buildContactSupportEmail({ name, email, message }) {
  const firstName = getFirstName(name)
  const title = 'New contact enquiry'
  const subject = `New message from ${firstName} — ${BRAND.product}`

  const contentHtml = `
    <h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 700; color: ${BRAND.text}; line-height: 1.3;">New contact enquiry</h1>
    <p style="margin: 0 0 20px; color: ${BRAND.textSecondary}; font-size: 16px; line-height: 1.6;">${escapeHtml(name)} reached out through the ${BRAND.product} website.</p>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: ${BRAND.bg}; border-radius: ${BRAND.radiusSm}; margin: 0 0 16px;">
      <tr><td style="padding: 16px;"><div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: ${BRAND.textMuted}; margin-bottom: 4px;">Name</div><div style="font-size: 15px; color: ${BRAND.text};">${escapeHtml(name)}</div></td></tr>
    </table>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: ${BRAND.bg}; border-radius: ${BRAND.radiusSm}; margin: 0 0 16px;">
      <tr><td style="padding: 16px;"><div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: ${BRAND.textMuted}; margin-bottom: 4px;">Email</div><div style="font-size: 15px; color: ${BRAND.text};"><a href="mailto:${escapeHtml(email)}" style="color: ${BRAND.accent}; text-decoration: none;">${escapeHtml(email)}</a></div></td></tr>
    </table>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: ${BRAND.bg}; border-radius: ${BRAND.radiusSm}; margin: 0 0 16px;">
      <tr><td style="padding: 16px;"><div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: ${BRAND.textMuted}; margin-bottom: 4px;">Message</div><div style="font-size: 15px; color: ${BRAND.text}; line-height: 1.6;">${lineBreaksToHtml(message)}</div></td></tr>
    </table>
  `

  const contentText = `New contact enquiry\n\n${name} reached out through the ${BRAND.product} website.\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`

  const { html, text } = emailWrapper({ title, previewText: `New enquiry from ${firstName}`, contentHtml, contentText })
  return { subject, html, text, replyTo: email }
}

export function buildContactConfirmationEmail({ name, message }) {
  const firstName = getFirstName(name)
  const title = `Hi ${firstName}, we received your message`
  const subject = `We received your message — ${BRAND.product}`

  const contentHtml = `
    <h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 700; color: ${BRAND.text}; line-height: 1.3;">Hi ${escapeHtml(firstName)}, thank you for reaching out</h1>
    <p style="margin: 0 0 16px; color: ${BRAND.textSecondary}; font-size: 16px; line-height: 1.6;">We have received your message and will get back to you as soon as possible. Most enquiries are answered within one business day.</p>
    <p style="margin: 0 0 24px; color: ${BRAND.textSecondary}; font-size: 16px; line-height: 1.6;">If you need to add anything, just reply to this email or write to us at <a href="mailto:${BRAND.contactEmail}" style="color: ${BRAND.accent}; text-decoration: none;">${BRAND.contactEmail}</a>.</p>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: ${BRAND.bg}; border-radius: ${BRAND.radiusSm}; margin: 0 0 16px;">
      <tr><td style="padding: 16px;"><div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: ${BRAND.textMuted}; margin-bottom: 4px;">Your message</div><div style="font-size: 15px; color: ${BRAND.text}; line-height: 1.6;">${lineBreaksToHtml(message)}</div></td></tr>
    </table>
    <p style="margin: 24px 0 0; color: ${BRAND.textMuted}; font-size: 14px; line-height: 1.5;">We build ${BRAND.product} around privacy, transparency, and ownership. Your data stays under your control.</p>
  `

  const contentText = `Hi ${firstName}, thank you for reaching out\n\nWe have received your message and will get back to you as soon as possible. Most enquiries are answered within one business day.\n\nIf you need to add anything, just reply to this email or write to us at ${BRAND.contactEmail}.\n\nYour message:\n${message}\n\nWe build ${BRAND.product} around privacy, transparency, and ownership. Your data stays under your control.`

  const { html, text } = emailWrapper({ title, previewText: 'We received your message', contentHtml, contentText })
  return { subject, html, text }
}

// --- Waitlist / newsletter / download ---

function waitlistSupportSubject({ type, interests, name, email }) {
  const firstName = getFirstName(name)
  const list = formatInterests(interests)
  const wantsBeta = list.includes('Early beta access')
  const wantsUpdates = list.includes('Product updates')

  if (type === 'waitlist') {
    return wantsBeta
      ? `${firstName} joined the Pär beta waitlist`
      : `${firstName} joined the Pär waitlist`
  }
  if (type === 'newsletter') {
    if (wantsBeta && wantsUpdates) return `${firstName} wants Pär beta access and product updates`
    if (wantsBeta) return `${firstName} requested Pär beta access`
    if (wantsUpdates) return `${firstName} subscribed to Pär product updates`
    return `${firstName} subscribed to Pär updates`
  }
  if (type === 'download') {
    return `${firstName} downloaded the Pär beta`
  }
  return `New ${BRAND.product} signup from ${firstName || email}`
}

function waitlistConfirmationSubject({ type, interests }) {
  const list = formatInterests(interests)
  const wantsBeta = list.includes('Early beta access')
  const wantsUpdates = list.includes('Product updates')

  if (type === 'waitlist') {
    return wantsBeta ? 'You are on the Pär beta waitlist' : 'You are on the Pär waitlist'
  }
  if (type === 'newsletter') {
    if (wantsBeta && wantsUpdates) return 'Beta access + product updates confirmed'
    if (wantsBeta) return 'Beta access requested'
    if (wantsUpdates) return 'Product updates confirmed'
    return 'Welcome to Pär updates'
  }
  if (type === 'download') {
    return 'Your Pär beta download'
  }
  return 'Welcome — Pär'
}

function waitlistConfirmationBody({ type, interests, name }) {
  const firstName = getFirstName(name)
  const list = formatInterests(interests)
  const sentence = interestsSentence(interests)
  const wantsBeta = list.includes('Early beta access')
  const wantsUpdates = list.includes('Product updates')
  const wantsChangelog = list.includes('Changelog and release notes')

  if (type === 'download') {
    return {
      html: `<p style="margin: 0 0 16px; color: ${BRAND.textSecondary}; font-size: 16px; line-height: 1.6;">Hi ${escapeHtml(firstName)}, thank you for downloading the <strong style="color: ${BRAND.text};">${BRAND.product} beta</strong>.</p><p style="margin: 0 0 24px; color: ${BRAND.textSecondary}; font-size: 16px; line-height: 1.6;">Your download should start automatically. We will email you when updates, new features, and the public launch are ready.</p>`,
      text: `Hi ${firstName}, thank you for downloading the ${BRAND.product} beta. Your download should start automatically. We will email you when updates, new features, and the public launch are ready.`,
    }
  }

  let html = `<p style="margin: 0 0 16px; color: ${BRAND.textSecondary}; font-size: 16px; line-height: 1.6;">Hi ${escapeHtml(firstName)}, welcome to ${BRAND.product}.</p>`
  let text = `Hi ${firstName}, welcome to ${BRAND.product}.`

  if (sentence) {
    html += `<p style="margin: 0 0 16px; color: ${BRAND.textSecondary}; font-size: 16px; line-height: 1.6;">You selected: <strong style="color: ${BRAND.text};">${escapeHtml(sentence)}</strong>. We have noted your preferences and will only send you what you asked for.</p>`
    text += ` You selected: ${sentence}. We have noted your preferences and will only send you what you asked for.`
  }

  if (wantsBeta) {
    html += `<p style="margin: 0 0 16px; color: ${BRAND.textSecondary}; font-size: 16px; line-height: 1.6;">Beta access is limited and rolled out in batches. We will notify you as soon as a spot opens up for you.</p>`
    text += ` Beta access is limited and rolled out in batches. We will notify you as soon as a spot opens up for you.`
  }

  if (wantsUpdates || wantsChangelog) {
    html += `<p style="margin: 0 0 16px; color: ${BRAND.textSecondary}; font-size: 16px; line-height: 1.6;">Expect transparent, low-volume updates. No spam, no tracking pixels, no third-party data sharing.</p>`
    text += ` Expect transparent, low-volume updates. No spam, no tracking pixels, no third-party data sharing.`
  }

  html += `<p style="margin: 0; color: ${BRAND.textSecondary}; font-size: 16px; line-height: 1.6;">Questions? Reply to this email or contact us at <a href="mailto:${BRAND.contactEmail}" style="color: ${BRAND.accent}; text-decoration: none;">${BRAND.contactEmail}</a>.</p>`
  text += ` Questions? Reply to this email or contact us at ${BRAND.contactEmail}.`

  return { html, text }
}

export function buildWaitlistSupportEmail({ type, name, email, phone, country, interests, source }) {
  const firstName = getFirstName(name)
  const subject = waitlistSupportSubject({ type, interests, name, email })
  const title = 'New signup notification'
  const interestList = formatInterests(interests)

  const fields = [
    { label: 'Form', value: type },
    { label: 'Name', value: name || '-' },
    { label: 'Email', value: `<a href="mailto:${escapeHtml(email)}" style="color: ${BRAND.accent}; text-decoration: none;">${escapeHtml(email)}</a>` },
    { label: 'Phone', value: phone || '-' },
    { label: 'Country', value: country || '-' },
    { label: 'Source', value: source || 'website' },
    { label: 'Interests', value: interestList.length > 0 ? interestList.join(', ') : 'None selected' },
  ]

  const contentHtml = `
    <h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 700; color: ${BRAND.text}; line-height: 1.3;">New signup notification</h1>
    <p style="margin: 0 0 20px; color: ${BRAND.textSecondary}; font-size: 16px; line-height: 1.6;">${escapeHtml(firstName)} just signed up via the <strong style="color: ${BRAND.text};">${escapeHtml(type)}</strong> form on the ${BRAND.product} website.</p>
    ${fields.map((f) => `
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: ${BRAND.bg}; border-radius: ${BRAND.radiusSm}; margin: 0 0 12px;">
        <tr><td style="padding: 14px 16px;"><div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: ${BRAND.textMuted}; margin-bottom: 4px;">${escapeHtml(f.label)}</div><div style="font-size: 15px; color: ${BRAND.text}; line-height: 1.5;">${f.value}</div></td></tr>
      </table>
    `).join('')}
  `

  const text = `New signup notification\n\n${firstName} just signed up via the ${type} form on the ${BRAND.product} website.\n\n${fields.map((f) => `${f.label}: ${f.value.replace(/<[^>]+>/g, '')}`).join('\n')}`

  const { html, text: wrappedText } = emailWrapper({ title, previewText: `New ${type} signup`, contentHtml, contentText: text })
  return { subject, html, text: wrappedText, replyTo: email }
}

export function buildWaitlistConfirmationEmail({ type, name, email, interests }) {
  const firstName = getFirstName(name)
  const subject = `${waitlistConfirmationSubject({ type, interests })} — ${BRAND.product}`
  const title = subject
  const { html: bodyHtml, text: bodyText } = waitlistConfirmationBody({ type, interests, name })

  const contentHtml = `<h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 700; color: ${BRAND.text}; line-height: 1.3;">Hi ${escapeHtml(firstName)}</h1>${bodyHtml}`
  const contentText = `Hi ${firstName}\n\n${bodyText}`

  const { html, text } = emailWrapper({ title, previewText: 'Welcome to Pär', contentHtml, contentText })
  return { subject, html, text }
}

// --- Daily summary ---

export function buildDailySummaryEmail({ rows, dateLabel }) {
  const title = `Datomer daily summary — ${dateLabel}`
  const subject = `Datomer daily summary — ${rows.length} submission${rows.length === 1 ? '' : 's'} — ${dateLabel}`

  if (rows.length === 0) {
    const contentHtml = `<h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 700; color: ${BRAND.text}; line-height: 1.3;">No submissions in the last 24 hours</h1><p style="margin: 0; color: ${BRAND.textSecondary}; font-size: 16px; line-height: 1.6;">There were no new submissions between 06:00 UTC yesterday and 06:00 UTC today. The next summary will arrive tomorrow.</p>`
    const contentText = `No submissions in the last 24 hours\n\nThere were no new submissions between 06:00 UTC yesterday and 06:00 UTC today. The next summary will arrive tomorrow.`
    const { html, text } = emailWrapper({ title, previewText: 'No submissions today', contentHtml, contentText })
    return { subject, html, text }
  }

  const bySource = {}
  for (const row of rows) {
    bySource[row.source] = bySource[row.source] || []
    bySource[row.source].push(row)
  }

  let contentHtml = `<h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 700; color: ${BRAND.text}; line-height: 1.3;">Daily submission summary</h1><p style="margin: 0 0 24px; color: ${BRAND.textSecondary}; font-size: 16px; line-height: 1.6;">There were <strong style="color: ${BRAND.text};">${rows.length}</strong> submission${rows.length === 1 ? '' : 's'} in the last 24 hours. The full list is attached as a CSV file.</p>`
  let contentText = `Daily submission summary\n\nThere were ${rows.length} submission${rows.length === 1 ? '' : 's'} in the last 24 hours. The full list is attached as a CSV file.`

  for (const [source, items] of Object.entries(bySource)) {
    contentHtml += `<h2 style="margin: 28px 0 12px; font-size: 17px; font-weight: 700; color: ${BRAND.accent}; text-transform: capitalize;">${escapeHtml(source)} (${items.length})</h2><ul style="margin: 0; padding-left: 20px;">`
    contentText += `\n\n${source} (${items.length})\n${'='.repeat(`${source} (${items.length})`.length)}\n`
    for (const row of items) {
      const snippet = (row.message || row.body || '-').slice(0, 160).replace(/\n/g, ' ')
      contentHtml += `<li style="color: ${BRAND.textSecondary}; font-size: 15px; line-height: 1.6; margin-bottom: 10px;"><strong style="color: ${BRAND.text};">${escapeHtml(row.name || 'Anonymous')}</strong> (${escapeHtml(row.email || '-')}) — ${escapeHtml(snippet)}</li>`
      contentText += `- ${row.name || 'Anonymous'} (${row.email || '-'}) — ${snippet}\n`
    }
    contentHtml += '</ul>'
  }

  const { html, text } = emailWrapper({ title, previewText: `${rows.length} submissions today`, contentHtml, contentText })
  return { subject, html, text }
}

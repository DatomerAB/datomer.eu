// Shared, branded email templates for all form handlers.
// Every public-facing email uses the same layout, tone, signature, and privacy-first messaging.

const BRAND = {
  company: 'Datomer',
  product: 'Pär',
  tagline: 'Your AI. On Your Device.',
  contactEmail: 'hello@datomer.eu',
  website: 'https://datomer.eu',
  parLogoUrl: 'https://datomer.eu/par-logo-ember.png',
  datomerLogoUrl: 'https://datomer.eu/datomer-logo.png',
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

const EMAIL_I18N = {
  en: {
    salutation: (name) => `Hi ${name}`,
    contactSupportTitle: 'New contact enquiry',
    contactSupportPreview: (name) => `New enquiry from ${name}`,
    contactSupportBody: (name) => `${name} reached out through the Pär website.`,
    labelName: 'Name',
    labelEmail: 'Email',
    labelMessage: 'Message',
    labelForm: 'Form',
    labelPhone: 'Phone',
    labelCountry: 'Country',
    labelSource: 'Source',
    labelAction: 'Action',
    labelEnvironment: 'Environment',
    labelCity: 'City',
    contactConfirmationTitle: (name) => `Hi ${name}, we received your message`,
    contactConfirmationSubject: 'We received your message — Pär',
    contactConfirmationPreview: 'We received your message',
    contactConfirmationBody1: 'We have received your message and will get back to you as soon as possible. Most enquiries are answered within one business day.',
    contactConfirmationBody2: 'If you need to add anything, just reply to this email or write to us at',
    contactConfirmationPrivacy: 'We build Pär around privacy, transparency, and ownership. Your data stays under your control.',
    waitlistSupportTitle: 'New signup notification',
    waitlistSupportPreview: (type) => `New ${type} signup`,
    waitlistSupportBody: (name, type) => `${name} just signed up via the ${type} form on the Pär website.`,
    waitlistConfirmationPreview: 'Welcome to Pär',
    waitlistConfirmationSubjectSuffix: '— Pär',
    waitlistConfirmationTitle: (name) => `Hi ${name}`,
    waitlistConfirmationBody1: (name) => `Hi ${name}, welcome to Pär.`,
    waitlistConfirmationBody2: (interests) => `You selected: <strong style="color: ${BRAND.text};">${interests}</strong>. We have noted your preferences and will only send you what you asked for.`,
    waitlistConfirmationBeta: 'Beta access is limited and rolled out in batches. We will notify you as soon as a spot opens up for you.',
    waitlistConfirmationUpdates: 'Expect transparent, low-volume updates. No spam, no tracking pixels, no third-party data sharing.',
    waitlistConfirmationQuestions: 'Questions? Reply to this email or contact us at',
    downloadContext: (action) => {
      const map = {
        'download-topbar': 'the free version of Pär',
        'download-hero': 'Pär for Mac',
        'download-pricing-free': 'the Pär free tier',
        'download-cta-band': 'the Pär Mac beta',
      }
      return map[action] || 'the Pär beta'
    },
    downloadConfirmationBody: (name, action) => `Hi ${name}, thank you for downloading <strong style="color: ${BRAND.text};">${EMAIL_I18N.en.downloadContext(action)}</strong>.`,
    downloadConfirmationBody2: 'Your download should start automatically. We will email you when updates, new features, and the public launch are ready.',
    dailySummaryNoSubmissions: 'No submissions in the last 24 hours',
    dailySummaryNoSubmissionsBody: 'There were no new submissions between 06:00 UTC yesterday and 06:00 UTC today. The next summary will arrive tomorrow.',
    dailySummaryTitle: 'Daily submission summary',
    dailySummaryBody: (count) => `There were <strong style="color: ${BRAND.text};">${count}</strong> submission${count === 1 ? '' : 's'} in the last 24 hours. The full list is attached as a CSV file.`,
    paymentSupportTitle: 'New purchase',
    paymentSupportSubject: (plan, email) => `Purchase: Pär ${plan} — ${email}`,
    paymentSupportBody: (plan, email) => `A new Pär ${plan} subscription was purchased by ${email}.`,
    paymentConfirmationSubject: (plan) => `Your Pär ${plan} purchase confirmation`,
    paymentConfirmationTitle: (name) => `Thank you, ${name}`,
    paymentConfirmationBody1: (plan) => `Your Pär <strong style="color: ${BRAND.text};">${plan}</strong> subscription is now active.`,
    paymentConfirmationBody2: 'Your license key is below. Use it in the Pär app to activate your subscription.',
    paymentConfirmationLicenseLabel: 'License key',
    paymentConfirmationQuestions: 'Questions? Reply to this email or contact us at',
    footerCompany: `${BRAND.company} AB`,
    footerEmail: 'Email us at',
    footerPrivacy: `You received this because you interacted with ${BRAND.product}. Your data stays private — we never sell or share it.`,
  },
  sv: {
    salutation: (name) => `Hej ${name}`,
    contactSupportTitle: 'Nytt kontaktmeddelande',
    contactSupportPreview: (name) => `Ny förfrågan från ${name}`,
    contactSupportBody: (name) => `${name} kontaktade oss via Pärs webbplats.`,
    labelName: 'Namn',
    labelEmail: 'E-post',
    labelMessage: 'Meddelande',
    labelForm: 'Formulär',
    labelPhone: 'Telefon',
    labelCountry: 'Land',
    labelSource: 'Källa',
    labelAction: 'Åtgärd',
    labelEnvironment: 'Miljö',
    labelCity: 'Stad',
    contactConfirmationTitle: (name) => `Hej ${name}, vi har tagit emot ditt meddelande`,
    contactConfirmationSubject: 'Vi har tagit emot ditt meddelande — Pär',
    contactConfirmationPreview: 'Vi har tagit emot ditt meddelande',
    contactConfirmationBody1: 'Vi har tagit emot ditt meddelande och återkommer så snart som möjligt. De flesta frågor besvaras inom en arbetsdag.',
    contactConfirmationBody2: 'Om du vill lägga till något kan du svara på detta e-postmeddelande eller skriva till oss på',
    contactConfirmationPrivacy: 'Vi bygger Pär med integritet, transparens och ägande i fokus. Dina data förblir under din kontroll.',
    waitlistSupportTitle: 'Ny anmälan',
    waitlistSupportPreview: (type) => `Ny ${type}-anmälan`,
    waitlistSupportBody: (name, type) => `${name} anmälde sig via ${type}-formuläret på Pärs webbplats.`,
    waitlistConfirmationPreview: 'Välkommen till Pär',
    waitlistConfirmationSubjectSuffix: '— Pär',
    waitlistConfirmationTitle: (name) => `Hej ${name}`,
    waitlistConfirmationBody1: (name) => `Hej ${name}, välkommen till Pär.`,
    waitlistConfirmationBody2: (interests) => `Du valde: <strong style="color: ${BRAND.text};">${interests}</strong>. Vi har noterat dina preferenser och skickar bara det du bett om.`,
    waitlistConfirmationBeta: 'Betaåtkomst är begränsad och rullas ut i omgångar. Vi meddelar dig så snart en plats öppnas för dig.',
    waitlistConfirmationUpdates: 'Räkna med transparenta, fåtaliga uppdateringar. Ingen skräppost, inga spårningspixlar, ingen delning med tredje part.',
    waitlistConfirmationQuestions: 'Frågor? Svara på detta e-postmeddelande eller kontakta oss på',
    downloadContext: (action) => {
      const map = {
        'download-topbar': 'den kostnadsfria versionen av Pär',
        'download-hero': 'Pär för Mac',
        'download-pricing-free': 'Pär gratisnivå',
        'download-cta-band': 'Pär Mac-beta',
      }
      return map[action] || 'Pär-beta'
    },
    downloadConfirmationBody: (name, action) => `Hej ${name}, tack för att du laddar ned <strong style="color: ${BRAND.text};">${EMAIL_I18N.sv.downloadContext(action)}</strong>.`,
    downloadConfirmationBody2: 'Din nedladdning bör starta automatiskt. Vi mejlar dig när uppdateringar, nya funktioner och den offentliga lanseringen är redo.',
    dailySummaryNoSubmissions: 'Inga inskick det senaste dygnet',
    dailySummaryNoSubmissionsBody: 'Det kom inga nya inskick mellan 06:00 UTC igår och 06:00 UTC idag. Nästa sammanfattning kommer i morgon.',
    dailySummaryTitle: 'Daglig sammanfattning av inskick',
    dailySummaryBody: (count) => `Det fanns <strong style="color: ${BRAND.text};">${count}</strong> inskick det senaste dygnet. Den fullständiga listan finns bifogad som CSV.`,
    paymentSupportTitle: 'Nytt köp',
    paymentSupportSubject: (plan, email) => `Köp: Pär ${plan} — ${email}`,
    paymentSupportBody: (plan, email) => `En ny Pär ${plan}-prenumeration köptes av ${email}.`,
    paymentConfirmationSubject: (plan) => `Bekräftelse av ditt Pär ${plan}-köp`,
    paymentConfirmationTitle: (name) => `Tack, ${name}`,
    paymentConfirmationBody1: (plan) => `Din Pär <strong style="color: ${BRAND.text};">${plan}</strong>-prenumeration är nu aktiv.`,
    paymentConfirmationBody2: 'Din licensnyckel finns nedan. Använd den i Pär-appen för att aktivera din prenumeration.',
    paymentConfirmationLicenseLabel: 'Licensnyckel',
    paymentConfirmationQuestions: 'Frågor? Svara på detta e-postmeddelande eller kontakta oss på',
    footerCompany: `${BRAND.company} AB`,
    footerEmail: 'Mejla oss på',
    footerPrivacy: `Du fick detta e-postmeddelande eftersom du interagerade med ${BRAND.product}. Dina data förblir privata — vi säljer eller delar dem aldrig.`,
  },
  de: {
    salutation: (name) => `Hallo ${name}`,
    contactSupportTitle: 'Neue Kontaktanfrage',
    contactSupportPreview: (name) => `Neue Anfrage von ${name}`,
    contactSupportBody: (name) => `${name} hat uns über die Pär-Website kontaktiert.`,
    labelName: 'Name',
    labelEmail: 'E-Mail',
    labelMessage: 'Nachricht',
    labelForm: 'Formular',
    labelPhone: 'Telefon',
    labelCountry: 'Land',
    labelSource: 'Quelle',
    labelAction: 'Aktion',
    labelEnvironment: 'Umgebung',
    labelCity: 'Stadt',
    contactConfirmationTitle: (name) => `Hallo ${name}, wir haben Ihre Nachricht erhalten`,
    contactConfirmationSubject: 'Wir haben Ihre Nachricht erhalten — Pär',
    contactConfirmationPreview: 'Wir haben Ihre Nachricht erhalten',
    contactConfirmationBody1: 'Wir haben Ihre Nachricht erhalten und melden uns so schnell wie möglich bei Ihnen. Die meisten Anfragen werden innerhalb eines Werktags beantwortet.',
    contactConfirmationBody2: 'Wenn Sie noch etwas ergänzen möchten, antworten Sie einfach auf diese E-Mail oder schreiben Sie uns an',
    contactConfirmationPrivacy: 'Wir entwickeln Pär mit Fokus auf Datenschutz, Transparenz und Eigentum. Ihre Daten bleiben unter Ihrer Kontrolle.',
    waitlistSupportTitle: 'Neue Anmeldung',
    waitlistSupportPreview: (type) => `Neue ${type}-Anmeldung`,
    waitlistSupportBody: (name, type) => `${name} hat sich über das ${type}-Formular auf der Pär-Website angemeldet.`,
    waitlistConfirmationPreview: 'Willkommen bei Pär',
    waitlistConfirmationSubjectSuffix: '— Pär',
    waitlistConfirmationTitle: (name) => `Hallo ${name}`,
    waitlistConfirmationBody1: (name) => `Hallo ${name}, willkommen bei Pär.`,
    waitlistConfirmationBody2: (interests) => `Sie haben gewählt: <strong style="color: ${BRAND.text};">${interests}</strong>. Wir haben Ihre Präferenzen notiert und senden Ihnen nur das, worum Sie gebeten haben.`,
    waitlistConfirmationBeta: 'Der Beta-Zugang ist begrenzt und wird schrittweise freigegeben. Wir benachrichtigen Sie, sobald ein Platz für Sie frei ist.',
    waitlistConfirmationUpdates: 'Erwarten Sie transparente, seltene Updates. Kein Spam, keine Tracking-Pixel, keine Weitergabe an Dritte.',
    waitlistConfirmationQuestions: 'Fragen? Antworten Sie auf diese E-Mail oder kontaktieren Sie uns unter',
    downloadContext: (action) => {
      const map = {
        'download-topbar': 'die kostenlose Version von Pär',
        'download-hero': 'Pär für Mac',
        'download-pricing-free': 'die Pär Free-Tier',
        'download-cta-band': 'die Pär Mac-Beta',
      }
      return map[action] || 'die Pär-Beta'
    },
    downloadConfirmationBody: (name, action) => `Hallo ${name}, vielen Dank, dass Sie <strong style="color: ${BRAND.text};">${EMAIL_I18N.de.downloadContext(action)}</strong> herunterladen.`,
    downloadConfirmationBody2: 'Ihr Download sollte automatisch starten. Wir schreiben Ihnen, wenn Updates, neue Funktionen und der öffentliche Start bereit sind.',
    dailySummaryNoSubmissions: 'Keine Einsendungen in den letzten 24 Stunden',
    dailySummaryNoSubmissionsBody: 'Es gab keine neuen Einsendungen zwischen 06:00 UTC gestern und 06:00 UTC heute. Die nächste Zusammenfassung kommt morgen.',
    dailySummaryTitle: 'Tägliche Zusammenfassung der Einsendungen',
    dailySummaryBody: (count) => `Es gab <strong style="color: ${BRAND.text};">${count}</strong> Einsendungen in den letzten 24 Stunden. Die vollständige Liste ist als CSV angehängt.`,
    paymentSupportTitle: 'Neuer Kauf',
    paymentSupportSubject: (plan, email) => `Kauf: Pär ${plan} — ${email}`,
    paymentSupportBody: (plan, email) => `Ein neues Pär ${plan}-Abonnement wurde von ${email} gekauft.`,
    paymentConfirmationSubject: (plan) => `Bestätigung deines Pär ${plan}-Kaufs`,
    paymentConfirmationTitle: (name) => `Danke, ${name}`,
    paymentConfirmationBody1: (plan) => `Dein Pär <strong style="color: ${BRAND.text};">${plan}</strong>-Abonnement ist jetzt aktiv.`,
    paymentConfirmationBody2: 'Dein Lizenzschlüssel steht unten. Verwende ihn in der Pär-App, um dein Abonnement zu aktivieren.',
    paymentConfirmationLicenseLabel: 'Lizenzschlüssel',
    paymentConfirmationQuestions: 'Fragen? Antworte auf diese E-Mail oder kontaktiere uns unter',
    footerCompany: `${BRAND.company} AB`,
    footerEmail: 'Schreiben Sie uns an',
    footerPrivacy: `Sie haben diese E-Mail erhalten, weil Sie mit ${BRAND.product} interagiert haben. Ihre Daten bleiben privat — wir verkaufen oder teilen sie nie.`,
  },
}

function i18n(locale) {
  return EMAIL_I18N[locale] || EMAIL_I18N.en
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

export function emailWrapper({ title, previewText, contentHtml, contentText, footerExtra = '', locale = 'en' }) {
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
                <img
                  src="${BRAND.parLogoUrl}"
                  alt="Pär by Datomer"
                  width="180"
                  style="display: block; border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; max-width: 180px; height: auto; font-family: ${BRAND.fontStack}; font-size: 26px; font-weight: 800; color: ${BRAND.text};"
                />
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
              <p style="margin: 0 0 12px;">
                <img
                  src="${BRAND.datomerLogoUrl}"
                  alt="Datomer"
                  width="120"
                  style="display: inline-block; border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; max-width: 120px; height: auto; font-family: ${BRAND.fontStack}; font-size: 14px; font-weight: 700; color: ${BRAND.text};"
                />
              </p>
              <p style="margin: 0 0 8px;"><strong style="color: ${BRAND.text};">${BRAND.company} AB</strong></p>
              <p style="margin: 0 0 4px;">${i18n(locale).footerEmail} <a href="mailto:${BRAND.contactEmail}" style="color: ${BRAND.accent}; text-decoration: none;">${BRAND.contactEmail}</a></p>
              <p style="margin: 0 0 16px;"><a href="${BRAND.website}" style="color: ${BRAND.accent}; text-decoration: none;">${BRAND.website.replace(/^https:\/\//, '')}</a></p>
              <p style="margin: 0; font-size: 12px;">${i18n(locale).footerPrivacy}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  const text = `${title}\n${'='.repeat(title.length)}\n\n${contentText}\n\n${footerText}---\n${BRAND.product} by ${BRAND.company} AB\n${i18n(locale).footerEmail}: ${BRAND.contactEmail}\nWebsite: ${BRAND.website}\n\n${i18n(locale).footerPrivacy}`

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

export function buildContactSupportEmail({ name, email, message, locale = 'en', action, environment, country, city }) {
  const firstName = getFirstName(name)
  const strings = i18n(locale)
  const title = strings.contactSupportTitle
  const subject = `New message from ${firstName} — ${BRAND.product}`

  const fields = [
    { label: strings.labelName, value: escapeHtml(name) },
    { label: strings.labelEmail, value: `<a href="mailto:${escapeHtml(email)}" style="color: ${BRAND.accent}; text-decoration: none;">${escapeHtml(email)}</a>` },
    { label: strings.labelEnvironment, value: escapeHtml(environment || 'unknown') },
    { label: strings.labelAction, value: escapeHtml(action || 'unspecified') },
    { label: strings.labelCountry, value: escapeHtml(country || '-') },
    { label: strings.labelCity, value: escapeHtml(city || '-') },
    { label: strings.labelMessage, value: lineBreaksToHtml(message) },
  ]

  const contentHtml = `
    <h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 700; color: ${BRAND.text}; line-height: 1.3;">${escapeHtml(title)}</h1>
    <p style="margin: 0 0 20px; color: ${BRAND.textSecondary}; font-size: 16px; line-height: 1.6;">${strings.contactSupportBody(escapeHtml(name))}</p>
    ${fields.map((f) => `
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: ${BRAND.bg}; border-radius: ${BRAND.radiusSm}; margin: 0 0 12px;">
        <tr><td style="padding: 14px 16px;"><div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: ${BRAND.textMuted}; margin-bottom: 4px;">${escapeHtml(f.label)}</div><div style="font-size: 15px; color: ${BRAND.text}; line-height: 1.5;">${f.value}</div></td></tr>
      </table>
    `).join('')}
  `

  const contentText = `${title}\n\n${strings.contactSupportBody(name)}\n\n${fields.map((f) => `${f.label}: ${f.value.replace(/<[^>]+>/g, '')}`).join('\n')}`

  const { html, text } = emailWrapper({ title, locale, previewText: strings.contactSupportPreview(firstName), contentHtml, contentText })
  return { subject, html, text, replyTo: email }
}

export function buildContactConfirmationEmail({ name, message, locale = 'en' }) {
  const firstName = getFirstName(name)
  const strings = i18n(locale)
  const title = strings.contactConfirmationTitle(firstName)
  const subject = strings.contactConfirmationSubject

  const contentHtml = `
    <h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 700; color: ${BRAND.text}; line-height: 1.3;">${escapeHtml(title)}</h1>
    <p style="margin: 0 0 16px; color: ${BRAND.textSecondary}; font-size: 16px; line-height: 1.6;">${strings.contactConfirmationBody1}</p>
    <p style="margin: 0 0 24px; color: ${BRAND.textSecondary}; font-size: 16px; line-height: 1.6;">${strings.contactConfirmationBody2} <a href="mailto:${BRAND.contactEmail}" style="color: ${BRAND.accent}; text-decoration: none;">${BRAND.contactEmail}</a>.</p>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: ${BRAND.bg}; border-radius: ${BRAND.radiusSm}; margin: 0 0 16px;">
      <tr><td style="padding: 16px;"><div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: ${BRAND.textMuted}; margin-bottom: 4px;">${strings.labelMessage}</div><div style="font-size: 15px; color: ${BRAND.text}; line-height: 1.6;">${lineBreaksToHtml(message)}</div></td></tr>
    </table>
    <p style="margin: 24px 0 0; color: ${BRAND.textMuted}; font-size: 14px; line-height: 1.5;">${strings.contactConfirmationPrivacy}</p>
  `

  const contentText = `${title}\n\n${strings.contactConfirmationBody1}\n\n${strings.contactConfirmationBody2} ${BRAND.contactEmail}.\n\n${strings.labelMessage}:\n${message}\n\n${strings.contactConfirmationPrivacy}`

  const { html, text } = emailWrapper({ title, locale, previewText: strings.contactConfirmationPreview, contentHtml, contentText })
  return { subject, html, text }
}

// --- Waitlist / newsletter / download ---

function downloadSupportSubject({ action, firstName }) {
  if (action === 'download-topbar') return `${firstName} downloaded the free version of Pär`
  if (action === 'download-hero') return `${firstName} downloaded Pär for Mac`
  if (action === 'download-pricing-free') return `${firstName} downloaded the Pär free tier`
  if (action === 'download-cta-band') return `${firstName} downloaded the Pär Mac beta`
  return `${firstName} downloaded the Pär beta`
}

function downloadConfirmationSubject({ action }) {
  if (action === 'download-topbar') return 'Your Pär free version download'
  if (action === 'download-hero') return 'Your Pär for Mac download'
  if (action === 'download-pricing-free') return 'Your Pär free tier download'
  if (action === 'download-cta-band') return 'Your Pär Mac beta download'
  return 'Your Pär beta download'
}

function waitlistSupportSubject({ type, interests, name, email, action }) {
  const firstName = getFirstName(name)
  const list = formatInterests(interests)
  const wantsBeta = list.includes('Early beta access')
  const wantsUpdates = list.includes('Product updates')

  if (type === 'download') {
    return downloadSupportSubject({ action, firstName })
  }
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
  return `New ${BRAND.product} signup from ${firstName || email}`
}

function waitlistConfirmationSubject({ type, interests, action }) {
  const list = formatInterests(interests)
  const wantsBeta = list.includes('Early beta access')
  const wantsUpdates = list.includes('Product updates')

  if (type === 'download') {
    return downloadConfirmationSubject({ action })
  }
  if (type === 'waitlist') {
    return wantsBeta ? 'You are on the Pär beta waitlist' : 'You are on the Pär waitlist'
  }
  if (type === 'newsletter') {
    if (wantsBeta && wantsUpdates) return 'Beta access + product updates confirmed'
    if (wantsBeta) return 'Beta access requested'
    if (wantsUpdates) return 'Product updates confirmed'
    return 'Welcome to Pär updates'
  }
  return 'Welcome — Pär'
}

function waitlistConfirmationBody({ type, interests, name, locale = 'en', action }) {
  const firstName = getFirstName(name)
  const strings = i18n(locale)
  const list = formatInterests(interests)
  const sentence = interestsSentence(interests)
  const wantsBeta = list.includes('Early beta access')
  const wantsUpdates = list.includes('Product updates')
  const wantsChangelog = list.includes('Changelog and release notes')

  if (type === 'download') {
    return {
      html: `<p style="margin: 0 0 16px; color: ${BRAND.textSecondary}; font-size: 16px; line-height: 1.6;">${strings.downloadConfirmationBody(escapeHtml(firstName), action)}</p><p style="margin: 0 0 24px; color: ${BRAND.textSecondary}; font-size: 16px; line-height: 1.6;">${strings.downloadConfirmationBody2}</p>`,
      text: `${strings.salutation(firstName)}, ${strings.downloadConfirmationBody(firstName, action).replace(/<[^>]+>/g, '')} ${strings.downloadConfirmationBody2}`,
    }
  }

  let html = `<p style="margin: 0 0 16px; color: ${BRAND.textSecondary}; font-size: 16px; line-height: 1.6;">${strings.waitlistConfirmationBody1(escapeHtml(firstName))}</p>`
  let text = strings.waitlistConfirmationBody1(firstName)

  if (sentence) {
    html += `<p style="margin: 0 0 16px; color: ${BRAND.textSecondary}; font-size: 16px; line-height: 1.6;">${strings.waitlistConfirmationBody2(escapeHtml(sentence))}</p>`
    text += ` ${strings.waitlistConfirmationBody2(sentence).replace(/<[^>]+>/g, '')}`
  }

  if (wantsBeta) {
    html += `<p style="margin: 0 0 16px; color: ${BRAND.textSecondary}; font-size: 16px; line-height: 1.6;">${strings.waitlistConfirmationBeta}</p>`
    text += ` ${strings.waitlistConfirmationBeta}`
  }

  if (wantsUpdates || wantsChangelog) {
    html += `<p style="margin: 0 0 16px; color: ${BRAND.textSecondary}; font-size: 16px; line-height: 1.6;">${strings.waitlistConfirmationUpdates}</p>`
    text += ` ${strings.waitlistConfirmationUpdates}`
  }

  html += `<p style="margin: 0; color: ${BRAND.textSecondary}; font-size: 16px; line-height: 1.6;">${strings.waitlistConfirmationQuestions} <a href="mailto:${BRAND.contactEmail}" style="color: ${BRAND.accent}; text-decoration: none;">${BRAND.contactEmail}</a>.</p>`
  text += ` ${strings.waitlistConfirmationQuestions} ${BRAND.contactEmail}.`

  return { html, text }
}

export function buildWaitlistSupportEmail({ type, name, email, phone, country, interests, source, locale = 'en', action, environment, city }) {
  const firstName = getFirstName(name)
  const subject = waitlistSupportSubject({ type, interests, name, email, action })
  const strings = i18n(locale)
  const title = type === 'download' ? strings.downloadSupportTitle || strings.waitlistSupportTitle : strings.waitlistSupportTitle
  const interestList = formatInterests(interests)

  const fields = [
    { label: strings.labelForm, value: type },
    { label: strings.labelName, value: name || '-' },
    { label: strings.labelEmail, value: `<a href="mailto:${escapeHtml(email)}" style="color: ${BRAND.accent}; text-decoration: none;">${escapeHtml(email)}</a>` },
    { label: strings.labelPhone, value: phone || '-' },
    { label: strings.labelCountry, value: country || '-' },
    { label: strings.labelSource, value: source || 'website' },
    { label: strings.labelAction, value: action || 'unspecified' },
    { label: strings.labelEnvironment, value: environment || 'unknown' },
    { label: strings.labelCity, value: city || '-' },
    { label: strings.labelName === 'Namn' ? 'Intressen' : 'Interests', value: interestList.length > 0 ? interestList.join(', ') : 'None selected' },
  ]

  const contentHtml = `
    <h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 700; color: ${BRAND.text}; line-height: 1.3;">${escapeHtml(title)}</h1>
    <p style="margin: 0 0 20px; color: ${BRAND.textSecondary}; font-size: 16px; line-height: 1.6;">${strings.waitlistSupportBody(escapeHtml(firstName), escapeHtml(type))}</p>
    ${fields.map((f) => `
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: ${BRAND.bg}; border-radius: ${BRAND.radiusSm}; margin: 0 0 12px;">
        <tr><td style="padding: 14px 16px;"><div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: ${BRAND.textMuted}; margin-bottom: 4px;">${escapeHtml(f.label)}</div><div style="font-size: 15px; color: ${BRAND.text}; line-height: 1.5;">${f.value}</div></td></tr>
      </table>
    `).join('')}
  `

  const text = `${title}\n\n${strings.waitlistSupportBody(firstName, type)}\n\n${fields.map((f) => `${f.label}: ${f.value.replace(/<[^>]+>/g, '')}`).join('\n')}`

  const { html, text: wrappedText } = emailWrapper({ title, locale, previewText: strings.waitlistSupportPreview(type), contentHtml, contentText: text })
  return { subject, html, text: wrappedText, replyTo: email }
}

export function buildWaitlistConfirmationEmail({ type, name, email, interests, locale = 'en', action }) {
  const firstName = getFirstName(name)
  const strings = i18n(locale)
  const subject = `${waitlistConfirmationSubject({ type, interests, action })} ${strings.waitlistConfirmationSubjectSuffix}`
  const title = `${strings.salutation(firstName)}`
  const { html: bodyHtml, text: bodyText } = waitlistConfirmationBody({ type, interests, name, locale, action })

  const contentHtml = `<h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 700; color: ${BRAND.text}; line-height: 1.3;">${escapeHtml(title)}</h1>${bodyHtml}`
  const contentText = `${title}\n\n${bodyText}`

  const { html, text } = emailWrapper({ title, locale, previewText: strings.waitlistConfirmationPreview, contentHtml, contentText })
  return { subject, html, text }
}

// --- Daily summary ---

function parseMetadata(row) {
  try {
    return row.metadata ? JSON.parse(row.metadata) : {}
  } catch {
    return {}
  }
}

function seconds(ms) {
  if (ms == null || Number.isNaN(ms)) return 0
  return Math.round(Number(ms) / 1000)
}

export function buildPaymentSupportEmail({ plan, email, licenseKey, stripeSessionId, locale = 'en' }) {
  const strings = i18n(locale)
  const title = strings.paymentSupportTitle
  const subject = strings.paymentSupportSubject(plan, email)

  const fields = [
    { label: strings.labelForm, value: 'stripe-purchase' },
    { label: 'Plan', value: escapeHtml(plan) },
    { label: strings.labelEmail, value: `<a href="mailto:${escapeHtml(email)}" style="color: ${BRAND.accent}; text-decoration: none;">${escapeHtml(email)}</a>` },
    { label: strings.paymentConfirmationLicenseLabel, value: escapeHtml(licenseKey) },
    { label: 'Session', value: escapeHtml(stripeSessionId) },
  ]

  const contentHtml = `
    <h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 700; color: ${BRAND.text}; line-height: 1.3;">${escapeHtml(title)}</h1>
    <p style="margin: 0 0 20px; color: ${BRAND.textSecondary}; font-size: 16px; line-height: 1.6;">${strings.paymentSupportBody(escapeHtml(plan), escapeHtml(email))}</p>
    ${fields.map((f) => `
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: ${BRAND.bg}; border-radius: ${BRAND.radiusSm}; margin: 0 0 12px;">
        <tr><td style="padding: 14px 16px;"><div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: ${BRAND.textMuted}; margin-bottom: 4px;">${escapeHtml(f.label)}</div><div style="font-size: 15px; color: ${BRAND.text}; line-height: 1.5;">${f.value}</div></td></tr>
      </table>
    `).join('')}
  `

  const text = `${title}\n\n${strings.paymentSupportBody(plan, email)}\n\n${fields.map((f) => `${f.label}: ${f.value.replace(/<[^>]+>/g, '')}`).join('\n')}`

  const { html, text: wrappedText } = emailWrapper({ title, locale, previewText: subject, contentHtml, contentText: text })
  return { subject, html, text: wrappedText, replyTo: email }
}

export function buildPaymentConfirmationEmail({ plan, email, licenseKey, locale = 'en' }) {
  const strings = i18n(locale)
  const firstName = getFirstName(email.split('@')[0])
  const subject = strings.paymentConfirmationSubject(plan)
  const title = strings.paymentConfirmationTitle(firstName)

  const contentHtml = `
    <h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 700; color: ${BRAND.text}; line-height: 1.3;">${escapeHtml(title)}</h1>
    <p style="margin: 0 0 16px; color: ${BRAND.textSecondary}; font-size: 16px; line-height: 1.6;">${strings.paymentConfirmationBody1(escapeHtml(plan))}</p>
    <p style="margin: 0 0 24px; color: ${BRAND.textSecondary}; font-size: 16px; line-height: 1.6;">${strings.paymentConfirmationBody2}</p>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: ${BRAND.bg}; border-radius: ${BRAND.radiusSm}; margin: 0 0 16px;">
      <tr><td style="padding: 16px;"><div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: ${BRAND.textMuted}; margin-bottom: 4px;">${strings.paymentConfirmationLicenseLabel}</div><div style="font-size: 18px; font-weight: 700; color: ${BRAND.text}; line-height: 1.6; font-family: monospace;">${escapeHtml(licenseKey)}</div></td></tr>
    </table>
    <p style="margin: 0; color: ${BRAND.textSecondary}; font-size: 16px; line-height: 1.6;">${strings.paymentConfirmationQuestions} <a href="mailto:${BRAND.contactEmail}" style="color: ${BRAND.accent}; text-decoration: none;">${BRAND.contactEmail}</a>.</p>
  `

  const contentText = `${title}\n\n${strings.paymentConfirmationBody1(plan).replace(/<[^>]+>/g, '')}\n\n${strings.paymentConfirmationBody2}\n\n${strings.paymentConfirmationLicenseLabel}: ${licenseKey}\n\n${strings.paymentConfirmationQuestions} ${BRAND.contactEmail}.`

  const { html, text } = emailWrapper({ title, locale, previewText: subject, contentHtml, contentText })
  return { subject, html, text }
}

export function buildDailySummaryEmail({ rows, events = [], dateLabel }) {
  const title = `Datomer daily summary — ${dateLabel}`
  const subject = `Datomer daily summary — ${rows.length} submission${rows.length === 1 ? '' : 's'}, ${events.length} event${events.length === 1 ? '' : 's'} — ${dateLabel}`
  const strings = EMAIL_I18N.en

  if (rows.length === 0 && events.length === 0) {
    const contentHtml = `<h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 700; color: ${BRAND.text}; line-height: 1.3;">${strings.dailySummaryNoSubmissions}</h1><p style="margin: 0; color: ${BRAND.textSecondary}; font-size: 16px; line-height: 1.6;">${strings.dailySummaryNoSubmissionsBody}</p>`
    const contentText = `${strings.dailySummaryNoSubmissions}\n\n${strings.dailySummaryNoSubmissionsBody}`
    const { html, text } = emailWrapper({ title, locale: 'en', previewText: strings.dailySummaryNoSubmissions, contentHtml, contentText })
    return { subject, html, text }
  }

  const byKey = {}
  const countryCounts = {}
  let totalTimeSeconds = 0
  let timeCount = 0

  for (const row of rows) {
    const meta = parseMetadata(row)
    const key = `${meta.environment || 'unknown'}::${row.source}::${meta.action || 'unspecified'}`
    byKey[key] = byKey[key] || []
    byKey[key].push(row)

    const country = row.country || meta.country || 'unknown'
    countryCounts[country] = (countryCounts[country] || 0) + 1

    const timeSec = seconds(meta.timeOnSiteMs)
    if (timeSec > 0) {
      totalTimeSeconds += timeSec
      timeCount += 1
    }
  }

  // Event analytics
  const sessionIds = new Set()
  const typeCounts = {}
  const pageCounts = {}
  for (const event of events) {
    if (event.session_id) sessionIds.add(event.session_id)
    typeCounts[event.type] = (typeCounts[event.type] || 0) + 1
    const page = event.page_path || 'unknown'
    pageCounts[page] = (pageCounts[page] || 0) + 1
  }
  const uniqueSessions = sessionIds.size
  const topPages = Object.entries(pageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const avgTime = timeCount > 0 ? Math.round(totalTimeSeconds / timeCount) : 0
  const topCountries = Object.entries(countryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  let contentHtml = `<h1 style="margin: 0 0 16px; font-size: 22px; font-weight: 700; color: ${BRAND.text}; line-height: 1.3;">${strings.dailySummaryTitle}</h1><p style="margin: 0 0 24px; color: ${BRAND.textSecondary}; font-size: 16px; line-height: 1.6;">${strings.dailySummaryBody(rows.length)}</p>`
  let contentText = `${strings.dailySummaryTitle}\n\n${strings.dailySummaryBody(rows.length).replace(/<[^>]+>/g, '')}`

  contentHtml += `<p style="margin: 0 0 24px; color: ${BRAND.textSecondary}; font-size: 15px; line-height: 1.6;">Average time on site: <strong style="color: ${BRAND.text};">${avgTime}s</strong><br>Top countries: ${topCountries.map(([c, n]) => `${escapeHtml(c)} (${n})`).join(', ') || '—'}</p>`
  contentText += `\n\nAverage time on site: ${avgTime}s\nTop countries: ${topCountries.map(([c, n]) => `${c} (${n})`).join(', ') || '—'}`

  if (events.length > 0) {
    contentHtml += `<h2 style="margin: 28px 0 12px; font-size: 17px; font-weight: 700; color: ${BRAND.accent};">Website events (${events.length})</h2><p style="margin: 0 0 16px; color: ${BRAND.textSecondary}; font-size: 15px; line-height: 1.6;">Unique sessions: <strong style="color: ${BRAND.text};">${uniqueSessions}</strong><br>By type: ${Object.entries(typeCounts).map(([t, n]) => `${escapeHtml(t)} (${n})`).join(', ')}<br>Top pages: ${topPages.map(([p, n]) => `${escapeHtml(p)} (${n})`).join(', ') || '—'}</p>`
    contentText += `\n\nWebsite events (${events.length})\nUnique sessions: ${uniqueSessions}\nBy type: ${Object.entries(typeCounts).map(([t, n]) => `${t} (${n})`).join(', ')}\nTop pages: ${topPages.map(([p, n]) => `${p} (${n})`).join(', ') || '—'}`
  }

  for (const [key, items] of Object.entries(byKey).sort()) {
    const [environment, source, action] = key.split('::')
    contentHtml += `<h2 style="margin: 28px 0 12px; font-size: 17px; font-weight: 700; color: ${BRAND.accent};">${escapeHtml(environment)} · ${escapeHtml(source)} · ${escapeHtml(action)} (${items.length})</h2><ul style="margin: 0; padding-left: 20px;">`
    contentText += `\n\n${environment} · ${source} · ${action} (${items.length})\n${'='.repeat(`${environment} · ${source} · ${action} (${items.length})`.length)}\n`
    for (const row of items) {
      const snippet = (row.message || row.body || '-').slice(0, 160).replace(/\n/g, ' ')
      contentHtml += `<li style="color: ${BRAND.textSecondary}; font-size: 15px; line-height: 1.6; margin-bottom: 10px;"><strong style="color: ${BRAND.text};">${escapeHtml(row.name || 'Anonymous')}</strong> (${escapeHtml(row.email || '-')}) — ${escapeHtml(snippet)}</li>`
      contentText += `- ${row.name || 'Anonymous'} (${row.email || '-'}) — ${snippet}\n`
    }
    contentHtml += '</ul>'
  }

  const previewText = rows.length > 0 ? `${rows.length} submissions today` : `${events.length} events today`
  const { html, text } = emailWrapper({ title, locale: 'en', previewText, contentHtml, contentText })
  return { subject, html, text }
}

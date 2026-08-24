export function generateLicenseKey(plan = 'plus') {
  const normalizedPlan = String(plan).trim().toUpperCase().replace(/[^A-Z0-9]+/g, '-')
  const randomSegment = Math.random().toString(36).slice(2, 10).toUpperCase()
  return `PÄR-${normalizedPlan || 'PLUS'}-${randomSegment}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

export function buildLicenseRecord({ email, plan, stripeSessionId, locale = 'en' }) {
  const record = {
    email: String(email || '').trim().toLowerCase(),
    plan: String(plan || 'plus').toLowerCase(),
    stripeSessionId: String(stripeSessionId || '').trim(),
    locale: String(locale || 'en').toLowerCase(),
    status: 'active',
    issuedAt: new Date().toISOString(),
    licenseKey: generateLicenseKey(plan),
  }

  return record
}

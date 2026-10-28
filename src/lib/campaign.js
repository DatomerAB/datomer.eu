export const CAMPAIGN_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']

// Campaign labels are public codes, never email addresses or free-form text.
export function sanitizeCampaign(input) {
  const campaign = {}
  for (const key of CAMPAIGN_KEYS) {
    const value = input?.[key]
    if (typeof value === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,99}$/.test(value)) {
      campaign[key] = value
    }
  }
  return campaign
}

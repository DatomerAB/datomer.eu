import { sanitizeCampaign } from '../../src/lib/campaign.js'

export function readWebsiteMetadata(row) {
  try {
    const value = JSON.parse(row.metadata || '{}')
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  } catch {
    return {}
  }
}

export function websiteLabel(meta) {
  if (meta.hostname === 'par.datomer.eu') return 'Pär — par.datomer.eu'
  if (['datomer.eu', 'www.datomer.eu'].includes(meta.hostname)) return 'Company — datomer.eu'
  return meta.hostname ? 'Preview / other host' : 'Unknown / legacy'
}

export function campaignLabel(meta) {
  const campaign = sanitizeCampaign(meta.campaign)
  return Object.keys(campaign).length
    ? Object.entries(campaign).map(([key, value]) => `${key}=${value}`).join(' · ')
    : meta.sessionStartedAt ? 'Direct / untagged' : 'Unattributed / legacy'
}

export function buildWebsiteSummary(rows, events, start, end) {
  const sites = new Map()
  const pages = new Map()
  const campaigns = new Map()
  const metric = (map, key) => {
    if (!map.has(key)) map.set(key, { label: key, sessions: new Set(), newSessions: new Set(), pageviews: 0, downloads: 0, enquiries: 0, waitlist: 0 })
    return map.get(key)
  }
  const add = (row, isEvent) => {
    const meta = readWebsiteMetadata(row)
    const site = websiteLabel(meta)
    const page = (isEvent ? row.page_path : meta.pagePath) || '(unknown page)'
    const groups = [
      metric(sites, site),
      metric(pages, `${site} · ${page}`),
      metric(campaigns, `${site} · ${campaignLabel(meta)}`),
    ]
    for (const group of groups) {
      const session = isEvent ? row.session_id : meta.sessionId
      if (session) {
        group.sessions.add(session)
        if (meta.sessionStartedAt >= start && meta.sessionStartedAt < end) group.newSessions.add(session)
      }
      if (isEvent) {
        if (row.type === 'pageview') group.pageviews += 1
      } else {
        if (row.source === 'download') group.downloads += 1
        if (row.source === 'contact') group.enquiries += 1
        if (row.source === 'waitlist') group.waitlist += 1
      }
    }
  }
  events.forEach(row => add(row, true))
  rows.forEach(row => add(row, false))
  const values = map => [...map.values()].map(item => ({
    ...item, sessions: item.sessions.size, newSessions: item.newSessions.size,
  })).sort((a, b) => b.pageviews - a.pageviews || b.downloads - a.downloads || a.label.localeCompare(b.label))
  return { sites: values(sites), pages: values(pages), campaigns: values(campaigns) }
}

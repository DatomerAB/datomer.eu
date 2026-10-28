const CONSENT_KEY = 'par-linkedin-consent-v1'
const SCRIPT_ID = 'linkedin-insight-tag'

function validId(value) {
  return typeof value === 'string' && /^[1-9]\d*$/.test(value)
}

export function isLinkedInEnabled() {
  if (typeof window === 'undefined') return false
  const { hostname, port } = window.location
  const productHost = hostname === 'par.datomer.eu'
  const localProduct = import.meta.env.DEV
    && ['localhost', '127.0.0.1'].includes(hostname) && port === '5174'
  return (productHost || localProduct) && validId(import.meta.env.VITE_LINKEDIN_PARTNER_ID)
}

export function hasLinkedInConsent() {
  try {
    return localStorage.getItem(CONSENT_KEY) === 'accepted'
  } catch (error) {
    console.warn('Could not read LinkedIn consent.', error)
    return false
  }
}

export function hasLinkedInChoice() {
  try {
    return ['accepted', 'declined'].includes(localStorage.getItem(CONSENT_KEY))
  } catch (error) {
    console.warn('Could not read LinkedIn consent.', error)
    return false
  }
}

export function loadLinkedIn() {
  if (!isLinkedInEnabled() || !hasLinkedInConsent()) return
  if (document.getElementById(SCRIPT_ID)) return

  window._linkedin_partner_id = import.meta.env.VITE_LINKEDIN_PARTNER_ID
  window._linkedin_data_partner_ids = [window._linkedin_partner_id]
  window.lintrk = function (action, data) {
    window.lintrk.q.push([action, data])
  }
  window.lintrk.q = []
  const script = document.createElement('script')
  script.id = SCRIPT_ID
  script.async = true
  script.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js'
  script.onerror = () => {
    console.warn('LinkedIn measurement could not load; website forms remain available.')
    script.remove()
    delete window.lintrk
  }
  document.head.appendChild(script)
}

export function setLinkedInConsent(granted) {
  try {
    localStorage.setItem(CONSENT_KEY, granted ? 'accepted' : 'declined')
  } catch (error) {
    console.warn('Could not save LinkedIn consent; LinkedIn measurement was not enabled.', error)
    return
  }
  if (granted) {
    loadLinkedIn()
  } else if (document.getElementById(SCRIPT_ID)) {
    // Removing a script does not undo its listeners; reload without consent.
    window.location.reload()
  }
}

export function trackLinkedInConversion(kind) {
  if (!isLinkedInEnabled() || !hasLinkedInConsent()) return
  const ids = {
    download: import.meta.env.VITE_LINKEDIN_DOWNLOAD_CONVERSION_ID,
  }
  const id = ids[kind]
  if (!validId(id)) return
  loadLinkedIn()
  window.lintrk?.('track', { conversion_id: Number(id) })
}

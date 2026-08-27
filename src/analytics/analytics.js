function hasConsent() {
  if (typeof localStorage === 'undefined' || !localStorage?.getItem) return false
  return localStorage.getItem('par-cookie-consent') === 'accepted'
}

function setConsent(granted) {
  if (typeof window === 'undefined' || !localStorage?.setItem) return
  localStorage.setItem('par-cookie-consent', granted ? 'accepted' : 'declined')
}

export const analytics = {
  consent(granted) {
    if (typeof window === 'undefined') return
    setConsent(granted)
    const mode = granted ? 'granted' : 'denied'
    if (window.gtag) {
      window.gtag('consent', 'update', { analytics_storage: mode })
    }
    if (window.plausible) {
      window.__plausiblePaused = !granted
    }
    if (window.posthog) {
      window.posthog?.capture?.('$consent', { analytics_storage: mode })
    }
  },

  track(event, props = {}) {
    if (typeof window === 'undefined') return
    if (window.__plausiblePaused) return
    if (window.gtag) {
      window.gtag('event', event, props)
    }
    if (window.plausible) {
      window.plausible(event, { props })
    }
    if (window.posthog) {
      window.posthog?.capture?.(event, props)
    }
  },

  page() {
    if (typeof window === 'undefined') return
    if (window.__plausiblePaused) return
    if (window.gtag) {
      window.gtag('event', 'page_view')
    }
    if (window.plausible) {
      window.plausible('pageview')
    }
    if (window.posthog) {
      window.posthog?.capture?.('$pageview')
    }
  },

  hasConsent,
}

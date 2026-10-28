import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import App from './App.jsx'
import { CompanyPage } from './pages/CompanyPage.jsx'
import { legacyProductDestination, siteForUrl } from './lib/site.js'
import { SiteMetadata } from './components/SiteMetadata.jsx'
import { useBrowserReady, useSiteUrl } from './lib/RenderContext.jsx'

export default function SiteApp() {
  const location = useLocation()
  const url = useSiteUrl()
  const ready = useBrowserReady()
  const destination = ready ? legacyProductDestination(url) : null
  useEffect(() => {
    if (destination) window.location.replace(destination)
  }, [destination])
  useEffect(() => {
    if (!destination) window.dispatchEvent(new Event('par-page-change'))
  }, [destination, location.pathname, location.search])
  if (destination) return <a href={destination}>Pär →</a>
  return <><SiteMetadata />{siteForUrl(url) === 'company' ? <CompanyPage /> : <App />}</>
}

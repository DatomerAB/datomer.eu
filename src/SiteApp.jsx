import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import App from './App.jsx'
import { CompanyPage } from './pages/CompanyPage.jsx'
import { legacyProductDestination, siteForUrl } from './lib/site.js'
import { SiteMetadata } from './components/SiteMetadata.jsx'

export default function SiteApp() {
  const location = useLocation()
  const url = new URL(`${location.pathname}${location.search}${location.hash}`, window.location.origin)
  const destination = legacyProductDestination(url)
  useEffect(() => {
    if (destination) window.location.replace(destination)
  }, [destination])
  if (destination) return <a href={destination}>Pär →</a>
  return <><SiteMetadata />{siteForUrl(url) === 'company' ? <CompanyPage /> : <App />}</>
}

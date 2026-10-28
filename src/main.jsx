import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { LanguageProvider } from './i18n/LanguageProvider.jsx'
import './index.css'
import SiteApp from './SiteApp.jsx'

// React 19 owns live metadata. Remove the crawler-only HTML metadata before
// mounting so client navigation cannot leave duplicate or stale domain tags.
document.head.querySelectorAll(
  'title, meta[name="description"], link[rel="icon"], link[rel="apple-touch-icon"], link[rel="canonical"], link[rel="alternate"][hreflang], meta[property^="og:"], meta[name^="twitter:"], script[type="application/ld+json"]',
).forEach(element => element.remove())

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider><BrowserRouter>
      <LanguageProvider>
        <SiteApp />
      </LanguageProvider>
    </BrowserRouter></HelmetProvider>
  </StrictMode>,
)

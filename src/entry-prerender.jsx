import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { LanguageProvider } from './i18n/LanguageProvider.jsx'
import { RenderContext } from './lib/RenderContext.jsx'
import SiteApp from './SiteApp.jsx'

export function renderHomepage(origin, language) {
  const location = language === 'sv' ? '/?lang=sv' : '/'
  const html = renderToString(
    <RenderContext.Provider value={{ origin, language }}>
      <HelmetProvider>
        <StaticRouter location={location}>
          <LanguageProvider><SiteApp /></LanguageProvider>
        </StaticRouter>
      </HelmetProvider>
    </RenderContext.Provider>,
  )
  // Only strip React's leading head tags, never titles inside accessible SVGs.
  return html.replace(/^(?:(?:<(?:link|meta)\b[^>]*\/>)|(?:<title>[\s\S]*?<\/title>))+/, '')
}

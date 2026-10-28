import { createContext, useContext, useSyncExternalStore } from 'react'
import { useLocation } from 'react-router-dom'

export const RenderContext = createContext(null)

export function useSiteUrl() {
  const rendering = useContext(RenderContext)
  const location = useLocation()
  const ready = useBrowserReady()
  return new URL(`${location.pathname}${location.search}${location.hash}`,
    rendering && !ready ? rendering.origin : window.location.origin)
}

const subscribe = () => () => {}

// Browser preferences must not change the first hydrated tree.
export function useBrowserReady() {
  return useSyncExternalStore(subscribe, () => true, () => false)
}

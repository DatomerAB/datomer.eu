import { createContext, useContext, useEffect, useState } from 'react'
import { translations } from './translations'

const LanguageContext = createContext({
  lang: 'en',
  setLang: () => {},
  t: () => {},
})

export function useLanguage() {
  return useContext(LanguageContext)
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj)
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    if (typeof window === 'undefined') return 'en'
    const stored = window.localStorage.getItem('par-language')
    if (stored && translations[stored]) return stored
    const browser = navigator.language.slice(0, 2)
    return translations[browser] ? browser : 'en'
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('par-language', lang)
      document.documentElement.lang = lang
    }
  }, [lang])

  const t = (path) => {
    const value = getNestedValue(translations[lang], path)
    if (value === undefined && lang !== 'en') {
      return getNestedValue(translations.en, path) ?? path
    }
    return value ?? path
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

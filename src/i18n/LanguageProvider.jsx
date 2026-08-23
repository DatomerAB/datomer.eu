import { useEffect, useState } from 'react'
import { translations } from './translations'
import { LanguageContext } from './LanguageContext.js'

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj)
}

function interpolate(template, params) {
  if (typeof template !== 'string' || !params) return template
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => (params[key] !== undefined ? String(params[key]) : `{{${key}}}`))
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    if (typeof window === 'undefined') return 'en'
    const storage = typeof window.localStorage?.getItem === 'function' ? window.localStorage : null
    const stored = storage?.getItem('par-language')
    if (stored && translations[stored]) return stored
    const browser = typeof navigator !== 'undefined' ? navigator.language?.slice(0, 2) : 'en'
    return translations[browser] ? browser : 'en'
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (typeof window.localStorage?.setItem === 'function') {
        window.localStorage.setItem('par-language', lang)
      }
      document.documentElement.lang = lang
    }
  }, [lang])

  const t = (path, options) => {
    let value = getNestedValue(translations[lang], path)
    if (value === undefined && lang !== 'en') {
      value = getNestedValue(translations.en, path)
    }
    if (value === undefined && options?.defaultValue !== undefined) {
      return interpolate(options.defaultValue, options)
    }
    if (typeof value === 'string') {
      return interpolate(value, options ?? getNestedValue(translations[lang], `${path}Params`) ?? getNestedValue(translations.en, `${path}Params`))
    }
    return value ?? path
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

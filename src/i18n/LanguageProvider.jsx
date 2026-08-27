import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { translations } from './translations'
import { LanguageContext } from './LanguageContext.js'

function useSearchParamsSafe() {
  try {
    return useSearchParams()
  } catch {
    const empty = new URLSearchParams()
    return [empty, () => {}]
  }
}

export const SUPPORTED_LANGUAGES = ['en', 'sv', 'de']
export const DEFAULT_LANGUAGE = 'en'

export function parseLanguage(value) {
  if (!value) return null
  const code = String(value).toLowerCase().slice(0, 2)
  return SUPPORTED_LANGUAGES.includes(code) ? code : null
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj)
}

function interpolate(template, params) {
  if (typeof template !== 'string' || !params) return template
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => (params[key] !== undefined ? String(params[key]) : `{{${key}}}`))
}

export function LanguageProvider({ children }) {
  const [searchParams, setSearchParams] = useSearchParamsSafe()
  const [lang, setLangState] = useState(() => {
    if (typeof window === 'undefined') {
      return parseLanguage(searchParams.get('lang')) || DEFAULT_LANGUAGE
    }
    const queryLang = parseLanguage(searchParams.get('lang'))
    if (queryLang) return queryLang
    const storage = typeof window.localStorage?.getItem === 'function' ? window.localStorage : null
    const stored = parseLanguage(storage?.getItem('par-language'))
    if (stored) return stored
    const browser = parseLanguage(navigator.language)
    return browser || DEFAULT_LANGUAGE
  })

  const setLang = (next) => {
    const code = parseLanguage(next) || DEFAULT_LANGUAGE
    setLangState(code)
    if (typeof window !== 'undefined' && typeof window.localStorage?.setItem === 'function') {
      window.localStorage.setItem('par-language', code)
    }
    const current = new URLSearchParams(searchParams)
    if (code === DEFAULT_LANGUAGE) {
      current.delete('lang')
    } else {
      current.set('lang', code)
    }
    setSearchParams(current, { replace: true })
  }

  useEffect(() => {
    const queryLang = parseLanguage(searchParams.get('lang'))
    if (queryLang && queryLang !== lang) {
      setLangState(queryLang)
    }
  }, [searchParams])

  useEffect(() => {
    if (typeof window !== 'undefined') {
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
    <LanguageContext.Provider value={{ lang, setLang, t, supportedLanguages: SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  )
}

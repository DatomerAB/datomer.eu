import { describe, expect, it } from 'vitest'
import { translations } from './translations'

function collectKeys(obj, prefix = '') {
  const keys = []
  for (const [key, value] of Object.entries(obj)) {
    if (key === 'defaultValue') continue
    const path = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...collectKeys(value, path))
    } else {
      keys.push(path)
    }
  }
  return keys
}

describe('translation keys', () => {
  const langs = Object.keys(translations)

  it('every language has the same keys as English', () => {
    const enKeys = collectKeys(translations.en)
    for (const lang of langs) {
      if (lang === 'en') continue
      const langKeys = collectKeys(translations[lang])
      const missing = enKeys.filter((k) => !langKeys.includes(k))
      const extra = langKeys.filter((k) => !enKeys.includes(k))
      expect(missing, `missing keys in ${lang}: ${missing.join(', ')}`).toEqual([])
      expect(extra, `extra keys in ${lang}: ${extra.join(', ')}`).toEqual([])
    }
  })

  it('no duplicate top-level keys within a language', () => {
    for (const lang of langs) {
      const topKeys = Object.keys(translations[lang])
      const seen = new Set()
      const dups = []
      for (const key of topKeys) {
        if (seen.has(key)) dups.push(key)
        seen.add(key)
      }
      expect(dups, `duplicate top-level keys in ${lang}: ${dups.join(', ')}`).toEqual([])
    }
  })
})

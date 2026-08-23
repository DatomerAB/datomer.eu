import { describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { LanguageProvider } from './LanguageProvider.jsx'
import { useLanguage } from './useLanguage.js'
import { translations } from './translations'

function wrapper({ children }) {
  return <LanguageProvider>{children}</LanguageProvider>
}

describe('LanguageProvider', () => {
  it('translates simple keys', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper })
    expect(result.current.t('nav.product')).toBe(translations.en.nav.product)
  })

  it('interpolates params', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper })
    expect(result.current.t('privacy.intro')).toContain('Datomer AB')
    expect(result.current.t('terms.intro')).toContain('559199-6540')
  })

  it('switches to Swedish', async () => {
    const { result } = renderHook(() => useLanguage(), { wrapper })
    await act(async () => {
      result.current.setLang('sv')
    })
    expect(result.current.lang).toBe('sv')
    expect(result.current.t('nav.product')).toBe(translations.sv.nav.product)
  })

  it('falls back to English for missing Swedish key', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper })
    expect(result.current.t('does.not.exist')).toBe('does.not.exist')
  })
})

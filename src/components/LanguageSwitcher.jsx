import { useLanguage } from '../i18n/useLanguage.js'

export function LanguageSwitcher() {
  const { lang, setLang, t, supportedLanguages } = useLanguage()

  const labels = { en: 'EN', sv: 'SV', de: 'DE' }

  return (
    <div className="language-switcher" role="group" aria-label={t('language.label')}>
      {supportedLanguages.map((code) => (
        <button
          key={code}
          type="button"
          className={lang === code ? 'active' : ''}
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
        >
          {labels[code]}
        </button>
      ))}
    </div>
  )
}

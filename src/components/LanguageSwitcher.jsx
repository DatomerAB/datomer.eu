import { useLanguage } from '../i18n/LanguageProvider'

export function LanguageSwitcher() {
  const { lang, setLang, t } = useLanguage()

  return (
    <div className="language-switcher" role="group" aria-label={t('language.label')}>
      <button
        type="button"
        className={lang === 'en' ? 'active' : ''}
        onClick={() => setLang('en')}
        aria-pressed={lang === 'en'}
      >
        EN
      </button>
      <button
        type="button"
        className={lang === 'sv' ? 'active' : ''}
        onClick={() => setLang('sv')}
        aria-pressed={lang === 'sv'}
      >
        SV
      </button>
    </div>
  )
}

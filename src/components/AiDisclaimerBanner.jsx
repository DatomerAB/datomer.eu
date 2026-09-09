import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/useLanguage.js'
import aiDisclaimers from '../data/ai_disclaimers.json'

export function AiDisclaimerBanner() {
  const { t } = useLanguage()

  const identity = aiDisclaimers.ai_identity || t('footer.aiDisclaimerFallback', { defaultValue: '' })
  const professional = aiDisclaimers.not_professional || ''

  if (!identity) return null

  return (
    <div className="ai-disclaimer-banner">
      <p className="ai-disclaimer-text">
        <strong>{t('footer.aiDisclaimerLabel', { defaultValue: 'AI notice:' })}</strong>{' '}
        {identity} {professional && `${professional} `}
        <Link to="/terms#ai-disclaimer" className="ai-disclaimer-link">
          {t('footer.aiDisclaimerLink', { defaultValue: 'Learn more' })}
        </Link>
      </p>
    </div>
  )
}

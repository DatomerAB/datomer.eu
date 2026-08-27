import { useLanguage } from '../i18n/useLanguage.js'
import { useLocalizedHeading } from '../lib/formatHeading.js'
import { SEO, HreflangLinks } from '../components/SEO.jsx'

export function PressPage() {
  const { t, lang } = useLanguage()
  const formatHeading = useLocalizedHeading()

  return (
    <>
      <SEO
        title="Press Kit"
        description="Press kit for Pär by Datomer. Download logos, screenshots, and company facts for journalists and reviewers."
        pathname="/press"
        lang={lang}
      />
      <HreflangLinks pathname="/press" />
      <main className="section container legal-page">
        <header className="page-header">
          <h1>{formatHeading(t('press.title'))}</h1>
          <p className="lede">{t('press.intro')}</p>
        </header>

        <section className="press-section">
          <h2>{formatHeading(t('press.brandMaterials'))}</h2>
          <p>{t('press.brandMaterialsText')}</p>
          <div className="press-downloads">
            <a href="/par-logo.png" download className="button button-secondary">
              {t('press.downloadLogoPng')}
            </a>
            <a href="/datomer-logo.png" download className="button button-secondary">
              {t('press.downloadCompanyLogoPng')}
            </a>
            <a href="/og-image.png" download className="button button-secondary">
              {t('press.downloadSocialImage')}
            </a>
            <a href="/linkedin-banner-forest.png" download className="button button-secondary">
              {t('press.downloadLinkedInBanner')}
            </a>
          </div>

          <h3>{t('press.imageVariations')}</h3>
          <p>{t('press.imageVariationsText')}</p>
          <div className="press-variations">
            {['forest', 'midnight', 'ember', 'aurora', 'slate'].map((variant) => (
              <a
                key={variant}
                href={`/og-image-${variant}.png`}
                download
                className="press-variant-thumb"
                aria-label={t('press.downloadVariant', { variant })}
              >
                <img
                  src={`/og-image-${variant}.png`}
                  alt={t('press.variantAlt', { variant })}
                  width="200"
                  height="105"
                  loading="lazy"
                />
                <span>{variant}</span>
              </a>
            ))}
          </div>
        </section>

        <section className="press-section">
          <h2>{formatHeading(t('press.aboutProduct'))}</h2>
          <p>{t('press.aboutProductText')}</p>
        </section>

        <section className="press-section">
          <h2>{formatHeading(t('press.companyDetails'))}</h2>
          <dl className="press-facts">
            <dt>{t('press.facts.company')}</dt>
            <dd>{t('press.facts.companyValue')}</dd>
            <dt>{t('press.facts.orgNumber')}</dt>
            <dd>{t('press.facts.orgNumberValue')}</dd>
            <dt>{t('press.facts.headquarters')}</dt>
            <dd>{t('press.facts.headquartersValue')}</dd>
            <dt>{t('press.facts.product')}</dt>
            <dd>{t('press.facts.productValue')}</dd>
            <dt>{t('press.facts.platform')}</dt>
            <dd>{t('press.facts.platformValue')}</dd>
            <dt>{t('press.facts.pricing')}</dt>
            <dd>{t('press.facts.pricingValue')}</dd>
          </dl>
        </section>

        <section className="press-section">
          <h2>{formatHeading(t('press.quotes'))}</h2>
          <blockquote className="press-quote">
            <p>{t('press.quoteText')}</p>
            <footer>{t('press.quoteAuthor')}</footer>
          </blockquote>
        </section>

        <section className="press-section">
          <h2>{formatHeading(t('press.contact'))}</h2>
          <p>{t('press.contactText')}</p>
          <p>
            <a href="mailto:hello@datomer.eu">hello@datomer.eu</a>
          </p>
        </section>
      </main>
    </>
  )
}

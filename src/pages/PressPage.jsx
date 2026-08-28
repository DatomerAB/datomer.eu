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
            <a href="/datomer-press-kit.zip" download className="button">
              {t('press.downloadKit')}
            </a>
            <a href="/press-kit/README.md" download className="button button-secondary">
              README / Factsheet
            </a>
          </div>
          <p className="press-note">{t('press.kitDescription')}</p>

          <div className="press-downloads">
            <a href="/par-logo.png" download className="button button-secondary">
              {t('press.downloadLogoPng')}
            </a>
            <a href="/datomer-logo.png" download className="button button-secondary">
              {t('press.downloadCompanyLogoPng')}
            </a>
            <a href="/datomer-logo.svg" download className="button button-secondary">
              {t('press.downloadSvg')}
            </a>
            <a href="/og-image.png" download className="button button-secondary">
              {t('press.downloadSocialImage')}
            </a>
            <a href="/par-banner.png" download className="button button-secondary">
              {t('press.downloadLinkedInBanner')}
            </a>
          </div>

          <h3>{t('press.parBrandMaterials')}</h3>
          <p>{t('press.parBrandMaterialsText')}</p>
          <div className="press-downloads">
            <a href="/par-logo-themed.png" download className="button button-secondary">
              {t('press.downloadParLogoPng')}
            </a>
            <a href="/par-banner.png" download className="button button-secondary">
              {t('press.downloadParBannerPng')}
            </a>
          </div>

          <h4>{t('press.parLogoVariations')}</h4>
          <p>{t('press.parLogoVariationsText')}</p>
          <div className="press-variations">
            {['forest', 'midnight', 'stone', 'copper', 'ink', 'aurora', 'fog', 'ember', 'moss', 'slate', 'silver', 'platinum', 'gold'].map((variant) => (
              <a
                key={`par-logo-${variant}`}
                href={`/par-logo-themed-${variant}.png`}
                download
                className="press-variant-thumb"
                aria-label={t('press.downloadParLogoVariant', { variant })}
              >
                <img
                  src={`/par-logo-themed-${variant}.png`}
                  alt={t('press.parLogoVariantAlt', { variant })}
                  width="100"
                  height="100"
                  loading="lazy"
                  className="press-logo-thumb"
                />
                <span>{variant}</span>
              </a>
            ))}
          </div>

          <h4>{t('press.parBannerVariations')}</h4>
          <p>{t('press.parBannerVariationsText')}</p>
          <div className="press-variations">
            {['forest', 'midnight', 'stone', 'copper', 'ink', 'aurora', 'fog', 'ember', 'moss', 'slate', 'silver', 'platinum', 'gold'].map((variant) => (
              <a
                key={`par-${variant}`}
                href={`/par-banner-${variant}.png`}
                download
                className="press-variant-thumb"
                aria-label={t('press.downloadParVariant', { variant })}
              >
                <img
                  src={`/par-banner-${variant}.png`}
                  alt={t('press.parVariantAlt', { variant })}
                  width="200"
                  height="34"
                  loading="lazy"
                />
                <span>{variant}</span>
              </a>
            ))}
          </div>

          <h3>{t('press.datomerBrandMaterials')}</h3>
          <p>{t('press.datomerBrandMaterialsText')}</p>
          <div className="press-downloads">
            <a href="/datomer-logo-themed.png" download className="button button-secondary">
              {t('press.downloadDatomerLogoPng')}
            </a>
            <a href="/datomer-banner.png" download className="button button-secondary">
              {t('press.downloadDatomerBannerPng')}
            </a>
          </div>

          <h4>{t('press.datomerLogoVariations')}</h4>
          <p>{t('press.datomerLogoVariationsText')}</p>
          <div className="press-variations">
            {['forest', 'midnight', 'stone', 'copper', 'ink', 'aurora', 'fog', 'ember', 'moss', 'slate', 'silver', 'platinum', 'gold'].map((variant) => (
              <a
                key={`datomer-logo-${variant}`}
                href={`/datomer-logo-themed-${variant}.png`}
                download
                className="press-variant-thumb"
                aria-label={t('press.downloadDatomerLogoVariant', { variant })}
              >
                <img
                  src={`/datomer-logo-themed-${variant}.png`}
                  alt={t('press.datomerLogoVariantAlt', { variant })}
                  width="100"
                  height="100"
                  loading="lazy"
                  className="press-logo-thumb"
                />
                <span>{variant}</span>
              </a>
            ))}
          </div>

          <h4>{t('press.datomerBannerVariations')}</h4>
          <p>{t('press.datomerBannerVariationsText')}</p>
          <div className="press-variations">
            {['forest', 'midnight', 'stone', 'copper', 'ink', 'aurora', 'fog', 'ember', 'moss', 'slate', 'silver', 'platinum', 'gold'].map((variant) => (
              <a
                key={`datomer-${variant}`}
                href={`/datomer-banner-${variant}.png`}
                download
                className="press-variant-thumb"
                aria-label={t('press.downloadDatomerVariant', { variant })}
              >
                <img
                  src={`/datomer-banner-${variant}.png`}
                  alt={t('press.datomerVariantAlt', { variant })}
                  width="200"
                  height="34"
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

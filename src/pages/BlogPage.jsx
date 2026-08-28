import { useLanguage } from '../i18n/useLanguage.js'
import { getChangelogPosts } from '../content/changelog/index.js'
import { SEO, HreflangLinks } from '../components/SEO.jsx'

export function BlogPage() {
  const { t, lang } = useLanguage()
  const posts = getChangelogPosts()

  return (
    <>
      <SEO
        title="Changelog & Updates"
        description="The latest Pär product updates, release notes, beta news, and launch milestones."
        pathname="/blog"
        lang={lang}
      />
      <HreflangLinks pathname="/blog" />
      <main className="legal-page">
      <div className="container section">
        <header className="page-header">
          <h1>{t('changelog.title')}</h1>
          <p className="lede">{t('changelog.intro')}</p>
        </header>

        <div className="changelog-list">
          {posts.map((post) => (
            <article key={post.slug} className="changelog-post">
              <header className="changelog-header">
                <time dateTime={post.date}>{post.date}</time>
                <h2>{post.title}</h2>
              </header>
              <div
                className="prose"
                dangerouslySetInnerHTML={{ __html: post.html }}
              />
            </article>
          ))}
        </div>
      </div>
      </main>
    </>
  )
}

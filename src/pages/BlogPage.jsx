import { useLanguage } from '../i18n/useLanguage.js'
import { getChangelogPosts } from '../content/changelog/index.js'

export function BlogPage() {
  const { t } = useLanguage()
  const posts = getChangelogPosts()

  return (
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
  )
}

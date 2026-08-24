import { marked } from 'marked'

import launch from './2026-08-23-launch.md?raw'
import beta from './2026-08-20-beta.md?raw'

const posts = [
  {
    slug: 'launch',
    date: '2026-08-23',
    title: 'Pär is live',
    raw: launch,
  },
  {
    slug: 'beta',
    date: '2026-08-20',
    title: 'Beta release',
    raw: beta,
  },
].sort((a, b) => b.date.localeCompare(a.date))

export function getChangelogPosts() {
  return posts.map((post) => ({
    ...post,
    html: marked.parse(post.raw),
  }))
}

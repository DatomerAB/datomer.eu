import { marked } from 'marked'

import launch from './2026-08-23-launch.md?raw'
import beta from './2026-08-20-beta.md?raw'
import post_2026_08_31_par_0_1_0_beta_2026083101 from './2026-08-31-par-0-1-0-beta-2026083101.md?raw'

const posts = [
  {
    slug: 'par-0-1-0-beta-2026083101',
    date: '2026-08-31',
    title: 'Pär 0.1.0-beta.2026083101',
    raw: post_2026_08_31_par_0_1_0_beta_2026083101,
  },
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

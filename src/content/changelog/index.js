import { marked } from 'marked'
import par_0_1_2_beta_2026090301 from './2026-09-03-par-0.1.2-beta.2026090301.md?raw'
import par_0_1_1_beta_2026090301 from './2026-09-03-par-0.1.1-beta.2026090301.md?raw'
import par_0_1_0_beta_2026090102 from './2026-09-01-par-0.1.0-beta.2026090102.md?raw'
import par_0_1_0_beta_2026090101 from './2026-09-01-par-0.1.0-beta.2026090101.md?raw'

import launch from './2026-08-23-launch.md?raw'
import beta from './2026-08-20-beta.md?raw'

const posts = [
  {
    slug: 'par-0.1.2-beta.2026090301',
    date: '2026-09-03',
    title: 'Pär v0.1.2-beta.2026090301',
    raw: par_0_1_2_beta_2026090301,
  },
  {
    slug: 'par-0.1.1-beta.2026090301',
    date: '2026-09-03',
    title: 'Pär v0.1.1-beta.2026090301',
    raw: par_0_1_1_beta_2026090301,
  },
  {
    slug: 'par-0.1.0-beta.2026090102',
    date: '2026-09-01',
    title: 'Pär v0.1.0-beta.2026090102',
    raw: par_0_1_0_beta_2026090102,
  },
  {
    slug: 'par-0.1.0-beta.2026090101',
    date: '2026-09-01',
    title: 'Pär v0.1.0-beta.2026090101',
    raw: par_0_1_0_beta_2026090101,
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

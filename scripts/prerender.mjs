import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { renderHomepage } from '../dist-ssr/entry-prerender.js'

const shell = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8')
for (const [site, origin] of [['company', 'https://datomer.eu'], ['product', 'https://par.datomer.eu']]) {
  for (const language of ['en', 'sv']) {
    const body = renderHomepage(origin, language)
    if (!body.includes('<h1') || !body.includes('<main')) {
      throw new Error(`Homepage rendering is incomplete: ${site}/${language}`)
    }
    const html = shell.replace('<div id="root"></div>',
      () => `<div id="root" data-prerendered="${site}" data-language="${language}">${body}</div>`)
    if (html === shell) throw new Error('Missing root marker in the Vite shell')
    const directory = new URL(`../dist/__prerender/${site}/${language}/`, import.meta.url)
    await mkdir(directory, { recursive: true })
    await writeFile(new URL('index.html', directory), html)
    console.log(`Pre-rendered ${site}/${language}`)
  }
}

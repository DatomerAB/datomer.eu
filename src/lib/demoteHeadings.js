// Page templates own the single <h1>, so headings inside rendered markdown are pushed down.
export function demoteHeadings(html, by = 1) {
  return html.replace(/<(\/?)h([1-6])(?=[\s>])/g, (_, slash, level) => `<${slash}h${Math.min(Number(level) + by, 6)}`)
}

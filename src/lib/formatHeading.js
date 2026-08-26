import { useLanguage } from '../i18n/useLanguage.js'

const SMALL_WORDS = new Set([
  'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'from', 'in', 'nor',
  'of', 'on', 'or', 'per', 'the', 'to', 'vs', 'with',
])

const PROPER_NOUNS = new Set(['pär', 'macos', 'datomer'])

function splitWord(word) {
  const punctuation = word.match(/[^a-zA-Z0-9\u00C0-\u017F]+$/)?.[0] || ''
  const core = word.slice(0, word.length - punctuation.length)
  return { core, punctuation }
}

function isAcronym(core) {
  return core.length > 1 && core === core.toUpperCase()
}

function preserveCasing(core) {
  return isAcronym(core) || PROPER_NOUNS.has(core.toLowerCase())
}

function capitalizeCore(core) {
  if (!core) return core
  if (preserveCasing(core)) return core
  return core.charAt(0).toUpperCase() + core.slice(1).toLowerCase()
}

function titleCaseWord(word, index, isFirst, isLast) {
  const { core, punctuation } = splitWord(word)
  if (!core) return word

  if (isFirst || isLast) {
    return capitalizeCore(core) + punctuation
  }

  if (SMALL_WORDS.has(core.toLowerCase())) {
    return core.toLowerCase() + punctuation
  }

  return capitalizeCore(core) + punctuation
}

export function formatHeading(text) {
  if (typeof text !== 'string' || text.trim().length === 0) return text

  const trimmed = text.trim()
  const words = trimmed.split(/\s+/)

  // Headers/subheaders longer than four words: sentence case (first word + acronyms/proper nouns).
  if (words.length > 4) {
    return words
      .map((word, index) => {
        const { core, punctuation } = splitWord(word)
        if (!core) return word
        if (index === 0 || preserveCasing(core)) {
          return capitalizeCore(core) + punctuation
        }
        return core.toLowerCase() + punctuation
      })
      .join(' ')
  }

  // Short headers: Title Case with small words lowercased unless first/last.
  return words
    .map((word, index) => titleCaseWord(word, index, index === 0, index === words.length - 1))
    .join(' ')
}

export function useLocalizedHeading() {
  const { lang } = useLanguage()
  return (text) => (lang === 'en' ? formatHeading(text) : text)
}

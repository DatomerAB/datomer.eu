const SMALL_WORDS = new Set([
  'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'from', 'in', 'nor',
  'of', 'on', 'or', 'per', 'the', 'to', 'vs', 'with',
])

function splitWord(word) {
  const punctuation = word.match(/[^a-zA-Z0-9\u00C0-\u017F]+$/)?.[0] || ''
  const core = word.slice(0, word.length - punctuation.length)
  return { core, punctuation }
}

function capitalizeCore(core) {
  if (!core) return core
  // Preserve all-caps acronyms like AI, GGUF, MFA.
  if (core === core.toUpperCase() && core.length > 1) {
    return core
  }
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

  // Headers/subheaders longer than four words: sentence case (first word + any all-caps acronym).
  if (words.length > 4) {
    return words
      .map((word, index) => {
        const { core, punctuation } = splitWord(word)
        if (!core) return word
        if (index === 0) {
          return capitalizeCore(core) + punctuation
        }
        if (core === core.toUpperCase() && core.length > 1) {
          return core + punctuation
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

import { marked } from 'marked'
import { demoteHeadings } from '../../lib/demoteHeadings.js'
import DOMPurify from 'dompurify'
import en from './GET_STARTED.md?raw'
import sv from './GET_STARTED.sv.md?raw'

// Synced from DatomerAB/Par docs/GET_STARTED*.md. Edit there, not here.
const docs = { en, sv }

export function getGetStartedHtml(lang = 'en') {
  return DOMPurify.sanitize(demoteHeadings(marked.parse(docs[lang] ?? docs.en)))
}

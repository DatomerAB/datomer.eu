import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { translations } from './translations'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.resolve(__dirname, '..')

function collectKeys(obj, prefix = '', ignoreKeys = ['introParams']) {
  const keys = []
  for (const [key, value] of Object.entries(obj)) {
    if (ignoreKeys.includes(key)) continue
    const path = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...collectKeys(value, path, ignoreKeys))
    } else {
      keys.push(path)
    }
  }
  return keys
}

function findSourceFiles(dir, extensions = ['.js', '.jsx']) {
  const files = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory() && entry.name !== 'i18n') {
      files.push(...findSourceFiles(full, extensions))
    } else if (
      entry.isFile() &&
      extensions.some((ext) => entry.name.endsWith(ext)) &&
      !IGNORE_FILES.some((marker) => entry.name.includes(marker))
    ) {
      files.push(full)
    }
  }
  return files
}

const usedKeys = new Set()
const tCall = /\bt\(\s*['"`]([^'"`$]+)['"`]/g
const IGNORE_FILES = ['.test.', '.spec.']

for (const file of findSourceFiles(srcDir)) {
  const text = fs.readFileSync(file, 'utf8')
  for (const match of text.matchAll(tCall)) {
    const key = match[1]
    if (key.includes('${')) continue
    usedKeys.add(key)
  }
}

describe('translation usage', () => {
  const definedKeys = collectKeys(translations.en)

  it('every t() key exists in English translations', () => {
    const missing = [...usedKeys].filter((k) => !definedKeys.includes(k))
    expect(missing, `missing translations for keys: ${missing.join(', ')}`).toEqual([])
  })

  it('flags potentially unused English translation keys', () => {
    const unused = definedKeys.filter((k) => !usedKeys.has(k))
    expect(unused, `unused translation keys: ${unused.join(', ')}`).toEqual([])
  })
})

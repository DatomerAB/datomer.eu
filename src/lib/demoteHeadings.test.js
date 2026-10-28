import { describe, expect, it } from 'vitest'
import { demoteHeadings } from './demoteHeadings.js'

describe('demoteHeadings', () => {
  it('shifts heading levels and keeps attributes', () => {
    expect(demoteHeadings('<h1 id="a">A</h1><h2>B</h2>', 1)).toBe('<h2 id="a">A</h2><h3>B</h3>')
  })
  it('caps at h6 and ignores other tags', () => {
    expect(demoteHeadings('<h6>x</h6><header>y</header><hr>', 2)).toBe('<h6>x</h6><header>y</header><hr>')
  })
})

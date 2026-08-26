import { describe, expect, it } from 'vitest'
import { formatHeading } from './formatHeading.js'

describe('formatHeading', () => {
  it('sentence-cases headers longer than four words', () => {
    expect(formatHeading('Most AI Assistants Start Every Conversation From Zero.')).toBe(
      'Most AI assistants start every conversation from zero.'
    )
    expect(formatHeading('Everything You Expect From A Modern AI Assistant')).toBe(
      'Everything you expect from a modern AI assistant'
    )
  })

  it('uses Title Case for short headers but lowercases small words', () => {
    expect(formatHeading('It Is The Foundation.')).toBe('It Is the Foundation.')
    expect(formatHeading('Built For Modern Macs.')).toBe('Built for Modern Macs.')
    expect(formatHeading('Ready To Meet Pär?')).toBe('Ready to Meet Pär?')
  })

  it('capitalizes the first word even if it is a small word', () => {
    expect(formatHeading('The Quick Brown Fox')).toBe('The Quick Brown Fox')
  })

  it('capitalizes the last word in short headers', () => {
    expect(formatHeading('Run For The Hills')).toBe('Run for the Hills')
  })

  it('handles single-word headers', () => {
    expect(formatHeading('Pricing')).toBe('Pricing')
  })
})

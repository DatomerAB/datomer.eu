import { describe, expect, it } from 'vitest'
import { verifyTurnstileToken } from './_turnstile.js'

describe('verifyTurnstileToken', () => {
  it('fails closed when the secret is missing', async () => {
    const result = await verifyTurnstileToken('token', undefined)

    expect(result).toEqual({
      success: false,
      error: 'Turnstile secret not configured.',
    })
  })
})

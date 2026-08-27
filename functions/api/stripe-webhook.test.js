import { describe, expect, it, vi, beforeEach } from 'vitest'
import { onRequestPost } from './stripe-webhook.js'

vi.mock('./_email.js', () => ({
  sendSupportEmail: vi.fn(() => Promise.resolve({ sent: true })),
}))

import { sendSupportEmail } from './_email.js'

function decodeSecret(secret) {
  if (secret.startsWith('whsec_')) {
    return Buffer.from(secret.slice(6), 'base64').toString('utf8')
  }
  return secret
}

async function makeSignature(secret, payload, timestamp = Math.floor(Date.now() / 1000)) {
  const { createHmac } = await import('node:crypto')
  const key = decodeSecret(secret)
  const signedPayload = `${timestamp}.${payload}`
  return `t=${timestamp},v1=${createHmac('sha256', key).update(signedPayload, 'utf8').digest('hex')}`
}

function makeRequest(body, signature) {
  return new Request('http://localhost/api/stripe-webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'stripe-signature': signature,
    },
    body,
  })
}

describe('stripe-webhook handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sends a support email and a user confirmation email on checkout.session.completed', async () => {
    const rawSecret = 'test_secret'
    const secret = `whsec_${Buffer.from(rawSecret).toString('base64')}`
    const payload = JSON.stringify({
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          customer_details: { email: 'buyer@example.com' },
          metadata: { plan: 'plus' },
        },
      },
    })
    const signature = await makeSignature(secret, payload)

    const request = makeRequest(payload, signature)
    const env = {
      STRIPE_SECRET_KEY: 'sk_test_123',
      STRIPE_WEBHOOK_SECRET: secret,
      RESEND_API_KEY: 're_123',
    }

    const response = await onRequestPost({ request, env })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.received).toBe(true)
    expect(data.license).toMatchObject({
      email: 'buyer@example.com',
      plan: 'plus',
      status: 'active',
    })

    expect(sendSupportEmail).toHaveBeenCalledTimes(2)

    const supportCall = sendSupportEmail.mock.calls[0][0]
    expect(supportCall.subject).toBe('Purchase: Pär plus — buyer@example.com')
    expect(supportCall.replyTo).toBe('buyer@example.com')
    expect(supportCall.html).toContain('New purchase')

    const confirmationCall = sendSupportEmail.mock.calls[1][0]
    expect(confirmationCall.to).toEqual(['buyer@example.com'])
    expect(confirmationCall.subject).toBe('Your Pär plus purchase confirmation')
    expect(confirmationCall.html).toContain('subscription is now active')
  })

  it('does not send emails when RESEND_API_KEY is missing', async () => {
    const rawSecret = 'test_secret'
    const secret = `whsec_${Buffer.from(rawSecret).toString('base64')}`
    const payload = JSON.stringify({
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          customer_details: { email: 'buyer@example.com' },
          metadata: { plan: 'plus' },
        },
      },
    })
    const signature = await makeSignature(secret, payload)

    const request = makeRequest(payload, signature)
    const env = {
      STRIPE_SECRET_KEY: 'sk_test_123',
      STRIPE_WEBHOOK_SECRET: secret,
    }

    const response = await onRequestPost({ request, env })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.received).toBe(true)
    expect(sendSupportEmail).not.toHaveBeenCalled()
  })

  it('returns 200 without sending emails for non-completed events', async () => {
    const rawSecret = 'test_secret'
    const secret = `whsec_${Buffer.from(rawSecret).toString('base64')}`
    const payload = JSON.stringify({ type: 'charge.succeeded' })
    const signature = await makeSignature(secret, payload)

    const request = makeRequest(payload, signature)
    const env = {
      STRIPE_SECRET_KEY: 'sk_test_123',
      STRIPE_WEBHOOK_SECRET: secret,
      RESEND_API_KEY: 're_123',
    }

    const response = await onRequestPost({ request, env })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.received).toBe(true)
    expect(sendSupportEmail).not.toHaveBeenCalled()
  })

  it('returns 400 for invalid signature', async () => {
    const request = makeRequest(JSON.stringify({ type: 'checkout.session.completed' }), 't=1,v1=bad')
    const env = {
      STRIPE_SECRET_KEY: 'sk_test_123',
      STRIPE_WEBHOOK_SECRET: `whsec_${Buffer.from('test_secret').toString('base64')}`,
      RESEND_API_KEY: 're_123',
    }

    const response = await onRequestPost({ request, env })
    expect(response.status).toBe(400)
    expect(sendSupportEmail).not.toHaveBeenCalled()
  })

  it('returns 500 when Stripe secrets are missing', async () => {
    const request = makeRequest('{}', '')
    const response = await onRequestPost({ request, env: {} })
    expect(response.status).toBe(500)
    expect(sendSupportEmail).not.toHaveBeenCalled()
  })
})

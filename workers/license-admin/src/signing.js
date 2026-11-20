const encoder = new TextEncoder()

function base64Url(bytes) {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function pemToDer(privateKeyPem) {
  const normalized = privateKeyPem.replace(/\\n/g, '\n')
  const match = normalized.match(
    /-----BEGIN PRIVATE KEY-----([\s\S]+?)-----END PRIVATE KEY-----/
  )
  if (!match) throw new Error('V2 signing key must be PKCS#8 PEM')
  const binary = atob(match[1].replace(/\s/g, ''))
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

export async function signLicense(claims, { privateKeyPem, keyId, now = Date.now() }) {
  if (!privateKeyPem || !keyId) {
    throw new Error('V2 license signing key and key ID must be configured')
  }

  const issuedAt = Math.floor(now / 1000)
  const header = { alg: 'ES256', kid: keyId, typ: 'par-license+jwt' }
  const payload = {
    iss: 'https://license.datomer.eu',
    sub: claims.subject,
    aud: claims.productId,
    iat: issuedAt,
    nbf: Math.floor(Date.parse(claims.validFrom) / 1000),
    jti: claims.licenseId,
    license_version: 2,
    product_id: claims.productId,
    license_id: claims.licenseId,
    tier: claims.tierId,
    tier_revision: String(claims.tierRevision),
    entitlements: claims.entitlements,
  }
  if (claims.validUntil) payload.exp = Math.floor(Date.parse(claims.validUntil) / 1000)
  if (!Number.isFinite(payload.nbf) || (payload.exp && payload.exp <= payload.nbf)) {
    throw new Error('Invalid license validity interval')
  }

  const encodedHeader = base64Url(encoder.encode(JSON.stringify(header)))
  const encodedPayload = base64Url(encoder.encode(JSON.stringify(payload)))
  const signingInput = `${encodedHeader}.${encodedPayload}`
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToDer(privateKeyPem),
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    encoder.encode(signingInput)
  )
  return `${signingInput}.${base64Url(new Uint8Array(signature))}`
}

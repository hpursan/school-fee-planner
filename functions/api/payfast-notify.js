import md5 from 'blueimp-md5'

/**
 * POST /api/payfast-notify
 *
 * PayFast Instant Transaction Notification (ITN) handler.
 * PayFast calls this server-to-server after a successful payment.
 *
 * Validates the signature, checks amount and status, then stores
 * the payment ref in KV so the frontend can verify it.
 *
 * KV binding required: PAYMENT_STORE
 * (Cloudflare Pages → Settings → Functions → KV namespace bindings)
 */
export async function onRequestPost(context) {
  const { request, env } = context

  let body
  try {
    body = await request.text()
  } catch {
    return new Response('Bad request', { status: 400 })
  }

  const params = Object.fromEntries(new URLSearchParams(body))

  // ── 1. Validate payment status ───────────────────────────────────────────
  if (params.payment_status !== 'COMPLETE') {
    console.log(`[ITN] Non-complete status: ${params.payment_status}`)
    return new Response('OK', { status: 200 }) // Always 200 to PayFast
  }

  // ── 2. Validate amount ───────────────────────────────────────────────────
  const amountGross = parseFloat(params.amount_gross ?? '0')
  if (amountGross < 69.00) {
    console.log(`[ITN] Invalid amount: ${amountGross}`)
    return new Response('OK', { status: 200 })
  }

  // ── 3. Validate signature ────────────────────────────────────────────────
  const isSandbox  = env.PAYFAST_SANDBOX === 'true'
  const passphrase = isSandbox ? 'jt7NOE43FZPn' : (env.PAYFAST_PASSPHRASE ?? '')

  const { signature: receivedSig, ...paramsWithoutSig } = params

  const signatureStr = Object.keys(paramsWithoutSig)
    .filter(k => paramsWithoutSig[k] !== '' && paramsWithoutSig[k] != null)
    .map(k => `${k}=${encodeURIComponent(String(paramsWithoutSig[k])).replace(/%20/g, '+')}`)
    .join('&')

  const toHash = passphrase
    ? `${signatureStr}&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, '+')}`
    : signatureStr

  const expectedSig = md5(toHash)

  if (expectedSig !== receivedSig) {
    console.log(`[ITN] Signature mismatch. Expected: ${expectedSig}, Got: ${receivedSig}`)
    return new Response('OK', { status: 200 })
  }

  // ── 4. Store verified payment ref in KV (TTL: 24 hours) ─────────────────
  const ref = params.m_payment_id
  if (ref && env.PAYMENT_STORE) {
    await env.PAYMENT_STORE.put(`payment:${ref}`, 'verified', {
      expirationTtl: 86400, // 24 hours
    })
    console.log(`[ITN] Payment verified and stored: ${ref}`)
  }

  return new Response('OK', { status: 200 })
}

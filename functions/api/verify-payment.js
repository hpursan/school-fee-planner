/**
 * GET /api/verify-payment?ref=<uuid>
 *
 * Checks whether the given payment ref has been verified by the
 * PayFast ITN handler and stored in KV.
 *
 * Returns: { verified: boolean }
 *
 * KV binding required: PAYMENT_STORE
 */
export async function onRequestGet(context) {
  const { request, env } = context
  const url = new URL(request.url)
  const ref = url.searchParams.get('ref')

  if (!ref) {
    return json({ verified: false, error: 'Missing ref' })
  }

  if (!env.PAYMENT_STORE) {
    // KV not bound — likely local dev without wrangler. Allow through for dev only.
    console.warn('[verify-payment] PAYMENT_STORE KV not bound')
    return json({ verified: env.PAYFAST_SANDBOX === 'true' })
  }

  const value = await env.PAYMENT_STORE.get(`payment:${ref}`)
  return json({ verified: value === 'verified' })
}

function json(data) {
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })
}

import md5 from 'blueimp-md5'

/**
 * GET /api/create-payment?ref=<uuid>
 *
 * Builds PayFast payment params + MD5 signature server-side so the
 * passphrase is never exposed in the client bundle.
 *
 * Environment variables (set in Cloudflare Pages → Settings → Env vars):
 *   PAYFAST_MERCHANT_ID   — from your PayFast dashboard
 *   PAYFAST_MERCHANT_KEY  — from your PayFast dashboard
 *   PAYFAST_PASSPHRASE    — set in PayFast dashboard under Settings (optional but recommended)
 *   PAYFAST_SANDBOX       — "true" for testing, "false" / unset for production
 *   SITE_URL              — "https://schoolfees.ashlunar.dev"
 */
export async function onRequestGet(context) {
  const { request, env } = context
  const url = new URL(request.url)
  const ref = url.searchParams.get('ref')

  if (!ref) {
    return json({ error: 'Missing ref' }, 400)
  }

  const isSandbox = env.PAYFAST_SANDBOX === 'true'

  // Use sandbox test credentials if in sandbox mode
  const merchantId  = isSandbox ? '10000100'        : (env.PAYFAST_MERCHANT_ID  ?? '')
  const merchantKey = isSandbox ? '46f0cd694581a'   : (env.PAYFAST_MERCHANT_KEY ?? '')
  const passphrase  = isSandbox ? 'jt7NOE43FZPn'    : (env.PAYFAST_PASSPHRASE   ?? '')
  const siteUrl     = env.SITE_URL ?? 'https://schoolfees.ashlunar.dev'
  const payfastUrl  = isSandbox
    ? 'https://sandbox.payfast.co.za/eng/process'
    : 'https://www.payfast.co.za/eng/process'

  const params = {
    merchant_id:      merchantId,
    merchant_key:     merchantKey,
    return_url:       `${siteUrl}/?payment=success&ref=${ref}`,
    cancel_url:       `${siteUrl}/?payment=cancelled`,
    notify_url:       `${siteUrl}/api/payfast-notify`,
    m_payment_id:     ref,
    amount:           '69.00',
    item_name:        'School Fee Planner SA - PDF Report',
    item_description: 'Personalised year-by-year school fee projection to matric',
  }

  const signature = buildSignature(params, passphrase)

  return json({ payfast_url: payfastUrl, params: { ...params, signature } })
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildSignature(params, passphrase = '') {
  const str = Object.keys(params)
    .filter(k => params[k] !== '' && params[k] != null)
    .map(k => `${k}=${encodeURIComponent(String(params[k])).replace(/%20/g, '+')}`)
    .join('&')

  const toHash = passphrase
    ? `${str}&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, '+')}`
    : str

  return md5(toHash)
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })
}

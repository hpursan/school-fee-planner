import { useState } from 'react'
import { trackEvent } from '../utils/analytics'

const PRICE      = 'R69'
const PRICE_NUM  = '69.00'

/**
 * PaymentModal
 *
 * 1. Shows what's included in the PDF report at R69
 * 2. Persists calculator inputs to sessionStorage so they survive the
 *    PayFast redirect round-trip
 * 3. Fetches PayFast params from /api/create-payment (keeps passphrase server-side)
 * 4. Submits a hidden POST form to PayFast
 */
export default function PaymentModal({ isOpen, onClose, inputs }) {
  const [status, setStatus] = useState('idle') // idle | loading | redirecting

  if (!isOpen) return null

  const handlePay = async () => {
    setStatus('loading')
    trackEvent('payment_initiated', { amount: PRICE_NUM })

    try {
      // Persist inputs so we can restore them after PayFast redirect
      sessionStorage.setItem('sfp_inputs', JSON.stringify(inputs))

      // Generate a unique payment reference
      const ref = crypto.randomUUID()
      sessionStorage.setItem('sfp_payment_ref', ref)

      // Get signed PayFast params from our Cloudflare Function
      const res = await fetch(`/api/create-payment?ref=${ref}`)
      if (!res.ok) throw new Error('Failed to create payment')
      const { payfast_url, params } = await res.json()

      setStatus('redirecting')

      // Build and auto-submit a hidden POST form to PayFast
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = payfast_url

      Object.entries(params).forEach(([key, value]) => {
        const input = document.createElement('input')
        input.type  = 'hidden'
        input.name  = key
        input.value = value
        form.appendChild(input)
      })

      document.body.appendChild(form)
      form.submit()

    } catch (err) {
      console.error('[PaymentModal]', err)
      setStatus('idle')
      alert('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>

        {/* Header */}
        <div className="modal-header">
          <div className="modal-icon">📄</div>
          <h2 className="modal-title">Your personalised PDF report</h2>
          <div className="modal-price">{PRICE}</div>
          <div className="modal-price-sub">one-time · instant download</div>
        </div>

        {/* Feature list */}
        <ul className="modal-features">
          <li>Year-by-year fee projection through to matric</li>
          <li>Monthly savings target with inflation modelling</li>
          <li>Shortfall / surplus analysis</li>
          <li>Printable A4 format — share with your partner or advisor</li>
          <li>Generated from your exact inputs</li>
        </ul>

        {/* CTA */}
        <button
          className="modal-pay-btn"
          onClick={handlePay}
          disabled={status !== 'idle'}
        >
          {status === 'idle'        && `Pay ${PRICE} with PayFast →`}
          {status === 'loading'     && 'Preparing payment…'}
          {status === 'redirecting' && 'Redirecting to PayFast…'}
        </button>

        <div className="modal-disclaimer">
          Secured by PayFast · South Africa's leading payment gateway · No card details stored
        </div>
      </div>
    </div>
  )
}

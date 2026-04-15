import { useState } from 'react'
import { formatRand } from '../utils/calculations'
import { SCHOOL_TYPES } from '../data/schoolData'
import { trackShare } from '../utils/analytics'
import AdvisorCTA from './AdvisorCTA'
import PaymentModal from './PaymentModal'

export default function ResultsPanel({ result, inputs }) {
  const [modalOpen, setModalOpen] = useState(false)

  if (!result) {
    return (
      <div className="results-card">
        <div className="no-result-state">
          Fill in your details on the left to see your personalised estimate.
        </div>
      </div>
    )
  }

  const isShortfall     = result.fundingGap > 0
  const schoolTypeLabel = SCHOOL_TYPES[inputs.schoolType]?.label ?? ''
  const tierLabel       = SCHOOL_TYPES[inputs.schoolType]?.tiers.find(t => t.id === inputs.tierId)?.label ?? ''

  return (
    <div className="results-panel animate-in">
      <div className="results-card">

        {/* ── Total cost header ── */}
        <div className="results-card-header">
          <div className="results-card-eyebrow">Estimated total cost to matric</div>
          <div className="results-card-total">{formatRand(result.totalCost)}</div>
          <div className="results-card-sub">
            Over {inputs.yearsToMatric} year{inputs.yearsToMatric !== 1 ? 's' : ''} · {schoolTypeLabel}
          </div>
        </div>

        {/* ── Metrics grid ── */}
        <div className="results-grid">
          <div className="results-metric">
            <div className="results-metric-label">Next year's fee</div>
            <div className="results-metric-value">{formatRand(result.nextYearFee)}</div>
          </div>
          <div className="results-metric">
            <div className="results-metric-label">Matric year fee</div>
            <div className="results-metric-value">{formatRand(result.matricFee)}</div>
          </div>
          <div className="results-metric">
            <div className="results-metric-label">Projected fund</div>
            <div className="results-metric-value">{formatRand(result.projectedFund)}</div>
          </div>
          <div className="results-metric">
            <div className="results-metric-label">Monthly needed</div>
            <div className="results-metric-value">{formatRand(result.requiredMonthly)}</div>
          </div>
        </div>

        {/* ── Shortfall / surplus banner ── */}
        <div className={`gap-banner ${isShortfall ? 'shortfall' : 'surplus'}`}>
          <div className="gap-banner-title">
            {isShortfall
              ? `⚠ Estimated shortfall: ${formatRand(result.fundingGap)}`
              : `✓ Estimated surplus: ${formatRand(Math.abs(result.fundingGap))}`}
          </div>
          <div className="gap-banner-sub">
            {isShortfall
              ? `At your current saving rate, you may fall short by ${formatRand(result.fundingGap)} by matric.`
              : `At your current saving rate, you're projected to be ahead by ${formatRand(Math.abs(result.fundingGap))}.`}
          </div>
        </div>

        {/* ── PDF upsell CTA ── */}
        <AdvisorCTA
          isShortfall={isShortfall}
          fundingGap={result.fundingGap}
          requiredMonthly={result.requiredMonthly}
          onBuyPDF={() => setModalOpen(true)}
        />

        {/* ── Monthly target ── */}
        <div className="monthly-target">
          <div className="monthly-target-label">Monthly savings target</div>
          <div className="monthly-target-amount">{formatRand(result.requiredMonthly)}</div>
          <div className="monthly-target-sub">
            {result.additionalMonthlyNeeded > 0
              ? `You need ${formatRand(result.additionalMonthlyNeeded)}/month more than you're currently saving`
              : `You're already saving enough – well done!`}
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="results-actions">
          <button className="btn-download-primary" onClick={() => setModalOpen(true)}>
            ↓ Download PDF Report — R69
          </button>
          <button
            className="btn-download"
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href).catch(() => {})
              alert('Link copied! Share this page with your partner or family.')
              trackShare()
            }}
          >
            Share this estimate
          </button>
        </div>
      </div>

      {/* ── Payment modal ── */}
      <PaymentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        inputs={inputs}
      />
    </div>
  )
}

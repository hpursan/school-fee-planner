import { formatRand } from '../utils/calculations'
import { generatePDF } from '../utils/pdfExport'
import { SCHOOL_TYPES } from '../data/schoolData'

export default function ResultsPanel({ result, inputs }) {
  if (!result) {
    return (
      <div className="results-card">
        <div className="no-result-state">
          Fill in your details on the left to see your personalised estimate.
        </div>
      </div>
    )
  }

  const isShortfall = result.fundingGap > 0
  const schoolTypeLabel = SCHOOL_TYPES[inputs.schoolType]?.label ?? ''
  const tierLabel = SCHOOL_TYPES[inputs.schoolType]?.tiers.find(t => t.id === inputs.tierId)?.label ?? ''
  const currentFee = inputs.useCustomFee
    ? inputs.customFee
    : (SCHOOL_TYPES[inputs.schoolType]?.tiers.find(t => t.id === inputs.tierId)?.midpoint ?? 0)

  const handleDownloadPDF = () => {
    generatePDF({
      scenario: {},
      result,
      inputs: {
        childAge: inputs.childAge,
        gradeLabel: inputs.gradeLabel,
        schoolTypeLabel,
        tierLabel,
        currentFee,
        feeInflation: inputs.feeInflation,
        investmentReturn: inputs.investmentReturn,
        currentSavings: inputs.currentSavings,
        monthlyContribution: inputs.monthlyContribution,
        yearsToMatric: inputs.yearsToMatric,
      },
    })
  }

  return (
    <div className="results-panel animate-in">
      <div className="results-card">
        <div className="results-card-header">
          <div className="results-card-eyebrow">Estimated total cost to matric</div>
          <div className="results-card-total">{formatRand(result.totalCost)}</div>
          <div className="results-card-sub">
            Over {inputs.yearsToMatric} year{inputs.yearsToMatric !== 1 ? 's' : ''} · {schoolTypeLabel}
          </div>
        </div>

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

        <div className="monthly-target">
          <div className="monthly-target-label">Monthly savings target</div>
          <div className="monthly-target-amount">{formatRand(result.requiredMonthly)}</div>
          <div className="monthly-target-sub">
            {result.additionalMonthlyNeeded > 0
              ? `You need ${formatRand(result.additionalMonthlyNeeded)}/month more than you're currently saving`
              : `You're already saving enough – well done!`}
          </div>
        </div>

        <div className="results-actions">
          <button className="btn-download-primary" onClick={handleDownloadPDF}>
            ↓ Download PDF Report
          </button>
          <button
            className="btn-download"
            onClick={() => {
              const url = window.location.href
              navigator.clipboard?.writeText(url).catch(() => {})
              alert('Link copied! Share this page with your partner or family.')
            }}
          >
            Share this estimate
          </button>
        </div>
      </div>
    </div>
  )
}

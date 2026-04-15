import { trackEvent } from '../utils/analytics'

/**
 * AdvisorCTA — PDF upsell card
 *
 * Shown below the shortfall/surplus banner. Promotes the paid PDF
 * report using the exact gap/monthly figures from the user's calculation.
 */
export default function AdvisorCTA({ isShortfall, fundingGap, requiredMonthly, onBuyPDF }) {
  const fmt = (n) => new Intl.NumberFormat('en-ZA', {
    style: 'currency', currency: 'ZAR', maximumFractionDigits: 0,
  }).format(Math.abs(n))

  const handleClick = () => {
    trackEvent('pdf_upsell_click', { context: isShortfall ? 'shortfall' : 'surplus' })
    onBuyPDF()
  }

  return (
    <div className="advisor-cta">
      <div className="advisor-cta-inner">
        <div className="advisor-cta-icon">📄</div>
        <div className="advisor-cta-content">
          {isShortfall ? (
            <>
              <div className="advisor-cta-heading">
                Get your full savings plan as a PDF
              </div>
              <div className="advisor-cta-body">
                You're facing a {fmt(fundingGap)} gap. Download your personalised
                year-by-year projection — printable, shareable with your partner
                or financial advisor, and based on your exact inputs.
              </div>
            </>
          ) : (
            <>
              <div className="advisor-cta-heading">
                You're on track — get it in writing
              </div>
              <div className="advisor-cta-body">
                Download your year-by-year projection as a PDF — ideal for sharing
                with your partner or reviewing with your financial advisor.
              </div>
            </>
          )}
          <button className="advisor-cta-btn" onClick={handleClick}>
            Download PDF report — R69 →
          </button>
          <div className="advisor-cta-disclaimer">
            One-time · Instant download · Secured by PayFast
          </div>
        </div>
      </div>
    </div>
  )
}

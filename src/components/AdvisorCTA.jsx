import { trackEvent } from '../utils/analytics'

/**
 * Monetization hook — affiliate referral to a registered financial advisor.
 *
 * SWAP THE LINK: Replace ADVISOR_URL with your affiliate/referral URL.
 * Good SA options: JustMoney, 22seven, 10X Investments, OUTvest, Sanlam BlueStarring.
 *
 * Shown below the shortfall/surplus banner when the calculator has a result.
 */

// ── Config — update this when you have your affiliate link ──────────────────
const ADVISOR_URL = 'https://www.justmoney.co.za/financial-advisors/'
const ADVISOR_DISCLAIMER = 'Fee-free consultation · Registered financial advisors · No obligation'
// ────────────────────────────────────────────────────────────────────────────

function trackAdvisorClick(context) {
  trackEvent('advisor_cta_click', { context })
}

export default function AdvisorCTA({ isShortfall, fundingGap, requiredMonthly }) {
  const formattedGap = new Intl.NumberFormat('en-ZA', {
    style: 'currency', currency: 'ZAR', maximumFractionDigits: 0,
  }).format(Math.abs(fundingGap))

  const formattedMonthly = new Intl.NumberFormat('en-ZA', {
    style: 'currency', currency: 'ZAR', maximumFractionDigits: 0,
  }).format(requiredMonthly)

  return (
    <div className="advisor-cta">
      <div className="advisor-cta-inner">
        <div className="advisor-cta-icon">💬</div>
        <div className="advisor-cta-content">
          {isShortfall ? (
            <>
              <div className="advisor-cta-heading">
                Want help closing this {formattedGap} gap?
              </div>
              <div className="advisor-cta-body">
                A registered financial advisor can build a savings plan around your exact situation —
                often finding ways to reach {formattedMonthly}/month through tax-efficient products
                like TFSAs, education policies, and unit trusts.
              </div>
            </>
          ) : (
            <>
              <div className="advisor-cta-heading">
                You're on track — keep it that way.
              </div>
              <div className="advisor-cta-body">
                A registered financial advisor can review your plan and make sure
                you're in the most tax-efficient products for the long haul.
              </div>
            </>
          )}
          <a
            href={ADVISOR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="advisor-cta-btn"
            onClick={() => trackAdvisorClick(isShortfall ? 'shortfall' : 'surplus')}
          >
            Get a free financial plan →
          </a>
          <div className="advisor-cta-disclaimer">{ADVISOR_DISCLAIMER}</div>
        </div>
      </div>
    </div>
  )
}

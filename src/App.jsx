import { useState, useEffect, useRef, useCallback } from 'react'
import CalculatorForm from './components/CalculatorForm'
import ResultsPanel from './components/ResultsPanel'
import { FeeGrowthChart, FundVsCostChart } from './components/Charts'
import ProjectionTable from './components/ProjectionTable'
import FAQ from './components/FAQ'
import { SCHOOL_TYPES, GRADE_FROM_AGE, DEFAULT_VALUES } from './data/schoolData'
import { calculateScenario } from './utils/calculations'
import { generatePDF } from './utils/pdfExport'
import { trackCalculate, trackPDFDownload, trackEvent } from './utils/analytics'
import './index.css'

function formatRandSimple(v) {
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 }).format(v)
}

const HERO_EXAMPLES = [
  { label: 'Public school, age 6', total: 320000, monthly: 1850, type: 'Public' },
  { label: 'Independent school, age 4', total: 1640000, monthly: 6200, type: 'Semi-Private' },
  { label: 'Private school, age 3', total: 4200000, monthly: 14800, type: 'Private' },
]

export default function App() {
  const calcRef = useRef(null)

  const [inputs, setInputs] = useState(() => {
    // Restore inputs if returning from a PayFast payment redirect
    const saved = sessionStorage.getItem('sfp_inputs')
    if (saved) {
      try { return JSON.parse(saved) } catch { /* ignore */ }
    }
    const { grade, yearsToMatric } = GRADE_FROM_AGE(DEFAULT_VALUES.childAge)
    return { ...DEFAULT_VALUES, gradeLabel: grade, yearsToMatric }
  })

  const [result, setResult]               = useState(null)
  const [paymentStatus, setPaymentStatus] = useState(null) // null | 'verifying' | 'success' | 'cancelled' | 'failed'

  // ── Handle return from PayFast ───────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const payment = params.get('payment')
    const ref     = params.get('ref') ?? sessionStorage.getItem('sfp_payment_ref')

    if (!payment) return

    // Clean URL without reloading
    window.history.replaceState({}, '', window.location.pathname)

    if (payment === 'cancelled') {
      setPaymentStatus('cancelled')
      setTimeout(() => setPaymentStatus(null), 4000)
      return
    }

    if (payment === 'success' && ref) {
      setPaymentStatus('verifying')
      verifyAndDownload(ref)
    }
  }, [])

  const verifyAndDownload = useCallback(async (ref) => {
    const MAX_ATTEMPTS = 6
    const DELAY_MS     = 2000

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const res  = await fetch(`/api/verify-payment?ref=${ref}`)
        const data = await res.json()

        if (data.verified) {
          setPaymentStatus('success')
          sessionStorage.removeItem('sfp_payment_ref')
          sessionStorage.removeItem('sfp_inputs')

          // Scroll to calculator and trigger PDF download
          calcRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

          // Small delay to let the scroll settle before PDF generates
          setTimeout(() => {
            triggerPDFDownload()
            trackEvent('payment_completed', { ref })
            trackPDFDownload({ schoolType: inputs.schoolType, totalCost: result?.totalCost ?? 0 })
          }, 800)

          setTimeout(() => setPaymentStatus(null), 6000)
          return
        }
      } catch { /* network error — retry */ }

      if (attempt < MAX_ATTEMPTS) {
        await new Promise(r => setTimeout(r, DELAY_MS))
      }
    }

    // All attempts exhausted
    setPaymentStatus('failed')
    setTimeout(() => setPaymentStatus(null), 6000)
  }, [inputs, result])

  const triggerPDFDownload = useCallback(() => {
    if (!result) return
    const schoolTypeLabel = SCHOOL_TYPES[inputs.schoolType]?.label ?? ''
    const tierLabel       = SCHOOL_TYPES[inputs.schoolType]?.tiers.find(t => t.id === inputs.tierId)?.label ?? ''
    const tier            = SCHOOL_TYPES[inputs.schoolType]?.tiers.find(t => t.id === inputs.tierId)
    const currentFee      = inputs.useCustomFee ? inputs.customFee : (tier?.midpoint ?? 0)

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
  }, [inputs, result])

  const handleChange = (patch) => {
    setInputs(prev => {
      const next = { ...prev, ...patch }
      // Recalculate grade/years if age changed
      if (patch.childAge !== undefined) {
        const { grade, yearsToMatric } = GRADE_FROM_AGE(patch.childAge)
        next.gradeLabel = grade
        next.yearsToMatric = yearsToMatric
      }
      return next
    })
  }

  // Recalculate on any input change
  useEffect(() => {
    const schoolType = SCHOOL_TYPES[inputs.schoolType]
    const tier = schoolType?.tiers.find(t => t.id === inputs.tierId)
    const currentFee = inputs.useCustomFee ? inputs.customFee : (tier?.midpoint ?? 0)

    if (inputs.yearsToMatric <= 0 || currentFee <= 0) {
      setResult(null)
      return
    }

    const r = calculateScenario({
      currentFee,
      feeInflationPct: inputs.feeInflation,
      investmentReturnPct: inputs.investmentReturn,
      currentSavings: inputs.currentSavings,
      monthlyContribution: inputs.monthlyContribution,
      yearsToMatric: inputs.yearsToMatric,
    })
    setResult(r)
    trackCalculate({
      schoolType: inputs.schoolType,
      tierId: inputs.tierId,
      yearsToMatric: inputs.yearsToMatric,
    })
  }, [inputs])

  const scrollToCalc = () => {
    calcRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      {/* ── Navbar ── */}
      <nav className="navbar">
        <div className="container navbar-inner">
          <a href="#" className="navbar-logo">
            School Fee Planner <span>SA</span>
          </a>
          <button className="navbar-cta" onClick={scrollToCalc}>Calculate now</button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero">
        <div className="container hero-inner">
          <div>
            <div className="hero-badge">Built for South African Parents</div>
            <h1>
              Plan for your child's school fees <em>before</em> they become overwhelming.
            </h1>
            <p className="hero-sub">
              See what schooling could cost to matric, how fees may rise every year, and what you should save monthly to stay ahead.
            </p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={scrollToCalc}>Calculate my estimate →</button>
              <a href="#how-it-works" className="btn-secondary">How it works</a>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-number">8%</div>
                <div className="hero-stat-label">Avg annual fee rise</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-number">13 yrs</div>
                <div className="hero-stat-label">From Grade R to matric</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-number">3 min</div>
                <div className="hero-stat-label">To get your estimate</div>
              </div>
            </div>
          </div>

          <div className="hero-card">
            <div className="hero-card-label">Example projections</div>
            {HERO_EXAMPLES.map((ex, i) => (
              <div className="hero-card-example" key={i}>
                <div className="hero-card-row">
                  <span className="hero-card-title">{ex.label}</span>
                  <span className="hero-card-value">{formatRandSimple(ex.total)}</span>
                </div>
                <div className="hero-card-sub">Save approx {formatRandSimple(ex.monthly)}/month</div>
              </div>
            ))}
            <div style={{ marginTop: 16, fontSize: 11, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>
              Estimates only. Assumes 8% fee inflation, 8% return, saving from today.
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="section section-alt" id="how-it-works">
        <div className="container">
          <div className="section-eyebrow">Simple by design</div>
          <h2 className="section-title">How it works</h2>
          <p className="section-sub">No advisor call needed. No signup required. Just your details and a few assumptions.</p>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-num">1</div>
              <div className="step-title">Enter your child's age and school type</div>
              <p className="step-desc">Choose between public, independent, or private school. Use our fee tiers or enter your actual annual fee.</p>
            </div>
            <div className="step-card">
              <div className="step-num">2</div>
              <div className="step-title">Set your assumptions</div>
              <p className="step-desc">Adjust fee inflation (default 8%), expected investment return, and any savings you already have set aside.</p>
            </div>
            <div className="step-card">
              <div className="step-num">3</div>
              <div className="step-title">Get your personalised estimate</div>
              <p className="step-desc">See the total cost to matric, how much to save monthly, and whether you're currently on track.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Payment status banner ── */}
      {paymentStatus && (
        <div className={`payment-banner payment-banner--${paymentStatus}`}>
          {paymentStatus === 'verifying' && '⏳ Verifying your payment — your PDF will download automatically…'}
          {paymentStatus === 'success'   && '✅ Payment confirmed! Your PDF is downloading now.'}
          {paymentStatus === 'cancelled' && '↩ Payment cancelled — no charge was made.'}
          {paymentStatus === 'failed'    && '⚠ Could not verify payment. Please contact support@ashlunar.dev'}
        </div>
      )}

      {/* ── Calculator ── */}
      <section className="section" id="calculator" ref={calcRef}>
        <div className="container">
          <div className="section-eyebrow">Your estimate</div>
          <h2 className="section-title">School Fee Calculator</h2>
          <p className="section-sub">
            All figures are estimates for planning purposes. Adjust any input and results update instantly.
          </p>
          <div className="calc-layout">
            <CalculatorForm inputs={inputs} onChange={handleChange} />
            <ResultsPanel result={result} inputs={inputs} />
          </div>

          {/* Charts and table below the calc */}
          {result && (
            <div className="charts-section animate-in">
              <FeeGrowthChart projection={result.annualProjection} />
              <FundVsCostChart fundBalanceProjection={result.fundBalanceProjection} />
              <ProjectionTable projection={result.annualProjection} />
            </div>
          )}
        </div>
      </section>

      {/* ── Disclaimer ── */}
      <div className="disclaimer-band">
        <p className="disclaimer-text">
          <strong>Estimates only.</strong> All figures are based on planning assumptions and user inputs. Actual fees vary by school, grade, year, province, levies, and optional activities. This tool is not financial advice. Always confirm fees directly with your school and consult a registered financial advisor for personalised planning.
        </p>
      </div>

      {/* ── FAQ ── */}
      <section className="section section-alt" id="faq">
        <div className="container">
          <div className="section-eyebrow">Common questions</div>
          <h2 className="section-title">FAQ</h2>
          <p className="section-sub">Answers to the questions parents usually ask.</p>
          <FAQ />
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section" style={{ background: 'var(--navy-dark)', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ color: '#fff', marginBottom: 14 }}>Start planning today</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 36, maxWidth: 480, margin: '0 auto 36px' }}>
            Takes 3 minutes. No signup required. Download your PDF report when you're done.
          </p>
          <button className="btn-primary" onClick={scrollToCalc} style={{ fontSize: '1.05rem', padding: '16px 40px' }}>
            Calculate my estimate →
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="container">
          <div className="footer-inner">
            <div className="footer-logo">School Fee Planner <span>SA</span></div>
            <div className="footer-links">
              <a href="#calculator">Calculator</a>
              <a href="#how-it-works">How it works</a>
              <a href="#faq">FAQ</a>
            </div>
          </div>
          <p className="footer-copy">
            © {new Date().getFullYear()} School Fee Planner SA · Estimates only, not financial advice · Built for South African parents
          </p>
        </div>
      </footer>
    </>
  )
}

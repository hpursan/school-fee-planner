import { useState } from 'react'
import { SCHOOL_TYPES, DEFAULT_VALUES } from '../data/schoolData'
import { formatRand } from '../utils/calculations'
import { trackSchoolTypeChange } from '../utils/analytics'

function RangeInput({ min, max, step = 1, value, onChange, prefix = '', suffix = '' }) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="range-group">
      <input
        type="range"
        className="range-input"
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ '--pct': `${pct}%` }}
      />
      <span className="range-value">{prefix}{value}{suffix}</span>
    </div>
  )
}

export default function CalculatorForm({ inputs, onChange }) {
  const [showCustomFee, setShowCustomFee] = useState(inputs.useCustomFee)
  const schoolType = SCHOOL_TYPES[inputs.schoolType]
  const selectedTier = schoolType?.tiers.find(t => t.id === inputs.tierId)

  const handleSchoolType = (type) => {
    const defaultTier = SCHOOL_TYPES[type].tiers[1] // default to mid tier
    onChange({
      schoolType: type,
      tierId: defaultTier.id,
      customFee: defaultTier.midpoint,
      useCustomFee: false,
    })
    setShowCustomFee(false)
    trackSchoolTypeChange(type)
  }

  const handleTier = (tier) => {
    onChange({ tierId: tier.id, customFee: tier.midpoint, useCustomFee: false })
    setShowCustomFee(false)
  }

  const handleToggleCustomFee = () => {
    const next = !showCustomFee
    setShowCustomFee(next)
    onChange({ useCustomFee: next })
  }

  const currentFee = inputs.useCustomFee ? inputs.customFee : (selectedTier?.midpoint ?? 0)

  return (
    <div className="calc-form-card">
      {/* ── Child Details ── */}
      <div className="calc-section-title">Child Details</div>

      <div className="form-group">
        <label className="form-label">Child's current age</label>
        <RangeInput min={0} max={17} value={inputs.childAge} onChange={v => onChange({ childAge: v })} suffix=" yrs" />
        <div className="form-hint">
          Age {inputs.childAge} → approx {inputs.gradeLabel}
          {inputs.yearsToMatric > 0 ? ` · ${inputs.yearsToMatric} year${inputs.yearsToMatric !== 1 ? 's' : ''} to matric` : ' · Already matriculated'}
        </div>
      </div>

      {/* ── School Type ── */}
      <div className="calc-section-title">School Type</div>

      <div className="form-group">
        <label className="form-label">Which type of school?</label>
        <div className="school-type-grid">
          {Object.entries(SCHOOL_TYPES).map(([key, st]) => (
            <button
              key={key}
              className={`school-type-btn ${inputs.schoolType === key ? 'active' : ''}`}
              onClick={() => handleSchoolType(key)}
              style={{ borderColor: inputs.schoolType === key ? st.color : undefined }}
            >
              <span className="school-type-btn-label">{st.label}</span>
              <span className="school-type-btn-sub">{st.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Fee tier</label>
        <div className="tier-grid">
          {schoolType?.tiers.map(tier => (
            <button
              key={tier.id}
              className={`tier-btn ${inputs.tierId === tier.id && !showCustomFee ? 'active' : ''}`}
              onClick={() => handleTier(tier)}
            >
              <div>
                <div className="tier-btn-label">{tier.label}</div>
                <div className="tier-btn-range">{tier.description}</div>
              </div>
              <div className="tier-btn-range">
                {tier.low === 0 ? 'Free – ' : `${formatRand(tier.low, true)} – `}{formatRand(tier.high, true)}/yr
              </div>
            </button>
          ))}
        </div>

        <button className="toggle-custom-fee" onClick={handleToggleCustomFee}>
          {showCustomFee ? '↩ Use tier estimate' : '✏ Enter my actual fee'}
        </button>

        {showCustomFee && (
          <div className="form-group mt-4">
            <label className="form-label">Current annual school fee (R)</label>
            <div className="form-input-prefix">
              <input
                type="number"
                className="form-input"
                value={inputs.customFee}
                min={0}
                step={1000}
                onChange={e => onChange({ customFee: Number(e.target.value) })}
              />
            </div>
            <div className="form-hint">Total annual fee including levies, if known</div>
          </div>
        )}

        {!showCustomFee && selectedTier && (
          <div className="form-hint mt-4">
            Using midpoint estimate: <strong>{formatRand(selectedTier.midpoint)}/year</strong>
          </div>
        )}
      </div>

      {/* ── Fee Assumptions ── */}
      <div className="calc-section-title">Fee Assumptions</div>

      <div className="form-group">
        <label className="form-label">Annual fee inflation</label>
        <RangeInput min={4} max={15} value={inputs.feeInflation} onChange={v => onChange({ feeInflation: v })} suffix="%" />
        <div className="form-hint">SA school fees have historically risen 6–10% per year. Default: 8%</div>
      </div>

      <div className="form-group">
        <label className="form-label">Expected return on savings</label>
        <RangeInput min={4} max={14} value={inputs.investmentReturn} onChange={v => onChange({ investmentReturn: v })} suffix="%" />
        <div className="form-hint">Nominal annual return on your education savings or investment. Default: 8%</div>
      </div>

      {/* ── Savings ── */}
      <div className="calc-section-title">Current Savings (optional)</div>

      <div className="form-group">
        <label className="form-label">Existing education savings</label>
        <div className="form-input-prefix">
          <input
            type="number"
            className="form-input"
            value={inputs.currentSavings}
            min={0}
            step={5000}
            onChange={e => onChange({ currentSavings: Number(e.target.value) })}
          />
        </div>
        <div className="form-hint">Any amount already set aside for education (education policy, TFSA, savings account, etc.)</div>
      </div>

      <div className="form-group">
        <label className="form-label">Current monthly contribution</label>
        <div className="form-input-prefix">
          <input
            type="number"
            className="form-input"
            value={inputs.monthlyContribution}
            min={0}
            step={100}
            onChange={e => onChange({ monthlyContribution: Number(e.target.value) })}
          />
        </div>
        <div className="form-hint">What you're already saving each month towards school fees</div>
      </div>
    </div>
  )
}

import { describe, it, expect } from 'vitest'
import {
  projectAnnualFees,
  totalCostToMatric,
  futureValueLumpSum,
  futureValueMonthlyContributions,
  requiredMonthlySavings,
  calculateScenario,
  formatRand,
} from '../calculations'

// ── projectAnnualFees ────────────────────────────────────────────────────────

describe('projectAnnualFees', () => {
  it('returns correct number of years', () => {
    const result = projectAnnualFees(10000, 8, 5)
    expect(result).toHaveLength(5)
  })

  it('first year fee equals current fee (no inflation applied yet)', () => {
    const result = projectAnnualFees(10000, 8, 3)
    expect(result[0].fee).toBe(10000)
  })

  it('compounds fee inflation correctly year over year', () => {
    const result = projectAnnualFees(10000, 10, 3)
    // Year 0: 10000, Year 1: 11000, Year 2: 12100
    expect(result[0].fee).toBe(10000)
    expect(result[1].fee).toBe(11000)
    expect(result[2].fee).toBe(12100)
  })

  it('feeMonthly is fee divided by 12 (rounded)', () => {
    const result = projectAnnualFees(12000, 0, 1)
    expect(result[0].feeMonthly).toBe(1000)
  })

  it('yearIndex increments from 0', () => {
    const result = projectAnnualFees(10000, 8, 3)
    expect(result[0].yearIndex).toBe(0)
    expect(result[1].yearIndex).toBe(1)
    expect(result[2].yearIndex).toBe(2)
  })

  it('returns empty array for 0 years', () => {
    expect(projectAnnualFees(10000, 8, 0)).toHaveLength(0)
  })

  it('handles 0% inflation — fee stays flat', () => {
    const result = projectAnnualFees(50000, 0, 4)
    result.forEach(r => expect(r.fee).toBe(50000))
  })
})

// ── totalCostToMatric ────────────────────────────────────────────────────────

describe('totalCostToMatric', () => {
  it('sums all annual fees', () => {
    const projection = [
      { fee: 10000 },
      { fee: 11000 },
      { fee: 12100 },
    ]
    expect(totalCostToMatric(projection)).toBe(33100)
  })

  it('returns 0 for empty projection', () => {
    expect(totalCostToMatric([])).toBe(0)
  })

  it('handles single year', () => {
    expect(totalCostToMatric([{ fee: 72000 }])).toBe(72000)
  })
})

// ── futureValueLumpSum ───────────────────────────────────────────────────────

describe('futureValueLumpSum', () => {
  it('doubles at 100% return over 1 year', () => {
    expect(futureValueLumpSum(1000, 100, 1)).toBeCloseTo(2000)
  })

  it('returns principal unchanged at 0% return', () => {
    expect(futureValueLumpSum(50000, 0, 10)).toBeCloseTo(50000)
  })

  it('returns 0 for 0 principal', () => {
    expect(futureValueLumpSum(0, 10, 5)).toBe(0)
  })

  it('calculates correctly for typical SA scenario (8% over 10 years)', () => {
    const fv = futureValueLumpSum(100000, 8, 10)
    // 100000 * 1.08^10 ≈ 215892
    expect(fv).toBeCloseTo(215892, -1)
  })
})

// ── futureValueMonthlyContributions ─────────────────────────────────────────

describe('futureValueMonthlyContributions', () => {
  it('returns 0 for zero contribution', () => {
    expect(futureValueMonthlyContributions(0, 8, 10)).toBe(0)
  })

  it('returns simple sum at 0% return', () => {
    // 500/month for 2 years = 12000
    expect(futureValueMonthlyContributions(500, 0, 2)).toBeCloseTo(12000)
  })

  it('returns more than simple sum with positive return', () => {
    const withReturn = futureValueMonthlyContributions(1000, 8, 10)
    const noReturn = 1000 * 12 * 10
    expect(withReturn).toBeGreaterThan(noReturn)
  })

  it('calculates annuity correctly for 1 year at 12% (easy monthly rate of 1%)', () => {
    // PMT=1000, r=1%/month, n=12: FV = 1000 * ((1.01^12 - 1) / 0.01) ≈ 12682.5
    const fv = futureValueMonthlyContributions(1000, 12, 1)
    expect(fv).toBeCloseTo(12682.5, 0)
  })
})

// ── requiredMonthlySavings ───────────────────────────────────────────────────

describe('requiredMonthlySavings', () => {
  it('returns 0 for 0 years', () => {
    expect(requiredMonthlySavings(100000, 8, 0)).toBe(0)
  })

  it('divides evenly at 0% return', () => {
    // R120000 over 10 years = R1000/month
    expect(requiredMonthlySavings(120000, 0, 10)).toBeCloseTo(1000)
  })

  it('requires less per month with higher return', () => {
    const lowReturn = requiredMonthlySavings(500000, 2, 10)
    const highReturn = requiredMonthlySavings(500000, 12, 10)
    expect(highReturn).toBeLessThan(lowReturn)
  })

  it('requires less per month with more years', () => {
    const fewYears = requiredMonthlySavings(500000, 8, 5)
    const manyYears = requiredMonthlySavings(500000, 8, 15)
    expect(manyYears).toBeLessThan(fewYears)
  })
})

// ── calculateScenario ────────────────────────────────────────────────────────

describe('calculateScenario', () => {
  const baseInputs = {
    currentFee: 72000,
    feeInflationPct: 8,
    investmentReturnPct: 8,
    currentSavings: 0,
    monthlyContribution: 0,
    yearsToMatric: 10,
  }

  it('returns null when yearsToMatric is 0', () => {
    expect(calculateScenario({ ...baseInputs, yearsToMatric: 0 })).toBeNull()
  })

  it('returns null when yearsToMatric is negative', () => {
    expect(calculateScenario({ ...baseInputs, yearsToMatric: -1 })).toBeNull()
  })

  it('returns all expected keys', () => {
    const result = calculateScenario(baseInputs)
    expect(result).toHaveProperty('annualProjection')
    expect(result).toHaveProperty('totalCost')
    expect(result).toHaveProperty('fvLumpSum')
    expect(result).toHaveProperty('fvContributions')
    expect(result).toHaveProperty('projectedFund')
    expect(result).toHaveProperty('fundingGap')
    expect(result).toHaveProperty('requiredMonthly')
    expect(result).toHaveProperty('additionalMonthlyNeeded')
    expect(result).toHaveProperty('fundBalanceProjection')
    expect(result).toHaveProperty('matricFee')
    expect(result).toHaveProperty('nextYearFee')
  })

  it('annualProjection has correct length', () => {
    const result = calculateScenario(baseInputs)
    expect(result.annualProjection).toHaveLength(10)
  })

  it('shows shortfall when no savings and no contributions', () => {
    const result = calculateScenario(baseInputs)
    expect(result.fundingGap).toBeGreaterThan(0)
  })

  it('shows surplus when savings fully cover costs', () => {
    const result = calculateScenario({
      ...baseInputs,
      currentSavings: 10_000_000, // R10m — clearly enough
    })
    expect(result.fundingGap).toBeLessThan(0)
  })

  it('projectedFund equals fvLumpSum + fvContributions', () => {
    const result = calculateScenario({ ...baseInputs, currentSavings: 50000, monthlyContribution: 2000 })
    expect(result.projectedFund).toBeCloseTo(result.fvLumpSum + result.fvContributions, 0)
  })

  it('additionalMonthlyNeeded is 0 when already saving enough', () => {
    const result = calculateScenario({
      ...baseInputs,
      currentSavings: 10_000_000,
    })
    expect(result.additionalMonthlyNeeded).toBe(0)
  })

  it('matricFee is the last year fee in the projection', () => {
    const result = calculateScenario(baseInputs)
    const lastYearFee = result.annualProjection[result.annualProjection.length - 1].fee
    expect(result.matricFee).toBe(lastYearFee)
  })

  it('nextYearFee is the second year fee (index 1)', () => {
    const result = calculateScenario(baseInputs)
    expect(result.nextYearFee).toBe(result.annualProjection[1].fee)
  })

  it('fundBalanceProjection has correct length', () => {
    const result = calculateScenario(baseInputs)
    expect(result.fundBalanceProjection).toHaveLength(10)
  })

  it('totalCost equals sum of all annual fees', () => {
    const result = calculateScenario(baseInputs)
    const summedFees = result.annualProjection.reduce((s, y) => s + y.fee, 0)
    expect(result.totalCost).toBe(summedFees)
  })
})

// ── formatRand ───────────────────────────────────────────────────────────────

describe('formatRand', () => {
  it('formats zero correctly', () => {
    expect(formatRand(0)).toContain('R')
  })

  it('formats standard amount with ZAR currency', () => {
    const formatted = formatRand(72000)
    expect(formatted).toMatch(/R/)
    expect(formatted).toMatch(/72/)
  })

  it('compact mode: uses "m" suffix for millions', () => {
    expect(formatRand(1_500_000, true)).toBe('R1.5m')
  })

  it('compact mode: uses "k" suffix for thousands', () => {
    expect(formatRand(72000, true)).toBe('R72k')
  })

  it('compact mode: uses "m" for exactly 1 million', () => {
    expect(formatRand(1_000_000, true)).toBe('R1.0m')
  })

  it('compact mode: formats small values without suffix', () => {
    expect(formatRand(500, true)).toMatch(/R/)
  })

  it('handles negative values in compact mode', () => {
    expect(formatRand(-2_000_000, true)).toBe('R-2.0m')
  })
})

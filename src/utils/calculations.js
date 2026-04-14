/**
 * Core calculation engine for School Fee Planner SA
 * All financial calculations for projecting school fees and savings
 */

/**
 * Projects annual fees from current year through matric
 */
export function projectAnnualFees(currentFee, feeInflationPct, yearsToMatric) {
  const inflation = feeInflationPct / 100
  const projection = []
  const currentYear = new Date().getFullYear()

  for (let year = 0; year < yearsToMatric; year++) {
    const projectedFee = currentFee * Math.pow(1 + inflation, year)
    projection.push({
      year: currentYear + year,
      yearIndex: year,
      fee: Math.round(projectedFee),
      feeMonthly: Math.round(projectedFee / 12),
    })
  }

  return projection
}

/**
 * Calculate total cost to matric (sum of all projected annual fees)
 */
export function totalCostToMatric(projection) {
  return projection.reduce((sum, y) => sum + y.fee, 0)
}

/**
 * Future value of a lump sum
 * FV = PV × (1 + r)^n  (annual compounding, monthly r = annual/12)
 */
export function futureValueLumpSum(presentValue, annualReturnPct, years) {
  const r = annualReturnPct / 100
  return presentValue * Math.pow(1 + r, years)
}

/**
 * Future value of regular monthly contributions (annuity)
 * FV = PMT × [((1 + r)^n - 1) / r]
 * where r = monthly rate, n = total months
 */
export function futureValueMonthlyContributions(monthlyContribution, annualReturnPct, years) {
  if (monthlyContribution === 0) return 0
  const monthlyRate = annualReturnPct / 100 / 12
  const n = years * 12
  if (monthlyRate === 0) return monthlyContribution * n
  return monthlyContribution * ((Math.pow(1 + monthlyRate, n) - 1) / monthlyRate)
}

/**
 * Required monthly savings to reach a future value target
 * PMT = FV × r / ((1 + r)^n - 1)
 */
export function requiredMonthlySavings(targetFV, annualReturnPct, years) {
  if (years <= 0) return 0
  const monthlyRate = annualReturnPct / 100 / 12
  const n = years * 12
  if (monthlyRate === 0) return targetFV / n
  return targetFV * monthlyRate / (Math.pow(1 + monthlyRate, n) - 1)
}

/**
 * Full calculation result for a given scenario
 */
export function calculateScenario({
  currentFee,
  feeInflationPct,
  investmentReturnPct,
  currentSavings,
  monthlyContribution,
  yearsToMatric,
}) {
  if (yearsToMatric <= 0) {
    return null
  }

  // Project all annual fees
  const annualProjection = projectAnnualFees(currentFee, feeInflationPct, yearsToMatric)

  // Total cost
  const totalCost = totalCostToMatric(annualProjection)

  // What current savings will grow to
  const fvLumpSum = futureValueLumpSum(currentSavings, investmentReturnPct, yearsToMatric)

  // What current monthly contributions will grow to
  const fvContributions = futureValueMonthlyContributions(monthlyContribution, investmentReturnPct, yearsToMatric)

  // Total projected fund at matric
  const projectedFund = fvLumpSum + fvContributions

  // Gap (positive = shortfall, negative = surplus)
  const fundingGap = totalCost - projectedFund

  // Required monthly savings to fully fund (ignoring existing contributions)
  const requiredMonthly = requiredMonthlySavings(
    Math.max(0, totalCost - fvLumpSum),
    investmentReturnPct,
    yearsToMatric
  )

  // Additional monthly needed on top of current contributions
  const additionalMonthlyNeeded = Math.max(0, requiredMonthly - monthlyContribution)

  // Build a year-by-year fund balance projection
  const fundBalanceProjection = buildFundBalanceProjection({
    currentSavings,
    monthlyContribution,
    investmentReturnPct,
    annualProjection,
    yearsToMatric,
  })

  return {
    annualProjection,
    totalCost,
    fvLumpSum,
    fvContributions,
    projectedFund,
    fundingGap,
    requiredMonthly,
    additionalMonthlyNeeded,
    fundBalanceProjection,
    matricFee: annualProjection[annualProjection.length - 1]?.fee ?? currentFee,
    nextYearFee: annualProjection[1]?.fee ?? annualProjection[0]?.fee ?? currentFee,
  }
}

/**
 * Build year-by-year fund balance alongside fee obligations
 */
function buildFundBalanceProjection({
  currentSavings,
  monthlyContribution,
  investmentReturnPct,
  annualProjection,
  yearsToMatric,
}) {
  const monthlyRate = investmentReturnPct / 100 / 12
  let balance = currentSavings
  const result = []

  for (let year = 0; year < yearsToMatric; year++) {
    // Grow balance for 12 months with monthly contributions
    for (let m = 0; m < 12; m++) {
      balance = balance * (1 + monthlyRate) + monthlyContribution
    }
    result.push({
      year: annualProjection[year]?.year,
      yearIndex: year,
      fundBalance: Math.round(balance),
      cumulativeFees: annualProjection
        .slice(0, year + 1)
        .reduce((s, y) => s + y.fee, 0),
      annualFee: annualProjection[year]?.fee ?? 0,
    })
  }

  return result
}

export function formatRand(value, compact = false) {
  if (compact && Math.abs(value) >= 1_000_000) {
    return `R${(value / 1_000_000).toFixed(1)}m`
  }
  if (compact && Math.abs(value) >= 1_000) {
    return `R${(value / 1_000).toFixed(0)}k`
  }
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    maximumFractionDigits: 0,
  }).format(value)
}

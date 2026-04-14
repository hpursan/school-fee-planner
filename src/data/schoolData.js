// South African school fee tiers (annual, in Rands)
// Based on publicly available ranges as of 2024-2025
// All figures are estimates for planning purposes only

export const SCHOOL_TYPES = {
  public: {
    label: 'Public School',
    description: 'Government school, fee-paying (Quintile 1–5)',
    color: '#2D6A4F',
    tiers: [
      { id: 'public_low', label: 'No-fee / Low-fee', low: 0, high: 3000, midpoint: 1500, description: 'No-fee schools or very low levy' },
      { id: 'public_mid', label: 'Mid-range public', low: 3000, high: 12000, midpoint: 7000, description: 'Typical suburban public school' },
      { id: 'public_high', label: 'Upper public', low: 12000, high: 30000, midpoint: 20000, description: 'Top public schools, high levies' },
    ],
  },
  semi_private: {
    label: 'Independent / Semi-Private',
    description: 'Registered independent school, mid-range fees',
    color: '#1B4965',
    tiers: [
      { id: 'indep_low', label: 'Lower independent', low: 30000, high: 55000, midpoint: 42000, description: 'Affordable independent school' },
      { id: 'indep_mid', label: 'Mid independent', low: 55000, high: 90000, midpoint: 72000, description: 'Established independent school' },
      { id: 'indep_high', label: 'Upper independent', low: 90000, high: 140000, midpoint: 115000, description: 'Premium independent school' },
    ],
  },
  private: {
    label: 'Private School',
    description: 'Full private, often IEB or international curriculum',
    color: '#7B2D8B',
    tiers: [
      { id: 'private_low', label: 'Lower private', low: 100000, high: 160000, midpoint: 130000, description: 'Entry-level private school' },
      { id: 'private_mid', label: 'Mid private', low: 160000, high: 240000, midpoint: 200000, description: 'Established private school' },
      { id: 'private_premium', label: 'Premium private', low: 240000, high: 380000, midpoint: 310000, description: 'Top-tier / international school' },
    ],
  },
}

export const GRADE_FROM_AGE = (age) => {
  // Approximate grade from age (South African system)
  // Grade R at age 5-6, Grade 1 at 6-7, Matric (Grade 12) at 17-18
  if (age < 3) return { grade: 'Pre-school', yearsToMatric: 18 - age }
  if (age === 3) return { grade: 'Nursery', yearsToMatric: 15 }
  if (age === 4) return { grade: 'Pre-Grade R', yearsToMatric: 14 }
  if (age === 5) return { grade: 'Grade R', yearsToMatric: 13 }
  if (age === 6) return { grade: 'Grade 1', yearsToMatric: 12 }
  if (age === 7) return { grade: 'Grade 2', yearsToMatric: 11 }
  if (age === 8) return { grade: 'Grade 3', yearsToMatric: 10 }
  if (age === 9) return { grade: 'Grade 4', yearsToMatric: 9 }
  if (age === 10) return { grade: 'Grade 5', yearsToMatric: 8 }
  if (age === 11) return { grade: 'Grade 6', yearsToMatric: 7 }
  if (age === 12) return { grade: 'Grade 7', yearsToMatric: 6 }
  if (age === 13) return { grade: 'Grade 8', yearsToMatric: 5 }
  if (age === 14) return { grade: 'Grade 9', yearsToMatric: 4 }
  if (age === 15) return { grade: 'Grade 10', yearsToMatric: 3 }
  if (age === 16) return { grade: 'Grade 11', yearsToMatric: 2 }
  if (age === 17) return { grade: 'Grade 12 (Matric)', yearsToMatric: 1 }
  return { grade: 'Post-matric', yearsToMatric: 0 }
}

export const SCHOOL_PHASES = [
  { label: 'Foundation Phase', grades: 'Grade R – 3', ages: '5–8' },
  { label: 'Intermediate Phase', grades: 'Grade 4 – 6', ages: '9–11' },
  { label: 'Senior Phase', grades: 'Grade 7 – 9', ages: '12–14' },
  { label: 'FET Phase', grades: 'Grade 10 – 12', ages: '15–17' },
]

export const DEFAULT_VALUES = {
  childAge: 4,
  schoolType: 'semi_private',
  tierId: 'indep_mid',
  feeInflation: 8,
  investmentReturn: 8,
  currentSavings: 0,
  monthlyContribution: 0,
  useCustomFee: false,
  customFee: 72000,
}

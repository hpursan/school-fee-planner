import { describe, it, expect } from 'vitest'
import { SCHOOL_TYPES, GRADE_FROM_AGE, SCHOOL_PHASES, DEFAULT_VALUES } from '../schoolData'

// ── SCHOOL_TYPES structure ───────────────────────────────────────────────────

describe('SCHOOL_TYPES', () => {
  const types = Object.entries(SCHOOL_TYPES)

  it('has exactly 3 school types', () => {
    expect(types).toHaveLength(3)
  })

  it('includes public, semi_private, and private', () => {
    expect(SCHOOL_TYPES).toHaveProperty('public')
    expect(SCHOOL_TYPES).toHaveProperty('semi_private')
    expect(SCHOOL_TYPES).toHaveProperty('private')
  })

  it.each(types)('%s has a label and description', (key, type) => {
    expect(typeof type.label).toBe('string')
    expect(type.label.length).toBeGreaterThan(0)
    expect(typeof type.description).toBe('string')
  })

  it.each(types)('%s has exactly 3 tiers', (key, type) => {
    expect(type.tiers).toHaveLength(3)
  })

  it.each(types)('%s tiers each have required fields', (key, type) => {
    type.tiers.forEach(tier => {
      expect(tier).toHaveProperty('id')
      expect(tier).toHaveProperty('label')
      expect(tier).toHaveProperty('low')
      expect(tier).toHaveProperty('high')
      expect(tier).toHaveProperty('midpoint')
      expect(tier).toHaveProperty('description')
    })
  })

  it.each(types)('%s tiers have midpoint within low–high range', (key, type) => {
    type.tiers.forEach(tier => {
      expect(tier.midpoint).toBeGreaterThanOrEqual(tier.low)
      expect(tier.midpoint).toBeLessThanOrEqual(tier.high)
    })
  })

  it.each(types)('%s tier low is non-negative', (key, type) => {
    type.tiers.forEach(tier => {
      expect(tier.low).toBeGreaterThanOrEqual(0)
    })
  })

  it.each(types)('%s tier high is greater than low', (key, type) => {
    type.tiers.forEach(tier => {
      expect(tier.high).toBeGreaterThan(tier.low)
    })
  })

  it('all tier IDs are unique across all school types', () => {
    const allIds = types.flatMap(([, type]) => type.tiers.map(t => t.id))
    const uniqueIds = new Set(allIds)
    expect(uniqueIds.size).toBe(allIds.length)
  })

  it('private school fees are higher than public school fees', () => {
    const publicMax = Math.max(...SCHOOL_TYPES.public.tiers.map(t => t.high))
    const privateMin = Math.min(...SCHOOL_TYPES.private.tiers.map(t => t.low))
    expect(privateMin).toBeGreaterThan(publicMax)
  })
})

// ── GRADE_FROM_AGE ───────────────────────────────────────────────────────────

describe('GRADE_FROM_AGE', () => {
  it('returns an object with grade and yearsToMatric', () => {
    const result = GRADE_FROM_AGE(6)
    expect(result).toHaveProperty('grade')
    expect(result).toHaveProperty('yearsToMatric')
  })

  it('age 5 returns Grade R', () => {
    expect(GRADE_FROM_AGE(5).grade).toBe('Grade R')
  })

  it('age 6 returns Grade 1', () => {
    expect(GRADE_FROM_AGE(6).grade).toBe('Grade 1')
  })

  it('age 12 returns Grade 7', () => {
    expect(GRADE_FROM_AGE(12).grade).toBe('Grade 7')
  })

  it('age 17 returns Grade 12 (Matric)', () => {
    expect(GRADE_FROM_AGE(17).grade).toBe('Grade 12 (Matric)')
  })

  it('age 17 (matric) has yearsToMatric of 1', () => {
    expect(GRADE_FROM_AGE(17).yearsToMatric).toBe(1)
  })

  it('age 6 (Grade 1) has yearsToMatric of 12', () => {
    expect(GRADE_FROM_AGE(6).yearsToMatric).toBe(12)
  })

  it('age 5 (Grade R) has yearsToMatric of 13', () => {
    expect(GRADE_FROM_AGE(5).yearsToMatric).toBe(13)
  })

  it('age 18+ returns Post-matric with 0 yearsToMatric', () => {
    const result = GRADE_FROM_AGE(18)
    expect(result.grade).toBe('Post-matric')
    expect(result.yearsToMatric).toBe(0)
  })

  it('age under 3 returns Pre-school', () => {
    expect(GRADE_FROM_AGE(1).grade).toBe('Pre-school')
    expect(GRADE_FROM_AGE(2).grade).toBe('Pre-school')
  })

  it('age 3 returns Nursery', () => {
    expect(GRADE_FROM_AGE(3).grade).toBe('Nursery')
  })

  it('age 4 returns Pre-Grade R', () => {
    expect(GRADE_FROM_AGE(4).grade).toBe('Pre-Grade R')
  })

  it('yearsToMatric decreases as age increases', () => {
    const ages = [4, 6, 8, 10, 12, 14, 16]
    const years = ages.map(a => GRADE_FROM_AGE(a).yearsToMatric)
    for (let i = 1; i < years.length; i++) {
      expect(years[i]).toBeLessThan(years[i - 1])
    }
  })

  it('all grades from 6–17 map to unique grade labels', () => {
    const grades = Array.from({ length: 12 }, (_, i) => GRADE_FROM_AGE(i + 6).grade)
    const unique = new Set(grades)
    expect(unique.size).toBe(grades.length)
  })
})

// ── SCHOOL_PHASES ────────────────────────────────────────────────────────────

describe('SCHOOL_PHASES', () => {
  it('has 4 phases', () => {
    expect(SCHOOL_PHASES).toHaveLength(4)
  })

  it('each phase has label, grades, and ages', () => {
    SCHOOL_PHASES.forEach(phase => {
      expect(phase).toHaveProperty('label')
      expect(phase).toHaveProperty('grades')
      expect(phase).toHaveProperty('ages')
    })
  })
})

// ── DEFAULT_VALUES ───────────────────────────────────────────────────────────

describe('DEFAULT_VALUES', () => {
  it('has all required keys', () => {
    expect(DEFAULT_VALUES).toHaveProperty('childAge')
    expect(DEFAULT_VALUES).toHaveProperty('schoolType')
    expect(DEFAULT_VALUES).toHaveProperty('tierId')
    expect(DEFAULT_VALUES).toHaveProperty('feeInflation')
    expect(DEFAULT_VALUES).toHaveProperty('investmentReturn')
    expect(DEFAULT_VALUES).toHaveProperty('currentSavings')
    expect(DEFAULT_VALUES).toHaveProperty('monthlyContribution')
    expect(DEFAULT_VALUES).toHaveProperty('useCustomFee')
    expect(DEFAULT_VALUES).toHaveProperty('customFee')
  })

  it('default schoolType exists in SCHOOL_TYPES', () => {
    expect(SCHOOL_TYPES).toHaveProperty(DEFAULT_VALUES.schoolType)
  })

  it('default tierId exists within the default school type', () => {
    const tiers = SCHOOL_TYPES[DEFAULT_VALUES.schoolType].tiers
    const found = tiers.find(t => t.id === DEFAULT_VALUES.tierId)
    expect(found).toBeDefined()
  })

  it('feeInflation is a positive number', () => {
    expect(DEFAULT_VALUES.feeInflation).toBeGreaterThan(0)
  })

  it('investmentReturn is a positive number', () => {
    expect(DEFAULT_VALUES.investmentReturn).toBeGreaterThan(0)
  })

  it('useCustomFee defaults to false', () => {
    expect(DEFAULT_VALUES.useCustomFee).toBe(false)
  })
})

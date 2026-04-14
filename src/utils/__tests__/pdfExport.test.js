import { describe, it, expect, vi, beforeEach } from 'vitest'

// vi.hoisted ensures these are available when vi.mock factories run (which are hoisted to top)
const { mockSave, mockText, mockSetFontSize, mockSetFont, mockSetTextColor,
  mockSetFillColor, mockRect, mockAddPage, mockSetPage,
  mockSplitTextToSize, mockAutoTable, mockDocInstance } = vi.hoisted(() => {
  const mockSave = vi.fn()
  const mockText = vi.fn()
  const mockSetFontSize = vi.fn()
  const mockSetFont = vi.fn()
  const mockSetTextColor = vi.fn()
  const mockSetFillColor = vi.fn()
  const mockRect = vi.fn()
  const mockAddPage = vi.fn()
  const mockSetPage = vi.fn()
  const mockSplitTextToSize = vi.fn(() => ['mocked disclaimer line'])
  const mockAutoTable = vi.fn()

  const mockDocInstance = {
    internal: {
      pageSize: { getWidth: () => 210, getHeight: () => 297 },
      getNumberOfPages: () => 2,
    },
    lastAutoTable: { finalY: 100 },
    save: mockSave,
    text: mockText,
    setFontSize: mockSetFontSize,
    setFont: mockSetFont,
    setTextColor: mockSetTextColor,
    setFillColor: mockSetFillColor,
    rect: mockRect,
    addPage: mockAddPage,
    setPage: mockSetPage,
    splitTextToSize: mockSplitTextToSize,
  }

  return { mockSave, mockText, mockSetFontSize, mockSetFont, mockSetTextColor,
    mockSetFillColor, mockRect, mockAddPage, mockSetPage,
    mockSplitTextToSize, mockAutoTable, mockDocInstance }
})

vi.mock('jspdf', () => ({
  default: vi.fn(function () { return mockDocInstance }),
}))

vi.mock('jspdf-autotable', () => ({
  default: mockAutoTable,
}))

import { generatePDF } from '../pdfExport'

const sampleResult = {
  totalCost: 1_200_000,
  nextYearFee: 77_760,
  matricFee: 155_360,
  projectedFund: 800_000,
  fundingGap: 400_000,
  requiredMonthly: 4500,
  additionalMonthlyNeeded: 2500,
  annualProjection: Array.from({ length: 10 }, (_, i) => ({
    year: 2026 + i,
    fee: Math.round(72000 * Math.pow(1.08, i)),
    feeMonthly: Math.round((72000 * Math.pow(1.08, i)) / 12),
  })),
}

const sampleInputs = {
  childAge: 4,
  gradeLabel: 'Pre-Grade R',
  schoolTypeLabel: 'Independent / Semi-Private',
  tierLabel: 'Mid independent',
  currentFee: 72000,
  feeInflation: 8,
  investmentReturn: 8,
  currentSavings: 0,
  monthlyContribution: 2000,
  yearsToMatric: 10,
}

describe('generatePDF', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDocInstance.lastAutoTable = { finalY: 100 }
  })

  it('does not throw for valid inputs', () => {
    expect(() => generatePDF({ scenario: {}, result: sampleResult, inputs: sampleInputs })).not.toThrow()
  })

  it('calls doc.save with the expected filename', () => {
    generatePDF({ scenario: {}, result: sampleResult, inputs: sampleInputs })
    expect(mockSave).toHaveBeenCalledWith('school-fee-plan.pdf')
  })

  it('calls autoTable at least twice (inputs + results tables)', () => {
    generatePDF({ scenario: {}, result: sampleResult, inputs: sampleInputs })
    expect(mockAutoTable.mock.calls.length).toBeGreaterThanOrEqual(2)
  })

  it('calls addPage to start the projection table on a new page', () => {
    generatePDF({ scenario: {}, result: sampleResult, inputs: sampleInputs })
    expect(mockAddPage).toHaveBeenCalled()
  })

  it('calls setPage for each page in the footer loop', () => {
    generatePDF({ scenario: {}, result: sampleResult, inputs: sampleInputs })
    // getNumberOfPages returns 2, so setPage should be called twice
    expect(mockSetPage).toHaveBeenCalledTimes(2)
  })

  it('renders header with school name text', () => {
    generatePDF({ scenario: {}, result: sampleResult, inputs: sampleInputs })
    const textCalls = mockText.mock.calls.map(c => c[0])
    expect(textCalls).toContain('School Fee Planner SA')
  })

  it('passes all 10 projection rows to the year-by-year autoTable', () => {
    generatePDF({ scenario: {}, result: sampleResult, inputs: sampleInputs })
    // Third autoTable call is the annual projection table
    const projectionTableCall = mockAutoTable.mock.calls[2]
    const body = projectionTableCall[1].body
    expect(body).toHaveLength(10)
  })

  it('works with a surplus scenario (fundingGap < 0)', () => {
    const surplusResult = { ...sampleResult, fundingGap: -100_000 }
    expect(() => generatePDF({ scenario: {}, result: surplusResult, inputs: sampleInputs })).not.toThrow()
  })
})

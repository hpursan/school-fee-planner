import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatRand } from './calculations'

export function generatePDF({ scenario, result, inputs }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 18

  // ── Header ──────────────────────────────────────────────
  doc.setFillColor(27, 73, 101)
  doc.rect(0, 0, pageWidth, 36, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('School Fee Planner SA', margin, 16)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Personalised Education Cost Estimate', margin, 24)

  doc.setFontSize(9)
  doc.text(`Generated: ${new Date().toLocaleDateString('en-ZA')}`, pageWidth - margin, 24, { align: 'right' })

  // ── Disclaimer ──────────────────────────────────────────
  doc.setTextColor(100, 100, 100)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'italic')
  const disclaimer =
    'All figures are estimates based on user inputs and planning assumptions. Actual fees vary by school, grade, year, location, levies, and optional activities. This is not financial advice.'
  const disclaimerLines = doc.splitTextToSize(disclaimer, pageWidth - margin * 2)
  doc.text(disclaimerLines, margin, 42)

  // ── Inputs Summary ──────────────────────────────────────
  doc.setTextColor(27, 73, 101)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('Your Inputs', margin, 58)

  autoTable(doc, {
    startY: 62,
    margin: { left: margin, right: margin },
    head: [['Parameter', 'Value']],
    body: [
      ['Child\'s current age', `${inputs.childAge} years old`],
      ['Current grade (approx)', inputs.gradeLabel],
      ['School type', inputs.schoolTypeLabel],
      ['Fee tier / category', inputs.tierLabel],
      ['Current annual fee', formatRand(inputs.currentFee)],
      ['Annual fee inflation', `${inputs.feeInflation}%`],
      ['Investment return', `${inputs.investmentReturn}%`],
      ['Current education savings', formatRand(inputs.currentSavings)],
      ['Current monthly contribution', formatRand(inputs.monthlyContribution)],
      ['Years to matric', `${inputs.yearsToMatric} years`],
    ],
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [27, 73, 101], textColor: 255 },
    alternateRowStyles: { fillColor: [240, 246, 250] },
  })

  // ── Key Results ──────────────────────────────────────────
  const afterInputs = doc.lastAutoTable.finalY + 8

  doc.setTextColor(27, 73, 101)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('Key Results', margin, afterInputs)

  const isShortfall = result.fundingGap > 0

  autoTable(doc, {
    startY: afterInputs + 4,
    margin: { left: margin, right: margin },
    head: [['Result', 'Amount']],
    body: [
      ['Total estimated cost to matric', formatRand(result.totalCost)],
      ['Next year\'s estimated fee', formatRand(result.nextYearFee)],
      ['Matric year estimated fee', formatRand(result.matricFee)],
      ['Projected fund at matric (current rate)', formatRand(result.projectedFund)],
      [isShortfall ? 'Estimated funding shortfall' : 'Estimated funding surplus', formatRand(Math.abs(result.fundingGap))],
      ['Monthly savings needed to fully fund', formatRand(result.requiredMonthly)],
      ['Additional monthly savings needed', formatRand(result.additionalMonthlyNeeded)],
    ],
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [27, 73, 101], textColor: 255 },
    alternateRowStyles: { fillColor: [240, 246, 250] },
    bodyStyles: { fontStyle: 'normal' },
    didParseCell: (data) => {
      if (data.row.index === 4) {
        data.cell.styles.textColor = isShortfall ? [180, 30, 30] : [30, 130, 70]
        data.cell.styles.fontStyle = 'bold'
      }
    },
  })

  // ── Annual Projection Table ──────────────────────────────
  doc.addPage()

  doc.setFillColor(27, 73, 101)
  doc.rect(0, 0, pageWidth, 20, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Year-by-Year Fee Projection', margin, 13)

  autoTable(doc, {
    startY: 26,
    margin: { left: margin, right: margin },
    head: [['Year', 'Annual Fee', 'Monthly Fee', 'Cumulative Cost']],
    body: result.annualProjection.map((row, i) => {
      const cumulative = result.annualProjection.slice(0, i + 1).reduce((s, r) => s + r.fee, 0)
      return [
        row.year,
        formatRand(row.fee),
        formatRand(row.feeMonthly),
        formatRand(cumulative),
      ]
    }),
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    headStyles: { fillColor: [27, 73, 101], textColor: 255 },
    alternateRowStyles: { fillColor: [240, 246, 250] },
  })

  // ── Footer ───────────────────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.setFont('helvetica', 'normal')
    doc.text(
      'School Fee Planner SA  •  schoolfeeplannersa.co.za  •  Estimates only, not financial advice',
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    )
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - margin, doc.internal.pageSize.getHeight() - 8, { align: 'right' })
  }

  doc.save('school-fee-plan.pdf')
}

import { useState } from 'react'
import { formatRand } from '../utils/calculations'

export default function ProjectionTable({ projection }) {
  const [collapsed, setCollapsed] = useState(true)
  if (!projection?.length) return null

  const displayed = collapsed ? projection.slice(0, 5) : projection

  return (
    <div className="table-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18 }}>
        <div>
          <div className="chart-title">Year-by-Year Fee Projection</div>
          <div className="chart-sub mb-0">All {projection.length} years from now to matric</div>
        </div>
        {projection.length > 5 && (
          <button
            onClick={() => setCollapsed(c => !c)}
            style={{
              background: 'none', border: '1.5px solid #e8e4dc', borderRadius: 6,
              padding: '6px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              color: '#1B4965', fontFamily: 'inherit', whiteSpace: 'nowrap',
            }}
          >
            {collapsed ? `Show all ${projection.length} years ↓` : 'Collapse ↑'}
          </button>
        )}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="projection-table">
          <thead>
            <tr>
              <th>Year</th>
              <th>Annual Fee</th>
              <th>Monthly Fee</th>
              <th>vs. Today</th>
            </tr>
          </thead>
          <tbody>
            {displayed.map((row, i) => {
              const baseline = projection[0].fee
              const increase = ((row.fee - baseline) / baseline * 100).toFixed(0)
              return (
                <tr key={row.year}>
                  <td>{row.year}{i === 0 ? ' (now)' : ''}</td>
                  <td className="amount">{formatRand(row.fee)}</td>
                  <td>{formatRand(row.feeMonthly)}</td>
                  <td style={{ color: i === 0 ? '#8A8680' : '#c1121f', fontWeight: 600 }}>
                    {i === 0 ? 'Baseline' : `+${increase}%`}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

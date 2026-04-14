import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'
import { formatRand } from '../utils/calculations'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#0f2e42', border: '1px solid rgba(255,255,255,0.15)',
      borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#fff',
    }}>
      <div style={{ marginBottom: 6, fontWeight: 700 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: {formatRand(p.value)}
        </div>
      ))}
    </div>
  )
}

export function FeeGrowthChart({ projection }) {
  if (!projection?.length) return null
  const data = projection.map(y => ({
    year: String(y.year),
    'Annual Fee': y.fee,
    'Monthly Fee': y.feeMonthly,
  }))

  return (
    <div className="chart-card">
      <div className="chart-title">Projected Annual Fee Growth</div>
      <div className="chart-sub">How your school fees are likely to rise each year with inflation</div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8e4dc" vertical={false} />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11, fill: '#8A8680' }}
            tickLine={false}
            axisLine={false}
            interval={Math.max(0, Math.floor(data.length / 6) - 1)}
          />
          <YAxis
            tickFormatter={v => formatRand(v, true)}
            tick={{ fontSize: 11, fill: '#8A8680' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="Annual Fee" fill="#1B4965" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function FundVsCostChart({ fundBalanceProjection }) {
  if (!fundBalanceProjection?.length) return null
  const data = fundBalanceProjection.map(y => ({
    year: String(y.year),
    'Your Fund': y.fundBalance,
    'Cumulative Fees': y.cumulativeFees,
  }))

  return (
    <div className="chart-card">
      <div className="chart-title">Your Fund vs Total Fees Over Time</div>
      <div className="chart-sub">Comparing your projected savings balance against the total school fees you'll have paid</div>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="fundGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#52b788" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#52b788" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1B4965" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#1B4965" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8e4dc" vertical={false} />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11, fill: '#8A8680' }}
            tickLine={false}
            axisLine={false}
            interval={Math.max(0, Math.floor(data.length / 6) - 1)}
          />
          <YAxis
            tickFormatter={v => formatRand(v, true)}
            tick={{ fontSize: 11, fill: '#8A8680' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
          <Area type="monotone" dataKey="Your Fund" stroke="#52b788" strokeWidth={2} fill="url(#fundGrad)" />
          <Area type="monotone" dataKey="Cumulative Fees" stroke="#1B4965" strokeWidth={2} fill="url(#costGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'


const COLORS = {
  PV: '#3B82F6',
  EV: '#22C55E',
  AC: '#F97316',
}


const numberFormat = new Intl.NumberFormat('es-CO', {
  maximumFractionDigits: 0,
})


function truncate(name) {
  if (name.length <= 15) return name
  return `${name.slice(0, 15)}…`
}


export default function EVMChart({ activities }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-ink-200 p-8 text-center text-ink-500 italic">
        Agrega actividades para ver el gráfico EVM.
      </div>
    )
  }

  const data = activities.map((activity) => ({
    name: activity.name,
    PV: activity.indicators.pv,
    EV: activity.indicators.ev,
    AC: Number(activity.actual_cost),
  }))

  return (
    <div className="bg-white rounded-lg border border-ink-200 p-4 shadow-sm">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 16, right: 16, bottom: 8, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis
            dataKey="name"
            tickFormatter={truncate}
            tick={{ fill: '#475569', fontSize: 12 }}
          />
          <YAxis
            tickFormatter={(value) => numberFormat.format(value)}
            tick={{ fill: '#475569', fontSize: 12 }}
          />
          <Tooltip
            formatter={(value) => numberFormat.format(value)}
            contentStyle={{ fontSize: 13 }}
          />
          <Legend wrapperStyle={{ fontSize: 13 }} />
          <Bar dataKey="PV" fill={COLORS.PV} />
          <Bar dataKey="EV" fill={COLORS.EV} />
          <Bar dataKey="AC" fill={COLORS.AC} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

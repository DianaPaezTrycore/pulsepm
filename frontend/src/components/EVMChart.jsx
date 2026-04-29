import React from 'react'
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
  EV: '#10B981',
  AC: '#F59E0B',
}

const numberFormat = new Intl.NumberFormat('es-CO', {
  maximumFractionDigits: 0,
})

function truncate(name) {
  if (name.length <= 12) return name
  return `${name.slice(0, 12)}…`
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-xs min-w-[160px]">
      <p className="font-semibold text-slate-700 mb-2 truncate">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: entry.fill }} />
            <span className="text-slate-500">{entry.dataKey}</span>
          </div>
          <span className="font-semibold text-slate-800 tabular-nums">{numberFormat.format(entry.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function EVMChart({ activities }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-10 text-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="font-semibold text-slate-600 text-sm">Sin datos para graficar</p>
        <p className="text-xs text-slate-400 mt-1">Agrega actividades para ver el gráfico EVM.</p>
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
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-800">Indicadores EVM por actividad</h4>
          <p className="text-xs text-slate-400 mt-0.5">Planned Value · Earned Value · Actual Cost</p>
        </div>
        <div className="flex items-center gap-3">
          {Object.entries(COLORS).map(([key, color]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
              <span className="text-xs text-slate-500 font-medium">{key}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="p-5">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }} barGap={3} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis
              dataKey="name"
              tickFormatter={truncate}
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => numberFormat.format(v)}
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={64}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC' }} />
            <Legend hide />
            <Bar dataKey="PV" fill={COLORS.PV} radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar dataKey="EV" fill={COLORS.EV} radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Bar dataKey="AC" fill={COLORS.AC} radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

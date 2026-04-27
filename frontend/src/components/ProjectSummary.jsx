import React from 'react'
import StatusBadge from './StatusBadge.jsx'

function SummaryCard({ title, subtitle, value, interpretation, kind }) {
  const display = value === null || value === undefined ? '—' : value.toFixed(3)

  const borderColor =
    value === null || value === undefined
      ? 'border-l-slate-300'
      : value > 1
        ? 'border-l-emerald-500'
        : value === 1
          ? 'border-l-blue-500'
          : 'border-l-red-500'

  const valueColor =
    value === null || value === undefined
      ? 'text-slate-400'
      : value > 1
        ? 'text-emerald-600'
        : value === 1
          ? 'text-blue-600'
          : 'text-red-600'

  return (
    <div className={`bg-white rounded-xl border border-slate-200 border-l-4 ${borderColor} shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden`}>
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{subtitle}</p>
            <h3 className="text-sm font-bold text-slate-700 mt-0.5">{title}</h3>
          </div>
          <StatusBadge value={value} kind={kind} />
        </div>
        <p className={`text-4xl font-extrabold tabular-nums mb-2 ${valueColor}`}>{display}</p>
        <p className="text-sm text-slate-600 leading-relaxed">{interpretation || '—'}</p>
      </div>
    </div>
  )
}

export default function ProjectSummary({ indicators }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <SummaryCard
        title="CPI"
        subtitle="Cost Performance Index"
        value={indicators.cpi}
        interpretation={indicators.cpi_interpretation}
        kind="cpi"
      />
      <SummaryCard
        title="SPI"
        subtitle="Schedule Performance Index"
        value={indicators.spi}
        interpretation={indicators.spi_interpretation}
        kind="spi"
      />
    </div>
  )
}



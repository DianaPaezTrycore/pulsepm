import React from 'react'

const LABELS = {
  cpi: { ahead: 'Eficiente', behind: 'Ineficiente' },
  spi: { ahead: 'Adelantado', behind: 'Atrasado' },
}

const ON_TARGET = 'En objetivo'
const NO_DATA = 'Sin datos'

export default function StatusBadge({ value, kind }) {
  if (value === null || value === undefined) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        {NO_DATA}
      </span>
    )
  }

  if (value > 1) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        {LABELS[kind].ahead}
      </span>
    )
  }

  if (value === 1) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
        {ON_TARGET}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
      {LABELS[kind].behind}
    </span>
  )
}

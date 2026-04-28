import React, { useState } from 'react'
import ActivityForm from './ActivityForm.jsx'

const numFmt = (value) => {
  if (value === null || value === undefined) return '—'
  return Number(value).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

const ratioFmt = (value) => {
  if (value === null || value === undefined) return '—'
  return Number(value).toFixed(3)
}

const signCls = (v) =>
  v === null || v === undefined ? 'text-slate-400' : v >= 0 ? 'text-emerald-600' : 'text-red-600'

const ratioCls = (v) =>
  v === null || v === undefined ? 'text-slate-400' : v >= 1 ? 'text-emerald-600' : 'text-red-600'

function getStatusInfo(activity) {
  const progress = Number(activity.actual_progress)
  const cpi = activity.indicators?.cpi
  if (progress >= 100)
    return { label: 'Completada', badgeCls: 'bg-emerald-50 text-emerald-700 border-emerald-200', dotCls: 'bg-emerald-500', barCls: 'bg-emerald-500', iconType: 'check' }
  if (progress > 0 && cpi !== null && cpi !== undefined && cpi < 0.8)
    return { label: 'En riesgo', badgeCls: 'bg-red-50 text-red-600 border-red-200', dotCls: 'bg-red-500', barCls: 'bg-red-500', iconType: 'alert' }
  if (progress > 0)
    return { label: 'En progreso', badgeCls: 'bg-blue-50 text-blue-700 border-blue-200', dotCls: 'bg-blue-500', barCls: 'bg-blue-500', iconType: 'progress' }
  return { label: 'Pendiente', badgeCls: 'bg-amber-50 text-amber-700 border-amber-200', dotCls: 'bg-amber-400', barCls: 'bg-amber-400', iconType: 'pending' }
}

const FILTER_TABS = [
  { label: 'Todas', value: 'all' },
  { label: 'Pendientes', value: 'Pendiente' },
  { label: 'En progreso', value: 'En progreso' },
  { label: 'Completadas', value: 'Completada' },
  { label: 'En riesgo', value: 'En riesgo' },
]

function StatusIcon({ type }) {
  if (type === 'check')
    return (
      <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  if (type === 'progress')
    return (
      <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  if (type === 'alert')
    return (
      <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    )
  return (
    <svg className="w-5 h-5 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" strokeWidth={2} />
    </svg>
  )
}

function ActivityRow({ activity, editingId, onEdit, onDelete, onSaveEdit, onCancelEdit }) {
  const [expanded, setExpanded] = useState(false)
  const status = getStatusInfo(activity)

  if (editingId === activity.id) {
    return (
      <ActivityForm
        initialValues={activity}
        onSubmit={(data) => onSaveEdit(activity.id, data)}
        onCancel={onCancelEdit}
      />
    )
  }

  const evmMetrics = [
    { label: 'PV', value: numFmt(activity.indicators.pv), cls: 'text-blue-600' },
    { label: 'EV', value: numFmt(activity.indicators.ev), cls: 'text-emerald-600' },
    { label: 'AC', value: numFmt(activity.actual_cost), cls: 'text-slate-700' },
    { label: 'CV', value: numFmt(activity.indicators.cv), cls: signCls(activity.indicators.cv) },
    { label: 'SV', value: numFmt(activity.indicators.sv), cls: signCls(activity.indicators.sv) },
    { label: 'BAC', value: numFmt(activity.bac), cls: 'text-slate-700' },
    { label: 'EAC', value: numFmt(activity.indicators.eac), cls: 'text-slate-700' },
    { label: 'VAC', value: numFmt(activity.indicators.vac), cls: signCls(activity.indicators.vac) },
  ]

  return (
    <div className="border-b border-slate-100 last:border-0">
      <div className="flex items-center hover:bg-slate-50/80 transition-colors group min-h-[64px]">
        <div className={`w-1 self-stretch flex-shrink-0 rounded-r ${status.barCls}`} />
        <div className="pl-4 pr-3 flex-shrink-0">
          <StatusIcon type={status.iconType} />
        </div>
        <div className="flex-1 min-w-0 py-3 pr-3">
          <p className="text-sm font-semibold text-slate-800 truncate">{activity.name}</p>
          <p className="text-xs text-slate-400 mt-0.5 tabular-nums">
            BAC: {numFmt(activity.bac)} &middot; Plan: {numFmt(activity.planned_progress)}% &middot; Real: {numFmt(activity.actual_progress)}%
          </p>
        </div>
        <div className="px-3 flex-shrink-0">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap border ${status.badgeCls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dotCls}`} />
            {status.label}
          </span>
        </div>
        <div className="px-4 hidden md:flex items-center gap-4 flex-shrink-0">
          <div className="text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium leading-none mb-1">CPI</p>
            <p className={`text-xs font-bold tabular-nums ${ratioCls(activity.indicators.cpi)}`}>{ratioFmt(activity.indicators.cpi)}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium leading-none mb-1">SPI</p>
            <p className={`text-xs font-bold tabular-nums ${ratioCls(activity.indicators.spi)}`}>{ratioFmt(activity.indicators.spi)}</p>
          </div>
        </div>
        <div className="px-2 flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(activity.id)}
            className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-300 hover:text-blue-600 transition-colors"
            title="Editar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(activity)}
            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors"
            title="Eliminar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="px-4 py-5 text-slate-300 hover:text-slate-500 flex-shrink-0 transition-colors"
          title={expanded ? 'Contraer' : 'Ver métricas EVM'}
        >
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      {expanded && (
        <div className="ml-1 border-t border-slate-100 bg-slate-50/60 px-6 py-4">
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-3">Métricas EVM</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-4">
            {evmMetrics.map(({ label, value, cls }) => (
              <div key={label} className="text-center bg-white rounded-lg p-3 shadow-sm border border-slate-100">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">{label}</p>
                <p className={`text-sm font-bold tabular-nums mt-1 ${cls}`}>{value}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className={`flex items-start gap-2.5 rounded-lg border px-3 py-2.5 ${activity.indicators.cpi === null || activity.indicators.cpi === undefined ? 'bg-slate-50 border-slate-200' : activity.indicators.cpi >= 1 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
              <span className={`text-xs font-bold mt-0.5 ${activity.indicators.cpi === null || activity.indicators.cpi === undefined ? 'text-slate-400' : activity.indicators.cpi >= 1 ? 'text-emerald-700' : 'text-red-700'}`}>CPI</span>
              <p className={`text-xs leading-snug ${activity.indicators.cpi === null || activity.indicators.cpi === undefined ? 'text-slate-400' : activity.indicators.cpi >= 1 ? 'text-emerald-700' : 'text-red-700'}`}>
                {activity.indicators.cpi_interpretation || '—'}
              </p>
            </div>
            <div className={`flex items-start gap-2.5 rounded-lg border px-3 py-2.5 ${activity.indicators.spi === null || activity.indicators.spi === undefined ? 'bg-slate-50 border-slate-200' : activity.indicators.spi >= 1 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
              <span className={`text-xs font-bold mt-0.5 ${activity.indicators.spi === null || activity.indicators.spi === undefined ? 'text-slate-400' : activity.indicators.spi >= 1 ? 'text-emerald-700' : 'text-red-700'}`}>SPI</span>
              <p className={`text-xs leading-snug ${activity.indicators.spi === null || activity.indicators.spi === undefined ? 'text-slate-400' : activity.indicators.spi >= 1 ? 'text-emerald-700' : 'text-red-700'}`}>
                {activity.indicators.spi_interpretation || '—'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ActivityTable({
  activities,
  totals,
  editingId,
  addingNew,
  onEdit,
  onDelete,
  onSaveEdit,
  onCancelEdit,
  onSaveAdd,
  onCancelAdd,
}) {
  const [activeFilter, setActiveFilter] = useState('all')
  const filtered =
    activeFilter === 'all'
      ? activities
      : activities.filter((a) => getStatusInfo(a).label === activeFilter)

  const isEmpty = activities.length === 0 && !addingNew

  return (
    <div>
      <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-1 flex-wrap bg-slate-50/50">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveFilter(tab.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeFilter === tab.value
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab.label}
            {tab.value !== 'all' && activities.length > 0 && (
              <span className={`text-[10px] rounded-full px-1.5 min-w-[18px] text-center font-bold ${
                activeFilter === tab.value ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                {activities.filter((a) => getStatusInfo(a).label === tab.value).length}
              </span>
            )}
          </button>
        ))}
      </div>
      <div>
        {isEmpty && (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-600">Sin actividades</p>
            <p className="text-xs text-slate-400 mt-1">Agrega la primera para empezar a calcular EVM.</p>
          </div>
        )}
        {!isEmpty && filtered.length === 0 && (
          <div className="py-10 text-center">
            <p className="text-sm text-slate-500">No hay actividades con este filtro.</p>
          </div>
        )}
        {filtered.map((activity) => (
          <ActivityRow
            key={activity.id}
            activity={activity}
            editingId={editingId}
            onEdit={onEdit}
            onDelete={onDelete}
            onSaveEdit={onSaveEdit}
            onCancelEdit={onCancelEdit}
          />
        ))}
        {addingNew && (
          <ActivityForm onSubmit={onSaveAdd} onCancel={onCancelAdd} />
        )}
      </div>
      {activities.length > 0 && (
        <div className="border-t-2 border-slate-700 bg-slate-800 text-slate-100 px-6 py-3 flex items-center gap-2 flex-wrap rounded-b-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2">Totales</span>
          {[
            { label: 'PV', value: numFmt(totals.pv), cls: 'text-blue-300' },
            { label: 'EV', value: numFmt(totals.ev), cls: 'text-emerald-300' },
            { label: 'CV', value: numFmt(totals.cv), cls: totals.cv !== null && totals.cv >= 0 ? 'text-emerald-300' : 'text-red-400' },
            { label: 'SV', value: numFmt(totals.sv), cls: totals.sv !== null && totals.sv >= 0 ? 'text-emerald-300' : 'text-red-400' },
            { label: 'CPI', value: ratioFmt(totals.cpi), cls: totals.cpi !== null && totals.cpi >= 1 ? 'text-emerald-300' : 'text-red-400' },
            { label: 'SPI', value: ratioFmt(totals.spi), cls: totals.spi !== null && totals.spi >= 1 ? 'text-emerald-300' : 'text-red-400' },
          ].map(({ label, value, cls }) => (
            <span key={label} className="flex items-center gap-1 text-xs tabular-nums">
              <span className="text-slate-500">{label}</span>
              <span className={`font-bold ${cls}`}>{value}</span>
              <span className="text-slate-700 mx-0.5 last:hidden">{'\u00b7'}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

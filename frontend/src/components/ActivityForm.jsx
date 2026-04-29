import React, { useState } from 'react'

function fieldValue(initial, key) {
  if (initial && initial[key] !== undefined && initial[key] !== null) {
    return String(initial[key])
  }
  return ''
}

export default function ActivityForm({ initialValues, onSubmit, onCancel }) {
  const [name, setName] = useState(initialValues?.name ?? '')
  const [bac, setBac] = useState(fieldValue(initialValues, 'bac'))
  const [planned, setPlanned] = useState(fieldValue(initialValues, 'planned_progress'))
  const [actual, setActual] = useState(fieldValue(initialValues, 'actual_progress'))
  const [actualCost, setActualCost] = useState(fieldValue(initialValues, 'actual_cost'))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  async function handleSave() {
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({
        name: name.trim(),
        bac: parseFloat(bac),
        planned_progress: parseFloat(planned),
        actual_progress: parseFloat(actual),
        actual_cost: parseFloat(actualCost),
      })
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-500 focus:outline-none bg-white hover:border-slate-300 transition-colors'
  const labelCls = 'block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5'
  const isEditing = Boolean(initialValues)

  return (
    <div className={`border-l-4 ${isEditing ? 'border-l-amber-400 bg-amber-50/30' : 'border-l-blue-500 bg-blue-50/30'} border-b border-slate-100`}>
      <div className="p-5">
        <p className={`text-xs font-bold mb-4 ${isEditing ? 'text-amber-700' : 'text-blue-700'}`}>
          {isEditing ? 'Editar actividad' : 'Nueva actividad'}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="col-span-2">
            <label className={labelCls}>Nombre *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
              placeholder="Nombre de la actividad"
              maxLength={255}
              autoFocus
              required
            />
          </div>
          <div>
            <label className={labelCls}>BAC</label>
            <input
              type="number" min="0.01" step="0.01"
              value={bac}
              onChange={(e) => setBac(e.target.value)}
              className={`${inputCls} text-right`}
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <label className={labelCls}>% Planeado</label>
            <input
              type="number" min="0" max="100" step="0.01"
              value={planned}
              onChange={(e) => setPlanned(e.target.value)}
              className={`${inputCls} text-right`}
              placeholder="0"
              required
            />
          </div>
          <div>
            <label className={labelCls}>% Real</label>
            <input
              type="number" min="0" max="100" step="0.01"
              value={actual}
              onChange={(e) => setActual(e.target.value)}
              className={`${inputCls} text-right`}
              placeholder="0"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-3">
          <div>
            <label className={labelCls}>Costo Real (AC)</label>
            <input
              type="number" min="0" step="0.01"
              value={actualCost}
              onChange={(e) => setActualCost(e.target.value)}
              className={`${inputCls} text-right`}
              placeholder="0.00"
              required
            />
          </div>
          <div className="hidden sm:flex col-span-3 items-end pb-1">
            <p className="text-xs text-slate-400 italic">Los indicadores EVM se recalculan automáticamente al guardar.</p>
          </div>
          <div className="flex items-end justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={submitting || !name.trim()}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold shadow-sm"
            >
              {submitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
        {error && (
          <div className="mt-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}

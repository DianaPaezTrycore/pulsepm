import { useState } from 'react'


const COLSPAN_TOTAL = 12


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

  const inputClass = 'w-full border border-ink-300 rounded px-2 py-1 focus:ring-2 focus:ring-pulse-500 focus:border-pulse-500 focus:outline-none'

  return (
    <>
      <tr className="bg-pulse-50 border-t border-pulse-200">
        <td className="px-2 py-1">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={inputClass}
            required
            maxLength={255}
            placeholder="Nombre"
            autoFocus
          />
        </td>
        <td className="px-2 py-1">
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={bac}
            onChange={(event) => setBac(event.target.value)}
            className={`${inputClass} text-right`}
            required
          />
        </td>
        <td className="px-2 py-1">
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={planned}
            onChange={(event) => setPlanned(event.target.value)}
            className={`${inputClass} text-right`}
            required
          />
        </td>
        <td className="px-2 py-1">
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={actual}
            onChange={(event) => setActual(event.target.value)}
            className={`${inputClass} text-right`}
            required
          />
        </td>
        <td className="px-2 py-1">
          <input
            type="number"
            min="0"
            step="0.01"
            value={actualCost}
            onChange={(event) => setActualCost(event.target.value)}
            className={`${inputClass} text-right`}
            required
          />
        </td>
        <td colSpan={6} className="px-3 py-2 text-xs text-ink-500 italic">
          Los indicadores se recalculan al guardar
        </td>
        <td className="px-3 py-2 text-right whitespace-nowrap">
          <button
            type="button"
            onClick={handleSave}
            disabled={submitting || !name.trim()}
            className="text-pulse-600 hover:underline mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="text-ink-500 hover:underline"
          >
            Cancelar
          </button>
        </td>
      </tr>
      {error && (
        <tr className="bg-red-50">
          <td colSpan={COLSPAN_TOTAL} className="px-3 py-2 text-sm text-red-700">
            {error}
          </td>
        </tr>
      )}
    </>
  )
}

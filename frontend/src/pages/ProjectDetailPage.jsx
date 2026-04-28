import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'

import { api } from '../services/api'
import ProjectSummary from '../components/ProjectSummary.jsx'
import ActivityTable from '../components/ActivityTable.jsx'
import EVMChart from '../components/EVMChart.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'

const EVM_TERMS = [
  { abbr: 'BAC', name: 'Budget at Completion', formula: '—', desc: 'Presupuesto total planificado para la actividad o proyecto.' },
  { abbr: 'PV', name: 'Planned Value', formula: '% planificado × BAC', desc: 'Valor del trabajo que debería haberse completado hasta ahora según el plan.' },
  { abbr: 'EV', name: 'Earned Value', formula: '% completado × BAC', desc: 'Valor del trabajo realmente completado hasta la fecha.' },
  { abbr: 'AC', name: 'Actual Cost', formula: '—', desc: 'Costo real incurrido por el trabajo ejecutado hasta la fecha.' },
  { abbr: 'CV', name: 'Cost Variance', formula: 'EV − AC', desc: 'Desviación de costo. Positivo = bajo presupuesto. Negativo = sobre presupuesto.' },
  { abbr: 'SV', name: 'Schedule Variance', formula: 'EV − PV', desc: 'Desviación de cronograma. Positivo = adelantado. Negativo = atrasado.' },
  { abbr: 'CPI', name: 'Cost Performance Index', formula: 'EV / AC', desc: 'Eficiencia en costos. Mayor a 1 = eficiente. Menor a 1 = se gasta más de lo que se avanza.' },
  { abbr: 'SPI', name: 'Schedule Performance Index', formula: 'EV / PV', desc: 'Eficiencia en cronograma. Mayor a 1 = adelantado. Menor a 1 = atrasado.' },
  { abbr: 'EAC', name: 'Estimate at Completion', formula: 'BAC / CPI', desc: 'Estimación del costo total del proyecto si se mantiene el ritmo actual.' },
  { abbr: 'VAC', name: 'Variance at Completion', formula: 'BAC − EAC', desc: 'Diferencia entre el presupuesto original y el estimado final. Negativo indica sobrecoste.' },
]

function EVMGlossary() {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-sm font-bold text-slate-800">Guía de indicadores EVM</h3>
        </div>
        <svg className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="border-t border-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {EVM_TERMS.map((t, i) => (
              <div key={t.abbr} className={`flex gap-3 px-5 py-3.5 ${i % 2 === 0 && i === EVM_TERMS.length - 1 ? 'sm:col-span-2' : ''} border-b border-slate-100 last:border-0`}>
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                  <span className="text-xs font-extrabold text-blue-600">{t.abbr}</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-slate-800">{t.name}</p>
                    {t.formula !== '—' && (
                      <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{t.formula}</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-snug">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


function ProjectHeader({ project, onSaveName }) {
  const [editing, setEditing] = useState(false)
  const [draftName, setDraftName] = useState(project.name)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  function startEditing() {
    setDraftName(project.name)
    setError(null)
    setEditing(true)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      await onSaveName(draftName.trim())
      setEditing(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (editing) {
    return (
      <div>
        <div className="flex items-center gap-2">
          <input
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            className="text-xl font-bold text-slate-900 border-b-2 border-blue-500 focus:outline-none px-1 py-0.5 bg-transparent flex-1"
            maxLength={255}
            autoFocus
          />
          <button
            onClick={handleSave}
            disabled={saving || !draftName.trim()}
            className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            onClick={() => setEditing(false)}
            className="text-sm text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>
        </div>
        {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <h2 className="text-xl font-bold text-slate-900">{project.name}</h2>
      <button
        onClick={startEditing}
        className="text-xs text-blue-600 hover:text-blue-800 border border-blue-200 px-2.5 py-1 rounded-lg hover:bg-blue-50 transition-colors font-medium"
      >
        Editar
      </button>
    </div>
  )
}


export default function ProjectDetailPage() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [addingNew, setAddingNew] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  async function loadProject() {
    try {
      setLoading(true)
      setError(null)
      const data = await api.get(`/projects/${id}`)
      setProject(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProject()
  }, [id])

  async function handleSaveName(newName) {
    await api.put(`/projects/${id}`, {
      name: newName,
      description: project.description,
    })
    await loadProject()
  }

  async function handleAddActivity(data) {
    await api.post(`/projects/${id}/activities`, data)
    setAddingNew(false)
    await loadProject()
  }

  async function handleEditActivity(activityId, data) {
    await api.put(`/projects/${id}/activities/${activityId}`, data)
    setEditingId(null)
    await loadProject()
  }

  async function handleDeleteActivity(activity) {
    setConfirmDelete(activity)
  }

  async function confirmDeleteActivity() {
    if (!confirmDelete) return
    try {
      await api.delete(`/projects/${id}/activities/${confirmDelete.id}`)
      await loadProject()
    } catch (err) {
      setError(err.message)
    } finally {
      setConfirmDelete(null)
    }
  }

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto p-6 flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Cargando proyecto...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-4">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors font-medium">
          ← Volver a proyectos
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-red-700 text-sm">No se pudo cargar el proyecto</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <button
              onClick={loadProject}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors font-medium"
            >
              Reintentar
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <>
    <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors font-medium group">
        <span className="group-hover:-translate-x-0.5 transition-transform inline-block">←</span>
        Volver a proyectos
      </Link>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <ProjectHeader project={project} onSaveName={handleSaveName} />
        {project.description && (
          <p className="text-slate-500 mt-3 text-sm leading-relaxed border-t border-slate-100 pt-3">{project.description}</p>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Indicadores EVM</p>
        <ProjectSummary indicators={project.project_indicators} />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Gráfico EVM</h3>
        </div>
        <div className="p-4">
          <EVMChart activities={project.activities} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Actividades del proyecto</h3>
          {!addingNew && editingId === null && (
            <button
              onClick={() => setAddingNew(true)}
              className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors flex items-center gap-1.5"
            >
              <span className="text-base leading-none">+</span>
              Agregar actividad
            </button>
          )}
        </div>
        <ActivityTable
          activities={project.activities}
          totals={project.project_indicators}
          editingId={editingId}
          addingNew={addingNew}
          onEdit={setEditingId}
          onDelete={handleDeleteActivity}
          onSaveEdit={handleEditActivity}
          onCancelEdit={() => setEditingId(null)}
          onSaveAdd={handleAddActivity}
          onCancelAdd={() => setAddingNew(false)}
        />
      </div>

      <EVMGlossary />
    </main>
    {confirmDelete && (
      <ConfirmModal
        title={`Eliminar "${confirmDelete.name}"`}
        message="¿Estás seguro? Esta acción no se puede deshacer."
        confirmLabel="Eliminar actividad"
        onConfirm={confirmDeleteActivity}
        onCancel={() => setConfirmDelete(null)}
      />
    )}
    </>
  )
}

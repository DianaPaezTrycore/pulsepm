import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'

import { api } from '../services/api'
import ProjectSummary from '../components/ProjectSummary.jsx'
import ActivityTable from '../components/ActivityTable.jsx'
import EVMChart from '../components/EVMChart.jsx'


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
            className="text-2xl font-bold text-ink-900 border-b-2 border-pulse-500 focus:outline-none px-1 py-0.5 bg-transparent"
            maxLength={255}
            autoFocus
          />
          <button
            onClick={handleSave}
            disabled={saving || !draftName.trim()}
            className="text-pulse-600 hover:underline disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            onClick={() => setEditing(false)}
            className="text-ink-500 hover:underline"
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
      <h2 className="text-2xl font-bold text-ink-900">{project.name}</h2>
      <button
        onClick={startEditing}
        className="text-sm text-pulse-600 hover:underline"
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
    const confirmed = window.confirm(
      `¿Eliminar la actividad "${activity.name}"?`
    )
    if (!confirmed) return
    try {
      await api.delete(`/projects/${id}/activities/${activity.id}`)
      await loadProject()
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto p-6 text-ink-500">
        Cargando proyecto...
      </main>
    )
  }

  if (error) {
    return (
      <main className="max-w-7xl mx-auto p-6 space-y-4">
        <Link to="/" className="text-pulse-600 hover:underline inline-block">
          ← Volver a proyectos
        </Link>
        <p className="text-red-600">Error: {error}</p>
        <button
          onClick={loadProject}
          className="px-4 py-2 bg-pulse-500 text-white rounded hover:bg-pulse-600"
        >
          Reintentar
        </button>
      </main>
    )
  }

  return (
    <main className="max-w-7xl mx-auto p-6 space-y-6">
      <Link to="/" className="text-pulse-600 hover:underline inline-block">
        ← Volver a proyectos
      </Link>

      <div>
        <ProjectHeader project={project} onSaveName={handleSaveName} />
        {project.description && (
          <p className="text-ink-500 mt-2">{project.description}</p>
        )}
      </div>

      <ProjectSummary indicators={project.project_indicators} />

      <section>
        <h3 className="text-xl font-bold text-ink-900 mb-3">Gráfico EVM</h3>
        <EVMChart activities={project.activities} />
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold text-ink-900">Actividades</h3>
          {!addingNew && editingId === null && (
            <button
              onClick={() => setAddingNew(true)}
              className="bg-pulse-500 text-white px-4 py-2 rounded font-medium hover:bg-pulse-600"
            >
              + Agregar actividad
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
      </section>
    </main>
  )
}

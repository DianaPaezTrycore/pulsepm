import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

import { api } from '../services/api'


function ProjectCard({ project, onDelete }) {
  return (
    <article className="bg-white rounded-lg shadow-sm border border-ink-200 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold text-ink-900">{project.name}</h3>
      <p className="text-ink-500 text-sm flex-1 min-h-[2.5rem]">
        {project.description || <span className="italic">Sin descripción</span>}
      </p>
      <div className="flex gap-2 mt-2">
        <Link
          to={`/projects/${project.id}`}
          className="bg-pulse-500 text-white px-4 py-2 rounded text-sm font-medium hover:bg-pulse-600 transition-colors"
        >
          Ver detalle
        </Link>
        <button
          onClick={() => onDelete(project)}
          className="text-red-600 border border-red-200 px-4 py-2 rounded text-sm hover:bg-red-50 transition-colors"
        >
          Eliminar
        </button>
      </div>
    </article>
  )
}


function NewProjectModal({ onClose, onSubmit }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || null,
      })
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-ink-900">Nuevo proyecto</h2>
          <button
            onClick={onClose}
            className="text-ink-500 hover:text-ink-900 text-xl leading-none"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">
              Nombre <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={255}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full border border-ink-300 rounded px-3 py-2 focus:ring-2 focus:ring-pulse-500 focus:border-pulse-500 focus:outline-none"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              className="w-full border border-ink-300 rounded px-3 py-2 focus:ring-2 focus:ring-pulse-500 focus:border-pulse-500 focus:outline-none"
            />
          </div>
          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-ink-700 border border-ink-300 rounded hover:bg-ink-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="px-4 py-2 bg-pulse-500 text-white rounded hover:bg-pulse-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creando...' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


export default function ProjectListPage() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)

  async function loadProjects() {
    try {
      setLoading(true)
      setError(null)
      const data = await api.get('/projects')
      setProjects(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  async function handleCreate(payload) {
    await api.post('/projects', payload)
    setShowModal(false)
    loadProjects()
  }

  async function handleDelete(project) {
    const confirmed = window.confirm(
      `¿Eliminar "${project.name}"? Esta acción borrará también sus actividades.`
    )
    if (!confirmed) return
    try {
      await api.delete(`/projects/${project.id}`)
      loadProjects()
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto p-6 text-ink-500">
        Cargando proyectos...
      </main>
    )
  }

  if (error) {
    return (
      <main className="max-w-7xl mx-auto p-6">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <button
          onClick={loadProjects}
          className="px-4 py-2 bg-pulse-500 text-white rounded hover:bg-pulse-600"
        >
          Reintentar
        </button>
      </main>
    )
  }

  return (
    <main className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-ink-900">Proyectos</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-pulse-500 text-white px-4 py-2 rounded font-medium hover:bg-pulse-600"
        >
          + Nuevo proyecto
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16 text-ink-500 border-2 border-dashed border-ink-200 rounded-lg">
          <p className="text-lg mb-1">No hay proyectos todavía.</p>
          <p className="text-sm">Crea el primero para empezar a medir EVM.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showModal && (
        <NewProjectModal
          onClose={() => setShowModal(false)}
          onSubmit={handleCreate}
        />
      )}
    </main>
  )
}

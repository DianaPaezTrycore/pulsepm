import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

import { api } from '../services/api'


function ProjectCard({ project }) {
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
      </div>
    </article>
  )
}


export default function ProjectListPage() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16 text-ink-500 border-2 border-dashed border-ink-200 rounded-lg">
          <p className="text-lg mb-1">No hay proyectos todavía.</p>
          <p className="text-sm">Crea el primero para empezar a medir EVM.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </main>
  )
}

import React from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'

import ProjectListPage from './pages/ProjectListPage.jsx'
import ProjectDetailPage from './pages/ProjectDetailPage.jsx'

function NavLink({ to, icon, children }) {
  const location = useLocation()
  const active = location.pathname === to
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
        active
          ? 'bg-blue-600 text-white shadow-sm'
          : 'text-white/60 hover:text-white hover:bg-white/10'
      }`}
    >
      {icon}
      {children}
    </Link>
  )
}

function Header() {
  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-40 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="PulsePM" className="h-10 w-10 flex-shrink-0" />
          <div className="leading-none">
            <span className="text-base font-bold tracking-tight">PulsePM</span>
            <span className="block text-white/40 text-xs font-medium mt-0.5">Earned Value Management</span>
          </div>
        </div>
        <nav className="flex items-center">
            <NavLink
              to="/"
              icon={
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
              }
            >
              Proyectos
            </NavLink>
          </nav>
      </div>
    </header>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<ProjectListPage />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

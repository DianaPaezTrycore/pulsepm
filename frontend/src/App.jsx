import { BrowserRouter, Routes, Route } from 'react-router-dom'

import ProjectListPage from './pages/ProjectListPage.jsx'

function Header() {
  return (
    <header className="bg-pulse-500 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
        <img src="/hedgehog.svg" alt="PulsePM logo" className="h-10 w-10" />
        <h1 className="text-2xl font-bold tracking-tight">PulsePM</h1>
      </div>
    </header>
  )
}

function DetailPlaceholder() {
  return (
    <main className="max-w-7xl mx-auto p-6">
      <h2 className="text-xl text-ink-700">Project detail (coming soon)</h2>
    </main>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<ProjectListPage />} />
        <Route path="/projects/:id" element={<DetailPlaceholder />} />
      </Routes>
    </BrowserRouter>
  )
}

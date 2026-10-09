import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'

// Halaman Materi (Markdown, Prism, visualizer) baru diunduh saat pertama kali dibuka,
// sehingga Home tetap ringan.
const Material = lazy(() => import('./pages/Material.jsx'))

function PageLoading() {
  return (
    <main id="konten" tabIndex={-1} className="min-h-screen bg-orange-50 p-6 text-stone-900 outline-none">
      <p role="status">Memuat halaman…</p>
    </main>
  )
}

export default function App() {
  return (
    <>
      <button
        type="button"
        onClick={() => document.getElementById('konten')?.focus()}
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-stone-900 focus:px-4 focus:py-2 focus:text-white"
      >
        Lewati ke konten utama
      </button>
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/materi/:id" element={<Material />} />
        </Routes>
      </Suspense>
    </>
  )
}
import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import AppShell from './layout/AppShell.jsx'
import PwaEvents from './pwa/PwaEvents.jsx'
import { PageLoading, ToastProvider } from './ui/index.js'
import Algoritma from './pages/Algoritma.jsx'
import AlgoritmaDetail from './pages/AlgoritmaDetail.jsx'
import Bandingkan from './pages/Bandingkan.jsx'
import Segera from './pages/Segera.jsx'

// Halaman Materi (Markdown, Prism, visualizer) baru diunduh saat pertama kali dibuka,
// sehingga Home tetap ringan.
const Material = lazy(() => import('./pages/Material.jsx'))
// Halaman peninjauan komponen desain baru (token, ikon, maskot, komponen dasar). Hanya untuk pengembangan dan QA.
const UiKit = lazy(() => import('./pages/UiKit.jsx'))

export default function App() {
  return (
    <ToastProvider>
      <PwaEvents />
      <button
        type="button"
        onClick={() => document.getElementById('konten')?.focus()}
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-stone-900 focus:px-4 focus:py-2 focus:text-white"
      >
        Lewati ke konten utama
      </button>
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<Algoritma />} />
            <Route path="/algoritma/bandingkan/:a/:b" element={<Bandingkan />} />
            <Route path="/algoritma/:id" element={<AlgoritmaDetail />} />
            <Route
              path="/materi"
              element={<Segera judul="Materi" catatan="24 modul baru sedang disiapkan. Sementara itu materi lama masih bisa dibuka." tautan={{ to: '/materi-lama', label: 'Buka materi lama' }} />}
            />
            <Route path="/quiz" element={<Segera judul="Quiz" catatan="Kuis per modul akan muncul di sini." />} />
            <Route path="/credit" element={<Segera judul="Credit" catatan="Progres belajar, glosarium, tim, dan sumber akan muncul di sini." />} />
          </Route>
          <Route path="/materi-lama" element={<Home />} />
          <Route path="/materi/:id" element={<Material />} />
          <Route path="/ui" element={<UiKit />} />
        </Routes>
      </Suspense>
    </ToastProvider>
  )
}
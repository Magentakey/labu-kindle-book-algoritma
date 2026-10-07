import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Material from './pages/Material.jsx'

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
      <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/materi/:id" element={<Material />} />
      </Routes>
    </>
  )
}
import { Link, useParams } from 'react-router-dom'
import materials from '../content/materials.json'

export default function Material() {
  const { id } = useParams()
  const m = materials.find((x) => x.id === id)

  if (!m) return <div className="p-6">Materi tidak ditemukan.</div>

  return (
    <div className="min-h-screen bg-emerald-100 p-6">
      <Link to="/" className="underline">← Kembali</Link>
      <h1 className="mt-4 text-xl font-bold">Materi {m.no}: {m.title}</h1>
      <p className="mt-2">
        {m.hasText ? 'Teks materi akan tampil di sini.' : 'Konten segera hadir.'}
      </p>
    </div>
  )
}
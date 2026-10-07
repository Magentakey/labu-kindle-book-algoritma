import { Link } from 'react-router-dom'
import materials from '../content/materials.json'

export default function Home() {
  return (
    <main className="min-h-screen bg-emerald-100 p-6">
      <h1 className="text-2xl font-bold">Algo Book</h1>
      <p className="mb-6">Belajar algoritma secara interaktif</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {materials.map((m) => (
          <Link
            key={m.id}
            to={`/materi/${m.id}`}
            className="rounded-xl bg-emerald-300 p-4 hover:bg-emerald-400"
          >
            <div className="text-sm">Materi {m.no}</div>
            <div className="font-semibold">{m.title}</div>
            <div className="text-sm">{m.desc}</div>
          </Link>
        ))}
      </div>
    </main>
  )
}
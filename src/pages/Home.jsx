import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import materials from '../content/materials.json'
import { hasChallenge } from '../lib/loadChallenge.js'
import { progress } from '../lib/storage.js'

function Badge({ children, dashed = false }) {
  return (
    <span
      className={
        'inline-block rounded-full px-2 py-0.5 text-xs font-semibold ' +
        (dashed
          ? 'border border-dashed border-stone-700 text-stone-900'
          : 'bg-stone-900 text-orange-50')
      }
    >
      {children}
    </span>
  )
}

export default function Home() {
  const [solved] = useState(() => new Set(progress.solvedIds()))
  const totalSoal = materials.filter((m) => m.challenge && hasChallenge(m.challenge)).length
  const selesai = materials.filter((m) => m.challenge && hasChallenge(m.challenge) && solved.has(m.challenge)).length

  useEffect(() => {
    document.title = 'Labu I-Learning Algoritma'
  }, [])

  return (
    <main id="konten" tabIndex={-1} className="min-h-screen bg-orange-50 text-stone-900 outline-none">
      <header className="mx-auto flex max-w-5xl items-center gap-4 px-6 pt-8">
        <img src={`${import.meta.env.BASE_URL}icon-192.png`} alt="" className="h-16 w-16 rounded-xl" />
        <div>
          <h1 className="text-2xl font-bold">Labu I-Learning Algoritma</h1>
          <p>Belajar algoritma secara interaktif</p>
        </div>
      </header>

      <section aria-labelledby="daftar-materi" className="mx-auto max-w-5xl px-6 py-8">
        <h2 id="daftar-materi" className="mb-2 text-xl font-semibold">Daftar Materi</h2>
        <p className="mb-4">
          Soal selesai: {selesai} dari {totalSoal}
        </p>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {materials.map((m) => (
            <li key={m.id}>
              <Link
                to={`/materi/${m.id}`}
                className={
                  'flex h-full flex-col gap-2 rounded-xl bg-orange-200 p-4 hover:bg-orange-300 ' +
                  'focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-stone-900 ' +
                  (m.hasText ? '' : 'border-2 border-dashed border-stone-700')
                }
              >
                <span className="text-sm font-medium">Materi {m.no}</span>
                <span className="font-semibold">{m.title}</span>
                <span className="text-sm">{m.desc}</span>
                <span className="mt-auto flex flex-wrap gap-2 pt-2">
                  {m.hasText ? <Badge>Teks</Badge> : <Badge dashed>Segera hadir</Badge>}
                  {m.visualizer && <Badge>Visualisasi</Badge>}
                  {m.challenge &&
                    (hasChallenge(m.challenge) ? (
                      solved.has(m.challenge) ? (
                        <Badge>
                          <span aria-hidden="true">✓ </span>Soal selesai
                        </Badge>
                      ) : (
                        <Badge>Soal</Badge>
                      )
                    ) : (
                      <Badge dashed>Soal segera hadir</Badge>
                    ))}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
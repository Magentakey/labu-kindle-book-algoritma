import { useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import materials from '../content/materials.json'
import DemoInsertion from '../components/AlgoVisualizer/DemoInsertion.jsx'

export default function Material() {
  const { id } = useParams()
  const m = materials.find((x) => x.id === id)
  const headingRef = useRef(null)

  useEffect(() => {
    document.title = m ? `Materi ${m.no}: ${m.title} | Labu I-Learning` : 'Materi tidak ditemukan | Labu I-Learning'
    headingRef.current?.focus()
  }, [id, m])

  if (!m) {
    return (
      <main id="konten" tabIndex={-1} className="min-h-screen bg-orange-50 p-6 text-stone-900 outline-none">
        <h1 className="text-xl font-bold">Materi tidak ditemukan</h1>
        <Link to="/" className="mt-4 inline-block underline">← Kembali ke daftar materi</Link>
      </main>
    )
  }

  return (
    <main id="konten" tabIndex={-1} className="min-h-screen bg-orange-50 text-stone-900 outline-none">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <Link
          to="/"
          className="underline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
        >
          ← Kembali ke daftar materi
        </Link>

        <h1 ref={headingRef} tabIndex={-1} className="mt-4 text-2xl font-bold outline-none">
          Materi {m.no}: {m.title}
        </h1>

        <section aria-labelledby="sec-teks" className="mt-6">
          <h2 id="sec-teks" className="text-xl font-semibold">Penjelasan</h2>
          <p className="mt-2">
            {m.hasText ? 'Teks materi akan tampil di sini.' : 'Konten materi segera hadir.'}
          </p>
        </section>

        {m.visualizer && (
          <section aria-labelledby="sec-visual" className="mt-8">
            <h2 id="sec-visual" className="text-xl font-semibold">Visualisasi</h2>
            {m.visualizer === 'insertionSort' ? (
              <DemoInsertion />
            ) : (
              <p className="mt-2 rounded-xl border-2 border-dashed border-stone-700 bg-orange-100 p-4">
                Visualisasi langkah demi langkah akan tampil di sini.
              </p>
            )}
          </section>
        )}

        {m.challenge && (
          <section aria-labelledby="sec-soal" className="mt-8">
            <h2 id="sec-soal" className="text-xl font-semibold">Soal Challenge</h2>
            <p className="mt-2 rounded-xl border-2 border-dashed border-stone-700 bg-orange-100 p-4">
              Editor kode dan test case akan tampil di sini.
            </p>
          </section>
        )}
      </div>
    </main>
  )
}
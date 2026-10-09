import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import materials from '../content/materials.json'
import { visualizers } from '../algorithms/registry.js'
import { loadMaterialText } from '../lib/loadMaterialText.js'
import { splitContent } from '../lib/splitContent.js'

// Bagian berat dimuat hanya saat dibutuhkan (react-markdown, Prism, visualizer).
const MarkdownView = lazy(() => import('../components/MarkdownView/MarkdownView.jsx'))
const AlgoVisualizer = lazy(() => import('../components/AlgoVisualizer/AlgoVisualizer.jsx'))

const placeholderClass = 'mt-2 rounded-xl border-2 border-dashed border-stone-700 bg-orange-100 p-4'

function Loading({ children = 'Memuat materi…', className = 'mt-6' }) {
  return (
    <p role="status" className={className}>
      {children}
    </p>
  )
}

function TextNotice({ status }) {
  if (status === 'error') {
    return (
      <p role="alert" className="mt-6 rounded-xl border-2 border-stone-900 bg-white p-4">
        Teks materi gagal dimuat. Periksa koneksi, lalu muat ulang halaman.
      </p>
    )
  }
  return (
    <section aria-labelledby="sec-teks" className="mt-6">
      <h2 id="sec-teks" className="text-xl font-semibold">Penjelasan</h2>
      <p className={placeholderClass}>Teks materi ini belum tersedia.</p>
    </section>
  )
}

function MaterialPage({ m }) {
  const headingRef = useRef(null)
  const [state, setState] = useState({ status: 'loading', text: '' })

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  useEffect(() => {
    let cancelled = false
    loadMaterialText(m.id)
      .then((text) => {
        if (!cancelled) setState(text === null ? { status: 'missing', text: '' } : { status: 'ready', text })
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error', text: '' })
      })
    return () => {
      cancelled = true
    }
  }, [m.id])

  const segments = splitContent(state.text, {
    hasVisualizer: Boolean(m.visualizer),
    hasChallenge: Boolean(m.challenge),
  })

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

        {state.status === 'loading' && <Loading />}
        {(state.status === 'missing' || state.status === 'error') && <TextNotice status={state.status} />}

        {state.status !== 'loading' &&
          segments.map((seg, i) => {
            if (seg.type === 'markdown') {
              return (
                <div key={i} className="mt-6 max-w-3xl">
                  <Suspense fallback={<Loading />}>
                    <MarkdownView text={seg.text} />
                  </Suspense>
                </div>
              )
            }
            if (seg.type === 'visualizer') {
              return (
                <section key={i} aria-labelledby="sec-visual" className="mt-8">
                  <h2 id="sec-visual" className="text-xl font-semibold">Visualisasi</h2>
                  {visualizers[m.visualizer] ? (
                    <Suspense fallback={<Loading className="mt-2 min-h-64">Memuat visualisasi…</Loading>}>
                      <AlgoVisualizer {...visualizers[m.visualizer]} />
                    </Suspense>
                  ) : (
                    <p className={placeholderClass}>Visualisasi langkah demi langkah akan tampil di sini.</p>
                  )}
                </section>
              )
            }
            return (
              <section key={i} aria-labelledby="sec-soal" className="mt-8">
                <h2 id="sec-soal" className="text-xl font-semibold">Soal Challenge</h2>
                <p className={placeholderClass}>Editor kode dan test case akan tampil di sini.</p>
              </section>
            )
          })}
      </div>
    </main>
  )
}

export default function Material() {
  const { id } = useParams()
  const m = materials.find((x) => x.id === id)

  useEffect(() => {
    document.title = m ? `Materi ${m.no}: ${m.title} | Labu I-Learning` : 'Materi tidak ditemukan | Labu I-Learning'
  }, [m])

  if (!m) {
    return (
      <main id="konten" tabIndex={-1} className="min-h-screen bg-orange-50 p-6 text-stone-900 outline-none">
        <h1 className="text-xl font-bold">Materi tidak ditemukan</h1>
        <Link to="/" className="mt-4 inline-block underline">← Kembali ke daftar materi</Link>
      </main>
    )
  }

  // key = id: pindah materi membuat halaman baru dengan state bersih (tanpa setState di effect).
  return <MaterialPage key={m.id} m={m} />
}

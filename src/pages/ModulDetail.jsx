import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { modulKonten } from '../content/modul/index.js'
import MarkdownView from '../components/MarkdownView/MarkdownView.jsx'
import { TOTAL_MODUL, modulById, neighbors } from '../data/modul.js'
import { parseModul } from '../lib/modulContent.js'
import { Callout, KasusCards, KodeBlok, LoopStepper, Tantangan } from '../materi/blocks.jsx'
import KuisModul from '../materi/KuisModul.jsx'
import ModulBar from '../materi/ModulBar.jsx'
import { useScrollSpy } from '../materi/scroll.js'
import { markRead, useProgress } from '../materi/useProgress.js'
import { Button, Chip, ErrorState, Icon, PageLoading } from '../ui/index.js'
import { cx } from '../ui/cx.js'
import { useOfflineReady } from '../ui/useOfflineReady.js'
import { sections as tabs } from '../data/modul.js'
import { entryOf } from '../lib/progress.js'

const Md = ({ text, inline }) => <MarkdownView variant="modul" text={text} inline={inline} />
const pdfUrl = (m) => `${import.meta.env.BASE_URL}${m.pdf}`
const IDS = tabs.map((t) => t.id)

function Eyebrow({ children }) {
  return children ? <p className="text-label text-accent uppercase">{children}</p> : null
}

function Kartu({ judul, children, className }) {
  return (
    <section className={cx('rounded-sm border border-line bg-card p-4 md:p-5', className)}>
      <h2 className="text-label text-accent mb-2 uppercase">{judul}</h2>
      {children}
    </section>
  )
}

function Hero({ m, offline }) {
  return (
    <header>
      <p className="text-label text-accent uppercase">
        Modul {m.id} · {m.bab} · {m.topik}
      </p>
      <h1 className="text-h1 mt-2 text-heading">{m.judulPanjang}</h1>
      <p className="text-body-l mt-3 text-ink-soft">{m.ringkas}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button as={Link} to={`/algoritma/${m.algoritmaId}`} variant="navigasi" icon="play">
          Lihat di Visualizer
        </Button>
        <Button as="a" href={pdfUrl(m)} target="_blank" rel="noopener noreferrer" variant="navigasiGaris" icon="ext">
          Lihat PDF asli
          <span className="sr-only"> (membuka tab baru)</span>
        </Button>
        <Button as="a" href={pdfUrl(m)} download variant="kontrol" icon="download">
          Unduh PDF
        </Button>
        {offline && <Chip type="prasyarat">Tersedia offline</Chip>}
        <span className="text-caption text-ink-soft">
          {m.halaman} hlm · {m.soal} soal · ±{m.menit} menit
        </span>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <Kartu judul="Tujuan pembelajaran">
          <ul className="space-y-2">
            {m.tujuan.map((t) => (
              <li key={t} className="text-body flex gap-3 text-ink">
                <span className="mt-2 size-2 shrink-0 bg-muted" aria-hidden="true" />
                <span className="min-w-0">
                  <Md text={t} inline />
                </span>
              </li>
            ))}
          </ul>
        </Kartu>
        <div className="space-y-4">
          <Kartu judul="Prasyarat">
            <p className="text-body text-ink">{m.prasyaratTeks}</p>
          </Kartu>
          <Kartu judul="Materi asal">
            <p className="text-body text-ink">{m.materiAsal}</p>
          </Kartu>
          <Kartu judul="Posisi dalam urutan belajar">
            <ol className="flex flex-wrap items-center gap-2">
              {m.posisi.urutan.map((u, i) => (
                <li key={u} className="flex items-center gap-2">
                  {i > 0 && <Icon name="arrowR" size={14} className="text-ink-soft" />}
                  <span className={cx('text-pixel-s rounded-sm border px-2.5 py-1.5', i === m.posisi.aktif ? 'border-brand-burnt bg-brand-orange text-on-orange shadow-glow' : 'border-line bg-card text-ink')} aria-current={i === m.posisi.aktif ? 'step' : undefined}>
                    {u}
                  </span>
                </li>
              ))}
            </ol>
            <p className="text-caption mt-2 text-ink-soft">{m.posisi.catatan}</p>
          </Kartu>
        </div>
      </div>
    </header>
  )
}

function Blok({ b, m, konten }) {
  if (b.type === 'md') return <Md text={b.text} />
  if (b.type === 'callout') return <Callout jenis={b.jenis} judul={b.judul} text={b.text} />
  if (b.name === 'kode') return <KodeBlok />
  if (b.name === 'loops') return <LoopStepper visualizerHref={`/algoritma/${m.algoritmaId}`} />
  if (b.name === 'kasus') return <KasusCards />
  if (b.name === 'tantangan') return <Tantangan muat={konten.tantangan} />
  return null
}

function Isi({ m }) {
  const konten = modulKonten[m.id]
  const [state, setState] = useState({ status: 'muat' })
  const progress = useProgress()
  const offline = useOfflineReady()
  const { prev, next } = neighbors(m.id)

  useEffect(() => {
    let batal = false
    Promise.all([konten.teks(), konten.kuis()]).then(
      ([teks, kuis]) => !batal && setState({ status: 'siap', bagian: parseModul(teks), kuis }),
      () => !batal && setState({ status: 'gagal' }),
    )
    return () => {
      batal = true
    }
  }, [konten])
  useEffect(() => {
    document.title = `${m.judul} · Modul ${m.id} · LABU`
  }, [m])

  const { aktif, baca } = useScrollSpy(IDS)
  useEffect(() => {
    if (state.status === 'siap') markRead(m.id, aktif)
  }, [state.status, m.id, aktif])

  const hasilKuis = entryOf(progress, m.id).kuis.hasil
  const ref = useMemo(() => (state.status === 'siap' ? state.bagian.find((s) => s.id === 'referensi') : null), [state])
  if (state.status === 'muat') return <PageLoading label="Memuat modul…" />
  if (state.status === 'gagal') return <ErrorState judul="Modul tidak bisa dimuat" pesan="Isi modul gagal dimuat. Periksa koneksi, lalu coba lagi." aksi={[{ label: 'Coba lagi', icon: 'refresh', onClick: () => setState({ status: 'muat' }) }]} />

  const isiBagian = state.bagian.filter((s) => s.id !== 'referensi')
  return (
    <>
      <ModulBar modul={m} total={TOTAL_MODUL} aktif={aktif} baca={baca} prev={prev} next={next} />
      <article className="mx-auto w-full max-w-[860px] px-4 pb-8 pt-6 md:px-8">
        <Hero m={m} offline={offline} />
        {isiBagian.map((s) => (
          <section key={s.id} id={`sec-${s.id}`} aria-labelledby={`h-${s.id}`} className="mt-12 scroll-mt-32">
            <Eyebrow>{s.eyebrow}</Eyebrow>
            <h2 id={`h-${s.id}`} className="text-h2 mt-1 text-heading">
              {s.judul}
            </h2>
            {s.blok.map((b, i) => (
              <Blok key={i} b={b} m={m} konten={konten} />
            ))}
          </section>
        ))}
        <section id="sec-kuis" aria-labelledby="h-kuis" className="mt-12 scroll-mt-32">
          <Eyebrow>{hasilKuis ? `Modul ${m.id} · Kuis pemahaman` : 'Kuis pemahaman'}</Eyebrow>
          <h2 id="h-kuis" className="text-h2 mb-4 mt-1 text-heading">
            {hasilKuis ? `Hasil Kuis · ${state.kuis.judul}` : 'Kuis Pemahaman'}
          </h2>
          <KuisModul modul={m} kuis={state.kuis} next={next} />
        </section>
        {ref && (
          <section id="sec-referensi" aria-labelledby="h-referensi" className="mt-12 scroll-mt-32">
            <h2 id="h-referensi" className="text-h2 text-heading">
              {ref.judul}
            </h2>
            {ref.blok.map((b, i) => (
              <Blok key={i} b={b} m={m} konten={konten} />
            ))}
          </section>
        )}
      </article>
    </>
  )
}

/** Halaman modul (Figma: Materi Detail). Teks dimuat dari src/content/modul; kemajuan baca dicatat saat bagian dilihat. */
export default function ModulDetail({ id }) {
  const m = modulById(id)
  if (!m || !modulKonten[id]) {
    return (
      <div className="mx-auto max-w-[1344px] px-4 py-8 md:px-8">
        <ErrorState judul={`Modul ${id} belum tersedia`} pesan="Modul ini belum ditulis. Lihat daftar Materi untuk modul yang sudah tersedia." aksi={[{ label: 'Ke daftar Materi', onClick: () => { window.location.hash = '#/materi' } }]} />
      </div>
    )
  }
  return <Isi key={id} m={m} />
}

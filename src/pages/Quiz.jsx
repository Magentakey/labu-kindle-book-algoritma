import { useEffect, useMemo, useState } from 'react'
import { TOTAL_MODUL } from '../data/modul.js'
import { daftarKuis, tipeSoal } from '../data/quiz.js'
import { kelompokkan, ringkasan, saring } from '../lib/quizList.js'
import KuisKartu from '../quiz/KuisKartu.jsx'
import { useProgress } from '../materi/useProgress.js'
import { Button, Chip, Icon, Mascot, SearchField, Segmented, Select } from '../ui/index.js'
import { cx } from '../ui/cx.js'

const statusOpsi = [{ id: 'semua', label: 'Semua' }, { id: 'belum', label: 'Belum' }, { id: 'lulus', label: 'Lulus' }, { id: 'gagal', label: 'Gagal' }]
const modulOpsi = [{ value: 'semua', label: 'Semua modul' }, ...[...new Set(daftarKuis.map((k) => k.modul))].map((m) => ({ value: m, label: `Modul ${m}` }))]

/** Filter jenis soal: tombol hidup-mati (bisa dipilih lebih dari satu). Kosong = semua jenis. */
function JenisSoal({ nilai, onChange }) {
  return (
    <div role="group" aria-label="Jenis soal" className="flex flex-wrap items-center gap-2">
      {tipeSoal.map((t) => {
        const on = nilai.includes(t.id)
        return (
          <button
            key={t.id}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? nilai.filter((x) => x !== t.id) : [...nilai, t.id])}
            className={cx('text-caption inline-flex items-center gap-1.5 rounded-sm border px-2.5 py-1.5 transition-colors', on ? 'border-brand-blue bg-info-bg font-semibold text-control' : 'border-transparent bg-panel text-ink hover:border-line')}
          >
            <span className={cx('size-1.5 shrink-0', on ? 'bg-brand-blue' : 'bg-muted')} aria-hidden="true" />
            {t.label}
          </button>
        )
      })}
    </div>
  )
}

function Grup({ g, progres, tutup, onToggle }) {
  return (
    <section aria-labelledby={`grup-${g.id}`} className="min-w-0">
      <h2 id={`grup-${g.id}`} className="mb-4">
        <button type="button" aria-expanded={!tutup} aria-controls={`isi-${g.id}`} onClick={onToggle} className="flex w-full items-center gap-3 rounded-sm text-left">
          <Icon name="right" size={18} className={cx('shrink-0 text-ink transition-transform duration-[250ms] ease-in-out motion-reduce:transition-none', !tutup && 'rotate-90')} />
          <span className="text-h3 uppercase text-heading">{g.label}</span>
          <span className="text-h3 text-ink-soft">({g.items.length})</span>
          <span className="h-px flex-1 bg-line" aria-hidden="true" />
        </button>
      </h2>
      <div id={`isi-${g.id}`} hidden={tutup}>
        <div className="-mx-4 flex snap-x items-start gap-4 overflow-x-auto px-4 pb-3 md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0 md:pb-0 xl:grid-cols-4">
          {g.items.map((k) => (
            <KuisKartu key={k.id} k={k} tingkat={g} entry={progres[k.modul]} />
          ))}
        </div>
      </div>
    </section>
  )
}

/** Halaman Quiz (Figma: Quiz · Daftar): kuis dikelompokkan menurut tingkat, dengan pencarian dan filter modul, status, dan jenis soal. */
export default function Quiz() {
  const progres = useProgress()
  const [q, setQ] = useState('')
  const [modul, setModul] = useState('semua')
  const [status, setStatus] = useState('semua')
  const [tipe, setTipe] = useState([])
  const [tutup, setTutup] = useState({})
  useEffect(() => {
    document.title = 'Quiz · LABU'
  }, [])

  const ring = useMemo(() => ringkasan(daftarKuis, progres), [progres])
  const hasil = useMemo(() => saring(daftarKuis, progres, { q, modul, status, tipe }), [progres, q, modul, status, tipe])
  const grup = useMemo(() => kelompokkan(hasil), [hasil])
  const reset = () => {
    setQ('')
    setModul('semua')
    setStatus('semua')
    setTipe([])
  }

  return (
    <div className="mx-auto w-full max-w-[1344px] px-4 pt-5 md:px-8 md:pt-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-caption text-ink-soft">
            {ring.kuis} kuis · {ring.soal} soal dari {ring.modul} modul · {TOTAL_MODUL} modul direncanakan
          </p>
          <h1 className="text-h1 text-heading">Quiz</h1>
        </div>
        {ring.dicoba > 0 && (
          <div className="flex flex-wrap gap-2">
            <Chip type="sukses">Lulus {ring.lulus}</Chip>
            <Chip type="default">Rata-rata {ring.rataRata}%</Chip>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
          <SearchField value={q} onChange={setQ} label="Cari kuis" placeholder="Cari kuis…" className="md:w-[320px] md:shrink-0" />
          <Select label="Modul" value={modul} onChange={setModul} options={modulOpsi} />
          <Segmented options={statusOpsi} value={status} onChange={setStatus} label="Filter status kuis" />
        </div>
        <JenisSoal nilai={tipe} onChange={setTipe} />
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {hasil.length} kuis ditampilkan
      </p>
      <div className="mt-6 space-y-10">
        {grup.map((g) => (
          <Grup key={g.id} g={g} progres={progres} tutup={Boolean(tutup[g.id])} onToggle={() => setTutup((t) => ({ ...t, [g.id]: !t[g.id] }))} />
        ))}
      </div>

      {hasil.length === 0 && (
        <div className="mx-auto mt-8 flex max-w-xl flex-col items-center rounded-sm border-[1.5px] border-brand-yellow-strong bg-surface px-6 py-10 text-center">
          <Mascot expression="netral" size={110} />
          <p className="text-h3 mt-3 text-heading">Tidak ada kuis yang cocok</p>
          <p className="text-body mt-1 text-ink-soft">Coba kata kunci lain atau longgarkan filter.</p>
          <Button variant="netral" size="s" className="mt-2" onClick={reset}>
            Hapus pencarian dan filter
          </Button>
        </div>
      )}

      <div className="mt-8 flex items-center gap-4 rounded-sm border border-dashed border-line bg-panel p-4">
        <Mascot expression="berpikir" size={64} />
        <p className="text-body text-ink-soft">
          Kuis modul lain sedang disiapkan. Saat ini baru {ring.kuis} kuis yang tersedia; kuis Easy, Hard, dan Complex akan muncul di sini.
        </p>
      </div>
    </div>
  )
}

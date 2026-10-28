import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { TOTAL_MODUL, modul, modulById, sections } from '../data/modul.js'
import { entryOf, lastOpened, percent, status, timeAgo } from '../lib/progress.js'
import ModulCard from '../materi/ModulCard.jsx'
import { useProgress } from '../materi/useProgress.js'
import { Button, Mascot, ProgressBlocks, SearchField, Segmented } from '../ui/index.js'
import { useOfflineReady } from '../ui/useOfflineReady.js'

const filters = [{ id: 'semua', label: 'Semua' }, { id: 'belum', label: 'Belum' }, { id: 'sedang', label: 'Sedang' }, { id: 'selesai', label: 'Selesai' }]
const norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

/** Daftar Materi (Figma: Materi · Daftar modul): kartu "Lanjutkan belajar", pencarian, filter status, dan kartu tiap modul. */
export default function Materi() {
  const all = useProgress()
  const offline = useOfflineReady()
  const [q, setQ] = useState('')
  const [f, setF] = useState('semua')
  useEffect(() => {
    document.title = 'Materi · LABU'
  }, [])

  const rows = useMemo(
    () =>
      modul
        .map((m) => ({ m, st: status(entryOf(all, m.id)), pct: percent(entryOf(all, m.id)) }))
        .filter(({ m, st }) => (f === 'semua' || st === f) && (q === '' || norm(`${m.id} ${m.judul} ${m.judulPanjang} ${m.ringkas}`).includes(norm(q)))),
    [all, q, f],
  )
  const lanjut = lastOpened(all)
  const lm = lanjut && modulById(lanjut.id)

  return (
    <div className="mx-auto w-full max-w-[1344px] px-4 pt-5 md:px-8 md:pt-6">
      <p className="text-caption text-ink-soft">
        {modul.length} modul tersedia · {TOTAL_MODUL} modul direncanakan · urut nomor modul
      </p>
      <h1 className="text-h1 text-heading">Materi</h1>

      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
        <SearchField value={q} onChange={setQ} label="Cari modul" placeholder="Cari nomor atau judul (mis. 04, Insertion)…" className="md:w-[370px] md:shrink-0" />
        <Segmented options={filters} value={f} onChange={setF} label="Filter status" />
      </div>

      {lm && (
        <div className="mt-5 flex flex-wrap items-center gap-5 rounded-sm border-[1.5px] border-brand-yellow-strong bg-surface p-4 md:px-6">
          <Mascot expression="netral" size={84} />
          <div className="min-w-0 flex-1 basis-64">
            <p className="text-label text-accent uppercase">Lanjutkan belajar</p>
            <p className="text-h3 text-heading">
              Modul {lm.id} · {lm.judul}
            </p>
            <p className="text-caption text-ink-soft">
              Terakhir: {sections.find((s) => s.id === lanjut.entry.last.section)?.tab} · {timeAgo(lanjut.entry.last.at)}
            </p>
            <div className="mt-1 flex items-center gap-3">
              <ProgressBlocks value={percent(lanjut.entry)} label="Kemajuan modul terakhir" />
              <span className="text-caption text-ink-soft">{percent(lanjut.entry)}%</span>
            </div>
          </div>
          <Button as={Link} to={`/materi/${lm.id}`} variant="navigasi" icon="arrowR" className="w-full md:w-auto">
            Lanjutkan
          </Button>
        </div>
      )}

      <p className="sr-only" role="status" aria-live="polite">
        {rows.length} modul ditampilkan
      </p>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {rows.map(({ m, st, pct }) => (
          <ModulCard key={m.id} m={m} status={st} persen={pct} offline={offline} />
        ))}
      </div>
      {rows.length === 0 && (
        <div className="mx-auto mt-8 flex max-w-xl flex-col items-center rounded-sm border-[1.5px] border-brand-yellow-strong bg-surface px-6 py-10 text-center">
          <Mascot expression="netral" size={110} />
          <p className="text-h3 mt-3 text-heading">Tidak ada modul yang cocok</p>
          <Button variant="netral" size="s" className="mt-2" onClick={() => { setQ(''); setF('semua') }}>
            Hapus pencarian dan filter
          </Button>
        </div>
      )}
      <div className="mt-6 flex items-center gap-4 rounded-sm border border-dashed border-line bg-panel p-4">
        <Mascot expression="berpikir" size={64} />
        <p className="text-body text-ink-soft">
          Modul lain sedang disiapkan. Saat ini baru {modul.length} dari {TOTAL_MODUL} modul yang tersedia; sisanya akan muncul di daftar ini.
        </p>
      </div>
    </div>
  )
}

import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { algoritma, kategori } from '../data/algoritma.js'
import { filterAlgoritma, groupByKategori, suggest } from '../lib/algoritmaSearch.js'
import { groupClasses } from '../lib/galeriClasses.js'
import { Button, Chip, Icon, Mascot, SearchField, Segmented, Thumb } from '../ui/index.js'
import { cx } from '../ui/cx.js'

const filterOptions = [{ id: 'semua', label: 'Semua' }, ...kategori.map((k) => ({ id: k.id, label: k.label }))]
const modulLabel = (n) => `Modul ${String(n).padStart(2, '0')}`

function Kartu({ a }) {
  const grupKategori = kategori.find((k) => k.id === a.kategori)
  return (
    <Link
      to={a.href}
      aria-label={`${a.judul}, ${modulLabel(a.modul)}`}
      className="group block w-[300px] shrink-0 snap-start overflow-hidden rounded-sm border border-line bg-card shadow-block transition-shadow hover:border-brand-burnt hover:shadow-hover md:w-auto"
    >
      <Thumb kind={a.thumb} />
      <div className="flex flex-col gap-2 p-3.5">
        <p className="text-label text-accent uppercase">{grupKategori.title}</p>
        <h3 className="text-h3 text-heading">{a.judul}</h3>
        <p className="text-caption text-ink-soft">{a.deskripsi}</p>
        <div className="flex flex-wrap gap-1.5">
          <Chip type="kode">{a.kompleksitas}</Chip>
          <Chip type="info">{a.paradigma}</Chip>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-caption text-ink-soft">{modulLabel(a.modul)}</span>
          <span className="text-button inline-flex items-center gap-1.5 text-accent">
            <span className="group-hover:hidden group-focus-visible:hidden">Buka</span>
            <span className="hidden group-hover:inline group-focus-visible:inline">Buka visualizer</span>
            <Icon name="arrowR" size={16} />
          </span>
        </div>
      </div>
    </Link>
  )
}

function Grup({ g, tutup, onToggle }) {
  const cls = groupClasses(g.items.length)
  return (
    <section aria-labelledby={`grup-${g.id}`} className={cx('min-w-0', cls.span)}>
      <h2 id={`grup-${g.id}`} className="mb-4">
        <button type="button" aria-expanded={!tutup} onClick={onToggle} className="flex w-full items-center gap-3 rounded-sm text-left">
          <Icon name={tutup ? 'right' : 'down'} size={18} className="shrink-0 text-ink" />
          <span className="text-h3 uppercase text-heading">{g.title}</span>
          <span className="text-h3 text-ink-soft">({g.items.length})</span>
          <span className="h-px flex-1 bg-line" aria-hidden="true" />
        </button>
      </h2>
      {!tutup && (
        <div className={cx('-mx-4 flex snap-x items-start gap-4 overflow-x-auto px-4 pb-3 md:mx-0 md:grid md:gap-6 md:overflow-visible md:px-0 md:pb-0', cls.inner)}>
          {g.items.map((a) => (
            <Kartu key={a.id} a={a} />
          ))}
        </div>
      )}
    </section>
  )
}

function Kosong({ query, kategoriId, onQuery, onKategori }) {
  const saran = suggest(query)
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-12 text-center">
      <Mascot expression="netral" size={120} />
      <p className="text-h3 mt-4 text-heading">Tidak ada algoritma “{query}”</p>
      {saran.length > 0 ? (
        <>
          <p className="text-caption mt-3 text-ink-soft">Mungkin maksudmu:</p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {saran.map((a) => (
              <Button key={a.id} variant="secondary" size="s" onClick={() => { onQuery(a.judul); onKategori('semua') }}>
                {a.judul}
              </Button>
            ))}
          </div>
        </>
      ) : (
        <p className="text-body mt-2 text-ink-soft">Coba kata kunci lain{kategoriId !== 'semua' ? ' atau cari di semua kategori' : ''}.</p>
      )}
      <Button variant="ghost" size="s" className="mt-3" onClick={() => { onQuery(''); onKategori('semua') }}>
        Hapus pencarian dan filter
      </Button>
    </div>
  )
}

/** Halaman utama: Galeri Algoritma (Figma: Algoritma · Galeri). */
export default function Algoritma() {
  const [query, setQuery] = useState('')
  const [kategoriId, setKategoriId] = useState('semua')
  const [tutup, setTutup] = useState(() => new Set())
  const cari = useRef(null)

  // Tekan "/" untuk langsung mengetik di pencarian (sesuai tulisan di banner).
  useEffect(() => {
    const onKey = (e) => {
      const el = e.target
      const mengetik = el instanceof HTMLElement && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))
      if (e.key === '/' && !mengetik && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault()
        cari.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const hasil = useMemo(() => filterAlgoritma(query, kategoriId), [query, kategoriId])
  const grup = useMemo(() => groupByKategori(hasil), [hasil])
  const toggle = (id) =>
    setTutup((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })

  return (
    <div className="mx-auto max-w-[1440px] px-4 pt-5 md:px-6 md:pt-6 xl:px-16">
      <div className="hidden items-end justify-between gap-4 md:flex">
        <div>
          <p className="text-caption text-ink-soft">
            {algoritma.length} algoritma · {kategori.length} kategori · terhubung ke modul materi
          </p>
          <h1 className="text-h1 text-heading">Algoritma</h1>
        </div>
        <Button variant="outlineOrange" icon="compare" disabled title="Segera hadir">
          Bandingkan dua algoritma
        </Button>
      </div>

      <div className="flex flex-col gap-3 md:mt-5 md:flex-row md:items-center">
        <SearchField value={query} onChange={setQuery} inputRef={cari} label="Cari algoritma" placeholder="Cari algoritma, mis. “dijk” atau “O(n²)”…" className="md:w-[370px] md:shrink-0" />
        <Segmented options={filterOptions} value={kategoriId} onChange={setKategoriId} label="Filter kategori" />
      </div>

      <div className="mt-5 hidden items-center gap-5 rounded-sm border border-dashed border-brand-yellow bg-surface px-6 py-4 md:flex">
        <Mascot expression="netral" size={84} />
        <div>
          <p className="text-h3 text-heading">Pilih algoritma untuk mulai</p>
          <p className="text-body text-ink-soft">Klik kartu untuk membuka visualizer: kode, variabel, dan visualisasi berjalan berdampingan. Tekan / untuk fokus ke pencarian.</p>
        </div>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {hasil.length} algoritma ditemukan
      </p>

      {grup.length === 0 ? (
        <Kosong query={query} kategoriId={kategoriId} onQuery={setQuery} onKategori={setKategoriId} />
      ) : (
        <div className="mt-8 grid grid-cols-1 items-start gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {grup.map((g) => (
            <Grup key={g.id} g={g} tutup={tutup.has(g.id)} onToggle={() => toggle(g.id)} />
          ))}
        </div>
      )}
    </div>
  )
}

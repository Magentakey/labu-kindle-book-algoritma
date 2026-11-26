import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { algoritma, algoritmaHref, kategori, membukaHalamanLama } from '../data/algoritma.js'
import { filterAlgoritma, suggest } from '../lib/algoritmaSearch.js'
import { comparePairs } from '../viz/vizConfig.js'
import { Button, Chip, ConfirmDialog, DropdownMenu, Icon, Mascot, SearchField, Thumb } from '../ui/index.js'

const filterOptions = [{ id: 'semua', label: 'Semua' }, ...kategori.map((k) => ({ id: k.id, label: k.label }))]
const judulDari = (id) => algoritma.find((x) => x.id === id)?.judul ?? id
const modulLabel = (n) => `Modul ${String(n).padStart(2, '0')}`

// Kartu yang bisa diklik = PINDAH: garis Coral dan naik 2px saat hover/fokus; teks "Buka" Coral Tua + panah.
function Kartu({ a, onLama }) {
  const grupKategori = kategori.find((k) => k.id === a.kategori)
  return (
    <Link
      to={algoritmaHref(a)}
      onClick={(e) => {
        // Klik biasa pada kartu yang membuka halaman lama: tanya dulu. Ctrl/Cmd/Shift-klik dan klik tengah tetap membuka tab baru seperti biasa.
        if (membukaHalamanLama(a) && e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
          e.preventDefault()
          onLama(a)
        }
      }}
      className="group block w-full overflow-hidden rounded-sm border border-line bg-card shadow-block transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-brand-orange hover:shadow-hover focus-visible:-translate-y-0.5 focus-visible:border-brand-orange"
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
          <span className="text-button inline-flex items-center gap-1.5 text-link">
            <span className="group-hover:hidden group-focus-visible:hidden">Buka</span>
            <span className="hidden group-hover:inline group-focus-visible:inline">Buka visualizer</span>
            <Icon name="arrowR" size={16} />
          </span>
        </div>
      </div>
    </Link>
  )
}

// Grup bisa dilipat: tinggi dan putaran chevron 250 ms (instan bila gerak dikurangi). Di HP isinya satu baris yang digeser.
// Empty state memakai gaya hero yang sama dengan semua hero (Kuning muda + garis Kuning tua 1,5px).
function Kosong({ query, kategoriId, onQuery, onKategori }) {
  const saran = suggest(query)
  return (
    <div className="mx-auto mt-8 flex max-w-xl flex-col items-center rounded-sm border-[1.5px] border-brand-yellow-strong bg-surface px-6 py-10 text-center">
      <Mascot expression="netral" size={120} />
      <p className="text-h3 mt-4 text-heading">Tidak ada algoritma “{query}”</p>
      {saran.length > 0 ? (
        <>
          <p className="text-caption mt-3 text-ink-soft">Mungkin maksudmu:</p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {saran.map((a) => (
              <Button key={a.id} variant="kontrol" size="s" onClick={() => { onQuery(a.judul); onKategori('semua') }}>
                {a.judul}
              </Button>
            ))}
          </div>
        </>
      ) : (
        <p className="text-body mt-2 text-ink-soft">Coba kata kunci lain{kategoriId !== 'semua' ? ' atau cari di semua kategori' : ''}.</p>
      )}
      <Button variant="netral" size="s" className="mt-3" onClick={() => { onQuery(''); onKategori('semua') }}>
        Hapus pencarian dan filter
      </Button>
    </div>
  )
}

/** Halaman utama: Galeri Algoritma (Figma: Algoritma · Galeri). */
export default function Algoritma() {
  const [query, setQuery] = useState('')
  const [kategoriId, setKategoriId] = useState('semua')
  const cari = useRef(null)
  const [lama, setLama] = useState(null) // kartu yang akan membuka halaman materi versi lama (menunggu konfirmasi)
  const navigate = useNavigate()

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
  return (
    <div className="mx-auto w-full max-w-[1344px] px-4 pt-5 md:px-8 md:pt-6">
      <div className="hidden items-end justify-between gap-4 md:flex">
        <div>
          <p className="text-caption text-ink-soft">
            {algoritma.length} algoritma · {kategori.length} kategori · terhubung ke modul materi
          </p>
          <h1 className="text-h1 text-heading">Algoritma</h1>
        </div>
        <DropdownMenu label="Algoritma perbandingan" icon="compare" panelClassName="w-72">
          {(tutupMenu) => (
            <nav aria-label="Bandingkan dua algoritma">
              <ul>
                {comparePairs.map((p) => (
                  <li key={`${p.a}-${p.b}`}>
                    <Link to={`/algoritma/bandingkan/${p.a}/${p.b}`} onClick={tutupMenu} className="text-body-strong flex items-center gap-2 rounded-sm px-3 py-2.5 text-ink hover:bg-orange-soft hover:text-link">
                      <Icon name="compare" size={16} className="shrink-0 text-link" />
                      {judulDari(p.a)} vs {judulDari(p.b)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </DropdownMenu>
      </div>

      <div className="flex flex-col gap-3 md:mt-5 md:flex-row md:items-center">
        <SearchField value={query} onChange={setQuery} inputRef={cari} label="Cari algoritma" placeholder="Cari algoritma, mis. “dijk” atau “O(n²)”…" className="md:w-[370px] md:shrink-0" />
        <DropdownMenu label={`Kategori: ${filterOptions.find((o) => o.id === kategoriId).label}`} icon="filter" variant="kontrol" align="kiri" panelClassName="w-60">
          {(tutupMenu) => (
            <ul aria-label="Filter kategori">
              {filterOptions.map((o) => (
                <li key={o.id}>
                  <button
                    type="button"
                    aria-pressed={kategoriId === o.id}
                    onClick={() => {
                      setKategoriId(o.id)
                      tutupMenu()
                    }}
                    className="text-body flex w-full items-center justify-between gap-2 rounded-sm px-3 py-2.5 text-left text-ink hover:bg-info-bg aria-pressed:font-semibold aria-pressed:text-control"
                  >
                    {o.label}
                    {kategoriId === o.id && <Icon name="check" size={16} />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </DropdownMenu>
      </div>

      <div className="mt-5 hidden items-center gap-5 rounded-sm border-[1.5px] border-dashed border-brand-yellow-strong bg-surface px-6 py-4 md:flex">
        <Mascot expression="netral" size={84} />
        <div>
          <p className="text-h3 text-heading">Pilih algoritma untuk mulai</p>
          <p className="text-body text-ink-soft">Klik kartu untuk membuka visualizer: kode, variabel, dan visualisasi berjalan berdampingan. Tekan / untuk fokus ke pencarian.</p>
        </div>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {hasil.length} algoritma ditemukan
      </p>

      {hasil.length === 0 ? (
        <Kosong query={query} kategoriId={kategoriId} onQuery={setQuery} onKategori={setKategoriId} />
      ) : (
        <ul className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {hasil.map((a) => (
            <li key={a.id} className="flex">
              <Kartu a={a} onLama={setLama} />
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={lama !== null}
        judul="Buka materi versi lama?"
        labelLanjut="Lanjut ke materi lama"
        labelBatal="Tetap di sini"
        onBatal={() => setLama(null)}
        onLanjut={() => {
          const tujuan = algoritmaHref(lama)
          setLama(null)
          navigate(tujuan)
        }}
      >
        <p>
          “{lama?.judul}” belum punya visualizer di tampilan baru. Kamu akan dibawa ke halaman materi versi lama yang tampilannya berbeda dari
          aplikasi ini.
        </p>
        <p className="mt-2">Untuk kembali, pakai tombol kembali di browser.</p>
      </ConfirmDialog>
    </div>
  )
}

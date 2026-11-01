import { Link } from 'react-router-dom'
import { kategori } from '../data/algoritma.js'
import { modulById } from '../data/modul.js'
import { Button, Chip, Icon } from '../ui/index.js'

const modulLabel = (n) => `Modul ${String(n).padStart(2, '0')}`

/** Kepala halaman penjelajah: sama dengan kepala visualizer algoritma (breadcrumb, judul, chip, tautan materi). */
export default function PenjelajahShell({ a, children }) {
  const materi = modulById(String(a.modul).padStart(2, '0'))
  const kat = kategori.find((k) => k.id === a.kategori)
  return (
    <div className="mx-auto w-full max-w-[1344px] px-4 pb-24 pt-5 md:px-8 md:pb-8 md:pt-6">
      <div className="flex items-center gap-3 md:hidden">
        <Link to="/" className="text-button inline-flex items-center gap-1.5 rounded-sm text-link">
          <Icon name="arrowL" size={18} />
          Semua
        </Link>
        <h1 className="text-h2 flex-1 text-heading">{a.judul}</h1>
      </div>
      <div className="hidden md:block">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
          <Link to="/" className="text-button inline-flex items-center gap-1.5 rounded-sm text-link">
            <Icon name="arrowL" size={18} />
            Semua algoritma
          </Link>
          <nav aria-label="Breadcrumb" className="text-caption text-ink-soft">
            Algoritma / {kat?.title} / {a.judul}
          </nav>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-h1 text-heading">{a.judul}</h1>
          <Chip type="kode">{a.kompleksitas}</Chip>
          <Chip type="info">{a.paradigma}</Chip>
          <div className="ml-auto">
            <Button as={Link} to={materi ? `/materi/${materi.id}` : '/materi'} variant="navigasiGaris" icon="book">
              Baca materi · {modulLabel(a.modul)}
            </Button>
          </div>
        </div>
      </div>
      <div className="mt-2 md:hidden">
        <Button as={Link} to={materi ? `/materi/${materi.id}` : '/materi'} variant="navigasiGaris" size="s" icon="book">
          Baca materi · {modulLabel(a.modul)}
        </Button>
      </div>
      {children}
    </div>
  )
}

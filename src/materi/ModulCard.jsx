import { Link } from 'react-router-dom'
import MarkdownView from '../components/MarkdownView/MarkdownView.jsx'
import { Button, Chip, Icon, ProgressBlocks } from '../ui/index.js'
import { cx } from '../ui/cx.js'

const statusChip = { belum: ['default', 'Belum'], sedang: ['sedang', 'Sedang'], selesai: ['sukses', 'Selesai'] }
const pdfUrl = (m) => `${import.meta.env.BASE_URL}${m.pdf}`

/** Kartu modul di daftar Materi (Figma: kartu modul). Judul memakai tautan yang membentang ke seluruh kartu, tombol PDF di atasnya. */
export default function ModulCard({ m, status, persen, offline }) {
  const [tipe, label] = statusChip[status]
  return (
    <article className={cx('relative rounded-sm border bg-card p-4 shadow-block transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-hover md:p-5', status === 'sedang' ? 'border-brand-orange' : 'border-line hover:border-brand-orange')}>
      <div className="flex gap-4">
        <span className="text-pixel-l flex size-16 shrink-0 items-center justify-center rounded-sm border border-line bg-panel text-heading" aria-hidden="true">
          {m.id}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <Chip type="bab">{m.bab}</Chip>
            <Chip type={tipe}>{label}</Chip>
          </div>
          <h3 className="text-h3 mt-2 text-heading">
            <Link to={`/materi/${m.id}`} className="rounded-sm after:absolute after:inset-0 after:rounded-sm">
              {m.judul}
            </Link>
          </h3>
          <p className="text-body mt-1 text-ink-soft">{m.ringkas}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <Chip type="prasyarat">Prasyarat: {m.prasyarat.map((p) => `Modul ${String(p).padStart(2, '0')}`).join(', ')}</Chip>
        <span className="text-caption inline-flex items-center gap-1.5 text-ink-soft">
          <Icon name="file" size={14} />
          {m.halaman} hlm
        </span>
        <span className="text-caption inline-flex items-center gap-1.5 text-ink-soft">
          <Icon name="quiz" size={14} />
          {m.soal} soal
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-line pt-3">
        <ProgressBlocks value={persen} label={`Kemajuan Modul ${m.id}`} />
        <span className="text-caption text-ink-soft">{persen}%</span>
        <span className="ml-auto flex items-center gap-3">
          {offline && (
            <span className="text-caption inline-flex items-center gap-1.5 text-ok-text">
              <Icon name="offline" size={16} />
              Offline
            </span>
          )}
          <Button as="a" href={pdfUrl(m)} download variant="kontrol" size="s" icon="download" className="relative z-10">
            Unduh PDF
          </Button>
        </span>
      </div>
    </article>
  )
}

export const ModulTujuan = ({ text }) => <MarkdownView variant="modul" text={text} inline />

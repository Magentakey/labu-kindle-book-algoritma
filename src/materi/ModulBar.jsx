import { Link, useNavigate } from 'react-router-dom'
import { tabsOf } from '../data/modul.js'
import { Icon, IconButton } from '../ui/index.js'
import { cx } from '../ui/cx.js'
import { gulirKe } from './scroll.js'

/** Bar menempel di bawah header (Figma): ← Semua Materi, MODUL 04 / 24 dengan panah, tab bagian, dan garis kemajuan baca. */
export default function ModulBar({ modul, total, aktif, baca, prev, next }) {
  const navigate = useNavigate()
  return (
    <div className="sticky top-14 z-20 border-b border-line bg-page md:top-0">
      <div className="mx-auto flex w-full max-w-[1344px] items-center gap-3 px-4 md:px-8">
        <Link to="/materi" className="text-button inline-flex shrink-0 items-center gap-1.5 rounded-sm py-3 text-link">
          <Icon name="arrowL" size={18} />
          <span className="hidden sm:inline">Semua Materi</span>
          <span className="sm:hidden">Semua</span>
        </Link>
        <div className="hidden shrink-0 items-center gap-1 border-x border-line px-3 md:flex">
          <span className="text-pixel-s whitespace-nowrap text-heading">MODUL {modul.id} / {total}</span>
          {prev ? <IconButton icon="left" label={`Modul ${prev.id}`} className="size-8" onClick={() => navigate(`/materi/${prev.id}`)} /> : <IconButton icon="left" label="Tidak ada modul sebelumnya" className="size-8" disabled />}
          {next ? <IconButton icon="right" label={`Modul ${next.id}`} className="size-8" onClick={() => navigate(`/materi/${next.id}`)} /> : <IconButton icon="right" label="Belum ada modul berikutnya" className="size-8" disabled />}
        </div>
        <nav aria-label="Bagian modul" className="flex min-w-0 flex-1 gap-1 overflow-x-auto py-2 [scrollbar-width:none]">
          {tabsOf(modul).map((s) => (
            <button
              key={s.id}
              type="button"
              aria-current={aktif === s.id ? 'location' : undefined}
              onClick={() => gulirKe(s.id)}
              className={cx('text-body shrink-0 whitespace-nowrap rounded-sm px-3 py-1.5 transition-colors', aktif === s.id ? 'bg-brand-orange font-semibold text-on-orange shadow-glow' : 'text-ink-soft hover:text-ink')}
            >
              {s.tab}
            </button>
          ))}
        </nav>
      </div>
      <div className="h-[3px] bg-line" role="progressbar" aria-label="Kemajuan membaca halaman" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(baca)}>
        <div className="h-full bg-brand-orange" style={{ width: `${baca}%` }} />
      </div>
    </div>
  )
}

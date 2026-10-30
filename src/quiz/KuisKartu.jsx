import { Link } from 'react-router-dom'
import { labelTerbaik, statusKuis } from '../lib/quizList.js'
import { Chip, Thumb } from '../ui/index.js'
import { cx } from '../ui/cx.js'

// Warna tingkat. Tingkat selalu juga ditulis sebagai teks, jadi warna hanya pelengkap.
const warna = { mint: 'bg-brand-mint', kuning: 'bg-brand-yellow', oranye: 'bg-brand-orange', merah: 'bg-bad' }

const chipStatus = { belum: ['default', 'Belum dicoba'], lulus: ['sukses'], gagal: ['gagal'] }

/** Kartu kuis di daftar Quiz (Figma: kartu kuis). Seluruh kartu adalah satu tautan ke halaman kuis. */
export default function KuisKartu({ k, tingkat, entry }) {
  const st = statusKuis(entry)
  const [tipeChip, teksDefault] = chipStatus[st]
  return (
    <Link
      to={`/quiz/${k.id}`}
      className="group block w-[280px] shrink-0 snap-start overflow-hidden rounded-sm border border-line bg-card shadow-block transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-brand-orange hover:shadow-hover focus-visible:-translate-y-0.5 focus-visible:border-brand-orange md:w-auto"
    >
      <Thumb kind={k.thumb} />
      <div className={cx('h-1.5', warna[tingkat.warna])} aria-hidden="true" />
      <div className="flex flex-col gap-2 p-3.5">
        <p className="text-label flex items-center gap-2 text-accent uppercase">
          <span className={cx('size-2 shrink-0', warna[tingkat.warna])} aria-hidden="true" />
          {tingkat.label}
        </p>
        <h3 className="text-h3 text-heading">{k.judul}</h3>
        <p className="text-caption text-ink-soft">
          Modul {k.modul} · {k.soal} soal · ±{k.menit} mnt
        </p>
        <div>
          <Chip type={tipeChip}>{labelTerbaik(entry) ?? teksDefault}</Chip>
        </div>
      </div>
    </Link>
  )
}

import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { petaBab } from '../data/credit.js'
import { modulById } from '../data/modul.js'
import { statusSemuaModul } from '../lib/creditStats.js'
import { useProgress } from '../materi/useProgress.js'
import { Icon } from '../ui/index.js'
import { cx } from '../ui/cx.js'
import { JudulBagian } from './Progres.jsx'

const teksStatus = { selesai: 'selesai', sedang: 'sedang dibaca', belum: 'belum dimulai' }

function KotakModul({ m, st }) {
  const ada = modulById(m.id)
  const kelas = cx(
    'inline-flex max-w-full items-center gap-1.5 rounded-sm border px-2 py-1 text-caption',
    st === 'selesai' && 'border-ok bg-brand-mint text-on-orange',
    st === 'sedang' && 'border-2 border-brand-orange bg-card text-ink',
    st === 'belum' && (m.konsep ? 'border-transparent bg-info-bg text-ink' : 'border-line bg-card text-ink'),
    ada && 'hover:shadow-block',
  )
  const isi = (
    <>
      {st === 'selesai' && <Icon name="check" size={12} className="shrink-0" />}
      <span className="text-pixel-s shrink-0 text-[10px]">{m.id}</span>
      <span className="truncate" title={m.judul}>
        {m.judul}
      </span>
      <span className="sr-only">
        {m.konsep ? ', modul konsep umum' : ''}, {teksStatus[st]}
      </span>
    </>
  )
  return ada ? (
    <Link to={`/materi/${m.id}`} className={kelas}>
      {isi}
    </Link>
  ) : (
    <span className={kelas}>{isi}</span>
  )
}

/** Peta belajar (Figma: Peta Belajar): 24 modul per bab, ditandai menurut status. Modul yang sudah tersedia bisa dibuka. */
export default function PetaBelajar() {
  const progres = useProgress()
  const status = useMemo(() => statusSemuaModul(progres), [progres])
  return (
    <>
      <JudulBagian id="peta" eyebrow="Peta belajar">
        Peta Belajar · 24 Modul · 8 Bab
      </JudulBagian>
      <div className="mt-4 rounded-sm border border-line bg-card p-4 md:p-5">
        <ol className="space-y-3">
          {petaBab.map((b) => (
            <li key={b.bab} className="flex flex-col gap-1.5 md:flex-row md:items-start md:gap-4">
              <p className="text-body-strong w-20 shrink-0 pt-1 text-ink-soft">{b.bab}</p>
              <ol className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1.5 gap-y-2">
                {b.modul.map((m, i) => (
                  <li key={m.id} className="flex min-w-0 items-center gap-1.5">
                    {i > 0 && <Icon name="arrowR" size={14} className="shrink-0 text-ink-soft" aria-hidden="true" />}
                    <KotakModul m={m} st={status.get(m.id) ?? 'belum'} />
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ol>
        <ul className="text-caption mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-3 text-ink-soft" aria-label="Keterangan">
          <li className="flex items-center gap-1.5">
            <span className="inline-flex size-4 items-center justify-center rounded-[2px] border border-ok bg-brand-mint text-on-orange" aria-hidden="true">
              <Icon name="check" size={10} />
            </span>
            Selesai
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-4 rounded-[2px] border-2 border-brand-orange bg-card" aria-hidden="true" />
            Sedang dibaca
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-4 rounded-[2px] bg-info-bg" aria-hidden="true" />
            Modul konsep umum (pintu masuk bab)
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-4 rounded-[2px] border border-line bg-card" aria-hidden="true" />
            Belum
          </li>
        </ul>
      </div>
    </>
  )
}

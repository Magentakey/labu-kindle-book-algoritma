import { Link } from 'react-router-dom'
import { petaBab } from '../data/credit.js'
import { modulById } from '../data/modul.js'
import { Icon } from '../ui/index.js'
import { cx } from '../ui/cx.js'

// 24 blok disusun menjadi labu: 4 + 5 + 6 + 5 + 4 (Figma: koleksi badge "blok labu").
const BARIS = [4, 5, 6, 5, 4]
const AWAL = BARIS.map((_, i) => BARIS.slice(0, i).reduce((a, b) => a + b, 0))
const teksStatus = { selesai: 'selesai', sedang: 'sedang dibaca', belum: 'belum dimulai' }

/**
 * Koleksi blok labu. Status tidak hanya lewat warna: selesai = isi mint dan tanda centang, sedang = cincin oranye tebal, belum = garis putus.
 * @param {{ status: Map<string, 'belum'|'sedang'|'selesai'> }} props
 */
export default function BlokLabu({ status }) {
  const semua = petaBab.flatMap((b) => b.modul)
  return (
    <div role="group" aria-label="Koleksi blok labu, satu blok per modul" className="flex flex-col items-center gap-1.5">
      <span className="h-2.5 w-4 bg-brand-dark-stem" aria-hidden="true" />
      {BARIS.map((n, r) => {
        const baris = semua.slice(AWAL[r], AWAL[r] + n)
        return (
          <ul key={r} className="flex gap-1.5">
            {baris.map((m) => {
              const st = status.get(m.id) ?? 'belum'
              const ada = modulById(m.id)
              const isi = (
                <>
                  {st === 'selesai' && <Icon name="check" size={10} />}
                  <span className="text-pixel-s text-[9px] leading-none">{m.id}</span>
                  <span className="sr-only">
                    Modul {m.id}, {m.judul}, {teksStatus[st]}
                  </span>
                </>
              )
              const kelas = cx(
                'flex h-6 w-10 items-center justify-center gap-0.5 rounded-[2px] sm:w-11',
                st === 'selesai' && 'border-[1.5px] border-ok bg-brand-mint text-on-orange',
                st === 'sedang' && 'border-2 border-brand-orange bg-card text-ink',
                st === 'belum' && 'border border-dashed border-muted bg-panel text-ink-soft',
              )
              return (
                <li key={m.id}>
                  {ada ? (
                    <Link to={`/materi/${m.id}`} className={kelas}>
                      {isi}
                    </Link>
                  ) : (
                    <span className={kelas}>{isi}</span>
                  )}
                </li>
              )
            })}
          </ul>
        )
      })}
    </div>
  )
}

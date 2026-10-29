import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { daftarKuis } from '../data/quiz.js'
import { PASS_PERCENT } from '../data/modul.js'
import { rekorStreak, streakSekarang } from '../lib/aktivitas.js'
import { blokBerikutnya, ringkasProgres, sorotan, statusSemuaModul } from '../lib/creditStats.js'
import { useHariBelajar, useProgress } from '../materi/useProgress.js'
import { Button, Icon, Mascot, StatCard } from '../ui/index.js'
import BlokLabu from './BlokLabu.jsx'

/** Kepala bagian: eyebrow kecil dan judul (dipakai semua bagian Credit). */
export function JudulBagian({ id, eyebrow, children }) {
  return (
    <>
      <p className="text-label text-accent uppercase">{eyebrow}</p>
      <h2 id={`h-${id}`} className="text-h2 mt-1 text-heading">
        {children}
      </h2>
    </>
  )
}

/** Bagian pertama Credit: sorotan, empat angka progres, dan koleksi blok labu. Semua angka dari kemajuan yang tersimpan di perangkat. */
export function Hero() {
  const progres = useProgress()
  const hari = useHariBelajar()
  const r = useMemo(() => ringkasProgres(progres, daftarKuis), [progres])
  const streak = useMemo(() => streakSekarang(hari), [hari])
  const s = sorotan(r.selesai, r.total, streak.hari)
  return (
    <div className="flex flex-wrap items-center gap-6 rounded-sm border-[1.5px] border-brand-yellow-strong bg-surface p-5 md:px-8 md:py-7">
      <Mascot expression={r.selesai > 0 ? 'merayakan' : 'netral'} size={140} />
      <div className="min-w-0 flex-1 basis-72">
        <p className="text-label text-accent uppercase">Credit · Tentang &amp; Progres</p>
        <h1 className="text-h1 mt-2 text-heading">{s.judul}</h1>
        <p className="text-body-l mt-2 text-ink-soft">{s.isi}</p>
      </div>
    </div>
  )
}

export function Progres() {
  const progres = useProgress()
  const hari = useHariBelajar()
  const r = useMemo(() => ringkasProgres(progres, daftarKuis), [progres])
  const status = useMemo(() => statusSemuaModul(progres), [progres])
  const streak = useMemo(() => streakSekarang(hari), [hari])
  const rekor = useMemo(() => Math.max(rekorStreak(hari), streak.hari), [hari, streak.hari])
  const next = useMemo(() => blokBerikutnya(progres), [progres])
  return (
    <>
      <JudulBagian id="progres" eyebrow="Progres belajar">
        Progres Belajar
      </JudulBagian>
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon="book" label="Modul selesai" value={`${r.selesai} / ${r.total}`} teksAngka={`${r.selesai} dari ${r.total}`} sub={`${r.sedang} sedang dibaca`} />
        <StatCard icon="chart" label="Rata-rata skor" value={r.rataRata === null ? '-' : `${r.rataRata}%`} teksAngka={r.rataRata === null ? 'belum ada' : `${r.rataRata} persen`} sub={r.kuisDicoba > 0 ? `dari ${r.kuisDicoba} kuis` : 'belum ada kuis dicoba'} />
        <StatCard icon="flame" label="Streak harian" value={`${streak.hari} hari`} sub={rekor > 0 ? `Rekor: ${rekor} hari` : 'Belajar hari ini untuk memulai'} />
        <StatCard icon="award" label="Kuis lulus" value={`${r.kuisLulus} / ${r.kuisTotal}`} teksAngka={`${r.kuisLulus} dari ${r.kuisTotal}`} sub={`batas lulus ${PASS_PERCENT}%`} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-6 rounded-sm border border-line bg-card p-5 md:gap-8">
        <BlokLabu status={status} />
        <div className="min-w-0 flex-1 basis-72">
          <h3 className="text-h3 text-heading">Koleksi badge &quot;blok labu&quot;</h3>
          <p className="text-body mt-2 text-ink-soft">
            1 blok untuk setiap modul selesai (baca semua bagian + lulus kuis). Blok mint dengan tanda centang = modul selesai, bercincin oranye = sedang dibaca, bergaris putus = belum.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3 rounded-sm bg-panel px-4 py-3">
            <Icon name="flame" size={18} className="shrink-0 text-ink-soft" />
            <p className="text-body-strong min-w-0 flex-1 text-heading">{next ? `Blok berikutnya: Modul ${next.id} · ${next.judul} (${next.persen}%)` : 'Semua modul yang tersedia sudah selesai. Modul lain sedang disiapkan.'}</p>
            {next && (
              <Button as={Link} to={`/materi/${next.id}`} variant="tautan" size="s" iconRight="arrowR">
                Lanjutkan
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

import { durasi, jam, rincianTipe } from '../lib/kuis.js'
import { StatCard } from '../ui/index.js'

/** Empat kartu di bawah ringkasan hasil kuis (Figma: Quiz · Hasil): skor terbaik, waktu, jumlah benar, dan streak. */
export default function StatistikHasil({ soal, hasil, best, percobaan, menit, streak }) {
  const rincian = rincianTipe(soal, hasil)
    .slice(0, 2)
    .map((r) => `${r.label} ${r.benar}/${r.total}`)
    .join(' · ')
  return (
    <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard icon="award" label="Skor terbaik" value={`${best?.persen ?? hasil.persen}%`} teksAngka={`${best?.persen ?? hasil.persen} persen`} sub={`dari ${percobaan} percobaan`} />
      <StatCard icon="timer" label="Waktu" value={jam(hasil.detik ?? 0)} teksAngka={durasi(hasil.detik ?? 0)} sub={menit ? `estimasi ±${menit} mnt` : undefined} />
      <StatCard icon="check" label="Benar" value={`${hasil.skor} / ${hasil.total}`} teksAngka={`${hasil.skor} dari ${hasil.total}`} sub={rincian || undefined} />
      <StatCard icon="flame" label="Streak" value={`${streak.hari} hari`} sub={streak.hariIni ? 'Sudah belajar hari ini' : 'Belajar hari ini untuk melanjutkan'} />
    </div>
  )
}

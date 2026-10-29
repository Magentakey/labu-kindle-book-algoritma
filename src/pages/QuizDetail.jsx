import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { modulKonten } from '../content/modul/index.js'
import { modulById, neighbors } from '../data/modul.js'
import { kuisById, tingkatById } from '../data/quiz.js'
import { streakSekarang } from '../lib/aktivitas.js'
import { entryOf } from '../lib/progress.js'
import KuisModul from '../materi/KuisModul.jsx'
import { useHariBelajar, useProgress } from '../materi/useProgress.js'
import StatistikHasil from '../quiz/StatistikHasil.jsx'
import { Button, ErrorState, Icon, PageLoading } from '../ui/index.js'

function Isi({ k }) {
  const m = modulById(k.modul)
  const t = tingkatById(k.tingkat)
  const progres = useProgress()
  const hari = useHariBelajar()
  const [state, setState] = useState({ status: 'muat' })
  const [muatKe, setMuatKe] = useState(0)
  const entry = entryOf(progres, k.modul)

  useEffect(() => {
    let batal = false
    modulKonten[k.modul].kuis().then(
      (kuis) => !batal && setState({ status: 'siap', kuis }),
      () => !batal && setState({ status: 'gagal' }),
    )
    return () => {
      batal = true
    }
  }, [k.modul, muatKe])
  useEffect(() => {
    document.title = `${k.judul} · Quiz · LABU`
  }, [k])
  const streak = useMemo(() => streakSekarang(hari), [hari])
  const { next } = neighbors(k.modul)

  return (
    <div className="mx-auto w-full max-w-[860px] px-4 pb-8 pt-5 md:px-8 md:pt-6">
      <nav aria-label="Jejak halaman" className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <Link to="/quiz" className="text-button inline-flex items-center gap-1.5 rounded-sm text-link">
          <Icon name="arrowL" size={18} />
          Semua Kuis
        </Link>
        <ol className="text-caption flex flex-wrap items-center gap-1.5 text-ink-soft">
          <li>
            <Link to="/quiz" className="rounded-sm underline underline-offset-2">
              Quiz
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>{t.label}</li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">{k.judul}</li>
        </ol>
      </nav>

      <header className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-label text-accent uppercase">
            {t.label} · Modul {k.modul} · {k.soal} soal
          </p>
          <h1 className="text-h1 text-heading">{k.judul}</h1>
        </div>
        <Button as={Link} to={`/materi/${k.modul}`} variant="kontrol" size="s" icon="book">
          Baca Modul {k.modul}
        </Button>
      </header>

      <div className="mt-6">
        {state.status === 'muat' && <PageLoading label="Memuat kuis…" />}
        {state.status === 'gagal' && (
          <ErrorState judul="Kuis tidak bisa dimuat" pesan="Soal gagal dimuat. Periksa koneksi, lalu coba lagi." aksi={[{ label: 'Coba lagi', icon: 'refresh', onClick: () => { setState({ status: 'muat' }); setMuatKe((n) => n + 1) } }]} />
        )}
        {state.status === 'siap' && (
          <KuisModul
            modul={m}
            kuis={state.kuis}
            next={next}
            lanjut={{ to: '/quiz', label: 'Kembali ke Quiz' }}
            statistik={(hasil) => <StatistikHasil soal={state.kuis.soal} hasil={hasil} best={entry.kuis.best} percobaan={entry.kuis.attempts} menit={k.menit} streak={streak} />}
          />
        )}
      </div>
    </div>
  )
}

/** Halaman satu kuis di menu Quiz (Figma: Quiz · Pengerjaan dan Hasil). Memakai mesin kuis yang sama dengan kuis di halaman modul, jadi hasilnya juga menghitung kemajuan modul. */
export default function QuizDetail({ id }) {
  const k = kuisById(id)
  const navigate = useNavigate()
  if (!k || !modulKonten[k.modul]) {
    return (
      <div className="mx-auto max-w-[1344px] px-4 py-8 md:px-8">
        <ErrorState judul="Kuis tidak ditemukan" pesan="Kuis ini belum tersedia. Lihat daftar Quiz untuk kuis yang sudah ada." aksi={[{ label: 'Ke daftar Quiz', onClick: () => navigate('/quiz') }]} />
      </div>
    )
  }
  return <Isi key={id} k={k} />
}

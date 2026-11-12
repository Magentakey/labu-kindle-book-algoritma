import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import MarkdownView from '../components/MarkdownView/MarkdownView.jsx'
import { PASS_PERCENT } from '../data/modul.js'
import { banyakJawaban, clearDraft, durasi, gabungHasil, hitungHasil, jam, jumlahKunci, labelSoal, loadDraft, nilaiSoal, saveDraft, soalSalah, terpilih } from '../lib/kuis.js'
import { mainkan } from '../lib/suara.js'
import { entryOf } from '../lib/progress.js'
import { AnswerOption, Button, Chip, Icon, Mascot, Toggle } from '../ui/index.js'
import { cx } from '../ui/cx.js'
import { recordKuis, useProgress } from './useProgress.js'
import { useSuara } from './useSuara.js'

const Md = ({ text, inline }) => <MarkdownView variant="modul" text={text} inline={inline} />
const store = () => (typeof window !== 'undefined' ? window.localStorage : undefined)

/** Sakelar suara kuis (nada benar, salah, dan lulus). Pilihan tersimpan di perangkat. */
export function SuaraToggle() {
  const [aktif, ubah] = useSuara()
  return (
    <div className="text-body flex items-center gap-2 text-ink-soft">
      <Toggle checked={aktif} onChange={(v) => { ubah(v); if (v) mainkan('pilih') }} label="Suara kuis" />
      Suara
    </div>
  )
}

// ------------------------------------------------------------------ satu soal
/**
 * Pilihan jawaban satu soal. Sebelum dikunci, opsi terpilih ditandai biru. Setelah dijawab (`terkunci`) setiap opsi langsung dikoreksi:
 * benar (hijau, centang), salah (merah, silang), atau "seharusnya dipilih" pada soal banyak jawaban; semuanya dengan ikon dan teks, bukan hanya warna.
 * @param {{ q: any, pilihan: string[], jawaban?: any, terkunci: boolean, onPilih: (id: string) => void }} props
 */
export function SoalView({ q, pilihan, jawaban, terkunci, onPilih }) {
  const banyak = banyakJawaban(q)
  const perlu = jumlahKunci(q)
  const kunciIds = [].concat(q.kunci)
  const pilih = terkunci ? terpilih(q, jawaban) : pilihan
  const stateOpsi = (id) => {
    if (!terkunci) return pilih.includes(id) ? 'selected' : 'default'
    const dipilih = pilih.includes(id)
    const benar = kunciIds.includes(id)
    if (dipilih) return benar ? 'correct' : 'wrong'
    return benar ? (banyak ? 'missed' : 'correct') : 'default'
  }
  return (
    <div className="mt-4" role="group" aria-labelledby={`teks-soal-${q.no}`}>
      {banyak && (
        <p role="status" className="text-caption mb-2 text-ink-soft">
          Pilih {perlu} jawaban yang benar.{' '}
          {!terkunci && (
            <span className={cx('text-body-strong', pilih.length > perlu ? 'text-bad-text' : 'text-ink')}>
              Terpilih {pilih.length} dari {perlu}{pilih.length > perlu ? `, kurangi sampai tepat ${perlu}` : ''}.
            </span>
          )}
        </p>
      )}
      <div className="space-y-2">
        {q.opsi.map((o) => (
          <AnswerOption key={o.id} letter={o.id} multi={banyak} state={stateOpsi(o.id)} dipilih={terkunci && pilih.includes(o.id)} terkunci={terkunci} onClick={() => !terkunci && onPilih(o.id)}>
            <Md text={o.teks} inline />
          </AnswerOption>
        ))}
      </div>
    </div>
  )
}


// ------------------------------------------------------------------ hasil
function BarisHasil({ q, r }) {
  const [buka, setBuka] = useState(false)
  const status = r.benar === true ? 'benar' : r.benar === false ? 'salah' : 'belum'
  return (
    <li className="border-t border-line first:border-t-0">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        <span className={cx('flex size-8 shrink-0 items-center justify-center rounded-sm', status === 'benar' ? 'bg-brand-mint text-on-orange' : status === 'salah' ? 'bg-bad text-on-error' : 'bg-placeholder text-ink-soft')}>
          <Icon name={status === 'benar' ? 'check' : status === 'salah' ? 'x' : 'info'} size={16} />
        </span>
        <span className="text-pixel-s text-ink-soft">{q.no}</span>
        <Chip type="default">{labelSoal(q)}</Chip>
        <span className="text-body min-w-0 flex-1 basis-60 text-ink">
          <Md text={q.teks} inline />
        </span>
        <span className={cx('text-body-strong', status === 'benar' ? 'text-ok-text' : status === 'salah' ? 'text-bad-text' : 'text-ink-soft')}>{status === 'benar' ? 'Benar' : status === 'salah' ? 'Salah' : 'Belum dinilai'}</span>
        <button
          type="button"
          aria-expanded={buka}
          onClick={() => {
            if (!buka && status !== 'belum') mainkan(status)
            setBuka((b) => !b)
          }}
          className="text-caption inline-flex items-center gap-1 rounded-sm text-control"
        >
          {buka ? 'Tutup pembahasan' : 'Lihat pembahasan'}
          <Icon name={buka ? 'up' : 'down'} size={14} />
        </button>
      </div>
      {buka && (
        <div className="space-y-3 bg-panel px-4 pb-4 pt-1">
          <div className="grid gap-3 md:grid-cols-2">
            <div className={cx('rounded-sm p-3', status === 'benar' ? 'bg-ok-bg' : 'bg-bad-bg')}>
              <p className="text-caption text-ink-soft">Jawabanmu</p>
              <div className="text-code-bold text-ink">{r.jawabanTeks ? <Md text={r.jawabanTeks} inline /> : '(kosong)'}</div>
            </div>
            <div className="rounded-sm bg-ok-bg p-3">
              <p className="text-caption text-ink-soft">Kunci</p>
              <div className="text-code-bold text-ink">
                <Md text={r.kunciTeks} inline />
              </div>
            </div>
          </div>
          <div className="rounded-sm border-l-4 border-brand-blue bg-info-bg px-4 py-2">
            <p className="text-label flex items-center gap-2 text-control uppercase">
              <Icon name="info" size={16} />
              Pembahasan
            </p>
            <Md text={q.pembahasan} />
          </div>
        </div>
      )}
    </li>
  )
}

/**
 * Ringkasan hasil dan daftar pembahasan.
 * `lanjut` ({ to, label }) mengganti tautan akhir; bila kosong dipakai "Lanjut ke Modul" atau "Kembali ke daftar Materi".
 * `statistik` (node) disisipkan di antara ringkasan dan daftar soal.
 */
export function Hasil({ kuis, hasil, next, lanjut, statistik, onUlang, onUlangSalah }) {
  const salah = soalSalah(kuis.soal, hasil)
  const entry = useProgress()[kuis.modul]
  const best = entry?.kuis.best
  return (
    <div>
      <div className="rounded-sm border-[1.5px] border-brand-yellow-strong bg-surface p-5">
        <div className="flex flex-wrap items-center gap-5">
          <Mascot expression={hasil.lulus ? 'senang' : 'berpikir'} size={120} />
          <div className="min-w-0 flex-1 basis-72">
            <p className="text-label text-accent uppercase">
              Percobaan ke-{hasil.percobaan ?? 1}
              {hasil.detik !== undefined ? ` · ${durasi(hasil.detik)}` : ''}
            </p>
            <p className="mt-1 flex flex-wrap items-center gap-3">
              <span className="text-pixel-l text-heading" aria-hidden="true">
                {hasil.skor} / {hasil.total} · {hasil.persen}%
              </span>
              <span className="sr-only">{`Skor ${hasil.skor} dari ${hasil.total}, ${hasil.persen} persen`}</span>
              <Chip type={hasil.lulus ? 'sukses' : 'gagal'}>{hasil.lulus ? `Lulus · batas ${PASS_PERCENT}%` : `Belum lulus · batas ${PASS_PERCENT}%`}</Chip>
            </p>
            <p className="text-body mt-1 text-ink-soft">
              {best ? `Skor terbaik tersimpan: ${best.skor}/${best.total}. ` : ''}
              {salah.length > 0 ? `${salah.length} soal perlu diulang. Buka pembahasan di bawah.` : 'Semua soal benar.'}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Button variant="navigasi" icon="refresh" onClick={onUlang}>
                Ulangi Kuis
              </Button>
              {salah.length > 0 && (
                <Button variant="navigasiGaris" icon="reset" onClick={onUlangSalah}>
                  Ulangi yang salah saja ({salah.length})
                </Button>
              )}
              <SuaraToggle />
              {lanjut ? (
                <Button as={Link} to={lanjut.to} variant="tautan" iconRight="arrowR">
                  {lanjut.label}
                </Button>
              ) : next ? (
                <Button as={Link} to={`/materi/${next.id}`} variant="tautan" iconRight="arrowR">
                  Lanjut ke Modul {next.id}
                </Button>
              ) : (
                <Button as={Link} to="/materi" variant="tautan" iconRight="arrowR">
                  Kembali ke daftar Materi
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      {statistik}
      <ul className="mt-5 overflow-hidden rounded-sm border border-line bg-card">
        {kuis.soal.map((q) => {
          const r = hasil.perSoal.find((x) => x.no === q.no)
          return r ? <BarisHasil key={q.no} q={q} r={r} /> : null
        })}
      </ul>
    </div>
  )
}

// ------------------------------------------------------------------ kuis berjalan
function Jalan({ modul, kuis, aktif, awal, onSelesai, onKeluar }) {
  const [index, setIndex] = useState(awal?.index ?? 0)
  // `jawaban` hanya berisi soal yang sudah diperiksa (dikunci); `pilihan` adalah pilihan sementara pada soal banyak jawaban.
  const [jawaban, setJawaban] = useState(awal?.jawaban ?? {})
  const [pilihan, setPilihan] = useState({})
  const [detik, setDetik] = useState(awal?.detik ?? 0)
  const [timer, setTimer] = useState(true)
  const q = aktif[index]
  const last = index === aktif.length - 1
  const terkunci = jawaban[q.no] !== undefined
  const banyak = banyakJawaban(q)
  const perlu = jumlahKunci(q)
  const sementara = pilihan[q.no] ?? []
  const hasilSoal = terkunci ? nilaiSoal(q, jawaban[q.no]) : null

  useEffect(() => {
    const t = setInterval(() => setDetik((d) => d + 1), 1000)
    return () => clearInterval(t)
  }, [])
  useEffect(() => {
    saveDraft(store(), modul.id, { nos: aktif.map((x) => x.no), index, jawaban, ragu: [], detik })
  }, [modul.id, aktif, index, jawaban, detik])

  const periksa = (nilai) => {
    setJawaban((j) => ({ ...j, [q.no]: nilai }))
    mainkan(nilaiSoal(q, nilai).benar ? 'benar' : 'salah')
  }
  const pilih = (id) => {
    if (terkunci) return
    if (!banyak) return periksa(id)
    mainkan('pilih')
    setPilihan((p) => {
      const cur = p[q.no] ?? []
      return { ...p, [q.no]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] }
    })
  }
  const lanjut = () => (last ? onSelesai({ jawaban, detik }) : setIndex((i) => i + 1))

  useEffect(() => {
    const onKey = (e) => {
      const el = e.target
      if (el instanceof HTMLElement && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))) return
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const opt = q.opsi.find((o) => o.id.toLowerCase() === e.key.toLowerCase())
      if (opt) pilih(opt.id)
      else if (e.key === 'Enter') {
        if (terkunci) lanjut()
        else if (banyak && sementara.length === perlu) periksa(sementara)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const benarSejauhIni = aktif.filter((x) => jawaban[x.no] !== undefined && nilaiSoal(x, jawaban[x.no]).benar).length
  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="text-label text-accent uppercase">{aktif.length === kuis.soal.length ? `Modul ${modul.id} · Kuis Pemahaman` : `Modul ${modul.id} · Ulangi yang salah`}</p>
        <div className="ml-auto flex items-center gap-3">
          <div className="text-body flex items-center gap-2 text-ink-soft">
            <Toggle checked={timer} onChange={setTimer} label="Penghitung waktu" />
            Timer
          </div>
          {timer && <span className="text-code-bold rounded-sm bg-panel px-3 py-1.5 text-ink" aria-live="off">{jam(detik)}</span>}
          <SuaraToggle />
          <Button variant="tautan" size="s" icon="x" onClick={onKeluar}>
            Keluar
          </Button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span className="text-body-strong text-heading">
          Soal {index + 1} / {aktif.length}
        </span>
        <div className="flex gap-1" aria-hidden="true">
          {aktif.map((x, i) => {
            const j = jawaban[x.no]
            const ok = j !== undefined && nilaiSoal(x, j).benar
            return <span key={x.no} className={cx('h-3 w-7 rounded-[2px] border-2', i === index ? 'border-brand-orange bg-card' : j === undefined ? 'border-transparent bg-placeholder' : ok ? 'border-ok bg-brand-mint' : 'border-bad bg-bad')} />
          })}
        </div>
        <span className="text-caption ml-auto text-ink-soft">Benar sejauh ini: {benarSejauhIni} dari {Object.keys(jawaban).length}</span>
      </div>

      <div className="mt-4 rounded-sm border border-line bg-card p-4 md:p-5">
        <div className="flex items-center justify-between gap-3">
          <Chip type="info">{labelSoal(q)}</Chip>
          <span className="text-caption text-ink-soft">Soal {q.no} · dari kuis PDF Modul {modul.id}</span>
        </div>
        <div id={`teks-soal-${q.no}`} className="text-body-l mt-3 font-medium text-heading">
          <Md text={q.teks} />
        </div>
        <SoalView q={q} pilihan={sementara} jawaban={jawaban[q.no]} terkunci={terkunci} onPilih={pilih} />

        <div role="status" aria-live="polite">
          {hasilSoal && (
            <div className={cx('mt-4 rounded-sm border-l-4 px-4 py-3', hasilSoal.benar ? 'border-ok bg-ok-bg' : 'border-bad bg-bad-bg')}>
              <p className={cx('text-body-strong flex items-center gap-2', hasilSoal.benar ? 'text-ok-text' : 'text-bad-text')}>
                <Icon name={hasilSoal.benar ? 'check' : 'x'} size={18} />
                {hasilSoal.benar ? 'Benar!' : banyak && terpilih(q, jawaban[q.no]).some((id) => [].concat(q.kunci).includes(id)) ? 'Belum tepat: pilihanmu belum persis sama dengan kunci.' : 'Belum tepat.'}
              </p>
              {!hasilSoal.benar && (
                <p className="text-body mt-1 text-ink">
                  Kunci: <Md text={hasilSoal.kunciTeks} inline />
                </p>
              )}
              <div className="mt-2">
                <Md text={q.pembahasan} />
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {!terkunci && banyak && (
            <Button variant="konfirmasi" icon="check" disabled={sementara.length !== perlu} onClick={() => periksa(sementara)}>
              Periksa jawaban
            </Button>
          )}
          {!terkunci && <p className="text-caption text-ink-soft">{banyak ? `Pilih tepat ${perlu} jawaban, lalu periksa.` : 'Pilih satu jawaban; langsung diperiksa.'}</p>}
          <div className="ml-auto flex items-center gap-3">
            <Button variant={last ? 'konfirmasi' : 'navigasi'} icon={last ? 'check' : undefined} iconRight={last ? undefined : 'arrowR'} disabled={!terkunci} onClick={lanjut}>
              {last ? 'Selesai dan lihat hasil' : 'Berikutnya'}
            </Button>
          </div>
        </div>
      </div>
      <p className="text-caption mt-3 flex items-center gap-2 text-ink-soft">
        <Icon name="info" size={14} />
        Tekan {q.opsi.map((o) => o.id).join('–')} untuk memilih{banyak ? ' atau membatalkan' : ''}, Enter untuk {terkunci ? 'lanjut' : banyak ? 'memeriksa' : 'lanjut setelah dijawab'}. Jawaban tersimpan otomatis di perangkat, juga saat offline.
      </p>
    </div>
  )
}

// ------------------------------------------------------------------ pembungkus
/** Kuis Pemahaman satu modul: mulai, mengerjakan (jawaban tersimpan otomatis), hasil dengan pembahasan, dan ulangi yang salah saja. */
export default function KuisModul({ modul, kuis, next, lanjut, statistik }) {
  const all = useProgress()
  const entry = entryOf(all, modul.id)
  const terakhir = entry.kuis.hasil
  const nomorSah = useMemo(() => kuis.soal.map((q) => q.no), [kuis])
  const [draf, setDraf] = useState(() => loadDraft(store(), modul.id, nomorSah))
  const [mode, setMode] = useState(terakhir ? 'hasil' : 'intro')
  const [aktif, setAktif] = useState(kuis.soal)
  const [awal, setAwal] = useState(null)
  const [kunciKey, setKunciKey] = useState(0)
  // Fokus pindah ke bagian baru saat tahap berganti (mulai, selesai, keluar) supaya pembaca layar dan pengguna keyboard tidak tertinggal di tombol yang sudah hilang.
  // Hanya bila tahap benar-benar berubah dari nilai sebelumnya: efek ini juga berjalan saat halaman pertama dibuka (dan dua kali di StrictMode),
  // dan di sana fokus tidak boleh dipindah karena halaman akan tergulir ke kuis.
  const wadah = useRef(null)
  const sebelumnya = useRef({ mode, kunciKey })
  useEffect(() => {
    const prev = sebelumnya.current
    if (prev.mode === mode && prev.kunciKey === kunciKey) return
    sebelumnya.current = { mode, kunciKey }
    wadah.current?.focus()
  }, [mode, kunciKey])

  const mulai = (subset, dariDraf = null) => {
    if (!dariDraf) clearDraft(store(), modul.id)
    setDraf(null)
    setAktif(subset)
    setAwal(dariDraf)
    setKunciKey((k) => k + 1)
    setMode('jalan')
  }
  const selesai = ({ jawaban, detik }) => {
    const h = hitungHasil(aktif, jawaban)
    const penuh = aktif.length === kuis.soal.length || !terakhir ? h : gabungHasil(terakhir, h)
    recordKuis(modul.id, { ...penuh, detik, percobaan: entry.kuis.attempts + 1 })
    mainkan(penuh.lulus ? 'lulus' : 'gagal')
    clearDraft(store(), modul.id)
    setMode('hasil')
  }

  const bungkus = (isi) => (
    <div ref={wadah} tabIndex={-1} className="outline-none">
      {isi}
    </div>
  )
  if (mode === 'jalan') {
    return bungkus(<Jalan key={kunciKey} modul={modul} kuis={kuis} aktif={aktif} awal={awal} onSelesai={selesai} onKeluar={() => setMode(terakhir ? 'hasil' : 'intro')} />)
  }
  if (mode === 'hasil' && terakhir) {
    return bungkus(<Hasil kuis={{ ...kuis, modul: modul.id }} hasil={terakhir} next={next} lanjut={lanjut} statistik={statistik?.(terakhir)} onUlang={() => mulai(kuis.soal)} onUlangSalah={() => mulai(soalSalah(kuis.soal, terakhir))} />)
  }
  return bungkus(
    <div className="rounded-sm border-[1.5px] border-brand-yellow-strong bg-surface p-5">
      <div className="flex flex-wrap items-center gap-5">
        <Mascot expression="netral" size={110} />
        <div className="min-w-0 flex-1 basis-72">
          <p className="text-label text-accent uppercase">Kuis pemahaman · Modul {modul.id}</p>
          <h3 className="text-h3 mt-1 text-heading">Kerjakan {kuis.soal.length} soal {kuis.judul}</h3>
          <p className="text-body mt-1 text-ink-soft">
            Semua soal pilihan ganda. Ada soal dengan satu jawaban dan ada yang harus memilih beberapa jawaban sekaligus (jumlahnya tertulis di tiap soal; soal baru benar bila semua pilihan yang benar terpilih dan tidak ada yang salah). Setiap soal langsung dikoreksi begitu dijawab, lengkap dengan pembahasannya, lalu lanjut ke soal berikutnya. Batas lulus {PASS_PERCENT}%.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {draf ? (
              <>
                <Button variant="navigasi" iconRight="arrowR" onClick={() => mulai(kuis.soal.filter((q) => draf.nos.includes(q.no)), draf)}>
                  Lanjutkan kuis ({Object.keys(draf.jawaban).length} soal terjawab)
                </Button>
                <Button variant="netral" onClick={() => mulai(kuis.soal)}>
                  Mulai dari awal
                </Button>
              </>
            ) : (
              <Button variant="navigasi" icon="play" onClick={() => mulai(kuis.soal)}>
                Mulai kuis
              </Button>
            )}
            {terakhir && (
              <Button variant="tautan" onClick={() => setMode('hasil')}>
                Lihat hasil terakhir
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>,
  )
}

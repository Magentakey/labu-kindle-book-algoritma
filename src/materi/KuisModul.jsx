import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import MarkdownView from '../components/MarkdownView/MarkdownView.jsx'
import { PASS_PERCENT } from '../data/modul.js'
import { TIPE_LABEL, clearDraft, durasi, gabungHasil, hitungHasil, jam, loadDraft, saveDraft, soalSalah, sudahDijawab } from '../lib/kuis.js'
import { entryOf } from '../lib/progress.js'
import { AnswerOption, Button, Chip, Icon, Mascot, Toggle } from '../ui/index.js'
import { cx } from '../ui/cx.js'
import { recordKuis, useProgress } from './useProgress.js'

const Md = ({ text, inline }) => <MarkdownView variant="modul" text={text} inline={inline} />
const store = () => (typeof window !== 'undefined' ? window.localStorage : undefined)

// ------------------------------------------------------------------ satu soal
function IsianField({ f, value, onChange }) {
  const id = `isian-${f.label}`
  return (
    <label htmlFor={id} className="flex flex-col gap-1">
      <span className="text-caption text-ink-soft">{f.label}</span>
      {f.jenis === 'pilih' ? (
        <select id={id} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className="text-body h-10 rounded-sm border border-line bg-card px-3 text-ink">
          <option value="">Pilih…</option>
          {f.opsi.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <input id={id} inputMode="decimal" value={value ?? ''} onChange={(e) => onChange(e.target.value)} className="text-code h-10 rounded-sm border border-line bg-card px-3 text-ink" placeholder="angka" />
      )}
    </label>
  )
}

export function SoalView({ q, jawaban, setJawaban, kunciTampil, tampilkanKunci }) {
  if (q.opsi) {
    return (
      <div className="mt-4 space-y-2">
        {q.opsi.map((o) => (
          <AnswerOption key={o.id} letter={o.id.length === 1 ? o.id : o.id[0]} state={jawaban === o.id ? 'selected' : 'default'} onClick={() => setJawaban(o.id)}>
            <Md text={o.teks} inline />
          </AnswerOption>
        ))}
      </div>
    )
  }
  if (q.isian) {
    const isi = Array.isArray(jawaban) ? jawaban : []
    return (
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {q.isian.map((f, i) => (
          <IsianField key={f.label} f={f} value={isi[i]} onChange={(v) => { const n = q.isian.map((_, k) => isi[k] ?? ''); n[i] = v; setJawaban(n) }} />
        ))}
      </div>
    )
  }
  const j = jawaban ?? { teks: '', sesuai: null }
  return (
    <div className="mt-4">
      <label className="text-caption text-ink-soft" htmlFor={`tulis-${q.no}`}>
        Tulis jawabanmu
      </label>
      <textarea id={`tulis-${q.no}`} rows={4} value={j.teks} onChange={(e) => setJawaban({ ...j, teks: e.target.value })} className="text-body mt-1 w-full rounded-sm border border-line bg-card p-3 text-ink" />
      {!kunciTampil ? (
        <Button variant="kontrol" size="s" className="mt-2" onClick={tampilkanKunci}>
          Tampilkan kunci
        </Button>
      ) : (
        <div className="mt-3 rounded-sm border border-line bg-ok-bg p-3">
          <p className="text-label text-ok-text uppercase">Kunci</p>
          <Md text={q.kunciTeks} />
          <p className="text-body-strong mt-2 text-heading">Apakah jawabanmu sudah sesuai?</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button variant="konfirmasi" size="s" onClick={() => setJawaban({ ...j, sesuai: true })}>
              Sudah sesuai
            </Button>
            <Button variant="bahaya" size="s" onClick={() => setJawaban({ ...j, sesuai: false })}>
              Belum sesuai
            </Button>
          </div>
          {typeof j.sesuai === 'boolean' && <p className="text-caption mt-2 text-ink-soft">Dinilai sendiri: {j.sesuai ? 'sesuai' : 'belum sesuai'}.</p>}
        </div>
      )}
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
        <Chip type="default">{TIPE_LABEL[q.tipe]}</Chip>
        <span className="text-body min-w-0 flex-1 basis-60 text-ink">
          <Md text={q.teks} inline />
        </span>
        <span className={cx('text-body-strong', status === 'benar' ? 'text-ok-text' : status === 'salah' ? 'text-bad-text' : 'text-ink-soft')}>{status === 'benar' ? 'Benar' : status === 'salah' ? 'Salah' : 'Belum dinilai'}</span>
        <button type="button" aria-expanded={buka} onClick={() => setBuka((b) => !b)} className="text-caption inline-flex items-center gap-1 rounded-sm text-control">
          {buka ? 'Tutup pembahasan' : 'Lihat pembahasan'}
          <Icon name={buka ? 'up' : 'down'} size={14} />
        </button>
      </div>
      {buka && (
        <div className="space-y-3 bg-panel px-4 pb-4 pt-1">
          <div className="grid gap-3 md:grid-cols-2">
            <div className={cx('rounded-sm p-3', status === 'benar' ? 'bg-ok-bg' : 'bg-bad-bg')}>
              <p className="text-caption text-ink-soft">Jawabanmu</p>
              <div className="text-code-bold text-ink">{q.mandiri ? <span className="whitespace-pre-wrap">{r.jawabanTeks || '(kosong)'}</span> : r.jawabanTeks ? <Md text={r.jawabanTeks} inline /> : '(kosong)'}</div>
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

export function Hasil({ kuis, hasil, next, onUlang, onUlangSalah }) {
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
              <span className="text-pixel-l text-heading" aria-label={`Skor ${hasil.skor} dari ${hasil.total}, ${hasil.persen} persen`}>
                {hasil.skor} / {hasil.total} · {hasil.persen}%
              </span>
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
              {next ? (
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
  const [jawaban, setJawaban] = useState(awal?.jawaban ?? {})
  const [ragu, setRagu] = useState(new Set(awal?.ragu ?? []))
  const [kunci, setKunci] = useState(new Set())
  const [detik, setDetik] = useState(awal?.detik ?? 0)
  const [timer, setTimer] = useState(true)
  const q = aktif[index]
  const last = index === aktif.length - 1

  useEffect(() => {
    const t = setInterval(() => setDetik((d) => d + 1), 1000)
    return () => clearInterval(t)
  }, [])
  useEffect(() => {
    saveDraft(store(), modul.id, { nos: aktif.map((x) => x.no), index, jawaban, ragu: [...ragu], detik })
  }, [modul.id, aktif, index, jawaban, ragu, detik])
  useEffect(() => {
    const onKey = (e) => {
      const el = e.target
      if (el instanceof HTMLElement && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))) return
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const opt = q.opsi?.find((o) => o.id.length === 1 && o.id.toLowerCase() === e.key.toLowerCase())
      if (opt) setJawaban((j) => ({ ...j, [q.no]: opt.id }))
      else if (e.key === 'Enter' && !last) setIndex((i) => i + 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [q, last])

  const set = (v) => setJawaban((j) => ({ ...j, [q.no]: v }))
  const toggleRagu = () =>
    setRagu((s) => {
      const n = new Set(s)
      if (n.has(q.no)) n.delete(q.no)
      else n.add(q.no)
      return n
    })

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
          <Button variant="tautan" size="s" icon="x" onClick={onKeluar}>
            Keluar
          </Button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span className="text-body-strong text-heading">
          Soal {index + 1} / {aktif.length}
        </span>
        <div className="flex gap-1" role="group" aria-label="Lompat ke soal">
          {aktif.map((x, i) => (
            <button
              key={x.no}
              type="button"
              aria-label={`Soal ${i + 1}${sudahDijawab(x, jawaban[x.no]) ? ', sudah dijawab' : ''}${ragu.has(x.no) ? ', ditandai ragu' : ''}`}
              aria-current={i === index ? 'step' : undefined}
              onClick={() => setIndex(i)}
              className={cx('h-3 w-7 rounded-[2px] border-2', i === index ? 'border-brand-orange bg-card' : ragu.has(x.no) ? 'border-brand-yellow-strong bg-brand-yellow' : sudahDijawab(x, jawaban[x.no]) ? 'border-ok bg-brand-mint' : 'border-transparent bg-placeholder')}
            />
          ))}
        </div>
      </div>
      <p className="text-caption mt-2 text-ink-soft">Klik blok untuk lompat ke soal. Jawaban tersimpan otomatis di perangkat, juga saat offline.</p>

      <div className="mt-4 rounded-sm border border-line bg-card p-4 md:p-5">
        <div className="flex items-center justify-between gap-3">
          <Chip type="info">{TIPE_LABEL[q.tipe]}</Chip>
          <span className="text-caption text-ink-soft">Soal {q.no} · dari kuis PDF Modul {modul.id}</span>
        </div>
        <div className="text-body-l mt-3 font-medium text-heading">
          <Md text={q.teks} />
        </div>
        <SoalView q={q} jawaban={jawaban[q.no]} setJawaban={set} kunciTampil={kunci.has(q.no)} tampilkanKunci={() => setKunci((s) => new Set(s).add(q.no))} />
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button variant="navigasiGaris" icon="arrowL" disabled={index === 0} onClick={() => setIndex(index - 1)}>
            Sebelumnya
          </Button>
          <div className="ml-auto flex items-center gap-3">
            <Button variant="kontrol" aria-pressed={ragu.has(q.no)} onClick={toggleRagu}>
              {ragu.has(q.no) ? 'Batal ragu' : 'Tandai ragu'}
            </Button>
            {last ? (
              <Button variant="konfirmasi" icon="check" onClick={() => onSelesai({ jawaban, detik })}>
                Selesai dan lihat hasil
              </Button>
            ) : (
              <Button variant="navigasi" iconRight="arrowR" onClick={() => setIndex(index + 1)}>
                Berikutnya
              </Button>
            )}
          </div>
        </div>
      </div>
      <p className="text-caption mt-3 flex items-center gap-2 text-ink-soft">
        <Icon name="info" size={14} />
        {q.opsi && q.opsi.every((o) => o.id.length === 1) ? `Tekan ${q.opsi.map((o) => o.id).join('–')} untuk memilih, ` : ''}Enter untuk lanjut.
      </p>
    </div>
  )
}

// ------------------------------------------------------------------ pembungkus
/** Kuis Pemahaman satu modul: mulai, mengerjakan (jawaban tersimpan otomatis), hasil dengan pembahasan, dan ulangi yang salah saja. */
export default function KuisModul({ modul, kuis, next }) {
  const all = useProgress()
  const entry = entryOf(all, modul.id)
  const terakhir = entry.kuis.hasil
  const nomorSah = useMemo(() => kuis.soal.map((q) => q.no), [kuis])
  const [draf, setDraf] = useState(() => loadDraft(store(), modul.id, nomorSah))
  const [mode, setMode] = useState(terakhir ? 'hasil' : 'intro')
  const [aktif, setAktif] = useState(kuis.soal)
  const [awal, setAwal] = useState(null)
  const [kunciKey, setKunciKey] = useState(0)

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
    clearDraft(store(), modul.id)
    setMode('hasil')
  }

  if (mode === 'jalan') {
    return <Jalan key={kunciKey} modul={modul} kuis={kuis} aktif={aktif} awal={awal} onSelesai={selesai} onKeluar={() => setMode(terakhir ? 'hasil' : 'intro')} />
  }
  if (mode === 'hasil' && terakhir) {
    return <Hasil kuis={{ ...kuis, modul: modul.id }} hasil={terakhir} next={next} onUlang={() => mulai(kuis.soal)} onUlangSalah={() => mulai(soalSalah(kuis.soal, terakhir))} />
  }
  return (
    <div className="rounded-sm border-[1.5px] border-brand-yellow-strong bg-surface p-5">
      <div className="flex flex-wrap items-center gap-5">
        <Mascot expression="netral" size={110} />
        <div className="min-w-0 flex-1 basis-72">
          <p className="text-label text-accent uppercase">Kuis pemahaman · Modul {modul.id}</p>
          <h3 className="text-h3 mt-1 text-heading">Kerjakan {kuis.soal.length} soal Insertion Sort</h3>
          <p className="text-body mt-1 text-ink-soft">Soal terdiri atas penelusuran, pilihan ganda, perhitungan, benar/salah, dan analisis. Batas lulus {PASS_PERCENT}%. Soal penelusuran dan analisis dinilai sendiri setelah kunci ditampilkan.</p>
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
    </div>
  )
}

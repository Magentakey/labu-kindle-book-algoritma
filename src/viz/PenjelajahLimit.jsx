import { useEffect, useMemo, useState } from 'react'
import { Icon, Segmented, Select } from '../ui/index.js'
import { cx } from '../ui/cx.js'
import GrafikRasio from './GrafikRasio.jsx'
import PenjelajahShell from './PenjelajahShell.jsx'
import { Angka, Panel } from './PenjelajahUi.jsx'
import { angkaID } from './growthModel.js'
import { banding, barisDefinisi, bentuk, bentukById, cariN0, formatLog, kasusById, kasusDefinisi, kesimpulanLimit, logRasio, ujiLimit } from './limitModel.js'

const opsiBentuk = bentuk.map((b) => ({ value: b.id, label: b.label }))
// Contoh dari Modul 07 (Tabel 3, bagian 5.3, Soal 4, dan program Python). `teks` = isian koefisien yang ditulis sebagai pecahan.
const contoh = [
  { id: 'a', judul: '2n dan n²  (Tabel 3)', f: 'n', g: 'n2', cf: 2, cg: 1 },
  { id: 'b', judul: '2n² dan n²  (Bagian 3.3)', f: 'n2', g: 'n2', cf: 2, cg: 1 },
  { id: 'c', judul: 'n²/2 dan n  (Bagian 4.1)', f: 'n2', g: 'n', cf: 0.5, cg: 1, teks: { cf: '1/2' } },
  { id: 'd', judul: 'lg n dan n  (L’Hôpital, 5.3a)', f: 'lg', g: 'n', cf: 1, cg: 1 },
  { id: 'e', judul: 'n² dan 2ⁿ  (L’Hôpital, 5.3d)', f: 'n2', g: '2n', cf: 1, cg: 1 },
  { id: 'f', judul: 'n lg n dan n^1,5  (Soal 4)', f: 'nlg', g: 'n15', cf: 1, cg: 1 },
]
const opsiContoh = [...contoh.map((c) => ({ value: c.id, label: c.judul })), { value: 'sendiri', label: 'Masukkan sendiri' }]
const NOTASI = [
  ['o', 'o (little-o)', '<'],
  ['O', 'O (Big-Oh)', '≤'],
  ['Theta', 'Θ (Theta)', '='],
  ['Omega', 'Ω (Omega)', '≥'],
  ['omega', 'ω (little-omega)', '>'],
]
const NILAI_N = [10, 100, 1000, 1_000_000]

const suku = (cf, label) => (cf === 1 ? label : `${angkaID(cf, Number.isInteger(cf) ? 0 : 3).replace(/,?0+$/, '')}${label === '1' ? '' : label}`)

function UjiLimit() {
  const [pilihan, setPilihan] = useState('a')
  const [versi, setVersi] = useState(0)
  const [idF, setIdF] = useState('n')
  const [idG, setIdG] = useState('n2')
  const [cf, setCf] = useState(2)
  const [cg, setCg] = useState(1)
  const [teks, setTeks] = useState({})
  const muat = (id) => {
    if (id === 'sendiri') return setPilihan('sendiri')
    const x = contoh.find((c) => c.id === id)
    setPilihan(id)
    setIdF(x.f)
    setIdG(x.g)
    setCf(x.cf)
    setCg(x.cg)
    setTeks(x.teks ?? {})
    setVersi((v) => v + 1)
  }
  const sendiri = (fn) => (v) => {
    setPilihan('sendiri')
    fn(v)
  }
  const u = useMemo(() => ujiLimit(idF, idG, cf, cg), [idF, idG, cf, cg])
  const lf = suku(cf, bentukById(idF).label)
  const lg = suku(cg, bentukById(idG).label)
  const eksFakt = [idF, idG].some((id) => ['2n', 'nf'].includes(id))
  const dekade = eksFakt ? 3 : 6
  const ns = eksFakt ? NILAI_N.slice(0, 3) : NILAI_N
  const ok = u.cmp === 0

  return (
    <Panel judul="Uji limit: bandingkan dua fungsi" id="pl-uji">
      <p className="text-body text-ink-soft">
        Pilih f(n) dan g(n), lalu lihat ke mana rasio f(n)/g(n) menuju ketika n membesar. Limit L menentukan kelima notasi sekaligus (Tabel 3 Modul 07). Tabel angka bukan bukti, hanya membantu melihat arahnya.
      </p>
      <div className="mt-3 flex flex-wrap items-start gap-x-4 gap-y-3">
        <Select label="Contoh" value={pilihan} onChange={muat} options={opsiContoh} />
        <Select label="f(n)" value={idF} onChange={sendiri(setIdF)} options={opsiBentuk} />
        <Select label="g(n)" value={idG} onChange={sendiri(setIdG)} options={opsiBentuk} />
      </div>
      <div className="mt-3 flex flex-wrap items-start gap-x-4 gap-y-3">
        <Angka key={`cf${versi}`} label="Koefisien f (c_f)" value={cf} awal={teks.cf} onChange={sendiri(setCf)} min={0.01} max={1000} desimal pecahan />
        <Angka key={`cg${versi}`} label="Koefisien g (c_g)" value={cg} awal={teks.cg} onChange={sendiri(setCg)} min={0.01} max={1000} desimal pecahan />
      </div>

      <p role="status" className={cx('text-body mt-4 flex items-start gap-3 rounded-sm border-l-4 p-3', ok ? 'border-brand-yellow-strong bg-surface text-ink' : 'border-ok bg-ok-bg text-ok-text')}>
        <Icon name={ok ? 'info' : 'check'} size={18} className="mt-0.5 shrink-0" />
        <span>
          <span className="text-body-strong block">
            L = lim {lf} / {lg} = {u.teksL}
          </span>
          {kesimpulanLimit(u, lf, lg)}
        </span>
      </p>

      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- wadah yang bisa digulir harus bisa difokus agar tabel lebar terbaca dengan keyboard */}
      <div role="region" aria-label="Tabel lima notasi, bisa digeser ke samping" tabIndex={0} className="mt-4 overflow-x-auto rounded-sm border border-line">
        <table className="w-full min-w-[28rem] border-collapse text-left">
          <caption className="text-body-strong border-b border-line bg-panel px-3 py-2 text-left text-heading">
            Kelima notasi untuk f(n) = {lf} dan g(n) = {lg}
          </caption>
          <thead>
            <tr className="text-caption border-b border-line text-ink-soft">
              <th scope="col" className="px-3 py-2">Notasi</th>
              <th scope="col" className="px-3 py-2">Analogi</th>
              <th scope="col" className="px-3 py-2">Benar?</th>
            </tr>
          </thead>
          <tbody>
            {NOTASI.map(([k, nama, analogi]) => (
              <tr key={k} className="border-b border-line last:border-0">
                <th scope="row" className="text-body px-3 py-2 font-semibold">{nama}</th>
                <td className="text-code px-3 py-2">a {analogi} b</td>
                <td className="text-body px-3 py-2">{u.benar[k] ? <span className="text-ok-text">✓ benar</span> : <span className="text-bad-text">✕ salah</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <GrafikRasio className="mt-4" idF={idF} idG={idG} cf={cf} cg={cg} dekade={dekade} />

      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- wadah yang bisa digulir harus bisa difokus agar tabel lebar terbaca dengan keyboard */}
      <div role="region" aria-label="Tabel rasio, bisa digeser ke samping" tabIndex={0} className="mt-4 overflow-x-auto rounded-sm border border-line">
        <table className="w-full min-w-[28rem] border-collapse text-left">
          <caption className="text-body-strong border-b border-line bg-panel px-3 py-2 text-left text-heading">Rasio f(n)/g(n) untuk n yang membesar</caption>
          <thead>
            <tr className="text-caption border-b border-line text-ink-soft">
              <th scope="col" className="px-3 py-2">n</th>
              <th scope="col" className="px-3 py-2">f(n)/g(n)</th>
            </tr>
          </thead>
          <tbody>
            {ns.map((n) => (
              <tr key={n} className="border-b border-line last:border-0">
                <th scope="row" className="text-code px-3 py-2 font-semibold">{n === 1_000_000 ? '10⁶' : angkaID(n)}</th>
                <td className="text-code px-3 py-2">{formatLog(logRasio(idF, idG, cf, cg, n))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}

const opsiKasus = kasusDefinisi.map((k) => ({ id: k.id, label: k.judul }))

function Definisi() {
  const [id, setId] = useState('a')
  const [c, setC] = useState(0.01)
  const k = kasusById(id)
  const hasil = useMemo(() => cariN0(k, c), [k, c])
  const baris = hasil.ada ? barisDefinisi(k, c, hasil.n0) : []
  const sim = k.notasi === 'o' ? '<' : '>'
  const cobaGagal = [1, 10, 100].map((n) => ({ n, f: k.f(n), cg: c * k.g(n) }))
  return (
    <Panel judul="Definisi: untuk setiap c ada n₀" id="pl-def">
      <p className="text-body text-ink-soft">
        Little-o dan little-omega menuntut syarat berlaku untuk <strong>setiap</strong> konstanta c &gt; 0, sekecil atau sebesar apa pun. Pilih kasus dan c, lalu lihat n₀ yang dibutuhkan, atau apakah tidak ada sama sekali.
      </p>
      <div className="mt-3 flex flex-wrap items-start gap-x-4 gap-y-3">
        <Segmented label="Kasus" value={id} onChange={setId} options={opsiKasus} />
        <Angka key={id} label="c (konstanta)" value={c} onChange={setC} min={0.001} max={1000} desimal pecahan awal={String(c).replace('.', ',')} />
      </div>
      <p role="status" className={cx('text-body mt-4 flex items-start gap-3 rounded-sm border-l-4 p-3', hasil.ada ? 'border-ok bg-ok-bg text-ok-text' : 'border-bad bg-bad-bg text-bad-text')}>
        <Icon name={hasil.ada ? 'check' : 'alert'} size={18} className="mt-0.5 shrink-0" />
        <span>
          {hasil.ada ? (
            <>
              <span className="text-body-strong block">
                Untuk c = {angkaID(c, Number.isInteger(c) ? 0 : 3).replace(/,?0+$/, '')}, syarat {k.fl} {sim} c · {k.gl} berlaku mulai n₀ = {angkaID(hasil.n0)}.
              </span>
              {k.rumusN0 ? `Cocok dengan rumus di modul: ${k.rumusN0} = ${angkaID(k.n0Rumus(c))}.` : 'Untuk c ini syarat berlaku sejak n = 1.'}
            </>
          ) : (
            <>
              <span className="text-body-strong block">
                Tidak ada n₀ untuk c = {angkaID(c, Number.isInteger(c) ? 0 : 3).replace(/,?0+$/, '')}.
              </span>
              Karena rasio f/g tetap 2, syarat {k.fl} {sim} c · {k.gl} tidak pernah berlaku bila c ≤ 2. Satu c yang gagal sudah cukup untuk membuktikan {k.fl} ≠ {k.notasi}({k.gl}).
            </>
          )}
        </span>
      </p>
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- wadah yang bisa digulir harus bisa difokus agar tabel lebar terbaca dengan keyboard */}
      <div role="region" aria-label="Tabel contoh nilai, bisa digeser ke samping" tabIndex={0} className="mt-4 overflow-x-auto rounded-sm border border-line">
        <table className="w-full min-w-[30rem] border-collapse text-left">
          <caption className="text-body-strong border-b border-line bg-panel px-3 py-2 text-left text-heading">
            {hasil.ada ? 'Nilai di sekitar n₀' : 'Beberapa nilai n (syarat tidak pernah berlaku)'}
          </caption>
          <thead>
            <tr className="text-caption border-b border-line text-ink-soft">
              <th scope="col" className="px-3 py-2">n</th>
              <th scope="col" className="px-3 py-2">f(n) = {k.fl}</th>
              <th scope="col" className="px-3 py-2">c · g(n)</th>
              <th scope="col" className="px-3 py-2">Syarat f {sim} c·g</th>
            </tr>
          </thead>
          <tbody>
            {(hasil.ada ? baris : cobaGagal.map((r) => ({ ...r, ok: false }))).map((r) => (
              <tr key={r.n} className="border-b border-line last:border-0">
                <th scope="row" className="text-code px-3 py-2 font-semibold">{angkaID(r.n)}</th>
                <td className="text-code px-3 py-2">{angkaID(r.f, Number.isInteger(r.f) ? 0 : 2)}</td>
                <td className="text-code px-3 py-2">{angkaID(r.cg, Number.isInteger(r.cg) ? 0 : 2)}</td>
                <td className="text-body px-3 py-2">{r.ok ? <span className="text-ok-text">✓ berlaku</span> : <span className="text-bad-text">✕ tidak</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}

function Hierarki() {
  const pasang = bentuk.slice(1).map((b, i) => [bentuk[i], b])
  return (
    <Panel judul="Hierarki pertumbuhan" id="pl-hier">
      <p className="text-body text-ink-soft">
        Setiap fungsi pada daftar ini little-o dari fungsi berikutnya. Inilah bukti formal urutan pertumbuhan dari Modul 05 (lalu diperluas dengan √n dan n^1,5).
      </p>
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- wadah yang bisa digulir harus bisa difokus agar tabel lebar terbaca dengan keyboard */}
      <div role="region" aria-label="Tabel hierarki, bisa digeser ke samping" tabIndex={0} className="mt-3 overflow-x-auto rounded-sm border border-line">
        <table className="w-full min-w-[28rem] border-collapse text-left">
          <caption className="sr-only">Pasangan fungsi berurutan dan limit rasionya</caption>
          <thead>
            <tr className="text-caption border-b border-line text-ink-soft">
              <th scope="col" className="px-3 py-2">Pernyataan</th>
              <th scope="col" className="px-3 py-2">Limit f/g</th>
              <th scope="col" className="px-3 py-2">Rasio pada n = 1.000</th>
            </tr>
          </thead>
          <tbody>
            {pasang.map(([a, b]) => (
              <tr key={a.id} className="border-b border-line last:border-0">
                <th scope="row" className="text-code px-3 py-2 font-semibold">{a.label} = o({b.label})</th>
                <td className="text-code px-3 py-2">{banding(a, b) < 0 ? '0' : '—'}</td>
                <td className="text-code px-3 py-2">{formatLog(logRasio(a.id, b.id, 1, 1, 1000))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}

/** Penjelajah Little-o / ω (Modul 07): uji limit untuk lima notasi, definisi "untuk setiap c", dan hierarki pertumbuhan. */
export default function PenjelajahLimit({ a }) {
  useEffect(() => {
    document.title = `${a.judul} · LABU`
  }, [a.judul])
  return (
    <PenjelajahShell a={a}>
      <p className="text-body mt-4 max-w-3xl text-ink-soft">
        Bandingkan dua fungsi dengan uji limit, coba syarat &quot;untuk setiap c&quot; pada definisi, dan lihat urutan pertumbuhan fungsi. Setiap grafik punya padanan tabel.
      </p>
      <div className="mt-4 grid gap-6">
        <UjiLimit />
        <Definisi />
        <Hierarki />
      </div>
    </PenjelajahShell>
  )
}

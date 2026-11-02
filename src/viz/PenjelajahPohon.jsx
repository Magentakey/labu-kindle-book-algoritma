import { useEffect, useMemo, useState } from 'react'
import { Icon, Select } from '../ui/index.js'
import { cx } from '../ui/cx.js'
import PenjelajahShell from './PenjelajahShell.jsx'
import { Angka, Panel } from './PenjelajahUi.jsx'
import { sains } from './growthModel.js'
import { angkaID, contoh, contohById, klasifikasi, nilaiPengurangan, pembagiSolusi, nilaiT, pendominasi, pohonRekursi, teksBil, teksRecurrence, teksSolusi, teksSuku } from './masterModel.js'

const opsiContoh = [...contoh.map((c) => ({ value: c.id, label: c.judul })), { value: 'sendiri', label: 'Masukkan sendiri' }]
const opsiQ = [
  { value: '0', label: 'tanpa lg n' },
  { value: '1', label: 'dikali lg n' },
  { value: '2', label: 'dikali lg² n' },
]

/** Angka besar yang tetap terbaca: biasa sampai 10⁶, notasi ilmiah di atasnya. */
const formatBesar = (x) => {
  if (!Number.isFinite(x)) return '—'
  if (Math.abs(x) < 1e6) return angkaID(x, Number.isInteger(x) ? 0 : 2).replace(/,0+$/, '')
  return sains(Math.log10(x))
}

const KASUS_TEKS = {
  1: 'Kasus 1: daun mendominasi',
  2: 'Kasus 2: akar dan daun seimbang',
  3: 'Kasus 3: akar mendominasi',
  celah: 'Celah antara kasus 2 dan 3: Metode Master tidak berlaku',
  'tidak-sesuai': 'Bentuk tidak sesuai syarat Metode Master',
}

function Master({ state, set, versi, muat, pilihan, hasil, f }) {
  const { a, b, k, q, teks } = state
  const e = hasil.e
  const ok = [1, 2, 3].includes(hasil.kasus)
  const g = hasil.kasus === 'tidak-sesuai' ? '—' : `n^${teksBil(e)}`
  const eTeks = hasil.kasus === 'tidak-sesuai' ? '' : `log_${teksBil(b)} ${a} = ${teksBil(e, 3)}`
  const langkah = []
  if (hasil.kasus !== 'tidak-sesuai') {
    langkah.push(['Bentuk', `${teksRecurrence(a, b, f)} dengan a = ${a} ≥ 1 dan b = ${teksBil(b)} > 1.`])
    langkah.push(['g(n) = n^(log_b a)', `${eTeks}, jadi g(n) = ${g}${Number.isInteger(e) ? '' : ` ≈ ${teksSuku(Math.round(e * 1000) / 1000, 0)}`}.`])
    const bandingan = Math.abs(k - e) < 1e-9 ? 'sama dengan' : k < e ? 'lebih kecil dari' : 'lebih besar dari'
    langkah.push(['Bandingkan', `Pangkat n pada f(n) = ${teksSuku(k, q)} adalah ${teksBil(k)}, ${bandingan} ${teksBil(e, 3)}${q > 0 ? ` (f(n) juga dikali lg${q > 1 ? '²' : ''} n)` : ''}.`])
    if (hasil.kasus === 1) langkah.push(['Nilai ε', `f(n) = O(n^(${teksBil(e, 3)} − ε)) benar untuk 0 < ε ${hasil.epsilon.tertutup ? '≤' : '<'} ${teksBil(hasil.epsilon.maks, 3)}.`])
    if (hasil.kasus === 3) {
      langkah.push(['Nilai ε', `f(n) = Ω(n^(${teksBil(e, 3)} + ε)) benar untuk 0 < ε ${hasil.epsilon.tertutup ? '≤' : '<'} ${teksBil(hasil.epsilon.maks, 3)}.`])
      langkah.push(['Syarat keteraturan', `a·f(n/b) ≤ c·f(n) dipenuhi dengan c = a/b^k = ${teksBil(hasil.keteraturan.c, 3)} < 1.`])
    }
  }

  return (
    <Panel judul="Metode Master: kasus mana yang berlaku?" id="pp-master">
      <p className="text-body text-ink-soft">
        Isi a, b, dan f(n) = n^k (boleh dikali lg n). Penjelajah mengikuti prosedur Bagian 3.3 Modul 09: hitung g(n) = n^(log_b a), bandingkan dengan f(n), periksa syarat keteraturan untuk kasus 3, lalu tuliskan solusinya.
      </p>
      <div className="mt-3 flex flex-wrap items-start gap-x-4 gap-y-3">
        <Select label="Contoh" value={pilihan} onChange={muat} options={opsiContoh} />
      </div>
      <div className="mt-3 flex flex-wrap items-start gap-x-4 gap-y-3">
        <Angka key={`a${versi}`} label="a (banyak submasalah)" value={a} onChange={(v) => set({ a: v })} min={1} max={50} />
        <Angka key={`b${versi}`} label="b (pembagi ukuran)" value={b} awal={teks?.b} onChange={(v) => set({ b: v })} min={1} max={100} desimal pecahan />
        <Angka key={`k${versi}`} label="k (pangkat n pada f)" value={k} onChange={(v) => set({ k: v })} min={0} max={10} desimal pecahan awal={String(k).replace('.', ',')} />
        <Select label="Faktor logaritma" value={String(q)} onChange={(v) => set({ q: Number(v) })} options={opsiQ} />
      </div>

      <p role="status" className={cx('text-body mt-4 flex items-start gap-3 rounded-sm border-l-4 p-3', ok ? 'border-ok bg-ok-bg text-ok-text' : hasil.kasus === 'celah' ? 'border-brand-yellow-strong bg-surface text-ink' : 'border-bad bg-bad-bg text-bad-text')}>
        <Icon name={ok ? 'check' : hasil.kasus === 'celah' ? 'info' : 'alert'} size={18} className="mt-0.5 shrink-0" />
        <span>
          <span className="text-body-strong block">{KASUS_TEKS[hasil.kasus]}</span>
          {hasil.kasus === 'tidak-sesuai' ? (
            hasil.alasan
          ) : hasil.kasus === 'celah' ? (
            <>
              f(n) = {teksSuku(k, q)} memang lebih besar dari g(n) = {g}, tetapi hanya oleh faktor lg n, yang tumbuh lebih lambat dari n^ε untuk setiap ε &gt; 0. Dengan metode lain diperoleh {teksSolusi(hasil)}.
            </>
          ) : (
            <>
              {teksRecurrence(a, b, f)} → <strong>{teksSolusi(hasil)}</strong>
            </>
          )}
        </span>
      </p>

      {langkah.length > 0 && (
        <ol className="text-body mt-4 space-y-2" aria-label="Langkah penyelesaian">
          {langkah.map(([judul, isi], i) => (
            <li key={judul} className="flex gap-3">
              <span aria-hidden="true" className="text-code mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-blue-strong text-xs text-white">
                {i + 1}
              </span>
              <span>
                <span className="text-body-strong text-heading">{judul}. </span>
                {isi}
              </span>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  )
}

function Pohon({ a, b, f, hasil, L, setL }) {
  const sah = hasil.kasus !== 'tidak-sesuai'
  const pohon = useMemo(() => (sah ? pohonRekursi(a, b, f, L) : null), [sah, a, b, f, L])
  if (!sah) {
    return (
      <Panel judul="Pohon rekursi tingkat demi tingkat" id="pp-pohon">
        <p className="text-body text-ink-soft">Pohon rekursi hanya digambar untuk a ≥ 1 dan b &gt; 1.</p>
      </Panel>
    )
  }
  const semua = [...pohon.tingkat.map((t) => t.total), pohon.daun.total]
  const maks = Math.max(...semua)
  const dom = pendominasi(pohon)
  const domTeks = { akar: 'akar (tingkat 0)', daun: 'daun', seimbang: 'seimbang di hampir semua tingkat', tengah: 'tingkat di tengah' }[dom]
  const baris = [...pohon.tingkat.map((t) => ({ id: `t${t.i}`, nama: String(t.i), simpul: t.simpul, ukuran: t.ukuran, biaya: t.biayaSimpul, total: t.total })), { id: 'daun', nama: `${L} (daun)`, simpul: pohon.daun.simpul, ukuran: 1, biaya: 1, total: pohon.daun.total }]
  return (
    <Panel judul="Pohon rekursi tingkat demi tingkat" id="pp-pohon">
      <p className="text-body text-ink-soft">
        Untuk n = b^L, tingkat i punya a^i simpul berukuran n/b^i dan berbiaya f(n/b^i) per simpul. Daun (tingkat L) ada a^L = n^(log_b a) buah, masing-masing berbiaya T(1) = 1. Batang menunjukkan biaya tiap tingkat dibanding tingkat terbesar.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <label htmlFor="pp-L" className="text-caption text-ink-soft">
          Tinggi pohon L = <span className="text-code text-ink">{L}</span> (n = b^L = <span className="text-code text-ink">{formatBesar(pohon.n)}</span>)
        </label>
        <input id="pp-L" type="range" min={1} max={12} value={L} onChange={(e) => setL(Number(e.target.value))} aria-label="Tinggi pohon rekursi L" className="h-10 w-48 cursor-pointer accent-brand-blue" />
      </div>
      <p role="status" className="text-body mt-3 text-ink">
        Biaya terbesar ada di <strong>{domTeks}</strong>. Total semua tingkat = <span className="text-code">{formatBesar(pohon.jumlah)}</span> = T(n).
      </p>
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- wadah yang bisa digulir harus bisa difokus agar tabel lebar terbaca dengan keyboard */}
      <div role="region" aria-label="Tabel tingkat pohon rekursi, bisa digeser ke samping" tabIndex={0} className="mt-3 overflow-x-auto rounded-sm border border-line">
        <table className="w-full min-w-[40rem] border-collapse text-left">
          <caption className="text-body-strong border-b border-line bg-panel px-3 py-2 text-left text-heading">
            {teksRecurrence(a, b, f)} untuk L = {L}
          </caption>
          <thead>
            <tr className="text-caption border-b border-line text-ink-soft">
              <th scope="col" className="px-3 py-2">Tingkat</th>
              <th scope="col" className="px-3 py-2">Simpul (a^i)</th>
              <th scope="col" className="px-3 py-2">Ukuran (n/b^i)</th>
              <th scope="col" className="px-3 py-2">Biaya/simpul</th>
              <th scope="col" className="px-3 py-2">Total tingkat</th>
              <th scope="col" className="px-3 py-2">Dibanding terbesar</th>
            </tr>
          </thead>
          <tbody>
            {baris.map((r) => {
              const pct = Math.max(0, Math.min(100, (r.total / maks) * 100))
              const terbesar = r.total === maks
              return (
                <tr key={r.id} className={cx('border-b border-line last:border-0', terbesar && 'bg-panel')}>
                  <th scope="row" className="text-code px-3 py-2 font-semibold">{r.nama}</th>
                  <td className="text-code px-3 py-2">{formatBesar(r.simpul)}</td>
                  <td className="text-code px-3 py-2">{formatBesar(r.ukuran)}</td>
                  <td className="text-code px-3 py-2">{formatBesar(r.biaya)}</td>
                  <td className="text-code px-3 py-2">{formatBesar(r.total)}</td>
                  <td className="px-3 py-2">
                    <span aria-hidden="true" className="block h-3 rounded-sm bg-brand-blue" style={{ width: `${Math.max(pct, 1.5)}%` }} />
                    <span className="text-caption text-ink-soft">{pct < 1 ? '<1' : Math.round(pct)}%{terbesar ? ' · terbesar' : ''}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}

const DAFTAR_L = [10, 20, 30]

function Numerik({ a, b, f, hasil }) {
  if (hasil.kasus === 'tidak-sesuai') return null
  const baris = DAFTAR_L.map((L) => {
    const n = b ** L
    return { L, n, rasio: nilaiT(a, b, f, L) / pembagiSolusi(hasil, n) }
  })
  return (
    <Panel judul="Periksa solusinya secara numerik" id="pp-num">
      <p className="text-body text-ink-soft">
        Seperti program di Bagian 4.3: T(n) dihitung langsung dari recurrence (T(1) = 1, n = b^L), lalu dibagi dengan solusi {hasil.kasus === 'celah' ? 'dari metode lain' : 'Metode Master'} ({teksSolusi(hasil)}). Bila solusinya benar, hasil bagi mendekati suatu konstanta. Tabel ini bukan bukti, hanya pemeriksaan arah.
      </p>
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- wadah yang bisa digulir harus bisa difokus agar tabel lebar terbaca dengan keyboard */}
      <div role="region" aria-label="Tabel pemeriksaan numerik, bisa digeser ke samping" tabIndex={0} className="mt-3 overflow-x-auto rounded-sm border border-line">
        <table className="w-full min-w-[26rem] border-collapse text-left">
          <caption className="sr-only">T(n) dibagi solusi untuk tiga nilai n</caption>
          <thead>
            <tr className="text-caption border-b border-line text-ink-soft">
              <th scope="col" className="px-3 py-2">L</th>
              <th scope="col" className="px-3 py-2">n = b^L</th>
              <th scope="col" className="px-3 py-2">T(n) / solusi</th>
            </tr>
          </thead>
          <tbody>
            {baris.map((r) => (
              <tr key={r.L} className="border-b border-line last:border-0">
                <th scope="row" className="text-code px-3 py-2 font-semibold">{r.L}</th>
                <td className="text-code px-3 py-2">{formatBesar(r.n)}</td>
                <td className="text-code px-3 py-2">{angkaID(r.rasio, 3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}

function Pengurangan() {
  const [n, setN] = useState(1000)
  const T = nilaiPengurangan(n)
  return (
    <Panel judul="Mengapa T(n) = T(n − 1) + n tidak bisa?" id="pp-kurang">
      <p className="text-body text-ink-soft">
        Ukuran submasalahnya n − 1, bukan n/b untuk konstanta b &gt; 1, jadi bentuknya tidak sesuai Metode Master (Bagian 5). Dijabarkan, T(n) = n + (n − 1) + … + 1 = n(n + 1)/2, yaitu Θ(n²).
      </p>
      <div className="mt-3 flex flex-wrap items-start gap-4">
        <Angka label="n" value={n} onChange={setN} min={1} max={100000} />
      </div>
      <p role="status" className="text-body mt-4 rounded-sm border-l-4 border-ok bg-ok-bg p-3 text-ok-text">
        Untuk n = {angkaID(n)}: T(n) = n(n + 1)/2 = <strong className="text-code">{angkaID(T)}</strong>, dan T(n)/n² = <strong className="text-code">{angkaID(T / (n * n), 4)}</strong>, mendekati ½ ketika n membesar.
      </p>
    </Panel>
  )
}

/** Penjelajah Pohon Recurrence (Modul 09): klasifikasi Metode Master, tabel pohon rekursi, pemeriksaan numerik, dan bentuk pengurangan. */
export default function PenjelajahPohon({ a: kartu }) {
  const awal = contohById('merge')
  const [pilihan, setPilihan] = useState(awal.id)
  const [versi, setVersi] = useState(0)
  const [state, setState] = useState({ a: awal.a, b: awal.b, k: awal.f.k, q: awal.f.q, teks: awal.teks })
  const [L, setL] = useState(4)
  useEffect(() => {
    document.title = `${kartu.judul} · LABU`
  }, [kartu.judul])
  const muat = (id) => {
    if (id === 'sendiri') return setPilihan('sendiri')
    const c = contohById(id)
    setPilihan(id)
    setState({ a: c.a, b: c.b, k: c.f.k, q: c.f.q, teks: c.teks })
    setVersi((v) => v + 1)
  }
  const set = (patch) => {
    setPilihan('sendiri')
    setState((s) => ({ ...s, ...patch }))
  }
  const f = useMemo(() => ({ k: state.k, q: state.q }), [state.k, state.q])
  const hasil = useMemo(() => klasifikasi(state.a, state.b, f), [state.a, state.b, f])
  return (
    <PenjelajahShell a={kartu}>
      <p className="text-body mt-4 max-w-3xl text-ink-soft">
        Pilih recurrence T(n) = aT(n/b) + f(n), lihat kasus Metode Master yang berlaku, dan telusuri pohon rekursinya tingkat demi tingkat. Setiap hasil punya padanan tabel.
      </p>
      <div className="mt-4 grid gap-6">
        <Master state={state} set={set} versi={versi} muat={muat} pilihan={pilihan} hasil={hasil} f={f} />
        <Pohon a={state.a} b={state.b} f={f} hasil={hasil} L={L} setL={setL} />
        <Numerik a={state.a} b={state.b} f={f} hasil={hasil} />
        <Pengurangan />
      </div>
    </PenjelajahShell>
  )
}

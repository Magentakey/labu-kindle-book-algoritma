import { useEffect, useMemo, useState } from 'react'
import { Button, Icon, Segmented, Select } from '../ui/index.js'
import { cx } from '../ui/cx.js'
import GrafikBatas from './GrafikBatas.jsx'
import PenjelajahShell from './PenjelajahShell.jsx'
import { Angka, Panel } from './PenjelajahUi.jsx'
import { NOTASI, angkaID, barisN, contoh, contohById, labelG, pangkatAcuan, periksa, saksiBukanBig, teksF } from './boundModel.js'

const MAKS_N = 30
const opsiNotasi = Object.values(NOTASI).map((x) => ({ id: x.id, label: `${x.simbol} (${x.peran})` }))
const opsiG = pangkatAcuan.map((k) => ({ value: String(k), label: `g(n) = ${labelG(k)}` }))
const opsiContoh = [...contoh.map((c) => ({ value: c.id, label: c.judul })), { value: 'sendiri', label: 'Masukkan sendiri' }]

const t = (teks, kunci, nilai) => teks?.[kunci] ?? String(nilai).replace('.', ',')

/** Pernyataan yang sedang diuji, mis. "2n² − 3n + 1 = Θ(n²)". */
const pernyataan = (notasi, p, k) => `${teksF(p)} = ${NOTASI[notasi].simbol}(${labelG(k)})`

function Uji() {
  const awal = contohById('theta')
  const [pilihan, setPilihan] = useState(awal.id)
  const [versi, setVersi] = useState(0)
  const [notasi, setNotasi] = useState(awal.notasi)
  const [p, setP] = useState(awal.p)
  const [k, setK] = useState(awal.k)
  const [c1, setC1] = useState(awal.c1)
  const [c2, setC2] = useState(awal.c2)
  const [c, setC] = useState(awal.c)
  const [n0, setN0] = useState(awal.n0)
  const [nMax, setNMax] = useState(12)
  const [teksAwal, setTeksAwal] = useState(awal.teks ?? {})

  const muat = (id) => {
    if (id === 'sendiri') return setPilihan('sendiri')
    const x = contohById(id)
    setPilihan(id)
    setNotasi(x.notasi)
    setP(x.p)
    setK(x.k)
    setC1(x.c1)
    setC2(x.c2)
    setC(x.c)
    setN0(x.n0)
    setTeksAwal(x.teks ?? {})
    setVersi((v) => v + 1) // memuat ulang isian angka
  }
  // setiap perubahan oleh pengguna membuat pilihan contoh menjadi "Masukkan sendiri"
  const sendiri = (fn) => (v) => {
    setPilihan('sendiri')
    fn(v)
  }

  const konstanta = { c1, c2, c }
  const hasil = useMemo(() => periksa(notasi, p, k, konstanta, n0), [notasi, p, k, c1, c2, c, n0]) // eslint-disable-line react-hooks/exhaustive-deps
  const nTabel = Math.max(nMax, Math.min(MAKS_N, n0 + 3))
  const baris = useMemo(() => Array.from({ length: nTabel }, (_, i) => barisN(notasi, p, k, konstanta, i + 1)), [notasi, p, k, c1, c2, c, nTabel]) // eslint-disable-line react-hooks/exhaustive-deps
  const gagal = baris.filter((b) => b.n >= n0 && !b.ok).map((b) => b.n)
  const kunciIsian = `${versi}`
  const sim = NOTASI[notasi].simbol

  let status
  if (hasil.berlaku) {
    status = { ok: true, judul: `Terbukti: ${pernyataan(notasi, p, k)}`, isi: `Syarat berlaku untuk semua n ≥ ${n0} (diperiksa secara pasti, bukan hanya pada tabel). n₀ terkecil untuk konstanta ini adalah ${hasil.n0Terkecil}.` }
  } else if (hasil.alasan === 'awal') {
    status = { ok: false, judul: 'Belum berlaku mulai n₀ ini', isi: `Syarat ${hasil.sisiGagal} dilanggar pada n = ${hasil.nGagal}. Konstanta ini bisa dipakai bila n₀ ≥ ${hasil.n0Terkecil}.`, perbaiki: hasil.n0Terkecil }
  } else {
    status = { ok: false, judul: 'Konstanta ini tidak berlaku untuk n besar', isi: `Syarat ${hasil.sisiGagal} dilanggar pada n = ${hasil.nGagal}, dan untuk n yang cukup besar selalu dilanggar, jadi menaikkan n₀ tidak membantu. Ubah konstanta. Bila f tumbuh lebih cepat daripada ${labelG(k)}, tidak ada konstanta yang cocok.` }
  }

  return (
    <Panel judul="Uji batas asimtotik" id="pb-uji">
      <p className="text-body text-ink-soft">
        Pilih contoh dari Modul 06 atau isi sendiri f(n), g(n), dan konstanta. Grafik dan tabel memeriksa syarat definisi mulai dari n₀: kurva f(n) harus terjepit (Θ), di bawah (O), atau di atas (Ω) batasnya untuk semua n ≥ n₀.
      </p>
      <div className="mt-3 flex flex-wrap items-start gap-x-4 gap-y-3">
        <Select label="Contoh" value={pilihan} onChange={muat} options={opsiContoh} />
        <Segmented label="Notasi yang diuji" value={notasi} onChange={sendiri(setNotasi)} options={opsiNotasi} />
        <Select label="Acuan" value={String(k)} onChange={sendiri((v) => setK(Number(v)))} options={opsiG} />
      </div>
      <div className="mt-3 flex flex-wrap items-start gap-x-4 gap-y-3">
        <Angka key={`a${kunciIsian}`} label="Koefisien n² (a)" value={p.a} awal={t(teksAwal, 'a', p.a)} onChange={sendiri((v) => setP((x) => ({ ...x, a: v })))} min={-100} max={100} desimal pecahan />
        <Angka key={`b${kunciIsian}`} label="Koefisien n (b)" value={p.b} awal={t(teksAwal, 'b', p.b)} onChange={sendiri((v) => setP((x) => ({ ...x, b: v })))} min={-100} max={100} desimal pecahan />
        <Angka key={`c0${kunciIsian}`} label="Konstanta (c₀)" value={p.c0} awal={t(teksAwal, 'c0', p.c0)} onChange={sendiri((v) => setP((x) => ({ ...x, c0: v })))} min={-1000} max={1000} desimal pecahan />
      </div>
      <div className="mt-3 flex flex-wrap items-start gap-x-4 gap-y-3">
        {notasi === 'theta' ? (
          <>
            <Angka key={`c1${kunciIsian}`} label="c₁ (batas bawah)" value={c1} awal={t(teksAwal, 'c1', c1)} onChange={sendiri(setC1)} min={0.01} max={1000} desimal pecahan />
            <Angka key={`c2${kunciIsian}`} label="c₂ (batas atas)" value={c2} awal={t(teksAwal, 'c2', c2)} onChange={sendiri(setC2)} min={0.01} max={1000} desimal pecahan />
          </>
        ) : (
          <Angka key={`c${kunciIsian}${notasi}`} label={`c (batas ${notasi === 'big' ? 'atas' : 'bawah'})`} value={c} awal={t(teksAwal, 'c', c)} onChange={sendiri(setC)} min={0.01} max={1000} desimal pecahan />
        )}
        <Angka key={`n0${kunciIsian}`} label="n₀ (mulai berlaku)" value={n0} onChange={sendiri(setN0)} min={1} max={10000} />
        <div className="flex flex-col gap-1">
          <label htmlFor="pb-nmax" className="text-caption text-ink-soft">
            Grafik sampai n = <span className="text-code text-ink">{nMax}</span>
          </label>
          <input id="pb-nmax" type="range" min={6} max={MAKS_N} value={nMax} onChange={(e) => setNMax(Number(e.target.value))} aria-label="Batas ukuran masukan pada grafik" className="h-10 w-44 cursor-pointer accent-brand-blue" />
        </div>
      </div>

      <p role="status" className={cx('text-body mt-4 flex items-start gap-3 rounded-sm border-l-4 p-3', status.ok ? 'border-ok bg-ok-bg text-ok-text' : 'border-bad bg-bad-bg text-bad-text')}>
        <Icon name={status.ok ? 'check' : 'alert'} size={18} className="mt-0.5 shrink-0" />
        <span>
          <span className="text-body-strong block">{status.judul}</span>
          {status.isi}
          {status.perbaiki ? (
            <span className="mt-2 block">
              <Button variant="kontrol" size="s" onClick={() => sendiri(setN0)(status.perbaiki)}>
                Pakai n₀ = {status.perbaiki}
              </Button>
            </span>
          ) : null}
        </span>
      </p>

      <GrafikBatas className="mt-4" notasi={notasi} p={p} k={k} konstanta={konstanta} n0={n0} nMax={nMax} gagal={gagal} />
      <p className="text-caption mt-2 text-ink-soft">
        Titik pada kurva f(n) adalah nilai untuk n bilangan bulat. Daerah berarsir di kiri n₀ tidak diperiksa, jadi f(n) boleh melenceng di sana. Tanda ✕ menandai n ≥ n₀ yang melanggar syarat.
      </p>

      {/* tabel nilai: padanan teks dari grafik */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- wadah yang bisa digulir harus bisa difokus agar tabel lebar terbaca dengan keyboard */}
      <div role="region" aria-label="Tabel nilai, bisa digeser ke samping" tabIndex={0} className="mt-4 overflow-x-auto rounded-sm border border-line">
        <table className="w-full min-w-[34rem] border-collapse text-left">
          <caption className="text-body-strong border-b border-line bg-panel px-3 py-2 text-left text-heading">
            Syarat {sim} untuk n = 1 sampai {nTabel} · f(n) = {teksF(p)}, g(n) = {labelG(k)}
          </caption>
          <thead>
            <tr className="text-caption border-b border-line text-ink-soft">
              <th scope="col" className="px-3 py-2">n</th>
              <th scope="col" className="px-3 py-2">f(n)</th>
              <th scope="col" className="px-3 py-2">{notasi === 'big' ? '—' : notasi === 'theta' ? 'c₁·g(n)' : 'c·g(n)'}</th>
              <th scope="col" className="px-3 py-2">{notasi === 'omega' ? '—' : notasi === 'theta' ? 'c₂·g(n)' : 'c·g(n)'}</th>
              <th scope="col" className="px-3 py-2">Syarat</th>
            </tr>
          </thead>
          <tbody>
            {baris.map((b) => {
              const diperiksa = b.n >= n0
              return (
                <tr key={b.n} className={cx('border-b border-line last:border-0', !diperiksa && 'bg-panel text-ink-soft')}>
                  <th scope="row" className="text-code px-3 py-2 font-semibold">{b.n}</th>
                  <td className="text-code px-3 py-2">{angkaID(b.f)}</td>
                  <td className="text-code px-3 py-2">{b.bawah === null ? '—' : angkaID(b.bawah)}</td>
                  <td className="text-code px-3 py-2">{b.atas === null ? '—' : angkaID(b.atas)}</td>
                  <td className="text-body px-3 py-2">
                    {!diperiksa ? 'tidak diperiksa (n < n₀)' : b.ok ? <span className="text-ok-text">✓ berlaku</span> : <span className="text-bad-text">✕ dilanggar</span>}
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

function Sangkal() {
  const [c, setC] = useState(10)
  const [n0, setN0] = useState(1)
  const s = saksiBukanBig(c, n0)
  return (
    <Panel judul="Menunjukkan bahwa n² ≠ O(n)" id="pb-sangkal">
      <p className="text-body text-ink-soft">
        Untuk menyangkal Big-Oh, kita tunjukkan bahwa tidak ada konstanta yang cocok. Pilih konstanta c dan n₀ mana pun, lalu lihat n yang membuktikan bahwa pilihan itu gagal (Bagian 4.2).
      </p>
      <div className="mt-3 flex flex-wrap gap-4">
        <Angka label="c (konstanta coba-coba)" value={c} onChange={setC} min={0.01} max={1000000} desimal />
        <Angka label="n₀ (mulai berlaku)" value={n0} onChange={setN0} min={1} max={1000000} />
      </div>
      <dl className="mt-4 grid gap-3 sm:grid-cols-3">
        {[
          ['n yang menggagalkan', `n = max(n₀, ⌈c⌉ + 1) = ${angkaID(s.n)}`],
          ['n²', angkaID(s.kiri)],
          ['c · n', angkaID(s.kanan)],
        ].map(([judul, isi]) => (
          <div key={judul} className="rounded-sm border border-line bg-panel p-3">
            <dt className="text-caption text-ink-soft">{judul}</dt>
            <dd className="text-code text-body-strong mt-1 text-heading">{isi}</dd>
          </div>
        ))}
      </dl>
      <p role="status" className="text-body-strong mt-4 flex items-start gap-3 rounded-sm border-l-4 border-brand-yellow-strong bg-surface p-3 text-ink">
        <Icon name="info" size={18} className="mt-0.5 shrink-0 text-ink-soft" />
        {`Pada n = ${angkaID(s.n)} (n ≥ n₀ = ${angkaID(n0)}) berlaku n² = ${angkaID(s.kiri)} > ${angkaID(s.kanan)} = c · n. Jadi pasangan c = ${angkaID(c)} dan n₀ = ${angkaID(n0)} gagal. Karena n selalu bisa dibuat lebih besar dari c mana pun, tidak ada konstanta yang berhasil: n² ≠ O(n).`}
      </p>
    </Panel>
  )
}

/** Penjelajah Batas Θ / O / Ω (Modul 06): uji konstanta c₁, c₂, c, n₀ pada grafik dan tabel, serta penyangkalan n² ≠ O(n). */
export default function PenjelajahBatas({ a }) {
  useEffect(() => {
    document.title = `${a.judul} · LABU`
  }, [a.judul])
  return (
    <PenjelajahShell a={a}>
      <p className="text-body mt-4 max-w-3xl text-ink-soft">
        Coba konstanta c₁, c₂, c, dan n₀ sendiri dan lihat apakah f(n) benar-benar terjepit oleh batasnya. Semua grafik punya padanan tabel di bawahnya.
      </p>
      <div className="mt-4 grid gap-6">
        <Uji />
        <Sangkal />
      </div>
    </PenjelajahShell>
  )
}

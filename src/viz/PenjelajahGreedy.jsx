import { useEffect, useId, useMemo, useState } from 'react'
import { Icon, Select } from '../ui/index.js'
import { cx } from '../ui/cx.js'
import PenjelajahShell from './PenjelajahShell.jsx'
import { Angka, Panel } from './PenjelajahUi.jsx'
import { bacaPecahan, barangModul, contohKoin, kapasitasGagal, knapsack01Greedy, knapsack01Optimal, knapsackPecahan, koinGreedy, koinOptimal, penyangkalKoin, teksPecahan, urutanNilaiPerKg } from './greedyModel.js'

const opsiKoin = [...contohKoin.map((c) => ({ value: c.id, label: c.judul })), { value: 'sendiri', label: 'Isi sendiri' }]
const awalKoin = contohKoin[1]

/** Isian daftar pecahan (teks) dengan validasi dan pesan galat yang terbaca pembaca layar. */
function IsianPecahan({ value, onChange }) {
  const uid = useId()
  const [teks, setTeks] = useState(value)
  const cek = bacaPecahan(teks)
  const ubah = (t) => {
    setTeks(t)
    const h = bacaPecahan(t)
    if (h.ok) onChange(h.nilai)
  }
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={uid} className="text-caption text-ink-soft">Pecahan koin (pisahkan dengan koma)</label>
      <input
        id={uid}
        value={teks}
        onChange={(e) => ubah(e.target.value)}
        aria-invalid={!cek.ok}
        aria-describedby={cek.ok ? undefined : `${uid}-err`}
        className={cx('text-code h-10 w-56 rounded-sm border bg-card px-3 text-ink', cek.ok ? 'border-line' : 'border-bad')}
      />
      {!cek.ok && (
        <p id={`${uid}-err`} role="alert" className="text-caption flex max-w-64 items-start gap-1 text-bad-text">
          <Icon name="alert" size={14} className="mt-0.5 shrink-0" />
          {cek.pesan}
        </p>
      )}
    </div>
  )
}

const Tabel = ({ keterangan, kepala, children, lebar = '30rem' }) => (
  // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- wadah yang bisa digulir harus bisa difokus agar tabel lebar terbaca dengan keyboard
  <div role="region" aria-label={`${keterangan}, bisa digeser ke samping`} tabIndex={0} className="mt-4 overflow-x-auto rounded-sm border border-line">
    <table className="w-full border-collapse text-left" style={{ minWidth: lebar }}>
      <caption className="text-body-strong border-b border-line bg-panel px-3 py-2 text-left text-heading">{keterangan}</caption>
      <thead>
        <tr className="text-caption border-b border-line text-ink-soft">
          {kepala.map((k) => <th key={k} scope="col" className="px-3 py-2">{k}</th>)}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
)

function Koin() {
  const [pilihan, setPilihan] = useState(awalKoin.id)
  const [pecahan, setPecahan] = useState(() => bacaPecahan(awalKoin.pecahan).nilai)
  const [x, setX] = useState(awalKoin.x)
  const [versi, setVersi] = useState(0)
  const pilih = (id) => {
    setPilihan(id)
    const c = contohKoin.find((k) => k.id === id)
    if (c) { setPecahan(bacaPecahan(c.pecahan).nilai); setX(c.x); setVersi((v) => v + 1) }
  }
  const greedy = koinGreedy(pecahan, x)
  const opt = useMemo(() => koinOptimal(pecahan, x), [pecahan, x])
  const sama = greedy.length === opt.jumlah
  const kecil = useMemo(() => penyangkalKoin(pecahan), [pecahan])
  return (
    <Panel judul="Menukar uang: greedy dibandingkan dengan optimal" id="gr-koin">
      <p className="text-body text-ink-soft">
        Kriteria greedy: ambil koin terbesar yang tidak melebihi sisa uang (Bagian 4.1 Modul 13). Pembanding optimalnya dihitung dengan Dynamic Programming. Coba pecahan sendiri, misalnya 1, 6, 10.
      </p>
      <div className="mt-3 flex flex-wrap items-start gap-x-4 gap-y-3">
        <Select label="Contoh" value={pilihan} onChange={pilih} options={opsiKoin} />
        <IsianPecahan key={`p${versi}`} value={pecahan.slice().reverse().join(', ')} onChange={(v) => { setPecahan(v); setPilihan('sendiri') }} />
        <Angka key={`x${versi}`} label="Jumlah uang (1 sampai 200)" value={x} onChange={(v) => { setX(v); setPilihan('sendiri') }} min={1} max={200} />
      </div>
      <Tabel keterangan={`Menukar ${x} dengan pecahan {${[...pecahan].reverse().join(', ')}}`} kepala={['Cara', 'Koin yang dipakai', 'Banyak koin']} lebar="28rem">
        <tr className="border-b border-line">
          <th scope="row" className="text-body px-3 py-2 font-semibold">Greedy</th>
          <td className="text-code px-3 py-2">{greedy.join(' + ')}</td>
          <td className="text-code px-3 py-2">{greedy.length}</td>
        </tr>
        <tr>
          <th scope="row" className="text-body px-3 py-2 font-semibold">Optimal (DP)</th>
          <td className="text-code px-3 py-2">{opt.koin.join(' + ')}</td>
          <td className="text-code px-3 py-2">{opt.jumlah}</td>
        </tr>
      </Tabel>
      <p
        role="status"
        className={cx('text-body mt-4 flex items-start gap-3 rounded-sm border-l-4 p-3', sama ? 'border-ok bg-ok-bg text-ok-text' : 'border-bad bg-bad-bg text-bad-text')}
      >
        <Icon name={sama ? 'check' : 'alert'} size={18} className="mt-0.5 shrink-0" />
        <span>
          {sama
            ? `Untuk jumlah ${x}, greedy optimal: ${greedy.length} koin.`
            : `Greedy gagal untuk jumlah ${x}: ${greedy.length} koin, padahal optimalnya ${opt.jumlah} koin.`}
        </span>
      </p>
      <p className="text-body mt-3 text-ink">
        {kecil === null
          ? 'Untuk jumlah 1 sampai 200, greedy selalu optimal pada pecahan ini. Itu bukan bukti: kebenaran greedy tetap harus dibuktikan.'
          : `Contoh penyangkal terkecil pada pecahan ini: jumlah ${kecil}, greedy ${koinGreedy(pecahan, kecil).length} koin, optimal ${koinOptimal(pecahan, kecil).jumlah} koin.`}
      </p>
    </Panel>
  )
}

const kg = (i) => `barang ${i + 1}`
const gabung = (idx) => idx.map(kg).join(' + ')

function Knapsack() {
  const [W, setW] = useState(50)
  const urut = urutanNilaiPerKg(barangModul)
  const pecah = knapsackPecahan(barangModul, W)
  const g01 = knapsack01Greedy(barangModul, W)
  const o01 = knapsack01Optimal(barangModul, W)
  const gagal = useMemo(() => kapasitasGagal(barangModul, 60), [])
  const sama = g01.total === o01.total
  return (
    <Panel judul="Knapsack: pecahan berhasil, 0-1 bisa gagal" id="gr-knapsack">
      <p className="text-body text-ink-soft">
        Tiga barang dari Bagian 4.2 Modul 13. Kriteria greedy: nilai per kg terbesar lebih dulu. Ubah kapasitas tas dan bandingkan tiga hasil.
      </p>
      <div className="mt-3 flex flex-wrap items-start gap-4">
        <Angka label="Kapasitas tas W (kg, 1 sampai 60)" value={W} onChange={setW} min={1} max={60} />
      </div>
      <Tabel keterangan="Barang yang tersedia, urut menurut nilai per kg" kepala={['Barang', 'Berat (kg)', 'Nilai', 'Nilai per kg']} lebar="24rem">
        {urut.map((i) => (
          <tr key={i} className="border-b border-line last:border-0">
            <th scope="row" className="text-code px-3 py-2 font-semibold">{i + 1}</th>
            <td className="text-code px-3 py-2">{barangModul[i].berat}</td>
            <td className="text-code px-3 py-2">{barangModul[i].nilai}</td>
            <td className="text-code px-3 py-2">{barangModul[i].nilai / barangModul[i].berat}</td>
          </tr>
        ))}
      </Tabel>
      <Tabel keterangan={`Hasil untuk kapasitas ${W} kg`} kepala={['Masalah dan cara', 'Barang yang diambil', 'Total nilai']} lebar="30rem">
        <tr className="border-b border-line">
          <th scope="row" className="text-body px-3 py-2 font-semibold">Pecahan, greedy (optimal)</th>
          <td className="text-code px-3 py-2">{pecah.bagian.map((b) => (b.berat === barangModul[b.i].berat ? kg(b.i) : `${b.berat} kg dari ${kg(b.i)}`)).join(' + ')}</td>
          <td className="text-code px-3 py-2">{teksPecahan(pecah.total)}</td>
        </tr>
        <tr className="border-b border-line">
          <th scope="row" className="text-body px-3 py-2 font-semibold">0-1, greedy</th>
          <td className="text-code px-3 py-2">{g01.pilih.length ? `${gabung(g01.pilih)} (${g01.berat} kg)` : 'tidak ada yang muat'}</td>
          <td className="text-code px-3 py-2">{g01.total}</td>
        </tr>
        <tr>
          <th scope="row" className="text-body px-3 py-2 font-semibold">0-1, optimal (DP)</th>
          <td className="text-code px-3 py-2">{o01.pilih.length ? `${gabung(o01.pilih)} (${o01.berat} kg)` : 'tidak ada yang muat'}</td>
          <td className="text-code px-3 py-2">{o01.total}</td>
        </tr>
      </Tabel>
      <p
        role="status"
        className={cx('text-body mt-4 flex items-start gap-3 rounded-sm border-l-4 p-3', sama ? 'border-ok bg-ok-bg text-ok-text' : 'border-bad bg-bad-bg text-bad-text')}
      >
        <Icon name={sama ? 'check' : 'alert'} size={18} className="mt-0.5 shrink-0" />
        <span>
          {sama
            ? `Pada kapasitas ${W} kg, greedy 0-1 kebetulan optimal (${g01.total}). Itu tidak menjamin kapasitas lain.`
            : `Greedy 0-1 gagal pada kapasitas ${W} kg: ${g01.total}, padahal optimalnya ${o01.total}.`}
        </span>
      </p>
      <p className="text-body mt-3 text-ink">
        Untuk kapasitas 1 sampai 60 kg, greedy 0-1 tidak optimal pada {gagal.length} kapasitas (antara lain {gagal.slice(0, 3).join(', ')} dan 50). Pada knapsack pecahan, greedy selalu optimal.
      </p>
    </Panel>
  )
}

/** Penjelajah Konsep Greedy (Modul 13): koin dan knapsack, greedy dibandingkan dengan solusi optimal dan contoh penyangkalnya. */
export default function PenjelajahGreedy({ a }) {
  useEffect(() => {
    document.title = `${a.judul} · LABU`
  }, [a.judul])
  return (
    <PenjelajahShell a={a}>
      <p className="text-body mt-4 max-w-3xl text-ink-soft">
        Greedy memilih yang terlihat terbaik saat ini. Coba pada dua masalah dan lihat kapan hasilnya sama dengan solusi optimal dan kapan gagal.
      </p>
      <div className="mt-4 grid gap-6">
        <Koin />
        <Knapsack />
      </div>
    </PenjelajahShell>
  )
}

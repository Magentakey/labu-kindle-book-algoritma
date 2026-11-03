import { useEffect, useMemo, useState } from 'react'
import { Icon, Select } from '../ui/index.js'
import { cx } from '../ui/cx.js'
import PenjelajahShell from './PenjelajahShell.jsx'
import PohonFibonacci from './PohonFibonacci.jsx'
import { Angka, Panel } from './PenjelajahUi.jsx'
import { caraKurung, fib, pemanggilanBatangNaif, pemanggilanMemo, pemanggilanNaif, penjumlahanBottomUp, perbandinganBatang, potongBatang, setHarga, submasalahBerbeda, susunPotongan, teksBesar } from './dpModel.js'

const MAKS_POHON = 7
const opsiHarga = setHarga.map((h) => ({ value: h.id, label: h.judul }))

function Fibonacci() {
  const [n, setN] = useState(30)
  const naif = pemanggilanNaif(n)
  const memo = pemanggilanMemo(n)
  const bu = penjumlahanBottomUp(n)
  const baris = [
    { nama: 'Rekursi biasa', hitung: teksBesar(naif), satuan: 'pemanggilan', tumbuh: 'eksponensial: 2·F(n+1) − 1' },
    { nama: 'Memoization (top-down)', hitung: teksBesar(BigInt(memo)), satuan: 'pemanggilan', tumbuh: `Θ(n): ${submasalahBerbeda(n)} dihitung, sisanya mengambil dari memo` },
    { nama: 'Tabel (bottom-up)', hitung: teksBesar(BigInt(bu)), satuan: 'penjumlahan', tumbuh: 'Θ(n): satu per i = 2..n' },
  ]
  return (
    <Panel judul="Fibonacci: tiga cara menghitung F(n)" id="pd-fib">
      <p className="text-body text-ink-soft">
        Rekursi biasa menghitung submasalah yang sama berulang kali. Memoization menyimpan hasilnya di memo, dan bottom-up mengisi tabel dari submasalah terkecil (Bagian 3.2 dan 5 Modul 10).
      </p>
      <div className="mt-3 flex flex-wrap items-start gap-4">
        <Angka label="n (0 sampai 200)" value={n} onChange={setN} min={0} max={200} />
      </div>
      <p role="status" className="text-body mt-4 rounded-sm border-l-4 border-ok bg-ok-bg p-3 text-ok-text">
        F({n}) = <strong className="text-code">{teksBesar(fib(n))}</strong>. Rekursi biasa memakai <strong>{teksBesar(naif)}</strong> pemanggilan, sedangkan tabel hanya <strong>{teksBesar(BigInt(bu))}</strong> penjumlahan.
      </p>
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- wadah yang bisa digulir harus bisa difokus agar tabel lebar terbaca dengan keyboard */}
      <div role="region" aria-label="Tabel perbandingan tiga cara, bisa digeser ke samping" tabIndex={0} className="mt-4 overflow-x-auto rounded-sm border border-line">
        <table className="w-full min-w-[34rem] border-collapse text-left">
          <caption className="text-body-strong border-b border-line bg-panel px-3 py-2 text-left text-heading">Biaya menghitung F({n})</caption>
          <thead>
            <tr className="text-caption border-b border-line text-ink-soft">
              <th scope="col" className="px-3 py-2">Cara</th>
              <th scope="col" className="px-3 py-2">Banyaknya</th>
              <th scope="col" className="px-3 py-2">Pertumbuhan</th>
            </tr>
          </thead>
          <tbody>
            {baris.map((b) => (
              <tr key={b.nama} className="border-b border-line last:border-0">
                <th scope="row" className="text-body px-3 py-2 font-semibold">{b.nama}</th>
                <td className="text-code px-3 py-2">{b.hitung} {b.satuan}</td>
                <td className="text-body px-3 py-2">{b.tumbuh}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4">
        <h3 className="text-body-strong text-heading">Pohon pemanggilan rekursif</h3>
        {n <= MAKS_POHON ? (
          <PohonFibonacci n={Math.max(n, 0)} className="mt-2" />
        ) : (
          <p className="text-body mt-1 text-ink-soft">Pohon digambar untuk n sampai {MAKS_POHON} saja; untuk n = {n} jumlah simpulnya {teksBesar(naif)}. Turunkan n untuk melihat perhitungan ulang.</p>
        )}
      </div>
    </Panel>
  )
}

function PotongBatang() {
  const [id, setId] = useState('modul')
  const [n, setN] = useState(8)
  const [j, setJ] = useState(8)
  const harga = setHarga.find((h) => h.id === id).p
  const { r, s, kandidat } = useMemo(() => potongBatang(harga, 8), [harga])
  const jj = Math.min(j, n)
  const potongan = susunPotongan(s, n)
  const opsiJ = Array.from({ length: n }, (_, i) => ({ value: String(i + 1), label: `r_${i + 1}` }))
  return (
    <Panel judul="Pemotongan batang: isi tabel bottom-up" id="pd-batang">
      <p className="text-body text-ink-soft">
        r_j = max over i = 1..j dari p_i + r_(j−i), dengan r_0 = 0. Setiap r_j hanya memakai nilai r yang sudah ada di tabel. s_j mencatat panjang potongan pertama yang terbaik, untuk menyusun solusinya (langkah 4).
      </p>
      <div className="mt-3 flex flex-wrap items-start gap-x-4 gap-y-3">
        <Select label="Daftar harga" value={id} onChange={setId} options={opsiHarga} />
        <Angka key={`n${id}`} label="Panjang batang n (1 sampai 8)" value={n} onChange={(v) => { setN(v); setJ((x) => Math.min(x, v)) }} min={1} max={8} />
      </div>

      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- wadah yang bisa digulir harus bisa difokus agar tabel lebar terbaca dengan keyboard */}
      <div role="region" aria-label="Tabel harga dan hasil, bisa digeser ke samping" tabIndex={0} className="mt-4 overflow-x-auto rounded-sm border border-line">
        <table className="w-full min-w-[34rem] border-collapse text-left">
          <caption className="text-body-strong border-b border-line bg-panel px-3 py-2 text-left text-heading">Harga p_i, pendapatan maksimum r_j, dan potongan pertama s_j</caption>
          <thead>
            <tr className="text-caption border-b border-line text-ink-soft">
              <th scope="col" className="px-3 py-2">j</th>
              <th scope="col" className="px-3 py-2">p_j</th>
              <th scope="col" className="px-3 py-2">r_j</th>
              <th scope="col" className="px-3 py-2">s_j</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: n }, (_, k) => k + 1).map((k) => (
              <tr key={k} className={cx('border-b border-line last:border-0', k === jj && 'bg-panel')}>
                <th scope="row" className="text-code px-3 py-2 font-semibold">{k}</th>
                <td className="text-code px-3 py-2">{harga[k]}</td>
                <td className="text-code px-3 py-2">{r[k]}</td>
                <td className="text-code px-3 py-2">{s[k]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p role="status" className="text-body mt-4 rounded-sm border-l-4 border-ok bg-ok-bg p-3 text-ok-text">
        Untuk n = {n}: pendapatan maksimum <strong className="text-code">{r[n]}</strong>, dengan potongan{' '}
        <strong className="text-code">{potongan.join(' + ')}</strong> ({potongan.map((x) => harga[x]).join(' + ')} = {r[n]}).
      </p>

      <div className="mt-4">
        <Select label="Lihat perhitungan" value={String(jj)} onChange={(v) => setJ(Number(v))} options={opsiJ} />
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- wadah yang bisa digulir harus bisa difokus agar tabel lebar terbaca dengan keyboard */}
        <div role="region" aria-label="Tabel pilihan untuk satu r, bisa digeser ke samping" tabIndex={0} className="mt-3 overflow-x-auto rounded-sm border border-line">
          <table className="w-full min-w-[30rem] border-collapse text-left">
            <caption className="text-body-strong border-b border-line bg-panel px-3 py-2 text-left text-heading">Pilihan untuk r_{jj}: p_i + r_({jj} − i)</caption>
            <thead>
              <tr className="text-caption border-b border-line text-ink-soft">
                <th scope="col" className="px-3 py-2">Potongan pertama i</th>
                <th scope="col" className="px-3 py-2">p_i</th>
                <th scope="col" className="px-3 py-2">r_({jj} − i)</th>
                <th scope="col" className="px-3 py-2">p_i + r_({jj} − i)</th>
                <th scope="col" className="px-3 py-2">Terbaik?</th>
              </tr>
            </thead>
            <tbody>
              {kandidat[jj].map((c) => (
                <tr key={c.i} className={cx('border-b border-line last:border-0', c.i === s[jj] && 'bg-panel')}>
                  <th scope="row" className="text-code px-3 py-2 font-semibold">{c.i}</th>
                  <td className="text-code px-3 py-2">{harga[c.i]}</td>
                  <td className="text-code px-3 py-2">{r[jj - c.i]}</td>
                  <td className="text-code px-3 py-2">{c.nilai}</td>
                  <td className="text-body px-3 py-2">{c.i === s[jj] ? <span className="text-ok-text">✓ dipilih (s_{jj} = {c.i})</span> : c.nilai === r[jj] ? 'seri' : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-body mt-4 text-ink">
        Biaya: rekursi biasa memanggil fungsi <strong>{teksBesar(pemanggilanBatangNaif(n))}</strong> kali (2^n), sedangkan tabel membandingkan <strong>{perbandinganBatang(n)}</strong> pilihan (n(n + 1)/2 = Θ(n²)).
      </p>
    </Panel>
  )
}

function Brute() {
  const [n, setN] = useState(10)
  const cara = caraKurung(n)
  return (
    <Panel judul="Mengapa tidak brute force? (rantai matriks)" id="pd-catalan">
      <p className="text-body text-ink-soft">
        Banyaknya cara menempatkan tanda kurung pada n matriks mengikuti bilangan Catalan (Bagian 6.2), sedangkan Dynamic Programming hanya Θ(n³) langkah.
      </p>
      <div className="mt-3 flex flex-wrap items-start gap-4">
        <Angka label="n matriks (1 sampai 40)" value={n} onChange={setN} min={1} max={40} />
      </div>
      <p role="status" className="text-body mt-4 flex items-start gap-3 rounded-sm border-l-4 border-brand-yellow-strong bg-surface p-3 text-ink">
        <Icon name="info" size={18} className="mt-0.5 shrink-0 text-ink-soft" />
        <span>
          n = {n}: <strong className="text-code">{teksBesar(cara)}</strong> cara menempatkan kurung, dibanding n³ = <strong className="text-code">{teksBesar(BigInt(n) ** 3n)}</strong> langkah Dynamic Programming.
        </span>
      </p>
    </Panel>
  )
}

/** Penjelajah Konsep DP (Modul 10): Fibonacci tiga cara, pengisian tabel pemotongan batang, dan brute force vs Dynamic Programming. */
export default function PenjelajahDP({ a }) {
  useEffect(() => {
    document.title = `${a.judul} · LABU`
  }, [a.judul])
  return (
    <PenjelajahShell a={a}>
      <p className="text-body mt-4 max-w-3xl text-ink-soft">
        Bandingkan rekursi biasa, memoization, dan tabel bottom-up, lalu isi tabel pemotongan batang langkah demi langkah. Setiap hasil punya padanan tabel.
      </p>
      <div className="mt-4 grid gap-6">
        <Fibonacci />
        <PotongBatang />
        <Brute />
      </div>
    </PenjelajahShell>
  )
}

import { useEffect, useId, useMemo, useState } from 'react'
import { Icon, Select } from '../ui/index.js'
import { cx } from '../ui/cx.js'
import PenjelajahShell from './PenjelajahShell.jsx'
import { Angka, Panel } from './PenjelajahUi.jsx'
import GrafStatis from './GrafStatis.jsx'
import { MAKS_SIMPUL, bacaBusur, bangun, grafA, grafB, grafSoal1, maksBusurTakBerarah, memori, periksaBusur, posisiA, posisiB, teksBusur } from './representasiGrafModel.js'

const contoh = [
  { id: 'a', judul: 'Graf (a): tak berarah, 5 simpul', ...grafA, posisi: posisiA },
  { id: 'b', judul: 'Graf (b): berarah, 6 simpul', ...grafB, posisi: posisiB },
  { id: 'soal1', judul: 'Soal 1 kuis (a, b, c, d = 1, 2, 3, 4)', ...grafSoal1, posisi: null },
]
const opsi = [...contoh.map((c) => ({ value: c.id, label: c.judul })), { value: 'sendiri', label: 'Isi sendiri' }]
const opsiJenis = [{ value: 'tak', label: 'Tak berarah' }, { value: 'ber', label: 'Berarah' }]
const id = (x) => x.toLocaleString('id-ID')

const Tabel = ({ keterangan, children, lebar }) => (
  // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- wadah yang bisa digulir harus bisa difokus agar tabel lebar terbaca dengan keyboard
  <div role="region" aria-label={`${keterangan}, bisa digeser ke samping`} tabIndex={0} className="mt-4 overflow-x-auto rounded-sm border border-line">
    <table className="w-full border-collapse text-left" style={{ minWidth: lebar }}>
      <caption className="text-body-strong border-b border-line bg-panel px-3 py-2 text-left text-heading">{keterangan}</caption>
      {children}
    </table>
  </div>
)

function IsianBusur({ value, onChange, n, berarah }) {
  const uid = useId()
  const [teks, setTeks] = useState(value)
  const cek = bacaBusur(teks, n, berarah)
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={uid} className="text-caption text-ink-soft">Busur (pisahkan dengan koma, mis. 1-2, 2-3)</label>
      <input
        id={uid}
        value={teks}
        onChange={(e) => { setTeks(e.target.value); const h = bacaBusur(e.target.value, n, berarah); if (h.ok) onChange(h.busur) }}
        aria-invalid={!cek.ok}
        aria-describedby={cek.ok ? undefined : `${uid}-err`}
        className={cx('text-code h-10 w-full max-w-xl rounded-sm border bg-card px-3 text-ink sm:w-[26rem]', cek.ok ? 'border-line' : 'border-bad')}
      />
      {!cek.ok && (
        <p id={`${uid}-err`} role="alert" className="text-caption flex max-w-md items-start gap-1 text-bad-text">
          <Icon name="alert" size={14} className="mt-0.5 shrink-0" />
          {cek.pesan}
        </p>
      )}
    </div>
  )
}

function Graf() {
  const [pilihan, setPilihan] = useState('a')
  const [n, setN] = useState(grafA.n)
  const [berarah, setBerarah] = useState(false)
  const [busur, setBusur] = useState(grafA.busur)
  const [posisi, setPosisi] = useState(posisiA)
  const [versi, setVersi] = useState(0)
  const [u, setU] = useState(2)
  const [v, setV] = useState(4)
  const pilih = (k) => {
    setPilihan(k)
    const c = contoh.find((x) => x.id === k)
    if (c) { setN(c.n); setBerarah(c.berarah); setBusur(c.busur); setPosisi(c.posisi); setVersi((x) => x + 1) }
  }
  const sendiri = () => { setPilihan('sendiri'); setPosisi(null) }
  const ubahN = (x) => { setN(x); sendiri(); setBusur((b) => b.filter(([p, q]) => p <= x && q <= x)); setVersi((k) => k + 1) }
  const ubahJenis = (j) => {
    const ber = j === 'ber'
    setBerarah(ber); sendiri()
    if (!ber) setBusur((b) => b.filter(([p, q]) => p !== q).filter(([p, q], i, arr) => arr.findIndex(([a, c]) => (a === p && c === q) || (a === q && c === p)) === i))
    setVersi((k) => k + 1)
  }
  const r = useMemo(() => bangun(n, busur, berarah), [n, busur, berarah])
  const uu = Math.min(u, n)
  const vv = Math.min(v, n)
  const cek = periksaBusur(r.adj, r.A, uu, vv)
  const E = busur.length
  const maks = berarah ? n * n : maksBusurTakBerarah(n)
  const m = memori(n, E, berarah)
  const nama = Array.from({ length: n }, (_, i) => i + 1)
  return (
    <Panel judul="Graf dan kedua representasinya" id="gr-graf">
      <p className="text-body text-ink-soft">
        Pilih graf contoh dari Modul 16 atau susun sendiri. Adjacency-list dan adjacency-matrix dibangun dengan cara yang sama seperti program Python di Bagian 5. Urutan isi list mengikuti urutan busur yang kamu tulis.
      </p>
      <div className="mt-3 flex flex-wrap items-start gap-x-4 gap-y-3">
        <Select label="Contoh" value={pilihan} onChange={pilih} options={opsi} />
        <Select label="Jenis" value={berarah ? 'ber' : 'tak'} onChange={ubahJenis} options={opsiJenis} />
        <Angka key={`n${versi}`} label={`Banyak simpul (1 sampai ${MAKS_SIMPUL})`} value={n} onChange={ubahN} min={1} max={MAKS_SIMPUL} />
      </div>
      <div className="mt-3">
        <IsianBusur key={`b${versi}`} value={teksBusur(busur)} n={n} berarah={berarah} onChange={(b) => { setBusur(b); sendiri() }} />
      </div>
      <GrafStatis className="mt-4" n={n} busur={busur} berarah={berarah} posisi={posisi} sorot={cek.ada ? [uu, vv] : null} label={`Gambar graf ${berarah ? 'berarah' : 'tak berarah'} dengan ${n} simpul dan ${E} busur`} />

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Tabel keterangan="Adjacency-list" lebar="14rem">
          <thead>
            <tr className="text-caption border-b border-line text-ink-soft">
              <th scope="col" className="px-3 py-2">u</th>
              <th scope="col" className="px-3 py-2">Adj[u]</th>
            </tr>
          </thead>
          <tbody>
            {nama.map((k) => (
              <tr key={k} className="border-b border-line last:border-0">
                <th scope="row" className="text-code px-3 py-1.5 font-semibold">{k}</th>
                <td className="text-code px-3 py-1.5">
                  {r.adj[k].length === 0 ? '—' : r.adj[k].map((x, i) => (
                    <span key={i}>
                      {i > 0 && ' → '}
                      <span className={cx(cek.ada && k === uu && x === vv && 'rounded-sm bg-brand-orange px-1 font-bold text-on-orange')}>{x}</span>
                    </span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </Tabel>
        <Tabel keterangan="Adjacency-matrix" lebar={`${Math.max(14, n * 2.6 + 4)}rem`}>
          <thead>
            <tr className="text-caption border-b border-line text-ink-soft">
              <th scope="col" className="px-2 py-2"><span className="sr-only">baris</span></th>
              {nama.map((j) => <th key={j} scope="col" className="text-code px-2 py-2 text-center">{j}</th>)}
            </tr>
          </thead>
          <tbody>
            {nama.map((i) => (
              <tr key={i} className="border-b border-line last:border-0">
                <th scope="row" className="text-code px-2 py-1.5 font-semibold">{i}</th>
                {nama.map((j) => {
                  const kena = i === uu && j === vv
                  return (
                    <td key={j} className={cx('text-code px-2 py-1.5 text-center', kena && 'rounded-sm bg-brand-orange font-bold text-on-orange', !kena && r.A[i][j] === 1 && 'font-semibold')}>
                      {r.A[i][j]}
                      {kena && <span className="sr-only"> (sel yang diperiksa)</span>}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </Tabel>
      </div>

      <Tabel keterangan="Ukuran dan memori" lebar="26rem">
        <tbody>
          {[
            ['Banyak simpul |V|, banyak busur |E|', `${n}, ${E}`],
            ['Total panjang semua list', `${r.panjangTotal} (${berarah ? '= |E|' : '= 2|E|'})`],
            ['Memori adjacency-list: |V| + panjang list', id(m.list)],
            ['Sel adjacency-matrix: |V|²', id(m.matriks)],
            ['Sel yang bernilai 1', `${r.satu}`],
            ['Matriks simetris?', r.simetris ? 'Ya' : 'Tidak'],
            ['Batas busur' + (berarah ? ' (termasuk self-loop)' : ' tanpa self-loop'), `${id(maks)}; graf ini ${E >= maks * 0.5 ? 'cukup padat' : 'jarang'}`],
          ].map(([a, b]) => (
            <tr key={a} className="border-b border-line last:border-0">
              <th scope="row" className="text-body px-3 py-2 font-normal">{a}</th>
              <td className="text-code px-3 py-2">{b}</td>
            </tr>
          ))}
        </tbody>
      </Tabel>
      <Tabel keterangan={berarah ? 'Derajat keluar dan derajat masuk' : 'Derajat setiap simpul'} lebar="16rem">
        <thead>
          <tr className="text-caption border-b border-line text-ink-soft">
            <th scope="col" className="px-3 py-2">Simpul</th>
            {berarah ? (
              <>
                <th scope="col" className="px-3 py-2">Keluar (jumlah 1 pada baris)</th>
                <th scope="col" className="px-3 py-2">Masuk (jumlah 1 pada kolom)</th>
              </>
            ) : (
              <th scope="col" className="px-3 py-2">Derajat</th>
            )}
          </tr>
        </thead>
        <tbody>
          {nama.map((k) => (
            <tr key={k} className="border-b border-line last:border-0">
              <th scope="row" className="text-code px-3 py-1.5 font-semibold">{k}</th>
              <td className="text-code px-3 py-1.5">{r.keluar[k - 1]}</td>
              {berarah && <td className="text-code px-3 py-1.5">{r.masuk[k - 1]}</td>}
            </tr>
          ))}
        </tbody>
      </Tabel>

      <div className="mt-6 border-t border-line pt-4">
        <h3 className="text-body-strong text-heading">Memeriksa busur (u, v)</h3>
        <div className="mt-2 flex flex-wrap items-start gap-4">
          <Angka label="u" value={uu} onChange={setU} min={1} max={n} />
          <Angka label="v" value={vv} onChange={setV} min={1} max={n} />
        </div>
        <p role="status" className={cx('text-body mt-3 flex items-start gap-3 rounded-sm border-l-4 p-3', cek.ada ? 'border-ok bg-ok-bg text-ok-text' : 'border-bad bg-bad-bg text-bad-text')}>
          <Icon name={cek.ada ? 'check' : 'alert'} size={18} className="mt-0.5 shrink-0" />
          <span>
            {cek.ada ? `Busur (${uu}, ${vv}) ada.` : `Busur (${uu}, ${vv}) tidak ada.`} Adjacency-list menelusuri Adj[{uu}] ({cek.panjangList} elemen) dan butuh {cek.perbandinganList} perbandingan
            {cek.ada ? '' : ' (semua elemen diperiksa)'}; adjacency-matrix cukup melihat a[{uu}][{vv}] = {cek.sel}, 1 langkah.
          </span>
        </p>
      </div>
    </Panel>
  )
}

function Skala() {
  const [V, setV] = useState(10000)
  const [E, setE] = useState(15000)
  const [berarah, setBerarah] = useState(false)
  const m = memori(V, E, berarah)
  const maks = berarah ? V * V : maksBusurTakBerarah(V)
  const wajar = E <= maks
  return (
    <Panel judul="Skala besar: memori list dibandingkan matriks" id="gr-skala">
      <p className="text-body text-ink-soft">Isi |V| dan |E| seperti pada jaringan jalan (10.000 persimpangan, 15.000 ruas) atau media sosial (1 juta pengguna, 100 juta pertemanan). Tidak ada graf yang digambar; hanya hitungan memori.</p>
      <div className="mt-3 flex flex-wrap items-start gap-4">
        <Angka label="|V|" value={V} onChange={setV} min={1} max={10000000} />
        <Angka label="|E|" value={E} onChange={setE} min={0} max={1000000000} />
        <Select label="Jenis" value={berarah ? 'ber' : 'tak'} onChange={(j) => setBerarah(j === 'ber')} options={opsiJenis} />
      </div>
      <Tabel keterangan="Perkiraan banyaknya elemen yang disimpan" lebar="26rem">
        <tbody>
          {[
            ['Adjacency-list: |V| kepala + ' + (berarah ? '|E|' : '2|E|') + ' elemen', id(m.list)],
            ['Adjacency-matrix: |V|²', id(m.matriks)],
            ['Matriks lebih besar dari list sekitar', `${m.rasio >= 10 ? id(Math.round(m.rasio)) : m.rasio.toFixed(2).replace('.', ',')} kali`],
          ].map(([a, b]) => (
            <tr key={a} className="border-b border-line last:border-0">
              <th scope="row" className="text-body px-3 py-2 font-normal">{a}</th>
              <td className="text-code px-3 py-2">{b}</td>
            </tr>
          ))}
        </tbody>
      </Tabel>
      <p role="status" className={cx('text-body mt-4 flex items-start gap-3 rounded-sm border-l-4 p-3', wajar ? 'border-ok bg-ok-bg text-ok-text' : 'border-bad bg-bad-bg text-bad-text')}>
        <Icon name={wajar ? 'check' : 'alert'} size={18} className="mt-0.5 shrink-0" />
        <span>
          {wajar
            ? `Batas busur untuk ${id(V)} simpul adalah ${id(maks)}; graf ini memakai ${(E / Math.max(maks, 1)) < 0.01 ? 'kurang dari 1%' : `${Math.round((E / maks) * 100)}%`} dari batas itu, jadi ${E / Math.max(maks, 1) < 0.1 ? 'sangat jarang: pilih adjacency-list.' : 'cukup padat: matriks mulai masuk akal.'}`
            : `|E| melebihi batas ${id(maks)} untuk ${id(V)} simpul tanpa busur ganda.`}
        </span>
      </p>
    </Panel>
  )
}

/** Penjelajah Representasi Graf (Modul 16): graf, adjacency-list, adjacency-matrix, memori, derajat, dan biaya memeriksa busur. */
export default function PenjelajahGraf({ a }) {
  useEffect(() => {
    document.title = `${a.judul} · LABU`
  }, [a.judul])
  return (
    <PenjelajahShell a={a}>
      <p className="text-body mt-4 max-w-3xl text-ink-soft">
        Satu graf, dua cara menyimpannya. Ubah busur dan lihat isi adjacency-list dan adjacency-matrix berubah, lalu bandingkan memori dan biaya memeriksa sebuah busur.
      </p>
      <div className="mt-4 grid gap-6">
        <Graf />
        <Skala />
      </div>
    </PenjelajahShell>
  )
}

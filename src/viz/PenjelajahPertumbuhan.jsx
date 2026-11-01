import { useEffect, useMemo, useState } from 'react'
import { Button, Icon, Segmented, Select, Slider } from '../ui/index.js'
import { cx } from '../ui/cx.js'
import GrafikPertumbuhan, { Swatch } from './GrafikPertumbuhan.jsx'
import PenjelajahShell from './PenjelajahShell.jsx'
import { Angka, Panel } from './PenjelajahUi.jsx'
import { angkaID, formatNilai, formatRasio, fungsi, fungsiById, rasio, rumusRasio, studiKasus, titikPotong } from './growthModel.js'

// Pengaturan awal = Gambar 1 Modul 05 (n = 1..20, lg n, n, n lg n, n², 2ⁿ, sumbu tegak linier).
const AWAL = { keys: ['lg', 'n', 'nlg', 'n2', '2n'], nMax: 20, skala: 'linear', n: 10 }

function PilihFungsi({ keys, setKeys }) {
  return (
    <div role="group" aria-label="Fungsi yang ditampilkan" className="flex flex-wrap gap-2">
      {fungsi.map((f) => {
        const on = keys.includes(f.id)
        return (
          <button
            key={f.id}
            type="button"
            aria-pressed={on}
            onClick={() => setKeys(on ? keys.filter((k) => k !== f.id) : [...keys, f.id])}
            className={cx('text-body inline-flex items-center gap-2 rounded-sm border px-2.5 py-1.5 transition-colors', on ? 'border-brand-blue bg-info-bg font-semibold text-control' : 'border-line bg-card text-ink hover:border-brand-blue')}
          >
            <Swatch id={f.id} />
            {f.label}
          </button>
        )
      })}
    </div>
  )
}

function Grafik() {
  const [keys, setKeys] = useState(AWAL.keys)
  const [nMax, setNMax] = useState(AWAL.nMax)
  const [skala, setSkala] = useState(AWAL.skala)
  const [n, setN] = useState(AWAL.n)
  const nPakai = Math.min(n, nMax)
  const tampil = fungsi.filter((f) => keys.includes(f.id))
  const peringkat = useMemo(() => fungsi.map((f, i) => ({ id: f.id, urut: i + 1 })), [])
  return (
    <Panel judul="Grafik pertumbuhan" id="pj-grafik">
      <div className="flex flex-col gap-4">
        <PilihFungsi keys={keys} setKeys={setKeys} />
        <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
          <div className="flex flex-col gap-1">
            <span className="text-caption text-ink-soft">
              Grafik sampai n = <span className="text-code text-ink">{nMax}</span>
            </span>
            <Slider value={nMax} min={5} max={100} onChange={setNMax} label="Batas ukuran masukan pada grafik" className="w-48" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-caption text-ink-soft">
              Ukuran masukan n = <span className="text-code text-ink">{nPakai}</span>
            </span>
            <Slider value={nPakai} min={1} max={nMax} onChange={setN} label="Ukuran masukan n untuk tabel nilai" tone="lokasi" className="w-48" />
          </div>
          <Segmented
            label="Skala sumbu tegak"
            value={skala}
            onChange={setSkala}
            options={[
              { id: 'linear', label: 'Linier' },
              { id: 'log', label: 'Logaritmik' },
            ]}
          />
          <Button
            variant="netral"
            size="s"
            onClick={() => {
              setKeys(AWAL.keys)
              setNMax(AWAL.nMax)
              setSkala(AWAL.skala)
              setN(AWAL.n)
            }}
          >
            Seperti Gambar 1 Modul 05
          </Button>
        </div>
        {keys.length === 0 ? (
          <p role="status" className="text-body rounded-sm border border-dashed border-line bg-panel p-4 text-ink-soft">
            Pilih setidaknya satu fungsi untuk menampilkan grafik.
          </p>
        ) : (
          <GrafikPertumbuhan keys={keys} nMax={nMax} skala={skala} n={nPakai} />
        )}
        <p className="text-caption text-ink-soft">
          {skala === 'linear'
            ? 'Skala linier: kurva yang melewati batas atas grafik dipotong (ditandai ↑). Coba ganti ke skala logaritmik untuk melihat semuanya.'
            : 'Skala logaritmik: setiap garis bantu naik sepuluh kali lipat, sehingga fungsi yang sangat berbeda tetap terlihat bersama.'}
        </p>
        {/* tabel nilai: padanan teks dari grafik, untuk semua fungsi pada n yang dipilih */}
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- wadah yang bisa digulir harus bisa difokus agar tabel lebar terbaca dengan keyboard */}
        <div role="region" aria-label="Tabel nilai fungsi, bisa digeser ke samping" tabIndex={0} className="overflow-x-auto rounded-sm border border-line">
          <table className="w-full min-w-[34rem] border-collapse text-left">
            <caption className="text-body-strong border-b border-line bg-panel px-3 py-2 text-left text-heading">Nilai fungsi pada n = {nPakai}</caption>
            <thead>
              <tr className="text-caption border-b border-line text-ink-soft">
                <th scope="col" className="px-3 py-2">Fungsi</th>
                <th scope="col" className="px-3 py-2">Nama</th>
                <th scope="col" className="px-3 py-2">Nilai</th>
                <th scope="col" className="px-3 py-2">Urutan tumbuh</th>
              </tr>
            </thead>
            <tbody>
              {fungsi.map((f) => (
                <tr key={f.id} className={cx('border-b border-line last:border-0', !tampil.includes(f) && 'text-ink-soft')}>
                  <th scope="row" className="text-code px-3 py-2 font-semibold">
                    <span className="flex items-center gap-2">
                      <Swatch id={f.id} />
                      {f.label}
                    </span>
                  </th>
                  <td className="text-body px-3 py-2">{f.nama}</td>
                  <td className="text-code px-3 py-2">{formatNilai(f.id, nPakai)}</td>
                  <td className="text-body px-3 py-2">{peringkat.find((p) => p.id === f.id).urut} dari 8</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Panel>
  )
}

function Rasio() {
  const [n1, setN1] = useState(5)
  const [n2, setN2] = useState(25)
  return (
    <Panel judul="Rasio pertumbuhan" id="pj-rasio">
      <p className="text-body text-ink-soft">
        Jika ukuran masukan naik dari <span className="text-code text-ink">n₁</span> menjadi <span className="text-code text-ink">n₂</span>, berapa kali lipat waktunya naik? Konstanta saling menghapus, jadi rasio hanya bergantung pada bentuk fungsi (Tabel 2 Modul 05).
      </p>
      <div className="mt-3 flex flex-wrap gap-4">
        <Angka label="n₁ (ukuran awal)" value={n1} onChange={setN1} min={2} max={1000} />
        <Angka label="n₂ (ukuran baru)" value={n2} onChange={setN2} min={2} max={1000} />
      </div>
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- wadah yang bisa digulir harus bisa difokus agar tabel lebar terbaca dengan keyboard */}
      <div role="region" aria-label="Tabel rasio, bisa digeser ke samping" tabIndex={0} className="mt-4 overflow-x-auto rounded-sm border border-line">
        <table className="w-full min-w-[34rem] border-collapse text-left">
          <caption className="text-body-strong border-b border-line bg-panel px-3 py-2 text-left text-heading">
            Rasio pertumbuhan dari n = {n1} menjadi n = {n2}
          </caption>
          <thead>
            <tr className="text-caption border-b border-line text-ink-soft">
              <th scope="col" className="px-3 py-2">Fungsi</th>
              <th scope="col" className="px-3 py-2">Perhitungan rasio</th>
              <th scope="col" className="px-3 py-2">Rasio</th>
            </tr>
          </thead>
          <tbody>
            {fungsi.map((f) => (
              <tr key={f.id} className="border-b border-line last:border-0">
                <th scope="row" className="text-code px-3 py-2 font-semibold">
                  <span className="flex items-center gap-2">
                    <Swatch id={f.id} />
                    {f.label}
                  </span>
                </th>
                <td className="text-code px-3 py-2">{rumusRasio(f.id, n1, n2)}</td>
                <td className="text-code px-3 py-2 font-semibold">{formatRasio(rasio(f.id, n1, n2))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}

const opsiFungsi = fungsi.filter((f) => f.id !== '1').map((f) => ({ value: f.id, label: `${f.label} (${f.nama})` }))

function StudiKasus() {
  const [fA, setFA] = useState('nlg')
  const [fB, setFB] = useState('n2')
  const [n0, setN0] = useState(4)
  const [n1, setN1] = useState(1024)
  const [k, setK] = useState(20)
  const s = useMemo(() => studiKasus({ fA, fB, n0, n1, k }), [fA, fB, n0, n1, k])
  const A = fungsiById(fA)
  const B = fungsiById(fB)
  const kesimpulan =
    s.algoritmaMenang === 'A'
      ? `Algoritma A (${A.label}) di komputer biasa tetap lebih cepat daripada algoritma B (${B.label}) di komputer ${angkaID(k)} kali lebih cepat. Memilih algoritma yang tepat lebih efektif daripada mempercepat prosesor.`
      : s.algoritmaMenang === 'B'
        ? `Dengan komputer ${angkaID(k)} kali lebih cepat, algoritma B (${B.label}) sudah mengalahkan algoritma A (${A.label}) pada n = ${angkaID(n1)}. Coba naikkan n: selisih bentuk fungsi akan terus membesar sampai A kembali menang.`
        : 'Kedua cara menghasilkan waktu yang sama pada ukuran ini.'
  return (
    <Panel judul="Prosesor cepat atau algoritma tepat?" id="pj-studi">
      <p className="text-body text-ink-soft">
        Algoritma A dan B memakai waktu yang sama (<span className="text-code text-ink">T</span> detik) untuk n₀ data. Berapa waktu keduanya untuk n data yang lebih besar, dan apakah prosesor yang lebih cepat bisa menyelamatkan algoritma yang bentuk fungsinya lebih buruk?
      </p>
      <div className="mt-3 flex flex-wrap items-start gap-x-4 gap-y-3">
        <Select label="Algoritma A" value={fA} onChange={setFA} options={opsiFungsi} />
        <Select label="Algoritma B" value={fB} onChange={setFB} options={opsiFungsi} />
        <Angka label="n₀ (waktu sama)" value={n0} onChange={setN0} min={2} max={1000} />
        <Angka label="n (ukuran baru)" value={n1} onChange={setN1} min={2} max={1000} />
        <Angka label="Prosesor B lebih cepat (kali)" value={k} onChange={setK} min={1} max={1_000_000} />
      </div>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Waktu A pada n', `${formatRasio(s.A)} T`, 'rasio pertumbuhan A'],
          ['Waktu B pada n', `${formatRasio(s.B)} T`, 'rasio pertumbuhan B'],
          [`Waktu B di komputer ${angkaID(k)}× lebih cepat`, `${formatRasio(s.Bcepat)} T`, 'waktu B dibagi percepatan'],
          ['Percepatan agar B menyamai A', `${formatRasio(s.kebutuhan)}×`, 'rasio B dibagi rasio A'],
        ].map(([judul, nilaiTeks, sub]) => (
          <div key={judul} className="rounded-sm border border-line bg-panel p-3">
            <dt className="text-caption text-ink-soft">{judul}</dt>
            <dd className="mt-1">
              <span className="text-code text-body-strong text-heading">{nilaiTeks}</span>
              <span className="text-caption block text-ink-soft">{sub}</span>
            </dd>
          </div>
        ))}
      </dl>
      <p role="status" className="text-body-strong mt-4 flex items-start gap-3 rounded-sm border-l-4 border-brand-yellow-strong bg-surface p-3 text-ink">
        <Icon name="info" size={18} className="mt-0.5 shrink-0 text-ink-soft" />
        {kesimpulan}
      </p>
    </Panel>
  )
}

function TitikPotong() {
  const [cQ, setCQ] = useState(2)
  const [cL, setCL] = useState(50)
  const hasil = useMemo(() => titikPotong(cQ, cL), [cQ, cL])
  return (
    <Panel judul="Titik potong: kapan algoritma yang lebih lambat tumbuh mulai menang?" id="pj-potong">
      <p className="text-body text-ink-soft">
        Contoh bahan kuliah: Insertion Sort <span className="text-code text-ink">{cQ}n²</span> langkah dan Merge Sort <span className="text-code text-ink">{cL} n lg n</span> langkah. Untuk n kecil konstanta bisa membuat algoritma yang &quot;buruk&quot; tampak lebih cepat; untuk n besar, bentuk fungsi selalu menang.
      </p>
      <div className="mt-3 flex flex-wrap gap-4">
        <Angka label="Konstanta n² (Insertion Sort)" value={cQ} onChange={setCQ} min={0.01} max={1000} desimal />
        <Angka label="Konstanta n lg n (Merge Sort)" value={cL} onChange={setCL} min={0.01} max={1000} desimal />
      </div>
      <p role="status" className="text-body-strong mt-4 flex items-start gap-3 rounded-sm border-l-4 border-brand-yellow-strong bg-surface p-3 text-ink">
        <Icon name="info" size={18} className="mt-0.5 shrink-0 text-ink-soft" />
        {hasil === null
          ? 'Sampai n = 2.000.000 algoritma n² belum pernah selalu lebih lambat dari n lg n dengan konstanta ini.'
          : `Mulai n = ${angkaID(hasil)} algoritma n lg n selalu lebih cepat dan keunggulannya terus bertambah. Untuk n yang lebih kecil, algoritma n² dengan konstanta kecil bisa lebih cepat.`}
      </p>
    </Panel>
  )
}

/** Penjelajah Pertumbuhan Fungsi (Modul 05): grafik delapan bentuk fungsi, rasio pertumbuhan, studi kasus prosesor vs algoritma, dan titik potong. */
export default function PenjelajahPertumbuhan({ a }) {
  useEffect(() => {
    document.title = `${a.judul} · LABU`
  }, [a.judul])
  return (
    <PenjelajahShell a={a}>
      <p className="text-body mt-4 max-w-3xl text-ink-soft">
        Geser ukuran masukan dan bandingkan seberapa cepat delapan bentuk fungsi running time membengkak. Semua angka punya padanan tabel di bawah grafik.
      </p>
      <div className="mt-4 grid gap-6">
        <Grafik />
        <Rasio />
        <StudiKasus />
        <TitikPotong />
      </div>
    </PenjelajahShell>
  )
}

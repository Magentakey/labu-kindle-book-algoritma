import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { parseModul } from '../lib/modulContent.js'
import { hitungHasil, nilaiSoal, TIPE_LABEL } from '../lib/kuis.js'
import { algoritma } from '../data/algoritma.js'
import { modulById, neighbors, sections, tabsOf } from '../data/modul.js'
import { daftarKuis, kuisById } from '../data/quiz.js'
import { petaBab } from '../data/credit.js'
import { cariPython } from '../test/python.js'
import { penjelajahIds } from '../viz/penjelajahIds.js'
import { formatNilai, formatRasio, fungsi, jalurKurva, log10Nilai, nilai, rasio, skalaY, sup, studiKasus, titikPotong } from '../viz/growthModel.js'
import { kuis05 } from './modul/05.kuis.js'
import { GAMBAR_1 } from './modul/05.hitung.js'

// Akhir baris dinormalkan: git di Windows bisa mengubah berkas teks menjadi CRLF.
const md = readFileSync(new URL('./modul/05.md', import.meta.url), 'utf8').replace(/\r\n/g, '\n')
const bagian = parseModul(md)
const m = modulById('05')

const barisTabel = (caption) => {
  const end = md.indexOf(caption)
  assert.ok(end > 0, caption)
  const lines = md.slice(0, end).trimEnd().split('\n')
  const out = []
  for (let i = lines.length - 1; i >= 0 && lines[i].startsWith('|'); i--) out.unshift(lines[i].split('|').slice(1, -1).map((c) => c.trim()))
  return out.slice(2)
}
/** Mengubah sel tabel TeX sederhana menjadi teks yang sama dengan keluaran model: "$1{,}27 \times 10^{30}$" → "1,27 × 10³⁰". */
const teks = (sel) =>
  sel
    .replace(/\$/g, '')
    .replace(/\\approx\s*/g, '')
    .replace(/\{,\}/g, ',')
    .replace(/\s*\\times\s*/g, ' × ')
    .replace(/10\^\{(-?\d+)\}/g, (_, e) => `10${sup(e)}`)
    .replace(/10\^(\d)/g, (_, e) => `10${sup(e)}`)
    .trim()

// ---------------------------------------------------------------- struktur dan metadata
test('struktur: enam bagian sesuai PDF, semua tab terpenuhi, satu gambar, tanpa pseudocode', () => {
  assert.deepEqual(bagian.map((s) => s.id), ['pendahuluan', 'algoritma', 'penelusuran', 'analisis', 'makna', 'kesimpulan', 'referensi'])
  assert.deepEqual(bagian.map((s) => s.judul.match(/^\d+/)?.[0] ?? null), ['1', '2', '3', '4', '5', '6', null])
  for (const id of sections.map((s) => s.id).filter((id) => id !== 'kuis')) assert.ok(bagian.some((s) => s.id === id), id)
  const slots = bagian.flatMap((s) => s.blok.filter((b) => b.type === 'slot'))
  assert.deepEqual(slots.map((b) => `${b.name}:${b.arg}`), ['gambar:grafik'])
  assert.deepEqual([...md.matchAll(/\*Tabel (\d+)\./g)].map((x) => Number(x[1])), [1, 2, 3])
})

test('metadata sama dengan katalog Modul 00; visualizer penjelajah terhubung dua arah', () => {
  assert.deepEqual([m.no, m.bab, m.halaman, m.soal, m.prasyarat], [5, 'BAB II', 9, 7, [3, 4]])
  assert.equal(m.soal, kuis05.soal.length)
  assert.equal(m.tujuan.length, 4)
  assert.equal(petaBab[1].modul[2].judul, m.judul)
  assert.deepEqual(tabsOf(m).map((x) => x.tab), ['1 Pendahuluan', '2 Bentuk Fungsi', '3 Rasio', '4 Studi Kasus', '5 Asimtotik', '6 Kesimpulan', 'Kuis', 'Referensi'])
  assert.deepEqual(neighbors('05'), { prev: modulById('04'), next: modulById('06') })
  assert.equal(m.algoritmaId, 'pertumbuhan-fungsi')
  assert.ok(penjelajahIds.includes(m.algoritmaId))
  const kartu = algoritma.find((a) => a.id === m.algoritmaId)
  assert.deepEqual([kartu.modul, kartu.viz, kartu.thumb], [5, true, 'growth'], 'kartu galeri menunjuk Modul 05 dan penjelajah')
  assert.equal(kuisById('05').soal, 7)
  assert.equal(kuisById('05').judul, kuis05.judul)
})

// ---------------------------------------------------------------- tabel dicocokkan dengan model hitung
test('Tabel 1: delapan bentuk fungsi berurutan, nama dan contoh sama dengan model penjelajah', () => {
  const rows = barisTabel('*Tabel 1.')
  assert.equal(rows.length, 8)
  assert.deepEqual(rows.map((r) => r[0]), ['1', '2', '3', '4', '5', '6', '7', '8'])
  rows.forEach((r, i) => {
    assert.ok(r[2].toLowerCase().includes(fungsi[i].nama.toLowerCase()), `nama baris ${i + 1}: ${r[2]}`)
    assert.equal(r[3].replace(/[$*]/g, ''), fungsi[i].contoh, `contoh baris ${i + 1}`)
  })
})

test('Tabel 2: rasio n = 5 → 25 di teks sama dengan model untuk delapan fungsi', () => {
  const rows = barisTabel('*Tabel 2.')
  assert.equal(rows.length, 8)
  assert.deepEqual(rows.map((r) => teks(r[2])), fungsi.map((f) => formatRasio(rasio(f.id, 5, 25))))
  assert.deepEqual(rows.map((r) => teks(r[2])), ['1', '2', '5', '10', '25', '125', '1.048.576', '1,29 × 10²³'])
  assert.ok(md.includes('\\dfrac{2^{25}}{2^5} = 2^{20}') && md.includes('25 \\cdot 24 \\cdot 23 \\cdots 6'))
  let h = 1n
  for (let k = 6n; k <= 25n; k++) h *= k // 25!/5! langsung dengan BigInt
  assert.ok(Math.abs(Number(h) / rasio('nf', 5, 25).nilai - 1) < 1e-12)
  assert.equal(2 ** 20, 1048576)
})

test('Tabel 3: nilai fungsi untuk n = 10, 100, 1.000, 10⁶ sama dengan model (dan PDF)', () => {
  const rows = barisTabel('*Tabel 3.')
  assert.equal(rows.length, 4)
  const ids = ['lg', 'n', 'nlg', 'n2', 'n3', '2n']
  const ns = rows.map((r) => (teks(r[0]) === '10⁶' ? 1e6 : Number(teks(r[0]).replace(/\./g, ''))))
  assert.deepEqual(ns, [10, 100, 1000, 1e6])
  rows.forEach((r, i) => assert.deepEqual(r.slice(1).map(teks), ids.map((id) => formatNilai(id, ns[i])), `baris n=${ns[i]}`))
  // angka di paragraf sesudah tabel: 10⁹ langkah/detik
  const detik = (id, n) => nilai(id, n) / 1e9
  assert.ok(Math.abs(detik('nlg', 1e6) - 0.0199) < 1e-4, 'n lg n: ± 0,02 detik')
  assert.ok(Math.abs(detik('n2', 1e6) - 1000) < 1e-9 && Math.abs(detik('n2', 1e6) / 60 - 16.67) < 0.01, 'n²: 1.000 detik ≈ 17 menit')
  assert.equal(detik('n3', 1e6), 1e9)
  assert.ok(1e9 / (365.25 * 24 * 3600) > 31, 'n³: > 31 tahun')
  assert.ok(Math.abs(log10Nilai('2n', 100) - 100 * Math.log10(2)) < 1e-9)
  assert.ok(Math.abs(2 ** 100 / 1e9 / 1.27e21 - 1) < 0.005, '2^100 / 10^9 ≈ 1,27 × 10²¹ detik')
})

// ---------------------------------------------------------------- studi kasus dan Python
test('studi kasus: 1280, 65536, 51,2×, 3276,8 dan 32768 (prosesor 20× dan 2×) sama dengan teks', () => {
  const s = studiKasus({ fA: 'nlg', fB: 'n2', n0: 4, n1: 1024, k: 20 })
  assert.deepEqual([s.A.nilai, s.B.nilai], [1280, 65536])
  assert.ok(Math.abs(s.Bcepat.nilai - 3276.8) < 1e-9 && Math.abs(s.kebutuhan.nilai - 51.2) < 1e-9)
  assert.equal(studiKasus({ fA: 'nlg', fB: 'n2', n0: 4, n1: 1024, k: 2 }).Bcepat.nilai, 32768)
  assert.equal(s.algoritmaMenang, 'A')
  for (const potong of ['1280', '65536', '3276{,}8', '32768', '51{,}2', 'kira-kira 51 kali']) assert.ok(md.includes(potong), potong)
  assert.ok(md.includes('1024 = 4^5') && 1024 === 4 ** 5)
  assert.ok(md.includes('\\lg 4^5 = 5 \\lg 4'))
  assert.equal(256 ** 2, 65536)
  assert.equal((1024 * 10) / (4 * 2), 1280)
})

test('titik potong 190 di teks dan Python; Insertion Sort lebih cepat untuk n < 190 dan Merge Sort mulai n ≥ 190', () => {
  assert.equal(titikPotong(2, 50), 190)
  assert.ok(md.includes('Untuk $n < 190$') && md.includes('$n \\ge 190$'))
  for (const n of [2, 50, 100, 189]) assert.ok(2 * n * n <= 50 * n * Math.log2(n), `n=${n}: Insertion Sort tidak lebih lambat`)
  for (const n of [190, 191, 500, 10000]) assert.ok(2 * n * n > 50 * n * Math.log2(n), `n=${n}: Merge Sort lebih cepat`)
})

test('program Python di modul dijalankan sungguhan: keluarannya sama dengan teks dan dengan model hitung', (t) => {
  const kode = /```python\n([\s\S]*?)```/.exec(md)[1]
  const cetak = /```text\n([\s\S]*?)```/.exec(md)[1].trimEnd()
  // keluaran tercetak = hasil model: tujuh rasio, dua rasio studi kasus, titik potong
  const rasioBaris = ['c', 'lg n', 'n', 'n lg n', 'n^2', 'n^3', '2^n'].map((nama, i) => {
    const id = ['1', 'lg', 'n', 'nlg', 'n2', 'n3', '2n'][i]
    return `${nama.padEnd(7)} ${Math.round(rasio(id, 5, 25).nilai).toLocaleString('en-US')}`
  })
  assert.deepEqual(cetak.split('\n'), [...rasioBaris, '1280.0 65536.0', 'Merge Sort mulai lebih cepat pada n = 190'])
  const py = cariPython()
  if (!py) return t.skip('Python 3 tidak ditemukan di mesin ini')
  const r = spawnSync(py, ['-c', kode], { encoding: 'utf8' })
  assert.equal(r.status, 0, r.stderr)
  assert.equal(r.stdout.replace(/\r\n/g, '\n').trimEnd(), cetak)
})

test('Gambar 1: pengaturan sama dengan teks (n = 1..20, linier, dipotong di 120); hanya n² dan 2ⁿ keluar dari grafik', () => {
  assert.deepEqual(GAMBAR_1, { keys: ['lg', 'n', 'nlg', 'n2', '2n'], nMax: 20, skala: 'linear' })
  const sk = skalaY(GAMBAR_1.skala, GAMBAR_1.nMax, GAMBAR_1.keys)
  assert.equal(sk.yMax, 120)
  const terpotong = GAMBAR_1.keys.filter((id) => jalurKurva(id, GAMBAR_1.nMax, sk).terpotong)
  assert.deepEqual(terpotong, ['n2', '2n'])
  const gambar = readFileSync(new URL('./modul/05.gambar.jsx', import.meta.url), 'utf8')
  assert.ok(gambar.includes('dipotong di 120') && gambar.includes('Kurva 2ⁿ dan n² melesat ke atas jauh lebih awal'), 'keterangan gambar sesuai PDF')
})

// ---------------------------------------------------------------- kuis
test('kunci kuis dihitung ulang: soal 1, 2, 3, 4, 5, 7', () => {
  assert.deepEqual(['lg', 'nlg', 'n2'].map((id) => rasio(id, 8, 64).nilai).map(Math.round), [2, 16, 64])
  assert.deepEqual(kuis05.soal[0].isian.map((f) => f.kunci), [2, 16, 64])
  // soal 2: opsi B adalah satu-satunya urutan menaik pada n = 100
  const l = (id) => log10Nilai(id, 100)
  const naik = (ids) => ids.every((id, i) => i === 0 || l(id) > l(ids[i - 1]))
  const opsi = { A: ['n', 'lg', 'nlg', '2n', 'n2'], B: ['lg', 'n', 'nlg', 'n2', '2n'], C: ['lg', 'nlg', 'n', 'n2', 'nf'], D: ['1', 'n', 'lg', 'n3', '2n'] }
  assert.deepEqual(Object.keys(opsi).filter((k) => naik(opsi[k])), ['B'])
  assert.equal(kuis05.soal[1].kunci, 'B')
  // soal 3: 1000n < n² untuk n > 1000
  assert.deepEqual([999, 1000, 1001].map((n) => 1000 * n < n * n), [false, false, true])
  assert.equal(1000 * 1e6, 1e9)
  assert.equal(1e6 ** 2, 1e12)
  // soal 4: algoritma kubik 100 data = 2 detik → 400 data
  assert.equal((400 ** 3 / 100 ** 3) * 2, 128)
  assert.equal(kuis05.soal[3].isian[0].kunci, 128)
  // soal 5: n = 16 → 256
  const s5 = studiKasus({ fA: 'nlg', fB: 'n2', n0: 16, n1: 256, k: 1 })
  assert.deepEqual([s5.A.nilai, s5.B.nilai, Math.round(s5.kebutuhan.nilai)], [32, 256, 8])
  assert.deepEqual(kuis05.soal[4].isian.map((f) => f.kunci), [32, 256, 8])
  // soal 7
  for (const n0 of [1, 10, 30]) assert.equal(1024 * 2 ** n0, 2 ** (n0 + 10))
  assert.equal(kuis05.soal[6].isian[0].kunci, 10)
})

test('struktur kuis: 7 soal, jenis sesuai PDF, hanya soal 3 yang dinilai sendiri, satu jenis jawaban per soal', () => {
  assert.deepEqual(kuis05.soal.map((q) => q.no), [1, 2, 3, 4, 5, 6, 7])
  assert.deepEqual(kuis05.soal.map((q) => TIPE_LABEL[q.tipe]), ['Perhitungan', 'Pilihan Ganda', 'Benar/Salah', 'Perhitungan', 'Analisis', 'Pilihan Ganda', 'Analisis'])
  assert.deepEqual(kuis05.soal.filter((q) => q.opsi).map((q) => q.kunci), ['B', 'B'])
  assert.deepEqual(kuis05.soal.filter((q) => q.mandiri).map((q) => q.no), [3])
  for (const q of kuis05.soal) {
    assert.ok(q.teks.length > 10 && q.pembahasan.length > 10, `soal ${q.no}`)
    if (q.opsi) assert.ok(q.opsi.some((o) => o.id === q.kunci), `kunci soal ${q.no}`)
    if (q.mandiri) assert.ok(q.kunciTeks, `kunciTeks soal ${q.no}`)
    assert.equal([q.mandiri, q.opsi, q.isian].filter(Boolean).length, 1, `satu jenis jawaban per soal (${q.no})`)
  }
  assert.deepEqual([...new Set(kuis05.soal.map((q) => q.tipe))].sort(), [...daftarKuis.find((k) => k.id === '05').tipe].sort())
})

test('penilaian soal Modul 05: isian angka, pilihan, dan hasil lulus pada 70%', () => {
  const [q1, q2, , q4, q5, q6, q7] = kuis05.soal
  assert.equal(nilaiSoal(q1, ['2', '16', '64']).benar, true)
  assert.equal(nilaiSoal(q1, ['2', '16', '8']).benar, false)
  assert.equal(nilaiSoal(q2, 'B').benar, true)
  assert.equal(nilaiSoal(q4, ['128']).benar, true)
  assert.equal(nilaiSoal(q4, ['64']).benar, false, 'lupa mengalikan dengan 2 detik')
  assert.equal(nilaiSoal(q5, ['32', '256', '8']).benar, true)
  assert.equal(nilaiSoal(q5, ['32', '256', '51,2']).benar, false)
  assert.equal(nilaiSoal(q6, 'B').benar, true)
  assert.equal(nilaiSoal(q7, ['10']).benar, true)
  assert.equal(nilaiSoal(q7, ['1024']).benar, false)
  const ok = { teks: 'a', sesuai: true }
  const semua = { 1: ['2', '16', '64'], 2: 'B', 3: ok, 4: ['128'], 5: ['32', '256', '8'], 6: 'B', 7: ['10'] }
  assert.deepEqual([hitungHasil(kuis05.soal, semua).skor, hitungHasil(kuis05.soal, semua).lulus], [7, true])
  assert.deepEqual(hitungHasil(kuis05.soal, { ...semua, 3: undefined }).belumDinilai, [3])
  const empat = hitungHasil(kuis05.soal, { ...semua, 1: ['1'], 2: 'A', 4: ['1'] })
  assert.deepEqual([empat.skor, empat.persen, empat.lulus], [4, 57, false])
})

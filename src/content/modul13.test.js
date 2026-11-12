import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { parseModul } from '../lib/modulContent.js'
import { algoritma } from '../data/algoritma.js'
import { modul, modulById, neighbors, tabsOf } from '../data/modul.js'
import { kuisById } from '../data/quiz.js'
import { petaBab } from '../data/credit.js'
import { cariPython } from '../test/python.js'
import { vizIds } from '../viz/vizConfig.js'
import { barangModul, kapasitasGagal, knapsack01Greedy, knapsack01Optimal, knapsackPecahan, koinGreedy, koinOptimal, penyangkalKoin } from '../viz/greedyModel.js'
import { kuis13 } from './modul/13.kuis.js'

const md = readFileSync(new URL('./modul/13.md', import.meta.url), 'utf8').replace(/\r\n/g, '\n')
const bagian = parseModul(md)
const m = modulById('13')

const barisTabel = (caption) => {
  const end = md.indexOf(caption)
  assert.ok(end > 0, caption)
  const lines = md.slice(0, end).trimEnd().split('\n')
  const out = []
  for (let i = lines.length - 1; i >= 0 && lines[i].startsWith('|'); i--) out.unshift(lines[i].split('|').slice(1, -1).map((c) => c.trim()))
  return out.slice(2)
}
const blokTeks = (bahasa, indeks = 0) => [...md.matchAll(new RegExp('```' + bahasa + '\\n([\\s\\S]*?)```', 'g'))][indeks][1]

test('struktur: enam bagian sesuai PDF pas dengan enam tab, tiga tabel, kode Python, tanpa gambar atau pseudocode; teks polos tanpa TeX', () => {
  assert.deepEqual(bagian.map((s) => s.id), ['pendahuluan', 'algoritma', 'penelusuran', 'analisis', 'makna', 'kesimpulan', 'referensi'])
  assert.deepEqual(bagian.map((s) => s.judul.match(/^\d+/)?.[0] ?? null), ['1', '2', '3', '4', '5', '6', null])
  for (const t of tabsOf(m).filter((x) => x.id !== 'kuis')) assert.ok(bagian.some((s) => s.id === t.id), t.id)
  assert.deepEqual(bagian.flatMap((s) => s.blok.filter((b) => b.type === 'slot' && b.name !== 'tantangan')), [], 'modul ini tanpa gambar atau pseudocode')
  assert.deepEqual([...md.matchAll(/\*Tabel (\d+)\./g)].map((x) => Number(x[1])), [1, 2, 3])
  assert.equal([...md.matchAll(/```python/g)].length, 1)
  for (const jdl of ['3.1', '3.2', '3.3', '4.1', '4.2', '4.3', '4.4']) assert.ok(md.includes(`### ${jdl} `), `subbagian ${jdl}`)
  assert.equal([...md.matchAll(/\{\{callout:/g)].length, [...md.matchAll(/\{\{\/callout\}\}/g)].length, 'callout berpasangan')
  for (const l of md.split('\n').filter((x) => x.startsWith('{{callout'))) assert.ok(!/[$\\]/.test(l), `judul callout polos: ${l}`)
  for (const x of modul) assert.ok(![x.judul, x.judulPanjang, x.ringkas, x.prasyaratTeks].some((t) => /[$\\]/.test(t ?? '')), `${x.id}: teks polos`)
  for (const rumus of md.matchAll(/(?<!\$)\$(?!\$)([^$\n]+)\$(?!\$)/g)) assert.ok(rumus[1].length < 120, `rumus sebaris terlalu panjang: ${rumus[1].slice(0, 50)}`)
  // empat langkah pola umum Greedy
  assert.equal([...md.matchAll(/^[1-4]\. \*\*/gm)].length, 4)
})

test('metadata sama dengan PDF dan katalog; visualizer langkah Konsep Greedy terhubung dua arah dan modul baru bab V', () => {
  assert.deepEqual([m.no, m.bab, m.halaman, m.soal], [13, 'BAB V', 8, 7])
  assert.equal(m.soal, kuis13.soal.length)
  assert.equal(m.tujuan.length, 5)
  assert.equal(petaBab[4].modul[0].judul, m.judul)
  assert.deepEqual(tabsOf(m).map((x) => x.tab), ['1 Pendahuluan', '2 Prinsip', '3 Kapan Optimal', '4 Contoh', '5 Peta Greedy', '6 Kesimpulan', 'Kuis', 'Referensi'])
  assert.deepEqual(neighbors('13'), { prev: modulById('12'), next: modulById('14') })
  assert.equal(neighbors('12').next, m)
  assert.ok(readFileSync(new URL('../../public/' + m.pdf, import.meta.url)).subarray(0, 4).toString() === '%PDF')
  assert.equal(m.algoritmaId, 'konsep-greedy')
  assert.ok(vizIds.includes(m.algoritmaId), 'visualizer pemutar langkah terhubung')
  const kartu = algoritma.find((a) => a.id === m.algoritmaId)
  assert.deepEqual([kartu.modul, kartu.viz, kartu.kategori, kartu.paradigma], [13, true, 'greedy', 'Greedy'])
  assert.equal(kuisById('13').soal, 7)
  assert.equal(kuisById('13').judul, kuis13.judul)
  assert.ok(m.prasyarat.every((x) => modulById(String(x).padStart(2, '0'))))
})

test('Tabel 1: enam aspek perbandingan DP dan Greedy sesuai PDF', () => {
  const t = barisTabel('*Tabel 1.')
  assert.deepEqual(t.map((r) => r[0]), ['Kapan memilih', 'Banyaknya pilihan yang dievaluasi', 'Arah penyelesaian', 'Submasalah tersisa', 'Jaminan optimal', 'Efisiensi'])
  assert.ok(t[1][1] === 'Semua pilihan' && t[1][2].startsWith('Hanya satu'))
  assert.ok(t[5][1].includes('$\\Theta(n^2)$') && t[5][1].includes('$\\Theta(n^3)$') && t[5][2].includes('$O(n \\lg n)$'))
})

test('Bagian 4.1: koin {1,5,10,25} jumlah 63 optimal dengan 6 koin; {1,3,4} jumlah 6 gagal (3 vs 2 koin)', () => {
  assert.deepEqual(koinGreedy([1, 5, 10, 25], 63), [25, 25, 10, 1, 1, 1])
  assert.equal(koinOptimal([1, 5, 10, 25], 63).jumlah, 6)
  assert.deepEqual([koinGreedy([1, 3, 4], 6).length, koinOptimal([1, 3, 4], 6).jumlah], [3, 2])
  assert.equal(penyangkalKoin([1, 3, 4]), 6)
  for (const x of ['$25 + 25 + 10 + 1 + 1 + 1$ (6 koin)', '$4 + 1 + 1$ (3 koin)', '$3 + 3$ hanya 2 koin']) assert.ok(md.includes(x), x)
})

test('Tabel 2 dan Bagian 4.2: knapsack pecahan 240, 0-1 greedy 160 (berat 30), 0-1 optimal 220 (barang 2 dan 3)', () => {
  const t = barisTabel('*Tabel 2.')
  assert.deepEqual(t.map((r) => r.map(Number)), barangModul.map((b, i) => [i + 1, b.berat, b.nilai, b.nilai / b.berat]))
  assert.deepEqual(knapsackPecahan(barangModul, 50).total, { n: 240, d: 1 })
  assert.deepEqual(knapsackPecahan(barangModul, 50).bagian.map((b) => b.nilai.n / b.nilai.d), [60, 100, 80], '60 + 100 + 80')
  assert.deepEqual(knapsack01Greedy(barangModul, 50), { total: 160, berat: 30, pilih: [0, 1] })
  assert.deepEqual(knapsack01Optimal(barangModul, 50), { total: 220, berat: 50, pilih: [1, 2] })
  assert.equal(120 * 20 / 30, 80, '20/30 bagian barang 3 bernilai 80')
  for (const x of ['lalu $\\frac{20}{30}$ bagian barang 3 (80). Total 240', 'total 160, berat 30', 'barang 2 dan 3, total 220']) assert.ok(md.includes(x), x)
})

test('Bagian 4.3 dan Tabel 3: peta lima algoritma greedy dan modulnya sesuai urutan modul', () => {
  const t = barisTabel('*Tabel 3.')
  assert.deepEqual(t.map((r) => [r[0], Number(r[3])]), [['GREEDY-ACTIVITY-SELECTOR', 14], ['Huffman', 15], ['Kruskal', 20], ['Prim', 21], ['Dijkstra', 24]])
  for (const [id, no] of [['activity-selection', 14], ['kode-huffman', 15], ['kruskal', 20], ['prim', 21], ['dijkstra', 24]]) {
    const a = algoritma.find((x) => x.id === id)
    assert.deepEqual([a.modul, a.paradigma], [no, 'Greedy'], id)
  }
})

test('program Python di modul dijalankan sungguhan dan keluarannya sama dengan teks dan model', (t) => {
  const kode = blokTeks('python')
  const cetak = blokTeks('text').trimEnd().split('\n')
  assert.deepEqual(cetak, ['[25, 25, 10, 1, 1, 1] 6', '[4, 1, 1] 2', 'greedy 0-1: 160  optimal 0-1: 220'])
  const model = [
    `[${koinGreedy([1, 5, 10, 25], 63).join(', ')}] ${koinOptimal([1, 5, 10, 25], 63).jumlah}`,
    `[${koinGreedy([1, 3, 4], 6).join(', ')}] ${koinOptimal([1, 3, 4], 6).jumlah}`,
    `greedy 0-1: ${knapsack01Greedy(barangModul, 50).total}  optimal 0-1: ${knapsack01Optimal(barangModul, 50).total}`,
  ]
  assert.deepEqual(model, cetak)
  const py = cariPython()
  if (!py) return t.skip('Python 3 tidak ditemukan di mesin ini')
  const out = spawnSync(py, ['-c', kode], { encoding: 'utf8' })
  assert.equal(out.status, 0, out.stderr)
  assert.deepEqual(out.stdout.replace(/\r\n/g, '\n').trimEnd().split('\n'), cetak)
})

test('kunci kuis dihitung ulang: soal 2 (koin {1,6,10}), soal 3 (penyangkal {1,3,4}), soal 5 (knapsack W = 30)', () => {
  const [, , q3] = kuis13.soal
  assert.deepEqual(koinGreedy([1, 6, 10], 12), [10, 1, 1])
  assert.deepEqual(koinOptimal([1, 6, 10], 12), { jumlah: 2, koin: [6, 6] })
  assert.equal(penyangkalKoin([1, 3, 4]), 6)
  assert.equal(q3.kunci, 'C')
  const g = knapsack01Greedy(barangModul, 30)
  const o = knapsack01Optimal(barangModul, 30)
  assert.deepEqual([g.total, g.berat, o.total], [160, 30, 160])
  assert.ok(!kapasitasGagal(barangModul, 60).includes(30), 'W = 30 bukan kapasitas gagal')
  // "kemungkinan lain yang muat": barang 3 saja 120, barang 1 + 2 160; barang 1 + 3 (40 kg) dan 2 + 3 (50 kg) tidak muat
  assert.deepEqual([barangModul[2].nilai, barangModul[0].nilai + barangModul[1].nilai], [120, 160])
  assert.ok(barangModul[0].berat + barangModul[2].berat > 30 && barangModul[1].berat + barangModul[2].berat > 30)
})


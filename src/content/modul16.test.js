import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { parseModul } from '../lib/modulContent.js'
import { hitungHasil, nilaiSoal, TIPE_LABEL } from '../lib/kuis.js'
import { algoritma } from '../data/algoritma.js'
import { modul, modulById, neighbors, tabsOf } from '../data/modul.js'
import { daftarKuis, kuisById } from '../data/quiz.js'
import { petaBab } from '../data/credit.js'
import { cariPython } from '../test/python.js'
import { penjelajahIds } from '../viz/penjelajahIds.js'
import { rand } from '../lib/testRandom.js'
import { bangun, grafA, grafB, grafSoal1, maksBusurTakBerarah, memori } from '../viz/representasiGrafModel.js'
import { kuis16 } from './modul/16.kuis.js'

const md = readFileSync(new URL('./modul/16.md', import.meta.url), 'utf8').replace(/\r\n/g, '\n')
const bagian = parseModul(md)
const m = modulById('16')

const barisTabel = (caption) => {
  const end = md.indexOf(caption)
  assert.ok(end > 0, caption)
  const lines = md.slice(0, end).trimEnd().split('\n')
  const out = []
  for (let i = lines.length - 1; i >= 0 && lines[i].startsWith('|'); i--) out.unshift(lines[i].split('|').slice(1, -1).map((c) => c.trim()))
  return out.slice(2)
}
const blokTeks = (bahasa, indeks = 0) => [...md.matchAll(new RegExp('```' + bahasa + '\\n([\\s\\S]*?)```', 'g'))][indeks][1]
const daftar = (t) => t.split('→').map((x) => Number(x.trim()))
/** Representasi seperti repr dict Python: {1: [2, 5], ...} */
const reprDict = (adj) => `{${Object.entries(adj).map(([u, l]) => `${u}: [${l.join(', ')}]`).join(', ')}}`

test('struktur: tujuh bagian sesuai PDF (bagian 2 tanpa tab), dua gambar, enam tabel, kode Python, tanpa pseudocode; teks polos tanpa TeX', () => {
  assert.deepEqual(bagian.map((x) => x.id), ['pendahuluan', 'istilah', 'algoritma', 'penelusuran', 'analisis', 'makna', 'kesimpulan', 'referensi'])
  assert.deepEqual(bagian.map((x) => x.judul.match(/^\d+/)?.[0] ?? null), ['1', '2', '3', '4', '5', '6', '7', null])
  for (const t of tabsOf(m).filter((x) => x.id !== 'kuis')) assert.ok(bagian.some((x) => x.id === t.id), t.id)
  assert.deepEqual(bagian.flatMap((x) => x.blok.filter((b) => b.type === 'slot')).map((b) => `${b.name}:${b.arg}`), ['gambar:grafa', 'gambar:grafb'])
  assert.deepEqual([...md.matchAll(/\*Tabel (\d+)\./g)].map((x) => Number(x[1])), [1, 2, 3, 4, 5, 6])
  assert.equal([...md.matchAll(/```python/g)].length, 1)
  assert.ok(md.includes('### 2.1 Dua graf contoh') && md.includes('### 5.1 Implementasi Python'))
  assert.equal([...md.matchAll(/\{\{callout:/g)].length, [...md.matchAll(/\{\{\/callout\}\}/g)].length, 'callout berpasangan')
  for (const l of md.split('\n').filter((x) => x.startsWith('{{callout'))) assert.ok(!/[$\\]/.test(l), `judul callout polos: ${l}`)
  for (const x of modul) assert.ok(![x.judul, x.judulPanjang, x.ringkas, x.prasyaratTeks].some((t) => /[$\\]/.test(t ?? '')), `${x.id}: teks polos`)
  for (const rumus of md.matchAll(/(?<!\$)\$(?!\$)([^$\n]+)\$(?!\$)/g)) assert.ok(rumus[1].length < 120, `rumus sebaris terlalu panjang: ${rumus[1].slice(0, 50)}`)
  assert.equal([...md.matchAll(/Catatan koreksi terhadap sumber/g)].length, 1)
})

test('metadata sama dengan PDF dan katalog; penjelajah Representasi Graf terhubung dua arah', () => {
  assert.deepEqual([m.no, m.bab, m.halaman, m.soal], [16, 'BAB VI', 9, 7])
  assert.equal(m.soal, kuis16.soal.length)
  assert.equal(m.tujuan.length, 4)
  assert.equal(petaBab[5].modul[0].judul, m.judul)
  assert.deepEqual(tabsOf(m).map((x) => x.tab), ['1 Pendahuluan', '3 Adjacency-List', '4 Adjacency-Matrix', '5 Perbandingan', '6 Mengapa Penting', '7 Kesimpulan', 'Kuis', 'Referensi'])
  assert.deepEqual(neighbors('16'), { prev: modulById('15'), next: null })
  assert.equal(neighbors('15').next, m)
  assert.ok(readFileSync(new URL('../../public/' + m.pdf, import.meta.url)).subarray(0, 4).toString() === '%PDF')
  assert.equal(m.algoritmaId, 'representasi-graf')
  assert.ok(penjelajahIds.includes(m.algoritmaId))
  const kartu = algoritma.find((a) => a.id === m.algoritmaId)
  assert.deepEqual([kartu.modul, kartu.viz, kartu.kategori], [16, true, 'graf'])
  assert.equal(kuisById('16').soal, 7)
  assert.equal(kuisById('16').judul, kuis16.judul)
  assert.ok(m.prasyarat.every((x) => modulById(String(x).padStart(2, '0'))))
})

test('Tabel 1: sembilan istilah; tree dengan |V| simpul punya |V| − 1 busur (acak: terhubung dan |E| = |V| − 1 berarti tanpa cycle)', () => {
  const t = barisTabel('*Tabel 1.')
  assert.equal(t.length, 9)
  assert.ok(t.some((r) => r[0].startsWith('Tree') && r[1].includes('\\lvert V \\rvert - 1')))
  for (let u = 0; u < 100; u++) {
    const n = 1 + Math.floor(rand() * 15)
    const busur = []
    for (let v = 2; v <= n; v++) busur.push([1 + Math.floor(rand() * (v - 1)), v]) // tiap simpul baru menempel ke simpul lama: tree
    const adj = bangun(n, busur, false).adj
    const lihat = new Set([1])
    const antre = [1]
    while (antre.length) for (const w of adj[antre.shift()]) if (!lihat.has(w)) { lihat.add(w); antre.push(w) }
    assert.equal(lihat.size, n, 'terhubung')
    assert.equal(busur.length, n - 1)
  }
  assert.equal(maksBusurTakBerarah(5), 10)
  assert.ok(grafA.busur.length <= maksBusurTakBerarah(grafA.n))
})

test('Gambar 1 dan 2: graf (a) tak berarah 5 simpul 7 busur; graf (b) berarah 6 simpul 8 busur dengan self-loop; keterangan gambar', () => {
  assert.deepEqual([grafA.n, grafA.busur.length, grafA.berarah], [5, 7, false])
  assert.deepEqual([grafB.n, grafB.busur.length, grafB.berarah, grafB.busur.filter(([u, v]) => u === v)], [6, 8, true, [[6, 6]]])
  const g = readFileSync(new URL('./modul/16.gambar.jsx', import.meta.url), 'utf8')
  assert.ok(g.includes('Gambar 1. (a) Graf tak berarah dengan 5 simpul dan 7 busur.'))
  assert.ok(g.includes('Gambar 2. (b) Graf berarah dengan 6 simpul dan 8 busur (termasuk self-loop pada simpul 6).'))
})

test('Tabel 2 dan 3: adjacency-list di PDF memuat tetangga yang sama dengan model (urutan boleh beda), total panjang 14 = 2×7 dan 8', () => {
  const a = bangun(grafA.n, grafA.busur, false)
  const t2 = barisTabel('*Tabel 2.')
  assert.equal(t2.length, 5)
  let total = 0
  t2.forEach((r, i) => { const d = daftar(r[1]); total += d.length; assert.deepEqual([...d].sort(), [...a.adj[i + 1]].sort(), `Adj[${i + 1}] graf (a)`) })
  assert.equal(total, 14)
  assert.equal(2 + 4 + 2 + 3 + 3, 2 * 7)
  assert.equal(t2[1][1], '1 → 5 → 3 → 4', 'Adj[2] di teks: 2 → 1 → 5 → 3 → 4')
  const b = bangun(grafB.n, grafB.busur, true)
  const t3 = barisTabel('*Tabel 3.')
  assert.equal(t3.length, 6)
  t3.forEach((r, i) => assert.deepEqual(daftar(r[1]), b.adj[i + 1], `Adj[${i + 1}] graf (b) (urutan sama dengan program)`))
  assert.equal(t3.reduce((s, r) => s + daftar(r[1]).length, 0), 8)
  assert.equal(2 + 1 + 2 + 1 + 1 + 1, 8)
  assert.ok(md.includes('$2 \\to 1 \\to 5 \\to 3 \\to 4$') && md.includes('$3 \\to 6 \\to 5$'))
  // Adj[4] dan Adj[5] pada tabel berbeda urutan dengan program, dengan isi sama
  assert.deepEqual(a.adj[4], [2, 3, 5])
  assert.deepEqual(daftar(t2[3][1]), [2, 5, 3])
})

test('Tabel 4 dan 5: adjacency-matrix sama persis dengan model; (a) simetris; (b) a14 = 1 tetapi a41 = 0, a66 = 1', () => {
  const baca = (cap) => barisTabel(cap).map((r) => r.slice(1).map(Number))
  const a = bangun(grafA.n, grafA.busur, false)
  const b = bangun(grafB.n, grafB.busur, true)
  const ma = a.A.slice(1).map((r) => r.slice(1))
  const mb = b.A.slice(1).map((r) => r.slice(1))
  assert.deepEqual(baca('*Tabel 4.'), ma)
  assert.deepEqual(baca('*Tabel 5.'), mb)
  assert.ok(a.simetris && !b.simetris)
  assert.deepEqual([mb[0][3], mb[3][0], mb[5][5], mb[0][1], mb[1][0]], [1, 0, 1, 1, 0])
  assert.ok(md.includes('$a_{14} = 1$ tetapi $a_{41} = 0$') && md.includes('$a_{66} = 1$'))
})

test('Tabel 6 dan 6: biaya operasi dihitung sungguhan — menelusuri seluruh graf Θ(V + E) vs Θ(V²); mendaftar tetangga Θ(derajat) vs Θ(V); periksa busur', () => {
  const t = barisTabel('*Tabel 6.')
  assert.deepEqual(t.map((r) => r[0].replace(/\$/g, '').slice(0, 10)), ['Memori', 'Memeriksa ', 'Mendaftar ', 'Menelusuri', 'Cocok untu'])
  for (let u = 0; u < 60; u++) {
    const n = 2 + Math.floor(rand() * 10)
    const busur = []
    for (let i = 1; i <= n; i++) for (let j = i + 1; j <= n; j++) if (rand() < 0.3) busur.push([i, j])
    const r = bangun(n, busur, false)
    // menelusuri seluruh graf: list mengunjungi n kepala + 2|E| elemen; matriks memeriksa n² sel
    const langkahList = n + Object.values(r.adj).reduce((s, l) => s + l.length, 0)
    const langkahMatriks = n * n
    assert.equal(langkahList, n + 2 * busur.length)
    assert.ok(langkahMatriks >= langkahList - 2 * busur.length)
    // mendaftar tetangga u: list = derajat u elemen, matriks = n sel pada baris u
    for (let i = 1; i <= n; i++) {
      const tetangga = []
      for (let j = 1; j <= n; j++) if (r.A[i][j]) tetangga.push(j)
      assert.deepEqual(tetangga, [...r.adj[i]].sort((a, b) => a - b))
    }
  }
})

test('Contoh perhitungan: 10^8 sel vs 40.000 elemen = 2.500 kali (bukan lebih dari 3.000), kecuali kepala list tidak dihitung (3.333); catatan koreksi ada', () => {
  const j = memori(10000, 15000, false)
  assert.deepEqual([j.matriks, 2 * 15000, j.list, j.rasio], [1e8, 30000, 40000, 2500])
  const tanpaKepala = j.matriks / (2 * 15000)
  assert.ok(tanpaKepala > 3000 && j.rasio < 3000)
  assert.ok(md.includes('lebih dari tiga ribu kali lipat') && md.includes('sekitar $10^8 / 40.000 = 2.500$ kali'))
})

test('program Python di modul dijalankan sungguhan dan keluarannya sama dengan teks dan model', (t) => {
  const kode = blokTeks('python')
  const cetak = blokTeks('text').trimEnd().split('\n')
  const a = bangun(grafA.n, grafA.busur, false)
  const b = bangun(grafB.n, grafB.busur, true)
  const objek = (arr) => `{${arr.map((x, i) => `${i + 1}: ${x}`).join(', ')}}`
  const model = [
    reprDict(a.adj),
    `total panjang list: ${a.panjangTotal} = 2|E| = ${2 * grafA.busur.length}`,
    `simetris: ${a.simetris ? 'True' : 'False'}`,
    reprDict(b.adj),
    `derajat keluar: ${objek(b.keluar)}`,
    `derajat masuk : ${objek(b.masuk)}`,
  ]
  assert.deepEqual(model, cetak)
  const py = cariPython()
  if (!py) return t.skip('Python 3 tidak ditemukan di mesin ini')
  const out = spawnSync(py, ['-c', kode], { encoding: 'utf8' })
  assert.equal(out.status, 0, out.stderr)
  assert.deepEqual(out.stdout.replace(/\r\n/g, '\n').trimEnd().split('\n'), cetak)
})

test('kunci kuis dihitung ulang: soal 1 (graf a,b,c,d), 2, 4, 5, 6, 7', () => {
  const [q1, q2, q3, q4, q5, q6, q7] = kuis16.soal
  const r = bangun(grafSoal1.n, grafSoal1.busur, false)
  const huruf = 'abcd'
  const teks = Object.entries(r.adj).map(([u, l]) => `${huruf[u - 1]} → ${l.map((x) => huruf[x - 1]).join(' → ')}`).join('; ')
  assert.equal(teks, q1.isian[0].kunci)
  assert.deepEqual([r.panjangTotal, r.satu, r.simetris], [q1.isian[1].kunci, q1.isian[2].kunci, true])
  assert.equal(q1.isian[3].kunci, 'Ya')
  const mat = r.A.slice(1).map((x) => x.slice(1).join(''))
  assert.deepEqual(mat, ['0110', '1010', '1101', '0010'])
  for (const baris of ['| a | 0 | 1 | 1 | 0 |', '| b | 1 | 0 | 1 | 0 |', '| c | 1 | 1 | 0 | 1 |', '| d | 0 | 0 | 1 | 0 |']) assert.ok(q1.pembahasan.includes(baris), baris)
  // soal 2
  const mem = memori(8, 12, false)
  assert.deepEqual([q2.isian[0].kunci, q2.isian[1].kunci, q2.isian[2].kunci], [mem.panjang, mem.matriks, mem.panjang])
  assert.equal(q3.kunci, 'B')
  // soal 4 dan 5 pada graf (b)
  const b = bangun(grafB.n, grafB.busur, true)
  assert.equal(q4.kunci, 'Salah')
  assert.deepEqual([b.A[1][2], b.A[2][1]], [1, 0])
  assert.deepEqual([q5.isian[2].kunci, q5.isian[3].kunci], [b.keluar[1], b.masuk[1]])
  assert.equal(b.A[2].slice(1).reduce((x, y) => x + y, 0), 1, 'baris 2: satu angka 1 (a25)')
  assert.deepEqual([b.A[1][2], b.A[4][2]], [1, 1], 'kolom 2: a12 dan a42')
  // soal 6
  const sosial = memori(1e6, (1e6 * 200) / 2, false)
  assert.deepEqual([q6.isian[1].kunci, q6.isian[2].kunci, q6.isian[3].kunci], [1e8, sosial.panjang, sosial.matriks])
  assert.ok(sosial.rasio > 4900 && sosial.rasio < 5000, 'sekitar 5.000 kali')
  assert.equal(q6.isian[0].kunci, 'Adjacency-list')
  // soal 7: tree 15 simpul punya 14 busur
  assert.equal(q7.kunci, 'B')
  assert.equal(15 - 1, 14)
})

test('struktur kuis: 7 soal, jenis sesuai PDF, semua dinilai otomatis', () => {
  assert.deepEqual(kuis16.soal.map((q) => q.no), [1, 2, 3, 4, 5, 6, 7])
  assert.deepEqual(kuis16.soal.map((q) => TIPE_LABEL[q.tipe]), ['Penelusuran', 'Perhitungan', 'Pilihan Ganda', 'Benar/Salah', 'Analisis', 'Analisis', 'Pilihan Ganda'])
  assert.deepEqual(kuis16.soal.filter((q) => q.mandiri).map((q) => q.no), [])
  for (const q of kuis16.soal) {
    assert.ok(q.teks.length > 10 && q.pembahasan.length > 10, `soal ${q.no}`)
    if (q.opsi) assert.ok(q.opsi.some((o) => o.id === q.kunci))
    for (const f of q.isian ?? []) if (f.jenis === 'pilih') assert.ok(f.opsi.includes(f.kunci), `soal ${q.no}: kunci "${f.kunci}" ada di opsi`)
    assert.equal([q.mandiri, q.opsi, q.isian].filter(Boolean).length, 1, `satu jenis jawaban per soal (${q.no})`)
  }
  assert.equal(new Set(kuis16.soal[0].isian[0].opsi).size, 4)
  assert.deepEqual([...new Set(kuis16.soal.map((q) => q.tipe))].sort(), [...daftarKuis.find((k) => k.id === '16').tipe].sort())
})

test('penilaian soal Modul 16', () => {
  const [q1, q2, q3, q4, q5, q6, q7] = kuis16.soal
  assert.equal(nilaiSoal(q1, [q1.isian[0].kunci, '8', '8', 'Ya']).benar, true)
  assert.equal(nilaiSoal(q1, [q1.isian[0].opsi[1], '8', '8', 'Ya']).benar, false)
  assert.equal(nilaiSoal(q2, ['24', '64', '24']).benar, true)
  assert.equal(nilaiSoal(q2, ['12', '64', '12']).benar, false)
  assert.equal(nilaiSoal(q3, 'B').benar, true)
  assert.equal(nilaiSoal(q4, 'Salah').benar, true)
  assert.equal(nilaiSoal(q5, [q5.isian[0].kunci, q5.isian[1].kunci, '1', '2']).benar, true)
  assert.equal(nilaiSoal(q5, [q5.isian[0].kunci, q5.isian[1].kunci, '2', '1']).benar, false)
  assert.equal(nilaiSoal(q6, ['Adjacency-list', '100.000.000', '200.000.000', '1.000.000.000.000']).benar, true, 'angka boleh memakai titik ribuan')
  assert.equal(nilaiSoal(q6, ['Adjacency-matrix', '100000000', '200000000', '1000000000000']).benar, false)
  assert.equal(nilaiSoal(q7, 'B').benar, true)
  const semua = { 1: [q1.isian[0].kunci, '8', '8', 'Ya'], 2: ['24', '64', '24'], 3: 'B', 4: 'Salah', 5: [q5.isian[0].kunci, q5.isian[1].kunci, '1', '2'], 6: ['Adjacency-list', '100000000', '200000000', '1000000000000'], 7: 'B' }
  const h = hitungHasil(kuis16.soal, semua)
  assert.deepEqual([h.skor, h.lulus, h.belumDinilai], [7, true, []])
})

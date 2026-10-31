import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { parseModul } from '../lib/modulContent.js'
import { hitungHasil, nilaiSoal, TIPE_LABEL } from '../lib/kuis.js'
import { modulById, neighbors, sections, tabsOf } from '../data/modul.js'
import { algoritma } from '../data/algoritma.js'
import { daftarKuis, kuisById } from '../data/quiz.js'
import { petaBab } from '../data/credit.js'
import { cariPython } from '../test/python.js'
import { kuis02 } from './modul/02.kuis.js'
import { jejakBinarySearch, tumpukan } from './modul/02.hitung.js'
import { pseudo } from './modul/02.pseudo.js'

// Akhir baris dinormalkan: git di Windows bisa mengubah berkas teks menjadi CRLF.
const md = readFileSync(new URL('./modul/02.md', import.meta.url), 'utf8').replace(/\r\n/g, '\n')
const bagian = parseModul(md)
const m = modulById('02')

// ---------------------------------------------------------------- pembanding independen (cara lain: rekursif, bukan iteratif)
const A = [null, 5, 8, 9, 10, 14, 20]
/** Binary Search rekursif; mengembalikan rantai pemanggilan [p, n, mid] dan hasilnya. */
function rekursif(arr, x, p, n, rantai = []) {
  rantai.push({ p, n })
  if (p > n) return { hasil: null, rantai }
  const mid = Math.floor((p + n) / 2)
  rantai[rantai.length - 1].mid = mid
  if (x === arr[mid]) return { hasil: mid, rantai }
  return x > arr[mid] ? rekursif(arr, x, mid + 1, n, rantai) : rekursif(arr, x, p, mid - 1, rantai)
}
const lg = (N) => Math.floor(Math.log2(N)) // aman untuk N di bawah 2^30 pada tes ini
/** Banyak perbandingan terburuk Binary Search pada array 1..N, dihitung dengan mencoba semua kunci (ada dan tidak ada). */
function terburuk(N) {
  const arr = [null, ...Array.from({ length: N }, (_, i) => 2 * (i + 1))] // genap: kunci ganjil pasti tidak ada
  let maksPerb = 0
  let maksDalam = 0
  for (let x = 0; x <= 2 * N + 1; x++) {
    const r = rekursif(arr, x, 1, N)
    maksDalam = Math.max(maksDalam, r.rantai.length)
    maksPerb = Math.max(maksPerb, r.rantai.filter((c) => c.mid !== undefined).length)
  }
  return { maksPerb, maksDalam }
}
const barisTabel = (caption) => {
  const end = md.indexOf(caption)
  assert.ok(end > 0, caption)
  const lines = md.slice(0, end).trimEnd().split('\n')
  const out = []
  for (let i = lines.length - 1; i >= 0 && lines[i].startsWith('|'); i--) out.unshift(lines[i].split('|').slice(1, -1).map((c) => c.trim()))
  return out.slice(2)
}

// ---------------------------------------------------------------- struktur dan metadata
test('struktur: enam bagian sesuai PDF, semua tab terpenuhi, semua penanda punya isi', () => {
  assert.deepEqual(bagian.map((s) => s.id), ['pendahuluan', 'algoritma', 'penelusuran', 'analisis', 'makna', 'kesimpulan', 'referensi'])
  assert.deepEqual(bagian.map((s) => s.judul.match(/^\d+/)?.[0] ?? null), ['1', '2', '3', '4', '5', '6', null])
  for (const id of sections.map((s) => s.id).filter((id) => id !== 'kuis')) assert.ok(bagian.some((s) => s.id === id), id)
  const slots = bagian.flatMap((s) => s.blok.filter((b) => b.type === 'slot'))
  assert.deepEqual(slots.filter((b) => b.name === 'pseudo').map((b) => b.arg).sort(), Object.keys(pseudo).sort(), 'tiap pseudocode dipakai tepat sekali')
  assert.deepEqual(slots.filter((b) => b.name === 'gambar').map((b) => b.arg), ['tumpukan', 'rentang'])
  assert.deepEqual([...md.matchAll(/\*Tabel (\d+)\./g)].map((x) => Number(x[1])), [1, 2, 3, 4, 5])
})

test('metadata sama dengan katalog Modul 00: 12 halaman, 7 soal, prasyarat Modul 01, Bab I, visualizer Binary Search', () => {
  assert.deepEqual([m.no, m.bab, m.halaman, m.soal, m.prasyarat, m.algoritmaId], [2, 'BAB I', 12, 7, [1], 'binary-search'])
  assert.equal(m.soal, kuis02.soal.length)
  assert.equal(m.tujuan.length, 5)
  assert.equal(petaBab[0].modul[1].judul, m.judul)
  assert.ok(algoritma.some((a) => a.id === m.algoritmaId && a.viz && a.modul === 2), 'kartu Binary Search di galeri menaut ke Modul 02')
  assert.deepEqual(tabsOf(m).map((x) => x.tab), ['1 Pendahuluan', '2 Iteratif & Rekursif', '3 Binary Search', '4 Penelusuran', '5 Kecepatan', '6 Kesimpulan', 'Kuis', 'Referensi'])
  assert.deepEqual(neighbors('02'), { prev: modulById('01'), next: null })
  assert.equal(kuisById('02').soal, 7)
  assert.equal(kuisById('02').tingkat, 'easy')
  assert.equal(kuisById('02').judul, kuis02.judul)
})

// ---------------------------------------------------------------- pseudocode
test('pseudocode: jumlah baris sama dengan PDF dan baris yang dirujuk teks (baris 4 dan baris 8 versi iteratif)', () => {
  assert.equal(pseudo.jumlahrek.baris.length, 3)
  assert.equal(pseudo.bsiter.baris.length, 8)
  assert.equal(pseudo.bsrek.baris.length, 8)
  assert.match(pseudo.bsiter.baris[3], /return mid/)
  assert.match(pseudo.bsiter.baris[7], /return NIL/)
  assert.match(pseudo.bsrek.baris[1], /return NIL/)
  assert.match(pseudo.bsrek.baris[4], /return mid/)
  assert.ok(md.includes('(baris 4)') && md.includes('(baris 8)'))
  assert.match(pseudo.jumlahrek.baris[0], /^if n == 0/)
  assert.match(pseudo.jumlahrek.baris[2], /JUMLAH_REKURSIF\(A, n - 1\) \+ A\[n\]/)
})

// ---------------------------------------------------------------- penelusuran
test('Tabel 3 (x = 12) cocok dengan simulasi iteratif dan rekursif: p, n, mid, A[mid]', () => {
  const iter = jejakBinarySearch(A, 12, 1, 6)
  const rek = rekursif(A, 12, 1, 6)
  assert.equal(iter.hasil, null)
  assert.equal(rek.hasil, null)
  assert.deepEqual(iter.putaran.map(({ p, n, mid }) => [p, n, mid]), rek.rantai.filter((c) => c.mid !== undefined).map(({ p, n, mid }) => [p, n, mid]), 'iteratif = rekursif')
  const rows = barisTabel('*Tabel 3.')
  const dariTabel = rows.slice(0, 3).map((r) => [Number(r[1]), Number(r[2]), Number(r[4])])
  assert.deepEqual(dariTabel, iter.putaran.map((r) => [r.p, r.n, r.nilai]).map((_, i) => [iter.putaran[i].p, iter.putaran[i].n, iter.putaran[i].nilai]))
  assert.deepEqual(rows.slice(0, 3).map((r) => r[3].match(/= (\d+)/)[1]).map(Number), iter.putaran.map((r) => r.mid))
  assert.deepEqual(rows[3].slice(1, 3), ['5', '4'], 'baris terakhir: p = 5, n = 4 (rentang kosong)')
  assert.equal(iter.putaran.length, 3, 'tiga perbandingan')
  assert.match(md, /Hanya 3 perbandingan/)
})

test('Tabel 4 (x = 14) dan rantai pemanggilan x = 12 di pseudocode cocok dengan simulasi', () => {
  const r = jejakBinarySearch(A, 14, 1, 6)
  assert.equal(r.hasil, 5)
  assert.deepEqual(r.putaran.map((x) => [x.p, x.n, x.mid, x.nilai]), [[1, 6, 3, 9], [4, 6, 5, 14]])
  const rows = barisTabel('*Tabel 4.')
  assert.deepEqual(rows.map((x) => x.slice(0, 5).map((c) => c.replace(/\$/g, ''))), [['1', '1', '6', '3', '9'], ['2', '4', '6', '5', '14']])
  // rantai x = 12
  const rek = rekursif(A, 12, 1, 6).rantai
  const baris = pseudo.rantai12.baris
  assert.equal(rek.length, 4)
  rek.forEach((c, i) => {
    assert.ok(baris[i].startsWith(`BINARY-SEARCH(A, 12, ${c.p}, ${c.n})`), `panggilan ${i + 1}`)
    if (c.mid !== undefined) assert.ok(baris[i].includes(`mid = ${c.mid}, A[${c.mid}] = ${A[c.mid]}`), `mid panggilan ${i + 1}`)
  })
  assert.ok(baris[3].includes('p > n → return NIL'))
})

test('Gambar 2: rentang tiap putaran untuk x = 12 sama dengan Tabel 3', () => {
  assert.deepEqual(jejakBinarySearch(A, 12, 1, 6).putaran.map((x) => `p=${x.p}, n=${x.n}, mid=${x.mid}`), ['p=1, n=6, mid=3', 'p=4, n=6, mid=5', 'p=4, n=4, mid=4'])
})

test('Gambar 1 dan penjumlahan rekursif: JUMLAH_REKURSIF(A, 3) untuk [20, 35, 15] = 70 lewat 55 dan 20', () => {
  const B = [null, 20, 35, 15]
  const hit = (n) => (n === 0 ? 0 : hit(n - 1) + B[n])
  assert.deepEqual([hit(0), hit(1), hit(2), hit(3)], [0, 20, 55, 70])
  assert.deepEqual(tumpukan.map((t) => t.kembali), ['55 + 15 = 70', '20 + 35 = 55', '0 + 20 = 20', 'kembalikan 0'])
  assert.deepEqual(tumpukan.map((t) => t.panggil), [3, 2, 1, 0].map((n) => `JUMLAH_REKURSIF(A, ${n})`))
  assert.ok(md.includes('$0 + 20 = 20$, $20 + 35 = 55$, $55 + 15 = 70$'))
})

test('program Python di modul dijalankan sungguhan dan keluarannya sama dengan teks yang tercetak', (t) => {
  const kode = /```python\n([\s\S]*?)```/.exec(md)[1]
  const cetak = /```text\n([\s\S]*?)```/.exec(md)[1]
  const py = cariPython()
  if (!py) return t.skip('Python 3 tidak ditemukan di mesin ini')
  const r = spawnSync(py, ['-c', kode], { encoding: 'utf8' })
  assert.equal(r.status, 0, r.stderr)
  assert.equal(r.stdout.trim().replace(/\r/g, ''), cetak.trim())
  // dan sama dengan simulasi JS untuk kelima kunci
  const baris = [12, 14, 5, 20, 1].map((x) => `${x} ${jejakBinarySearch(A, x, 1, 6).hasil ?? 'None'} ${rekursif(A, x, 1, 6).hasil ?? 'None'}`)
  assert.deepEqual(baris, cetak.trim().split('\n'))
})

// ---------------------------------------------------------------- analisis kecepatan
test('Tabel 5 dan rumus ⌊lg N⌋ + 1: nilai pada tabel, N = 6 dan N = 5000, dan batas terburuk dibuktikan dengan mencoba semua kunci', () => {
  const rows = barisTabel('*Tabel 5.')
  const N = rows.map((r) => Number(r[0].replace(/\./g, '')))
  assert.deepEqual(N, [6, 1000, 1000000, 1000000000])
  assert.deepEqual(rows.map((r) => Number(r[2])), N.map((n) => lg(n) + 1))
  assert.deepEqual(rows.map((r) => Number(r[1].replace(/\./g, ''))), N)
  assert.equal(lg(6) + 1, 3)
  assert.equal(Math.log2(6).toFixed(2), '2.58')
  assert.equal(lg(5000) + 1, 13)
  assert.deepEqual([2 ** 12, 2 ** 13], [4096, 8192])
  assert.equal(lg(5000), 12, '2^12 = 4096 ≤ 5000 < 8192 = 2^13')
  // Bukti empiris untuk N = 1..300: perbandingan terburuk persis ⌊lg N⌋ + 1, kedalaman rekursi ≤ ⌊lg N⌋ + 2 dan mencapainya.
  for (let n = 1; n <= 300; n++) {
    const { maksPerb, maksDalam } = terburuk(n)
    assert.equal(maksPerb, lg(n) + 1, `perbandingan terburuk N=${n}`)
    assert.ok(maksDalam <= lg(n) + 2, `kedalaman N=${n}`)
    assert.equal(maksDalam, lg(n) + 2, `kedalaman terburuk tepat ⌊lg N⌋ + 2 untuk N=${n}`)
  }
  // menggandakan ukuran array menambah satu perbandingan
  assert.equal(lg(2000) + 1 - (lg(1000) + 1), 1)
  // lg n: dari 5 ke 25 dikatakan "hanya naik dua kali lipat" (kira-kira); periksa kedua nilai
  assert.ok(Math.log2(25) / Math.log2(5) === 2, 'lg 25 = 2 lg 5')
  assert.match(md, /Menggandakan ukuran array hanya menambah satu perbandingan/)
})

test('kasus terbaik 1 perbandingan; pada array tidak terurut hasilnya bisa salah (Soal 4)', () => {
  const r = jejakBinarySearch(A, 9, 1, 6)
  assert.deepEqual([r.hasil, r.putaran.length], [3, 1])
  const C = [null, 10, 3, 8, 1, 6]
  const s = jejakBinarySearch(C, 3, 1, 5)
  assert.equal(s.hasil, null)
  assert.deepEqual(s.putaran.map((x) => [x.p, x.n, x.mid, x.nilai]), [[1, 5, 3, 8], [1, 2, 1, 10]])
  assert.equal(C.indexOf(3), 2, '3 sebenarnya ada di indeks 2')
})

// ---------------------------------------------------------------- kuis
test('kunci kuis dihitung ulang: soal 2, 3, 4, 5', () => {
  assert.deepEqual(jejakBinarySearch(A, 9, 1, 6).putaran.map((x) => [x.p, x.n, x.mid]), [[1, 6, 3]])
  const rantai = rekursif(A, 21, 1, 6).rantai
  assert.deepEqual(rantai.map((c) => [c.p, c.n]), [[1, 6], [4, 6], [6, 6], [7, 6]])
  assert.deepEqual(rantai.slice(0, 3).map((c) => c.mid), [3, 5, 6])
  assert.equal(rantai.length, 4, 'kedalaman rekursi 4')
  assert.ok(kuis02.soal[2].pembahasan.includes('**4 pemanggilan**'))
  assert.deepEqual(kuis02.soal[4].isian.map((f) => f.kunci), [lg(5000) + 1, 5000])
  assert.ok(kuis02.soal[3].pembahasan.startsWith('**Salah.**'))
  assert.ok(kuis02.soal[5].pembahasan.includes('Fungsi tidak memiliki **kasus dasar**'))
})

test('struktur kuis: 7 soal, jenis sesuai PDF, kunci ada di opsi, satu jenis jawaban per soal', () => {
  assert.deepEqual(kuis02.soal.map((q) => q.no), [1, 2, 3, 4, 5, 6, 7])
  assert.deepEqual(kuis02.soal.map((q) => TIPE_LABEL[q.tipe]), ['Pilihan Ganda', 'Penelusuran', 'Penelusuran', 'Benar/Salah', 'Perhitungan', 'Analisis', 'Pilihan Ganda'])
  assert.deepEqual(kuis02.soal.filter((q) => q.opsi).map((q) => q.kunci), ['B', 'C'])
  for (const q of kuis02.soal) {
    assert.ok(q.teks.length > 10 && q.pembahasan.length > 10, `soal ${q.no}`)
    if (q.opsi) assert.ok(q.opsi.some((o) => o.id === q.kunci), `kunci soal ${q.no}`)
    if (q.mandiri) assert.ok(q.kunciTeks, `kunciTeks soal ${q.no}`)
    assert.equal([q.mandiri, q.opsi, q.isian].filter(Boolean).length, 1, `satu jenis jawaban per soal (${q.no})`)
  }
  assert.deepEqual(kuis02.soal.filter((q) => q.mandiri).map((q) => q.no), [2, 3, 4, 6])
  assert.deepEqual([...new Set(kuis02.soal.map((q) => q.tipe))].sort(), [...daftarKuis.find((k) => k.id === '02').tipe].sort())
  assert.ok(kuis02.soal[5].teks.includes('```pseudo'), 'soal 6 memuat pseudocode FAKTORIAL')
})

test('penilaian soal Modul 02: pilihan, isian angka (13 vs 12 perbandingan), dan hasil lulus pada 70%', () => {
  const [q1, , , , q5, , q7] = kuis02.soal
  assert.equal(nilaiSoal(q1, 'B').benar, true)
  assert.equal(nilaiSoal(q7, 'C').benar, true)
  assert.equal(nilaiSoal(q7, 'B').benar, false)
  assert.equal(nilaiSoal(q5, ['13', '5000']).benar, true)
  assert.equal(nilaiSoal(q5, ['12', '5000']).benar, false, 'lupa perbandingan terakhir (⌊lg N⌋ tanpa +1)')
  assert.equal(nilaiSoal(q5, ['5.000', '13']).benar, false)
  const mandiriOk = (t) => ({ teks: t, sesuai: true })
  const semua = { 1: 'B', 2: mandiriOk('a'), 3: mandiriOk('b'), 4: mandiriOk('c'), 5: ['13', '5000'], 6: mandiriOk('d'), 7: 'C' }
  const h = hitungHasil(kuis02.soal, semua)
  assert.deepEqual([h.skor, h.total, h.lulus], [7, 7, true])
  const lima = hitungHasil(kuis02.soal, { ...semua, 1: 'A', 7: 'A' })
  assert.deepEqual([lima.skor, lima.persen, lima.lulus], [5, 71, true], '5 dari 7 = 71% tetap lulus (batas 70%)')
  const empat = hitungHasil(kuis02.soal, { ...semua, 1: 'A', 7: 'A', 5: ['12', '5000'] })
  assert.deepEqual([empat.skor, empat.persen, empat.lulus], [4, 57, false])
})

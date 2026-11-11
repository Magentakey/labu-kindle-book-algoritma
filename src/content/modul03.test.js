import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { parseModul } from '../lib/modulContent.js'
import { hitungHasil, nilaiSoal, labelSoal, jenisSoal } from '../lib/kuis.js'
import { modulById, neighbors, sections, tabsOf } from '../data/modul.js'
import { daftarKuis, kuisById } from '../data/quiz.js'
import { petaBab } from '../data/credit.js'
import { rand } from '../lib/testRandom.js'
import { cariPython } from '../test/python.js'
import { kuis03 } from './modul/03.kuis.js'
import { pseudo } from './modul/03.pseudo.js'

// Akhir baris dinormalkan: git di Windows bisa mengubah berkas teks menjadi CRLF.
const md = readFileSync(new URL('./modul/03.md', import.meta.url), 'utf8').replace(/\r\n/g, '\n')
const bagian = parseModul(md)
const m = modulById('03')

// ---------------------------------------------------------------- program yang diinstrumentasi: menghitung berapa kali tiap baris pseudocode dijalankan
/** JUMLAH_n_BIL: [baris1..baris4]. Kepala perulangan (baris 2) diperiksa satu kali lebih banyak daripada isinya. */
function hitJumlah(n) {
  const c = [1, 0, 0, 1]
  for (let i = 1; ; i++) {
    c[1]++ // periksa kepala
    if (i > n) break
    c[2]++
  }
  return c
}
/** CARI_BIL_K pada array A dengan kunci k. */
function hitCari(A, k) {
  const c = [0, 0, 0, 0]
  for (let i = 1; ; i++) {
    c[0]++ // kepala for
    if (i > A.length) break
    c[1]++
    if (k === A[i - 1]) {
      c[2]++
      return c // keluar lewat return di baris 3
    }
  }
  c[3]++
  return c
}
/** HITUNG_PASANGAN_SAMA: [baris1..baris6]. */
function hitPasangan(A) {
  const n = A.length
  const c = [1, 0, 0, 0, 0, 1]
  for (let i = 1; ; i++) {
    c[1]++
    if (i > n - 1) break
    for (let j = i + 1; ; j++) {
      c[2]++
      if (j > n) break
      c[3]++
      if (A[i - 1] === A[j - 1]) c[4]++
    }
  }
  return c
}
/** Mengevaluasi sel tabel berbentuk ekspresi n, mis. "$n + 1$", untuk nilai n tertentu (hanya karakter aritmetika yang diizinkan). */
function evalSel(sel, n) {
  const e = sel.replace(/\$/g, '').trim()
  assert.match(e, /^[0-9n+\-*/() ]+$/, `ekspresi tidak dikenal: ${sel}`)
  return Function('n', `return ${e}`)(n)
}
const barisTabel = (caption) => {
  const end = md.indexOf(caption)
  assert.ok(end > 0, caption)
  const lines = md.slice(0, end).trimEnd().split('\n')
  const out = []
  for (let i = lines.length - 1; i >= 0 && lines[i].startsWith('|'); i--) out.unshift(lines[i].split('|').slice(1, -1).map((c) => c.trim()))
  return out.slice(2)
}
const deret = (n) => (n * (n - 1)) / 2

// ---------------------------------------------------------------- struktur dan metadata
test('struktur: enam bagian sesuai PDF, semua tab terpenuhi, penanda pseudocode terpakai tepat sekali', () => {
  assert.deepEqual(bagian.map((s) => s.id), ['pendahuluan', 'algoritma', 'penelusuran', 'analisis', 'makna', 'kesimpulan', 'referensi'])
  assert.deepEqual(bagian.map((s) => s.judul.match(/^\d+/)?.[0] ?? null), ['1', '2', '3', '4', '5', '6', null])
  for (const id of sections.map((s) => s.id).filter((id) => id !== 'kuis')) assert.ok(bagian.some((s) => s.id === id), id)
  const slots = bagian.flatMap((s) => s.blok.filter((b) => b.type === 'slot'))
  assert.deepEqual(slots.map((b) => b.name), ['pseudo', 'pseudo', 'pseudo'])
  assert.deepEqual(slots.map((b) => b.arg).sort(), Object.keys(pseudo).sort())
  assert.deepEqual([...md.matchAll(/\*Tabel (\d+)\./g)].map((x) => Number(x[1])), [1, 2, 3, 4])
})

test('metadata sama dengan katalog Modul 00: 11 halaman, 7 soal, Bab II, prasyarat Modul 01; tetangga 02 dan 04', () => {
  assert.deepEqual([m.no, m.bab, m.halaman, m.soal, m.prasyarat], [3, 'BAB II', 11, 7, [1]])
  assert.equal(m.soal, kuis03.soal.length)
  assert.equal(m.tujuan.length, 4)
  assert.equal(m.algoritmaId, null)
  assert.equal(petaBab[1].modul[0].judul, m.judul)
  assert.deepEqual(tabsOf(m).map((x) => x.tab), ['1 Pendahuluan', '2 Running Time', '3 Kasus', '4 Contoh', '5 Orde', '6 Kesimpulan', 'Kuis', 'Referensi'])
  assert.deepEqual(neighbors('03'), { prev: modulById('02'), next: modulById('04') })
  assert.equal(kuisById('03').soal, 7)
  assert.equal(kuisById('03').judul, kuis03.judul)
})

// ---------------------------------------------------------------- tabel cost dan jumlah operasi
test('pseudocode: jumlah baris sama dengan baris di tabel cost', () => {
  assert.equal(pseudo.jumlah.baris.length, 4)
  assert.equal(pseudo.caribilk.baris.length, 4)
  assert.equal(pseudo.pasangan.baris.length, 6)
  assert.match(pseudo.caribilk.baris[2], /then return i/, 'baris 3 CARI_BIL_K adalah return di dalam if')
  assert.match(pseudo.caribilk.baris[3], /return -1/)
  assert.match(pseudo.pasangan.baris[3], /A\[i\] == A\[j\]/)
})

test('Tabel 2 (JUMLAH_n_BIL): jumlah operasi tiap baris sama dengan hasil menjalankan program untuk n = 0..40', () => {
  const rows = barisTabel('*Tabel 2.')
  assert.deepEqual(rows.map((r) => r[0]), ['1', '2', '3', '4'])
  assert.deepEqual(rows.map((r) => r[1]), ['$c_1$', '$c_2$', '$c_3$', '$c_4$'])
  for (let n = 0; n <= 40; n++) assert.deepEqual(rows.map((r) => evalSel(r[2], n)), hitJumlah(n), `n=${n}`)
})

test('Tabel 3 (CARI_BIL_K): kasus terburuk (k tidak ada) dan terbaik (k = A[1]) cocok dengan program', () => {
  const rows = barisTabel('*Tabel 3.')
  assert.deepEqual(rows.map((r) => r[0]), ['1', '2', '3', '4'])
  for (let n = 1; n <= 40; n++) {
    const A = Array.from({ length: n }, (_, i) => i + 10)
    assert.deepEqual(rows.map((r) => evalSel(r[2], n)), hitCari(A, -1), `terburuk n=${n}`)
    assert.deepEqual(rows.map((r) => evalSel(r[3], n)), hitCari(A, A[0]), `terbaik n=${n}`)
  }
  // kasus rata-rata pada pencarian linear: kira-kira separuh array (bilangan di posisi acak)
  const n = 1000
  const A = Array.from({ length: n }, (_, i) => i)
  const rata = A.reduce((s, k) => s + hitCari(A, k)[1], 0) / n
  assert.equal(rata, (n + 1) / 2)
})

test('Contoh 3 (HITUNG_PASANGAN_SAMA): hitungan tiap baris sama dengan rumus deret untuk n = 1..40; baris 5 antara 0 dan n(n−1)/2', () => {
  for (let n = 1; n <= 40; n++) {
    const beda = Array.from({ length: n }, (_, i) => i)
    const sama = Array.from({ length: n }, () => 7)
    const rumus = [1, n, deret(n) + (n - 1), deret(n), null, 1]
    const b = hitPasangan(beda)
    const s = hitPasangan(sama)
    for (const [baris, hasil] of [['beda', b], ['sama', s]]) {
      assert.deepEqual(hasil.filter((_, i) => i !== 4), rumus.filter((_, i) => i !== 4), `${baris} n=${n}`)
    }
    assert.equal(b[4], 0, `semua berbeda: baris 5 tidak pernah dijalankan (n=${n})`)
    assert.equal(s[4], deret(n), `semua sama: baris 5 sebanyak n(n−1)/2 (n=${n})`)
  }
  assert.match(md, /antara 0 kali \(semua data berbeda\) sampai/)
})

test('rumus deret aritmetika dan koefisien a, b, c kasus terburuk dicocokkan dengan menjumlahkan cost × jumlah operasi secara langsung', () => {
  for (let m2 = 0; m2 <= 60; m2++) {
    let jumlah = 0
    for (let j = 1; j <= m2; j++) jumlah += j
    assert.equal(jumlah, (m2 * (m2 + 1)) / 2)
  }
  for (let n = 1; n <= 30; n++) {
    const c = Array.from({ length: 6 }, () => 1 + Math.floor(rand() * 9)) // cost c1..c6 acak
    const sama = Array.from({ length: n }, () => 7)
    const langsung = hitPasangan(sama).reduce((s, jml, i) => s + c[i] * jml, 0)
    const a = (c[2] + c[3] + c[4]) / 2
    const b = c[1] + (c[2] - c[3] - c[4]) / 2
    const k = c[0] - c[2] + c[5]
    assert.equal(a * n * n + b * n + k, langsung, `n=${n}, cost=${c}`)
  }
  assert.ok(md.includes('a = \\frac{c_3 + c_4 + c_5}{2}') && md.includes('b = c_2 + \\frac{c_3 - c_4 - c_5}{2}') && md.includes('c = c_1 - c_3 + c_6'))
  // Contoh 1 dan 2
  for (let n = 0; n <= 20; n++) {
    const c = Array.from({ length: 4 }, () => 1 + Math.floor(rand() * 9))
    assert.equal(hitJumlah(n).reduce((s, jml, i) => s + c[i] * jml, 0), (c[1] + c[2]) * n + (c[0] + c[1] + c[3]), `JUMLAH n=${n}`)
  }
  for (let n = 1; n <= 20; n++) {
    const c = Array.from({ length: 4 }, () => 1 + Math.floor(rand() * 9))
    const A = Array.from({ length: n }, (_, i) => i)
    assert.equal(hitCari(A, -1).reduce((s, jml, i) => s + c[i] * jml, 0), (c[0] + c[1]) * n + (c[0] + c[3]), `CARI terburuk n=${n}`)
    assert.equal(hitCari(A, A[0]).reduce((s, jml, i) => s + c[i] * jml, 0), c[0] + c[1] + c[2], `CARI terbaik n=${n}`)
  }
})

test('aturan "kepala = isi + 1" untuk for j = 2 to n dan while', () => {
  for (let n = 2; n <= 30; n++) {
    let kepala = 0
    let isi = 0
    for (let j = 2; ; j++) {
      kepala++
      if (j > n) break
      isi++
    }
    assert.deepEqual([isi, kepala], [n - 1, n])
  }
})

test('Tabel 4: kontribusi suku 3n² pada T(n) = 3n² + 100n + 500 sama dengan hitungan dan pembulatan di tabel', () => {
  const rows = barisTabel('*Tabel 4.')
  const angka = (s) => Number(s.replace(/\./g, ''))
  for (const r of rows) {
    const n = angka(r[0].replace(/\$/g, ''))
    assert.deepEqual([angka(r[1]), angka(r[2]), angka(r[3])], [3 * n * n, 100 * n, 500], `n=${n}`)
    const porsi = (3 * n * n) / (3 * n * n + 100 * n + 500)
    assert.equal(`${(porsi * 100).toFixed(1).replace('.', ',')}%`, r[4], `porsi n=${n}`)
  }
  assert.deepEqual(rows.map((r) => r[4]), ['16,7%', '74,1%', '96,8%', '99,7%'])
})

test('program Python di modul dijalankan sungguhan: keluarannya sama dengan teks dan dengan hitungan di JS', (t) => {
  const kode = /```python\n([\s\S]*?)```/.exec(md)[1]
  const cetak = /```text\n([\s\S]*?)```/.exec(md)[1].trim()
  const baris = cetak.split('\n')
  assert.deepEqual(baris, [10, 100, 1000].map((n) => `${n} (-1, ${n}) (0, ${deret(n)}) ${deret(n)}`), 'teks tercetak sesuai rumus n(n−1)/2')
  const py = cariPython()
  if (!py) return t.skip('Python 3 tidak ditemukan di mesin ini')
  const r = spawnSync(py, ['-c', kode], { encoding: 'utf8' })
  assert.equal(r.status, 0, r.stderr)
  assert.equal(r.stdout.replace(/\r\n/g, '\n').trim(), cetak)
  // kenaikan 10x: linier ×10, kuadrat ≈ ×100
  assert.ok(Math.abs(deret(1000) / deret(100) - 100) < 1)
})

// ---------------------------------------------------------------- kuis
test('kunci kuis dihitung ulang: soal 2, 3, 5, 6', () => {
  // soal 2: for j = 3 to n
  for (let n = 3; n <= 30; n++) {
    let kepala = 0
    let isi = 0
    for (let j = 3; ; j++) {
      kepala++
      if (j > n) break
      isi++
    }
    assert.deepEqual([isi, kepala], [n - 2, n - 1], `n=${n}`)
  }
  // soal 3: RATA_RATA = [1, n+1, n, 1, 1]
  for (let n = 1; n <= 20; n++) {
    const c = hitJumlah(n).slice(0, 3)
    assert.deepEqual([c[0], c[1], c[2]], [1, n + 1, n])
  }
  // soal 5: x = x + 1 dijalankan n(n+1)/2 kali
  for (let n = 1; n <= 40; n++) {
    let x = 0
    for (let i = 1; i <= n; i++) for (let j = 1; j <= i; j++) x++
    assert.equal(x, (n * (n + 1)) / 2)
  }
  // soal 6
  const TP = (n) => 50 * n + 1000
  const TQ = (n) => 2 * n * n
  assert.deepEqual([TP(10), TQ(10), TP(100), TQ(100)], [1500, 200, 6000, 20000])
  assert.ok(TQ(10) < TP(10) && TP(100) < TQ(100))
  assert.equal(Math.round(((25 + Math.sqrt(625 + 2000)) / 2) * 10) / 10, 38.1)
  assert.deepEqual([TP(38), TQ(38), TP(39), TQ(39)], [2900, 2888, 2950, 3042])
  const awal = Array.from({ length: 2000 }, (_, i) => i + 1).find((n) => Array.from({ length: 2000 - n + 1 }, (_, k) => n + k).every((v) => TP(v) < TQ(v)))
  assert.equal(awal, 39, 'P selalu lebih cepat mulai n = 39 (sampai 2000)')
  assert.deepEqual(kuis03.soal[5].kunci, ['B', 'C', 'D'])
  assert.ok(kuis03.soal[5].opsi.find((o) => o.id === 'D').teks.includes(`mulai $n = ${awal}$`))
  assert.ok(kuis03.soal[5].opsi.find((o) => o.id === 'E').teks.includes('$n = 38$'), 'distraktor n = 38')
  assert.deepEqual(kuis03.soal[1].kunci, ['A', 'C'])
  assert.deepEqual(kuis03.soal[4].kunci, ['B', 'D'])
  assert.equal(kuis03.soal[2].kunci, 'C')
})

test('struktur kuis: 7 soal pilihan ganda saja; kunci tunggal atau larik, semua id kunci ada di opsi', () => {
  assert.deepEqual(kuis03.soal.map((q) => q.no), [1, 2, 3, 4, 5, 6, 7])
  assert.deepEqual(kuis03.soal.map((q) => jenisSoal(q)), ['satu', 'banyak', 'satu', 'satu', 'banyak', 'banyak', 'satu'])
  assert.deepEqual(kuis03.soal.map((q) => q.kunci), ['B', ['A', 'C'], 'C', 'D', ['B', 'D'], ['B', 'C', 'D'], 'A'])
  for (const q of kuis03.soal) {
    assert.ok(q.teks.length > 10 && q.pembahasan.length > 10, `soal ${q.no}`)
    assert.ok(q.opsi && q.opsi.length >= 4 && q.opsi.length <= 5, `soal ${q.no}: 4–5 opsi`)
    assert.equal(new Set(q.opsi.map((o) => o.id)).size, q.opsi.length, `id opsi unik (soal ${q.no})`)
    for (const k of [].concat(q.kunci)) assert.ok(q.opsi.some((o) => o.id === k), `kunci ${k} soal ${q.no}`)
    assert.ok(!q.tipe && !q.mandiri && !q.isian && !q.kunciTeks, `soal ${q.no} tidak memakai format lama`)
    if (Array.isArray(q.kunci)) {
      assert.ok(q.kunci.length >= 2 && q.kunci.length < q.opsi.length, `soal ${q.no}: banyak jawaban 2..${q.opsi.length - 1}`)
      assert.deepEqual([...q.kunci], [...q.kunci].sort(), `kunci terurut (soal ${q.no})`)
      assert.match(q.teks, new RegExp(`\\*\\*${q.kunci.length === 2 ? 'dua' : 'tiga'}\\*\\*`), `teks soal ${q.no} menyebut jumlah jawaban`)
    }
  }
  for (const no of [3, 5]) assert.ok(kuis03.soal[no - 1].teks.includes('```pseudo'), `soal ${no} memuat potongan pseudocode`)
  assert.deepEqual([...new Set(kuis03.soal.map((q) => jenisSoal(q)))].sort(), ['banyak', 'satu'], 'campuran satu jawaban dan banyak jawaban')
  assert.deepEqual(daftarKuis.find((k) => k.id === '03').tipe, ['pilihan'])
})

test('penilaian soal Modul 03: satu, dua, dan tiga jawaban; hasil lulus pada 70%', () => {
  const [q1, q2, , , , q6, q7] = kuis03.soal
  assert.equal(nilaiSoal(q1, 'B').benar, true)
  assert.equal(nilaiSoal(q7, 'A').benar, true)
  assert.equal(nilaiSoal(q7, 'B').benar, false)
  assert.equal(nilaiSoal(q2, ['A', 'C']).benar, true)
  assert.equal(nilaiSoal(q2, ['A', 'B']).benar, false)
  assert.equal(nilaiSoal(q6, ['B', 'C', 'D']).benar, true)
  assert.equal(nilaiSoal(q6, ['D', 'B', 'C']).benar, true)
  assert.equal(nilaiSoal(q6, ['B', 'C']).benar, false, 'kurang satu pilihan')
  assert.equal(nilaiSoal(q6, ['B', 'C', 'E']).benar, false, '38: Q masih sedikit lebih cepat (2900 vs 2888)')
  assert.equal(labelSoal(q6), 'Pilih 3 jawaban')
  const semua = { 1: 'B', 2: ['A', 'C'], 3: 'C', 4: 'D', 5: ['B', 'D'], 6: ['B', 'C', 'D'], 7: 'A' }
  assert.deepEqual([hitungHasil(kuis03.soal, semua).skor, hitungHasil(kuis03.soal, semua).lulus], [7, true])
  const tiga = hitungHasil(kuis03.soal, { ...semua, 1: 'A', 7: 'B', 6: ['A', 'C'] })
  assert.deepEqual([tiga.skor, tiga.persen, tiga.lulus], [4, 57, false])
})

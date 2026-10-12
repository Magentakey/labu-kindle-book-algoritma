import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { checkMarkdown } from '../lib/checkMarkdown.js'
import { splitContent } from '../lib/splitContent.js'
import { buildToc } from '../lib/tableOfContents.js'
import { visualizers } from '../algorithms/registry.js'
import { recurrenceTreeSteps } from '../algorithms/recurrenceTree.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const md = readFileSync(join(root, 'src/content/materials/recurrence-master.md'), 'utf8')
const meta = JSON.parse(readFileSync(join(root, 'src/content/materials.json'), 'utf8')).find((m) => m.id === 'recurrence-master')
const challenge = JSON.parse(readFileSync(join(root, 'src/content/challenges/recurrence-master.json'), 'utf8'))
const segs = splitContent(md, { hasVisualizer: Boolean(meta.visualizer), hasChallenge: Boolean(meta.challenge) })

/**
 * Pembanding independen. Metode Master untuk f(n) = n^e: bandingkan e dengan log_b a.
 * Mengembalikan kasus dan hasil Θ sebagai { p, logPower }, yaitu Θ(n^p · log^logPower n).
 */
function master(a, b, e) {
  const crit = Math.log(a) / Math.log(b)
  if (Math.abs(e - crit) < 1e-9) return { kasus: 2, p: crit, logPower: 1, crit }
  if (e < crit) return { kasus: 1, p: crit, logPower: 0, crit }
  // Kasus 3 butuh a·f(n/b) = (a / b^e)·f(n) ≤ c·f(n) untuk suatu c < 1.
  const c = a / b ** e
  return { kasus: 3, p: e, logPower: 0, crit, c, regular: c < 1 }
}

/** T(n) = a·T(n/b) + n^e dengan T(n) = 1 untuk n ≤ 1, dihitung per level tanpa rekursi. */
function T(a, b, e, n) {
  let size = n
  let mult = 1
  let total = 0
  while (size > 1 + 1e-9) {
    total += mult * size ** e
    mult *= a
    size /= b
  }
  return total + mult
}

/** Rasio T(n) / (n^p · log2(n)^logPower) di dua n besar: sebuah batas Θ benar bila rasionya mendatar. */
function ratioDrift(a, b, e, p, logPower, n1, n2) {
  const r = (n) => T(a, b, e, n) / (n ** p * Math.log2(n) ** logPower)
  return r(n2) / r(n1)
}

test('materi 7 bersih dari error dan saran', () => {
  assert.deepEqual(checkMarkdown(md), [])
})

test('materi 7 memakai komponen yang sama dengan materi 1 sampai 6', () => {
  const types = segs.map((s) => s.type)
  for (const t of ['steps', 'quiz', 'reveal', 'visualizer', 'challenge']) assert.ok(types.includes(t), `belum ada komponen ${t}`)
  assert.equal(types.at(-1), 'challenge', 'soal challenge tetap paling akhir')
  assert.equal(meta.visualizer, 'recurrenceTree')
  const steps = segs.filter((s) => s.type === 'steps')
  assert.deepEqual(steps.map((s) => s.items.length), [4, 4, 4, 5], 'langkah umum, kasus 1, kasus 2, kasus 3')
  assert.equal(segs.filter((s) => s.type === 'quiz').length, 6, 'kuis di bagian A sampai F')
  assert.equal(segs.filter((s) => s.type === 'reveal').length, 4, 'syarat tambahan, dua penyelesaian soal, dan catatan')
  assert.match(segs[types.indexOf('visualizer') + 1].text, /^## H\. Rangkuman/, 'teks sesudah penanda diawali judul ##')
})

test('daftar isi sidebar materi 7', () => {
  const items = buildToc(segs, { visualizers: [{ id: 'recurrenceTree' }] })
  assert.deepEqual(items.filter((i) => i.level === 2).map((i) => i.text), [
    'A. Fungsi Running Time Berbentuk Recurrence',
    'B. Metode Master',
    'C. Kasus 1: f(n) Lebih Kecil dari g(n)',
    'D. Kasus 2: f(n) Sama dengan g(n)',
    'E. Kasus 3: f(n) Lebih Besar dari g(n)',
    'F. Contoh Soal',
    'G. Mencoba Visualisasi Pohon Rekursi',
    'Visualisasi',
    'H. Rangkuman',
    'Soal Challenge',
  ])
  assert.deepEqual(items.filter((i) => i.level === 3).map((i) => i.text), [
    'Contoh Kasus 1: T(n) = 2T(n/2) + √n',
    'Contoh Kasus 2: T(n) = 4T(n/2) + n²',
    'Contoh Kasus 3: T(n) = T(3n/5) + n',
  ])
})

// Semua recurrence yang diselesaikan di teks (tiga contoh, dua soal dokumen, contoh Merge Sort, dan jawaban kuis).
// e adalah pangkat n pada f(n). Hasil yang diharapkan ditulis persis seperti di teks.
const CASES = [
  { text: 'T(n) = 2T(n/2) + √n', a: 2, b: 2, e: 0.5, kasus: 1, hasil: 'Θ(n)' },
  { text: 'T(n) = 4T(n/2) + n²', a: 4, b: 2, e: 2, kasus: 2, hasil: 'Θ(n² · log n)' },
  { text: 'T(n) = T(3n/5) + n', a: 1, b: 5 / 3, e: 1, kasus: 3, hasil: 'Θ(n)' },
  { text: 'T(n) = 9T(n/3) + n', a: 9, b: 3, e: 1, kasus: 1, hasil: 'Θ(n²)' },
  { text: 'T(n) = 5T(n/2) + n³', a: 5, b: 2, e: 3, kasus: 3, hasil: 'Θ(n³)' },
  { text: 'T(n) = 2T(n/2) + Θ(n)', a: 2, b: 2, e: 1, kasus: 2, hasil: 'Θ(n log n)' },
  { text: 'T(n) = 8T(n/2) + n²', a: 8, b: 2, e: 2, kasus: 1, hasil: 'Θ(n³)' },
  { text: 'T(n) = 3T(n/3) + n', a: 3, b: 3, e: 1, kasus: 2, hasil: 'Θ(n log n)' },
  { text: 'T(n) = T(n/2) + n', a: 1, b: 2, e: 1, kasus: 3, hasil: 'Θ(n)' },
  { text: 'T(n) = 3T(n/2) + n²', a: 3, b: 2, e: 2, kasus: 3, hasil: 'Θ(n²)' },
  { text: 'T(n) = 16T(n/4) + n', a: 16, b: 4, e: 1, kasus: 1, hasil: 'Θ(n²)' },
  { text: 'T(n) = 2T(n/2) + n³', a: 2, b: 2, e: 3, kasus: 3, hasil: 'Θ(n³)' },
]

test('kasus dan hasil tiap recurrence di teks sama dengan perhitungan Metode Master independen', () => {
  for (const c of CASES) {
    assert.ok(md.includes(c.text), `teks memuat ${c.text}`)
    assert.ok(md.includes(c.hasil), `teks memuat hasil ${c.hasil}`)
    const r = master(c.a, c.b, c.e)
    assert.equal(r.kasus, c.kasus, c.text)
    if (r.kasus === 3) assert.ok(r.regular, `${c.text}: syarat tambahan terpenuhi`)
  }
})

test('hasil Θ di teks benar secara numerik: rasio T(n) terhadap hasil mendatar, sedangkan dua kasus lain tidak', () => {
  for (const c of CASES) {
    const r = master(c.a, c.b, c.e)
    // n pangkat b supaya jumlah level tepat. Untuk b = 5/3 (akar dominan), n bebas karena daun tidak mendominasi.
    const [n1, n2] = Number.isInteger(c.b) ? [c.b ** (c.b === 2 ? 25 : 14), c.b ** (c.b === 2 ? 50 : 28)] : [1e6, 1e12]
    const drift = ratioDrift(c.a, c.b, c.e, r.p, r.logPower, n1, n2)
    // Ada tiga kandidat: ketiganya dibandingkan, dan hanya yang dinyatakan Master yang mendatar.
    // Kasus 2 punya suku tambahan 1/log n yang turun lambat, jadi toleransinya lebih longgar.
    assert.ok(Math.abs(drift - 1) < (r.kasus === 2 ? 0.1 : 0.01), `${c.text}: rasio berubah ${drift}`)
    const salah = [
      { p: r.crit, logPower: 0 },
      { p: r.crit, logPower: 1 },
      { p: c.e, logPower: 0 },
    ].filter((x) => !(Math.abs(x.p - r.p) < 1e-9 && x.logPower === r.logPower))
    for (const w of salah) {
      const d = ratioDrift(c.a, c.b, c.e, w.p, w.logPower, n1, n2)
      assert.ok(Math.abs(d - 1) > 0.2, `${c.text}: kandidat salah n^${w.p.toFixed(2)}·log^${w.logPower} ikut mendatar (${d})`)
    }
  }
})

test('angka di teks: log, rentang ε, dan konstanta c pada syarat tambahan', () => {
  // log_b a yang disebut di teks
  const lg = (a, b) => Math.log(a) / Math.log(b)
  assert.ok(Math.abs(lg(2, 2) - 1) < 1e-12 && Math.abs(lg(4, 2) - 2) < 1e-12 && Math.abs(lg(9, 3) - 2) < 1e-12)
  assert.ok(Math.abs(lg(8, 2) - 3) < 1e-12 && Math.abs(lg(16, 4) - 2) < 1e-12 && Math.abs(lg(3, 3) - 1) < 1e-12)
  assert.equal(lg(1, 5 / 3), 0)
  assert.equal(lg(1, 2), 0)
  assert.equal(lg(5, 2).toFixed(2), '2.32')
  assert.equal(lg(3, 2).toFixed(2), '1.58')
  assert.ok(md.includes('n^2,32') && md.includes('≈ 1,58'))
  // ε yang ditulis di teks harus benar-benar memenuhi pertidaksamaan pangkat
  const eps = [
    { f: 0.5, g: 1, sign: -1, max: 0.5, text: '0 < ε ≤ 1/2' }, // O(n^(1 − ε)): 1/2 ≤ 1 − ε
    { f: 1, g: 2, sign: -1, max: 1, text: '0 < ε ≤ 1' }, // soal 1: 1 ≤ 2 − ε
    { f: 1, g: 0, sign: 1, max: 1, text: '0 < ε ≤ 1' }, // Ω(n^(0 + ε)): 1 ≥ ε
    { f: 3, g: lg(5, 2), sign: 1, max: 0.67, text: '0 < ε ≤ 0,67' }, // soal 2: 3 ≥ 2,32 + ε
  ]
  for (const x of eps) {
    assert.ok(md.includes(x.text), x.text)
    const ok = (e) => (x.sign < 0 ? x.f <= x.g - e + 1e-12 : x.f >= x.g + e - 1e-12)
    assert.ok(ok(x.max), `${x.text}: batas atas ε harus memenuhi`)
    assert.ok(ok(1e-6), `${x.text}: ε kecil memenuhi`)
  }
  // dokumen menulis 0 < ε < 0,68 untuk soal 2, tetapi ε = 0,679 melanggar: 2,3219 + 0,679 > 3. Teks memakai 0,67.
  assert.ok(lg(5, 2) + 0.679 > 3)
  assert.ok(!md.includes('0,68'))
  // syarat tambahan kasus 3: a·f(n/b) = c·f(n)
  const reg = (a, b, e) => a / b ** e
  assert.ok(Math.abs(reg(1, 5 / 3, 1) - 3 / 5) < 1e-12)
  assert.ok(Math.abs(reg(5, 2, 3) - 5 / 8) < 1e-12)
  assert.ok(Math.abs(reg(1, 2, 1) - 1 / 2) < 1e-12)
  assert.ok(Math.abs(reg(3, 2, 2) - 3 / 4) < 1e-12)
  assert.ok(Math.abs(reg(2, 2, 3) - 1 / 4) < 1e-12)
  for (const s of ['c = 3/5', 'c = 5/8', 'c = 1/2', 'c = 3/4', 'c = 1/4', '(3/5)·n', '(5/8)·n³', '(1/4)·n³', '(3/4)·n²']) assert.ok(md.includes(s), s)
})

test('contoh di luar tiga kasus: T(n) = 2T(n/2) + n log n, rasio f(n)/g(n) = log n tidak terbatas tetapi lebih kecil dari n^ε', () => {
  // Dengan n = 2^m: log₂ n = m, dan n^ε = 2^(ε·m). Bekerja pada m supaya tidak melampaui batas bilangan.
  // Kasus 2 gagal: rasio f(n)/g(n) = m tidak terbatas oleh konstanta.
  const ratio = (m) => m // f(n)/g(n) = (n·log₂ n)/n = log₂ n = m
  assert.ok(ratio(1000) > 10 * ratio(60) / 2 && ratio(60) > ratio(30))
  // Kasus 3 gagal: untuk ε berapa pun, rasio itu akhirnya lebih kecil dari n^ε, jadi f(n) bukan Ω(n^(1 + ε)).
  for (const eps of [0.5, 0.1, 0.01, 0.001]) {
    const m = Math.ceil(2 / eps) * 200 // cukup besar sampai 2^(ε·m) melampaui m
    assert.ok(2 ** (eps * m) > m, `ε = ${eps}: n^ε melampaui log n pada m = ${m}`)
  }
  assert.ok(md.includes('T(n) = 2T(n/2) + n log n'))
})

test('contoh siap pakai visualisasi: kasus, biaya terbesar, dan catatan langkah akhir sesuai tabel di teks', () => {
  const presets = visualizers.recurrenceTree.presets
  const expected = [
    { label: 'Merge sort: T(n) = 2T(n/2) + n', kasus: 2, tren: 'sama', note: /kasus 2/ },
    { label: 'Binary search: T(n) = T(n/2) + 1', kasus: 2, tren: 'sama', note: /kasus 2/ },
    { label: 'Daun dominan: T(n) = 3T(n/2) + n', kasus: 1, tren: 'naik', note: /kasus 1/ },
    { label: 'Akar dominan: T(n) = 2T(n/2) + n²', kasus: 3, tren: 'turun', note: /kasus 3/ },
  ]
  assert.equal(presets.length, expected.length)
  for (const x of expected) {
    const p = presets.find((q) => q.label === x.label)
    assert.ok(p, x.label)
    assert.ok(md.includes(x.label), `teks memuat ${x.label}`)
    const { a, b, c, k } = p.value
    assert.equal(master(a, b, c).kasus, x.kasus, x.label)
    const steps = recurrenceTreeSteps({ a, b, c, k })
    const rows = steps.at(-1).view.panels[0].rows.filter((r) => r[0] !== 'Total').map((r) => Number(r[4]))
    const sama = rows.every((v) => v === rows[0])
    const naik = rows.every((v, i) => i === 0 || v > rows[i - 1])
    const turun = rows.every((v, i) => i === 0 || v < rows[i - 1])
    assert.equal({ sama, naik, turun }[x.tren], true, `${x.label}: biaya per level ${rows}`)
    assert.match(steps.at(-1).note, x.note)
  }
  // Batas isian yang disebut di teks
  assert.deepEqual(visualizers.recurrenceTree.parseInput('3, 4, 2, 3').ok, true)
  assert.ok(md.includes('panel "Ubah masukan"'))
  for (const s of ['a dari 1 sampai 3', 'b dari 2 sampai 4', 'c dari 0 sampai 2', 'k dari 1 sampai 3']) assert.ok(md.includes(s), s)
})

test('soal challenge: T(n) = 2T(n/2) + n sama dengan n·log₂ n + n, dan teks menyebut hubungannya dengan kasus 2', () => {
  for (const tc of challenge.testCases) {
    const n = tc.input[0]
    assert.equal(tc.expected, n * Math.log2(n) + n, `n = ${n}`)
    assert.equal(tc.expected, T(2, 2, 1, n), `rekursi level demi level, n = ${n}`)
  }
  assert.equal(master(2, 2, 1).kasus, 2)
  assert.ok(md.includes('Soal challenge di akhir menghitung T(n) = 2T(n/2) + n'))
})

test('tabel tiga kasus dan rangkuman memuat rumus yang sama dengan definisi', () => {
  for (const s of ['n^(log_b a − ε)', 'n^(log_b a + ε)', 'Θ(n^(log_b a) · log n)', 'a·f(n/b) ≤ c·f(n)', 'a ≥ 1', 'b > 1', 'g(n) = n^(log_b a)']) assert.ok(md.includes(s), s)
  assert.equal(md.match(/^## [A-H]\. /gm).length, 8, 'bagian A sampai H berurutan')
  assert.deepEqual(md.match(/^## ([A-H])\. /gm).map((s) => s[3]), ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'])
})

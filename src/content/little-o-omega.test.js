import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { checkMarkdown } from '../lib/checkMarkdown.js'
import { splitContent } from '../lib/splitContent.js'
import { buildToc } from '../lib/tableOfContents.js'
import { analyzeLimit } from '../lib/limitCheck.js'
import { C_VALUES, littleAnalysis, littleThreshold } from '../lib/asymptotic.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const md = readFileSync(join(root, 'src/content/materials/little-o-omega.md'), 'utf8')
const meta = JSON.parse(readFileSync(join(root, 'src/content/materials.json'), 'utf8')).find((m) => m.id === 'little-o-omega')
const segs = splitContent(md, { hasVisualizer: Boolean(meta.visualizer), hasChallenge: Boolean(meta.challenge) })

// Pembanding independen: n bulat terkecil sehingga ok(n') benar untuk semua n' ≥ n sampai batas.
function n0Of(ok, limit = 5000) {
  let lastBad = 0
  for (let n = 1; n <= limit; n++) if (!ok(n)) lastBad = n
  return lastBad >= limit - 5 ? -1 : lastBad + 1
}

test('materi 5 bersih dari error dan saran', () => {
  assert.deepEqual(checkMarkdown(md), [])
})

test('materi 5 memakai komponen yang sama dengan materi 1 sampai 4', () => {
  const types = segs.map((s) => s.type)
  for (const t of ['steps', 'quiz', 'reveal', 'limit', 'visualizer', 'challenge']) assert.ok(types.includes(t), `belum ada komponen ${t}`)
  assert.equal(types.at(-1), 'challenge', 'soal challenge tetap paling akhir')
  assert.equal(meta.visualizer, 'littlePlot')
  const steps = segs.filter((s) => s.type === 'steps')
  assert.equal(steps.length, 2, 'satu pembuktian untuk o dan satu untuk ω')
  steps.forEach((s) => assert.equal(s.items.length, 4, 'empat slide tiap pembuktian'))
  assert.equal(segs.filter((s) => s.type === 'quiz').length, 3, 'kuis di bagian A, B, dan C')
  assert.equal(segs.filter((s) => s.type === 'reveal').length, 2, 'penjelasan 2n² ≠ o(n²) dan n²/2 ≠ ω(n²)')
  const limits = segs.filter((s) => s.type === 'limit')
  assert.deepEqual(
    limits.map((l) => [l.f, l.g, l.c]),
    [
      ['2n', 'n^2', '1/2'],
      ['n^2/2', 'n', '10'],
      ['3n^2 + 5', '7n^2', '4'],
    ],
    'tiga pemeriksa, isian awalnya sama dengan contoh di teks',
  )
  assert.deepEqual(
    limits.map((l) => {
      const a = analyzeLimit(l)
      return [a.kind, a.kind === 'omega' ? a.omega.n0 : a.o.n0]
    }),
    [['o', 5], ['omega', 21], ['theta', 1]],
  )
  assert.match(segs[types.indexOf('visualizer') + 1].text, /^## E\. Rangkuman/, 'teks sesudah penanda diawali judul ##')
})

test('daftar isi sidebar materi 5', () => {
  const items = buildToc(segs, { visualizers: [{ id: 'littlePlot' }] })
  assert.deepEqual(items.filter((i) => i.level === 2).map((i) => i.text), [
    'A. Pengantar: Batas yang Ketat dan yang Tidak Ketat',
    'B. Notasi Little-Oh (o)',
    'C. Notasi Little-Omega (ω)',
    'D. Mencoba Grafik Rasio',
    'Visualisasi',
    'E. Rangkuman',
    'Soal Challenge',
  ])
  assert.deepEqual(items.filter((i) => i.level === 3).map((i) => i.text), [
    'Contoh o: 2n = o(n²)',
    'Hubungan Limit dengan Definisi: Mencari n₀',
    'Contoh ω: n²/2 = ω(n)',
    'Hubungan Limit dengan Definisi: Mencari n₀',
    'Klasifikasikan Sendiri',
  ])
})

test('tabel n₀ untuk 2n = o(n²): 2n < c·n² dicek dengan brute force', () => {
  const want = { 4: 1, 2: 2, 1: 3, 0.5: 5, 0.1: 21 }
  for (const [c, n0] of Object.entries(want)) {
    assert.equal(n0Of((n) => 2 * n < Number(c) * n * n), n0, `c = ${c}`)
    // baris tabel di materi
    const row = md.split('\n').find((l) => l.startsWith(`| ${String(c).replace('.', ',')} | $n > `))
    assert.ok(row?.endsWith(`| ${n0} |`), `baris c = ${c}: ${row}`)
  }
})

test('tabel n₀ untuk n²/2 = ω(n): c·n < n²/2 dicek dengan brute force', () => {
  const want = { 0.5: 2, 1: 3, 10: 21, 100: 201 }
  for (const [c, n0] of Object.entries(want)) {
    assert.equal(n0Of((n) => Number(c) * n < (n * n) / 2), n0, `c = ${c}`)
  }
  assert.ok(md.includes('| 100 | $n > 200$ | 201 |'))
})

test('2n² ≠ o(n²) dan n²/2 ≠ ω(n²): c = 1 tidak pernah terpenuhi, tetapi Big-Oh dengan c = 2 dan Ω dengan c = 1/2 terpenuhi', () => {
  for (let n = 1; n <= 2000; n++) {
    assert.ok(!(2 * n * n < 1 * n * n), `2n² < n² pada n = ${n}`)
    assert.ok(!(1 * n * n < (n * n) / 2), `n² < n²/2 pada n = ${n}`)
    assert.ok(2 * n * n <= 2 * n * n, 'O dengan c = 2')
    assert.ok((n * n) / 2 >= 0.5 * n * n, 'Ω dengan c = 1/2')
  }
  // 2n² = O(n²) dengan c = 2 TIDAK memenuhi o: c = 2 pun gagal (2n² < 2n² salah)
  assert.ok(!(2 * 4 * 4 < 2 * 4 * 4))
})

test('nilai limit di materi: 2n/n² → 0, (n²/2)/n → ∞, 2n²/n² = 2, (n²/2)/n² = 1/2', () => {
  assert.ok(2 * 1e9 / (1e9 * 1e9) < 1e-8)
  assert.ok(1e9 ** 2 / 2 / 1e9 > 1e8)
  assert.equal((2 * 1e6 * 1e6) / (1e6 * 1e6), 2)
  assert.equal(1e6 ** 2 / 2 / 1e6 ** 2, 0.5)
})

test('klaim di bagian grafik cocok dengan visualizer littlePlot', () => {
  assert.equal(littleAnalysis('n', 'n^2').kind, 'o')
  assert.equal(littleAnalysis('n^2', 'n').kind, 'omega')
  assert.equal(littleAnalysis('n^2', 'n^2').kind, 'theta')
  // n₀ bergeser ke kanan saat c mengecil (o) dan saat c membesar (ω)
  const o = C_VALUES.filter((c) => c < 1).map((c) => littleThreshold('n', 'n^2', c).n0)
  for (let i = 1; i < o.length; i++) assert.ok(o[i - 1] >= o[i], `o: ${o}`)
  const w = C_VALUES.filter((c) => c > 1).map((c) => littleThreshold('n^2', 'n', c).n0)
  for (let i = 1; i < w.length; i++) assert.ok(w[i - 1] <= w[i], `ω: ${w}`)
  // n melawan n log n dengan c = 0,05 butuh n > 2^20, di luar rentang gambar (n ≤ 100)
  assert.equal(littleThreshold('n', 'n log n', 0.05).n0, -1)
  assert.equal(littleAnalysis('n', 'n log n').kind, 'o')
})

test('klaim di kalimat pengantar pemeriksa cocok dengan hasil hitung', () => {
  const run = (f, g, c) => analyzeLimit({ f, g, c })
  assert.equal(run('2n', 'n^2', '0,1').o.n0, 21)
  const t1 = run('2n^2', 'n^2', '1')
  assert.equal(t1.kind, 'theta')
  assert.equal(t1.limitText, '2')
  assert.equal(t1.o.status, 'never')
  assert.equal(run('n^2/2', 'n', '100').omega.n0, 201)
  const t2 = run('n^2/2', 'n^2', '1')
  assert.equal(t2.limitText.startsWith('1/2'), true)
  assert.equal(t2.omega.status, 'never')
  const t3 = (c) => run('3n^2 + 5', '7n^2', c)
  assert.equal(t3('4').o.n0, 1)
  assert.equal(t3('1/2').o.n0, 4)
  assert.equal(t3('1/10').o.status, 'never')
  assert.equal(t3('4').limitText.startsWith('3/7'), true)
  for (const s of ['$n_0$ bergeser menjadi 21', '$n_0$ bergeser menjadi 201', 'sejak $n_0 = 4$', 'sejak $n_0 = 1$']) assert.ok(md.includes(s), s)
})

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { checkMarkdown } from '../lib/checkMarkdown.js'
import { splitContent } from '../lib/splitContent.js'
import { GROWTH, formatGrowth } from '../lib/growth.js'
import { ratioValue } from '../lib/ratio.js'
import { buildToc } from '../lib/tableOfContents.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const md = readFileSync(join(root, 'src/content/materials/pertumbuhan-fungsi.md'), 'utf8')
const meta = JSON.parse(readFileSync(join(root, 'src/content/materials.json'), 'utf8')).find((m) => m.id === 'pertumbuhan-fungsi')
const segs = splitContent(md, { hasVisualizer: Boolean(meta.visualizer), hasChallenge: Boolean(meta.challenge) })

test('materi 3 bersih dari error dan saran', () => {
  assert.deepEqual(checkMarkdown(md), [])
})

test('materi 3 memakai komponen yang sama dengan materi 1 dan komponen rasio baru', () => {
  const types = segs.map((s) => s.type)
  for (const t of ['steps', 'quiz', 'reveal', 'growth', 'ratio', 'visualizer', 'challenge']) assert.ok(types.includes(t), `belum ada komponen ${t}`)
  assert.equal(types.at(-1), 'challenge', 'soal challenge tetap paling akhir')
  assert.equal(meta.visualizer, 'growthPlot')
  const steps = segs.find((s) => s.type === 'steps')
  assert.equal(steps.items.length, 8, 'delapan bentuk fungsi di dokumen')
  assert.equal(segs.filter((s) => s.type === 'quiz').length, 3, 'kuis di bagian A, B, dan C')
  assert.equal(segs.filter((s) => s.type === 'reveal').length, 2, 'jawaban a dan b contoh soal')
  const ratios = segs.filter((s) => s.type === 'ratio')
  assert.deepEqual(ratios[0], { type: 'ratio', keys: null, n1: 5, n2: 25 })
  assert.deepEqual(ratios[1], { type: 'ratio', keys: ['n log n', 'n^2'], n1: 4, n2: 1024 })
  const order = segs.map((s) => s.type)
  assert.match(segs[order.indexOf('visualizer') + 1].text, /^## E\. Rangkuman/, 'teks sesudah penanda diawali judul ##')
})

test('daftar isi sidebar materi 3: bagian A sampai E, Visualisasi, dan Soal Challenge', () => {
  const items = buildToc(segs, { visualizers: [{ id: 'growthPlot' }] })
  const main = items.filter((i) => i.level === 2).map((i) => i.text)
  assert.deepEqual(main, [
    'A. Pertumbuhan Fungsi Running Time',
    'B. Rasio Kenaikan Fungsi',
    'C. Contoh Soal: Memilih Algoritma atau Komputer yang Lebih Cepat',
    'D. Grafik Pertumbuhan Fungsi',
    'Visualisasi',
    'E. Rangkuman',
    'Soal Challenge',
  ])
  assert.deepEqual(items.filter((i) => i.level === 3).map((i) => i.text), [
    'Bentuk-Bentuk Umum Fungsi Running Time',
    'Penurunan Rasio untuk n = 5 menjadi n = 25',
    'Rangkuman Rasio',
    'Coba Hitung Sendiri',
  ])
})

test('angka di rangkuman rasio cocok dengan perhitungan', () => {
  const want = [1, 2, 5, 10, 25, 125]
  const keys = ['1', 'log n', 'n', 'n log n', 'n^2', 'n^3']
  keys.forEach((k, i) => assert.ok(Math.abs(ratioValue(k, 5, 25) - want[i]) < 1e-9, k))
  const row = (label) => md.split('\n').find((l) => l.startsWith(`| ${label} |`))
  assert.match(row('$c_7 2^n$'), new RegExp(`\\| ${formatGrowth(ratioValue('2^n', 5, 25)).replace(/\./g, '\\.')} \\|$`))
  assert.match(row('$c_8 n!$'), /1\{,\}29 \\times 10\^\{23\}/)
  assert.equal(formatGrowth(ratioValue('n!', 5, 25)), '1,29 × 10²³')
})

test('jawaban contoh soal di materi cocok dengan perhitungan', () => {
  assert.ok(Math.abs(ratioValue('n log n', 4, 1024) - 1280) < 1e-9)
  assert.equal(ratioValue('n^2', 4, 1024), 65536)
  assert.ok(md.includes('$1280\\,T$ detik') && md.includes('$65536\\,T$ detik'))
  assert.ok(md.includes('3276{,}8\\,T') && 65536 / 20 === 3276.8)
  assert.ok(md.includes('32768\\,T') && 65536 / 2 === 32768)
})

test('klaim di bagian grafik cocok dengan n² dan 2ⁿ (sama dengan soal challenge: n = 5)', () => {
  const f2 = GROWTH['n^2'].f
  const g = GROWTH['2^n'].f
  assert.ok(g(1) > f2(1))
  assert.equal(g(2), f2(2))
  assert.ok(g(3) < f2(3))
  assert.equal(g(4), f2(4))
  for (let n = 5; n <= 100; n++) assert.ok(g(n) > f2(n), `2^${n} > ${n}^2`)
})

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { checkMarkdown } from '../lib/checkMarkdown.js'
import { splitContent } from '../lib/splitContent.js'
import { buildToc } from '../lib/tableOfContents.js'
import { boundAnalysis } from '../lib/asymptotic.js'
import { analyzeBound } from '../lib/boundCheck.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const md = readFileSync(join(root, 'src/content/materials/notasi-asimtotik.md'), 'utf8')
const meta = JSON.parse(readFileSync(join(root, 'src/content/materials.json'), 'utf8')).find((m) => m.id === 'notasi-asimtotik')
const segs = splitContent(md, { hasVisualizer: Boolean(meta.visualizer), hasChallenge: Boolean(meta.challenge) })

// Pembanding independen: n terkecil sehingga pertaksamaan berlaku untuk semua n sesudahnya (diperiksa sampai 1000).
function n0Of(ok, limit = 1000) {
  let lastBad = 0
  for (let n = 1; n <= limit; n++) if (!ok(n)) lastBad = n
  return lastBad === limit ? -1 : lastBad + 1
}

test('materi 4 bersih dari error dan saran', () => {
  assert.deepEqual(checkMarkdown(md), [])
})

test('materi 4 memakai komponen yang sama dengan materi 1 sampai 3', () => {
  const types = segs.map((s) => s.type)
  for (const t of ['steps', 'quiz', 'bound', 'visualizer', 'challenge']) assert.ok(types.includes(t), `belum ada komponen ${t}`)
  assert.equal(types.at(-1), 'challenge', 'soal challenge tetap paling akhir')
  assert.equal(meta.visualizer, 'boundPlot')
  const steps = segs.filter((s) => s.type === 'steps')
  assert.equal(steps.length, 3, 'satu pembuktian untuk Θ, O, dan Ω')
  steps.forEach((s) => assert.equal(s.items.length, 4, 'empat slide tiap pembuktian'))
  assert.equal(segs.filter((s) => s.type === 'quiz').length, 4, 'kuis di bagian A sampai D')
  const bounds = segs.filter((s) => s.type === 'bound')
  assert.deepEqual(
    bounds.map((b) => [b.notation, b.coefs, b.g, b.consts]),
    [
      ['Theta', ['2', '-3', '1'], 'n^2', ['3/4', '2']],
      ['O', ['1/2', '-3', '0'], 'n^2', ['1/2']],
      ['Omega', ['0', '10', '-20'], 'n', ['10/3']],
    ],
    'tiga pemeriksa, isian awalnya sama dengan contoh di dokumen',
  )
  // n₀ hasil pemeriksa untuk isian awal sama dengan n₀ di dokumen: 2, 6, 3
  assert.deepEqual(bounds.map((b) => analyzeBound(b).n0), [2, 6, 3])
  const order = types
  assert.match(segs[order.indexOf('visualizer') + 1].text, /^## F\. Rangkuman/, 'teks sesudah penanda diawali judul ##')
})

test('daftar isi sidebar materi 4', () => {
  const items = buildToc(segs, { visualizers: [{ id: 'boundPlot' }] })
  assert.deepEqual(items.filter((i) => i.level === 2).map((i) => i.text), [
    'A. Pengantar Notasi Asimtotik',
    'B. Notasi Theta (Θ)',
    'C. Notasi Big Oh (O)',
    'D. Notasi Omega (Ω)',
    'E. Mencoba Grafik Batas Asimtotik',
    'Visualisasi',
    'F. Rangkuman',
    'Soal Challenge',
  ])
  assert.deepEqual(items.filter((i) => i.level === 3).map((i) => i.text), [
    'Contoh Θ: 2n² − 3n + 1 = Θ(n²)',
    'Contoh O: ½n² − 3n = O(n²)',
    'Contoh Ω: 10n − 20 = Ω(n)',
  ])
})

test('gambar grafik ada di berkas dan dirujuk dengan teks alternatif', () => {
  for (const f of ['grafik-theta', 'grafik-big-o', 'grafik-omega']) {
    assert.ok(existsSync(join(root, `public/materi/notasi-asimtotik/${f}.png`)), f)
    assert.ok(md.includes(`](/materi/notasi-asimtotik/${f}.png)`), f)
  }
})

test('contoh Θ: 2n² − 3n + 1 = Θ(n²) dengan c₁ = 3/4, c₂ = 2, n₀ = 2', () => {
  const f = (n) => 2 * n * n - 3 * n + 1
  assert.equal(f(1) / 1, 0)
  assert.equal(f(2) / 4, 3 / 4)
  assert.ok(Math.abs(f(3) / 9 - 10 / 9) < 1e-12)
  assert.equal(n0Of((n) => (3 / 4) * n * n <= f(n) && f(n) <= 2 * n * n), 2)
  // c₁ positif tidak mungkin dipakai di n = 1
  assert.equal(f(1) >= 0.01 * 1, false)
  assert.ok(md.includes('c_1 = \\frac{3}{4}, \\quad c_2 = 2, \\quad n_0 = 2'))
})

test('contoh O: ½n² − 3n = O(n²) dengan c = ½, n₀ = 6', () => {
  const f = (n) => 0.5 * n * n - 3 * n
  for (let n = 1; n <= 5; n++) assert.ok(f(n) < 0, `n = ${n} negatif`)
  assert.equal(f(6), 0)
  assert.ok(Math.abs(f(7) / 49 - 1 / 14) < 1e-12)
  assert.equal(n0Of((n) => f(n) >= 0 && f(n) <= 0.5 * n * n), 6)
  assert.ok(md.includes('c = \\frac{1}{2}, \\quad n_0 = 6'))
})

test('contoh Ω: 10n − 20 = Ω(n) dengan c = 10/3, n₀ = 3', () => {
  const f = (n) => 10 * n - 20
  assert.equal(f(1) / 1, -10)
  assert.equal(f(2) / 2, 0)
  assert.ok(Math.abs(f(3) / 3 - 10 / 3) < 1e-12)
  assert.equal(f(4) / 4, 5)
  assert.equal(n0Of((n) => (10 / 3) * n <= f(n) && f(n) >= 0), 3)
  assert.ok(md.includes('c = \\frac{10}{3}, \\quad n_0 = 3'))
})

test('contoh bawaan visualizer cocok dengan soal challenge dan dengan materi', () => {
  const r = boundAnalysis({ a: 3, b: 10, c: 5, c1: 1, c2: 4, notation: 'Theta' })
  assert.equal(r.n0, 11)
  assert.ok(md.includes('$n_0 = 11$'))
  assert.equal(boundAnalysis({ a: 3, b: 10, c: 5, c1: 1, c2: 2, notation: 'Theta' }).holds, false, 'c₂ < a: tidak ada n₀')
  assert.equal(boundAnalysis({ a: 3, b: 10, c: 5, c1: 4, c2: 5, notation: 'Theta' }).holds, false, 'c₁ > a: tidak ada n₀')
})

test('klaim di kalimat pengantar pemeriksa cocok dengan hasil hitung', () => {
  const run = (notation, coefs, g, consts) => analyzeBound({ notation, coefs, g, consts })
  assert.equal(run('Theta', ['2', '-3', '1'], 'n^2', ['1', '2']).n0, 3)
  assert.equal(run('Theta', ['2', '-3', '1'], 'n^2', ['3/4', '1']).status, 'never')
  assert.equal(run('O', ['1/2', '-3', '0'], 'n^2', ['1/4']).status, 'never')
  assert.equal(run('Omega', ['0', '10', '-20'], 'n', ['5']).n0, 4)
  assert.equal(run('Omega', ['0', '10', '-20'], 'n', ['9']).n0, 20)
  assert.equal(run('Omega', ['0', '10', '-20'], 'n', ['11']).status, 'never')
  for (const s of ['$n_0$ bergeser menjadi 3', 'menjadi 4', 'menjadi 20 untuk $c = 9$']) assert.ok(md.includes(s), s)
})

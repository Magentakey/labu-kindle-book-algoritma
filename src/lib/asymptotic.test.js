import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import {
  FUNCTIONS,
  FUNCTION_KEYS,
  N_MAX,
  boundAnalysis,
  boundRow,
  compareSummary,
  crossovers,
  evalFn,
  formatRatio,
  formatTick,
  littleAnalysis,
  littleThreshold,
  C_VALUES,
  sampleCurve,
  scaleY,
  unitY,
  smallestStableN,
  yDomain,
} from './asymptotic.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const challenge = (id) => JSON.parse(readFileSync(join(root, `src/content/challenges/${id}.json`), 'utf8'))

test('smallestStableN: n terakhir yang gagal ditambah satu, dan -1 bila masih gagal di batas', () => {
  assert.equal(smallestStableN(() => true, 50), 1)
  assert.equal(smallestStableN((n) => n >= 7, 50), 7)
  // gagal lagi di n = 20 lalu lolos selamanya: n₀ = 21, bukan 7
  assert.equal(smallestStableN((n) => n >= 7 && n !== 20, 50), 21)
  assert.equal(smallestStableN(() => false, 50), -1)
})

test('mode bound (Θ) cocok dengan semua test case soal challenge materi 4', () => {
  // Soal itu memeriksa sampai n = 1000, jadi limit yang sama dipakai di sini.
  for (const { input, expected } of challenge('notasi-asimtotik').testCases) {
    const [a, b, c, c1, c2] = input
    const r = boundAnalysis({ a, b, c, c1, c2, notation: 'Theta' }, 1000)
    assert.equal(r.n0, expected, `input ${JSON.stringify(input)}`)
  }
})

test('mode bound: O dan Ω terpisah, Θ butuh keduanya', () => {
  // f = 3n² + 10n + 5; batas atas 4n² baru berlaku mulai n = 11 (contoh di soal)
  const p = { a: 3, b: 10, c: 5, c1: 1, c2: 4 }
  assert.equal(boundAnalysis({ ...p, notation: 'O' }, 1000).n0, 11)
  assert.equal(boundAnalysis({ ...p, notation: 'Omega' }, 1000).n0, 1) // 1·n² ≤ f(n) sejak awal
  assert.equal(boundAnalysis({ ...p, notation: 'Theta' }, 1000).n0, 11)
  // c1 = 4 > a = 3: batas bawah akhirnya terlewati, jadi Ω gagal dan Θ gagal, tetapi O (c2 = 5) tetap lolos
  const q = { ...p, c1: 4, c2: 5 }
  assert.equal(boundAnalysis({ ...q, notation: 'Omega' }, 1000).n0, -1)
  assert.equal(boundAnalysis({ ...q, notation: 'Theta' }, 1000).n0, -1)
  assert.equal(boundAnalysis({ ...q, notation: 'O' }, 1000).holds, true)
})

test('boundRow memberi batas bawah, f, dan batas atas pada n yang sama', () => {
  assert.deepEqual(boundRow({ a: 3, b: 10, c: 5, c1: 1, c2: 4 }, 10), { n: 10, f: 405, lower: 100, upper: 400 })
})

test('persilangan c·n² dan 2ⁿ sama dengan jawaban soal challenge materi 3', () => {
  // Soal: n terkecil sehingga c·n² < 2ⁿ untuk n itu dan semua n sesudahnya (sampai 100).
  for (const { input, expected } of challenge('pertumbuhan-fungsi').testCases) {
    const [c] = input
    assert.equal(smallestStableN((n) => c * n * n < 2 ** n, 100), expected, `c = ${c}`)
  }
})

test('compareSummary dengan pengali c cocok dengan test case soal challenge materi 3 (c·n² vs 2ⁿ)', () => {
  for (const { input, expected } of challenge('pertumbuhan-fungsi').testCases) {
    const [c] = input
    const r = compareSummary('n^2', '2^n', 100, c)
    assert.equal(r.winner, 'B', `c = ${c}`)
    assert.equal(r.stableN, expected, `c = ${c}`)
  }
})

test('crossovers: n² dan 2ⁿ bersilangan di n = 3 dan n = 5 (4 < 4 sama, 9 > 8, 16 = 16, 25 < 32)', () => {
  const sq = FUNCTIONS['n^2'].f
  const ex = FUNCTIONS['2^n'].f
  // 2ⁿ vs n²: n=1: 2>1; n=2: 4=4; n=3: 8<9; n=4: 16=16; n=5: 32>25
  assert.deepEqual(crossovers(ex, sq, 10), [3, 5])
  assert.deepEqual(crossovers(sq, ex, 10), [3, 5])
})

test('compareSummary: dominan, persilangan, dan fungsi yang sama', () => {
  assert.equal(compareSummary('n', 'n').kind, 'same')
  const dom = compareSummary('n^3', 'n')
  assert.equal(dom.kind, 'dominant')
  assert.equal(dom.winner, 'A')
  const cross = compareSummary('2^n', 'n^2')
  assert.equal(cross.kind, 'cross')
  assert.equal(cross.winner, 'A') // 2ⁿ adalah fungsi A pada pemanggilan ini
  assert.match(cross.text, /mulai n = 5/)
  const dom2 = compareSummary('n', 'n^3')
  assert.equal(dom2.winner, 'B')
  assert.match(dom2.text, /sama di n = 1/)
})

test('peringkat fungsi konsisten dengan nilai nyata di n terbesar', () => {
  const byRank = [...FUNCTION_KEYS].sort((a, b) => FUNCTIONS[a].rank - FUNCTIONS[b].rank)
  const values = byRank.map((k) => evalFn(k, N_MAX))
  for (let i = 1; i < values.length; i++) assert.ok(values[i] > values[i - 1], `${byRank[i]} harus > ${byRank[i - 1]}`)
})

test('littleAnalysis: jenis dari peringkat cocok dengan arah rasio sebenarnya untuk semua pasangan', () => {
  for (const kf of FUNCTION_KEYS) {
    for (const kg of FUNCTION_KEYS) {
      const { kind } = littleAnalysis(kf, kg)
      const f = FUNCTIONS[kf].f
      const g = FUNCTIONS[kg].f
      const ratioMid = f(30) / g(30)
      const ratioEnd = f(60) / g(60)
      if (kind === 'o') assert.ok(ratioEnd < ratioMid, `${kf} / ${kg} harus mengecil`)
      else if (kind === 'omega') assert.ok(ratioEnd > ratioMid, `${kf} / ${kg} harus membesar`)
      else assert.equal(kf, kg)
    }
  }
})

test('littleAnalysis cocok dengan aturan derajat pada soal challenge materi 5', () => {
  assert.equal(littleAnalysis('n', 'n^2').kind, 'o')
  assert.equal(littleAnalysis('n^2', 'n').kind, 'omega')
  assert.equal(littleAnalysis('n^2', 'n^2').kind, 'theta')
})

test('littleThreshold: f = n terhadap g = n²; c yang lebih kecil butuh n yang lebih besar', () => {
  // n < c·n² ⇔ n > 1/c
  assert.deepEqual(littleThreshold('n', 'n^2', 1), { direction: 'o', n0: 2, eventually: true })
  assert.equal(littleThreshold('n', 'n^2', 0.5).n0, 3)
  assert.equal(littleThreshold('n', 'n^2', 0.1).n0, 11)
  assert.equal(littleThreshold('n', 'n^2', 0.05).n0, 21)
})

test('littleThreshold: ω memakai arah f > c·g, dan Θ gagal untuk c ≤ 1 (bukan o)', () => {
  // n² > c·n ⇔ n > c
  assert.deepEqual(littleThreshold('n^2', 'n', 10), { direction: 'omega', n0: 11, eventually: true })
  // n² < c·n² benar untuk c > 1 saja, jadi f = Θ(g) tidak memenuhi "untuk setiap c"
  assert.deepEqual(littleThreshold('n^2', 'n^2', 1), { direction: 'o', n0: -1, eventually: false })
  assert.deepEqual(littleThreshold('n^2', 'n^2', 2), { direction: 'o', n0: 1, eventually: true })
})

test('littleThreshold: log n tumbuh sangat lambat, jadi c kecil belum tercapai di rentang gambar tetapi pasti tercapai', () => {
  // 1/log₂ n < 0.05 butuh n > 2²⁰: jauh di luar n = 100
  const r = littleThreshold('n', 'n log n', 0.05)
  assert.equal(r.n0, -1)
  assert.equal(r.eventually, true)
})

test('littleThreshold: n0 hasilnya cocok dengan pembanding brute force untuk semua pasangan dan semua c', () => {
  for (const kf of FUNCTION_KEYS) {
    for (const kg of FUNCTION_KEYS) {
      for (const c of C_VALUES) {
        const { direction, n0 } = littleThreshold(kf, kg, c)
        const f = FUNCTIONS[kf].f
        const g = FUNCTIONS[kg].f
        const ok = direction === 'omega' ? (n) => f(n) > c * g(n) : (n) => f(n) < c * g(n)
        // Semua n ≥ n0 harus memenuhi, dan n0 - 1 (bila ada) tidak.
        if (n0 === -1) {
          assert.equal(ok(N_MAX), false, `${kf}/${kg} c=${c}`)
        } else {
          for (let n = n0; n <= N_MAX; n++) assert.ok(ok(n), `${kf}/${kg} c=${c} n=${n}`)
          if (n0 > 1) assert.equal(ok(n0 - 1), false, `${kf}/${kg} c=${c} n0-1`)
        }
      }
    }
  }
})

test('boundAnalysis.eventually cocok dengan pemeriksaan brute force sampai n = 2000', () => {
  for (const a of [1, 3, 5]) for (const b of [0, 4]) for (const c of [0, 7]) {
    for (const c1 of [0, 1, 3, 5]) for (const c2 of [1, 3, 5, 6]) {
      for (const notation of ['O', 'Omega', 'Theta']) {
        const p = { a, b, c, c1, c2, notation }
        const r = boundAnalysis(p, 2000)
        // Bila secara aljabar berlaku, n0 harus ada. Bila tidak, tidak boleh ada n0 (tidak stabil di 2000).
        assert.equal(r.n0 !== -1, r.eventually, JSON.stringify(p))
      }
    }
  }
})

test('yDomain dan scaleY: linear, log, dan nilai di luar rentang dijepit', () => {
  assert.deepEqual(yDomain([3, 40, 7], 'linear'), [0, 40])
  assert.deepEqual(yDomain([3, 4000], 'log'), [1, 10000])
  assert.deepEqual(yDomain([], 'log'), [1, 10])
  assert.equal(scaleY(0, [0, 40], 'linear'), 0)
  assert.equal(scaleY(20, [0, 40], 'linear'), 0.5)
  assert.equal(scaleY(100, [0, 40], 'linear'), 1)
  assert.equal(scaleY(100, [1, 10000], 'log'), 0.5)
  assert.equal(scaleY(0, [1, 10000], 'log'), 0) // nol tidak punya log: dijepit ke dasar
})

test('unitY tidak menjepit, scaleY menjepit', () => {
  assert.equal(unitY(80, [0, 40], 'linear'), 2)
  assert.equal(unitY(-40, [0, 40], 'linear'), -1)
  assert.equal(scaleY(80, [0, 40], 'linear'), 1)
  assert.ok(unitY(1e30, [1, 1e4], 'log') > 1)
  assert.equal(scaleY(0, [1, 1e4], 'log'), 0)
  assert.equal(scaleY(-5, [1, 1e4], 'log'), 0)
})

test('formatTick dan formatRatio', () => {
  assert.equal(formatTick(0.001), '10⁻³')
  assert.equal(formatTick(0.1), '0,1')
  assert.equal(formatRatio(0.0512), '0,0512')
  assert.equal(formatRatio(0.5), '0,5')
  assert.equal(formatRatio(12.3456), '12,35')
  assert.match(formatRatio(4.6e12), /^4,6 × 10¹²$/)
})

test('formatTick dan sampleCurve', () => {
  assert.equal(formatTick(1000000), '10⁶')
  assert.equal(formatTick(50), '50')
  const pts = sampleCurve((n) => n * 2, 5)
  assert.equal(pts.length, 5)
  assert.deepEqual(pts[4], { n: 5, v: 10 })
})

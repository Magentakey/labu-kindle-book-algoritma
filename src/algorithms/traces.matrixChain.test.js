import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { traces, runTrace } from './traces.js'
import { DP_STATUS } from '../components/DpTable/dpStatuses.js'
import { seeded as seededRandom } from '../lib/seededRandom.js'

const def = traces['matrix-chain-order']
const run = (p) => {
  const r = runTrace(def, { p: Array.isArray(p) ? p.join(', ') : p })
  assert.ok(r.ok, r.error)
  return r.steps
}
const P = [30, 35, 15, 5, 10, 20, 25]
const num = (t) => Number(String(t).replace(/\./g, ''))
const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')

/**
 * Pembanding independen: pseudocode MATRIX-CHAIN-ORDER dijalankan apa adanya (transliterasi baris demi baris),
 * mencatat nomor baris yang dibaca (header for dibaca sekali tiap putaran ditambah sekali saat keluar).
 */
function reference(p) {
  const log = []
  const L = (x) => log.push(x)
  L(1)
  const n = p.length - 1
  L(2)
  const m = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0))
  const s = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0))
  let i
  for (i = 1; (L(3), i <= n); i++) {
    L(4)
    m[i][i] = 0
  }
  let l
  for (l = 2; (L(5), l <= n); l++) {
    for (i = 1; (L(6), i <= n - l + 1); i++) {
      L(7)
      const j = i + l - 1
      L(8)
      m[i][j] = Infinity
      let k
      for (k = i; (L(9), k <= j - 1); k++) {
        L(10)
        const q = m[i][k] + m[k + 1][j] + p[i - 1] * p[k] * p[j]
        L(11)
        if (q < m[i][j]) {
          L(12)
          m[i][j] = q
          L(13)
          s[i][j] = k
        }
      }
    }
  }
  L(14)
  return { log, m, s, n }
}

/** Pembanding tanpa tabel: semua biaya dari semua urutan pengurungan. */
function allOrders(p, i, j) {
  if (i === j) return [{ cost: 0, order: `A${i}` }]
  const out = []
  for (let k = i; k < j; k++) {
    for (const a of allOrders(p, i, k)) {
      for (const b of allOrders(p, k + 1, j)) out.push({ cost: a.cost + b.cost + p[i - 1] * p[k] * p[j], order: `(${a.order}${b.order})` })
    }
  }
  return out
}

const randomP = (rng) => Array.from({ length: 3 + Math.floor(rng() * 5) }, () => 1 + Math.floor(rng() * 40))

test('MATRIX-CHAIN-ORDER: urutan baris sama dengan eksekusi pseudocode pada 300 barisan acak', () => {
  const rng = seededRandom(8)
  for (let t = 0; t < 300; t++) {
    const p = randomP(rng)
    const steps = run(p)
    const ref = reference(p)
    assert.deepEqual(steps.map((s) => s.line), ref.log, `p = ${p}`)
  }
})

test('MATRIX-CHAIN-ORDER: tabel m dan s di langkah terakhir sama dengan eksekusi referensi dan hitungan semua urutan', () => {
  const rng = seededRandom(80)
  for (let t = 0; t < 120; t++) {
    const p = randomP(rng)
    const last = run(p).at(-1)
    const ref = reference(p)
    const n = ref.n
    const [mt, st] = last.tables
    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= n; j++) {
        const mc = mt.table.cells[i - 1][j - 1]
        const sc = st.table.cells[i - 1][j - 1]
        if (i > j) {
          assert.equal(mc.mark, 'unused')
          continue
        }
        assert.equal(num(mc.text), ref.m[i][j], `m[${i},${j}] p=${p}`)
        if (i < j) {
          assert.equal(Number(sc.text), ref.s[i][j], `s[${i},${j}] p=${p}`)
          assert.equal(mc.sub, `k=${ref.s[i][j]}`)
        }
      }
    }
    assert.equal(num(mt.table.cells[0][n - 1].text), Math.min(...allOrders(p, 1, n).map((o) => o.cost)), `biaya minimum p=${p}`)
  }
})

test('MATRIX-CHAIN-ORDER: contoh materi menghasilkan 15.125 dengan urutan ((A1(A2A3))((A4A5)A6))', () => {
  const steps = run(P)
  assert.equal(steps[0].line, 1)
  assert.match(steps.at(-1).note, /m\[1,6\] = 15\.125/)
  assert.ok(steps.at(-1).note.includes('((A1(A2A3))((A4A5)A6))'))
  // sel yang terpakai pada urutan optimal: 6 daun + 5 sel dalam = 11 (2n - 1)
  const marks = steps.at(-1).tables[0].table.cells.flat().filter((c) => c.mark === 'path')
  assert.equal(marks.length, 11)
  // Contoh 2 materi: m[2,5] dengan k = 2, 3, 4 menghasilkan 13.000, 7.125, 11.375
  const q25 = steps.filter((s) => s.line === 10 && s.vars.find((v) => v.name === 'i').value === '2' && s.vars.find((v) => v.name === 'j').value === '5')
  assert.deepEqual(q25.map((s) => s.vars.find((v) => v.name === 'q').value), ['13.000', '7.125', '11.375'])
  // Contoh 1 materi: m[1,2] = 15.750
  const q12 = steps.find((s) => s.line === 12 && s.vars.find((v) => v.name === 'i').value === '1' && s.vars.find((v) => v.name === 'j').value === '2')
  assert.match(q12.note, /m\[1,2\] = q = 15\.750/)
})

test('MATRIX-CHAIN-ORDER: baris 10 menandai Ki, Ka, dan tiga nilai p yang dikalikan', () => {
  const steps = run(P)
  for (const s of steps.filter((x) => x.line === 10 || x.line === 11)) {
    const g = (name) => Number(s.vars.find((v) => v.name === name).value)
    const [i, j, k] = [g('i'), g('j'), g('k')]
    const cells = s.tables[0].table.cells
    assert.equal(cells[i - 1][k - 1].glyph, 'Ki')
    assert.equal(cells[k][j - 1].glyph, 'Ka')
    assert.equal(cells[i - 1][j - 1].mark, 'current')
    const factors = s.array.marks.map((m, x) => (m === 'factor' ? x : -1)).filter((x) => x >= 0)
    assert.deepEqual(factors, [i - 1, k, j])
  }
  assert.ok(steps.filter((x) => x.line !== 10 && x.line !== 11).every((x) => !x.array.marks.includes('factor')))
})

test('MATRIX-CHAIN-ORDER: m berubah hanya di baris 4, 8, 12 dan s hanya di baris 13', () => {
  const steps = run(P)
  const snap = (s, i) => s.tables[i].table.cells.map((r) => r.map((c) => c.text).join('|')).join('/')
  for (let x = 1; x < steps.length; x++) {
    const a = steps[x - 1]
    const b = steps[x]
    if (snap(a, 0) !== snap(b, 0)) assert.ok([4, 8, 12].includes(b.line), `m berubah di baris ${b.line}`)
    if (snap(a, 1) !== snap(b, 1)) assert.equal(b.line, 13)
  }
})

test('MATRIX-CHAIN-ORDER: semua status sel dikenal dan tersedia di legenda tabel', () => {
  for (const s of run(P)) {
    for (const { table, legend } of s.tables) {
      for (const c of table.cells.flat()) {
        assert.ok(DP_STATUS[c.mark], c.mark)
        assert.ok(legend.includes(c.mark), `${c.mark} tidak ada di legenda`)
      }
    }
  }
})

test('MATRIX-CHAIN-ORDER: masukan tidak sah ditolak dengan pesan yang jelas', () => {
  assert.match(runTrace(def, { p: '5, 6' }).error, /minimal 3 angka/)
  assert.match(runTrace(def, { p: '1, 2, 3, 4, 5, 6, 7, 8' }).error, /Maksimal 7 angka/)
  assert.match(runTrace(def, { p: '3, 0, 4' }).error, /bilangan bulat positif/)
  assert.match(runTrace(def, { p: '3, -2, 4' }).error, /bilangan bulat positif/)
})

test('MATRIX-CHAIN-ORDER: pseudocode peraga sama dengan blok pseudocode di materi 8', () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
  const md = readFileSync(join(root, 'src/content/materials/dp-rantai-matriks.md'), 'utf8')
  const block = /```pseudocode\n([\s\S]*?)```/.exec(md)[1].trimEnd()
  assert.equal(def.code, block)
  assert.equal(fmt(15125), '15.125')
})

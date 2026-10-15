import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { traces, runTrace } from './traces.js'
import { DJ_INIT_OFFSET, DJ_MAX_EDGES, DJ_MAX_VERTICES, DJ_RELAX_OFFSET, dijkstraPseudoCode } from './traces/dijkstraPseudo.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const material = readFileSync(join(root, 'src/content/materials/dijkstra.md'), 'utf8')
const D = traces.dijkstra
const run = (V, E, s) => {
  const r = runTrace(D, { V, E, s })
  assert.ok(r.ok, r.error)
  return r.steps
}
const fail = (V, E, s = 's') => {
  const r = runTrace(D, { V, E, s })
  assert.equal(r.ok, false, `seharusnya ditolak: ${V} | ${E} | ${s}`)
  return r.error
}
const listOf = (step, start) => step.lists.find((l) => l.title.startsWith(start))
const EX_V = 's, t, x, y, z'
const EX_E = D.presets[0].values.E
const vt = (step) => {
  const t = step.tables[0].table
  return Object.fromEntries(t.rowHeaders.map((x, i) => [x, { d: t.cells[i][0].text, pi: t.cells[i][1].text, mark: t.cells[i][0].mark }]))
}

/** Dijkstra independen: urutan baris, d, π, dan jumlah pembaruan. Seri diputus menurut urutan V. */
function ref(names, edges, s) {
  const adj = Object.fromEntries(names.map((x) => [x, []]))
  for (const [u, v, w] of edges) adj[u].push([v, w])
  const d = Object.fromEntries(names.map((x) => [x, Infinity]))
  const pi = Object.fromEntries(names.map((x) => [x, null]))
  d[s] = 0
  const lines = [1, 9, 10, 11, 12, 2, 3]
  const Q = new Set(names)
  const order = []
  let U = 0
  while (Q.size) {
    lines.push(4, 5, 6)
    let u = null
    for (const x of names) if (Q.has(x) && (u === null || d[x] < d[u])) u = x
    Q.delete(u)
    order.push(u)
    for (const [v, w] of adj[u]) {
      lines.push(7, 8, 13)
      if (d[v] > d[u] + w) {
        d[v] = d[u] + w
        pi[v] = u
        U++
        lines.push(14, 15)
      }
    }
    lines.push(7)
  }
  lines.push(4)
  return { lines, d, pi, U, order }
}
const expectedCount = (n, m, U) => 8 + 4 * n + 3 * m + 2 * U

test('Dijkstra: pseudocode peraga sama persis dengan tiga blok pseudocode di materi 13.2', () => {
  const blocks = [...material.matchAll(/```pseudocode\n([\s\S]*?)\n```/g)].map((m) => m[1])
  assert.equal(blocks.length, 3)
  assert.equal(dijkstraPseudoCode, blocks.join('\n'))
  assert.equal(dijkstraPseudoCode.split('\n').length, 15)
  assert.deepEqual(blocks.map((b) => b.split('\n').length), [8, 4, 3])
  assert.equal(DJ_INIT_OFFSET, 8)
  assert.equal(DJ_RELAX_OFFSET, 12)
  assert.match(material, /^::trace dijkstra$/m)
  assert.equal(D.code, dijkstraPseudoCode)
})

test('Dijkstra: contoh materi: urutan extract, S, Q, d tiap loop, dan 72 langkah', () => {
  const steps = run(EX_V, EX_E, 's')
  assert.equal(steps.length, 72) // 8 + 4*5 + 3*10 + 2*7
  assert.deepEqual(steps.slice(0, 7).map((x) => x.line), [1, 9, 10, 11, 12, 2, 3])
  const extracts = steps.filter((x) => x.line === 5)
  assert.deepEqual(extracts.map((x) => x.note.match(/EXTRACT-MIN\(Q\) = (\w)/)[1]), ['s', 'y', 'z', 't', 'x'])
  const ends = steps.filter((x) => x.line === 7 && /(end for|kosong)/.test(x.note))
  const expectD = [
    { s: '0', t: '10', x: '∞', y: '5', z: '∞' },
    { s: '0', t: '8', x: '14', y: '5', z: '7' },
    { s: '0', t: '8', x: '13', y: '5', z: '7' },
    { s: '0', t: '8', x: '9', y: '5', z: '7' },
    { s: '0', t: '8', x: '9', y: '5', z: '7' },
  ]
  assert.equal(ends.length, 5)
  ends.forEach((st, i) => {
    const t = vt(st)
    assert.deepEqual(Object.fromEntries(Object.entries(t).map(([k, c]) => [k, c.d])), expectD[i], `d sesudah loop ${i + 1}`)
  })
  assert.deepEqual(listOf(ends[1], 'Himpunan S').items, ['s', 'y'])
  assert.deepEqual(listOf(ends[1], 'Himpunan Q').items, ['t (8)', 'x (14)', 'z (7)'])
  assert.deepEqual(listOf(ends[3], 'Himpunan S').items, ['s', 'y', 'z', 't'])
  const last = steps.at(-1)
  assert.equal(last.line, 4)
  assert.deepEqual(listOf(last, 'Lintasan terpendek dari s').items, ['s – y – t: total bobot 8', 's – y – t – x: total bobot 9', 's – y: total bobot 5', 's – y – z: total bobot 7'])
  assert.deepEqual(listOf(last, 'Himpunan Q').items, [])
})

test('Dijkstra: 500 graf acak cocok dengan pembanding independen (baris, d, π, jumlah langkah)', () => {
  let a = 29
  const rng = () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const pick = (k) => Math.floor(rng() * k)
  let unreachable = 0
  let ties = 0
  for (let t = 0; t < 500; t++) {
    const n = 2 + pick(DJ_MAX_VERTICES - 1)
    const names = Array.from({ length: n }, (_, i) => `v${i}`)
    const pairs = []
    for (const u of names) for (const v of names) if (u !== v) pairs.push([u, v])
    const m = 1 + pick(Math.min(DJ_MAX_EDGES, pairs.length))
    const edges = []
    for (let k = 0; k < m; k++) {
      const [u, v] = pairs.splice(pick(pairs.length), 1)[0]
      edges.push([u, v, pick(7)]) // bobot kecil agar sering seri; 0 diperbolehkan
    }
    const s = names[pick(n)]
    const E = edges.map(([u, v, w]) => `${u}>${v}:${w}`).join(', ')
    const steps = run(names.join(', '), E, s)
    const r = ref(names, edges, s)
    assert.deepEqual(steps.map((x) => x.line), r.lines, `baris acak ${t}: ${E} sumber ${s}`)
    assert.equal(steps.length, expectedCount(n, m, r.U), `jumlah langkah acak ${t}`)
    const tab = vt(steps.at(-1))
    for (const x of names) {
      assert.equal(tab[x].d, r.d[x] === Infinity ? '∞' : String(r.d[x]), `d(${x}) acak ${t}`)
      assert.equal(tab[x].pi, r.pi[x] ?? 'NIL', `π(${x}) acak ${t}`)
      assert.equal(tab[x].mark, 'black', 'semua simpul sudah di S di akhir')
    }
    assert.deepEqual(steps.filter((x) => x.line === 5).map((x) => x.note.match(/EXTRACT-MIN\(Q\) = (\w+),/)[1]), r.order, `urutan extract acak ${t}`)
    if (Object.values(r.d).includes(Infinity)) unreachable++
    if (steps.some((x) => /sama-sama bernilai/.test(x.note))) ties++
    for (const st of steps) {
      assert.ok(st.line >= 1 && st.line <= 15 && st.note.length > 0)
      assert.deepEqual(st.vars.map((v) => v.name), ['u', 'v', 'w(u, v)', 'u.d', 'v.d', 'u.d + w(u, v)', '|Q|'])
    }
  }
  assert.ok(unreachable > 20 && ties > 20, `perlu simpul tak terjangkau (${unreachable}) dan seri (${ties})`)
})

test('Dijkstra: tanda simpul (S hitam, u, v, baru berubah) dan keterangan legend', () => {
  const steps = run(EX_V, EX_E, 's')
  const i14 = steps.findIndex((x) => x.line === 14)
  const t = vt(steps[i14])
  assert.equal(t.s.mark, 'current') // u = s
  assert.equal(t.t.mark, 'path') // t baru berubah
  assert.equal(steps[i14].vars.find((v) => v.name === 'u.d + w(u, v)').value, '10')
  for (const tab of steps[i14].tables) for (const k of tab.legend) assert.ok(tab.labels[k], `keterangan ${k}`)
  // setelah s masuk S dan loop 2 dimulai, s berwarna black
  const i5b = steps.filter((x) => x.line === 5)[1]
  assert.equal(vt(i5b).s.mark, 'black')
  assert.equal(vt(i5b).y.mark, 'current')
  // RELAX false pada simpul yang sudah di S diberi alasan
  const sInS = steps.find((x) => x.line === 13 && /\(z, s\)/.test(x.note) === false && /sudah di S/.test(x.note))
  assert.ok(sInS, 'catatan simpul sudah di S')
})

test('Dijkstra: preset berjalan; urutan Adj lain, seri, dan tak terjangkau memberi hasil benar', () => {
  for (const p of D.presets) assert.ok(runTrace(D, p.values).ok, p.label)
  const a = vt(run(EX_V, EX_E, 's').at(-1))
  const b = vt(run(D.presets[1].values.V, D.presets[1].values.E, 's').at(-1))
  for (const x of ['s', 't', 'x', 'y', 'z']) assert.equal(a[x].d, b[x].d)
  const tie = D.presets.find((p) => p.label.startsWith('Nilai seri'))
  const steps = run(tie.values.V, tie.values.E, 's')
  assert.match(steps.find((x) => x.line === 5 && /sama-sama/.test(x.note)).note, /a dan b sama-sama bernilai 2; yang dikeluarkan adalah a/)
  const un = D.presets.find((p) => p.label.startsWith('Ada simpul'))
  const last = run(un.values.V, un.values.E, 's').at(-1)
  assert.deepEqual(listOf(last, 'Lintasan terpendek dari s').items, ['s – a: total bobot 2', 's – a – b: total bobot 5', 's → c: tidak terjangkau (d = ∞)'])
})

test('Dijkstra: masukan salah ditolak, termasuk bobot negatif', () => {
  assert.match(fail('s, t', 's>t:-1'), /berbobot negatif .*Bellman-Ford/)
  assert.match(fail('s, t', 's>t:−3'), /berbobot negatif/)
  assert.match(fail('', 's>t:1'), /V tidak boleh kosong/)
  assert.match(fail('s, t', 's-t:1'), /belum benar/)
  assert.match(fail('s, t', 's>q:1'), /tidak ada di V/)
  assert.match(fail('s, t', 's>t:1', 'q'), /Sumber s = q tidak ada/)
  assert.match(fail('s, t', 's>t:100'), /antara −99 dan 99/)
  assert.equal(runTrace(D, { V: 's, t', E: 's>t:0, t>s:0', s: 's' }).ok, true, 'bobot nol boleh')
})

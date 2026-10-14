import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { traces, runTrace } from './traces.js'
import { BF_INIT_OFFSET, BF_MAX_EDGES, BF_MAX_VERTICES, BF_RELAX_OFFSET, bellmanFordPseudoCode } from './traces/bellmanFordPseudo.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const material = readFileSync(join(root, 'src/content/materials/bellman-ford.md'), 'utf8')
const B = traces['bellman-ford']
const run = (V, E, s) => {
  const r = runTrace(B, { V, E, s })
  assert.ok(r.ok, r.error)
  return r.steps
}
const fail = (V, E, s = 's') => {
  const r = runTrace(B, { V, E, s })
  assert.equal(r.ok, false, `seharusnya ditolak: ${V} | ${E} | ${s}`)
  return r.error
}
const varOf = (step, name) => step.vars.find((v) => v.name === name).value
const listOf = (step, start) => step.lists.find((l) => l.title.startsWith(start))

const EXAMPLE_V = 's, t, x, y, z'
const EXAMPLE_E = B.presets[0].values.E
const MINUS = (n) => String(n).replace('-', '−')

// ---------------------------------------------------------------- pembanding independen
/** Bellman-Ford persis seperti pseudocode. Mengembalikan urutan baris, sisi true per loop, nilai akhir, dan hasil. */
function ref(names, edges, s) {
  const d = Object.fromEntries(names.map((x) => [x, Infinity]))
  const pi = Object.fromEntries(names.map((x) => [x, null]))
  d[s] = 0
  const lines = [1, 9, 10, 11, 12]
  const trueByLoop = []
  let updates = 0
  for (let i = 1; i <= names.length - 1; i++) {
    lines.push(2)
    const trues = []
    for (const [u, v, w] of edges) {
      lines.push(3, 4, 13)
      if (d[v] > d[u] + w) {
        d[v] = d[u] + w
        pi[v] = u
        trues.push(`(${u}, ${v})`)
        updates++
        lines.push(14, 15)
      }
    }
    lines.push(3)
    trueByLoop.push(trues)
  }
  lines.push(2)
  let violation = -1
  for (let k = 0; k < edges.length; k++) {
    const [u, v, w] = edges[k]
    lines.push(5, 6)
    if (d[v] > d[u] + w) {
      violation = k
      lines.push(7)
      break
    }
  }
  if (violation < 0) lines.push(5, 8)
  return { lines, trueByLoop, d, pi, updates, result: violation < 0, violation }
}

const toEdges = (E) => E.split(',').map((t) => {
  const [uv, w] = t.trim().split(':')
  const [u, v] = uv.split('>')
  return [u, v, Number(w)]
})

const vertexTable = (step) => {
  const t = step.tables[0].table
  return Object.fromEntries(t.rowHeaders.map((x, i) => [x, { d: t.cells[i][0].text, pi: t.cells[i][1].text }]))
}

const expectedCount = (names, edges, r) => {
  const L = names.length - 1
  const m = edges.length
  return r.result ? 8 + 2 * L + 3 * m * L + 2 * r.updates + 2 * m : 7 + 2 * L + 3 * m * L + 2 * r.updates + 2 * (r.violation + 1)
}

// ---------------------------------------------------------------- kode
test('Bellman-Ford: pseudocode peraga sama persis dengan tiga blok pseudocode di materi 13.1', () => {
  const blocks = [...material.matchAll(/```pseudocode\n([\s\S]*?)\n```/g)].map((m) => m[1])
  assert.equal(blocks.length, 3, 'BELLMAN-FORD, INITIALIZE-SINGLE-SOURCE, RELAX')
  assert.equal(bellmanFordPseudoCode, blocks.join('\n'))
  const code = bellmanFordPseudoCode.split('\n')
  assert.equal(code.length, 15)
  assert.equal(blocks[0].split('\n').length, 8)
  assert.equal(blocks[1].split('\n').length, 4)
  assert.equal(blocks[2].split('\n').length, 3)
  assert.equal(BF_INIT_OFFSET, 8)
  assert.equal(BF_RELAX_OFFSET, 12)
})

test('Bellman-Ford: materi memasang peraga dan peraga memakai kode yang sama dengan tabel di materi', () => {
  assert.match(material, /^::trace bellman-ford$/m)
  assert.equal(B.code, bellmanFordPseudoCode)
})

// ---------------------------------------------------------------- contoh materi
test('Bellman-Ford: contoh materi menghasilkan sisi true per loop, nilai akhir, dan lintasan seperti dokumen', () => {
  const steps = run(EXAMPLE_V, EXAMPLE_E, 's')
  const names = EXAMPLE_V.split(', ')
  const r = ref(names, toEdges(EXAMPLE_E), 's')
  assert.deepEqual(r.trueByLoop, [['(s, t)', '(s, y)'], ['(t, x)', '(t, z)', '(y, x)'], ['(x, t)'], ['(t, z)']])
  // catatan akhir tiap loop (baris 3 setelah sisi terakhir) menyebut sisi true loop itu
  const loopEnds = steps.filter((x) => x.line === 3 && /end for/.test(x.note))
  assert.equal(loopEnds.length, 4)
  loopEnds.forEach((st, i) => {
    assert.match(st.note, new RegExp(`Pada loop ${i + 1}, kondisi RELAX bernilai true untuk ${r.trueByLoop[i].length} sisi`))
    for (const e of r.trueByLoop[i]) assert.ok(st.note.includes(e), `${e} pada loop ${i + 1}`)
  })
  // nilai tiap simpul sesudah tiap loop = tabel di materi
  const after = loopEnds.map((st) => vertexTable(st))
  const expectD = [
    { s: '0', t: '6', x: '∞', y: '7', z: '∞' },
    { s: '0', t: '6', x: '4', y: '7', z: '2' },
    { s: '0', t: '2', x: '4', y: '7', z: '2' },
    { s: '0', t: '2', x: '4', y: '7', z: '−2' },
  ]
  after.forEach((tab, i) => assert.deepEqual(Object.fromEntries(names.map((x) => [x, tab[x].d])), expectD[i], `nilai d sesudah loop ${i + 1}`))
  assert.deepEqual(Object.fromEntries(names.map((x) => [x, after[3][x].pi])), { s: 'NIL', t: 'x', x: 'y', y: 's', z: 't' })
  const last = steps.at(-1)
  assert.equal(last.line, 8)
  assert.match(last.note, /return TRUE/)
  assert.deepEqual(listOf(last, 'Lintasan terpendek dari s').items, ['s – y – x – t: total bobot 2', 's – y – x: total bobot 4', 's – y: total bobot 7', 's – y – x – t – z: total bobot −2'])
})

test('Bellman-Ford: langkah 1 sampai 12 menyiapkan d dan π, dan jumlah langkah contoh = 170', () => {
  const steps = run(EXAMPLE_V, EXAMPLE_E, 's')
  assert.deepEqual(steps.slice(0, 5).map((x) => x.line), [1, 9, 10, 11, 12])
  const names = EXAMPLE_V.split(', ')
  const blank = vertexTable(steps[0])
  for (const x of names) assert.deepEqual(blank[x], { d: '', pi: '' }, 'sebelum inisialisasi tabel kosong')
  assert.deepEqual(Object.values(vertexTable(steps[2])).map((c) => c.d), ['∞', '∞', '∞', '∞', '∞'])
  assert.deepEqual(Object.values(vertexTable(steps[3])).map((c) => c.pi), ['NIL', 'NIL', 'NIL', 'NIL', 'NIL'])
  assert.deepEqual(Object.values(vertexTable(steps[4])).map((c) => c.d), ['0', '∞', '∞', '∞', '∞'])
  assert.equal(steps.length, 170) // 8 + 2*4 + 3*10*4 + 2*7 + 2*10
  assert.equal(steps.length, expectedCount(names, toEdges(EXAMPLE_E), ref(names, toEdges(EXAMPLE_E), 's')))
})

// ---------------------------------------------------------------- acak
function seeded(seed) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

test('Bellman-Ford: 500 graf acak (bobot negatif, siklus negatif, simpul tak terjangkau) cocok dengan pembanding independen', () => {
  const rng = seeded(13)
  const pick = (k) => Math.floor(rng() * k)
  let falseCount = 0
  let trueCount = 0
  for (let t = 0; t < 500; t++) {
    const n = 2 + pick(BF_MAX_VERTICES - 1)
    const names = Array.from({ length: n }, (_, i) => `v${i}`)
    const pairs = []
    for (const u of names) for (const v of names) if (u !== v) pairs.push([u, v])
    const m = 1 + pick(Math.min(BF_MAX_EDGES, pairs.length))
    const edges = []
    for (let k = 0; k < m; k++) {
      const [u, v] = pairs.splice(pick(pairs.length), 1)[0]
      // bobot condong positif agar siklus negatif tidak selalu muncul
      const w = rng() < 0.3 ? -(1 + pick(6)) : pick(12)
      edges.push([u, v, w])
    }
    const s = names[pick(n)]
    const E = edges.map(([u, v, w]) => `${u}>${v}:${w}`).join(', ')
    const steps = run(names.join(', '), E, s)
    const r = ref(names, edges, s)
    assert.deepEqual(steps.map((x) => x.line), r.lines, `urutan baris acak ${t}: ${E} sumber ${s}`)
    assert.equal(steps.length, expectedCount(names, edges, r), `jumlah langkah acak ${t}`)
    if (r.result) trueCount++
    else falseCount++
    // keadaan simpul pada langkah terakhir: nilai d dan π sama dengan pembanding
    const tab = vertexTable(steps.at(-1))
    for (const x of names) {
      assert.equal(tab[x].d, r.d[x] === Infinity ? '∞' : MINUS(r.d[x]), `d(${x}) acak ${t}`)
      assert.equal(tab[x].pi, r.pi[x] ?? 'NIL', `π(${x}) acak ${t}`)
    }
    const last = steps.at(-1)
    assert.equal(last.line, r.result ? 8 : 7, `baris terakhir acak ${t}`)
    assert.match(last.note, r.result ? /return TRUE/ : /return FALSE/)
    // tiap langkah: baris valid, ada catatan, dan variabel tetap lengkap
    for (const st of steps) {
      assert.ok(st.line >= 1 && st.line <= 15)
      assert.ok(st.note.length > 0)
      assert.deepEqual(st.vars.map((v) => v.name), ['i', 'u', 'v', 'w(u, v)', 'u.d', 'v.d', 'u.d + w(u, v)'])
    }
  }
  assert.ok(falseCount > 20 && trueCount > 20, `perlu kedua hasil: FALSE ${falseCount}, TRUE ${trueCount}`)
})

test('Bellman-Ford: daftar sisi tebal selalu sama dengan π pada tabel simpul', () => {
  const steps = run(EXAMPLE_V, EXAMPLE_E, 's')
  const w = Object.fromEntries(toEdges(EXAMPLE_E).map(([u, v, x]) => [`${u}>${v}`, x]))
  for (const st of steps.slice(3)) {
    const tab = vertexTable(st)
    const expected = Object.entries(tab).filter(([, c]) => c.pi !== 'NIL').map(([x, c]) => `(${c.pi}, ${x}) = ${MINUS(w[`${c.pi}>${x}`])}`)
    assert.deepEqual(listOf(st, 'Sisi tebal').items, expected)
  }
})

test('Bellman-Ford: tabel sisi menandai true dan false per loop, dan tanda tidak hanya warna', () => {
  const steps = run(EXAMPLE_V, EXAMPLE_E, 's')
  // langkah baris 13 sisi (s,t) pada loop 1: true, dan simpul t diberi tanda 'path' pada baris 14
  const i14 = steps.findIndex((x) => x.line === 14)
  const edgeTab = steps[i14].tables[1].table
  assert.deepEqual(edgeTab.rowHeaders, ['(t, x)', '(t, y)', '(t, z)', '(x, t)', '(y, x)', '(y, z)', '(z, x)', '(z, s)', '(s, t)', '(s, y)'])
  assert.equal(edgeTab.cells[8][1].text, 'true')
  assert.equal(edgeTab.cells[8][1].mark, 'path')
  assert.equal(edgeTab.cells[0][1].text, 'false')
  assert.equal(edgeTab.cells[0][1].mark, 'unused')
  const vt = steps[i14].tables[0].table
  assert.equal(vt.cells[1][0].mark, 'path') // t
  assert.equal(vt.cells[0][0].mark, 'current') // s = u
  assert.equal(varOf(steps[i14], 'u'), 's')
  assert.equal(varOf(steps[i14], 'v'), 't')
  assert.equal(varOf(steps[i14], 'u.d + w(u, v)'), '6')
  // tiap loop mengosongkan lagi tabel sisi
  const loop2 = steps.filter((x) => x.line === 2)[1]
  assert.ok(loop2.tables[1].table.cells.every((c) => c[1].text === ''))
  assert.match(loop2.tables[1].table.caption, /loop 2/)
  // legend tabel punya keterangan teks untuk tiap tanda
  for (const t of steps[i14].tables) for (const k of t.legend) assert.ok(t.labels[k], `keterangan untuk ${k}`)
})

// ---------------------------------------------------------------- siklus negatif dan tepi
test('Bellman-Ford: preset siklus negatif berakhir di baris 7 dengan return FALSE, sesuai contoh di materi', () => {
  const p = B.presets.find((x) => x.label.startsWith('Siklus negatif'))
  const steps = run(p.values.V, p.values.E, p.values.s)
  const names = p.values.V.split(', ')
  const edges = toEdges(p.values.E)
  const r = ref(names, edges, 's')
  assert.equal(r.result, false)
  assert.deepEqual(steps.map((x) => x.line), r.lines)
  // tabel nilai sesudah loop 1 dan loop 2 sama dengan tabel tambahan di materi
  const loopEnds = steps.filter((x) => x.line === 3 && /end for/.test(x.note))
  assert.deepEqual(loopEnds.map((st) => [vertexTable(st).a.d, vertexTable(st).b.d]), [['−1', '−2'], ['−3', '−4']])
  const last = steps.at(-1)
  assert.equal(last.line, 7)
  assert.match(last.note, /siklus bernilai negatif/)
  assert.deepEqual(listOf(last, 'Sisi yang melanggar').items, ['(a, b): b.d = −4 > −6'])
  // L = 2, m = 3, U = 5 pembaruan (3 di loop 1, 2 di loop 2), k = 2 (sisi (a,b) melanggar)
  assert.equal(steps.length, 7 + 2 * 2 + 3 * 3 * 2 + 2 * 5 + 2 * 2)
})

test('Bellman-Ford: simpul tak terjangkau tetap ∞ dan tertulis tidak terjangkau', () => {
  const p = B.presets.find((x) => x.label.startsWith('Ada simpul'))
  const steps = run(p.values.V, p.values.E, p.values.s)
  const last = steps.at(-1)
  assert.equal(vertexTable(last).c.d, '∞')
  assert.deepEqual(listOf(last, 'Lintasan terpendek dari s').items, ['s – a: total bobot 4', 's – a – b: total bobot 3', 's → c: tidak terjangkau (d = ∞)'])
  // sisi dari simpul ∞ dicatat dengan alasan yang benar
  const cA = steps.find((x) => x.line === 13 && /c\.d = ∞/.test(x.note))
  assert.ok(cA, 'catatan untuk sisi dari simpul tak terjangkau')
  assert.match(cA.note, /FALSE/)
})

test('Bellman-Ford: sumber lain mengubah hasil, dan semua preset berjalan', () => {
  for (const p of B.presets) {
    const r = runTrace(B, p.values)
    assert.ok(r.ok, `${p.label}: ${r.error}`)
    assert.ok(r.steps.length > 5)
  }
  const steps = run(EXAMPLE_V, EXAMPLE_E, 'z')
  const names = EXAMPLE_V.split(', ')
  const r = ref(names, toEdges(EXAMPLE_E), 'z')
  assert.deepEqual(steps.map((x) => x.line), r.lines)
  assert.equal(vertexTable(steps.at(-1)).z.d, '0')
})

test('Bellman-Ford: urutan sisi lain memberi hasil akhir sama untuk contoh materi', () => {
  const p = B.presets.find((x) => x.label.startsWith('Urutan sisi lain'))
  const names = EXAMPLE_V.split(', ')
  const a = vertexTable(run(EXAMPLE_V, EXAMPLE_E, 's').at(-1))
  const b = vertexTable(run(p.values.V, p.values.E, 's').at(-1))
  for (const x of names) assert.equal(a[x].d, b[x].d, `d(${x})`)
})

// ---------------------------------------------------------------- masukan
test('Bellman-Ford: masukan yang salah ditolak dengan pesan yang jelas', () => {
  assert.match(fail('', 's>t:1'), /V tidak boleh kosong/)
  assert.match(fail('s', 's>t:1'), /minimal 2 simpul/)
  assert.match(fail('a, b, c, d, e, f, g, h', 'a>b:1', 'a'), /maksimal 7 simpul/)
  assert.match(fail('s, t!', 's>t:1'), /nama simpul "t!"/)
  assert.match(fail('s, s, t', 's>t:1'), /lebih dari satu kali/)
  assert.match(fail('s, t', ''), /E tidak boleh kosong/)
  assert.match(fail('s, t', 's-t:1'), /belum benar/)
  assert.match(fail('s, t', 's>t'), /belum benar/)
  assert.match(fail('s, t', 's>q:1'), /simpul q .* tidak ada di V/)
  assert.match(fail('s, t', 's>s:1'), /dirinya sendiri/)
  assert.match(fail('s, t', 's>t:100'), /antara −99 dan 99/)
  assert.match(fail('s, t', 's>t:1, s>t:2'), /ditulis lebih dari satu kali/)
  assert.match(fail('s, t', 's>t:1', 'q'), /Sumber s = q tidak ada/)
  const vs = ['a', 'b', 'c', 'd', 'e', 'f', 'g']
  const many = []
  for (const u of vs) for (const v of vs) if (u !== v && many.length < BF_MAX_EDGES + 1) many.push(`${u}>${v}:1`)
  assert.match(fail(vs.join(', '), many.join(', '), 'a'), /maksimal 14 sisi/)
})

test('Bellman-Ford: sisi dua arah, bobot negatif dengan tanda minus Unicode, dan spasi bebas diterima', () => {
  const a = run('s, t', 's>t:3, t>s:−2', 's')
  const b = run('s,t', ' s > t : 3 ;  t>s:-2 ', 's')
  assert.equal(a.length, b.length)
  assert.equal(vertexTable(a.at(-1)).t.d, '3')
  // sisi (t,s) bobot −2: s.d = 0 > 3 + (−2) = 1 false, jadi tidak ada siklus negatif (siklus berbobot 1)
  assert.equal(a.at(-1).line, 8)
})

import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { traces, runTrace } from './traces.js'
import { BFS_MAX_ENTRIES, BFS_MAX_VERTICES } from './traces/bfsPseudo.js'
import { DFS_VISIT_OFFSET, dfsPseudoCode } from './traces/dfsPseudo.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const material = readFileSync(join(root, 'src/content/materials/graph-dfs.md'), 'utf8')
const def = traces.dfs
const run = (G) => {
  const r = runTrace(def, { G })
  assert.ok(r.ok, r.error)
  return r.steps
}
const fail = (G) => {
  const r = runTrace(def, { G })
  assert.equal(r.ok, false, `seharusnya ditolak: ${G}`)
  return r.error
}

const EXAMPLE = 'u: v, x; v: y; w: y, z; x: v; y: x; z: z'

/** Pembanding independen: DFS rekursif persis seperti pseudocode, mencatat nomor baris dan kedalaman tumpukan. */
function reference(adj, names) {
  const lines = []
  const depths = []
  const kinds = []
  const roots = []
  const color = {}
  const d = {}
  const f = {}
  const pi = {}
  let time = 0
  let depth = 0
  const log = (l) => {
    lines.push(l)
    depths.push(depth)
  }
  log(1)
  for (const u of names) color[u] = 'WHITE'
  log(2)
  for (const u of names) pi[u] = null
  log(3)
  time = 0
  log(4)
  const visit = (u) => {
    depth++
    time++
    log(8)
    d[u] = time
    log(9)
    color[u] = 'GRAY'
    log(10)
    for (const v of adj[u]) {
      log(11)
      const c = color[v]
      kinds.push(`(${u}, ${v}): ${c === 'WHITE' ? 'tree' : c === 'GRAY' ? 'B (back)' : d[u] < d[v] ? 'F (forward)' : 'C (cross)'}`)
      log(12)
      if (c === 'WHITE') {
        pi[v] = u
        log(13)
        log(14)
        visit(v)
      }
    }
    log(11)
    color[u] = 'BLACK'
    log(15)
    time++
    log(16)
    f[u] = time
    log(17)
    depth--
  }
  for (const u of names) {
    log(5)
    if (color[u] === 'WHITE') {
      log(6)
      roots.push(u)
      log(7)
      visit(u)
    } else log(6)
  }
  log(5)
  return { lines, depths, kinds, roots, d, f, pi, time }
}

const NAMES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
function randomGraph() {
  const n = 1 + Math.floor(Math.random() * 8)
  const names = NAMES.slice(0, n)
  const adj = {}
  for (const x of names) {
    const pool = [...names].sort(() => Math.random() - 0.5)
    adj[x] = pool.slice(0, Math.floor(Math.random() * Math.min(4, n + 1)))
  }
  const G = names.map((x) => `${x}: ${adj[x].join(', ')}`).join('; ')
  return { names, adj, G }
}
const cellsOf = (step) => step.tables[0].table.cells.map((row) => row.map((c) => c.text))
const edgeItems = (step) => step.lists.find((l) => l.title.startsWith('Busur')).items
const timeOf = (step) => step.vars.find((v) => v.name === 'time').value

test('DFS: pseudocode peraga sama persis dengan dua blok di materi 11.2 (DFS 7 baris + DFS-VISIT 10 baris)', () => {
  const blocks = [...material.matchAll(/```pseudocode\n([\s\S]*?)\n```/g)].map((m) => m[1])
  assert.equal(blocks.length, 2)
  assert.equal([blocks[0], blocks[1]].join('\n'), dfsPseudoCode)
  assert.equal(blocks[0].split('\n').length, 7)
  assert.equal(blocks[1].split('\n').length, 10)
  assert.equal(dfsPseudoCode.split('\n').length, 17)
  assert.equal(DFS_VISIT_OFFSET, 7)
})

test('DFS: contoh materi menghasilkan d, f, π, akar, dan jenis busur yang sama dengan bagian D', () => {
  const steps = run(EXAMPLE)
  const last = steps.at(-1)
  assert.equal(last.line, 5)
  assert.equal(steps.length, 85)
  assert.deepEqual(cellsOf(last), [
    ['BLACK', '1', '8', 'NIL'],
    ['BLACK', '2', '7', 'u'],
    ['BLACK', '9', '12', 'NIL'],
    ['BLACK', '4', '5', 'y'],
    ['BLACK', '3', '6', 'v'],
    ['BLACK', '10', '11', 'w'],
  ])
  assert.equal(timeOf(last), '12')
  // urutan busur dijelajahi dan jenisnya sama dengan tabel 8 busur di materi
  assert.deepEqual(edgeItems(last), [
    '(u, v): tree', '(v, y): tree', '(y, x): tree', '(x, v): B (back)',
    '(u, x): F (forward)', '(w, y): C (cross)', '(w, z): tree', '(z, z): B (back)',
  ])
  assert.deepEqual(last.lists.find((l) => l.title.startsWith('DFS-forest')).items, ['Pohon ke-1: u(v(y(x)))', 'Pohon ke-2: w(z)'])
  assert.match(last.note, /2 pohon dengan akar u, w, dan time akhir = 12 = 2\|V\|/)
  // urutan timestamp: x.f=5, y.f=6, v.f=7, u.f=8, z.f=11, w.f=12
  assert.deepEqual(last.lists.find((l) => l.title.startsWith('Urutan simpul selesai')).items, ['x (f = 5)', 'y (f = 6)', 'v (f = 7)', 'u (f = 8)', 'z (f = 11)', 'w (f = 12)'])
  // 12 kejadian timestamp muncul berurutan seperti slide di materi
  const events = []
  for (const st of steps) {
    const m = st.note.match(/^Baris (9|17) .*?: (\w)\.(d|f) = time = (\d+)/)
    if (m) events.push(`${m[2]}.${m[3]}=${m[4]}`)
  }
  assert.deepEqual(events, ['u.d=1', 'v.d=2', 'y.d=3', 'x.d=4', 'x.f=5', 'y.f=6', 'v.f=7', 'u.f=8', 'w.d=9', 'z.d=10', 'z.f=11', 'w.f=12'])
  // tumpukan terdalam: DFS(G), u, v, y, x
  assert.equal(Math.max(...steps.map((s) => s.stack.length)), 5)
  assert.deepEqual(steps.find((s) => s.line === 8 && s.vars.find((v) => v.name === 'u').value === 'x').stack, ['DFS(G)', 'DFS-VISIT(G, u)', 'DFS-VISIT(G, v)', 'DFS-VISIT(G, y)', 'DFS-VISIT(G, x)'])
})

test('DFS: urutan baris, kedalaman tumpukan, dan hasil cocok dengan eksekusi pseudocode apa adanya (300 graf acak)', () => {
  for (let t = 0; t < 300; t++) {
    const g = randomGraph()
    const ref = reference(g.adj, g.names)
    const steps = run(g.G)
    assert.deepEqual(steps.map((x) => x.line), ref.lines, g.G)
    steps.forEach((st, i) => assert.equal(st.stack.length, ref.depths[i] + 1, `tumpukan langkah ${i + 1}: ${g.G}`))
    // banyak langkah = 5 + 11n + 2D - R
    const D = g.names.reduce((a, x) => a + g.adj[x].length, 0)
    assert.equal(steps.length, 5 + 11 * g.names.length + 2 * D - ref.roots.length, g.G)
    const last = steps.at(-1)
    g.names.forEach((x, i) => assert.deepEqual(cellsOf(last)[i], ['BLACK', String(ref.d[x]), String(ref.f[x]), ref.pi[x] ?? 'NIL'], `${x}: ${g.G}`))
    assert.equal(timeOf(last), String(2 * g.names.length))
    assert.deepEqual(edgeItems(last), ref.kinds, g.G)
    assert.equal(last.lists.find((l) => l.title.startsWith('DFS-forest')).items.length, ref.roots.length)
  }
})

test('DFS: timestamp berbeda dan menutup 1 sampai 2n, interval bersarang atau terpisah, jenis busur sesuai interval (200 graf)', () => {
  for (let t = 0; t < 200; t++) {
    const g = randomGraph()
    const n = g.names.length
    const last = run(g.G).at(-1)
    const cells = Object.fromEntries(g.names.map((x, i) => [x, cellsOf(last)[i]]))
    const d = Object.fromEntries(g.names.map((x) => [x, Number(cells[x][1])]))
    const f = Object.fromEntries(g.names.map((x) => [x, Number(cells[x][2])]))
    const pi = Object.fromEntries(g.names.map((x) => [x, cells[x][3] === 'NIL' ? null : cells[x][3]]))
    const all = [...g.names.map((x) => d[x]), ...g.names.map((x) => f[x])].sort((p, q) => p - q)
    assert.deepEqual(all, Array.from({ length: 2 * n }, (_, i) => i + 1), g.G)
    for (const x of g.names) {
      assert.ok(d[x] < f[x])
      for (const y of g.names) {
        if (x === y) continue
        const nested = (d[x] < d[y] && f[y] < f[x]) || (d[y] < d[x] && f[x] < f[y])
        const disjoint = f[x] < d[y] || f[y] < d[x]
        assert.ok(nested || disjoint, `interval ${x} dan ${y} bersilangan: ${g.G}`)
      }
    }
    const kinds = edgeItems(last)
    const D = g.names.reduce((a, x) => a + g.adj[x].length, 0)
    assert.equal(kinds.length, D, 'tiap busur tercatat tepat satu kali')
    for (const item of kinds) {
      const [, u, v, kind] = item.match(/^\((\w), (\w)\): (\w+)/)
      if (kind === 'tree') assert.equal(pi[v], u)
      else if (kind === 'B') assert.ok(d[v] <= d[u] && f[u] <= f[v], `B ${item}`)
      else if (kind === 'F') assert.ok(d[u] < d[v] && f[v] < f[u] && pi[v] !== u, `F ${item}`)
      else assert.ok(kind === 'C' && f[v] < d[u], `C ${item}`)
    }
  }
})

test('DFS: nilai hanya berubah di baris yang menurut pseudocode mengubahnya', () => {
  for (let t = 0; t < 100; t++) {
    const g = randomGraph()
    const steps = run(g.G)
    steps.forEach((st, i) => {
      if (i === 0) return
      const a = cellsOf(steps[i - 1])
      const b = cellsOf(st)
      const changed = (col) => a.some((row, r) => row[col] !== b[r][col])
      if (changed(0)) assert.ok([2, 10, 15].includes(st.line), `color berubah di baris ${st.line}`)
      if (changed(1)) assert.equal(st.line, 9, `d berubah di baris ${st.line}`)
      if (changed(2)) assert.equal(st.line, 17, `f berubah di baris ${st.line}`)
      if (changed(3)) assert.ok([3, 13].includes(st.line), `π berubah di baris ${st.line}`)
      if (timeOf(steps[i - 1]) !== timeOf(st)) assert.ok([4, 8, 16].includes(st.line), `time berubah di baris ${st.line}`)
    })
  }
})

test('DFS: tabel bertanda u, v, dan warna pada baris yang tepat', () => {
  const steps = run(EXAMPLE)
  const names = ['u', 'v', 'w', 'x', 'y', 'z']
  const marks = (st) => st.tables[0].table.cells.map((r) => r[0].mark)
  const s8 = steps.find((s) => s.line === 8)
  assert.equal(marks(s8)[names.indexOf('u')], 'current')
  const s12 = steps.find((s) => s.line === 12)
  assert.equal(marks(s12)[names.indexOf('v')], 'source')
  assert.equal(marks(s12)[names.indexOf('u')], 'current')
  // setelah baris 15, simpul tidak lagi bertanda current dan sudah hitam
  const s15 = steps.find((s) => s.line === 15)
  assert.equal(marks(s15)[names.indexOf('x')], 'black')
  // simpul GRAY di tumpukan: saat x diproses, u, v, y abu-abu
  const sx = steps.filter((s) => s.line === 11 && s.vars.find((v) => v.name === 'u').value === 'x').at(-1)
  assert.equal(sx.vars.find((v) => v.name === 'v').value, '–', 'langkah end for: tidak ada v')
  assert.deepEqual(['u', 'v', 'y'].map((c) => marks(sx)[names.indexOf(c)]), ['gray', 'gray', 'gray'])
  // saat (x, v) diperiksa, v bertanda source dan warnanya GRAY
  const sxv = steps.find((s) => s.line === 12 && s.vars.find((v) => v.name === 'u').value === 'x')
  assert.equal(marks(sxv)[names.indexOf('v')], 'source')
  assert.equal(sxv.vars.find((v) => v.name === 'v.color').value, 'GRAY')
  // sebelum baris 2 tabel kosong, sesudah baris 3 π berisi NIL
  assert.deepEqual(cellsOf(steps[0])[0], ['', '', '', ''])
  assert.deepEqual(cellsOf(steps[2])[0], ['WHITE', '', '', 'NIL'])
})

test('DFS: contoh siap pakai berjalan dan cocok dengan catatan di materi', () => {
  assert.equal(def.presets.length, 5)
  for (const p of def.presets) run(p.values.G)
  assert.equal(def.inputs[0].value, EXAMPLE)
  assert.equal(def.presets[0].values.G, EXAMPLE)
  const forest = (G) => run(G).at(-1).lists.find((l) => l.title.startsWith('DFS-forest')).items
  // urutan V berbeda: w lebih dulu, akar berubah menjadi w dan u
  assert.deepEqual(forest(def.presets[1].values.G), ['Pohon ke-1: w(y(x(v)), z)', 'Pohon ke-2: u'])
  assert.deepEqual(forest(def.presets[2].values.G), ['Pohon ke-1: a(b(c))'])
  assert.equal(forest(def.presets[3].values.G).length, 3)
  const siklus = run(def.presets[4].values.G).at(-1)
  assert.deepEqual(edgeItems(siklus), ['(a, b): tree', '(b, c): tree', '(c, a): B (back)'])
  // graf tanpa busur: tiga pohon, 5 + 33 - 3 langkah
  assert.equal(run('a:; b:; c:').length, 35)
})

test('DFS: isian yang salah ditolak dengan pesan yang menyebut sebabnya', () => {
  assert.match(fail(''), /Isian G: .*tidak boleh kosong/)
  assert.match(fail('u v, x'), /titik dua/)
  assert.match(fail('u: x'), /bukan simpul di G/)
  assert.match(fail('u: u; u:'), /lebih dari satu kali/)
  assert.match(fail('u: v, v; v:'), /dua kali/)
  assert.match(fail('abc: ; d:'), /1 sampai 2 huruf atau angka/)
  const nine = Array.from({ length: BFS_MAX_VERTICES + 1 }, (_, i) => `n${i}:`).join('; ')
  assert.match(fail(nine), new RegExp(`Maksimal ${BFS_MAX_VERTICES} simpul`))
  const names = Array.from({ length: 8 }, (_, i) => `n${i}`)
  const many = names.map((x) => `${x}: ${names.filter((y) => y !== x).slice(0, 5).join(', ')}`).join('; ')
  assert.match(fail(many), new RegExp(`maksimal ${BFS_MAX_ENTRIES}`))
})

test('DFS: tiap catatan memuat nomor baris DFS-VISIT di materi untuk baris 8 sampai 17', () => {
  for (const st of run(EXAMPLE)) {
    if (st.line >= 8) assert.match(st.note, new RegExp(`^Baris ${st.line} \\(DFS-VISIT baris ${st.line - DFS_VISIT_OFFSET},`))
    else assert.doesNotMatch(st.note, /DFS-VISIT baris/)
  }
})

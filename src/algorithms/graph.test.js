import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { GRAPH_EDGE_STATUS, GRAPH_NODE_STATUS } from '../components/GraphCanvas/graphStatuses.js'
import { seeded } from '../lib/seededRandom.js'
import { visualizers } from './registry.js'
import {
  buildAdj,
  formatGraphInput,
  GRAPH_MAX_EDGES,
  GRAPH_MAX_N,
  GRAPH_NODE_R,
  GRAPH_VIEW_H,
  GRAPH_VIEW_W,
  isConnected,
  layoutCircle,
  parseGraphFields,
  randomGraph,
} from './graphCommon.js'
import { bfsGraphCode, bfsGraphSteps, dfsGraphCode, dfsGraphSteps } from './graphTraversal.js'
import { kruskalCode, kruskalSteps, primCode, primSteps } from './graphMst.js'
import { bellmanFordCode, bellmanFordSteps, dijkstraCode, dijkstraSteps } from './graphShortest.js'

const challenge = (id) => JSON.parse(readFileSync(new URL(`../content/challenges/${id}.json`, import.meta.url), 'utf8'))
/** Mengeksekusi kode yang tampil di visualizer apa adanya. */
const compile = (code, name) => new Function(`${code}\nreturn ${name}`)()
const compileSolution = (src) => new Function(`${src}\nreturn solve`)()

const UNWEIGHTED = { directed: false, weighted: false, needStart: true }
const MST = { directed: false, weighted: true, needStart: false, connected: true }
const PRIM = { ...MST, needStart: true }
const DIRECTED = { directed: true, weighted: true, needStart: true }
const BELLMAN = { ...DIRECTED, minWeight: -9, potentialTrick: true }

// ---------------------------------------------------------------- pembanding independen
const reachable = (n, edges, directed, s) => {
  const seen = Array(n).fill(false)
  const stack = [s]
  seen[s] = true
  while (stack.length) {
    const u = stack.pop()
    for (const [a, b] of edges) {
      for (const [x, y] of directed ? [[a, b]] : [[a, b], [b, a]]) {
        if (x === u && !seen[y]) {
          seen[y] = true
          stack.push(y)
        }
      }
    }
  }
  return seen
}

/** Total bobot minimum pohon rentang dengan mencoba semua himpunan bagian sisi (n kecil). */
function bruteMst(n, edges) {
  let best = Infinity
  for (let mask = 0; mask < 1 << edges.length; mask++) {
    let count = 0
    let total = 0
    const root = Array.from({ length: n }, (_, i) => i)
    const find = (x) => (root[x] === x ? x : find(root[x]))
    let cyc = false
    for (let i = 0; i < edges.length && !cyc; i++) {
      if (!(mask & (1 << i))) continue
      const [u, v, w] = edges[i]
      const a = find(u)
      const b = find(v)
      if (a === b) cyc = true
      else root[a] = b
      count++
      total += w
    }
    if (!cyc && count === n - 1 && total < best) best = total
  }
  return best
}

/** Jarak terpendek dengan Floyd-Warshall; null bila ada siklus negatif yang terjangkau dari sumber. */
function floyd(n, edges, s) {
  const d = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : Infinity)))
  for (const [u, v, w] of edges) d[u][v] = Math.min(d[u][v], w)
  for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (d[i][k] + d[k][j] < d[i][j]) d[i][j] = d[i][k] + d[k][j]
  const reach = reachable(n, edges, true, s)
  for (let v = 0; v < n; v++) if (reach[v] && d[v][v] < 0) return null
  return d[s]
}
const sentinel = (d) => (Array.isArray(d) ? d.map((x) => (x === Infinity ? -1 : x)) : d)

const lastTable = (steps, caption) => steps.at(-1).view.panels.find((p) => p.type === 'table' && p.caption === caption)
const totalOf = (steps) => Number(steps.at(-1).view.panels[0].items.find((i) => i.startsWith('total =')).slice(8))
const rawDistOf = (steps) => lastTable(steps, 'Jarak dari sumber').rows.map((r) => (r[1] === '∞' ? Infinity : Number(r[1])))
const distOf = (steps) => sentinel(rawDistOf(steps))

// ---------------------------------------------------------------- pembaca masukan
test('parseGraphFields: graf tak berarah tanpa bobot', () => {
  const r = parseGraphFields({ n: '5', edges: '0-2, 0-1, 1-3, 2 - 3, 3-4', start: '0' }, UNWEIGHTED)
  assert.deepEqual(r, { ok: true, value: { n: 5, edges: [[0, 2], [0, 1], [1, 3], [2, 3], [3, 4]], start: 0 } })
  assert.deepEqual(parseGraphFields({ n: '1', edges: '', start: '0' }, UNWEIGHTED), { ok: true, value: { n: 1, edges: [], start: 0 } })
})

test('parseGraphFields: graf berbobot dan berarah', () => {
  assert.deepEqual(parseGraphFields({ n: '3', edges: '0>1:4\n1>2:2' , start: '0' }, DIRECTED).value.edges, [[0, 1, 4], [1, 2, 2]])
  // dua arah di antara simpul yang sama boleh, dua sisi searah yang sama tidak
  assert.ok(parseGraphFields({ n: '2', edges: '0>1:1, 1>0:2', start: '0' }, DIRECTED).ok)
  assert.match(parseGraphFields({ n: '2', edges: '0>1:1, 0>1:2', start: '0' }, DIRECTED).error, /lebih dari sekali/)
  assert.match(parseGraphFields({ n: '2', edges: '0-1:1, 1-0:2' }, MST).error, /lebih dari sekali/)
})

test('parseGraphFields: galat menyebut sebabnya', () => {
  const bad = (fields, kind, re) => {
    const r = parseGraphFields(fields, kind)
    assert.equal(r.ok, false, JSON.stringify(fields))
    assert.match(r.error, re, JSON.stringify(fields))
  }
  bad({ n: '', edges: '', start: '0' }, UNWEIGHTED, /jumlah simpul/i)
  bad({ n: 'x', edges: '', start: '0' }, UNWEIGHTED, /bilangan bulat positif/)
  bad({ n: '0', edges: '', start: '0' }, UNWEIGHTED, /1 sampai 9/)
  bad({ n: '10', edges: '', start: '0' }, UNWEIGHTED, /1 sampai 9/)
  bad({ n: '3', edges: '0-3', start: '0' }, UNWEIGHTED, /Simpul 3 pada sisi "0-3" tidak ada/)
  bad({ n: '3', edges: '1-1', start: '0' }, UNWEIGHTED, /dirinya sendiri/)
  bad({ n: '3', edges: '0-1, 1-0', start: '0' }, UNWEIGHTED, /lebih dari sekali/)
  bad({ n: '3', edges: '0>1', start: '0' }, UNWEIGHTED, /graf ini tak berarah/)
  bad({ n: '3', edges: 'a-b', start: '0' }, UNWEIGHTED, /tidak bisa dibaca/)
  bad({ n: '3', edges: '0-1', start: '3' }, UNWEIGHTED, /Simpul awal 3 tidak ada/)
  bad({ n: '3', edges: '0-1', start: '' }, UNWEIGHTED, /Isi simpul awal/)
  bad({ n: '3', edges: '0-1' }, MST, /belum punya bobot/)
  bad({ n: '3', edges: '0-1:5' }, MST, /terhubung/)
  bad({ n: '3', edges: '' }, MST, /minimal satu sisi/)
  bad({ n: '3', edges: '0-1:100, 1-2:1' }, MST, /rentang 0 sampai 99/)
  bad({ n: '3', edges: '0-1:-1, 1-2:1' }, MST, /rentang 0 sampai 99/)
  bad({ n: '3', edges: '0-1:1, 1>2:1', start: '0' }, DIRECTED, /graf ini berarah/)
  bad({ n: '3', edges: '0>1:-2', start: '0' }, DIRECTED, /Bellman-Ford/)
  bad({ n: '3', edges: '0>1:-10', start: '0' }, BELLMAN, /rentang -9 sampai 99/)
  const many = Array.from({ length: GRAPH_MAX_EDGES + 1 }, (_, i) => `${i % 8}-${(i % 8) + 1}`).join(',')
  bad({ n: '9', edges: many, start: '0' }, UNWEIGHTED, /Maksimal 16 sisi/)
  assert.ok(parseGraphFields({ n: '3', edges: '0>1:-9' , start: '0' }, BELLMAN).ok, 'bobot negatif diterima Bellman-Ford')
})

test('formatGraphInput membalik parseGraphFields', () => {
  for (const [kind, f] of [
    [UNWEIGHTED, { n: '5', edges: '0-2, 0-1, 1-3', start: '2' }],
    [MST, { n: '3', edges: '0-1:1, 1-2:2' }],
    [DIRECTED, { n: '4', edges: '0>1:3, 1>0:4, 2>3:0', start: '1' }],
  ]) {
    const r = parseGraphFields(f, kind)
    assert.ok(r.ok)
    assert.deepEqual(formatGraphInput(r.value, kind), f)
  }
})

// ---------------------------------------------------------------- tata letak
test('layoutCircle: simpul di dalam kanvas, tidak bertumpuk', () => {
  for (let n = 1; n <= GRAPH_MAX_N; n++) {
    const pos = layoutCircle(n)
    assert.equal(pos.length, n)
    for (const p of pos) {
      assert.ok(p.x - GRAPH_NODE_R >= 0 && p.x + GRAPH_NODE_R <= GRAPH_VIEW_W, `n=${n}: x ${p.x} keluar kanvas`)
      assert.ok(p.y - GRAPH_NODE_R >= 0 && p.y + GRAPH_NODE_R <= GRAPH_VIEW_H, `n=${n}: y ${p.y} keluar kanvas`)
    }
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const gap = Math.hypot(pos[i].x - pos[j].x, pos[i].y - pos[j].y)
        assert.ok(gap >= GRAPH_NODE_R * 2 + 8, `n=${n}: simpul ${i} dan ${j} terlalu dekat (${gap.toFixed(1)})`)
      }
    }
  }
})

test('buildAdj mengurutkan tetangga naik dan menghormati arah', () => {
  const und = buildAdj(4, [[0, 3], [0, 1], [2, 0]], false)
  assert.deepEqual(und[0].map((x) => x.v), [1, 2, 3])
  assert.deepEqual(und[3].map((x) => x.v), [0])
  const dir = buildAdj(3, [[0, 2, 5], [2, 0, 1]], true)
  assert.deepEqual(dir[0], [{ v: 2, w: 5, e: 0 }])
  assert.deepEqual(dir[1], [])
})

// ---------------------------------------------------------------- pemeriksaan umum semua langkah
const PANEL_OK = (p, where) => {
  assert.ok(['list', 'table'].includes(p.type), `${where}: jenis panel ${p.type}`)
  if (p.type === 'list') assert.ok(Array.isArray(p.items) && typeof p.title === 'string', `${where}: panel daftar`)
  else {
    assert.ok(p.rows.every((r) => r.length === p.headers.length), `${where}: lebar baris tabel tidak sama dengan header`)
    assert.ok(p.activeRow === -1 || (p.activeRow >= 0 && p.activeRow < p.rows.length), `${where}: activeRow ${p.activeRow} di luar tabel`)
  }
}

function checkSteps(steps, input, code, kind, name) {
  const lines = code.split('\n').length
  const { n, edges } = input
  assert.ok(steps.length >= 3, `${name}: terlalu sedikit langkah`)
  for (const [s, step] of steps.entries()) {
    const where = `${name} langkah ${s + 1}`
    for (const l of [].concat(step.line)) assert.ok(Number.isInteger(l) && l >= 1 && l <= lines, `${where}: baris ${l} di luar kode (${lines} baris)`)
    assert.ok(typeof step.note === 'string' && step.note.length > 0, `${where}: catatan kosong`)
    assert.ok(!/undefined|NaN|\[object/.test(step.note), `${where}: catatan berisi nilai rusak: ${step.note}`)
    const v = step.view
    assert.equal(v.directed, kind.directed)
    assert.equal(v.weighted, kind.weighted)
    assert.equal(v.nodes.length, n, `${where}: jumlah simpul`)
    assert.equal(v.edges.length, edges.length, `${where}: jumlah sisi`)
    v.nodes.forEach((nd, i) => {
      assert.equal(nd.id, i)
      assert.ok(GRAPH_NODE_STATUS[nd.mark], `${where}: status simpul ${i} tak dikenal (${nd.mark})`)
      assert.ok(Number.isFinite(nd.x) && Number.isFinite(nd.y))
      assert.ok(!/undefined|NaN/.test(nd.sub), `${where}: sub simpul ${i}: ${nd.sub}`)
    })
    v.edges.forEach((e, i) => {
      assert.deepEqual([e.u, e.v], [edges[i][0], edges[i][1]])
      assert.equal(e.w, kind.weighted ? edges[i][2] : null)
      assert.ok(GRAPH_EDGE_STATUS[e.mark], `${where}: status sisi ${i} tak dikenal (${e.mark})`)
    })
    // Keterangan khusus algoritma harus mencakup semua status yang dipakai di langkah itu.
    for (const nd of v.nodes) assert.ok(v.labels?.[nd.mark], `${where}: keterangan status simpul "${nd.mark}" tidak ada`)
    for (const e of v.edges) assert.ok(v.edgeLabels?.[e.mark], `${where}: keterangan status sisi "${e.mark}" tidak ada`)
    v.panels.forEach((p) => PANEL_OK(p, where))
  }
}

const ENTRIES = {
  bfsGraph: { steps: bfsGraphSteps, code: bfsGraphCode, kind: UNWEIGHTED },
  dfsGraph: { steps: dfsGraphSteps, code: dfsGraphCode, kind: UNWEIGHTED },
  prim: { steps: primSteps, code: primCode, kind: { directed: false, weighted: true } },
  kruskal: { steps: kruskalSteps, code: kruskalCode, kind: { directed: false, weighted: true } },
  dijkstra: { steps: dijkstraSteps, code: dijkstraCode, kind: { directed: true, weighted: true } },
  bellmanFord: { steps: bellmanFordSteps, code: bellmanFordCode, kind: { directed: true, weighted: true } },
}

test('registry: setiap entri graf lengkap, dan contoh serta masukan awalnya lolos pembaca masukan', () => {
  for (const key of Object.keys(ENTRIES)) {
    const e = visualizers[key]
    assert.equal(e.kind, 'graph', key)
    assert.equal(e.buildSteps, ENTRIES[key].steps, `${key}: buildSteps`)
    assert.equal(e.code, ENTRIES[key].code, `${key}: code`)
    assert.ok(e.title && e.codeLabel && e.canvasLabel && e.inputHint, `${key}: teks kurang`)
    assert.ok(e.fields.length >= 2 && e.fields.every((f) => f.key && f.label))
    for (const [label, value] of [['masukan awal', e.initialInput], ...e.presets.map((p) => [p.label, p.value])]) {
      const parsed = e.parseInput(e.formatInput(value))
      assert.ok(parsed.ok, `${key} / ${label}: ${parsed.error}`)
      assert.deepEqual(parsed.value.edges, value.edges, `${key} / ${label}: sisi berubah setelah format dan baca ulang`)
      assert.equal(parsed.value.n, value.n)
      if (e.fields.some((f) => f.key === 'start')) assert.equal(parsed.value.start, value.start)
      checkSteps(e.buildSteps(value), value, e.code, ENTRIES[key].kind, `${key} / ${label}`)
    }
    for (const f of e.fields) assert.ok(Object.hasOwn(e.formatInput(e.initialInput), f.key), `${key}: isian ${f.key} tidak diisi formatInput`)
    // legenda hanya berisi status yang dikenal
    for (const k of e.legend) assert.ok(GRAPH_NODE_STATUS[k], `${key}: legenda simpul ${k}`)
    for (const k of e.edgeLegend) assert.ok(GRAPH_EDGE_STATUS[k], `${key}: legenda sisi ${k}`)
  }
})

test('materials.json: materi graf memakai visualizer graf, dan visualizer pohon BFS/DFS tetap ada', () => {
  const m = JSON.parse(readFileSync(new URL('../content/materials.json', import.meta.url), 'utf8'))
  const by = Object.fromEntries(m.map((x) => [x.id, x.visualizer]))
  assert.deepEqual(by['graph-bfs'], ['bfsGraph', 'bfsTree'])
  assert.deepEqual(by['graph-dfs'], ['dfsGraph', 'dfsTree'])
  assert.deepEqual(by['mst'], ['prim', 'kruskal'])
  // materi 13 dipecah: 13.1 Bellman-Ford dan 13.2 Dijkstra, masing-masing dengan satu visualizer
  assert.equal(by['bellman-ford'], 'bellmanFord')
  assert.equal(by['dijkstra'], 'dijkstra')
})

// ---------------------------------------------------------------- kode yang tampil = solusi challenge
const CASES = {
  'graph-bfs': { fn: bfsGraphCode, name: 'bfs' },
  'graph-dfs': { fn: dfsGraphCode, name: 'dfs' },
  mst: { fn: [primCode, kruskalCode], name: ['prim', 'kruskal'] },
  'shortest-path': { fn: [dijkstraCode, bellmanFordCode], name: ['dijkstra', 'bellmanFord'] },
}

test('kode yang tampil di visualizer menghasilkan jawaban yang sama dengan semua test case soal challenge', () => {
  for (const [id, { fn, name }] of Object.entries(CASES)) {
    const ch = challenge(id)
    const solution = compileSolution(ch.solution)
    for (const [i, c] of [].concat(fn).entries()) {
      const shown = compile(c, [].concat(name)[i])
      for (const tc of ch.testCases) {
        const input = id === 'mst' && [].concat(name)[i] === 'prim' ? [...tc.input, 0] : tc.input
        assert.deepEqual(sentinel(shown(...JSON.parse(JSON.stringify(input)))), tc.expected, `${id} / ${[].concat(name)[i]} / ${JSON.stringify(tc.input)}`)
        assert.deepEqual(solution(...JSON.parse(JSON.stringify(tc.input))), tc.expected)
      }
    }
  }
})

test('hasil langkah terakhir sama dengan semua test case soal challenge', () => {
  for (const tc of challenge('graph-bfs').testCases) {
    const [n, edges, start] = tc.input
    const steps = bfsGraphSteps({ n, edges, start })
    const order = steps.at(-1).view.panels.find((p) => p.title.startsWith('urutan')).items.map(Number)
    assert.deepEqual(order, tc.expected, `BFS ${JSON.stringify(tc.input)}`)
  }
  for (const tc of challenge('graph-dfs').testCases) {
    const [n, edges, start] = tc.input
    const order = dfsGraphSteps({ n, edges, start }).at(-1).view.panels.find((p) => p.title.startsWith('urutan')).items.map(Number)
    assert.deepEqual(order, tc.expected, `DFS ${JSON.stringify(tc.input)}`)
  }
  for (const tc of challenge('mst').testCases) {
    const [n, edges] = tc.input
    assert.equal(totalOf(kruskalSteps({ n, edges })), tc.expected, `Kruskal ${JSON.stringify(tc.input)}`)
    for (const start of [0, n - 1]) assert.equal(totalOf(primSteps({ n, edges, start })), tc.expected, `Prim dari ${start} ${JSON.stringify(tc.input)}`)
  }
  for (const tc of challenge('shortest-path').testCases) {
    const [n, edges, start] = tc.input
    assert.deepEqual(distOf(dijkstraSteps({ n, edges, start })), tc.expected, `Dijkstra ${JSON.stringify(tc.input)}`)
    assert.deepEqual(distOf(bellmanFordSteps({ n, edges, start })), tc.expected, `Bellman-Ford ${JSON.stringify(tc.input)}`)
  }
})

// ---------------------------------------------------------------- BFS dan DFS
test('BFS dan DFS: 300 graf acak (termasuk tak terhubung) cocok dengan solusi challenge dan keadaan tiap langkah konsisten', () => {
  const rng = seeded(11)
  const pick = (k) => Math.floor(rng() * k)
  const bfsSolution = compileSolution(challenge('graph-bfs').solution)
  const dfsSolution = compileSolution(challenge('graph-dfs').solution)
  for (let t = 0; t < 300; t++) {
    let input
    if (t % 2 === 0) input = randomGraph(UNWEIGHTED, rng)
    else {
      const n = 1 + pick(8)
      const seen = new Set()
      const edges = []
      for (let k = pick(2 * n); k > 0; k--) {
        const a = pick(n)
        const b = pick(n)
        const key = a < b ? `${a},${b}` : `${b},${a}`
        if (a !== b && !seen.has(key)) {
          seen.add(key)
          edges.push([a, b])
        }
      }
      input = { n, edges, start: pick(n) }
    }
    const { n, edges, start } = input
    const reach = reachable(n, edges, false, start)
    const count = reach.filter(Boolean).length

    const bfs = bfsGraphSteps(input)
    const bfsOrder = bfs.at(-1).view.panels.find((p) => p.title.startsWith('urutan')).items.map(Number)
    assert.deepEqual(bfsOrder, bfsSolution(n, edges, start), `BFS acak ${t}`)
    assert.equal(new Set(bfsOrder).size, count, 'BFS mengunjungi tepat simpul yang terjangkau')
    for (const [s, step] of bfs.entries()) {
      const queue = step.view.panels.find((p) => p.title.startsWith('antrean')).items.map(Number)
      const marked = step.view.nodes.filter((x) => x.mark === 'queued').map((x) => x.id)
      assert.deepEqual(marked.sort(), queue.slice().sort(), `BFS acak ${t} langkah ${s + 1}: simpul bertanda antrean = isi antrean`)
    }
    const last = bfs.at(-1).view
    assert.equal(last.edges.filter((e) => e.mark === 'chosen').length, count - 1, 'BFS: sisi pohon = simpul terjangkau − 1')
    assert.equal(last.nodes.filter((x) => x.mark === 'visited').length, count)
    assert.ok(last.nodes.every((x) => (reach[x.id] ? x.mark === 'visited' : x.mark === 'normal')))

    const dfs = dfsGraphSteps(input)
    const dfsOrder = dfs.at(-1).view.panels.find((p) => p.title.startsWith('urutan')).items.map(Number)
    assert.deepEqual(dfsOrder, dfsSolution(n, edges, start), `DFS acak ${t}`)
    for (const [s, step] of dfs.entries()) {
      const stack = step.view.panels.find((p) => p.title.startsWith('Tumpukan')).items.map((x) => Number(/\d+/.exec(x)[0]))
      const onStack = step.view.nodes.filter((x) => x.mark === 'waiting' || x.mark === 'current').map((x) => x.id)
      assert.deepEqual(onStack.sort(), stack.slice().sort(), `DFS acak ${t} langkah ${s + 1}: simpul menunggu/aktif = isi tumpukan`)
      assert.ok(step.view.nodes.filter((x) => x.mark === 'current').length <= 1)
    }
    assert.equal(dfs.at(-1).view.edges.filter((e) => e.mark === 'chosen').length, count - 1, 'DFS: sisi pohon = simpul terjangkau − 1')
  }
})

test('BFS: contoh pada soal (urutan 0, 1, 2, 3, 4) dan jumlah langkah', () => {
  const g = { n: 5, edges: [[0, 2], [0, 1], [1, 3], [2, 3], [3, 4]], start: 0 }
  assert.equal(bfsGraphSteps(g).length, 33)
  assert.equal(dfsGraphSteps(g).length, 25)
  const first = bfsGraphSteps({ n: 1, edges: [], start: 0 })
  assert.equal(first.at(-1).view.nodes[0].mark, 'visited')
})

// ---------------------------------------------------------------- MST
test('Prim dan Kruskal: 300 graf acak cocok dengan pembanding brute force', () => {
  const rng = seeded(23)
  for (let t = 0; t < 300; t++) {
    const input = randomGraph(PRIM, rng)
    // Brute force hanya untuk graf kecil: potong sisi bila terlalu banyak (2^m).
    if (input.edges.length > 12) continue
    const expected = bruteMst(input.n, input.edges)
    assert.ok(Number.isFinite(expected), `acak ${t}: graf harus terhubung`)
    const kr = kruskalSteps(input)
    assert.equal(totalOf(kr), expected, `Kruskal acak ${t}`)
    for (const start of [input.start, 0, input.n - 1]) {
      const pr = primSteps({ ...input, start })
      assert.equal(totalOf(pr), expected, `Prim acak ${t} dari ${start}`)
      const treeCount = pr.at(-1).view.edges.filter((e) => e.mark === 'chosen').length
      assert.equal(treeCount, input.n - 1, 'Prim: n − 1 sisi pohon')
      const chosen = pr.at(-1).view.edges.filter((e) => e.mark === 'chosen')
      assert.equal(chosen.reduce((s, e) => s + e.w, 0), expected, 'bobot sisi hijau = total')
      assert.ok(isConnected(input.n, chosen.map((e) => [e.u, e.v])), 'sisi pohon menghubungkan semua simpul')
      assert.ok(pr.at(-1).view.nodes.every((x) => x.mark === 'visited'))
    }
    const kEdges = kr.at(-1).view.edges
    assert.equal(kEdges.filter((e) => e.mark === 'chosen').length, input.n - 1, 'Kruskal: n − 1 sisi pohon')
    assert.ok(kEdges.every((e) => e.mark === 'chosen' || e.mark === 'rejected'), 'Kruskal: semua sisi sudah diputuskan')
    assert.equal(kEdges.filter((e) => e.mark === 'chosen').reduce((s, e) => s + e.w, 0), expected)
  }
})

test('Kruskal: jumlah langkah, keputusan tiap sisi, dan komponen pada contoh klasik', () => {
  const g = visualizers.kruskal.initialInput
  const steps = kruskalSteps(g)
  assert.equal(steps.length, 33)
  assert.equal(totalOf(steps), 37)
  const table = steps.at(-1).view.panels.find((p) => p.type === 'table')
  assert.equal(table.rows.filter((r) => r[2] === 'dipilih').length, 8)
  assert.equal(table.rows.filter((r) => r[2] === 'ditolak (siklus)').length, 6)
  // urutan menurut bobot (stabil): bobot tidak pernah turun
  const w = table.rows.map((r) => Number(r[1]))
  assert.deepEqual(w, w.slice().sort((a, b) => a - b))
  // di akhir semua simpul satu komponen
  assert.equal(steps.at(-1).view.panels.find((p) => p.title.startsWith('Komponen')).items.length, 1)
})

test('Prim: hasil sama dari simpul awal mana pun dan tabel kunci konsisten dengan tanda simpul', () => {
  const g = visualizers.prim.initialInput
  const steps = primSteps(g)
  assert.equal(steps.length, 50)
  for (const [s, step] of steps.entries()) {
    const table = step.view.panels.find((p) => p.type === 'table' && p.caption.startsWith('kunci'))
    for (const nd of step.view.nodes) {
      const status = table.rows[nd.id][3]
      if (nd.mark === 'visited') assert.equal(status, 'di pohon', `langkah ${s + 1}`)
      if (nd.mark === 'queued') assert.equal(status, 'kandidat', `langkah ${s + 1}`)
      if (nd.mark === 'normal') assert.equal(status, 'belum tersentuh', `langkah ${s + 1}`)
    }
  }
})

// ---------------------------------------------------------------- jalur terpendek
test('Dijkstra: 300 graf berarah acak cocok dengan Floyd-Warshall', () => {
  const rng = seeded(37)
  for (let t = 0; t < 300; t++) {
    const input = randomGraph(DIRECTED, rng)
    const raw = floyd(input.n, input.edges, input.start)
    const expected = sentinel(raw)
    const steps = dijkstraSteps(input)
    assert.deepEqual(distOf(steps), expected, `Dijkstra acak ${t}: ${JSON.stringify(input)}`)
    const shown = compile(dijkstraCode, 'dijkstra')
    assert.deepEqual(shown(input.n, input.edges, input.start), expected)
    // Sisi hijau = pohon jalur terpendek: tiap simpul terjangkau (selain sumber) punya tepat satu sisi masuk yang dipilih,
    // dan jaraknya sama dengan jarak induk + bobot.
    const last = steps.at(-1).view
    const chosen = last.edges.filter((e) => e.mark === 'chosen')
    const reach = expected.filter((d) => d !== -1).length
    assert.equal(chosen.length, reach - 1, `Dijkstra acak ${t}: sisi pohon`)
    for (const e of chosen) assert.equal(expected[e.u] + e.w, expected[e.v], `Dijkstra acak ${t}: sisi ${e.u}→${e.v} tidak berada pada jalur terpendek`)
    assert.equal(new Set(chosen.map((e) => e.v)).size, chosen.length, 'tiap simpul punya satu sisi masuk')
    assert.ok(last.nodes.every((x) => (expected[x.id] === -1 ? x.mark === 'normal' : x.mark === 'visited')))
  }
})

test('Bellman-Ford: 400 graf acak (bobot negatif) cocok dengan Floyd-Warshall, termasuk deteksi siklus negatif', () => {
  const rng = seeded(41)
  let negative = 0
  let withNegativeWeights = 0
  for (let t = 0; t < 400; t++) {
    let input = randomGraph(BELLMAN, rng)
    if (t % 4 === 3) {
      // Paksa siklus negatif yang terjangkau: sisi (u, v) dibuat ringan dan lawan arahnya (v, u) dibuat −9, dengan u terjangkau dari sumber.
      const reach = reachable(input.n, input.edges, true, input.start)
      const k = input.edges.findIndex((e) => reach[e[0]])
      if (k !== -1) {
        const edges = input.edges.map((e) => e.slice())
        const [u, v] = edges[k]
        edges[k][2] = 1
        const back = edges.findIndex((e) => e[0] === v && e[1] === u)
        if (back === -1) edges.push([v, u, -9])
        else edges[back][2] = -9
        input = { ...input, edges }
      }
    }
    const expected = floyd(input.n, input.edges, input.start) // jarak apa adanya (Infinity = tidak terjangkau) atau null
    const steps = bellmanFordSteps(input)
    const shown = compile(bellmanFordCode, 'bellmanFord')
    assert.deepEqual(shown(input.n, input.edges, input.start), expected, `kode Bellman-Ford acak ${t}`)
    if (input.edges.some((e) => e[2] < 0)) withNegativeWeights++
    if (expected === null) {
      negative++
      assert.match(steps.at(-1).note, /siklus negatif yang terjangkau/, `acak ${t}`)
      assert.ok(steps.at(-1).view.edges.some((e) => e.mark === 'considered'), 'sisi penyebab ditandai')
    } else {
      assert.deepEqual(rawDistOf(steps), expected, `Bellman-Ford acak ${t}: ${JSON.stringify(input)}`)
      assert.doesNotMatch(steps.at(-1).note, /siklus negatif yang terjangkau/)
      assert.ok(steps.at(-1).view.nodes.every((x) => (expected[x.id] === Infinity ? x.mark === 'normal' : x.mark === 'visited')))
    }
  }
  assert.ok(negative > 20, `uji harus mencakup siklus negatif (${negative})`)
  assert.ok(withNegativeWeights > 100, `uji harus mencakup bobot negatif (${withNegativeWeights})`)
})

test('Bellman-Ford: berhenti lebih awal bila tidak ada perubahan, dan contoh siklus negatif', () => {
  const classic = visualizers.bellmanFord.presets.find((p) => p.label.startsWith('Bobot negatif'))
  assert.deepEqual(rawDistOf(bellmanFordSteps(classic.value)), [0, 2, 4, 7, -2])
  const cyc = visualizers.bellmanFord.presets.find((p) => p.label.startsWith('Siklus negatif'))
  const steps = bellmanFordSteps(cyc.value)
  assert.match(steps.at(-1).note, /null/)
  // 2 putaran penuh (n − 1) dijalankan sebelum pemeriksaan
  assert.equal(steps.filter((s) => /^Putaran \d/.test(s.note) && /periksa semua/.test(s.note)).length, 2)
  const early = bellmanFordSteps({ n: 4, edges: [[0, 1, 1], [1, 2, 1], [2, 3, 1]], start: 0 })
  assert.ok(early.some((s) => /berhenti lebih awal/.test(s.note)), 'graf rantai stabil sebelum putaran ke-3')
})

test('Dijkstra: penolakan bobot negatif dan keadaan simpul tak terjangkau', () => {
  assert.equal(visualizers.dijkstra.parseInput({ n: '3', edges: '0>1:-1', start: '0' }).ok, false)
  const steps = dijkstraSteps({ n: 4, edges: [[0, 1, 2], [1, 2, 3]], start: 0 })
  assert.ok(steps.some((s) => s.line === 13), 'langkah break muncul bila sisa simpul tak terjangkau')
  assert.deepEqual(distOf(steps), [0, 2, 5, -1])
})

// ---------------------------------------------------------------- masukan acak
test('randomGraph: selalu lolos pembaca masukan masing-masing visualizer', () => {
  const rng = seeded(5)
  for (const key of Object.keys(ENTRIES)) {
    const e = visualizers[key]
    for (let t = 0; t < 150; t++) {
      const v = e.randomInput()
      const parsed = e.parseInput(e.formatInput(v))
      assert.ok(parsed.ok, `${key} acak ${t}: ${parsed.error} (${JSON.stringify(v)})`)
      assert.ok(v.n >= 5 && v.n <= 7 && v.edges.length <= GRAPH_MAX_EDGES)
    }
  }
  // berarah: semua simpul terjangkau dari sumber, kecuali maksimal satu simpul yang sengaja dilewati
  let skipped = 0
  for (let t = 0; t < 200; t++) {
    const g = randomGraph(DIRECTED, rng)
    const reach = reachable(g.n, g.edges, true, g.start)
    const missing = reach.filter((x) => !x).length
    assert.ok(missing <= 1, `acak ${t}: ${missing} simpul tidak terjangkau`)
    skipped += missing
  }
  assert.ok(skipped > 0, 'kasus simpul tak terjangkau (∞) muncul sesekali')
  // bobot negatif muncul, tetapi tidak pernah membentuk siklus negatif
  let neg = 0
  for (let t = 0; t < 300; t++) {
    const g = randomGraph(BELLMAN, rng)
    if (g.edges.some((e) => e[2] < 0)) neg++
    assert.notEqual(floyd(g.n, g.edges, g.start), null, `acak ${t}: tidak boleh ada siklus negatif`)
    assert.ok(g.edges.every((e) => e[2] >= -9 && e[2] <= 99))
  }
  assert.ok(neg > 50, `bobot negatif harus sering muncul (${neg})`)
})

// ---------------------------------------------------------------- soal challenge Bellman-Ford (materi 13.1)
// Soal: larik jarak, "INF" untuk simpul tak terjangkau, dan false bila ada siklus negatif yang terjangkau.
// Kode visualizer mengembalikan Infinity dan null untuk dua keadaan itu.
const asChallengeAnswer = (d) => (d === null ? false : d.map((x) => (x === Infinity ? 'INF' : x)))

test('soal challenge bellman-ford: kode visualizer, solusi, dan langkah terakhir cocok dengan semua test case', () => {
  const ch = challenge('bellman-ford')
  const solution = compileSolution(ch.solution)
  const shown = compile(bellmanFordCode, 'bellmanFord')
  let cycles = 0
  let unreachable = 0
  for (const tc of ch.testCases) {
    const copy = () => JSON.parse(JSON.stringify(tc.input))
    assert.deepEqual(solution(...copy()), tc.expected, `solusi ${JSON.stringify(tc.input)}`)
    assert.deepEqual(asChallengeAnswer(shown(...copy())), tc.expected, `kode visualizer ${JSON.stringify(tc.input)}`)
    const [n, edges, start] = tc.input
    const steps = bellmanFordSteps({ n, edges, start })
    if (tc.expected === false) {
      cycles++
      assert.match(steps.at(-1).note, /siklus negatif yang terjangkau/, `langkah terakhir ${JSON.stringify(tc.input)}`)
    } else {
      if (tc.expected.includes('INF')) unreachable++
      assert.deepEqual(asChallengeAnswer(rawDistOf(steps)), tc.expected, `tabel jarak ${JSON.stringify(tc.input)}`)
    }
  }
  assert.ok(cycles >= 2, 'ada test case siklus negatif')
  assert.ok(unreachable >= 2, 'ada test case simpul tak terjangkau')
  assert.ok(ch.testCases.some((tc) => tc.expected !== false && tc.input[1].some((e) => e[2] < 0)), 'ada bobot negatif tanpa siklus negatif')
  // siklus negatif yang tidak terjangkau dari sumber tidak boleh menghasilkan false
  const unreachableCycle = ch.testCases.find((tc) => tc.input[0] === 4 && tc.input[1].length === 3 && tc.input[2] === 0 && tc.expected !== false)
  assert.ok(unreachableCycle, 'kasus tepi: siklus negatif tidak terjangkau')
})

test('soal challenge bellman-ford: 400 graf acak, solusi cocok dengan Floyd-Warshall dan kode visualizer', () => {
  const rng = seeded(97)
  const solution = compileSolution(challenge('bellman-ford').solution)
  const shown = compile(bellmanFordCode, 'bellmanFord')
  let cycles = 0
  for (let t = 0; t < 400; t++) {
    let input = randomGraph(BELLMAN, rng)
    if (t % 4 === 3) {
      // Paksa siklus negatif yang terjangkau (cara yang sama dengan uji acak Bellman-Ford di atas).
      const reach = reachable(input.n, input.edges, true, input.start)
      const k = input.edges.findIndex((e) => reach[e[0]])
      if (k !== -1) {
        const edges = input.edges.map((e) => e.slice())
        const [u, v] = edges[k]
        edges[k][2] = 1
        const back = edges.findIndex((e) => e[0] === v && e[1] === u)
        if (back === -1) edges.push([v, u, -9])
        else edges[back][2] = -9
        input = { ...input, edges }
      }
    }
    const expected = floyd(input.n, input.edges, input.start)
    const want = asChallengeAnswer(expected)
    if (expected === null) cycles++
    assert.deepEqual(solution(input.n, input.edges, input.start), want, `solusi acak ${t}: ${JSON.stringify(input)}`)
    assert.deepEqual(asChallengeAnswer(shown(input.n, input.edges, input.start)), want, `kode visualizer acak ${t}`)
  }
  assert.ok(cycles > 5, `uji harus mencakup siklus negatif (${cycles})`)
})

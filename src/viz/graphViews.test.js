import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runTrace, traces } from '../algorithms/traces.js'
import { buildGraph, edgeIndex, layoutPositions, letterName } from './graphModel.js'
import { EDGE_STATUS, NODE_STATUS, deriveViews } from './graphViews.js'
import { DESIGN_POSITIONS, vizConfig, vizIds } from './vizConfig.js'
import { buildCodeSections } from './codeModel.js'

const run = (id, presetIndex = 0) => {
  const cfg = vizConfig[id]
  const values = cfg.presets[presetIndex].values
  const r = runTrace(traces[cfg.trace], values)
  assert.ok(r.ok, `${id}/${presetIndex}: ${r.error}`)
  const graph = buildGraph(cfg.kind, values)
  assert.ok(graph, `${id}/${presetIndex}: graf`)
  return { cfg, values, steps: r.steps, graph, views: deriveViews(cfg.kind, r.steps, graph) }
}
const subs = (view) => Object.fromEntries(view.nodes.map((n) => [n.name, n.sub]))
const status = (view) => Object.fromEntries(view.nodes.map((n) => [n.name, n.status]))
const edgesOf = (view, st) => view.edges.filter((e) => e.status === st).map((e) => `${e.u}${e.v}`).sort()

test('enam visualizer graf: Preset 1 memakai simpul huruf A sampai F dan graf contoh desain', () => {
  assert.deepEqual(vizIds, ['dijkstra', 'bellman-ford', 'bfs', 'dfs', 'prim', 'kruskal'])
  for (const id of vizIds) {
    const { graph } = run(id)
    assert.deepEqual(graph.names, ['A', 'B', 'C', 'D', 'E', 'F'], id)
    assert.equal(graph.edges.length, 9, `${id}: 9 sisi`)
  }
  assert.deepEqual(DESIGN_POSITIONS.A, { x: 0.1, y: 0.5 })
  assert.equal(letterName(0), 'A')
  assert.equal(letterName(5), 'F')
})

test('jenis graf: Dijkstra dan Bellman-Ford berarah berbobot; BFS dan DFS tak berarah tanpa bobot; Prim dan Kruskal tak berarah berbobot', () => {
  const k = (id) => { const g = run(id).graph; return [g.directed, g.weighted] }
  assert.deepEqual(k('dijkstra'), [true, true])
  assert.deepEqual(k('bellman-ford'), [true, true])
  assert.deepEqual(k('bfs'), [false, false])
  assert.deepEqual(k('dfs'), [false, false])
  assert.deepEqual(k('prim'), [false, true])
  assert.deepEqual(k('kruskal'), [false, true])
  // adjacency list satu arah menjadi graf berarah
  assert.equal(run('dfs', 1).graph.directed, true)
})

test('semua langkah semua preset: jumlah tampilan = jumlah langkah, status sah, dan sisi aliran/pohon ada di graf', () => {
  for (const id of vizIds) {
    vizConfig[id].presets.forEach((_, p) => {
      const { steps, graph, views } = run(id, p)
      assert.equal(views.length, steps.length, `${id}/${p}`)
      for (const v of views) {
        assert.equal(v.nodes.length, graph.names.length)
        assert.equal(v.edges.length, graph.edges.length)
        assert.ok(v.nodes.every((n) => NODE_STATUS.includes(n.status)), `${id}/${p}: status simpul`)
        assert.ok(v.edges.every((e) => EDGE_STATUS.includes(e.status)), `${id}/${p}: status sisi`)
        assert.ok(v.edges.filter((e) => e.status === 'flow').length <= 1, 'paling banyak satu sisi aliran')
      }
    })
  }
})

test('Dijkstra Preset 1 (sumber A): nilai d akhir 0, 3, 2, 8, 10, 13 (F lewat E: 10 + 3); semua simpul selesai; pohon A→C, C→B, B→D, D→E, E→F', () => {
  const { views } = run('dijkstra')
  const last = views.at(-1)
  assert.deepEqual(subs(last), { A: 'd = 0', B: 'd = 3', C: 'd = 2', D: 'd = 8', E: 'd = 10', F: 'd = 13' })
  assert.ok(last.nodes.every((n) => n.status === 'done'))
  assert.deepEqual(edgesOf(last, 'tree'), ['AC', 'BD', 'CB', 'DE', 'EF'])
  assert.deepEqual(status(views[0]), { A: 'unvisited', B: 'unvisited', C: 'unvisited', D: 'unvisited', E: 'unvisited', F: 'unvisited' })
})

test('Dijkstra: saat RELAX(D, E) menurunkan E dari 12 ke 10, E bertanda relax dan sub menulis "d = 12 → 10", sisi D→E mengalir', () => {
  const { steps, views } = run('dijkstra')
  const i = steps.findIndex((s, k) => s.line === 14 && views[k].nodes.find((n) => n.name === 'E').sub === 'd = 12 → 10')
  assert.ok(i > 0, 'langkah penurunan E ada')
  assert.equal(status(views[i]).E, 'relax')
  assert.equal(status(views[i]).D, 'active')
  assert.deepEqual(edgesOf(views[i], 'flow'), ['DE'])
  assert.equal(subs(views[i]).D, 'd = 8')
})

test('Dijkstra: simpul di S bertanda done dan tidak berubah kembali menjadi unvisited', () => {
  const { views } = run('dijkstra')
  const done = new Set()
  for (const v of views) {
    for (const n of v.nodes) {
      if (done.has(n.name)) assert.equal(n.status, 'done', `${n.name} harus tetap done`)
      if (n.status === 'done') done.add(n.name)
    }
  }
})

test('Bellman-Ford Preset 1: nilai akhir sama dengan Dijkstra, semua simpul terjangkau, dan bobot negatif memberi hasil benar', () => {
  const last = run('bellman-ford').views.at(-1)
  assert.deepEqual(subs(last), { A: 'd = 0', B: 'd = 3', C: 'd = 2', D: 'd = 8', E: 'd = 10', F: 'd = 13' })
  assert.ok(last.nodes.every((n) => n.status === 'reached'))
  const neg = run('bellman-ford', 2).views.at(-1)
  assert.deepEqual(subs(neg), { A: 'd = 0', B: 'd = 4', C: 'd = 1', D: 'd = 3' })
  assert.deepEqual(edgesOf(neg, 'tree'), ['AB', 'BC', 'CD'])
})

test('BFS Preset 1 dari A: semua simpul selesai, pohon 5 sisi, dan d terakhir 0,1,1,2,2,3', () => {
  const last = run('bfs').views.at(-1)
  assert.ok(last.nodes.every((n) => n.status === 'done'))
  assert.deepEqual(subs(last), { A: 'd = 0', B: 'd = 1', C: 'd = 1', D: 'd = 2', E: 'd = 2', F: 'd = 3' })
  assert.equal(edgesOf(last, 'tree').length, 5)
})

test('DFS Preset 1: semua simpul selesai dengan waktu d/f yang bersarang (1/12 untuk A)', () => {
  const last = run('dfs').views.at(-1)
  assert.ok(last.nodes.every((n) => n.status === 'done'))
  assert.equal(subs(last).A, '1/12')
  for (const n of last.nodes) {
    const [d, f] = n.sub.split('/').map(Number)
    assert.ok(d >= 1 && f > d && f <= 12, `${n.name}: ${n.sub}`)
  }
  assert.equal(edgesOf(last, 'tree').length, 5)
})

test('Prim Preset 1 dari A: semua simpul di tree, 5 sisi tree dengan total 13', () => {
  const { views, graph } = run('prim')
  const last = views.at(-1)
  assert.ok(last.nodes.every((n) => n.status === 'done'))
  const tree = last.edges.filter((e) => e.status === 'tree')
  assert.equal(tree.length, 5)
  assert.equal(tree.reduce((a, e) => a + e.w, 0), 13)
  assert.equal(graph.edges.reduce((a, e) => a + e.w, 0), 4 + 2 + 1 + 5 + 8 + 10 + 2 + 6 + 3)
})

test('Kruskal Preset 1: 5 sisi diterima (total 13), 4 ditolak, dan sisi yang sedang diuji mengalir', () => {
  const { views, steps } = run('kruskal')
  const last = views.at(-1)
  const tree = last.edges.filter((e) => e.status === 'tree')
  assert.equal(tree.length, 5)
  assert.equal(tree.reduce((a, e) => a + e.w, 0), 13)
  assert.equal(last.edges.filter((e) => e.status === 'rejected').length, 4)
  assert.ok(views.some((v) => v.edges.some((e) => e.status === 'flow')), 'ada sisi aliran')
  assert.ok(steps.some((s) => s.line === 6))
  assert.ok(last.nodes.every((n) => n.status === 'done'))
})

test('layoutPositions: memakai posisi desain bila lengkap, jika tidak melingkar di dalam kotak 0 sampai 1', () => {
  const names = ['A', 'B', 'C', 'D', 'E', 'F']
  assert.deepEqual(layoutPositions(names, DESIGN_POSITIONS).C, { x: 0.38, y: 0.82 })
  const circle = layoutPositions(['p', 'q', 'r'], DESIGN_POSITIONS)
  for (const p of Object.values(circle)) assert.ok(p.x >= 0 && p.x <= 1 && p.y >= 0 && p.y <= 1)
  assert.deepEqual(layoutPositions(['x'], null).x, { x: 0.5, y: 0.5 })
})

test('buildGraph: isian tidak sah menghasilkan null, dan edgeIndex mengenali kebalikan hanya pada graf tak berarah', () => {
  assert.equal(buildGraph('dijkstra', { V: '', E: '', s: 'A' }), null)
  assert.equal(buildGraph('bfs', { G: 'A B' }), null)
  assert.equal(buildGraph('aneh', {}), null)
  const und = { directed: false, edges: [{ u: 'A', v: 'B' }] }
  const dir = { directed: true, edges: [{ u: 'A', v: 'B' }] }
  assert.equal(edgeIndex(und, 'B', 'A'), 0)
  assert.equal(edgeIndex(dir, 'B', 'A'), -1)
  assert.equal(edgeIndex(dir, 'A', 'B'), 0)
})

test('prosedur panel Kode: menutup semua baris kode tiap peraga tanpa celah dan tumpang tindih', () => {
  for (const id of vizIds) {
    const cfg = vizConfig[id]
    const code = traces[cfg.trace].code
    const total = code.split('\n').length
    const sections = buildCodeSections(code, cfg.procedures, null)
    assert.deepEqual(sections.flatMap((s) => s.rows.map((r) => r.global)), Array.from({ length: total }, (_, i) => i + 1), `${id}: baris`)
    for (const s of sections) assert.equal(s.rows[0].text.trim().length > 0, true)
    assert.deepEqual(sections[0].rows.map((r) => r.local), sections[0].rows.map((r) => r.global), `${id}: prosedur utama bernomor 1..`)
  }
  assert.equal(readFileSync(new URL('./vizConfig.js', import.meta.url), 'utf8').includes('DESIGN_POSITIONS'), true)
})

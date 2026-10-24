// Mengubah langkah peraga (tabel, variabel, daftar) menjadi keadaan gambar graf: status tiap simpul dan sisi.
// Semua data diambil dari isi langkah yang terstruktur (tanda sel tabel, nilai variabel), bukan dari teks catatan.
import { edgeIndex } from './graphModel.js'

const DASH = '–'
const empty = (t) => t === '' || t === DASH || t === undefined

/** Status simpul: unvisited, queued, reached, active, relax, done. Status sisi: normal, tree, flow, rejected. */
export const NODE_STATUS = ['unvisited', 'queued', 'reached', 'active', 'relax', 'done']
export const EDGE_STATUS = ['normal', 'tree', 'flow', 'rejected']

const varOf = (step, name) => step.vars.find((v) => v.name === name)?.value ?? DASH

/** Sisi yang sedang diperiksa (u, v) dari variabel langkah, bila u dan v keduanya terisi dan baris termasuk `lines`. */
function flowEdge(graph, step, lines) {
  if (!lines.includes(step.line)) return -1
  const u = varOf(step, 'u')
  const v = varOf(step, 'v')
  if (empty(u) || empty(v)) return -1
  return edgeIndex(graph, u, v)
}

/** Sisi pohon dari kolom induk (π): sisi (π, v) untuk setiap simpul v yang punya induk. */
function treeEdges(graph, cells, piCol) {
  const out = []
  graph.names.forEach((name, i) => {
    const p = cells[i][piCol].text
    if (empty(p) || p === 'NIL') return
    const k = edgeIndex(graph, p, name)
    if (k >= 0) out.push(k)
  })
  return out
}

const finite = (t) => !empty(t) && t !== '∞'

/** Anak panah menunjuk ke simpul mana: untuk sisi berarah selalu u → v. */
const edgesWith = (graph, tree, flow, rejected = []) =>
  graph.edges.map((e, k) => ({ ...e, status: flow === k ? 'flow' : tree.includes(k) ? 'tree' : rejected.includes(k) ? 'rejected' : 'normal' }))

const nodesFrom = (graph, status, sub) => graph.names.map((name, i) => ({ name, status: status(i), sub: sub(i) }))

// ------------------------------------------------------------------ per algoritma
const ALGO = {
  dijkstra(graph, step, prev) {
    const cells = step.tables[0].table.cells
    const old = prev?.tables?.[0]?.table.cells
    const status = (i) => ({ current: 'active', source: 'relax', path: 'relax', black: 'done' })[cells[i][0].mark] ?? 'unvisited'
    const sub = (i) => {
      const d = cells[i][0].text
      if (empty(d)) return ''
      const was = old?.[i]?.[0].text
      return cells[i][0].mark === 'path' && !empty(was) && was !== d ? `d = ${was} → ${d}` : `d = ${d}`
    }
    return { nodes: nodesFrom(graph, status, sub), edges: edgesWith(graph, treeEdges(graph, cells, 1), flowEdge(graph, step, [7, 8, 13, 14, 15])) }
  },
  'bellman-ford'(graph, step, prev) {
    const cells = step.tables[0].table.cells
    const old = prev?.tables?.[0]?.table.cells
    const status = (i) => {
      const m = cells[i][0].mark
      if (m === 'current') return 'active'
      if (m === 'source' || m === 'path') return 'relax'
      return finite(cells[i][0].text) ? 'reached' : 'unvisited'
    }
    const sub = (i) => {
      const d = cells[i][0].text
      if (empty(d)) return ''
      const was = old?.[i]?.[0].text
      return cells[i][0].mark === 'path' && !empty(was) && was !== d ? `d = ${was} → ${d}` : `d = ${d}`
    }
    return { nodes: nodesFrom(graph, status, sub), edges: edgesWith(graph, treeEdges(graph, cells, 1), flowEdge(graph, step, [3, 4, 5, 6, 7, 13, 14, 15])) }
  },
  bfs(graph, step) {
    const cells = step.tables[0].table.cells
    const status = (i) => ({ current: 'active', source: 'relax', black: 'done', gray: 'queued' })[cells[i][0].mark] ?? 'unvisited'
    const sub = (i) => (empty(cells[i][1].text) ? '' : `d = ${cells[i][1].text}`)
    return { nodes: nodesFrom(graph, status, sub), edges: edgesWith(graph, treeEdges(graph, cells, 2), flowEdge(graph, step, [12, 13, 14, 15, 16, 17])) }
  },
  dfs(graph, step) {
    const cells = step.tables[0].table.cells
    const status = (i) => ({ current: 'active', source: 'relax', black: 'done', gray: 'queued' })[cells[i][0].mark] ?? 'unvisited'
    const sub = (i) => {
      const d = cells[i][1].text
      const f = cells[i][2].text
      if (empty(d)) return ''
      return empty(f) ? `${d}/` : `${d}/${f}`
    }
    return { nodes: nodesFrom(graph, status, sub), edges: edgesWith(graph, treeEdges(graph, cells, 3), flowEdge(graph, step, [11, 12, 13, 14])) }
  },
  prim(graph, step) {
    const cells = step.tables[0].table.cells
    const status = (i) => {
      const m = cells[i][0].mark
      if (m === 'current') return 'active'
      if (m === 'source') return 'relax'
      if (m === 'black') return 'done'
      return finite(cells[i][0].text) ? 'queued' : 'unvisited'
    }
    const sub = (i) => (empty(cells[i][0].text) ? '' : `key = ${cells[i][0].text}`)
    return { nodes: nodesFrom(graph, status, sub), edges: edgesWith(graph, treeEdges(graph, cells, 1), flowEdge(graph, step, [8, 9, 10, 11])) }
  },
  kruskal(graph, step) {
    const table = step.tables?.[0]?.table
    const tree = []
    const rejected = []
    let flow = -1
    if (table) {
      table.rowHeaders.forEach((h, i) => {
        const [a, b] = h.match(/[A-Za-z0-9]+/g) ?? []
        const k = a && b ? edgeIndex(graph, a, b) : -1
        if (k < 0) return
        const result = table.cells[i][1].text
        if (result === 'diterima') tree.push(k)
        else if (result === 'ditolak') rejected.push(k)
        else if (table.cells[i][1].mark === 'current') flow = k
      })
    }
    const touched = new Set(tree.flatMap((k) => [graph.edges[k].u, graph.edges[k].v]))
    const u = varOf(step, 'u')
    const v = varOf(step, 'v')
    const examining = !empty(u) && !empty(v) && step.line >= 5 && step.line <= 8
    const status = (i) => {
      const name = graph.names[i]
      if (examining && (name === u || name === v)) return 'active'
      return touched.has(name) ? 'done' : 'unvisited'
    }
    return { nodes: nodesFrom(graph, status, () => ''), edges: edgesWith(graph, tree, flow, rejected) }
  },
}

/** Keadaan gambar untuk setiap langkah. @returns {Array<{ nodes: Array<{ name: string, status: string, sub: string }>, edges: Array<{ u: string, v: string, w: number | null, status: string }> }>} */
export function deriveViews(kind, steps, graph) {
  const fn = ALGO[kind]
  if (!fn) throw new Error(`Jenis visualizer tidak dikenal: ${kind}`)
  return steps.map((step, i) => fn(graph, step, steps[i - 1]))
}

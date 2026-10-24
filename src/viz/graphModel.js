// Model graf untuk visualizer: dari isian peraga (V/E atau G) menjadi simpul bernama huruf, sisi, dan posisi gambar.
import { parseBellmanFordInput } from '../algorithms/traces/bellmanFordPseudo.js'
import { parseAdjacencyInput } from '../algorithms/traces/bfsPseudo.js'
import { parseDijkstraInput } from '../algorithms/traces/dijkstraPseudo.js'
import { parseKruskalInput } from '../algorithms/traces/kruskalPseudo.js'
import { parsePrimInput } from '../algorithms/traces/primPseudo.js'

/**
 * @typedef {{ names: string[], edges: Array<{ u: string, v: string, w: number | null }>, directed: boolean, weighted: boolean }} Graph
 */

/** Sisi dari adjacency list. Bila setiap sisi punya lawan arah, graf dianggap tak berarah dan tiap pasangan digambar sekali. */
function fromAdjacency(names, pairs, weighted) {
  const key = (a, b) => `${a}\u0000${b}`
  const has = new Set(pairs.map((p) => key(p.u, p.v)))
  const symmetric = pairs.every((p) => p.u === p.v || has.has(key(p.v, p.u)))
  const order = (n) => names.indexOf(n)
  const edges = pairs
    .filter((p) => !symmetric || order(p.u) <= order(p.v))
    .map((p) => ({ u: p.u, v: p.v, w: weighted ? p.w : null }))
  return { edges, directed: !symmetric }
}

/**
 * Membaca isian menjadi graf. `kind` = jenis visualizer: dijkstra, bellman-ford, bfs, dfs, prim, kruskal.
 * @returns {Graph | null} null bila isian tidak sah
 */
export function buildGraph(kind, values) {
  if (kind === 'dijkstra' || kind === 'bellman-ford') {
    const p = (kind === 'dijkstra' ? parseDijkstraInput : parseBellmanFordInput)({ V: values.V, E: values.E })
    if (!p.ok) return null
    return { names: p.names, edges: p.edges.map(({ u, v, w }) => ({ u, v, w })), directed: true, weighted: true }
  }
  if (kind === 'bfs' || kind === 'dfs') {
    const p = parseAdjacencyInput(values.G)
    if (!p.ok) return null
    const pairs = p.names.flatMap((u) => p.adj[u].map((v) => ({ u, v })))
    return { names: p.names, ...fromAdjacency(p.names, pairs, false), weighted: false }
  }
  if (kind === 'prim') {
    const p = parsePrimInput(values.G)
    if (!p.ok) return null
    const pairs = p.names.flatMap((u) => p.adj[u].map(({ v, w }) => ({ u, v, w })))
    return { names: p.names, edges: fromAdjacency(p.names, pairs, true).edges, directed: false, weighted: true }
  }
  if (kind === 'kruskal') {
    const p = parseKruskalInput({ V: values.V, E: values.E })
    if (!p.ok) return null
    return { names: p.names, edges: p.edges.map(({ u, v, w }) => ({ u, v, w })), directed: false, weighted: true }
  }
  return null
}

/** Posisi simpul (0 sampai 1). Memakai `positions` bila ada untuk semua simpul, jika tidak disusun melingkar. */
export function layoutPositions(names, positions) {
  if (positions && names.every((n) => positions[n])) return Object.fromEntries(names.map((n) => [n, positions[n]]))
  const n = names.length
  return Object.fromEntries(
    names.map((name, i) => {
      if (n === 1) return [name, { x: 0.5, y: 0.5 }]
      const a = -Math.PI / 2 + (2 * Math.PI * i) / n
      return [name, { x: 0.5 + 0.38 * Math.cos(a), y: 0.5 + 0.38 * Math.sin(a) }]
    }),
  )
}

/** Indeks sisi yang menghubungkan a dan b (searah; pada graf tak berarah boleh kebalikannya), atau -1. */
export function edgeIndex(graph, a, b) {
  return graph.edges.findIndex((e) => (e.u === a && e.v === b) || (!graph.directed && e.u === b && e.v === a))
}

/** Nama huruf untuk simpul ke-i: A, B, C, ... (dipakai untuk memberi nama default). */
export const letterName = (i) => String.fromCharCode(65 + i)

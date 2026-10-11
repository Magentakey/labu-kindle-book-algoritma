// Bagian bersama visualizer graf (BFS, DFS, Prim, Kruskal, Dijkstra, Bellman-Ford):
// pembacaan masukan, tata letak simpul, pembangkit masukan acak, dan pembuat `view` untuk GraphCanvas.

export const GRAPH_MAX_N = 9
export const GRAPH_MAX_EDGES = 16
export const GRAPH_MAX_WEIGHT = 99

// Ukuran kanvas dalam satuan viewBox (400 x 340). Diameter simpul = 9,5% lebar = 2 * GRAPH_NODE_R satuan.
export const GRAPH_VIEW_W = 400
export const GRAPH_VIEW_H = 340
export const GRAPH_NODE_R = 19

/**
 * @typedef {[number, number] | [number, number, number]} GraphEdge  [u, v] atau [u, v, bobot], sama dengan soal challenge
 * @typedef {{ n: number, edges: GraphEdge[], start?: number }} GraphInput
 * @typedef {{ directed: boolean, weighted: boolean }} GraphKind
 *
 * @typedef {Object} GraphViewNode
 * @property {number} id
 * @property {string} label
 * @property {string} sub
 * @property {string} mark   kunci pada GRAPH_NODE_STATUS
 * @property {number} x
 * @property {number} y
 * @typedef {Object} GraphViewEdge
 * @property {number} id
 * @property {number} u
 * @property {number} v
 * @property {number|null} w
 * @property {string} mark   kunci pada GRAPH_EDGE_STATUS
 * @typedef {Object} GraphStep
 * @property {number|number[]|null} line
 * @property {string} note
 * @property {{ nodes: GraphViewNode[], edges: GraphViewEdge[], directed: boolean, weighted: boolean, panels: any[], labels?: Record<string,string>, edgeLabels?: Record<string,string> }} view
 */

const round1 = (x) => Math.round(x * 10) / 10

/** Simpul disusun melingkar (elips), dimulai dari atas searah jarum jam. Deterministik, jadi mudah diuji. */
export function layoutCircle(n) {
  if (n === 1) return [{ x: GRAPH_VIEW_W / 2, y: GRAPH_VIEW_H / 2 }]
  const rx = 150
  const ry = 125
  return Array.from({ length: n }, (_, i) => {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / n
    return { x: round1(GRAPH_VIEW_W / 2 + rx * Math.cos(a)), y: round1(GRAPH_VIEW_H / 2 + ry * Math.sin(a)) }
  })
}

/** Daftar tetangga: adj[u] = [{ v, w, e }], diurutkan menurut nomor tetangga (lalu nomor sisi). */
export function buildAdj(n, edges, directed) {
  const adj = Array.from({ length: n }, () => [])
  edges.forEach(([u, v, w], e) => {
    adj[u].push({ v, w: w ?? null, e })
    if (!directed) adj[v].push({ v: u, w: w ?? null, e })
  })
  adj.forEach((a) => a.sort((p, q) => p.v - q.v || p.e - q.e))
  return adj
}

/** Nama sisi untuk catatan langkah: "0-1" (tak berarah) atau "0→1" (berarah). */
export const edgeName = (edge, directed) => `${edge[0]}${directed ? '→' : '-'}${edge[1]}`

export const fmtDist = (d) => (d === Infinity ? '∞' : String(d))

/** Apakah graf tak berarah ini terhubung? (union-find sederhana, bebas dari kode visualizer) */
export function isConnected(n, edges) {
  const root = Array.from({ length: n }, (_, i) => i)
  const find = (x) => {
    while (root[x] !== x) x = root[x] = root[root[x]]
    return x
  }
  for (const [u, v] of edges) root[find(u)] = find(v)
  const r = find(0)
  return root.every((_, i) => find(i) === r)
}

// ---------------------------------------------------------------- membaca masukan

const EDGE_HELP = {
  plain: 'Tulis tiap sisi sebagai u-v, misalnya 0-1, 0-2.',
  weighted: 'Tulis tiap sisi sebagai u-v:bobot, misalnya 0-1:4, 1-2:2.',
  directed: 'Tulis tiap sisi sebagai u>v:bobot (panah dari u ke v), misalnya 0>1:4, 1>2:2.',
}

/**
 * Membaca jumlah simpul.
 * @returns {{ ok: true, value: number } | { ok: false, error: string }}
 */
export function parseVertexCount(text) {
  const raw = String(text ?? '').trim()
  if (raw === '') return { ok: false, error: 'Isi jumlah simpul (n).' }
  if (!/^\d+$/.test(raw)) return { ok: false, error: `Jumlah simpul "${raw}" harus bilangan bulat positif.` }
  const n = Number(raw)
  if (n < 1 || n > GRAPH_MAX_N) return { ok: false, error: `Jumlah simpul harus 1 sampai ${GRAPH_MAX_N} (Anda mengisi ${n}).` }
  return { ok: true, value: n }
}

/**
 * Membaca daftar sisi.
 * @param {string} text
 * @param {number} n
 * @param {{ directed: boolean, weighted: boolean, minWeight?: number }} kind
 * @returns {{ ok: true, value: GraphEdge[] } | { ok: false, error: string }}
 */
export function parseEdges(text, n, { directed, weighted, minWeight = 0 }) {
  const help = directed ? EDGE_HELP.directed : weighted ? EDGE_HELP.weighted : EDGE_HELP.plain
  const sep = directed ? '>' : '-'
  const other = directed ? '-' : '>'
  const tokens = String(text ?? '').split(/[,;\n]+/).map((t) => t.trim()).filter(Boolean)
  if (tokens.length === 0) {
    if (weighted && n > 1) return { ok: false, error: `Isi minimal satu sisi. ${help}` }
    return { ok: true, value: [] }
  }
  if (tokens.length > GRAPH_MAX_EDGES) return { ok: false, error: `Maksimal ${GRAPH_MAX_EDGES} sisi (Anda mengisi ${tokens.length}).` }

  const pattern = weighted ? /^(\d+)\s*([->])\s*(\d+)\s*:\s*(-?\d+)$/ : /^(\d+)\s*([->])\s*(\d+)$/
  const seen = new Set()
  const edges = []
  for (const token of tokens) {
    const m = pattern.exec(token)
    if (!m) {
      if (weighted && new RegExp(`^\\d+\\s*[->]\\s*\\d+$`).test(token)) {
        return { ok: false, error: `Sisi "${token}" belum punya bobot. ${help}` }
      }
      return { ok: false, error: `Sisi "${token}" tidak bisa dibaca. ${help}` }
    }
    if (m[2] !== sep) {
      return {
        ok: false,
        error: directed
          ? `Sisi "${token}" memakai "${other}", padahal graf ini berarah. Pakai ">" supaya arahnya jelas. ${help}`
          : `Sisi "${token}" memakai "${other}", padahal graf ini tak berarah. Pakai "-" di antara dua simpul. ${help}`,
      }
    }
    const u = Number(m[1])
    const v = Number(m[3])
    for (const x of [u, v]) {
      if (x >= n) return { ok: false, error: `Simpul ${x} pada sisi "${token}" tidak ada. Simpul bernomor 0 sampai ${n - 1} (n = ${n}).` }
    }
    if (u === v) return { ok: false, error: `Sisi "${token}" menghubungkan simpul ke dirinya sendiri. Sisi seperti ini tidak dipakai.` }
    const key = directed || u < v ? `${u},${v}` : `${v},${u}`
    if (seen.has(key)) return { ok: false, error: `Sisi ${directed ? `${u}>${v}` : `${Math.min(u, v)}-${Math.max(u, v)}`} muncul lebih dari sekali.` }
    seen.add(key)
    if (weighted) {
      const w = Number(m[4])
      if (w < minWeight || w > GRAPH_MAX_WEIGHT) {
        return { ok: false, error: `Bobot ${w} pada sisi "${token}" di luar rentang ${minWeight} sampai ${GRAPH_MAX_WEIGHT}.${w < 0 && minWeight >= 0 ? ' Bobot negatif hanya didukung visualizer Bellman-Ford.' : ''}` }
      }
      edges.push([u, v, w])
    } else {
      edges.push([u, v])
    }
  }
  return { ok: true, value: edges }
}

/**
 * Membaca tiga isian (n, edges, start) menjadi masukan graf.
 * @param {{ n: string, edges: string, start?: string }} fields
 * @param {GraphKind & { needStart: boolean, startLabel?: string, minWeight?: number, connected?: boolean }} opts
 * @returns {{ ok: true, value: GraphInput } | { ok: false, error: string }}
 */
export function parseGraphFields(fields, { directed, weighted, needStart, startLabel = 'simpul awal', minWeight = 0, connected = false }) {
  const n = parseVertexCount(fields.n)
  if (!n.ok) return n
  const e = parseEdges(fields.edges, n.value, { directed, weighted, minWeight })
  if (!e.ok) return e
  /** @type {GraphInput} */
  const value = { n: n.value, edges: e.value }
  if (needStart) {
    const raw = String(fields.start ?? '').trim()
    if (raw === '') return { ok: false, error: `Isi ${startLabel}.` }
    if (!/^\d+$/.test(raw)) return { ok: false, error: `${startLabel[0].toUpperCase()}${startLabel.slice(1)} "${raw}" harus bilangan bulat.` }
    const s = Number(raw)
    if (s >= n.value) return { ok: false, error: `${startLabel[0].toUpperCase()}${startLabel.slice(1)} ${s} tidak ada. Simpul bernomor 0 sampai ${n.value - 1}.` }
    value.start = s
  }
  if (connected && !isConnected(n.value, e.value)) {
    return { ok: false, error: 'Graf harus terhubung: dari tiap simpul harus ada jalan ke semua simpul lain. Tambahkan sisi yang menghubungkan simpul yang terpisah.' }
  }
  return { ok: true, value }
}

/** @param {GraphInput} v @param {GraphKind & { needStart: boolean }} opts */
export function formatGraphInput(v, { directed, weighted, needStart }) {
  const sep = directed ? '>' : '-'
  const fields = {
    n: String(v.n),
    edges: v.edges.map(([a, b, w]) => `${a}${sep}${b}${weighted ? `:${w}` : ''}`).join(', '),
  }
  if (needStart) fields.start = String(v.start ?? 0)
  return fields
}

// ---------------------------------------------------------------- masukan acak

const shuffle = (arr, rng) => {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Graf acak berukuran 5 sampai 7 simpul. Tak berarah dibuat terhubung (pohon rentang acak + beberapa sisi tambahan).
 * Berarah dibuat dari sumber ke semua simpul lain (kadang satu simpul sengaja tidak terjangkau supaya kasus ∞ terlihat).
 * @param {GraphKind & { needStart: boolean, minWeight?: number, maxWeight?: number, potentialTrick?: boolean }} opts
 * @param {() => number} [rng]
 * @returns {GraphInput}
 */
export function randomGraph({ directed, weighted, needStart, maxWeight = 15, potentialTrick = false }, rng = Math.random) {
  const pick = (k) => Math.floor(rng() * k)
  const n = 5 + pick(3)
  const label = shuffle([...Array(n).keys()], rng) // acak nomor simpul supaya pohon dasarnya tidak terbaca
  const pairs = new Set()
  /** @type {Array<[number, number]>} */
  const list = []
  const add = (a, b) => {
    const key = directed || a < b ? `${a},${b}` : `${b},${a}`
    if (a === b || pairs.has(key) || list.length >= GRAPH_MAX_EDGES) return false
    pairs.add(key)
    list.push([a, b])
    return true
  }
  const source = directed ? label[0] : pick(n)
  const skip = directed && n >= 6 && rng() < 0.25 ? label[n - 1] : -1 // simpul yang sengaja tidak terjangkau
  for (let i = 1; i < n; i++) {
    if (label[i] === skip) continue
    const parent = label[pick(i)]
    add(parent, label[i])
  }
  const extra = 2 + pick(3)
  for (let tries = 0; tries < 60 && list.length < n - 1 + extra; tries++) {
    const a = pick(n)
    const b = pick(n)
    if (a === skip && directed) {
      add(a, b) // simpul yang dilewati boleh punya sisi keluar, tetapi tidak boleh ada sisi masuk
      continue
    }
    if (b === skip) continue
    add(a, b)
  }
  const potential = Array.from({ length: n }, () => (potentialTrick ? pick(7) : 0))
  const edges = list.map(([a, b]) => {
    if (!weighted) return [a, b]
    // Trik potensial: w' = w + p[a] - p[b] menghasilkan bobot negatif tetapi tidak pernah membentuk siklus negatif.
    const w = 1 + pick(maxWeight - (potentialTrick ? 3 : 0)) + potential[a] - potential[b]
    return [a, b, w]
  })
  /** @type {GraphInput} */
  const out = { n, edges: shuffle(edges, rng) }
  if (needStart) out.start = source
  return out
}

// ---------------------------------------------------------------- view

/**
 * Menyusun `view` untuk GraphCanvas dari keadaan algoritma saat ini.
 * @param {GraphInput & GraphKind} g
 * @param {{ nodeMark: string[], nodeSub: string[], edgeMark: string[], panels: any[], labels?: Record<string,string>, edgeLabels?: Record<string,string> }} s
 */
export function makeView({ n, edges, directed, weighted }, { nodeMark, nodeSub, edgeMark, panels, labels, edgeLabels }) {
  const pos = layoutCircle(n)
  return {
    directed,
    weighted,
    nodes: Array.from({ length: n }, (_, i) => ({ id: i, label: String(i), sub: nodeSub[i] ?? '', mark: nodeMark[i], x: pos[i].x, y: pos[i].y })),
    edges: edges.map(([u, v, w], e) => ({ id: e, u, v, w: weighted ? w : null, mark: edgeMark[e] })),
    panels,
    labels,
    edgeLabels,
  }
}

/** Panel daftar tetangga: satu baris per simpul. `active` = simpul yang disorot (atau -1). */
export function adjacencyPanel(adj, active, weighted) {
  return {
    type: 'table',
    caption: 'Daftar tetangga',
    headers: ['Simpul', 'Tetangga'],
    rows: adj.map((a, i) => [String(i), a.length === 0 ? '–' : a.map((x) => (weighted ? `${x.v} (${x.w})` : String(x.v))).join(', ')]),
    activeRow: active,
  }
}

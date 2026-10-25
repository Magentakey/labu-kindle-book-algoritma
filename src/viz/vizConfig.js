// Konfigurasi visualizer baru (halaman /algoritma/:id): peraga mana yang menggerakkan, prosedur di panel Kode,
// legenda gambar, dan masukan bawaan (Preset 1 = graf contoh di desain Figma, simpul A sampai F).
import { traces } from '../algorithms/traces.js'

/** Posisi simpul graf contoh desain (0 sampai 1): A kiri, B/D atas, C/E bawah, F kanan. */
export const DESIGN_POSITIONS = {
  A: { x: 0.1, y: 0.5 },
  B: { x: 0.38, y: 0.2 },
  C: { x: 0.38, y: 0.82 },
  D: { x: 0.7, y: 0.2 },
  E: { x: 0.7, y: 0.82 },
  F: { x: 0.93, y: 0.5 },
}

const DESIGN_ADJ = 'A: B, C; B: A, C, D; C: A, B, D, E; D: B, C, E, F; E: C, D, F; F: D, E'
const DESIGN_ADJ_W = 'A: B(4), C(2); B: A(4), C(1), D(5); C: A(2), B(1), D(8), E(10); D: B(5), C(8), E(2), F(6); E: C(10), D(2), F(3); F: D(6), E(3)'
const DESIGN_V = 'A, B, C, D, E, F'

const fromTrace = (key, label) => ({ label, values: traces[key].presets[0].values, positions: null })

const NODE = {
  unvisited: 'Belum dikunjungi (abu, garis putus)',
  active: 'Sedang diproses (menyala)',
  relax: 'Sedang direlaksasi (cincin biru)',
  done: 'Selesai (✓ mint)',
  queued: 'Sudah ditemukan, menunggu (kuning)',
  reached: 'Sudah terjangkau (mint muda)',
}
const EDGE = {
  flow: 'Busur dilewati (aliran)',
  tree: 'Pohon jalur terpendek (biru tebal)',
  rejected: 'Ditolak (merah putus)',
}

/**
 * Daftar visualizer baru. `id` sama dengan id di Galeri; `trace` = kunci di src/algorithms/traces.js;
 * `kind` = jenis tampilan graf; `source` = kunci isian simpul sumber (atau null).
 */
export const vizConfig = {
  dijkstra: {
    stage: 'graph',
    trace: 'dijkstra',
    kind: 'dijkstra',
    source: 's',
    procedures: [
      { title: 'DIJKSTRA(G, w, s)', from: 1, to: 8 },
      { title: 'INITIALIZE-SINGLE-SOURCE(G, s)', from: 9, to: 12, offset: 8, callSite: 1 },
      { title: 'RELAX(u, v, w)', from: 13, to: 15, offset: 12, callSite: 8 },
    ],
    legend: { nodes: ['unvisited', 'active', 'relax', 'done'].map((k) => [k, NODE[k]]), edges: [['flow', EDGE.flow], ['tree', EDGE.tree]] },
    presets: [
      { label: 'Preset 1', values: { V: DESIGN_V, E: 'A>B:4, A>C:2, C>B:1, B>D:5, C>D:8, C>E:10, D>E:2, D>F:6, E>F:3', s: 'A' }, positions: DESIGN_POSITIONS },
      fromTrace('dijkstra', 'Contoh materi (s, t, x, y, z)'),
      { label: 'Jalan langsung lebih mahal', values: { V: 'A, B, C', E: 'A>C:10, A>B:3, B>C:3', s: 'A' }, positions: null },
      { label: 'Ada simpul tak terjangkau', values: { V: 'A, B, C, D', E: 'A>B:2, B>C:3, D>B:1', s: 'A' }, positions: null },
    ],
  },
  'bellman-ford': {
    stage: 'graph',
    trace: 'bellman-ford',
    kind: 'bellman-ford',
    source: 's',
    procedures: [
      { title: 'BELLMAN-FORD(G, w, s)', from: 1, to: 8 },
      { title: 'INITIALIZE-SINGLE-SOURCE(G, s)', from: 9, to: 12, offset: 8, callSite: 1 },
      { title: 'RELAX(u, v, w)', from: 13, to: 15, offset: 12, callSite: 4 },
    ],
    legend: { nodes: ['unvisited', 'reached', 'active', 'relax'].map((k) => [k, NODE[k]]), edges: [['flow', EDGE.flow], ['tree', EDGE.tree]] },
    presets: [
      { label: 'Preset 1', values: { V: DESIGN_V, E: 'A>B:4, A>C:2, C>B:1, B>D:5, C>D:8, C>E:10, D>E:2, D>F:6, E>F:3', s: 'A' }, positions: DESIGN_POSITIONS },
      fromTrace('bellman-ford', 'Contoh materi (s, t, x, y, z)'),
      { label: 'Bobot negatif tanpa siklus negatif', values: { V: 'A, B, C, D', E: 'A>B:4, A>C:5, B>C:-3, C>D:2', s: 'A' }, positions: null },
      { label: 'Siklus negatif (hasil FALSE)', values: { V: 'A, B, C', E: 'A>B:1, B>C:-3, C>B:1', s: 'A' }, positions: null },
    ],
  },
  bfs: {
    stage: 'graph',
    trace: 'bfs',
    kind: 'bfs',
    source: 's',
    procedures: [{ title: 'BFS(G, s)', from: 1, to: 18 }],
    legend: { nodes: ['unvisited', 'queued', 'active', 'relax', 'done'].map((k) => [k, k === 'queued' ? 'Di dalam antrean (GRAY, kuning)' : NODE[k]]), edges: [['flow', 'Busur diperiksa (aliran)'], ['tree', 'Pohon BFS (biru tebal)']] },
    presets: [{ label: 'Preset 1', values: { G: DESIGN_ADJ, s: 'A' }, positions: DESIGN_POSITIONS }, fromTrace('bfs', 'Contoh materi (r, s, t, u, v, w, x, y)')],
  },
  dfs: {
    stage: 'graph',
    trace: 'dfs',
    kind: 'dfs',
    source: null,
    procedures: [
      { title: 'DFS(G)', from: 1, to: 7 },
      { title: 'DFS-VISIT(G, u)', from: 8, to: 17, offset: 7, callSite: [7, 14] },
    ],
    legend: { nodes: ['unvisited', 'queued', 'active', 'relax', 'done'].map((k) => [k, k === 'queued' ? 'Sedang dikunjungi (GRAY, kuning)' : NODE[k]]), edges: [['flow', 'Busur diperiksa (aliran)'], ['tree', 'Pohon DFS (biru tebal)']] },
    presets: [{ label: 'Preset 1', values: { G: DESIGN_ADJ }, positions: DESIGN_POSITIONS }, fromTrace('dfs', 'Contoh materi (u, v, w, x, y, z)')],
  },
  prim: {
    stage: 'graph',
    trace: 'mst-prim',
    kind: 'prim',
    source: 'r',
    procedures: [{ title: 'MST-PRIM(G, w, r)', from: 1, to: 11 }],
    legend: { nodes: ['unvisited', 'queued', 'active', 'relax', 'done'].map((k) => [k, k === 'queued' ? 'Di Q dengan key terhingga (kuning)' : k === 'done' ? 'Sudah di tree (✓ mint)' : NODE[k]]), edges: [['flow', 'Busur diperiksa (aliran)'], ['tree', 'Sisi tree (biru tebal)']] },
    presets: [{ label: 'Preset 1', values: { G: DESIGN_ADJ_W, r: 'A' }, positions: DESIGN_POSITIONS }, fromTrace('mst-prim', 'Contoh materi (a sampai i)')],
  },
  kruskal: {
    stage: 'graph',
    trace: 'mst-kruskal',
    kind: 'kruskal',
    source: null,
    procedures: [{ title: 'MST-KRUSKAL(G, w)', from: 1, to: 9 }],
    legend: { nodes: ['unvisited', 'active', 'done'].map((k) => [k, k === 'active' ? 'Ujung sisi yang diperiksa (menyala)' : k === 'done' ? 'Sudah di tree (✓ mint)' : 'Belum tersentuh (abu, garis putus)']), edges: [['flow', 'Sisi diperiksa (aliran)'], ['tree', 'Diterima (biru tebal)'], ['rejected', EDGE.rejected]] },
    presets: [
      { label: 'Preset 1', values: { V: DESIGN_V, E: 'A-B:4, A-C:2, B-C:1, B-D:5, C-D:8, C-E:10, D-E:2, D-F:6, E-F:3' }, positions: DESIGN_POSITIONS },
      fromTrace('mst-kruskal', 'Contoh materi (a sampai i)'),
    ],
  },
}


// ------------------------------------------------------------------ jenis non-graf (tahap 3b)
const legendOf = (...pairs) => ({ nodes: pairs, edges: [] })
const defProcedures = (key) => [{ title: traces[key].title, from: 1, to: traces[key].code.split('\n').length }]
const defPresets = (key) => traces[key].presets.map((p) => ({ label: p.label, values: p.values, positions: null }))

/** Masukan bersama untuk Bandingkan dua algoritma pengurutan (maksimal 8 angka, batas peraga). */
export const comparePresets = [
  { label: 'Acak (n = 8)', values: { A: '12, 5, 17, 9, 15, 7, 14, 3' } },
  { label: 'Hampir terurut', values: { A: '2, 4, 3, 7, 8, 10, 9, 12' } },
  { label: 'Terbalik', values: { A: '20, 17, 14, 11, 9, 6, 3, 1' } },
  { label: 'Sudah terurut', values: { A: '1, 3, 5, 7, 9, 11, 13, 15' } },
]

Object.assign(vizConfig, {
  'insertion-sort': {
    stage: 'bars',
    trace: 'insertion-sort',
    procedures: defProcedures('insertion-sort'),
    legend: legendOf(['idle', 'Belum terurut'], ['compare', 'Sedang dibandingkan'], ['shift', 'Digeser ke kanan'], ['active', 'Kunci yang disisipkan'], ['done', 'Sudah di tempatnya']),
    presets: [{ label: comparePresets[0].label, values: comparePresets[0].values, positions: null }, ...defPresets('insertion-sort')],
  },
  'merge-sort': {
    stage: 'bars',
    trace: 'merge-sort',
    procedures: defProcedures('merge-sort'),
    legend: legendOf(['idle', 'Di luar rentang'], ['range', 'Rentang yang diproses'], ['left', 'Bagian kiri'], ['compare', 'Bagian kanan'], ['done', 'Sudah terurut atau digabung']),
    presets: [{ label: comparePresets[0].label, values: comparePresets[0].values, positions: null }, ...defPresets('merge-sort')],
  },
  'binary-search': {
    stage: 'bars',
    trace: 'binary-search-iteratif',
    procedures: defProcedures('binary-search-iteratif'),
    legend: legendOf(['range', 'Rentang pencarian'], ['compare', 'Elemen tengah (dibandingkan)'], ['discarded', 'Sudah dibuang'], ['done', 'Ditemukan']),
    presets: [
      { label: 'x ada di array', values: { A: '5, 8, 9, 10, 14, 20', x: '10' }, positions: null },
      { label: 'x tidak ada', values: { A: '5, 8, 9, 10, 14, 20', x: '12' }, positions: null },
      { label: 'x paling kiri', values: { A: '5, 8, 9, 10, 14, 20', x: '5' }, positions: null },
    ],
  },
  'matrix-chain': {
    stage: 'table',
    trace: 'matrix-chain-order',
    procedures: defProcedures('matrix-chain-order'),
    legend: legendOf(['active', 'Sel yang sedang dihitung'], ['left', 'Sel yang dijumlahkan (sumber)'], ['done', 'Jalur terbaik'], ['idle', 'Belum terisi']),
    presets: defPresets('matrix-chain-order'),
  },
  lcs: {
    stage: 'table',
    trace: 'lcs-length',
    procedures: defProcedures('lcs-length'),
    legend: legendOf(['active', 'Sel yang sedang dihitung'], ['left', 'Sel sumber'], ['idle', 'Belum terisi']),
    presets: defPresets('lcs-length'),
  },
  'activity-selection': {
    stage: 'timeline',
    trace: 'greedy-activity-selector',
    procedures: defProcedures('greedy-activity-selector'),
    legend: legendOf(['idle', 'Belum diperiksa'], ['active', 'Sedang diperiksa'], ['compare', 'Dibandingkan'], ['done', 'Dipilih'], ['discarded', 'Ditolak (bertabrakan)']),
    presets: defPresets('greedy-activity-selector'),
  },
  'kode-huffman': {
    stage: 'huffman',
    trace: 'huffman',
    procedures: defProcedures('huffman'),
    legend: legendOf(['queued', 'Akar di antrean Q'], ['active', 'Sedang digabung'], ['done', 'Bagian pohon']),
    presets: defPresets('huffman'),
  },
})

/** Pasangan algoritma yang bisa dibandingkan, dengan nama tampil dan jenis tampilan. */
export const comparePairs = [{ a: 'insertion-sort', b: 'merge-sort', faster: 'merge-sort' }]
export const comparePairOf = (id) => comparePairs.find((p) => p.a === id || p.b === id) ?? null

export const vizIds = Object.keys(vizConfig)

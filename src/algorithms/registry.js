import { insertionSortCode, insertionSortSteps } from './insertionSort.js'
import { insertionSortView } from './insertionSortView.js'
import { insertionSortExecLines, insertionSortTrace } from './insertionSortExact.js'
import { insertionSortExactView, mergeSortExactView } from './exactViews.js'
import { mergeSortCode, mergeSortSteps } from './mergeSort.js'
import { mergeSortView } from './mergeSortView.js'
import { mergeSortExecLines, mergeSortTrace } from './mergeSortExact.js'
import { bfsTreeCode, bfsTreeSteps } from './bfsTree.js'
import { dfsTreeCode, dfsTreeSteps } from './dfsTree.js'
import { mergeSortTreeCode, mergeSortTreeSteps } from './mergeSortTree.js'
import { formatHuffmanInput, huffmanTreeCode, huffmanTreeSteps, parseHuffmanInput, randomHuffmanInput } from './huffmanTree.js'
import { formatRecurrenceInput, parseRecurrenceInput, randomRecurrenceInput, recurrenceTreeCode, recurrenceTreeSteps } from './recurrenceTree.js'
import { formatTreeInput, parseTreeInput, randomTreeTokens } from '../lib/binaryTree.js'
import { parseArrayInput, randomArray } from '../lib/parseArray.js'
import { lcsCode, lcsSteps, formatLcsInput, parseLcsInput, randomLcsInput } from './lcsTable.js'
import { matrixChainCode, matrixChainSteps, formatMatrixChainInput, parseMatrixChainInput, randomMatrixChainInput } from './matrixChainTable.js'
import {
  activitySelectionCode,
  activitySelectionSteps,
  formatActivityInput,
  parseActivityInput,
  randomActivityInput,
} from './activitySelection.js'
import { bfsGraphCode, bfsGraphSteps, dfsGraphCode, dfsGraphSteps } from './graphTraversal.js'
import { kruskalCode, kruskalSteps, primCode, primSteps } from './graphMst.js'
import { bellmanFordCode, bellmanFordSteps, dijkstraCode, dijkstraSteps } from './graphShortest.js'
import { formatGraphInput, parseGraphFields, randomGraph } from './graphCommon.js'
import { binarySearchCode, binarySearchSteps, formatBinarySearchInput, parseBinarySearchInput, randomBinarySearchInput } from './binarySearch.js'

// Pohon biner dalam urutan level (null = anak tidak ada). [1, 2, 3, 4, 5] adalah pohon pada gambar contoh.
const binaryTreeInput = {
  kind: 'tree',
  initialInput: [1, 2, 3, 4, 5],
  parseInput: parseTreeInput,
  formatInput: formatTreeInput,
  randomInput: () => randomTreeTokens(),
  inputLabel: 'Pohon (urutan level)',
  inputHint:
    'Angka bulat dipisah koma, dibaca dari atas ke bawah dan dari kiri ke kanan. Tulis null untuk anak yang tidak ada. ' +
    'Maksimal 15 isian, rentang -99 sampai 99. Contoh: 1, 2, 3, 4, 5.',
  presets: [
    { label: 'Pohon pada gambar (1, 2, 3, 4, 5)', value: [1, 2, 3, 4, 5] },
    { label: 'Condong ke kiri', value: [1, 2, null, 3, null, 4] },
    { label: 'Pohon 9 simpul', value: [8, 3, 10, 1, 6, null, 14, null, null, 4, 7, 13] },
  ],
}


// Graf: tiga isian (n, edges, start) sama dengan parameter soal challenge. Masing-masing jenis graf punya aturan sendiri
// (tak berarah/berarah, berbobot atau tidak) yang dipakai bersama oleh pembaca masukan, pemformat, dan pengacaknya.
const graphEntry = (kind, extra) => ({
  kind: 'graph',
  parseInput: (f) => parseGraphFields(f, kind),
  formatInput: (v) => formatGraphInput(v, kind),
  randomInput: () => randomGraph(kind),
  ...extra,
})

const nField = { key: 'n', label: 'Jumlah simpul (n)' }
const edgesField = (label) => ({ key: 'edges', label })

const unweightedKind = { directed: false, weighted: false, needStart: true, startLabel: 'simpul awal' }
const mstKind = { directed: false, weighted: true, needStart: false, connected: true }
const primKind = { ...mstKind, needStart: true, startLabel: 'simpul awal' }
const dijkstraKind = { directed: true, weighted: true, needStart: true, startLabel: 'simpul sumber (source)' }
const bellmanKind = { ...dijkstraKind, minWeight: -9, potentialTrick: true }

// Graf pada test case soal challenge, supaya visualizer dan soal tidak bisa saling bertentangan.
const TRAVERSAL_HINT =
  'Graf tak berarah dengan simpul bernomor 0 sampai n-1 (n maksimal 9, sisi maksimal 16). Tulis sisi sebagai u-v dipisah koma, misalnya 0-1, 0-2. ' +
  'Graf boleh tidak terhubung; simpul yang tidak terjangkau dari simpul awal tidak ikut dikunjungi.'
const TRAVERSAL_PRESETS = [
  { label: 'Graf dengan siklus (soal challenge)', value: { n: 5, edges: [[0, 2], [0, 1], [1, 3], [2, 3], [3, 4]], start: 0 } },
  { label: 'Siklus 4 simpul, mulai dari 2', value: { n: 4, edges: [[0, 1], [1, 2], [2, 3], [3, 0]], start: 2 } },
  { label: 'Pohon, mulai dari simpul 3', value: { n: 6, edges: [[0, 1], [0, 2], [0, 3], [3, 4], [4, 5]], start: 3 } },
  { label: 'Dua komponen: sebagian tak terjangkau', value: { n: 4, edges: [[0, 1], [2, 3]], start: 0 } },
  { label: 'Satu simpul tanpa sisi', value: { n: 1, edges: [], start: 0 } },
]

const MST_CLASSIC = {
  n: 9,
  edges: [[0, 1, 4], [0, 7, 8], [1, 2, 8], [1, 7, 11], [2, 3, 7], [2, 8, 2], [2, 5, 4], [3, 4, 9], [3, 5, 14], [4, 5, 10], [5, 6, 2], [6, 7, 1], [6, 8, 6], [7, 8, 7]],
}
const MST_PRESETS = [
  { label: 'Contoh klasik (9 simpul, total 37)', value: { ...MST_CLASSIC, start: 0 } },
  { label: 'Segitiga (3 simpul, total 3)', value: { n: 3, edges: [[0, 1, 1], [1, 2, 2], [0, 2, 3]], start: 0 } },
  { label: 'Semua bobot sama (siklus 4 simpul)', value: { n: 4, edges: [[0, 1, 1], [1, 2, 1], [2, 3, 1], [3, 0, 1]], start: 0 } },
  { label: 'Satu sisi sangat berat dibuang', value: { n: 4, edges: [[0, 1, 1], [1, 2, 1], [2, 3, 1], [0, 3, 99]], start: 0 } },
]
const MST_HINT =
  'Graf tak berarah yang terhubung, simpul bernomor 0 sampai n-1 (n maksimal 9, sisi maksimal 16). Tulis sisi sebagai u-v:bobot dipisah koma, ' +
  'misalnya 0-1:4, 1-2:2. Bobot bilangan bulat 0 sampai 99.'

const SHORTEST_PRESETS = [
  { label: 'Contoh klasik (5 simpul)', value: { n: 5, edges: [[0, 1, 10], [0, 3, 5], [1, 2, 1], [1, 3, 2], [3, 1, 3], [3, 2, 9], [3, 4, 2], [2, 4, 4], [4, 0, 7], [4, 2, 6]], start: 0 } },
  { label: 'Jalan langsung lebih mahal', value: { n: 3, edges: [[0, 2, 10], [0, 1, 3], [1, 2, 3]], start: 0 } },
  { label: 'Sebagian tidak terjangkau (−1)', value: { n: 4, edges: [[0, 1, 2], [1, 2, 3]], start: 0 } },
  { label: 'Bobot nol', value: { n: 3, edges: [[0, 1, 0], [1, 2, 0]], start: 0 } },
  { label: 'Ada siklus, sumber di simpul 1', value: { n: 4, edges: [[0, 1, 1], [1, 2, 1], [2, 0, 1], [2, 3, 5]], start: 1 } },
]
const SHORTEST_HINT =
  'Graf berarah dengan simpul bernomor 0 sampai n-1 (n maksimal 9, sisi maksimal 16). Tulis sisi sebagai u>v:bobot, artinya panah dari u ke v, ' +
  'misalnya 0>1:4, 1>2:2. Dua arah antara simpul yang sama ditulis sebagai dua sisi. '

/**
 * Daftar visualizer. Kuncinya sama dengan field `visualizer` di materials.json
 * (boleh satu kunci atau daftar kunci). `kind: 'tree'` memakai TreeVisualizer, `kind: 'search'` memakai SearchVisualizer,
 * `kind: 'table'` memakai DpVisualizer (tabel DP), `kind: 'plot'` memakai AsymptoticGraph (grafik fungsi),
 * `kind: 'timeline'` memakai TimelineVisualizer (garis waktu aktivitas),
 * `kind: 'graph'` memakai GraphVisualizer (graf: BFS, DFS, Prim, Kruskal, Dijkstra, Bellman-Ford);
 * tanpa `kind` memakai AlgoVisualizer.
 * Menambah algoritma baru = menambah satu entri di sini.
 */
export const visualizers = {
  insertionSort: {
    code: insertionSortCode,
    codeLabel: 'Kode insertion sort',
    chartLabel: 'Diagram batang insertion sort',
    initialArray: [5, 2, 4, 1, 3],
    buildSteps: insertionSortSteps,
    toView: insertionSortView,
    legend: ['normal', 'sorted', 'compare', 'shift', 'placed', 'key'],
    // Mode Tepat: satu langkah = satu eksekusi baris, dengan hitungan tiap baris.
    buildExactSteps: insertionSortTrace,
    toExactView: insertionSortExactView,
    exactLines: insertionSortExecLines,
  },
  mergeSort: {
    code: mergeSortCode,
    codeLabel: 'Kode merge sort',
    chartLabel: 'Diagram batang merge sort',
    initialArray: [6, 3, 8, 1, 5, 2],
    buildSteps: mergeSortSteps,
    toView: mergeSortView,
    legend: ['normal', 'left', 'right', 'compare', 'taken', 'merged', 'sorted'],
    buildExactSteps: mergeSortTrace,
    toExactView: mergeSortExactView,
    exactLines: mergeSortExecLines,
    exactLegend: ['normal', 'range', 'left', 'right', 'compare', 'taken', 'merged', 'sorted'],
  },
  mergeSortTree: {
    kind: 'tree',
    title: 'Pohon rekursi merge sort',
    code: mergeSortTreeCode,
    codeLabel: 'Kode merge sort',
    canvasLabel: 'Pohon rekursi merge sort',
    initialInput: [6, 3, 8, 1, 5, 2],
    parseInput: (text) => {
      const r = parseArrayInput(text)
      return r.ok ? { ok: true, value: r.values } : r
    },
    formatInput: (values) => values.join(', '),
    randomInput: () => randomArray(4 + Math.floor(Math.random() * 5)),
    inputLabel: 'Array awal',
    inputHint: 'Angka bulat dipisah koma, 1 sampai 8 angka, rentang -99 sampai 99.',
    presets: [
      { label: '6, 3, 8, 1, 5, 2', value: [6, 3, 8, 1, 5, 2] },
      { label: 'Terbalik (8 angka)', value: [8, 7, 6, 5, 4, 3, 2, 1] },
      { label: 'Ganjil (5 angka)', value: [5, 2, 4, 1, 3] },
    ],
    buildSteps: mergeSortTreeSteps,
    legend: ['normal', 'current', 'waiting', 'merged'],
  },
  recurrenceTree: {
    kind: 'tree',
    title: 'Pohon rekursi T(n) = a·T(n/b) + nᶜ',
    code: recurrenceTreeCode,
    codeLabel: 'Pola kode rekursif umum',
    canvasLabel: 'Pohon rekursi relasi rekurens',
    initialInput: { a: 2, b: 2, c: 1, k: 3 },
    parseInput: parseRecurrenceInput,
    formatInput: formatRecurrenceInput,
    randomInput: () => randomRecurrenceInput(),
    inputLabel: 'Parameter a, b, c, k',
    inputHint:
      'Empat bilangan bulat dipisah koma untuk T(n) = a·T(n/b) + nᶜ dengan n = bᵏ. ' +
      'a: 1 sampai 3, b: 2 sampai 4, c: 0 sampai 2, k (kedalaman): 1 sampai 3. Contoh: 2, 2, 1, 3.',
    presets: [
      { label: 'Merge sort: T(n) = 2T(n/2) + n', value: { a: 2, b: 2, c: 1, k: 3 } },
      { label: 'Binary search: T(n) = T(n/2) + 1', value: { a: 1, b: 2, c: 0, k: 3 } },
      { label: 'Daun dominan: T(n) = 3T(n/2) + n', value: { a: 3, b: 2, c: 1, k: 3 } },
      { label: 'Akar dominan: T(n) = 2T(n/2) + n²', value: { a: 2, b: 2, c: 2, k: 3 } },
    ],
    buildSteps: recurrenceTreeSteps,
    legend: ['normal', 'current', 'base', 'visited'],
  },
  huffmanTree: {
    kind: 'tree',
    title: 'Pembentukan pohon Huffman',
    code: huffmanTreeCode,
    codeLabel: 'Kode algoritma Huffman',
    canvasLabel: 'Pohon Huffman',
    initialInput: [
      { sym: 'A', freq: 5 },
      { sym: 'B', freq: 9 },
      { sym: 'C', freq: 12 },
      { sym: 'D', freq: 13 },
      { sym: 'E', freq: 16 },
      { sym: 'F', freq: 45 },
    ],
    parseInput: parseHuffmanInput,
    formatInput: formatHuffmanInput,
    randomInput: () => randomHuffmanInput(),
    inputLabel: 'Simbol dan frekuensi',
    inputHint: 'Pasangan simbol:frekuensi dipisah koma, contoh A:5, B:9. Simbol satu karakter dan berbeda-beda, 2 sampai 8 simbol, frekuensi 1 sampai 99.',
    presets: [
      { label: 'Contoh klasik (6 simbol)', value: [['A', 5], ['B', 9], ['C', 12], ['D', 13], ['E', 16], ['F', 45]].map(([sym, freq]) => ({ sym, freq })) },
      { label: 'Frekuensi Fibonacci', value: [['A', 1], ['B', 1], ['C', 2], ['D', 3], ['E', 5], ['F', 8]].map(([sym, freq]) => ({ sym, freq })) },
      { label: 'Frekuensi sama (4 simbol)', value: [['A', 3], ['B', 3], ['C', 3], ['D', 3]].map(([sym, freq]) => ({ sym, freq })) },
    ],
    buildSteps: huffmanTreeSteps,
    legend: ['normal', 'pickA', 'pickB', 'created', 'visited'],
  },
  bfsTree: {
    ...binaryTreeInput,
    title: 'BFS pada pohon',
    code: bfsTreeCode,
    codeLabel: 'Kode BFS',
    canvasLabel: 'Pohon yang ditelusuri BFS',
    buildSteps: bfsTreeSteps,
    legend: ['normal', 'queued', 'current', 'visited'],
  },
  dfsTree: {
    ...binaryTreeInput,
    title: 'DFS pada pohon',
    code: dfsTreeCode,
    codeLabel: 'Kode DFS',
    canvasLabel: 'Pohon yang ditelusuri DFS',
    buildSteps: dfsTreeSteps,
    legend: ['normal', 'current', 'waiting', 'visited'],
  },
  binarySearch: {
    kind: 'search',
    title: 'Binary search',
    code: binarySearchCode,
    codeLabel: 'Kode binary search',
    chartLabel: 'Diagram batang binary search',
    initialInput: { array: [5, 8, 9, 10, 14, 20], x: 12 }, // latihan pada materi: hasilnya NIL
    parseInput: parseBinarySearchInput,
    formatInput: formatBinarySearchInput,
    randomInput: () => randomBinarySearchInput(),
    inputHint:
      'Array berisi 1 sampai 12 bilangan bulat yang terurut naik, dipisah koma (rentang -99 sampai 99). ' +
      'Indeks dimulai dari 0, seperti array JavaScript.',
    presets: [
      { label: 'Latihan materi: x = 12 (tidak ada)', value: { array: [5, 8, 9, 10, 14, 20], x: 12 } },
      { label: 'Ditemukan di tengah', value: { array: [2, 5, 8, 12, 16, 23, 38, 56], x: 16 } },
      { label: 'Ditemukan di ujung kiri', value: { array: [2, 5, 8, 12, 16, 23, 38, 56], x: 2 } },
      { label: 'Lebih besar dari semua', value: { array: [2, 5, 8, 12, 16, 23, 38, 56], x: 99 } },
    ],
    buildSteps: binarySearchSteps,
    legend: ['range', 'compare', 'discarded', 'found'],
  },
  lcsTable: {
    kind: 'table',
    title: 'Tabel LCS',
    code: lcsCode,
    codeLabel: 'Kode LCS',
    initialInput: { x: 'ABCBDAB', y: 'BDCABA' }, // contoh klasik: LCS = BCBA, panjang 4
    fields: [
      { key: 'x', label: 'String x (baris tabel)' },
      { key: 'y', label: 'String y (kolom tabel)' },
    ],
    parseInput: parseLcsInput,
    formatInput: formatLcsInput,
    randomInput: () => randomLcsInput(),
    inputHint: 'Masing-masing 1 sampai 7 karakter, hanya huruf dan angka. Huruf besar dan kecil dianggap berbeda.',
    presets: [
      { label: 'Contoh klasik: ABCBDAB dan BDCABA', value: { x: 'ABCBDAB', y: 'BDCABA' } },
      { label: 'Tidak ada yang sama: ABC dan XYZ', value: { x: 'ABC', y: 'XYZ' } },
      { label: 'Sama persis: ALGO dan ALGO', value: { x: 'ALGO', y: 'ALGO' } },
      { label: 'Subsequence: ACE dan ABCDE', value: { x: 'ACE', y: 'ABCDE' } },
    ],
    buildSteps: lcsSteps,
    legend: ['empty', 'filled', 'current', 'source', 'path'],
  },
  matrixChainTable: {
    kind: 'table',
    title: 'Tabel perkalian rantai matriks',
    code: matrixChainCode,
    codeLabel: 'Kode rantai matriks',
    initialInput: [30, 35, 15, 5, 10, 20, 25], // contoh klasik: biaya 15125, ((A1(A2A3))((A4A5)A6))
    fields: [{ key: 'dims', label: 'Ukuran matriks (dims)' }],
    parseInput: parseMatrixChainInput,
    formatInput: formatMatrixChainInput,
    randomInput: () => randomMatrixChainInput(),
    inputHint:
      'Angka dipisah koma. Matriks Ai berukuran dims[i-1] × dims[i], jadi n matriks butuh n + 1 angka. ' +
      'Isi 3 sampai 7 angka (2 sampai 6 matriks), tiap angka 1 sampai 99. Contoh: 10, 30, 5, 60.',
    presets: [
      { label: 'Contoh klasik (6 matriks)', value: [30, 35, 15, 5, 10, 20, 25] },
      { label: 'Contoh soal: 10, 30, 5, 60', value: [10, 30, 5, 60] },
      { label: 'Dua matriks: 10, 20, 30', value: [10, 20, 30] },
      { label: 'Ukuran sama: 10, 10, 10, 10, 10', value: [10, 10, 10, 10, 10] },
    ],
    buildSteps: matrixChainSteps,
    legend: ['empty', 'filled', 'current', 'source', 'path', 'unused'],
  },
  activitySelection: {
    kind: 'timeline',
    title: 'Garis waktu Activity Selection',
    code: activitySelectionCode,
    codeLabel: 'Kode activity selection',
    chartCaption: 'Garis waktu aktivitas',
    // Contoh klasik (CLRS, 11 aktivitas): hasilnya a1, a4, a8, a11 = 4 aktivitas. Sama dengan test case pertama soal challenge.
    initialInput: { start: [1, 3, 0, 5, 3, 5, 6, 8, 8, 2, 12], finish: [4, 5, 6, 7, 9, 9, 10, 11, 12, 14, 16] },
    fields: [
      { key: 'start', label: 'Waktu mulai (start)' },
      { key: 'finish', label: 'Waktu selesai (finish)' },
    ],
    parseInput: parseActivityInput,
    formatInput: formatActivityInput,
    randomInput: () => randomActivityInput(),
    inputHint:
      'Aktivitas ke-i berjalan dari start[i] sampai finish[i]. Isi kedua baris dengan jumlah angka yang sama (1 sampai 12 aktivitas), ' +
      'bilangan bulat 0 sampai 30, dan finish harus lebih besar dari start. Data tidak harus terurut. Contoh: start 1, 3, 5 dan finish 3, 5, 7.',
    presets: [
      { label: 'Contoh klasik (11 aktivitas)', value: { start: [1, 3, 0, 5, 3, 5, 6, 8, 8, 2, 12], finish: [4, 5, 6, 7, 9, 9, 10, 11, 12, 14, 16] } },
      { label: 'Data tidak terurut (soal challenge)', value: { start: [12, 5, 8, 3, 0, 2, 6, 8, 3, 5, 1], finish: [16, 9, 12, 5, 6, 14, 10, 11, 9, 7, 4] } },
      { label: 'Hanya bersentuhan: semua dipilih', value: { start: [1, 3, 5], finish: [3, 5, 7] } },
      { label: 'Satu aktivitas panjang menutup semua', value: { start: [1, 2, 3], finish: [10, 10, 10] } },
      { label: 'Yang paling awal mulai bukan yang terbaik', value: { start: [0, 1, 5, 8], finish: [10, 3, 7, 9] } },
    ],
    buildSteps: activitySelectionSteps,
    legend: ['normal', 'current', 'selected', 'rejected'],
  },
  bfsGraph: graphEntry(unweightedKind, {
    title: 'BFS pada graf',
    code: bfsGraphCode,
    codeLabel: 'Kode BFS pada graf',
    canvasLabel: 'Graf yang ditelusuri BFS',
    initialInput: TRAVERSAL_PRESETS[0].value,
    fields: [nField, edgesField('Sisi (u-v)'), { key: 'start', label: 'Simpul awal (start)' }],
    inputHint: TRAVERSAL_HINT,
    presets: TRAVERSAL_PRESETS,
    buildSteps: bfsGraphSteps,
    legend: ['normal', 'queued', 'current', 'visited'],
    edgeLegend: ['normal', 'considered', 'chosen', 'rejected'],
  }),
  dfsGraph: graphEntry(unweightedKind, {
    title: 'DFS pada graf',
    code: dfsGraphCode,
    codeLabel: 'Kode DFS pada graf',
    canvasLabel: 'Graf yang ditelusuri DFS',
    initialInput: TRAVERSAL_PRESETS[0].value,
    fields: [nField, edgesField('Sisi (u-v)'), { key: 'start', label: 'Simpul awal (start)' }],
    inputHint: TRAVERSAL_HINT,
    presets: TRAVERSAL_PRESETS,
    buildSteps: dfsGraphSteps,
    legend: ['normal', 'current', 'waiting', 'visited'],
    edgeLegend: ['normal', 'considered', 'chosen', 'rejected'],
  }),
  prim: graphEntry(primKind, {
    title: 'Algoritma Prim',
    code: primCode,
    codeLabel: 'Kode Prim',
    canvasLabel: 'Graf berbobot yang diproses Prim',
    initialInput: MST_PRESETS[0].value,
    fields: [nField, edgesField('Sisi (u-v:bobot)'), { key: 'start', label: 'Simpul awal (start)' }],
    inputHint: MST_HINT,
    presets: MST_PRESETS,
    buildSteps: primSteps,
    legend: ['normal', 'queued', 'current', 'visited'],
    edgeLegend: ['normal', 'considered', 'chosen', 'rejected'],
  }),
  kruskal: graphEntry(mstKind, {
    title: 'Algoritma Kruskal',
    code: kruskalCode,
    codeLabel: 'Kode Kruskal',
    canvasLabel: 'Graf berbobot yang diproses Kruskal',
    initialInput: { n: MST_CLASSIC.n, edges: MST_CLASSIC.edges },
    fields: [nField, edgesField('Sisi (u-v:bobot)')],
    inputHint: MST_HINT,
    presets: MST_PRESETS.map((p) => ({ label: p.label, value: { n: p.value.n, edges: p.value.edges } })),
    buildSteps: kruskalSteps,
    legend: ['normal', 'current', 'visited'],
    edgeLegend: ['normal', 'considered', 'chosen', 'rejected'],
  }),
  dijkstra: graphEntry(dijkstraKind, {
    title: 'Algoritma Dijkstra',
    code: dijkstraCode,
    codeLabel: 'Kode Dijkstra',
    canvasLabel: 'Graf berarah yang diproses Dijkstra',
    initialInput: SHORTEST_PRESETS[0].value,
    fields: [nField, edgesField('Sisi (u>v:bobot)'), { key: 'start', label: 'Simpul sumber (source)' }],
    inputHint: SHORTEST_HINT + 'Bobot bilangan bulat 0 sampai 99 (Dijkstra tidak mendukung bobot negatif).',
    presets: SHORTEST_PRESETS,
    buildSteps: dijkstraSteps,
    legend: ['normal', 'queued', 'current', 'visited'],
    edgeLegend: ['normal', 'considered', 'chosen'],
  }),
  bellmanFord: graphEntry(bellmanKind, {
    title: 'Algoritma Bellman-Ford',
    code: bellmanFordCode,
    codeLabel: 'Kode Bellman-Ford',
    canvasLabel: 'Graf berarah yang diproses Bellman-Ford',
    initialInput: SHORTEST_PRESETS[0].value,
    fields: [nField, edgesField('Sisi (u>v:bobot)'), { key: 'start', label: 'Simpul sumber (source)' }],
    inputHint: SHORTEST_HINT + 'Bobot bilangan bulat −9 sampai 99; bobot negatif boleh. Bila ada siklus negatif yang terjangkau, algoritma melaporkannya.',
    presets: [
      ...SHORTEST_PRESETS.slice(0, 3),
      { label: 'Bobot negatif tanpa siklus negatif', value: { n: 5, edges: [[0, 1, 6], [0, 3, 7], [1, 2, 5], [1, 3, 8], [1, 4, -4], [2, 1, -2], [3, 2, -3], [3, 4, 9], [4, 0, 2], [4, 2, 7]], start: 0 } },
      { label: 'Siklus negatif (jarak tak terhingga turun)', value: { n: 3, edges: [[0, 1, 1], [1, 2, -3], [2, 1, 1]], start: 0 } },
    ],
    buildSteps: bellmanFordSteps,
    legend: ['normal', 'waiting', 'current', 'visited'],
    edgeLegend: ['normal', 'considered', 'chosen'],
  }),
  growthPlot: {
    kind: 'plot',
    mode: 'compare',
    title: 'Grafik laju pertumbuhan fungsi',
    // Fungsi A dikali c, lalu dibandingkan dengan B. c = 1, A = n², B = 2ⁿ sama dengan contoh soal challenge materi 3.
    initialInput: { a: 'n^2', b: '2^n', mult: 1, extras: ['n', 'n log n'] },
    initialView: { n: 10, xMax: 30, scale: 'log' },
    presets: [
      { label: 'Soal materi: n² vs 2ⁿ', value: { a: 'n^2', b: '2^n', mult: 1, extras: [] } },
      { label: 'Konstanta besar: 50·n² vs 2ⁿ', value: { a: 'n^2', b: '2^n', mult: 50, extras: [] } },
      { label: 'n log n vs n²', value: { a: 'n log n', b: 'n^2', mult: 1, extras: ['n'] } },
      { label: 'Semua kelas dasar', value: { a: 'log n', b: '2^n', mult: 1, extras: ['1', 'n', 'n log n', 'n^2', 'n^3'] } },
    ],
  },
  boundPlot: {
    kind: 'plot',
    mode: 'bound',
    title: 'Grafik batas asimtotik (O, Ω, Θ)',
    // f(n) = 3n² + 10n + 5 dengan c1 = 1 dan c2 = 4: n₀ = 11, contoh pada soal challenge materi 4.
    initialInput: { a: 3, b: 10, c: 5, c1: 1, c2: 4, notation: 'Theta' },
    initialView: { n: 11, xMax: 30, scale: 'linear' },
    presets: [
      { label: 'Contoh soal: n₀ = 11', value: { a: 3, b: 10, c: 5, c1: 1, c2: 4, notation: 'Theta' } },
      { label: 'c2 terlalu kecil (tidak ada n₀)', value: { a: 3, b: 10, c: 5, c1: 1, c2: 2, notation: 'Theta' } },
      { label: 'c1 lebih besar dari a', value: { a: 3, b: 10, c: 5, c1: 4, c2: 5, notation: 'Theta' } },
      { label: 'Tanpa suku kecil: n₀ = 1', value: { a: 3, b: 0, c: 0, c1: 3, c2: 3, notation: 'Theta' } },
      { label: 'Hanya batas atas O', value: { a: 2, b: 0, c: 100, c1: 1, c2: 3, notation: 'O' } },
    ],
  },
  littlePlot: {
    kind: 'plot',
    mode: 'little',
    title: 'Grafik rasio untuk o dan ω',
    // ci = indeks pada C_VALUES (src/lib/asymptotic.js); 3 berarti c = 0,5.
    initialInput: { f: 'n', g: 'n^2', ci: 3 },
    initialView: { n: 10, xMax: 40, scale: 'log' },
    presets: [
      { label: 'n = o(n²)', value: { f: 'n', g: 'n^2', ci: 3 } },
      { label: 'n² = ω(n)', value: { f: 'n^2', g: 'n', ci: 5 } },
      { label: 'n² dan n²: Θ, bukan o', value: { f: 'n^2', g: 'n^2', ci: 2 } },
      { label: '2ⁿ = ω(n³)', value: { f: '2^n', g: 'n^3', ci: 7 } },
      { label: 'n vs n log n: butuh n besar', value: { f: 'n', g: 'n log n', ci: 0 } },
    ],
  },
}

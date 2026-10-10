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

/**
 * Daftar visualizer. Kuncinya sama dengan field `visualizer` di materials.json
 * (boleh satu kunci atau daftar kunci). `kind: 'tree'` memakai TreeVisualizer, `kind: 'search'` memakai SearchVisualizer;
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
}

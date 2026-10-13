import { parseArrayInput, MIN_VALUE, MAX_VALUE } from '../lib/parseArray.js'
import { bilanganMaxCode, bilanganMaxTrace } from './traces/bilanganMax.js'
import { jumlahBilCode, jumlahBilTrace } from './traces/jumlahBil.js'
import { insertionSortCost, insertionSortPseudoCode, insertionSortPseudoTrace } from './traces/insertionSortPseudo.js'
import { cariBilKCode, cariBilKCost, cariBilKTrace } from './traces/cariBilK.js'
import { mergeSortPseudoCode, mergeSortPseudoTrace } from './traces/mergeSortPseudo.js'
import { checkMatrixChainP, matrixChainPseudoCode, matrixChainPseudoTrace } from './traces/matrixChainPseudo.js'
import { GREEDY_LIMITS, checkGreedyInput, greedyActivityCode, greedyActivityTrace } from './traces/greedyActivity.js'
import { bfsPseudoCode, bfsPseudoTrace, checkBfsInput } from './traces/bfsPseudo.js'
import { checkDfsInput, dfsPseudoCode, dfsPseudoTrace } from './traces/dfsPseudo.js'
import { checkHuffmanInput, huffmanPseudoCode, huffmanPseudoTrace } from './traces/huffmanPseudo.js'
import { checkKruskalInput, kruskalPseudoCode, kruskalPseudoTrace } from './traces/kruskalPseudo.js'
import { checkPrimInput, primPseudoCode, primPseudoTrace } from './traces/primPseudo.js'
import { LCS_PSEUDO_MAX, lcsLengthPseudoCode, lcsLengthPseudoTrace, printLcsPseudoCode, printLcsPseudoTrace } from './traces/lcsPseudo.js'
import {
  binarySearchIterCode,
  binarySearchIterTrace,
  binarySearchRecCode,
  binarySearchRecTrace,
  checkSorted,
} from './traces/binarySearch.js'

/**
 * @typedef {Object} TraceStep
 * @property {number} line   nomor baris pseudocode (mulai dari 1) yang baru dijalankan
 * @property {string} note   penjelasan langkah (Bahasa Indonesia)
 * @property {Array<{ name: string, value: string }>} vars  nilai variabel SESUDAH baris itu dijalankan
 * @property {{ title: string, values: number[], marks: string[], indexBase: number } | null} array
 * @property {Array<{ title: string, values: number[], marks: string[], indexBase: number }>} [arrays]  beberapa array sekaligus (misalnya s dan f); judulnya harus berbeda
 * @property {Array<{ title: string, items: string[], empty?: string }>} [lists]  daftar teks (misalnya isi antrean atau simpul pohon), judul harus berbeda
 * @property {string[]} [stack]  tumpukan panggilan (rekursif)
 * @property {Array<{ table: { caption: string, corner: string, rowHeaders: string[], colHeaders: string[], cells: Array<Array<{ text: string, sub?: string, mark: string, glyph?: string }>> }, labels?: Record<string, string>, legend?: string[] }>} [tables]
 *   tabel DP (misalnya tabel m dan s) pada langkah ini, tampil di bawah kode dan variabel
 * @property {Record<number, number>} [counts]  berapa kali tiap baris sudah terbaca SAMPAI langkah ini (untuk analisis running time)
 */

/**
 * @typedef {Object} TraceDef
 * @property {string} title       tanda tangan fungsi, tampil sebagai judul peraga
 * @property {string} intro       satu kalimat pengantar
 * @property {string} code        pseudocode, satu baris kode per baris (nomor baris = nomor langkah di materi)
 * @property {string} codeLabel
 * @property {Array<{ key: string, label: string, kind: 'int' | 'array' | 'text' | 'free', value: string, max?: number, limits?: { maxLength?: number, minValue?: number, maxValue?: number } }>} inputs
 * @property {(values: Record<string, any>) => string|null} [validate]  pesan kesalahan, atau null bila masukan sah
 * @property {(values: Record<string, any>) => TraceStep[]} build
 * @property {string[]} [legend]  status yang dipakai array (kunci STATUS)
 * @property {{ formulaLabel: string, note: string, rows: Array<{ line: number, cost: string, formula: string }> }} [cost]
 *   bila ada (dan langkah punya `counts`), peraga menampilkan tabel cost dan jumlah operasi tiap baris
 * @property {Array<{ label: string, values: Record<string, string> }>} [presets]  tombol contoh masukan siap pakai
 */

const intInput = (key, value, label = key) => ({ key, label, kind: 'int', value: String(value) })

const insertionSortPresets = [
  { label: 'Contoh materi: 12, 10, 15, 7', values: { A: '12, 10, 15, 7' } },
  { label: 'Kasus terbaik: 2, 4, 12, 15, 30', values: { A: '2, 4, 12, 15, 30' } },
  { label: 'Kasus terburuk: 30, 15, 12, 4, 2', values: { A: '30, 15, 12, 4, 2' } },
]

// Judul harus unik antarperaga di satu halaman: dipakai sebagai nama bagian (landmark) oleh pembaca layar.
const insertionSortTrace = (title, value, intro) => ({
  title,
  intro,
  code: insertionSortPseudoCode,
  codeLabel: 'Pseudocode INSERTION_SORT',
  inputs: [{ key: 'A', label: 'Array A', kind: 'array', value }],
  build: insertionSortPseudoTrace,
  legend: ['normal', 'sorted', 'key', 'compare', 'gap', 'shift', 'placed'],
  cost: insertionSortCost,
  presets: insertionSortPresets,
})

const cariBilKPresets = [
  { label: 'k tidak ada (kasus terburuk)', values: { A: '7, 3, 9, 4', k: '5' } },
  { label: 'k ada di tengah', values: { A: '7, 3, 9, 4', k: '9' } },
  { label: 'k ada di awal (kasus terbaik)', values: { A: '7, 3, 9, 4', k: '7' } },
]

const mergeSortPresets = [
  { label: 'Contoh soal materi: 3, 10, 8, 20, 5', values: { A: '3, 10, 8, 20, 5' } },
  { label: 'Diagram materi: 38, 27, 43, 3, 9, 82, 10', values: { A: '38, 27, 43, 3, 9, 82, 10' } },
  { label: 'Sudah terurut: 1, 2, 3, 4', values: { A: '1, 2, 3, 4' } },
  { label: 'Satu bilangan: 7', values: { A: '7' } },
]

const matrixChainPresets = [
  { label: 'Contoh materi: 6 matriks', values: { p: '30, 35, 15, 5, 10, 20, 25' } },
  { label: 'Tiga matriks: 2, 3, 8, 5', values: { p: '2, 3, 8, 5' } },
  { label: 'Soal kuis: 10, 30, 5, 60', values: { p: '10, 30, 5, 60' } },
  { label: 'Dua matriks: 10, 20, 30', values: { p: '10, 20, 30' } },
]

const greedyPresets = [
  { label: 'Contoh materi (terurut menurut finish time)', values: { s: '1, 3, 0, 5, 3, 5, 6, 8, 8, 2, 12', f: '4, 5, 6, 7, 9, 9, 10, 11, 12, 14, 16' } },
  { label: 'Latihan a: urut start time (tidak optimal)', values: { s: '0, 1, 2, 3, 3, 5, 5, 6, 8, 8, 12', f: '6, 4, 14, 5, 9, 7, 9, 10, 11, 12, 16' } },
  { label: 'Latihan b: urut durasi (kebetulan optimal)', values: { s: '3, 5, 1, 8, 5, 6, 8, 12, 0, 3, 2', f: '5, 7, 4, 11, 9, 10, 12, 16, 6, 9, 14' } },
  { label: 'Contoh tandingan urut durasi: 3 aktivitas', values: { s: '4, 0, 5', f: '6, 5, 10' } },
]

const huffmanPresets = [
  { label: 'Contoh materi: a:45 sampai f:5', values: { C: 'a:45, b:13, c:12, d:16, e:9, f:5' } },
  { label: 'Frekuensi Fibonacci (pohon miring)', values: { C: 'a:1, b:1, c:2, d:3, e:5, f:8' } },
  { label: 'Frekuensi sama (aturan seri)', values: { C: 'a:3, b:3, c:3, d:3' } },
  { label: 'Dua simbol saja', values: { C: 'a:7, b:2' } },
]

const bfsPresets = [
  { label: 'Contoh materi: graf r s t u / v w x y', values: { G: 's: w, r; r: s, v; t: u, w, x; u: t, x, y; v: r; w: s, t, x; x: t, u, y, w; y: x, u', s: 's' } },
  { label: 'Graf tak berarah Gambar 1, mulai dari 1', values: { G: '1: 2, 5; 2: 1, 5, 3, 4; 3: 2, 4; 4: 2, 5, 3; 5: 4, 1, 2', s: '1' } },
  { label: 'Graf berarah Gambar 2, mulai dari 3 (ada yang tak terjangkau)', values: { G: '1: 2, 4; 2: 5; 3: 6, 5; 4: 2; 5: 4; 6: 6', s: '3' } },
  { label: 'Satu simpul tanpa tetangga', values: { G: 'a:', s: 'a' } },
]

const dfsExample = 'u: v, x; v: y; w: y, z; x: v; y: x; z: z'

const dfsPresets = [
  { label: 'Contoh materi: graf berarah u v w / x y z', values: { G: dfsExample } },
  { label: 'Urutan V berbeda: w ditulis lebih dulu', values: { G: 'w: y, z; u: v, x; v: y; x: v; y: x; z: z' } },
  { label: 'Satu pohon: rantai a, b, c', values: { G: 'a: b; b: c; c:' } },
  { label: 'Tiga simpul tanpa busur (tiga pohon)', values: { G: 'a:; b:; c:' } },
  { label: 'Siklus a, b, c (ada busur B)', values: { G: 'a: b; b: c; c: a' } },
]

const kruskalVertices = 'a, b, c, d, e, f, g, h, i'

const kruskalPresets = [
  { label: 'Contoh materi: 9 simpul, 14 sisi (urutan sisi seperti hasil langkah 4)', values: { V: kruskalVertices, E: 'h-g:1, c-i:2, g-f:2, a-b:4, c-f:4, g-i:6, c-d:7, h-i:7, b-c:8, a-h:8, d-e:9, e-f:10, b-h:11, d-f:14' } },
  { label: 'Urutan seperti gambar buku: (a,h) ditulis lebih dulu dari (b,c)', values: { V: kruskalVertices, E: 'a-b:4, a-h:8, b-c:8, b-h:11, c-d:7, c-i:2, c-f:4, d-e:9, d-f:14, e-f:10, f-g:2, g-h:1, g-i:6, h-i:7' } },
  { label: 'Semua bobot sama (MST tidak unik)', values: { V: 'a, b, c', E: 'a-b:1, b-c:1, a-c:1' } },
  { label: 'Graf yang sudah berupa pohon (tidak ada sisi ditolak)', values: { V: 'a, b, c, d', E: 'a-b:3, b-c:1, c-d:2' } },
]

const primExample =
  'a: b(4), h(8); b: a(4), c(8), h(11); c: b(8), i(2), f(4), d(7); d: c(7), e(9), f(14); e: d(9), f(10); f: c(4), d(14), e(10), g(2); g: f(2), h(1), i(6); h: a(8), b(11), g(1), i(7); i: c(2), g(6), h(7)'

const primPresets = [
  { label: 'Contoh materi: akar a, 9 simpul', values: { G: primExample, r: 'a' } },
  { label: 'Graf yang sama, akar e (urutan extract berbeda)', values: { G: primExample, r: 'e' } },
  { label: 'Semua bobot sama (MST tidak unik)', values: { G: 'a: b(1), c(1); b: a(1), c(1); c: a(1), b(1)', r: 'a' } },
  { label: 'Dua simpul saja', values: { G: 'a: b(5); b: a(5)', r: 'a' } },
]

const lcsPresets = [
  { label: 'Contoh materi: ABCBDAB dan BDCABA', values: { X: 'ABCBDAB', Y: 'BDCABA' } },
  { label: 'Tidak ada yang sama: ABC dan XYZ', values: { X: 'ABC', Y: 'XYZ' } },
  { label: 'Sama persis: ALGO dan ALGO', values: { X: 'ALGO', Y: 'ALGO' } },
  { label: 'Subsequence: ACE dan ABCDE', values: { X: 'ACE', Y: 'ABCDE' } },
]

const textInput = (key, value, label, max) => ({ key, label, kind: 'text', value, max })

/** @type {Record<string, TraceDef>} */
export const traces = {
  'insertion-sort': insertionSortTrace(
    'INSERTION_SORT(A)',
    '12, 10, 15, 7',
    'Mengurutkan array dari kecil ke besar. Isian awal adalah contoh di materi (12, 10, 15, 7). Perhatikan baris mana yang dilewati saat while bernilai FALSE.',
  ),
  'insertion-sort-best': insertionSortTrace(
    'INSERTION_SORT(A), kasus terbaik',
    '2, 4, 12, 15, 30',
    'Kasus terbaik: array sudah terurut dari kecil ke besar. Perhatikan bahwa langkah 4 hanya dibaca 1 kali pada setiap loop, sedangkan langkah 5 dan 6 tidak pernah dibaca.',
  ),
  'insertion-sort-worst': insertionSortTrace(
    'INSERTION_SORT(A), kasus terburuk',
    '30, 15, 12, 4, 2',
    'Kasus terburuk: array terurut dari besar ke kecil. Perhatikan bahwa langkah 4 dibaca j kali pada loop ke j, karena key selalu bergeser sampai ke ujung kiri.',
  ),
  'cari-bil-k': {
    title: 'CARI_BIL_K(A, k)',
    intro: 'Mencari bilangan k di dalam array A. Isian awal adalah kasus terburuk, yaitu k tidak ada di array.',
    code: cariBilKCode,
    codeLabel: 'Pseudocode CARI_BIL_K',
    inputs: [{ key: 'A', label: 'Array A', kind: 'array', value: '7, 3, 9, 4' }, intInput('k', 5, 'Bilangan k yang dicari')],
    build: cariBilKTrace,
    legend: ['normal', 'current', 'done', 'found'],
    cost: cariBilKCost,
    presets: cariBilKPresets,
  },
  'merge-sort': {
    title: 'MERGE_SORT(A, p, r)',
    intro:
      'Mengurutkan array dengan Divide and Conquer. Isian awal adalah contoh soal di materi (3, 10, 8, 20, 5). Perhatikan tumpukan panggilan: tiap pemanggilan punya p, q, dan r sendiri, dan MERGE baru dikerjakan setelah kedua bagian selesai.',
    code: mergeSortPseudoCode,
    codeLabel: 'Pseudocode MERGE_SORT',
    inputs: [{ key: 'A', label: 'Array A', kind: 'array', value: '3, 10, 8, 20, 5' }],
    build: mergeSortPseudoTrace,
    legend: ['normal', 'range', 'left', 'right', 'sorted', 'merged'],
    presets: mergeSortPresets,
  },
  'matrix-chain-order': {
    title: 'MATRIX-CHAIN-ORDER(p)',
    intro:
      'Mengisi tabel m (biaya minimum) dan tabel s (titik pecah terbaik) untuk rantai matriks. Isian awal adalah contoh di materi (6 matriks). Perhatikan sel Ki dan Ka: dua sel yang dijumlahkan pada baris 10, bersama tiga nilai p bertanda ◆.',
    code: matrixChainPseudoCode,
    codeLabel: 'Pseudocode MATRIX-CHAIN-ORDER',
    inputs: [{ key: 'p', label: 'Barisan p (ukuran matriks)', kind: 'array', value: '30, 35, 15, 5, 10, 20, 25' }],
    validate: ({ p }) => checkMatrixChainP(p),
    build: matrixChainPseudoTrace,
    legend: ['normal', 'factor'],
    presets: matrixChainPresets,
  },
  'lcs-length': {
    title: 'LCS-LENGTH(X, Y)',
    intro:
      'Mengisi tabel c (panjang LCS) dan tabel b (panah asal) untuk dua barisan. Isian awal adalah contoh di materi (ABCBDAB dan BDCABA), jadi tabel akhirnya sama dengan gambar di bagian C. Perhatikan sel sumber yang bertanda panah: dari sanalah isi sel yang sedang dihitung berasal.',
    code: lcsLengthPseudoCode,
    codeLabel: 'Pseudocode LCS-LENGTH',
    inputs: [textInput('X', 'ABCBDAB', 'Barisan X (baris tabel)', LCS_PSEUDO_MAX), textInput('Y', 'BDCABA', 'Barisan Y (kolom tabel)', LCS_PSEUDO_MAX)],
    build: lcsLengthPseudoTrace,
    legend: [],
    presets: lcsPresets,
  },
  'print-lcs': {
    title: 'PRINT-LCS(b, X, i, j)',
    intro:
      'Menelusuri tabel b dari sel kanan-bawah untuk mencetak LCS. Tabel b dihitung lebih dulu dari dua barisan isian. Isian awal adalah contoh di materi, yang menghasilkan B, C, B, A. Perhatikan tumpukan panggilan: huruf dicetak saat pemanggilan kembali ke baris 5, bukan saat turun.',
    code: printLcsPseudoCode,
    codeLabel: 'Pseudocode PRINT-LCS',
    inputs: [textInput('X', 'ABCBDAB', 'Barisan X (baris tabel)', LCS_PSEUDO_MAX), textInput('Y', 'BDCABA', 'Barisan Y (kolom tabel)', LCS_PSEUDO_MAX)],
    build: printLcsPseudoTrace,
    legend: [],
    presets: lcsPresets,
  },
  'greedy-activity-selector': {
    title: 'GREEDY-ACTIVITY-SELECTOR(s, f)',
    intro:
      'Memilih aktivitas saling kompatibel dengan algoritma Greedy. Data dibaca menurut urutan masukan dan TIDAK diurutkan lebih dulu. Isian awal adalah contoh materi (sudah terurut menurut finish time, hasil 4 aktivitas). Coba tombol latihan a, latihan b, dan contoh tandingan untuk melihat kapan hasilnya tidak optimal.',
    code: greedyActivityCode,
    codeLabel: 'Pseudocode GREEDY-ACTIVITY-SELECTOR',
    inputs: [
      { key: 's', label: 'Array s (start time)', kind: 'array', value: '1, 3, 0, 5, 3, 5, 6, 8, 8, 2, 12', limits: GREEDY_LIMITS },
      { key: 'f', label: 'Array f (finish time)', kind: 'array', value: '4, 5, 6, 7, 9, 9, 10, 11, 12, 14, 16', limits: GREEDY_LIMITS },
    ],
    validate: checkGreedyInput,
    build: greedyActivityTrace,
    legend: ['normal', 'current', 'compare', 'chosen', 'skipped'],
    presets: greedyPresets,
  },
  huffman: {
    title: 'HUFFMAN(C)',
    intro:
      'Membangun pohon Huffman dengan algoritma Greedy: gabungkan dua simpul berfrekuensi terkecil, ulangi sampai tinggal satu. Isian awal adalah contoh materi (a:45, b:13, c:12, d:16, e:9, f:5), hasilnya kode a = 0 dan biaya 224. Isian berupa pasangan simbol:frekuensi, 2 sampai 8 simbol berbeda, frekuensi 1 sampai 99.',
    code: huffmanPseudoCode,
    codeLabel: 'Pseudocode HUFFMAN',
    inputs: [{ key: 'C', label: 'Himpunan C (simbol:frekuensi)', kind: 'free', value: 'a:45, b:13, c:12, d:16, e:9, f:5' }],
    validate: checkHuffmanInput,
    build: huffmanPseudoTrace,
    legend: ['normal', 'childLeft', 'childRight', 'newNode'],
    presets: huffmanPresets,
  },
  bfs: {
    title: 'BFS(G, s)',
    intro:
      'Menelusuri graf dengan antrean: simpul diberi warna WHITE, GRAY, lalu BLACK, dan jarak d dihitung dari simpul awal s. Isian awal adalah contoh materi (graf r s t u / v w x y dengan s sebagai simpul awal), jadi tiap putaran while sama dengan panel (b) sampai (i) Gambar 3. Graf ditulis sebagai adjacency-list: simpul, titik dua, tetangganya, dipisah titik koma. Maksimal 8 simpul.',
    code: bfsPseudoCode,
    codeLabel: 'Pseudocode BFS',
    inputs: [
      { key: 'G', label: 'Adjacency-list G (simpul: tetangga; ...)', kind: 'free', value: 's: w, r; r: s, v; t: u, w, x; u: t, x, y; v: r; w: s, t, x; x: t, u, y, w; y: x, u' },
      textInput('s', 's', 'Simpul awal s', 2),
    ],
    validate: checkBfsInput,
    build: bfsPseudoTrace,
    legend: [],
    presets: bfsPresets,
  },
  dfs: {
    title: 'DFS(G) dan DFS-VISIT(G, u)',
    intro:
      'Menelusuri graf secara mendalam: simpul diberi warna WHITE, GRAY, lalu BLACK, dan tiap simpul mendapat dua timestamp, u.d (ditemukan) dan u.f (selesai). Baris 1 sampai 7 adalah DFS(G), dan baris 8 sampai 17 adalah DFS-VISIT(G, u), yang di materi bernomor 1 sampai 10. Isian awal adalah contoh materi (graf berarah u v w / x y z), jadi hasilnya sama dengan graf akhir di bagian D. Graf ditulis sebagai adjacency-list, dan urutan penulisan simpul adalah urutan V. Maksimal 8 simpul.',
    code: dfsPseudoCode,
    codeLabel: 'Pseudocode DFS dan DFS-VISIT',
    inputs: [{ key: 'G', label: 'Adjacency-list G (simpul: tetangga; ...)', kind: 'free', value: dfsExample }],
    validate: checkDfsInput,
    build: dfsPseudoTrace,
    legend: [],
    presets: dfsPresets,
  },
  'mst-kruskal': {
    title: 'MST-KRUSKAL(G, w)',
    intro:
      'Membangun pohon rentang minimum dengan menambah sisi paling ringan yang tidak membentuk siklus. Isian awal adalah contoh materi (9 simpul, 14 sisi, sisi sudah tertulis menurut urutan hasil langkah 4), jadi tabelnya sama dengan tabel di bagian C dan totalnya 37. Simpul ditulis di V, sisi ditulis di E sebagai u-v:bobot. Graf harus terhubung, maksimal 9 simpul dan 16 sisi, bobot 0 sampai 99. Coba tombol urutan gambar buku untuk melihat pohon lain dengan total yang sama.',
    code: kruskalPseudoCode,
    codeLabel: 'Pseudocode MST-KRUSKAL',
    inputs: [
      { key: 'V', label: 'Simpul V (dipisah koma)', kind: 'free', value: kruskalVertices },
      { key: 'E', label: 'Sisi E (u-v:bobot, dipisah koma)', kind: 'free', value: kruskalPresets[0].values.E },
    ],
    validate: checkKruskalInput,
    build: kruskalPseudoTrace,
    legend: [],
    presets: kruskalPresets,
  },
  'mst-prim': {
    title: 'MST-PRIM(G, w, r)',
    intro:
      'Membangun pohon rentang minimum dengan membesarkan satu pohon dari akar r, memakai antrean Q berisi simpul dengan key terkecil. Isian awal adalah contoh materi (akar a), jadi nilai key tiap putaran sama dengan panel (a) sampai (i) di bagian E dan totalnya 37. Graf ditulis sebagai adjacency-list berbobot: simpul, titik dua, lalu tetangga dengan bobot dalam kurung, dipisah titik koma. Urutan penulisan simpul adalah urutan Q. Tulis tiap sisi di kedua daftar dengan bobot sama. Graf harus terhubung, maksimal 9 simpul dan 16 sisi, bobot 0 sampai 99.',
    code: primPseudoCode,
    codeLabel: 'Pseudocode MST-PRIM',
    inputs: [
      { key: 'G', label: 'Adjacency-list G (simpul: tetangga(bobot); ...)', kind: 'free', value: primExample },
      textInput('r', 'a', 'Akar r', 2),
    ],
    validate: checkPrimInput,
    build: primPseudoTrace,
    legend: [],
    presets: primPresets,
  },
  'bilangan-max': {
    title: 'BILANGAN_MAX(bil1, bil2, bil3)',
    intro: 'Menentukan bilangan terbesar dari tiga bilangan. Ubah nilainya, lalu jalankan lagi.',
    code: bilanganMaxCode,
    codeLabel: 'Pseudocode BILANGAN_MAX',
    inputs: [intInput('bil1', 7), intInput('bil2', 4), intInput('bil3', 10)],
    build: bilanganMaxTrace,
  },
  'jumlah-n-bil': {
    title: 'JUMLAH_n_BIL(A)',
    intro: 'Menjumlahkan semua bilangan di dalam array A dengan perulangan for.',
    code: jumlahBilCode,
    codeLabel: 'Pseudocode JUMLAH_n_BIL',
    inputs: [{ key: 'A', label: 'Array A', kind: 'array', value: '20, 35, 15' }],
    build: jumlahBilTrace,
    legend: ['normal', 'current', 'done'],
  },
  'binary-search-iteratif': {
    title: 'BINARY-SEARCH(A, x, p, n), iteratif',
    intro: 'Mencari x di array terurut dengan perulangan while. Isian awal adalah soal latihan di akhir materi.',
    code: binarySearchIterCode,
    codeLabel: 'Pseudocode BINARY-SEARCH iteratif',
    inputs: [{ key: 'A', label: 'Array A (terurut naik)', kind: 'array', value: '5, 8, 9, 10, 14, 20' }, intInput('x', 12, 'Bilangan x yang dicari')],
    validate: ({ A }) => checkSorted(A),
    build: binarySearchIterTrace,
    legend: ['range', 'compare', 'discarded', 'found'],
  },
  'binary-search-rekursif': {
    title: 'BINARY-SEARCH(A, x, p, n), rekursif',
    intro: 'Mencari x di array terurut dengan fungsi yang memanggil dirinya sendiri. Perhatikan tumpukan panggilannya.',
    code: binarySearchRecCode,
    codeLabel: 'Pseudocode BINARY-SEARCH rekursif',
    inputs: [{ key: 'A', label: 'Array A (terurut naik)', kind: 'array', value: '5, 8, 9, 10, 14, 20' }, intInput('x', 12, 'Bilangan x yang dicari')],
    validate: ({ A }) => checkSorted(A),
    build: binarySearchRecTrace,
    legend: ['range', 'compare', 'discarded', 'found'],
  },
}

export const TRACE_IDS = Object.keys(traces)

/**
 * Membaca isian teks pengguna sesuai jenis masukan, lalu membangun langkah penelusuran.
 * @param {TraceDef} def
 * @param {Record<string, string>} texts  isi kolom isian per kunci
 * @returns {{ ok: true, steps: TraceStep[] } | { ok: false, error: string }}
 */
export function runTrace(def, texts) {
  const values = {}
  for (const input of def.inputs) {
    const text = String(texts[input.key] ?? '').trim()
    if (input.kind === 'text') {
      // Barisan karakter (huruf dan angka saja), panjang 1 sampai input.max.
      if (text === '') return { ok: false, error: `${input.label} tidak boleh kosong.` }
      if (!/^[A-Za-z0-9]+$/.test(text)) return { ok: false, error: `${input.label} hanya boleh berisi huruf dan angka, tanpa spasi atau tanda baca.` }
      if (text.length > input.max) return { ok: false, error: `${input.label} maksimal ${input.max} karakter (Anda mengisi ${text.length}).` }
      values[input.key] = text
    } else if (input.kind === 'free') {
      // Teks bebas: bentuknya diperiksa oleh def.validate.
      values[input.key] = text
    } else if (input.kind === 'int') {
      if (!/^-?\d+$/.test(text)) return { ok: false, error: `${input.label} harus berupa bilangan bulat.` }
      const v = Number(text)
      if (v < MIN_VALUE || v > MAX_VALUE) return { ok: false, error: `${input.label} harus di antara ${MIN_VALUE} dan ${MAX_VALUE}.` }
      values[input.key] = v
    } else {
      const r = parseArrayInput(text, input.limits)
      if (!r.ok) return { ok: false, error: `${input.label}: ${r.error}` }
      values[input.key] = r.values
    }
  }
  const problem = def.validate?.(values)
  if (problem) return { ok: false, error: problem }
  return { ok: true, steps: def.build(values) }
}

import { parseArrayInput, MIN_VALUE, MAX_VALUE } from '../lib/parseArray.js'
import { bilanganMaxCode, bilanganMaxTrace } from './traces/bilanganMax.js'
import { jumlahBilCode, jumlahBilTrace } from './traces/jumlahBil.js'
import { insertionSortCost, insertionSortPseudoCode, insertionSortPseudoTrace } from './traces/insertionSortPseudo.js'
import { cariBilKCode, cariBilKCost, cariBilKTrace } from './traces/cariBilK.js'
import { mergeSortPseudoCode, mergeSortPseudoTrace } from './traces/mergeSortPseudo.js'
import { checkMatrixChainP, matrixChainPseudoCode, matrixChainPseudoTrace } from './traces/matrixChainPseudo.js'
import { GREEDY_LIMITS, checkGreedyInput, greedyActivityCode, greedyActivityTrace } from './traces/greedyActivity.js'
import { checkHuffmanInput, huffmanPseudoCode, huffmanPseudoTrace } from './traces/huffmanPseudo.js'
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

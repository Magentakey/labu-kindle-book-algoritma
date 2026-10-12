import { parseArrayInput, MIN_VALUE, MAX_VALUE } from '../lib/parseArray.js'
import { bilanganMaxCode, bilanganMaxTrace } from './traces/bilanganMax.js'
import { jumlahBilCode, jumlahBilTrace } from './traces/jumlahBil.js'
import { insertionSortCost, insertionSortPseudoCode, insertionSortPseudoTrace } from './traces/insertionSortPseudo.js'
import { cariBilKCode, cariBilKCost, cariBilKTrace } from './traces/cariBilK.js'
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
 * @property {string[]} [stack]  tumpukan panggilan (rekursif)
 * @property {Record<number, number>} [counts]  berapa kali tiap baris sudah terbaca SAMPAI langkah ini (untuk analisis running time)
 */

/**
 * @typedef {Object} TraceDef
 * @property {string} title       tanda tangan fungsi, tampil sebagai judul peraga
 * @property {string} intro       satu kalimat pengantar
 * @property {string} code        pseudocode, satu baris kode per baris (nomor baris = nomor langkah di materi)
 * @property {string} codeLabel
 * @property {Array<{ key: string, label: string, kind: 'int' | 'array', value: string }>} inputs
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
    if (input.kind === 'int') {
      if (!/^-?\d+$/.test(text)) return { ok: false, error: `${input.label} harus berupa bilangan bulat.` }
      const v = Number(text)
      if (v < MIN_VALUE || v > MAX_VALUE) return { ok: false, error: `${input.label} harus di antara ${MIN_VALUE} dan ${MAX_VALUE}.` }
      values[input.key] = v
    } else {
      const r = parseArrayInput(text)
      if (!r.ok) return { ok: false, error: `${input.label}: ${r.error}` }
      values[input.key] = r.values
    }
  }
  const problem = def.validate?.(values)
  if (problem) return { ok: false, error: problem }
  return { ok: true, steps: def.build(values) }
}

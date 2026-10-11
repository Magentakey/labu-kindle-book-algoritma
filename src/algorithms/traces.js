import { parseArrayInput, MIN_VALUE, MAX_VALUE } from '../lib/parseArray.js'
import { bilanganMaxCode, bilanganMaxTrace } from './traces/bilanganMax.js'
import { jumlahBilCode, jumlahBilTrace } from './traces/jumlahBil.js'
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
 */

const intInput = (key, value, label = key) => ({ key, label, kind: 'int', value: String(value) })

/** @type {Record<string, TraceDef>} */
export const traces = {
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

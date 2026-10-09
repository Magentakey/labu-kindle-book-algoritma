import { deepEqual } from './deepEqual.js'

/** Salinan aman untuk dikirim lewat postMessage. Nilai yang tidak bisa disalin (fungsi, dll.) menjadi teks. */
export function safeClone(value) {
  try {
    return structuredClone(value)
  } catch {
    return String(value)
  }
}

function describeError(e) {
  if (e && typeof e === 'object' && 'message' in e) return `${e.name ?? 'Error'}: ${e.message}`
  return `Error: ${String(e)}`
}

/**
 * Menjalankan kode pengguna terhadap test case. Dipakai oleh Web Worker (dan dites langsung di Node).
 *
 * Kode harus mendefinisikan fungsi `solve`. Setiap test case dijalankan terpisah dengan salinan
 * input sendiri, jadi kode yang mengubah array input tidak memengaruhi test berikutnya.
 *
 * @param {string} code
 * @param {Array<{ input: unknown[], expected: unknown }>} testCases
 * @returns {{ status: 'error', kind: 'syntax' | 'runtime' | 'no-solve', message: string }
 *   | { status: 'done', results: Array<{ index: number, pass: boolean, input: unknown[], expected: unknown, actual: unknown, error: string | null }> }}
 */
export function runTests(code, testCases) {
  let solve
  try {
    // Mode ketat: variabel yang lupa dideklarasikan menjadi ReferenceError, bukan variabel global diam-diam.
    solve = new Function(`"use strict";\n${code}\n;return typeof solve === 'function' ? solve : undefined`)()
  } catch (e) {
    return { status: 'error', kind: e instanceof SyntaxError ? 'syntax' : 'runtime', message: describeError(e) }
  }
  if (!solve) {
    return { status: 'error', kind: 'no-solve', message: 'Fungsi solve tidak ditemukan. Tulis kode dengan function solve(...) { ... }.' }
  }

  const results = testCases.map((tc, index) => {
    try {
      const actual = solve(...structuredClone(tc.input))
      return {
        index,
        pass: deepEqual(actual, tc.expected),
        input: tc.input,
        expected: tc.expected,
        actual: safeClone(actual),
        error: null,
      }
    } catch (e) {
      return { index, pass: false, input: tc.input, expected: tc.expected, actual: undefined, error: describeError(e) }
    }
  })
  return { status: 'done', results }
}

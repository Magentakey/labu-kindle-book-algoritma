import { deepEqual } from './deepEqual.js'

/** Salinan aman untuk dikirim lewat postMessage. Nilai yang tidak bisa disalin (fungsi, dll.) menjadi teks. */
export function safeClone(value) {
  try {
    return structuredClone(value)
  } catch {
    return String(value)
  }
}

const MAX_LOG_LINES = 20
const MAX_LOG_CHARS = 200

function formatLogArg(a) {
  if (typeof a === 'string') return a
  try {
    return JSON.stringify(a) ?? String(a)
  } catch {
    return String(a)
  }
}

/** console tiruan untuk kode pengguna: mencatat keluaran (dibatasi) alih-alih membuangnya. */
function createConsole(sink) {
  const record = (...args) => {
    if (sink.lines.length === MAX_LOG_LINES) {
      sink.lines.push('… (keluaran dipotong)')
      return
    }
    if (sink.lines.length > MAX_LOG_LINES) return
    const line = args.map(formatLogArg).join(' ')
    sink.lines.push(line.length > MAX_LOG_CHARS ? `${line.slice(0, MAX_LOG_CHARS)}…` : line)
  }
  const base = { log: record, info: record, warn: record, error: record, debug: record }
  return new Proxy(base, { get: (t, k) => (k in t ? t[k] : () => {}) }) // console.table dll. tidak membuat error
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
 *   | { status: 'done', results: Array<{ index: number, pass: boolean, input: unknown[], expected: unknown, actual: unknown, error: string | null, logs: string[] }> }}
 */
export function runTests(code, testCases) {
  let solve
  const sink = { lines: [] }
  try {
    // Mode ketat: variabel yang lupa dideklarasikan menjadi ReferenceError, bukan variabel global diam-diam.
    solve = new Function('console', `"use strict";\n${code}\n;return typeof solve === 'function' ? solve : undefined`)(createConsole(sink))
  } catch (e) {
    return { status: 'error', kind: e instanceof SyntaxError ? 'syntax' : 'runtime', message: describeError(e) }
  }
  if (!solve) {
    return { status: 'error', kind: 'no-solve', message: 'Fungsi solve tidak ditemukan. Tulis kode dengan function solve(...) { ... }.' }
  }

  const results = testCases.map((tc, index) => {
    sink.lines = [] // keluaran console dicatat per test case
    try {
      const actual = solve(...structuredClone(tc.input))
      return {
        index,
        pass: deepEqual(actual, tc.expected),
        input: tc.input,
        expected: tc.expected,
        actual: safeClone(actual),
        error: null,
        logs: sink.lines,
      }
    } catch (e) {
      return { index, pass: false, input: tc.input, expected: tc.expected, actual: undefined, error: describeError(e), logs: sink.lines }
    }
  })
  return { status: 'done', results }
}

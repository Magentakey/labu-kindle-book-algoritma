import { test } from 'node:test'
import assert from 'node:assert/strict'
import { runTests } from './runTests.js'
import { describeOutcome } from './describeOutcome.js'

const sortCases = [
  { input: [[3, 1, 2]], expected: [1, 2, 3] },
  { input: [[]], expected: [] },
  { input: [[2, 2, 1]], expected: [1, 2, 2] },
]

test('kode benar: semua test case lulus', () => {
  const out = runTests('function solve(arr) { return [...arr].sort((a, b) => a - b) }', sortCases)
  assert.equal(out.status, 'done')
  assert.deepEqual(out.results.map((r) => r.pass), [true, true, true])
  assert.equal(out.results[0].actual.join(), '1,2,3')
  assert.equal(out.results[0].error, null)
})

test('kode salah sebagian: hasil per test case, dengan actual dan expected', () => {
  const out = runTests('function solve(arr) { return arr }', sortCases)
  assert.deepEqual(out.results.map((r) => r.pass), [false, true, false])
  assert.deepEqual(out.results[0].actual, [3, 1, 2])
  assert.deepEqual(out.results[0].expected, [1, 2, 3])
})

test('kode awal (solve kosong) tidak lulus, solve mengembalikan undefined', () => {
  const out = runTests('function solve(arr) {\n  // tulis\n}\n', sortCases)
  assert.equal(out.status, 'done')
  assert.ok(out.results.every((r) => !r.pass))
  assert.equal(out.results[0].actual, undefined)
})

test('kesalahan sintaks dilaporkan sebagai error syntax', () => {
  const out = runTests('function solve(arr) { return [ }', sortCases)
  assert.equal(out.status, 'error')
  assert.equal(out.kind, 'syntax')
  assert.match(out.message, /SyntaxError/)
})

test('tanpa fungsi solve dilaporkan no-solve', () => {
  const out = runTests('const x = 1', sortCases)
  assert.equal(out.status, 'error')
  assert.equal(out.kind, 'no-solve')
  assert.match(out.message, /solve/)
})

test('kesalahan runtime hanya menggagalkan test case yang bersangkutan', () => {
  const out = runTests('function solve(arr) { if (arr.length === 0) throw new Error("kosong"); return [...arr].sort((a,b)=>a-b) }', sortCases)
  assert.deepEqual(out.results.map((r) => r.pass), [true, false, true])
  assert.equal(out.results[1].error, 'Error: kosong')
})

test('ReferenceError pada variabel yang belum dideklarasikan (mode ketat)', () => {
  const out = runTests('function solve(arr) { hasil = arr; return hasil }', [sortCases[0]])
  assert.match(out.results[0].error, /ReferenceError/)
})

test('kode yang mengubah array input tidak memengaruhi test case lain atau data soal', () => {
  const cases = [
    { input: [[3, 1, 2]], expected: [1, 2, 3] },
    { input: [[3, 1, 2]], expected: [1, 2, 3] },
  ]
  const out = runTests('function solve(arr) { return arr.sort((a, b) => a - b) }', cases)
  assert.deepEqual(out.results.map((r) => r.pass), [true, true])
  assert.deepEqual(cases[0].input, [[3, 1, 2]], 'input asli tidak berubah')
})

test('nilai yang tidak bisa disalin (fungsi) dikirim sebagai teks, bukan membuat worker error', () => {
  const out = runTests('function solve() { return () => 1 }', [{ input: [], expected: 1 }])
  assert.equal(out.status, 'done')
  assert.equal(out.results[0].pass, false)
  assert.equal(typeof out.results[0].actual, 'string')
})

test('melempar nilai bukan Error tetap menjadi teks', () => {
  const out = runTests('function solve() { throw "oops" }', [{ input: [], expected: 1 }])
  assert.equal(out.results[0].error, 'Error: oops')
})

test('describeOutcome: semua lulus, sebagian, error, timeout', () => {
  assert.equal(describeOutcome({ status: 'done', results: [{ pass: true }, { pass: true }] }), 'Semua test case lulus (2 dari 2).')
  assert.equal(describeOutcome({ status: 'done', results: [{ pass: true }, { pass: false }] }), 'Lulus 1 dari 2 test case.')
  assert.match(describeOutcome({ status: 'error', kind: 'syntax', message: 'SyntaxError: x' }), /sintaks.*SyntaxError: x/)
  assert.equal(describeOutcome({ status: 'error', kind: 'no-solve', message: 'pesan' }), 'pesan')
  assert.match(describeOutcome({ status: 'timeout', timeoutMs: 2000 }), /2 detik/)
})

test('console.log dicatat per test case, bukan dibuang atau dicampur', () => {
  const out = runTests('function solve(a) { console.log("masuk", a.length); console.table(a); return a }', [
    { input: [[1, 2]], expected: [1, 2] },
    { input: [[]], expected: [] },
  ])
  assert.deepEqual(out.results[0].logs, ['masuk 2'])
  assert.deepEqual(out.results[1].logs, ['masuk 0'])
})

test('keluaran console dibatasi jumlah baris dan panjangnya', () => {
  const out = runTests('function solve() { for (let i = 0; i < 100; i++) console.log("x".repeat(500)); return 1 }', [{ input: [], expected: 1 }])
  const logs = out.results[0].logs
  assert.equal(logs.length, 21)
  assert.equal(logs[20], '… (keluaran dipotong)')
  assert.ok(logs[0].length <= 201)
})

test('console.log sebelum error tetap tercatat di test case yang error', () => {
  const out = runTests('function solve() { console.log("sebelum"); throw new Error("x") }', [{ input: [], expected: 1 }])
  assert.deepEqual(out.results[0].logs, ['sebelum'])
  assert.equal(out.results[0].error, 'Error: x')
})

test('describeOutcome: kesalahan sintaks dengan perkiraan baris', () => {
  assert.match(describeOutcome({ status: 'error', kind: 'syntax', message: 'SyntaxError: x' }, { line: 3 }), /sekitar baris 3/)
  assert.doesNotMatch(describeOutcome({ status: 'error', kind: 'syntax', message: 'SyntaxError: x' }), /baris/)
})

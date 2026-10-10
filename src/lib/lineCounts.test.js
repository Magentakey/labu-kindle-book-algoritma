import test from 'node:test'
import assert from 'node:assert/strict'
import { buildCountRows, countLinesUpTo } from './lineCounts.js'
import { insertionSortCode, insertionSortExecLines, insertionSortTrace } from '../algorithms/insertionSortExact.js'
import { mergeSortCode, mergeSortExecLines, mergeSortTrace } from '../algorithms/mergeSortExact.js'

test('countLinesUpTo: kumulatif sampai langkah ke-index (termasuk), dan menjumlah ke index + 1', () => {
  const steps = [{ line: 1 }, { line: 2 }, { line: 2 }, { line: 5 }, { line: 2 }]
  assert.deepEqual(countLinesUpTo(steps, 0), { 1: 1 })
  assert.deepEqual(countLinesUpTo(steps, 2), { 1: 1, 2: 2 })
  assert.deepEqual(countLinesUpTo(steps, 4), { 1: 1, 2: 3, 5: 1 })
  assert.deepEqual(countLinesUpTo(steps, 99), { 1: 1, 2: 3, 5: 1 }, 'index berlebih dipotong')
})

test('jumlah semua hitungan sampai langkah k selalu k + 1 pada trace sungguhan', () => {
  for (const steps of [insertionSortTrace([5, 2, 4, 1, 3]), mergeSortTrace([6, 3, 8, 1, 5, 2])]) {
    for (let k = 0; k < steps.length; k++) {
      const total = Object.values(countLinesUpTo(steps, k)).reduce((a, b) => a + b, 0)
      assert.equal(total, k + 1)
    }
  }
})

test('buildCountRows: semua baris eksekusi muncul (termasuk 0 kali), dengan teks baris dari kode', () => {
  const rows = buildCountRows(insertionSortCode, insertionSortExecLines, { 1: 1, 5: 3 })
  assert.equal(rows.length, insertionSortExecLines.length)
  assert.deepEqual(rows.map((r) => r.line), insertionSortExecLines)
  assert.equal(rows.find((r) => r.line === 5).count, 3)
  assert.equal(rows.find((r) => r.line === 6).count, 0)
  assert.match(rows.find((r) => r.line === 5).text, /while/)
  assert.ok(rows.every((r) => r.text && r.text.trim()), 'tidak ada baris kosong atau kurung tutup di tabel')
})

test('baris eksekusi tidak pernah berupa baris kosong atau kurung tutup (insertion dan merge sort)', () => {
  for (const [code, lines] of [[insertionSortCode, insertionSortExecLines], [mergeSortCode, mergeSortExecLines]]) {
    const text = code.trim().split('\n')
    for (const l of lines) {
      assert.ok(text[l - 1].trim() !== '' && text[l - 1].trim() !== '}', `baris ${l}: "${text[l - 1]}"`)
    }
    // sebaliknya, setiap baris berisi pernyataan harus terdaftar sebagai baris eksekusi
    text.forEach((t, idx) => {
      const trimmed = t.trim()
      if (trimmed && trimmed !== '}') assert.ok(lines.includes(idx + 1), `baris ${idx + 1} ("${trimmed}") belum terdaftar`)
    })
  }
})

import test from 'node:test'
import assert from 'node:assert/strict'
import { insertionSortCode, insertionSortSteps } from './insertionSort.js'

const cases = [[], [1], [2, 1], [5, 2, 4], [1, 1, 0], [3, 3, 3], [1, 2, 3, 4], [5, 4, 3, 2, 1], [9, -1, 0, 4, 4, 2]]
const sortedCopy = (a) => [...a].sort((x, y) => x - y)
const last = (steps) => steps[steps.length - 1]

test('hasil akhir terurut untuk berbagai kasus', () => {
  for (const c of cases) {
    assert.deepEqual(last(insertionSortSteps(c)).array, sortedCopy(c), JSON.stringify(c))
  }
})

test('hasil akhir terurut untuk 200 array acak', () => {
  for (let t = 0; t < 200; t++) {
    const a = Array.from({ length: Math.floor(Math.random() * 12) }, () => Math.floor(Math.random() * 20) - 5)
    assert.deepEqual(last(insertionSortSteps(a)).array, sortedCopy(a), JSON.stringify(a))
  }
})

test('array masukan tidak diubah', () => {
  const a = [3, 1, 2]
  insertionSortSteps(a)
  assert.deepEqual(a, [3, 1, 2])
})

test('hasil sama dengan menjalankan kode yang ditampilkan', () => {
  const fn = new Function(`${insertionSortCode}\nreturn insertionSort`)()
  for (const c of cases) {
    assert.deepEqual(last(insertionSortSteps(c)).array, fn([...c]), JSON.stringify(c))
  }
})

test('setiap langkah punya bentuk data yang benar', () => {
  const total = insertionSortCode.split('\n').length
  for (const c of cases) {
    const steps = insertionSortSteps(c)
    assert.ok(steps.length >= 2)
    assert.equal(steps[0].line, 1)
    assert.equal(last(steps).line, 11)
    assert.equal(last(steps).sortedCount, c.length)
    for (const s of steps) {
      assert.ok(Number.isInteger(s.line) && s.line >= 1 && s.line <= total)
      assert.equal(s.array.length, c.length)
      assert.ok(s.sortedCount >= 0 && s.sortedCount <= c.length)
      assert.equal(typeof s.note, 'string')
      assert.ok(s.note.length > 0)
    }
  }
})

test('nomor baris pada steps cocok dengan isi kode yang ditampilkan', () => {
  const lines = insertionSortCode.split('\n')
  const expected = { 1: 'function insertionSort', 3: 'const key', 5: 'while', 6: 'arr[j + 1] = arr[j]', 9: 'arr[j + 1] = key', 11: 'return arr' }
  for (const c of cases) {
    for (const s of insertionSortSteps(c)) {
      assert.ok(expected[s.line], `baris ${s.line} tidak dikenal`)
      assert.ok(lines[s.line - 1].includes(expected[s.line]), `baris ${s.line}: "${lines[s.line - 1]}"`)
    }
  }
})

test('jumlah langkah geser sama dengan jumlah inversi', () => {
  for (const c of cases) {
    let inversions = 0
    for (let a = 0; a < c.length; a++) for (let b = a + 1; b < c.length; b++) if (c[a] > c[b]) inversions++
    assert.equal(insertionSortSteps(c).filter((s) => s.line === 6).length, inversions, JSON.stringify(c))
  }
})

test('setelah penempatan key (baris 9), isi array adalah permutasi dari masukan', () => {
  for (const c of cases) {
    for (const s of insertionSortSteps(c).filter((x) => x.line === 9)) {
      assert.deepEqual(sortedCopy(s.array), sortedCopy(c))
    }
  }
})

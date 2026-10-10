import test from 'node:test'
import assert from 'node:assert/strict'
import { insertionSortCode, insertionSortExecLines, insertionSortTrace } from './insertionSortExact.js'
import { insertionSortExactView } from './exactViews.js'
import { STATUS } from '../components/BarChart/statuses.js'

const cases = [[], [1], [2, 1], [5, 2, 4], [1, 1, 0], [3, 3, 3], [1, 2, 3, 4], [5, 4, 3, 2, 1], [9, -1, 0, 4, 4, 2], [5, 2, 4, 1, 3]]
const sortedCopy = (a) => [...a].sort((x, y) => x - y)
const lines = insertionSortCode.split('\n')

function countByLine(steps) {
  const c = Object.fromEntries(insertionSortExecLines.map((l) => [l, 0]))
  for (const s of steps) c[s.line]++
  return c
}
// Jumlah inversi: pasangan (a < b) dengan arr[a] > arr[b]. Itu sama dengan total penggeseran insertion sort.
const inversions = (a) => a.reduce((t, x, i) => t + a.slice(i + 1).filter((y) => x > y).length, 0)

test('hasil akhir terurut dan array masukan tidak diubah', () => {
  for (const c of cases) {
    const copy = [...c]
    const steps = insertionSortTrace(c)
    assert.deepEqual(steps[steps.length - 1].array, sortedCopy(c), JSON.stringify(c))
    assert.deepEqual(c, copy)
  }
})

test('hasil sama dengan menjalankan kode yang ditampilkan (200 array acak)', () => {
  const fn = new Function(`${insertionSortCode}\nreturn insertionSort`)()
  for (let t = 0; t < 200; t++) {
    const a = Array.from({ length: Math.floor(Math.random() * 12) }, () => Math.floor(Math.random() * 20) - 5)
    assert.deepEqual(insertionSortTrace(a).at(-1).array, fn([...a]), JSON.stringify(a))
  }
})

test('hitungan tiap baris cocok dengan rumus (n, inversi) untuk 300 array acak dan kasus tepi', () => {
  const random = Array.from({ length: 300 }, () => Array.from({ length: Math.floor(Math.random() * 13) }, () => Math.floor(Math.random() * 15) - 5))
  for (const a of [...cases, ...random]) {
    const n = a.length
    const inv = inversions(a)
    const c = countByLine(insertionSortTrace(a))
    const body = Math.max(n - 1, 0)
    const msg = JSON.stringify(a)
    assert.equal(c[1], 1, `baris 1 ${msg}`)
    assert.equal(c[2], Math.max(n, 1), `baris 2 ${msg}`)
    assert.equal(c[3], body, `baris 3 ${msg}`)
    assert.equal(c[4], body, `baris 4 ${msg}`)
    assert.equal(c[5], inv + body, `baris 5 ${msg}`)
    assert.equal(c[6], inv, `baris 6 ${msg}`)
    assert.equal(c[7], inv, `baris 7 ${msg}`)
    assert.equal(c[9], body, `baris 9 ${msg}`)
    assert.equal(c[11], 1, `baris 11 ${msg}`)
  }
})

test('kasus terbaik dan terburuk: total langkah linear vs kuadrat', () => {
  const n = 8
  const best = insertionSortTrace(Array.from({ length: n }, (_, i) => i))
  const worst = insertionSortTrace(Array.from({ length: n }, (_, i) => n - i))
  // Terbaik (sudah terurut): baris 1 (1) + baris 2 (n) + baris 3, 4, 9 (3(n-1)) + baris 5 (n-1) + baris 11 (1) = 5n - 2.
  assert.equal(best.length, 5 * n - 2)
  const inv = (n * (n - 1)) / 2
  assert.equal(worst.length, best.length + 3 * inv) // tiap inversi menambah baris 5, 6, 7
})

test('jumlah perbandingan sama dengan menjalankan kode asli yang menghitung perbandingan', () => {
  const real = new Function(`${insertionSortCode}\nreturn insertionSort`)()
  for (let t = 0; t < 100; t++) {
    const a = Array.from({ length: Math.floor(Math.random() * 12) }, () => Math.floor(Math.random() * 10))
    let compares = 0
    // setiap `>` pada elemen membungkus memanggil valueOf dua kali
    const wrapped = a.map((v) => ({ valueOf: () => (compares += 0.5, v) }))
    real(wrapped)
    const fromTrace = insertionSortTrace(a).filter((s) => s.line === 5 && s.j >= 0).length
    assert.equal(compares, fromTrace, JSON.stringify(a))
  }
})

test('setiap langkah: baris yang valid, teks baris cocok dengan kode, dan data lengkap', () => {
  const expectText = { 1: /^function insertionSort/, 2: /for \(/, 3: /const key/, 4: /let j/, 5: /while/, 6: /arr\[j \+ 1\] = arr\[j\]/, 7: /j--/, 9: /arr\[j \+ 1\] = key/, 11: /return arr/ }
  for (const c of cases) {
    const steps = insertionSortTrace(c)
    assert.equal(steps[0].line, 1)
    assert.equal(steps.at(-1).line, 11)
    for (const s of steps) {
      assert.ok(insertionSortExecLines.includes(s.line), `baris ${s.line} bukan baris eksekusi`)
      assert.match(lines[s.line - 1], expectText[s.line], `baris ${s.line}`)
      assert.equal(s.array.length, c.length)
      assert.equal(typeof s.note, 'string')
      assert.ok(s.note.startsWith(`Baris ${s.line}:`), s.note)
    }
  }
})

test('tampilan: marks sepanjang array, status terdaftar, key dipegang di baris 3 sampai 7', () => {
  for (const c of cases) {
    for (const s of insertionSortTrace(c)) {
      const v = insertionSortExactView(s)
      assert.equal(v.marks.length, c.length)
      assert.ok(v.marks.every((m) => STATUS[m]))
      if ([4, 5, 6, 7].includes(s.line)) assert.equal(v.held, s.key, `baris ${s.line}`)
    }
  }
})

test('baris 5 menandai pembanding hanya saat j >= 0, dan baris 9 menandai tempat key', () => {
  for (const s of insertionSortTrace([5, 2, 4, 1, 3])) {
    const v = insertionSortExactView(s)
    if (s.line === 5) assert.equal(v.marks.filter((m) => m === 'compare').length, s.j >= 0 ? 1 : 0)
    if (s.line === 9) assert.equal(v.marks[s.j + 1], 'placed')
  }
})

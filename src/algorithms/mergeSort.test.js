import test from 'node:test'
import assert from 'node:assert/strict'
import { mergeSortCode, mergeSortSteps } from './mergeSort.js'

const cases = [[], [1], [2, 1], [1, 2], [5, 2, 4], [1, 1, 0], [3, 3, 3], [5, 4, 3, 2, 1], [9, -1, 0, 4, 4, 2], [6, 3, 8, 1, 5, 2], [8, 7, 6, 5, 4, 3, 2, 1]]
const sortedCopy = (a) => [...a].sort((x, y) => x - y)
const last = (steps) => steps[steps.length - 1]
const randomArray = () => Array.from({ length: Math.floor(Math.random() * 9) }, () => Math.floor(Math.random() * 20) - 5)

test('hasil akhir terurut untuk berbagai kasus', () => {
  for (const c of cases) assert.deepEqual(last(mergeSortSteps(c)).array, sortedCopy(c), JSON.stringify(c))
})

test('hasil akhir terurut untuk 300 array acak', () => {
  for (let t = 0; t < 300; t++) {
    const a = randomArray()
    assert.deepEqual(last(mergeSortSteps(a)).array, sortedCopy(a), JSON.stringify(a))
  }
})

test('array masukan tidak diubah', () => {
  const a = [3, 1, 2]
  mergeSortSteps(a)
  assert.deepEqual(a, [3, 1, 2])
})

test('hasil sama dengan menjalankan kode yang ditampilkan', () => {
  const fn = new Function(`${mergeSortCode}\nreturn mergeSort`)()
  for (const c of cases) {
    const copy = [...c]
    fn(copy)
    assert.deepEqual(last(mergeSortSteps(c)).array, copy, JSON.stringify(c))
  }
})

test('nomor baris pada steps cocok dengan isi kode yang ditampilkan', () => {
  const lines = mergeSortCode.split('\n')
  const expected = {
    1: 'function mergeSort', 3: 'const mid', 7: '}', 11: 'let i = lo',
    13: 'if (arr[i] <= arr[j])', 14: 'else tmp.push(arr[j++])',
    16: 'while (i <= mid)', 17: 'while (j <= hi)', 18: 'for (let k',
  }
  for (const c of cases) {
    for (const s of mergeSortSteps(c)) {
      assert.ok(expected[s.line], `baris ${s.line} tidak dikenal`)
      assert.ok(lines[s.line - 1].includes(expected[s.line]), `baris ${s.line}: "${lines[s.line - 1]}"`)
    }
  }
})

test('langkah pertama baris 1, terakhir baris 7, dan bentuk data benar', () => {
  const total = mergeSortCode.split('\n').length
  for (const c of cases) {
    const steps = mergeSortSteps(c)
    assert.ok(steps.length >= 2)
    assert.equal(steps[0].line, 1)
    assert.equal(last(steps).line, 7)
    for (const s of steps) {
      assert.ok(Number.isInteger(s.line) && s.line >= 1 && s.line <= total)
      assert.equal(s.array.length, c.length)
      assert.equal(typeof s.note, 'string')
      assert.ok(s.note.length > 0)
      assert.ok(Array.isArray(s.tmp) && Array.isArray(s.merged))
    }
  }
})

test('di setiap langkah, isi array adalah permutasi dari masukan', () => {
  for (const c of cases) {
    for (const s of mergeSortSteps(c)) assert.deepEqual(sortedCopy(s.array), sortedCopy(c))
  }
})

test('setiap rentang yang sudah digabung memang terurut', () => {
  for (const c of cases) {
    for (const s of mergeSortSteps(c)) {
      for (const [a, b] of s.merged) {
        const part = s.array.slice(a, b + 1)
        assert.deepEqual(part, sortedCopy(part), `rentang ${a}..${b} pada ${JSON.stringify(c)}`)
      }
    }
  }
})

test('pada baris 18: penampung terurut dan sama dengan isi rentang', () => {
  for (const c of cases) {
    for (const s of mergeSortSteps(c).filter((x) => x.line === 18)) {
      assert.deepEqual(s.tmp, sortedCopy(s.tmp))
      assert.deepEqual(s.array.slice(s.lo, s.hi + 1), s.tmp)
    }
  }
})

test('jumlah rentang digabung = n - 1 dan penampung penuh sebelum disalin', () => {
  for (const c of cases.filter((x) => x.length >= 1)) {
    const steps = mergeSortSteps(c)
    assert.equal(steps.filter((s) => s.line === 18).length, c.length - 1, JSON.stringify(c))
    for (const s of steps.filter((x) => x.line === 18)) assert.equal(s.tmp.length, s.hi - s.lo + 1)
  }
})

test('langkah bandingkan: ambil kiri hanya bila kiri <= kanan (stabil)', () => {
  for (const c of cases) {
    for (const s of mergeSortSteps(c).filter((x) => x.line === 13 || x.line === 14)) {
      const [a, b] = s.cmp
      // array belum diubah selama penggabungan, jadi nilai pembanding bisa dibaca langsung
      if (s.line === 13) assert.ok(s.array[a] <= s.array[b])
      else assert.ok(s.array[a] > s.array[b])
    }
  }
})
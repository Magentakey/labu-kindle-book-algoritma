import test from 'node:test'
import assert from 'node:assert/strict'
import { mergeSortSteps } from './mergeSort.js'
import { mergeSortView } from './mergeSortView.js'
import { STATUS } from '../components/BarChart/statuses.js'

const cases = [[], [1], [2, 1], [5, 2, 4], [1, 1, 0], [6, 3, 8, 1, 5, 2], [8, 7, 6, 5, 4, 3, 2, 1]]
const count = (marks, m) => marks.filter((x) => x === m).length

test('marks sepanjang array dan hanya memakai status yang terdaftar', () => {
  for (const c of cases) {
    for (const s of mergeSortSteps(c)) {
      const v = mergeSortView(s)
      assert.equal(v.marks.length, c.length)
      assert.ok(v.marks.every((m) => STATUS[m]), `status tak dikenal: ${v.marks}`)
      assert.ok(v.aux.marks.every((m) => STATUS[m]))
      assert.equal(v.aux.values.length, v.aux.marks.length)
    }
  }
})

test('baris 3: ada bagian kiri dan kanan, dan semuanya di dalam rentang', () => {
  for (const c of cases) {
    for (const s of mergeSortSteps(c).filter((x) => x.line === 3)) {
      const v = mergeSortView(s)
      assert.equal(count(v.marks, 'left'), s.mid - s.lo + 1)
      assert.equal(count(v.marks, 'right'), s.hi - s.mid)
      assert.equal(v.aux.values.length, 0)
    }
  }
})

test('baris 13/14: tepat dua bar dibandingkan dan penampung bertambah', () => {
  for (const c of cases) {
    for (const s of mergeSortSteps(c).filter((x) => x.line === 13 || x.line === 14)) {
      const v = mergeSortView(s)
      assert.equal(count(v.marks, 'compare'), 2)
      assert.ok(v.aux.values.length >= 1)
    }
  }
})

test('baris 16/17: tidak ada pembandingan', () => {
  for (const c of cases) {
    for (const s of mergeSortSteps(c).filter((x) => x.line === 16 || x.line === 17)) {
      assert.equal(count(mergeSortView(s).marks, 'compare'), 0)
    }
  }
})

test('baris 18: rentang ditandai digabung dan penampung ditandai digabung', () => {
  for (const c of cases) {
    for (const s of mergeSortSteps(c).filter((x) => x.line === 18)) {
      const v = mergeSortView(s)
      for (let k = s.lo; k <= s.hi; k++) assert.equal(v.marks[k], 'merged')
      assert.ok(v.aux.marks.every((m) => m === 'merged'))
    }
  }
})

test('selama penggabungan: elemen yang sudah diambil ditandai dan jumlahnya cocok dengan penampung', () => {
  for (const c of cases) {
    for (const s of mergeSortSteps(c).filter((x) => [11, 13, 14, 16, 17].includes(x.line))) {
      const v = mergeSortView(s)
      const consumed = []
      for (let k = s.lo; k < s.i; k++) consumed.push(k)
      for (let k = s.mid + 1; k < s.j; k++) consumed.push(k)
      assert.equal(consumed.length, s.tmp.length)
      for (const idx of consumed) assert.ok(['taken', 'compare'].includes(v.marks[idx]), `indeks ${idx}`)
      // pada baris 13/14 elemen yang baru diambil tampil sebagai 'compare' (menimpa 'taken')
      const overridden = s.line === 13 || s.line === 14 ? 1 : 0
      assert.equal(count(v.marks, 'taken'), s.tmp.length - overridden)
    }
  }
})

test('langkah terakhir: semua bar terurut dan penampung kosong', () => {
  for (const c of cases) {
    const steps = mergeSortSteps(c)
    const v = mergeSortView(steps[steps.length - 1])
    assert.ok(v.marks.every((m) => m === 'sorted'))
    assert.equal(v.aux.values.length, 0)
  }
})
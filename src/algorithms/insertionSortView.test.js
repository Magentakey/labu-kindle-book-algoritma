import test from 'node:test'
import assert from 'node:assert/strict'
import { insertionSortSteps } from './insertionSort.js'
import { insertionSortView } from './insertionSortView.js'

const cases = [[], [1], [2, 1], [5, 2, 4], [1, 1, 0], [5, 4, 3, 2, 1], [9, -1, 0, 4, 4, 2]]
const count = (marks, m) => marks.filter((x) => x === m).length

test('panjang marks selalu sama dengan panjang array', () => {
  for (const c of cases) {
    for (const s of insertionSortSteps(c)) {
      const v = insertionSortView(s)
      assert.equal(v.marks.length, c.length)
      assert.equal(v.values.length, c.length)
    }
  }
})

test('baris 5: tepat satu bar dibandingkan bila j >= 0, dan key dipegang', () => {
  for (const c of cases) {
    for (const s of insertionSortSteps(c).filter((x) => x.line === 5)) {
      const v = insertionSortView(s)
      assert.equal(count(v.marks, 'compare'), s.j >= 0 ? 1 : 0)
      if (s.j >= 0) assert.equal(v.marks[s.j], 'compare')
      assert.equal(v.held, s.key)
    }
  }
})

test('baris 6: tepat satu bar baru digeser di indeks j + 1', () => {
  for (const c of cases) {
    for (const s of insertionSortSteps(c).filter((x) => x.line === 6)) {
      const v = insertionSortView(s)
      assert.equal(count(v.marks, 'shift'), 1)
      assert.equal(v.marks[s.j + 1], 'shift')
      assert.equal(v.held, s.key)
    }
  }
})

test('baris 9: key sudah ditempatkan di indeks j + 1 dan tidak lagi dipegang', () => {
  for (const c of cases) {
    for (const s of insertionSortSteps(c).filter((x) => x.line === 9)) {
      const v = insertionSortView(s)
      assert.equal(count(v.marks, 'placed'), 1)
      assert.equal(v.marks[s.j + 1], 'placed')
      assert.equal(v.values[s.j + 1], s.key)
      assert.equal(v.held, null)
    }
  }
})

test('baris 3: asal key ditandai dan key dipegang', () => {
  for (const c of cases) {
    for (const s of insertionSortSteps(c).filter((x) => x.line === 3)) {
      const v = insertionSortView(s)
      assert.equal(v.marks[s.i], 'key')
      assert.equal(v.held, s.key)
    }
  }
})

test('langkah terakhir: semua bar terurut dan tidak ada key dipegang', () => {
  for (const c of cases) {
    const steps = insertionSortSteps(c)
    const v = insertionSortView(steps[steps.length - 1])
    assert.ok(v.marks.every((m) => m === 'sorted'))
    assert.equal(v.held, null)
  }
})
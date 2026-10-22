import test from 'node:test'
import assert from 'node:assert/strict'
import { PROGRESS_SEGMENTS, filledSegments, statusLabels } from './uiLogic.js'

test('progres 8 balok: nilai 0, 50, dan 100 sama dengan varian Figma', () => {
  assert.equal(PROGRESS_SEGMENTS, 8)
  assert.equal(filledSegments(0), 0)
  assert.equal(filledSegments(50), 4)
  assert.equal(filledSegments(100), 8)
  assert.equal(filledSegments(-10), 0)
  assert.equal(filledSegments(250), 8)
  assert.equal(filledSegments(45), 4)
})

test('status modul punya teks untuk pembaca layar', () => {
  assert.deepEqual(Object.keys(statusLabels), ['belum', 'sedang', 'selesai'])
})

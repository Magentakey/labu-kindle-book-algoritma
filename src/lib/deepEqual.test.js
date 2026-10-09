import { test } from 'node:test'
import assert from 'node:assert/strict'
import { deepEqual } from './deepEqual.js'

test('deepEqual: nilai dasar', () => {
  assert.equal(deepEqual(1, 1), true)
  assert.equal(deepEqual(1, 2), false)
  assert.equal(deepEqual('a', 'a'), true)
  assert.equal(deepEqual(1, '1'), false)
  assert.equal(deepEqual(null, null), true)
  assert.equal(deepEqual(null, undefined), false)
  assert.equal(deepEqual(NaN, NaN), true)
  assert.equal(deepEqual(undefined, undefined), true)
})

test('deepEqual: array', () => {
  assert.equal(deepEqual([1, 2, 3], [1, 2, 3]), true)
  assert.equal(deepEqual([1, 2, 3], [1, 3, 2]), false)
  assert.equal(deepEqual([], []), true)
  assert.equal(deepEqual([1], [1, 2]), false)
  assert.equal(deepEqual([[1], [2]], [[1], [2]]), true)
  assert.equal(deepEqual([], {}), false)
})

test('deepEqual: objek, urutan kunci tidak berpengaruh', () => {
  assert.equal(deepEqual({ a: 1, b: [2] }, { b: [2], a: 1 }), true)
  assert.equal(deepEqual({ a: 1 }, { a: 1, b: 2 }), false)
  assert.equal(deepEqual({ a: undefined }, { b: undefined }), false)
})

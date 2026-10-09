import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formatCall, formatValue } from './formatValue.js'
import { findSyntaxLine } from './findSyntaxLine.js'

test('formatValue: nilai umum dan nilai khusus', () => {
  assert.equal(formatValue([1, 2, [3]]), '[1,2,[3]]')
  assert.equal(formatValue('a'), '"a"')
  assert.equal(formatValue(undefined), 'undefined')
  assert.equal(formatValue(NaN), 'NaN')
  assert.equal(formatValue(-Infinity), '-Infinity')
  assert.equal(formatValue(null), 'null')
  assert.equal(formatValue({ a: 1 }), '{"a":1}')
  assert.equal(formatValue(() => 1), '() => 1')
})

test('formatValue: nilai panjang dipotong dan melingkar tidak membuat error', () => {
  const long = formatValue(Array.from({ length: 500 }, (_, i) => i))
  assert.ok(long.endsWith('(dipotong)'))
  const loop = {}
  loop.self = loop
  assert.equal(typeof formatValue(loop), 'string')
})

test('formatCall: beberapa argumen', () => {
  assert.equal(formatCall([[3, 1, 2]]), 'solve([3,1,2])')
  assert.equal(formatCall([[1, 2], 5]), 'solve([1,2], 5)')
  assert.equal(formatCall([]), 'solve()')
})

test('findSyntaxLine: baris kesalahan, kurung kurang, dan kode benar', () => {
  assert.equal(findSyntaxLine('function solve(arr) {\n  return [\n}\n'), 3)
  assert.equal(findSyntaxLine('function solve(arr) {\n  return arr\n'), 2)
  assert.equal(findSyntaxLine('function solve(arr) {\n  return arr\n}\n'), null)
  assert.equal(findSyntaxLine('function solve(arr) { return arr + }'), 1)
})

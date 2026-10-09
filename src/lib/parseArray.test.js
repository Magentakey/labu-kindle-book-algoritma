import test from 'node:test'
import assert from 'node:assert/strict'
import { parseArrayInput, randomArray, MAX_LENGTH } from './parseArray.js'

test('format yang valid', () => {
  assert.deepEqual(parseArrayInput('5, 2, 4'), { ok: true, values: [5, 2, 4] })
  assert.deepEqual(parseArrayInput('5 2 4'), { ok: true, values: [5, 2, 4] })
  assert.deepEqual(parseArrayInput(' 5,2 ;4 '), { ok: true, values: [5, 2, 4] })
  assert.deepEqual(parseArrayInput('-3, 0, 99, -99'), { ok: true, values: [-3, 0, 99, -99] })
  assert.deepEqual(parseArrayInput('007'), { ok: true, values: [7] })
  assert.deepEqual(parseArrayInput('1,,2'), { ok: true, values: [1, 2] })
})

test('input kosong ditolak', () => {
  for (const t of ['', '   ', ',', ' , ; ']) {
    const r = parseArrayInput(t)
    assert.equal(r.ok, false, JSON.stringify(t))
  }
})

test('bukan bilangan bulat ditolak', () => {
  for (const t of ['a', '1, b', '1.5', '1e3', '+5', '-', '1-2', '0x10', '٣']) {
    const r = parseArrayInput(t)
    assert.equal(r.ok, false, JSON.stringify(t))
    assert.match(r.error, /bukan bilangan bulat/)
  }
})

test('di luar rentang ditolak', () => {
  for (const t of ['100', '-100', '5, 1000', '99999999999999999999']) {
    const r = parseArrayInput(t)
    assert.equal(r.ok, false, t)
    assert.match(r.error, /di luar rentang/)
  }
})

test('terlalu banyak angka ditolak, batas tepat diterima', () => {
  const ok = Array.from({ length: MAX_LENGTH }, (_, i) => i).join(',')
  const bad = Array.from({ length: MAX_LENGTH + 1 }, (_, i) => i).join(',')
  assert.equal(parseArrayInput(ok).ok, true)
  assert.equal(parseArrayInput(bad).ok, false)
})

test('array acak: panjang dan rentang sesuai', () => {
  for (let t = 0; t < 100; t++) {
    const a = randomArray(6)
    assert.equal(a.length, 6)
    assert.ok(a.every((v) => Number.isInteger(v) && v >= 1 && v <= 20))
  }
  assert.deepEqual(randomArray(3, () => 0), [1, 1, 1])
  assert.deepEqual(randomArray(3, () => 0.999999), [20, 20, 20])
})

test('hasil acak selalu lolos validasi input', () => {
  for (let t = 0; t < 100; t++) {
    assert.equal(parseArrayInput(randomArray(MAX_LENGTH).join(', ')).ok, true)
  }
})
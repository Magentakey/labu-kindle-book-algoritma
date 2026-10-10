import { test, mock } from 'node:test'
import assert from 'node:assert/strict'
import { createStore, createProgress, MAX_CODE_CHARS } from './storage.js'
import { createDebouncedSaver } from './debouncedSaver.js'

// localStorage tiruan
function fakeStorage(overrides = {}) {
  const data = new Map()
  return {
    data,
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => void data.set(k, String(v)),
    removeItem: (k) => void data.delete(k),
    ...overrides,
  }
}

test('simpan dan baca kode per soal, dengan awalan kunci', () => {
  const ls = fakeStorage()
  const p = createProgress(createStore(() => ls))
  assert.equal(p.loadCode('a'), null)
  assert.equal(p.saveCode('a', 'function solve() {}'), true)
  assert.equal(p.loadCode('a'), 'function solve() {}')
  assert.equal(p.loadCode('b'), null, 'soal lain tidak terpengaruh')
  assert.ok([...ls.data.keys()].every((k) => k.startsWith('labu:v1:')), 'semua kunci berawalan labu:v1:')
  p.clearCode('a')
  assert.equal(p.loadCode('a'), null)
})

test('data bertahan di instans baru (seperti membuka halaman lagi)', () => {
  const ls = fakeStorage()
  const a = createProgress(createStore(() => ls))
  a.saveCode('x', 'kode')
  a.markSolved('x')
  const b = createProgress(createStore(() => ls))
  assert.equal(b.loadCode('x'), 'kode')
  assert.deepEqual(b.solvedIds(), ['x'])
})

test('markSolved: true hanya pertama kali, tanpa duplikat', () => {
  const p = createProgress(createStore(() => fakeStorage()))
  assert.equal(p.markSolved('a'), true)
  assert.equal(p.markSolved('a'), false)
  assert.equal(p.markSolved('b'), true)
  assert.deepEqual(p.solvedIds(), ['a', 'b'])
  assert.equal(p.isSolved('a'), true)
  assert.equal(p.isSolved('z'), false)
})

test('kode yang terlalu panjang tidak disimpan', () => {
  const p = createProgress(createStore(() => fakeStorage()))
  assert.equal(p.saveCode('a', 'x'.repeat(MAX_CODE_CHARS + 1)), false)
  assert.equal(p.loadCode('a'), null)
})

test('data solved yang rusak atau salah bentuk dianggap kosong, tidak error', () => {
  const ls = fakeStorage()
  const p = createProgress(createStore(() => ls))
  ls.data.set('labu:v1:solved', '{rusak')
  assert.deepEqual(p.solvedIds(), [])
  ls.data.set('labu:v1:solved', '{"a":1}')
  assert.deepEqual(p.solvedIds(), [])
  ls.data.set('labu:v1:solved', '["a", 5, null, "a", "b"]')
  assert.deepEqual(p.solvedIds(), ['a', 'b'])
  assert.equal(p.markSolved('c'), true, 'masih bisa menulis setelah data rusak')
})

test('tanpa localStorage: tetap berfungsi di memori dan melapor tidak persisten', () => {
  const p = createProgress(createStore(() => undefined))
  assert.equal(p.persistent(), false)
  p.saveCode('a', 'kode')
  p.markSolved('a')
  assert.equal(p.loadCode('a'), 'kode')
  assert.deepEqual(p.solvedIds(), ['a'])
})

test('localStorage melempar saat diakses (diblokir): tidak error', () => {
  const store = createStore(() => {
    throw new Error('SecurityError')
  })
  const p = createProgress(store)
  assert.equal(p.persistent(), false)
  p.saveCode('a', 'k')
  assert.equal(p.loadCode('a'), 'k')
})

test('penyimpanan penuh (setItem melempar): data sesi tetap ada, persistent jadi false', () => {
  let full = false
  const ls = fakeStorage({
    setItem(k, v) {
      if (full) throw new DOMException('QuotaExceededError')
      this.data.set(k, String(v))
    },
  })
  const p = createProgress(createStore(() => ls))
  assert.equal(p.persistent(), true)
  p.saveCode('a', 'lama')
  full = true
  p.saveCode('a', 'baru')
  assert.equal(p.persistent(), false)
  assert.equal(p.loadCode('a'), 'baru', 'sesi ini tetap membaca nilai terbaru')
})

test('probe menolak menulis (mode privat lama): jatuh ke memori', () => {
  const ls = fakeStorage({
    setItem() {
      throw new Error('QuotaExceededError')
    },
  })
  const p = createProgress(createStore(() => ls))
  assert.equal(p.persistent(), false)
  p.saveCode('a', 'k')
  assert.equal(p.loadCode('a'), 'k')
})

test('getItem yang melempar dianggap tidak ada data', () => {
  const ls = fakeStorage({
    getItem() {
      throw new Error('boom')
    },
  })
  const p = createProgress(createStore(() => ls))
  assert.equal(p.loadCode('a'), null)
  assert.deepEqual(p.solvedIds(), [])
})

test('debouncedSaver: hanya menyimpan nilai terakhir setelah jeda', () => {
  mock.timers.enable({ apis: ['setTimeout'] })
  const saved = []
  const s = createDebouncedSaver((v) => saved.push(v), 400)
  s.schedule('a')
  mock.timers.tick(200)
  s.schedule('ab')
  mock.timers.tick(399)
  assert.deepEqual(saved, [])
  mock.timers.tick(1)
  assert.deepEqual(saved, ['ab'])
  mock.timers.reset()
})

test('debouncedSaver: flush menyimpan segera dan tidak menyimpan dua kali', () => {
  mock.timers.enable({ apis: ['setTimeout'] })
  const saved = []
  const s = createDebouncedSaver((v) => saved.push(v), 400)
  s.schedule('x')
  s.flush()
  assert.deepEqual(saved, ['x'])
  mock.timers.tick(1000)
  assert.deepEqual(saved, ['x'], 'timer lama dibatalkan')
  s.flush()
  assert.deepEqual(saved, ['x'], 'flush tanpa perubahan tidak menyimpan lagi')
  mock.timers.reset()
})

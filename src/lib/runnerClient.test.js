import { test } from 'node:test'
import assert from 'node:assert/strict'
import { runInWorker } from './runnerClient.js'
import { runTests } from './runTests.js'

// Worker tiruan. `behave` menentukan perilakunya saat menerima pesan.
function fakeWorker(behave) {
  const w = {
    terminated: 0,
    onmessage: null,
    onerror: null,
    postMessage(data) {
      behave(w, data)
    },
    terminate() {
      w.terminated++
    },
  }
  return w
}

test('hasil worker diteruskan, lalu worker dihentikan', async () => {
  const w = fakeWorker((self, { code, testCases }) => queueMicrotask(() => self.onmessage({ data: runTests(code, testCases) })))
  const out = await runInWorker('function solve(a) { return a }', [{ input: [1], expected: 1 }], { createWorker: () => w })
  assert.equal(out.status, 'done')
  assert.equal(out.results[0].pass, true)
  assert.equal(w.terminated, 1)
})

test('worker yang tidak menjawab dihentikan setelah batas waktu', async () => {
  const w = fakeWorker(() => {}) // seperti perulangan tanpa akhir
  const t0 = Date.now()
  const out = await runInWorker('while(true){}', [], { timeoutMs: 30, createWorker: () => w })
  assert.equal(out.status, 'timeout')
  assert.equal(out.timeoutMs, 30)
  assert.equal(w.terminated, 1)
  assert.ok(Date.now() - t0 < 1000)
})

test('error pada worker menjadi hasil error, bukan exception', async () => {
  const w = fakeWorker((self) => queueMicrotask(() => self.onerror({ message: 'gagal muat', preventDefault() {} })))
  const out = await runInWorker('x', [], { createWorker: () => w })
  assert.deepEqual(out, { status: 'error', kind: 'worker', message: 'gagal muat' })
  assert.equal(w.terminated, 1)
})

test('worker tidak bisa dibuat menjadi hasil error', async () => {
  const out = await runInWorker('x', [], {
    createWorker: () => {
      throw new Error('tidak didukung')
    },
  })
  assert.equal(out.status, 'error')
  assert.match(out.message, /tidak didukung/)
})

test('jawaban kedua setelah selesai diabaikan (tidak ada resolve ganda)', async () => {
  const w = fakeWorker((self) =>
    queueMicrotask(() => {
      self.onmessage({ data: { status: 'done', results: [] } })
      self.onmessage({ data: { status: 'error', kind: 'syntax', message: 'telat' } })
    }),
  )
  const out = await runInWorker('x', [], { createWorker: () => w })
  assert.equal(out.status, 'done')
  assert.equal(w.terminated, 1)
})

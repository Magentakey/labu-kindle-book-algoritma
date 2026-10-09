/** Batas waktu satu kali Jalankan, termasuk memulai worker (milidetik). */
export const TIME_LIMIT_MS = 2000

function defaultCreateWorker() {
  return new Worker(new URL('../workers/runner.worker.js', import.meta.url), { type: 'module' })
}

/**
 * Menjalankan kode pengguna di Web Worker baru, lalu menghentikannya.
 * Worker yang tidak menjawab dalam batas waktu (misalnya perulangan tanpa akhir) di-terminate,
 * sehingga halaman tidak ikut membeku.
 *
 * @param {string} code
 * @param {Array<{ input: unknown[], expected: unknown }>} testCases
 * @param {{ timeoutMs?: number, createWorker?: () => Worker }} [options]  (createWorker untuk tes)
 * @returns {Promise<ReturnType<import('./runTests.js').runTests> | { status: 'timeout', timeoutMs: number } | { status: 'error', kind: 'worker', message: string }>}
 */
export function runInWorker(code, testCases, { timeoutMs = TIME_LIMIT_MS, createWorker = defaultCreateWorker } = {}) {
  return new Promise((resolve) => {
    let worker
    try {
      worker = createWorker()
    } catch (e) {
      resolve({ status: 'error', kind: 'worker', message: `Worker tidak bisa dimulai: ${e?.message ?? e}` })
      return
    }

    let settled = false
    let timer = null
    const finish = (result) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      worker.terminate()
      resolve(result)
    }

    timer = setTimeout(() => finish({ status: 'timeout', timeoutMs }), timeoutMs)
    worker.onmessage = (event) => finish(event.data)
    worker.onerror = (event) => {
      event.preventDefault?.()
      finish({ status: 'error', kind: 'worker', message: event.message || 'Worker gagal dijalankan.' })
    }
    worker.postMessage({ code, testCases })
  })
}

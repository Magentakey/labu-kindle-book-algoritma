import test from 'node:test'
import assert from 'node:assert/strict'
import { PROGRESS_KEY, READ_SECTIONS, entryOf, lastOpened, markRead, percent, readAll, recordKuis, status, timeAgo, writeAll } from './progress.js'

const memory = (init = {}) => {
  const m = { ...init }
  return { getItem: (k) => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v) }, removeItem: (k) => { delete m[k] }, dump: () => m }
}
const T = Date.UTC(2026, 9, 24, 8, 0, 0)

test('bagian yang dihitung dibaca: 7 bagian (tanpa Kuis), dan kuis lulus menambah satu', () => {
  assert.deepEqual(READ_SECTIONS, ['pendahuluan', 'algoritma', 'penelusuran', 'analisis', 'makna', 'kesimpulan', 'referensi'])
  let all = {}
  assert.equal(percent(entryOf(all, '04')), 0)
  assert.equal(status(entryOf(all, '04')), 'belum')
  for (const s of ['pendahuluan', 'algoritma', 'penelusuran']) all = markRead(all, '04', s, T)
  assert.equal(percent(entryOf(all, '04')), 38) // 3 dari 8 bagian
  assert.equal(status(entryOf(all, '04')), 'sedang')
  for (const s of ['analisis', 'makna', 'kesimpulan', 'referensi']) all = markRead(all, '04', s, T)
  assert.equal(percent(entryOf(all, '04')), 88)
  assert.equal(status(entryOf(all, '04')), 'sedang', 'semua dibaca tetapi kuis belum lulus')
  all = recordKuis(all, '04', { skor: 6, total: 8, persen: 75, lulus: true, salah: [3, 8] }, T)
  assert.equal(percent(entryOf(all, '04')), 100)
  assert.equal(status(entryOf(all, '04')), 'selesai')
})

test('markRead: bagian ganda tidak dihitung dua kali, "kuis" tidak dihitung dibaca, dan posisi terakhir diperbarui', () => {
  let all = markRead({}, '04', 'algoritma', T)
  all = markRead(all, '04', 'algoritma', T + 5)
  all = markRead(all, '04', 'kuis', T + 9)
  const e = entryOf(all, '04')
  assert.deepEqual(e.visited, ['algoritma'])
  assert.deepEqual(e.last, { section: 'kuis', at: T + 9 })
})

test('recordKuis: percobaan bertambah, skor terbaik tidak turun, lulus tetap lulus, dan hasil terakhir tersimpan', () => {
  let all = recordKuis({}, '04', { skor: 6, total: 8, persen: 75, lulus: true, salah: [3, 8] }, T)
  all = recordKuis(all, '04', { skor: 4, total: 8, persen: 50, lulus: false, salah: [1, 2, 3, 4] }, T + 10)
  const k = entryOf(all, '04').kuis
  assert.equal(k.attempts, 2)
  assert.deepEqual(k.best, { skor: 6, total: 8, persen: 75 })
  assert.equal(k.passed, true)
  assert.deepEqual(k.hasil.salah, [1, 2, 3, 4])
  assert.equal(k.hasil.at, T + 10)
})

test('lastOpened: modul terakhir dibuka yang belum selesai, dan modul selesai diabaikan', () => {
  let all = markRead({}, '04', 'penelusuran', T)
  all = markRead(all, '05', 'algoritma', T + 100)
  assert.equal(lastOpened(all).id, '05')
  for (const s of READ_SECTIONS) all = markRead(all, '05', s, T + 200)
  all = recordKuis(all, '05', { skor: 8, total: 8, persen: 100, lulus: true, salah: [] }, T + 300)
  assert.equal(lastOpened(all).id, '04')
  assert.equal(lastOpened({}), null)
})

test('simpan dan baca ulang; data rusak, bagian tak dikenal, dan penyimpanan yang gagal ditangani', () => {
  const s = memory()
  const all = markRead({}, '04', 'makna', T)
  writeAll(s, all)
  assert.deepEqual(readAll(s), all)
  assert.deepEqual(readAll(memory({ [PROGRESS_KEY]: '{rusak' })), {})
  assert.deepEqual(readAll(memory({ [PROGRESS_KEY]: '[1,2]' })), {})
  assert.deepEqual(readAll(memory({ [PROGRESS_KEY]: '{"04":5}' })), {})
  const odd = readAll(memory({ [PROGRESS_KEY]: JSON.stringify({ 99: { visited: ['hantu', 'makna'], last: { section: 'hantu', at: 'x' }, kuis: { attempts: 2 } } }) }))
  assert.deepEqual(odd['99'].visited, ['makna'])
  assert.equal(odd['99'].last, null)
  assert.equal(odd['99'].kuis.attempts, 2)
  assert.equal(odd['99'].kuis.passed, false)
  assert.deepEqual(readAll(undefined), {})
  assert.doesNotThrow(() => writeAll({ setItem: () => { throw new Error('penuh') } }, all))
})

test('timeAgo', () => {
  assert.equal(timeAgo(T, T + 20_000), 'baru saja')
  assert.equal(timeAgo(T, T + 5 * 60_000), '5 menit lalu')
  assert.equal(timeAgo(T, T + 2 * 3_600_000), '2 jam lalu')
  assert.equal(timeAgo(T, T + 3 * 86_400_000), '3 hari lalu')
  assert.equal(timeAgo(T + 99, T), 'baru saja', 'waktu di masa depan')
})

test('tantangan kode Modul 04: solusi lulus semua test case, kode awal tidak, dan tanpa nilai null', async () => {
  const { readFileSync } = await import('node:fs')
  const ch = JSON.parse(readFileSync(new URL('../content/modul/04.tantangan.json', import.meta.url), 'utf8'))
  const run = (code, input) => new Function(`${code}\nreturn solve`)()(...JSON.parse(JSON.stringify(input)))
  assert.ok(ch.testCases.length >= 4)
  for (const tc of ch.testCases) assert.deepEqual(run(ch.solution, tc.input), tc.expected, JSON.stringify(tc.input))
  assert.doesNotMatch(JSON.stringify(ch.testCases), /null/)
  assert.match(ch.starterCode, /TODO/)
  // Kode awal sengaja tidak dijalankan di sini: badan while kosong berputar tanpa henti (itulah yang harus dilengkapi pembaca).
  assert.match(ch.starterCode, /while \(i >= 0 && A\[i\] > key\) \{\n\s+\/\/ TODO/)
  assert.ok(ch.testCases.some((tc) => JSON.stringify(tc.input) === '[[12,10,15,7]]'))
  assert.ok(ch.testCases.some((tc) => JSON.stringify(tc.input) === '[[]]'))
  assert.ok(ch.testCases.some((tc) => JSON.stringify(tc.input) === '[[5,5,1]]'))
})

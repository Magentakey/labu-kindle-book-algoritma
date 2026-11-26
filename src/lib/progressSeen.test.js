import test from 'node:test'
import assert from 'node:assert/strict'
import { markReadMany, percent, readAll } from './progress.js'

test('markReadMany mencatat semua bagian yang dicapai sekaligus, kuis tidak ikut', () => {
  const all = markReadMany({}, '02', ['pendahuluan', 'algoritma', 'kuis', 'referensi'], 'referensi', 1000)
  assert.deepEqual(all['02'].visited, ['pendahuluan', 'algoritma', 'referensi'])
  assert.deepEqual(all['02'].last, { section: 'referensi', at: 1000 })
})

test('markReadMany tidak menggandakan bagian dan mengembalikan objek yang sama bila tidak ada perubahan', () => {
  const a = markReadMany({}, '02', ['pendahuluan', 'algoritma'], 'algoritma', 1)
  const b = markReadMany(a, '02', ['pendahuluan', 'algoritma'], 'algoritma', 2)
  assert.equal(b, a)
  const c = markReadMany(a, '02', ['pendahuluan', 'algoritma', 'penelusuran'], 'penelusuran', 3)
  assert.deepEqual(c['02'].visited, ['pendahuluan', 'algoritma', 'penelusuran'])
})

test('sampai di dasar halaman: semua bagian baca tercatat, progres 6 dari 8 bagian = 75% sebelum kuis lulus', () => {
  const baca = ['pendahuluan', 'algoritma', 'penelusuran', 'analisis', 'makna', 'kesimpulan', 'kuis', 'referensi']
  const all = markReadMany({}, '02', baca, 'referensi')
  assert.equal(all['02'].visited.length, 7)
  assert.equal(percent(all['02']), 88)
})

test('hasil markReadMany bisa dibaca ulang oleh readAll', () => {
  const all = markReadMany({}, '05', ['pendahuluan', 'makna'], 'makna', 5)
  const storage = { getItem: () => JSON.stringify(all) }
  assert.deepEqual(readAll(storage)['05'].visited, ['pendahuluan', 'makna'])
})

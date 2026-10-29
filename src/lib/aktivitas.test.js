import test from 'node:test'
import assert from 'node:assert/strict'
import { AKTIVITAS_KEY, hariKey, readHari, rekorStreak, streakSekarang, tambahHari, writeHari } from './aktivitas.js'

const memory = (init = {}) => {
  const m = { ...init }
  return { getItem: (k) => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v) }, dump: () => m }
}
// Tengah hari waktu lokal supaya tidak bergeser hari karena zona waktu.
const at = (y, m, d) => new Date(y, m - 1, d, 12, 0, 0).getTime()

test('hariKey memakai tanggal lokal dengan nol di depan', () => {
  assert.equal(hariKey(at(2026, 3, 5)), '2026-03-05')
  assert.equal(hariKey(at(2026, 12, 31)), '2026-12-31')
})

test('tambahHari: urut, tanpa duplikat, dan mengembalikan larik yang sama bila hari sudah ada', () => {
  let h = tambahHari([], at(2026, 10, 29))
  const sama = tambahHari(h, at(2026, 10, 29))
  assert.equal(sama, h)
  h = tambahHari(h, at(2026, 10, 27))
  assert.deepEqual(h, ['2026-10-27', '2026-10-29'])
})

test('streak: berturut-turut sampai hari ini, melewati pergantian bulan dan tahun', () => {
  const h = ['2026-12-30', '2026-12-31', '2027-01-01', '2027-01-02']
  assert.deepEqual(streakSekarang(h, at(2027, 1, 2)), { hari: 4, hariIni: true })
})

test('streak: kemarin masih dihitung (hariIni=false); lebih lama dari itu putus', () => {
  const h = ['2026-10-28', '2026-10-29']
  assert.deepEqual(streakSekarang(h, at(2026, 10, 30)), { hari: 2, hariIni: false })
  assert.deepEqual(streakSekarang(h, at(2026, 10, 31)), { hari: 0, hariIni: false })
  assert.deepEqual(streakSekarang([], at(2026, 10, 30)), { hari: 0, hariIni: false })
})

test('streak: hari yang terlewat memutus rangkaian, dan rekor mengambil rangkaian terpanjang', () => {
  const h = ['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-20', '2026-10-21']
  assert.deepEqual(streakSekarang(h, at(2026, 10, 21)), { hari: 2, hariIni: true })
  assert.equal(rekorStreak(h), 4)
  assert.equal(rekorStreak([]), 0)
})

test('streak: tanggal di masa depan (jam perangkat mundur) tidak menghasilkan streak', () => {
  assert.deepEqual(streakSekarang(['2026-11-05'], at(2026, 10, 30)), { hari: 0, hariIni: false })
})

test('readHari/writeHari: data rusak atau berbentuk lain diabaikan, nilai tidak sah dibuang', () => {
  assert.deepEqual(readHari(memory({ [AKTIVITAS_KEY]: '{bukan json' })), [])
  assert.deepEqual(readHari(memory({ [AKTIVITAS_KEY]: '{"a":1}' })), [])
  assert.deepEqual(readHari(memory({ [AKTIVITAS_KEY]: JSON.stringify(['2026-10-02', 'x', 5, '2026-10-01', '2026-10-02']) })), ['2026-10-01', '2026-10-02'])
  const s = memory()
  writeHari(s, ['2026-10-01'])
  assert.deepEqual(readHari(s), ['2026-10-01'])
  assert.deepEqual(readHari(undefined), [])
})

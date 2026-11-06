import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { penjelajahIds } from '../viz/penjelajahIds.js'
import { algoritma, algoritmaHref, kategori, membukaHalamanLama } from './algoritma.js'
import { vizIds } from '../viz/vizConfig.js'

const materials = JSON.parse(readFileSync(new URL('../content/materials.json', import.meta.url), 'utf8'))

test('galeri: 20 algoritma di 8 kategori (17 dari desain + Konsep DP untuk Modul 10 + Konsep Greedy untuk Modul 13 + Representasi Graf untuk Modul 16)', () => {
  assert.equal(algoritma.length, 20)
  assert.equal(kategori.length, 8)
  const count = Object.fromEntries(kategori.map((k) => [k.id, algoritma.filter((a) => a.kategori === k.id).length]))
  assert.deepEqual(count, { pencarian: 1, sorting: 2, analisis: 4, dp: 3, greedy: 3, graf: 3, mst: 2, 'shortest-path': 2 })
})

test('galeri: id unik, modul unik dalam 1 sampai 24, naik di dalam tiap kategori, dan semua kolom terisi', () => {
  assert.equal(new Set(algoritma.map((a) => a.id)).size, algoritma.length)
  const moduls = algoritma.map((a) => a.modul)
  assert.equal(new Set(moduls).size, moduls.length)
  assert.ok(moduls.every((m) => Number.isInteger(m) && m >= 1 && m <= 24))
  for (const k of kategori) {
    const m = algoritma.filter((a) => a.kategori === k.id).map((a) => a.modul)
    assert.deepEqual(m, [...m].sort((x, y) => x - y), `urutan modul di ${k.id}`)
  }
  const ids = new Set(kategori.map((k) => k.id))
  for (const a of algoritma) {
    for (const k of ['judul', 'deskripsi', 'kompleksitas', 'paradigma', 'thumb', 'href']) assert.ok(String(a[k]).length > 0, `${a.id}.${k}`)
    assert.ok(ids.has(a.kategori), `${a.id}: kategori`)
    assert.ok(['bars', 'tree', 'graph', 'table', 'growth', 'bound', 'limit', 'levels', 'pumpkin'].includes(a.thumb), `${a.id}: thumb`)
  }
})

test('galeri: kartu tanpa visualizer baru (bila ada) menunjuk ke materi lama yang punya visualizer', () => {
  const byId = Object.fromEntries(materials.map((m) => [m.id, m]))
  for (const a of algoritma.filter((x) => !x.viz)) {
    const m = byId[a.href.replace('/materi/', '')]
    assert.ok(m, `${a.id}: materi ${a.href} tidak ada`)
    assert.ok(m.visualizer, `${a.id}: materi lama tanpa visualizer`)
  }
})

test('galeri: tidak ada lagi kartu yang memakai maskot labu; tiga kartu Analisis punya gambar grafik sendiri', () => {
  assert.deepEqual(algoritma.filter((a) => a.thumb === 'pumpkin').map((a) => a.id), [])
  assert.equal(algoritma.find((a) => a.id === 'little-o-omega').thumb, 'limit')
  assert.equal(algoritma.find((a) => a.id === 'pertumbuhan-fungsi').thumb, 'growth')
  assert.equal(algoritma.find((a) => a.id === 'batas-asimtotik').thumb, 'bound')
})

test('galeri: semua 20 kartu punya visualizer baru (13 pemutar langkah + 7 penjelajah), tidak ada lagi yang membuka materi lama', () => {
  const baru = algoritma.filter((a) => a.viz).map((a) => a.id)
  assert.deepEqual(baru.sort(), [...vizIds, ...penjelajahIds].sort(), 'daftar viz di data = konfigurasi visualizer + penjelajah')
  assert.equal(baru.length, 20)
  assert.ok(penjelajahIds.every((id) => !vizIds.includes(id)), 'satu id tidak dilayani dua mekanisme')
  assert.deepEqual(algoritma.filter((a) => !a.viz), [])
  for (const a of algoritma) assert.equal(algoritmaHref(a), a.viz ? `/algoritma/${a.id}` : a.href)
  assert.equal(algoritmaHref(algoritma.find((a) => a.id === 'dijkstra')), '/algoritma/dijkstra')
  assert.equal(algoritmaHref(algoritma.find((a) => a.id === 'insertion-sort')), '/algoritma/insertion-sort')
  assert.equal(algoritmaHref(algoritma.find((a) => a.id === 'pertumbuhan-fungsi')), '/algoritma/pertumbuhan-fungsi', 'Pertumbuhan Fungsi sudah punya penjelajah')
  assert.equal(algoritmaHref(algoritma.find((a) => a.id === 'batas-asimtotik')), '/algoritma/batas-asimtotik', 'Batas Θ / O / Ω sudah punya penjelajah')
  assert.equal(algoritmaHref(algoritma.find((a) => a.id === 'little-o-omega')), '/algoritma/little-o-omega', 'Little-o / ω sudah punya penjelajah')
  assert.equal(algoritmaHref(algoritma.find((a) => a.id === 'pohon-recurrence')), '/algoritma/pohon-recurrence', 'Pohon Recurrence sudah punya penjelajah')
})

test('membukaHalamanLama: tidak ada kartu yang membuka halaman lama; kartu tanpa visualizer (bila ada nanti) memang membukanya', () => {
  assert.deepEqual(algoritma.filter(membukaHalamanLama), [])
  assert.ok(algoritma.filter((a) => a.viz).every((a) => !membukaHalamanLama(a)))
  assert.equal(membukaHalamanLama({ viz: false }), true)
  assert.equal(membukaHalamanLama({ viz: true }), false)
})

import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { algoritma, algoritmaHref, kategori } from './algoritma.js'
import { vizIds } from '../viz/vizConfig.js'

const materials = JSON.parse(readFileSync(new URL('../content/materials.json', import.meta.url), 'utf8'))

test('galeri: 17 algoritma di 8 kategori, jumlah per kategori sama dengan desain', () => {
  assert.equal(algoritma.length, 17)
  assert.equal(kategori.length, 8)
  const count = Object.fromEntries(kategori.map((k) => [k.id, algoritma.filter((a) => a.kategori === k.id).length]))
  assert.deepEqual(count, { pencarian: 1, sorting: 2, analisis: 4, dp: 2, greedy: 2, graf: 2, mst: 2, 'shortest-path': 2 })
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
    assert.ok(['bars', 'tree', 'graph', 'table', 'pumpkin'].includes(a.thumb), `${a.id}: thumb`)
  }
})

test('galeri: tautan sementara menunjuk ke materi lama yang punya visualizer', () => {
  const byId = Object.fromEntries(materials.map((m) => [m.id, m]))
  for (const a of algoritma) {
    const m = byId[a.href.replace('/materi/', '')]
    assert.ok(m, `${a.id}: materi ${a.href} tidak ada`)
    assert.ok(m.visualizer, `${a.id}: materi lama tanpa visualizer`)
  }
})

test('galeri: tiga kartu tanpa gambar memakai maskot labu (analisis fungsi dan notasi)', () => {
  assert.deepEqual(algoritma.filter((a) => a.thumb === 'pumpkin').map((a) => a.id), ['pertumbuhan-fungsi', 'batas-asimtotik', 'little-o-omega'])
})

test('galeri: 13 kartu punya visualizer baru (/algoritma/:id), 4 kartu Analisis masih ke materi lama', () => {
  const baru = algoritma.filter((a) => a.viz).map((a) => a.id)
  assert.deepEqual(baru.sort(), [...vizIds].sort(), 'daftar viz di data sama dengan konfigurasi visualizer')
  assert.equal(baru.length, 13)
  assert.deepEqual(algoritma.filter((a) => !a.viz).map((a) => a.kategori), ['analisis', 'analisis', 'analisis', 'analisis'])
  for (const a of algoritma) assert.equal(algoritmaHref(a), a.viz ? `/algoritma/${a.id}` : a.href)
  assert.equal(algoritmaHref(algoritma.find((a) => a.id === 'dijkstra')), '/algoritma/dijkstra')
  assert.equal(algoritmaHref(algoritma.find((a) => a.id === 'insertion-sort')), '/algoritma/insertion-sort')
  assert.equal(algoritmaHref(algoritma.find((a) => a.id === 'pertumbuhan-fungsi')), '/materi/pertumbuhan-fungsi', 'kartu Analisis masih ke materi lama')
})

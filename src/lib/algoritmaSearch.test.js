import test from 'node:test'
import assert from 'node:assert/strict'
import { editDistance, filterAlgoritma, groupByKategori, normalize, suggest } from './algoritmaSearch.js'
import { GRID_COLUMNS, groupClasses } from './galeriClasses.js'
import { algoritma } from '../data/algoritma.js'

const ids = (list) => list.map((a) => a.id)

test('normalize: huruf kecil, tanpa spasi, pangkat dan huruf Yunani disamakan', () => {
  assert.equal(normalize('  O(n²) '), 'o(n2)')
  assert.equal(normalize('Θ(n lg n)'), 'theta(nlgn)')
  assert.equal(normalize('Little-o / ω'), 'little-o/omega')
  assert.equal(normalize('2ⁿ'), '2n')
  assert.equal(normalize('c₁g(n)'), 'c1g(n)')
  assert.equal(normalize('V − 1'), 'v-1')
  assert.equal(normalize(undefined), '')
})

test('filterAlgoritma: contoh pencarian dari desain ("dijk" dan "O(n²)")', () => {
  assert.deepEqual(ids(filterAlgoritma('dijk')), ['dijkstra'])
  assert.deepEqual(ids(filterAlgoritma('O(n²)')), ['insertion-sort'])
  assert.deepEqual(ids(filterAlgoritma('o(n2)')), ['insertion-sort'])
  assert.deepEqual(ids(filterAlgoritma('')), ids(algoritma))
})

test('filterAlgoritma: mencari lewat judul, deskripsi, kompleksitas, paradigma, kategori, dan nomor modul', () => {
  assert.deepEqual(ids(filterAlgoritma('θ(n lg n)')), ['merge-sort'])
  assert.deepEqual(ids(filterAlgoritma('antrean')), ['bfs'])
  assert.deepEqual(ids(filterAlgoritma('relaksasi')), ['bellman-ford'])
  assert.deepEqual(ids(filterAlgoritma('minimum spanning')), ['kruskal', 'prim'])
  assert.deepEqual(ids(filterAlgoritma('modul 24')), ['dijkstra'])
  assert.deepEqual(ids(filterAlgoritma('MODUL04')), ['insertion-sort'])
  assert.deepEqual(filterAlgoritma('tidak-ada-yang-cocok'), [])
})

test('filterAlgoritma: filter kategori digabung dengan pencarian', () => {
  assert.deepEqual(ids(filterAlgoritma('', 'sorting')), ['insertion-sort', 'merge-sort'])
  assert.deepEqual(ids(filterAlgoritma('', 'shortest-path')), ['bellman-ford', 'dijkstra'])
  assert.deepEqual(ids(filterAlgoritma('sort', 'pencarian')), [])
  assert.deepEqual(ids(filterAlgoritma('merge', 'sorting')), ['merge-sort'])
  assert.equal(filterAlgoritma('', 'semua').length, 17)
})

test('groupByKategori: urutan kategori tetap dan kategori kosong dilewati', () => {
  const g = groupByKategori(algoritma)
  assert.deepEqual(g.map((x) => [x.id, x.items.length]), [['pencarian', 1], ['sorting', 2], ['analisis', 4], ['dp', 2], ['greedy', 2], ['graf', 2], ['mst', 2], ['shortest-path', 2]])
  assert.equal(g[3].title, 'Dynamic Programming')
  assert.deepEqual(groupByKategori(filterAlgoritma('dijk')).map((x) => x.id), ['shortest-path'])
  assert.deepEqual(groupByKategori([]), [])
})

test('editDistance', () => {
  assert.equal(editDistance('prim', 'prims'), 1)
  assert.equal(editDistance('', 'abc'), 3)
  assert.equal(editDistance('kitten', 'sitting'), 3)
  assert.equal(editDistance('sama', 'sama'), 0)
})

test('suggest: contoh dari desain ("prims" → Prim dan Kruskal), dan tidak menyarankan hal yang tidak mirip', () => {
  assert.deepEqual(ids(suggest('prims')), ['prim', 'kruskal'])
  assert.deepEqual(ids(suggest('djikstra')), ['dijkstra', 'bellman-ford'])
  assert.deepEqual(ids(suggest('bfss', 1)), ['bfs'])
  assert.deepEqual(suggest('zzzzzz'), [])
  assert.deepEqual(suggest('a'), [])
  assert.deepEqual(suggest(''), [])
})

test('groupClasses: grup memakai min(jumlah kartu, kolom) di tiap lebar layar', () => {
  assert.deepEqual(GRID_COLUMNS, { md: 2, lg: 3, xl: 4 })
  assert.equal(groupClasses(1).span, 'md:col-span-1 lg:col-span-1 xl:col-span-1')
  assert.equal(groupClasses(2).span, 'md:col-span-2 lg:col-span-2 xl:col-span-2')
  assert.equal(groupClasses(4).span, 'md:col-span-2 lg:col-span-3 xl:col-span-4')
  assert.equal(groupClasses(4).inner, 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4')
  assert.equal(groupClasses(9).span, 'md:col-span-2 lg:col-span-3 xl:col-span-4')
  assert.equal(groupClasses(0).span, groupClasses(1).span)
})

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { buildToc, headingIds, markdownHeadings, plainHeadingText, slugify } from './tableOfContents.js'
import { splitContent } from './splitContent.js'

const both = { hasVisualizer: true, hasChallenge: true }
const texts = (items) => items.map((i) => i.text)

test('slugify mempertahankan huruf Yunani dan membuang tanda baca', () => {
  assert.equal(slugify('A. Pendahuluan'), 'a-pendahuluan')
  assert.equal(slugify('Notasi Θ, O, Ω'), 'notasi-θ-o-ω')
  assert.equal(slugify('???'), 'bagian')
})

test('headingIds: judul kembar mendapat nomor, awalan membedakan potongan', () => {
  assert.deepEqual(headingIds(['Contoh', 'Contoh', 'Lain'], 'b0'), ['b0-contoh', 'b0-contoh-2', 'b0-lain'])
  assert.deepEqual(headingIds(['Contoh'], 'b2'), ['b2-contoh'])
})

test('plainHeadingText membuang sintaks Markdown sebaris', () => {
  assert.equal(plainHeadingText('Pakai `for` dan **tebal**'), 'Pakai for dan tebal')
  assert.equal(plainHeadingText('Lihat [Wikipedia](https://x.id)'), 'Lihat Wikipedia')
  assert.equal(plainHeadingText('Judul ##'), 'Judul')
  assert.equal(plainHeadingText('Peraga: Penelusuran MERGE_SORT'), 'Peraga: Penelusuran MERGE_SORT', 'garis bawah di tengah kata dipertahankan')
  assert.equal(plainHeadingText('Fungsi _miring_ dan MERGE_SORT_2'), 'Fungsi miring dan MERGE_SORT_2')
})

test('markdownHeadings: hanya tingkat 1-3, tidak membaca isi blok kode', () => {
  const md = ['# Satu', '## Dua', '### Tiga', '#### Empat', '```text', '## di dalam kode', '```', '## Lagi'].join('\n')
  assert.deepEqual(markdownHeadings(md), [
    { level: 2, text: 'Satu' },
    { level: 2, text: 'Dua' },
    { level: 3, text: 'Tiga' },
    { level: 2, text: 'Lagi' },
  ])
})

test('buildToc: urutan mengikuti halaman, dengan Visualisasi dan Soal Challenge', () => {
  const segs = splitContent('## A\nisi\n### A1\nisi\n::visualizer\n## B\nisi\n::challenge\n', both)
  const toc = buildToc(segs)
  assert.deepEqual(texts(toc), ['A', 'A1', 'Visualisasi', 'B', 'Soal Challenge'])
  assert.deepEqual(
    toc.map((i) => i.level),
    [2, 3, 2, 2, 2],
  )
  assert.equal(toc.find((i) => i.kind === 'visualizer').id, 'sec-visual')
  assert.equal(toc.find((i) => i.kind === 'challenge').id, 'sec-soal')
})

test('buildToc: materi tanpa visualizer atau challenge tidak memuatnya', () => {
  const toc = buildToc(splitContent('## A\nisi', { hasVisualizer: false, hasChallenge: false }))
  assert.deepEqual(texts(toc), ['A'])
})

test('buildToc: banyak visualizer berjudul menjadi anak Visualisasi', () => {
  const toc = buildToc(splitContent('## A\nisi', both), {
    visualizers: [
      { id: 'mergeSort', title: 'Merge Sort' },
      { id: 'mergeSortTree', title: 'Pohon rekursi' },
    ],
  })
  assert.deepEqual(texts(toc), ['A', 'Visualisasi', 'Merge Sort', 'Pohon rekursi', 'Soal Challenge'])
  assert.equal(toc[2].id, 'vis-mergeSort')
})

test('buildToc: id semua unik, juga saat judul sama muncul di dua potongan', () => {
  const segs = splitContent('## Contoh\na\n::visualizer\n## Contoh\nb\n::challenge\n', both)
  const ids = buildToc(segs).map((i) => i.id)
  assert.equal(new Set(ids).size, ids.length)
})

test('buildToc: judul di dalam blok (tabs, quiz, dll.) tidak ikut', () => {
  const md = '## A\nisi\n:::tabs T\n::tab Satu\n## Di dalam tab\n:::\n'
  assert.deepEqual(texts(buildToc(splitContent(md, { hasVisualizer: false, hasChallenge: false }))), ['A'])
})

test('materi 1 asli: daftar isinya A sampai F lalu Soal Challenge', () => {
  const md = readFileSync(new URL('../content/materials/algoritma-pemrograman.md', import.meta.url), 'utf8')
  const toc = buildToc(splitContent(md, both))
  const level2 = toc.filter((i) => i.level === 2).map((i) => i.text)
  assert.equal(level2[0], 'A. Pendahuluan')
  assert.equal(level2.at(-1), 'Soal Challenge')
  assert.ok(level2.includes('Visualisasi'))
  assert.ok(texts(toc).includes('Karakteristik Algoritma'))
  assert.equal(new Set(toc.map((i) => i.id)).size, toc.length)
})

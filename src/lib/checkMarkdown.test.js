import { test } from 'node:test'
import assert from 'node:assert/strict'
import { checkMarkdown } from './checkMarkdown.js'

const rules = (md, severity) =>
  checkMarkdown(md).filter((i) => !severity || i.severity === severity).map((i) => i.rule)

test('teks bersih tidak menghasilkan temuan', () => {
  const md = [
    '## Pengertian', 'Paragraf biasa dengan `kode` dan [Wikipedia](https://id.wikipedia.org).', '',
    '### Contoh', '', '| Kasus | Waktu |', '| --- | --- |', '| Terbaik | Θ(n) |', '',
    '```javascript', 'let a = 1', '```', '', '![Diagram alur insertion sort](x.png)',
  ].join('\n')
  assert.deepEqual(checkMarkdown(md), [])
})

test('"#" tunggal ditolak karena h1 sudah dipakai halaman', () => {
  assert.deepEqual(rules('# Judul'), ['heading-h1'])
})

test('tagar tanpa spasi bukan judul', () => {
  assert.deepEqual(rules('#tagar biasa'), [])
})

test('judul pertama tidak boleh melompat ke ###', () => {
  assert.deepEqual(rules('### Terlalu dalam'), ['heading-skip'])
})

test('lompatan tingkat judul di tengah dokumen ditandai, naik kembali boleh', () => {
  assert.deepEqual(rules('## A\n#### B\n## C\n### D'), ['heading-skip'])
  assert.deepEqual(rules('## A\n### B\n#### C\n## D'), [])
})

test('judul kosong ditandai', () => {
  assert.deepEqual(rules('##'), ['heading-empty'])
})

test('judul gaya Setext ditandai', () => {
  assert.deepEqual(rules('Judul\n====='), ['heading-setext'])
  assert.deepEqual(rules('Judul\n-----'), ['heading-setext'])
  assert.deepEqual(rules('Paragraf\n\n---\n\nLagi'), []) // garis pemisah biasa
})

test('blok kode: nama bahasa', () => {
  assert.deepEqual(rules('```\nx\n```', 'warning'), ['code-lang'])
  assert.deepEqual(rules('```cobol\nx\n```', 'warning'), ['code-lang-unsupported'])
  assert.deepEqual(rules('```java\nx\n```'), []) // punya alias
  assert.deepEqual(rules('```text\nx\n```'), [])
})

test('isi blok kode tidak diperiksa', () => {
  const md = '```javascript\n# bukan judul\n<div>\n![](x)\n::oops\n```'
  assert.deepEqual(rules(md), [])
})

test('blok kode tidak ditutup', () => {
  assert.deepEqual(rules('```js\nlet a = 1'), ['code-unclosed'])
})

test('tag HTML ditolak, tetapi di dalam `kode` dan autolink aman', () => {
  assert.deepEqual(rules('<div>x</div>'), ['raw-html'])
  assert.deepEqual(rules('Tulis `<div>` di sini dan <https://contoh.id>'), [])
  assert.deepEqual(rules('a < b dan c > d'), [])
})

test('gambar harus punya teks alternatif', () => {
  assert.deepEqual(rules('![](a.png)'), ['image-alt'])
  assert.deepEqual(rules('![   ](a.png)'), ['image-alt'])
  assert.deepEqual(rules('![Grafik](a.png)'), [])
})

test('tautan: kosong = error, samar = warning', () => {
  assert.deepEqual(rules('[](https://a.id)'), ['link-empty'])
  assert.deepEqual(rules('[klik di sini](https://a.id)'), ['link-vague'])
  assert.deepEqual(rules('[Dokumentasi MDN](https://a.id)', 'warning'), [])
})

test('judul kolom tabel tidak boleh kosong', () => {
  assert.deepEqual(rules('| A |  |\n| --- | --- |\n| 1 | 2 |'), ['table-header'])
})

test('penanda: dikenal, tidak dikenal, ganda', () => {
  assert.deepEqual(rules('::visualizer\n\n## A'), [])
  assert.deepEqual(rules('::visualiser'), ['marker-unknown'])
  assert.deepEqual(rules('::visualizer\n## A\n::visualizer'), ['marker-duplicate'])
})

test('setelah penanda: teks tanpa judul diperingatkan, judul ### langsung ditolak', () => {
  assert.deepEqual(rules('## A\n::visualizer\nLanjut tanpa judul'), ['heading-after-marker'])
  assert.deepEqual(rules('## A\n::visualizer\n\n## B\nisi'), [])
  assert.deepEqual(rules('## A\n::visualizer\n### B'), ['heading-skip'])
})

test('rumus LaTeX diperingatkan, tanda dolar biasa aman', () => {
  assert.deepEqual(rules('Biaya $5 dan $10'), [])
  assert.deepEqual(rules('$$\\frac{a}{b}$$'), ['latex'])
  assert.deepEqual(rules('Pakai `\\frac` di kode'), [])
})

test('teks tebal satu baris yang berdiri sendiri diperingatkan', () => {
  assert.deepEqual(rules('Paragraf.\n\n**Contoh kasus**\n\nIsi.'), ['bold-as-heading'])
  assert.deepEqual(rules('Ini **penting** sekali.'), [])
})

test('nomor baris pada temuan benar dan berurutan', () => {
  const issues = checkMarkdown('## A\n\n![](x.png)\n\n```\nx\n```')
  assert.deepEqual(issues.map((i) => [i.line, i.rule]), [[3, 'image-alt'], [5, 'code-lang']])
})

test('file CRLF diperiksa sama seperti LF', () => {
  assert.deepEqual(rules('## A\r\n\r\n![](x.png)\r\n'), ['image-alt'])
})

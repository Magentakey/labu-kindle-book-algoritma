import { test } from 'node:test'
import assert from 'node:assert/strict'
import { checkMarkdown } from './checkMarkdown.js'

const rules = (md, severity) => checkMarkdown(md).filter((i) => !severity || i.severity === severity).map((i) => i.rule)
const errors = (md) => rules(md, 'error')

const GOOD = [
  '## Bagian',
  '',
  ':::steps Enam ciri',
  '::slide Satu',
  'isi satu',
  '',
  '::slide Dua',
  'isi dua',
  ':::',
  '',
  ':::tabs Tiga cara',
  '::tab A',
  'a',
  '::tab B',
  '::trace bilangan-max',
  ':::',
  '',
  ':::reveal Lihat jawaban',
  'isi',
  ':::',
  '',
  '::growth 1, n, 2^n',
  '',
  ':::quiz Cek',
  '::question Berapa 1 + 1?',
  '- [ ] 1',
  '- [x] 2',
  '::explain',
  'Karena dua.',
  ':::',
].join('\n')

test('materi dengan semua jenis blok yang benar tidak punya error maupun saran', () => {
  assert.deepEqual(checkMarkdown(GOOD), [])
})

test('blok tidak ditutup', () => {
  assert.ok(errors(':::steps S\n::slide A\nx\n::slide B\ny').includes('block-unclosed'))
})

test('penutup ::: tanpa blok', () => {
  assert.ok(errors('teks\n\n:::\n').includes('block-stray-close'))
})

test('blok tidak dikenal dan penanda tidak dikenal', () => {
  assert.ok(errors(':::foo Judul\nx\n:::').includes('block-unknown'))
  assert.ok(errors('::foo').includes('marker-unknown'))
  assert.ok(errors('::Besar').includes('marker-unknown'))
})

test('blok bersarang dilarang', () => {
  assert.ok(errors(':::tabs T\n::tab A\n:::reveal X\nisi\n:::\n::tab B\nb\n:::').includes('block-nested'))
})

test('steps dan tabs butuh minimal 2 item; quiz minimal 1 pertanyaan', () => {
  assert.ok(errors(':::steps S\n::slide A\nx\n:::').includes('block-few-items'))
  assert.ok(errors(':::tabs T\n::tab A\nx\n:::').includes('block-few-items'))
  assert.ok(errors(':::quiz Q\nteks\n:::').includes('block-few-items'))
})

test('item di luar blok atau di blok yang salah', () => {
  assert.ok(errors('::slide A').includes('item-outside'))
  assert.ok(errors(':::tabs T\n::slide A\n::tab B\n:::').includes('item-outside'))
  assert.ok(errors('::explain\nx').includes('item-outside'))
  assert.ok(errors(':::quiz Q\n::explain\nx\n:::').includes('item-outside'), '::explain sebelum pertanyaan')
})

test('judul item dan judul reveal wajib; judul steps/tabs/quiz berupa saran', () => {
  assert.ok(errors(':::steps S\n::slide\nx\n::slide B\ny\n:::').includes('item-title'))
  assert.ok(errors(':::reveal\nisi\n:::').includes('block-title'))
  assert.deepEqual(rules(':::steps\n::slide A\nx\n::slide B\ny\n:::', 'warning'), ['block-title'])
})

test('visualizer dan challenge tidak boleh di dalam blok', () => {
  assert.ok(errors(':::reveal R\n::visualizer\n:::').includes('marker-in-block'))
  assert.ok(errors('::visualizer cepat').includes('marker-unknown'))
})

test('trace: id kosong atau tidak dikenal; growth: kelas tidak dikenal', () => {
  assert.ok(errors('::trace').includes('trace-id'))
  assert.ok(errors('::trace tidak-ada').includes('trace-unknown'))
  assert.ok(errors('::trace bilangan-max').length === 0)
  assert.ok(errors('::growth 1, n^9').includes('growth-unknown'))
  assert.ok(errors('::growth').length === 0)
})

test('kuis: tanpa jawaban benar, lebih dari satu jawaban benar, kurang dari 2 opsi, tanpa teks', () => {
  const quiz = (body) => `:::quiz Q\n::question Apa?\n${body}\n:::`
  assert.ok(errors(quiz('- [ ] a\n- [ ] b')).includes('quiz-question'))
  assert.ok(errors(quiz('- [x] a\n- [x] b')).includes('quiz-question'))
  assert.ok(errors(quiz('- [x] a')).includes('quiz-question'))
  assert.ok(errors(':::quiz Q\n::question\n- [x] a\n- [ ] b\n:::').includes('item-title'))
  assert.deepEqual(errors(quiz('- [x] a\n- [ ] b')), [])
})

test('kuis: setiap pertanyaan diperiksa sendiri', () => {
  const md = ':::quiz Q\n::question Satu?\n- [x] a\n- [ ] b\n::question Dua?\n- [ ] a\n- [ ] b\n:::'
  const issues = checkMarkdown(md).filter((i) => i.rule === 'quiz-question')
  assert.equal(issues.length, 1)
  assert.equal(issues[0].line, 5, 'menunjuk baris ::question yang bermasalah')
})

test('opsi di dalam penjelasan tidak dihitung sebagai opsi', () => {
  const md = ':::quiz Q\n::question Apa?\n- [ ] a\n- [x] b\n::explain\n- [x] ini bukan opsi\n:::'
  assert.deepEqual(errors(md), [])
})

test('teks sebelum item pertama diberi saran; judul di dalam blok diberi saran', () => {
  assert.ok(rules(':::tabs T\nteks nyasar\n::tab A\nx\n::tab B\ny\n:::', 'warning').includes('block-intro-ignored'))
  assert.ok(rules(':::reveal R\n## Judul\nisi\n:::', 'warning').includes('heading-in-block'))
})

test('aturan lain tetap berlaku di dalam blok (gambar tanpa alt, HTML)', () => {
  assert.ok(errors(':::reveal R\n![](/x.png)\n:::').includes('image-alt'))
  assert.ok(errors(':::reveal R\n<div>x</div>\n:::').includes('raw-html'))
})

test('urutan judul tidak terganggu blok: ## sebelum dan sesudah blok tetap sah', () => {
  assert.deepEqual(errors('## A\n\n:::reveal R\nisi\n:::\n\n### B\n\nteks'), [])
})

test('baris ::: di dalam blok kode tidak dianggap', () => {
  assert.deepEqual(checkMarkdown('## A\n\n```text\n:::steps\n::slide\n```\n'), [])
})

test('penanda visualizer dan challenge lama tetap bekerja', () => {
  assert.deepEqual(errors('## A\n\n::visualizer\n\n## B\n\n::challenge\n'), [])
  assert.ok(errors('::visualizer\n\n::visualizer').includes('marker-duplicate'))
})

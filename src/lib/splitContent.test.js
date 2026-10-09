import { test } from 'node:test'
import assert from 'node:assert/strict'
import { splitContent } from './splitContent.js'

const both = { hasVisualizer: true, hasChallenge: true }
const types = (segs) => segs.map((s) => s.type)

test('susunan sesuai mockup: teks, visualizer, teks, challenge', () => {
  const md = '## A\nteks satu\n\n::visualizer\n\n## B\nteks dua\n\n::challenge\n'
  const segs = splitContent(md, both)
  assert.deepEqual(types(segs), ['markdown', 'visualizer', 'markdown', 'challenge'])
  assert.equal(segs[0].text, '## A\nteks satu')
  assert.equal(segs[2].text, '## B\nteks dua')
})

test('tanpa penanda: visualizer setelah teks, challenge paling akhir', () => {
  assert.deepEqual(types(splitContent('## A\nisi', both)), ['markdown', 'visualizer', 'challenge'])
})

test('hanya challenge yang bertanda: visualizer disisipkan sebelum challenge', () => {
  const segs = splitContent('## A\nisi\n::challenge\n## B\nlagi', both)
  assert.deepEqual(types(segs), ['markdown', 'visualizer', 'challenge', 'markdown'])
})

test('penanda untuk fitur yang tidak dimiliki materi dibuang', () => {
  const segs = splitContent('## A\nisi\n::visualizer\n::challenge\n## B\nlagi', {})
  assert.deepEqual(types(segs), ['markdown'])
  assert.equal(segs[0].text, '## A\nisi\n## B\nlagi')
})

test('penanda ganda: hanya yang pertama dipakai', () => {
  const segs = splitContent('a\n::visualizer\nb\n::visualizer\nc', { hasVisualizer: true })
  assert.deepEqual(types(segs), ['markdown', 'visualizer', 'markdown'])
  assert.equal(segs[2].text, 'b\nc')
})

test('penanda di dalam blok kode bukan penanda', () => {
  const md = '```text\n::visualizer\n```\nsesudah'
  const segs = splitContent(md, { hasVisualizer: true })
  assert.deepEqual(types(segs), ['markdown', 'visualizer'])
  assert.match(segs[0].text, /::visualizer/)
})

test('pagar 4 backtick membungkus pagar 3 backtick', () => {
  const md = '````md\n```\n::challenge\n```\n````\n'
  const segs = splitContent(md, { hasChallenge: true })
  assert.deepEqual(types(segs), ['markdown', 'challenge'])
})

test('akhir baris CRLF (Windows) dan BOM ditangani', () => {
  const md = '\uFEFF## A\r\nisi\r\n::visualizer\r\n## B\r\nlagi\r\n'
  const segs = splitContent(md, { hasVisualizer: true })
  assert.deepEqual(types(segs), ['markdown', 'visualizer', 'markdown'])
  assert.equal(segs[0].text, '## A\nisi')
  assert.ok(!segs[2].text.includes('\r'))
})

test('penanda dengan spasi di sekitarnya tetap dikenali', () => {
  assert.deepEqual(types(splitContent('a\n  ::visualizer  \nb', { hasVisualizer: true })), ['markdown', 'visualizer', 'markdown'])
})

test('penanda yang dikelilingi teks di baris yang sama bukan penanda', () => {
  const segs = splitContent('lihat ::visualizer di bawah', { hasVisualizer: true })
  assert.deepEqual(types(segs), ['markdown', 'visualizer'])
  assert.match(segs[0].text, /::visualizer/)
})

test('teks kosong atau null: hanya fitur yang dimiliki', () => {
  assert.deepEqual(splitContent('', both).map((s) => s.type), ['visualizer', 'challenge'])
  assert.deepEqual(splitContent(null, { hasChallenge: true }).map((s) => s.type), ['challenge'])
  assert.deepEqual(splitContent('   \n\n', {}), [])
})

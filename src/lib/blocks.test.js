import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseDirective, splitContent } from './splitContent.js'

const types = (segs) => segs.map((s) => s.type)

test('parseDirective: tutup, buka, penanda, dan bukan penanda', () => {
  assert.deepEqual(parseDirective(':::'), { kind: 'close' })
  assert.deepEqual(parseDirective(':::steps Karakteristik'), { kind: 'open', name: 'steps', args: 'Karakteristik' })
  assert.deepEqual(parseDirective(':::tabs'), { kind: 'open', name: 'tabs', args: '' })
  assert.deepEqual(parseDirective('::slide Judul slide'), { kind: 'marker', name: 'slide', args: 'Judul slide' })
  assert.deepEqual(parseDirective('::visualizer'), { kind: 'marker', name: 'visualizer', args: '' })
  assert.equal(parseDirective('teks biasa'), null)
  assert.equal(parseDirective('::Besar'), null)
  assert.equal(parseDirective('::::'), null)
  assert.equal(parseDirective('a ::slide b'), null)
})

test('steps: judul blok, item, dan teks di tiap item', () => {
  const md = '## A\n\n:::steps Enam ciri\n::slide Satu\nisi **satu**\n\n::slide Dua\nisi dua\n:::\n\nsesudah'
  const segs = splitContent(md)
  assert.deepEqual(types(segs), ['markdown', 'steps', 'markdown'])
  assert.equal(segs[1].title, 'Enam ciri')
  assert.deepEqual(segs[1].items.map((i) => i.title), ['Satu', 'Dua'])
  assert.deepEqual(segs[1].items[0].segments, [{ type: 'markdown', text: 'isi **satu**' }])
  assert.equal(segs[2].text, 'sesudah')
})

test('tabs dengan penanda trace dan growth di dalam item', () => {
  const md = ':::tabs Cara\n::tab A\nteks A\n\n::trace bilangan-max\n\nsetelah\n::tab B\n::growth\n:::'
  const [tabs] = splitContent(md)
  assert.equal(tabs.type, 'tabs')
  assert.deepEqual(tabs.items[0].segments.map((s) => s.type), ['markdown', 'trace', 'markdown'])
  assert.equal(tabs.items[0].segments[1].id, 'bilangan-max')
  assert.deepEqual(tabs.items[1].segments, [{ type: 'growth', keys: null }])
})

test('growth dengan daftar kunci, trace di luar blok', () => {
  const segs = splitContent('::growth 1, log n ,n^2\n\n::trace jumlah-n-bil\n')
  assert.deepEqual(segs, [{ type: 'growth', keys: ['1', 'log n', 'n^2'] }, { type: 'trace', id: 'jumlah-n-bil' }])
})

test('reveal: judul dan isi (termasuk blok kode)', () => {
  const md = ':::reveal Lihat jawaban\nTeks\n\n```text\n:::\n::slide x\n```\n:::\nakhir'
  const segs = splitContent(md)
  assert.deepEqual(types(segs), ['reveal', 'markdown'])
  assert.equal(segs[0].title, 'Lihat jawaban')
  assert.match(segs[0].segments[0].text, /```text\n:::\n::slide x\n```/, 'penutup palsu di dalam pagar kode tidak menutup blok')
})

test('quiz: pertanyaan, opsi benar/salah, dan penjelasan berbaris banyak', () => {
  const md = [
    ':::quiz Cek',
    '::question Berapa 2 + 2?',
    '- [ ] 3',
    '- [x] 4',
    '- [ ] `5`',
    '::explain',
    'Karena **dua** ditambah dua.',
    '',
    'Baris kedua.',
    '::question Pertanyaan dua?',
    '- [X] Ya',
    '- [ ] Tidak',
    ':::',
  ].join('\n')
  const [quiz] = splitContent(md)
  assert.equal(quiz.type, 'quiz')
  assert.equal(quiz.questions.length, 2)
  const q1 = quiz.questions[0]
  assert.equal(q1.prompt, 'Berapa 2 + 2?')
  assert.deepEqual(q1.options, [{ text: '3', correct: false }, { text: '4', correct: true }, { text: '`5`', correct: false }])
  assert.equal(q1.explanation, 'Karena **dua** ditambah dua.\n\nBaris kedua.')
  assert.equal(quiz.questions[1].options[0].correct, true, '[X] huruf besar juga benar')
  assert.equal(quiz.questions[1].explanation, '')
})

test('blok tanpa penutup berlangsung sampai akhir file', () => {
  const segs = splitContent(':::steps S\n::slide A\nisi A\n::slide B\nisi B')
  assert.equal(segs.length, 1)
  assert.equal(segs[0].items.length, 2)
})

test('blok tidak bersarang: baris :::nama di dalam blok menjadi teks biasa', () => {
  const segs = splitContent(':::tabs T\n::tab A\n:::reveal X\ndalam\n:::\nsisa')
  assert.deepEqual(types(segs), ['tabs', 'markdown'], 'penutup pertama menutup tabs')
  assert.match(segs[0].items[0].segments[0].text, /:::reveal X/)
  assert.equal(segs[1].text, 'sisa')
})

test('penanda item di luar blok, blok tak dikenal, dan penutup liar tetap menjadi teks', () => {
  const segs = splitContent('::slide Nyasar\n\n:::foo bar\n\n:::\n')
  assert.deepEqual(types(segs), ['markdown'])
  assert.match(segs[0].text, /::slide Nyasar/)
  assert.match(segs[0].text, /:::foo bar/)
})

test('visualizer dan challenge bekerja berdampingan dengan blok, dan tidak berlaku di dalam blok', () => {
  const md = 'a\n\n:::tabs T\n::tab A\n::visualizer\n::tab B\nx\n:::\n\n::visualizer\n\n::challenge'
  const segs = splitContent(md, { hasVisualizer: true, hasChallenge: true })
  assert.deepEqual(types(segs), ['markdown', 'tabs', 'visualizer', 'challenge'])
  assert.match(segs[1].items[0].segments[0].text, /::visualizer/, 'di dalam blok hanya teks')
})

test('penanda dengan argumen untuk visualizer/challenge bukan penanda', () => {
  const segs = splitContent('::visualizer cepat', { hasVisualizer: true })
  assert.deepEqual(types(segs), ['markdown', 'visualizer'])
  assert.match(segs[0].text, /::visualizer cepat/)
})

test('CRLF dan spasi di sekitar penanda ditangani', () => {
  const md = '\uFEFF:::steps S\r\n  ::slide A  \r\nisi\r\n:::\r\n'
  const [s] = splitContent(md)
  assert.equal(s.items[0].title, 'A')
  assert.deepEqual(s.items[0].segments, [{ type: 'markdown', text: 'isi' }])
})

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { traces, runTrace } from './traces.js'
import { huffmanPseudoCode, huffmanPseudoTrace, checkHuffmanInput } from './traces/huffmanPseudo.js'
import { seeded as createSeededRandom } from '../lib/seededRandom.js'
import { STATUS } from '../components/BarChart/statuses.js'

const def = traces.huffman
const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const md = readFileSync(join(root, 'src/content/materials/greedy-huffman.md'), 'utf8')

// ---------------------------------------------------------------- pembanding independen
/** HUFFMAN apa adanya (Q terurut, seri: yang lebih dulu dibuat), mencatat urutan baris dan isi Q tiap langkah. */
function reference(items) {
  const lines = []
  const n = items.length
  let seq = 0
  const by = (a, b) => a.freq - b.freq || a.seq - b.seq
  const Q = items.map((x) => ({ ...x, seq: seq++ })).sort(by)
  const snaps = []
  const snap = () => snaps.push(Q.map((q) => q.freq))
  lines.push(1); snaps.push([])
  lines.push(2); snap()
  let cost = 0
  for (let i = 1; ; i++) {
    lines.push(3); snap()
    if (i > n - 1) break
    lines.push(4); snap()
    const x = Q.shift(); lines.push(5); snap()
    const y = Q.shift(); lines.push(6); snap()
    const z = { freq: x.freq + y.freq, left: x, right: y, seq: seq++ }; cost += z.freq; lines.push(7); snap()
    Q.push(z); Q.sort(by); lines.push(8); snap()
  }
  const rootNode = Q.shift(); lines.push(9); snap()
  const codes = {}
  const walk = (nd, b) => (nd.sym ? (codes[nd.sym] = b || '0') : (walk(nd.left, b + '0'), walk(nd.right, b + '1')))
  walk(rootNode, '')
  return { lines, snaps, codes, cost }
}

const toText = (items) => items.map((x) => `${x.sym}:${x.freq}`).join(', ')
const get = (step, name) => step.vars.find((v) => v.name === name).value
const list = (step, title) => step.lists.find((l) => l.title.startsWith(title))

function randomItems(rng) {
  const n = 2 + Math.floor(rng() * 7)
  const syms = 'abcdefgh'.slice(0, n).split('')
  return syms.map((sym) => ({ sym, freq: 1 + Math.floor(rng() * 20) }))
}

// ---------------------------------------------------------------- tes
test('pseudocode peraga sama persis dengan blok di materi', () => {
  const i = md.split('\n').indexOf('```pseudocode')
  const block = md.split('\n').slice(i + 1, md.split('\n').indexOf('```', i + 1)).join('\n')
  assert.equal(huffmanPseudoCode, block)
  assert.equal(huffmanPseudoCode.split('\n').length, 9)
})

test('urutan baris dan isi Q sama dengan eksekusi pseudocode pada 300 masukan acak', () => {
  const rng = createSeededRandom(1002)
  for (let t = 0; t < 300; t++) {
    const items = randomItems(rng)
    const steps = huffmanPseudoTrace({ C: toText(items) })
    const ref = reference(items)
    assert.deepEqual(steps.map((s) => s.line), ref.lines, toText(items))
    assert.equal(steps.length, 6 * items.length - 2)
    steps.forEach((s, k) => assert.deepEqual(s.arrays[0].values, ref.snaps[k], `${toText(items)} langkah ${k + 1}`))
  }
})

test('langkah terakhir: kode sama dengan referensi, bebas awalan, dan biaya sama dengan jumlah z.freq', () => {
  const rng = createSeededRandom(77)
  for (let t = 0; t < 200; t++) {
    const items = randomItems(rng)
    const ref = reference(items)
    const last = huffmanPseudoTrace({ C: toText(items) }).at(-1)
    const codes = Object.fromEntries(list(last, 'Kode').items.map((s) => s.split(' = ')))
    assert.deepEqual(codes, ref.codes)
    const vals = Object.values(codes)
    for (const a of vals) for (const b of vals) if (a !== b) assert.ok(!b.startsWith(a))
    const cost = items.reduce((s, x) => s + x.freq * codes[x.sym].length, 0)
    assert.equal(cost, ref.cost)
    assert.ok(last.note.includes(`= ${cost},`), 'catatan menyebut biaya')
    assert.deepEqual(last.arrays[0].values, [])
  }
})

test('contoh materi: 34 langkah, kode dokumen, dan biaya 224', () => {
  const steps = runTrace(def, { C: def.inputs[0].value }).steps
  assert.equal(steps.length, 34)
  const codes = Object.fromEntries(list(steps.at(-1), 'Kode').items.map((s) => s.split(' = ')))
  assert.deepEqual(codes, { a: '0', b: '101', c: '100', d: '111', e: '1101', f: '1100' })
  assert.ok(steps.at(-1).note.includes('= 224,'))
  // Q setelah langkah 2 dan setelah tiap putaran (baris 8) sama dengan tabel di materi
  assert.deepEqual(list(steps[1], 'Isi Q').items, ['f:5', 'e:9', 'c:12', 'b:13', 'd:16', 'a:45'])
  const after8 = steps.filter((s) => s.line === 8).map((s) => list(s, 'Isi Q').items.join(', '))
  assert.deepEqual(after8, [
    'c:12, b:13, z1:14, d:16, a:45',
    'z1:14, d:16, z2:25, a:45',
    'z2:25, z3:30, a:45',
    'a:45, z4:55',
    'z5:100',
  ])
  // angka yang ditulis di bagian D materi
  for (const s of ['34 langkah', 'z1:14']) assert.ok(md.includes(s), s)
})

test('x, y, dan z.freq berubah hanya pada baris yang benar, dan z baru ada di Q setelah baris 8', () => {
  const steps = huffmanPseudoTrace({ C: 'a:45, b:13, c:12, d:16, e:9, f:5' })
  steps.forEach((s) => {
    if (s.line < 5) assert.equal(get(s, 'x'), '–')
    if (s.line === 5) assert.equal(get(s, 'y'), '–')
    if (s.line >= 6 && s.line <= 7) assert.notEqual(get(s, 'y'), '–')
    if (s.line < 7) assert.equal(get(s, 'z.freq'), '–')
    if (s.line === 8) assert.ok(s.arrays[0].marks.includes('newNode'))
    else assert.ok(!s.arrays[0].marks.includes('newNode'))
    if (s.line >= 5 && s.line <= 7) assert.ok(s.arrays.length === 2, 'array x dan y tampil')
    else assert.equal(s.arrays.length, 1)
  })
  const s5 = steps.find((s) => s.line === 5)
  assert.equal(get(s5, 'x'), 'f:5')
  const s6 = steps.find((s) => s.line === 6)
  assert.equal(get(s6, 'y'), 'e:9')
  assert.equal(get(steps.find((s) => s.line === 7), 'z.freq'), '14')
})

test('aturan seri: simpul yang lebih dulu dibuat didahulukan, biaya tetap optimal', () => {
  const steps = huffmanPseudoTrace({ C: 'a:3, b:3, c:3, d:3' })
  assert.equal(get(steps.find((s) => s.line === 5), 'x'), 'a:3')
  const last = steps.at(-1)
  const codes = Object.fromEntries(list(last, 'Kode').items.map((s) => s.split(' = ')))
  assert.deepEqual(Object.values(codes).map((c) => c.length), [2, 2, 2, 2])
  assert.ok(last.note.includes('= 24,'))
})

test('dua simbol: satu putaran dan kode 1 bit', () => {
  const steps = huffmanPseudoTrace({ C: 'a:7, b:2' })
  assert.equal(steps.length, 10)
  assert.deepEqual(list(steps.at(-1), 'Kode').items, ['a = 1', 'b = 0'])
})

test('masukan salah ditolak dengan pesan yang menyebut sebabnya', () => {
  for (const [C, re] of [['', /minimal dua/], ['a:5', /minimal 2/], ['a:5, a:6', /lebih dari sekali/], ['a:0, b:2', /rentang/], ['ab:5, c:2', /format/], ['a:1, b:2, c:3, d:4, e:5, f:6, g:7, h:8, i:9', /Maksimal 8/]]) {
    const r = runTrace(def, { C })
    assert.equal(r.ok, false, C)
    assert.match(r.error, re, C)
  }
  assert.equal(checkHuffmanInput({ C: 'a:5, b:2' }), null)
})

test('tombol contoh valid, jumlah status dan lists konsisten, dan semua kunci status ada', () => {
  for (const p of def.presets) {
    const r = runTrace(def, p.values)
    assert.ok(r.ok, p.label)
    for (const s of r.steps) {
      assert.equal(new Set(s.lists.map((l) => l.title)).size, s.lists.length, 'judul daftar unik')
      for (const a of s.arrays) assert.equal(a.values.length, a.marks.length)
    }
  }
  for (const k of def.legend) assert.ok(STATUS[k], k)
  assert.equal(def.presets[0].values.C, def.inputs[0].value)
})

test('materi 10.2 memasang peraga huffman', () => {
  assert.ok(md.includes('::trace huffman'))
})

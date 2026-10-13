import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { checkMarkdown } from '../lib/checkMarkdown.js'
import { splitContent } from '../lib/splitContent.js'
import { buildToc } from '../lib/tableOfContents.js'
import { huffmanTreeSteps } from '../algorithms/huffmanTree.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const md = readFileSync(join(root, 'src/content/materials/greedy-huffman.md'), 'utf8')
const meta = JSON.parse(readFileSync(join(root, 'src/content/materials.json'), 'utf8')).find((m) => m.id === 'greedy-huffman')
const challenge = JSON.parse(readFileSync(join(root, 'src/content/challenges/greedy-huffman.json'), 'utf8'))
const segs = splitContent(md, { hasVisualizer: Boolean(meta.visualizer), hasChallenge: Boolean(meta.challenge) })
const lines = md.split('\n')

// ---------------------------------------------------------------- data dokumen dan pembanding independen
const FREQ = { a: 45, b: 13, c: 12, d: 16, e: 9, f: 5 }
const CODES = { a: '0', b: '101', c: '100', d: '111', e: '1101', f: '1100' }
const FIXED = { a: '000', b: '001', c: '010', d: '011', e: '100', f: '101' }

/** HUFFMAN apa adanya: Q terurut naik, seri: simpul yang lebih dulu dibuat didahulukan. */
function huffman(freq) {
  let seq = 0
  let Q = Object.entries(freq).map(([sym, f]) => ({ sym, freq: f, seq: seq++ }))
  const byFreq = (x, y) => x.freq - y.freq || x.seq - y.seq
  Q.sort(byFreq)
  const rounds = []
  while (Q.length > 1) {
    const x = Q.shift()
    const y = Q.shift()
    const z = { freq: x.freq + y.freq, left: x, right: y, seq: seq++ }
    Q.push(z)
    Q.sort(byFreq)
    rounds.push({ x, y, z, Q: Q.map((n) => (n.sym ? `${n.sym}:${n.freq}` : String(n.freq))) })
  }
  return { root: Q[0], rounds }
}
function codesOf(root) {
  const out = {}
  const walk = (n, bits) => (n.sym ? (out[n.sym] = bits) : (walk(n.left, bits + '0'), walk(n.right, bits + '1')))
  walk(root, '')
  return out
}
const cells = (l) => l.split('|').slice(1, -1).map((c) => c.trim())
const tableAfter = (re) => {
  const i = lines.findIndex((l) => re.test(l))
  assert.ok(i >= 0, `tabel ${re} tidak ditemukan`)
  const rows = []
  for (let k = i + 2; k < lines.length && lines[k].startsWith('|'); k++) rows.push(cells(lines[k]))
  return rows
}
const quizzes = segs.filter((x) => x.type === 'quiz')
const right = (qi, qn) => quizzes[qi].questions[qn].options.find((o) => o.correct).text
const { root: tree, rounds } = huffman(FREQ)

// ---------------------------------------------------------------- tes
test('materi 10.2 bersih dari error dan saran', () => {
  assert.equal(meta.hasText, true)
  assert.deepEqual(checkMarkdown(md), [])
})

test('materi 10.2 memakai komponen yang sama dengan materi sebelumnya', () => {
  const types = segs.map((x) => x.type)
  for (const t of ['steps', 'quiz', 'reveal', 'visualizer', 'challenge']) assert.ok(types.includes(t), `belum ada komponen ${t}`)
  assert.equal(types.at(-1), 'challenge', 'soal challenge tetap paling akhir')
  assert.deepEqual(segs.filter((x) => x.type === 'steps').map((x) => x.items.length), [9, 6], 'arti tiap langkah, isi Q tiap tahap')
  assert.equal(segs.filter((x) => x.type === 'reveal').length, 1)
  assert.deepEqual(quizzes.map((q) => q.questions.length), [3, 2, 3, 3, 4], 'kuis di bagian A sampai E')
  assert.match(segs[types.indexOf('visualizer') + 1].text, /^## G\. Rangkuman/, 'teks sesudah penanda diawali judul ##')
})

test('daftar isi sidebar materi 10.2', () => {
  const items = buildToc(segs, { visualizers: [{ id: 'huffmanTree' }] })
  assert.deepEqual(items.filter((i) => i.level === 2).map((i) => i.text), [
    'A. Kompresi Data',
    'B. Kode Huffman dan Sifat Prefiks',
    'C. Algoritma HUFFMAN',
    'D. Contoh Penelusuran',
    'E. Kode Huffman dari Pohon',
    'F. Mencoba Visualisasi',
    'Visualisasi',
    'G. Rangkuman',
    'Soal Challenge',
  ])
})

test('hitungan bit di bagian A cocok dengan data dokumen', () => {
  const total = (codes) => Object.keys(FREQ).reduce((s, k) => s + FREQ[k] * codes[k].length, 0)
  assert.equal(Object.values(FREQ).reduce((s, v) => s + v, 0), 100)
  assert.equal(total(CODES), 224)
  assert.equal(total(FIXED), 300)
  assert.equal(100 * 8, 800)
  assert.equal(Math.ceil(Math.log2(6)), 3)
  assert.ok(Math.abs((300 - 224) / 300 - 0.2533) < 0.0001)
  assert.equal((800 - 224) / 800, 0.72)
  for (const s of ['800.000', '300.000', '224.000', '25,3%', '76.000', '= 72\\%']) assert.ok(md.includes(s), s)
  assert.equal(right(0, 0), '3 bit')
  assert.equal(right(0, 1), '224.000 bit')
  assert.equal(right(4, 3), '76.000 bit')
})

test('tabel kode di teks sama dengan kode dari HUFFMAN dan dokumen, bebas awalan', () => {
  assert.deepEqual(codesOf(tree), CODES, 'eksekusi HUFFMAN menghasilkan kode dokumen')
  const lens = Object.fromEntries(Object.entries(CODES).map(([k, v]) => [k, v.length]))
  const rows = tableAfter(/^\| Karakter \| Jalur dari akar/)
  assert.equal(rows.length, 6)
  for (const [ch, path, code, len] of rows) {
    assert.equal(code.replaceAll('`', ''), CODES[ch], `kode ${ch}`)
    assert.equal(Number(len), lens[ch])
    // jalur: kiri = 0, kanan = 1
    assert.equal(path.split(', ').map((p) => (p === 'kiri' ? '0' : '1')).join(''), CODES[ch], `jalur ${ch}`)
  }
  const list = Object.values(CODES)
  for (const x of list) for (const y of list) if (x !== y) assert.ok(!y.startsWith(x), `${x} awalan ${y}`)
  assert.equal(right(1, 1), 'f')
  assert.equal(right(4, 0), '`111`')
})

test('tabel biaya per karakter dan jumlah simpul gabungan', () => {
  const rows = tableAfter(/^\| Karakter \| Frekuensi \(ribuan\) \| Kode/)
  let sum = 0
  for (const r of rows.filter((r) => r[0] in FREQ)) {
    assert.equal(Number(r[1]), FREQ[r[0]])
    assert.equal(Number(r[4]), FREQ[r[0]] * CODES[r[0]].length)
    sum += Number(r[4])
  }
  assert.equal(sum, 224)
  assert.equal(rows.find((r) => r[0].includes('Total'))[4], '**224**')
  const zs = rounds.map((r) => r.z.freq)
  assert.deepEqual(zs, [14, 25, 30, 55, 100])
  assert.equal(zs.reduce((s, v) => s + v, 0), 224)
  assert.ok(md.includes('14 + 25 + 30 + 55 + 100 = 224'))
})

test('tabel penelusuran 5 putaran sama dengan eksekusi HUFFMAN', () => {
  const rows = tableAfter(/^\| Tahap \| Yang digabung/)
  assert.equal(rows.length, 6)
  assert.equal(rows[0][3], 'f:5, e:9, c:12, b:13, d:16, a:45')
  const name = (n) => (n.sym ? `${n.sym}:${n.freq}` : String(n.freq))
  rounds.forEach((r, i) => {
    const row = rows[i + 1]
    assert.equal(row[1], `${name(r.x)} dan ${name(r.y)}`, `putaran ${i + 1}`)
    assert.equal(Number(row[2]), r.z.freq)
    assert.equal(row[3], i === rounds.length - 1 ? '100 (akar)' : r.Q.join(', '))
  })
  assert.equal(rounds.length, 5)
  assert.equal(right(2, 0), '5 kali')
  assert.equal(right(3, 0), 'f:5 dan e:9')
  assert.equal(right(3, 1), '14 dan d:16')
})

test('decode 10111011000 menjadi beca', () => {
  const inv = Object.fromEntries(Object.entries(CODES).map(([k, v]) => [v, k]))
  let out = ''
  let cur = ''
  for (const bit of '10111011000') {
    cur += bit
    if (inv[cur]) { out += inv[cur]; cur = '' }
  }
  assert.equal(out, 'beca')
  assert.equal(cur, '')
  assert.ok(md.includes('"beca"'))
  assert.ok(md.includes('$3 + 4 + 3 + 1 = 11$'))
  assert.equal(right(1, 1), 'f')
  // 1100 hanya bisa dibaca sebagai f
  assert.equal(inv['1100'], 'f')
})

test('pseudocode di materi sama dengan pseudocode dokumen (9 baris)', () => {
  const i = lines.findIndex((l) => l === '```pseudocode')
  const j = lines.indexOf('```', i + 1)
  const code = lines.slice(i + 1, j)
  assert.equal(code.length, 9)
  assert.deepEqual(code.map((l) => l.trim().split('(')[0]), [
    'n = |C|', 'Q = C', 'for i = 1 to n - 1', 'allocate a new node z',
    'z.left = x = EXTRACT-MIN', 'z.right = y = EXTRACT-MIN', 'z.freq = x.freq + y.freq', 'INSERT', 'return EXTRACT-MIN',
  ])
})

test('gambar materi ada di public dan punya teks alternatif', () => {
  const imgs = [...md.matchAll(/!\[([^\]]+)\]\((\/materi\/greedy-huffman\/[^)]+)\)/g)]
  assert.equal(imgs.length, 7)
  for (const [, alt, src] of imgs) {
    assert.ok(alt.length > 30, `alt singkat: ${src}`)
    assert.ok(existsSync(join(root, 'public', src)), `file ${src}`)
  }
})

test('visualizer: isian awal punya frekuensi dan kode yang sama dengan materi', () => {
  const init = [['A', 5], ['B', 9], ['C', 12], ['D', 13], ['E', 16], ['F', 45]].map(([sym, freq]) => ({ sym, freq }))
  const last = huffmanTreeSteps(init).at(-1)
  const panel = last.view.panels.find((p) => p.title.startsWith('Kode'))
  const codes = Object.fromEntries(panel.items.map((s) => s.split(' = ')))
  const map = { A: 'f', B: 'e', C: 'c', D: 'b', E: 'd', F: 'a' }
  for (const [v, doc] of Object.entries(map)) {
    assert.equal(codes[v], CODES[doc], `${v} = ${doc}`)
    assert.ok(md.includes(`${v} = \`${CODES[doc]}\``), `teks menulis ${v}`)
    assert.equal(init.find((x) => x.sym === v).freq, FREQ[doc])
  }
})

test('soal challenge: test case pertama sama dengan contoh materi', () => {
  assert.deepEqual(challenge.testCases[0].input, [[45, 13, 12, 16, 9, 5]])
  assert.equal(challenge.testCases[0].expected, 224)
})

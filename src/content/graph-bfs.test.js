import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { checkMarkdown } from '../lib/checkMarkdown.js'
import { splitContent } from '../lib/splitContent.js'
import { buildToc } from '../lib/tableOfContents.js'
import { parseGraphFields } from '../algorithms/graphCommon.js'
import { bfsGraphSteps } from '../algorithms/graphTraversal.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const md = readFileSync(join(root, 'src/content/materials/graph-bfs.md'), 'utf8')
const meta = JSON.parse(readFileSync(join(root, 'src/content/materials.json'), 'utf8')).find((m) => m.id === 'graph-bfs')
const challenge = JSON.parse(readFileSync(join(root, 'src/content/challenges/graph-bfs.json'), 'utf8'))
const segs = splitContent(md, { hasVisualizer: Boolean(meta.visualizer), hasChallenge: Boolean(meta.challenge) })
const lines = md.split('\n')

// ---------------------------------------------------------------- data dokumen
// Gambar 1 (tak berarah) dan Gambar 2 (berarah): busur dan urutan daftar tetangga persis seperti di gambar.
const EDGES1 = [[1, 2], [1, 5], [2, 3], [2, 4], [2, 5], [3, 4], [4, 5]]
const ADJ1 = { 1: [2, 5], 2: [1, 5, 3, 4], 3: [2, 4], 4: [2, 5, 3], 5: [4, 1, 2] }
const EDGES2 = [[1, 2], [1, 4], [2, 5], [3, 5], [3, 6], [4, 2], [5, 4], [6, 6]]
const ADJ2 = { 1: [2, 4], 2: [5], 3: [6, 5], 4: [2], 5: [4], 6: [6] }
// Contoh BFS: graf r s t u / v w x y.
const EXAMPLE_EDGES = [['r', 's'], ['r', 'v'], ['s', 'w'], ['t', 'u'], ['t', 'w'], ['t', 'x'], ['u', 'x'], ['u', 'y'], ['w', 'x'], ['x', 'y']]
const EXAMPLE_ADJ = { s: ['w', 'r'], r: ['s', 'v'], t: ['u', 'w', 'x'], u: ['t', 'x', 'y'], v: ['r'], w: ['s', 't', 'x'], x: ['t', 'u', 'y', 'w'], y: ['x', 'u'] }
const PSEUDOCODE = [
  'for each vertex u ∈ G.V − {s}',
  '    u.color = WHITE',
  '    u.d = ∞',
  '    u.π = NIL',
  's.color = GRAY',
  's.d = 0',
  's.π = NIL',
  'Q = ∅',
  'ENQUEUE(Q, s)',
  'while Q ≠ ∅',
  '    u = DEQUEUE(Q)',
  '    for each v ∈ G.Adj[u]',
  '        if v.color == WHITE',
  '            v.color = GRAY',
  '            v.d = u.d + 1',
  '            v.π = u',
  '            ENQUEUE(Q, v)',
  '    u.color = BLACK',
]

// ---------------------------------------------------------------- pembanding independen
/** BFS persis seperti pseudocode: warna, d, π, dan isi Q sesudah tiap putaran while. */
function bfs(adj, s) {
  const color = {}
  const d = {}
  const pi = {}
  for (const u of Object.keys(adj)) {
    color[u] = 'WHITE'
    d[u] = Infinity
    pi[u] = null
  }
  color[s] = 'GRAY'
  d[s] = 0
  const Q = [s]
  const rounds = []
  const dequeued = []
  while (Q.length > 0) {
    const u = Q.shift()
    dequeued.push(u)
    const fresh = []
    for (const v of adj[u]) {
      if (color[v] === 'WHITE') {
        color[v] = 'GRAY'
        d[v] = d[u] + 1
        pi[v] = u
        Q.push(v)
        fresh.push(v)
      }
    }
    color[u] = 'BLACK'
    rounds.push({ u, fresh, Q: [...Q] })
  }
  return { d, pi, rounds, dequeued }
}
const pathTo = (pi, v) => (pi[v] === null ? [v] : [...pathTo(pi, pi[v]), v])
const neighborsOf = (edges, directed) => {
  const adj = {}
  for (const [a, b] of edges) {
    ;(adj[a] ??= new Set()).add(b)
    if (!directed) (adj[b] ??= new Set()).add(a)
  }
  return adj
}

const cells = (l) => l.split('|').slice(1, -1).map((c) => c.trim())
/** Isi sel tanpa tanda $ (rumus) dan tanda kode. */
const plain = (c) => c.replaceAll('$', '').replaceAll('`', '').trim()
/** Tabel pertama sesudah baris yang diawali `start` (atau tabel itu sendiri bila `start` adalah baris judul tabel). */
const tableAfter = (start) => {
  const i = lines.findIndex((l) => l.startsWith(start))
  assert.ok(i >= 0, `tabel "${start}" tidak ditemukan`)
  let h = i
  while (!lines[h].startsWith('|')) h++
  const rows = []
  for (let k = h + 2; k < lines.length && lines[k].startsWith('|'); k++) rows.push(cells(lines[k]).map(plain))
  return rows
}
const quizzes = segs.filter((x) => x.type === 'quiz')
const right = (qi, qn) => plain(quizzes[qi].questions[qn].options.find((o) => o.correct).text)
const numList = (s) => s.split(',').map((x) => Number(x.trim()))

// ---------------------------------------------------------------- tes
test('materi 11.1 bersih dari error dan saran', () => {
  assert.equal(meta.hasText, true)
  assert.deepEqual(checkMarkdown(md), [])
})

test('materi 11.1 memakai komponen yang sama dengan materi sebelumnya', () => {
  const types = segs.map((x) => x.type)
  for (const t of ['steps', 'quiz', 'trace', 'visualizer', 'challenge']) assert.ok(types.includes(t), `belum ada komponen ${t}`)
  assert.equal(types.at(-1), 'challenge', 'soal challenge tetap paling akhir')
  assert.deepEqual(segs.filter((x) => x.type === 'steps').map((x) => x.items.length), [13, 9, 4], 'arti tiap langkah, Gambar 3, running time')
  assert.deepEqual(quizzes.map((q) => q.questions.length), [3, 3, 3, 4, 5, 3], 'kuis di bagian A sampai F')
  assert.match(segs[types.indexOf('visualizer') + 1].text, /^## H\. Rangkuman/, 'teks sesudah penanda diawali judul ##')
})

test('peraga BFS dipasang di akhir bagian D, sebelum bagian E', () => {
  const at = md.indexOf('::trace bfs')
  assert.ok(at > md.indexOf('## D. Algoritma BFS'))
  assert.ok(at < md.indexOf('## E. Contoh Penelusuran'))
  assert.ok(at > md.indexOf('### Peraga: Penelusuran BFS'))
  assert.equal(md.match(/::trace /g).length, 1)
})

test('daftar isi sidebar materi 11.1', () => {
  const items = buildToc(segs, { visualizers: [{ id: 'bfsGraph' }, { id: 'bfsTree' }] })
  assert.deepEqual(items.filter((i) => i.level === 2).map((i) => i.text), [
    'A. Graf',
    'B. Representasi Adjacency-List',
    'C. Representasi Adjacency-Matrix',
    'D. Algoritma BFS',
    'E. Contoh Penelusuran',
    'F. Analisis Running Time',
    'G. Mencoba Visualisasi',
    'Visualisasi',
    'H. Rangkuman',
    'Soal Challenge',
  ])
  assert.deepEqual(items.filter((i) => i.level === 3).map((i) => i.text), ['Pseudocode', 'Peraga: Penelusuran BFS', 'Adjacency-list masukan', 'Penelusuran Gambar 3', 'Hasil Lintasan'])
})

test('Gambar 1 dan 2: tabel adjacency-list dan matriks cocok dengan busur gambar', () => {
  for (const [adj, edges, directed, listStart, matStart] of [
    [ADJ1, EDGES1, false, '*Adjacency-list* graf tak berarah', '*Adjacency-matrix* graf tak berarah'],
    [ADJ2, EDGES2, true, '*Adjacency-list* graf berarah', '*Adjacency-matrix* graf berarah'],
  ]) {
    // daftar di gambar adalah daftar tetangga dari busur yang ada
    const fromEdges = neighborsOf(edges, directed)
    for (const u of Object.keys(adj)) assert.deepEqual([...adj[u]].sort(), [...(fromEdges[u] ?? [])].map(Number).sort(), `Adj[${u}] sama dengan himpunan tetangga dari busur`)
    // tabel adjacency-list di teks
    const listRows = tableAfter(listStart)
    assert.equal(listRows.length, Object.keys(adj).length)
    for (const [u, list] of listRows) assert.deepEqual(numList(list), adj[u], `Adj[${u}] di teks`)
    // matriks di teks
    const n = Object.keys(adj).length
    const matRows = tableAfter(matStart)
    assert.equal(matRows.length, n)
    for (const [i, ...row] of matRows) {
      const want = Array.from({ length: n }, (_, j) => (adj[i].includes(j + 1) ? 1 : 0))
      assert.deepEqual(row.map(Number), want, `baris ${i} matriks`)
    }
  }
})

test('sifat jumlah busur, panjang daftar, dan simetri', () => {
  const total = (adj) => Object.values(adj).reduce((s, a) => s + a.length, 0)
  assert.equal(EDGES1.length, 7)
  assert.equal(EDGES2.length, 8)
  assert.equal(total(ADJ1), 14)
  assert.equal(total(ADJ1), 2 * EDGES1.length)
  assert.equal(total(ADJ2), 8)
  assert.equal(total(ADJ2), EDGES2.length)
  const m1 = tableAfter('*Adjacency-matrix* graf tak berarah').map((r) => r.slice(1).map(Number))
  for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) assert.equal(m1[i][j], m1[j][i], `matriks 1 simetris di (${i + 1},${j + 1})`)
  const m2 = tableAfter('*Adjacency-matrix* graf berarah').map((r) => r.slice(1).map(Number))
  assert.equal(m2[2][4], 1, 'a35')
  assert.equal(m2[4][2], 0, 'a53')
  assert.equal(m2[5][5], 1, 'a66 (busur ke diri sendiri)')
  assert.ok(m2.some((row, i) => row.some((v, j) => v !== m2[j][i])), 'matriks berarah tidak simetris')
  for (const s of ['2 + 4 + 2 + 3 + 3 = 14', '2 + 1 + 2 + 1 + 1 + 1 = 8']) assert.ok(md.includes(s), s)
  // jawaban kuis A, B, C
  assert.equal(right(0, 0), '7')
  assert.equal(right(0, 1), '8')
  assert.equal(right(1, 0), '1, 5, 3, 4')
  assert.equal(right(1, 1), '6, 5')
  assert.equal(right(2, 1), '0')
  assert.equal(right(2, 2), '25')
})

test('pseudocode di teks sama dengan dokumen (18 baris)', () => {
  const open = lines.findIndex((l) => l.startsWith('```pseudocode'))
  assert.ok(open >= 0)
  const close = lines.findIndex((l, i) => i > open && l.startsWith('```'))
  const block = lines.slice(open + 1, close)
  assert.equal(block.length, 18)
  assert.deepEqual(block, PSEUDOCODE)
  // judul slide "Langkah ..." memakai nomor baris yang ada, berurutan, dan menutup 1 sampai 18
  const steps = segs.filter((x) => x.type === 'steps')[0]
  const covered = []
  for (const it of steps.items) {
    const m = it.title.match(/^Langkah (\d+)(?: (?:sampai|dan) (\d+))?/)
    assert.ok(m, it.title)
    const a = Number(m[1])
    const b = m[2] ? Number(m[2]) : a
    if (it.title.includes('sampai')) for (let k = a; k <= b; k++) covered.push(k)
    else covered.push(a, ...(m[2] ? [b] : []))
  }
  assert.deepEqual(covered, Array.from({ length: 18 }, (_, i) => i + 1))
})

test('tabel adjacency-list contoh dan busur contoh konsisten', () => {
  const table = tableAfter('### Adjacency-list masukan')
  assert.equal(table.length, 8)
  for (const [u, list] of table) assert.deepEqual(list.split(',').map((x) => x.trim()), EXAMPLE_ADJ[u], `Adj[${u}]`)
  // daftar sama dengan himpunan tetangga dari 10 busur di teks
  const fromEdges = neighborsOf(EXAMPLE_EDGES, false)
  for (const u of Object.keys(EXAMPLE_ADJ)) assert.deepEqual([...EXAMPLE_ADJ[u]].sort(), [...fromEdges[u]].sort(), `tetangga ${u}`)
  assert.equal(EXAMPLE_EDGES.length, 10)
  for (const [a, b] of EXAMPLE_EDGES) assert.ok(md.includes(`$${a}$-$${b}$`), `busur ${a}-${b} ada di teks`)
})

test('tabel putaran, hasil lintasan, dan jawaban kuis cocok dengan eksekusi BFS', () => {
  const { d, pi, rounds, dequeued } = bfs(EXAMPLE_ADJ, 's')
  assert.equal(rounds.length, 8)
  assert.deepEqual(dequeued, ['s', 'w', 'r', 't', 'x', 'v', 'u', 'y'])

  const roundRows = tableAfter('| Putaran | $u$ |')
  assert.equal(roundRows.length, 9)
  assert.equal(roundRows[0][3], 's')
  rounds.forEach((r, k) => {
    const row = roundRows[k + 1]
    assert.equal(row[0], String(k + 1))
    assert.equal(row[1], r.u)
    assert.equal(row[2], r.fresh.length === 0 ? 'tidak ada' : r.fresh.map((v) => `${v} (jarak ${d[v]})`).join(', '), `simpul baru putaran ${k + 1}`)
    assert.equal(row[3], r.Q.length === 0 ? 'kosong' : r.Q.join(', '), `Q putaran ${k + 1}`)
  })

  const resultRows = tableAfter('| Simpul | $v.d$ |')
  assert.equal(resultRows.length, 7)
  for (const [v, dist, parent, path, len] of resultRows) {
    assert.equal(Number(dist), d[v], `d[${v}]`)
    assert.equal(parent, pi[v], `π[${v}]`)
    assert.equal(path.replaceAll('\\rightarrow', '→').split('→').map((x) => x.trim()).join(''), pathTo(pi, v).join(''), `lintasan ke ${v}`)
    assert.equal(Number(len), d[v])
    assert.equal(pathTo(pi, v).length - 1, d[v], `panjang lintasan = d[${v}]`)
  }
  // simpul s tidak ada di tabel hasil, jaraknya 0 dan indukinya NIL
  assert.equal(d.s, 0)
  assert.equal(pi.s, null)

  // kuis E (indeks 4) dan D (indeks 3)
  assert.equal(right(4, 0), 'w, r')
  assert.equal(right(4, 1), String(d.u))
  assert.match(right(4, 2), /BLACK/)
  assert.equal(right(4, 3), `${rounds.length} kali`)
  assert.equal(right(4, 4), pi.y)
  assert.equal(right(3, 0), 'GRAY, dan Q berisi s')
  assert.equal(right(3, 1), 'u.d + 1')
  assert.equal(right(3, 3), 'Ketika Q kosong')
  // t sudah BLACK saat x diproses (putaran 5): t keluar di putaran 4
  assert.ok(dequeued.indexOf('t') < dequeued.indexOf('x'))
})

test('gambar Gambar 1, 2, dan 3: berkas ada, teks alternatif ada, panel berurutan a sampai i', () => {
  const refs = [...md.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)].map((m) => ({ alt: m[1], src: m[2] }))
  assert.equal(refs.length, 11)
  for (const { alt, src } of refs) {
    assert.ok(src.startsWith('/materi/graph-bfs/'), src)
    assert.ok(existsSync(join(root, 'public', src)), `berkas ${src} tidak ada`)
    assert.ok(alt.length > 60, `teks alternatif ${src} terlalu pendek`)
  }
  const steps = segs.filter((x) => x.type === 'steps')[1]
  assert.equal(steps.items.length, 9)
  'abcdefghi'.split('').forEach((c, k) => {
    assert.ok(steps.items[k].title.startsWith(`(${c})`), `judul slide ${k + 1} diawali (${c})`)
    const body = steps.items[k].segments.map((x) => x.text ?? '').join('\n')
    assert.ok(body.includes(`/materi/graph-bfs/bfs-${c}.png`), `slide (${c}) memuat bfs-${c}.png`)
    assert.ok(body.includes(`Gambar 3(${c})`), `teks alternatif slide (${c}) menyebut Gambar 3(${c})`)
  })
})

test('contoh bagian E di visualizer: pemetaan nomor menghasilkan urutan keluar Q yang sama', () => {
  const sisi = md.match(/sisi `([^`]+)`/)
  assert.ok(sisi, 'isian sisi ada di teks')
  const parsed = parseGraphFields({ n: '8', edges: sisi[1], start: '0' }, { directed: false, weighted: false, needStart: true })
  assert.equal(parsed.ok, true, parsed.error)
  const names = ['s', 'w', 'r', 't', 'x', 'v', 'u', 'y']
  // pemetaan di teks: s = 0, w = 1, r = 2, t = 3, x = 4, v = 5, u = 6, y = 7
  assert.ok(md.includes('$s = 0$, $w = 1$, $r = 2$, $t = 3$, $x = 4$, $v = 5$, $u = 6$, $y = 7$'))
  const mapped = new Set(parsed.value.edges.map(([a, b]) => [names[a], names[b]].sort().join('')))
  const doc = new Set(EXAMPLE_EDGES.map(([a, b]) => [a, b].sort().join('')))
  assert.deepEqual([...mapped].sort(), [...doc].sort(), 'busur isian = busur contoh dokumen')
  assert.equal(parsed.value.edges.length, 10)

  const steps = bfsGraphSteps(parsed.value)
  const order = steps.at(-1).view.panels.find((p) => p.title.startsWith('urutan')).items.map(Number)
  assert.deepEqual(order, [0, 1, 2, 3, 4, 5, 6, 7])
  assert.deepEqual(order.map((i) => names[i]), bfs(EXAMPLE_ADJ, 's').dequeued, 'urutan visualizer = urutan DEQUEUE di dokumen')
  assert.ok(md.includes('0, 1, 2, 3, 4, 5, 6, 7'))
})

test('soal challenge BFS memakai aturan yang disebut di teks (tetangga bernomor kecil lebih dulu)', () => {
  assert.match(challenge.description, /bernomor lebih kecil/)
  const solve = new Function(`${challenge.solution}\nreturn solve`)()
  // contoh bagian E, dipetakan ke nomor 0..7
  const sisi = md.match(/sisi `([^`]+)`/)[1]
  const edges = sisi.split(',').map((e) => e.trim().split('-').map(Number))
  assert.deepEqual(solve(8, edges, 0), [0, 1, 2, 3, 4, 5, 6, 7])
})

test('analisis running time: 2|E| untuk graf tak berarah, |E| untuk berarah, dan hasil O(V + E)', () => {
  assert.ok(md.includes('$O(V + E)$') || md.includes('O(V + E)'))
  assert.equal(right(5, 1), 'O(V + E)')
  assert.equal(right(5, 2), 'Pembacaan seluruh *adjacency-list* di langkah 12')
  assert.ok(md.includes('$2 \\lvert E \\rvert$'))
})

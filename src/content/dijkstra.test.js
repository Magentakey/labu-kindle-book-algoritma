import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { checkMarkdown } from '../lib/checkMarkdown.js'
import { splitContent } from '../lib/splitContent.js'
import { buildToc } from '../lib/tableOfContents.js'
import { dijkstraSteps, bellmanFordCode, dijkstraCode } from '../algorithms/graphShortest.js'
import { visualizers } from '../algorithms/registry.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const md = readFileSync(join(root, 'src/content/materials/dijkstra.md'), 'utf8')
const materials = JSON.parse(readFileSync(join(root, 'src/content/materials.json'), 'utf8'))
const meta = materials.find((m) => m.id === 'dijkstra')
const segs = splitContent(md, { hasVisualizer: Boolean(meta.visualizer), hasChallenge: Boolean(meta.challenge) })

// ---------------------------------------------------------------- data dokumen
const NAMES = ['s', 't', 'x', 'y', 'z']
// Adjacency list di dokumen (urutan tetangga seperti di dokumen).
const ADJ = { s: [['t', 10], ['y', 5]], t: [['x', 1], ['y', 2]], x: [['z', 4]], y: [['x', 9], ['z', 2], ['t', 3]], z: [['s', 7], ['x', 6]] }
const INF = Infinity
const fmt = (x) => (x === INF ? '\\infty' : String(x))
const setTxt = (L) => (L.length ? `$\\{${L.join(', ')}\\}$` : '$\\emptyset$')

/** Dijkstra persis seperti pseudocode. Seri EXTRACT-MIN diputus menurut urutan Q (urutan NAMES). */
function dijkstra(names, adj, s, { allowNegative = false } = {}) {
  const d = Object.fromEntries(names.map((x) => [x, INF]))
  const pi = {}
  d[s] = 0
  const Q = [...names]
  const S = []
  const frames = [{ loop: 0, u: null, d: { ...d }, pi: { ...pi }, S: [...S], Q: [...Q], relax: [] }]
  let loop = 0
  while (Q.length) {
    loop++
    let u = Q[0]
    for (const x of Q) if (d[x] < d[u]) u = x
    Q.splice(Q.indexOf(u), 1)
    S.push(u)
    const relax = []
    for (const [v, w] of adj[u]) {
      const cand = d[u] + w
      const t = d[v] > cand
      relax.push({ v, w, cand, before: d[v], t })
      if (t) {
        d[v] = cand
        pi[v] = u
      }
    }
    frames.push({ loop, u, d: { ...d }, pi: { ...pi }, S: [...S], Q: [...Q], relax })
  }
  void allowNegative
  return frames
}
const FR = dijkstra(NAMES, ADJ, 's')

// ---------------------------------------------------------------- tes
test('materi 13.2: entri materials.json (13.2, teks, visualizer dijkstra, soal Dijkstra)', () => {
  assert.equal(meta.no, '13.2')
  assert.equal(meta.hasText, true)
  assert.equal(meta.visualizer, 'dijkstra')
  assert.equal(meta.challenge, 'shortest-path')
})

test('materi 13.2 bersih dari error dan saran', () => {
  assert.deepEqual(checkMarkdown(md), [])
})

test('materi 13.2 memakai komponen interaktif dan soal challenge paling akhir', () => {
  const types = segs.map((x) => x.type)
  for (const t of ['steps', 'quiz', 'reveal', 'trace', 'visualizer', 'challenge']) assert.ok(types.includes(t), `belum ada komponen ${t}`)
  assert.equal(segs.at(-1).type, 'challenge')
  const steps = segs.filter((x) => x.type === 'steps')
  assert.deepEqual(steps.map((x) => x.items.length), [6, 7], 'arti langkah (6) dan penelusuran (inisialisasi + 5 loop + end while)')
  assert.deepEqual(segs.filter((x) => x.type === 'quiz').map((q) => q.questions.length), [4, 5, 3])
})

test('daftar isi sidebar materi 13.2', () => {
  const items = buildToc(segs, { visualizers: [{ id: 'dijkstra' }] })
  assert.deepEqual(items.filter((i) => i.level === 2).map((i) => i.text), [
    'A. Algoritma Dijkstra',
    'B. Contoh Dijkstra',
    'C. Mengapa Bobot Negatif Dilarang, dan Running Time',
    'D. Mencoba Visualisasi',
    'Visualisasi',
    'E. Rangkuman',
    'Soal Challenge',
  ])
})

test('pseudocode DIJKSTRA (8 baris), INITIALIZE-SINGLE-SOURCE (4), dan RELAX (3) sama dengan dokumen', () => {
  const blocks = [...md.matchAll(/```pseudocode\n([\s\S]*?)\n```/g)].map((m) => m[1].split('\n'))
  assert.deepEqual(blocks, [
    ['INITIALIZE-SINGLE-SOURCE(G, s)', 'S = ∅', 'Q = G.V', 'while Q ≠ ∅', '    u = EXTRACT-MIN(Q)', '    S = S ∪ {u}', '    for each vertex v ∈ G.Adj[u]', '        RELAX(u, v, w)'],
    ['for each vertex v ∈ G.V', '    v.d = ∞', '    v.π = NIL', 's.d = 0'],
    ['if v.d > u.d + w(u, v)', '    v.d = u.d + w(u, v)', '    v.π = u'],
  ])
  // dua prosedur bantu sama persis dengan materi 13.1
  const bf = readFileSync(join(root, 'src/content/materials/bellman-ford.md'), 'utf8')
  const bfBlocks = [...bf.matchAll(/```pseudocode\n([\s\S]*?)\n```/g)].map((m) => m[1])
  const djBlocks = [...md.matchAll(/```pseudocode\n([\s\S]*?)\n```/g)].map((m) => m[1])
  assert.equal(djBlocks[1], bfBlocks[1])
  assert.equal(djBlocks[2], bfBlocks[2])
})

test('hasil penelusuran simulasi sama dengan dokumen: nilai d tiap loop, urutan extract, dan hasil akhir', () => {
  // Nilai di dokumen (loop 1 sampai 5).
  const expectD = [
    { s: 0, t: 10, x: INF, y: 5, z: INF },
    { s: 0, t: 8, x: 14, y: 5, z: 7 },
    { s: 0, t: 8, x: 13, y: 5, z: 7 },
    { s: 0, t: 8, x: 9, y: 5, z: 7 },
    { s: 0, t: 8, x: 9, y: 5, z: 7 },
  ]
  FR.slice(1).forEach((f, i) => assert.deepEqual(f.d, expectD[i], `loop ${i + 1}`))
  assert.deepEqual(FR.slice(1).map((f) => f.u), ['s', 'y', 'z', 't', 'x'])
  assert.deepEqual(FR.slice(1).map((f) => f.S.join('')), ['s', 'sy', 'syz', 'syzt', 'syztx'])
  assert.deepEqual(FR.at(-1).pi, { t: 'y', y: 's', z: 'y', x: 't' })
  assert.equal(FR.length, 6)
})

test('tabel hasil penelusuran di materi sama dengan simulasi', () => {
  for (const f of FR) {
    const lab = f.loop === 0 ? 'Langkah 1 sampai 3' : `Loop ${f.loop} ($u = ${f.u}$)`
    const row = `| ${lab} | ${NAMES.map((x) => `$${fmt(f.d[x])}$`).join(' | ')} | ${setTxt(f.S)} | ${setTxt(f.Q)} |`
    assert.ok(md.includes(row), `baris tabel: ${row}`)
  }
})

test('tabel RELAX tiap loop (perhitungan, nilai sebelum, dan true/false) sama dengan simulasi', () => {
  for (const f of FR.slice(1)) {
    const head = md.indexOf(`::slide Loop ${f.loop}\n`)
    assert.ok(head >= 0, `slide loop ${f.loop}`)
    const end = md.indexOf('::slide', head + 5)
    const slide = md.slice(head, end === -1 ? undefined : end)
    for (const r of f.relax) {
      const res = r.t ? `*true*: $${r.v}.d = ${r.cand}$, $${r.v}.\\pi = ${f.u}$` : '*false*'
      const row = `| $(${f.u},${r.v})$ | $${f.d[f.u]} + ${r.w} = ${r.cand}$ | $${fmt(r.before)}$ | ${res} |`
      assert.ok(slide.includes(row), `loop ${f.loop}: ${row}`)
    }
    const trues = f.relax.filter((r) => r.t).map((r) => `$(${f.u},${r.v})$`)
    if (trues.length) assert.ok(slide.includes(`bernilai *true* untuk sisi ${trues.join(', ')}.`), `kalimat true loop ${f.loop}`)
    else assert.ok(slide.includes('bernilai *false* untuk semua sisi'), `kalimat false loop ${f.loop}`)
    assert.ok(slide.includes(`Langkah 5: $u = \\text{EXTRACT-MIN}(Q) = ${f.u}$`))
    assert.ok(slide.includes(`$S = \\{${f.S.join(', ')}\\}$`))
  }
})

test('tabel adjacency list dan graf contoh sama dengan dokumen (10 sisi)', () => {
  for (const [u, list] of Object.entries(ADJ)) {
    const row = `| $${u}$ | ${list.map(([v, w]) => `$${v}$ (${w})`).join(', ')} |`
    assert.ok(md.includes(row), row)
  }
  const edges = Object.values(ADJ).flat().length
  assert.equal(edges, 10)
})

test('tabel lintasan hasil akhir: lintasan dan bobot dihitung dari π', () => {
  const last = FR.at(-1)
  const path = (x) => {
    const p = [x]
    while (last.pi[p[0]]) p.unshift(last.pi[p[0]])
    return p
  }
  const w = (u, v) => ADJ[u].find(([a]) => a === v)[1]
  for (const x of ['t', 'x', 'y', 'z']) {
    const p = path(x)
    const sum = p.slice(1).map((v, i) => w(p[i], v))
    const total = sum.reduce((a, b) => a + b, 0)
    assert.equal(total, last.d[x])
    const row = `| $${x}$ | $${total}$ | $${last.pi[x]}$ | $${p.join(' \\to ')}$ | $${sum.join(' + ')} = ${total}$ |`
    assert.ok(md.includes(row), row)
  }
  assert.deepEqual({ t: 8, x: 9, y: 5, z: 7 }, { t: last.d.t, x: last.d.x, y: last.d.y, z: last.d.z })
})

test('gambar: 7 gambar ada, dan nilai pada teks alternatif sama dengan simulasi', () => {
  const imgs = [...md.matchAll(/!\[([^\]]*)\]\((\/materi\/dijkstra\/[^)]+)\)/g)].map((m) => ({ alt: m[1], path: m[2] }))
  assert.equal(imgs.length, 7)
  for (const im of imgs) assert.ok(existsSync(join(root, 'public', im.path)), im.path)
  FR.forEach((f, i) => {
    const im = imgs.find((x) => x.path.endsWith(`dj-0${i}.png`))
    assert.ok(im, `dj-0${i}.png`)
    const ds = NAMES.map((x) => `${x} = ${f.d[x] === INF ? '∞' : f.d[x]}`).join(', ')
    assert.ok(im.alt.includes(`Nilai d: ${ds}`), `alt loop ${i}: ${im.alt}`)
    if (f.loop > 0) assert.ok(im.alt.includes(`Simpul hitam (di S): ${f.S.join(', ')}.`))
    const thick = NAMES.filter((x) => f.pi[x]).map((x) => `${f.pi[x]}→${x}`).join(', ')
    if (thick) assert.ok(im.alt.includes(`Sisi tebal (v.π = u): ${thick}.`), `sisi tebal loop ${i}`)
  })
})

test('contoh bobot negatif: tabel Dijkstra salah (c.d = 4) sedangkan Bellman-Ford benar (c.d = 3)', () => {
  const names = ['s', 'a', 'b', 'c']
  const adj = { s: [['a', 3], ['b', 4]], a: [['c', 1]], b: [['a', -2]], c: [] }
  const f = dijkstra(names, adj, 's')
  assert.deepEqual(f.map((x) => x.u), [null, 's', 'a', 'b', 'c'], 'seri b dan c diputus menurut urutan Q')
  assert.deepEqual(f.map((x) => [x.d.a, x.d.b, x.d.c]), [[INF, INF, INF], [3, 4, INF], [3, 4, 4], [2, 4, 4], [2, 4, 4]])
  for (const [i, x] of f.entries()) {
    const row = i === 0 ? '| Awal | | |' : `| ${i} | $${x.u}$ |`
    assert.ok(md.includes(row), row)
  }
  assert.ok(md.includes('| 3 | $b$ | $a.d = 4 + (-2) = 2$ | $2$ | $4$ | $4$ |'))
  assert.equal(f.at(-1).d.c, 4)
  const edges = [[0, 1, 3], [0, 2, 4], [1, 3, 1], [2, 1, -2]]
  const bf = new Function(`${bellmanFordCode}\nreturn bellmanFord`)()
  assert.deepEqual(bf(4, edges, 0), [0, 2, 4, 3], 'Bellman-Ford memberi c = 3')
  assert.ok(md.includes('$4 + (-2) + 1 = 3$'))
})

test('catatan visualizer: nomor 0 sampai 4, urutan materi memberi hasil sama, dan bobot negatif ditolak', () => {
  const classic = visualizers.dijkstra.presets.find((p) => p.label.startsWith('Contoh klasik'))
  const text = '0>1:10, 0>3:5, 1>2:1, 1>3:2, 3>2:9, 3>4:2, 3>1:3, 2>4:4, 4>0:7, 4>2:6'
  assert.ok(md.includes(`\`${text}\``), 'urutan materi tertulis di catatan')
  const parse = (t) => t.split(',').map((s) => s.trim().split(/[>:]/).map(Number))
  const fromText = parse(text)
  const dist = (edges) => {
    const steps = dijkstraSteps({ n: 5, edges, start: 0 })
    return steps.at(-1).view.panels.find((p) => p.type === 'table' && p.caption === 'Jarak dari sumber').rows.map((r) => Number(r[1]))
  }
  assert.deepEqual(dist(classic.value.edges), [0, 8, 9, 5, 7])
  assert.deepEqual(dist(fromText), [0, 8, 9, 5, 7])
  // graf preset = graf dokumen (sisi sama, urutan tetangga y berbeda)
  const key = (e) => e.map((x) => x.join(',')).sort().join(';')
  assert.equal(key(classic.value.edges), key(fromText))
  assert.deepEqual(classic.value.edges.filter((e) => e[0] === 3).map((e) => e[1]), [1, 2, 4], 'Adj[y] preset = t, x, z')
  assert.deepEqual(fromText.filter((e) => e[0] === 3).map((e) => e[1]), [2, 4, 1], 'Adj[y] materi = x, z, t')
  assert.equal(visualizers.dijkstra.parseInput({ n: '3', edges: '0>1:-1', start: '0' }).ok, false)
  assert.match(dijkstraCode, /selesai/)
})

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { checkMarkdown } from '../lib/checkMarkdown.js'
import { splitContent } from '../lib/splitContent.js'
import { buildToc } from '../lib/tableOfContents.js'
import { parseGraphFields } from '../algorithms/graphCommon.js'
import { dfsGraphSteps } from '../algorithms/graphTraversal.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const md = readFileSync(join(root, 'src/content/materials/graph-dfs.md'), 'utf8')
const meta = JSON.parse(readFileSync(join(root, 'src/content/materials.json'), 'utf8')).find((m) => m.id === 'graph-dfs')
const challenge = JSON.parse(readFileSync(join(root, 'src/content/challenges/graph-dfs.json'), 'utf8'))
const segs = splitContent(md, { hasVisualizer: Boolean(meta.visualizer), hasChallenge: Boolean(meta.challenge) })
const lines = md.split('\n')

// ---------------------------------------------------------------- data dokumen
const NAMES = ['u', 'v', 'w', 'x', 'y', 'z']
const ADJ = { u: ['v', 'x'], v: ['y'], w: ['y', 'z'], x: ['v'], y: ['x'], z: ['z'] }
const PSEUDO_DFS = [
  'for each vertex u ∈ G.V',
  '    u.color = WHITE',
  '    u.π = NIL',
  'time = 0',
  'for each vertex u ∈ G.V',
  '    if u.color == WHITE',
  '        DFS-VISIT(G, u)',
]
const PSEUDO_VISIT = [
  'time = time + 1',
  'u.d = time',
  'u.color = GRAY',
  'for each v ∈ G.Adj[u]',
  '    if v.color == WHITE',
  '        v.π = u',
  '        DFS-VISIT(G, v)',
  'u.color = BLACK',
  'time = time + 1',
  'u.f = time',
]

// ---------------------------------------------------------------- pembanding independen
/** DFS persis seperti pseudocode. Mengembalikan d, f, π, akar pohon, jenis busur (urutan dijelajahi), dan log kejadian. */
function dfs(names, adj) {
  const color = {}
  const d = {}
  const f = {}
  const pi = {}
  const roots = []
  const edges = []
  const events = []
  let time = 0
  for (const u of names) {
    color[u] = 'WHITE'
    pi[u] = null
  }
  const visit = (u) => {
    time += 1
    d[u] = time
    color[u] = 'GRAY'
    events.push(`${u}.d=${time}`)
    for (const v of adj[u]) {
      let kind
      if (color[v] === 'WHITE') kind = 'T'
      else if (color[v] === 'GRAY') kind = 'B'
      else kind = d[u] < d[v] ? 'F' : 'C'
      edges.push({ u, v, kind, color: color[v] })
      if (color[v] === 'WHITE') {
        pi[v] = u
        visit(v)
      }
    }
    color[u] = 'BLACK'
    time += 1
    f[u] = time
    events.push(`${u}.f=${time}`)
  }
  for (const u of names) {
    if (color[u] === 'WHITE') {
      roots.push(u)
      visit(u)
    }
  }
  return { d, f, pi, roots, edges, events, time }
}

const cells = (l) => l.split('|').slice(1, -1).map((c) => c.trim())
const plain = (c) => c.replaceAll('$', '').replaceAll('`', '').replaceAll('*', '').trim()
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
const stepsBlocks = segs.filter((x) => x.type === 'steps')
const right = (qi, qn) => plain(quizzes[qi].questions[qn].options.find((o) => o.correct).text)
const bodyOf = (item) => item.segments.map((x) => x.text ?? '').join('\n')

const ref = dfs(NAMES, ADJ)

// ---------------------------------------------------------------- tes
test('materi 11.2 bersih dari error dan saran', () => {
  assert.equal(meta.hasText, true)
  assert.deepEqual(checkMarkdown(md), [])
})

test('materi 11.2 memakai komponen yang sama dengan materi sebelumnya', () => {
  const types = segs.map((x) => x.type)
  for (const t of ['steps', 'quiz', 'visualizer', 'challenge']) assert.ok(types.includes(t), `belum ada komponen ${t}`)
  assert.equal(types.at(-1), 'challenge', 'soal challenge tetap paling akhir')
  assert.deepEqual(stepsBlocks.map((x) => x.items.length), [3, 5, 3, 16], 'DFS(G), DFS-VISIT, running time, penelusuran')
  assert.deepEqual(quizzes.map((q) => q.questions.length), [3, 4, 3, 5], 'kuis di bagian A sampai D')
  assert.match(segs[types.indexOf('visualizer') + 1].text, /^## F\. Rangkuman/)
})

test('daftar isi sidebar materi 11.2', () => {
  const items = buildToc(segs, { visualizers: [{ id: 'dfsGraph' }, { id: 'dfsTree' }] })
  assert.deepEqual(items.filter((i) => i.level === 2).map((i) => i.text), [
    'A. Konsep Depth First Search',
    'B. Algoritma DFS dan DFS-VISIT',
    'C. Analisis Running Time',
    'D. Contoh Soal',
    'E. Mencoba Visualisasi',
    'Visualisasi',
    'F. Rangkuman',
    'Soal Challenge',
  ])
  assert.deepEqual(items.filter((i) => i.level === 3).map((i) => i.text), ['Warna simpul', 'Timestamp', 'Pseudocode', 'Adjacency-list masukan', 'Penelusuran', 'Hasil penelusuran'])
})

test('pseudocode DFS (7 baris) dan DFS-VISIT (10 baris) sama dengan dokumen', () => {
  const blocks = []
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('```pseudocode')) {
      const close = lines.findIndex((l, k) => k > i && l.startsWith('```'))
      blocks.push(lines.slice(i + 1, close))
    }
  }
  assert.equal(blocks.length, 2)
  assert.deepEqual(blocks[0], PSEUDO_DFS)
  assert.deepEqual(blocks[1], PSEUDO_VISIT)
  // judul slide "Langkah ..." menutup baris 1 sampai 7 (DFS) dan 1 sampai 10 (DFS-VISIT) secara berurutan
  const covered = (steps) => {
    const out = []
    for (const it of steps.items) {
      const m = it.title.match(/^Langkah (\d+)(?: (sampai|dan) (\d+))?/)
      assert.ok(m, it.title)
      const a = Number(m[1])
      const b = m[3] ? Number(m[3]) : a
      if (m[2] === 'sampai') for (let k = a; k <= b; k++) out.push(k)
      else out.push(a, ...(m[3] ? [b] : []))
    }
    return out
  }
  assert.deepEqual(covered(stepsBlocks[0]), [1, 2, 3, 4, 5, 6, 7])
  assert.deepEqual(covered(stepsBlocks[1]), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
})

test('tabel adjacency-list contoh dan 8 busur di teks konsisten', () => {
  const rows = tableAfter('### Adjacency-list masukan')
  assert.equal(rows.length, 6)
  for (const [u, list] of rows) assert.deepEqual(list.split(',').map((x) => x.trim()), ADJ[u], `Adj[${u}]`)
  const edges = NAMES.flatMap((u) => ADJ[u].map((v) => [u, v]))
  assert.equal(edges.length, 8)
  for (const [u, v] of edges) assert.ok(md.includes(`$(${u}, ${v})$`), `busur (${u}, ${v}) ada di teks`)
})

test('d, f, π, akar, dan waktu akhir pada contoh sama dengan eksekusi DFS', () => {
  assert.deepEqual(ref.d, { u: 1, v: 2, y: 3, x: 4, w: 9, z: 10 })
  assert.deepEqual(ref.f, { x: 5, y: 6, v: 7, u: 8, z: 11, w: 12 })
  assert.deepEqual(ref.roots, ['u', 'w'])
  assert.equal(ref.time, 2 * NAMES.length)
  const rows = tableAfter('| Simpul | $d$ | $f$')
  assert.equal(rows.length, 6)
  for (const [x, dd, ff, pp, iv] of rows) {
    assert.equal(Number(dd), ref.d[x], `d[${x}]`)
    assert.equal(Number(ff), ref.f[x], `f[${x}]`)
    assert.equal(pp, ref.pi[x] ?? 'NIL', `π[${x}]`)
    assert.equal(iv, `[${ref.d[x]}, ${ref.f[x]}]`)
  }
  // jawaban kuis D: u.f, jenis busur, alasan Cross, pohon, z.d dan z.f
  assert.equal(right(3, 0), String(ref.f.u))
  assert.equal(right(3, 1), 'Forward')
  assert.match(right(3, 2), /BLACK tetapi w\.d = 9 > y\.d = 3/)
  assert.match(right(3, 3), /^2 pohon, akarnya u dan w$/)
  assert.equal(right(3, 4), `${ref.d.z} dan ${ref.f.z}`)
  // kuis A, B, C
  assert.equal(right(1, 0), '1')
  assert.equal(right(2, 1).includes('langkah 4'), true)
  assert.equal(right(2, 2), 'Θ(V + E)'.replace('Θ', '\\Theta'))
})

test('jenis tiap busur di tabel cocok dengan eksekusi DFS (urutan dijelajahi, warna tujuan)', () => {
  const rows = tableAfter('| Busur | Warna tujuan | Jenis |')
  assert.equal(rows.length, 8)
  const label = { T: 'Tree', B: 'B', F: 'F', C: 'C' }
  ref.edges.forEach((e, i) => {
    assert.equal(rows[i][0], `(${e.u}, ${e.v})`, `urutan busur ${i + 1}`)
    assert.ok(rows[i][1].startsWith(e.color), `warna tujuan ${e.u}${e.v}`)
    assert.equal(rows[i][2], label[e.kind], `jenis ${e.u}${e.v}`)
  })
  const kinds = Object.fromEntries(ref.edges.map((e) => [`${e.u}${e.v}`, e.kind]))
  assert.deepEqual(kinds, { uv: 'T', vy: 'T', yx: 'T', xv: 'B', ux: 'F', wy: 'C', wz: 'T', zz: 'B' })
})

test('nilai time, d, dan f yang disebut di 16 slide sama dengan eksekusi DFS', () => {
  const steps = stepsBlocks[3]
  assert.equal(steps.items.length, 16)
  const text = steps.items.map(bodyOf).join('\n')
  // $time = N$ muncul berurutan 1, 2, ..., 12
  const times = [...text.matchAll(/\$time = (\d+)\$/g)].map((m) => Number(m[1]))
  assert.deepEqual(times, Array.from({ length: 12 }, (_, i) => i + 1))
  // $x.d = N$ dan $x.f = N$ muncul sesuai urutan kejadian
  const events = [...text.matchAll(/\$([uvwxyz])\.([df]) = (\d+)\$/g)].map((m) => `${m[1]}.${m[2]}=${m[3]}`)
  assert.deepEqual(events, ref.events)
})

test('gambar: 16 panel penelusuran, graf akhir, dan forest ada dengan teks alternatif', () => {
  const refs = [...md.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)].map((m) => ({ alt: m[1], src: m[2] }))
  assert.equal(refs.length, 18)
  for (const { alt, src } of refs) {
    assert.ok(src.startsWith('/materi/graph-dfs/'), src)
    assert.ok(existsSync(join(root, 'public', src)), `berkas ${src} tidak ada`)
    assert.ok(alt.length > 60, `teks alternatif ${src} terlalu pendek`)
  }
  stepsBlocks[3].items.forEach((it, k) => {
    const n = String(k + 1).padStart(2, '0')
    assert.ok(it.title.startsWith(`${k + 1}. `), `judul slide ${k + 1}`)
    assert.ok(bodyOf(it).includes(`/materi/graph-dfs/dfs-${n}.png`), `slide ${k + 1} memuat dfs-${n}.png`)
    assert.ok(bodyOf(it).includes(`Penelusuran ${k + 1}.`), `teks alternatif slide ${k + 1}`)
  })
})

function randomDigraph() {
  const n = 1 + Math.floor(Math.random() * 8)
  const names = 'abcdefgh'.slice(0, n).split('')
  const adj = {}
  for (const x of names) adj[x] = [...names].sort(() => Math.random() - 0.5).slice(0, Math.floor(Math.random() * 4))
  return { names, adj }
}

test('aturan jenis busur dan interval bersarang berlaku pada 200 graf berarah acak', () => {
  for (let t = 0; t < 200; t++) {
    const { names, adj } = randomDigraph()
    const r = dfs(names, adj)
    assert.equal(r.time, 2 * names.length)
    const used = new Set()
    for (const x of names) {
      assert.ok(r.d[x] < r.f[x], `d < f untuk ${x}`)
      used.add(r.d[x])
      used.add(r.f[x])
    }
    assert.equal(used.size, 2 * names.length, 'semua timestamp berbeda dan menutup 1 sampai 2n')
    for (const x of names) {
      for (const y of names) {
        if (x === y) continue
        const nested = (a, b) => r.d[a] < r.d[b] && r.f[b] < r.f[a]
        const disjoint = r.f[x] < r.d[y] || r.f[y] < r.d[x]
        assert.ok(nested(x, y) || nested(y, x) || disjoint, `interval ${x} dan ${y} bersarang atau terpisah`)
      }
    }
    for (const { u, v, kind } of r.edges) {
      const nestedIn = (a, b) => r.d[b] < r.d[a] && r.f[a] < r.f[b] // a di dalam b
      if (kind === 'T' || kind === 'F') assert.ok(u === v ? false : nestedIn(v, u), `${kind} ${u}${v}: tujuan di dalam interval asal`)
      if (kind === 'B') assert.ok(u === v || nestedIn(u, v), `B ${u}${v}: asal di dalam interval tujuan (atau sama)`)
      if (kind === 'C') assert.ok(r.f[v] < r.d[u], `C ${u}${v}: tujuan selesai sebelum asal ditemukan`)
    }
    // banyak akar = banyak pohon, dan tiap simpul ada tepat di satu pohon
    assert.equal(r.roots.length, names.filter((x) => r.pi[x] === null).length)
  }
})

test('catatan tentang visualizer: hanya tak berarah, satu simpul awal, urutan kunjungan', () => {
  assert.equal(parseGraphFields({ n: '3', edges: '0>1, 1>2', start: '0' }, { directed: false, weighted: false, needStart: true }).ok, false, 'graf berarah ditolak')
  const solve = new Function(`${challenge.solution}\nreturn solve`)()
  for (let t = 0; t < 100; t++) {
    const n = 2 + Math.floor(Math.random() * 7)
    const all = []
    for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) all.push([a, b])
    const edges = all.filter(() => Math.random() < 0.35)
    const start = Math.floor(Math.random() * n)
    const text = edges.map(([a, b]) => `${a}-${b}`).join(', ')
    const parsed = parseGraphFields({ n: String(n), edges: text, start: String(start) }, { directed: false, weighted: false, needStart: true })
    assert.equal(parsed.ok, true, parsed.error)
    const order = dfsGraphSteps(parsed.value).at(-1).view.panels.find((p) => p.title.startsWith('urutan')).items.map(Number)
    // pembanding: DFS bertetangga terurut naik, urutan d naik
    const adj = {}
    for (let i = 0; i < n; i++) adj[i] = []
    for (const [a, b] of edges) {
      adj[a].push(b)
      adj[b].push(a)
    }
    for (const k of Object.keys(adj)) adj[k].sort((p, q) => p - q)
    const seen = new Set()
    const expect = []
    const go = (u) => {
      seen.add(u)
      expect.push(u)
      for (const v of adj[u]) if (!seen.has(v)) go(v)
    }
    go(start)
    assert.deepEqual(order, expect)
    assert.deepEqual(solve(n, edges, start), expect, 'solusi challenge = urutan kunjungan')
  }
  assert.match(challenge.description, /bernomor lebih kecil/)
})

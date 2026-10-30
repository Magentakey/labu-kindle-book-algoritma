import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { checkMarkdown } from '../lib/checkMarkdown.js'
import { splitContent } from '../lib/splitContent.js'
import { buildToc } from '../lib/tableOfContents.js'
import { kruskalSteps, primSteps } from '../algorithms/graphMst.js'
import { runTrace, traces } from '../algorithms/traces.js'
import { rand } from '../lib/testRandom.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const md = readFileSync(join(root, 'src/content/materials/mst.md'), 'utf8')
const meta = JSON.parse(readFileSync(join(root, 'src/content/materials.json'), 'utf8')).find((m) => m.id === 'mst')
const segs = splitContent(md, { hasVisualizer: Boolean(meta.visualizer), hasChallenge: Boolean(meta.challenge) })
const lines = md.split('\n')

// ---------------------------------------------------------------- data dokumen
const V = 'abcdefghi'.split('')
// Sisi dan bobot dari gambar dokumen (14 sisi).
const EDGES = [['a', 'b', 4], ['a', 'h', 8], ['b', 'c', 8], ['b', 'h', 11], ['c', 'd', 7], ['c', 'i', 2], ['c', 'f', 4], ['d', 'e', 9], ['d', 'f', 14], ['e', 'f', 10], ['f', 'g', 2], ['g', 'h', 1], ['g', 'i', 6], ['h', 'i', 7]]
// Urutan hasil langkah 4 di dokumen.
const SORTED_DOC = ['hg', 'ci', 'gf', 'ab', 'cf', 'gi', 'cd', 'hi', 'bc', 'ah', 'de', 'ef', 'bh', 'df']
// Adjacency-list di dokumen.
const ADJ = { a: 'bh', b: 'ach', c: 'bifd', d: 'cef', e: 'df', f: 'cdeg', g: 'fhi', h: 'abgi', i: 'cgh' }
const PSEUDO_KRUSKAL = [
  'A = ∅',
  'for each vertex v ∈ G.V',
  '    MAKE-SET(v)',
  'sort the edges of G.E into nondecreasing order by weight w',
  'for each edge (u, v) ∈ G.E, taken in nondecreasing order by weight',
  '    if FIND-SET(u) ≠ FIND-SET(v)',
  '        A = A ∪ {(u, v)}',
  '        UNION(u, v)',
  'return A',
]
const PSEUDO_PRIM = [
  'for each u ∈ G.V',
  '    u.key = ∞',
  '    u.π = NIL',
  'r.key = 0',
  'Q = G.V',
  'while Q ≠ ∅',
  '    u = EXTRACT-MIN(Q)',
  '    for each v ∈ G.Adj[u]',
  '        if v ∈ Q and w(u, v) < v.key',
  '            v.π = u',
  '            v.key = w(u, v)',
]

const wOf = (u, v) => EDGES.find(([p, q]) => (p === u && q === v) || (p === v && q === u))[2]
const key2 = (u, v) => [u, v].sort().join('')

// ---------------------------------------------------------------- pembanding independen
/** Kruskal dengan urutan sisi yang diberikan (pasangan huruf). Mengembalikan baris per sisi. */
function kruskal(order) {
  const set = Object.fromEntries(V.map((x) => [x, new Set([x])]))
  const A = []
  const rows = []
  for (const e of order) {
    const [u, v] = e.split('')
    const ok = set[u] !== set[v]
    const before = [[...set[u]].sort().join(''), [...set[v]].sort().join('')]
    if (ok) {
      A.push(e)
      const m = new Set([...set[u], ...set[v]])
      for (const x of m) set[x] = m
    }
    const comps = [...new Set(V.map((x) => [...set[x]].sort().join('')))].sort()
    rows.push({ e, w: wOf(u, v), ok, before, A: [...A], comps })
  }
  return { rows, A, total: A.reduce((s, e) => s + wOf(e[0], e[1]), 0) }
}

/** Prim persis seperti pseudocode: seri EXTRACT-MIN diputus menurut urutan Q. */
function prim(root0) {
  const key = Object.fromEntries(V.map((x) => [x, Infinity]))
  const par = Object.fromEntries(V.map((x) => [x, null]))
  key[root0] = 0
  const Q = [...V]
  const loops = []
  while (Q.length) {
    const m = Math.min(...Q.map((x) => key[x]))
    const cand = Q.filter((x) => key[x] === m)
    const u = cand[0]
    Q.splice(Q.indexOf(u), 1)
    const upd = []
    for (const v of ADJ[u]) {
      const w = wOf(u, v)
      if (Q.includes(v) && w < key[v]) {
        upd.push({ v, w, old: key[v] })
        key[v] = w
        par[v] = u
      }
    }
    loops.push({ u, key: m, cand, upd, Q: [...Q], keys: { ...key }, par: { ...par } })
  }
  return { loops, key, par }
}

const cells = (l) => l.split('|').slice(1, -1).map((c) => c.trim())
const plain = (c) => c.replaceAll('$', '').replaceAll('`', '').replaceAll('*', '').trim()
const tableAfter = (start) => {
  const i = lines.findIndex((l) => l.startsWith(start))
  assert.ok(i >= 0, `tabel "${start}" tidak ditemukan`)
  const rows = []
  for (let k = i + 2; k < lines.length && lines[k].startsWith('|'); k++) rows.push(cells(lines[k]).map(plain))
  return rows
}
const quizzes = segs.filter((x) => x.type === 'quiz')
const stepsBlocks = segs.filter((x) => x.type === 'steps')
const right = (qi, qn) => plain(quizzes[qi].questions[qn].options.find((o) => o.correct).text)
const bodyOf = (item) => item.segments.map((x) => x.text ?? '').join('\n')
const parseSets = (s) => [...s.matchAll(/\{([a-z,]*)\}/g)].map((m) => m[1].split(',').sort().join('')).sort()

const KR = kruskal(SORTED_DOC)
const PR = prim('a')
const DOC_TREE = ['ab', 'bc', 'cd', 'cf', 'ci', 'de', 'fg', 'gh']

// ---------------------------------------------------------------- tes
test('materi 12 bersih dari error dan saran', () => {
  assert.equal(meta.hasText, true)
  assert.deepEqual(checkMarkdown(md), [])
})

test('urutan sisi di dokumen adalah urutan bobot naik dan memuat 14 sisi', () => {
  assert.equal(EDGES.length, 14)
  const w = SORTED_DOC.map((e) => wOf(e[0], e[1]))
  assert.deepEqual(w, [...w].sort((a, b) => a - b))
  assert.deepEqual([...SORTED_DOC.map((e) => key2(e[0], e[1]))].sort(), EDGES.map(([u, v]) => key2(u, v)).sort())
})

test('materi 12 memakai komponen yang sama dengan materi sebelumnya', () => {
  const types = segs.map((x) => x.type)
  for (const t of ['steps', 'quiz', 'visualizer', 'challenge']) assert.ok(types.includes(t), `belum ada komponen ${t}`)
  assert.equal(types.at(-1), 'challenge', 'soal challenge tetap paling akhir')
  assert.deepEqual(stepsBlocks.map((x) => x.items.length), [7, 14, 7, 10, 2], 'Kruskal, contoh Kruskal, Prim, contoh Prim, running time')
  assert.deepEqual(quizzes.map((q) => q.questions.length), [4, 4, 4, 4, 5, 2], 'kuis di bagian A sampai F')
  assert.match(segs[types.indexOf('visualizer') + 1].text, /^## H\. Rangkuman/)
})

test('daftar isi sidebar materi 12', () => {
  const items = buildToc(segs, { visualizers: [{ id: 'prim' }, { id: 'kruskal' }] })
  assert.deepEqual(items.filter((i) => i.level === 2).map((i) => i.text), [
    'A. Konsep Minimum Spanning Tree',
    'B. Algoritma Kruskal',
    'C. Contoh Kruskal',
    'D. Algoritma Prim',
    'E. Contoh Prim',
    'F. Analisis Running Time',
    'G. Mencoba Visualisasi',
    'Visualisasi',
    'H. Rangkuman',
    'Soal Challenge',
  ])
})

test('pseudocode Kruskal (9 baris) dan Prim (11 baris) sama dengan dokumen', () => {
  const blocks = []
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('```pseudocode')) {
      const close = lines.findIndex((l, k) => k > i && l.startsWith('```'))
      blocks.push(lines.slice(i + 1, close))
    }
  }
  assert.equal(blocks.length, 2)
  assert.deepEqual(blocks[0], PSEUDO_KRUSKAL)
  assert.deepEqual(blocks[1], PSEUDO_PRIM)
  // judul slide "Langkah ..." menutup semua baris secara berurutan
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
  const seq = (n) => Array.from({ length: n }, (_, i) => i + 1)
  assert.deepEqual(covered(stepsBlocks[0]), seq(9))
  assert.deepEqual(covered(stepsBlocks[2]), seq(11))
})

test('Kruskal: A akhir dan total sama dengan dokumen, dan sama dengan Prim', () => {
  assert.deepEqual([...KR.A].map((e) => key2(e[0], e[1])).sort(), DOC_TREE)
  assert.equal(KR.total, 37)
  const treeP = V.filter((x) => PR.par[x]).map((x) => key2(x, PR.par[x])).sort()
  assert.deepEqual(treeP, DOC_TREE)
  assert.equal(V.reduce((s, x) => s + PR.key[x], 0), 37)
  assert.deepEqual(KR.A, ['hg', 'ci', 'gf', 'ab', 'cf', 'cd', 'bc', 'de'], 'urutan masuk ke A sama dengan dokumen')
})

test('tabel hasil Kruskal (14 baris) sama dengan eksekusi Kruskal', () => {
  const rows = tableAfter('| Sisi | Bobot | FIND-SET(u)')
  assert.equal(rows.length, 14)
  rows.forEach((cellsRow, i) => {
    const r = KR.rows[i]
    assert.equal(cellsRow[0], `(${r.e[0]},${r.e[1]})`, `sisi ke-${i + 1}`)
    assert.equal(Number(cellsRow[1]), r.w, `bobot ke-${i + 1}`)
    assert.equal(cellsRow[2], r.ok ? 'true' : 'false', `uji ke-${i + 1}`)
    const a = r.A.length === 0 ? '∅' : `{${r.A.map((e) => `(${e[0]},${e[1]})`).join(',')}}`
    assert.equal(cellsRow[3], a, `A ke-${i + 1}`)
    assert.deepEqual(parseSets(cellsRow[4]), r.comps, `UNION ke-${i + 1}`)
  })
  // 8 diterima, 6 ditolak, dan 9 himpunan menyusut menjadi 1
  assert.equal(KR.rows.filter((r) => r.ok).length, 8)
  assert.equal(KR.rows.filter((r) => !r.ok).length, 6)
  assert.equal(KR.rows[0].comps.length, 8)
  assert.equal(KR.rows.at(-1).comps.length, 1)
})

test('14 slide Kruskal: himpunan FIND-SET dan keputusan sama dengan eksekusi', () => {
  const steps = stepsBlocks[1]
  assert.equal(steps.items.length, 14)
  steps.items.forEach((it, k) => {
    const r = KR.rows[k]
    const body = bodyOf(it)
    const n = String(k + 1).padStart(2, '0')
    assert.ok(it.title.startsWith(`${k + 1}. Sisi (${r.e[0]}, ${r.e[1]}) = ${r.w}: ${r.ok ? 'diterima' : 'ditolak'}`), `judul slide ${k + 1}: ${it.title}`)
    assert.ok(body.includes(`FIND-SET$(${r.e[0]})$ = {${r.before[0].split('').join(',')}}`), `FIND-SET(u) slide ${k + 1}`)
    assert.ok(body.includes(`FIND-SET$(${r.e[1]})$ = {${r.before[1].split('').join(',')}}`), `FIND-SET(v) slide ${k + 1}`)
    assert.equal(body.includes('bernilai *true*'), r.ok, `true/false slide ${k + 1}`)
    assert.equal(body.includes('bernilai *false*'), !r.ok, `true/false slide ${k + 1}`)
    assert.ok(body.includes(`/materi/mst/kruskal-${n}.png`), `slide ${k + 1} memuat kruskal-${n}.png`)
    assert.ok(body.includes(`Kruskal ${k + 1}.`), `teks alternatif slide ${k + 1}`)
  })
})

test('seri bobot 8: urutan (a,h) lebih dulu menghasilkan pohon lain dengan total 37', () => {
  const swapped = SORTED_DOC.map((e) => (e === 'bc' ? 'ah' : e === 'ah' ? 'bc' : e))
  const alt = kruskal(swapped)
  assert.equal(alt.total, 37)
  assert.deepEqual([...alt.A].map((e) => key2(e[0], e[1])).sort(), ['ab', 'ah', 'cd', 'cf', 'ci', 'de', 'fg', 'gh'])
  assert.ok(md.includes('Gambar buku Cormen'), 'teks menyebut urutan di gambar buku')
})

test('Prim: urutan extract, perubahan tiap putaran, dan hasil akhir sama dengan dokumen', () => {
  assert.deepEqual(PR.loops.map((l) => l.u), 'abcifghde'.split(''))
  assert.deepEqual(PR.loops.map((l) => l.key), [0, 4, 8, 2, 4, 2, 1, 7, 9])
  // seri hanya terjadi di putaran 3 (c dan h sama-sama 8) dan diputus menurut urutan Q
  assert.deepEqual(PR.loops.filter((l) => l.cand.length > 1).map((l) => [l.u, l.cand.join('')]), [['c', 'ch']])
  assert.deepEqual(PR.key, { a: 0, b: 4, c: 8, d: 7, e: 9, f: 4, g: 2, h: 1, i: 2 })
  assert.deepEqual(PR.par, { a: null, b: 'a', c: 'b', d: 'c', e: 'd', f: 'c', g: 'f', h: 'g', i: 'c' })
  // nilai di gambar dokumen (b) sampai (e): setelah putaran 2 dan 3 dan 4 dan 5
  assert.deepEqual(PR.loops[1].keys, { a: 0, b: 4, c: 8, d: Infinity, e: Infinity, f: Infinity, g: Infinity, h: 8, i: Infinity })
  assert.deepEqual(PR.loops[2].keys, { a: 0, b: 4, c: 8, d: 7, e: Infinity, f: 4, g: Infinity, h: 8, i: 2 })
  assert.deepEqual(PR.loops[3].keys, { a: 0, b: 4, c: 8, d: 7, e: Infinity, f: 4, g: 6, h: 7, i: 2 })
  assert.deepEqual(PR.loops[4].keys, { a: 0, b: 4, c: 8, d: 7, e: 10, f: 4, g: 2, h: 7, i: 2 })
  assert.deepEqual(PR.loops[7].keys.e, 9)
})

test('tabel Prim (ringkasan putaran dan nilai akhir) sama dengan eksekusi Prim', () => {
  const rows = tableAfter('| Loop | $u$ (EXTRACT-MIN)')
  assert.equal(rows.length, 9)
  rows.forEach((c, i) => {
    const l = PR.loops[i]
    assert.equal(Number(c[0]), i + 1)
    assert.equal(c[1], l.u)
    assert.equal(Number(c[2]), l.key)
    const changes = [...c[3].matchAll(/(\w): key = (\d+), \\pi = (\w)/g)].map((m) => [m[1], Number(m[2]), m[3]])
    assert.deepEqual(changes, l.upd.map((x) => [x.v, x.w, l.u]), `perubahan putaran ${i + 1}`)
    if (l.upd.length === 0) assert.equal(c[3], 'tidak ada')
  })
  const fin = tableAfter('| Simpul | $key$ | $\\pi$')
  assert.equal(fin.length, 9)
  for (const [x, k, p, edge] of fin) {
    assert.equal(Number(k), PR.key[x], `key ${x}`)
    assert.equal(p, PR.par[x] ?? 'NIL', `π ${x}`)
    assert.equal(edge, PR.par[x] ? `(${PR.par[x]}, ${x})` : '–')
  }
})

test('10 slide Prim: simpul yang di-extract dan perubahan key sama dengan eksekusi Prim', () => {
  const steps = stepsBlocks[3]
  assert.equal(steps.items.length, 10)
  assert.ok(steps.items[0].title.startsWith('0. Inisialisasi'))
  assert.ok(bodyOf(steps.items[0]).includes('/materi/mst/prim-00.png'))
  PR.loops.forEach((l, i) => {
    const it = steps.items[i + 1]
    const body = bodyOf(it)
    const n = String(i + 1).padStart(2, '0')
    assert.ok(it.title.startsWith(`${i + 1}. EXTRACT-MIN: ${l.u}`), it.title)
    assert.ok(body.includes(`$u = ${l.u}$`), `u slide ${i + 1}`)
    const ups = [...body.matchAll(/\$(\w)\.\\pi = (\w)\$\. Langkah 11: \$\w\.key = (\d+)\$/g)].map((m) => [m[1], Number(m[3]), m[2]])
    assert.deepEqual(ups, l.upd.map((x) => [x.v, x.w, l.u]), `perubahan slide ${i + 1}`)
    const olds = [...body.matchAll(/< \w\.key = (\\infty|\d+)\$/g)].map((m) => (m[1] === '\\infty' ? Infinity : Number(m[1])))
    assert.deepEqual(olds, l.upd.map((x) => x.old), `key lama slide ${i + 1}`)
    assert.equal(body.includes('sama-sama bernilai'), l.cand.length > 1, `seri slide ${i + 1}`)
    assert.ok(body.includes(`/materi/mst/prim-${n}.png`), `slide ${i + 1} memuat prim-${n}.png`)
    assert.ok(body.includes(`Prim ${i + 1}.`), `teks alternatif slide ${i + 1}`)
    // nilai key di teks alternatif gambar sama dengan eksekusi
    const keys = V.map((x) => `${x}=${l.keys[x] === Infinity ? '∞' : l.keys[x]}`).join(', ')
    assert.ok(body.includes(keys), `key di teks alternatif slide ${i + 1}`)
  })
})

test('adjacency-list contoh Prim di teks sama dengan dokumen dan konsisten dengan daftar sisi', () => {
  const rows = tableAfter('| Simpul $u$ | $Adj[u]$ |')
  assert.equal(rows.length, 9)
  for (const [u, list] of rows) assert.deepEqual(list.split(',').map((x) => x.trim()), ADJ[u].split(''), `Adj[${u}]`)
  // simetris: tiap sisi tercatat di kedua ujung, dan ada 14 sisi
  const pairs = new Set()
  for (const u of V) for (const v of ADJ[u]) { assert.ok(ADJ[v].includes(u), `(${u},${v}) simetris`); pairs.add(key2(u, v)) }
  assert.deepEqual([...pairs].sort(), EDGES.map(([u, v]) => key2(u, v)).sort())
})

test('jawaban kuis cocok dengan eksekusi', () => {
  // A: 8 sisi, total bobot, siklus, Kruskal dan Prim
  assert.equal(right(0, 0), String(V.length - 1))
  assert.equal(right(0, 3), 'Kruskal dan Prim')
  // B
  assert.equal(right(1, 0), 'Kosong (\\emptyset)')
  assert.match(right(1, 2), /^FIND-SET\(u\) \\ne FIND-SET\(v\)$/)
  // C
  assert.equal(right(2, 0), '(h,g) dengan bobot 1')
  assert.equal(right(2, 2), String(KR.rows.filter((r) => !r.ok).length))
  assert.equal(right(2, 3), String(KR.total))
  const gi = KR.rows.find((r) => r.e === 'gi')
  assert.ok(gi.before[0] === gi.before[1], 'g dan i satu himpunan saat diperiksa')
  assert.equal(gi.before[0], 'cfghi')
  // D
  assert.match(right(3, 0), /^r\.key = 0 dan simpul lain \\infty$/)
  // E
  assert.equal(right(4, 0), PR.loops.map((l) => l.u).join(', '))
  assert.equal(right(4, 3), `${PR.key.e} dan ${PR.par.e}`)
  assert.equal(right(4, 4), String(V.reduce((s, x) => s + PR.key[x], 0)))
  const h = [PR.loops[0], PR.loops[3], PR.loops[5]].map((l) => l.keys.h)
  assert.deepEqual(h, [8, 7, 1])
  // F
  assert.match(right(5, 1), /^O\(E \\lg V\)$/)
})

test('gambar: graf, hasil, 14 panel Kruskal, dan 10 panel Prim ada dengan teks alternatif', () => {
  const refs = [...md.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)].map((m) => ({ alt: m[1], src: m[2] }))
  assert.equal(refs.length, 2 + 14 + 10)
  for (const { alt, src } of refs) {
    assert.ok(src.startsWith('/materi/mst/'), src)
    assert.ok(existsSync(join(root, 'public', src)), `berkas ${src} tidak ada`)
    assert.ok(alt.length > 60, `teks alternatif ${src} terlalu pendek`)
  }
  assert.equal(new Set(refs.map((r) => r.src)).size, refs.length, 'tidak ada gambar ganda')
})

test('catatan visualizer: nomor 0 sampai 8, Kruskal stabil menerima (a,h), Prim menghasilkan pohon yang sama', () => {
  const idx = Object.fromEntries(V.map((x, i) => [x, i]))
  const edges = EDGES.map(([u, v, w]) => [idx[u], idx[v], w])
  // urutan penulisan sisi pada contoh klasik registry: (a,h) tertulis sebelum (b,c)
  assert.ok(edges.findIndex(([u, v]) => u === 0 && v === 7) < edges.findIndex(([u, v]) => u === 1 && v === 2))
  const k = kruskalSteps({ n: 9, edges }).at(-1).note
  assert.match(k, /Total bobot pohon rentang minimum = 37/)
  assert.ok(k.includes('0-7 (8)') && !k.includes('1-2 (8)'), 'Kruskal visualizer menerima (a,h) dan menolak (b,c)')
  const p = primSteps({ n: 9, edges, start: 0 }).at(-1).note
  assert.match(p, /Total bobot pohon rentang minimum = 37/)
  const got = [...p.matchAll(/(\d)-(\d) \(\d+\)/g)].map((m) => key2(m[1], m[2])).sort()
  const want = DOC_TREE.map((e) => key2(String(idx[e[0]]), String(idx[e[1]]))).sort()
  assert.deepEqual(got, want, 'Prim visualizer = pohon dokumen')
  assert.ok(md.includes('`0-1`') && md.includes('`2-8`'))
})

test('peraga ::trace: Kruskal di akhir bagian C, Prim di akhir bagian E, dan angka di teks sesuai eksekusi', () => {
  const traceSegs = segs.filter((x) => x.type === 'trace')
  assert.deepEqual(traceSegs.map((x) => x.id), ['mst-kruskal', 'mst-prim'])
  const at = (id) => segs.findIndex((x) => x.type === 'trace' && x.id === id)
  assert.match(segs[at('mst-kruskal') + 1].text, /^## D\. Algoritma Prim/)
  assert.match(segs[at('mst-prim') + 1].text, /^## F\. Analisis Running Time/)
  // isian awal peraga adalah contoh materi dan menghasilkan total 37
  for (const id of ['mst-kruskal', 'mst-prim']) {
    const def = traces[id]
    const r = runTrace(def, Object.fromEntries(def.inputs.map((i) => [i.key, i.value])))
    assert.ok(r.ok, r.error)
    assert.match(r.steps.at(-1).note, /total bobot 37/, id)
    const word = id === 'mst-kruskal' ? 'Kruskal' : 'Prim'
    assert.ok(md.includes(`### Peraga: Penelusuran ${word}`), `subbagian peraga ${word}`)
    assert.ok(md.includes(`yaitu ${r.steps.length} langkah untuk contoh`), `jumlah langkah ${word} di teks = ${r.steps.length}`)
  }
  // rumus jumlah langkah di teks: 2m + 2n + 4 (Kruskal) dan 6 + 3n + 2D + 2U (Prim)
  assert.ok(md.includes('$2m + 2n + 4$') && md.includes('$6 + 3n + 2D + 2U$'))
  assert.equal(EDGES.length * 2 + V.length * 2 + 4, 50)
  const D = EDGES.length * 2
  assert.equal(6 + 3 * V.length + 2 * D + 2 * PR.loops.reduce((a, l) => a + l.upd.length, 0), 113)
})

test('aturan umum MST berlaku pada 200 graf acak: Kruskal = Prim = n-1 sisi', () => {
  for (let t = 0; t < 200; t++) {
    const n = 2 + Math.floor(rand() * 7)
    const names = V.slice(0, n)
    const edges = []
    // pohon acak supaya terhubung, lalu tambah sisi acak
    for (let i = 1; i < n; i++) edges.push([names[Math.floor(rand() * i)], names[i], 1 + Math.floor(rand() * 9)])
    for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) if (rand() < 0.3 && !edges.some(([p, q]) => (p === names[a] && q === names[b]) || (p === names[b] && q === names[a]))) edges.push([names[a], names[b], 1 + Math.floor(rand() * 9)])
    const sorted = [...edges].sort((p, q) => p[2] - q[2])
    const set = Object.fromEntries(names.map((x) => [x, new Set([x])]))
    let kTotal = 0
    let kCount = 0
    for (const [u, v, w] of sorted) {
      if (set[u] !== set[v]) {
        const m = new Set([...set[u], ...set[v]])
        for (const x of m) set[x] = m
        kTotal += w
        kCount++
      }
    }
    const key = Object.fromEntries(names.map((x) => [x, Infinity]))
    key.a = 0
    const Q = [...names]
    let pTotal = 0
    while (Q.length) {
      let u = Q[0]
      for (const x of Q) if (key[x] < key[u]) u = x
      Q.splice(Q.indexOf(u), 1)
      pTotal += key[u]
      for (const [p, q, w] of edges) {
        const v = p === u ? q : q === u ? p : null
        if (v && Q.includes(v) && w < key[v]) key[v] = w
      }
    }
    assert.equal(kCount, n - 1)
    assert.equal(kTotal, pTotal)
  }
})

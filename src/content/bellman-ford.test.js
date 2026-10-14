import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { checkMarkdown } from '../lib/checkMarkdown.js'
import { splitContent } from '../lib/splitContent.js'
import { buildToc } from '../lib/tableOfContents.js'
import { bellmanFordCode } from '../algorithms/graphShortest.js'
import { visualizers } from '../algorithms/registry.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const md = readFileSync(join(root, 'src/content/materials/bellman-ford.md'), 'utf8')
const materials = JSON.parse(readFileSync(join(root, 'src/content/materials.json'), 'utf8'))
const meta = materials.find((m) => m.id === 'bellman-ford')
const segs = splitContent(md, { hasVisualizer: Boolean(meta.visualizer), hasChallenge: Boolean(meta.challenge) })
const lines = md.split('\n')

// ---------------------------------------------------------------- data dokumen
const V = ['s', 't', 'x', 'y', 'z']
// Graf contoh Bellman-Ford dan urutan sisi di dokumen (langkah 3).
const W = { tx: 5, ty: 8, tz: -4, xt: -2, yx: -3, yz: 9, zx: 7, zs: 2, st: 6, sy: 7 }
const ORDER = ['tx', 'ty', 'tz', 'xt', 'yx', 'yz', 'zx', 'zs', 'st', 'sy']
// Graf contoh pengantar (bagian A).
const W2 = { st: 3, sy: 5, tx: 6, ty: 2, yt: 1, yx: 4, yz: 6, xz: 2, zx: 7, zs: 3 }
// Graf contoh siklus positif dan negatif.
const W3 = { sa: 3, ab: -4, bg: 4, sc: 5, cd: 6, dc: -3, dg: 8, se: 2, ef: 3, fe: -6, fg: 7 }
const PSEUDO_BF = [
  'INITIALIZE-SINGLE-SOURCE(G, s)',
  'for i = 1 to |G.V| − 1',
  '    for each edge (u, v) ∈ G.E',
  '        RELAX(u, v, w)',
  'for each edge (u, v) ∈ G.E',
  '    if v.d > u.d + w(u, v)',
  '        return FALSE',
  'return TRUE',
]
const PSEUDO_INIT = ['for each vertex v ∈ G.V', '    v.d = ∞', '    v.π = NIL', 's.d = 0']
const PSEUDO_RELAX = ['if v.d > u.d + w(u, v)', '    v.d = u.d + w(u, v)', '    v.π = u']

// ---------------------------------------------------------------- pembanding independen
const INF = Infinity
/** Bellman-Ford persis seperti pseudocode. Mengembalikan baris RELAX tiap loop, nilai akhir, dan hasil pemeriksaan. */
function bellmanFord(names, order, w, s) {
  const d = Object.fromEntries(names.map((x) => [x, INF]))
  const pi = Object.fromEntries(names.map((x) => [x, null]))
  d[s] = 0
  const loops = []
  for (let i = 1; i <= names.length - 1; i++) {
    const rows = []
    const before = { ...d }
    for (const e of order) {
      const [u, v] = e.split('')
      const cand = d[u] + w[e]
      const ok = d[v] > cand
      rows.push({ e, u, v, w: w[e], ud: d[u], cand, vd: d[v], ok })
      if (ok) {
        d[v] = cand
        pi[v] = u
      }
    }
    loops.push({ i, rows, before, d: { ...d }, pi: { ...pi } })
  }
  const check = order.map((e) => {
    const [u, v] = e.split('')
    return { e, u, v, w: w[e], ud: d[u], cand: d[u] + w[e], vd: d[v], bad: d[v] > d[u] + w[e] }
  })
  const bad = check.find((c) => c.bad)
  return { loops, d, pi, check, result: !bad, badEdge: bad?.e ?? null }
}
const pathTo = (pi, v) => {
  const p = [v]
  while (pi[p.at(-1)]) p.push(pi[p.at(-1)])
  return p.reverse()
}
/** Semua lintasan sederhana dari src ke dst dengan bobotnya. */
function simplePaths(src, dst, w) {
  const out = []
  const walk = (u, path, cost) => {
    if (u === dst) return out.push({ path: path.join(''), cost })
    for (const e of Object.keys(w)) {
      if (e[0] === u && !path.includes(e[1])) walk(e[1], [...path, e[1]], cost + w[e])
    }
  }
  walk(src, [src], 0)
  return out
}

const BF = bellmanFord(V, ORDER, W, 's')

const cells = (l) => l.split('|').slice(1, -1).map((c) => c.trim())
const plain = (c) => c.replaceAll('$', '').replaceAll('`', '').replaceAll('*', '').trim()
/** Semua tabel yang baris judulnya diawali `start`, masing-masing berupa larik baris sel. */
const tablesAfter = (start) => {
  const out = []
  lines.forEach((l, i) => {
    if (!l.startsWith(start)) return
    const rows = []
    for (let k = i + 2; k < lines.length && lines[k].startsWith('|'); k++) rows.push(cells(lines[k]).map(plain))
    out.push(rows)
  })
  assert.ok(out.length > 0, `tabel "${start}" tidak ditemukan`)
  return out
}
const quizzes = segs.filter((x) => x.type === 'quiz')
const stepsBlocks = segs.filter((x) => x.type === 'steps')
const right = (qi, qn) => plain(quizzes[qi].questions[qn].options.find((o) => o.correct).text)
const wt = (x) => (x < 0 ? `(${x})` : String(x))
const mi = (x) => (x === INF ? '\\infty' : String(x))
const pairText = (e) => `(${e[0]},${e[1]})`

// ---------------------------------------------------------------- tes
test('materi 13 dipecah: 13.1 Bellman-Ford punya soal challenge sendiri, 13.2 Dijkstra menyimpan soal Dijkstra', () => {
  assert.equal(materials.some((m) => m.id === 'shortest-path'), false, 'id lama shortest-path sudah tidak dipakai')
  assert.equal(meta.no, '13.1')
  assert.equal(meta.hasText, true)
  assert.equal(meta.visualizer, 'bellmanFord')
  assert.equal(meta.challenge, 'bellman-ford', '13.1 punya soal challenge sendiri (bobot sisi boleh negatif)')
  const dj = materials.find((m) => m.id === 'dijkstra')
  assert.equal(dj.no, '13.2')
  assert.equal(dj.visualizer, 'dijkstra')
  assert.equal(dj.challenge, 'shortest-path', 'soal Dijkstra (bobot tidak negatif) pindah ke 13.2')
  assert.deepEqual(materials.slice(-3).map((m) => m.no), ['12', '13.1', '13.2'])
})

test('materi 13.1 bersih dari error dan saran', () => {
  assert.deepEqual(checkMarkdown(md), [])
})

test('materi 13.1 memakai komponen yang sama dengan materi sebelumnya', () => {
  const types = segs.map((x) => x.type)
  for (const t of ['steps', 'quiz', 'trace', 'visualizer', 'challenge']) assert.ok(types.includes(t), `belum ada komponen ${t}`)
  assert.equal(segs.at(-1).type, 'challenge', 'soal challenge paling akhir')
  assert.deepEqual(segs.filter((x) => x.type === 'trace').map((x) => x.id ?? x.name ?? x.trace), ['bellman-ford'])
  assert.deepEqual(stepsBlocks.map((x) => x.items.length), [6, 7, 5], 'arti langkah, penelusuran contoh, running time')
  assert.deepEqual(quizzes.map((q) => q.questions.length), [4, 5, 5, 3], 'kuis di bagian A sampai D')
  assert.match(segs[types.indexOf('visualizer') + 1].text, /^## F\. Rangkuman/)
  assert.ok(md.includes(':::reveal Mengapa hasil akhirnya tetap sama bila urutan sisi diubah?'))
})

test('daftar isi sidebar materi 13.1', () => {
  const items = buildToc(segs, { visualizers: [{ id: 'bellmanFord' }] })
  assert.deepEqual(items.filter((i) => i.level === 2).map((i) => i.text), [
    'A. Masalah Single-Source Shortest Path',
    'B. Algoritma Bellman-Ford',
    'C. Contoh Bellman-Ford',
    'D. Analisis Running Time',
    'E. Mencoba Visualisasi',
    'Visualisasi',
    'F. Rangkuman',
    'Soal Challenge',
  ])
})

test('pseudocode BELLMAN-FORD (8 baris), INITIALIZE-SINGLE-SOURCE (4), dan RELAX (3) sama dengan dokumen', () => {
  const blocks = []
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('```pseudocode')) {
      const close = lines.findIndex((l, k) => k > i && l.startsWith('```'))
      blocks.push(lines.slice(i + 1, close))
    }
  }
  assert.equal(blocks.length, 3)
  assert.deepEqual(blocks[0], PSEUDO_BF)
  assert.deepEqual(blocks[1], PSEUDO_INIT)
  assert.deepEqual(blocks[2], PSEUDO_RELAX)
  // judul slide "Langkah ..." menutup baris 1 sampai 8 berurutan (slide RELAX menjelaskan prosedur, bukan baris BELLMAN-FORD)
  const out = []
  for (const it of stepsBlocks[0].items) {
    const m = it.title.match(/^Langkah (\d+)(?: (sampai|dan) (\d+))?/)
    if (!m) continue
    const a = Number(m[1])
    const b = m[3] ? Number(m[3]) : a
    if (m[2] === 'sampai') for (let k = a; k <= b; k++) out.push(k)
    else out.push(a, ...(m[3] ? [b] : []))
  }
  assert.deepEqual(out, [1, 2, 3, 4, 5, 6, 7, 8])
  assert.ok(stepsBlocks[0].items.some((it) => it.title === 'Prosedur RELAX'))
})

test('contoh pengantar: tabel lintasan (a) dan (b), bobot 3/9/5/11, dan banyak lintasan sama pendek', () => {
  const rows = tablesAfter('| Tujuan | Lintasan pada (a)')[0]
  assert.equal(rows.length, 4)
  const asPath = (cell) => cell.split('\\to').map((x) => x.trim()).join('')
  const best = {}
  for (const v of ['t', 'x', 'y', 'z']) {
    const all = simplePaths('s', v, W2)
    best[v] = Math.min(...all.map((p) => p.cost))
  }
  assert.deepEqual(best, { t: 3, x: 9, y: 5, z: 11 })
  rows.forEach((r, i) => {
    const v = ['t', 'x', 'y', 'z'][i]
    assert.equal(r[0], v)
    for (const col of [1, 2]) {
      const p = asPath(r[col])
      const found = simplePaths('s', v, W2).find((x) => x.path === p)
      assert.ok(found, `lintasan ${p} ada di graf`)
      assert.equal(found.cost, best[v], `${p} adalah lintasan terpendek`)
    }
    assert.equal(Number(r[3]), best[v])
  })
  // klaim di teks: ke x ada 3 lintasan sama pendek, ke z ada 5
  assert.equal(simplePaths('s', 'x', W2).filter((p) => p.cost === 9).length, 3)
  assert.equal(simplePaths('s', 'z', W2).filter((p) => p.cost === 11).length, 5)
  assert.match(md, /ke \$x\$ ada tiga/)
  assert.match(md, /ke \$z\$ ada lima/)
  // gambar (a) dan (b) adalah pohon lintasan terpendek yang sah
  const d = { s: 0, ...best }
  const valid = (par) => Object.entries(par).every(([v, p]) => d[v] === d[p] + W2[p + v])
  assert.ok(valid({ t: 's', x: 't', y: 's', z: 'y' }), '(a)')
  assert.ok(valid({ t: 's', y: 't', x: 'y', z: 'x' }), '(b)')
})

test('siklus: c-d-c berbobot 3 (positif) dan e-f-e berbobot -3 (negatif), dan Bellman-Ford memberi FALSE', () => {
  assert.equal(W3.cd + W3.dc, 3)
  assert.equal(W3.ef + W3.fe, -3)
  assert.match(md, /\$6 \+ \(-3\) = 3\$ sehingga \*\*positif\*\*/)
  assert.match(md, /\$3 \+ \(-6\) = -3\$ sehingga \*\*negatif\*\*/)
  const names = ['s', 'a', 'b', 'c', 'd', 'e', 'f', 'g']
  const r = bellmanFord(names, Object.keys(W3), W3, 's')
  assert.equal(r.result, false)
})

test('daftar sisi contoh (10 sisi, urutan dokumen) sama dengan tabel di bagian C', () => {
  const rows = tablesAfter('| No | Sisi $(u,v)$')[0]
  assert.equal(rows.length, 10)
  rows.forEach((r, i) => {
    assert.equal(Number(r[0]), i + 1)
    assert.equal(r[1], pairText(ORDER[i]))
    assert.equal(Number(r[2]), W[ORDER[i]])
  })
  assert.equal(new Set(ORDER).size, 10)
})

test('4 tabel loop: perhitungan, nilai sebelum, dan kondisi RELAX sama dengan eksekusi Bellman-Ford', () => {
  const tabs = tablesAfter('| Sisi $(u,v)$ | $u.d + w(u,v)$ | $v.d$ sebelum')
  assert.equal(tabs.length, 4)
  tabs.forEach((rows, li) => {
    const L = BF.loops[li]
    assert.equal(rows.length, 10, `loop ${li + 1}`)
    rows.forEach((r, k) => {
      const x = L.rows[k]
      assert.equal(r[0], pairText(x.e), `loop ${li + 1} sisi ${k + 1}`)
      const calc = x.ud === INF ? `\\infty + ${wt(x.w)} = \\infty` : `${x.ud} + ${wt(x.w)} = ${x.cand}`
      assert.equal(r[1], calc, `loop ${li + 1} hitung ${pairText(x.e)}`)
      assert.equal(r[2], mi(x.vd), `loop ${li + 1} v.d ${pairText(x.e)}`)
      assert.equal(r[3], x.ok ? `true: ${x.v}.d = ${x.cand}, ${x.v}.\\pi = ${x.u}` : 'false', `loop ${li + 1} RELAX ${pairText(x.e)}`)
    })
  })
  // klaim dokumen: sisi yang bernilai true tiap loop
  const trues = BF.loops.map((L) => L.rows.filter((x) => x.ok).map((x) => x.e))
  assert.deepEqual(trues, [['st', 'sy'], ['tx', 'tz', 'yx'], ['xt'], ['tz']])
})

test('slide loop: kalimat "hanya untuk sisi" dan nilai hasil loop sama dengan eksekusi', () => {
  const items = stepsBlocks[1].items
  assert.deepEqual(items.map((i) => i.title), [
    'Langkah 1: inisialisasi',
    'Loop 1 (i = 1)',
    'Loop 2 (i = 2)',
    'Loop 3 (i = 3)',
    'Loop 4 (i = 4)',
    'Loop 5: end for',
    'Langkah 5 sampai 8: periksa siklus negatif',
  ])
  BF.loops.forEach((L, li) => {
    const body = items[li + 1].segments.map((x) => x.text ?? '').join('\n')
    const trues = L.rows.filter((x) => x.ok).map((x) => `$${pairText(x.e)}$`)
    const listed = trues.length === 1 ? trues[0] : `${trues.slice(0, -1).join(', ')}, dan ${trues.at(-1)}`
    assert.ok(body.includes(`*true* hanya untuk sisi ${listed}.`), `loop ${li + 1}: ${listed}`)
    const state = V.map((v) => `$${v}.d = ${mi(L.d[v])}$`).join(', ')
    assert.ok(body.includes(`Hasil loop ${li + 1}: ${state}.`), `hasil loop ${li + 1}`)
  })
  // kalimat penjelas yang memuat angka
  const b2 = items[2].segments.map((x) => x.text ?? '').join('\n')
  const x2 = BF.loops[1].rows.filter((r) => r.v === 'x' && r.ok)
  assert.deepEqual(x2.map((r) => r.cand), [11, 4], 'x.d berubah dua kali pada loop 2')
  assert.match(b2, /menjadi 11 oleh \$\(t,x\)\$, lalu menjadi 4 oleh \$\(y,x\)\$/)
  const b3 = items[3].segments.map((x) => x.text ?? '').join('\n')
  assert.equal(BF.loops[2].before.x + W.xt, 2)
  assert.equal(BF.loops[2].before.t, 6)
  assert.match(b3, /\$4 \+ \(-2\) = 2 < 6\$/)
  const b4 = items[4].segments.map((x) => x.text ?? '').join('\n')
  assert.equal(BF.loops[3].before.z, 2)
  assert.equal(BF.loops[3].before.t + W.tz, -2)
  assert.match(b4, /\$z\.d\$ turun dari 2 menjadi \$2 \+ \(-4\) = -2\$/)
})

test('pemeriksaan langkah 5 sampai 8: semua kondisi false sehingga return TRUE', () => {
  const rows = tablesAfter('| Sisi $(u,v)$ | $u.d + w(u,v)$ | $v.d$ | $v.d > u.d + w(u,v)$?')[0]
  assert.equal(rows.length, 10)
  rows.forEach((r, k) => {
    const c = BF.check[k]
    assert.equal(r[0], pairText(c.e))
    assert.equal(r[1], `${c.ud} + ${wt(c.w)} = ${c.cand}`)
    assert.equal(Number(r[2]), c.vd)
    assert.equal(r[3], 'false')
    assert.equal(c.bad, false)
  })
  assert.equal(BF.result, true)
  assert.match(stepsBlocks[1].items[6].segments.map((x) => x.text ?? '').join('\n'), /\$s\.d = 0\$, \$t\.d = 2\$, \$x\.d = 4\$, \$y\.d = 7\$, \$z\.d = -2\$/)
})

test('tabel nilai tiap loop dan tabel hasil lintasan sama dengan eksekusi dan dengan dokumen', () => {
  const hist = tablesAfter('| Sesudah | $s.d$')[0]
  assert.equal(hist.length, 5)
  assert.deepEqual(hist[0].slice(1), ['0', '\\infty', '\\infty', '\\infty', '\\infty'])
  BF.loops.forEach((L, li) => assert.deepEqual(hist[li + 1].slice(1), V.map((v) => mi(L.d[v])), `loop ${li + 1}`))
  assert.deepEqual(BF.d, { s: 0, t: 2, x: 4, y: 7, z: -2 }, 'nilai akhir di dokumen')
  const res = tablesAfter('| Tujuan | $v.d$ | $v.\\pi$')[0]
  assert.equal(res.length, 4)
  const docPath = { t: 'syxt', x: 'syx', y: 'sy', z: 'syxtz' }
  res.forEach((r, i) => {
    const v = ['t', 'x', 'y', 'z'][i]
    const p = pathTo(BF.pi, v)
    assert.equal(p.join(''), docPath[v], `lintasan ke ${v}`)
    assert.equal(r[0], v)
    assert.equal(Number(r[1]), BF.d[v])
    assert.equal(r[2], BF.pi[v])
    assert.equal(r[3], p.join(' \\to '))
    const ws = p.slice(1).map((x, k) => W[p[k] + x])
    assert.equal(r[4], `${ws.map(wt).join(' + ')} = ${ws.reduce((a, b) => a + b, 0)}`)
    assert.equal(ws.reduce((a, b) => a + b, 0), BF.d[v])
  })
})

test('urutan sisi bebas: hasil akhir sama untuk semua urutan, dan urutan sepanjang jalur selesai di loop 1', () => {
  // 2000 urutan acak (pengacak deterministik)
  let seed = 12345
  const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff)
  for (let n = 0; n < 2000; n++) {
    const o = [...ORDER]
    for (let i = o.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1))
      ;[o[i], o[j]] = [o[j], o[i]]
    }
    const r = bellmanFord(V, o, W, 's')
    assert.deepEqual(r.d, BF.d)
    assert.equal(r.result, true)
  }
  const onPath = ['sy', 'yx', 'xt', 'tz', ...ORDER.filter((e) => !['sy', 'yx', 'xt', 'tz'].includes(e))]
  const r = bellmanFord(V, onPath, W, 's')
  assert.deepEqual(r.loops[0].d, BF.d, 'semua nilai final setelah loop 1')
  assert.ok(r.loops.slice(1).every((L) => L.rows.every((x) => !x.ok)), 'loop 2 sampai 4 tidak mengubah apa pun')
  assert.match(md, /\$\(s,y\)\$, \$\(y,x\)\$, \$\(x,t\)\$, \$\(t,z\)\$/)
  assert.deepEqual(BF.loops.findIndex((L) => L.rows.some((x) => x.ok && x.v === 'z' && x.cand === -2)), 3, 'nilai final z baru tercapai di loop 4')
})

test('contoh siklus negatif kecil: nilai tiap loop dan sisi yang memicu FALSE', () => {
  const W4 = { sa: 1, ab: -3, ba: 1 }
  const r = bellmanFord(['s', 'a', 'b'], ['sa', 'ab', 'ba'], W4, 's')
  assert.equal(W4.ab + W4.ba, -2)
  assert.equal(r.result, false)
  assert.equal(r.badEdge, 'ab', 'sisi pertama yang memicu FALSE adalah (a,b)')
  assert.equal(r.check[0].bad, false, '(s,a) masih false')
  assert.equal(r.check[1].cand, -6)
  assert.equal(r.check[1].vd, -4)
  const rows = tablesAfter('| Sesudah | $a.d$ | $b.d$')[0]
  assert.deepEqual(rows[0].slice(1), ['\\infty', '\\infty'])
  r.loops.forEach((L, i) => assert.deepEqual(rows[i + 1].slice(1), [String(L.d.a), String(L.d.b)], `loop ${i + 1}`))
  assert.equal(r.loops.length, 2)
  // nilai terus turun walau loop ditambah (tidak pernah stabil)
  const more = bellmanFord(['s', 'a', 'b', 'c', 'd', 'e'], ['sa', 'ab', 'ba'], { ...W4 }, 's')
  const aLoops = more.loops.map((L) => L.d.a)
  assert.ok(aLoops.every((x, i) => i === 0 || x < aLoops[i - 1]), 'a.d turun di tiap loop')
  assert.match(md, /\$0 \+ 1 = 1\$ tidak kurang dari \$-3\$/)
  assert.match(md, /-3 \+ \(-3\) = -6\$ yang masih lebih kecil dari \$b\.d = -4\$/)
})

test('jawaban kuis cocok dengan eksekusi', () => {
  // A
  assert.match(right(0, 0), /total bobot sisi paling kecil/)
  assert.equal(right(0, 1), String(Math.min(...simplePaths('s', 'z', W2).map((p) => p.cost))))
  assert.equal(right(0, 3), 'Bellman-Ford')
  // B
  assert.equal(right(1, 0), `${V.length - 1} kali`)
  assert.equal(right(1, 1), '\\infty')
  assert.equal(right(1, 2), 'v.d > u.d + w(u,v)')
  assert.equal(right(1, 3), `Negatif, bobotnya ${4 + -7}`)
  assert.match(right(1, 4), /siklus bernilai negatif/)
  // C
  assert.equal(right(2, 0), BF.loops[0].rows.filter((x) => x.ok).map((x) => pairText(x.e)).join(' dan '))
  assert.equal(right(2, 1), String(BF.loops[1].d.x))
  assert.equal(BF.loops[2].before.t, 6)
  assert.equal(BF.loops[2].d.t, 2)
  assert.match(right(2, 2), /x\.d = 4/)
  assert.equal(right(2, 3), `return TRUE, z.d = ${BF.d.z}`)
  assert.match(right(2, 4), /b\.d > a\.d \+ w\(a,b\)/)
  // D
  assert.equal(right(3, 0), '\\Theta(VE)')
  assert.equal(right(3, 1), '\\lvert E \\rvert + 1 kali')
  assert.equal(right(3, 2), String((V.length - 1) * ORDER.length))
  // pilihan jawaban benar tersebar, bukan selalu di posisi yang sama
  const pos = quizzes.flatMap((q) => q.questions.map((qq) => qq.options.findIndex((o) => o.correct)))
  assert.ok(new Set(pos).size === 3, `posisi jawaban benar bervariasi: ${pos}`)
})

test('running time: banyak pembacaan tiap baris pada contoh sama dengan hasil menghitung langsung', () => {
  const n = V.length
  const m = ORDER.length
  // hitung langsung dari bentuk pseudocode (hasil TRUE)
  const c = { init1: 0, b2: 0, b3: 0, relax: 0, b5: 0, b6: 0, b7: 0, b8: 0 }
  for (let k = 0; k < n; k++) c.init1++
  c.init1++ // pemeriksaan akhir for each vertex
  for (let i = 1; i <= n - 1; i++) {
    c.b2++
    for (let e = 0; e < m; e++) {
      c.b3++
      c.relax++
    }
    c.b3++
  }
  c.b2++
  for (let e = 0; e < m; e++) {
    c.b5++
    c.b6++
  }
  c.b5++
  c.b8++
  const rows = tablesAfter('| Baris yang dibaca | Rumus | Contoh |')[0]
  assert.equal(rows.length, 8)
  const exp = [c.init1, c.b2, c.b3, c.relax, c.b5, c.b6, c.b7, c.b8]
  rows.forEach((r, i) => assert.equal(Number(r.at(-1)), exp[i], r[0]))
  assert.deepEqual(exp, [6, 5, 44, 40, 11, 10, 0, 1])
  assert.equal(c.b3, (n - 1) * (m + 1))
  assert.equal(c.relax, (n - 1) * m)
  // BF pada graf contoh benar-benar memanggil RELAX sebanyak itu
  assert.equal(BF.loops.reduce((s, L) => s + L.rows.length, 0), c.relax)
})

test('gambar: 11 gambar ada dengan teks alternatif, dan nilai pada gambar loop sama dengan eksekusi', () => {
  const refs = [...md.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)].map((m) => ({ alt: m[1], src: m[2] }))
  assert.equal(refs.length, 11)
  for (const { alt, src } of refs) {
    assert.ok(src.startsWith('/materi/bellman-ford/'), src)
    assert.ok(existsSync(join(root, 'public', src)), `berkas ${src} tidak ada`)
    assert.ok(alt.length > 60, `teks alternatif ${src} terlalu pendek`)
  }
  assert.equal(new Set(refs.map((r) => r.src)).size, refs.length, 'tidak ada gambar ganda')
  const byName = Object.fromEntries(refs.map((r) => [r.src.split('/').at(-1), r.alt]))
  const fmt = (x) => (x === INF ? '∞' : String(x).replace('-', '−'))
  const states = [{ d: { s: 0, t: INF, x: INF, y: INF, z: INF }, pi: {} }, ...BF.loops]
  states.forEach((L, i) => {
    const alt = byName[`bf-0${i}.png`]
    assert.ok(alt.includes(`Nilai d: ${V.map((v) => `${v} = ${fmt(L.d[v])}`).join(', ')}.`), `bf-0${i}: ${alt}`)
    const thick = V.filter((v) => L.pi[v]).map((v) => `${L.pi[v]}→${v}`)
    if (thick.length) for (const t of thick) assert.ok(alt.includes(t), `bf-0${i} memuat sisi tebal ${t}`)
    else assert.match(alt, /belum ada sisi tebal|Belum ada sisi tebal/i)
  })
  // alt gambar pengantar memuat semua sisi dan bobotnya
  const alt0 = byName['graf-sssp.png']
  for (const [e, w] of Object.entries(W2)) assert.ok(alt0.includes(`${e[0]} ke ${e[1]} ${w}`), `sisi ${e}`)
  const altC = byName['contoh-graf.png']
  for (const [e, w] of Object.entries(W)) assert.ok(altC.includes(`${e[0]} ke ${e[1]} ${String(w).replace('-', '−')}`), `sisi ${e}`)
  const altS = byName['siklus.png']
  for (const [e, w] of Object.entries(W3)) assert.ok(altS.includes(`${e[0]} ke ${e[1]} ${String(w).replace('-', '−')}`), `sisi ${e}`)
})

test('catatan visualizer: nomor 0 sampai 4, urutan materi menghasilkan hasil yang sama, siklus negatif memberi null', () => {
  const fn = new Function(`${bellmanFordCode}\nreturn bellmanFord`)()
  const names = 'stxyz'
  const idx = (c) => names.indexOf(c)
  const fromText = (text) => text.split(',').map((t) => {
    const m = t.trim().match(/^(\d)>(\d):(-?\d+)$/)
    return [Number(m[1]), Number(m[2]), Number(m[3])]
  })
  // urutan bagian C ditulis di catatan
  const orderText = md.match(/`(1>2:5[^`]*)`/)[1]
  const edges = fromText(orderText)
  assert.deepEqual(edges, ORDER.map((e) => [idx(e[0]), idx(e[1]), W[e]]), 'urutan di catatan = urutan sisi dokumen')
  assert.deepEqual(fn(5, edges, 0), [0, 2, 4, 7, -2])
  assert.match(md, /\$\(s,t\)\$ ditulis `0>1:6` dan \$\(z,s\)\$ ditulis `4>0:2`/)
  // preset bawaan: urutan berbeda, hasil sama
  const viz = visualizers.bellmanFord
  const pre = viz.presets.find((p) => p.label === 'Bobot negatif tanpa siklus negatif').value
  assert.deepEqual(fn(pre.n, pre.edges, pre.start), [0, 2, 4, 7, -2])
  assert.notDeepEqual(pre.edges, edges, 'preset memakai urutan sisi lain')
  assert.equal(pre.edges[0][0], 0, 'preset menulis sisi dari s lebih dulu')
  // siklus negatif: preset = contoh kecil di bagian C
  const neg = viz.presets.find((p) => p.label.startsWith('Siklus negatif')).value
  assert.deepEqual(neg.edges, fromText(md.match(/`(0>1:1[^`]*)`/)[1]))
  assert.equal(fn(neg.n, neg.edges, neg.start), null)
  // kode berhenti lebih awal, dan batas bobot -9 sampai 99
  assert.ok(bellmanFordCode.includes('if (!berubah) break'))
  assert.match(viz.inputHint, /−9 sampai 99/)
  assert.match(md, /dari \$-9\$ sampai 99/)
})

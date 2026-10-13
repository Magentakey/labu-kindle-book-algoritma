import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { traces, runTrace } from './traces.js'
import { MST_MAX_EDGES, MST_MAX_VERTICES } from './traces/mstCommon.js'
import { kruskalPseudoCode } from './traces/kruskalPseudo.js'
import { primPseudoCode } from './traces/primPseudo.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const material = readFileSync(join(root, 'src/content/materials/mst.md'), 'utf8')
const K = traces['mst-kruskal']
const P = traces['mst-prim']
const kInput = (id = 0) => ({ V: K.inputs[0].value, E: K.presets[id].values.E })
const runK = (V, E) => {
  const r = runTrace(K, { V, E })
  assert.ok(r.ok, r.error)
  return r.steps
}
const runP = (G, r0) => {
  const r = runTrace(P, { G, r: r0 })
  assert.ok(r.ok, r.error)
  return r.steps
}
const failK = (V, E) => {
  const r = runTrace(K, { V, E })
  assert.equal(r.ok, false, `seharusnya ditolak: ${V} | ${E}`)
  return r.error
}
const failP = (G, r0 = 'a') => {
  const r = runTrace(P, { G, r: r0 })
  assert.equal(r.ok, false, `seharusnya ditolak: ${G}`)
  return r.error
}
const varOf = (step, name) => step.vars.find((v) => v.name === name).value
const listOf = (step, start) => step.lists.find((l) => l.title.startsWith(start))

const V9 = 'abcdefghi'.split('')
const EXAMPLE_E = K.presets[0].values.E
const PRIM_EXAMPLE = P.presets[0].values.G

// ---------------------------------------------------------------- pembanding independen
/** Kruskal persis seperti pseudocode. Mengembalikan urutan baris, sisi yang diterima, dan himpunan setelah tiap sisi. */
function kruskalRef(names, edges) {
  const lines = [1, 2, 3, 4]
  const sorted = [...edges].sort((p, q) => p[2] - q[2])
  const set = Object.fromEntries(names.map((x) => [x, new Set([x])]))
  const accepted = []
  const comps = []
  for (const [u, v] of sorted) {
    lines.push(5, 6)
    if (set[u] !== set[v]) {
      lines.push(7, 8)
      accepted.push(u + v)
      const merged = new Set([...set[u], ...set[v]])
      for (const x of merged) set[x] = merged
    }
    comps.push([...new Set(names.map((x) => [...set[x]].sort().join('')))].sort())
  }
  lines.push(5, 9)
  const total = accepted.length ? sorted.filter(([u, v]) => accepted.includes(u + v)).reduce((s, e) => s + e[2], 0) : 0
  return { lines, sorted, accepted, comps, total }
}

/** Prim persis seperti pseudocode. Seri EXTRACT-MIN diputus menurut urutan Q (urutan names). */
function primRef(names, adj, r0) {
  const key = Object.fromEntries(names.map((x) => [x, Infinity]))
  const pi = Object.fromEntries(names.map((x) => [x, null]))
  key[r0] = 0
  const Q = [...names]
  const lines = [1, 2, 3, 4, 5]
  const loops = []
  let updates = 0
  while (Q.length) {
    lines.push(6)
    const m = Math.min(...Q.map((x) => key[x]))
    const u = Q.find((x) => key[x] === m)
    Q.splice(Q.indexOf(u), 1)
    lines.push(7)
    const upd = []
    for (const { v, w } of adj[u]) {
      lines.push(8)
      if (Q.includes(v) && w < key[v]) {
        lines.push(9, 10, 11)
        upd.push([v, w])
        key[v] = w
        pi[v] = u
        updates++
      } else lines.push(9)
    }
    lines.push(8)
    loops.push({ u, key: m, upd, keys: { ...key } })
  }
  lines.push(6)
  return { lines, loops, key, pi, updates, total: names.reduce((s, x) => s + key[x], 0) }
}

/** Graf terhubung acak: pohon acak ditambah sisi acak. Bobot kecil supaya sering seri. */
function randomGraph(maxW = 6) {
  const n = 2 + Math.floor(Math.random() * (MST_MAX_VERTICES - 1))
  const names = 'abcdefghi'.split('').slice(0, n)
  const edges = []
  const has = (a, b) => edges.some(([p, q]) => (p === a && q === b) || (p === b && q === a))
  for (let i = 1; i < n; i++) edges.push([names[Math.floor(Math.random() * i)], names[i], Math.floor(Math.random() * (maxW + 1))])
  for (let a = 0; a < n; a++) {
    for (let b = a + 1; b < n; b++) {
      if (edges.length < MST_MAX_EDGES && Math.random() < 0.3 && !has(names[a], names[b])) edges.push([names[a], names[b], Math.floor(Math.random() * (maxW + 1))])
    }
  }
  // acak urutan penulisan dan arah sisi
  edges.sort(() => Math.random() - 0.5)
  return { names, edges: edges.map(([u, v, w]) => (Math.random() < 0.5 ? [u, v, w] : [v, u, w])) }
}
const toE = (edges) => edges.map(([u, v, w]) => `${u}-${v}:${w}`).join(', ')
const toAdj = (names, edges) => {
  const adj = Object.fromEntries(names.map((x) => [x, []]))
  for (const [u, v, w] of edges) {
    adj[u].push({ v, w })
    adj[v].push({ v: u, w })
  }
  for (const x of names) adj[x].sort(() => Math.random() - 0.5)
  return adj
}
const adjText = (names, adj) => names.map((x) => `${x}: ${adj[x].map((a) => `${a.v}(${a.w})`).join(', ')}`).join('; ')

// ---------------------------------------------------------------- Kruskal
test('Kruskal: pseudocode peraga sama persis dengan blok pseudocode Kruskal di materi 12', () => {
  const blocks = [...material.matchAll(/```pseudocode\n([\s\S]*?)\n```/g)].map((m) => m[1])
  assert.equal(blocks[0], kruskalPseudoCode)
  assert.equal(blocks[1], primPseudoCode)
})

test('Kruskal: contoh materi menerima 8 sisi yang sama dengan tabel dokumen, total 37, dalam 50 langkah', () => {
  const steps = runK(K.inputs[0].value, EXAMPLE_E)
  assert.equal(steps.length, 50)
  const ref = kruskalRef(V9, [...EXAMPLE_E.split(', ')].map((t) => [t[0], t[2], Number(t.slice(4))]))
  assert.deepEqual(steps.map((s) => s.line), ref.lines)
  assert.deepEqual(ref.accepted, ['hg', 'ci', 'gf', 'ab', 'cf', 'cd', 'bc', 'de'])
  assert.equal(ref.total, 37)
  const last = steps.at(-1)
  assert.match(last.note, /total bobot 37/)
  assert.match(last.note, /A = \{\(h, g\), \(c, i\), \(g, f\), \(a, b\), \(c, f\), \(c, d\), \(b, c\), \(d, e\)\}/)
  assert.equal(varOf(last, '|A|'), '8')
  assert.equal(varOf(last, 'total bobot A'), '37')
})

test('Kruskal: himpunan terpisah setelah tiap sisi sama dengan kolom UNION di dokumen', () => {
  const steps = runK(K.inputs[0].value, EXAMPLE_E)
  const sets = (s) => listOf(s, 'Himpunan terpisah').items.map((x) => x.replace(/[{}, ]/g, '').split('').sort().join('')).sort()
  // Langkah tepat sebelum tiap pembacaan baris 5 berikutnya (termasuk pemeriksaan akhir) menandai akhir pemrosesan satu sisi.
  const endOf = []
  steps.forEach((s, i) => {
    if (i > 3 && s.line === 5 && steps[i - 1].line !== 4) endOf.push(steps[i - 1])
  })
  assert.equal(endOf.length, 14)
  assert.deepEqual(sets(endOf[0]), ['a', 'b', 'c', 'd', 'e', 'f', 'gh', 'i'])
  assert.deepEqual(sets(endOf[2]), ['a', 'b', 'ci', 'd', 'e', 'fgh'].sort())
  assert.deepEqual(sets(endOf[4]), ['ab', 'cfghi', 'd', 'e'].sort())
  assert.deepEqual(sets(endOf[5]), ['ab', 'cfghi', 'd', 'e'].sort(), '(g,i) ditolak: himpunan tidak berubah')
  assert.deepEqual(sets(endOf[8]), ['abcdfghi', 'e'].sort())
  assert.deepEqual(sets(endOf[10]), ['abcdefghi'])
})

test('Kruskal: urutan seperti gambar buku menerima (a,h) dan menolak (b,c), total tetap 37', () => {
  const steps = runK(K.inputs[0].value, kInput(1).E)
  const last = steps.at(-1)
  assert.match(last.note, /\(a, h\)/)
  assert.doesNotMatch(last.note, /\(b, c\)/)
  assert.match(last.note, /total bobot 37/)
  const sortedNote = steps.find((s) => s.line === 4).note
  assert.ok(sortedNote.indexOf('(a, h) = 8') < sortedNote.indexOf('(b, c) = 8'), 'pengurutan stabil: (a,h) ditulis lebih dulu')
})

test('Kruskal: sisi ditolak ditandai FALSE, tabel sisi memakai tanda diterima dan ditolak', () => {
  const steps = runK(K.inputs[0].value, EXAMPLE_E)
  const gi = steps.find((s) => s.line === 6 && /\(g, i\)|FIND-SET\(g\)/.test(s.note) && /FIND-SET\(i\)/.test(s.note))
  assert.match(gi.note, /FIND-SET\(g\) = \{c, f, g, h, i\} dan FIND-SET\(i\) = \{c, f, g, h, i\}/)
  assert.match(gi.note, /FALSE/)
  assert.match(gi.note, /siklus/)
  const cells = gi.tables[0].table.cells
  assert.equal(cells.filter((c) => c[1].text === 'ditolak').length, 1, 'baru satu sisi ditolak')
  assert.equal(cells.filter((c) => c[1].text === 'diterima').length, 5)
  assert.equal(gi.tables[0].table.rowHeaders[5], '(g, i)')
  assert.deepEqual(gi.tables[0].legend, ['empty', 'current', 'path', 'unused'])
  // tabel sisi baru muncul setelah baris 4 (sebelum diurutkan belum ada)
  assert.ok(steps.slice(0, 3).every((s) => !s.tables))
  assert.ok(steps.slice(3).every((s) => s.tables))
})

test('Kruskal: 300 graf acak: hasil, total, urutan baris, dan jumlah langkah 2m + 2n + 4', () => {
  for (let t = 0; t < 300; t++) {
    const { names, edges } = randomGraph()
    const steps = runK(names.join(', '), toE(edges))
    const ref = kruskalRef(names, edges)
    const info = `${names.join('')} ${toE(edges)}`
    assert.deepEqual(steps.map((s) => s.line), ref.lines, info)
    assert.equal(steps.length, 2 * edges.length + 2 * names.length + 4, info)
    assert.equal(ref.accepted.length, names.length - 1, info)
    assert.equal(varOf(steps.at(-1), 'total bobot A'), String(ref.total), info)
    assert.equal(listOf(steps.at(-1), 'Himpunan terpisah').items.length, 1, info)
    for (const s of steps) {
      assert.ok(s.note.startsWith(`Baris ${s.line}`), s.note)
      assert.ok(s.lists.length >= 1 && s.vars.length === 7)
    }
  }
})

test('Kruskal: isian yang salah ditolak dengan pesan yang menyebut sebabnya', () => {
  assert.match(failK('', 'a-b:1'), /V tidak boleh kosong/)
  assert.match(failK('a', 'a-b:1'), /minimal 2 simpul/)
  assert.match(failK('a, a, b', 'a-b:1'), /lebih dari satu kali/)
  assert.match(failK('abc, d', 'd-d:1'), /1 sampai 2 huruf atau angka/)
  assert.match(failK('a, b', ''), /E tidak boleh kosong/)
  assert.match(failK('a, b', 'a b 1'), /belum benar/)
  assert.match(failK('a, b', 'a-c:1'), /simpul c .* tidak ada di V/)
  assert.match(failK('a, b', 'a-a:1'), /dengan dirinya sendiri/)
  assert.match(failK('a, b', 'a-b:100'), /belum benar|antara 0 dan 99/)
  assert.match(failK('a, b', 'a-b:1, b-a:2'), /lebih dari satu kali/)
  assert.match(failK('a, b, c', 'a-b:1'), /terhubung.*c tidak terjangkau/)
  const ten = Array.from({ length: MST_MAX_VERTICES + 1 }, (_, i) => `n${i}`)
  assert.match(failK(ten.join(', '), 'n0-n1:1'), new RegExp(`maksimal ${MST_MAX_VERTICES} simpul`))
  const many = Array.from({ length: MST_MAX_EDGES + 1 }, (_, i) => `a-b:${i}`).join(', ')
  assert.match(failK('a, b', many), new RegExp(`maksimal ${MST_MAX_EDGES} sisi`))
})

test('Kruskal: semua bobot sama menghasilkan total 2 dan tabel tanpa kesalahan', () => {
  const steps = runK('a, b, c', 'a-b:1, b-c:1, a-c:1')
  assert.equal(varOf(steps.at(-1), 'total bobot A'), '2')
  assert.equal(steps.filter((s) => s.line === 7).length, 2)
})

// ---------------------------------------------------------------- Prim
test('Prim: contoh materi (akar a) memberi urutan extract, key tiap putaran, dan total 37, dalam 113 langkah', () => {
  const steps = runP(PRIM_EXAMPLE, 'a')
  assert.equal(steps.length, 113)
  const extracted = steps.filter((s) => s.line === 7).map((s) => varOf(s, 'u'))
  assert.deepEqual(extracted, 'abcifghde'.split(''))
  // nilai key di akhir tiap putaran (langkah baris 8 saat for selesai) = panel (a) sampai (i) di dokumen
  const ends = steps.filter((s) => s.line === 8 && /end for|kosong/.test(s.note))
  assert.equal(ends.length, 9)
  const keysOf = (s) => Object.fromEntries(s.tables[0].table.rowHeaders.map((x, i) => [x, s.tables[0].table.cells[i][0].text]))
  assert.deepEqual(keysOf(ends[0]), { a: '0', b: '4', c: '∞', d: '∞', e: '∞', f: '∞', g: '∞', h: '8', i: '∞' })
  assert.deepEqual(keysOf(ends[1]), { a: '0', b: '4', c: '8', d: '∞', e: '∞', f: '∞', g: '∞', h: '8', i: '∞' })
  assert.deepEqual(keysOf(ends[2]), { a: '0', b: '4', c: '8', d: '7', e: '∞', f: '4', g: '∞', h: '8', i: '2' })
  assert.deepEqual(keysOf(ends[3]), { a: '0', b: '4', c: '8', d: '7', e: '∞', f: '4', g: '6', h: '7', i: '2' })
  assert.deepEqual(keysOf(ends[4]), { a: '0', b: '4', c: '8', d: '7', e: '10', f: '4', g: '2', h: '7', i: '2' })
  assert.deepEqual(keysOf(ends[5]), { a: '0', b: '4', c: '8', d: '7', e: '10', f: '4', g: '2', h: '1', i: '2' })
  assert.deepEqual(keysOf(ends[7]), { a: '0', b: '4', c: '8', d: '7', e: '9', f: '4', g: '2', h: '1', i: '2' })
  const last = steps.at(-1)
  assert.match(last.note, /total bobot 37/)
  assert.deepEqual(listOf(last, 'Pohon rentang minimum').items.sort(), ['(a, b) = 4', '(b, c) = 8', '(c, d) = 7', '(c, f) = 4', '(c, i) = 2', '(d, e) = 9', '(f, g) = 2', '(g, h) = 1'].sort())
})

test('Prim: seri key di putaran 3 (c dan h sama-sama 8) diputus menurut urutan Q', () => {
  const steps = runP(PRIM_EXAMPLE, 'a')
  const tie = steps.filter((s) => s.line === 7 && /sama-sama bernilai/.test(s.note))
  assert.equal(tie.length, 1)
  assert.match(tie[0].note, /c dan h sama-sama bernilai 8; yang dikeluarkan adalah c karena lebih dulu dalam urutan Q/)
  assert.equal(varOf(tie[0], 'u'), 'c')
  // h.key turun 8 → 7 → 1, dan sisi tebal (a,h) digantikan (i,h) lalu (g,h)
  const h10 = steps.filter((s) => s.line === 10 && s.note.includes('h.π'))
  assert.equal(h10.length, 3)
  assert.match(h10[0].note, /^Baris 10: h\.π = a\. Sisi \(a, h\) menjadi sisi tebal\.$/)
  assert.match(h10[1].note, /h\.π = i\. .*menggantikan sisi \(a, h\)/)
  assert.match(h10[2].note, /h\.π = g\. .*menggantikan sisi \(i, h\)/)
  const h11 = steps.filter((s) => s.line === 11 && s.note.includes('h.key')).map((s) => s.note)
  assert.match(h11[1], /h\.key = w\(i, h\) = 7 \(sebelumnya 8\)/)
  assert.match(h11[2], /h\.key = w\(g, h\) = 1 \(sebelumnya 7\)/)
})

test('Prim: tabel atribut menandai simpul di Q, yang sudah di-extract, u, dan v', () => {
  const steps = runP(PRIM_EXAMPLE, 'a')
  const marks = (s) => s.tables[0].table.cells.map((row) => row[0].mark)
  assert.deepEqual(marks(steps[4]), Array(9).fill('empty'), 'baris 5: semua masih di Q')
  const s8 = steps.find((s) => s.line === 8 && /v = b/.test(s.note))
  assert.deepEqual(marks(s8), ['current', 'source', ...Array(7).fill('empty')], 'u = a dan v = b')
  assert.equal(varOf(s8, 'w(u, v)'), '4')
  assert.match(listOf(s8, 'Tetangga a').items[0], /← sedang diperiksa/)
  const s9 = steps.find((s) => s.line === 9 && /Baris 9: a ∈ Q|Baris 9: b ∈ Q/.test(s.note))
  assert.ok(s9)
  const afterA = steps.find((s) => s.line === 6 && /putaran ke-2/.test(s.note))
  assert.equal(marks(afterA)[0], 'black', 'a sudah keluar dari Q')
  assert.deepEqual(afterA.tables[0].legend, ['empty', 'black', 'current', 'source'])
  assert.equal(varOf(afterA, 'u'), '–', 'u dikosongkan di baris 6')
})

test('Prim: akar e pada graf contoh tetap menghasilkan total 37 dan e di-extract pertama', () => {
  const steps = runP(PRIM_EXAMPLE, 'e')
  assert.equal(varOf(steps.find((s) => s.line === 7), 'u'), 'e')
  assert.match(steps.at(-1).note, /total bobot 37/)
})

test('Prim: 300 graf acak dengan akar dan urutan tetangga acak: urutan baris, jumlah langkah, dan total sama dengan Kruskal', () => {
  for (let t = 0; t < 300; t++) {
    const { names, edges } = randomGraph(9)
    const adj = toAdj(names, edges)
    const r0 = names[Math.floor(Math.random() * names.length)]
    const steps = runP(adjText(names, adj), r0)
    const ref = primRef(names, adj, r0)
    const info = `${adjText(names, adj)} r=${r0}`
    assert.deepEqual(steps.map((s) => s.line), ref.lines, info)
    const D = names.reduce((s, x) => s + adj[x].length, 0)
    assert.equal(steps.length, 6 + 3 * names.length + 2 * D + 2 * ref.updates, info)
    assert.deepEqual(steps.filter((s) => s.line === 7).map((s) => varOf(s, 'u')), ref.loops.map((l) => l.u), info)
    assert.equal(ref.total, kruskalRef(names, edges).total, `Prim = Kruskal: ${info}`)
    assert.match(steps.at(-1).note, new RegExp(`total bobot ${ref.total}\\b`), info)
    for (const s of steps) {
      assert.ok(s.note.startsWith(`Baris ${s.line}`), s.note)
      assert.equal(s.vars.length, 6)
      assert.equal(s.tables[0].table.cells.length, names.length)
    }
  }
})

test('Prim: isian yang salah ditolak dengan pesan yang menyebut sebabnya', () => {
  assert.match(failP(''), /Isian G: .*tidak boleh kosong/)
  assert.match(failP('a: b(1)'), /minimal 2 simpul/)
  assert.match(failP('a b(1); b: a(1)'), /titik dua/)
  assert.match(failP('a: b; b: a(1)'), /belum benar.*b\(4\)/)
  assert.match(failP('a: c(1); b: a(1)'), /bukan simpul di G/)
  assert.match(failP('a: a(1); b:'), /dirinya sendiri/)
  assert.match(failP('a: b(1), b(2); b: a(1)'), /dua kali/)
  assert.match(failP('a: b(1); a: b(1); b: a(1)'), /lebih dari satu kali/)
  assert.match(failP('abc: ; d:'), /1 sampai 2 huruf atau angka/)
  assert.match(failP('a: b(1); b:'), /hanya tercatat di daftar a.*b: a\(1\)|tulis juga a\(1\) pada daftar b/)
  assert.match(failP('a: b(1); b: a(2)'), /Bobot sisi \(a, b\) berbeda: 1 pada daftar a, tetapi 2 pada daftar b/)
  assert.match(failP('a: ; b: ; c: a(1)'), /hanya tercatat|bukan|terhubung/)
  assert.match(failP('a: b(1); b: a(1); c:'), /terhubung.*c tidak terjangkau/)
  assert.match(failP('a: b(1); b: a(1)', 'z'), /Akar r = z tidak ada di G.*a, b/)
  const ten = Array.from({ length: MST_MAX_VERTICES + 1 }, (_, i) => `n${i}:`).join('; ')
  assert.match(failP(ten), new RegExp(`Maksimal ${MST_MAX_VERTICES} simpul`))
  assert.match(failP('a: b(100); b: a(100)'), /belum benar|antara 0 dan 99/)
})

test('Prim: urutan penulisan tetangga dan spasi sebelum kurung tidak mengubah hasil', () => {
  const steps = runP('a: b (4), c (2); b: a (4), c (1); c: b (1), a (2)', 'a')
  assert.equal(varOf(steps.find((s) => s.line === 7), 'u'), 'a')
  assert.match(steps.at(-1).note, /total bobot 3\b/)
})

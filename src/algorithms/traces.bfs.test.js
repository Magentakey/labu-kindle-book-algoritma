import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { traces, runTrace } from './traces.js'
import { BFS_MAX_ENTRIES, BFS_MAX_VERTICES, bfsPseudoCode, parseAdjacencyInput } from './traces/bfsPseudo.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const material = readFileSync(join(root, 'src/content/materials/graph-bfs.md'), 'utf8')
const def = traces.bfs
const run = (G, s) => {
  const r = runTrace(def, { G, s })
  assert.ok(r.ok, r.error)
  return r.steps
}
const fail = (G, s) => {
  const r = runTrace(def, { G, s })
  assert.equal(r.ok, false, `seharusnya ditolak: ${G} / ${s}`)
  return r.error
}

const EXAMPLE = 's: w, r; r: s, v; t: u, w, x; u: t, x, y; v: r; w: s, t, x; x: t, u, y, w; y: x, u'

/** Pembanding independen: menjalankan pseudocode apa adanya dan mencatat nomor baris, Q, serta atribut. */
function reference(adj, names, s) {
  const lines = []
  const color = {}
  const d = {}
  const pi = {}
  const Q = []
  const out = []
  const snap = () => ({ Q: [...Q] })
  const snaps = []
  const log = (line) => {
    lines.push(line)
    snaps.push(snap())
  }
  // baris 1 sampai 4 ditampilkan ringkas (sekali untuk semua simpul)
  log(1)
  for (const x of names) if (x !== s) color[x] = 'WHITE'
  log(2)
  for (const x of names) if (x !== s) d[x] = Infinity
  log(3)
  for (const x of names) if (x !== s) pi[x] = null
  log(4)
  color[s] = 'GRAY'
  log(5)
  d[s] = 0
  log(6)
  pi[s] = null
  log(7)
  log(8)
  Q.push(s)
  log(9)
  while (true) {
    log(10)
    if (Q.length === 0) break
    const u = Q.shift()
    out.push(u)
    log(11)
    for (const v of adj[u]) {
      log(12)
      log(13)
      if (color[v] === 'WHITE') {
        color[v] = 'GRAY'
        log(14)
        d[v] = d[u] + 1
        log(15)
        pi[v] = u
        log(16)
        Q.push(v)
        log(17)
      }
    }
    log(12)
    color[u] = 'BLACK'
    log(18)
  }
  return { lines, snaps, color, d, pi, out }
}

const NAMES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
function randomGraph() {
  const n = 1 + Math.floor(Math.random() * 8)
  const names = NAMES.slice(0, n)
  const adj = {}
  for (const x of names) {
    const pool = [...names].sort(() => Math.random() - 0.5)
    adj[x] = pool.slice(0, Math.floor(Math.random() * Math.min(4, n + 1)))
  }
  const G = names.map((x) => `${x}: ${adj[x].join(', ')}`).join('; ')
  return { names, adj, G, s: names[Math.floor(Math.random() * n)] }
}
const cellsOf = (step) => step.tables[0].table.cells.map((row) => row.map((c) => c.text))
const qOf = (step) => step.lists[0].items.map((t) => t.split(' ')[0])

test('BFS: pseudocode peraga sama persis dengan blok di materi 11.1', () => {
  const m = material.match(/```pseudocode\n([\s\S]*?)\n```/)
  assert.ok(m)
  assert.equal(m[1], bfsPseudoCode)
  assert.equal(bfsPseudoCode.split('\n').length, 18)
})

test('BFS: contoh materi, urutan keluar Q, d, π, dan lintasan sama dengan Gambar 3', () => {
  const steps = run(EXAMPLE, 's')
  const last = steps.at(-1)
  assert.equal(last.line, 10)
  assert.match(last.note, /urutan keluar dari Q: s, w, r, t, x, v, u, y/)
  const out = last.lists.find((l) => l.title.startsWith('Urutan')).items
  assert.deepEqual(out, ['s', 'w', 'r', 't', 'x', 'v', 'u', 'y'])
  const names = ['s', 'r', 't', 'u', 'v', 'w', 'x', 'y']
  const rows = Object.fromEntries(cellsOf(last).map((r, i) => [Object.keys(parseAdjacencyInput(EXAMPLE).adj)[i], r]))
  assert.deepEqual(rows, {
    s: ['BLACK', '0', 'NIL'], r: ['BLACK', '1', 's'], t: ['BLACK', '2', 'w'], u: ['BLACK', '3', 't'],
    v: ['BLACK', '2', 'r'], w: ['BLACK', '1', 's'], x: ['BLACK', '2', 'w'], y: ['BLACK', '3', 'x'],
  })
  assert.equal(names.length, 8)
  const path = last.lists.find((l) => l.title.startsWith('Lintasan')).items
  assert.ok(path.includes('y: s → w → x → y (d = 3)'))
  assert.ok(path.includes('v: s → r → v (d = 2)'))
  // Q sesudah tiap putaran (baris 17 terakhir tiap putaran atau baris 11) sama dengan panel Gambar 3
  const qAfterRound = []
  steps.forEach((st) => {
    if (st.line === 18) qAfterRound.push(qOf(st).join(','))
  })
  assert.deepEqual(qAfterRound, ['w,r', 'r,t,x', 't,x,v', 'x,v,u', 'v,u,y', 'u,y', 'y', ''])
  // jumlah langkah 6 + 8R + 2D, R = 8, D = 20
  assert.equal(steps.length, 6 + 8 * 8 + 2 * 20)
})

test('BFS: urutan baris dan isi Q cocok dengan eksekusi pseudocode apa adanya (300 graf acak)', () => {
  for (let t = 0; t < 300; t++) {
    const g = randomGraph()
    const ref = reference(g.adj, g.names, g.s)
    const steps = run(g.G, g.s)
    assert.deepEqual(steps.map((x) => x.line), ref.lines, g.G + ' / ' + g.s)
    steps.forEach((st, i) => assert.deepEqual(qOf(st), ref.snaps[i].Q, `Q langkah ${i + 1}: ${g.G}`))
    // banyak langkah
    const R = ref.out.length
    const D = ref.out.reduce((a, u) => a + g.adj[u].length, 0)
    assert.equal(steps.length, 6 + 8 * R + 2 * D)
    // hasil akhir
    const last = steps.at(-1)
    const rows = cellsOf(last)
    g.names.forEach((x, i) => {
      if (ref.d[x] === undefined || ref.d[x] === Infinity) {
        assert.deepEqual(rows[i], ['WHITE', '∞', 'NIL'], `${x} tak terjangkau`)
      } else {
        assert.deepEqual(rows[i], ['BLACK', String(ref.d[x]), ref.pi[x] ?? 'NIL'], `${x}`)
      }
    })
    assert.deepEqual(last.lists.find((l) => l.title.startsWith('Urutan')).items, ref.out)
  }
})

test('BFS: nilai hanya berubah di baris yang menurut pseudocode mengubahnya', () => {
  for (let t = 0; t < 100; t++) {
    const g = randomGraph()
    const steps = run(g.G, g.s)
    steps.forEach((st, i) => {
      if (i === 0) return
      const a = cellsOf(steps[i - 1])
      const b = cellsOf(st)
      const changed = (col) => a.some((row, r) => row[col] !== b[r][col])
      if (changed(0)) assert.ok([2, 5, 14, 18].includes(st.line), `color berubah di baris ${st.line}`)
      if (changed(1)) assert.ok([3, 6, 15].includes(st.line), `d berubah di baris ${st.line}`)
      if (changed(2)) assert.ok([4, 16].includes(st.line), `π berubah di baris ${st.line}`)
      const q0 = qOf(steps[i - 1]).join(',')
      const q1 = qOf(st).join(',')
      if (q0 !== q1) assert.ok([9, 11, 17].includes(st.line), `Q berubah di baris ${st.line}`)
    })
  }
})

test('BFS: jarak sama dengan jumlah busur lintasan terpendek (pembanding Floyd-Warshall, 200 graf)', () => {
  for (let t = 0; t < 200; t++) {
    const g = randomGraph()
    const INF = Infinity
    const dist = {}
    for (const x of g.names) {
      dist[x] = {}
      for (const y of g.names) dist[x][y] = x === y ? 0 : INF
      for (const y of g.adj[x]) if (y !== x) dist[x][y] = 1
    }
    for (const k of g.names) for (const i of g.names) for (const j of g.names) if (dist[i][k] + dist[k][j] < dist[i][j]) dist[i][j] = dist[i][k] + dist[k][j]
    const rows = cellsOf(run(g.G, g.s).at(-1))
    g.names.forEach((x, i) => assert.equal(rows[i][1], dist[g.s][x] === INF ? '∞' : String(dist[g.s][x]), `${g.G} / ${g.s} → ${x}`))
  }
})

test('BFS: contoh siap pakai dan catatan di materi cocok dengan peraga', () => {
  assert.equal(def.presets.length, 4)
  for (const p of def.presets) run(p.values.G, p.values.s)
  // Gambar 1 dari simpul 1: 2 dan 5 berjarak 1, 3 dan 4 berjarak 2
  const g1 = cellsOf(run(def.presets[1].values.G, '1').at(-1))
  assert.deepEqual(g1.map((r) => r[1]), ['0', '1', '2', '2', '1'])
  // Gambar 2 dari simpul 3: simpul 1 tidak terjangkau
  const g2 = cellsOf(run(def.presets[2].values.G, '3').at(-1))
  assert.deepEqual(g2.map((r) => r[1]), ['∞', '3', '0', '2', '1', '1'])
  assert.deepEqual(g2[0], ['WHITE', '∞', 'NIL'])
  // satu simpul
  const one = run('a:', 'a')
  assert.equal(one.length, 6 + 8 + 0)
  // isian awal = contoh materi
  assert.equal(def.inputs[0].value, EXAMPLE)
  assert.equal(def.inputs[1].value, 's')
  assert.equal(def.presets[0].values.G, EXAMPLE)
  // materi menyebut jumlah langkah contoh
  assert.equal(run(EXAMPLE, 's').length, 110)
})

test('BFS: isian yang salah ditolak dengan pesan yang menyebut sebabnya', () => {
  assert.match(fail('', 's'), /tidak boleh kosong/)
  assert.match(fail('s w, r', 's'), /titik dua/)
  assert.match(fail('s: x', 's'), /bukan simpul di G/)
  assert.match(fail('s: s; s:', 's'), /lebih dari satu kali/)
  assert.match(fail('s: w, w; w:', 's'), /dua kali/)
  assert.match(fail('abc: ; d:', 'd'), /1 sampai 2 huruf atau angka/)
  assert.match(fail('s: w; w:', 'z'), /tidak ada di G/)
  assert.match(fail('s: w; w:', ''), /tidak boleh kosong/)
  const nine = Array.from({ length: BFS_MAX_VERTICES + 1 }, (_, i) => `n${i}:`).join('; ')
  assert.match(fail(nine, 'n0'), new RegExp(`Maksimal ${BFS_MAX_VERTICES} simpul`))
  const names = Array.from({ length: 8 }, (_, i) => `n${i}`)
  const many = names.map((x) => `${x}: ${names.filter((y) => y !== x).slice(0, 5).join(', ')}`).join('; ')
  assert.match(fail(many, 'n0'), new RegExp(`maksimal ${BFS_MAX_ENTRIES}`))
})

test('BFS: simpul awal ikut tabel, dan tabel bertanda u dan v pada baris yang tepat', () => {
  const steps = run(EXAMPLE, 's')
  const marks = (st) => st.tables[0].table.cells.map((r) => r[0].mark)
  const names = parseAdjacencyInput(EXAMPLE).names
  const step11 = steps.find((s) => s.line === 11)
  assert.equal(marks(step11)[names.indexOf('s')], 'current')
  const step12 = steps.find((s) => s.line === 12)
  assert.equal(marks(step12)[names.indexOf('w')], 'source')
  assert.equal(marks(step12)[names.indexOf('s')], 'current')
  // setelah baris 18, simpul u hitam dan tidak lagi bertanda current
  const first18 = steps.find((s) => s.line === 18)
  assert.equal(marks(first18)[names.indexOf('s')], 'black')
  assert.equal(first18.vars.find((v) => v.name === 'u').value, 's')
})

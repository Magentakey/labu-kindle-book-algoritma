// Tes empat peraga langkah konsep (Modul 09, 10, 13, 16). Hasil peraga dicocokkan dengan model hitung independen di src/viz (yang dulu
// menggerakkan penjelajah), jadi angka di panel Variabel dan Tabel punya dua sumber yang harus sama.
import test from 'node:test'
import assert from 'node:assert/strict'
import { traces, runTrace } from './traces.js'
import { parseEdges, recurrenceKind } from './traces/konsepPseudo.js'
import { klasifikasi, nilaiT } from '../viz/masterModel.js'
import { potongBatang, susunPotongan } from '../viz/dpModel.js'
import { koinGreedy, koinOptimal } from '../viz/greedyModel.js'
import { bangun } from '../viz/representasiGrafModel.js'
import { rand } from '../lib/testRandom.js'

const run = (id, values) => {
  const r = runTrace(traces[id], Object.fromEntries(Object.entries(values).map(([k, v]) => [k, Array.isArray(v) ? v.join(', ') : String(v)])))
  assert.ok(r.ok, r.error)
  return r.steps
}
const varOf = (s, name) => s.vars.find((v) => v.name === name).value
const num = (t) => Number(t.replace(/\./g, ''))
const last = (a) => a[a.length - 1]
const randInt = (lo, hi) => lo + Math.floor(rand() * (hi - lo + 1))

// ---------------------------------------------------------------- RECURRENCE-TREE
test('RECURRENCE-TREE: total sama dengan T(b^L) dari model, untuk semua a, b, k, L yang diizinkan', () => {
  for (let a = 1; a <= 8; a++) {
    for (const b of [2, 3, 8]) {
      for (let k = 0; k <= 3; k++) {
        for (const L of [1, 3, 6]) {
          if (a ** L * b ** (k * L) > 1e13) continue
          const steps = run('recurrence-tree', { a, b, k, L })
          assert.equal(num(varOf(last(steps), 'total')), nilaiT(a, b, { k }, L), `a=${a} b=${b} k=${k} L=${L}`)
        }
      }
    }
  }
})

test('RECURRENCE-TREE: Merge Sort n = 16 punya lima level, tiap level berbiaya 16, total 80; catatan akhir menyebut kasus 2', () => {
  const steps = run('recurrence-tree', { a: 2, b: 2, k: 1, L: 4 })
  const tabel = last(steps).tables[0].table
  assert.equal(tabel.rowHeaders.length, 5)
  assert.deepEqual(tabel.cells.map((r) => r[3].text), ['16', '16', '16', '16', '16'])
  assert.deepEqual(tabel.cells.map((r) => r[0].text), ['1', '2', '4', '8', '16'])
  assert.equal(varOf(last(steps), 'total'), '80')
  assert.match(last(steps).note, /kasus 2/)
  assert.deepEqual([...new Set(steps.map((s) => s.line))].sort((x, y) => x - y), [1, 2, 3, 4, 5, 6, 7, 8, 9])
})

test('RECURRENCE-TREE: jenis hasil sama dengan klasifikasi Teorema Master, dan catatan akhir menyebut kasusnya', () => {
  const kasus = { daun: 1, rata: 2, akar: 3 }
  for (let a = 1; a <= 8; a++) {
    for (let k = 0; k <= 3; k++) {
      const jenis = recurrenceKind(a, 2, k)
      assert.equal(kasus[jenis], klasifikasi(a, 2, { k }).kasus, `a=${a} k=${k}`)
      const note = last(run('recurrence-tree', { a, b: 2, k, L: 2 })).note
      assert.match(note, new RegExp(`kasus ${kasus[jenis]}`))
    }
  }
})

test('RECURRENCE-TREE: masukan di luar batas ditolak dengan pesan', () => {
  assert.match(runTrace(traces['recurrence-tree'], { a: '9', b: '2', k: '1', L: '3' }).error, /a harus di antara 1 dan 8/)
  assert.match(runTrace(traces['recurrence-tree'], { a: '2', b: '1', k: '1', L: '3' }).error, /b harus di antara 2 dan 8/)
  assert.match(runTrace(traces['recurrence-tree'], { a: '2', b: '2', k: '1', L: '7' }).error, /L harus di antara 1 dan 6/)
  assert.match(runTrace(traces['recurrence-tree'], { a: '2', b: '2', k: 'x', L: '3' }).error, /pangkat pada f\(n\) = n\^k.*harus berupa bilangan bulat/)
})

// ---------------------------------------------------------------- BOTTOM-UP-CUT-ROD
test('BOTTOM-UP-CUT-ROD: harga modul menghasilkan r = 0, 1, 5, 8, 10, 13, 17, 18, 22 dan potongan 2 + 6', () => {
  const steps = run('bottom-up-cut-rod', { p: [1, 5, 8, 9, 10, 17, 17, 20] })
  assert.deepEqual(last(steps).tables[0].table.cells[0].map((c) => c.text), ['0', '1', '5', '8', '10', '13', '17', '18', '22'])
  assert.match(last(steps).note, /return r\[8\] = 22/)
  assert.match(last(steps).note, /2 \+ 6/)
})

test('BOTTOM-UP-CUT-ROD: tabel r akhir dan susunan potongan sama dengan potongBatang pada harga acak', () => {
  for (let t = 0; t < 60; t++) {
    const n = randInt(1, 10)
    const p = Array.from({ length: n }, () => randInt(0, 40))
    const steps = run('bottom-up-cut-rod', { p })
    const ref = potongBatang([0, ...p], n)
    assert.deepEqual(last(steps).tables[0].table.cells[0].map((c) => Number(c.text)), ref.r, `p=${p}`)
    assert.ok(last(steps).note.endsWith(`${susunPotongan(ref.s, n).join(' + ')}.`), `p=${p}: ${last(steps).note}`)
  }
})

test('BOTTOM-UP-CUT-ROD: baris 6 dibaca n(n+1)/2 kali, dan tiap pembacaan menandai sel r[j-i] sebagai sumber', () => {
  const n = 6
  const steps = run('bottom-up-cut-rod', { p: [2, 3, 7, 8, 9, 12] })
  const baris6 = steps.filter((s) => s.line === 6)
  assert.equal(baris6.length, (n * (n + 1)) / 2)
  for (const s of baris6) {
    const sumber = s.tables[0].table.cells[0].map((c, k) => [c.mark, k]).filter(([m]) => m === 'source')
    assert.equal(sumber.length, 1)
    assert.equal(sumber[0][1], Number(varOf(s, 'j')) - Number(varOf(s, 'i')))
  }
})

// ---------------------------------------------------------------- GREEDY-COIN-CHANGE
test('GREEDY-COIN-CHANGE: jumlah koin sama dengan koinGreedy dan catatan akhir sama dengan koinOptimal', () => {
  const kasus = [[[25, 10, 5, 1], 63], [[4, 3, 1], 6], [[10, 6, 1], 12], [[50, 20, 5, 1], 99]]
  for (let t = 0; t < 40; t++) {
    const d = [...new Set(Array.from({ length: randInt(1, 6) }, () => randInt(2, 60)))].sort((a, b) => b - a)
    kasus.push([[...d, 1], randInt(1, 99)])
  }
  for (const [d, x] of kasus) {
    const steps = run('greedy-coin-change', { d, x })
    const g = koinGreedy(d, x)
    const o = koinOptimal(d, x).jumlah
    assert.equal(num(varOf(last(steps), 'jumlah')), g.length, `d=${d} x=${x}`)
    assert.equal(varOf(last(steps), 'sisa'), '0')
    assert.ok(last(steps).note.includes(`${g.join(' + ')}`))
    assert.match(last(steps).note, g.length === o ? /juga \d+, jadi Greedy memberi hasil optimal/ : new RegExp(`hanya ${o}, jadi Greedy TIDAK optimal`))
  }
})

test('GREEDY-COIN-CHANGE: {4, 3, 1} untuk 6 memakai 3 koin (4 + 1 + 1) sedangkan minimum 2 koin', () => {
  const s = last(run('greedy-coin-change', { d: [4, 3, 1], x: 6 }))
  assert.match(s.note, /return jumlah = 3 koin \(4 \+ 1 \+ 1\)/)
  assert.match(s.note, /hanya 2/)
  assert.deepEqual(s.tables[0].table.cells.map((r) => r[0].text), ['1', '0', '2'])
})

test('GREEDY-COIN-CHANGE: pecahan tidak terurut menurun, tanpa 1, atau x di luar batas ditolak', () => {
  assert.match(runTrace(traces['greedy-coin-change'], { d: '1, 5, 10', x: '12' }).error, /terurut dari besar ke kecil/)
  assert.match(runTrace(traces['greedy-coin-change'], { d: '10, 10, 1', x: '12' }).error, /tanpa angka kembar/)
  assert.match(runTrace(traces['greedy-coin-change'], { d: '10, 5', x: '12' }).error, /terkecil harus 1/)
  assert.match(runTrace(traces['greedy-coin-change'], { d: '10, 1', x: '0' }).error, /x harus di antara 1 dan 99/)
  assert.match(runTrace(traces['greedy-coin-change'], { d: '1', x: '5' }).error, /minimal dua pecahan/)
})

// ---------------------------------------------------------------- BUILD-REPRESENTATIONS
test('BUILD-REPRESENTATIONS: Adj dan A akhir sama dengan bangun() pada graf (a), graf (b), dan graf acak', () => {
  const kasus = [
    [5, '1-2, 1-5, 2-5, 2-3, 2-4, 3-4, 4-5'],
    [6, '1>2, 1>4, 2>5, 3>6, 3>5, 4>2, 5>4, 6>6'],
  ]
  for (let t = 0; t < 40; t++) {
    const n = randInt(2, 8)
    const directed = rand() < 0.5
    const semua = []
    for (let u = 1; u <= n; u++) for (let v = 1; v <= n; v++) if (directed ? true : u < v) semua.push([u, v])
    const pilih = semua.filter(() => rand() < 0.35).slice(0, 20)
    if (pilih.length === 0) continue
    kasus.push([n, pilih.map(([u, v]) => `${u}${directed ? '>' : '-'}${v}`).join(', ')])
  }
  for (const [n, E] of kasus) {
    const r = parseEdges(E, n)
    const ref = bangun(n, r.edges, r.directed)
    const [tAdj, tMat] = last(run('graph-representation', { n, E })).tables
    assert.deepEqual(tAdj.table.cells.map((c) => c[0].text), Array.from({ length: n }, (_, k) => (ref.adj[k + 1].length ? ref.adj[k + 1].join(', ') : '∅')), E)
    assert.deepEqual(tMat.table.cells.map((row) => row.map((c) => Number(c.text))), Array.from({ length: n }, (_, i) => ref.A[i + 1].slice(1)), E)
  }
})

test('BUILD-REPRESENTATIONS: graf tak berarah mengisi baris 7 dan 8, graf berarah melewatinya, dan catatan akhir menghitung memori', () => {
  const tak = run('graph-representation', { n: 5, E: '1-2, 1-5, 2-5, 2-3, 2-4, 3-4, 4-5' })
  assert.equal(tak.filter((s) => s.line === 7).length, 7)
  assert.equal(tak.filter((s) => s.line === 8).length, 7)
  assert.match(last(tak).note, /= 14 \(2\|E\|\)/)
  assert.match(last(tak).note, /5 \+ 14 = 19 entri/)
  assert.match(last(tak).note, /\|V\|² = 25 sel untuk 7 busur/)
  const ber = run('graph-representation', { n: 6, E: '1>2, 1>4, 2>5, 3>6, 3>5, 4>2, 5>4, 6>6' })
  assert.equal(ber.filter((s) => s.line === 7).length, 0)
  assert.equal(ber.filter((s) => s.line === 6).length, 8)
  assert.match(ber.find((s) => s.line === 6 && /self-loop|FALSE/.test(s.note)).note, /FALSE/)
  assert.match(last(ber).note, /= 8 \(\|E\|\)/)
  // tabel list muncul sesudah baris 1, tabel matriks sesudah baris 2
  assert.equal(ber[0].tables.length, 1)
  assert.equal(ber[1].tables.length, 2)
})

test('BUILD-REPRESENTATIONS: masukan busur yang salah ditolak dengan pesan', () => {
  const galat = (n, E) => runTrace(traces['graph-representation'], { n: String(n), E }).error
  assert.match(galat(5, ''), /minimal satu busur/)
  assert.match(galat(5, '1-2, abc'), /bukan busur/)
  assert.match(galat(5, '1-2, 2>3'), /tanda yang sama/)
  assert.match(galat(3, '1-4'), /antara 1 dan 3/)
  assert.match(galat(3, '2-2'), /tanpa self-loop/)
  assert.match(galat(3, '1-2, 2-1'), /dua kali/)
  assert.match(galat(9, '1-2'), /n harus di antara 1 dan 8/)
  assert.equal(runTrace(traces['graph-representation'], { n: '3', E: '2>2, 1>2, 2>1' }).ok, true, 'self-loop dan arah berlawanan boleh pada graf berarah')
})

// ---------------------------------------------------------------- umum
test('semua preset empat peraga konsep menghasilkan langkah yang sah', () => {
  for (const id of ['recurrence-tree', 'bottom-up-cut-rod', 'greedy-coin-change', 'graph-representation']) {
    assert.ok(traces[id].presets.length >= 3, id)
    for (const p of traces[id].presets) assert.ok(runTrace(traces[id], p.values).ok, `${id}: ${p.label}`)
  }
})

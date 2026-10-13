import { test } from 'node:test'
import assert from 'node:assert/strict'
import { traces, runTrace } from './traces.js'
import { greedyActivityCode, greedyActivityTrace, maxCompatible, checkGreedyInput } from './traces/greedyActivity.js'
import { seeded as createSeededRandom } from '../lib/seededRandom.js'

const def = traces['greedy-activity-selector']
const text = (arr) => arr.join(', ')

// ---------------------------------------------------------------- pembanding independen
/** GREEDY-ACTIVITY-SELECTOR apa adanya (indeks 1), tanpa pengurutan; mencatat urutan baris yang dibaca. */
function reference(s, f) {
  const lines = []
  const n = s.length
  lines.push(1)
  const A = [1]
  lines.push(2)
  let k = 1
  lines.push(3)
  let m = 2
  for (;;) {
    lines.push(4)
    if (m > n) break
    lines.push(5)
    if (s[m - 1] >= f[k - 1]) {
      A.push(m)
      lines.push(6)
      k = m
      lines.push(7)
    }
    m++
  }
  lines.push(8)
  return { A, lines }
}

/** Brute force: semua himpunan bagian, ukuran terbesar yang saling kompatibel (selang setengah terbuka). */
function bruteForceBest(s, f) {
  let best = 0
  for (let mask = 1; mask < 1 << s.length; mask++) {
    const idx = []
    for (let i = 0; i < s.length; i++) if (mask & (1 << i)) idx.push(i)
    let ok = true
    for (let a = 0; ok && a < idx.length; a++) for (let b = a + 1; b < idx.length; b++) if (!(s[idx[b]] >= f[idx[a]] || s[idx[a]] >= f[idx[b]])) { ok = false; break }
    if (ok && idx.length > best) best = idx.length
  }
  return best
}

function randomInput(rng, maxN = 9) {
  const n = 1 + Math.floor(rng() * maxN)
  const s = []
  const f = []
  for (let i = 0; i < n; i++) {
    const a = Math.floor(rng() * 25)
    s.push(a)
    f.push(a + 1 + Math.floor(rng() * 6))
  }
  return { s, f }
}

const run = (s, f) => runTrace(def, { s: text(s), f: text(f) })

const S = [1, 3, 0, 5, 3, 5, 6, 8, 8, 2, 12]
const F = [4, 5, 6, 7, 9, 9, 10, 11, 12, 14, 16]

// ---------------------------------------------------------------- tes
test('greedy-activity-selector: isian bawaan = contoh materi, 31 langkah, hasil {a1, a4, a8, a11}', () => {
  assert.deepEqual(def.inputs.map((i) => i.value), [text(S), text(F)])
  const r = run(S, F)
  assert.ok(r.ok)
  assert.equal(r.steps.length, 31)
  const last = r.steps.at(-1)
  assert.equal(last.line, 8)
  assert.equal(last.vars.find((v) => v.name === 'A').value, '{a1, a4, a8, a11}')
  assert.match(last.note, /4 aktivitas.*optimal/)
  assert.ok(!/TIDAK optimal/.test(last.note))
})

test('greedy-activity-selector: urutan baris sama dengan eksekusi pseudocode apa adanya pada 300 masukan acak (tanpa pengurutan)', () => {
  const rng = createSeededRandom(1011)
  for (let t = 0; t < 300; t++) {
    const { s, f } = randomInput(rng)
    const r = run(s, f)
    assert.ok(r.ok, r.error)
    const ref = reference(s, f)
    assert.deepEqual(r.steps.map((x) => x.line), ref.lines, `s=${s} f=${f}`)
    assert.equal(r.steps.at(-1).vars.find((v) => v.name === 'A').value, `{${ref.A.map((x) => `a${x}`).join(', ')}}`)
    // rumus banyak langkah: 3 + 2(n-1) + 2(|A|-1) + 2
    assert.equal(r.steps.length, 3 + 2 * (s.length - 1) + 2 * (ref.A.length - 1) + 2)
  }
})

test('greedy-activity-selector: kalimat "optimal" atau "TIDAK optimal" cocok dengan brute force semua himpunan bagian', () => {
  const rng = createSeededRandom(2022)
  let optimal = 0
  let notOptimal = 0
  for (let t = 0; t < 200; t++) {
    const { s, f } = randomInput(rng, 9)
    const best = bruteForceBest(s, f)
    assert.equal(maxCompatible(s, f), best, `maxCompatible s=${s} f=${f}`)
    const ref = reference(s, f)
    const note = run(s, f).steps.at(-1).note
    assert.match(note, new RegExp(`${ref.A.length} aktivitas`))
    if (ref.A.length === best) {
      optimal++
      assert.match(note, new RegExp(`maksimum yang mungkin untuk data ini \\(${best}\\), jadi hasilnya optimal`))
    } else {
      notOptimal++
      assert.match(note, new RegExp(`maksimum untuk data ini adalah ${best} aktivitas, jadi hasilnya TIDAK optimal`))
    }
  }
  assert.ok(optimal > 0 && notOptimal > 0, 'kedua kemungkinan harus teruji')
})

test('greedy-activity-selector: bila data terurut menurut finish time, hasilnya selalu optimal', () => {
  const rng = createSeededRandom(3033)
  for (let t = 0; t < 200; t++) {
    const { s, f } = randomInput(rng, 9)
    const order = s.map((_, i) => i).sort((a, b) => f[a] - f[b])
    const ss = order.map((i) => s[i])
    const ff = order.map((i) => f[i])
    const last = run(ss, ff).steps.at(-1)
    assert.match(last.note, /jadi hasilnya optimal/, `s=${ss} f=${ff}`)
    assert.ok(!/tidak terurut/.test(run(ss, ff).steps[0].note))
  }
})

test('greedy-activity-selector: tombol contoh sesuai teks materi (31, 29, 31, dan 9 langkah; hasil 4, 3, 4, dan 1)', () => {
  const expected = [
    [31, '{a1, a4, a8, a11}', 4, true],
    [29, '{a1, a8, a11}', 3, false],
    [31, '{a1, a2, a4, a8}', 4, true],
    [9, '{a1}', 1, false],
  ]
  assert.equal(def.presets.length, expected.length)
  def.presets.forEach((p, i) => {
    const r = runTrace(def, p.values)
    assert.ok(r.ok, `${p.label}: ${r.error}`)
    const [steps, setStr, size, opt] = expected[i]
    assert.equal(r.steps.length, steps, p.label)
    const last = r.steps.at(-1)
    assert.equal(last.vars.find((v) => v.name === 'A').value, setStr, p.label)
    assert.match(last.note, new RegExp(`${size} aktivitas`))
    assert.equal(!/TIDAK optimal/.test(last.note), opt, p.label)
  })
  // data latihan a dan b sama dengan tabel di materi, dan memang hasil pengurutan data contoh
  const [, a, b] = def.presets
  const pairs = (v) => v.s.split(', ').map((x, i) => `${x},${v.f.split(', ')[i]}`).sort()
  const base = S.map((x, i) => `${x},${F[i]}`).sort()
  assert.deepEqual(pairs(a.values), base)
  assert.deepEqual(pairs(b.values), base)
  const sa = a.values.s.split(', ').map(Number)
  assert.deepEqual(sa, [...sa].sort((x, y) => x - y), 'latihan a terurut menurut start time')
  const sb = b.values.s.split(', ').map(Number)
  const fb = b.values.f.split(', ').map(Number)
  const dur = sb.map((x, i) => fb[i] - x)
  assert.deepEqual(dur, [...dur].sort((x, y) => x - y), 'latihan b terurut menurut durasi')
})

test('greedy-activity-selector: A hanya berubah di baris 2 dan 6, k hanya di baris 3 dan 7, dan kedua array tidak pernah berubah', () => {
  const rng = createSeededRandom(4044)
  for (let t = 0; t < 100; t++) {
    const { s, f } = randomInput(rng)
    const steps = run(s, f).steps
    const val = (st, name) => st.vars.find((v) => v.name === name).value
    for (let i = 1; i < steps.length; i++) {
      const a = steps[i - 1]
      const b = steps[i]
      if (val(a, 'A') !== val(b, 'A')) assert.ok([2, 6].includes(b.line), `A berubah di baris ${b.line}`)
      if (val(a, 'k') !== val(b, 'k')) assert.ok([3, 7].includes(b.line), `k berubah di baris ${b.line}`)
      assert.deepEqual(b.arrays[0].values, s)
      assert.deepEqual(b.arrays[1].values, f)
    }
  }
})

test('greedy-activity-selector: status sel (dipilih, dilewati, dibandingkan) konsisten dengan langkahnya', () => {
  const steps = run(S, F).steps
  const first = steps[0]
  assert.ok(first.arrays[0].marks.every((m) => m === 'normal'))
  // sesudah baris 2 hanya a1 yang dipilih
  assert.equal(steps[1].arrays[0].marks[0], 'chosen')
  // baris 5 pada m = 2: s[2] dan f[1] dibandingkan
  const cmp = steps.find((x) => x.line === 5)
  assert.equal(cmp.arrays[0].marks[1], 'compare')
  assert.equal(cmp.arrays[1].marks[0], 'compare')
  // langkah akhir: tepat a1, a4, a8, a11 dipilih, sisanya dilewati
  const end = steps.at(-1)
  end.arrays[0].marks.forEach((m, i) => assert.equal(m, [1, 4, 8, 11].includes(i + 1) ? 'chosen' : 'skipped', `a${i + 1}`))
  assert.deepEqual(end.arrays[0].marks, end.arrays[1].marks)
  // nomor baris pada kode peraga = 8 baris
  assert.equal(greedyActivityCode.split('\n').length, 8)
  assert.equal(def.legend.every((k) => ['normal', 'current', 'compare', 'chosen', 'skipped'].includes(k)), true)
})

test('greedy-activity-selector: masukan tidak sah ditolak dengan pesan yang menyebut sebabnya', () => {
  assert.match(runTrace(def, { s: '1, 2', f: '3' }).error, /Array s berisi 2 angka, sedangkan array f berisi 1/)
  assert.match(runTrace(def, { s: '5, 2', f: '3, 4' }).error, /Aktivitas ke-1 mulai pada 5 tetapi selesai pada 3/)
  assert.match(runTrace(def, { s: '1, 2', f: '1, 3' }).error, /Aktivitas ke-1 mulai pada 1 tetapi selesai pada 1/)
  assert.match(runTrace(def, { s: '', f: '3' }).error, /Array s/)
  assert.match(runTrace(def, { s: '-1', f: '3' }).error, /di luar rentang 0 sampai 30/)
  assert.match(runTrace(def, { s: '0', f: '31' }).error, /di luar rentang 0 sampai 30/)
  const thirteen = Array.from({ length: 13 }, (_, i) => i).join(', ')
  assert.match(runTrace(def, { s: thirteen, f: thirteen }).error, /Maksimal 12 angka \(Anda mengisi 13\)/)
  const twelve = Array.from({ length: 12 }, (_, i) => i)
  assert.ok(runTrace(def, { s: text(twelve), f: text(twelve.map((x) => x + 1)) }).ok, '12 aktivitas diterima')
  assert.equal(checkGreedyInput({ s: [1], f: [2] }), null)
})

test('greedy-activity-selector: satu aktivitas langsung berhenti dengan A = {a1}', () => {
  const steps = greedyActivityTrace({ s: [2], f: [5] })
  assert.deepEqual(steps.map((x) => x.line), [1, 2, 3, 4, 8])
  assert.equal(steps.at(-1).vars.find((v) => v.name === 'A').value, '{a1}')
})

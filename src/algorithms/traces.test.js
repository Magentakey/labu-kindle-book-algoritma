import test from 'node:test'
import assert from 'node:assert/strict'
import { traces, TRACE_IDS, runTrace } from './traces.js'
import { STATUS } from '../components/BarChart/statuses.js'

const texts = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, Array.isArray(v) ? v.join(', ') : String(v)]))
const run = (id, values) => {
  const r = runTrace(traces[id], texts(values))
  assert.ok(r.ok, r.error)
  return r.steps
}
const lines = (steps) => steps.map((s) => s.line)
const varOf = (step, name) => step.vars.find((v) => v.name === name).value

// ---- BILANGAN_MAX ----
test('BILANGAN_MAX: contoh di materi (7, 4, 10) langkah 1, 2, 4, 5, 6 dan hasil 10', () => {
  const steps = run('bilangan-max', { bil1: 7, bil2: 4, bil3: 10 })
  assert.deepEqual(lines(steps), [1, 2, 4, 5, 6])
  assert.match(steps[1].note, /7 < 4 bernilai FALSE/)
  assert.match(steps[2].note, /7 < 10 bernilai TRUE/)
  assert.equal(varOf(steps.at(-1), 'max'), '10')
})

test('BILANGAN_MAX: hasil akhir = nilai terbesar untuk semua kombinasi -3..3', () => {
  for (let a = -3; a <= 3; a++) for (let b = -3; b <= 3; b++) for (let c = -3; c <= 3; c++) {
    const steps = run('bilangan-max', { bil1: a, bil2: b, bil3: c })
    assert.equal(Number(varOf(steps.at(-1), 'max')), Math.max(a, b, c), `${a},${b},${c}`)
    assert.equal(steps.at(-1).line, 6)
    assert.equal(steps[0].line, 1)
  }
})

test('BILANGAN_MAX: baris 3 dan 5 hanya dijalankan bila kondisinya TRUE', () => {
  assert.deepEqual(lines(run('bilangan-max', { bil1: 9, bil2: 1, bil3: 2 })), [1, 2, 4, 6])
  assert.deepEqual(lines(run('bilangan-max', { bil1: 1, bil2: 5, bil3: 2 })), [1, 2, 3, 4, 6])
  assert.deepEqual(lines(run('bilangan-max', { bil1: 1, bil2: 2, bil3: 3 })), [1, 2, 3, 4, 5, 6])
})

// ---- JUMLAH_n_BIL ----
test('JUMLAH_n_BIL: contoh di materi (20, 35, 15) menghasilkan 20, 55, 70', () => {
  const steps = run('jumlah-n-bil', { A: [20, 35, 15] })
  assert.deepEqual(lines(steps), [1, 2, 3, 2, 3, 2, 3, 2, 4])
  const sums = steps.filter((s) => s.line === 3).map((s) => varOf(s, 'jumlah'))
  assert.deepEqual(sums, ['20', '55', '70'])
  assert.match(steps[7].note, /i = 4/)
  assert.equal(varOf(steps.at(-1), 'jumlah'), '70')
})

test('JUMLAH_n_BIL: hasil = jumlah sebenarnya dan jumlah langkah = 2n + 3 (200 array acak)', () => {
  for (let t = 0; t < 200; t++) {
    const A = Array.from({ length: 1 + Math.floor(Math.random() * 8) }, () => Math.floor(Math.random() * 41) - 20)
    const steps = run('jumlah-n-bil', { A })
    assert.equal(Number(varOf(steps.at(-1), 'jumlah')), A.reduce((a, b) => a + b, 0), JSON.stringify(A))
    assert.equal(steps.length, 2 * A.length + 3)
  }
})

// ---- BINARY-SEARCH ----
const sortedRandom = () => {
  const len = 1 + Math.floor(Math.random() * 8)
  return Array.from({ length: len }, () => Math.floor(Math.random() * 30) - 10).sort((a, b) => a - b)
}
const resultOf = (steps) => {
  const last = steps.at(-1)
  if (last.line === 8 && /return NIL/.test(last.note)) return 'NIL'
  if (/return NIL/.test(last.note)) return 'NIL'
  return Number(/di indeks (\d+)/.exec(last.note)[1])
}

for (const id of ['binary-search-iteratif', 'binary-search-rekursif']) {
  test(`${id}: latihan di materi (x = 12, A = 5, 8, 9, 10, 14, 20) hasilnya NIL`, () => {
    const steps = run(id, { A: [5, 8, 9, 10, 14, 20], x: 12 })
    assert.equal(resultOf(steps), 'NIL')
    const mids = steps.filter((s) => varOf(s, 'mid') !== '–' && /mid = ⌊/.test(s.note)).map((s) => Number(varOf(s, 'mid')))
    assert.deepEqual(mids, [3, 5, 4], 'tengah yang diperiksa: 3, 5, lalu 4')
  })

  test(`${id}: hasil benar untuk 300 array terurut acak (ditemukan: A[idx] == x; NIL: x tidak ada)`, () => {
    for (let t = 0; t < 300; t++) {
      const A = sortedRandom()
      const x = Math.floor(Math.random() * 30) - 10
      const out = resultOf(run(id, { A, x }))
      if (out === 'NIL') assert.ok(!A.includes(x), `${JSON.stringify(A)} x=${x}`)
      else assert.equal(A[out - 1], x, `${JSON.stringify(A)} x=${x} idx=${out}`)
    }
  })
}

test('iteratif dan rekursif memeriksa indeks tengah yang sama dan memberi hasil sama', () => {
  for (let t = 0; t < 200; t++) {
    const A = sortedRandom()
    const x = Math.floor(Math.random() * 30) - 10
    const it = run('binary-search-iteratif', { A, x })
    const rec = run('binary-search-rekursif', { A, x })
    const midsIt = it.filter((s) => s.line === 2).map((s) => varOf(s, 'mid'))
    const midsRec = rec.filter((s) => s.line === 3).map((s) => varOf(s, 'mid'))
    assert.deepEqual(midsIt, midsRec, `${JSON.stringify(A)} x=${x}`)
    assert.equal(resultOf(it), resultOf(rec))
  }
})

test('rekursif: tumpukan panggilan bertambah saat memanggil diri sendiri dan kosong di akhir pemanggilan', () => {
  const steps = run('binary-search-rekursif', { A: [5, 8, 9, 10, 14, 20], x: 12 })
  assert.deepEqual(steps[0].stack, ['BINARY-SEARCH(A, 12, 1, 6)'])
  const depths = steps.map((s) => s.stack.length)
  assert.equal(Math.max(...depths), 4, 'empat panggilan: (1,6), (4,6), (4,4), (5,4)')
  assert.equal(steps.at(-1).stack.length, 4)
  assert.ok(steps.every((s) => s.stack.length >= 1))
  assert.match(steps.at(-1).note, /diteruskan kepada semua pemanggil/)
})

test('binary search: x di tengah ditemukan langsung, dan array satu elemen', () => {
  assert.deepEqual(lines(run('binary-search-iteratif', { A: [1, 2, 3], x: 2 })), [1, 2, 3, 4])
  assert.deepEqual(lines(run('binary-search-iteratif', { A: [7], x: 7 })), [1, 2, 3, 4])
  assert.equal(resultOf(run('binary-search-rekursif', { A: [7], x: 3 })), 'NIL')
})

test('binary search menolak array yang belum terurut', () => {
  const r = runTrace(traces['binary-search-iteratif'], { A: '3, 1, 2', x: '2' })
  assert.equal(r.ok, false)
  assert.match(r.error, /terurut/)
})

// ---- umum ----
test('runTrace: isian tidak sah dilaporkan dengan nama isiannya', () => {
  assert.match(runTrace(traces['bilangan-max'], { bil1: 'abc', bil2: '1', bil3: '2' }).error, /bil1 harus berupa bilangan bulat/)
  assert.match(runTrace(traces['bilangan-max'], { bil1: '1', bil2: '1000', bil3: '2' }).error, /bil2 harus di antara/)
  assert.match(runTrace(traces['jumlah-n-bil'], { A: '' }).error, /Array A/)
  assert.match(runTrace(traces['jumlah-n-bil'], { A: '1, x' }).error, /bukan bilangan bulat/)
})

test('isian bawaan setiap peraga menghasilkan langkah yang sah', () => {
  for (const id of TRACE_IDS) {
    const def = traces[id]
    const r = runTrace(def, Object.fromEntries(def.inputs.map((i) => [i.key, i.value])))
    assert.ok(r.ok, `${id}: ${r.error}`)
    assert.ok(r.steps.length >= 4)
  }
})

test('setiap langkah: baris valid, catatan diawali "Baris N", variabel dan penanda array konsisten', () => {
  for (const id of TRACE_IDS) {
    const def = traces[id]
    const codeLines = def.code.split('\n')
    const r = runTrace(def, Object.fromEntries(def.inputs.map((i) => [i.key, i.value])))
    for (const s of r.steps) {
      assert.ok(Number.isInteger(s.line) && s.line >= 1 && s.line <= codeLines.length, `${id} baris ${s.line}`)
      assert.ok(s.note.startsWith(`Baris ${s.line}`), s.note)
      assert.ok(s.vars.length > 0 && s.vars.every((v) => typeof v.name === 'string' && typeof v.value === 'string'))
      if (s.array) {
        assert.equal(s.array.marks.length, s.array.values.length)
        assert.ok(s.array.marks.every((m) => STATUS[m]), `${id} status tak dikenal ${s.array.marks}`)
        for (const m of s.array.marks) assert.ok(def.legend.includes(m), `${id}: ${m} tidak ada di legend`)
      }
    }
  }
})

test('teks baris pseudocode cocok dengan nomor langkah di materi', () => {
  const expect = {
    'bilangan-max': [/^max = bil1/, /^if \(max < bil2\)/, /then max = bil2/, /^if \(max < bil3\)/, /then max = bil3/, /^return max/],
    'jumlah-n-bil': [/^jumlah = 0/, /^for i = 1 to n/, /jumlah = jumlah \+ A\[i\]/, /^return jumlah/],
    'binary-search-iteratif': [/^while p ≤ n/, /mid = ⌊/, /if \(x == A\[mid\]\)/, /return mid/, /else if x > A\[mid\]/, /p = mid \+ 1/, /else n = mid - 1/, /^return NIL/],
    'binary-search-rekursif': [/^if p > n/, /return NIL/, /mid = ⌊/, /if \(x == A\[mid\]\)/, /return mid/, /else if x > A\[mid\]/, /BINARY-SEARCH\(A, x, mid \+ 1, n\)/, /else return BINARY-SEARCH\(A, x, p, mid - 1\)/],
  }
  for (const id of TRACE_IDS) {
    const codeLines = traces[id].code.split('\n')
    assert.equal(codeLines.length, expect[id].length, id)
    expect[id].forEach((re, i) => assert.match(codeLines[i], re, `${id} baris ${i + 1}`))
  }
})

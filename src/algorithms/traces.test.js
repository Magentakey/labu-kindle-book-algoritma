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
  const insertionSortLines = [
    /^for j = 2 to length\[A\]/,
    /key = A\[j\]/,
    /i = j - 1/,
    /while i > 0 and A\[i\] > key/,
    /A\[i \+ 1\] = A\[i\]/,
    /i = i - 1/,
    /A\[i \+ 1\] = key/,
  ]
  const expect = {
    'insertion-sort': insertionSortLines,
    'insertion-sort-best': insertionSortLines,
    'insertion-sort-worst': insertionSortLines,
    'cari-bil-k': [/^for i = 1 to A\.length/, /if \(k == A\[i\]\)/, /then return i/, /^return -1/],
    'merge-sort': [/^if p < r/, /q = ⌊\(p \+ r\)\/2⌋/, /MERGE_SORT\(A, p, q\)/, /MERGE_SORT\(A, q\+1, r\)/, /^ +MERGE\(A, p, q, r\)/],
    'matrix-chain-order': [
      /^n = p\.length - 1/,
      /^let m\[1\.\.n, 1\.\.n\] and s\[1\.\.n-1, 2\.\.n\]/,
      /^for i = 1 to n$/,
      /^ +m\[i, i\] = 0$/,
      /^for l = 2 to n/,
      /^ +for i = 1 to n - l \+ 1$/,
      /^ +j = i \+ l - 1$/,
      /^ +m\[i, j\] = ∞$/,
      /^ +for k = i to j - 1$/,
      /^ +q = m\[i, k\] \+ m\[k\+1, j\] \+ p\[i-1\] \* p\[k\] \* p\[j\]$/,
      /^ +if q < m\[i, j\]$/,
      /^ +m\[i, j\] = q$/,
      /^ +s\[i, j\] = k$/,
      /^return m and s$/,
    ],
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

// ---- MERGE_SORT ----
/** Pembanding independen: MERGE_SORT dan MERGE persis seperti pseudocode materi 6 (indeks 1, ∞ sebagai penanda). */
function mergeSortReference(input) {
  const A = [null, ...input]
  const calls = []
  const merges = []
  const merge = (p, q, r) => {
    const n1 = q - p + 1
    const n2 = r - q
    const L = [null]
    const R = [null]
    for (let i = 1; i <= n1; i++) L[i] = A[p + i - 1]
    for (let j = 1; j <= n2; j++) R[j] = A[q + j]
    L[n1 + 1] = Infinity
    R[n2 + 1] = Infinity
    let i = 1
    let j = 1
    for (let k = p; k <= r; k++) A[k] = L[i] <= R[j] ? L[i++] : R[j++]
    merges.push({ p, q, r, A: A.slice(1) })
  }
  const sort = (p, r) => {
    calls.push([p, r])
    if (p < r) {
      const q = Math.floor((p + r) / 2)
      sort(p, q)
      sort(q + 1, r)
      merge(p, q, r)
    }
  }
  sort(1, input.length)
  return { calls, merges, result: A.slice(1) }
}
const arrOf = (step) => step.array.values
const randomInts = (max = 8) => Array.from({ length: 1 + Math.floor(Math.random() * max) }, () => Math.floor(Math.random() * 41) - 20)

test('MERGE_SORT: contoh soal materi {3, 10, 8, 20, 5}: urutan pemanggilan, q, dan isi A tiap MERGE', () => {
  const steps = run('merge-sort', { A: [3, 10, 8, 20, 5] })
  assert.equal(steps.length, 6 * 5 - 5)
  // setiap pemanggilan = baris 1 yang tumpukannya berakhir di pemanggilan itu
  const calls = steps.filter((s) => s.line === 1).map((s) => s.stack.at(-1))
  assert.deepEqual(calls, [
    'MERGE_SORT(A, 1, 5)', 'MERGE_SORT(A, 1, 3)', 'MERGE_SORT(A, 1, 2)', 'MERGE_SORT(A, 1, 1)', 'MERGE_SORT(A, 2, 2)',
    'MERGE_SORT(A, 3, 3)', 'MERGE_SORT(A, 4, 5)', 'MERGE_SORT(A, 4, 4)', 'MERGE_SORT(A, 5, 5)',
  ])
  assert.deepEqual(steps.filter((s) => s.line === 2).map((s) => varOf(s, 'q')), ['3', '2', '1', '4'])
  assert.deepEqual(
    steps.filter((s) => s.line === 5).map((s) => arrOf(s).join('  ')),
    ['3  10  8  20  5', '3  8  10  20  5', '3  8  10  5  20', '3  5  8  10  20'],
  )
  assert.match(steps.at(-1).note, /seluruh array A sudah terurut/)
})

test('MERGE_SORT: urutan baris, tumpukan, dan isi A sama dengan eksekusi pseudocode pada 300 array acak', () => {
  for (let t = 0; t < 300; t++) {
    const input = randomInts()
    const steps = run('merge-sort', { A: input })
    const ref = mergeSortReference(input)
    const n = input.length
    assert.equal(steps.length, 6 * n - 5, `banyak langkah, ${input}`)
    assert.deepEqual(arrOf(steps.at(-1)), ref.result, `hasil akhir, ${input}`)
    assert.deepEqual(arrOf(steps.at(-1)), [...input].sort((a, b) => a - b))
    // urutan pemanggilan
    const callsSeen = steps.filter((s) => s.line === 1).map((s) => s.stack.at(-1))
    assert.deepEqual(callsSeen, ref.calls.map(([p, r]) => `MERGE_SORT(A, ${p}, ${r})`), `pemanggilan, ${input}`)
    // isi A dan p, q, r tiap MERGE
    const merged = steps.filter((s) => s.line === 5)
    assert.equal(merged.length, ref.merges.length)
    merged.forEach((s, i) => {
      assert.deepEqual(arrOf(s), ref.merges[i].A, `A sesudah MERGE ke-${i + 1}, ${input}`)
      assert.deepEqual([varOf(s, 'p'), varOf(s, 'q'), varOf(s, 'r')], [ref.merges[i].p, ref.merges[i].q, ref.merges[i].r].map(String))
    })
    // A hanya berubah pada baris 5
    steps.forEach((s, i) => {
      if (i > 0 && s.line !== 5) assert.deepEqual(arrOf(s), arrOf(steps[i - 1]), `A tidak berubah di baris ${s.line}`)
    })
  }
})

test('MERGE_SORT: tumpukan dimulai dan berakhir kosong secara logis, dan kedalaman tidak melebihi ⌈log₂ n⌉ + 1', () => {
  for (let t = 0; t < 100; t++) {
    const input = randomInts()
    const steps = run('merge-sort', { A: input })
    assert.deepEqual(steps[0].stack, [`MERGE_SORT(A, 1, ${input.length})`])
    assert.deepEqual(steps.at(-1).stack, [`MERGE_SORT(A, 1, ${input.length})`], 'langkah terakhir masih di pemanggilan pertama')
    const maxDepth = Math.max(...steps.map((s) => s.stack.length))
    assert.ok(maxDepth <= Math.ceil(Math.log2(input.length)) + 1, `kedalaman ${maxDepth}, n = ${input.length}`)
  }
})

test('MERGE_SORT: satu bilangan hanya 1 langkah (kasus dasar) dan bilangan kembar tetap terurut', () => {
  const one = run('merge-sort', { A: [7] })
  assert.deepEqual(lines(one), [1])
  assert.match(one[0].note, /FALSE/)
  assert.deepEqual(one[0].array.marks, ['sorted'])
  const dup = run('merge-sort', { A: [4, 4, 4, 1, 1] })
  assert.deepEqual(arrOf(dup.at(-1)), [1, 1, 4, 4, 4])
})

test('MERGE_SORT: status sel hanya memakai status yang ada di legenda dan di STATUS, dan akhirnya semua merged', () => {
  const def = traces['merge-sort']
  const allowed = new Set(['normal', ...def.legend])
  for (const input of [[3, 10, 8, 20, 5], [38, 27, 43, 3, 9, 82, 10], [2, 1], [5]]) {
    const steps = run('merge-sort', { A: input })
    for (const s of steps) for (const m of s.array.marks) {
      assert.ok(allowed.has(m), `status ${m} tidak ada di legenda`)
      assert.ok(STATUS[m])
      assert.equal(s.array.marks.length, input.length)
    }
    const end = steps.at(-1).array.marks
    assert.ok(end.every((m) => m === (input.length === 1 ? 'sorted' : 'merged')), `${input}: ${end}`)
  }
})

test('MERGE_SORT: baris 2 membagi kiri dan kanan di sekitar q, dan masukan tidak berubah', () => {
  const input = [3, 10, 8, 20, 5]
  const copy = [...input]
  const steps = run('merge-sort', { A: input })
  assert.deepEqual(input, copy)
  assert.deepEqual(steps[1].array.marks, ['left', 'left', 'left', 'right', 'right'])
  assert.deepEqual(steps[0].array.marks, ['range', 'range', 'range', 'range', 'range'])
})

test('MERGE_SORT: masukan lebih dari 8 bilangan ditolak, sesuai teks materi', () => {
  const r = runTrace(traces['merge-sort'], { A: '1 2 3 4 5 6 7 8 9' })
  assert.equal(r.ok, false)
  assert.match(r.error, /Maksimal 8/)
  for (const p of traces['merge-sort'].presets) assert.ok(runTrace(traces['merge-sort'], p.values).ok, p.label)
})

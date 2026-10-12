import test from 'node:test'
import assert from 'node:assert/strict'
import { traces, runTrace } from './traces.js'
import { STATUS } from '../components/BarChart/statuses.js'

const run = (id, values) => {
  const texts = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, Array.isArray(v) ? v.join(', ') : String(v)]))
  const r = runTrace(traces[id], texts)
  assert.ok(r.ok, r.error)
  return r.steps
}
const varOf = (step, name) => step.vars.find((v) => v.name === name).value
const randArr = (max = 8) => Array.from({ length: 1 + Math.floor(Math.random() * max) }, () => Math.floor(Math.random() * 41) - 20)

// Pembanding independen: insertion sort berindeks 1 dengan penghitung tiap baris, ditulis langsung dari pseudocode materi.
function referenceInsertionSort(input) {
  const A = [null, ...input]
  const n = input.length
  const c = [0, 0, 0, 0, 0, 0, 0, 0]
  const t = []
  let j = 2
  for (;;) {
    c[1]++ // pemeriksaan "for", termasuk yang terakhir (j = n + 1)
    if (j > n) break
    c[2]++
    const key = A[j]
    c[3]++
    let i = j - 1
    let tj = 0
    for (;;) {
      c[4]++
      tj++
      if (!(i > 0 && A[i] > key)) break
      c[5]++
      A[i + 1] = A[i]
      c[6]++
      i--
    }
    c[7]++
    A[i + 1] = key
    t.push(tj)
    j++
  }
  return { counts: c, t, sorted: A.slice(1) }
}

// ---- INSERTION_SORT: contoh di materi ----
test('INSERTION_SORT: contoh materi 12, 10, 15, 7 menjalankan baris persis seperti Loop 1 sampai 3 di materi', () => {
  const steps = run('insertion-sort', { A: [12, 10, 15, 7] })
  const lines = steps.map((s) => s.line).join('')
  const loop1 = '12345647'
  const loop2 = '12347'
  const loop3 = '12345645645647'
  assert.equal(lines, loop1 + loop2 + loop3 + '1')
  // isi array sesudah langkah 7 pada tiap loop
  const afterSeven = steps.filter((s) => s.line === 7).map((s) => s.array.values.join(','))
  assert.deepEqual(afterSeven, ['10,12,15,7', '10,12,15,7', '7,10,12,15'])
  assert.deepEqual(steps.at(-1).array.values, [7, 10, 12, 15])
  assert.equal(varOf(steps.at(-1), 'tⱼ yang sudah selesai'), '2, 1, 4')
})

test('INSERTION_SORT: contoh materi memakai indeks mulai dari 1', () => {
  const steps = run('insertion-sort', { A: [12, 10, 15, 7] })
  assert.ok(steps.every((s) => s.array.indexBase === 1))
  assert.match(steps[1].note, /key = A\[2\] = 10/)
  assert.match(steps[2].note, /i = j − 1 = 2 − 1 = 1/)
})

// ---- INSERTION_SORT: hitungan dibanding pembanding independen ----
test('INSERTION_SORT: hasil terurut dan hitungan tiap baris cocok dengan pembanding independen (500 array acak)', () => {
  for (let t = 0; t < 500; t++) {
    const A = randArr()
    const steps = run('insertion-sort', { A })
    const ref = referenceInsertionSort(A)
    const last = steps.at(-1)
    assert.deepEqual(last.array.values, [...A].sort((a, b) => a - b), JSON.stringify(A))
    assert.deepEqual(last.array.values, ref.sorted)
    for (let line = 1; line <= 7; line++) assert.equal(last.counts[line], ref.counts[line], `baris ${line}, A = ${JSON.stringify(A)}`)
    assert.equal(steps.length, ref.counts.reduce((a, b) => a + b, 0), 'satu langkah = satu pembacaan baris')
    assert.equal(varOf(last, 'tⱼ yang sudah selesai'), ref.t.length ? ref.t.join(', ') : '–')
  }
})

test('INSERTION_SORT: hitungan kumulatif pada tiap langkah sama dengan jumlah baris itu sampai langkah tersebut', () => {
  const steps = run('insertion-sort', { A: [5, 2, 4, 6, 1, 3] })
  steps.forEach((s, idx) => {
    for (let line = 1; line <= 7; line++) {
      const expected = steps.slice(0, idx + 1).filter((x) => x.line === line).length
      assert.equal(s.counts[line], expected)
    }
  })
})

// ---- rumus best case dan worst case di materi ----
test('Best case: array terurut → t_j = 1, jumlah operasi n, n-1, n-1, n-1, 0, 0, n-1', () => {
  for (let n = 1; n <= 8; n++) {
    const A = Array.from({ length: n }, (_, k) => k * 3 - 5) // terurut naik
    const c = run('insertion-sort-best', { A }).at(-1).counts
    assert.deepEqual([c[1], c[2], c[3], c[4], c[5], c[6], c[7]], [n, n - 1, n - 1, n - 1, 0, 0, n - 1], `n = ${n}`)
  }
})

test('Worst case: array terurut turun → Σ t_j = (n²+n−2)/2 dan Σ (t_j−1) = (n²−n)/2', () => {
  for (let n = 1; n <= 8; n++) {
    const A = Array.from({ length: n }, (_, k) => 50 - k * 4) // terurut turun, tanpa elemen kembar
    const c = run('insertion-sort-worst', { A }).at(-1).counts
    assert.equal(c[4], (n * n + n - 2) / 2, `Σ tⱼ, n = ${n}`)
    assert.equal(c[5], (n * n - n) / 2, `Σ (tⱼ − 1), n = ${n}`)
    assert.equal(c[6], (n * n - n) / 2)
    assert.deepEqual([c[1], c[2], c[3], c[7]], [n, n - 1, n - 1, n - 1])
  }
})

test('contoh bawaan best dan worst di materi (n = 5) menghasilkan hitungan yang dipakai di teks', () => {
  assert.deepEqual(Object.values(run('insertion-sort-best', { A: [2, 4, 12, 15, 30] }).at(-1).counts), [5, 4, 4, 4, 0, 0, 4])
  assert.deepEqual(Object.values(run('insertion-sort-worst', { A: [30, 15, 12, 4, 2] }).at(-1).counts), [5, 4, 4, 14, 10, 10, 4])
})

test('ringkasan langkah terakhir menyebut jenis kasusnya dengan benar', () => {
  assert.match(run('insertion-sort', { A: [2, 4, 12, 15, 30] }).at(-1).note, /kasus terbaik/)
  assert.match(run('insertion-sort', { A: [30, 15, 12, 4, 2] }).at(-1).note, /kasus terburuk/)
  assert.match(run('insertion-sort', { A: [12, 10, 15, 7] }).at(-1).note, /di antara/)
  assert.match(run('insertion-sort', { A: [9] }).at(-1).note, /tidak ada loop/)
  assert.match(run('insertion-sort', { A: [12, 10, 15, 7] }).at(-1).note, /T\(n\) = c₁·4 \+ c₂·3 \+ c₃·3 \+ c₄·7 \+ c₅·4 \+ c₆·4 \+ c₇·3/)
})

test('INSERTION_SORT: satu bilangan saja → hanya baris 1 yang dibaca (1 kali = n)', () => {
  const steps = run('insertion-sort', { A: [42] })
  assert.deepEqual(steps.map((s) => s.line), [1])
  assert.equal(steps[0].counts[1], 1)
})

test('INSERTION_SORT: elemen kembar tidak digeser (A[i] > key bersifat tegas)', () => {
  const c = run('insertion-sort', { A: [2, 2, 2] }).at(-1).counts
  assert.equal(c[5], 0)
  assert.equal(c[4], 2)
})

test('INSERTION_SORT: status sel dikenal, jumlahnya sama dengan array, dan sel key/celah muncul wajar', () => {
  for (let t = 0; t < 100; t++) {
    const A = randArr()
    const def = traces['insertion-sort']
    for (const s of run('insertion-sort', { A })) {
      assert.equal(s.array.marks.length, A.length)
      assert.ok(s.array.marks.every((m) => STATUS[m]), `status tak dikenal: ${s.array.marks}`)
      assert.ok(s.array.marks.every((m) => m === 'normal' || def.legend.includes(m)), 'status harus ada di legenda')
      if (s.line === 2 || s.line === 3) assert.equal(s.array.marks.filter((m) => m === 'key').length, 1)
      if (s.line === 7) assert.equal(s.array.marks.filter((m) => m === 'placed').length, 1)
    }
  }
  assert.ok(Object.values(STATUS).every((v) => v.label && typeof v.glyph === 'string' && v.fill))
})

test('INSERTION_SORT: baris 4 saat i = 0 tidak memeriksa A[i] (hubungan "and" berhenti lebih awal)', () => {
  const steps = run('insertion-sort', { A: [12, 10] })
  const four = steps.filter((s) => s.line === 4)
  assert.equal(four.length, 2)
  assert.match(four[1].note, /0 > 0 bernilai FALSE/)
})

// ---- CARI_BIL_K ----
function referenceCari(A, k) {
  const n = A.length
  const c = [0, 0, 0, 0, 0]
  let result = -1
  for (let i = 1; ; i++) {
    c[1]++
    if (i > n) break
    c[2]++
    if (k === A[i - 1]) {
      c[3]++
      result = i
      break
    }
  }
  if (result === -1) c[4]++
  return { c, result }
}

test('CARI_BIL_K: kasus terburuk (k tidak ada) → n+1, n, 0, 1 seperti tabel di materi', () => {
  for (let n = 1; n <= 8; n++) {
    const A = Array.from({ length: n }, (_, k) => k + 1)
    const last = run('cari-bil-k', { A, k: 99 }).at(-1)
    assert.deepEqual(Object.values(last.counts), [n + 1, n, 0, 1], `n = ${n}`)
    assert.match(last.note, /return -1/)
    assert.match(last.note, /kasus terburuk/)
  }
})

test('CARI_BIL_K: hasil dan hitungan cocok dengan pembanding independen (500 masukan acak)', () => {
  for (let t = 0; t < 500; t++) {
    const A = randArr().map((v) => Math.abs(v) % 10)
    const k = Math.floor(Math.random() * 12)
    const steps = run('cari-bil-k', { A, k })
    const ref = referenceCari(A, k)
    const last = steps.at(-1)
    assert.deepEqual(Object.values(last.counts), ref.c.slice(1), `A = ${JSON.stringify(A)}, k = ${k}`)
    if (ref.result === -1) assert.match(last.note, /return -1/)
    else assert.match(last.note, new RegExp(`return ${ref.result}\\.`))
    assert.equal(steps.length, ref.c.reduce((a, b) => a + b, 0))
    assert.ok(steps.every((s) => s.array.marks.every((m) => STATUS[m])))
  }
})

test('CARI_BIL_K: kunci pertama yang cocok yang dikembalikan, bukan yang terakhir', () => {
  const last = run('cari-bil-k', { A: [4, 7, 4], k: 4 }).at(-1)
  assert.match(last.note, /return 1\./)
  assert.deepEqual(Object.values(last.counts), [1, 1, 1, 0])
})

// ---- definisi peraga ----
test('semua peraga bertabel cost: baris cost ada di kode, urut, dan setiap langkah punya hitungan', () => {
  for (const id of ['insertion-sort', 'insertion-sort-best', 'insertion-sort-worst', 'cari-bil-k']) {
    const def = traces[id]
    const codeLines = def.code.split('\n').length
    assert.deepEqual(def.cost.rows.map((r) => r.line), Array.from({ length: codeLines }, (_, k) => k + 1), `${id}: baris cost harus mencakup semua baris kode`)
    assert.ok(def.cost.rows.every((r) => r.cost && r.formula))
    const steps = run(id, Object.fromEntries(def.inputs.map((i) => [i.key, i.value])))
    assert.ok(steps.every((s) => s.counts && s.counts[s.line] >= 1), `${id}: tiap langkah harus punya hitungan`)
  }
})

test('semua preset peraga sah: kuncinya sesuai isian dan bisa dijalankan', () => {
  for (const id of Object.keys(traces)) {
    const def = traces[id]
    for (const p of def.presets ?? []) {
      const keys = def.inputs.map((i) => i.key)
      assert.ok(Object.keys(p.values).every((k) => keys.includes(k)), `${id}/${p.label}: kunci preset tidak dikenal`)
      const r = runTrace(def, { ...Object.fromEntries(def.inputs.map((i) => [i.key, i.value])), ...p.values })
      assert.ok(r.ok, `${id}/${p.label}: ${r.error}`)
    }
  }
})

test('isian awal tiga peraga insertion sort sesuai contoh di materi', () => {
  assert.equal(traces['insertion-sort'].inputs[0].value, '12, 10, 15, 7')
  assert.equal(traces['insertion-sort-best'].inputs[0].value, '2, 4, 12, 15, 30')
  assert.equal(traces['insertion-sort-worst'].inputs[0].value, '30, 15, 12, 4, 2')
})

test('judul setiap peraga unik (dipakai sebagai nama bagian oleh pembaca layar, mencegah landmark kembar)', () => {
  const titles = Object.values(traces).map((d) => d.title)
  assert.equal(new Set(titles).size, titles.length, titles.join(' | '))
})

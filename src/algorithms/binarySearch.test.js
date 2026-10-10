import test from 'node:test'
import assert from 'node:assert/strict'
import { STATUS } from '../components/BarChart/statuses.js'
import { seeded } from '../lib/seededRandom.js'
import { visualizers } from './registry.js'
import {
  binarySearchCode,
  binarySearchSteps,
  formatBinarySearchInput,
  parseBinarySearchInput,
  randomBinarySearchInput,
} from './binarySearch.js'

const LINES = binarySearchCode.split('\n').length
const run = (array, x) => binarySearchSteps({ array, x })
const last = (steps) => steps[steps.length - 1]
const midsOf = (steps) => steps.filter((s) => s.line === 4).map((s) => Number(/mid = (\d+)/.exec(s.view.panels[0].items[3])[1]))

/** Hasil algoritma dibaca dari langkah terakhir: baris 5 = ditemukan, baris 9 = tidak. */
function outcome(steps) {
  const s = last(steps)
  if (s.line === 5) return { found: true, index: s.view.marks.indexOf('found') }
  return { found: false }
}

test('latihan materi 1: x = 12 pada (5, 8, 9, 10, 14, 20) tidak ditemukan (NIL), mid berturut-turut 2, 4, 3', () => {
  const steps = run([5, 8, 9, 10, 14, 20], 12)
  assert.deepEqual(midsOf(steps), [2, 4, 3])
  assert.equal(last(steps).line, 9)
  assert.match(last(steps).note, /tidak ditemukan/)
  assert.ok(last(steps).view.marks.every((m) => m === 'discarded'))
})

test('contoh ditemukan: x = 16 pada 8 elemen ada di indeks 4 lewat mid 3, 5, 4', () => {
  const steps = run([2, 5, 8, 12, 16, 23, 38, 56], 16)
  assert.deepEqual(midsOf(steps), [3, 5, 4])
  assert.deepEqual(outcome(steps), { found: true, index: 4 })
})

test('semua langkah valid: baris ada di kode, catatan terisi, status terdaftar, panjang marks = panjang array', () => {
  const cases = [
    [[7], 7],
    [[7], 3],
    [[1, 2], 2],
    [[1, 2], 0],
    [[1, 1, 1, 1], 1],
    [[-5, -3, 0, 4, 9], -3],
    [[2, 5, 8, 12, 16, 23, 38, 56], 99],
    [[2, 5, 8, 12, 16, 23, 38, 56], 2],
  ]
  for (const [array, x] of cases) {
    for (const s of run(array, x)) {
      assert.ok(Number.isInteger(s.line) && s.line >= 1 && s.line <= LINES, `baris ${s.line}`)
      assert.ok(s.note.length > 0)
      assert.equal(s.view.marks.length, array.length)
      assert.deepEqual(s.view.values, array)
      assert.ok(s.view.marks.every((m) => STATUS[m]), `status tak dikenal: ${s.view.marks}`)
      assert.ok(s.view.marks.filter((m) => m === 'compare' || m === 'found').length <= 1)
      assert.equal(s.view.panels[0].items.length, 4)
    }
  }
})

test('1000 masukan acak: hasil sama dengan pencarian biasa, dan x yang ada tidak pernah dibuang', () => {
  for (let seed = 1; seed <= 1000; seed++) {
    const rng = seeded(seed)
    const { array, x } = randomBinarySearchInput(rng)
    const steps = run(array, x)
    const result = outcome(steps)
    assert.equal(result.found, array.includes(x), `seed ${seed}`)
    if (result.found) assert.equal(array[result.index], x)
    // Nilai pada array berbeda-beda, jadi bar bernilai x tidak boleh pernah ditandai "dibuang".
    for (const s of steps) {
      array.forEach((v, i) => {
        if (v === x) assert.notEqual(s.view.marks[i], 'discarded', `seed ${seed}: x dibuang`)
      })
    }
    // Jumlah iterasi paling banyak ⌊log2 n⌋ + 1.
    const iterations = steps.filter((s) => s.line === 4).length
    assert.ok(iterations <= Math.floor(Math.log2(array.length)) + 1, `seed ${seed}: ${iterations} iterasi untuk n=${array.length}`)
  }
})

test('rentang menyempit: bar "range" tidak pernah bertambah antar langkah', () => {
  const steps = run([2, 5, 8, 12, 16, 23, 38, 56], 99)
  let prev = Infinity
  for (const s of steps) {
    const now = s.view.marks.filter((m) => m === 'range' || m === 'compare' || m === 'found').length
    assert.ok(now <= prev)
    prev = now
  }
})

test('nilai sama (duplikat) boleh: hasilnya indeks yang isinya x', () => {
  const array = [3, 3, 3, 3, 3]
  const result = outcome(run(array, 3))
  assert.equal(result.found, true)
  assert.equal(array[result.index], 3)
})

test('parseBinarySearchInput: valid, bolak-balik, dan semua galat', () => {
  const ok = parseBinarySearchInput('5, 8, 9 10;14 20', ' 12 ')
  assert.deepEqual(ok, { ok: true, value: { array: [5, 8, 9, 10, 14, 20], x: 12 } })
  assert.deepEqual(formatBinarySearchInput(ok.value), { array: '5, 8, 9, 10, 14, 20', x: '12' })
  assert.deepEqual(parseBinarySearchInput('-3, 0, 4', '-3').value, { array: [-3, 0, 4], x: -3 })

  const bad = [
    ['', '1'],
    ['a, b', '1'],
    ['1, 2.5', '1'],
    ['100', '1'],
    ['3, 2, 1', '1'], // tidak terurut
    ['1, 2, 3', ''],
    ['1, 2, 3', 'x'],
    ['1, 2, 3', '1.5'],
    ['1, 2, 3', '100'],
    ['1,2,3,4,5,6,7,8,9,10,11,12,13', '1'], // 13 angka
  ]
  for (const [arr, x] of bad) {
    const r = parseBinarySearchInput(arr, x)
    assert.equal(r.ok, false, `seharusnya ditolak: "${arr}" / "${x}"`)
    assert.ok(r.error.length > 0)
  }
  assert.equal(parseBinarySearchInput('1,2,3,4,5,6,7,8,9,10,11,12', '1').ok, true) // tepat 12 angka
})

test('pesan galat urutan menyebut angka dan indeks yang salah', () => {
  const r = parseBinarySearchInput('1, 5, 3', '1')
  assert.match(r.error, /3 \(indeks 2\)/)
})

test('randomBinarySearchInput: selalu lolos parser, terurut, berbeda-beda, 6-12 angka, dan beragam', () => {
  const seen = new Set()
  let present = 0
  for (let seed = 1; seed <= 500; seed++) {
    const v = randomBinarySearchInput(seeded(seed))
    const f = formatBinarySearchInput(v)
    const parsed = parseBinarySearchInput(f.array, f.x)
    assert.equal(parsed.ok, true, `seed ${seed}: ${f.array} / ${f.x}`)
    assert.deepEqual(parsed.value, v)
    assert.ok(v.array.length >= 6 && v.array.length <= 12)
    assert.equal(new Set(v.array).size, v.array.length)
    if (v.array.includes(v.x)) present++
    seen.add(`${f.array}|${f.x}`)
  }
  assert.ok(seen.size > 300)
  assert.ok(present > 150 && present < 350, `perbandingan ada/tidak ada tidak seimbang: ${present}/500`)
  assert.equal(parseBinarySearchInput(...Object.values(formatBinarySearchInput(randomBinarySearchInput()))).ok, true)
})

test('registry: entri binarySearch lengkap, contoh dan nilai awal lolos parser, dan terhubung ke materi 1', async () => {
  const v = visualizers.binarySearch
  assert.equal(v.kind, 'search')
  for (const f of ['title', 'code', 'codeLabel', 'chartLabel', 'inputHint']) assert.equal(typeof v[f], 'string', f)
  for (const f of ['buildSteps', 'parseInput', 'formatInput', 'randomInput']) assert.equal(typeof v[f], 'function', f)
  assert.ok(v.legend.every((k) => STATUS[k]))
  for (const input of [v.initialInput, ...v.presets.map((p) => p.value)]) {
    const f = v.formatInput(input)
    assert.deepEqual(v.parseInput(f.array, f.x), { ok: true, value: input })
    assert.ok(v.buildSteps(input).length > 0)
  }
  const { readFileSync } = await import('node:fs')
  const materials = JSON.parse(readFileSync(new URL('../content/materials.json', import.meta.url), 'utf8'))
  assert.equal(materials.find((m) => m.id === 'algoritma-pemrograman').visualizer, 'binarySearch')
})

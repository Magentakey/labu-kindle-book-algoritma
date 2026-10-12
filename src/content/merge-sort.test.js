import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { checkMarkdown } from '../lib/checkMarkdown.js'
import { splitContent } from '../lib/splitContent.js'
import { buildToc } from '../lib/tableOfContents.js'
import { parseArrayInput } from '../lib/parseArray.js'
import { mergeSortSteps } from '../algorithms/mergeSort.js'
import { mergeSortTreeSteps } from '../algorithms/mergeSortTree.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const md = readFileSync(join(root, 'src/content/materials/merge-sort.md'), 'utf8')
const meta = JSON.parse(readFileSync(join(root, 'src/content/materials.json'), 'utf8')).find((m) => m.id === 'merge-sort')
const segs = splitContent(md, { hasVisualizer: Boolean(meta.visualizer), hasChallenge: Boolean(meta.challenge) })

/**
 * Pembanding independen: MERGE_SORT dan MERGE persis seperti pseudocode materi (indeks 1, ∞ sebagai penanda).
 * Mencatat urutan pemanggilan, nilai q, dan isi A sesudah tiap MERGE.
 */
function run(input) {
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
    for (let k = p; k <= r; k++) {
      if (L[i] <= R[j]) A[k] = L[i++]
      else A[k] = R[j++]
    }
    merges.push({ args: [p, q, r], A: A.slice(1), part: A.slice(p, r + 1) })
  }
  const sort = (p, r) => {
    if (p < r) {
      const q = Math.floor((p + r) / 2)
      calls.push({ p, r, q })
      sort(p, q)
      sort(q + 1, r)
      merge(p, q, r)
    } else calls.push({ p, r, q: null })
  }
  sort(1, input.length)
  return { calls, merges, result: A.slice(1) }
}

test('materi 6 bersih dari error dan saran', () => {
  assert.deepEqual(checkMarkdown(md), [])
})

test('materi 6 memakai komponen yang sama dengan materi 1 sampai 5', () => {
  const types = segs.map((s) => s.type)
  for (const t of ['steps', 'quiz', 'reveal', 'visualizer', 'challenge']) assert.ok(types.includes(t), `belum ada komponen ${t}`)
  assert.equal(types.at(-1), 'challenge', 'soal challenge tetap paling akhir')
  assert.deepEqual(meta.visualizer, ['mergeSort', 'mergeSortTree'])
  const steps = segs.filter((s) => s.type === 'steps')
  assert.deepEqual(steps.map((s) => s.items.length), [3, 5, 4, 6], 'tahap D&C, arti 5 langkah, running time, penelusuran contoh soal')
  assert.equal(segs.filter((s) => s.type === 'quiz').length, 4, 'kuis di bagian A sampai D')
  assert.equal(segs.filter((s) => s.type === 'reveal').length, 1, 'kelanjutan latihan')
  assert.match(segs[types.indexOf('visualizer') + 1].text, /^## F\. Rangkuman/, 'teks sesudah penanda diawali judul ##')
})

test('daftar isi sidebar materi 6', () => {
  const items = buildToc(segs, { visualizers: [{ id: 'mergeSort' }, { id: 'mergeSortTree' }] })
  assert.deepEqual(items.filter((i) => i.level === 2).map((i) => i.text), [
    'A. Konsep Divide and Conquer',
    'B. Algoritma Merge Sort',
    'C. Analisis Running Time',
    'D. Contoh Soal',
    'E. Mencoba Visualisasi Merge Sort',
    'Visualisasi',
    'F. Rangkuman',
    'Soal Challenge',
  ])
  assert.deepEqual(items.filter((i) => i.level === 3).map((i) => i.text), ['Contoh: Array dengan 7 Bilangan', 'Algoritma MERGE'])
})

test('gambar ada di berkas dan dirujuk dengan teks alternatif', () => {
  for (const f of ['diagram-merge-sort', 'pseudocode-merge']) {
    assert.ok(existsSync(join(root, `public/materi/merge-sort/${f}.png`)), f)
    assert.ok(md.includes(`](/materi/merge-sort/${f}.png)`), f)
  }
  for (const m of md.matchAll(/!\[([^\]]*)\]\(/g)) assert.ok(m[1].length > 40, 'teks alternatif cukup deskriptif')
})

test('pseudocode MERGE_SORT: 5 baris tanpa nomor tulisan tangan, sama dengan yang dirujuk slide', () => {
  const block = /```pseudocode\n([\s\S]*?)```/.exec(md)[1].trimEnd().split('\n').map((l) => l.trim())
  assert.equal(block.length, 5)
  assert.ok(block.every((l) => !/^\s*\d+[.)]?\s/.test(l)), 'tidak ada nomor tulisan tangan')
  assert.match(block[0], /^if p < r$/)
  assert.match(block[1].trim(), /q = ⌊\(p \+ r\)\/2⌋/)
  assert.match(block[4].trim(), /^MERGE\(A, p, q, r\)$/)
  assert.match(block[2].trim(), /^MERGE_SORT\(A, p, q\)$/)
  assert.match(block[3].trim(), /^MERGE_SORT\(A, q\+1, r\)$/)
  const steps = segs.find((s) => s.type === 'steps' && s.items.length === 5)
  assert.deepEqual(
    steps.items.map((i) => i.title.slice(0, 9)),
    ['Langkah 1', 'Langkah 2', 'Langkah 3', 'Langkah 4', 'Langkah 5'],
  )
})

test('penelusuran contoh soal {3, 10, 8, 20, 5} sama dengan eksekusi pseudocode', () => {
  const r = run([3, 10, 8, 20, 5])
  assert.deepEqual(r.result, [3, 5, 8, 10, 20])
  assert.deepEqual(
    r.calls.map((c) => `${c.p},${c.r}`),
    ['1,5', '1,3', '1,2', '1,1', '2,2', '3,3', '4,5', '4,4', '5,5'],
    'urutan pemanggilan',
  )
  assert.deepEqual(r.calls.filter((c) => c.q !== null).map((c) => [c.p, c.r, c.q]), [[1, 5, 3], [1, 3, 2], [1, 2, 1], [4, 5, 4]])
  assert.deepEqual(r.merges.map((m) => m.args), [[1, 1, 2], [1, 2, 3], [4, 4, 5], [1, 3, 5]], 'urutan MERGE')
  assert.deepEqual(r.merges.map((m) => m.A.join('  ')), ['3  10  8  20  5', '3  8  10  20  5', '3  8  10  5  20', '3  5  8  10  20'])
  // setiap hasil yang disebut di teks dan di kelanjutan latihan ada di berkas
  for (const line of ['A = 3  10  8  20  5', 'A = 3  8  10  20  5', 'A = 3  8  10  5  20', 'A = 3  5  8  10  20']) assert.ok(md.includes(line), line)
  for (const s of ['q = ⌊(1 + 5)/2⌋ = 3', 'q = ⌊(1 + 3)/2⌋ = 2', 'q = ⌊(1 + 2)/2⌋ = 1', 'q = ⌊(4 + 5)/2⌋ = 4']) assert.ok(md.includes(s), s)
  for (const s of ['MERGE(A, 1, 1, 2)', 'MERGE(A, 1, 2, 3)', 'MERGE(A, 4, 4, 5)', 'MERGE(A, 1, 3, 5)']) assert.ok(md.includes(s), s)
})

test('contoh 7 bilangan: q = 4 dan hasil antara pada diagram', () => {
  const r = run([38, 27, 43, 3, 9, 82, 10])
  assert.equal(r.calls[0].q, 4)
  assert.equal(Math.floor(7 / 2), 3)
  assert.deepEqual(
    r.merges.map((m) => m.part.join(' ')),
    ['27 38', '3 43', '3 27 38 43', '9 82', '9 10 82', '3 9 10 27 38 43 82'],
    'diagram: tiap penggabungan',
  )
  for (const s of ['3 27 38 43 dan 9 10 82', '3 9 10 27 38 43 82', 'q = ⌊(1 + 7)/2⌋ = 4']) assert.ok(md.includes(s), s)
})

test('pembanding sama dengan sort biasa pada 500 array acak (termasuk nilai kembar dan negatif)', () => {
  let seed = 777
  const rnd = (m) => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    return seed % m
  }
  for (let i = 0; i < 500; i++) {
    const a = Array.from({ length: rnd(12) + 1 }, () => rnd(21) - 10)
    assert.deepEqual(run(a).result, [...a].sort((x, y) => x - y), a.join(','))
  }
})

test('contoh di bagian visualisasi bisa dimasukkan dan menghasilkan array terurut', () => {
  for (const text of ['38 27 43 3 9 82 10', '3 10 8 20 5']) {
    const r = parseArrayInput(text)
    assert.ok(r.ok, text)
    const bars = mergeSortSteps(r.values)
    assert.deepEqual(bars.at(-1).array, [...r.values].sort((x, y) => x - y))
    assert.ok(mergeSortTreeSteps(r.values).length > 1)
  }
  assert.ok(parseArrayInput('1 2 3 4 5 6 7 8').ok, 'sampai 8 bilangan')
  assert.equal(parseArrayInput('1 2 3 4 5 6 7 8 9').ok, false, 'lebih dari 8 ditolak, sesuai teks')
  assert.ok(md.includes('sampai 8 bilangan'))
})

test('rumus running time di teks: T(n) = 2T(n/2) + Θ(n) dan penjumlahan D, conquer, combine', () => {
  for (const s of ['D(n) = Θ(1)', 'C(n) = Θ(n)', '2T(n/2)', '= 2T(n/2) + Θ(n),   untuk n > 1', 'T(n) = 2T(n/2) + Θ(n), untuk n > 1', 'T(n) = D(n) + 2T(n/2) + C(n)']) assert.ok(md.includes(s), s)
  // MERGE menyentuh tiap bilangan sekali: jumlah isian A[k] pada satu tingkat rekursi sama dengan n.
  for (const n of [2, 4, 8, 16, 32]) {
    const a = Array.from({ length: n }, (_, i) => n - i)
    const r = run(a)
    const perLevel = {}
    for (const m of r.merges) {
      const len = m.args[2] - m.args[0] + 1
      perLevel[len] = (perLevel[len] ?? 0) + len
    }
    for (const total of Object.values(perLevel)) assert.equal(total, n, `n = ${n}: tiap tingkat menyentuh n elemen`)
  }
})

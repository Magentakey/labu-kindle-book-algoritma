import test from 'node:test'
import assert from 'node:assert/strict'
import { mergeSortCode, mergeSortExecLines, mergeSortTrace } from './mergeSortExact.js'
import { mergeSortExactView } from './exactViews.js'
import { STATUS } from '../components/BarChart/statuses.js'

const cases = [[], [1], [2, 1], [5, 2, 4], [1, 1, 0], [3, 3, 3], [1, 2, 3, 4], [8, 7, 6, 5, 4, 3, 2, 1], [9, -1, 0, 4, 4, 2], [6, 3, 8, 1, 5, 2]]
const sortedCopy = (a) => [...a].sort((x, y) => x - y)
const codeLines = mergeSortCode.split('\n')

function countByLine(steps) {
  const c = Object.fromEntries(mergeSortExecLines.map((l) => [l, 0]))
  for (const s of steps) c[s.line]++
  return c
}

// Penghitung terpisah yang ditulis ulang dari nol (tanpa merekam langkah), sebagai pembanding.
function expectedCounts(input) {
  const c = Object.fromEntries(mergeSortExecLines.map((l) => [l, 0]))
  const arr = [...input]
  function merge(lo, mid, hi) {
    c[9]++, c[10]++, c[11]++
    let i = lo
    let j = mid + 1
    const tmp = []
    for (;;) {
      c[12]++
      if (!(i <= mid && j <= hi)) break
      c[13]++
      if (arr[i] <= arr[j]) tmp.push(arr[i++])
      else (c[14]++, tmp.push(arr[j++]))
    }
    for (;;) {
      c[16]++
      if (!(i <= mid)) break
      tmp.push(arr[i++])
    }
    for (;;) {
      c[17]++
      if (!(j <= hi)) break
      tmp.push(arr[j++])
    }
    for (let k = 0; ; k++) {
      c[18]++
      if (!(k < tmp.length)) break
      arr[lo + k] = tmp[k]
    }
  }
  function sort(lo, hi) {
    c[1]++, c[2]++
    if (lo >= hi) return
    const mid = Math.floor((lo + hi) / 2)
    c[3]++, c[4]++
    sort(lo, mid)
    c[5]++
    sort(mid + 1, hi)
    c[6]++
    merge(lo, mid, hi)
  }
  sort(0, input.length - 1)
  return c
}

test('hasil akhir terurut, array masukan tidak diubah, dan langkah terakhir bertanda final', () => {
  for (const c of cases) {
    const copy = [...c]
    const steps = mergeSortTrace(c)
    assert.deepEqual(steps.at(-1).array, sortedCopy(c), JSON.stringify(c))
    assert.deepEqual(c, copy)
    assert.equal(steps.filter((s) => s.final).length, 1)
    assert.equal(steps.at(-1).final, true)
  }
})

test('hasil sama dengan menjalankan kode yang ditampilkan (200 array acak)', () => {
  const fn = new Function(`${mergeSortCode}\nreturn (a) => { mergeSort(a); return a }`)()
  for (let t = 0; t < 200; t++) {
    const a = Array.from({ length: Math.floor(Math.random() * 12) }, () => Math.floor(Math.random() * 20) - 5)
    assert.deepEqual(mergeSortTrace(a).at(-1).array, fn([...a]), JSON.stringify(a))
  }
})

test('hitungan tiap baris sama dengan penghitung terpisah (300 array acak dan kasus tepi)', () => {
  const random = Array.from({ length: 300 }, () => Array.from({ length: Math.floor(Math.random() * 13) }, () => Math.floor(Math.random() * 15) - 5))
  for (const a of [...cases, ...random]) {
    assert.deepEqual(countByLine(mergeSortTrace(a)), expectedCounts(a), JSON.stringify(a))
  }
})

test('rumus: 2n-1 panggilan, n-1 penggabungan, dan identitas antar baris', () => {
  for (let n = 0; n <= 12; n++) {
    const a = Array.from({ length: n }, () => Math.floor(Math.random() * 10))
    const c = countByLine(mergeSortTrace(a))
    const merges = Math.max(n - 1, 0)
    assert.equal(c[1], Math.max(2 * n - 1, 1), `panggilan mergeSort, n=${n}`)
    assert.equal(c[2], c[1])
    assert.equal(c[3], merges)
    assert.equal(c[4], merges)
    assert.equal(c[5], merges)
    assert.equal(c[6], merges)
    for (const l of [9, 10, 11]) assert.equal(c[l], merges, `baris ${l}, n=${n}`)
    assert.equal(c[12], c[13] + merges, 'tiap penggabungan punya satu pemeriksaan while yang gagal')
    // elemen yang dipindah ke penampung = perbandingan + sisa kiri + sisa kanan; semuanya disalin kembali
    assert.equal(c[13] + (c[16] - merges) + (c[17] - merges), c[18] - merges)
  }
})

test('jumlah perbandingan (baris 13) sama dengan menjalankan kode asli yang menghitung perbandingan', () => {
  const real = new Function(`${mergeSortCode}\nreturn (a) => mergeSort(a)`)()
  for (let t = 0; t < 100; t++) {
    const a = Array.from({ length: Math.floor(Math.random() * 12) }, () => Math.floor(Math.random() * 10))
    let compares = 0
    // `<=` pada dua objek memanggil valueOf dua kali
    const wrapped = a.map((v) => ({ valueOf: () => (compares += 0.5, v) }))
    real(wrapped)
    assert.equal(compares, countByLine(mergeSortTrace(a))[13], JSON.stringify(a))
  }
})

test('setiap langkah: baris valid, teks baris cocok dengan kode, catatan diawali nomor baris', () => {
  const expectText = {
    1: /^function mergeSort/, 2: /if \(lo >= hi\)/, 3: /const mid/, 4: /mergeSort\(arr, lo, mid\)/, 5: /mergeSort\(arr, mid \+ 1, hi\)/,
    6: /merge\(arr, lo, mid, hi\)/, 9: /^function merge/, 10: /const tmp/, 11: /let i = lo/, 12: /while \(i <= mid && j <= hi\)/,
    13: /if \(arr\[i\] <= arr\[j\]\)/, 14: /else tmp\.push\(arr\[j\+\+\]\)/, 16: /while \(i <= mid\)/, 17: /while \(j <= hi\)/, 18: /for \(let k/,
  }
  for (const c of cases) {
    for (const s of mergeSortTrace(c)) {
      assert.ok(mergeSortExecLines.includes(s.line), `baris ${s.line}`)
      assert.match(codeLines[s.line - 1], expectText[s.line], `baris ${s.line}`)
      assert.equal(s.array.length, c.length)
      assert.ok(s.note.startsWith(`Baris ${s.line}:`), s.note)
    }
  }
})

test('tampilan: marks sepanjang array, status terdaftar, penampung selaras', () => {
  for (const c of cases) {
    for (const s of mergeSortTrace(c)) {
      const v = mergeSortExactView(s)
      assert.equal(v.marks.length, c.length)
      assert.ok(v.marks.every((m) => STATUS[m]), `status tak dikenal: ${v.marks}`)
      assert.equal(v.aux.values.length, v.aux.marks.length)
      assert.ok(v.aux.marks.every((m) => STATUS[m]))
    }
  }
})

test('tampilan: rentang aktif di baris 1-2, perbandingan tepat dua bar di baris 13/14, dan final semua terurut', () => {
  const steps = mergeSortTrace([6, 3, 8, 1, 5, 2])
  for (const s of steps) {
    const v = mergeSortExactView(s)
    const n = (m) => v.marks.filter((x) => x === m).length
    if (s.final) assert.equal(n('sorted'), s.array.length)
    else if (s.line === 1 || s.line === 2) assert.equal(n('range') + n('merged'), s.hi - s.lo + 1 > 0 ? v.marks.length - v.marks.filter((x) => x === 'normal').length : 0)
    if ((s.line === 13 || s.line === 14) && !s.final) assert.equal(n('compare'), 2)
    if (s.line === 12 && !s.final) assert.equal(n('compare'), 0)
  }
})

test('baris 18: posisi yang sudah disalin ditandai digabung, sisanya sudah dipindah ke penampung', () => {
  for (const s of mergeSortTrace([6, 3, 8, 1, 5, 2]).filter((x) => x.line === 18 && !x.final)) {
    const v = mergeSortExactView(s)
    for (let k = s.lo; k <= s.hi; k++) assert.equal(v.marks[k], k - s.lo < s.copied ? 'merged' : 'taken')
  }
})

test('pada baris 18 yang gagal (selesai menyalin), seluruh rentang berstatus digabung dan terurut', () => {
  for (const s of mergeSortTrace([6, 3, 8, 1, 5, 2]).filter((x) => x.line === 18 && x.copied === x.tmp.length)) {
    const slice = s.array.slice(s.lo, s.hi + 1)
    assert.deepEqual(slice, sortedCopy(slice))
  }
})

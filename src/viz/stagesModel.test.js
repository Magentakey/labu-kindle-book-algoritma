import test from 'node:test'
import assert from 'node:assert/strict'
import { runTrace, traces } from '../algorithms/traces.js'
import { BAR_GROUP, barLayout } from './barsModel.js'
import { alignIndex, conclusion, insertionStats, mergeCost, mergeStats } from './compareModel.js'
import { buildForest, layoutForest, parseLeaves, parseMerged } from './huffmanModel.js'
import { timelineLayout } from './timelineModel.js'

const run = (key, values) => {
  const r = runTrace(traces[key], values)
  assert.ok(r.ok, r.error)
  return r.steps
}

test('barLayout: tinggi sebanding dengan nilai, ada tinggi minimal, dan semua sama menghasilkan 60%', () => {
  const b = barLayout([1, 5, 9], 300, 100)
  assert.equal(b.length, 3)
  assert.ok(b[0].h < b[1].h && b[1].h < b[2].h)
  assert.equal(Math.round(b[2].h), 100)
  assert.equal(Math.round(b[0].h), 12)
  assert.ok(b.every((x) => Math.abs(x.y + x.h - 100) < 1e-9), 'semua batang berdiri di dasar')
  assert.equal(Math.round(barLayout([4, 4, 4], 300, 100)[0].h), 60)
  assert.deepEqual(barLayout([], 300, 100), [])
  assert.ok(b[1].x > b[0].x && b[0].x >= 0 && b[2].x + b[2].w <= 300)
})

test('tanda array: semua tanda dari peraga punya kelompok warna', () => {
  const marks = new Set()
  const cases = [
    ['insertion-sort', { A: '12, 10, 15, 7, 3' }],
    ['merge-sort', { A: '3, 10, 8, 20, 5' }],
    ['binary-search-iteratif', { A: '5, 8, 9, 10, 14, 20', x: '10' }],
    ['greedy-activity-selector', null],
    ['huffman', null],
    ['matrix-chain-order', null],
  ]
  for (const [k, v] of cases) {
    const d = traces[k]
    const values = v ?? d.presets[0].values
    for (const s of run(k, values)) for (const a of [s.array, ...(s.arrays ?? [])]) if (a) a.marks.forEach((m) => marks.add(m))
  }
  for (const m of marks) assert.ok(BAR_GROUP[m], `tanda ${m} belum punya kelompok`)
  assert.ok(marks.size >= 12)
})

test('timelineLayout: posisi dan lebar sebanding dengan waktu, dan tiap aktivitas satu baris berlabel a1, a2, ...', () => {
  const t = timelineLayout([1, 3, 0], [4, 5, 6], ['chosen', 'skipped', 'normal'], 600)
  assert.equal(t.max, 6)
  assert.deepEqual(t.rows.map((r) => r.label), ['a1', 'a2', 'a3'])
  assert.equal(t.rows[0].x, 100)
  assert.equal(t.rows[0].w, 300)
  assert.equal(t.rows[2].x, 0)
  assert.deepEqual(t.ticks, [0, 1, 2, 3, 4, 5, 6])
  assert.equal(t.rows[1].mark, 'skipped')
  const steps = run('greedy-activity-selector', traces['greedy-activity-selector'].presets[0].values)
  const [s, f] = steps[0].arrays
  assert.equal(timelineLayout(s.values, f.values, s.marks, 500).rows.length, 11)
})

test('parseLeaves dan parseMerged membaca format peraga Huffman', () => {
  assert.deepEqual(parseLeaves('a:45, b:13'), [{ name: 'a', freq: 45 }, { name: 'b', freq: 13 }])
  assert.deepEqual(parseMerged('z1:14 = f:5 (kiri, 0) + e:9 (kanan, 1)'), { name: 'z1', freq: 14, left: 'f', right: 'e' })
  assert.equal(parseMerged('bukan format'), null)
})

test('hutan Huffman contoh materi: awal 6 akar di Q, akhir satu pohon z5 (a + z4) dengan 6 daun dan 5 simpul gabungan', () => {
  const values = traces.huffman.presets[0].values
  const steps = run('huffman', values)
  const first = buildForest(values.C, steps[0])
  assert.equal(first.nodes.size, 6)
  const last = buildForest(values.C, steps.at(-1))
  assert.equal(last.nodes.size, 11)
  assert.deepEqual(last.roots, ['z5'])
  assert.deepEqual([last.nodes.get('z5').left, last.nodes.get('z5').right], ['a', 'z4'])
  assert.ok(Object.values(last.status).every((s) => s === 'done' || s === 'queued' || s === 'active'))
  const lay = layoutForest(last)
  assert.equal(lay.width, 6)
  assert.equal(lay.depth, 4)
  assert.equal(lay.edges.length, 10)
  assert.equal(lay.pos.z5.y, 0)
  // kode a = 0 (bit kiri dari akar), f = 1100
  const bitsTo = (name) => {
    const bits = []
    let cur = name
    while (cur !== 'z5') {
      const e = lay.edges.find((x) => x.to === cur)
      bits.unshift(e.bit)
      cur = e.from
    }
    return bits.join('')
  }
  assert.equal(bitsTo('a'), '0')
  assert.equal(bitsTo('f'), '1100')
  assert.equal(bitsTo('d'), '111')
})

test('hutan Huffman: setiap langkah menghasilkan hutan sah (semua simpul tertata, akar bertambah sedikit, tidak ada simpul hilang)', () => {
  for (const p of traces.huffman.presets) {
    const steps = run('huffman', p.values)
    const n = parseLeaves(p.values.C).length
    let prevNodes = 0
    for (const s of steps) {
      const f = buildForest(p.values.C, s)
      assert.ok(f.nodes.size >= prevNodes && f.nodes.size >= n, 'simpul tidak berkurang')
      prevNodes = f.nodes.size
      const lay = layoutForest(f)
      assert.equal(Object.keys(lay.pos).length, f.nodes.size, 'semua simpul punya posisi')
      assert.ok(f.roots.length >= 1 && f.roots.length <= n)
    }
    assert.equal(buildForest(p.values.C, steps.at(-1)).roots.length, 1, `${p.label}: satu pohon di akhir`)
  }
})

test('insertionStats: hitungan kumulatif tidak turun dan total cocok dengan simulasi Insertion Sort biasa', () => {
  const A = [12, 10, 15, 7, 3, 9, 4, 1]
  const stats = insertionStats(run('insertion-sort', { A: A.join(', ') }))
  let comps = 0
  let shifts = 0
  const a = [...A]
  for (let j = 1; j < a.length; j++) {
    const key = a[j]
    let i = j - 1
    while (i >= 0) {
      comps += 1
      if (a[i] > key) { a[i + 1] = a[i]; shifts += 1; i -= 1 } else break
    }
    a[i + 1] = key
  }
  const last = stats.at(-1)
  assert.equal(last.comparisons, comps)
  assert.equal(last.detail, shifts)
  assert.equal(last.writes, shifts + (A.length - 1))
  for (let i = 1; i < stats.length; i++) for (const k of ['comparisons', 'writes', 'detail']) assert.ok(stats[i][k] >= stats[i - 1][k])
})

test('mergeCost dan mergeStats: total cocok dengan Merge Sort dua penunjuk biasa', () => {
  assert.deepEqual(mergeCost([1, 4], [2, 3]), { comparisons: 3, writes: 4 })
  assert.deepEqual(mergeCost([1, 2], [5, 6]), { comparisons: 2, writes: 4 })
  assert.deepEqual(mergeCost([], [1]), { comparisons: 0, writes: 1 })
  for (const A of [[3, 10, 8, 20, 5], [8, 7, 6, 5, 4, 3, 2, 1], [1, 2, 3, 4], [5]]) {
    let comps = 0
    let writes = 0
    const sort = (arr) => {
      if (arr.length <= 1) return arr
      const q = Math.floor(arr.length / 2)
      const l = sort(arr.slice(0, q))
      const r = sort(arr.slice(q))
      const c = mergeCost(l, r)
      comps += c.comparisons
      writes += c.writes
      return [...l, ...r].sort((x, y) => x - y)
    }
    sort(A)
    const last = mergeStats(run('merge-sort', { A: A.join(', ') })).at(-1)
    assert.equal(last.comparisons, comps, `perbandingan ${A}`)
    assert.equal(last.writes, writes, `penulisan ${A}`)
  }
})

test('alignIndex: dua algoritma selesai bersamaan, dan langkah awal serta akhir tepat', () => {
  assert.equal(alignIndex(0, 66, 28), 0)
  assert.equal(alignIndex(65, 66, 28), 27)
  assert.equal(alignIndex(65, 66, 66), 65)
  assert.equal(alignIndex(33, 67, 11), 5)
  assert.equal(alignIndex(5, 1, 1), 0)
  assert.equal(alignIndex(5, 10, 0), 0)
})

test('conclusion: kalimat "X lebih baik dalam ... daripada Y (a vs b)", sama, dan sementara atau akhir', () => {
  const ins = { name: 'Insertion Sort', stats: { comparisons: 21, writes: 15 }, big: 'O(n²)' }
  const mer = { name: 'Merge Sort', stats: { comparisons: 18, writes: 24 }, big: 'Θ(n lg n)' }
  const c = conclusion(ins, mer, false)
  assert.equal(c[0], 'Merge Sort lebih baik dalam jumlah perbandingan daripada Insertion Sort (18 vs 21).')
  assert.equal(c[1], 'Insertion Sort lebih baik dalam jumlah penulisan ke array daripada Merge Sort (15 vs 24).')
  assert.match(c[2], /Insertion Sort O\(n²\) dan Merge Sort Θ\(n lg n\)/)
  assert.match(c[3], /baru berdasarkan langkah yang sudah berjalan/)
  assert.match(conclusion(ins, mer, true).at(-1), /seluruh langkah/)
  const same = conclusion({ ...ins, stats: { comparisons: 5, writes: 5 } }, { ...mer, stats: { comparisons: 5, writes: 5 } }, true)
  assert.match(same[0], /Keduanya sama dalam jumlah perbandingan \(5\)/)
  const none = conclusion({ ...ins, stats: { comparisons: 0, writes: 0 } }, { ...mer, stats: { comparisons: 0, writes: 0 } }, false)
  assert.equal(none.length, 2, 'belum ada operasi: hanya catatan asimtotik dan status')
})

test('pasangan perbandingan: kedua algoritma terdaftar bertampilan batang dan punya fungsi hitung', async () => {
  const { comparePairs, comparePresets, vizConfig } = await import('./vizConfig.js')
  const { statsById } = await import('./compareModel.js')
  assert.deepEqual(comparePairs, [{ a: 'insertion-sort', b: 'merge-sort', faster: 'merge-sort' }])
  for (const p of comparePairs) {
    for (const id of [p.a, p.b]) {
      assert.equal(vizConfig[id].stage, 'bars')
      assert.ok(statsById[id], `statistik ${id}`)
    }
    assert.ok([p.a, p.b].includes(p.faster))
  }
  for (const preset of comparePresets) {
    const n = preset.values.A.split(',').length
    assert.ok(n <= 8, `${preset.label}: batas peraga 8 angka`)
    for (const k of ['insertion-sort', 'merge-sort']) assert.ok(runTrace(traces[k], preset.values).ok, `${preset.label} / ${k}`)
  }
})

test('Bandingkan: pada preset "Terbalik" Insertion Sort melakukan lebih banyak perbandingan dan pada "Sudah terurut" jauh lebih sedikit', async () => {
  const { comparePresets } = await import('./vizConfig.js')
  const total = (preset) => {
    const a = insertionStats(run('insertion-sort', preset.values)).at(-1)
    const b = mergeStats(run('merge-sort', preset.values)).at(-1)
    return { a, b }
  }
  const rev = total(comparePresets.find((p) => p.label === 'Terbalik'))
  assert.equal(rev.a.comparisons, 28, 'n(n-1)/2 untuk n = 8')
  assert.ok(rev.a.comparisons > rev.b.comparisons)
  const sorted = total(comparePresets.find((p) => p.label === 'Sudah terurut'))
  assert.equal(sorted.a.comparisons, 7, 'n - 1 untuk data terurut')
  assert.ok(sorted.a.comparisons < sorted.b.comparisons)
  assert.equal(sorted.a.detail, 0, 'tidak ada pergeseran')
})

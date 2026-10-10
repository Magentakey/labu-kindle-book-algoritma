import test from 'node:test'
import assert from 'node:assert/strict'
import { TREE_STATUS } from '../components/TreeCanvas/treeStatuses.js'
import { buildBinaryTree } from '../lib/binaryTree.js'
import { layoutForest } from '../lib/treeLayout.js'
import { bfsTreeCode, bfsTreeSteps } from './bfsTree.js'
import { dfsTreeCode, dfsTreeSteps } from './dfsTree.js'
import { mergeSortTreeCode, mergeSortTreeSteps } from './mergeSortTree.js'
import { formatHuffmanInput, huffmanCodes, huffmanTreeCode, huffmanTreeSteps, parseHuffmanInput } from './huffmanTree.js'
import { formatRecurrenceInput, parseRecurrenceInput, recurrenceFormula, recurrenceTreeCode, recurrenceTreeSteps } from './recurrenceTree.js'
import { readFileSync } from 'node:fs'
import { visualizers } from './registry.js'

const trees = [
  [1, 2, 3, 4, 5],
  [1],
  [1, 2, null, 3, null, 4],
  [1, null, 2, null, 3],
  [8, 3, 10, 1, 6, null, 14, null, null, 4, 7, 13],
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
]
const arrays = [[1], [2, 1], [5, 2, 4], [6, 3, 8, 1, 5, 2], [8, 7, 6, 5, 4, 3, 2, 1], [3, 3, 3], [1, 1, 0]]
const recurrences = [
  { a: 2, b: 2, c: 1, k: 3 },
  { a: 1, b: 2, c: 0, k: 3 },
  { a: 3, b: 2, c: 1, k: 3 },
  { a: 2, b: 2, c: 2, k: 3 },
  { a: 3, b: 4, c: 2, k: 1 },
  { a: 3, b: 3, c: 0, k: 3 },
]
const huffmans = [
  [['A', 5], ['B', 9], ['C', 12], ['D', 13], ['E', 16], ['F', 45]],
  [['A', 1], ['B', 1]],
  [['A', 1], ['B', 1], ['C', 2], ['D', 3], ['E', 5], ['F', 8]],
  [['A', 3], ['B', 3], ['C', 3], ['D', 3]],
  [['A', 1], ['B', 2], ['C', 4], ['D', 8], ['E', 16], ['F', 32], ['G', 64], ['H', 99]],
].map((l) => l.map(([sym, freq]) => ({ sym, freq })))

/** Pemeriksaan umum untuk semua generator pohon. */
function checkSteps(steps, code, name) {
  const lines = code.trim().split('\n').length
  assert.ok(steps.length > 0, `${name}: tidak ada langkah`)
  for (const [i, s] of steps.entries()) {
    const where = `${name} langkah ${i + 1}`
    assert.ok(s.line === null || (Number.isInteger(s.line) && s.line >= 1 && s.line <= lines), `${where}: baris ${s.line} di luar kode`)
    assert.ok(typeof s.note === 'string' && s.note.length > 0, `${where}: catatan kosong`)
    const ids = s.view.nodes.map((n) => n.id)
    assert.equal(new Set(ids).size, ids.length, `${where}: id simpul ganda`)
    for (const n of s.view.nodes) {
      assert.ok(n.parent === null || ids.includes(n.parent), `${where}: induk ${n.parent} tidak ada`)
      assert.ok(TREE_STATUS[n.mark], `${where}: status tak dikenal ${n.mark}`)
      assert.equal(typeof n.label, 'string')
      assert.ok(n.label.length > 0)
      if (s.view.labels) assert.ok(s.view.labels[n.mark] || n.mark === 'normal', `${where}: status ${n.mark} tanpa keterangan`)
    }
    for (const key of Object.keys(s.view.labels ?? {})) assert.ok(TREE_STATUS[key], `${name}: keterangan untuk status tak dikenal ${key}`)
    // Setiap simpul yang tampil punya posisi dan tidak ada dua simpul di level sama yang bertabrakan.
    const { pos } = layoutForest(s.view.nodes)
    const byDepth = {}
    for (const n of s.view.nodes) {
      assert.ok(pos[n.id], `${where}: simpul ${n.id} tanpa posisi`)
      ;(byDepth[pos[n.id].depth] ??= []).push(pos[n.id].x)
    }
    for (const xs of Object.values(byDepth)) {
      xs.sort((a, b) => a - b)
      for (let k = 1; k < xs.length; k++) assert.ok(xs[k] - xs[k - 1] >= 1 - 1e-9, `${where}: simpul bertabrakan`)
    }
    for (const p of s.view.panels ?? []) {
      if (p.type === 'list') assert.ok(Array.isArray(p.items))
      if (p.type === 'table') for (const r of p.rows) assert.equal(r.length, p.headers.length)
    }
  }
}

const preorder = (tokens) => {
  const { nodes } = buildBinaryTree(tokens)
  const by = Object.fromEntries(nodes.map((n) => [n.id, n]))
  const out = []
  const walk = (id) => {
    if (!id) return
    out.push(by[id].value)
    walk(by[id].left)
    walk(by[id].right)
  }
  walk('n0')
  return out
}
const levelOrder = (tokens) => buildBinaryTree(tokens).nodes.map((n) => n.value)
const panel = (step, title) => step.view.panels.find((p) => p.title.startsWith(title))

// ---------------------------------------------------------------- BFS
test('BFS: semua langkah valid', () => {
  for (const t of trees) checkSteps(bfsTreeSteps(t), bfsTreeCode, `bfs ${t}`)
})

test('BFS: urutan kunjungan akhir = urutan level, dan tiap simpul dikunjungi sekali', () => {
  for (const t of trees) {
    const steps = bfsTreeSteps(t)
    const last = steps[steps.length - 1]
    assert.deepEqual(panel(last, 'Urutan').items.map(Number), levelOrder(t))
    assert.ok(last.view.nodes.every((n) => n.mark === 'visited'))
    assert.deepEqual(panel(last, 'Antrean').items, [])
    assert.equal(last.line, 10)
  }
})

test('BFS: gambar contoh 1,2,3,4,5 mengikuti urutan 1,2,3,4,5 dan antrean berisi 2,3 setelah akar diproses', () => {
  const steps = bfsTreeSteps([1, 2, 3, 4, 5])
  const afterRoot = steps.find((s) => s.line === 8)
  assert.deepEqual(panel(afterRoot, 'Antrean').items, ['2', '3'])
  assert.equal(afterRoot.view.nodes.find((n) => n.label === '1').mark, 'current')
  assert.equal(afterRoot.view.nodes.find((n) => n.label === '2').mark, 'queued')
  assert.equal(afterRoot.view.nodes.find((n) => n.label === '4').mark, 'normal')
})

test('BFS: paling banyak satu simpul current, dan jumlah antrean cocok dengan simpul bertanda queued', () => {
  for (const t of trees) {
    for (const s of bfsTreeSteps(t)) {
      assert.ok(s.view.nodes.filter((n) => n.mark === 'current').length <= 1)
      assert.equal(s.view.nodes.filter((n) => n.mark === 'queued').length, panel(s, 'Antrean').items.length)
    }
  }
})

test('BFS: pohon kosong tidak membuat galat', () => {
  assert.equal(bfsTreeSteps([]).length, 1)
})

// ---------------------------------------------------------------- DFS
test('DFS: semua langkah valid', () => {
  for (const t of trees) checkSteps(dfsTreeSteps(t), dfsTreeCode, `dfs ${t}`)
})

test('DFS: urutan kunjungan akhir = preorder, tumpukan akhir kosong, semua simpul selesai', () => {
  for (const t of trees) {
    const steps = dfsTreeSteps(t)
    const last = steps[steps.length - 1]
    assert.deepEqual(panel(last, 'Urutan').items.map(Number), preorder(t))
    assert.deepEqual(panel(last, 'Tumpukan').items, [])
    assert.ok(last.view.nodes.every((n) => n.mark === 'visited'))
  }
})

test('DFS: gambar contoh dikunjungi 1, 2, 4, 5, 3 (berbeda dari BFS)', () => {
  assert.deepEqual(preorder([1, 2, 3, 4, 5]), [1, 2, 4, 5, 3])
  const last = dfsTreeSteps([1, 2, 3, 4, 5]).at(-1)
  assert.deepEqual(panel(last, 'Urutan').items, ['1', '2', '4', '5', '3'])
})

test('DFS: tumpukan = simpul current + waiting, dengan current di puncak', () => {
  for (const t of trees) {
    for (const s of dfsTreeSteps(t)) {
      const stack = panel(s, 'Tumpukan').items
      const cur = s.view.nodes.filter((n) => n.mark === 'current')
      const wait = s.view.nodes.filter((n) => n.mark === 'waiting')
      assert.equal(cur.length + wait.length, stack.length)
      if (stack.length > 0) {
        assert.equal(cur.length, 1)
        assert.equal(stack.at(-1), `dfs(${cur[0].label})`)
      }
    }
  }
})

// ---------------------------------------------------------------- Merge sort
test('pohon merge sort: semua langkah valid', () => {
  for (const a of arrays) checkSteps(mergeSortTreeSteps(a), mergeSortTreeCode, `mergeTree ${a}`)
})

test('pohon merge sort: akar akhir terurut, semua simpul selesai, jumlah simpul 2n-1', () => {
  for (const a of arrays) {
    const steps = mergeSortTreeSteps(a)
    const last = steps.at(-1)
    const root = last.view.nodes.find((n) => n.parent === null)
    assert.equal(root.label, [...a].sort((x, y) => x - y).join(' '))
    assert.ok(last.view.nodes.every((n) => n.mark === 'merged'))
    assert.equal(last.view.nodes.length, 2 * a.length - 1)
    assert.equal(last.line, 7)
  }
})

test('pohon merge sort: pohon [6,3,8,1,5,2] terbelah 3|3 lalu 2|1', () => {
  const first = mergeSortTreeSteps([6, 3, 8, 1, 5, 2])[0]
  const kids = (id) => first.view.nodes.filter((n) => n.parent === id).map((n) => n.label)
  assert.deepEqual(kids('0-5'), ['6 3 8', '1 5 2'])
  assert.deepEqual(kids('0-2'), ['6 3', '8'])
  assert.deepEqual(kids('0-1'), ['6', '3'])
})

test('pohon merge sort: simpul hanya terurut setelah langkah gabung (baris 6) atau sebagai kasus dasar (baris 2)', () => {
  const steps = mergeSortTreeSteps([6, 3, 8, 1, 5, 2])
  steps.forEach((s, i) => {
    const prev = i === 0 ? null : steps[i - 1]
    for (const n of s.view.nodes.filter((x) => x.mark === 'merged')) {
      const was = prev?.view.nodes.find((x) => x.id === n.id)
      if (was?.mark !== 'merged') assert.ok(s.line === 2 || s.line === 6, `simpul ${n.id} selesai pada baris ${s.line}`)
    }
  })
})

// ---------------------------------------------------------------- Recurrence
test('pohon rekursi: semua langkah valid', () => {
  for (const r of recurrences) checkSteps(recurrenceTreeSteps(r), recurrenceTreeCode, `rec ${formatRecurrenceInput(r)}`)
})

test('pohon rekursi: jumlah simpul per level a^i dan tabel akhir cocok dengan rumus', () => {
  for (const { a, b, c, k } of recurrences) {
    const steps = recurrenceTreeSteps({ a, b, c, k })
    const last = steps.at(-1)
    const n = b ** k
    let grand = 0
    for (let i = 0; i <= k; i++) {
      assert.equal(last.view.nodes.filter((x) => x.id.startsWith(`L${i}-`)).length, a ** i)
      const cost = i === k ? 1 : (n / b ** i) ** c
      grand += a ** i * cost
    }
    const table = last.view.panels[0]
    assert.equal(table.rows.length, k + 2) // k+1 level + baris total
    assert.equal(table.rows.at(-1)[4], String(grand))
    assert.equal(last.line, null)
    assert.ok(last.view.nodes.every((x) => !x.hidden && x.mark === 'visited'))
  }
})

test('pohon rekursi: contoh merge sort 2T(n/2)+n dengan n=8 bernilai 8,8,8,8 dan total 32', () => {
  const last = recurrenceTreeSteps({ a: 2, b: 2, c: 1, k: 3 }).at(-1)
  assert.deepEqual(last.view.panels[0].rows.slice(0, 4).map((r) => r[4]), ['8', '8', '8', '8'])
  assert.equal(last.view.panels[0].rows.at(-1)[4], '32')
  assert.match(last.note, /kasus 2/)
})

test('pohon rekursi: pola kasus 1, 2, dan 3 dikenali dengan benar', () => {
  assert.match(recurrenceTreeSteps({ a: 3, b: 2, c: 1, k: 3 }).at(-1).note, /kasus 1/) // 3 > 2^1
  assert.match(recurrenceTreeSteps({ a: 2, b: 2, c: 2, k: 3 }).at(-1).note, /kasus 3/) // 2 < 2^2
  assert.match(recurrenceTreeSteps({ a: 1, b: 2, c: 0, k: 3 }).at(-1).note, /kasus 2/) // binary search
})

test('pohon rekursi: level muncul bertahap, simpul tersembunyi tetap punya posisi', () => {
  const steps = recurrenceTreeSteps({ a: 2, b: 2, c: 1, k: 3 })
  assert.equal(steps[0].view.nodes.filter((n) => !n.hidden).length, 1)
  const counts = steps.map((s) => s.view.nodes.filter((n) => !n.hidden).length)
  for (let i = 1; i < counts.length; i++) assert.ok(counts[i] >= counts[i - 1], 'simpul tidak boleh hilang lagi')
  assert.equal(counts.at(-1), 15)
})

test('parseRecurrenceInput: valid, batas, dan galat', () => {
  assert.deepEqual(parseRecurrenceInput('2, 2, 1, 3'), { ok: true, value: { a: 2, b: 2, c: 1, k: 3 } })
  for (const bad of ['', '2,2,1', '2,2,1,3,4', '0,2,1,3', '4,2,1,3', '2,1,1,3', '2,2,3,3', '2,2,1,4', 'a,2,1,3', '2,2,-1,3']) {
    assert.equal(parseRecurrenceInput(bad).ok, false, `seharusnya ditolak: "${bad}"`)
  }
  assert.equal(recurrenceFormula({ a: 2, b: 2, c: 1 }), 'T(n) = 2T(n/2) + n')
  assert.equal(recurrenceFormula({ a: 1, b: 2, c: 0 }), 'T(n) = T(n/2) + 1')
  assert.equal(recurrenceFormula({ a: 3, b: 4, c: 2 }), 'T(n) = 3T(n/4) + n²')
})

// ---------------------------------------------------------------- Huffman
/** Pembanding: biaya Huffman optimal = jumlah semua frekuensi simpul gabungan. */
function optimalCost(items) {
  const q = items.map((x) => x.freq).sort((a, b) => a - b)
  let cost = 0
  while (q.length > 1) {
    const s = q.shift() + q.shift()
    cost += s
    q.push(s)
    q.sort((a, b) => a - b)
  }
  return cost
}

test('Huffman: semua langkah valid', () => {
  for (const h of huffmans) checkSteps(huffmanTreeSteps(h), huffmanTreeCode, `huffman ${formatHuffmanInput(h)}`)
})

test('Huffman: kode bebas awalan, panjangnya optimal, dan sama dengan pohon akhir', () => {
  for (const h of huffmans) {
    const last = huffmanTreeSteps(h).at(-1)
    const codes = Object.fromEntries(panel(last, 'Kode').items.map((s) => s.split(' = ')))
    assert.deepEqual(Object.keys(codes).sort(), h.map((x) => x.sym).sort())
    const list = Object.values(codes)
    for (const x of list) for (const y of list) if (x !== y) assert.ok(!y.startsWith(x), `${x} adalah awalan ${y}`)
    const cost = h.reduce((s, x) => s + x.freq * codes[x.sym].length, 0)
    assert.equal(cost, optimalCost(h))
  }
})

test('Huffman: contoh klasik A:5 B:9 C:12 D:13 E:16 F:45 berbiaya 224 dan F berkode 1 bit', () => {
  const last = huffmanTreeSteps(huffmans[0]).at(-1)
  const codes = Object.fromEntries(panel(last, 'Kode').items.map((s) => s.split(' = ')))
  assert.equal(codes.F.length, 1)
  const cost = huffmans[0].reduce((s, x) => s + x.freq * codes[x.sym].length, 0)
  assert.equal(cost, 224)
})

test('Huffman: tiap iterasi memakai urutan baris 3,4,5,6,7 dan jumlah iterasi n-1', () => {
  for (const h of huffmans) {
    const steps = huffmanTreeSteps(h)
    const loop = steps.filter((s) => s.line >= 3 && s.line <= 7).map((s) => s.line)
    assert.equal(loop.length, 5 * (h.length - 1))
    loop.forEach((l, i) => assert.equal(l, 3 + (i % 5)))
    assert.equal(steps[0].line, 2)
    assert.equal(steps.at(-1).line, 9)
  }
})

test('Huffman: antrean selalu terurut naik dan sisi anak berlabel 0 (kiri) dan 1 (kanan)', () => {
  for (const h of huffmans) {
    for (const s of huffmanTreeSteps(h)) {
      const freqs = panel(s, 'Antrean').items.map((t) => Number(t.split(' ')[1]))
      assert.deepEqual(freqs, [...freqs].sort((a, b) => a - b))
      for (const n of s.view.nodes) {
        const kids = s.view.nodes.filter((x) => x.parent === n.id)
        assert.ok(kids.length === 0 || kids.length === 2)
        if (kids.length === 2) assert.deepEqual(kids.map((x) => x.edge), ['0', '1'])
      }
    }
  }
})

test('Huffman: dua simbol menghasilkan kode 0 dan 1; huffmanCodes memberi "0" untuk akar tunggal', () => {
  const last = huffmanTreeSteps([{ sym: 'A', freq: 1 }, { sym: 'B', freq: 1 }]).at(-1)
  assert.deepEqual(panel(last, 'Kode').items.sort(), ['A = 0', 'B = 1'])
  assert.deepEqual(huffmanCodes({ sym: 'X' }), { X: '0' })
})

test('parseHuffmanInput: valid, galat, dan bolak-balik', () => {
  const ok = parseHuffmanInput('A:5, B:9 c:12')
  assert.deepEqual(ok, { ok: true, value: [{ sym: 'A', freq: 5 }, { sym: 'B', freq: 9 }, { sym: 'c', freq: 12 }] })
  assert.deepEqual(parseHuffmanInput(formatHuffmanInput(ok.value)), ok)
  for (const bad of ['', 'A:5', 'A:5, A:6', 'AB:5, C:2', 'A:0, B:1', 'A:100, B:1', 'A=5, B=1', 'A:x, B:1', 'A:1,B:1,C:1,D:1,E:1,F:1,G:1,H:1,I:1']) {
    assert.equal(parseHuffmanInput(bad).ok, false, `seharusnya ditolak: "${bad}"`)
  }
})

// ---------------------------------------------------------------- Registry
test('registry: visualizer pohon lengkap dan siap dipakai komponen', () => {
  const treeKeys = ['mergeSortTree', 'recurrenceTree', 'bfsTree', 'dfsTree', 'huffmanTree']
  for (const key of treeKeys) {
    const v = visualizers[key]
    assert.ok(v, `${key} belum terdaftar`)
    assert.equal(v.kind, 'tree')
    for (const f of ['title', 'code', 'codeLabel', 'canvasLabel', 'inputLabel', 'inputHint']) assert.equal(typeof v[f], 'string', `${key}.${f}`)
    for (const f of ['buildSteps', 'parseInput', 'formatInput']) assert.equal(typeof v[f], 'function', `${key}.${f}`)
    assert.ok(Array.isArray(v.legend) && v.legend.every((k) => TREE_STATUS[k]), `${key}.legend`)
    // Nilai awal dan semua contoh harus lolos parser dan menghasilkan langkah.
    for (const input of [v.initialInput, ...v.presets.map((p) => p.value)]) {
      const parsed = v.parseInput(v.formatInput(input))
      assert.equal(parsed.ok, true, `${key}: ${v.formatInput(input)} ditolak parser`)
      assert.deepEqual(parsed.value, input)
      checkSteps(v.buildSteps(input), v.code, key)
    }
  }
})

test('materials.json: setiap kunci visualizer ada di registry, dan pohon dipakai oleh materi yang tepat', () => {
  const materials = JSON.parse(readFileSync(new URL('../content/materials.json', import.meta.url), 'utf8'))
  for (const m of materials) {
    for (const key of [].concat(m.visualizer ?? [])) assert.ok(visualizers[key], `${m.id}: visualizer "${key}" tidak ada di registry`)
  }
  const keysOf = (id) => [].concat(materials.find((m) => m.id === id).visualizer)
  assert.deepEqual(keysOf('merge-sort'), ['mergeSort', 'mergeSortTree'])
  assert.deepEqual(keysOf('recurrence-master'), ['recurrenceTree'])
  assert.deepEqual(keysOf('greedy-huffman'), ['huffmanTree'])
  assert.deepEqual(keysOf('graph-bfs'), ['bfsTree'])
  assert.deepEqual(keysOf('graph-dfs'), ['dfsTree'])
})

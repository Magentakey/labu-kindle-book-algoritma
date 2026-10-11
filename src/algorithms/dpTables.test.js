import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { DP_STATUS } from '../components/DpTable/dpStatuses.js'
import { seeded } from '../lib/seededRandom.js'
import { visualizers } from './registry.js'
import { formatLcsInput, lcsCode, lcsSteps, lcsString, lcsTable, parseLcsInput, randomLcsInput } from './lcsTable.js'
import {
  formatMatrixChainInput,
  matrixChainCode,
  matrixChainSteps,
  parseMatrixChainInput,
  randomMatrixChainInput,
  solveMatrixChain,
} from './matrixChainTable.js'

// Penanda agar panah tampil sebagai simbol teks, bukan emoji.
const TEXT = '\uFE0E'

// ---------------------------------------------------------------- pembanding independen
/** LCS dengan rekursi murni (tanpa tabel), hanya untuk string kecil. */
const lcsBrute = (x, y) => {
  if (!x || !y) return 0
  if (x.at(-1) === y.at(-1)) return 1 + lcsBrute(x.slice(0, -1), y.slice(0, -1))
  return Math.max(lcsBrute(x.slice(0, -1), y), lcsBrute(x, y.slice(0, -1)))
}
const isSubsequence = (s, t) => {
  let k = 0
  for (const c of t) if (k < s.length && s[k] === c) k++
  return k === s.length
}
/** Biaya minimum rantai matriks dengan rekursi murni. */
const chainBrute = (dims, i = 1, j = dims.length - 1) => {
  if (i === j) return 0
  let best = Infinity
  for (let k = i; k < j; k++) best = Math.min(best, chainBrute(dims, i, k) + chainBrute(dims, k + 1, j) + dims[i - 1] * dims[k] * dims[j])
  return best
}
/** Biaya mengalikan sesuai string pengurungan, mis. "((A1A2)A3)". Mengembalikan { r, c, cost }. */
function evalOrder(str, dims) {
  let pos = 0
  const parse = () => {
    if (str[pos] === 'A') {
      pos++
      let num = ''
      while (/\d/.test(str[pos] ?? '')) num += str[pos++]
      const i = Number(num)
      return { r: dims[i - 1], c: dims[i], cost: 0 }
    }
    assert.equal(str[pos++], '(')
    const a = parse()
    const b = parse()
    assert.equal(str[pos++], ')')
    assert.equal(a.c, b.r, 'ukuran matriks tidak cocok untuk dikalikan')
    return { r: a.r, c: b.c, cost: a.cost + b.cost + a.r * a.c * b.c }
  }
  const out = parse()
  assert.equal(pos, str.length)
  return out
}

/** Pemeriksaan umum untuk langkah tabel DP. */
function checkSteps(steps, code, name) {
  const lines = code.split('\n').length
  assert.ok(steps.length > 0)
  for (const [idx, s] of steps.entries()) {
    const where = `${name} langkah ${idx + 1}`
    assert.ok(s.line === null || (Number.isInteger(s.line) && s.line >= 1 && s.line <= lines), `${where}: baris ${s.line}`)
    assert.ok(typeof s.note === 'string' && s.note.length > 0, `${where}: catatan kosong`)
    const { table, panels, labels } = s.view
    assert.equal(table.cells.length, table.rowHeaders.length, `${where}: jumlah judul baris`)
    for (const row of table.cells) {
      assert.equal(row.length, table.colHeaders.length, `${where}: jumlah judul kolom`)
      for (const c of row) {
        assert.ok(DP_STATUS[c.mark], `${where}: status tak dikenal ${c.mark}`)
        assert.equal(typeof c.text, 'string')
        assert.ok(c.mark !== 'filled' || c.text !== '', `${where}: sel "terisi" tanpa isi`)
        assert.ok(c.mark !== 'empty' || c.text === '', `${where}: sel "kosong" tetapi berisi`)
      }
    }
    for (const k of Object.keys(labels ?? {})) assert.ok(DP_STATUS[k], `${where}: keterangan untuk status tak dikenal ${k}`)
    for (const p of panels) assert.ok(p.type === 'list' ? Array.isArray(p.items) : p.type === 'table')
    assert.ok(table.cells.flat().filter((c) => c.mark === 'current').length <= 1 || name.startsWith('chain-final'), `${where}: lebih dari satu sel current`)
  }
}

// ---------------------------------------------------------------- LCS
const lcsCases = [
  ['ABCBDAB', 'BDCABA'],
  ['A', 'A'],
  ['A', 'B'],
  ['ABC', 'XYZ'],
  ['ALGO', 'ALGO'],
  ['ACE', 'ABCDE'],
  ['AAAA', 'AA'],
  ['abc', 'ABC'],
  ['1234567', '7654321'],
]

test('LCS: tabel dan string sama dengan pembanding rekursi untuk semua string kecil dari {A,B,C}', () => {
  const words = ['']
  for (let len = 1; len <= 4; len++) {
    const prev = words.filter((w) => w.length === len - 1)
    for (const w of prev) for (const c of 'ABC') words.push(w + c)
  }
  let pairs = 0
  for (const x of words) {
    for (const y of words) {
      const expected = lcsBrute(x, y)
      assert.equal(lcsTable(x, y)[x.length][y.length], expected, `${x}/${y}`)
      const s = lcsString(x, y)
      assert.equal(s.length, expected, `${x}/${y}: panjang string`)
      assert.ok(isSubsequence(s, x) && isSubsequence(s, y), `${x}/${y}: ${s} bukan subsequence bersama`)
      pairs++
    }
  }
  assert.ok(pairs > 10000)
})

test('LCS: contoh klasik ABCBDAB dan BDCABA menghasilkan BCBA (panjang 4), 54 langkah', () => {
  const steps = lcsSteps({ x: 'ABCBDAB', y: 'BDCABA' })
  assert.equal(steps.length, 54)
  assert.match(steps.at(-1).note, /"BCBA" dengan panjang 4/)
  assert.deepEqual(steps.at(-1).view.panels[1].items, ['B', 'C', 'B', 'A'])
})

test('LCS: semua langkah valid dan hasil akhir sama dengan pembanding untuk 400 pasangan acak', () => {
  for (const [x, y] of lcsCases) checkSteps(lcsSteps({ x, y }), lcsCode, `lcs ${x}/${y}`)
  for (let seed = 1; seed <= 400; seed++) {
    const { x, y } = randomLcsInput(seeded(seed))
    const steps = lcsSteps({ x, y })
    const result = steps.at(-1).view.panels[1].items.join('')
    assert.equal(result, lcsString(x, y), `seed ${seed}`)
    assert.equal(result.length, lcsBrute(x, y), `seed ${seed}`)
    const t = lcsTable(x, y)
    // Tabel akhir sama dengan tabel referensi, dan tidak ada sel yang masih kosong.
    const cells = steps.at(-1).view.table.cells
    cells.forEach((row, i) => row.forEach((c, j) => assert.equal(c.text, String(t[i][j]), `seed ${seed} sel ${i},${j}`)))
    assert.ok(cells.flat().every((c) => c.mark === 'path' || c.mark === 'filled'))
  }
})

test('LCS: tiap langkah pengisian menandai sel current, sumber yang benar, dan baris 7 (cocok) atau 9 (beda)', () => {
  const x = 'ABCBDAB'
  const y = 'BDCABA'
  const t = lcsTable(x, y)
  const steps = lcsSteps({ x, y })
  const fills = steps.filter((s) => s.line === 7 || s.line === 9)
  assert.equal(fills.length, x.length * y.length)
  let n = 0
  for (let i = 1; i <= x.length; i++) {
    for (let j = 1; j <= y.length; j++) {
      const s = fills[n++]
      const cells = s.view.table.cells
      assert.equal(cells[i][j].mark, 'current')
      assert.equal(cells[i][j].text, String(t[i][j]))
      assert.equal(s.line, x[i - 1] === y[j - 1] ? 7 : 9)
      const sources = []
      cells.forEach((row, r) => row.forEach((c, k) => c.mark === 'source' && sources.push([r, k, c.glyph])))
      if (s.line === 7) assert.deepEqual(sources, [[i - 1, j - 1, `↖${TEXT}`]])
      else assert.deepEqual(sources, [[i - 1, j, `↑${TEXT}`], [i, j - 1, `←${TEXT}`]])
      // Sel yang belum dihitung masih kosong (isi dihitung berurutan baris demi baris).
      for (let r = 1; r <= x.length; r++) for (let k = 1; k <= y.length; k++) {
        const done = r < i || (r === i && k <= j)
        assert.equal(cells[r][k].text !== '', done, `langkah sel ${i},${j}: sel ${r},${k}`)
      }
    }
  }
})

test('LCS: jalur penelusuran balik tersambung dari sel kanan-bawah sampai tepi tabel, dan hanya mengambil karakter pada panah diagonal', () => {
  for (const [x, y] of lcsCases) {
    const final = lcsSteps({ x, y }).at(-1).view.table.cells
    const path = []
    final.forEach((row, i) => row.forEach((c, j) => c.mark === 'path' && path.push([i, j])))
    path.sort((a, b) => b[0] - a[0] || b[1] - a[1])
    assert.deepEqual(path[0], [x.length, y.length], `${x}/${y}: jalur harus mulai di sel kanan-bawah`)
    const end = path.at(-1)
    assert.ok(end[0] === 0 || end[1] === 0, `${x}/${y}: jalur harus berakhir di tepi`)
    for (let k = 1; k < path.length; k++) {
      const di = path[k - 1][0] - path[k][0]
      const dj = path[k - 1][1] - path[k][1]
      assert.ok(di >= 0 && dj >= 0 && di + dj >= 1 && di <= 1 && dj <= 1, `${x}/${y}: lompatan jalur ${path[k - 1]} -> ${path[k]}`)
    }
  }
})

test('LCS: panah memakai simbol teks (bukan emoji) dan panel hasil berjudul "akhir" hanya di langkah terakhir', () => {
  const steps = lcsSteps({ x: 'ABCBDAB', y: 'BDCABA' })
  const glyphs = new Set(steps.flatMap((s) => s.view.table.cells.flat().map((c) => c.glyph).filter(Boolean)))
  assert.deepEqual([...glyphs].sort(), [`↑${TEXT}`, `←${TEXT}`, `↖${TEXT}`].sort())
  assert.equal(steps.at(-1).view.panels[1].title, 'LCS (hasil akhir)')
  assert.ok(steps.slice(0, -1).every((s) => !s.view.panels[1] || s.view.panels[1].title.startsWith('Hasil sementara')))
})

test('LCS: kasus tepi (tanpa kecocokan, sama persis) dan catatan akhirnya', () => {
  const none = lcsSteps({ x: 'ABC', y: 'XYZ' }).at(-1)
  assert.deepEqual(none.view.panels[1].items, [])
  assert.match(none.note, /panjang 0/)
  const same = lcsSteps({ x: 'ALGO', y: 'ALGO' }).at(-1)
  assert.deepEqual(same.view.panels[1].items, ['A', 'L', 'G', 'O'])
})

test('parseLcsInput: valid, batas, dan galat', () => {
  assert.deepEqual(parseLcsInput({ x: ' ABC ', y: 'b1' }), { ok: true, value: { x: 'ABC', y: 'b1' } })
  assert.deepEqual(formatLcsInput({ x: 'AB', y: 'CD' }), { x: 'AB', y: 'CD' })
  assert.equal(parseLcsInput({ x: 'ABCDEFG', y: 'ABCDEFG' }).ok, true) // tepat 7
  for (const bad of [
    { x: '', y: 'A' },
    { x: 'A', y: '   ' },
    { x: 'ABCDEFGH', y: 'A' },
    { x: 'A', y: 'ABCDEFGH' },
    { x: 'A B', y: 'A' },
    { x: 'A', y: 'A,B' },
    { x: 'é', y: 'A' },
    {},
  ]) {
    const r = parseLcsInput(bad)
    assert.equal(r.ok, false, `seharusnya ditolak: ${JSON.stringify(bad)}`)
    assert.ok(r.error.length > 0)
  }
})

test('randomLcsInput: selalu lolos parser, beragam, dan LCS minimal 2', () => {
  const seen = new Set()
  for (let seed = 1; seed <= 400; seed++) {
    const v = randomLcsInput(seeded(seed))
    assert.deepEqual(parseLcsInput(formatLcsInput(v)), { ok: true, value: v })
    assert.ok(lcsString(v.x, v.y).length >= 2)
    seen.add(`${v.x}|${v.y}`)
  }
  assert.ok(seen.size > 200)
})

// ---------------------------------------------------------------- Rantai matriks
test('rantai matriks: biaya sama dengan pembanding rekursi pada 500 ukuran acak, dan pengurungannya benar-benar bernilai optimal', () => {
  for (let seed = 1; seed <= 500; seed++) {
    const dims = randomMatrixChainInput(seeded(seed))
    const { cost, order } = solveMatrixChain(dims)
    assert.equal(cost, chainBrute(dims), `seed ${seed}: ${dims}`)
    assert.equal(evalOrder(order, dims).cost, cost, `seed ${seed}: pengurungan ${order} tidak bernilai ${cost}`)
  }
})

test('rantai matriks: contoh klasik (15125) dan contoh soal [10,30,5,60] (4500)', () => {
  const classic = solveMatrixChain([30, 35, 15, 5, 10, 20, 25])
  assert.equal(classic.cost, 15125)
  assert.equal(classic.order, '((A1(A2A3))((A4A5)A6))')
  const sample = solveMatrixChain([10, 30, 5, 60])
  assert.equal(sample.cost, 4500)
  assert.equal(sample.order, '((A1A2)A3)')
  assert.equal(solveMatrixChain([10, 20, 30]).cost, 6000)
})

test('rantai matriks: semua langkah valid, tabel akhir = tabel referensi, jumlah langkah sesuai rumus', () => {
  const cases = [[30, 35, 15, 5, 10, 20, 25], [10, 30, 5, 60], [10, 20, 30], [10, 10, 10, 10, 10], [1, 1, 1], [99, 1, 99, 1, 99, 1, 99]]
  for (const dims of cases) {
    const steps = matrixChainSteps(dims)
    checkSteps(steps, matrixChainCode, `chain ${dims}`)
    const { n, m, s } = solveMatrixChain(dims)
    // 1 (awal) + sel di atas diagonal (n-1)n/2 + titik potong yang dicoba + 2 (hasil, pengurungan)
    let cuts = 0
    for (let len = 2; len <= n; len++) cuts += (n - len + 1) * (len - 1)
    assert.equal(steps.length, 1 + (n * (n - 1)) / 2 + cuts + 2, `${dims}: jumlah langkah`)
    const cells = steps.at(-1).view.table.cells
    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= n; j++) {
        const c = cells[i - 1][j - 1]
        if (j < i) assert.equal(c.mark, 'unused')
        else {
          assert.equal(c.text, String(m[i][j]), `${dims}: m[${i}][${j}]`)
          if (j > i) assert.equal(c.sub, `k=${s[i][j]}`, `${dims}: s[${i}][${j}]`)
        }
      }
    }
  }
})

test('rantai matriks: tiap titik potong menandai sel current + dua sel sumber (Ki, Ka), dan baris 12 hanya saat lebih kecil', () => {
  const dims = [30, 35, 15, 5, 10, 20, 25]
  const steps = matrixChainSteps(dims)
  const cuts = steps.filter((s) => s.line === 11 || s.line === 12)
  assert.ok(cuts.length > 20)
  for (const s of cuts) {
    const flat = s.view.table.cells.flat()
    assert.equal(flat.filter((c) => c.mark === 'current').length, 1)
    assert.deepEqual(flat.filter((c) => c.mark === 'source').map((c) => c.glyph).sort(), ['Ka', 'Ki'])
    assert.equal(/Tidak lebih kecil/.test(s.note), s.line === 11, 'baris 11 = tidak lebih kecil, baris 12 = lebih kecil')
  }
  // Sel m[i][j] tidak pernah naik selama titik potong dicoba.
  let lastCell = ''
  let lastValue = Infinity
  for (const s of cuts) {
    const key = s.view.panels[0].items.slice(0, 3).join()
    const v = Number(s.view.panels[0].items.at(-1).split('= ')[1])
    if (key === lastCell) assert.ok(v <= lastValue)
    lastCell = key
    lastValue = v
  }
})

test('rantai matriks: sel pada langkah pengurungan = sel yang dikunjungi kurung(), termasuk akar m[1][n]', () => {
  const dims = [30, 35, 15, 5, 10, 20, 25]
  const last = matrixChainSteps(dims).at(-1)
  assert.equal(last.line, 23)
  assert.deepEqual(last.view.panels.at(-1).items, ['((A1(A2A3))((A4A5)A6))'])
  const path = new Set()
  last.view.table.cells.forEach((row, r) => row.forEach((c, k) => c.mark === 'path' && path.add(`${r + 1},${k + 1}`)))
  // Pengurungan ((A1(A2A3))((A4A5)A6)) mengunjungi: (1,6) (1,3) (1,1) (2,3) (2,2) (3,3) (4,6) (4,5) (4,4) (5,5) (6,6)
  assert.deepEqual([...path].sort(), ['1,1', '1,3', '1,6', '2,2', '2,3', '3,3', '4,4', '4,5', '4,6', '5,5', '6,6'])
})

test('parseMatrixChainInput: valid, batas, dan galat', () => {
  assert.deepEqual(parseMatrixChainInput({ dims: '10, 30 5;60' }), { ok: true, value: [10, 30, 5, 60] })
  assert.deepEqual(formatMatrixChainInput([10, 20, 30]), { dims: '10, 20, 30' })
  assert.equal(parseMatrixChainInput({ dims: '1,2,3,4,5,6,7' }).ok, true) // tepat 7 angka
  for (const bad of ['', '10, 20', '1,2,3,4,5,6,7,8', '10, x, 5', '10, 0, 5', '10, 100, 5', '10, -5, 5', '10, 2.5, 5']) {
    const r = parseMatrixChainInput({ dims: bad })
    assert.equal(r.ok, false, `seharusnya ditolak: "${bad}"`)
    assert.ok(r.error.length > 0)
  }
  assert.equal(parseMatrixChainInput({}).ok, false)
})

test('randomMatrixChainInput: selalu lolos parser dan beragam', () => {
  const seen = new Set()
  for (let seed = 1; seed <= 400; seed++) {
    const v = randomMatrixChainInput(seeded(seed))
    assert.deepEqual(parseMatrixChainInput(formatMatrixChainInput(v)), { ok: true, value: v })
    seen.add(v.join())
  }
  assert.ok(seen.size > 300)
})

// ---------------------------------------------------------------- Registry
test('registry: tabel DP lengkap, contoh dan nilai awal lolos parser, dan terhubung ke materinya', () => {
  const materials = JSON.parse(readFileSync(new URL('../content/materials.json', import.meta.url), 'utf8'))
  const link = { lcsTable: 'dp-lcs', matrixChainTable: 'dp-rantai-matriks' }
  for (const [key, id] of Object.entries(link)) {
    const v = visualizers[key]
    assert.equal(v.kind, 'table')
    for (const f of ['title', 'code', 'codeLabel', 'inputHint']) assert.equal(typeof v[f], 'string', `${key}.${f}`)
    for (const f of ['buildSteps', 'parseInput', 'formatInput', 'randomInput']) assert.equal(typeof v[f], 'function', `${key}.${f}`)
    assert.ok(v.legend.every((k) => DP_STATUS[k]))
    assert.ok(v.fields.length > 0 && v.fields.every((f) => f.key && f.label))
    for (const input of [v.initialInput, ...v.presets.map((p) => p.value)]) {
      const fields = v.formatInput(input)
      assert.deepEqual(Object.keys(fields).sort(), v.fields.map((f) => f.key).sort(), `${key}: kunci isian`)
      assert.deepEqual(v.parseInput(fields), { ok: true, value: input }, `${key}: ${JSON.stringify(fields)}`)
      checkSteps(v.buildSteps(input), v.code, key)
    }
    for (let i = 0; i < 50; i++) {
      const value = v.randomInput()
      assert.deepEqual(v.parseInput(v.formatInput(value)), { ok: true, value })
    }
    assert.equal(materials.find((m) => m.id === id).visualizer, key, `${id} harus memakai ${key}`)
  }
})

import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { traces, runTrace } from './traces.js'
import { lcsString, lcsTable } from './lcsTable.js'
import { seeded as seededRandom } from '../lib/seededRandom.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const md = readFileSync(join(root, 'src/content/materials/dp-lcs.md'), 'utf8')
const X0 = 'ABCBDAB'
const Y0 = 'BDCABA'
const strip = (s) => s.replace(/\uFE0E/g, '')

const run = (id, X, Y) => {
  const r = runTrace(traces[id], { X, Y })
  assert.ok(r.ok, r.error)
  return r.steps
}

/** Pembanding independen: LCS-LENGTH ditranslasi baris demi baris dari pseudocode (indeks 1), mencatat baris yang dibaca. */
function refLength(X, Y) {
  const log = []
  const L = (x) => log.push(x)
  L(1)
  const m = X.length
  L(2)
  const n = Y.length
  L(3)
  const c = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  const b = Array.from({ length: m + 1 }, () => Array(n + 1).fill(''))
  let i
  let j
  for (i = 1; (L(4), i <= m); i++) L(5)
  for (j = 0; (L(6), j <= n); j++) L(7)
  for (i = 1; (L(8), i <= m); i++) {
    for (j = 1; (L(9), j <= n); j++) {
      L(10)
      if (X[i - 1] === Y[j - 1]) {
        L(11)
        c[i][j] = c[i - 1][j - 1] + 1
        L(12)
        b[i][j] = '↖'
      } else {
        L(13)
        if (c[i - 1][j] >= c[i][j - 1]) {
          L(14)
          c[i][j] = c[i - 1][j]
          L(15)
          b[i][j] = '↑'
        } else {
          L(16)
          c[i][j] = c[i][j - 1]
          L(17)
          b[i][j] = '←'
        }
      }
    }
  }
  L(18)
  return { log, c, b }
}

/** Pembanding independen: PRINT-LCS apa adanya, mencatat baris yang dibaca, urutan pemanggilan, dan huruf tercetak. */
function refPrint(b, X, i, j, acc = { log: [], calls: [], out: [], depth: 0, maxDepth: 0 }) {
  acc.calls.push([i, j])
  acc.depth++
  acc.maxDepth = Math.max(acc.maxDepth, acc.depth)
  acc.log.push(1)
  if (i === 0 || j === 0) {
    acc.log.push(2)
    acc.depth--
    return acc
  }
  acc.log.push(3)
  if (b[i][j] === '↖') {
    acc.log.push(4)
    refPrint(b, X, i - 1, j - 1, acc)
    acc.log.push(5)
    acc.out.push(X[i - 1])
  } else {
    acc.log.push(6)
    if (b[i][j] === '↑') {
      acc.log.push(7)
      refPrint(b, X, i - 1, j, acc)
    } else {
      acc.log.push(8)
      refPrint(b, X, i, j - 1, acc)
    }
  }
  acc.depth--
  return acc
}

const randomPair = (rng) => {
  const word = () => Array.from({ length: 1 + Math.floor(rng() * 7) }, () => 'ABCD'[Math.floor(rng() * 4)]).join('')
  return [word(), word()]
}

// ---------------------------------------------------------------- LCS-LENGTH
test('LCS-LENGTH: urutan baris sama dengan eksekusi pseudocode apa adanya pada 300 pasangan acak', () => {
  const rng = seededRandom(9)
  for (let t = 0; t < 300; t++) {
    const [X, Y] = randomPair(rng)
    const steps = run('lcs-length', X, Y)
    assert.deepEqual(steps.map((s) => s.line), refLength(X, Y).log, `${X}/${Y}`)
  }
  assert.deepEqual(run('lcs-length', 'A', 'A').map((s) => s.line), refLength('A', 'A').log)
})

test('LCS-LENGTH: tabel c dan b di langkah terakhir sama dengan hitungan, sel demi sel', () => {
  const rng = seededRandom(11)
  for (let t = 0; t < 200; t++) {
    const [X, Y] = randomPair(rng)
    const { c, b } = refLength(X, Y)
    const ref = lcsTable(X, Y)
    const last = run('lcs-length', X, Y).at(-1)
    const cells = last.tables[0].table.cells
    assert.equal(cells.length, X.length + 1)
    for (let i = 0; i <= X.length; i++) {
      for (let j = 0; j <= Y.length; j++) {
        assert.equal(cells[i][j].text, String(c[i][j]), `${X}/${Y} c[${i},${j}]`)
        assert.equal(c[i][j], ref[i][j])
        assert.equal(strip(cells[i][j].sub), i === 0 || j === 0 ? '' : b[i][j], `${X}/${Y} b[${i},${j}]`)
      }
    }
    assert.equal(last.vars.find((v) => v.name === 'm').value, String(X.length))
    assert.match(last.note, new RegExp(`c\\[${X.length},${Y.length}\\] = ${c[X.length][Y.length]}`))
  }
})

test('LCS-LENGTH: c hanya berubah di baris 5, 7, 11, 14, 16 dan b hanya di baris 12, 15, 17, satu sel tiap kali', () => {
  const steps = run('lcs-length', X0, Y0)
  const snap = (s) => s.tables?.[0].table.cells.map((r) => r.map((c) => [c.text, strip(c.sub)])) ?? null
  let prev = null
  for (const s of steps) {
    const cur = snap(s)
    if (prev && cur) {
      let textChanges = 0
      let subChanges = 0
      cur.forEach((row, i) => row.forEach((cell, j) => {
        if (cell[0] !== prev[i][j][0]) textChanges++
        if (cell[1] !== prev[i][j][1]) subChanges++
      }))
      assert.ok(textChanges <= 1 && subChanges <= 1)
      if (textChanges) assert.ok([5, 7, 11, 14, 16].includes(s.line), `c berubah di baris ${s.line}`)
      if (subChanges) assert.ok([12, 15, 17].includes(s.line), `b berubah di baris ${s.line}`)
    }
    prev = cur ?? prev
  }
})

test('LCS-LENGTH: sel sumber sesuai aturan (kiri-atas, atas, kiri) dan angka contoh di materi muncul di langkahnya', () => {
  const steps = run('lcs-length', X0, Y0)
  const glyphAt = (s, i, j) => strip(s.tables[0].table.cells[i][j].glyph ?? '')
  // c[2,1] = c[1,0] + 1 = 1 (materi bagian C): baris 11 dengan sumber kiri-atas
  const s11 = steps.find((s) => s.line === 11 && s.note.includes('c[2,1] = c[1,0] + 1 = 0 + 1 = 1'))
  assert.ok(s11)
  assert.equal(glyphAt(s11, 1, 0), '↖')
  // c[1,1]: sel atas menang saat seri (0 ≥ 0)
  const s13 = steps.find((s) => s.line === 13 && s.note.startsWith('Baris 13: c[0,1] ≥ c[1,0] → 0 ≥ 0 bernilai TRUE'))
  assert.ok(s13)
  assert.equal(glyphAt(s13, 0, 1), '↑')
  assert.equal(glyphAt(s13, 1, 0), '←')
  // c[2,2]: sel kiri menang (0 ≥ 1 salah)
  assert.ok(steps.some((s) => s.line === 16 && s.note === 'Baris 16: c[2,2] = c[2,1] = 1.'))
  assert.ok(steps.some((s) => s.line === 17 && s.note.startsWith('Baris 17: b[2,2] = "←"')))
  // setiap langkah baris 11, 14, 16 punya tepat satu sel sumber
  for (const s of steps.filter((x) => [11, 14, 16].includes(x.line))) {
    const marks = s.tables[0].table.cells.flat().filter((c) => c.mark === 'source')
    assert.equal(marks.length, 1, `baris ${s.line}`)
  }
  assert.equal(steps.length, 247)
})

// ---------------------------------------------------------------- PRINT-LCS
test('PRINT-LCS: baris, urutan pemanggilan, dan huruf tercetak sama dengan eksekusi apa adanya pada 300 pasangan acak', () => {
  const rng = seededRandom(21)
  for (let t = 0; t < 300; t++) {
    const [X, Y] = randomPair(rng)
    const { b } = refLength(X, Y)
    const ref = refPrint(b, X, X.length, Y.length)
    const steps = run('print-lcs', X, Y)
    assert.deepEqual(steps.map((s) => s.line), ref.log, `${X}/${Y}`)
    // urutan pemanggilan = urutan langkah baris 1
    const callsFromSteps = steps.filter((s) => s.line === 1).map((s) => [Number(s.vars[0].value), Number(s.vars[1].value)])
    assert.deepEqual(callsFromSteps, ref.calls)
    // hasil cetak: panjang sama dengan LCS terpanjang dan sama dengan lcsString
    const printed = steps.at(-1).vars.find((v) => v.name === 'Tercetak').value
    const text = ref.out.join('')
    assert.equal(printed, text === '' ? '–' : ref.out.join(' '))
    assert.equal(text, lcsString(X, Y))
    assert.equal(text.length, lcsTable(X, Y)[X.length][Y.length])
    assert.ok(ref.maxDepth <= X.length + Y.length + 1)
    assert.equal(Math.max(...steps.map((s) => s.stack.length)), ref.maxDepth)
  }
})

test('PRINT-LCS: tumpukan panggilan selalu berakhir di pemanggilan yang sedang berjalan', () => {
  const steps = run('print-lcs', X0, Y0)
  assert.equal(steps.length, 34)
  for (const s of steps) {
    const i = s.vars.find((v) => v.name === 'i').value
    const j = s.vars.find((v) => v.name === 'j').value
    assert.equal(s.stack.at(-1), `PRINT-LCS(b, X, ${i}, ${j})`)
    assert.equal(s.stack[0], 'PRINT-LCS(b, X, 7, 6)')
    const current = s.tables[0].table.cells.flat().filter((c) => c.mark === 'current')
    assert.equal(current.length, 1)
  }
  assert.equal(steps[0].stack.length, 1)
  // tumpukan terdalam: 9 pemanggilan (7,6) sampai (1,0)
  assert.equal(Math.max(...steps.map((s) => s.stack.length)), 9)
  // huruf tercetak muncul di baris 5 pada pemanggilan (2,1), (3,3), (4,5), (6,6)
  const prints = steps.filter((s) => s.line === 5).map((s) => [s.vars[0].value, s.vars[1].value, s.vars[3].value])
  assert.deepEqual(prints, [['2', '1', 'B'], ['3', '3', 'C'], ['4', '5', 'B'], ['6', '6', 'A']])
  assert.match(steps.at(-1).note, /Urutan yang tercetak adalah B, C, B, A, jadi LCS-nya adalah BCBA\./)
})

test('PRINT-LCS: tidak ada yang sama menghasilkan LCS kosong', () => {
  const steps = run('print-lcs', 'ABC', 'XYZ')
  assert.equal(steps.at(-1).vars.find((v) => v.name === 'Tercetak').value, '–')
  assert.match(steps.at(-1).note, /LCS-nya kosong/)
})

// ---------------------------------------------------------------- masukan dan teks
test('masukan teks: huruf dan angka saja, 1 sampai 7 karakter, dengan pesan yang menyebut sebabnya', () => {
  const def = traces['lcs-length']
  assert.match(runTrace(def, { X: '', Y: 'AB' }).error, /Barisan X \(baris tabel\) tidak boleh kosong/)
  assert.match(runTrace(def, { X: 'AB', Y: 'A B' }).error, /Barisan Y \(kolom tabel\) hanya boleh berisi huruf dan angka/)
  assert.match(runTrace(def, { X: 'ABCDEFGH', Y: 'AB' }).error, /maksimal 7 karakter \(Anda mengisi 8\)/)
  assert.ok(runTrace(def, { X: 'abc123Z', Y: 'a' }).ok)
  assert.ok(runTrace(traces['print-lcs'], { X: 'A', Y: 'B' }).ok)
})

test('isian awal dan preset kedua peraga sama dengan contoh materi', () => {
  for (const id of ['lcs-length', 'print-lcs']) {
    const def = traces[id]
    assert.deepEqual(def.inputs.map((i) => [i.key, i.value]), [['X', X0], ['Y', Y0]])
    assert.deepEqual(def.presets[0].values, { X: X0, Y: Y0 })
    assert.equal(def.presets.length, 4)
  }
  assert.notEqual(traces['lcs-length'].title, traces['print-lcs'].title)
})

test('pseudocode peraga sama persis dengan blok pseudocode di materi 9', () => {
  const blocks = [...md.matchAll(/```pseudocode\n([\s\S]*?)```/g)].map((m) => m[1].trimEnd())
  assert.equal(blocks.length, 2)
  assert.equal(traces['lcs-length'].code, blocks[0])
  assert.equal(traces['print-lcs'].code, blocks[1])
  assert.equal(traces['lcs-length'].code.split('\n').length, 18)
  assert.equal(traces['print-lcs'].code.split('\n').length, 8)
})

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { checkMarkdown } from '../lib/checkMarkdown.js'
import { splitContent } from '../lib/splitContent.js'
import { buildToc } from '../lib/tableOfContents.js'
import { lcsString, lcsTable } from '../algorithms/lcsTable.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const md = readFileSync(join(root, 'src/content/materials/dp-lcs.md'), 'utf8')
const meta = JSON.parse(readFileSync(join(root, 'src/content/materials.json'), 'utf8')).find((m) => m.id === 'dp-lcs')
const challenge = JSON.parse(readFileSync(join(root, 'src/content/challenges/dp-lcs.json'), 'utf8'))
const segs = splitContent(md, { hasVisualizer: Boolean(meta.visualizer), hasChallenge: Boolean(meta.challenge) })

const X = 'ABCBDAB'
const Y = 'BDCABA'
const m = X.length
const n = Y.length

// ---------------------------------------------------------------- pembanding independen
/** Panjang LCS dengan rekursi murni (tanpa tabel). */
const lcsLen = (a, b) => {
  if (!a.length || !b.length) return 0
  if (a.at(-1) === b.at(-1)) return 1 + lcsLen(a.slice(0, -1), b.slice(0, -1))
  return Math.max(lcsLen(a.slice(0, -1), b), lcsLen(a, b.slice(0, -1)))
}

/** Semua subbarisan tak kosong sebuah string (dengan daftar indeks 1-based). */
function allSubsequences(s) {
  const out = []
  for (let mask = 1; mask < 1 << s.length; mask++) {
    const idx = []
    for (let k = 0; k < s.length; k++) if (mask & (1 << k)) idx.push(k + 1)
    out.push({ text: idx.map((i) => s[i - 1]).join(''), idx })
  }
  return out
}

/** Tabel c dan b menurut pseudocode di dokumen, ditulis ulang apa adanya dengan indeks 1. */
function cb(x, y) {
  const c = Array.from({ length: x.length + 1 }, () => Array(y.length + 1).fill(0))
  const b = Array.from({ length: x.length + 1 }, () => Array(y.length + 1).fill(''))
  for (let i = 1; i <= x.length; i++) {
    for (let j = 1; j <= y.length; j++) {
      if (x[i - 1] === y[j - 1]) {
        c[i][j] = c[i - 1][j - 1] + 1
        b[i][j] = '↖'
      } else if (c[i - 1][j] >= c[i][j - 1]) {
        c[i][j] = c[i - 1][j]
        b[i][j] = '↑'
      } else {
        c[i][j] = c[i][j - 1]
        b[i][j] = '←'
      }
    }
  }
  return { c, b }
}

/** PRINT-LCS apa adanya: mengembalikan daftar pemanggilan (urutan masuk) dan urutan cetak. */
function printLcs(b, x, i, j, calls = [], printed = []) {
  calls.push([i, j])
  if (i === 0 || j === 0) return { calls, printed }
  if (b[i][j] === '↖') {
    printLcs(b, x, i - 1, j - 1, calls, printed)
    printed.push({ i, ch: x[i - 1] })
  } else if (b[i][j] === '↑') printLcs(b, x, i - 1, j, calls, printed)
  else printLcs(b, x, i, j - 1, calls, printed)
  return { calls, printed }
}

/** Membaca tabel Markdown yang baris judulnya diawali prefix, menjadi matriks teks. */
function readTable(prefix) {
  const lines = md.split('\n')
  const start = lines.findIndex((l) => l.startsWith(prefix))
  assert.ok(start >= 0, `tabel "${prefix}" ada`)
  const rows = []
  for (let i = start + 2; i < lines.length && lines[i].startsWith('|'); i++) {
    rows.push(lines[i].split('|').slice(1, -1).map((c) => c.trim()))
  }
  return rows
}

const quizzes = segs.filter((s) => s.type === 'quiz')
const right = (qi, qn) => quizzes[qi].questions[qn].options.find((o) => o.correct).text

// ---------------------------------------------------------------- tes
test('materi 9 bersih dari error dan saran', () => {
  assert.deepEqual(checkMarkdown(md), [])
})

test('materi 9 memakai komponen yang sama dengan materi sebelumnya', () => {
  assert.equal(meta.hasText, true)
  const types = segs.map((s) => s.type)
  for (const t of ['steps', 'quiz', 'visualizer', 'challenge']) assert.ok(types.includes(t), `belum ada komponen ${t}`)
  assert.equal(types.at(-1), 'challenge', 'soal challenge tetap paling akhir')
  const steps = segs.filter((s) => s.type === 'steps')
  assert.deepEqual(
    steps.map((s) => s.items.length),
    [7, 3, 4, 5],
    'arti tiap langkah LCS-LENGTH, tiga sel contoh, arti tiap langkah PRINT-LCS, kembali dan mencetak',
  )
  assert.deepEqual(
    quizzes.map((q) => q.questions.length),
    [2, 3, 4, 3],
    'kuis di bagian A sampai D',
  )
  assert.match(segs[types.indexOf('visualizer') + 1].text, /^## F\. Rangkuman/, 'teks sesudah penanda diawali judul ##')
})

test('daftar isi sidebar materi 9', () => {
  const items = buildToc(segs, { visualizers: [{ id: 'lcsTable' }] })
  assert.deepEqual(items.filter((i) => i.level === 2).map((i) => i.text), [
    'A. Longest Common Subsequence',
    'B. Algoritma LCS-LENGTH',
    'C. Tabel c dan Tabel b untuk Contoh',
    'D. Algoritma PRINT-LCS',
    'E. Mencoba Visualisasi Tabel',
    'Visualisasi',
    'F. Rangkuman',
    'Soal Challenge',
  ])
  assert.deepEqual(items.filter((i) => i.level === 3).map((i) => i.text), [
    'Subbarisan',
    'Mencari dengan Brute Force',
    'Pseudocode',
    'Pseudocode',
    'Contoh: PRINT-LCS(b, X, 7, 6)',
  ])
})

test('gambar tabel c dan b ada di berkas dan punya teks alternatif deskriptif yang cocok dengan tabel', () => {
  assert.ok(existsSync(join(root, 'public/materi/dp-lcs/tabel-c-b.png')))
  assert.ok(md.includes('](/materi/dp-lcs/tabel-c-b.png)'))
  for (const mm of md.matchAll(/!\[([^\]]*)\]\(/g)) assert.ok(mm[1].length > 80, 'teks alternatif cukup deskriptif')
  // teks alternatif memuat arah dan angka tiap baris: dibandingkan dengan hitungan
  const alt = /!\[([^\]]*)\]\(/.exec(md)[1]
  const { c, b } = cb(X, Y)
  const word = { '↖': 'diagonal', '↑': 'atas', '←': 'kiri' }
  for (let i = 1; i <= m; i++) {
    const cells = []
    for (let j = 1; j <= n; j++) cells.push(`${word[b[i][j]]} ${c[i][j]}`)
    assert.ok(alt.includes(`Baris ${i} (${X[i - 1]}): ${cells.join(', ')}`), `baris ${i} pada teks alternatif`)
  }
})

test('pseudocode LCS-LENGTH (18 baris) dan PRINT-LCS (8 baris), tanpa nomor tulisan tangan', () => {
  const blocks = [...md.matchAll(/```pseudocode\n([\s\S]*?)```/g)].map((mm) => mm[1].trimEnd().split('\n'))
  assert.equal(blocks.length, 2)
  const [len, prn] = blocks.map((b) => b.map((l) => l.trim()))
  assert.equal(len.length, 18)
  assert.equal(prn.length, 8)
  for (const b of blocks) assert.ok(b.every((l) => !/^\s*\d+[.)]?\s/.test(l)), 'tidak ada nomor tulisan tangan')
  assert.equal(len[0], 'm = X.length')
  assert.equal(len[1], 'n = Y.length')
  assert.match(len[2], /^let b\[1\.\.m, 1\.\.n\] and c\[0\.\.m, 0\.\.n\] be new tables$/)
  assert.deepEqual([len[3], len[4], len[5], len[6]], ['for i = 1 to m', 'c[i, 0] = 0', 'for j = 0 to n', 'c[0, j] = 0'])
  assert.deepEqual([len[7], len[8], len[9]], ['for i = 1 to m', 'for j = 1 to n', 'if x_i == y_j'])
  assert.deepEqual([len[10], len[11]], ['c[i, j] = c[i-1, j-1] + 1', 'b[i, j] = "↖"'])
  assert.deepEqual([len[12], len[13], len[14]], ['elseif c[i-1, j] >= c[i, j-1]', 'c[i, j] = c[i-1, j]', 'b[i, j] = "↑"'])
  assert.deepEqual([len[15], len[16], len[17]], ['else c[i, j] = c[i, j-1]', 'b[i, j] = "←"', 'return c and b'])
  assert.deepEqual(prn, [
    'if i == 0 or j == 0',
    'return',
    'if b[i, j] == "↖"',
    'PRINT-LCS(b, X, i-1, j-1)',
    'print x_i',
    'elseif b[i, j] == "↑"',
    'PRINT-LCS(b, X, i-1, j)',
    'else PRINT-LCS(b, X, i, j-1)',
  ])
  const steps = segs.filter((s) => s.type === 'steps')
  assert.deepEqual(steps[0].items.map((i) => i.title), [
    'Langkah 1 sampai 3: persiapan',
    'Langkah 4 sampai 7: baris 0 dan kolom 0',
    'Langkah 8 dan 9: mengisi sel yang lain',
    'Langkah 10 sampai 12: anggota sama',
    'Langkah 13 sampai 15: sel atas lebih besar atau sama',
    'Langkah 16 dan 17: selain itu',
    'Langkah 18: hasil',
  ])
  assert.deepEqual(steps[2].items.map((i) => i.title), [
    'Langkah 1 dan 2: berhenti',
    'Langkah 3 sampai 5: panah diagonal',
    'Langkah 6 dan 7: panah ke atas',
    'Langkah 8: panah ke kiri',
  ])
})

test('brute force bagian A: tujuh subbarisan persekutuan benar, dan LCS sepanjang 4 ada tiga', () => {
  const rows = readTable('| No | Subbarisan persekutuan')
  assert.equal(rows.length, 7)
  const nums = (cell) => [...cell.matchAll(/_(\d)/g)].map((mm) => Number(mm[1]))
  const letters = (cell) => [...cell.matchAll(/[A-Z]/g)].map((mm) => mm[0]).join('')
  for (const r of rows) {
    const text = letters(r[1])
    const xi = nums(r[2])
    const yi = nums(r[3])
    assert.equal(xi.map((i) => X[i - 1]).join(''), text, `${text} dari X`)
    assert.equal(yi.map((i) => Y[i - 1]).join(''), text, `${text} dari Y`)
    assert.deepEqual(xi, [...xi].sort((a, b) => a - b), 'indeks X menaik')
    assert.deepEqual(yi, [...yi].sort((a, b) => a - b), 'indeks Y menaik')
  }
  // pembanding: himpunan semua subbarisan persekutuan
  const sx = new Set(allSubsequences(X).map((s) => s.text))
  const common = [...new Set(allSubsequences(Y).map((s) => s.text))].filter((t) => sx.has(t))
  const maxLen = Math.max(...common.map((t) => t.length))
  assert.equal(maxLen, 4)
  assert.deepEqual(common.filter((t) => t.length === 4).sort(), ['BCAB', 'BCBA', 'BDAB'])
  assert.ok(md.includes('$\\{B, C, A, B\\}$'), 'teks menyebut LCS ketiga')
  assert.equal(lcsLen(X, Y), 4)
  assert.equal(2 ** m, 128)
  assert.ok(md.includes('ada 128 kandidat'))
})

test('tabel c dan b di teks sama dengan hitungan, sel demi sel', () => {
  const rows = readTable('| Tabel c dan b')
  assert.equal(rows.length, m + 1)
  const { c, b } = cb(X, Y)
  const ref = lcsTable(X, Y)
  const strip = (s) => s.replace(/\uFE0E/g, '')
  assert.deepEqual(rows[0].slice(1), Array(n + 1).fill('0'), 'baris 0')
  for (let i = 1; i <= m; i++) {
    assert.equal(rows[i][0], `${i} (${X[i - 1]})`)
    assert.equal(rows[i][1], '0', `c[${i},0]`)
    for (let j = 1; j <= n; j++) {
      assert.equal(strip(rows[i][j + 1]), `${b[i][j]}${c[i][j]}`, `sel [${i},${j}]`)
      assert.equal(c[i][j], ref[i][j], `sama dengan lcsTable [${i},${j}]`)
      assert.equal(c[i][j], lcsLen(X.slice(0, i), Y.slice(0, j)), `rekursi murni [${i},${j}]`)
    }
  }
  const head = readTable('| Tabel c dan b')[0] // header dibaca di bawah
  assert.ok(head)
  const headerLine = md.split('\n').find((l) => l.startsWith('| Tabel c dan b'))
  assert.ok(headerLine.includes('1 (B) | 2 (D) | 3 (C) | 4 (A) | 5 (B) | 6 (A)'))
  assert.equal(c[7][6], 4)
})

test('tiga sel contoh dan jawaban kuis bagian C', () => {
  const { c, b } = cb(X, Y)
  assert.deepEqual([c[2][1], b[2][1]], [1, '↖'])
  assert.deepEqual([c[1][1], b[1][1]], [0, '↑'])
  assert.deepEqual([c[2][2], b[2][2]], [1, '←'])
  assert.deepEqual([X[1], Y[0]], ['B', 'B'])
  assert.deepEqual([X[0], Y[0]], ['A', 'B'])
  assert.deepEqual([X[1], Y[1]], ['B', 'D'])
  assert.ok(md.includes('$c[2,1] = c[1,0] + 1 = 0 + 1 = 1$'))
  assert.ok(md.includes('Karena $0 \\geq 0$, maka $c[1,1] = c[0,1] = 0$'))
  assert.ok(md.includes('$c[2,2] = c[2,1] = 1$'))
  // kuis C
  assert.equal(right(2, 0), String(c[7][6]))
  assert.equal(right(2, 1), '$\\leftarrow$')
  assert.equal(b[2][2], '←')
  assert.deepEqual([c[1][2], c[2][1]], [0, 1])
  assert.equal(right(2, 2), '$\\nwarrow$')
  assert.deepEqual([X[4], Y[1], b[5][2], c[5][2], c[4][1]], ['D', 'D', '↖', 2, 1])
  assert.equal(right(2, 3), String(c[4][3]))
  assert.deepEqual([X[3], Y[2], c[3][3], c[4][2], b[4][3]], ['B', 'C', 2, 1, '↑'])
  // kuis A dan B
  assert.equal(right(0, 1), '4')
  assert.equal(right(1, 0), '0')
  assert.equal(right(1, 1), '$c[i-1,j-1] + 1$')
  assert.equal(right(1, 2), '$\\uparrow$')
})

test('PRINT-LCS: urutan pemanggilan, baris yang dijalankan, dan hasil cetak sama dengan teks', () => {
  const { b } = cb(X, Y)
  const { calls, printed } = printLcs(b, X, m, n)
  assert.deepEqual(calls, [[7, 6], [6, 6], [5, 5], [4, 5], [3, 4], [3, 3], [2, 2], [2, 1], [1, 0]])
  assert.deepEqual(printed, [{ i: 2, ch: 'B' }, { i: 3, ch: 'C' }, { i: 4, ch: 'B' }, { i: 6, ch: 'A' }])
  assert.equal(printed.map((p) => p.ch).join(''), 'BCBA')
  assert.equal(printed.map((p) => p.ch).join(''), lcsString(X, Y), 'sama dengan lcsString')
  const lines = { '↖': '1 (False), 3 (True), 4', '↑': '1 (False), 3 (False), 6 (True), 7', '←': '1 (False), 3 (False), 6 (False), 8' }
  const rows = readTable('| Pemanggilan | Isi')
  assert.equal(rows.length, calls.length)
  calls.forEach(([i, j], k) => {
    const call = (a, c) => `PRINT-LCS(b, X, ${a}, ${c})`
    assert.equal(rows[k][0], call(i, j))
    if (i === 0 || j === 0) {
      assert.deepEqual(rows[k].slice(1), ['tidak dibaca', '1 (True), 2', 'return'])
    } else {
      assert.equal(rows[k][1].replace(/\uFE0E/g, ''), b[i][j])
      assert.equal(rows[k][2], lines[b[i][j]])
      assert.equal(rows[k][3], call(...calls[k + 1]))
    }
  })
  // teks bagian "kembali dan mencetak" menyebut persis indeks yang dicetak
  for (const p of printed) assert.ok(md.includes(`cetak $x_${p.i}$, yaitu **${p.ch}**`), `cetak x${p.i}`)
  assert.ok(md.includes('Urutan yang tercetak adalah B, C, B, A.'))
  assert.equal(right(3, 0), 'B, C, B, A')
  // kuis D: dari (3, 4) dengan panah kiri menuju (3, 3)
  assert.equal(b[3][4], '←')
  assert.equal(right(3, 2), 'PRINT-LCS(b, X, 3, 3)')
  // pemanggilan yang tidak mencetak memanggil lewat langkah 7 atau 8
  const noPrint = calls.filter(([i, j]) => i > 0 && j > 0 && b[i][j] !== '↖').map(([i, j]) => `${i},${j}`)
  assert.deepEqual(noPrint, ['7,6', '5,5', '3,4', '2,2'])
})

test('aturan seri: LCS yang dihasilkan memang bergantung pada pilihan saat nilainya sama', () => {
  // memilih sel kiri saat seri (bukan sel atas) memberi LCS lain
  const t = lcsTable(X, Y)
  let i = m
  let j = n
  let out = ''
  while (i > 0 && j > 0) {
    if (X[i - 1] === Y[j - 1]) {
      out = X[i - 1] + out
      i--
      j--
    } else if (t[i - 1][j] > t[i][j - 1]) i--
    else j--
  }
  assert.notEqual(out, 'BCBA')
  assert.equal(out.length, 4)
  assert.ok(md.includes('bergantung pada aturan seri di langkah 13'))
})

test('teks selaras dengan soal challenge dan visualizer', () => {
  assert.equal(meta.visualizer, 'lcsTable')
  assert.deepEqual(challenge.testCases[0], { input: [X, Y], expected: 4 })
  assert.ok(md.includes('$X$ = ABCBDAB dan $Y$ = BDCABA'))
  const registry = readFileSync(join(root, 'src/algorithms/registry.js'), 'utf8')
  assert.ok(registry.includes("initialInput: { x: 'ABCBDAB', y: 'BDCABA' }"), 'isian awal visualizer sama dengan contoh teks')
  assert.ok(registry.includes('1 sampai 7 karakter') && md.includes('1 sampai 7 karakter'))
  assert.equal(lcsString(X, Y), 'BCBA')
})

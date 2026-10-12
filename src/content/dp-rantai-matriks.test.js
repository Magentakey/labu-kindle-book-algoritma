import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { checkMarkdown } from '../lib/checkMarkdown.js'
import { splitContent } from '../lib/splitContent.js'
import { buildToc } from '../lib/tableOfContents.js'
import { solveMatrixChain } from '../algorithms/matrixChainTable.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const md = readFileSync(join(root, 'src/content/materials/dp-rantai-matriks.md'), 'utf8')
const meta = JSON.parse(readFileSync(join(root, 'src/content/materials.json'), 'utf8')).find((m) => m.id === 'dp-rantai-matriks')
const challenge = JSON.parse(readFileSync(join(root, 'src/content/challenges/dp-rantai-matriks.json'), 'utf8'))
const segs = splitContent(md, { hasVisualizer: Boolean(meta.visualizer), hasChallenge: Boolean(meta.challenge) })

const P = [30, 35, 15, 5, 10, 20, 25]

/**
 * Pembanding independen tanpa tabel: semua biaya dari semua urutan pengurungan matriks ke-i sampai ke-j
 * (indeks mulai dari 1, matriks Ai berukuran p[i-1] x p[i]). Mengembalikan daftar { cost, order }.
 */
function allOrders(p, i, j) {
  if (i === j) return [{ cost: 0, order: `A${i}` }]
  const out = []
  for (let k = i; k < j; k++) {
    for (const l of allOrders(p, i, k)) {
      for (const r of allOrders(p, k + 1, j)) {
        out.push({ cost: l.cost + r.cost + p[i - 1] * p[k] * p[j], order: `(${l.order}${r.order})`, k })
      }
    }
  }
  return out
}

/** Biaya minimum dan semua k yang mencapainya, dihitung dari daftar semua urutan. */
function bruteBest(p, i, j) {
  const all = allOrders(p, i, j)
  const best = Math.min(...all.map((o) => o.cost))
  return { best, ks: [...new Set(all.filter((o) => o.cost === best).map((o) => o.k))] }
}

/** Angka ditulis dengan titik ribuan seperti di dokumen: 15125 -> 15.125. */
const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')

/** Membaca tabel Markdown yang baris judulnya diawali prefix, menjadi matriks teks (tanpa baris judul dan pemisah). */
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

test('materi 8 bersih dari error dan saran', () => {
  assert.deepEqual(checkMarkdown(md), [])
})

test('materi 8 memakai komponen yang sama dengan materi sebelumnya', () => {
  assert.equal(meta.hasText, true)
  const types = segs.map((s) => s.type)
  for (const t of ['steps', 'quiz', 'visualizer', 'challenge']) assert.ok(types.includes(t), `belum ada komponen ${t}`)
  assert.equal(types.at(-1), 'challenge', 'soal challenge tetap paling akhir')
  const steps = segs.filter((s) => s.type === 'steps')
  assert.deepEqual(
    steps.map((s) => s.items.length),
    [4, 3, 8, 3, 3, 4],
    'empat langkah DP, dua cara tiga matriks, arti tiap langkah, contoh 1, contoh 2, menyusun urutan',
  )
  const quizzes = segs.filter((s) => s.type === 'quiz')
  assert.equal(quizzes.length, 5, 'kuis di bagian A sampai E')
  assert.match(segs[types.indexOf('visualizer') + 1].text, /^## G\. Rangkuman/, 'teks sesudah penanda diawali judul ##')
})

test('daftar isi sidebar materi 8', () => {
  const items = buildToc(segs, { visualizers: [{ id: 'matrixChainTable' }] })
  assert.deepEqual(items.filter((i) => i.level === 2).map((i) => i.text), [
    'A. Dynamic Programming',
    'B. Perkalian Rantai Matriks',
    'C. Contoh: Tiga Matriks',
    'D. Algoritma Matrix-Chain-Order',
    'E. Tabel m dan Tabel s',
    'F. Mencoba Visualisasi Tabel',
    'Visualisasi',
    'G. Rangkuman',
    'Soal Challenge',
  ])
  assert.deepEqual(items.filter((i) => i.level === 3).map((i) => i.text), [
    'Syarat dan Hasil Perkalian Dua Matriks',
    'Cara Mengalikan Dua Matriks',
    'Jumlah Operasi Perkalian',
    'Barisan p sebagai masukan',
    'Pseudocode',
    'Tabel m: biaya minimum',
    'Tabel s: titik pecah terbaik',
    'Menyusun urutan perkalian dari tabel s',
  ])
})

test('gambar ada di berkas dan dirujuk dengan teks alternatif deskriptif', () => {
  for (const f of ['perkalian-matriks', 'tabel-m-s']) {
    assert.ok(existsSync(join(root, `public/materi/dp-rantai-matriks/${f}.png`)), f)
    assert.ok(md.includes(`](/materi/dp-rantai-matriks/${f}.png)`), f)
  }
  for (const m of md.matchAll(/!\[([^\]]*)\]\(/g)) assert.ok(m[1].length > 80, 'teks alternatif cukup deskriptif')
})

test('pseudocode MATRIX-CHAIN-ORDER: 14 baris tanpa nomor tulisan tangan, sesuai langkah yang dirujuk slide', () => {
  const block = /```pseudocode\n([\s\S]*?)```/.exec(md)[1].trimEnd().split('\n')
  assert.equal(block.length, 14)
  assert.ok(block.every((l) => !/^\s*\d+[.)]?\s/.test(l)), 'tidak ada nomor tulisan tangan')
  const t = block.map((l) => l.trim())
  assert.match(t[0], /^n = p\.length - 1$/)
  assert.match(t[1], /^let m\[1\.\.n, 1\.\.n\] and s\[1\.\.n-1, 2\.\.n\]/)
  assert.match(t[3], /^m\[i, i\] = 0$/)
  assert.match(t[4], /^for l = 2 to n/)
  assert.match(t[5], /^for i = 1 to n - l \+ 1$/)
  assert.match(t[6], /^j = i \+ l - 1$/)
  assert.match(t[7], /^m\[i, j\] = ∞$/)
  assert.match(t[8], /^for k = i to j - 1$/)
  assert.match(t[9], /^q = m\[i, k\] \+ m\[k\+1, j\] \+ p\[i-1\] \* p\[k\] \* p\[j\]$/)
  assert.match(t[10], /^if q < m\[i, j\]$/)
  assert.match(t[11], /^m\[i, j\] = q$/)
  assert.match(t[12], /^s\[i, j\] = k$/)
  assert.match(t[13], /^return m and s$/)
  const steps = segs.filter((s) => s.type === 'steps')[2]
  assert.deepEqual(steps.items.map((i) => i.title), [
    'Langkah 1 dan 2: persiapan',
    'Langkah 3 dan 4: rantai satu matriks',
    'Langkah 5: panjang rantai',
    'Langkah 6 dan 7: batas rantai',
    'Langkah 8: nilai awal',
    'Langkah 9 dan 10: mencoba tiap titik pecah',
    'Langkah 11 sampai 13: menyimpan yang terbaik',
    'Langkah 14: hasil',
  ])
})

test('tabel m dan s di teks sama dengan hitungan semua urutan pengurungan', () => {
  const n = P.length - 1
  const mRows = readTable('| Tabel m: i \\ j')
  const sRows = readTable('| Tabel s: i \\ j')
  assert.equal(mRows.length, n)
  assert.equal(sRows.length, n - 1)
  for (let i = 1; i <= n; i++) {
    for (let j = i; j <= n; j++) {
      const { best, ks } = bruteBest(P, i, j)
      assert.equal(mRows[i - 1][j], i === j ? '0' : fmt(best), `m[${i},${j}]`)
      if (i < j) {
        // s[i,j] harus salah satu k yang mencapai biaya minimum (pada seri, pseudocode memilih k terkecil).
        assert.equal(Number(sRows[i - 1][j - 1]), Math.min(...ks), `s[${i},${j}]`)
      }
    }
  }
  // sel di bawah diagonal berisi tanda "–"
  assert.equal(mRows[3][1], '–')
  assert.equal(sRows[2][1], '–')
})

test('contoh teks: m[1,2], m[2,5], s[2,5], urutan optimal, dan m[1,6]', () => {
  const sol = solveMatrixChain(P)
  assert.equal(sol.cost, 15125)
  assert.equal(sol.m[1][2], 30 * 35 * 15)
  assert.equal(sol.m[1][2], 15750)
  assert.ok(md.includes('30 \\times 35 \\times 15 \\\\') || md.includes('30 \\times 35 \\times 15'), 'perhitungan m[1,2]')
  // Contoh 2: tiga kandidat k = 2, 3, 4 untuk m[2,5]
  const cand = (k) => sol.m[2][k] + sol.m[k + 1][5] + P[1] * P[k] * P[5]
  assert.deepEqual([2, 3, 4].map(cand), [13000, 7125, 11375])
  for (const [k, v] of [[2, '13.000'], [3, '7.125'], [4, '11.375']]) {
    const line = md.split('\n').find((l) => l.startsWith(`k = ${k}: \\; &`))
    assert.ok(line && line.includes(`= ${v} \\\\`) || line?.endsWith(`= ${v}`), `kandidat k = ${k}`)
  }
  assert.equal(sol.s[2][5], 3)
  // Susunan dari tabel s: s[1,6] = 3, s[1,3] = 1, s[4,6] = 5
  assert.deepEqual([sol.s[1][6], sol.s[1][3], sol.s[4][6]], [3, 1, 5])
  assert.equal(sol.order, '((A1(A2A3))((A4A5)A6))')
  assert.ok(md.includes('(A_1 \\times (A_2 \\times A_3)) \\times ((A_4 \\times A_5) \\times A_6)'))
  // urutan itu memang yang termurah dari 42 kemungkinan
  const all = allOrders(P, 1, 6)
  assert.equal(all.length, 42)
  const best = all.filter((o) => o.cost === 15125)
  assert.deepEqual(best.map((o) => o.order), ['((A1(A2A3))((A4A5)A6))'])
})

test('contoh 3 matriks dan 4 matriks di bagian B dan C', () => {
  // 4 matriks: 5 cara pengurungan (bilangan Catalan)
  assert.equal(allOrders([1, 1, 1, 1, 1], 1, 4).length, 5)
  // 2x3, 3x8, 8x5: cara 1 = 150, cara 2 = 128
  const orders = allOrders([2, 3, 8, 5], 1, 3)
  assert.deepEqual(Object.fromEntries(orders.map((o) => [o.order, o.cost])), { '(A1(A2A3))': 150, '((A1A2)A3)': 128 })
  for (const s of ['3 \\times 8 \\times 5 = 120', '2 \\times 3 \\times 5 = 30', '120 + 30 = 150', '2 \\times 3 \\times 8 = 48', '2 \\times 8 \\times 5 = 80', '48 + 80 = 128']) {
    assert.ok(md.includes(s), s)
  }
  // 3 x 3 dikali 3 x 2 = 18 perkalian; 20x5 dikali 5x4 = 400
  assert.equal(3 * 3 * 2, 18)
  assert.equal(20 * 5 * 4, 400)
  // soal kuis 10x30, 30x5, 5x60: 4.500 dan 27.000
  const q = Object.fromEntries(allOrders([10, 30, 5, 60], 1, 3).map((o) => [o.order, o.cost]))
  assert.deepEqual(q, { '(A1(A2A3))': 27000, '((A1A2)A3)': 4500 })
})

test('jawaban kuis angka cocok dengan perhitungan', () => {
  const quizzes = segs.filter((s) => s.type === 'quiz')
  const right = (qi, qn) => {
    const q = quizzes[qi].questions[qn]
    return q.options.find((o) => o.correct).text
  }
  assert.equal(right(1, 2), '400')
  assert.equal(right(2, 0), '4.500')
  assert.match(right(2, 1), /^27\.000/)
  const sol = solveMatrixChain(P)
  assert.equal(right(4, 0), fmt(sol.m[2][3]))
  assert.equal(right(4, 1), fmt(sol.m[3][4]))
  assert.equal(sol.m[2][3], 35 * 15 * 5)
  assert.equal(sol.m[3][4], 15 * 5 * 10)
  assert.match(right(3, 0), /^7$/)
  assert.equal(P.length, 7)
  assert.equal(right(3, 1), '4', 'j = i + l - 1 = 2 + 3 - 1')
})

test('teks selaras dengan soal challenge dan visualizer', () => {
  assert.equal(meta.visualizer, 'matrixChainTable')
  // contoh klasik teks = isian awal visualizer = test case terakhir soal challenge
  const last = challenge.testCases.at(-1)
  assert.deepEqual(last.input[0], P)
  assert.equal(last.expected, solveMatrixChain(P).cost)
  assert.ok(md.includes('p = \\{30, 35, 15, 5, 10, 20, 25\\}'))
  // contoh 10, 30, 5, 60 di soal challenge sama dengan contoh kuis
  assert.equal(solveMatrixChain([10, 30, 5, 60]).cost, 4500)
  assert.match(challenge.description, /4500/)
})

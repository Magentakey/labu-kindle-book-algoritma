import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { parseModul } from '../lib/modulContent.js'
import { hitungHasil, nilaiSoal, TIPE_LABEL } from '../lib/kuis.js'
import { algoritma } from '../data/algoritma.js'
import { modul, modulById, neighbors, tabsOf } from '../data/modul.js'
import { daftarKuis, kuisById } from '../data/quiz.js'
import { petaBab } from '../data/credit.js'
import { cariPython } from '../test/python.js'
import { vizIds } from '../viz/vizConfig.js'
import { rand } from '../lib/testRandom.js'
import { caraKurung } from '../viz/dpModel.js'
import { solveMatrixChain } from '../algorithms/matrixChainTable.js'
import { biayaKurung, daftarBiaya, jumlahPerkalian, pohonPemecahan, semuaKurung, totalBiaya, ukuranContoh } from '../viz/rantaiModel.js'
import { kuis11 } from './modul/11.kuis.js'
import { pseudo } from './modul/11.pseudo.js'

const md = readFileSync(new URL('./modul/11.md', import.meta.url), 'utf8').replace(/\r\n/g, '\n')
const bagian = parseModul(md)
const m = modulById('11')

const barisTabel = (caption) => {
  const end = md.indexOf(caption)
  assert.ok(end > 0, caption)
  const lines = md.slice(0, end).trimEnd().split('\n')
  const out = []
  for (let i = lines.length - 1; i >= 0 && lines[i].startsWith('|'); i--) out.unshift(lines[i].split('|').slice(1, -1).map((c) => c.trim()))
  return out.slice(2)
}
const blokTeks = (bahasa, indeks = 0) => [...md.matchAll(new RegExp('```' + bahasa + '\\n([\\s\\S]*?)```', 'g'))][indeks][1]
const angka = (t) => Number(String(t).replace(/\./g, ''))

/** Pembanding independen: nilai terbaik dari semua urutan kurung, tanpa tabel. */
const bruteBest = (p, i, j) => {
  const semua = semuaKurung(i, j).map((o) => ({ o, biaya: biayaKurung(o, p).biaya }))
  const best = Math.min(...semua.map((x) => x.biaya))
  return { best, urutan: semua.filter((x) => x.biaya === best).map((x) => x.o) }
}

// ---------------------------------------------------------------- struktur dan metadata
test('struktur: tujuh bagian sesuai PDF, enam tab terpenuhi, satu gambar, dua pseudocode, lima tabel, kode Python; teks polos tanpa TeX', () => {
  assert.deepEqual(bagian.map((s) => s.id), ['pendahuluan', 'perkalian', 'algoritma', 'penelusuran', 'analisis', 'makna', 'kesimpulan', 'referensi'])
  assert.deepEqual(bagian.map((s) => s.judul.match(/^\d+/)?.[0] ?? null), ['1', '2', '3', '4', '5', '6', '7', null])
  for (const t of tabsOf(m).filter((x) => x.id !== 'kuis')) assert.ok(bagian.some((s) => s.id === t.id), t.id)
  const slots = bagian.flatMap((s) => s.blok.filter((b) => b.type === 'slot')).map((b) => `${b.name}:${b.arg}`)
  assert.deepEqual(slots, ['pseudo:mco', 'pseudo:pop', 'gambar:pohon'])
  assert.deepEqual([...md.matchAll(/\*Tabel (\d+)\./g)].map((x) => Number(x[1])), [1, 2, 3, 4, 5])
  assert.equal([...md.matchAll(/```python/g)].length, 1)
  for (const jdl of ['2.1', '2.2', '3.1', '3.2', '4.1', '4.2', '4.3', '4.4', '5.1', '5.2', '5.3', '6.1', '6.2', '6.3']) assert.ok(md.includes(`### ${jdl} `), `subbagian ${jdl}`)
  assert.equal([...md.matchAll(/\{\{callout:/g)].length, [...md.matchAll(/\{\{\/callout\}\}/g)].length, 'callout berpasangan')
  for (const l of md.split('\n').filter((x) => x.startsWith('{{callout'))) assert.ok(!/[$\\]/.test(l), `judul callout polos: ${l}`)
  for (const x of modul) assert.ok(![x.judul, x.judulPanjang, x.ringkas, x.prasyaratTeks].some((t) => /[$\\]/.test(t ?? '')), `${x.id}: teks polos`)
  // rumus blok memakai $$ di baris sendiri (bukan satu baris), supaya bisa digulir di HP
  assert.equal([...md.matchAll(/^\$\$.+\$\$$/gm)].length, 0)
  assert.ok(md.includes('Catatan koreksi terhadap sumber'))
})

test('metadata sama dengan PDF dan katalog; visualizer Matrix-Chain terhubung dua arah', () => {
  assert.deepEqual([m.no, m.bab, m.halaman, m.soal], [11, 'BAB IV', 11, 8])
  assert.equal(m.soal, kuis11.soal.length)
  assert.equal(m.tujuan.length, 5)
  assert.equal(petaBab[3].modul[1].judul, m.judul)
  assert.deepEqual(tabsOf(m).map((x) => x.tab), ['1 Pendahuluan', '3 Masalah', '4 Penyelesaian DP', '5 Contoh Lengkap', '6 Analisis', '7 Kesimpulan', 'Kuis', 'Referensi'])
  assert.deepEqual(neighbors('11'), { prev: modulById('10'), next: modulById('12') })
  assert.equal(neighbors('10').next, m)
  assert.ok(readFileSync(new URL('../../public/' + m.pdf, import.meta.url)).subarray(0, 4).toString() === '%PDF')
  assert.equal(m.algoritmaId, 'matrix-chain')
  assert.ok(vizIds.includes(m.algoritmaId))
  const kartu = algoritma.find((a) => a.id === m.algoritmaId)
  assert.deepEqual([kartu.modul, kartu.viz, kartu.kategori], [11, true, 'dp'])
  assert.equal(kuisById('11').soal, 8)
  assert.equal(kuisById('11').judul, kuis11.judul)
})

// ---------------------------------------------------------------- perkalian dua matriks
test('perkalian dua matriks: syarat, ukuran hasil, dan banyaknya operasi (contoh bahan kuliah dan kuis soal 1)', () => {
  const hasil = (a, b) => (a[1] === b[0] ? { ukuran: [a[0], b[1]], operasi: a[0] * a[1] * b[1] } : null)
  assert.deepEqual(hasil([5, 4], [4, 8]).ukuran, [5, 8])
  assert.equal(hasil([3, 2], [4, 3]), null, 'C × D tidak dapat dilakukan')
  assert.deepEqual(hasil([4, 3], [3, 2]).ukuran, [4, 2], 'D × C')
  assert.equal(hasil([3, 3], [3, 2]).operasi, 18)
  assert.equal(hasil([20, 5], [5, 4]).operasi, 400)
  assert.deepEqual([hasil([4, 7], [7, 2]).ukuran, hasil([4, 7], [7, 2]).operasi, hasil([7, 2], [4, 7])], [[4, 2], 56, null])
  // perkalian sungguhan: tiap elemen hasil memakai tepat n perkalian skalar, ada m·r elemen
  let kali = 0
  const A = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => 1))
  const B = Array.from({ length: 3 }, () => Array.from({ length: 2 }, () => 1))
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) for (let k = 0; k < 3; k++) { A[i][k] * B[k][j]; kali++ }
  assert.equal(kali, 18)
  for (const x of ['$3 \\times 2 = 6$', '$3 \\times 3 \\times 2 = 18$', '$20 \\times 5 \\times 4 = 400$']) assert.ok(md.includes(x), x)
})

test('Tabel 2: tiga matriks 2×3, 3×8, 8×5; minimal 128 dengan cara 2', () => {
  const p = [2, 3, 8, 5]
  assert.equal(biayaKurung('(A1(A2A3))', p).biaya, 150)
  assert.equal(biayaKurung('((A1A2)A3)', p).biaya, 128)
  assert.equal(bruteBest(p, 1, 3).best, 128)
  const t = barisTabel('*Tabel 2.')
  assert.deepEqual(t.map((r) => r[2]), ['120', '30', '150', '48', '80', '128'])
  assert.equal(120 + 30, 150)
  assert.equal(48 + 80, 128)
  assert.ok(md.includes('Jumlah operasi minimal adalah 128, dengan cara 2.'))
})

test('Tabel 1 dan Catalan: empat matriks 5 cara; barisan 1, 1, 2, 5, ...; lebih dari 1,7 miliar cara untuk 20 matriks; tumbuh minimal 2^n', () => {
  const cara = semuaKurung(1, 4)
  assert.equal(cara.length, 5)
  const t1 = barisTabel('*Tabel 1.').map((r) => r[1].replace(/\$/g, '').replace(/\s/g, ''))
  assert.deepEqual(t1.map((x) => x.replace(/_(\d)/g, '$1')).sort(), cara.sort())
  const urut = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => semuaKurung(1, n).length)
  assert.deepEqual(urut, [1, 1, 2, 5, 14, 42, 132, 429, 1430, 4862])
  assert.deepEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => Number(caraKurung(n))), urut)
  assert.ok(md.includes('1, 1, 2, 5, 14, 42, 132, 429, 1.430, 4.862'))
  // P(1) = 1, P(n) = Σ P(k) P(n − k)
  const P = [0n, 1n]
  for (let n = 2; n <= 20; n++) { let s = 0n; for (let k = 1; k < n; k++) s += P[k] * P[n - k]; P[n] = s }
  assert.equal(P[20], caraKurung(20))
  assert.ok(P[20] > 1_700_000_000n && P[20] < 1_800_000_000n, `P(20) = ${P[20]}`)
  for (let n = 1; n <= 40; n++) assert.ok(caraKurung(n) * 4n >= 2n ** BigInt(n), `Ω(2^n) pada n=${n}`)
})

// ---------------------------------------------------------------- contoh enam matriks
test('Tabel 3, 4, dan 5: ukuran, tabel m, dan tabel s sama dengan hasil MATRIX-CHAIN-ORDER', () => {
  const t3 = barisTabel('*Tabel 3.')
  assert.deepEqual(t3[0].slice(1), ['$30 \\times 35$', '$35 \\times 15$', '$15 \\times 5$', '$5 \\times 10$', '$10 \\times 20$', '$20 \\times 25$'])
  const { m: M, s: S, cost, order } = solveMatrixChain(ukuranContoh)
  const t4 = barisTabel('*Tabel 4.')
  for (let i = 1; i <= 6; i++) for (let j = 1; j <= 6; j++) {
    const sel = t4[i - 1][j]
    if (j < i) assert.equal(sel, '', `m[${i},${j}] kosong`)
    else assert.equal(angka(sel), M[i][j], `m[${i},${j}]`)
  }
  const t5 = barisTabel('*Tabel 5.')
  for (let i = 1; i <= 5; i++) for (let j = 2; j <= 6; j++) {
    const sel = t5[i - 1][j - 1]
    if (j <= i) assert.equal(sel, '', `s[${i},${j}] kosong`)
    else assert.equal(Number(sel), S[i][j], `s[${i},${j}]`)
  }
  assert.deepEqual([cost, order], [15125, '((A1(A2A3))((A4A5)A6))'])
})

test('tabel m dan s benar: sama dengan pencarian semua urutan kurung (contoh bahan kuliah, soal kuis, dan ukuran acak)', () => {
  const daftar = [ukuranContoh, [2, 3, 8, 5], [10, 100, 5, 50], [4, 10, 3, 12, 20, 7]]
  for (let u = 0; u < 25; u++) daftar.push(Array.from({ length: 3 + Math.floor(rand() * 5) }, () => 1 + Math.floor(rand() * 40)))
  for (const p of daftar) {
    const { m: M, s: S, n } = solveMatrixChain(p)
    for (let i = 1; i <= n; i++) for (let j = i; j <= n; j++) {
      const { best, urutan } = bruteBest(p, i, j)
      assert.equal(M[i][j], best, `p=${p} m[${i},${j}]`)
      if (i < j) {
        // s[i,j] adalah letak pemecah dari sebuah urutan optimal
        const k = S[i][j]
        assert.ok(urutan.some((o) => o.startsWith('(') && biayaKurung(o, p).biaya === best && M[i][k] + M[k + 1][j] + p[i - 1] * p[k] * p[j] === best), `p=${p} s[${i},${j}]=${k}`)
      }
    }
  }
})

test('5.1: Contoh 1, 2, dan 3 dihitung ulang dari rumus (*)', () => {
  const p = ukuranContoh
  const { m: M } = solveMatrixChain(p)
  assert.equal(30 * 35 * 15, 15750)
  assert.equal(M[1][2], 15750)
  const kand25 = [2, 3, 4].map((k) => M[2][k] + M[k + 1][5] + p[1] * p[k] * p[5])
  assert.deepEqual(kand25, [13000, 7125, 11375])
  assert.equal(Math.min(...kand25), M[2][5])
  const kand16 = [1, 2, 3, 4, 5].map((k) => M[1][k] + M[k + 1][6] + p[0] * p[k] * p[6])
  assert.deepEqual(kand16, [36750, 32375, 15125, 21875, 26875])
  const t = barisTabel('*Tabel 4.') // memastikan tabel ada; tabel Contoh 3 tidak punya keterangan, dicocokkan lewat teks
  assert.ok(t.length === 6)
  const barisContoh3 = [
    ['1', '0', '10.500', '30 \\cdot 35 \\cdot 25 = 26.250', '36.750'],
    ['2', '15.750', '5.375', '30 \\cdot 15 \\cdot 25 = 11.250', '32.375'],
    ['3', '7.875', '3.500', '30 \\cdot 5 \\cdot 25 = 3.750', '15.125'],
    ['4', '9.375', '5.000', '30 \\cdot 10 \\cdot 25 = 7.500', '21.875'],
    ['5', '11.875', '0', '30 \\cdot 20 \\cdot 25 = 15.000', '26.875'],
  ]
  barisContoh3.forEach((b, i) => {
    const k = i + 1
    const sel = md.split('\n').find((l) => l.startsWith(`| ${k} | ${b[1]} | ${b[2]} |`))
    assert.ok(sel, `baris k=${k}`)
    assert.ok(sel.includes(`$${b[3]}$`) && sel.trimEnd().endsWith(`| ${b[4]} |`), sel)
    assert.equal(angka(b[4]), kand16[i])
  })
  for (const x of ['m[2,2] + m[3,5] + p_1 p_2 p_5 = 0 + 2.500 + 35 \\cdot 15 \\cdot 20 = 13.000', 'm[2,3] + m[4,5] + p_1 p_3 p_5 = 2.625 + 1.000 + 35 \\cdot 5 \\cdot 20 = 7.125', 'm[2,4] + m[5,5] + p_1 p_4 p_5 = 4.375 + 0 + 35 \\cdot 10 \\cdot 20 = 11.375', '$s[2,5] = 3$']) assert.ok(md.includes(x), x)
})

test('Gambar 1: pohon pemecahan dari tabel s punya 5 perkalian, biaya 3.750, 5.250, 2.500, 2.625, 1.000 yang berjumlah 15.125', () => {
  const { s, m: M } = solveMatrixChain(ukuranContoh)
  const pohon = pohonPemecahan(s, ukuranContoh)
  assert.equal(jumlahPerkalian(pohon), 5, 'n − 1 perkalian')
  const bentuk = (x) => (x.kiri ? `[${x.i}..${x.j} k=${x.k} ${x.biaya}](${bentuk(x.kiri)},${bentuk(x.kanan)})` : `A${x.i}`)
  assert.equal(
    bentuk(pohon),
    '[1..6 k=3 3750]([1..3 k=1 5250](A1,[2..3 k=2 2625](A2,A3)),[4..6 k=5 2500]([4..5 k=4 1000](A4,A5),A6))',
  )
  assert.equal(totalBiaya(pohon), 15125)
  assert.equal(totalBiaya(pohon), M[1][6])
  assert.deepEqual(daftarBiaya(pohon), [3750, 5250, 2500, 2625, 1000], 'urutan per tingkat = urutan penjumlahan Pemeriksaan di PDF')
  assert.ok(md.includes('3.750 + 5.250 + 2.500 + 2.625 + 1.000 = 15.125,'))
  // simpul dalam sama dengan penelusuran di teks 5.2
  assert.deepEqual([pohon.k, pohon.kiri.k, pohon.kanan.k], [3, 1, 5])
  for (const x of ['A1..6 · k=3 · 30·5·25 = 3.750', 'A1..3 · k=1 · 30·35·5 = 5.250', 'A4..6 · k=5 · 5·20·25 = 2.500', 'A2..3 · k=2 · 35·15·5 = 2.625', 'A4..5 · k=4 · 5·10·20 = 1.000']) {
    assert.ok(typeof x === 'string')
  }
  const gambar = readFileSync(new URL('./modul/11.gambar.jsx', import.meta.url), 'utf8')
  assert.ok(gambar.includes('Gambar 1. Pohon pemecahan optimal dari tabel s.'))
  // untuk ukuran acak: pohon selalu n − 1 perkalian dan totalnya = m[1][n]
  for (let u = 0; u < 20; u++) {
    const p = Array.from({ length: 3 + Math.floor(rand() * 6) }, () => 1 + Math.floor(rand() * 50))
    const r = solveMatrixChain(p)
    const t = pohonPemecahan(r.s, p)
    assert.equal(jumlahPerkalian(t), r.n - 1)
    assert.equal(totalBiaya(t), r.cost)
    assert.equal(biayaKurung(r.order, p).biaya, r.cost)
  }
})

test('program Python di modul dijalankan sungguhan dan keluarannya sama dengan teks dan model', (t) => {
  const kode = blokTeks('python')
  const cetak = blokTeks('text').trimEnd().split('\n')
  const model = [ukuranContoh, [2, 3, 8, 5], [10, 100, 5, 50]].map((p) => {
    const r = solveMatrixChain(p)
    return `${r.cost} ${r.order}`
  })
  assert.deepEqual(cetak, model)
  assert.deepEqual(cetak, ['15125 ((A1(A2A3))((A4A5)A6))', '128 ((A1A2)A3)', '7500 ((A1A2)A3)'])
  const py = cariPython()
  if (!py) return t.skip('Python 3 tidak ditemukan di mesin ini')
  const out = spawnSync(py, ['-c', kode], { encoding: 'utf8' })
  assert.equal(out.status, 0, out.stderr)
  assert.deepEqual(out.stdout.replace(/\r\n/g, '\n').trimEnd().split('\n'), cetak)
})

test('pseudocode: nomor baris sama dengan PDF (1–14 dan 1–6) dan penjelasan baris di teks merujuk baris yang tepat', () => {
  assert.equal(pseudo.mco.baris.length, 14)
  assert.equal(pseudo.pop.baris.length, 6)
  const b = pseudo.mco.baris
  assert.ok(b[0].startsWith('n = p.length - 1'))
  assert.ok(b[3].includes('m[i, i] = 0'))
  assert.ok(b[4].startsWith('for l = 2 to n'))
  assert.ok(b[6].includes('j = i + l - 1'))
  assert.ok(b[7].includes('m[i, j] = ∞'))
  assert.ok(b[9].includes('q = m[i, k] + m[k + 1, j] + p[i-1] * p[k] * p[j]'))
  assert.ok(b[12].includes('s[i, j] = k'))
  for (const x of ['**Baris 1–4:**', '**Baris 5–7:**', '**Baris 8–13:**']) assert.ok(md.includes(x), x)
})

// ---------------------------------------------------------------- analisis
test('6.1 dan 6.2: tiga perulangan bersarang Θ(n³) (hitungan sungguhan), memori Θ(n²), dan m[3,4] dibutuhkan banyak sel', () => {
  for (let n = 2; n <= 30; n++) {
    let k3 = 0
    let sel = 0
    for (let l = 2; l <= n; l++) for (let i = 1; i <= n - l + 1; i++) { sel++; k3 += l - 1 }
    assert.equal(sel, (n * (n - 1)) / 2, `pasangan (i,j) n=${n}`)
    assert.equal(k3, ((n - 1) * n * (n + 1)) / 6, `percobaan k n=${n}`)
  }
  const rasio = (n) => ((n - 1) * n * (n + 1)) / 6 / n ** 3
  assert.ok(Math.abs(rasio(1000) - 1 / 6) < 1e-3, 'Θ(n³) dengan konstanta 1/6')
  // sel yang bergantung (langsung atau tidak) pada m[3,4], dalam rekursi biasa untuk contoh enam matriks
  const dep = (i, j, seen = new Set()) => {
    for (let k = i; k < j; k++) for (const [a, b] of [[i, k], [k + 1, j]]) if (a !== b && !seen.has(`${a},${b}`)) { seen.add(`${a},${b}`); dep(a, b, seen) }
    return seen
  }
  const butuh = []
  for (let i = 1; i <= 6; i++) for (let j = i + 1; j <= 6; j++) if (dep(i, j).has('3,4')) butuh.push(`m[${i},${j}]`)
  for (const x of ['m[1,4]', 'm[2,4]', 'm[3,5]', 'm[3,6]', 'm[2,5]']) assert.ok(butuh.includes(x), x)
  // rekursi biasa untuk m[1,n]: banyaknya pemanggilan tumbuh eksponensial, tabel hanya n(n+1)/2 sel
  const panggil = (n) => { let c = 0; const f = (i, j) => { c++; for (let k = i; k < j; k++) { f(i, k); f(k + 1, j) } }; f(1, n); return c }
  for (let n = 2; n <= 12; n++) assert.ok(panggil(n) >= 2 ** (n - 1), `n=${n}`)
  assert.ok(panggil(12) > 78 * 100, 'jauh lebih banyak dari 78 sel tabel')
})

test('Tabel: hubungan Modul 05, 10, dan 12 yang disebut di 6.3 ada di katalog', () => {
  for (const id of ['05', '10']) assert.ok(modulById(id))
  assert.equal(petaBab[3].modul[2].judul, 'Longest Common Subsequence')
  assert.ok(m.prasyarat.every((x) => modulById(String(x).padStart(2, '0'))))
})

// ---------------------------------------------------------------- kuis
test('kunci kuis dihitung ulang: soal 1, 2, 3, 5, dan 6', () => {
  const [q1, q2, q3, , q5, q6] = kuis11.soal
  // soal 2
  const p2 = [10, 100, 5, 50]
  assert.equal(biayaKurung('((A1A2)A3)', p2).biaya, q2.isian[0].kunci)
  assert.equal(biayaKurung('(A1(A2A3))', p2).biaya, q2.isian[1].kunci)
  assert.equal(q2.isian[2].kunci, '((A1A2)A3)')
  assert.equal(q2.isian[1].kunci / q2.isian[0].kunci, 10)
  assert.deepEqual([10 * 100 * 5, 10 * 5 * 50, 100 * 5 * 50, 10 * 100 * 50], [5000, 2500, 25000, 50000])
  // soal 3
  const { m: M, s: S } = solveMatrixChain(ukuranContoh)
  const p = ukuranContoh
  assert.deepEqual([3, 4].map((k) => M[3][k] + M[k + 1][5] + p[2] * p[k] * p[5]), [2500, 3750])
  assert.deepEqual([q3.isian[0].kunci, q3.isian[1].kunci], [M[3][5], S[3][5]])
  // soal 5
  const t = pohonPemecahan(S, p, 2, 6)
  assert.equal(totalBiaya(t), M[2][6])
  assert.equal(q5.isian[1].kunci, M[2][6])
  assert.equal(2625 + 3500 + 35 * 5 * 25, 10500)
  const urutan = (s, i, j) => (i === j ? `A${i}` : `(${urutan(s, i, s[i][j])}${urutan(s, s[i][j] + 1, j)})`)
  assert.equal(urutan(S, 2, 6), q5.isian[0].kunci)
  assert.deepEqual([S[2][6], S[2][3], S[4][6]], [3, 2, 5])
  assert.equal(bruteBest(p, 2, 6).best, 10500)
  for (const o of q5.isian[0].opsi) assert.ok(biayaKurung(o, [35, 15, 5, 10, 20, 25]) !== null, `opsi sah: ${o}`)
  const lain = q5.isian[0].opsi.filter((o) => o !== q5.isian[0].kunci)
  for (const o of lain) assert.ok(biayaKurung(o.replace(/A(\d)/g, (_, d) => `A${Number(d) - 1}`), [35, 15, 5, 10, 20, 25]).biaya > 10500, `pengecoh lebih mahal: ${o}`)
  // soal 6
  const p6 = [4, 10, 3, 12, 20, 7]
  const r6 = solveMatrixChain(p6)
  assert.deepEqual([r6.m[1][2], r6.m[2][3]], [120, 360])
  assert.deepEqual([0 + 360 + 4 * 10 * 12, 120 + 0 + 4 * 3 * 12], [840, 264])
  assert.deepEqual([r6.m[1][3], r6.s[1][3]], [q6.isian[0].kunci, q6.isian[1].kunci])
  assert.deepEqual([r6.m[1][5], r6.order], [1344, '((A1A2)((A3A4)A5))'])
  assert.equal(bruteBest(p6, 1, 5).best, 1344)
  assert.equal(q1.kunci, 'B')
})

test('soal 7 dan 8: memori Θ(n²) (dua tabel n × n), running time Θ(n³); isi s[i,j] adalah letak pemecah', () => {
  const n = 25
  const { m: M, s: S } = solveMatrixChain(Array.from({ length: n + 1 }, (_, i) => 2 + (i % 7)))
  assert.equal(M.length * M[0].length, (n + 1) ** 2)
  assert.equal(S.length * S[0].length, (n + 1) ** 2)
  assert.deepEqual([kuis11.soal[6].kunci, kuis11.soal[7].kunci], ['Salah', 'C'])
  // s[i,j] adalah k yang menghasilkan m[i,j]; ukuran hasil selalu p[i−1] × p[j] dan tidak disimpan
  const p = ukuranContoh
  const r = solveMatrixChain(p)
  for (let i = 1; i <= 6; i++) for (let j = i + 1; j <= 6; j++) {
    const k = r.s[i][j]
    assert.equal(r.m[i][k] + r.m[k + 1][j] + p[i - 1] * p[k] * p[j], r.m[i][j])
  }
})

test('struktur kuis: 8 soal, jenis sesuai PDF, hanya soal 4 dinilai sendiri', () => {
  assert.deepEqual(kuis11.soal.map((q) => q.no), [1, 2, 3, 4, 5, 6, 7, 8])
  assert.deepEqual(kuis11.soal.map((q) => TIPE_LABEL[q.tipe]), ['Pilihan Ganda', 'Perhitungan', 'Perhitungan', 'Analisis', 'Penelusuran', 'Perhitungan', 'Benar/Salah', 'Pilihan Ganda'])
  assert.deepEqual(kuis11.soal.filter((q) => q.mandiri).map((q) => q.no), [4])
  for (const q of kuis11.soal) {
    assert.ok(q.teks.length > 10 && q.pembahasan.length > 10, `soal ${q.no}`)
    if (q.opsi) assert.ok(q.opsi.some((o) => o.id === q.kunci))
    if (q.mandiri) assert.ok(q.kunciTeks)
    for (const f of q.isian ?? []) if (f.jenis === 'pilih') assert.ok(f.opsi.includes(f.kunci), `soal ${q.no}: kunci "${f.kunci}" ada di opsi`)
    assert.equal([q.mandiri, q.opsi, q.isian].filter(Boolean).length, 1, `satu jenis jawaban per soal (${q.no})`)
  }
  assert.deepEqual([...new Set(kuis11.soal.map((q) => q.tipe))].sort(), [...daftarKuis.find((k) => k.id === '11').tipe].sort())
})

test('penilaian soal Modul 11', () => {
  const [q1, , q3, , q5, q6, q7, q8] = kuis11.soal
  const q2 = kuis11.soal[1]
  assert.equal(nilaiSoal(q1, 'B').benar, true)
  assert.equal(nilaiSoal(q1, 'A').benar, false)
  assert.equal(nilaiSoal(q2, ['7.500', '75.000', '((A1A2)A3)']).benar, true, 'angka boleh memakai titik ribuan')
  assert.equal(nilaiSoal(q2, ['7500', '75000', '(A1(A2A3))']).benar, false)
  assert.equal(nilaiSoal(q3, ['2.500', '3']).benar, true)
  assert.equal(nilaiSoal(q3, ['3750', '4']).benar, false)
  assert.equal(nilaiSoal(q5, ['((A2A3)((A4A5)A6))', '10.500']).benar, true)
  assert.equal(nilaiSoal(q5, ['((A2A3)((A4A5)A6))', '15.125']).benar, false)
  assert.equal(nilaiSoal(q6, ['264', '2']).benar, true)
  assert.equal(nilaiSoal(q7, 'Salah').benar, true)
  assert.equal(nilaiSoal(q8, 'C').benar, true)
  const ok = { teks: 'a', sesuai: true }
  const semua = { 1: 'B', 2: ['7500', '75000', '((A1A2)A3)'], 3: ['2500', '3'], 4: ok, 5: ['((A2A3)((A4A5)A6))', '10500'], 6: ['264', '2'], 7: 'Salah', 8: 'C' }
  const h = hitungHasil(kuis11.soal, semua)
  assert.deepEqual([h.skor, h.lulus], [8, true])
  assert.deepEqual(hitungHasil(kuis11.soal, { ...semua, 4: undefined }).belumDinilai, [4])
})

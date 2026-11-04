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
import { lcsTable, lcsString } from '../algorithms/lcsTable.js'
import { contohX, contohY, lcsLength, posisiSubbarisan, printLcs, printLcsTerbalik, semuaLcs, subbarisan } from '../viz/lcsModel.js'
import { kuis12 } from './modul/12.kuis.js'
import { pseudo } from './modul/12.pseudo.js'

const md = readFileSync(new URL('./modul/12.md', import.meta.url), 'utf8').replace(/\r\n/g, '\n')
const bagian = parseModul(md)
const m = modulById('12')

const barisTabel = (caption) => {
  const end = md.indexOf(caption)
  assert.ok(end > 0, caption)
  const lines = md.slice(0, end).trimEnd().split('\n')
  const out = []
  for (let i = lines.length - 1; i >= 0 && lines[i].startsWith('|'); i--) out.unshift(lines[i].split('|').slice(1, -1).map((c) => c.trim()))
  return out.slice(2)
}
const blokTeks = (bahasa, indeks = 0) => [...md.matchAll(new RegExp('```' + bahasa + '\\n([\\s\\S]*?)```', 'g'))][indeks][1]
const huruf = (tex) => tex.replace(/\$|\\langle|\\rangle|,/g, '').replace(/\s/g, '')

const acak = (n, alfabet = 'ABC') => Array.from({ length: n }, () => alfabet[Math.floor(rand() * alfabet.length)]).join('')

// ---------------------------------------------------------------- struktur dan metadata
test('struktur: enam bagian sesuai PDF pas dengan enam tab, dua pseudocode, satu tabel dari model, kode Python; teks polos tanpa TeX', () => {
  assert.deepEqual(bagian.map((s) => s.id), ['pendahuluan', 'algoritma', 'penelusuran', 'analisis', 'makna', 'kesimpulan', 'referensi'])
  assert.deepEqual(bagian.map((s) => s.judul.match(/^\d+/)?.[0] ?? null), ['1', '2', '3', '4', '5', '6', null])
  for (const t of tabsOf(m).filter((x) => x.id !== 'kuis')) assert.ok(bagian.some((s) => s.id === t.id), t.id)
  const slots = bagian.flatMap((s) => s.blok.filter((b) => b.type === 'slot')).map((b) => `${b.name}:${b.arg}`)
  assert.deepEqual(slots, ['pseudo:lcslen', 'gambar:tabel3', 'pseudo:plcs'])
  assert.deepEqual([...md.matchAll(/\*Tabel (\d+)\./g)].map((x) => Number(x[1])), [1, 2, 4], 'Tabel 3 dibuat komponen (dihitung dari model)')
  assert.equal([...md.matchAll(/```python/g)].length, 1)
  for (const jdl of ['2.1', '3.1', '3.2', '3.3', '4.1', '4.2', '4.3', '4.4', '4.5', '5.1', '5.2']) assert.ok(md.includes(`### ${jdl} `), `subbagian ${jdl}`)
  assert.equal([...md.matchAll(/\{\{callout:/g)].length, [...md.matchAll(/\{\{\/callout\}\}/g)].length, 'callout berpasangan')
  for (const l of md.split('\n').filter((x) => x.startsWith('{{callout'))) assert.ok(!/[$\\]/.test(l), `judul callout polos: ${l}`)
  for (const x of modul) assert.ok(![x.judul, x.judulPanjang, x.ringkas, x.prasyaratTeks].some((t) => /[$\\]/.test(t ?? '')), `${x.id}: teks polos`)
  assert.equal([...md.matchAll(/^\$\$.+\$\$$/gm)].length, 0, 'rumus blok memakai $$ di baris sendiri')
  assert.equal([...md.matchAll(/Catatan koreksi terhadap sumber/g)].length, 3, 'rumus langkah 11, LCS ketiga, dan pemanggilan awal')
  // tidak ada rumus sebaris yang panjang sekali (melebarkan halaman di HP, lihat Modul 11)
  for (const rumus of md.matchAll(/(?<!\$)\$(?!\$)([^$\n]+)\$(?!\$)/g)) assert.ok(rumus[1].length < 120, `rumus sebaris terlalu panjang: ${rumus[1].slice(0, 50)}`)
})

test('metadata sama dengan PDF dan katalog; visualizer LCS terhubung dua arah', () => {
  assert.deepEqual([m.no, m.bab, m.halaman, m.soal], [12, 'BAB IV', 11, 8])
  assert.equal(m.soal, kuis12.soal.length)
  assert.equal(m.tujuan.length, 5)
  assert.equal(petaBab[3].modul[2].judul, m.judul)
  assert.deepEqual(tabsOf(m).map((x) => x.tab), ['1 Pendahuluan', '2 Subbarisan', '3 Penyelesaian DP', '4 Contoh', '5 Analisis', '6 Kesimpulan', 'Kuis', 'Referensi'])
  assert.deepEqual(neighbors('12'), { prev: modulById('11'), next: null })
  assert.equal(neighbors('11').next, m)
  assert.ok(readFileSync(new URL('../../public/' + m.pdf, import.meta.url)).subarray(0, 4).toString() === '%PDF')
  assert.equal(m.algoritmaId, 'lcs')
  assert.ok(vizIds.includes(m.algoritmaId))
  const kartu = algoritma.find((a) => a.id === m.algoritmaId)
  assert.deepEqual([kartu.modul, kartu.viz, kartu.kategori], [12, true, 'dp'])
  assert.equal(kuisById('12').soal, 8)
  assert.equal(kuisById('12').judul, kuis12.judul)
  assert.ok(m.prasyarat.every((x) => modulById(String(x).padStart(2, '0'))))
})

// ---------------------------------------------------------------- subbarisan dan brute force
test('2: definisi subbarisan (bukan substring), contoh ⟨B,C,D,B⟩, dan 2^m subbarisan', () => {
  assert.ok(subbarisan('BCDB', 'ABCBDAB'))
  assert.deepEqual(posisiSubbarisan('BCDB', 'ABCBDAB'), [2, 3, 5, 7], 'elemen ke-2, 3, 5, 7')
  assert.ok(!'ABCBDAB'.includes('BCDB'), 'bukan substring')
  assert.ok(subbarisan('', 'ABC') && subbarisan('ABC', 'ABC') && !subbarisan('CBA', 'ABC'))
  for (const X of ['A', 'AB', 'ABC', 'ABCBDAB']) {
    // 2^m pilihan ambil/tidak; banyak subbarisan berbeda paling banyak 2^m, dan sama persis bila semua huruf berbeda
    let cacah = 0
    const f = (i) => (i === X.length ? void cacah++ : (f(i + 1), f(i + 1)))
    f(0)
    assert.equal(cacah, 2 ** X.length)
  }
  assert.equal(new Set(semuaLcsHelper('ABCDEFG')).size, 2 ** 7, 'huruf berbeda: 2^m subbarisan berbeda')
})
const semuaLcsHelper = (X) => {
  const out = ['']
  for (const h of X) for (const s of [...out]) out.push(s + h)
  return out
}

test('Tabel 1: tujuh subbarisan persekutuan, posisi dan panjang dicocokkan dengan X dan Y', () => {
  const t = barisTabel('*Tabel 1.')
  assert.equal(t.length, 7)
  const pos = (s) => [...s.matchAll(/[xy]_(\d)/g)].map((x) => Number(x[1]))
  assert.deepEqual(t.map((r) => huruf(r[0])), ['ABA', 'BCBA', 'CBA', 'BDAB', 'DAB', 'AB', 'B'])
  assert.deepEqual(t.map((r) => Number(r[3])), [3, 4, 3, 4, 3, 2, 1])
  for (const r of t) {
    const z = huruf(r[0])
    const px = pos(r[1])
    const py = pos(r[2])
    assert.equal(px.length, z.length)
    assert.equal(py.length, z.length)
    assert.ok(px.every((p, k) => contohX[p - 1] === z[k] && (k === 0 || p > px[k - 1])), `posisi di X untuk ${z}`)
    assert.ok(py.every((p, k) => contohY[p - 1] === z[k] && (k === 0 || p > py[k - 1])), `posisi di Y untuk ${z}`)
    assert.ok(subbarisan(z, contohX) && subbarisan(z, contohY))
  }
})

test('LCS contoh sama dengan pencarian semua subbarisan persekutuan: panjang 4, tepat dua LCS (BCBA dan BDAB)', () => {
  const { panjang, semua } = semuaLcs(contohX, contohY)
  assert.equal(panjang, 4)
  assert.deepEqual(semua, ['BCAB', 'BCBA', 'BDAB'], 'ada tiga LCS; bahan kuliah hanya menyebut dua')
  assert.ok(md.includes('LCS-nya adalah $\\langle B, C, B, A \\rangle$ dan $\\langle B, D, A, B \\rangle$, keduanya sepanjang 4.'))
  // LCS ketiga yang ditambahkan di catatan koreksi: posisi di teks benar
  assert.deepEqual(posisiSubbarisan('BCAB', contohX), [2, 3, 6, 7])
  assert.deepEqual(posisiSubbarisan('BCAB', contohY), [1, 3, 4, 5])
  assert.ok(md.includes('$\\langle B, C, A, B \\rangle$ (posisi $x_2, x_3, x_6, x_7$ di $X$ dan $y_1, y_3, y_4, y_5$ di $Y$)'))
})

// ---------------------------------------------------------------- tabel c dan b (Tabel 3)
const TABEL3 = [
  ['0', '0', '0', '0', '0', '0', '0'],
  ['0', '0 ↑', '0 ↑', '0 ↑', '1 ↖', '1 ←', '1 ↖'],
  ['0', '1 ↖', '1 ←', '1 ←', '1 ↑', '2 ↖', '2 ←'],
  ['0', '1 ↑', '1 ↑', '2 ↖', '2 ←', '2 ↑', '2 ↑'],
  ['0', '1 ↖', '1 ↑', '2 ↑', '2 ↑', '3 ↖', '3 ←'],
  ['0', '1 ↑', '2 ↖', '2 ↑', '2 ↑', '3 ↑', '3 ↑'],
  ['0', '1 ↑', '2 ↑', '2 ↑', '3 ↖', '3 ↑', '4 ↖'],
  ['0', '1 ↖', '2 ↑', '2 ↑', '3 ↑', '4 ↖', '4 ↑'],
]

test('Tabel 3 (nilai dan panah di PDF) sama dengan hasil LCS-LENGTH; panjang LCS c[7,6] = 4', () => {
  const { c, b } = lcsLength(contohX, contohY)
  for (let i = 0; i <= 7; i++) for (let j = 0; j <= 6; j++) {
    const sel = i === 0 || j === 0 ? String(c[i][j]) : `${c[i][j]} ${b[i][j]}`
    assert.equal(sel, TABEL3[i][j], `sel (${i},${j})`)
  }
  assert.equal(c[7][6], 4)
  assert.deepEqual(c, lcsTable(contohX, contohY), 'sama dengan tabel visualizer')
  const gambar = readFileSync(new URL('./modul/12.gambar.jsx', import.meta.url), 'utf8')
  assert.ok(gambar.includes('Tabel 3. Tabel c dan b hasil LCS-LENGTH untuk X = ⟨A,B,C,B,D,A,B⟩ dan Y = ⟨B,D,C,A,B,A⟩.'))
})

test('tabel c benar untuk ukuran acak: sama dengan pencarian semua subbarisan, dan b konsisten dengan c', () => {
  const pasangan = [['ABCBDAB', 'BDCABA'], ['ABC', 'XYZ'], ['ALGO', 'ALGO'], ['ACE', 'ABCDE'], ['KASUR', 'RUSAK'], ['', 'ABC']]
  for (let u = 0; u < 40; u++) pasangan.push([acak(Math.floor(rand() * 9), 'ABC'), acak(Math.floor(rand() * 9), 'ABCD')])
  for (const [X, Y] of pasangan) for (const atas of [true, false]) {
    const { c, b } = lcsLength(X, Y, atas)
    assert.equal(c[X.length][Y.length], semuaLcs(X, Y).panjang, `${X}/${Y}`)
    for (let i = 1; i <= X.length; i++) for (let j = 1; j <= Y.length; j++) {
      if (X[i - 1] === Y[j - 1]) assert.deepEqual([b[i][j], c[i][j]], ['↖', c[i - 1][j - 1] + 1])
      else if (b[i][j] === '↑') assert.deepEqual([c[i][j], c[i - 1][j] >= c[i][j - 1]], [c[i - 1][j], true])
      else assert.deepEqual([b[i][j], c[i][j]], ['←', c[i][j - 1]])
      assert.equal(c[i][j], semuaLcs(X.slice(0, i), Y.slice(0, j)).panjang, `prefiks ${i},${j}`)
    }
    // hasil PRINT-LCS adalah subbarisan persekutuan dengan panjang maksimum
    const { lcs } = printLcs(b, X, X.length, Y.length)
    assert.ok(subbarisan(lcs, X) && subbarisan(lcs, Y))
    assert.equal(lcs.length, c[X.length][Y.length])
    assert.ok(semuaLcs(X, Y).semua.includes(lcs), `${lcs} salah satu LCS`)
  }
})

test('Tabel 2: tiga kemungkinan pengisian, dan aturan seri memilih "↑" (≥) atau "←" (>)', () => {
  const t = barisTabel('*Tabel 2.')
  assert.equal(t.length, 3)
  assert.deepEqual(t.map((r) => r[2].match(/[↖↑←]/)[0]), ['↖', '↑', '←'])
  assert.deepEqual(t.map((r) => (r[0] + r[1] + r[2]).toLowerCase().match(/langkah (\d+)/g).join()), ['langkah 10,langkah 11,langkah 12', 'langkah 13,langkah 14,langkah 15', 'langkah 16,langkah 17'])
  // sel c[2,4] (seri 1 = 1): "↑" bila ≥, "←" bila >
  assert.equal(lcsLength(contohX, contohY, true).b[2][4], '↑')
  assert.equal(lcsLength(contohX, contohY, false).b[2][4], '←')
})

test('4.2: kelima sel yang dihitung di teks sama dengan tabel', () => {
  const { c, b } = lcsLength(contohX, contohY)
  assert.deepEqual([c[1][4], b[1][4], c[0][3]], [1, '↖', 0])
  assert.deepEqual([c[0][5], c[1][4], c[1][5], b[1][5]], [0, 1, 1, '←'])
  assert.deepEqual([c[1][4], c[2][3], c[2][4], b[2][4]], [1, 1, 1, '↑'])
  assert.deepEqual([c[3][4], c[4][5], b[4][5]], [2, 3, '↖'])
  assert.deepEqual([c[5][5], c[6][6], b[6][6]], [3, 4, '↖'])
  for (const x of ['$c[1,4] = c[0,3] + 1 = 1$', '$c[4,5] = c[3,4] + 1 = 2 + 1 = 3$', '$c[6,6] = c[5,5] + 1 = 3 + 1 = 4$', '$c[2,4] = c[1,4] = 1$']) assert.ok(md.includes(x), x)
})

test('catatan koreksi rumus langkah 11: rumus keliru memberi 5 pada c[4,5], rumus benar 3; pada c[2,1] kebetulan sama', () => {
  const { c } = lcsLength(contohX, contohY)
  assert.equal(contohX[1] === contohY[0] && contohX[1] === 'B', true, 'x2 = y1 = B')
  assert.deepEqual([c[1][0] + 1, c[1][1] + c[2][0] + 1], [1, 1])
  assert.equal(contohX[3] === contohY[4] && contohX[3] === 'B', true, 'x4 = y5 = B')
  assert.deepEqual([c[3][5], c[4][4], c[3][5] + c[4][4] + 1, c[3][4] + 1, c[4][5]], [2, 2, 5, 3, 3])
  assert.ok(c[3][5] + c[4][4] + 1 > c[4][5], 'rumus keliru melebihi nilai benar')
})

// ---------------------------------------------------------------- PRINT-LCS
test('4.3: penelusuran PRINT-LCS(b, X, 7, 6) sama persis dengan baris di teks; hasil BCBA; dibalik menjadi ABCB; panggilan awal (7,6)', () => {
  const { b } = lcsLength(contohX, contohY)
  const { lcs, pemanggilan, cetak } = printLcs(b, contohX, 7, 6)
  assert.equal(lcs, 'BCBA')
  const baris = blokTeks('text', 0).trimEnd().split('\n')
  const panggil = baris.filter((x) => x.startsWith('PRINT-LCS'))
  assert.equal(panggil.length, pemanggilan.length)
  pemanggilan.forEach((p, k) => {
    const [, mulai] = panggil[k].match(/PRINT-LCS\(b,X,(\d+,\d+)\)/)
    assert.equal(mulai, `${p.i},${p.j}`, `pemanggilan ${k + 1}`)
    if (p.arah) assert.ok(panggil[k].includes(`b[${p.i},${p.j}] = "${p.arah}"`), panggil[k])
    else assert.ok(panggil[k].includes('j == 0'))
  })
  assert.deepEqual(cetak.map((x) => `cetak x${x.i} = ${x.huruf}`), baris.filter((x) => x.startsWith('←')).map((x) => x.replace('← ', '')))
  assert.equal(baris.at(-1), 'Hasil cetak berurutan: B C B A')
  assert.equal(pemanggilan.length, 9, 'sembilan pemanggilan: 8 sel + 1 sel batas')
  assert.equal(printLcsTerbalik(b, contohX, 7, 6), 'ABCB', 'soal 5: urutan dibalik mencetak terbalik')
  assert.deepEqual(pemanggilan[0], { i: 7, j: 6, arah: '↑' })
  assert.ok(md.includes('PRINT-LCS(b, X, X.length, Y.length), yaitu PRINT-LCS(b, X, 7, 6).'))
})

test('4.4: aturan seri memilih "←" menghasilkan BDAB; keduanya sepanjang 4 dan keduanya adalah LCS', () => {
  const atas = printLcs(lcsLength(contohX, contohY, true).b, contohX, 7, 6).lcs
  const kiri = printLcs(lcsLength(contohX, contohY, false).b, contohX, 7, 6).lcs
  assert.deepEqual([atas, kiri], ['BCBA', 'BDAB'])
  assert.deepEqual(semuaLcs(contohX, contohY).semua.filter((s) => s !== 'BCAB'), [atas, kiri].sort(), 'dua LCS yang dibahas bahan kuliah; BCAB tidak pernah dicetak aturan seri mana pun')
  assert.ok(semuaLcs(contohX, contohY).semua.includes('BCAB'))
  assert.equal(lcsString(contohX, contohY), atas, 'sama dengan visualizer')
  // "Koreksi" pemanggilan awal: 8 dan 9 di luar tabel
  assert.equal(contohX.length, 7)
  assert.equal(contohY.length, 6)
})

test('pseudocode: nomor baris sama dengan PDF (1–18 dan 1–8) dan penjelasan langkah di teks merujuk baris yang tepat', () => {
  assert.equal(pseudo.lcslen.baris.length, 18)
  assert.equal(pseudo.plcs.baris.length, 8)
  const b = pseudo.lcslen.baris
  assert.ok(b[0].startsWith('m = X.length') && b[1].startsWith('n = Y.length'))
  assert.ok(b[4].includes('c[i, 0] = 0') && b[6].includes('c[0, j] = 0'))
  assert.ok(b[9].includes('if x[i] == y[j]') && b[10].includes('c[i-1, j-1] + 1') && b[11].includes('"↖"'))
  assert.ok(b[12].includes('c[i-1, j] ≥ c[i, j-1]') && b[13].includes('c[i, j] = c[i-1, j]') && b[14].includes('"↑"'))
  assert.ok(b[15].startsWith('        else c[i, j] = c[i, j-1]') && b[16].includes('"←"'))
  const p = pseudo.plcs.baris
  assert.ok(p[0].includes('i == 0 or j == 0') && p[2].includes('"↖"') && p[3].includes('i - 1, j - 1') && p[4].includes('print x[i]'))
  for (const x of ['**Langkah 4–5:**', '**Langkah 6–7:**', '**Langkah 8–17:**']) assert.ok(md.includes(x), x)
})

// ---------------------------------------------------------------- Python
test('program Python di modul dijalankan sungguhan dan keluarannya sama dengan teks dan model (BCBA, BDAB, GTAB)', (t) => {
  const kode = blokTeks('python')
  const cetak = blokTeks('text', 1).trimEnd().split('\n')
  assert.deepEqual(cetak, ['4 BCBA', '4 BDAB', '4 GTAB'])
  const model = [
    ['ABCBDAB', 'BDCABA', true],
    ['ABCBDAB', 'BDCABA', false],
    ['AGGTAB', 'GXTXAYB', true],
  ].map(([X, Y, a]) => {
    const { c, b } = lcsLength(X, Y, a)
    return `${c[X.length][Y.length]} ${printLcs(b, X, X.length, Y.length).lcs}`
  })
  assert.deepEqual(model, cetak)
  const py = cariPython()
  if (!py) return t.skip('Python 3 tidak ditemukan di mesin ini')
  const out = spawnSync(py, ['-c', kode], { encoding: 'utf8' })
  assert.equal(out.status, 0, out.stderr)
  assert.deepEqual(out.stdout.replace(/\r\n/g, '\n').trimEnd().split('\n'), cetak)
})

// ---------------------------------------------------------------- analisis
test('5.1: banyak sel mn, PRINT-LCS paling banyak m + n pemanggilan, brute force 2^m; memori dua baris O(min(m, n)) memberi panjang yang sama', () => {
  for (let u = 0; u < 60; u++) {
    const X = acak(Math.floor(rand() * 12), 'ABCD')
    const Y = acak(Math.floor(rand() * 12), 'ABCD')
    const { c, b } = lcsLength(X, Y)
    assert.equal((c.length - 1) * (c[0].length - 1), X.length * Y.length)
    const { pemanggilan } = printLcs(b, X, X.length, Y.length)
    assert.ok(pemanggilan.length <= X.length + Y.length + 1, `${X}/${Y}: ${pemanggilan.length} pemanggilan`)
    // dua baris saja (pilih barisan yang lebih pendek sebagai kolom)
    const [P, Q] = X.length >= Y.length ? [X, Y] : [Y, X]
    let lama = Array(Q.length + 1).fill(0)
    for (let i = 1; i <= P.length; i++) {
      const baru = Array(Q.length + 1).fill(0)
      for (let j = 1; j <= Q.length; j++) baru[j] = P[i - 1] === Q[j - 1] ? lama[j - 1] + 1 : Math.max(lama[j], baru[j - 1])
      lama = baru
    }
    assert.equal(lama[Q.length], c[X.length][Y.length], `dua baris ${X}/${Y}`)
  }
  assert.ok(md.includes('$O(\\min(m, n))$'))
})

test('PRINT-LCS terpanjang mencapai m + n tanpa kecocokan (jalur lurus): O(m + n) tercapai', () => {
  const X = 'AAAA'
  const Y = 'BBBBBB'
  const { b } = lcsLength(X, Y)
  assert.equal(printLcs(b, X, 4, 6).pemanggilan.length, 4 + 1, 'selalu naik: 4 sel + 1 batas (sebelum j habis)')
  const { b: b2 } = lcsLength(X, Y, false)
  assert.equal(printLcs(b2, X, 4, 6).pemanggilan.length, 6 + 1, 'selalu ke kiri: 6 sel + 1 batas')
})

test('Tabel 4 dan hubungan: Modul 11 dan Modul 05 ada, tabel pembanding memuat enam baris', () => {
  const t = barisTabel('*Tabel 4.')
  assert.equal(t.length, 6)
  assert.deepEqual(t.map((r) => r[0]), ['Jenis optimasi', 'Submasalah', 'Tabel nilai / tabel pilihan', 'Pilihan per submasalah', 'Running time', 'Penyusunan solusi'])
  assert.equal(modulById('11').judul, 'Perkalian Rantai Matriks')
  assert.ok(modulById('05'))
  assert.equal(petaBab[3].modul[1].judul, 'Perkalian Rantai Matriks')
})

// ---------------------------------------------------------------- kuis
test('kunci kuis dihitung ulang: soal 1, 2, 3, 6, dan 7', () => {
  const [q1, q2, q3, , , q6, q7, q8] = kuis12.soal
  // soal 1: hanya B subbarisan
  const X1 = 'KOMPUTER'
  const opsi = { A: 'KPOT', B: 'OPTR', C: 'MOUR', D: 'TUER' }
  assert.deepEqual(Object.entries(opsi).filter(([, z]) => subbarisan(z, X1)).map(([k]) => k), [q1.kunci])
  assert.deepEqual(posisiSubbarisan('OPTR', X1), [2, 4, 6, 8], 'O (ke-2), P (ke-4), T (ke-6), R (ke-8)')
  // soal 2
  const { c: c2, b: b2 } = lcsLength('ABCDE', 'ACE')
  const t2 = [
    ['0', '0', '0', '0'],
    ['0', '1 ↖', '1 ←', '1 ←'],
    ['0', '1 ↑', '1 ↑', '1 ↑'],
    ['0', '1 ↑', '2 ↖', '2 ←'],
    ['0', '1 ↑', '2 ↑', '2 ↑'],
    ['0', '1 ↑', '2 ↑', '3 ↖'],
  ]
  for (let i = 0; i <= 5; i++) for (let j = 0; j <= 3; j++) assert.equal(i === 0 || j === 0 ? String(c2[i][j]) : `${c2[i][j]} ${b2[i][j]}`, t2[i][j])
  assert.deepEqual([q2.isian[0].kunci, q2.isian[1].kunci, q2.isian[2].kunci], [c2[3][2], c2[5][3], printLcs(b2, 'ABCDE', 5, 3).lcs])
  assert.ok(subbarisan('ACE', 'ABCDE') && 'ACE'.length === 3 && semuaLcs('ABCDE', 'ACE').semua.join() === 'ACE')
  const tabelPembahasan = q2.pembahasan.split('\n').filter((l) => l.startsWith('|')).slice(2).map((l) => l.split('|').slice(1, -1).map((x) => x.trim()))
  tabelPembahasan.forEach((r, i) => r.slice(1).forEach((sel, j) => assert.equal(sel, t2[i][j], `pembahasan soal 2 (${i},${j})`)))
  // soal 3
  const { c, b } = lcsLength(contohX, contohY)
  assert.deepEqual([contohX[4], contohY[1]], ['D', 'D'])
  assert.deepEqual([c[4][1], c[5][2], b[5][2]], [1, 2, '↖'])
  assert.deepEqual([q3.isian[0].kunci, q3.isian[1].kunci], [c[5][2], b[5][2]])
  // soal 6
  assert.equal(semuaLcs('KASUR', 'RUSAK').panjang, q6.isian[0].kunci)
  assert.equal([...'RUSAK'].reverse().join(''), 'KASUR')
  assert.deepEqual([...'KASUR'].filter((h) => 'RUSAK'.includes(h)).sort(), ['A', 'K', 'R', 'S', 'U'], 'huruf sama')
  // soal 7
  assert.equal(1000 * 2000, q7.isian[0].kunci)
  assert.equal(1001 * 2001, 2003001)
  assert.equal(Math.round(1000 * Math.log10(2)), q7.isian[1].kunci)
  assert.ok((2n ** 1000n).toString().length === 302, '2^1000 punya 302 digit, jadi sekitar 10^301')
  assert.equal(q8.kunci, 'B')
})

test('soal 4, 5, dan 8: jawaban tunggal LCS salah (dua LCS), PRINT-LCS terbalik ABCB, dan arti "↑"', () => {
  assert.equal(kuis12.soal[3].kunci, 'Salah')
  assert.ok(semuaLcs(contohX, contohY).semua.length > 1)
  assert.equal(printLcsTerbalik(lcsLength(contohX, contohY).b, contohX), 'ABCB')
  assert.ok(kuis12.soal[4].kunciTeks.includes('"ABCB"'))
  // "↑": x_i ≠ y_j dan c[i,j] = c[i−1,j] (elemen x_i tidak dipakai)
  const { c, b } = lcsLength(contohX, contohY)
  for (let i = 1; i <= 7; i++) for (let j = 1; j <= 6; j++) if (b[i][j] === '↑') assert.ok(contohX[i - 1] !== contohY[j - 1] && c[i][j] === c[i - 1][j])
})

test('struktur kuis: 8 soal, jenis sesuai PDF, hanya soal 5 dinilai sendiri', () => {
  assert.deepEqual(kuis12.soal.map((q) => q.no), [1, 2, 3, 4, 5, 6, 7, 8])
  assert.deepEqual(kuis12.soal.map((q) => TIPE_LABEL[q.tipe]), ['Pilihan Ganda', 'Perhitungan', 'Perhitungan', 'Benar/Salah', 'Analisis', 'Perhitungan', 'Perhitungan', 'Pilihan Ganda'])
  assert.deepEqual(kuis12.soal.filter((q) => q.mandiri).map((q) => q.no), [5])
  for (const q of kuis12.soal) {
    assert.ok(q.teks.length > 10 && q.pembahasan.length > 10, `soal ${q.no}`)
    if (q.opsi) assert.ok(q.opsi.some((o) => o.id === q.kunci))
    if (q.mandiri) assert.ok(q.kunciTeks)
    for (const f of q.isian ?? []) if (f.jenis === 'pilih') assert.ok(f.opsi.includes(f.kunci), `soal ${q.no}: kunci "${f.kunci}" ada di opsi`)
    assert.equal([q.mandiri, q.opsi, q.isian].filter(Boolean).length, 1, `satu jenis jawaban per soal (${q.no})`)
  }
  assert.deepEqual([...new Set(kuis12.soal.map((q) => q.tipe))].sort(), [...daftarKuis.find((k) => k.id === '12').tipe].sort())
})

test('penilaian soal Modul 12', () => {
  const [q1, q2, q3, q4, , q6, q7, q8] = kuis12.soal
  assert.equal(nilaiSoal(q1, 'B').benar, true)
  assert.equal(nilaiSoal(q1, 'D').benar, false)
  assert.equal(nilaiSoal(q2, ['2', '3', 'ACE']).benar, true)
  assert.equal(nilaiSoal(q2, ['2', '3', 'ABC']).benar, false)
  assert.equal(nilaiSoal(q3, ['2', '↖']).benar, true)
  assert.equal(nilaiSoal(q3, ['2', '↑']).benar, false)
  assert.equal(nilaiSoal(q4, 'Salah').benar, true)
  assert.equal(nilaiSoal(q6, ['1']).benar, true)
  assert.equal(nilaiSoal(q7, ['2.000.000', '301']).benar, true, 'angka boleh memakai titik ribuan')
  assert.equal(nilaiSoal(q7, ['2001000', '301']).benar, false)
  assert.equal(nilaiSoal(q8, 'B').benar, true)
  const semua = { 1: 'B', 2: ['2', '3', 'ACE'], 3: ['2', '↖'], 4: 'Salah', 5: { teks: 'a', sesuai: true }, 6: ['1'], 7: ['2000000', '301'], 8: 'B' }
  const h = hitungHasil(kuis12.soal, semua)
  assert.deepEqual([h.skor, h.lulus], [8, true])
  assert.deepEqual(hitungHasil(kuis12.soal, { ...semua, 5: undefined }).belumDinilai, [5])
})

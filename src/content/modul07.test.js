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
import { penjelajahIds } from '../viz/penjelajahIds.js'
import { banding, barisDefinisi, bentuk, cariN0, formatLog, kasusById, kasusDefinisi, kesimpulanLimit, log10Bentuk, logRasio, syaratDi, ujiLimit } from '../viz/limitModel.js'
import { kuis07 } from './modul/07.kuis.js'

const md = readFileSync(new URL('./modul/07.md', import.meta.url), 'utf8').replace(/\r\n/g, '\n')
const bagian = parseModul(md)
const m = modulById('07')

const barisTabel = (caption) => {
  const end = md.indexOf(caption)
  assert.ok(end > 0, caption)
  const lines = md.slice(0, end).trimEnd().split('\n')
  const out = []
  for (let i = lines.length - 1; i >= 0 && lines[i].startsWith('|'); i--) out.unshift(lines[i].split('|').slice(1, -1).map((c) => c.trim()))
  return out.slice(2)
}

// ---------------------------------------------------------------- struktur dan metadata
test('struktur: delapan bagian sesuai PDF, semua tab terpenuhi, tiga tabel, kode Python', () => {
  assert.deepEqual(bagian.map((s) => s.id), ['pendahuluan', 'algoritma', 'penelusuran', 'analisis', 'makna', 'penerapan', 'peran', 'kesimpulan', 'referensi'])
  assert.deepEqual(bagian.map((s) => s.judul.match(/^\d+/)?.[0] ?? null), ['1', '2', '3', '4', '5', '6', '7', '8', null])
  for (const t of tabsOf(m).filter((x) => x.id !== 'kuis')) assert.ok(bagian.some((s) => s.id === t.id), t.id)
  assert.deepEqual([...md.matchAll(/\*Tabel (\d+)\./g)].map((x) => Number(x[1])), [1, 2, 3])
  assert.equal([...md.matchAll(/```python/g)].length, 1)
  for (const jdl of ['3.1', '3.2', '3.3', '4.1', '4.2', '5.1', '5.2', '5.3', '6.1']) assert.ok(md.includes(`### ${jdl} `), `subbagian ${jdl}`)
  assert.equal([...md.matchAll(/\{\{callout:/g)].length, [...md.matchAll(/\{\{\/callout\}\}/g)].length, 'callout berpasangan')
})

test('metadata sama dengan PDF dan katalog; penjelajah terhubung dua arah', () => {
  assert.deepEqual([m.no, m.bab, m.halaman, m.soal, m.prasyarat], [7, 'BAB II', 9, 7, [6]])
  assert.equal(m.soal, kuis07.soal.length)
  assert.equal(m.tujuan.length, 4)
  assert.equal(petaBab[1].modul[4].judul, m.judul)
  assert.deepEqual(tabsOf(m).map((x) => x.tab), ['1 Pendahuluan', '2 Ketat & Tidak', '3 Little-o', '4 Little-ω', '5 Uji Limit', '8 Kesimpulan', 'Kuis', 'Referensi'])
  assert.deepEqual(neighbors('07'), { prev: modulById('06'), next: null })
  assert.equal(neighbors('06').next, m)
  assert.ok(readFileSync(new URL('../../public/' + m.pdf, import.meta.url)).subarray(0, 4).toString() === '%PDF')
  assert.ok(penjelajahIds.includes(m.algoritmaId))
  const kartu = algoritma.find((a) => a.id === m.algoritmaId)
  assert.deepEqual([kartu.modul, kartu.viz, kartu.thumb], [7, true, 'limit'])
  assert.equal(kuisById('07').soal, 7)
  assert.equal(kuisById('07').judul, kuis07.judul)
})

// ---------------------------------------------------------------- isi teks dicocokkan dengan hitungan
test('Tabel 1, 2, dan 3: isi sesuai PDF', () => {
  const t1 = barisTabel('*Tabel 1.')
  assert.deepEqual(t1.map((r) => [r[1], r[2]]), [['Ya', 'Ketat'], ['Ya', 'Tidak ketat']])
  // 2n² = Θ(n²) dan 2n = o(n²) menurut model
  assert.equal(ujiLimit('n2', 'n2', 2, 1).benar.Theta, true)
  assert.equal(ujiLimit('n', 'n2', 2, 1).benar.Theta, false)
  const t2 = barisTabel('*Tabel 2.')
  assert.deepEqual(t2.map((r) => r[1]), ['$a < b$', '$a \\le b$', '$a = b$', '$a \\ge b$', '$a > b$'])
  const u = ujiLimit('n', 'n2')
  const urut = [u.benar.o, u.benar.O, u.benar.Theta, u.benar.Omega, u.benar.omega]
  assert.deepEqual(urut, [true, true, false, false, false], 'o ⇒ O, bukan Θ, Ω, ω')
  const t3 = barisTabel('*Tabel 3.')
  assert.equal(t3.length, 3)
  // contoh Tabel 3: 2n/n² → 0, (2n² − 3n + 1)/n² → 2, (n²/2)/n → ∞
  assert.equal(ujiLimit('n', 'n2', 2, 1).L, 0)
  assert.equal(ujiLimit('n2', 'n2', 2, 1).L, 2)
  assert.equal(ujiLimit('n2', 'n', 0.5, 1).L, Infinity)
  for (const n of [1e3, 1e6, 1e9]) {
    assert.ok(Math.abs((2 * n * n - 3 * n + 1) / (n * n) - 2) < 4 / n)
  }
})

test('limit yang dihitung di teks sama dengan model dan dengan pengamatan numerik', () => {
  // 5.3 (a)–(d), hierarki, Contoh 1 dan 2, dan Soal 4 dan 7 kuis
  const o = (a, b) => ujiLimit(a, b).benar.o
  assert.ok(o('lg', 'n') && o('nlg', 'n2') && o('n', 'nlg') && o('n2', '2n'))
  assert.ok(o('1', 'lg') && o('lg', 'n') && o('n', 'nlg') && o('nlg', 'n2') && o('n2', 'n3') && o('n3', '2n'), 'hierarki 5.3')
  assert.ok(o('nlg', 'n15'), 'Soal 4')
  assert.ok(o('lg', 'sqrt') && o('sqrt', 'nlg'), 'Soal 7')
  assert.equal(ujiLimit('nlg', 'n2').benar.O, true)
  assert.equal(ujiLimit('n2', 'n2').benar.o, false, '2n² ≠ o(n²); n² = o(n²) salah')
  // Contoh 2: 100 n lg n = o(n²/10)
  assert.equal(ujiLimit('nlg', 'n2', 100, 0.1).benar.o, true)
  // Contoh 1: 5n³ + 2n = o(n³ lg n): bagian dominan 5n³ sudah little-o
  assert.equal(ujiLimit('n3', 'n3').benar.Theta, true)
  const f1 = (n) => (5 * n ** 3 + 2 * n) / (n ** 3 * Math.log2(n))
  assert.ok(f1(1e3) > f1(1e6) && f1(1e6) > f1(1e12) && f1(1e12) < 0.13)
  assert.ok(Math.abs(5 / Math.log2(1e12) + 2 / (1e24 * Math.log2(1e12)) - f1(1e12)) < 1e-9)
})

test('program Python di modul dijalankan sungguhan dan sama dengan teks dan model', (t) => {
  const kode = /```python\n([\s\S]*?)```/.exec(md)[1]
  const cetak = /```text\n([\s\S]*?)```/.exec(md)[1].trimEnd()
  assert.equal(cetak.split('\n').length, 5)
  // model: nilai rasio yang dicetak program (3 angka bermakna) sama dengan logRasio pada n = 10, 100, 1000
  const pasangan = [['n', 'n2', 2, 1], ['n2', 'n2', 2, 1], ['lg', 'n', 1, 1], ['n2', 'n', 0.5, 1], ['n2', '2n', 1, 1]]
  const tiga = (x) => Number(x.toPrecision(3))
  const dariModel = pasangan.map(([a, b, cf, cg]) => [10, 100, 1000].map((n) => tiga(10 ** logRasio(a, b, cf, cg, n))))
  const dariTeks = cetak.split('\n').map((s) => s.slice(13).trim().split(/\s+/).map(Number))
  dariTeks.forEach((baris, i) => baris.forEach((v, j) => {
    const w = dariModel[i][j]
    assert.ok(Math.abs(v - w) <= 1e-12 + Math.abs(v) * 0.011, `baris ${i + 1}, kolom ${j + 1}: teks ${v}, model ${w}`)
  }))
  const py = cariPython()
  if (!py) return t.skip('Python 3 tidak ditemukan di mesin ini')
  const r = spawnSync(py, ['-c', kode], { encoding: 'utf8' })
  assert.equal(r.status, 0, r.stderr)
  assert.equal(r.stdout.replace(/\r\n/g, '\n').trimEnd(), cetak)
})

// ---------------------------------------------------------------- model uji limit
test('urutan bentuk fungsi: setiap bentuk little-o dari berikutnya, dan rasio akhirnya menurun (diperiksa numerik)', () => {
  for (let i = 1; i < bentuk.length; i++) {
    const a = bentuk[i - 1]
    const b = bentuk[i]
    assert.equal(banding(a, b), -1, `${a.label} ≺ ${b.label}`)
    assert.equal(banding(b, a), 1)
    assert.equal(banding(a, a), 0)
    // rasio menurun di rentang besar (bentuk eksponensial/faktorial diuji pada n yang lebih kecil)
    const [n1, n2] = [a, b].some((x) => x.jenis !== 'poli') ? [2000, 4000] : [1e8, 1e16]
    assert.ok(logRasio(a.id, b.id, 1, 1, n2) < logRasio(a.id, b.id, 1, 1, n1), `${a.label}/${b.label} menurun`)
  }
})

test('kelima notasi konsisten: o ⇒ O, ω ⇒ Ω, Θ ⇔ O dan Ω, o ⇔ transpose ω, dan tepat satu dari {o, Θ, ω}', () => {
  for (const a of bentuk) {
    for (const b of bentuk) {
      for (const [cf, cg] of [[1, 1], [2, 1], [0.5, 3]]) {
        const u = ujiLimit(a.id, b.id, cf, cg)
        const v = ujiLimit(b.id, a.id, cg, cf)
        const { o, O, Theta, Omega, omega } = u.benar
        assert.equal(!o || O, true)
        assert.equal(!omega || Omega, true)
        assert.equal(Theta, O && Omega)
        assert.equal([o, Theta, omega].filter(Boolean).length, 1)
        assert.equal(o, v.benar.omega, 'f = o(g) ⇔ g = ω(f)')
        assert.equal(Theta, v.benar.Theta)
        if (u.cmp === 0) assert.ok(Math.abs(u.L - cf / cg) < 1e-12 && Math.abs(u.L * v.L - 1) < 1e-9)
      }
    }
  }
  assert.equal(kesimpulanLimit(ujiLimit('n', 'n2'), 'n', 'n²'), 'L = 0, jadi n = o(n²), sehingga juga n = O(n²) dan n ≠ Ω(n²).')
  assert.ok(kesimpulanLimit(ujiLimit('n2', 'n'), 'n²', 'n').includes('ω'))
})

test('formatLog: nilai sedang biasa, ekstrem notasi ilmiah (sama dengan keluaran program Python)', () => {
  assert.equal(formatLog(Math.log10(0.2)), '0,2')
  assert.equal(formatLog(Math.log10(500)), '500')
  assert.equal(formatLog(logRasio('n2', '2n', 1, 1, 100)), '7,89 × 10⁻²⁷')
  assert.equal(formatLog(logRasio('n2', '2n', 1, 1, 1000)), '9,33 × 10⁻²⁹⁶')
  assert.equal(formatLog(-1e6), 'sangat kecil')
  assert.equal(formatLog(1e6), 'sangat besar')
  assert.equal(formatLog(NaN), '—')
  assert.ok(Math.abs(log10Bentuk('sqrt', 100) - 1) < 1e-12 && Math.abs(log10Bentuk('n15', 100) - 3) < 1e-12)
})

// ---------------------------------------------------------------- uji definisi
test('definisi: n₀ = ⌊2/c⌋ + 1 (2n = o(n²)) dan ⌊2c⌋ + 1 (n²/2 = ω(n)) sama dengan pencarian langsung; c = 0,01 memberi 201', () => {
  const a = kasusById('a')
  const c = kasusById('c')
  assert.deepEqual(cariN0(a, 0.01), { ada: true, n0: 201 })
  for (const cc of [0.01, 0.02, 0.05, 0.1, 0.25, 0.5, 1, 3, 10, 100]) {
    assert.deepEqual(cariN0(a, cc), { ada: true, n0: a.n0Rumus(cc) }, `a, c=${cc}`)
    assert.deepEqual(cariN0(c, cc), { ada: true, n0: c.n0Rumus(cc) }, `c, c=${cc}`)
    // tepat di n₀ − 1 syaratnya gagal (n₀ memang terkecil), dan berlaku untuk banyak n ≥ n₀
    if (a.n0Rumus(cc) > 1) assert.equal(syaratDi(a, cc, a.n0Rumus(cc) - 1), false)
    for (let n = a.n0Rumus(cc); n < a.n0Rumus(cc) + 2000; n++) assert.ok(syaratDi(a, cc, n))
  }
})

test('definisi: 2n² ≠ o(n²) — syarat gagal untuk setiap c ≤ 2 dan berlaku sejak n = 1 untuk c > 2', () => {
  const b = kasusById('b')
  for (const cc of [0.001, 0.5, 1, 1.999, 2]) assert.deepEqual(cariN0(b, cc), { ada: false, n0: null }, `c=${cc}`)
  for (const cc of [2.001, 3, 10]) assert.deepEqual(cariN0(b, cc), { ada: true, n0: 1 }, `c=${cc}`)
  // dengan c = 3 membuat 2n² < 3n², dan c = 1 tidak pernah (Bagian 3.1)
  assert.ok(syaratDi(b, 3, 7) && !syaratDi(b, 1, 7))
  assert.deepEqual(kasusDefinisi.map((k) => k.id), ['a', 'b', 'c'])
  const baris = barisDefinisi(a2(), 0.01, 201)
  assert.deepEqual(baris.map((r) => [r.n, r.ok]), [[200, false], [201, true], [2010, true]])
  assert.deepEqual([baris[0].f, baris[0].cg], [400, 400])
})
const a2 = () => kasusById('a')

// ---------------------------------------------------------------- kuis
test('kunci kuis dihitung ulang', () => {
  // soal 2: 3n + 5 < n² pertama kali (dan seterusnya) pada n = 5
  const ok = (n) => 3 * n + 5 < n * n
  assert.equal(ok(4), false)
  assert.equal(17 < 16, false)
  for (let n = 5; n <= 100000; n++) assert.ok(ok(n))
  assert.equal(20 < 25, true)
  assert.equal(ujiLimit('n', 'n2', 3, 1).benar.o, true)
  assert.equal(kuis07.soal[1].isian[0].kunci, 5)
  // soal 3: (a) n² = o(n²) salah, (b) n³ = ω(n²), (c) lg n = ω(1)
  assert.deepEqual([ujiLimit('n2', 'n2').benar.o, ujiLimit('n3', 'n2').benar.omega, ujiLimit('lg', '1').benar.omega], [false, true, true])
  assert.deepEqual(kuis07.soal[2].isian.map((f) => f.kunci), ['Salah', 'Benar', 'Benar'])
  // soal 4: n lg n = o(n^1,5)
  assert.equal(ujiLimit('nlg', 'n15').benar.o, true)
  assert.equal(kuis07.soal[3].isian[0].kunci, 'o')
  // soal 6: limit 4 → Θ
  assert.equal(ujiLimit('n2', 'n2', 4, 1).benar.Theta, true)
  for (const n of [10, 1e3, 1e6]) assert.ok(Math.abs((4 * n * n + n) / (n * n) - 4) <= 1 / n + 1e-12)
  // soal 7: urutan lg n ≺ √n ≺ n lg n ≺ n² ≺ 2ⁿ menurut model (dan acak urutannya dulu)
  const kacau = ['n2', 'lg', '2n', 'nlg', 'sqrt']
  const urut = [...kacau].sort((x, y) => banding(bentuk.find((b) => b.id === x), bentuk.find((b) => b.id === y)))
  assert.deepEqual(urut, ['lg', 'sqrt', 'nlg', 'n2', '2n'])
  // 1/(√n lg n) → 0
  assert.ok(1 / (Math.sqrt(1e12) * Math.log2(1e12)) < 1e-6)
})

test('struktur kuis: 7 soal, jenis sesuai PDF, soal 5 dan 7 dinilai sendiri', () => {
  assert.deepEqual(kuis07.soal.map((q) => q.no), [1, 2, 3, 4, 5, 6, 7])
  assert.deepEqual(kuis07.soal.map((q) => TIPE_LABEL[q.tipe]), ['Pilihan Ganda', 'Pembuktian', 'Benar/Salah', 'Perhitungan', 'Analisis', 'Pilihan Ganda', 'Analisis'])
  assert.deepEqual(kuis07.soal.filter((q) => q.opsi).map((q) => q.kunci), ['B', 'C'])
  assert.deepEqual(kuis07.soal.filter((q) => q.mandiri).map((q) => q.no), [5, 7])
  for (const q of kuis07.soal) {
    assert.ok(q.teks.length > 10 && q.pembahasan.length > 10, `soal ${q.no}`)
    if (q.opsi) assert.ok(q.opsi.some((o) => o.id === q.kunci))
    if (q.mandiri) assert.ok(q.kunciTeks)
    assert.equal([q.mandiri, q.opsi, q.isian].filter(Boolean).length, 1, `satu jenis jawaban per soal (${q.no})`)
  }
  assert.deepEqual([...new Set(kuis07.soal.map((q) => q.tipe))].sort(), [...daftarKuis.find((k) => k.id === '07').tipe].sort())
})

test('penilaian soal Modul 07', () => {
  const [q1, q2, q3, q4, , q6] = kuis07.soal
  assert.equal(nilaiSoal(q1, 'B').benar, true)
  assert.equal(nilaiSoal(q1, 'A').benar, false)
  assert.equal(nilaiSoal(q2, ['5']).benar, true)
  assert.equal(nilaiSoal(q2, ['4']).benar, false)
  assert.equal(nilaiSoal(q3, ['Salah', 'Benar', 'Benar']).benar, true)
  assert.equal(nilaiSoal(q3, ['Benar', 'Benar', 'Benar']).benar, false)
  assert.equal(nilaiSoal(q4, ['o']).benar, true)
  assert.equal(nilaiSoal(q4, ['ω']).benar, false)
  assert.equal(nilaiSoal(q6, 'C').benar, true)
  const ok = { teks: 'a', sesuai: true }
  const semua = { 1: 'B', 2: ['5'], 3: ['Salah', 'Benar', 'Benar'], 4: ['o'], 5: ok, 6: 'C', 7: ok }
  assert.deepEqual([hitungHasil(kuis07.soal, semua).skor, hitungHasil(kuis07.soal, semua).lulus], [7, true])
  assert.deepEqual(hitungHasil(kuis07.soal, { ...semua, 5: undefined }).belumDinilai, [5])
})

test('teks prasyarat ditampilkan apa adanya (bukan TeX), jadi tidak boleh memuat tanda $ atau perintah \\', () => {
  for (const x of modul) assert.ok(!/[$\\]/.test(x.prasyaratTeks ?? ''), `${x.id}: ${x.prasyaratTeks}`)
})

test('rumus TeX di teks hanya memakai perintah yang didukung renderer (mis. tanpa \\textbf di dalam \\text)', () => {
  assert.ok(!/\\text\{[^}]*\\textbf/.test(md), '\\textbf di dalam \\text tidak dirender')
  const gaya = readFileSync(new URL('./modul/06.md', import.meta.url), 'utf8')
  assert.ok(!/\\text\{[^}]*\\textbf/.test(gaya))
})

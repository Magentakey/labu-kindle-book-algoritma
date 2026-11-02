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
import { rand } from '../lib/testRandom.js'
import { contoh, contohById, klasifikasi, logBA, nilaiPengurangan, nilaiT, pembagiSolusi, pendominasi, pohonRekursi, rasioNumerik, teksRecurrence, teksSolusi, teksSuku } from '../viz/masterModel.js'
import { kuis09 } from './modul/09.kuis.js'

const md = readFileSync(new URL('./modul/09.md', import.meta.url), 'utf8').replace(/\r\n/g, '\n')
const bagian = parseModul(md)
const m = modulById('09')

const barisTabel = (caption) => {
  const end = md.indexOf(caption)
  assert.ok(end > 0, caption)
  const lines = md.slice(0, end).trimEnd().split('\n')
  const out = []
  for (let i = lines.length - 1; i >= 0 && lines[i].startsWith('|'); i--) out.unshift(lines[i].split('|').slice(1, -1).map((c) => c.trim()))
  return out.slice(2)
}
const blokTeks = (bahasa, indeks = 0) => [...md.matchAll(new RegExp('```' + bahasa + '\\n([\\s\\S]*?)```', 'g'))][indeks][1]
const solusiHasil = (a, b, k, q = 0) => teksSolusi(klasifikasi(a, b, { k, q }))

// ---------------------------------------------------------------- struktur dan metadata
test('struktur: enam bagian sesuai PDF dan enam tab, dua tabel, kode Python; teks polos tanpa TeX', () => {
  assert.deepEqual(bagian.map((s) => s.id), ['pendahuluan', 'algoritma', 'penelusuran', 'analisis', 'makna', 'kesimpulan', 'referensi'])
  assert.deepEqual(bagian.map((s) => s.judul.match(/^\d+/)?.[0] ?? null), ['1', '2', '3', '4', '5', '6', null])
  for (const t of tabsOf(m).filter((x) => x.id !== 'kuis')) assert.ok(bagian.some((s) => s.id === t.id), t.id)
  assert.deepEqual([...md.matchAll(/\*Tabel (\d+)\./g)].map((x) => Number(x[1])), [1, 2])
  assert.equal([...md.matchAll(/```python/g)].length, 1)
  for (const jdl of ['2.1', '3.1', '3.2', '3.3', '4.1', '4.2', '4.3']) assert.ok(md.includes(`### ${jdl} `), `subbagian ${jdl}`)
  assert.equal([...md.matchAll(/\{\{callout:/g)].length, [...md.matchAll(/\{\{\/callout\}\}/g)].length, 'callout berpasangan')
  // judul callout, judul modul, dan ringkasan dirender sebagai teks biasa (bukan TeX)
  for (const l of md.split('\n').filter((x) => x.startsWith('{{callout'))) assert.ok(!/[$\\]/.test(l), `judul callout polos: ${l}`)
  for (const x of modul) assert.ok(![x.judul, x.judulPanjang, x.ringkas, x.prasyaratTeks].some((t) => /[$\\]/.test(t ?? '')), `${x.id}: teks polos`)
  assert.ok(!/\\text\{[^}]*\\textbf/.test(md))
})

test('metadata sama dengan PDF dan katalog; penjelajah Pohon Recurrence terhubung dua arah', () => {
  assert.deepEqual([m.no, m.bab, m.halaman, m.soal, m.prasyarat], [9, 'BAB III', 10, 8, [6, 7, 8]])
  assert.equal(m.soal, kuis09.soal.length)
  assert.equal(m.tujuan.length, 4)
  assert.equal(petaBab[2].modul[1].judul, m.judul)
  assert.deepEqual(tabsOf(m).map((x) => x.tab), ['1 Pendahuluan', '2 Recurrence', '3 Metode Master', '4 Contoh', '5 Batasan', '6 Kesimpulan', 'Kuis', 'Referensi'])
  assert.deepEqual(neighbors('09'), { prev: modulById('08'), next: null })
  assert.equal(neighbors('08').next, m)
  assert.ok(readFileSync(new URL('../../public/' + m.pdf, import.meta.url)).subarray(0, 4).toString() === '%PDF')
  assert.equal(m.algoritmaId, 'pohon-recurrence')
  assert.ok(penjelajahIds.includes(m.algoritmaId))
  const kartu = algoritma.find((a) => a.id === m.algoritmaId)
  assert.deepEqual([kartu.modul, kartu.viz, kartu.thumb], [9, true, 'levels'])
  assert.equal(kuisById('09').soal, 8)
  assert.equal(kuisById('09').judul, kuis09.judul)
})

// ---------------------------------------------------------------- Metode Master dicocokkan dengan teks
test('contoh dan soal latihan di teks (4, 4.1) sama dengan hasil model', () => {
  // Contoh 1: 2T(N/2) + √N → kasus 1, Θ(n), ε sampai 1/2
  const c1 = klasifikasi(2, 2, { k: 0.5 })
  assert.deepEqual([c1.kasus, c1.e, teksSolusi(c1), c1.epsilon.maks], [1, 1, 'Θ(n)', 0.5])
  // Contoh 2: 4T(N/2) + N² → kasus 2, Θ(n² lg n)
  const c2 = klasifikasi(4, 2, { k: 2 })
  assert.deepEqual([c2.kasus, c2.e, teksSolusi(c2)], [2, 2, 'Θ(n² lg n)'])
  // Contoh 3: T(3N/5) + N → b = 5/3, kasus 3, c = 3/5, ε sampai 1, Θ(n)
  const c3 = klasifikasi(1, 5 / 3, { k: 1 })
  assert.deepEqual([c3.kasus, c3.e, teksSolusi(c3), c3.epsilon.maks], [3, 0, 'Θ(n)', 1])
  assert.ok(Math.abs(c3.keteraturan.c - 3 / 5) < 1e-12 && c3.keteraturan.ok)
  // Soal 1: 9T(N/3) + N → kasus 1, Θ(n²), ε ≤ 1
  const s1 = klasifikasi(9, 3, { k: 1 })
  assert.deepEqual([s1.kasus, s1.e, teksSolusi(s1), s1.epsilon.maks], [1, 2, 'Θ(n²)', 1])
  // Soal 2: 5T(N/2) + N³ → kasus 3, log₂5 ≈ 2,32, ε ≤ 0,68, c = 5/8, Θ(n³)
  const s2 = klasifikasi(5, 2, { k: 3 })
  assert.deepEqual([s2.kasus, teksSolusi(s2)], [3, 'Θ(n³)'])
  assert.ok(Math.abs(s2.e - 2.3219) < 1e-4 && Math.abs(s2.epsilon.maks - 0.678) < 1e-3 && Math.abs(s2.keteraturan.c - 5 / 8) < 1e-12)
  for (const kunci of ['0 < \\varepsilon \\le 0{,}68', 'c = \\frac{5}{8} < 1', 'c = \\frac{3}{5} < 1', '\\varepsilon = \\frac{1}{2}']) assert.ok(md.includes(kunci), kunci)
})

test('Tabel 2: setiap baris (kasus dan solusi) sama dengan model', () => {
  const rows = barisTabel('*Tabel 2.')
  const harapan = [
    [2, 2, 1, 0, 2, 'Θ(n lg n)'],
    [1, 2, 0, 0, 2, 'Θ(lg n)'],
    [8, 2, 2, 0, 1, 'Θ(n³)'],
    [7, 2, 2, 0, 1, 'Θ(n^2,807)'],
    [3, 3, 1, 0, 2, 'Θ(n lg n)'],
    [3, 4, 1, 1, 3, 'Θ(n lg n)'],
  ]
  assert.equal(rows.length, harapan.length)
  harapan.forEach(([a, b, k, q, kasus, solusi], i) => {
    const h = klasifikasi(a, b, { k, q })
    assert.equal(h.kasus, kasus, `baris ${i + 1}`)
    assert.equal(teksSolusi(h), solusi, `baris ${i + 1}`)
    assert.ok(rows[i][4].startsWith(String(kasus)), `kolom Kasus baris ${i + 1}: ${rows[i][4]}`)
    assert.equal(rows[i][1], `${a}, ${b}`)
  })
  // n^lg 7 ≈ n^2,81 dan n^log₄ 3 ≈ n^0,79 (dibulatkan seperti di tabel); ε untuk baris terakhir ≈ 0,2
  assert.ok(Math.abs(logBA(7, 2) - 2.807) < 1e-3 && Math.abs(logBA(3, 4) - 0.7925) < 1e-4)
  assert.ok(Math.abs(klasifikasi(3, 4, { k: 1, q: 1 }).epsilon.maks - 0.2075) < 1e-3)
  // syarat keteraturan baris terakhir: 3·(n/4) lg(n/4) ≤ (3/4) n lg n untuk n ≥ 4
  for (let n = 4; n <= 100000; n *= 3) assert.ok(3 * (n / 4) * Math.log2(n / 4) <= 0.75 * n * Math.log2(n))
  // Strassen: Θ(n^lg 7) lebih cepat dari Θ(n³)
  assert.ok(logBA(7, 2) < 3)
})

test('celah dan bentuk tidak sesuai (Bagian 5)', () => {
  const c = klasifikasi(2, 2, { k: 1, q: 1 })
  assert.deepEqual([c.kasus, teksSolusi(c)], ['celah', 'Θ(n lg² n)'])
  // diperiksa numerik: T(n)/(n lg² n) = (1 + L(L+1)/2)/L² → 1/2, jadi Θ(n lg² n) benar, sedangkan T/(n lg n) membesar tanpa batas (bukan kasus 2)
  for (const L of [100, 400]) {
    const T = nilaiT(2, 2, { k: 1, q: 1 }, L)
    const n = 2 ** L
    assert.ok(Math.abs(T / (n * L * L) - (1 + (L * (L + 1)) / 2) / (L * L)) < 1e-9)
    assert.ok(Math.abs(T / (n * L * L) - 0.5) < 0.02)
  }
  assert.ok(nilaiT(2, 2, { k: 1, q: 1 }, 400) / (2 ** 400 * 400) > nilaiT(2, 2, { k: 1, q: 1 }, 100) / (2 ** 100 * 100), 'bukan Θ(n lg n)')
  assert.equal(klasifikasi(0.5, 2, { k: 1 }).kasus, 'tidak-sesuai')
  assert.equal(klasifikasi(2, 1, { k: 1 }).kasus, 'tidak-sesuai')
  assert.equal(klasifikasi(2, 0.5, { k: 1 }).kasus, 'tidak-sesuai')
  // T(n) = T(n − 1) + n = n(n + 1)/2 → Θ(n²)
  for (const n of [1, 2, 10, 1000]) assert.equal(nilaiPengurangan(n), (n * (n + 1)) / 2)
  assert.ok(Math.abs(nilaiPengurangan(100000) / 100000 ** 2 - 0.5) < 1e-4)
})

test('klasifikasi sesuai perilaku sebenarnya: T(n)/solusi menuju konstanta untuk kasus 1, 2, 3 pada kombinasi acak', () => {
  const pilih = (arr) => arr[Math.floor(rand() * arr.length)]
  let diuji = 0
  for (let i = 0; i < 400; i++) {
    const a = pilih([1, 2, 3, 4, 5, 7, 8, 9])
    const b = pilih([2, 3, 4, 1.5, 5 / 3])
    const e = logBA(a, b)
    const k = pilih([0, 0.5, 1, 1.5, 2, 3, 4])
    if (Math.abs(k - e) < 0.25) continue // dekat perbatasan konvergensinya lambat
    const q = pilih([0, 0, 1])
    if (Math.max(k, e) * 160 * Math.log10(b) > 280) continue // hindari luapan bilangan pada L = 160
    const f = { k, q }
    const h = klasifikasi(a, b, f)
    assert.ok([1, 3].includes(h.kasus) || h.kasus === 2)
    const rasio = (L) => nilaiT(a, b, f, L) / pembagiSolusi(h, b ** L)
    const [r1, r2] = [rasio(80), rasio(160)]
    assert.ok(Number.isFinite(r1) && Number.isFinite(r2) && r1 > 0)
    assert.ok(Math.abs(r2 / r1 - 1) < 0.1, // q = 1 konvergen lambat (galat sekitar 1/L), jadi toleransnya 10%
       `a=${a} b=${b} k=${k} q=${q} kasus ${h.kasus}: ${r1} → ${r2}`)
    diuji++
    // kasus 1: solusi n^e sudah pas, jadi memakai n^e lg n terlalu besar (rasio menurun)
    if (h.kasus === 1) assert.ok(nilaiT(a, b, f, 160) / (b ** 160) ** e / 160 < nilaiT(a, b, f, 80) / (b ** 80) ** e / 80)
  }
  assert.ok(diuji > 100)
})

test('pohon rekursi: jumlah biaya tingkat = T(n), daun = n^(log_b a), dan pendominasi sesuai kasus', () => {
  for (const c of contoh) {
    for (const L of [1, 3, 6, 10]) {
      const p = pohonRekursi(c.a, c.b, c.f, L)
      assert.equal(p.tingkat.length, L, `${c.id}: ${L} tingkat dalam + daun`)
      assert.ok(Math.abs(p.jumlah / nilaiT(c.a, c.b, c.f, L) - 1) < 1e-9, `${c.id} L=${L}: jumlah = T(n)`)
      assert.ok(Math.abs(p.daun.total / p.n ** logBA(c.a, c.b) - 1) < 1e-9, 'a^L = n^(log_b a)')
    }
  }
  // Merge Sort n = 8: tiga tingkat berbiaya 8 + daun 8 = 32 (sama dengan Gambar 2 Modul 08)
  const ms = pohonRekursi(2, 2, { k: 1, q: 0 }, 3)
  assert.deepEqual(ms.tingkat.map((t) => t.total), [8, 8, 8])
  assert.deepEqual([ms.daun.total, ms.jumlah], [8, 32])
  // pendominasi: kasus 1 → daun, kasus 3 → akar, kasus 2 → seimbang
  const dom = (id) => pendominasi(pohonRekursi(contohById(id).a, contohById(id).b, contohById(id).f, 10))
  assert.equal(dom('s1'), 'daun')
  assert.equal(dom('strassen'), 'daun')
  assert.equal(dom('s2'), 'akar')
  assert.equal(dom('c3'), 'akar')
  assert.equal(dom('merge'), 'seimbang')
  assert.equal(dom('c2'), 'seimbang')
  assert.equal(dom('binary'), 'seimbang')
})

test('teks recurrence dan solusi', () => {
  assert.equal(teksRecurrence(2, 2, { k: 1, q: 0 }), 'T(n) = 2T(n/2) + n')
  assert.equal(teksRecurrence(1, 2, { k: 0, q: 0 }), 'T(n) = T(n/2) + 1')
  assert.equal(teksRecurrence(3, 4, { k: 1, q: 1 }), 'T(n) = 3T(n/4) + n lg n')
  assert.equal(teksRecurrence(2, 2, { k: 0.5, q: 0 }), 'T(n) = 2T(n/2) + √n')
  assert.deepEqual([teksSuku(2, 0), teksSuku(1.5, 0), teksSuku(0, 1), teksSuku(1, 2), teksSuku(0, 0)], ['n²', 'n^1,5', 'lg n', 'n lg² n', '1'])
  assert.equal(solusiHasil(16, 4, 1), 'Θ(n²)')
  assert.equal(solusiHasil(2, 4, 0.5), 'Θ(√n lg n)')
  assert.equal(solusiHasil(3, 2, 2), 'Θ(n²)')
  assert.equal(solusiHasil(1, 2, 1), 'Θ(n)')
})

// ---------------------------------------------------------------- program Python
test('program Python di modul dijalankan sungguhan dan sama dengan teks dan model', (t) => {
  const kode = blokTeks('python')
  const cetak = blokTeks('text').trimEnd()
  // model: T(b^L) / solusi untuk L = 10, 15, 20 (b = 2) dan 6, 9, 12 (b = 3), dibulatkan 3 desimal seperti program
  const uji = [
    ['2T(n/2)+n', 2, 2, { k: 1, q: 0 }, [10, 15, 20]],
    ['4T(n/2)+n^2', 4, 2, { k: 2, q: 0 }, [10, 15, 20]],
    ['9T(n/3)+n', 9, 3, { k: 1, q: 0 }, [6, 9, 12]],
    ['5T(n/2)+n^3', 5, 2, { k: 3, q: 0 }, [10, 15, 20]],
    ['T(n/2)+1', 1, 2, { k: 0, q: 0 }, [10, 15, 20]],
  ]
  const dariModel = uji.map(([nama, a, b, f, Ls]) => {
    const h = klasifikasi(a, b, f)
    return `${nama.padEnd(12)} [${rasioNumerik(a, b, f, h, Ls).map((r) => String(Math.round(r.rasio * 1000) / 1000)).join(', ')}]`
  })
  assert.deepEqual(cetak.split('\n').map((s) => s.replace(/\s+/g, ' ')), dariModel.map((s) => s.replace(/\s+/g, ' ')))
  const py = cariPython()
  if (!py) return t.skip('Python 3 tidak ditemukan di mesin ini')
  const r = spawnSync(py, ['-c', kode], { encoding: 'utf8' })
  assert.equal(r.status, 0, r.stderr)
  assert.equal(r.stdout.replace(/\r\n/g, '\n').trimEnd(), cetak)
})

// ---------------------------------------------------------------- kuis
test('kunci kuis dihitung ulang: soal 1, 2, 3, 6, 7, dan 8', () => {
  const kunci = (no) => kuis09.soal[no - 1].isian
  // soal 1: 16T(n/4) + n → kasus 1, Θ(n²)
  assert.deepEqual([klasifikasi(16, 4, { k: 1 }).kasus, solusiHasil(16, 4, 1)], [1, kunci(1)[1].kunci])
  assert.equal(String(klasifikasi(16, 4, { k: 1 }).kasus), kunci(1)[0].kunci)
  // soal 2: 2T(n/4) + √n → kasus 2, Θ(√n lg n)
  assert.equal(String(klasifikasi(2, 4, { k: 0.5 }).kasus), kunci(2)[0].kunci)
  assert.equal(solusiHasil(2, 4, 0.5), kunci(2)[1].kunci)
  // soal 3: 3T(n/2) + n² → kasus 3, c = 3/4, Θ(n²)
  const s3 = klasifikasi(3, 2, { k: 2 })
  assert.equal(String(s3.kasus), kunci(3)[0].kunci)
  assert.equal(s3.keteraturan.c, kunci(3)[1].kunci)
  assert.ok(Math.abs(s3.e - 1.585) < 1e-3 && Math.abs(s3.epsilon.maks - 0.415) < 1e-3)
  assert.equal(teksSolusi(s3), kunci(3)[2].kunci)
  // soal 5: 2T(n/2) + n lg n → celah, bukan kasus 3
  assert.equal(klasifikasi(2, 2, { k: 1, q: 1 }).kasus, 'celah')
  assert.equal(kuis09.soal[4].kunci, 'Salah')
  // soal 6: 4 submasalah → Θ(n²); 3 submasalah → Θ(n^1,585); yang kedua lebih kecil
  assert.equal(solusiHasil(4, 2, 1), kunci(6)[0].kunci)
  assert.ok(Math.abs(logBA(3, 2) - 1.585) < 1e-3 && logBA(3, 2) < logBA(4, 2))
  assert.equal(kunci(6)[1].kunci, 'Θ(n^1,585)')
  assert.equal(kunci(6)[2].kunci, '3 submasalah')
  // soal 7: T(n/2) + n → kasus 3, Θ(n), c = 1/2
  const s7 = klasifikasi(1, 2, { k: 1 })
  assert.equal(String(s7.kasus), kunci(7)[0].kunci)
  assert.deepEqual([teksSolusi(s7), s7.keteraturan.c], [kunci(7)[1].kunci, 0.5])
  // soal 8: T(n − 1) + n = n(n + 1)/2
  assert.equal(nilaiPengurangan(10), 55)
  assert.ok(kuis09.soal[7].kunciTeks.includes('Θ(n²)'))
})

test('struktur kuis: 8 soal, jenis sesuai PDF, hanya soal 8 dinilai sendiri', () => {
  assert.deepEqual(kuis09.soal.map((q) => q.no), [1, 2, 3, 4, 5, 6, 7, 8])
  assert.deepEqual(kuis09.soal.map((q) => TIPE_LABEL[q.tipe]), ['Perhitungan', 'Perhitungan', 'Perhitungan', 'Pilihan Ganda', 'Benar/Salah', 'Analisis', 'Perhitungan', 'Analisis'])
  assert.deepEqual(kuis09.soal.filter((q) => q.mandiri).map((q) => q.no), [8])
  for (const q of kuis09.soal) {
    assert.ok(q.teks.length > 10 && q.pembahasan.length > 10, `soal ${q.no}`)
    if (q.opsi) assert.ok(q.opsi.some((o) => o.id === q.kunci))
    if (q.mandiri) assert.ok(q.kunciTeks)
    for (const f of q.isian ?? []) if (f.jenis === 'pilih') assert.ok(f.opsi.includes(f.kunci), `soal ${q.no}: kunci "${f.kunci}" ada di opsi`)
    assert.equal([q.mandiri, q.opsi, q.isian].filter(Boolean).length, 1, `satu jenis jawaban per soal (${q.no})`)
  }
  assert.deepEqual([...new Set(kuis09.soal.map((q) => q.tipe))].sort(), [...daftarKuis.find((k) => k.id === '09').tipe].sort())
})

test('penilaian soal Modul 09', () => {
  const [q1, , q3, q4, q5, q6, q7] = kuis09.soal
  assert.equal(nilaiSoal(q1, ['1', 'Θ(n²)']).benar, true)
  assert.equal(nilaiSoal(q1, ['2', 'Θ(n²)']).benar, false)
  assert.equal(nilaiSoal(q3, ['3', '0,75', 'Θ(n²)']).benar, true)
  assert.equal(nilaiSoal(q3, ['3', '3/4', 'Θ(n²)']).benar, false, 'c harus ditulis desimal (kolom meminta 0,75)')
  assert.equal(nilaiSoal(q4, 'C').benar, true)
  assert.equal(nilaiSoal(q5, 'Salah').benar, true)
  assert.equal(nilaiSoal(q6, ['Θ(n²)', 'Θ(n^1,585)', '3 submasalah']).benar, true)
  assert.equal(nilaiSoal(q6, ['Θ(n²)', 'Θ(n^1,585)', '4 submasalah']).benar, false)
  assert.equal(nilaiSoal(q7, ['3', 'Θ(n)']).benar, true)
  const ok = { teks: 'a', sesuai: true }
  const semua = { 1: ['1', 'Θ(n²)'], 2: ['2', 'Θ(√n lg n)'], 3: ['3', '0,75', 'Θ(n²)'], 4: 'C', 5: 'Salah', 6: ['Θ(n²)', 'Θ(n^1,585)', '3 submasalah'], 7: ['3', 'Θ(n)'], 8: ok }
  const h = hitungHasil(kuis09.soal, semua)
  assert.deepEqual([h.skor, h.lulus], [8, true])
  assert.deepEqual(hitungHasil(kuis09.soal, { ...semua, 8: undefined }).belumDinilai, [8])
})

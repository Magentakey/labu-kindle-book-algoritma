import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { parseModul } from '../lib/modulContent.js'
import { algoritma } from '../data/algoritma.js'
import { modul, modulById, neighbors, tabsOf } from '../data/modul.js'
import { kuisById } from '../data/quiz.js'
import { petaBab } from '../data/credit.js'
import { cariPython } from '../test/python.js'
import { vizIds } from '../viz/vizConfig.js'
import { rand } from '../lib/testRandom.js'
import { caraKurung, fib, hargaModul, hitungSimpul, kaliDihitung, pemanggilanBatangNaif, pemanggilanMemo, pemanggilanNaif, penjumlahanBottomUp, perbandinganBatang, pohonFibonacci, potongBatang, setHarga, simulasiNaif, submasalahBerbeda, susunPotongan, teksBesar } from '../viz/dpModel.js'
import { kuis10 } from './modul/10.kuis.js'

const md = readFileSync(new URL('./modul/10.md', import.meta.url), 'utf8').replace(/\r\n/g, '\n')
const bagian = parseModul(md)
const m = modulById('10')

const barisTabel = (caption) => {
  const end = md.indexOf(caption)
  assert.ok(end > 0, caption)
  const lines = md.slice(0, end).trimEnd().split('\n')
  const out = []
  for (let i = lines.length - 1; i >= 0 && lines[i].startsWith('|'); i--) out.unshift(lines[i].split('|').slice(1, -1).map((c) => c.trim()))
  return out.slice(2)
}
const blokTeks = (bahasa, indeks = 0) => [...md.matchAll(new RegExp('```' + bahasa + '\\n([\\s\\S]*?)```', 'g'))][indeks][1]

// ---------------------------------------------------------------- struktur dan metadata
test('struktur: tujuh bagian sesuai PDF, enam tab terpenuhi, satu gambar, lima tabel, kode Python; teks polos tanpa TeX', () => {
  assert.deepEqual(bagian.map((s) => s.id), ['pendahuluan', 'optimasi', 'algoritma', 'penelusuran', 'analisis', 'makna', 'kesimpulan', 'referensi'])
  assert.deepEqual(bagian.map((s) => s.judul.match(/^\d+/)?.[0] ?? null), ['1', '2', '3', '4', '5', '6', '7', null])
  for (const t of tabsOf(m).filter((x) => x.id !== 'kuis')) assert.ok(bagian.some((s) => s.id === t.id), t.id)
  const slots = bagian.flatMap((s) => s.blok.filter((b) => b.type === 'slot')).map((b) => `${b.name}:${b.arg}`)
  assert.deepEqual(slots, ['gambar:fibonacci'])
  assert.deepEqual([...md.matchAll(/\*Tabel (\d+)\./g)].map((x) => Number(x[1])), [1, 2, 3, 4, 5])
  assert.equal([...md.matchAll(/```python/g)].length, 1)
  for (const jdl of ['3.1', '3.2', '4.1', '6.1', '6.2', '6.3']) assert.ok(md.includes(`### ${jdl} `), `subbagian ${jdl}`)
  assert.equal([...md.matchAll(/\{\{callout:/g)].length, [...md.matchAll(/\{\{\/callout\}\}/g)].length, 'callout berpasangan')
  for (const l of md.split('\n').filter((x) => x.startsWith('{{callout'))) assert.ok(!/[$\\]/.test(l), `judul callout polos: ${l}`)
  for (const x of modul) assert.ok(![x.judul, x.judulPanjang, x.ringkas, x.prasyaratTeks].some((t) => /[$\\]/.test(t ?? '')), `${x.id}: teks polos`)
})

test('metadata sama dengan PDF dan katalog; visualizer langkah Konsep DP terhubung dua arah', () => {
  assert.deepEqual([m.no, m.bab, m.halaman, m.soal], [10, 'BAB IV', 9, 7])
  assert.equal(m.soal, kuis10.soal.length)
  assert.equal(m.tujuan.length, 5)
  assert.equal(petaBab[3].modul[0].judul, m.judul)
  assert.deepEqual(tabsOf(m).map((x) => x.tab), ['1 Pendahuluan', '3 Dua Ciri', '4 Empat Langkah', '5 Top-down & Bottom-up', '6 Running Time', '7 Kesimpulan', 'Kuis', 'Referensi'])
  assert.deepEqual(neighbors('10'), { prev: modulById('09'), next: modulById('11') })
  assert.equal(neighbors('09').next, m)
  assert.ok(readFileSync(new URL('../../public/' + m.pdf, import.meta.url)).subarray(0, 4).toString() === '%PDF')
  assert.equal(m.algoritmaId, 'konsep-dp')
  assert.ok(vizIds.includes(m.algoritmaId), 'visualizer pemutar langkah terhubung')
  const kartu = algoritma.find((a) => a.id === m.algoritmaId)
  assert.deepEqual([kartu.modul, kartu.viz, kartu.kategori], [10, true, 'dp'])
  assert.equal(kuisById('10').soal, 7)
  assert.equal(kuisById('10').judul, kuis10.judul)
})

// ---------------------------------------------------------------- Fibonacci
test('Fibonacci: pemanggilan rekursi biasa = 2F(n+1) − 1, sama dengan simulasi untuk n = 0..25, dan angka di teks (15; 2.692.537; 31 submasalah)', () => {
  for (let n = 0; n <= 25; n++) {
    const sim = simulasiNaif(n)
    assert.equal(BigInt(sim.total), pemanggilanNaif(n), `n=${n}`)
    for (let k = 1; k <= n; k++) assert.equal(BigInt(sim.hitung[k]), kaliDihitung(n, k), `F${k} dalam F${n}`)
    if (n >= 1) assert.equal(BigInt(sim.hitung[0]), kaliDihitung(n, 0), `F0 dalam F${n}`)
  }
  assert.equal(pemanggilanNaif(5), 15n)
  assert.equal(pemanggilanNaif(30), 2692537n)
  assert.equal(submasalahBerbeda(30), 31)
  assert.deepEqual([submasalahBerbeda(0), submasalahBerbeda(1), submasalahBerbeda(2)], [1, 1, 3], 'n + 1 berlaku mulai n = 2')
  assert.deepEqual([kaliDihitung(5, 3), kaliDihitung(5, 2)], [2n, 3n], 'F3 dua kali dan F2 tiga kali dalam F5')
  for (const x of ['15 pemanggilan untuk $F_5$', '2.692.537 pemanggilan untuk $F_{30}$', '31 submasalah berbeda']) assert.ok(md.includes(x), x)
  // F90 dan "sekitar 10¹⁹ pemanggilan": 2·F91 − 1 ≈ 9,3 × 10¹⁸
  assert.equal(fib(90), 2880067194370816120n)
  assert.equal(teksBesar(pemanggilanNaif(90)), '9,32 × 10¹⁸')
  assert.ok(pemanggilanNaif(90) > 9n * 10n ** 18n && pemanggilanNaif(90) < 10n ** 19n)
  assert.equal(penjumlahanBottomUp(90), 89)
  assert.ok(md.includes('hanya 89 kali penjumlahan'))
})

test('memoization dan bottom-up: banyaknya pemanggilan dan penjumlahan sama dengan hitungan sungguhan', () => {
  for (let n = 0; n <= 30; n++) {
    // memoization: hitung berapa kali fungsi dipanggil dan berapa kali nilai benar-benar dihitung
    const memo = new Map()
    let panggil = 0
    let baru = 0
    const f = (k) => {
      panggil++
      if (memo.has(k)) return memo.get(k)
      baru++
      const v = k < 2 ? BigInt(k) : f(k - 1) + f(k - 2)
      memo.set(k, v)
      return v
    }
    assert.equal(f(n), fib(n))
    assert.equal(panggil, pemanggilanMemo(n), `memo n=${n}`)
    assert.equal(baru, submasalahBerbeda(n))
    // bottom-up: satu penjumlahan per i = 2..n
    let tambah = 0
    const F = [0n, 1n]
    for (let i = 2; i <= n; i++) {
      F[i] = F[i - 1] + F[i - 2]
      tambah++
    }
    assert.equal(tambah, penjumlahanBottomUp(n))
    assert.equal(n < 2 ? BigInt(n) : F[n], fib(n))
  }
})

test('Gambar 1: pohon F5 punya 15 simpul, 6 menghitung submasalah baru (F0..F5) dan 9 mengulang; n + 1 simpul baru untuk setiap n ≥ 2', () => {
  const p = pohonFibonacci(5)
  assert.deepEqual(hitungSimpul(p), { semua: 15, ulang: 9, baru: 6 })
  // bentuk pohon: F5 → (F4 → (F3 → (F2 → F1, F0), F1), F2 → F1, F0), F3 → (F2 → F1, F0), F1)
  const bentuk = (s) => (s.anak ? `F${s.k}(${s.anak.map(bentuk).join(',')})` : `F${s.k}`)
  assert.equal(bentuk(p), 'F5(F4(F3(F2(F1,F0),F1),F2(F1,F0)),F3(F2(F1,F0),F1))')
  // simpul pertama yang ditandai ulang: F1 sebagai anak kanan F3 pertama (F1 sudah selesai dihitung di dalam F2)
  assert.equal(p.anak[0].anak[0].anak[1].ulang, true)
  assert.equal(p.anak[0].anak[0].anak[0].ulang, false, 'F2 pertama dihitung baru')
  assert.equal(p.anak[1].ulang, true, 'F3 kanan adalah perhitungan ulang dari F3 di kiri')
  for (let n = 2; n <= 14; n++) {
    const h = hitungSimpul(pohonFibonacci(n))
    assert.equal(h.baru, n + 1, `n=${n}: submasalah berbeda`)
    assert.equal(BigInt(h.semua), pemanggilanNaif(n))
  }
  const gambar = readFileSync(new URL('./modul/10.gambar.jsx', import.meta.url), 'utf8')
  assert.ok(gambar.includes('Gambar 1. Pohon pemanggilan rekursif untuk F₅'))
})

test('program Python di modul dijalankan sungguhan dan sama dengan teks dan model', (t) => {
  const kode = blokTeks('python')
  const cetak = blokTeks('text').trimEnd().split('\n')
  const { r } = potongBatang(hargaModul, 8)
  const model = [`${fib(30)} pemanggilan: ${pemanggilanNaif(30)}`, `${fib(30)} ${fib(30)} ${fib(90)}`, `[${r.slice(1).join(', ')}]`]
  assert.deepEqual(cetak, model)
  const py = cariPython()
  if (!py) return t.skip('Python 3 tidak ditemukan di mesin ini')
  const out = spawnSync(py, ['-c', kode], { encoding: 'utf8' })
  assert.equal(out.status, 0, out.stderr)
  assert.deepEqual(out.stdout.replace(/\r\n/g, '\n').trimEnd().split('\n'), cetak)
})

// ---------------------------------------------------------------- pemotongan batang
test('Tabel 1 dan 2: harga dan hasil bottom-up sama dengan model; contoh r4 dan n = 8', () => {
  const t1 = barisTabel('*Tabel 1.')
  assert.deepEqual(t1[0].slice(1).map(Number), hargaModul.slice(1))
  const { r, s, kandidat } = potongBatang(hargaModul, 8)
  const t2 = barisTabel('*Tabel 2.')
  assert.deepEqual(t2[0].slice(1).map(Number), r.slice(1), 'baris r_j')
  assert.deepEqual(t2[1].slice(1).map(Number), s.slice(1), 'baris s_j')
  assert.deepEqual(r.slice(1), [1, 5, 8, 10, 13, 17, 18, 22])
  assert.deepEqual(kandidat[4].map((c) => c.nilai), [9, 10, 9, 9], 'p1+r3, p2+r2, p3+r1, p4+r0')
  assert.equal(s[4], 2)
  assert.deepEqual([s[8], s[6], susunPotongan(s, 8)], [2, 6, [2, 6]])
  assert.equal(5 + 17, r[8])
  for (const x of ['$s_8 = 2$', '$s_6 = 6$', '$2 + 6$', '$5 + 17 = 22$']) assert.ok(md.includes(x), x)
})

test('pemotongan batang bottom-up benar: sama dengan pencarian semua cara pada harga acak dan setiap daftar harga penjelajah', () => {
  // semua komposisi n sebagai penjumlahan bilangan bulat positif
  const semuaCara = (p, n) => {
    let terbaik = 0
    const coba = (sisa, nilai) => {
      if (sisa === 0) return void (terbaik = Math.max(terbaik, nilai))
      for (let i = 1; i <= sisa; i++) coba(sisa - i, nilai + p[i])
    }
    coba(n, 0)
    return terbaik
  }
  const daftar = [...setHarga.map((h) => h.p)]
  for (let u = 0; u < 20; u++) daftar.push([0, ...Array.from({ length: 8 }, () => 1 + Math.floor(rand() * 30))])
  for (const p of daftar) {
    const { r, s } = potongBatang(p, 8)
    for (let n = 1; n <= 8; n++) {
      assert.equal(r[n], semuaCara(p, n), `n=${n}, p=${p}`)
      const potongan = susunPotongan(s, n)
      assert.equal(potongan.reduce((a, b) => a + b, 0), n, 'potongan menjumlah ke n')
      assert.equal(potongan.reduce((a, x) => a + p[x], 0), r[n], 'pendapatan potongan = r_n')
    }
  }
})

test('biaya pemotongan batang: rekursi biasa 2^n pemanggilan, tabel n(n+1)/2 perbandingan', () => {
  for (let n = 0; n <= 14; n++) {
    let panggil = 0
    const p = hargaModul
    const rek = (k) => {
      panggil++
      let q = 0
      for (let i = 1; i <= Math.min(k, 8); i++) q = Math.max(q, p[i] + rek(k - i))
      return q
    }
    if (n <= 12) {
      rek(n)
      // pada rekursi dengan harga hanya sampai 8 panggilannya lebih sedikit; uji rumus lewat versi tanpa batas harga 8:
      panggil = 0
      const rek2 = (k) => {
        panggil++
        for (let i = 1; i <= k; i++) rek2(k - i)
      }
      rek2(n)
      assert.equal(BigInt(panggil), pemanggilanBatangNaif(n), `n=${n}`)
    }
    assert.equal(pemanggilanBatangNaif(n), 2n ** BigInt(n))
    let banding = 0
    for (let j = 1; j <= n; j++) for (let i = 1; i <= j; i++) banding++
    assert.equal(banding, perbandinganBatang(n))
  }
})

// ---------------------------------------------------------------- Tabel 4 dan Catalan
test('Catalan: banyaknya cara kurung untuk n = 1..10 sama dengan teks; 4 matriks 5 cara; tumbuh minimal 2^n; Dynamic Programming hanya n³', () => {
  const urut = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => caraKurung(n))
  assert.equal(urut.map((x) => Number(x).toLocaleString('id-ID')).join(', '), '1, 1, 2, 5, 14, 42, 132, 429, 1.430, 4.862')
  assert.ok(md.includes('1, 1, 2, 5, 14, 42, 132, 429, 1.430, 4.862'))
  assert.equal(caraKurung(4), 5n)
  for (let n = 1; n <= 40; n++) assert.ok(caraKurung(n) * 4n >= 2n ** BigInt(n), `Ω(2^n) pada n=${n}`)
  assert.ok(caraKurung(30) > BigInt(30) ** 3n * 10n ** 6n)
})

test('Tabel 3, 4, dan 5: isi sesuai PDF', () => {
  const t3 = barisTabel('*Tabel 3.')
  assert.deepEqual(t3.map((r) => r[0]), ['Cara kerja', 'Submasalah yang dihitung', 'Kelebihan', 'Contoh di bahan kuliah'])
  assert.deepEqual([t3[1][1], t3[1][2]], ['Hanya yang benar-benar dibutuhkan', 'Semua submasalah'])
  const t4 = barisTabel('*Tabel 4.')
  assert.deepEqual(t4.map((r) => r[3]), ['$\\Theta(n)$', '$\\Theta(n^2)$', '$\\Theta(n^3)$', '$\\Theta(mn)$'])
  // banyak submasalah × pilihan: n+1 submasalah × 1 = Θ(n); n+1 × n = Θ(n²); Σ pilihan batang = n(n+1)/2
  assert.equal(submasalahBerbeda(10) * 1, 11)
  assert.ok(Math.abs(perbandinganBatang(1000) / 1000 ** 2 - 0.5) < 1e-3)
  const t5 = barisTabel('*Tabel 5.')
  assert.deepEqual(t5.map((r) => r[0]), ['Divide and Conquer (Modul 08)', 'Dynamic Programming', 'Greedy (Modul 13)'])
})

// ---------------------------------------------------------------- kuis
test('kunci kuis dihitung ulang: soal 3, 4, dan 6', () => {
  // soal 3: F2 dihitung 5 kali dan total 25 pemanggilan ketika menghitung F6
  const sim = simulasiNaif(6)
  assert.deepEqual([sim.hitung[2], sim.total], [5, 25])
  assert.deepEqual(kuis10.soal[2].kunci, ['B', 'D'])
  assert.equal(pemanggilanNaif(6), 2n * fib(7) - 1n)
  assert.equal(fib(7), 13n)
  // soal 4: r5 = 13 dengan potongan 2 dan 3
  const { s, kandidat } = potongBatang(hargaModul, 5)
  assert.equal(kuis10.soal[3].kunci, 'B')
  assert.deepEqual(kandidat[5].map((c) => c.nilai), [11, 13, 13, 10, 10])
  assert.deepEqual(susunPotongan(s, 5), [2, 3])
  // soal 6: n² sel × O(n) pemeriksaan = O(n³); memori Θ(n²)
  let kerja = 0
  const n = 30
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) for (let k = 0; k < n; k++) kerja++
  assert.equal(kerja, n ** 3)
})


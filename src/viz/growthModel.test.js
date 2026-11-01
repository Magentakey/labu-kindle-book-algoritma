import test from 'node:test'
import assert from 'node:assert/strict'
import { angkaID, fungsi, formatNilai, formatRasio, jalurKurva, log10Nilai, nilai, PLOT, rasio, rumusRasio, sains, skalaY, studiKasus, sup, tickX, titikPotong, xOf } from './growthModel.js'

const lg = Math.log2

test('delapan bentuk fungsi berurutan dari yang paling lambat tumbuh (Tabel 1)', () => {
  assert.deepEqual(fungsi.map((f) => f.label), ['1', 'lg n', 'n', 'n lg n', 'n²', 'n³', '2ⁿ', 'n!'])
  assert.deepEqual(fungsi.map((f) => f.nama), ['Konstanta', 'Logaritmik', 'Linier', 'Linearitmik', 'Kuadrat', 'Kubik', 'Eksponensial', 'Faktorial'])
  // urutan ≺ berlaku untuk n cukup besar (n = 100): 1 ≺ lg n ≺ n ≺ n lg n ≺ n² ≺ n³ ≺ 2ⁿ ≺ n!
  const l = fungsi.map((f) => log10Nilai(f.id, 100))
  for (let i = 1; i < l.length; i++) assert.ok(l[i] > l[i - 1], `${fungsi[i].label} lebih besar dari ${fungsi[i - 1].label} pada n = 100`)
})

test('nilai dan log10 konsisten untuk n kecil dan sampai batas bilangan desimal', () => {
  for (const f of fungsi) {
    for (const n of [2, 3, 7, 10, 25, 64, 100, 150]) {
      const v = nilai(f.id, n)
      assert.ok(Math.abs(Math.log10(v) - log10Nilai(f.id, n)) < 1e-9 * Math.max(1, Math.abs(log10Nilai(f.id, n))), `${f.id} n=${n}`)
    }
  }
  assert.equal(nilai('lg', 1), 0)
  assert.equal(log10Nilai('lg', 1), -Infinity)
  assert.equal(nilai('nf', 5), 120)
  assert.equal(nilai('2n', 10), 1024)
  assert.equal(nilai('nf', 171), Infinity)
  assert.equal(nilai('2n', 1024), Infinity)
})

test('Stirling untuk n! besar cocok dengan jumlah logaritma (n = 171..400)', () => {
  for (const n of [171, 200, 300, 400]) {
    let s = 0
    for (let k = 2; k <= n; k++) s += Math.log10(k)
    assert.ok(Math.abs(log10Nilai('nf', n) - s) < 1e-6, `n=${n}`)
  }
})

test('format Indonesia: angkaID, sains, sup', () => {
  assert.equal(angkaID(1234567), '1.234.567')
  assert.equal(angkaID(51.2, 1), '51,2')
  assert.equal(angkaID(999, 0), '999')
  assert.equal(angkaID(1000), '1.000')
  assert.equal(sup(301), '³⁰¹')
  assert.equal(sains(30.103), '1,27 × 10³⁰')
  assert.equal(sains(12), '10¹²')
  assert.equal(sains(11.9999999999), '10¹²')
  assert.equal(sains(23.1115), '1,29 × 10²³')
  assert.equal(sains(0.9999), '10¹', 'membulat ke atas: 9,998 → 10')
  assert.equal(sains(0), '10⁰')
})

test('Tabel 3 Modul 05: nilai beberapa fungsi pertumbuhan persis seperti di PDF', () => {
  const baris = (n) => ['lg', 'n', 'nlg', 'n2', 'n3', '2n'].map((id) => formatNilai(id, n))
  assert.deepEqual(baris(10), ['3,3', '10', '33', '100', '1.000', '1.024'])
  assert.deepEqual(baris(100), ['6,6', '100', '664', '10.000', '10⁶', '1,27 × 10³⁰'])
  assert.deepEqual(baris(1000), ['10,0', '1.000', '9.966', '10⁶', '10⁹', '1,07 × 10³⁰¹'])
  assert.deepEqual(baris(1e6), ['19,9', '10⁶', '1,99 × 10⁷', '10¹²', '10¹⁸', 'sangat besar'])
})

test('Tabel 2 Modul 05: rasio dari n = 5 menjadi n = 25 untuk delapan bentuk fungsi', () => {
  const t = fungsi.map((f) => formatRasio(rasio(f.id, 5, 25)))
  assert.deepEqual(t, ['1', '2', '5', '10', '25', '125', '1.048.576', '1,29 × 10²³'])
  assert.deepEqual(fungsi.map((f) => rumusRasio(f.id, 5, 25)), ['c / c', 'lg 25 / lg 5', '25 / 5', '25 lg 25 / 5 lg 5', '25² / 5²', '25³ / 5³', '2²⁵ / 2⁵', '25! / 5!'])
  // 25!/5! = 25·24·...·6 dihitung langsung dengan BigInt
  let h = 1n
  for (let k = 6n; k <= 25n; k++) h *= k
  assert.equal(Number(h) / 1.29e23 > 0.99 && Number(h) / 1.29e23 < 1.01, true)
  assert.ok(Math.abs(rasio('nf', 5, 25).nilai / Number(h) - 1) < 1e-9)
})

test('rasio: lg 1 tidak terdefinisi; rasio besar lewat logaritma; rasio < 1 dan bukan bilangan bulat', () => {
  assert.equal(formatRasio(rasio('lg', 1, 8)), 'tidak terdefinisi')
  assert.equal(formatRasio(rasio('2n', 1, 10000)), '9,98 × 10³⁰⁰⁹')
  assert.equal(formatRasio(rasio('2n', 1, 1_000_000)), 'sangat besar', 'pangkat di atas 10⁵ tidak ditulis')
  assert.equal(formatRasio(rasio('n', 10, 5)), '0,5')
  assert.equal(formatRasio(rasio('n', 3, 10)), '3,33')
  assert.equal(formatRasio(rasio('n2', 5, 1000)), '40.000')
  assert.equal(formatRasio(rasio('2n', 5, 100)), '3,96 × 10²⁸')
})

test('kuis Modul 05 soal 1 dan 4: rasio 8 → 64 dan perkiraan waktu algoritma kubik', () => {
  assert.deepEqual(['lg', 'nlg', 'n2'].map((id) => formatRasio(rasio(id, 8, 64))), ['2', '16', '64'])
  assert.equal(formatRasio(rasio('n3', 100, 400)), '64')
  assert.equal(2 * rasio('n3', 100, 400).nilai, 128)
})

test('studi kasus Modul 05: n lg n vs n² dari n = 4 ke n = 1024 (rasio 1280 dan 65536), prosesor 20× dan 2×', () => {
  const s = studiKasus({ fA: 'nlg', fB: 'n2', n0: 4, n1: 1024, k: 20 })
  assert.equal(formatRasio(s.A), '1.280')
  assert.equal(formatRasio(s.B), '65.536')
  assert.ok(Math.abs(s.Bcepat.nilai - 3276.8) < 1e-9)
  assert.ok(Math.abs(s.kebutuhan.nilai - 51.2) < 1e-9)
  assert.equal(s.algoritmaMenang, 'A')
  const dua = studiKasus({ fA: 'nlg', fB: 'n2', n0: 4, n1: 1024, k: 2 })
  assert.equal(dua.Bcepat.nilai, 32768)
  assert.equal(dua.algoritmaMenang, 'A')
  // prosesor 100× lebih cepat membuat B menang di n = 1024 (65536 / 100 = 655 < 1280)
  assert.equal(studiKasus({ fA: 'nlg', fB: 'n2', n0: 4, n1: 1024, k: 100 }).algoritmaMenang, 'B')
  // soal 5 kuis: n = 16 → 256
  const k5 = studiKasus({ fA: 'nlg', fB: 'n2', n0: 16, n1: 256, k: 1 })
  assert.deepEqual([k5.A.nilai, k5.B.nilai, Math.round(k5.kebutuhan.nilai)], [32, 256, 8])
})

test('komputer 1.024 kali lebih cepat hanya menambah 10 pada ukuran masalah eksponensial (soal 7)', () => {
  for (const n0 of [5, 20, 40]) assert.equal(1024 * 2 ** n0, 2 ** (n0 + 10))
  const l = (n) => log10Nilai('2n', n)
  assert.ok(Math.abs(l(30) - (l(20) + Math.log10(1024))) < 1e-9)
})

test('titik potong 2n² vs 50 n lg n adalah 190 (bahan kuliah), dan cocok dengan pencarian lurus', () => {
  assert.equal(titikPotong(2, 50), 190)
  // pencarian lurus seperti program Python di modul
  let n = 2
  while (2 * n * n <= 50 * n * lg(n)) n++
  assert.equal(n, 190)
  assert.ok(2 * 189 ** 2 <= 50 * 189 * lg(189) && 2 * 190 ** 2 > 50 * 190 * lg(190))
  // untuk semua n ≥ 190 kuadrat lebih lambat (sampai 10⁵)
  for (let m = 190; m <= 100000; m += 37) assert.ok(2 * m * m > 50 * m * lg(m))
  assert.equal(titikPotong(1, 1), 2, 'n² > n lg n sudah berlaku sejak n = 2')
})

test('titik potong: konstanta lain, dan null bila tidak ada', () => {
  const lurus = (cQ, cL) => {
    let terakhir = 1
    for (let n = 2; n <= 20000; n++) if (!(cQ * n * n > cL * n * lg(n))) terakhir = n
    return terakhir + 1
  }
  for (const [cQ, cL] of [[1, 1], [1, 10], [3, 7], [5, 100], [0.5, 2]]) assert.equal(titikPotong(cQ, cL, 20000), lurus(cQ, cL), `${cQ} vs ${cL}`)
  assert.equal(titikPotong(0.0001, 1000, 5000), null)
})

test('tickX dan xOf: sumbu mendatar dimulai di tepi kiri area dan berakhir di tepi kanan', () => {
  assert.deepEqual(tickX(20), [1, 5, 10, 15, 20])
  assert.deepEqual(tickX(10), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  assert.equal(xOf(1, 20), PLOT.kiri)
  assert.equal(xOf(20, 20), PLOT.lebar - PLOT.kanan)
})

test('Gambar 1 Modul 05: n = 1..20, sumbu tegak dipotong di 120; 2ⁿ dan n² keluar dari grafik, lg n, n, dan n lg n tidak', () => {
  const sk = skalaY('linear', 20, ['lg', 'n', 'nlg', 'n2', '2n'])
  assert.equal(sk.yMax, 120)
  const keluar = (id) => jalurKurva(id, 20, sk).terpotong
  assert.deepEqual(['lg', 'n', 'nlg', 'n2', '2n'].map(keluar), [false, false, false, true, true])
  assert.ok(nilai('nlg', 20) < 120, 'n lg n pada n = 20 hanya 86,4 sehingga tetap di dalam grafik')
  assert.equal(jalurKurva('2n', 20, sk).titik.findIndex((t) => t.y === null) + 1, 7, '2^7 = 128 > 120')
  assert.equal(jalurKurva('n2', 20, sk).titik.findIndex((t) => t.y === null) + 1, 11, '11² = 121 > 120')
  // ujung kurva yang terpotong tepat di tepi atas
  for (const id of ['n2', '2n']) assert.equal(jalurKurva(id, 20, sk).ujung.y, PLOT.atas)
  // semua titik terlihat berada di dalam area
  for (const id of ['lg', 'n', 'nlg', 'n2', '2n']) {
    for (const t of jalurKurva(id, 20, sk).titik) if (t.y !== null) assert.ok(t.y >= PLOT.atas - 1e-6 && t.y <= PLOT.tinggi - PLOT.bawah + 1e-6, `${id} n=${t.n}`)
  }
})

test('skala logaritmik: tidak ada pemotongan, kurva naik monoton, dan n! sampai n = 100 muat', () => {
  const keys = ['lg', 'n', 'n2', '2n', 'nf']
  const sk = skalaY('log', 100, keys)
  assert.ok(sk.lMax >= 158, '100! ≈ 10^158')
  for (const id of keys) {
    const j = jalurKurva(id, 100, sk)
    assert.equal(j.terpotong, false, id)
    const ys = j.titik.map((t) => t.y)
    for (let i = 1; i < ys.length; i++) assert.ok(ys[i] <= ys[i - 1] + 1e-9, `${id} naik (y piksel menurun) di n=${i + 1}`)
    assert.ok(ys.every((y) => y >= PLOT.atas - 1e-6 && y <= PLOT.tinggi - PLOT.bawah + 1e-6), id)
  }
  // lg 1 = 0 → log −∞ dijepit di dasar grafik, bukan NaN
  assert.ok(Number.isFinite(jalurKurva('lg', 10, skalaY('log', 10, ['lg'])).titik[0].y))
  assert.ok(sk.tick.length <= 9 && sk.tick[0].label === '10⁰')
})

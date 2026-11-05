import test from 'node:test'
import assert from 'node:assert/strict'
import { rand } from '../lib/testRandom.js'
import { bacaPecahan, barangModul, contohKoin, kapasitasGagal, knapsack01Greedy, knapsack01Optimal, knapsackPecahan, koinGreedy, koinOptimal, pecahan, penyangkalKoin, teksPecahan, urutanNilaiPerKg } from './greedyModel.js'

/** Pembanding independen: semua cara memilih himpunan barang (2^n) untuk knapsack 0-1. */
const bruteKnapsack = (barang, W) => {
  let best = 0
  for (let m = 0; m < 1 << barang.length; m++) {
    let b = 0
    let v = 0
    barang.forEach((x, i) => { if (m & (1 << i)) { b += x.berat; v += x.nilai } })
    if (b <= W) best = Math.max(best, v)
  }
  return best
}
/** Pembanding independen: jumlah koin minimum lewat rekursi penuh (tanpa tabel), hanya untuk x kecil. */
const bruteKoin = (pec, x) => (x === 0 ? 0 : Math.min(...pec.filter((k) => k <= x).map((k) => 1 + bruteKoin(pec, x - k))))

test('bacaPecahan: sah bila 2–8 bilangan berbeda 1..100 dan memuat 1; selain itu pesan galat', () => {
  assert.deepEqual(bacaPecahan('1, 3, 4'), { ok: true, nilai: [4, 3, 1] })
  assert.deepEqual(bacaPecahan('25 10 5 1 10'), { ok: true, nilai: [25, 10, 5, 1] }, 'duplikat dibuang, pemisah spasi boleh')
  for (const salah of ['', 'a, 1', '1', '2, 5', '1, 101', '1, 0', '1, 2, 3, 4, 5, 6, 7, 8, 9', '1, -3']) assert.equal(bacaPecahan(salah).ok, false, salah)
  assert.ok(bacaPecahan('2, 5').pesan.includes('memuat 1'))
})

test('koin: angka di Bagian 4.1 dan kuis soal 2 (63 → 6 koin; 6 dengan {1,3,4} → 3 vs 2; 12 dengan {1,6,10} → 3 vs 2)', () => {
  assert.deepEqual(koinGreedy([1, 5, 10, 25], 63), [25, 25, 10, 1, 1, 1])
  assert.equal(koinOptimal([1, 5, 10, 25], 63).jumlah, 6)
  assert.deepEqual(koinGreedy([1, 3, 4], 6), [4, 1, 1])
  assert.deepEqual(koinOptimal([1, 3, 4], 6), { jumlah: 2, koin: [3, 3] })
  assert.deepEqual(koinGreedy([1, 6, 10], 12), [10, 1, 1])
  assert.deepEqual(koinOptimal([1, 6, 10], 12), { jumlah: 2, koin: [6, 6] })
  assert.equal(penyangkalKoin([1, 3, 4]), 6, '6 adalah penyangkal terkecil untuk {1,3,4}')
  assert.equal(penyangkalKoin([1, 5, 10, 25]), null, 'pecahan AS: greedy optimal sampai 200')
  assert.equal(penyangkalKoin([1, 6, 10]), 12)
  for (const c of contohKoin) assert.ok(bacaPecahan(c.pecahan).ok && c.x >= 1 && c.x <= 200)
  // "berhasil untuk banyak jumlah, tetapi gagal untuk 6" (kuis soal 3): jumlah 1–5 berhasil
  for (let x = 1; x <= 5; x++) assert.equal(koinGreedy([1, 3, 4], x).length, koinOptimal([1, 3, 4], x).jumlah, `x=${x}`)
})

test('koin: optimal sama dengan rekursi penuh, jumlahnya valid, dan greedy tidak pernah lebih baik dari optimal (acak)', () => {
  for (let u = 0; u < 60; u++) {
    const n = 1 + Math.floor(rand() * 4)
    const pec = [...new Set([1, ...Array.from({ length: n }, () => 2 + Math.floor(rand() * 14))])]
    const x = 1 + Math.floor(rand() * 22)
    const g = koinGreedy(pec, x)
    const o = koinOptimal(pec, x)
    assert.equal(o.jumlah, bruteKoin(pec, x), `${pec} x=${x}`)
    assert.equal(o.koin.reduce((a, b) => a + b, 0), x)
    assert.equal(o.koin.length, o.jumlah)
    assert.equal(g.reduce((a, b) => a + b, 0), x)
    assert.ok(g.length >= o.jumlah)
    const p = penyangkalKoin(pec, 60)
    if (p !== null) assert.ok(koinGreedy(pec, p).length > koinOptimal(pec, p).jumlah)
  }
})

test('knapsack Bagian 4.2: pecahan 240 (barang 1, 2, dan 20/30 barang 3), 0-1 greedy 160, 0-1 optimal 220 (barang 2 dan 3)', () => {
  assert.deepEqual(barangModul.map((b) => b.nilai / b.berat), [6, 5, 4])
  assert.deepEqual(urutanNilaiPerKg(barangModul), [0, 1, 2])
  const p = knapsackPecahan(barangModul, 50)
  assert.deepEqual(p.total, { n: 240, d: 1 })
  assert.deepEqual(p.bagian.map((b) => [b.i, b.berat, b.nilai.n / b.nilai.d]), [[0, 10, 60], [1, 20, 100], [2, 20, 80]])
  assert.deepEqual(knapsack01Greedy(barangModul, 50), { total: 160, berat: 30, pilih: [0, 1] })
  assert.deepEqual(knapsack01Optimal(barangModul, 50), { total: 220, berat: 50, pilih: [1, 2] })
  assert.equal(bruteKnapsack(barangModul, 50), 220)
  // kuis soal 5: kapasitas 30 → greedy 160 = optimal 160, dan kemungkinan lain (barang 3 saja 120)
  assert.deepEqual(knapsack01Greedy(barangModul, 30), { total: 160, berat: 30, pilih: [0, 1] })
  assert.equal(knapsack01Optimal(barangModul, 30).total, 160)
  assert.equal(bruteKnapsack(barangModul, 30), 160)
  assert.equal(barangModul[2].nilai, 120)
})

test('knapsack: DP optimal sama dengan brute force, pecahan ≥ 0-1 optimal (selalu optimal untuk pecahan), greedy 0-1 tidak melebihi optimal', () => {
  for (let u = 0; u < 80; u++) {
    const barang = Array.from({ length: 1 + Math.floor(rand() * 6) }, () => ({ berat: 1 + Math.floor(rand() * 12), nilai: 1 + Math.floor(rand() * 30) }))
    const W = 1 + Math.floor(rand() * 30)
    const o = knapsack01Optimal(barang, W)
    assert.equal(o.total, bruteKnapsack(barang, W))
    assert.equal(o.pilih.reduce((a, i) => a + barang[i].nilai, 0), o.total)
    assert.ok(o.berat <= W)
    const g = knapsack01Greedy(barang, W)
    assert.ok(g.total <= o.total && g.berat <= W)
    const f = knapsackPecahan(barang, W)
    assert.ok(f.total.n >= o.total * f.total.d, 'pecahan ≥ optimal 0-1 (relaksasi)')
  }
})

test('kapasitas gagal: greedy 0-1 gagal pada W = 20–29 dan 40–59 untuk barang modul (jadi gagal pada 50, berhasil pada 30)', () => {
  const gagal = kapasitasGagal(barangModul, 60)
  assert.deepEqual(gagal, [...Array.from({ length: 10 }, (_, k) => 20 + k), ...Array.from({ length: 20 }, (_, k) => 40 + k)])
  assert.ok(gagal.includes(50) && !gagal.includes(30))
  assert.equal(gagal.length, 30)
})

test('pecahan eksak: disederhanakan dan tampil sebagai bilangan bulat atau pecahan', () => {
  assert.deepEqual(pecahan(6, 4), { n: 3, d: 2 })
  assert.equal(teksPecahan({ n: 240, d: 1 }), '240')
  assert.equal(teksPecahan({ n: 721, d: 3 }), '240,33 (= 721/3)')
  // 20/30 barang 3 bernilai 120 · 20/30 = 80 (eksak)
  assert.deepEqual(pecahan(120 * 20, 30), { n: 80, d: 1 })
  // pecahan non-bulat: kapasitas 55 → barang 3 diambil 25 kg (25/30·120 = 100) → total 260
  assert.deepEqual(knapsackPecahan(barangModul, 55).total, { n: 260, d: 1 })
  assert.deepEqual(knapsackPecahan([{ berat: 3, nilai: 5 }], 2).total, { n: 10, d: 3 })
})

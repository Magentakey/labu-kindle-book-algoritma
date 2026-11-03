// Model hitung Modul 10 (Konsep Dynamic Programming): Fibonacci (rekursi biasa vs memoization vs tabel) dan pemotongan batang.
// Dipakai oleh Gambar 1 Modul 10 dan penjelajah "Konsep DP". Murni, tanpa React, supaya bisa dites.
import { sains } from './growthModel.js'

// ---------------------------------------------------------------- Fibonacci
/** F(n) eksak dengan BigInt (F0 = 0, F1 = 1). */
export function fib(n) {
  let a = 0n
  let b = 1n
  for (let i = 0; i < n; i++) [a, b] = [b, a + b]
  return a
}

/** Banyaknya pemanggilan rekursif biasa untuk F(n): 2·F(n+1) − 1 (Bagian 3.2). */
export const pemanggilanNaif = (n) => 2n * fib(n + 1) - 1n

/** Jumlah penjumlahan yang dilakukan versi bottom-up untuk F(n): satu per i = 2..n, yaitu n − 1 (0 untuk n ≤ 1). */
export const penjumlahanBottomUp = (n) => Math.max(0, n - 1)

/** Banyaknya submasalah berbeda yang dihitung untuk F(n): F0 sampai Fn, yaitu n + 1 untuk n ≥ 2 (untuk n ≤ 1 hanya F(n) itu sendiri). */
export const submasalahBerbeda = (n) => (n < 2 ? 1 : n + 1)

/** Pemanggilan fungsi pada versi memoization: F(n) sekali, tiap F(k) dengan k ≥ 2 memanggil dua anak, sehingga 2n − 1 pemanggilan untuk n ≥ 1 (n + 1 di antaranya menghitung nilai baru). */
export const pemanggilanMemo = (n) => (n <= 1 ? 1 : 2 * n - 1)

/** Simulasi rekursi biasa: menghitung pemanggilan sungguhan dan seberapa sering tiap F(k) dihitung. Hanya untuk n kecil. */
export function simulasiNaif(n) {
  const hitung = Array(n + 1).fill(0)
  let total = 0
  const f = (k) => {
    total++
    hitung[k]++
    return k < 2 ? k : f(k - 1) + f(k - 2)
  }
  f(n)
  return { total, hitung }
}

/** Banyaknya F(k) dihitung saat menghitung F(n): F(n−k+1) untuk 1 ≤ k ≤ n (F0 dihitung F(n−1) kali; Soal 3 kuis). */
export const kaliDihitung = (n, k) => (k === 0 ? fib(n - 1) : k >= 1 && k <= n ? fib(n - k + 1) : 0n)

/**
 * Pohon pemanggilan rekursif F(n). Setiap simpul punya `ulang`: true bila submasalah F(k) itu sudah selesai dihitung lebih dulu
 * (urutan rekursi: kiri sebelum kanan) atau berada di bawah simpul yang demikian, yaitu perhitungan yang mubazir.
 * Simpul yang bukan `ulang` tepat n + 1 buah: itu submasalah berbeda F0..Fn (setiap submasalah dihitung sekali).
 */
export function pohonFibonacci(n) {
  const selesai = new Set()
  const bangun = (k, dalamUlang) => {
    const ulang = dalamUlang || selesai.has(k)
    const simpul = { k, ulang }
    if (k >= 2) {
      simpul.anak = [bangun(k - 1, ulang), bangun(k - 2, ulang)]
    }
    selesai.add(k)
    return simpul
  }
  return bangun(n, false)
}

export function hitungSimpul(pohon) {
  let semua = 0
  let ulang = 0
  const jalan = (s) => {
    semua++
    if (s.ulang) ulang++
    for (const a of s.anak ?? []) jalan(a)
  }
  jalan(pohon)
  return { semua, ulang, baru: semua - ulang }
}

/** BigInt → teks Indonesia: dipisah titik sampai 12 digit, di atasnya notasi ilmiah (mis. 9,3 × 10¹⁸). */
export function teksBesar(x) {
  const s = x.toString()
  if (s.length <= 12) return s.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  const mant = `${s[0]},${s.slice(1, 3)}`
  return `${mant} × 10${String(s.length - 1).replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)])}`
}
export { sains }

// ---------------------------------------------------------------- pemotongan batang (Cormen dkk., 2009, Bab 15.1)
export const hargaModul = [0, 1, 5, 8, 9, 10, 17, 17, 20] // p[1..8], indeks 0 tidak dipakai

export const setHarga = [
  { id: 'modul', judul: 'Harga dari modul (Tabel 1)', p: hargaModul },
  { id: 'linear', judul: 'Harga sebanding panjang (p_i = i)', p: [0, 1, 2, 3, 4, 5, 6, 7, 8] },
  { id: 'kuadrat', judul: 'Potongan panjang lebih mahal (p_i = i²)', p: [0, 1, 4, 9, 16, 25, 36, 49, 64] },
  { id: 'murah', judul: 'Potongan pendek lebih mahal per satuan', p: [0, 3, 5, 6, 7, 8, 9, 10, 11] },
]

/**
 * Bottom-up: r[j] = max over i = 1..j dari p[i] + r[j − i], r[0] = 0; s[j] = i terbaik (yang pertama bila seri).
 * @returns {{ r: number[], s: number[], kandidat: Array<Array<{ i: number, nilai: number }>> }} indeks 0..n; kandidat[j] = daftar p_i + r_(j−i).
 */
export function potongBatang(p, n) {
  const r = [0]
  const s = [0]
  const kandidat = [[]]
  for (let j = 1; j <= n; j++) {
    const daftar = []
    let terbaik = -Infinity
    let pilih = 0
    for (let i = 1; i <= j; i++) {
      const nilai = p[i] + r[j - i]
      daftar.push({ i, nilai })
      if (nilai > terbaik) {
        terbaik = nilai
        pilih = i
      }
    }
    r[j] = terbaik
    s[j] = pilih
    kandidat[j] = daftar
  }
  return { r, s, kandidat }
}

/** Langkah 4 (menyusun solusi): daftar potongan untuk batang sepanjang n, dari tabel s. */
export function susunPotongan(s, n) {
  const hasil = []
  for (let j = n; j > 0; j -= s[j]) hasil.push(s[j])
  return hasil
}

/** Pemanggilan rekursi biasa untuk batang n: T(n) = 1 + Σ_{j=0}^{n−1} T(j), T(0) = 1, sehingga 2^n. */
export function pemanggilanBatangNaif(n) {
  const T = [1n]
  for (let j = 1; j <= n; j++) T[j] = 1n + T.slice(0, j).reduce((a, b) => a + b, 0n)
  return T[n]
}

/** Banyaknya perbandingan p_i + r_(j−i) pada versi bottom-up sampai n: Σ_{j=1}^{n} j = n(n+1)/2 = Θ(n²). */
export const perbandinganBatang = (n) => (n * (n + 1)) / 2

/** Bilangan Catalan C(m) dan banyaknya cara menempatkan tanda kurung untuk n matriks: C(n − 1) (Bagian 6.2). */
export function caraKurung(n) {
  const C = [1n]
  for (let m = 1; m < n; m++) {
    let s = 0n
    for (let i = 0; i < m; i++) s += C[i] * C[m - 1 - i]
    C[m] = s
  }
  return C[n - 1]
}

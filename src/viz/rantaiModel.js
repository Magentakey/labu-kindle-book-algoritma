// Model hitung Modul 11 (Perkalian Rantai Matriks): pohon pemecahan optimal dari tabel s dan biaya sebuah urutan kurung.
// Dipakai oleh Gambar 1 Modul 11 dan tesnya. Murni, tanpa React. Tabel m dan s dari solveMatrixChain (src/algorithms/matrixChainTable.js).
import { solveMatrixChain } from '../algorithms/matrixChainTable.js'

/** Ukuran enam matriks contoh bahan kuliah (juga contoh baku Cormen dkk., 2009): p = ⟨30, 35, 15, 5, 10, 20, 25⟩. */
export const ukuranContoh = [30, 35, 15, 5, 10, 20, 25]

/**
 * Pohon pemecahan optimal untuk Ai..j dari tabel s. Simpul dalam: { i, j, k, biaya, kiri, kanan } dengan `biaya` = p[i-1]·p[k]·p[j]
 * (perkalian terakhir saja, bukan total subpohon). Daun: { i, j: i } (satu matriks).
 * @param {number[][]} s
 * @param {number[]} p
 */
export function pohonPemecahan(s, p, i = 1, j = s.length - 1) {
  if (i === j) return { i, j }
  const k = s[i][j]
  return { i, j, k, biaya: p[i - 1] * p[k] * p[j], kiri: pohonPemecahan(s, p, i, k), kanan: pohonPemecahan(s, p, k + 1, j) }
}

/** Biaya perkalian terakhir semua simpul dalam, urut per tingkat dari akar (kiri ke kanan), sama dengan urutan penjumlahan "Pemeriksaan" di PDF. */
export function daftarBiaya(pohon) {
  const hasil = []
  let tingkat = [pohon]
  while (tingkat.length) {
    for (const x of tingkat) if (x.kiri) hasil.push(x.biaya)
    tingkat = tingkat.flatMap((x) => (x.kiri ? [x.kiri, x.kanan] : []))
  }
  return hasil
}

/** Total biaya semua perkalian pada pohon (harus sama dengan m[1][n]). */
export const totalBiaya = (pohon) => daftarBiaya(pohon).reduce((a, b) => a + b, 0)

/** Banyaknya simpul dalam (perkalian dua matriks); untuk n matriks selalu n − 1. */
export const jumlahPerkalian = (pohon) => (pohon.kiri ? 1 + jumlahPerkalian(pohon.kiri) + jumlahPerkalian(pohon.kanan) : 0)

/**
 * Biaya sebuah urutan kurung yang ditulis sebagai teks, contoh "((A1A2)A3)", dengan ukuran p. Mengurai teks sungguhan (bukan memakai tabel s),
 * sehingga bisa dipakai membandingkan tabel dengan hitungan independen. @returns {{ baris: number, kolom: number, biaya: number }}
 */
export function biayaKurung(teks, p) {
  let pos = 0
  const baca = () => {
    if (teks[pos] === 'A') {
      pos++
      let angka = ''
      while (/\d/.test(teks[pos] ?? '')) angka += teks[pos++]
      const i = Number(angka)
      return { baris: p[i - 1], kolom: p[i], biaya: 0 }
    }
    if (teks[pos] !== '(') throw new Error(`karakter tak terduga di posisi ${pos}`)
    pos++
    const kiri = baca()
    const kanan = baca()
    if (teks[pos++] !== ')') throw new Error('kurung tutup hilang')
    if (kiri.kolom !== kanan.baris) throw new Error('ukuran tidak cocok')
    return { baris: kiri.baris, kolom: kanan.kolom, biaya: kiri.biaya + kanan.biaya + kiri.baris * kiri.kolom * kanan.kolom }
  }
  const hasil = baca()
  if (pos !== teks.length) throw new Error('sisa teks setelah urutan kurung')
  return hasil
}

/** Semua urutan kurung (teks) untuk Ai..j, dipakai tes sebagai pembanding brute force. */
export function semuaKurung(i, j) {
  if (i === j) return [`A${i}`]
  const hasil = []
  for (let k = i; k < j; k++) for (const l of semuaKurung(i, k)) for (const r of semuaKurung(k + 1, j)) hasil.push(`(${l}${r})`)
  return hasil
}

/** Penyelesaian contoh enam matriks (tabel m, tabel s, biaya, urutan). */
export const penyelesaianContoh = () => solveMatrixChain(ukuranContoh)

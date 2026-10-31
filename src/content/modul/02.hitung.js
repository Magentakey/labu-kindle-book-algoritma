// Perhitungan untuk Gambar Modul 02, dipisah dari komponen supaya bisa dites tanpa memuat JSX.

/** Tumpukan pemanggilan JUMLAH_REKURSIF(A, 3) untuk A = [20, 35, 15] (Gambar 1), dari pemanggilan pertama ke kasus dasar. */
export const tumpukan = [
  { panggil: 'JUMLAH_REKURSIF(A, 3)', kembali: '55 + 15 = 70' },
  { panggil: 'JUMLAH_REKURSIF(A, 2)', kembali: '20 + 35 = 55' },
  { panggil: 'JUMLAH_REKURSIF(A, 1)', kembali: '0 + 20 = 20' },
  { panggil: 'JUMLAH_REKURSIF(A, 0)', kembali: 'kembalikan 0', dasar: true },
]

/**
 * Putaran Binary Search iteratif dengan A berindeks mulai 1 (A[0] diabaikan).
 * @param {number[]} A array terurut, 1-based: A[0] tidak dipakai
 * @returns {{ putaran: Array<{ p: number, n: number, mid: number, nilai: number }>, hasil: number | null }}
 */
export function jejakBinarySearch(A, x, p, n) {
  const putaran = []
  while (p <= n) {
    const mid = Math.floor((p + n) / 2)
    putaran.push({ p, n, mid, nilai: A[mid] })
    if (x === A[mid]) return { putaran, hasil: mid }
    if (x > A[mid]) p = mid + 1
    else n = mid - 1
  }
  return { putaran, hasil: null }
}

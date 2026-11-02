// Model hitung penjelajah "Pohon Recurrence" (Modul 09): klasifikasi Metode Master, tabel tingkat pohon rekursi, dan pemeriksaan numerik.
// Recurrence T(n) = a·T(n/b) + c·n^k·(lg n)^q dengan T(1) = 1, dan n = b^L (sehingga ukuran submasalah selalu tepat n/b^i).
import { angkaID } from './growthModel.js'

const TOL = 1e-9
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹'
const sup = (n) => String(n).replace(/\d/g, (d) => SUP[Number(d)])

/** e = log_b a. */
export const logBA = (a, b) => {
  const e = Math.log(a) / Math.log(b)
  return Math.abs(e - Math.round(e)) < TOL ? Math.round(e) : e // 9T(n/3): log₃ 9 = 2 persis, bukan 2,0000000000000004
}

/** Teks bilangan Indonesia: bulat tanpa desimal, selain itu hingga `maks` desimal tanpa nol di belakang. */
export function teksBil(x, maks = 3) {
  if (Number.isInteger(x)) return String(x)
  return x.toLocaleString('id-ID', { maximumFractionDigits: maks })
}

/** Menulis n^p (lg n)^q, mis. "n²", "n lg n", "√n", "n^1,585", "lg n", "1". p boleh pecahan. */
export function teksSuku(p, q) {
  const bagian = []
  if (Math.abs(p) > TOL) {
    if (Math.abs(p - 0.5) < TOL) bagian.push('√n')
    else if (Math.abs(p - 1) < TOL) bagian.push('n')
    else if (Number.isInteger(p) && p >= 2 && p <= 9) bagian.push(`n${sup(p)}`)
    else bagian.push(`n^${teksBil(p)}`)
  }
  if (q === 1) bagian.push('lg n')
  else if (q > 1) bagian.push(`lg${sup(q)} n`)
  return bagian.length ? bagian.join(' ') : '1'
}

/** Menulis f(n) = c·n^k·(lg n)^q dan recurrence lengkap, mis. "2T(n/2) + n lg n". */
export function teksF({ c = 1, k, q = 0 }) {
  const dasar = teksSuku(k, q)
  if (c === 1) return dasar
  return dasar === '1' ? teksBil(c) : `${teksBil(c)}${dasar}`
}
export function teksRecurrence(a, b, f) {
  const koef = a === 1 ? '' : teksBil(a)
  return `T(n) = ${koef}T(n/${teksBil(b)}) + ${teksF(f)}`
}

/**
 * Klasifikasi Metode Master untuk f(n) = n^k (lg n)^q (koefisien tidak memengaruhi kasus).
 * @returns {{ kasus: 'tidak-sesuai' | 1 | 2 | 3 | 'celah', e: number, ... }}
 *  kasus 1: Θ(n^e) dengan ε ∈ (0, e−k) (bila q = 0: (0, e−k]); kasus 2: Θ(n^e lg n); kasus 3: Θ(f(n)), syarat keteraturan dengan c = a/b^k;
 *  celah: k = e tetapi q ≥ 1, jadi f tidak Θ(n^e) dan tidak lebih besar secara polinomial (hasil dengan metode lain: Θ(n^e lg^(q+1) n)).
 */
export function klasifikasi(a, b, { k, q = 0 }) {
  if (!(a >= 1)) return { kasus: 'tidak-sesuai', alasan: 'a harus ≥ 1 (banyaknya submasalah).' }
  if (!(b > 1)) return { kasus: 'tidak-sesuai', alasan: 'b harus > 1 (setiap submasalah harus lebih kecil).' }
  const e = logBA(a, b)
  const selisih = k - e
  if (Math.abs(selisih) < TOL) {
    if (q === 0) return { kasus: 2, e, solusi: { p: e, q: 1 }, ringkas: 'f(n) = Θ(n^e)' }
    return { kasus: 'celah', e, solusi: { p: e, q: q + 1 }, ringkas: `f(n) = n^e lg${q > 1 ? sup(q) : ''} n lebih besar dari n^e, tetapi tidak secara polinomial` }
  }
  if (selisih < 0) return { kasus: 1, e, epsilon: { maks: -selisih, tertutup: q === 0 }, solusi: { p: e, q: 0 }, ringkas: 'f(n) = O(n^(e−ε))' }
  const c = a / b ** k // a·f(n/b) ≤ c·f(n) untuk n besar karena (lg(n/b))^q ≤ (lg n)^q
  return { kasus: 3, e, epsilon: { maks: selisih, tertutup: q === 0 }, keteraturan: { c, ok: c < 1 }, solusi: { p: k, q }, ringkas: 'f(n) = Ω(n^(e+ε)) dan a·f(n/b) ≤ c·f(n)' }
}

/** Solusi Θ sebagai teks, mis. "Θ(n lg n)". Eksponen e tidak bulat ditulis dengan nilai hampirannya. */
export function teksSolusi(hasil) {
  if (!hasil.solusi) return '—'
  const { p, q } = hasil.solusi
  const dasar = teksSuku(p, q)
  return `Θ(${dasar})`
}

/** Nilai f(n) = c·n^k·(lg n)^q (untuk n ≥ 1). */
export const nilaiF = ({ c = 1, k, q = 0 }, n) => c * n ** k * (q === 0 ? 1 : Math.log2(n) ** q)

/** Nilai T(b^L) dari T(1) = 1, T(n) = a·T(n/b) + f(n). */
export function nilaiT(a, b, f, L) {
  let T = 1
  for (let m = 1; m <= L; m++) T = a * T + nilaiF(f, b ** m)
  return T
}

/**
 * Pohon rekursi untuk n = b^L: tingkat i = 0..L−1 punya a^i simpul berukuran n/b^i dan berbiaya f(n/b^i) per simpul; daun (tingkat L) punya a^L simpul berbiaya T(1) = 1.
 * @returns {{ n: number, tingkat: Array<{ i: number, simpul: number, ukuran: number, biayaSimpul: number, total: number }>, daun: { simpul: number, total: number }, jumlah: number }}
 */
export function pohonRekursi(a, b, f, L) {
  const n = b ** L
  const tingkat = Array.from({ length: L }, (_, i) => {
    const ukuran = b ** (L - i)
    const biayaSimpul = nilaiF(f, ukuran)
    return { i, simpul: a ** i, ukuran, biayaSimpul, total: a ** i * biayaSimpul }
  })
  const daun = { simpul: a ** L, total: a ** L }
  const jumlah = tingkat.reduce((s, t) => s + t.total, 0) + daun.total
  return { n, tingkat, daun, jumlah }
}

/** Letak biaya terbesar: 'akar' (tingkat 0), 'daun', atau 'tengah'/'seimbang' bila selisih antartingkat kecil. Untuk ringkasan penjelajah. */
export function pendominasi(pohon) {
  const semua = [...pohon.tingkat.map((t) => t.total), pohon.daun.total]
  const maks = Math.max(...semua)
  const dekat = semua.filter((x) => x >= maks * 0.5).length
  if (dekat >= Math.ceil(semua.length * 0.8)) return 'seimbang'
  return semua.indexOf(maks) === 0 ? 'akar' : semua.indexOf(maks) === semua.length - 1 ? 'daun' : 'tengah'
}

/** Pembagi solusi untuk uji numerik: kasus 1 → n^e, 2 → n^e lg n, 3 → f(n) tanpa koefisien, celah → n^e lg^(q+1) n. */
export function pembagiSolusi(hasil, n) {
  const { p, q } = hasil.solusi
  return n ** p * (q === 0 ? 1 : Math.log2(n) ** q)
}

/** Rasio T(n)/solusi untuk n = b^L pada beberapa L. Mendekati konstanta bila solusinya benar. */
export function rasioNumerik(a, b, f, hasil, daftarL) {
  return daftarL.map((L) => {
    const n = b ** L
    return { L, n, rasio: nilaiT(a, b, f, L) / pembagiSolusi(hasil, n) }
  })
}

/** Bentuk pengurangan T(n) = T(n−1) + n (Soal 8): T(n) = n + (n−1) + ... + 1 + T(0). Dengan T(0) = 0, T(n) = n(n+1)/2. */
export function nilaiPengurangan(n) {
  let T = 0
  for (let m = 1; m <= n; m++) T += m
  return T
}

/** Contoh siap pakai (semuanya dari Modul 09). */
export const contoh = [
  { id: 'merge', judul: 'Merge Sort: 2T(n/2) + n', a: 2, b: 2, f: { k: 1, q: 0 }, ref: 'Tabel 2' },
  { id: 'binary', judul: 'Binary Search: T(n/2) + 1', a: 1, b: 2, f: { k: 0, q: 0 }, ref: 'Tabel 2' },
  { id: 'c1', judul: 'Contoh 1: 2T(n/2) + √n', a: 2, b: 2, f: { k: 0.5, q: 0 }, ref: 'Contoh 1' },
  { id: 'c2', judul: 'Contoh 2: 4T(n/2) + n²', a: 4, b: 2, f: { k: 2, q: 0 }, ref: 'Contoh 2' },
  { id: 'c3', judul: 'Contoh 3: T(3n/5) + n', a: 1, b: 5 / 3, f: { k: 1, q: 0 }, ref: 'Contoh 3', teks: { b: '5/3' } },
  { id: 's1', judul: 'Soal 1: 9T(n/3) + n', a: 9, b: 3, f: { k: 1, q: 0 }, ref: 'Soal 1' },
  { id: 's2', judul: 'Soal 2: 5T(n/2) + n³', a: 5, b: 2, f: { k: 3, q: 0 }, ref: 'Soal 2' },
  { id: 'strassen', judul: 'Strassen: 7T(n/2) + n²', a: 7, b: 2, f: { k: 2, q: 0 }, ref: 'Tabel 2' },
  { id: 'nlg', judul: '3T(n/4) + n lg n', a: 3, b: 4, f: { k: 1, q: 1 }, ref: 'Tabel 2' },
  { id: 'celah', judul: 'Celah: 2T(n/2) + n lg n', a: 2, b: 2, f: { k: 1, q: 1 }, ref: 'Bagian 5' },
]
export const contohById = (id) => contoh.find((c) => c.id === id) ?? null

export { angkaID }

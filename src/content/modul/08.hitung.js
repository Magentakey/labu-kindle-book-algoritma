// Perhitungan untuk Modul 08 (Merge Sort), dipisah dari komponen supaya bisa dites tanpa memuat JSX.
// Semua indeks 1-based seperti di pseudocode: array dibungkus dengan elemen null di indeks 0.

/** Data Gambar 1 (Merge Sort pada 7 bilangan) dan ukuran n untuk Gambar 2 (pohon rekursi). */
export const DATA_GAMBAR_1 = [38, 27, 43, 3, 9, 82, 10]
export const N_GAMBAR_2 = 8

/** Membungkus array biasa menjadi 1-based. */
export const satuBasis = (arr) => [null, ...arr]

/**
 * MERGE(A, p, q, r) dengan sentinel (∞), mengikuti pseudocode baris demi baris. Mengubah A di tempat.
 * @returns {{ L: number[], R: number[], langkah: Array<{ k: number, Li: number, Rj: number, pilih: 'L' | 'R', hasil: number[] }> }}
 *   L dan R sudah memuat sentinel (Infinity) di ujung.
 */
export function merge(A, p, q, r) {
  const n1 = q - p + 1
  const n2 = r - q
  const L = []
  const R = []
  for (let i = 1; i <= n1; i++) L[i] = A[p + i - 1]
  for (let j = 1; j <= n2; j++) R[j] = A[q + j]
  L[n1 + 1] = Infinity
  R[n2 + 1] = Infinity
  let i = 1
  let j = 1
  const langkah = []
  for (let k = p; k <= r; k++) {
    const Li = L[i]
    const Rj = R[j]
    let pilih
    if (Li <= Rj) {
      A[k] = Li
      i++
      pilih = 'L'
    } else {
      A[k] = Rj
      j++
      pilih = 'R'
    }
    langkah.push({ k, Li, Rj, pilih, hasil: A.slice(p, k + 1) })
  }
  return { L: L.slice(1), R: R.slice(1), langkah }
}

/** MERGE_SORT(A, p, r). `peristiwa(e)` dipanggil untuk setiap pemanggilan (untuk jejak); tanpa itu hanya mengurutkan. */
export function mergeSort(A, p, r, peristiwa, kedalaman = 0) {
  const lanjut = p < r
  if (peristiwa) peristiwa({ jenis: 'panggil', p, r, lanjut, kedalaman, q: lanjut ? Math.floor((p + r) / 2) : null })
  if (!lanjut) return
  const q = Math.floor((p + r) / 2)
  mergeSort(A, p, q, peristiwa, kedalaman + 1)
  mergeSort(A, q + 1, r, peristiwa, kedalaman + 1)
  const kiri = A.slice(p, q + 1)
  const kanan = A.slice(q + 1, r + 1)
  merge(A, p, q, r)
  if (peristiwa) peristiwa({ jenis: 'merge', p, q, r, kedalaman: kedalaman + 1, kiri, kanan, hasil: A.slice(p, r + 1) })
}

const tulis = (xs) => `(${xs.join(', ')})`

/** Jejak teks lengkap MERGE_SORT(A, 1, n) dalam format Bagian 4.2 (indentasi 2 spasi per kedalaman). */
export function jejakTeks(arr) {
  const A = satuBasis(arr)
  const baris = []
  mergeSort(A, 1, arr.length, (e) => {
    const sp = '  '.repeat(e.kedalaman)
    if (e.jenis === 'panggil') {
      baris.push(e.lanjut ? `${sp}MERGE_SORT(A,${e.p},${e.r}): ${e.p} < ${e.r} TRUE, q = ⌊${e.p + e.r}/2⌋ = ${e.q}` : `${sp}MERGE_SORT(A,${e.p},${e.r}): ${e.p} < ${e.r} FALSE → kembali`)
    } else {
      baris.push(`${sp}MERGE(A,${e.p},${e.q},${e.r}): ${tulis(e.kiri)} + ${tulis(e.kanan)} → A[${e.p}..${e.r}] = ${tulis(e.hasil)}`)
    }
  })
  return baris
}

/** Urutan pemanggilan MERGE (p, q, r) beserta hasilnya, untuk Soal 2 kuis dan Bagian 4. */
export function urutanMerge(arr) {
  const A = satuBasis(arr)
  const hasil = []
  mergeSort(A, 1, arr.length, (e) => {
    if (e.jenis === 'merge') hasil.push({ p: e.p, q: e.q, r: e.r, kiri: e.kiri, kanan: e.kanan, hasil: e.hasil })
  })
  return hasil
}

/**
 * Gambar 1: tingkat-tingkat pembagian dan penggabungan. Simpul daun yang muncul sebelum tingkat terdalam ikut "terbawa" ke tingkat berikutnya
 * (mis. elemen 10 pada array 7 elemen), supaya setiap baris memuat seluruh elemen.
 * @returns {{ bagi: number[][][], gabung: number[][][] }} bagi[d] dan gabung[d] adalah daftar segmen pada kedalaman d.
 */
export function pohonMergeSort(arr) {
  const A = satuBasis(arr)
  const simpul = [] // { d, p, r, daun, hasil }
  mergeSort(A, 1, arr.length, (e) => {
    if (e.jenis === 'panggil') simpul.push({ d: e.kedalaman, p: e.p, r: e.r, daun: !e.lanjut })
  })
  const maks = Math.max(...simpul.map((s) => s.d))
  // urutan nilai awal tiap simpul dari array asli; hasil terurut dari array yang sudah diurutkan per segmen
  const awal = (s) => arr.slice(s.p - 1, s.r)
  const urut = (s) => [...awal(s)].sort((a, b) => a - b)
  const bagi = []
  const gabung = []
  for (let d = 0; d <= maks; d++) {
    const segmen = simpul.filter((s) => s.d === d)
    const terbawa = simpul.filter((s) => s.d < d && s.daun)
    const semua = [...segmen, ...terbawa].sort((x, y) => x.p - y.p)
    bagi.push(semua.map(awal))
    if (d < maks) gabung[d] = segmen.map((s) => ({ s, hasil: urut(s) })).concat(terbawa.map((s) => ({ s, hasil: awal(s) }))).sort((x, y) => x.s.p - y.s.p).map((x) => x.hasil)
  }
  return { bagi, gabung }
}

/** Gambar 2: pohon rekursi T(n) = 2T(n/2) + cn untuk n pangkat dua. Tingkat i punya 2^i simpul berbiaya cn/2^i; total tiap tingkat cn. */
export function tingkatPohon(n) {
  const lg = Math.log2(n)
  if (!Number.isInteger(lg)) throw new Error('n harus pangkat dua')
  return Array.from({ length: lg + 1 }, (_, i) => ({ i, simpul: 2 ** i, ukuran: n / 2 ** i, biaya: i === 0 ? 'cn' : `cn/${2 ** i}`, total: 'cn' }))
}

/** Total biaya pohon rekursi dalam satuan c: (lg n + 1) · n. */
export const totalPohon = (n) => (Math.log2(n) + 1) * n

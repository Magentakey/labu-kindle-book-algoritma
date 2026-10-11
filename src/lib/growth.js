/**
 * Kelas laju pertumbuhan untuk penjelajah "Kompleksitas Algoritma" (penanda `::growth`).
 * Kunci dipakai penulis materi: `::growth 1, log n, n, n log n, n^2, 2^n`.
 */
const log2 = (n) => Math.log2(n)

export const GROWTH = {
  '1': {
    notation: 'O(1)',
    name: 'Konstanta',
    example: 'Mengakses elemen array dengan indeks tertentu',
    f: () => 1,
  },
  'log n': {
    notation: 'O(log n)',
    name: 'Logaritmik',
    example: 'Pencarian biner di dalam array terurut',
    f: (n) => log2(n),
  },
  n: {
    notation: 'O(n)',
    name: 'Linier',
    example: 'Iterasi melalui seluruh elemen dalam array',
    f: (n) => n,
  },
  'n log n': {
    notation: 'O(n log n)',
    name: 'N log-n',
    example: 'Merge sort dan quick sort',
    f: (n) => n * log2(n),
  },
  'n^2': {
    notation: 'O(n²)',
    name: 'Kuadratik',
    example: 'Insertion sort',
    f: (n) => n ** 2,
  },
  'n^3': {
    notation: 'O(nᵏ), contoh k = 3',
    name: 'Polinomial',
    example: 'Tiga perulangan bersarang; k adalah bilangan bulat positif lebih besar dari 2',
    f: (n) => n ** 3,
  },
  '2^n': {
    notation: 'O(2ⁿ)',
    name: 'Eksponensial',
    example: 'Solusi brute-force untuk masalah Traveling Salesman',
    f: (n) => 2 ** n,
  },
  'n!': {
    notation: 'O(n!)',
    name: 'Faktorial',
    example: 'Solusi brute-force untuk masalah permutasi',
    f: (n) => {
      let r = 1
      for (let k = 2; k <= n; k++) r *= k
      return r
    },
  },
}

/** Urutan bawaan: dari yang paling lambat tumbuh sampai yang paling cepat. */
export const DEFAULT_GROWTH_KEYS = ['1', 'log n', 'n', 'n log n', 'n^2', 'n^3', '2^n', 'n!']
export const GROWTH_KEYS = Object.keys(GROWTH)
export const MIN_N = 1
export const MAX_N = 30

/** @param {string} key @param {number} n */
export function growthValue(key, n) {
  return GROWTH[key].f(n)
}

const SUPERSCRIPT = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '-': '⁻' }

/**
 * Menulis bilangan secara ringkas dan terbaca: 1.024, 33,2, dan 2,65 × 10³² untuk bilangan sangat besar.
 * @param {number} v
 */
export function formatGrowth(v) {
  if (!Number.isFinite(v)) return 'sangat besar'
  if (v < 1e9) return v.toLocaleString('id-ID', { maximumFractionDigits: 1 })
  const [mantissa, exp] = v.toExponential(2).split('e')
  const m = Number(mantissa).toLocaleString('id-ID', { maximumFractionDigits: 2 })
  const e = String(Number(exp)).split('').map((c) => SUPERSCRIPT[c]).join('')
  return `${m} × 10${e}`
}

/**
 * Lebar batang 0 sampai 100 dengan skala logaritma, supaya fungsi yang kecil tetap terlihat di samping n!.
 * @param {number} v
 * @param {number} max nilai terbesar di tabel
 */
export function barPercent(v, max) {
  if (max <= 0) return 0
  return Math.max(2, Math.round((Math.log10(v + 1) / Math.log10(max + 1)) * 100))
}

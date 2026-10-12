/**
 * Rasio kenaikan fungsi running time (materi 3, penanda `::ratio`).
 *
 * Untuk fungsi f(n) = c·g(n), rasio kenaikan dari n₁ ke n₂ adalah f(n₂) / f(n₁).
 * Konstanta c selalu habis dibagi, jadi rasionya hanya bergantung pada g(n).
 * Semuanya fungsi murni supaya bisa dites tanpa browser.
 */
import { GROWTH, formatGrowth } from './growth.js'

export const RATIO_N_MAX = 1024
/** 170! masih terhingga di JavaScript, 171! sudah tidak. */
export const FACTORIAL_RATIO_MAX = 170
export const DEFAULT_RATIO_N1 = 5
export const DEFAULT_RATIO_N2 = 25

/** Kunci kelas yang boleh dipakai di `::ratio`: sama dengan `::growth`. */
export const RATIO_KEYS = Object.keys(GROWTH)

const lg = Math.log2

/** Bentuk fungsi seperti di materi (c adalah konstanta). */
export const RATIO_LABEL = {
  '1': 'c',
  'log n': 'c · lg n',
  n: 'c · n',
  'n log n': 'c · n lg n',
  'n^2': 'c · n²',
  'n^3': 'c · n³',
  '2^n': 'c · 2ⁿ',
  'n!': 'c · n!',
}

/** k bulat ≥ 2 sehingga base^k = target, atau 0 bila tidak ada. */
function exactPower(base, target) {
  if (base < 2) return 0
  let v = base
  for (let k = 1; v <= target && k < 60; k++) {
    if (v === target) return k >= 2 ? k : 0
    v *= base
  }
  return 0
}

/**
 * Nilai rasio f(n₂)/f(n₁), atau null bila tidak terdefinisi / terlalu besar.
 * Rumus ditulis dalam bentuk tertutup (bukan membagi dua bilangan raksasa), supaya 2ⁿ tidak meluap.
 * @param {string} key @param {number} n1 @param {number} n2
 */
export function ratioValue(key, n1, n2) {
  switch (key) {
    case '1':
      return 1
    case 'log n':
      return n1 >= 2 ? lg(n2) / lg(n1) : null
    case 'n':
      return n2 / n1
    case 'n log n':
      return n1 >= 2 ? (n2 * lg(n2)) / (n1 * lg(n1)) : null
    case 'n^2':
      return (n2 / n1) ** 2
    case 'n^3':
      return (n2 / n1) ** 3
    case '2^n':
      return 2 ** (n2 - n1)
    case 'n!': {
      if (n2 > FACTORIAL_RATIO_MAX) return null
      let r = 1
      for (let k = n1 + 1; k <= n2; k++) r *= k
      return r
    }
    default:
      return null
  }
}

/** Rumus rasio sebagai teks biasa (tanpa LaTeX). Mengikuti cara penurunan di materi. */
export function ratioFormula(key, n1, n2) {
  const head = `f(${n2}) / f(${n1})`
  const q = n2 / n1
  const qText = Number.isInteger(q) ? String(q) : `${n2}/${n1}`
  switch (key) {
    case '1':
      return `${head} = c / c = 1`
    case 'log n': {
      if (n1 < 2) return `${head} tidak terdefinisi, karena lg ${n1} = 0`
      const k = exactPower(n1, n2)
      return k
        ? `${head} = lg ${n2} / lg ${n1} = lg ${n1}${sup(k)} / lg ${n1} = ${k} lg ${n1} / lg ${n1} = ${k}`
        : `${head} = lg ${n2} / lg ${n1}`
    }
    case 'n':
      return `${head} = ${n2} / ${n1}`
    case 'n log n': {
      if (n1 < 2) return `${head} tidak terdefinisi, karena lg ${n1} = 0`
      const k = exactPower(n1, n2)
      return k
        ? `${head} = ${n2} lg ${n1}${sup(k)} / (${n1} lg ${n1}) = ${n2} · ${k} lg ${n1} / (${n1} lg ${n1}) = ${n2 * k} / ${n1}`
        : `${head} = ${n2} lg ${n2} / (${n1} lg ${n1})`
    }
    case 'n^2':
      return Number.isInteger(q) ? `${head} = ${q}² = ${q ** 2}` : `${head} = (${qText})²`
    case 'n^3':
      return Number.isInteger(q) ? `${head} = ${q}³ = ${q ** 3}` : `${head} = (${qText})³`
    case '2^n':
      return `${head} = 2^(${n2} − ${n1}) = 2${sup(n2 - n1)}`
    case 'n!': {
      if (n2 > FACTORIAL_RATIO_MAX) return `${head} = ${n2}! / ${n1}!`
      const count = n2 - n1
      const middle = count <= 4 ? Array.from({ length: count }, (_, i) => n2 - i).join(' · ') : `${n2} · ${n2 - 1} · ${n2 - 2} · … · ${n1 + 1}`
      return `${head} = ${n2}! / ${n1}! = ${middle}`
    }
    default:
      return head
  }
}

const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' }
function sup(k) {
  return String(k).split('').map((c) => SUP[c]).join('')
}

/**
 * Memeriksa masukan n₁ dan n₂. Mengembalikan pesan galat, atau null bila valid.
 * @param {unknown} n1 @param {unknown} n2
 */
export function validateRatioInput(n1, n2) {
  if (!Number.isInteger(n1) || !Number.isInteger(n2)) return 'Isi n awal dan n akhir dengan bilangan bulat.'
  if (n1 < 1) return 'n awal minimal 1.'
  if (n2 > RATIO_N_MAX) return `n akhir maksimal ${RATIO_N_MAX}.`
  if (n2 <= n1) return `n akhir harus lebih besar dari n awal (${n1}).`
  return null
}

/**
 * Satu baris tabel per kelas fungsi.
 * @param {string[]} keys @param {number} n1 @param {number} n2
 */
export function ratioRows(keys, n1, n2) {
  return keys
    .filter((k) => GROWTH[k])
    .map((key) => {
      const value = ratioValue(key, n1, n2)
      return {
        key,
        notation: GROWTH[key].notation,
        label: RATIO_LABEL[key],
        name: GROWTH[key].name,
        formula: ratioFormula(key, n1, n2),
        value,
        text: value === null ? '–' : formatGrowth(value),
      }
    })
}

/** Kalimat kesimpulan: kelas dengan rasio terkecil (paling lambat naik) dan terbesar. */
export function ratioSummary(rows, n1, n2) {
  const ok = rows.filter((r) => r.value !== null)
  if (ok.length < 2) return ''
  const small = ok.reduce((a, b) => (b.value < a.value ? b : a))
  const big = ok.reduce((a, b) => (b.value > a.value ? b : a))
  if (small.value === big.value) return `Semua kelas yang bisa dihitung punya rasio yang sama untuk n = ${n1} menjadi n = ${n2}.`
  return `Dari n = ${n1} menjadi n = ${n2}, rasio terkecil dimiliki ${small.notation} (${small.text}), sehingga ia paling lambat naik. Rasio terbesar dimiliki ${big.notation} (${big.text}).`
}

/**
 * Menguraikan argumen penanda: `kunci1, kunci2 ; n1, n2` (keduanya opsional).
 * @param {string} args
 * @returns {{ keys: string[] | null, n1: number, n2: number, bad: string | null }}
 */
export function parseRatioArgs(args) {
  const [keyPart = '', nPart = ''] = args.split(';')
  const keys = keyPart.split(',').map((k) => k.trim()).filter(Boolean)
  let n1 = DEFAULT_RATIO_N1
  let n2 = DEFAULT_RATIO_N2
  let bad = null
  if (nPart.trim()) {
    const nums = nPart.split(',').map((x) => x.trim())
    if (nums.length !== 2 || nums.some((x) => !/^\d+$/.test(x))) bad = 'Setelah titik koma tulis dua bilangan bulat, misalnya "; 4, 1024".'
    else {
      n1 = Number(nums[0])
      n2 = Number(nums[1])
      bad = validateRatioInput(n1, n2)
    }
  }
  return { keys: keys.length ? keys : null, n1, n2, bad }
}

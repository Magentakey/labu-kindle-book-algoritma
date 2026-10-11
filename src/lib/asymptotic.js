/**
 * Logika grafik asimtotik (materi 3 sampai 5). Semuanya fungsi murni supaya bisa dites tanpa browser.
 *
 * Tiga mode, masing-masing menjawab satu pertanyaan:
 *  - compare : fungsi mana yang tumbuh lebih cepat, dan di n berapa kurva saling menyalip? (materi 3)
 *  - bound   : adakah c dan n₀ sehingga f(n) terjepit oleh c·g(n)? Untuk O, Ω, dan Θ. (materi 4)
 *  - little  : apakah f(n)/g(n) menuju 0 (o) atau tak hingga (ω)? (materi 5)
 */

const log2 = (n) => Math.log2(n)

/** Kelas fungsi yang bisa dipilih. `f` menerima n ≥ 1. */
export const FUNCTIONS = {
  // `rank` = urutan laju pertumbuhan yang sudah pasti secara matematika (makin besar makin cepat).
  '1': { label: '1', rank: 0, f: () => 1 },
  'log n': { label: 'log n', rank: 1, f: (n) => log2(n) },
  n: { label: 'n', rank: 2, f: (n) => n },
  'n log n': { label: 'n log n', rank: 3, f: (n) => n * log2(n) },
  'n^2': { label: 'n²', rank: 4, f: (n) => n ** 2 },
  'n^3': { label: 'n³', rank: 5, f: (n) => n ** 3 },
  '2^n': { label: '2ⁿ', rank: 6, f: (n) => 2 ** n },
}

export const FUNCTION_KEYS = Object.keys(FUNCTIONS)

/** Batas rentang n yang digambar. */
export const N_MIN = 1
export const N_MAX = 100

/** Nilai fungsi pada n, atau NaN untuk kunci yang tidak dikenal. */
export function evalFn(key, n) {
  const def = FUNCTIONS[key]
  return def ? def.f(n) : NaN
}

/** Suku banyak a·n² + b·n + c, dipakai di mode bound (sama dengan soal challenge materi 4). */
export function quadratic({ a, b, c }) {
  return (n) => a * n * n + b * n + c
}

/**
 * n bulat terkecil (≥ 1) sehingga kondisi berlaku untuk n itu dan SEMUA n sesudahnya, sampai `limit`.
 * Mengembalikan -1 bila kondisi masih gagal di `limit` (artinya tidak pernah stabil pada rentang ini).
 * Cara ini sama dengan jawaban contoh soal challenge: catat n terakhir yang gagal, lalu tambah satu.
 * @param {(n: number) => boolean} holds
 * @param {number} limit
 */
export function smallestStableN(holds, limit) {
  let lastFail = 0
  for (let n = 1; n <= limit; n++) {
    if (!holds(n)) lastFail = n
  }
  return lastFail === limit ? -1 : lastFail + 1
}

/** Titik n di mana kurva `a` dan `b` bertukar posisi (dipakai untuk menandai persilangan di mode compare). */
export function crossovers(fa, fb, limit = N_MAX) {
  const out = []
  let prev = Math.sign(fa(1) - fb(1))
  for (let n = 2; n <= limit; n++) {
    const s = Math.sign(fa(n) - fb(n))
    if (s !== 0 && prev !== 0 && s !== prev) out.push(n)
    if (s !== 0) prev = s
  }
  return out
}

/**
 * Kesimpulan mode compare untuk c·A(n) terhadap B(n) pada n = 1..limit.
 * `stableN` memakai definisi yang sama dengan soal challenge: n terkecil sehingga pemenang
 * tetap lebih besar untuk n itu dan semua n sesudahnya.
 * @param {string} keyA @param {string} keyB @param {number} [limit] @param {number} [mult]  pengali konstanta untuk A
 */
export function compareSummary(keyA, keyB, limit = N_MAX, mult = 1) {
  const A = FUNCTIONS[keyA]
  const B = FUNCTIONS[keyB]
  const fa = (n) => mult * A.f(n)
  const fb = B.f
  const la = mult === 1 ? A.label : `${mult}·${A.label}`
  const lb = B.label
  const cross = crossovers(fa, fb, limit)
  if (keyA === keyB && mult === 1) return { kind: 'same', cross, text: `${la} dan ${lb} adalah fungsi yang sama, kurvanya berimpit.` }
  const diff = fa(limit) - fb(limit)
  if (diff === 0) return { kind: 'tie', cross, text: `Di n = ${limit}, ${la} dan ${lb} bernilai sama.` }
  const aWins = diff > 0
  const winner = aWins ? la : lb
  const loser = aWins ? lb : la
  const strictly = aWins ? (n) => fa(n) > fb(n) : (n) => fb(n) > fa(n)
  const weakly = aWins ? (n) => fa(n) >= fb(n) : (n) => fb(n) >= fa(n)
  const stableN = smallestStableN(strictly, limit)
  if (smallestStableN(weakly, limit) === 1) {
    // Pemenang tidak pernah kalah. Bila ada n yang sama (misalnya n = 1 untuk n³ dan n), sebutkan agar jujur.
    const ties = []
    for (let n = 1; n <= limit; n++) if (fa(n) === fb(n)) ties.push(n)
    const tieText = ties.length ? ` Keduanya hanya sama di n = ${ties.join(', ')}.` : ''
    return { kind: 'dominant', cross, winner: aWins ? 'A' : 'B', stableN, text: `${winner} tidak pernah lebih kecil dari ${loser} pada n = 1 sampai ${limit}.${tieText}` }
  }
  return {
    kind: 'cross',
    cross,
    winner: aWins ? 'A' : 'B',
    stableN,
    text: `${winner} baru melampaui ${loser} dan tidak pernah tersusul lagi mulai n = ${stableN}. Sebelum itu, ${loser} lebih besar atau sama pada beberapa n.`,
  }
}

/**
 * Mode bound: f(n) = a·n² + b·n + c dibandingkan dengan c·g(n), g(n) = n².
 * @param {{ a: number, b: number, c: number, c1: number, c2: number, notation: 'O'|'Omega'|'Theta' }} p
 * @param {number} limit  n terbesar yang diperiksa
 */
export function boundAnalysis(p, limit = N_MAX) {
  const f = quadratic(p)
  const g = (n) => n * n
  const upper = (n) => f(n) <= p.c2 * g(n)
  const lower = (n) => f(n) >= p.c1 * g(n)
  const both = (n) => upper(n) && lower(n)
  const need = { O: upper, Omega: lower, Theta: both }[p.notation]
  const n0 = smallestStableN(need, limit)
  const n0Upper = smallestStableN(upper, limit)
  const n0Lower = smallestStableN(lower, limit)
  // Kebenaran untuk n yang sangat besar (secara aljabar, karena b dan c tidak negatif):
  //  batas atas  : a < c2, atau a = c2 dengan b = c = 0
  //  batas bawah : a ≥ c1
  const upperEventually = p.a < p.c2 || (p.a === p.c2 && p.b === 0 && p.c === 0)
  const lowerEventually = p.a >= p.c1
  const eventually = { O: upperEventually, Omega: lowerEventually, Theta: upperEventually && lowerEventually }[p.notation]
  return { n0, n0Upper, n0Lower, holds: n0 !== -1, eventually, upperEventually, lowerEventually, f, g }
}

/** Satu baris tabel nilai untuk mode bound. */
export function boundRow(p, n) {
  const f = quadratic(p)(n)
  return { n, f, lower: p.c1 * n * n, upper: p.c2 * n * n }
}

/**
 * Mode little: hubungan f terhadap g. Jenisnya ditentukan dari urutan laju pertumbuhan yang pasti
 * (bukan dari tebakan tren), sedangkan rasio f(n)/g(n) dipakai untuk digambar dan dijelaskan.
 * @returns {{ kind: 'o' | 'omega' | 'theta', ratioEnd: number, text: string }}
 */
export function littleAnalysis(keyF, keyG, limit = N_MAX) {
  const F = FUNCTIONS[keyF]
  const G = FUNCTIONS[keyG]
  const ratioEnd = F.f(limit) / G.f(limit)
  if (F.rank < G.rank) {
    return { kind: 'o', ratioEnd, text: `Rasio ${F.label} / ${G.label} terus mengecil menuju 0, jadi f(n) = o(g(n)). Itu juga berarti O(g(n)).` }
  }
  if (F.rank > G.rank) {
    return { kind: 'omega', ratioEnd, text: `Rasio ${F.label} / ${G.label} terus membesar tanpa batas, jadi f(n) = ω(g(n)). Itu juga berarti Ω(g(n)).` }
  }
  return { kind: 'theta', ratioEnd, text: `Rasio ${F.label} / ${G.label} mendatar di nilai tetap, jadi f(n) = Θ(g(n)): bukan o dan bukan ω.` }
}

/** Nilai c yang bisa dipilih di mode little (definisi o dan ω menuntut SEMUA c > 0, jadi c kecil dan besar sama penting). */
export const C_VALUES = [0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10, 50]

/**
 * Ambang definisi untuk satu nilai c.
 *  - arah 'o'     : f(n) < c·g(n) untuk n itu dan semua n sesudahnya
 *  - arah 'omega' : f(n) > c·g(n) untuk n itu dan semua n sesudahnya
 * Arah ditentukan dari hubungan sebenarnya (omega bila f lebih cepat, selain itu o).
 * `eventually` = apakah syarat itu pasti terpenuhi untuk n yang cukup besar (secara matematika, bukan hanya di rentang gambar).
 * @returns {{ direction: 'o' | 'omega', n0: number, eventually: boolean }}
 */
export function littleThreshold(keyF, keyG, c, limit = N_MAX) {
  const f = FUNCTIONS[keyF].f
  const g = FUNCTIONS[keyG].f
  const { kind } = littleAnalysis(keyF, keyG, limit)
  const direction = kind === 'omega' ? 'omega' : 'o'
  const holds = direction === 'omega' ? (n) => f(n) > c * g(n) : (n) => f(n) < c * g(n)
  const n0 = smallestStableN(holds, limit)
  // o dan ω berlaku untuk semua c. Pada kasus Θ (fungsi sama), f < c·g hanya benar untuk c > 1.
  const eventually = kind === 'theta' ? c > 1 : true
  return { direction, n0, eventually }
}

/**
 * Rentang y untuk skala linear atau log. Skala log memakai nilai positif saja.
 * @param {number[]} values
 * @param {'linear' | 'log'} scale
 */
export function yDomain(values, scale) {
  const finite = values.filter((v) => Number.isFinite(v) && (scale === 'log' ? v > 0 : true))
  if (!finite.length) return scale === 'log' ? [1, 10] : [0, 1]
  let lo = Math.min(...finite)
  let hi = Math.max(...finite)
  if (scale === 'log') {
    lo = 10 ** Math.floor(Math.log10(lo))
    hi = 10 ** Math.ceil(Math.log10(hi))
    if (lo === hi) hi = lo * 10
    return [lo, hi]
  }
  lo = Math.min(0, lo)
  if (hi === lo) hi = lo + 1
  return [lo, hi]
}

/**
 * Posisi 0..1 (0 = bawah) TANPA dijepit: nilai di atas rentang menghasilkan > 1, di bawahnya < 0.
 * Dipakai untuk memotong kurva yang keluar bingkai, bukan menggepengkannya di tepi.
 * @param {number} v @param {[number, number]} domain @param {'linear' | 'log'} scale
 */
export function unitY(v, domain, scale) {
  const [lo, hi] = domain
  if (scale === 'log') return (Math.log10(Math.max(v, Number.MIN_VALUE)) - Math.log10(lo)) / (Math.log10(hi) - Math.log10(lo))
  return (v - lo) / (hi - lo)
}

/** Seperti unitY, tetapi dijepit ke 0..1. Nol atau negatif di skala log jatuh ke dasar. */
export function scaleY(v, domain, scale) {
  if (scale === 'log' && !(v > 0)) return 0
  return Math.min(1, Math.max(0, unitY(v, domain, scale)))
}

const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '-': '⁻' }
const superscript = (n) => String(n).split('').map((c) => SUP[c]).join('')

/** Label sumbu y yang ringkas: 0,01 · 1 · 1.000 · 10⁶ · 10⁻³. */
export function formatTick(v) {
  if (v !== 0 && (v >= 1e6 || v < 0.01)) return `10${superscript(Math.round(Math.log10(v)))}`
  return v.toLocaleString('id-ID', { maximumFractionDigits: 2 })
}

/** Angka rasio untuk tabel: tiga angka penting untuk nilai kecil, notasi 10ᵏ untuk yang sangat besar. */
export function formatRatio(v) {
  if (!Number.isFinite(v)) return 'sangat besar'
  if (v >= 1e9) {
    const [m, e] = v.toExponential(2).split('e')
    return `${Number(m).toLocaleString('id-ID', { maximumFractionDigits: 2 })} × 10${superscript(Number(e))}`
  }
  if (v < 1) return v.toLocaleString('id-ID', { maximumSignificantDigits: 3 })
  return v.toLocaleString('id-ID', { maximumFractionDigits: 2 })
}

/** Titik-titik kurva untuk n = 1..limit. */
export function sampleCurve(fn, limit) {
  const pts = []
  for (let n = 1; n <= limit; n++) pts.push({ n, v: fn(n) })
  return pts
}

// Model hitung penjelajah "Little-o / ω" (Modul 07): uji limit untuk pasangan bentuk fungsi, uji definisi untuk sembarang c, dan geometri grafik rasio.
// Bentuk fungsi dibatasi pada keluarga yang dibahas modul: n^p (lg n)^q (polinomial, logaritma, hasil kalinya), 2ⁿ, dan n!.
// Untuk keluarga ini limit f/g selalu ada dan ditentukan oleh urutan laju: faktorial > eksponensial > n^p (lg n)^q (urut p, lalu q).
import { angkaID, log10Nilai, sains, sup } from './growthModel.js'

export const bentuk = [
  { id: '1', label: '1', jenis: 'poli', p: 0, q: 0 },
  { id: 'lg', label: 'lg n', jenis: 'poli', p: 0, q: 1 },
  { id: 'sqrt', label: '√n', jenis: 'poli', p: 0.5, q: 0 },
  { id: 'n', label: 'n', jenis: 'poli', p: 1, q: 0 },
  { id: 'nlg', label: 'n lg n', jenis: 'poli', p: 1, q: 1 },
  { id: 'n15', label: 'n^1,5', jenis: 'poli', p: 1.5, q: 0 },
  { id: 'n2', label: 'n²', jenis: 'poli', p: 2, q: 0 },
  { id: 'n3', label: 'n³', jenis: 'poli', p: 3, q: 0 },
  { id: '2n', label: '2ⁿ', jenis: 'eks' },
  { id: 'nf', label: 'n!', jenis: 'fakt' },
]
export const bentukById = (id) => bentuk.find((b) => b.id === id) ?? null

const URUT_JENIS = { poli: 0, eks: 1, fakt: 2 }

/** Membandingkan laju tumbuh: −1 bila a lebih lambat dari b, 0 bila sama cepat, 1 bila a lebih cepat. */
export function banding(a, b) {
  if (a.jenis !== b.jenis) return URUT_JENIS[a.jenis] < URUT_JENIS[b.jenis] ? -1 : 1
  if (a.jenis !== 'poli') return 0
  if (a.p !== b.p) return a.p < b.p ? -1 : 1
  if (a.q !== b.q) return a.q < b.q ? -1 : 1
  return 0
}

/** log10 dari bentuk fungsi (tanpa konstanta) untuk n ≥ 2. Aman untuk 2ⁿ dan n! yang sangat besar. */
export function log10Bentuk(id, n) {
  switch (id) {
    case '1': return 0
    case 'sqrt': return 0.5 * Math.log10(n)
    case 'n15': return 1.5 * Math.log10(n)
    default: return log10Nilai(id, n)
  }
}

/** log10 dari rasio (cf·f(n)) / (cg·g(n)). */
export const logRasio = (idF, idG, cf, cg, n) => Math.log10(cf / cg) + log10Bentuk(idF, n) - log10Bentuk(idG, n)

/**
 * Uji limit L = lim cf·f(n) / cg·g(n).
 * @returns {{ cmp: -1|0|1, L: number, teksL: string, benar: { o: boolean, O: boolean, Theta: boolean, Omega: boolean, omega: boolean } }}
 *   L = 0, cf/cg, atau Infinity.
 */
export function ujiLimit(idF, idG, cf = 1, cg = 1) {
  const cmp = banding(bentukById(idF), bentukById(idG))
  const L = cmp < 0 ? 0 : cmp === 0 ? cf / cg : Infinity
  const teksL = cmp < 0 ? '0' : cmp === 0 ? angkaID(L, Number.isInteger(L) ? 0 : 3).replace(/,?0+$/, '') : '∞'
  return { cmp, L, teksL, benar: { o: cmp < 0, O: cmp <= 0, Theta: cmp === 0, Omega: cmp >= 0, omega: cmp > 0 } }
}

/** Kesimpulan uji limit dalam satu kalimat (sesuai Tabel 3 Modul 07). */
export function kesimpulanLimit(u, lf, lg) {
  if (u.cmp < 0) return `L = 0, jadi ${lf} = o(${lg}), sehingga juga ${lf} = O(${lg}) dan ${lf} ≠ Ω(${lg}).`
  if (u.cmp === 0) return `0 < L = ${u.teksL} < ∞, jadi ${lf} = Θ(${lg}): keduanya tumbuh sama cepat.`
  return `L = ∞, jadi ${lf} = ω(${lg}), sehingga juga ${lf} = Ω(${lg}) dan ${lf} ≠ O(${lg}).`
}

/** Menulis rasio dari log10-nya: biasa untuk nilai sedang, notasi ilmiah di luar 10⁻³ … 10⁶, "sangat besar/kecil" di luar ±10⁵. */
export function formatLog(l) {
  if (!Number.isFinite(l)) return '—'
  if (l >= 1e5) return 'sangat besar'
  if (l <= -1e5) return 'sangat kecil'
  if (l < -3 || l >= 6) return sains(l)
  return (10 ** l).toLocaleString('id-ID', { maximumSignificantDigits: 3 })
}

// ---------------------------------------------------------------- uji definisi: "untuk setiap c ada n₀"
/** Tiga kasus dari Modul 07: 2n = o(n²), 2n² ≠ o(n²), dan n²/2 = ω(n). */
export const kasusDefinisi = [
  { id: 'a', judul: '2n = o(n²)', notasi: 'o', f: (n) => 2 * n, g: (n) => n * n, fl: '2n', gl: 'n²', rumusN0: 'n₀ = ⌊2/c⌋ + 1', n0Rumus: (c) => Math.floor(2 / c) + 1, ref: 'Bagian 3.2' },
  { id: 'b', judul: '2n² ≠ o(n²)', notasi: 'o', f: (n) => 2 * n * n, g: (n) => n * n, fl: '2n²', gl: 'n²', rumusN0: null, n0Rumus: null, ref: 'Bagian 3.3' },
  { id: 'c', judul: 'n²/2 = ω(n)', notasi: 'ω', f: (n) => (n * n) / 2, g: (n) => n, fl: 'n²/2', gl: 'n', rumusN0: 'n₀ = ⌊2c⌋ + 1', n0Rumus: (c) => Math.floor(2 * c) + 1, ref: 'Bagian 4.1' },
]
export const kasusById = (id) => kasusDefinisi.find((k) => k.id === id) ?? null

const TOL = 1e-12
/** Apakah syarat definisi berlaku di n: o → f(n) < c·g(n); ω → c·g(n) < f(n). Perbandingan tegas, dengan toleransi galat pembulatan. */
export function syaratDi(kasus, c, n) {
  const f = kasus.f(n)
  const cg = c * kasus.g(n)
  const batas = TOL * Math.max(1, Math.abs(cg))
  return kasus.notasi === 'o' ? f < cg - batas : cg < f - batas
}

const BATAS = 2_000_000
/**
 * n₀ terkecil sehingga syarat berlaku untuk semua n ≥ n₀ (rasio f/g monoton atau tetap, jadi cukup mencari n terakhir yang gagal).
 * @returns {{ ada: boolean, n0: number | null }}
 */
export function cariN0(kasus, c) {
  let terakhirGagal = 0
  for (let n = 1; n <= BATAS; n++) if (!syaratDi(kasus, c, n)) terakhirGagal = n
  if (terakhirGagal >= BATAS) return { ada: false, n0: null }
  return { ada: true, n0: terakhirGagal + 1 }
}

/** Baris contoh untuk tabel: n₀ − 1 (bila ≥ 1, gagal), n₀, dan 10·n₀ (berlaku). */
export function barisDefinisi(kasus, c, n0) {
  const ns = [...(n0 > 1 ? [n0 - 1] : []), n0, 10 * n0]
  return ns.map((n) => ({ n, f: kasus.f(n), cg: c * kasus.g(n), ok: syaratDi(kasus, c, n) }))
}

// ---------------------------------------------------------------- grafik rasio (sumbu mendatar dan tegak logaritmik)
export const PLOT = { lebar: 640, tinggi: 320, kiri: 92, kanan: 30, atas: 16, bawah: 46 }

/** Titik n untuk grafik: 8 titik per dekade dari 10 sampai 10^dekade. */
export const titikN = (dekade) => Array.from({ length: dekade * 8 + 1 }, (_, i) => 10 ** (1 + i / 8))

/** Skala sumbu tegak (log10 rasio): mencakup 0 (rasio 1) dan semua nilai; ticks pada kelipatan langkah yang rapi. */
export function skalaLog(nilaiL) {
  let lo = Math.min(0, ...nilaiL)
  let hi = Math.max(0, ...nilaiL)
  if (hi - lo < 2) {
    lo -= 1
    hi += 1
  }
  const kandidat = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000]
  const langkah = kandidat.find((k) => (hi - lo) / k <= 6) ?? 100000
  lo = Math.floor(lo / langkah) * langkah
  hi = Math.ceil(hi / langkah) * langkah
  const y1 = PLOT.tinggi - PLOT.bawah
  const yOf = (l) => y1 - ((l - lo) / (hi - lo)) * (y1 - PLOT.atas)
  const tick = []
  for (let v = lo; v <= hi + 1e-9; v += langkah) tick.push(v)
  return { lo, hi, langkah, tick, yOf }
}

/** Label tick: 10 dipangkatkan l, mis. 10⁻² atau 1 (untuk l = 0). */
export const labelTick = (l) => (l === 0 ? '1' : `10${sup(l)}`)

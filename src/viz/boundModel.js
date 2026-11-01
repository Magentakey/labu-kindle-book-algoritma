// Model hitung penjelajah "Batas Θ / O / Ω" (Modul 06). Murni, tanpa React, supaya bisa dites.
// Fungsi dibatasi pada polinomial f(n) = a·n² + b·n + c0 dan fungsi acuan g(n) = n^k (k = 0..3): semua contoh Modul 06 berbentuk itu,
// dan untuk polinomial, "berlaku untuk semua n ≥ n₀" dapat diputuskan secara pasti (bukan sekadar dicoba pada beberapa n).

export const NOTASI = {
  theta: { id: 'theta', simbol: 'Θ', nama: 'Theta', peran: 'batas ketat' },
  big: { id: 'big', simbol: 'O', nama: 'Big-Oh', peran: 'batas atas' },
  omega: { id: 'omega', simbol: 'Ω', nama: 'Omega', peran: 'batas bawah' },
}
export const notasiIds = Object.keys(NOTASI)

export const pangkatAcuan = [0, 1, 2, 3]
const SUP = ['⁰', '¹', '²', '³']
/** Label g(n): 1, n, n², n³. */
export const labelG = (k) => (k === 0 ? '1' : k === 1 ? 'n' : `n${SUP[k]}`)

/** Nilai f(n) = a n² + b n + c0. */
export const nilaiF = (p, n) => p.a * n * n + p.b * n + p.c0
/** Nilai g(n) = n^k. */
export const nilaiG = (k, n) => n ** k

/** Teks f(n) yang rapi, mis. "2n² − 3n + 1", "½n² − 3n", "10n − 20". Koefisien 1 dan 0 dihilangkan. */
export function teksF({ a, b, c0 }) {
  const angka = (x) => String(Math.abs(x)).replace('.', ',')
  const suku = []
  const tambah = (koef, bentuk) => {
    if (koef === 0) return
    const tanda = koef < 0 ? '−' : '+'
    const mag = bentuk && Math.abs(koef) === 1 ? '' : angka(koef)
    suku.push({ tanda, isi: `${mag}${bentuk}` })
  }
  tambah(a, 'n²')
  tambah(b, 'n')
  tambah(c0, '')
  if (suku.length === 0) return '0'
  return suku.map((s, i) => (i === 0 ? (s.tanda === '−' ? `−${s.isi}` : s.isi) : ` ${s.tanda} ${s.isi}`)).join('')
}

const EPS = 1e-9
const nonNeg = (x) => x >= -EPS * Math.max(1, Math.abs(x))

/**
 * Polinomial selisih yang harus ≥ 0 untuk setiap sisi syarat. Koefisien dari pangkat 0 ke atas, panjang 4.
 *  - Θ: f − c₁g ≥ 0 dan c₂g − f ≥ 0
 *  - O: f ≥ 0 dan c g − f ≥ 0
 *  - Ω: f − c g ≥ 0   (dan c g ≥ 0, yang otomatis benar untuk c > 0)
 */
export function syaratPolinomial(notasi, { a, b, c0 }, k, { c1, c2, c }) {
  const f = [c0, b, a, 0]
  const kg = (m) => [0, 1, 2, 3].map((i) => (i === k ? m : 0))
  const sub = (x, y) => x.map((v, i) => v - y[i])
  if (notasi === 'theta') {
    return [
      { id: 'bawah', label: 'c₁·g(n) ≤ f(n)', poly: sub(f, kg(c1)) },
      { id: 'atas', label: 'f(n) ≤ c₂·g(n)', poly: sub(kg(c2), f) },
    ]
  }
  if (notasi === 'big') {
    return [
      { id: 'nonneg', label: '0 ≤ f(n)', poly: f },
      { id: 'atas', label: 'f(n) ≤ c·g(n)', poly: sub(kg(c), f) },
    ]
  }
  return [{ id: 'bawah', label: 'c·g(n) ≤ f(n)', poly: sub(f, kg(c)) }]
}

const nilaiPoly = (poly, n) => poly[0] + poly[1] * n + poly[2] * n * n + poly[3] * n * n * n

/** Pangkat tertinggi dengan koefisien bukan nol (−1 bila polinomial nol). */
const derajat = (poly) => {
  for (let i = poly.length - 1; i >= 0; i--) if (Math.abs(poly[i]) > EPS) return i
  return -1
}

/** Untuk n yang cukup besar, apakah polinomial ≥ 0? (tanda koefisien utama; polinomial nol dianggap benar) */
export function akhirnyaNonNegatif(poly) {
  const d = derajat(poly)
  return d === -1 ? true : poly[d] > 0
}

/** Batas atas akar (Cauchy): semua n di atas batas ini punya tanda yang sama dengan koefisien utama. */
function batasAkar(poly) {
  const d = derajat(poly)
  if (d <= 0) return 1
  let m = 0
  for (let i = 0; i < d; i++) m = Math.max(m, Math.abs(poly[i] / poly[d]))
  return Math.ceil(1 + m)
}

const BATAS_PINDAI = 2_000_000

/**
 * Memeriksa syarat notasi untuk semua bilangan bulat n ≥ n0 secara pasti.
 * Sifat polinomial: bila akhirnya ≥ 0, semua n yang gagal terletak di bawah batas akar, jadi cukup memindai sampai batas itu.
 *
 * @returns {{ berlaku: boolean, nGagal: number | null, sisiGagal: string | null, n0Terkecil: number | null, alasan: string | null }}
 *   nGagal = n terkecil ≥ n0 yang melanggar; n0Terkecil = n0 terkecil yang membuat semua n ≥ n0 berlaku (null bila tidak ada);
 *   alasan: 'akhir' (syarat akhirnya pasti dilanggar untuk n besar) atau 'awal' (dilanggar hanya di n kecil, bisa diperbaiki dengan n0 lebih besar).
 */
export function periksa(notasi, p, k, konstanta, n0) {
  const syarat = syaratPolinomial(notasi, p, k, konstanta)
  const akhirOk = syarat.every((s) => akhirnyaNonNegatif(s.poly))
  const pindaiSampai = Math.min(BATAS_PINDAI, Math.max(n0, ...syarat.map((s) => batasAkar(s.poly))) + 2)

  let nGagal = null
  let sisiGagal = null
  let terakhirGagal = 0
  for (let n = 1; n <= pindaiSampai; n++) {
    const gagal = syarat.find((s) => !nonNeg(nilaiPoly(s.poly, n)))
    if (gagal) {
      terakhirGagal = n
      if (n >= n0 && nGagal === null) {
        nGagal = n
        sisiGagal = gagal.label
      }
    }
  }
  if (!akhirOk) {
    // Syarat akhirnya pasti dilanggar: tidak ada n0 yang berhasil. Cari n terkecil ≥ n0 yang melanggar (selalu ada).
    if (nGagal === null) {
      for (let n = pindaiSampai + 1; n <= pindaiSampai + 1000 && nGagal === null; n++) {
        const gagal = syarat.find((s) => !nonNeg(nilaiPoly(s.poly, n)))
        if (gagal) {
          nGagal = n
          sisiGagal = gagal.label
        }
      }
    }
    return { berlaku: false, nGagal, sisiGagal, n0Terkecil: null, alasan: 'akhir' }
  }
  return { berlaku: nGagal === null, nGagal, sisiGagal, n0Terkecil: terakhirGagal + 1, alasan: nGagal === null ? null : 'awal' }
}

/** Baris tabel untuk satu n: nilai f, batas-batas, dan apakah syarat berlaku di n itu. */
export function barisN(notasi, p, k, konstanta, n) {
  const f = nilaiF(p, n)
  const g = nilaiG(k, n)
  const syarat = syaratPolinomial(notasi, p, k, konstanta)
  const ok = syarat.every((s) => nonNeg(nilaiPoly(s.poly, n)))
  const bawah = notasi === 'theta' ? konstanta.c1 * g : notasi === 'omega' ? konstanta.c * g : null
  const atas = notasi === 'theta' ? konstanta.c2 * g : notasi === 'big' ? konstanta.c * g : null
  return { n, f, bawah, atas, ok }
}

/** Contoh siap pakai dari Modul 06 (semua bisa dicocokkan dengan teks dan kuis). */
export const contoh = [
  { id: 'theta', judul: 'Θ: 2n² − 3n + 1 = Θ(n²)', notasi: 'theta', p: { a: 2, b: -3, c0: 1 }, k: 2, c1: 0.75, c2: 2, c: 1, n0: 2, modul: 'Contoh 3.1 (Tabel 1)', teks: { c1: '3/4' } },
  { id: 'big', judul: 'O: ½n² − 3n = O(n²)', notasi: 'big', p: { a: 0.5, b: -3, c0: 0 }, k: 2, c1: 1, c2: 2, c: 0.5, n0: 6, modul: 'Contoh 4.1 (Tabel 2)', teks: { a: '1/2', c: '1/2' } },
  { id: 'omega', judul: 'Ω: 10n − 20 = Ω(n)', notasi: 'omega', p: { a: 0, b: 10, c0: -20 }, k: 1, c1: 1, c2: 2, c: 10 / 3, n0: 3, modul: 'Contoh 5.1', teks: { c: '10/3' } },
  { id: 'salah-n0', judul: 'Soal 6: n₀ terlalu kecil', notasi: 'big', p: { a: 0.5, b: -3, c0: 0 }, k: 2, c1: 1, c2: 2, c: 0.5, n0: 1, modul: 'Soal 6 kuis', teks: { a: '1/2', c: '1/2' } },
  { id: 'bukan-big', judul: 'n² ≠ O(n)', notasi: 'big', p: { a: 1, b: 0, c0: 0 }, k: 1, c1: 1, c2: 2, c: 10, n0: 1, modul: 'Bagian 4.2' },
]
export const contohById = (id) => contoh.find((x) => x.id === id) ?? null

/** Kasus "n² ≠ O(n)" (Bagian 4.2): untuk konstanta c dan n0 mana pun, n = max(n0, ⌈c⌉ + 1) memenuhi n ≥ n0 tetapi n² > c·n. */
export function saksiBukanBig(c, n0) {
  const n = Math.max(n0, Math.ceil(c) + 1)
  return { n, kiri: n * n, kanan: c * n, melanggar: n * n > c * n }
}

// ---------------------------------------------------------------- tampilan grafik
/** Gaya garis. Warna memakai token sintaks (kontras ≥ 4,5 : 1 di terang dan gelap); pola garis dan label langsung di ujung membuatnya tidak bergantung pada warna (WCAG 1.4.1). */
export const gayaBatas = {
  f: { warna: 'var(--text-primary)', dash: '', lebar: 3 },
  bawah: { warna: 'var(--syn-comment)', dash: '9 3 2 3', lebar: 2.6 },
  atas: { warna: 'var(--syn-atom)', dash: '7 4', lebar: 2.6 },
}

export const PLOT = { lebar: 640, tinggi: 340, kiri: 62, kanan: 74, atas: 18, bawah: 46 }

/** Pilih interval sumbu "rapi" untuk nilai maksimum/minimum. */
function langkahRapi(rentang, target = 5) {
  const kasar = rentang / target
  const pangkat = 10 ** Math.floor(Math.log10(kasar))
  const f = kasar / pangkat
  const m = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10
  return m * pangkat
}

/**
 * Skala grafik untuk n = 0..nMax. Sumbu tegak mencakup 0 dan semua nilai f, c·g yang tampil (dipotong bila ada kurva yang melonjak jauh:
 * tinggi dibatasi 3× nilai terbesar pada n = nMax dari f dan batas-batasnya, supaya grafik tetap terbaca).
 */
export function skalaGrafik(nMax, nilaiSemua) {
  let lo = Math.min(0, ...nilaiSemua)
  let hi = Math.max(1, ...nilaiSemua)
  const langkah = langkahRapi(hi - lo)
  lo = Math.floor(lo / langkah) * langkah
  hi = Math.ceil(hi / langkah) * langkah
  const x1 = PLOT.lebar - PLOT.kanan
  const y1 = PLOT.tinggi - PLOT.bawah
  const xOf = (n) => PLOT.kiri + (n / nMax) * (x1 - PLOT.kiri)
  const yOf = (v) => y1 - ((v - lo) / (hi - lo)) * (y1 - PLOT.atas)
  const tick = []
  for (let v = lo; v <= hi + langkah / 2; v += langkah) tick.push(Math.round(v / langkah) * langkah)
  return { lo, hi, langkah, tick, xOf, yOf }
}

/** Titik-titik kurva untuk n = 0..nMax (bilangan bulat; garis lurus antartitik). */
export function jalurFungsi(fn, nMax, sk) {
  const pts = []
  for (let n = 0; n <= nMax; n++) pts.push([sk.xOf(n), sk.yOf(fn(n))])
  return 'M' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L')
}

/** Teks angka Indonesia, maksimal 2 desimal. */
export const angkaID = (x) => (Number.isFinite(x) ? x.toLocaleString('id-ID', { maximumFractionDigits: 2 }) : '—')

/** Mengubah teks isian menjadi bilangan: "1.5", "1,5", dan pecahan "3/4", "10/3". null bila bukan bilangan. */
export function bacaBilangan(teks) {
  const t = String(teks).trim().replace(/\s+/g, '')
  if (t === '') return null
  const satu = (s) => (/^-?\d+([.,]\d+)?$/.test(s) ? Number(s.replace(',', '.')) : null)
  const pecah = /^(-?[\d.,]+)\/([\d.,]+)$/.exec(t)
  if (pecah) {
    const a = satu(pecah[1])
    const b = satu(pecah[2])
    return a === null || b === null || b === 0 ? null : a / b
  }
  return satu(t)
}


// Model hitung penjelajah Pertumbuhan Fungsi (Modul 05): nilai delapan bentuk fungsi running time, rasio pertumbuhan,
// studi kasus prosesor vs algoritma, titik potong, format angka berbahasa Indonesia, dan geometri grafik. Tanpa React, jadi bisa dites.

/** Delapan bentuk umum fungsi running time, dari yang paling lambat tumbuh (Tabel 1 Modul 05). */
export const fungsi = [
  { id: '1', label: '1', nama: 'Konstanta', contoh: 'Mengakses elemen array dengan indeks tertentu' },
  { id: 'lg', label: 'lg n', nama: 'Logaritmik', contoh: 'Binary Search (Modul 02)' },
  { id: 'n', label: 'n', nama: 'Linier', contoh: 'Menelusuri seluruh array; Insertion Sort kasus terbaik' },
  { id: 'nlg', label: 'n lg n', nama: 'Linearitmik', contoh: 'Merge Sort (Modul 08)' },
  { id: 'n2', label: 'n²', nama: 'Kuadrat', contoh: 'Insertion Sort kasus terburuk (Modul 04)' },
  { id: 'n3', label: 'n³', nama: 'Kubik', contoh: 'Matrix-Chain-Order (Modul 11)' },
  { id: '2n', label: '2ⁿ', nama: 'Eksponensial', contoh: 'Mencoba semua himpunan bagian dari n objek' },
  { id: 'nf', label: 'n!', nama: 'Faktorial', contoh: 'Mencoba semua permutasi n objek (brute force)' },
]
export const fungsiById = (id) => fungsi.find((f) => f.id === id)
export const ids = fungsi.map((f) => f.id)

const lg = Math.log2

function faktorial(n) {
  let r = 1
  for (let k = 2; k <= n; k++) r *= k
  return r // Infinity bila n > 170
}

/** Nilai f(n) (tanpa konstanta). Bisa Infinity untuk 2ⁿ (n > 1023) dan n! (n > 170). n bilangan bulat ≥ 1. */
export function nilai(id, n) {
  switch (id) {
    case '1': return 1
    case 'lg': return lg(n)
    case 'n': return n
    case 'nlg': return n * lg(n)
    case 'n2': return n * n
    case 'n3': return n ** 3
    case '2n': return 2 ** n
    case 'nf': return faktorial(n)
    default: throw new Error(`fungsi tidak dikenal: ${id}`)
  }
}

/** log10 dari n!: jumlah log10 k untuk n kecil, rumus Stirling untuk n besar. */
function log10Faktorial(n) {
  if (n <= 170) {
    let s = 0
    for (let k = 2; k <= n; k++) s += Math.log10(k)
    return s
  }
  return (n * Math.log(n) - n + 0.5 * Math.log(2 * Math.PI * n) + 1 / (12 * n)) / Math.LN10
}

/** log10 f(n): tetap berarti untuk nilai yang terlalu besar bagi bilangan desimal. −Infinity bila f(n) = 0 (lg 1). */
export function log10Nilai(id, n) {
  switch (id) {
    case '1': return 0
    case 'lg': return Math.log10(lg(n))
    case 'n': return Math.log10(n)
    case 'nlg': return Math.log10(n) + Math.log10(lg(n))
    case 'n2': return 2 * Math.log10(n)
    case 'n3': return 3 * Math.log10(n)
    case '2n': return n * Math.log10(2)
    case 'nf': return log10Faktorial(n)
    default: throw new Error(`fungsi tidak dikenal: ${id}`)
  }
}

// ---------------------------------------------------------------- format angka (Indonesia: titik ribuan, koma desimal)
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹'
export const sup = (x) => String(x).replace(/\d/g, (d) => SUP[Number(d)]).replace('-', '⁻')

/** 1234567.891 dengan 2 desimal → "1.234.567,89". */
export function angkaID(x, desimal = 0) {
  const [b, d] = Math.abs(x).toFixed(desimal).split('.')
  return `${x < 0 ? '−' : ''}${b.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}${d ? `,${d}` : ''}`
}

/** Notasi ilmiah dari log10 nilai: 30,10 → "1,27 × 10³⁰"; pangkat sepuluh tepat ditulis "10⁶". */
export function sains(l) {
  let e = Math.floor(l + 1e-9)
  let m = Math.round(10 ** (l - e) * 100) / 100
  if (m >= 10) {
    m = 1
    e += 1
  }
  if (Math.abs(m - 1) < 1e-9) return `10${sup(e)}`
  return `${m.toFixed(2).replace(/0$/, '').replace(/\.0$/, '').replace('.', ',')} × 10${sup(e)}`
}

/** Batas pangkat sepuluh untuk ditulis "sangat besar" (di atas ini angkanya tidak bermakna dibaca). */
const SANGAT_BESAR = 1e5

/**
 * Nilai f(n) untuk tabel: lg n satu desimal; lainnya dibulatkan ke bilangan bulat dengan titik ribuan;
 * mulai 10⁶ (atau `batas`) ditulis notasi ilmiah, dan "sangat besar" bila pangkatnya di atas 10⁵.
 */
export function formatNilai(id, n, batas = 1e6) {
  const v = nilai(id, n)
  if (Number.isFinite(v) && id === 'lg') return angkaID(v, 1)
  if (Number.isFinite(v) && v < batas) return angkaID(Math.round(v), 0)
  const l = log10Nilai(id, n)
  return l >= SANGAT_BESAR ? 'sangat besar' : sains(l)
}

/** Rasio f(n2)/f(n1). `log10` selalu ada; `nilai` bisa Infinity bila terlalu besar. NaN bila f(n1) = 0. */
export function rasio(id, n1, n2) {
  const a = nilai(id, n1)
  const b = nilai(id, n2)
  if (a === 0) return { nilai: NaN, log10: NaN }
  const log10 = log10Nilai(id, n2) - log10Nilai(id, n1)
  return { nilai: Number.isFinite(a) && Number.isFinite(b) ? b / a : 10 ** log10, log10 }
}

/** Menulis rasio: bilangan bulat penuh sampai 10¹², desimal bila perlu, lalu notasi ilmiah. */
export function formatRasio(r) {
  if (Number.isNaN(r.log10)) return 'tidak terdefinisi'
  if (r.log10 >= SANGAT_BESAR) return 'sangat besar'
  if (r.log10 >= 12) return sains(r.log10)
  const v = r.nilai
  if (Math.abs(v - Math.round(v)) < 1e-6 * Math.max(1, v)) return angkaID(Math.round(v), 0)
  return angkaID(v, v < 10 ? 2 : 1).replace(/,0+$/, '').replace(/(,\d)0$/, '$1')
}

/** Rumus perhitungan rasio dalam teks, mis. "25 lg 25 / 5 lg 5" (kolom "Perhitungan rasio" Tabel 2). */
export function rumusRasio(id, n1, n2) {
  switch (id) {
    case '1': return 'c / c'
    case 'lg': return `lg ${n2} / lg ${n1}`
    case 'n': return `${n2} / ${n1}`
    case 'nlg': return `${n2} lg ${n2} / ${n1} lg ${n1}`
    case 'n2': return `${n2}² / ${n1}²`
    case 'n3': return `${n2}³ / ${n1}³`
    case '2n': return `2${sup(n2)} / 2${sup(n1)}`
    case 'nf': return `${n2}! / ${n1}!`
    default: throw new Error(`fungsi tidak dikenal: ${id}`)
  }
}

// ---------------------------------------------------------------- studi kasus dan titik potong
/**
 * Studi kasus "prosesor cepat atau algoritma tepat?": A dan B memakai waktu sama (T) untuk ukuran n0.
 * Untuk ukuran n1 waktu A = rasioA × T dan waktu B = rasioB × T; B di komputer k kali lebih cepat = rasioB / k × T.
 */
export function studiKasus({ fA, fB, n0, n1, k }) {
  const A = rasio(fA, n0, n1)
  const B = rasio(fB, n0, n1)
  const Bcepat = { log10: B.log10 - Math.log10(k), nilai: B.nilai / k }
  return {
    A,
    B,
    Bcepat,
    // percepatan prosesor yang dibutuhkan B agar menyamai A
    kebutuhan: { log10: B.log10 - A.log10, nilai: B.nilai / A.nilai },
    algoritmaMenang: A.log10 < Bcepat.log10 - 1e-12 ? 'A' : A.log10 > Bcepat.log10 + 1e-12 ? 'B' : 'seri',
  }
}

/**
 * Titik potong "n kuadrat vs n lg n": ukuran n terkecil sehingga cKuadrat·n² > cLin·n·lg n berlaku untuk semua n sesudahnya
 * (diperiksa sampai `batas`). Contoh bahan kuliah: 2n² vs 50 n lg n → 190. null bila belum terjadi sampai `batas`.
 */
export function titikPotong(cKuadrat, cLin, batas = 2_000_000) {
  let terakhirSalah = 1
  for (let n = 2; n <= batas; n++) if (!(cKuadrat * n * n > cLin * n * lg(n))) terakhirSalah = n
  const hasil = terakhirSalah + 1
  return hasil > batas ? null : hasil
}

/**
 * Gaya tiap kurva. Warna memakai token sintaks (kontras ≥ 4,5 : 1 di mode terang dan gelap), dan setiap kurva juga punya pola garis
 * serta nama langsung di ujungnya, jadi pembeda tidak hanya warna (WCAG 1.4.1).
 */
export const gaya = {
  '1': { warna: 'var(--text-secondary)', dash: '2 4' },
  lg: { warna: 'var(--syn-keyword)', dash: '' },
  n: { warna: 'var(--syn-number)', dash: '7 4' },
  nlg: { warna: 'var(--syn-builtin)', dash: '9 3 2 3' },
  n2: { warna: 'var(--syn-atom)', dash: '' },
  n3: { warna: 'var(--syn-comment)', dash: '7 4' },
  '2n': { warna: 'var(--syn-string)', dash: '14 4' },
  nf: { warna: 'var(--text-primary)', dash: '2 4' },
}

// ---------------------------------------------------------------- geometri grafik
export const PLOT = { lebar: 640, tinggi: 340, kiri: 62, kanan: 70, atas: 16, bawah: 46 }
const area = () => ({ x0: PLOT.kiri, x1: PLOT.lebar - PLOT.kanan, y0: PLOT.atas, y1: PLOT.tinggi - PLOT.bawah })

/** Tanda sumbu mendatar: 1 lalu kelipatan langkah sampai nMax. */
export function tickX(nMax) {
  const langkah = nMax <= 10 ? 1 : nMax <= 30 ? 5 : nMax <= 60 ? 10 : 20
  const t = [1]
  for (let v = langkah; v <= nMax; v += langkah) if (v > 1) t.push(v)
  return t
}

/**
 * Skala sumbu tegak. Linier: 0 sampai 6·nMax (nilai di atasnya dipotong, seperti Gambar 1 Modul 05: n = 1..20, batas 120).
 * Logaritmik: dari 10⁻¹ sampai pangkat sepuluh di atas nilai terbesar pada nMax untuk fungsi yang ditampilkan.
 */
export function skalaY(skala, nMax, keys) {
  const { y0, y1 } = area()
  if (skala === 'linear') {
    const yMax = 6 * nMax
    return { skala, yMax, posisi: (v) => y1 - (v / yMax) * (y1 - y0), tick: niceTicks(0, yMax, 6).map((v) => ({ v, label: angkaID(v) })) }
  }
  const lMin = -1
  const lMax = Math.max(1, Math.ceil(Math.max(...keys.map((k) => log10Nilai(k, nMax)).filter(Number.isFinite), 1)))
  const langkah = Math.max(1, Math.ceil((lMax - lMin) / 7))
  const tick = []
  for (let l = 0; l <= lMax; l += langkah) tick.push({ v: l, label: `10${sup(l)}` })
  return { skala, lMin, lMax, posisi: (l) => y1 - ((Math.max(l, lMin) - lMin) / (lMax - lMin)) * (y1 - y0), tick }
}

function niceTicks(min, max, banyak) {
  const mentah = (max - min) / banyak
  const pangkat = 10 ** Math.floor(Math.log10(mentah))
  const langkah = [1, 2, 5, 10].map((f) => f * pangkat).find((s) => s >= mentah) ?? pangkat * 10
  const t = []
  for (let v = min; v <= max + 1e-9; v += langkah) t.push(Math.round(v * 1e6) / 1e6)
  return t
}

export const xOf = (n, nMax) => {
  const { x0, x1 } = area()
  return x0 + ((n - 1) / Math.max(1, nMax - 1)) * (x1 - x0)
}

/**
 * Jalur kurva satu fungsi untuk n = 1..nMax. Skala linier memotong kurva di tepi atas grafik (titik potong diinterpolasi).
 * @returns {{ d: string, ujung: { x: number, y: number, n: number }, terpotong: boolean, titik: Array<{ n: number, x: number, y: number | null }> }}
 */
export function jalurKurva(id, nMax, sk) {
  const { y0 } = area()
  const titik = []
  let d = ''
  let prev = null
  let terpotong = false
  let ujung = null
  for (let n = 1; n <= nMax; n++) {
    const x = xOf(n, nMax)
    const v = sk.skala === 'linear' ? nilai(id, n) : log10Nilai(id, n)
    const y = sk.posisi(v)
    const keluar = sk.skala === 'linear' && (v > sk.yMax || !Number.isFinite(v))
    if (keluar) {
      titik.push({ n, x, y: null })
      if (prev && !terpotong) {
        // interpolasi garis dari titik terakhir yang terlihat ke tepi atas
        const frac = (sk.yMax - prev.v) / ((Number.isFinite(v) ? v : sk.yMax * 1e6) - prev.v)
        const xc = prev.x + frac * (x - prev.x)
        d += ` L${xc.toFixed(1)} ${y0.toFixed(1)}`
        ujung = { x: xc, y: y0, n: prev.n + frac }
      }
      terpotong = true
      break
    }
    d += `${prev ? ' L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`
    titik.push({ n, x, y })
    prev = { x, y, v, n }
    ujung = { x, y, n }
  }
  return { d: d.trim(), ujung, terpotong, titik }
}

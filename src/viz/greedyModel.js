// Model hitung Modul 13 (Konsep Algoritma Greedy): menukar uang dengan koin paling sedikit dan knapsack (pecahan dan 0-1).
// Dipakai oleh penjelajah "Konsep Greedy" dan tesnya. Murni, tanpa React. Bilangan pecahan dipakai eksak ({ n, d }), bukan desimal.

// ---------------------------------------------------------------- menukar uang
/** Membaca daftar pecahan dari teks ("1, 3, 4"). Syarat: 2–8 bilangan bulat berbeda antara 1 dan 100, dan memuat 1 (supaya setiap jumlah bisa dibayar). */
export function bacaPecahan(teks) {
  const bagian = teks.split(/[\s,;]+/).filter(Boolean)
  if (bagian.length === 0 || bagian.some((b) => !/^\d+$/.test(b))) return { ok: false, pesan: 'Isi bilangan bulat dipisah koma, mis. 1, 3, 4.' }
  const nilai = [...new Set(bagian.map(Number))]
  if (nilai.some((v) => v < 1 || v > 100)) return { ok: false, pesan: 'Setiap pecahan antara 1 dan 100.' }
  if (nilai.length < 2 || nilai.length > 8) return { ok: false, pesan: 'Isi 2 sampai 8 pecahan yang berbeda.' }
  if (!nilai.includes(1)) return { ok: false, pesan: 'Pecahan harus memuat 1 agar setiap jumlah bisa dibayar.' }
  return { ok: true, nilai: nilai.sort((a, b) => b - a) }
}

/** Greedy: koin terbesar yang tidak melebihi sisa, diulang. Mengembalikan daftar koin menurut urutan diambil. */
export function koinGreedy(pecahan, x) {
  const hasil = []
  for (const k of [...pecahan].sort((a, b) => b - a)) while (x >= k) { hasil.push(k); x -= k }
  return hasil
}

/** Dynamic Programming: jumlah koin minimum untuk 0..x beserta satu susunan optimal (pecahan harus memuat 1). */
export function koinOptimal(pecahan, x) {
  const terbaik = [0]
  const pilih = [0]
  for (let v = 1; v <= x; v++) {
    terbaik[v] = Infinity
    for (const k of pecahan) if (k <= v && terbaik[v - k] + 1 < terbaik[v]) { terbaik[v] = terbaik[v - k] + 1; pilih[v] = k }
  }
  const koin = []
  for (let v = x; v > 0; v -= pilih[v]) koin.push(pilih[v])
  return { jumlah: terbaik[x], koin: koin.sort((a, b) => b - a) }
}

/** Jumlah terkecil (1..maks) yang membuat greedy memakai lebih banyak koin daripada optimal, atau null bila tidak ada sampai maks. */
export function penyangkalKoin(pecahan, maks = 200) {
  const jumlah = [0]
  for (let v = 1; v <= maks; v++) {
    jumlah[v] = Math.min(...pecahan.filter((k) => k <= v).map((k) => jumlah[v - k] + 1))
    if (koinGreedy(pecahan, v).length > jumlah[v]) return v
  }
  return null
}

export const contohKoin = [
  { id: 'as', judul: '{1, 5, 10, 25} → 63', pecahan: '1, 5, 10, 25', x: 63 },
  { id: 'gagal', judul: '{1, 3, 4} → 6 (gagal)', pecahan: '1, 3, 4', x: 6 },
  { id: 'kuis', judul: '{1, 6, 10} → 12 (kuis)', pecahan: '1, 6, 10', x: 12 },
]

// ---------------------------------------------------------------- knapsack
const gcd = (a, b) => (b === 0 ? Math.abs(a) : gcd(b, a % b))
/** Pecahan eksak yang disederhanakan. */
export const pecahan = (n, d = 1) => { const g = gcd(n, d) || 1; return { n: n / g, d: d / g } }
/** Tampilan pecahan: "240" bila bulat, selain itu "240,67 (= 721/3)". */
export const teksPecahan = ({ n, d }) => (d === 1 ? String(n) : `${(n / d).toFixed(2).replace('.', ',')} (= ${n}/${d})`)

/** Barang contoh Cormen dkk. (2009, Bab 16.2) yang dipakai modul: berat dan nilai. */
export const barangModul = [{ berat: 10, nilai: 60 }, { berat: 20, nilai: 100 }, { berat: 30, nilai: 120 }]

/** Urutan indeks (mulai 0) menurut nilai per kg terbesar; seri mengikuti urutan asli. Dibandingkan dengan perkalian silang (eksak). */
export const urutanNilaiPerKg = (barang) => barang.map((_, i) => i).sort((a, b) => barang[b].nilai * barang[a].berat - barang[a].nilai * barang[b].berat || a - b)

/** Greedy knapsack pecahan (boleh mengambil sebagian). `bagian` berisi { i, berat, nilai } dengan berat yang diambil (eksak). */
export function knapsackPecahan(barang, W) {
  let sisa = W
  let total = pecahan(0)
  const bagian = []
  for (const i of urutanNilaiPerKg(barang)) {
    if (sisa <= 0) break
    const ambil = Math.min(barang[i].berat, sisa)
    const nilai = pecahan(barang[i].nilai * ambil, barang[i].berat)
    total = pecahan(total.n * nilai.d + nilai.n * total.d, total.d * nilai.d)
    bagian.push({ i, berat: ambil, nilai })
    sisa -= ambil
  }
  return { total, bagian }
}

/** Greedy knapsack 0-1: ambil barang berurutan menurut nilai per kg bila masih muat, tidak pernah membatalkan. */
export function knapsack01Greedy(barang, W) {
  let berat = 0
  let total = 0
  const pilih = []
  for (const i of urutanNilaiPerKg(barang)) if (berat + barang[i].berat <= W) { berat += barang[i].berat; total += barang[i].nilai; pilih.push(i) }
  return { total, berat, pilih: pilih.sort((a, b) => a - b) }
}

/** Knapsack 0-1 optimal dengan Dynamic Programming (tabel barang × kapasitas), lengkap dengan barang yang dipilih. */
export function knapsack01Optimal(barang, W) {
  const n = barang.length
  const t = Array.from({ length: n + 1 }, () => Array(W + 1).fill(0))
  for (let i = 1; i <= n; i++) for (let w = 0; w <= W; w++) {
    t[i][w] = t[i - 1][w]
    if (barang[i - 1].berat <= w) t[i][w] = Math.max(t[i][w], t[i - 1][w - barang[i - 1].berat] + barang[i - 1].nilai)
  }
  const pilih = []
  for (let i = n, w = W; i > 0; i--) if (t[i][w] !== t[i - 1][w]) { pilih.push(i - 1); w -= barang[i - 1].berat }
  return { total: t[n][W], berat: pilih.reduce((a, i) => a + barang[i].berat, 0), pilih: pilih.sort((a, b) => a - b) }
}

/** Kapasitas W (1..maks) tempat greedy 0-1 tidak optimal. */
export const kapasitasGagal = (barang, maks = 60) => Array.from({ length: maks }, (_, k) => k + 1).filter((W) => knapsack01Greedy(barang, W).total < knapsack01Optimal(barang, W).total)

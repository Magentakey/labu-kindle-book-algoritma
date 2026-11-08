// Model hitung Modul 20 (Algoritma Kruskal): himpunan saling lepas (MAKE-SET, FIND-SET, UNION dengan union by rank dan path compression) dan MST-KRUSKAL
// persis menurut pseudocode modul (9 baris) pada graf contoh Modul 19. Mencatat setiap busur yang diproses (diterima atau ditolak) beserta himpunan
// simpul sesudahnya (Tabel 2), potret untuk Gambar 1–6, dan hitungan biaya (Tabel 3). Murni, tanpa React. Terpisah dari graphMst.js (visualizer).
import { busurContoh, namaBusur } from './mstModel.js'

/** Urutan 14 busur menurut bahan kuliah (langkah 4). Busur berbobot sama boleh diurutkan bebas di antara sesamanya. */
export const urutanBahan = [
  ['h', 'g', 1], ['c', 'i', 2], ['g', 'f', 2], ['a', 'b', 4], ['c', 'f', 4], ['g', 'i', 6], ['c', 'd', 7],
  ['h', 'i', 7], ['b', 'c', 8], ['a', 'h', 8], ['d', 'e', 9], ['e', 'f', 10], ['b', 'h', 11], ['d', 'f', 14],
]
/** Jumlah busur yang sudah diproses pada akhir Gambar 1–6 (a)–(f). */
export const tahapGambar = [3, 5, 6, 8, 10, 14]

/** Himpunan saling lepas berbentuk pohon dengan union by rank dan path compression, sama dengan program Python di modul. */
export class HimpunanSalingLepas {
  constructor() { this.induk = {}; this.rank = {}; this.jumlahOperasi = { makeSet: 0, findSet: 0, union: 0 } }
  makeSet(v) { this.induk[v] = v; this.rank[v] = 0; this.jumlahOperasi.makeSet++ }
  findSet(x) {
    this.jumlahOperasi.findSet++
    if (this.induk[x] !== x) this.induk[x] = this.findSet(this.induk[x]) // path compression
    return this.induk[x]
  }
  union(x, y) {
    this.jumlahOperasi.union++
    let rx = this.findSet(x)
    let ry = this.findSet(y)
    if (this.rank[rx] < this.rank[ry]) [rx, ry] = [ry, rx]
    this.induk[ry] = rx // union by rank
    if (this.rank[rx] === this.rank[ry]) this.rank[rx]++
  }
}

/** Himpunan simpul sebagai komponen: daftar "g,h" terurut menurut huruf, tiap himpunan diurutkan menurut anggota pertamanya (seperti Tabel 2). */
export function himpunanSimpul(simpul, diterima) {
  const induk = Object.fromEntries(simpul.map((v) => [v, v]))
  const akar = (x) => { while (induk[x] !== x) x = induk[x]; return x }
  for (const [u, v] of diterima) induk[akar(u)] = akar(v)
  const grup = {}
  for (const v of simpul) (grup[akar(v)] ??= []).push(v)
  return Object.values(grup).map((g) => g.sort()).sort((p, q) => (p[0] < q[0] ? -1 : 1))
}
/** "{a}, {b}, {c,i}" untuk Tabel 2. */
export const teksHimpunan = (sets) => sets.map((s) => `{${s.join(',')}}`).join(', ')

/**
 * MST-KRUSKAL(G, w). `urut` true: busur diurutkan lebih dulu (langkah 4, stabil menurut bobot); false: dipakai apa adanya (sudah terurut).
 * Mengembalikan `langkah` (tiap busur: diterima atau tidak, FIND-SET kedua ujung sebelum UNION, himpunan simpul sesudahnya), `A` (busur diterima berurutan),
 * `total` bobot, dan jumlah operasi struktur data.
 */
export function kruskal(simpul, busur, urut = true) {
  const S = new HimpunanSalingLepas()
  const A = []
  for (const v of simpul) S.makeSet(v) // langkah 2–3
  const terurut = urut ? [...busur].sort((p, q) => p[2] - q[2]) : [...busur] // langkah 4
  const langkah = []
  for (const [u, v, w] of terurut) { // langkah 5
    const diterima = S.findSet(u) !== S.findSet(v) // langkah 6
    if (diterima) { A.push([u, v, w]); S.union(u, v) } // langkah 7–8
    langkah.push({ u, v, w, diterima, himpunan: himpunanSimpul(simpul, A.map(([p, q]) => [p, q])) })
  }
  return { langkah, A, total: A.reduce((s, e) => s + e[2], 0), urutan: terurut, operasi: S.jumlahOperasi }
}

/** Potret tahap Gambar 1–6: busur yang sudah diterima sebelumnya (biru tebal), yang baru diterima (oranye), yang baru ditolak (merah putus-putus), dan himpunan simpul. */
export function potretTahap(hasil, dari, sampai, simpul) {
  const lama = hasil.langkah.slice(0, dari).filter((l) => l.diterima).map((l) => namaBusur(l.u, l.v))
  const batch = hasil.langkah.slice(dari, sampai)
  return {
    lama,
    baru: batch.filter((l) => l.diterima).map((l) => namaBusur(l.u, l.v)),
    tolak: batch.filter((l) => !l.diterima).map((l) => namaBusur(l.u, l.v)),
    himpunan: hasil.langkah[sampai - 1].himpunan,
    bobotSementara: hasil.langkah.slice(0, sampai).filter((l) => l.diterima).reduce((s, l) => s + l.w, 0),
    simpul,
  }
}

/** Fungsi invers Ackermann α(n) menurut Cormen dkk. (2009, Bab 21.4): 0 untuk n ≤ 2, 1 untuk 3, 2 untuk 4–7, 3 untuk 8–2047, 4 untuk sisanya yang masuk akal (n ≤ 10^80). */
export const alfa = (n) => (n <= 2 ? 0 : n === 3 ? 1 : n <= 7 ? 2 : n <= 2047 ? 3 : 4)
/** Perkiraan biaya (langkah) untuk graf dengan E busur dan V simpul: pengurutan E·lg E dan pemrosesan busur E·α(V). */
export const perkiraanBiaya = (V, E) => ({ pengurutan: E * Math.log2(E), proses: E * alfa(V), makeSet: V })

export { busurContoh }

// Model hitung Modul 24 (Algoritma Dijkstra): DIJKSTRA(G, w, s) persis menurut pseudocode modul (8 baris) pada graf contoh bahan kuliah, dengan jejak setiap
// iterasi (Tabel 3, Gambar 1–6): simpul yang di-extract, isi S dan Q, hasil RELAX tiap busur keluar, dan simpul berikutnya. Juga versi "buku" yang me-RELAX tanpa
// memeriksa S (contoh kegagalan dengan bobot negatif, 4.2). Memakai INITIALIZE-SINGLE-SOURCE dan RELAX dari lintasanModel.js (Modul 22). Murni, tanpa React.
// Terpisah dari graphShortest.js (visualizer).
import { initializeSingleSource, relax } from './lintasanModel.js'

/** Adjacency-list graf contoh Gambar 1: urutan list menentukan urutan RELAX; setiap tetangga [simpul, bobot]. */
export const adjDijkstra = {
  s: [['t', 10], ['y', 5]], t: [['x', 1], ['y', 2]], x: [['z', 4]], y: [['x', 9], ['z', 2], ['t', 3]], z: [['s', 7], ['x', 6]],
}
export const simpulDijkstra = ['s', 't', 'x', 'y', 'z']
/** Daftar busur [u, v, bobot] menurut urutan adjacency. */
export const busurDijkstra = Object.entries(adjDijkstra).flatMap(([u, l]) => l.map(([v, w]) => [u, v, w]))
/** Jumlah iterasi while yang sudah selesai pada akhir Gambar 1–6: (a) sebelum iterasi, lalu sesudah loop 1 sampai 5. */
export const tahapGambar = [0, 1, 2, 3, 4, 5]

/** Graf contoh penyangkal (4.2): bobot negatif (b, a) = −2. */
export const adjPenyangkal = { s: [['a', 2], ['b', 3]], a: [['c', 1]], b: [['a', -2]], c: [] }
export const simpulPenyangkal = ['s', 'a', 'b', 'c']

/** Adjacency { u: [[v, w]] } → daftar busur [u, v, w]. */
export const busurDariAdj = (adj) => Object.entries(adj).flatMap(([u, l]) => l.map(([v, w]) => [u, v, w]))

/** EXTRACT-MIN: simpul di Q dengan d terkecil; bila seri, yang lebih dulu menurut abjad (sesuai antrean (d, nama) pada program Python modul). */
const ekstrakMin = (Q, d) => [...Q].sort((p, q) => d[p] - d[q] || (p < q ? -1 : 1))[0]

/**
 * DIJKSTRA(G, w, s). Mengembalikan `urutan` (simpul menurut urutan di-extract), `awal` (keadaan sesudah langkah 1–3 beserta simpul yang akan di-extract pertama),
 * `iterasi` (tiap iterasi: u, du = u.d saat di-extract, S dan Q sesudah langkah 6, `relax` = hasil RELAX tiap busur keluar dalam urutan adjacency
 * {v, w, sebelum, sesudah, berubah}, `berikutnya` = {v, d} atau null, serta salinan d dan π), d, π akhir, dan `hitung` (EXTRACT-MIN, relaksasi, penurunan nilai).
 */
export function dijkstraJejak(adj, s) {
  const simpul = Object.keys(adj)
  const { d, pi } = initializeSingleSource(simpul, s) // langkah 1
  const S = [] // langkah 2
  const Q = new Set(simpul) // langkah 3
  const iterasi = []
  const hitung = { extractMin: 0, relaksasi: 0, penurunan: 0, pemindaianArray: 0 }
  const awal = { d: { ...d }, pi: { ...pi }, berikutnya: { v: ekstrakMin(Q, d), d: d[ekstrakMin(Q, d)] } }
  while (Q.size > 0) { // langkah 4
    hitung.pemindaianArray += Q.size // EXTRACT-MIN dengan array memindai seluruh Q
    const u = ekstrakMin(Q, d) // langkah 5
    const du = d[u]
    Q.delete(u)
    S.push(u) // langkah 6
    hitung.extractMin++
    const hasil = []
    for (const [v, w] of adj[u]) { // langkah 7
      const sebelum = d[v]
      const berubah = relax(d, pi, u, v, w) // langkah 8
      hitung.relaksasi++
      if (berubah) hitung.penurunan++
      hasil.push({ v, w, sebelum, sesudah: d[v], berubah })
    }
    const m = Q.size > 0 ? ekstrakMin(Q, d) : null
    iterasi.push({ u, du, S: [...S], Q: [...Q].sort(), relax: hasil, berikutnya: m === null ? null : { v: m, d: d[m] }, d: { ...d }, pi: { ...pi } })
  }
  return { urutan: S, awal, iterasi, d, pi, hitung }
}

/** Dijkstra versi "buku" pada 4.2: mengikuti pseudocode, RELAX tanpa syarat (juga ke simpul yang sudah di S). Hasilnya salah bila ada bobot negatif. */
export function dijkstraBuku(adj, s) {
  const simpul = Object.keys(adj)
  const d = Object.fromEntries(simpul.map((v) => [v, Infinity]))
  d[s] = 0
  const Q = new Set(simpul)
  const urutan = []
  while (Q.size) {
    const u = ekstrakMin(Q, d)
    Q.delete(u)
    urutan.push(u)
    for (const [v, w] of adj[u]) if (d[v] > d[u] + w) d[v] = d[u] + w
  }
  return { d, urutan }
}

/**
 * Potret keadaan sesudah `k` iterasi (k = 0: sesudah langkah 1–3): nilai d, simpul di S, simpul yang akan di-extract berikutnya,
 * dan busur predecessor (π(v), v) untuk setiap simpul yang punya predecessor.
 */
export function potretDijkstra(hasil, k) {
  const snap = k === 0 ? { d: hasil.awal.d, pi: hasil.awal.pi, berikutnya: hasil.awal.berikutnya } : hasil.iterasi[k - 1]
  return {
    d: snap.d,
    S: hasil.urutan.slice(0, k),
    berikutnya: snap.berikutnya ? snap.berikutnya.v : null,
    tree: Object.keys(snap.pi).filter((v) => snap.pi[v]).map((v) => `${snap.pi[v]}${v}`),
  }
}

/** Teks "t: 10 (π = s)", "t: 10 → 8 (π = y)", atau "s: tetap 0" untuk satu hasil RELAX (kolom 4 Tabel 3). */
export function teksRelax(r, u) {
  if (!r.berubah) return `${r.v}: tetap ${r.sebelum}`
  return r.sebelum === Infinity ? `${r.v}: ${r.sesudah} (π = ${u})` : `${r.v}: ${r.sebelum} → ${r.sesudah} (π = ${u})`
}

// Model hitung Modul 22 (Single-Source Shortest Paths: Konsep dan Relaksasi): graf contoh bahan kuliah (Gambar 1–3), graf dengan cycle negatif (Gambar 4),
// bobot lintasan, jarak terpendek δ(s, v) (termasuk ∞ dan −∞), INITIALIZE-SINGLE-SOURCE, RELAX, serta pembanding independen (brute force, Bellman-Ford, Floyd–Warshall,
// Dijkstra) untuk memeriksa sifat-sifat relaksasi. Murni, tanpa React. Terpisah dari graphShortest.js (visualizer).

/** Graf contoh Gambar 1 sebagai adjacency dengan urutan sama dengan program Python di modul. */
export const adjSP = { s: { t: 3, y: 5 }, t: { x: 6, y: 2 }, y: { t: 1, x: 4, z: 6 }, x: { z: 2 }, z: { x: 7, s: 3 } }
export const simpulSP = ['s', 't', 'x', 'y', 'z']
/** Daftar busur [u, v, w] graf contoh menurut urutan adjacency. */
export const busurSP = Object.entries(adjSP).flatMap(([u, l]) => Object.entries(l).map(([v, w]) => [u, v, w]))
/** Posisi simpul (0 sampai 1): s di kiri tengah, t dan x di atas, y dan z di bawah (Gambar 1–3). */
export const posisiSP = { s: { x: 0, y: 0.5 }, t: { x: 0.43, y: 0 }, x: { x: 1, y: 0 }, y: { x: 0.43, y: 1 }, z: { x: 1, y: 1 } }
/** Lengkungan busur (piksel) agar dua busur berlawanan arah (t–y dan x–z) tidak bertumpuk; selain itu lurus. */
export const lengkungSP = { ty: 16, yt: 16, xz: 16, zx: 16 }
/** Posisi label bobot sepanjang busur (0 sampai 1) untuk dua busur yang bersilangan. */
export const posLabelSP = { yx: 0.25, zs: 0.5 }

/** Dua shortest-path tree dari bahan kuliah: predecessor tiap simpul (Gambar 2 dan 3). */
export const pohonA = { t: 's', x: 't', y: 's', z: 'y' }
export const pohonB = { t: 's', y: 't', x: 'y', z: 'x' }

/** Graf Gambar 4 (busur negatif dan cycle negatif). */
export const simpulNeg = ['s', 'a', 'b', 'c', 'd', 'e', 'f', 'g']
export const busurNeg = [
  ['s', 'a', 3], ['a', 'b', -4], ['b', 'g', 4], ['s', 'c', 5], ['c', 'd', 6], ['d', 'c', -3],
  ['d', 'g', 8], ['s', 'e', 2], ['e', 'f', 3], ['f', 'e', -6], ['f', 'g', 7],
]
export const posisiNeg = { s: { x: 0, y: 0.5 }, a: { x: 0.3, y: 0 }, b: { x: 0.7, y: 0 }, c: { x: 0.3, y: 0.5 }, d: { x: 0.7, y: 0.5 }, e: { x: 0.3, y: 1 }, f: { x: 0.7, y: 1 }, g: { x: 1, y: 0.5 } }
export const lengkungNeg = { cd: 11, dc: 11, ef: 11, fe: 11 }

/** Adjacency { u: { v: w } } dari daftar busur (satu busur per pasangan berarah). */
export function adjDariBusur(simpul, busur) {
  const adj = Object.fromEntries(simpul.map((v) => [v, {}]))
  for (const [u, v, w] of busur) adj[u][v] = w
  return adj
}
/** Bobot lintasan: jumlah bobot busur-busurnya. `jalur` berupa daftar simpul. */
export const bobotLintasan = (adj, jalur) => jalur.slice(1).reduce((s, v, i) => s + adj[jalur[i]][v], 0)

/** Semua lintasan sederhana (tanpa cycle) dari s ke setiap simpul, seperti program Python di modul: { v: [{ bobot, jalur: 'styx' }] } menurut urutan penemuan. */
export function semuaLintasanSederhana(adj, s) {
  const lintasan = {}
  const jelajah = (u, jalur, bobot) => {
    ;(lintasan[u] ??= []).push({ bobot, jalur })
    for (const [v, w] of Object.entries(adj[u])) if (!jalur.includes(v)) jelajah(v, jalur + v, bobot + w)
  }
  jelajah(s, s, 0)
  return lintasan
}
/** Ringkasan seperti keluaran Python: bobot terbaik, daftar lintasan terbaik (urutan penemuan), dan banyak lintasan sederhana. */
export function ringkasLintasan(adj, s, v) {
  const l = semuaLintasanSederhana(adj, s)[v]
  const terbaik = Math.min(...l.map((x) => x.bobot))
  return { terbaik, jalur: l.filter((x) => x.bobot === terbaik).map((x) => x.jalur), banyak: l.length }
}

/** INITIALIZE-SINGLE-SOURCE(G, s): semua d = ∞, π = NIL (null), s.d = 0. */
export function initializeSingleSource(simpul, s) {
  const d = {}
  const pi = {}
  for (const v of simpul) { d[v] = Infinity; pi[v] = null }
  d[s] = 0
  return { d, pi }
}
/** RELAX(u, v, w): bila v.d > u.d + w maka v.d = u.d + w dan v.π = u. Mengubah d dan pi; mengembalikan true bila ada perubahan. */
export function relax(d, pi, u, v, w) {
  if (d[v] > d[u] + w) { d[v] = d[u] + w; pi[v] = u; return true }
  return false
}

/** Bellman-Ford: `putaran` (bawaan |V| − 1) putaran merelaksasi semua busur. `siklusNegatif` true bila sesudahnya masih ada busur yang bisa direlaksasi (algoritma mengembalikan FALSE). */
export function bellmanFord(simpul, busur, s, putaran = simpul.length - 1) {
  const { d, pi } = initializeSingleSource(simpul, s)
  let relaksasi = 0
  for (let i = 1; i <= putaran; i++) for (const [u, v, w] of busur) { relaksasi++; relax(d, pi, u, v, w) }
  const siklusNegatif = busur.some(([u, v, w]) => d[v] > d[u] + w)
  return { d, pi, siklusNegatif, relaksasi }
}

/** Dijkstra (hanya benar untuk bobot tidak negatif): setiap simpul diambil sekali, busur keluarnya direlaksasi sekali. */
export function dijkstra(simpul, busur, s) {
  const adj = adjDariBusur(simpul, busur)
  const { d, pi } = initializeSingleSource(simpul, s)
  const Q = new Set(simpul)
  let relaksasi = 0
  while (Q.size) {
    const u = [...Q].sort((p, q) => d[p] - d[q] || (p < q ? -1 : 1))[0]
    Q.delete(u)
    for (const [v, w] of Object.entries(adj[u])) { relaksasi++; relax(d, pi, u, v, w) }
  }
  return { d, pi, relaksasi }
}

/** Floyd–Warshall: jarak antar semua pasangan simpul (∞ bila tidak ada lintasan; nilai diagonal < 0 berarti ada cycle negatif melalui simpul itu). Pembanding independen. */
export function floydWarshall(simpul, busur) {
  const D = Object.fromEntries(simpul.map((u) => [u, Object.fromEntries(simpul.map((v) => [v, u === v ? 0 : Infinity]))]))
  for (const [u, v, w] of busur) D[u][v] = Math.min(D[u][v], w)
  for (const k of simpul) for (const i of simpul) for (const j of simpul) if (D[i][k] + D[k][j] < D[i][j]) D[i][j] = D[i][k] + D[k][j]
  return D
}

/**
 * Jarak terpendek δ(s, v) untuk semua v: bilangan, ∞ (tidak terjangkau), atau −∞ (terjangkau dari cycle negatif yang terjangkau dari s).
 * Dihitung lewat Floyd–Warshall: simpul k di cycle negatif (D[k][k] < 0) yang dicapai dari s membuat setiap simpul yang dicapai dari k bernilai −∞.
 */
export function jarakTerpendek(simpul, busur, s) {
  const D = floydWarshall(simpul, busur)
  const hasil = {}
  for (const v of simpul) {
    const adaMinusTakHingga = simpul.some((k) => D[s][k] < Infinity && D[k][k] < 0 && D[k][v] < Infinity)
    hasil[v] = adaMinusTakHingga ? -Infinity : D[s][v]
  }
  return hasil
}

/** Teks jarak: "−∞", "∞", atau angka (dengan tanda minus Unicode). */
export const teksJarak = (x) => (x === Infinity ? '∞' : x === -Infinity ? '−∞' : x < 0 ? `−${Math.abs(x)}` : String(x))

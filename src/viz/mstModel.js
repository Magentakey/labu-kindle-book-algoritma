// Model hitung Modul 19 (Konsep Minimum Spanning Tree): graf contoh bahan kuliah (9 simpul, 14 busur), spanning tree, bobot, cut dan light edge,
// pencacah spanning tree (brute force dan teorema pohon-matriks), serta MST pembanding. Murni, tanpa React. Terpisah dari graphMst.js (visualizer).

export const simpulContoh = 'abcdefghi'.split('')
/** Busur graf contoh [u, v, bobot], urutan sama dengan program Python di modul. */
export const busurContoh = [
  ['a', 'b', 4], ['a', 'h', 8], ['b', 'c', 8], ['b', 'h', 11], ['c', 'd', 7],
  ['c', 'i', 2], ['c', 'f', 4], ['d', 'e', 9], ['d', 'f', 14], ['e', 'f', 10],
  ['f', 'g', 2], ['g', 'h', 1], ['g', 'i', 6], ['h', 'i', 7],
]
/** Posisi simpul (0 sampai 1) pada Gambar 1 dan 2. */
export const posisiContoh = {
  a: { x: 0.04, y: 0.5 }, b: { x: 0.27, y: 0.08 }, c: { x: 0.52, y: 0.08 }, d: { x: 0.77, y: 0.08 }, e: { x: 0.97, y: 0.5 },
  f: { x: 0.77, y: 0.92 }, g: { x: 0.52, y: 0.92 }, h: { x: 0.27, y: 0.92 }, i: { x: 0.52, y: 0.5 },
}

/** Nama busur tak berarah yang kanonik: "ab" untuk (a,b) maupun (b,a). */
export const namaBusur = (u, v) => (u < v ? `${u}${v}` : `${v}${u}`)
export const bobotBusur = (busur, u, v) => busur.find(([p, q]) => namaBusur(p, q) === namaBusur(u, v))?.[2]
/** w(T): jumlah bobot himpunan busur (daftar nama seperti 'ab'). */
export const bobotTotal = (busur, himpunan) => himpunan.reduce((s, n) => s + bobotBusur(busur, n[0], n[1]), 0)

/** MST bahan kuliah (T1, Gambar 1) dan MST kedua (T2, Tabel 3). */
export const mstT1 = ['ab', 'bc', 'cd', 'cf', 'ci', 'de', 'fg', 'gh']
export const mstT2 = ['ab', 'ah', 'cd', 'cf', 'ci', 'de', 'fg', 'gh']

/** Himpunan busur `himpunan` membentuk spanning tree dari `simpul`? (|V|-1 busur, tanpa cycle, sehingga terhubung). */
export function adalahSpanningTree(simpul, himpunan) {
  if (himpunan.length !== simpul.length - 1) return false
  const induk = Object.fromEntries(simpul.map((v) => [v, v]))
  const akar = (x) => { while (induk[x] !== x) x = induk[x]; return x }
  for (const n of himpunan) {
    const [ru, rv] = [akar(n[0]), akar(n[1])]
    if (ru === rv) return false
    induk[ru] = rv
  }
  return true
}

/** Semua spanning tree (daftar nama busur) lewat brute force: setiap kombinasi |V|-1 busur yang tanpa cycle. */
export function semuaSpanningTree(simpul, busur) {
  const hasil = []
  const k = simpul.length - 1
  const pilih = (mulai, terpilih) => {
    if (terpilih.length === k) { if (adalahSpanningTree(simpul, terpilih)) hasil.push([...terpilih]); return }
    for (let i = mulai; i <= busur.length - (k - terpilih.length); i++) pilih(i + 1, [...terpilih, namaBusur(busur[i][0], busur[i][1])])
  }
  pilih(0, [])
  return hasil
}

/** Ringkasan brute force seperti keluaran program Python: banyak spanning tree, bobot minimum, banyak MST, bobot maksimum. */
export function ringkasBruteForce(simpul, busur) {
  const semua = semuaSpanningTree(simpul, busur)
  const bobot = semua.map((t) => bobotTotal(busur, t))
  const min = Math.min(...bobot)
  return { banyak: semua.length, min, banyakMst: bobot.filter((b) => b === min).length, max: Math.max(...bobot), semua, bobot }
}

/** Determinan eksak (bilangan bulat, eliminasi Bareiss) matriks persegi. */
function determinan(M) {
  const n = M.length
  const A = M.map((r) => r.map((x) => BigInt(x)))
  let tanda = 1n
  let prev = 1n
  for (let k = 0; k < n - 1; k++) {
    if (A[k][k] === 0n) {
      const s = A.findIndex((r, i) => i > k && r[k] !== 0n)
      if (s < 0) return 0n
      ;[A[k], A[s]] = [A[s], A[k]]
      tanda = -tanda
    }
    for (let i = k + 1; i < n; i++) for (let j = k + 1; j < n; j++) A[i][j] = (A[i][j] * A[k][k] - A[i][k] * A[k][j]) / prev
    prev = A[k][k]
  }
  return tanda * A[n - 1][n - 1]
}

/** Banyak spanning tree lewat teorema pohon-matriks (Kirchhoff): determinan matriks Laplace tanpa satu baris dan kolom. Pembanding independen brute force. */
export function banyakSpanningTreeKirchhoff(simpul, busur) {
  const idx = Object.fromEntries(simpul.map((v, i) => [v, i]))
  const n = simpul.length
  const L = Array.from({ length: n }, () => Array(n).fill(0))
  for (const [u, v] of busur) {
    if (u === v) continue
    L[idx[u]][idx[u]]++; L[idx[v]][idx[v]]++; L[idx[u]][idx[v]]--; L[idx[v]][idx[u]]--
  }
  return Number(determinan(L.slice(1).map((r) => r.slice(1))))
}

/** Rumus Cayley: graf lengkap dengan n simpul punya n^(n-2) spanning tree (BigInt agar eksak). */
export const cayley = (n) => BigInt(n) ** BigInt(n - 2)
/** C(n, k) eksak. */
export const kombinasi = (n, k) => { let h = 1n; for (let i = 1n; i <= BigInt(k); i++) h = (h * (BigInt(n) - i + 1n)) / i; return h }

/** Cut (S, V − S): busur yang menyeberang (crossing edge) beserta light edge-nya (bobot terkecil; bisa lebih dari satu bila seri). */
export function potongan(simpul, busur, S) {
  const dalam = new Set(S)
  const silang = busur.filter(([u, v]) => dalam.has(u) !== dalam.has(v)).map(([u, v, w]) => ({ nama: namaBusur(u, v), w }))
  const min = Math.min(...silang.map((e) => e.w))
  return { silang, light: silang.filter((e) => e.w === min), bobotLight: min }
}
/** Cut respects A: tidak ada busur A yang menyeberangi cut. */
export const menghormati = (S, A) => { const dalam = new Set(S); return A.every((n) => dalam.has(n[0]) === dalam.has(n[1])) }

/** Lintasan satu-satunya antara s dan t di dalam tree (daftar simpul), atau null. */
export function lintasanDiTree(himpunan, s, t) {
  const adj = {}
  for (const n of himpunan) { (adj[n[0]] ??= []).push(n[1]); (adj[n[1]] ??= []).push(n[0]) }
  const dfs = (u, dari, jalur) => {
    if (u === t) return jalur
    for (const v of adj[u] ?? []) if (v !== dari) { const r = dfs(v, u, [...jalur, v]); if (r) return r }
    return null
  }
  return dfs(s, null, [s])
}

/** Jarak terpendek s ke t pada graf berbobot tak berarah (Dijkstra sederhana, bobot positif). Pembanding untuk "MST bukan lintasan terpendek". */
export function jarakTerpendek(simpul, busur, s, t) {
  const d = Object.fromEntries(simpul.map((v) => [v, Infinity]))
  d[s] = 0
  const selesai = new Set()
  for (;;) {
    const u = simpul.filter((v) => !selesai.has(v)).sort((p, q) => d[p] - d[q])[0]
    if (u === undefined || d[u] === Infinity) break
    selesai.add(u)
    for (const [p, q, w] of busur) {
      if (p === u && d[u] + w < d[q]) d[q] = d[u] + w
      if (q === u && d[u] + w < d[p]) d[p] = d[u] + w
    }
  }
  return d[t]
}

/** Satu MST lewat Kruskal sederhana (urut bobot, pemecah seri mengikuti urutan input). Dipakai tes sebagai pembanding bobot minimum. */
export function bobotMstKruskal(simpul, busur) {
  const induk = Object.fromEntries(simpul.map((v) => [v, v]))
  const akar = (x) => { while (induk[x] !== x) x = induk[x]; return x }
  let total = 0
  for (const [u, v, w] of [...busur].sort((p, q) => p[2] - q[2])) {
    const [ru, rv] = [akar(u), akar(v)]
    if (ru !== rv) { induk[ru] = rv; total += w }
  }
  return total
}

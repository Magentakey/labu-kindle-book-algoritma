// Model hitung Modul 21 (Algoritma Prim): MST-PRIM persis menurut pseudocode modul (11 baris) pada graf contoh Modul 19–20 dengan adjacency-list dari Tabel 3.
// EXTRACT-MIN memilih key terkecil; bila key sama, simpul yang lebih dulu menurut urutan abjad (sesuai bahan kuliah). Mencatat setiap iterasi (Tabel 4),
// key dan predecessor setelah tiap iterasi (Gambar 1–6), serta hitungan operasi (Tabel 5). Murni, tanpa React. Terpisah dari graphMst.js (visualizer).
import { busurContoh, namaBusur } from './mstModel.js'

/** Adjacency-list graf contoh menurut Tabel 3 (urutan list menentukan urutan pemeriksaan tetangga). */
export const adjContoh = {
  a: ['b', 'h'], b: ['a', 'c', 'h'], c: ['b', 'i', 'f', 'd'], d: ['c', 'e', 'f'], e: ['d', 'f'],
  f: ['c', 'd', 'e', 'g'], g: ['f', 'h', 'i'], h: ['a', 'b', 'g', 'i'], i: ['c', 'g', 'h'],
}
export const simpulPrim = Object.keys(adjContoh)
/** Bobot busur tak berarah dari graf contoh: w('a','b') = w('b','a') = 4. */
export const bobotContoh = (() => { const w = {}; for (const [u, v, b] of busurContoh) { w[`${u}${v}`] = b; w[`${v}${u}`] = b } return w })()
/** Jumlah iterasi yang sudah selesai pada akhir Gambar 1–6: (a) sebelum iterasi, (b) setelah extract a, (c) setelah extract c, (d) setelah extract i, (e) setelah extract f, (f) setelah extract e. */
export const tahapGambar = [0, 1, 3, 4, 5, 9]

/**
 * MST-PRIM(G, w, r). `Adj`: adjacency-list; `w`: peta "uv" → bobot (dua arah); `r`: akar.
 * Mengembalikan `urutan` (simpul menurut urutan di-extract), `key` dan `pi` akhir (key = nilai saat di-extract), `total` (jumlah key saat extract),
 * `iterasi` (tiap iterasi: simpul, key-nya, daftar pembaruan, daftar busur yang tidak memperbarui, key simpul di Q sesudahnya, snapshot key dan pi),
 * dan `hitung` (EXTRACT-MIN, pemeriksaan adjacency, pemeriksaan v ∈ Q yang benar, pembaruan key).
 * `seri`: 'abjad' (bahan kuliah) atau 'balik' (pilihan lain yang juga sah bila key sama; dipakai tes untuk catatan setelah Tabel 4).
 */
export function prim(Adj, w, r, { seri = 'abjad' } = {}) {
  const simpul = Object.keys(Adj)
  const key = {}
  const pi = {}
  for (const u of simpul) { key[u] = Infinity; pi[u] = null } // langkah 1–3
  key[r] = 0 // langkah 4
  const Q = new Set(simpul) // langkah 5
  const urutan = []
  const iterasi = []
  const hitung = { extractMin: 0, periksaAdj: 0, vDiQ: 0, pembaruan: 0 }
  let total = 0
  while (Q.size > 0) { // langkah 6
    // langkah 7: EXTRACT-MIN, key terkecil; seri → urutan abjad
    const u = [...Q].sort((p, q) => key[p] - key[q] || (seri === 'abjad' ? (p < q ? -1 : 1) : (p < q ? 1 : -1)))[0]
    Q.delete(u)
    hitung.extractMin++
    urutan.push(u)
    total += key[u]
    const pembaruan = []
    const tidak = []
    for (const v of Adj[u]) { // langkah 8
      hitung.periksaAdj++
      if (Q.has(v)) { // langkah 9
        hitung.vDiQ++
        if (w[`${u}${v}`] < key[v]) { pi[v] = u; key[v] = w[`${u}${v}`]; pembaruan.push({ v, key: key[v] }); hitung.pembaruan++ } // langkah 10–11
        else tidak.push({ v, w: w[`${u}${v}`], key: key[v] })
      }
    }
    iterasi.push({
      u, keyU: key[u], pembaruan, tidak,
      keyDiQ: Object.fromEntries([...Q].sort().map((v) => [v, key[v]])),
      keySetelah: { ...key }, piSetelah: { ...pi },
    })
  }
  return { urutan, key, pi, total, iterasi, hitung }
}

/** Busur MST: (v, v.π) untuk setiap v selain akar, dalam urutan di-extract. */
export const busurMst = (hasil, r) => hasil.urutan.filter((v) => v !== r).map((v) => [v, hasil.pi[v]])

/**
 * Potret keadaan sesudah `k` iterasi (k = 0: sesudah langkah 1–5). Mengembalikan key tiap simpul, simpul yang sudah di-extract (di tree),
 * busur tree (v, π) untuk simpul yang sudah di-extract, dan busur sementara (v, π) untuk simpul di Q yang sudah punya predecessor.
 */
export function potretPrim(hasil, k, simpul, r) {
  const sudah = hasil.urutan.slice(0, k)
  const snap = k === 0 ? { key: Object.fromEntries(simpul.map((v) => [v, v === r ? 0 : Infinity])), pi: Object.fromEntries(simpul.map((v) => [v, null])) } : { key: hasil.iterasi[k - 1].keySetelah, pi: hasil.iterasi[k - 1].piSetelah }
  return {
    key: snap.key,
    sudah,
    tree: sudah.filter((v) => snap.pi[v] !== null).map((v) => namaBusur(v, snap.pi[v])),
    sementara: simpul.filter((v) => !sudah.includes(v) && snap.pi[v] !== null).map((v) => namaBusur(v, snap.pi[v])),
    diQ: simpul.filter((v) => !sudah.includes(v)),
  }
}

/** "∞" untuk key tak berhingga, selain itu angka. */
export const teksKey = (x) => (x === Infinity ? '∞' : String(x))
/** Key simpul yang masih di Q sebagai "b 4, c ∞, ..." (kolom terakhir Tabel 4). */
export const teksKeyDiQ = (keyDiQ) => (Object.keys(keyDiQ).length === 0 ? 'Q kosong' : Object.entries(keyDiQ).map(([v, x]) => `${v} ${teksKey(x)}`).join(', '))

// Model hitung Modul 23 (Algoritma Bellman-Ford): BELLMAN-FORD(G, w, s) persis menurut pseudocode modul (8 baris) dengan jejak setiap putaran:
// busur yang berhasil direlaksasi (kondisi TRUE), nilai d dan π sesudah tiap putaran (Tabel 2, Gambar 1–5), pemeriksaan akhir (langkah 5–7),
// serta hitungan operasi. Memakai INITIALIZE-SINGLE-SOURCE dan RELAX dari lintasanModel.js (Modul 22). Murni, tanpa React. Terpisah dari graphShortest.js (visualizer).
import { initializeSingleSource } from './lintasanModel.js'

export const simpulBF = ['s', 't', 'x', 'y', 'z']
/** Urutan busur pada langkah 3 menurut bahan kuliah: [u, v, bobot]. */
export const urutanBF = [
  ['t', 'x', 5], ['t', 'y', 8], ['t', 'z', -4], ['x', 't', -2], ['y', 'x', -3],
  ['y', 'z', 9], ['z', 'x', 7], ['z', 's', 2], ['s', 't', 6], ['s', 'y', 7],
]
/** Lengkungan (piksel) untuk dua busur berlawanan arah t–x agar tidak bertumpuk; dan posisi label bobot untuk dua busur yang bersilangan di tengah. */
export const lengkungBF = { tx: 12, xt: 12 }
export const posLabelBF = { tz: 0.3, yx: 0.3, zs: 0.2 }
/** Graf cycle negatif Modul 22 dengan urutan busur seperti program Python modul (bagian 3.1). */
export const simpulNegBF = ['s', 'a', 'b', 'c', 'd', 'e', 'f', 'g']
export const urutanNegBF = [
  ['s', 'a', 3], ['s', 'c', 5], ['s', 'e', 2], ['a', 'b', -4], ['c', 'd', 6], ['d', 'c', -3],
  ['b', 'g', 4], ['d', 'g', 8], ['e', 'f', 3], ['f', 'e', -6], ['f', 'g', 7],
]

/**
 * BELLMAN-FORD(G, w, s). `busur` dipakai persis menurut urutannya di setiap putaran.
 * Mengembalikan: `awal` (d dan π sesudah langkah 1), `putaran` (tiap putaran: i, `berhasil` = busur yang kondisinya TRUE beserta nilai sebelum/sesudah, d dan π sesudahnya,
 * `berubah` = simpul yang d-nya berubah), `ok` (TRUE/FALSE), `pemeriksaan` (langkah 5–7: tiap busur yang diperiksa dan apakah v.d > u.d + w), d, π, dan hitungan.
 * `putaranMaks` (bawaan |V| − 1) membatasi jumlah putaran untuk keperluan tes.
 */
export function bellmanFordJejak(simpul, busur, s, putaranMaks = simpul.length - 1) {
  const { d, pi } = initializeSingleSource(simpul, s) // langkah 1
  const awal = { d: { ...d }, pi: { ...pi } }
  const putaran = []
  let relaksasi = 0
  for (let i = 1; i <= putaranMaks; i++) { // langkah 2
    const berhasil = []
    for (const [u, v, w] of busur) { // langkah 3
      relaksasi++
      if (d[v] > d[u] + w) { // langkah 4: RELAX
        berhasil.push({ u, v, w, sebelum: d[v], sesudah: d[u] + w })
        d[v] = d[u] + w
        pi[v] = u
      }
    }
    putaran.push({ i, berhasil, d: { ...d }, pi: { ...pi }, berubah: [...new Set(berhasil.map((b) => b.v))].sort() })
  }
  const pemeriksaan = []
  let ok = true
  for (const [u, v, w] of busur) { // langkah 5
    const lebih = d[v] > d[u] + w // langkah 6
    pemeriksaan.push({ u, v, w, lebih })
    if (lebih) { ok = false; break } // langkah 7
  }
  return { awal, putaran, ok, pemeriksaan, d, pi, relaksasi }
}

/** Nomor putaran terakhir yang masih mengubah sebuah nilai d (0 bila tidak ada putaran yang mengubah apa pun). */
export const putaranTerakhirBerubah = (jejak) => jejak.putaran.reduce((maks, p) => (p.berhasil.length > 0 ? p.i : maks), 0)

/** Lintasan dari s ke v menurut rantai predecessor, sebagai daftar simpul (atau null bila v tidak terjangkau). */
export function lintasanDariPi(pi, s, v) {
  const j = [v]
  while (j[0] !== s) { const p = pi[j[0]]; if (p === null || p === undefined) return null; j.unshift(p) }
  return j
}

/** Teks "6 (s)" untuk sel Tabel 2: nilai d dan predecessor dalam kurung; "∞" bila belum berhingga; "-" tidak dipakai. */
export const teksSel = (d, pi) => (d === Infinity ? '∞' : `${d < 0 ? `−${Math.abs(d)}` : d}${pi ? ` (${pi})` : ''}`)

/**
 * Bellman-Ford dengan penghentian dini (varian di 4.3): berhenti begitu satu putaran penuh tidak mengubah apa pun.
 * Mengembalikan jumlah putaran yang dijalankan (termasuk putaran terakhir yang tanpa perubahan, bila ada) dan d akhir.
 */
export function bellmanFordDini(simpul, busur, s) {
  const { d, pi } = initializeSingleSource(simpul, s)
  let putaran = 0
  for (let i = 1; i < simpul.length; i++) {
    putaran++
    let berubah = false
    for (const [u, v, w] of busur) if (d[v] > d[u] + w) { d[v] = d[u] + w; pi[v] = u; berubah = true }
    if (!berubah) break
  }
  return { d, pi, putaran }
}

/** DP atas banyaknya busur (4.4): D_i[v] = bobot lintasan (walk) terpendek dari s ke v yang memakai paling banyak i busur. Mengembalikan D_0 sampai D_k. */
export function dpBanyakBusur(simpul, busur, s, k) {
  const D = [Object.fromEntries(simpul.map((v) => [v, v === s ? 0 : Infinity]))]
  for (let i = 1; i <= k; i++) {
    const sebelumnya = D[i - 1]
    const baru = { ...sebelumnya }
    for (const [u, v, w] of busur) if (sebelumnya[u] + w < baru[v]) baru[v] = sebelumnya[u] + w
    D.push(baru)
  }
  return D
}

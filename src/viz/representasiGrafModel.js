// Model hitung Modul 16 (Graf dan Representasinya): adjacency-list dan adjacency-matrix dari daftar busur, ukuran memori, derajat, dan biaya
// memeriksa sebuah busur. Urutan isi list mengikuti urutan busur dimasukkan, sama dengan fungsi bangun() pada program Python di modul.
// Berkas terpisah dari graphModel.js milik visualizer. Murni, tanpa React.

/** Graf (a) bahan kuliah: tak berarah, 5 simpul, 7 busur. Graf (b): berarah, 6 simpul, 8 busur (termasuk self-loop pada simpul 6). */
export const grafA = { n: 5, berarah: false, busur: [[1, 2], [1, 5], [2, 5], [2, 3], [2, 4], [3, 4], [4, 5]] }
export const grafB = { n: 6, berarah: true, busur: [[1, 2], [1, 4], [2, 5], [3, 6], [3, 5], [4, 2], [5, 4], [6, 6]] }
/** Soal 1 kuis: simpul a, b, c, d diberi nomor 1, 2, 3, 4. */
export const grafSoal1 = { n: 4, berarah: false, busur: [[1, 2], [1, 3], [2, 3], [3, 4]] }
/** Posisi simpul (0 sampai 1) pada Gambar 1 dan 2 modul. */
export const posisiA = { 1: { x: 0.12, y: 0.2 }, 2: { x: 0.5, y: 0.08 }, 3: { x: 0.9, y: 0.45 }, 4: { x: 0.62, y: 0.92 }, 5: { x: 0.12, y: 0.8 } }
export const posisiB = { 1: { x: 0.1, y: 0.25 }, 2: { x: 0.5, y: 0.25 }, 3: { x: 0.9, y: 0.25 }, 4: { x: 0.1, y: 0.8 }, 5: { x: 0.5, y: 0.8 }, 6: { x: 0.9, y: 0.8 } }

export const MAKS_SIMPUL = 12
export const MAKS_BUSUR = 30

/** Daftar busur → teks "1-2, 1-5, ..." dan sebaliknya. */
export const teksBusur = (busur) => busur.map(([u, v]) => `${u}-${v}`).join(', ')
export function bacaBusur(teks, n, berarah) {
  const potongan = teks.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean)
  const busur = []
  for (const p of potongan) {
    const m = p.match(/^(\d+)\s*(?:-|–|→|>)\s*(\d+)$/)
    if (!m) return { ok: false, pesan: `"${p}" bukan busur. Tulis seperti 1-2, 1-5, 2-3.` }
    const u = Number(m[1])
    const v = Number(m[2])
    if (u < 1 || v < 1 || u > n || v > n) return { ok: false, pesan: `Nomor simpul antara 1 dan ${n} (busur ${u}-${v}).` }
    if (!berarah && u === v) return { ok: false, pesan: 'Graf tak berarah di modul ini tanpa self-loop; pilih graf berarah untuk busur ke diri sendiri.' }
    if (busur.some(([a, b]) => (a === u && b === v) || (!berarah && a === v && b === u))) return { ok: false, pesan: `Busur ${u}-${v} muncul dua kali (tanpa busur ganda).` }
    busur.push([u, v])
  }
  if (busur.length > MAKS_BUSUR) return { ok: false, pesan: `Paling banyak ${MAKS_BUSUR} busur.` }
  return { ok: true, busur }
}

/**
 * Membangun kedua representasi persis seperti fungsi bangun(n, busur, berarah) di modul.
 * @returns {{ adj: Record<number, number[]>, A: number[][], panjangTotal: number, satu: number, simetris: boolean, keluar: number[], masuk: number[] }}
 */
export function bangun(n, busur, berarah) {
  const adj = Object.fromEntries(Array.from({ length: n }, (_, i) => [i + 1, []]))
  const A = Array.from({ length: n + 1 }, () => Array(n + 1).fill(0)) // baris/kolom 0 tidak dipakai
  for (const [u, v] of busur) {
    adj[u].push(v)
    A[u][v] = 1
    if (!berarah && u !== v) { adj[v].push(u); A[v][u] = 1 }
  }
  const panjangTotal = Object.values(adj).reduce((a, l) => a + l.length, 0)
  let satu = 0
  let simetris = true
  for (let i = 1; i <= n; i++) for (let j = 1; j <= n; j++) { satu += A[i][j]; if (A[i][j] !== A[j][i]) simetris = false }
  const keluar = Array.from({ length: n }, (_, i) => adj[i + 1].length)
  const masuk = Array.from({ length: n }, (_, j) => { let s = 0; for (let i = 1; i <= n; i++) s += A[i][j + 1]; return s })
  return { adj, A, panjangTotal, satu, simetris, keluar, masuk }
}

/** Biaya memeriksa busur (u, v): adjacency-list menelusuri Adj[u] sampai ketemu (atau habis); adjacency-matrix cukup melihat satu sel. */
export function periksaBusur(adj, A, u, v) {
  const daftar = adj[u]
  const k = daftar.indexOf(v)
  return { ada: k >= 0, perbandinganList: k >= 0 ? k + 1 : daftar.length, panjangList: daftar.length, sel: A[u][v], langkahMatriks: 1 }
}

/** Memori dalam satuan elemen: list = |V| kepala + panjang total (|E| berarah, 2|E| tak berarah); matriks = |V|². */
export function memori(V, E, berarah) {
  const panjang = berarah ? E : 2 * E
  const list = V + panjang
  const matriks = V * V
  return { panjang, list, matriks, rasio: matriks / list }
}

/** Batas banyak busur tanpa self-loop dan busur ganda pada graf tak berarah: |V|(|V| − 1)/2. */
export const maksBusurTakBerarah = (V) => (V * (V - 1)) / 2

/** Susunan melingkar bila posisi tidak diberikan (0 sampai 1). */
export function posisiMelingkar(n) {
  return Object.fromEntries(Array.from({ length: n }, (_, i) => {
    const t = (2 * Math.PI * i) / n - Math.PI / 2
    return [i + 1, n === 1 ? { x: 0.5, y: 0.5 } : { x: 0.5 + 0.42 * Math.cos(t), y: 0.5 + 0.4 * Math.sin(t) }]
  }))
}

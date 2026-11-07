// Model hitung Modul 17 (Breadth-First Search): BFS persis menurut pseudocode modul (18 langkah) pada adjacency-list, dengan potret keadaan sesudah
// inisialisasi dan sesudah setiap putaran while (isi antrean, warna, jarak, predecessor), PRINT-PATH, dan BFS-tree. Murni, tanpa React.
// Berkas ini terpisah dari graphTraversal.js dan bfsTree.js milik visualizer.

export const INF = Infinity

/** Adjacency-list graf contoh bahan kuliah (Tabel 3), urutannya menentukan urutan simpul masuk antrean. */
export const adjContoh = {
  s: ['w', 'r'],
  r: ['s', 'v'],
  t: ['u', 'w', 'x'],
  u: ['t', 'x', 'y'],
  v: ['r'],
  w: ['s', 't', 'x'],
  x: ['t', 'u', 'y', 'w'],
  y: ['x', 'u'],
}
/** Urutan simpul di Tabel 3 dan di keluaran program Python. */
export const urutanTabel = ['s', 'r', 't', 'u', 'v', 'w', 'x', 'y']
/** Urutan menampilkan simpul pada lintasan (Tabel 5). */
export const urutanLintasan = ['r', 'w', 't', 'x', 'v', 'u', 'y']

/** Posisi simpul (0 sampai 1) pada gambar: dua baris, mengikuti bentuk graf contoh. */
export const posisiContoh = {
  v: { x: 0.08, y: 0.18 }, r: { x: 0.3, y: 0.18 }, s: { x: 0.52, y: 0.18 }, t: { x: 0.74, y: 0.18 }, u: { x: 0.94, y: 0.18 },
  w: { x: 0.52, y: 0.78 }, x: { x: 0.74, y: 0.78 }, y: { x: 0.94, y: 0.78 },
}

const salin = (c, d, pi) => ({ color: { ...c }, d: { ...d }, pi: { ...pi } })

/**
 * BFS(G, s) menurut pseudocode modul. Mengembalikan `awal` (keadaan sesudah langkah 1–9: Q = [s]), `putaran` (satu catatan per putaran while:
 * simpul u yang di-DEQUEUE, pemeriksaan setiap tetangga dengan warnanya SEBELUM diperiksa, simpul yang ditemukan, isi Q sesudahnya, dan potret keadaan
 * sesudah u menjadi BLACK), serta d, pi, color akhir.
 */
export function bfs(Adj, s) {
  const color = {}
  const d = {}
  const pi = {}
  for (const u of Object.keys(Adj)) if (u !== s) { color[u] = 'WHITE'; d[u] = INF; pi[u] = null } // langkah 1–4
  color[s] = 'GRAY'; d[s] = 0; pi[s] = null // langkah 5–7
  const Q = [s] // langkah 8–9
  const awal = { Q: [...Q], ...salin(color, d, pi) }
  const putaran = []
  let no = 0
  while (Q.length > 0) { // langkah 10
    no++
    const u = Q.shift() // langkah 11: DEQUEUE (FIFO)
    const pemeriksaan = []
    const ditemukan = []
    for (const v of Adj[u]) { // langkah 12
      pemeriksaan.push({ v, warna: color[v] })
      if (color[v] === 'WHITE') { // langkah 13
        color[v] = 'GRAY'; d[v] = d[u] + 1; pi[v] = u // langkah 14–16
        Q.push(v) // langkah 17: ENQUEUE
        ditemukan.push(v)
      }
    }
    color[u] = 'BLACK' // langkah 18
    putaran.push({ no, u, pemeriksaan, ditemukan, Q: [...Q], ...salin(color, d, pi) })
  }
  return { d, pi, color, awal, putaran, urutanDequeue: putaran.map((p) => p.u) }
}

/** Lintasan dari s ke v dengan mengikuti predecessor mundur lalu membaliknya; null bila v tidak terjangkau. */
export function lintasan(pi, s, v) {
  const hasil = []
  for (let x = v; x !== null && x !== undefined; x = pi[x]) {
    hasil.push(x)
    if (x === s) return hasil.reverse()
  }
  return null
}

/** PRINT-PATH(G, s, v) menurut pseudocode modul; mengembalikan baris yang dicetak. */
export function printPath(pi, d, s, v, cetak = []) {
  if (v === s) cetak.push(s)
  else if (pi[v] === null || pi[v] === undefined) cetak.push(`tidak ada lintasan dari ${s} ke ${v}`)
  else { printPath(pi, d, s, pi[v], cetak); cetak.push(v) }
  return cetak
}

/** Busur-busur predecessor (BFS-tree): pasangan [π(v), v] untuk setiap simpul yang punya predecessor. */
export const busurPohon = (pi) => Object.entries(pi).filter(([, p]) => p !== null && p !== undefined).map(([v, p]) => [p, v])

/** Busur graf tak berarah dari adjacency-list (pasangan unik, urutan simpul abjad). */
export function busurGraf(Adj) {
  const ada = new Set()
  const hasil = []
  for (const [u, l] of Object.entries(Adj)) for (const v of l) {
    const kunci = [u, v].sort().join('|')
    if (!ada.has(kunci)) { ada.add(kunci); hasil.push([u, v]) }
  }
  return hasil
}

/** Teks isi antrean seperti di gambar bahan kuliah: "w(1), r(1)" atau "kosong". */
export const teksAntrean = (Q, d) => (Q.length ? Q.map((x) => `${x}(${d[x]})`).join(', ') : 'kosong')
/** Teks isi antrean tanpa jarak, seperti di Tabel 4: "r, t, x" atau "kosong". */
export const teksQ = (Q) => (Q.length ? Q.join(', ') : 'kosong')
export const teksJarak = (x) => (x === INF ? '∞' : String(x))

/** Keterangan Gambar 1–9 persis seperti bahan kuliah: (a) inisialisasi, lalu (b)–(i) sesudah simpul dikeluarkan dari Q dan menjadi BLACK. */
export const keteranganGambar = (r) => [
  '(a) Setelah langkah 1–9 (inisialisasi).',
  ...r.putaran.map((p, i) => `(${'bcdefghi'[i]}) Setelah ${p.u} dikeluarkan dari Q dan menjadi BLACK.`),
]

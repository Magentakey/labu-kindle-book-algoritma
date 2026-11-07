// Model hitung Modul 18 (Depth-First Search): DFS dan DFS-VISIT persis menurut pseudocode modul (7 dan 10 langkah) pada graf berarah dengan
// adjacency-list. Mencatat timestamp d/f, predecessor, klasifikasi busur (tree, back, forward, cross), dan log peristiwa berurutan
// (simpul ditemukan, busur diperiksa, simpul selesai) untuk menggambar keadaan graf pada waktu tertentu. Murni, tanpa React.
// Berkas ini terpisah dari dfsTree.js (algorithms) milik visualizer DFS.

/** Adjacency-list graf contoh bahan kuliah (Tabel 3). Urutan list menentukan urutan penelusuran. */
export const adjContoh = {
  u: ['v', 'x'],
  v: ['y'],
  w: ['y', 'z'],
  x: ['v'],
  y: ['x'],
  z: ['z'],
}
/** Urutan simpul pada Tabel 3, Tabel 4, perulangan DFS, dan keluaran program Python. */
export const urutanTabel = ['u', 'v', 'w', 'x', 'y', 'z']

/** Posisi simpul (0 sampai 1) pada gambar: dua baris tiga kolom, sama dengan Gambar 1–6 bahan kuliah. */
export const posisiContoh = {
  u: { x: 0.12, y: 0.2 }, v: { x: 0.5, y: 0.2 }, w: { x: 0.88, y: 0.2 },
  x: { x: 0.12, y: 0.8 }, y: { x: 0.5, y: 0.8 }, z: { x: 0.88, y: 0.8 },
}
/** Waktu (time) pada setiap Gambar 1–6 di bahan kuliah. */
export const waktuGambar = [1, 4, 5, 8, 10, 12]

export const KELAS = { tree: 'Tree', back: 'Back', forward: 'Forward', cross: 'Cross' }
export const HURUF_KELAS = { back: 'B', forward: 'F', cross: 'C' }

/**
 * DFS(G) dan DFS-VISIT(G, u) menurut pseudocode modul. `urutan` adalah urutan simpul pada perulangan langkah 5 DFS.
 * Mengembalikan d, f, pi, color akhir, `busur` (setiap busur graf sekali, sesuai urutan diperiksa, beserta kelasnya), `jenis` (peta "uv" → kelas),
 * `peristiwa` (log berurutan), `akar` (simpul yang dipanggil di langkah 7 DFS, yaitu akar tiap tree), dan `waktu` akhir.
 */
export function dfs(Adj, urutan = Object.keys(Adj)) {
  const color = {}
  const d = {}
  const f = {}
  const pi = {}
  for (const u of Object.keys(Adj)) { color[u] = 'WHITE'; pi[u] = null } // langkah 1–3
  let time = 0 // langkah 4
  const peristiwa = []
  const busur = []
  const jenis = {}
  const akar = []
  const visit = (u) => {
    time += 1; d[u] = time; color[u] = 'GRAY' // langkah 1–3 DFS-VISIT
    peristiwa.push({ jenis: 'temu', u, t: time })
    for (const v of Adj[u]) { // langkah 4
      let kelas
      if (color[v] === 'WHITE') kelas = 'tree'
      else if (color[v] === 'GRAY') kelas = 'back'
      else kelas = d[u] < d[v] ? 'forward' : 'cross'
      const b = { u, v, kelas, warna: color[v] }
      busur.push(b)
      jenis[`${u}${v}`] = kelas
      peristiwa.push({ jenis: 'busur', ...b })
      if (kelas === 'tree') { pi[v] = u; visit(v) } // langkah 5–7
    }
    color[u] = 'BLACK'; time += 1; f[u] = time // langkah 8–10
    peristiwa.push({ jenis: 'selesai', u, t: time })
  }
  for (const u of urutan) { // langkah 5 DFS
    if (color[u] === 'WHITE') { akar.push(u); visit(u) } // langkah 6–7
  }
  return { d, f, pi, color, busur, jenis, peristiwa, akar, waktu: time }
}

/**
 * Potret keadaan graf tepat sesudah peristiwa "ditemukan" atau "selesai" dengan time = T (busur yang diperiksa sesudahnya belum dihitung).
 * Mengembalikan warna, d, f (null bila belum), dan busur yang sudah diperiksa beserta kelasnya.
 */
export function potret(hasil, T, Adj = adjContoh) {
  const color = Object.fromEntries(Object.keys(Adj).map((u) => [u, 'WHITE']))
  const d = Object.fromEntries(Object.keys(Adj).map((u) => [u, null]))
  const f = Object.fromEntries(Object.keys(Adj).map((u) => [u, null]))
  const busur = []
  for (const e of hasil.peristiwa) {
    if (e.jenis === 'temu') { color[e.u] = 'GRAY'; d[e.u] = e.t } else if (e.jenis === 'selesai') { color[e.u] = 'BLACK'; f[e.u] = e.t } else busur.push({ u: e.u, v: e.v, kelas: e.kelas })
    if ((e.jenis === 'temu' || e.jenis === 'selesai') && e.t === T) break
  }
  return { time: T, color, d, f, busur }
}

/** Keterangan Gambar 1–6 persis seperti bahan kuliah. */
export const keteranganGambar = [
  '(a) time = 1: u ditemukan (u.d = 1).',
  '(b) time = 4: u, v, y, x ditemukan berturut-turut lewat busur tree.',
  '(c) time = 5: (x, v) ternyata menuju simpul GRAY, jadi busur Back; x selesai.',
  '(d) time = 8: y, v, u selesai; (u, x) menjadi busur Forward. Tree pertama terbentuk.',
  '(e) time = 10: w ditemukan; (w, y) busur Cross; z ditemukan.',
  '(f) time = 12: (z, z) busur Back; z dan w selesai. DFS selesai.',
]

/** Teks "d/f" seperti di gambar: "1/8", atau "1/" bila simpul belum selesai, atau "" bila belum ditemukan. */
export const teksDF = (d, f) => (d === null || d === undefined ? '' : `${d}/${f ?? ''}`)

/** Struktur tanda kurung: urutan "(u" saat ditemukan dan "u)" saat selesai, masing-masing diawali time-nya. */
export const strukturKurung = (hasil) => hasil.peristiwa.filter((e) => e.jenis !== 'busur').map((e) => `${e.t}${e.jenis === 'temu' ? `(${e.u}` : `${e.u})`}`)

/** Selang [d, f] dua simpul: 'bersarang' (satu di dalam yang lain), 'lepas' (tidak beririsan), atau 'tumpang' (irisan sebagian; tidak mungkin pada DFS). */
export function hubunganSelang(hasil, a, b) {
  const [a1, a2, b1, b2] = [hasil.d[a], hasil.f[a], hasil.d[b], hasil.f[b]]
  if (a2 < b1 || b2 < a1) return 'lepas'
  if ((a1 < b1 && b2 < a2) || (b1 < a1 && a2 < b2)) return 'bersarang'
  return 'tumpang'
}

/** Keturunan di DFS-forest: b adalah keturunan a bila a ada pada rantai predecessor b. */
export function keturunan(pi, a, b) {
  for (let x = pi[b]; x !== null && x !== undefined; x = pi[x]) if (x === a) return true
  return false
}

/** Tree di DFS-forest sebagai daftar bersarang { u, anak: [...] } untuk setiap akar. */
export function hutan(hasil) {
  const bangun = (u) => ({ u, anak: Object.keys(hasil.pi).filter((v) => hasil.pi[v] === u).sort((a, b) => hasil.d[a] - hasil.d[b]).map(bangun) })
  return hasil.akar.map(bangun)
}

/** Apakah graf berarah punya cycle menurut DFS: ya bila ada paling sedikit satu back edge (Lemma 22.11). */
export const adaBackEdge = (hasil) => hasil.busur.some((b) => b.kelas === 'back')

/** Gaya garis busur menurut kelasnya: tree = biru tebal; back/forward/cross = merah putus-putus; belum diperiksa = abu-abu tipis. */
export function gayaBusur(kelas) {
  if (kelas === 'tree') return { w: 3.5, dash: undefined, stroke: 'stroke-brand-blue', panah: 'tree' }
  if (kelas) return { w: 2, dash: '5 3', stroke: 'stroke-bad', panah: 'non' }
  return { w: 1.5, dash: undefined, stroke: 'stroke-muted', panah: 'belum' }
}

/** Id penanda panah yang aman dipakai di url(#...) (useId memuat titik dua). */
export const idPanah = (id) => (jenis) => `p${id.replace(/[^a-zA-Z0-9]/g, '')}-${jenis}`

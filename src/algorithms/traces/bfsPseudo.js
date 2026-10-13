// Pseudocode BFS(G, s) dari materi 11.1 (Cormen). Nomor baris sama dengan nomor langkah di materi.
// Harus sama persis dengan blok pseudocode di graph-bfs.md (dijaga oleh tes).
export const bfsPseudoCode = [
  'for each vertex u ∈ G.V − {s}',
  '    u.color = WHITE',
  '    u.d = ∞',
  '    u.π = NIL',
  's.color = GRAY',
  's.d = 0',
  's.π = NIL',
  'Q = ∅',
  'ENQUEUE(Q, s)',
  'while Q ≠ ∅',
  '    u = DEQUEUE(Q)',
  '    for each v ∈ G.Adj[u]',
  '        if v.color == WHITE',
  '            v.color = GRAY',
  '            v.d = u.d + 1',
  '            v.π = u',
  '            ENQUEUE(Q, v)',
  '    u.color = BLACK',
].join('\n')

export const BFS_MAX_VERTICES = 8
export const BFS_MAX_ENTRIES = 30

/**
 * Membaca adjacency-list dari teks "s: w, r; r: s, v; v: r". Tiap simpul dituliskan satu kali, urutan tetangga dipertahankan.
 * Nama simpul 1 sampai 2 huruf atau angka. Daftar boleh kosong ("v:").
 * @returns {{ ok: true, names: string[], adj: Record<string, string[]> } | { ok: false, error: string }}
 */
export function parseAdjacencyInput(text) {
  const parts = String(text ?? '')
    .split(';')
    .map((p) => p.trim())
    .filter((p) => p !== '')
  if (parts.length === 0) return { ok: false, error: 'Isian G tidak boleh kosong. Contoh: s: w, r; r: s, v; w: s; v: r' }
  if (parts.length > BFS_MAX_VERTICES) return { ok: false, error: `Maksimal ${BFS_MAX_VERTICES} simpul (Anda mengisi ${parts.length}).` }
  const adj = {}
  const names = []
  const raw = []
  for (const part of parts) {
    const k = part.indexOf(':')
    if (k < 0) return { ok: false, error: `Bagian "${part}" belum benar: tulis simpul, titik dua, lalu tetangganya, misalnya s: w, r.` }
    const name = part.slice(0, k).trim()
    if (!/^[A-Za-z0-9]{1,2}$/.test(name)) return { ok: false, error: `Nama simpul "${name}" harus 1 sampai 2 huruf atau angka.` }
    if (name in adj) return { ok: false, error: `Simpul ${name} ditulis lebih dari satu kali.` }
    const list = part.slice(k + 1).split(/[\s,]+/).filter((x) => x !== '')
    adj[name] = list
    names.push(name)
    raw.push([name, list])
  }
  let entries = 0
  for (const [name, list] of raw) {
    entries += list.length
    const seen = new Set()
    for (const v of list) {
      if (!(v in adj)) return { ok: false, error: `Tetangga "${v}" pada daftar simpul ${name} bukan simpul di G. Tulis dulu "${v}:" sebagai simpul sendiri.` }
      if (seen.has(v)) return { ok: false, error: `Simpul ${v} muncul dua kali pada daftar simpul ${name}.` }
      seen.add(v)
    }
  }
  if (entries > BFS_MAX_ENTRIES) return { ok: false, error: `Jumlah seluruh isi daftar tetangga maksimal ${BFS_MAX_ENTRIES} (Anda mengisi ${entries}).` }
  return { ok: true, names, adj }
}

/** Pesan kesalahan untuk isian G dan s, atau null bila sah. */
export function checkBfsInput({ G, s }) {
  const r = parseAdjacencyInput(G)
  if (!r.ok) return `Isian G: ${r.error}`
  if (!(s in r.adj)) return `Simpul awal ${s} tidak ada di G. Pilih salah satu dari: ${r.names.join(', ')}.`
  return null
}

const dash = '–'
const INF = '∞'

/**
 * Menjalankan BFS(G, s) satu langkah per pembacaan satu baris.
 *
 * Header perulangan while (baris 10) dicatat tiap putaran, termasuk pemeriksaan terakhir. Header for (baris 12) dicatat
 * untuk tiap tetangga, ditambah satu pemeriksaan terakhir saat tetangga habis. Baris 13 dicatat untuk tiap tetangga,
 * dan baris 14 sampai 17 hanya bila tetangganya WHITE.
 *
 * Perulangan inisialisasi (baris 1 sampai 4) ditampilkan ringkas: baris 1 satu langkah, lalu baris 2, 3, dan 4 masing-masing
 * satu langkah yang berlaku untuk semua simpul selain s sekaligus.
 *
 * Dengan R = banyak simpul terjangkau dari s dan D = jumlah panjang daftar tetangga semua simpul terjangkau,
 * banyaknya langkah adalah 6 + 8R + 2D (9 langkah awal, tiap putaran 4 + 2 per tetangga + 4 per simpul baru, dan 1 pemeriksaan akhir).
 *
 * @param {{ G: string, s: string }} input
 * @returns {import('../traces.js').TraceStep[]}
 */
export function bfsPseudoTrace({ G, s }) {
  const { names, adj } = parseAdjacencyInput(G) // validasi sudah dilakukan checkBfsInput
  const color = {}
  const d = {}
  const pi = {}
  /** @type {Record<string, boolean>} apakah atribut sudah diberi nilai oleh pseudocode */
  const set = { color: false, d: false, pi: false }
  const Q = []
  const out = [] // urutan simpul keluar dari Q
  let u = null
  let v = null
  let vIndex = -1
  const steps = []

  for (const x of names) {
    color[x] = null
    d[x] = null
    pi[x] = null
  }

  const fmtD = (x) => (d[x] === null ? '?' : d[x] === Infinity ? INF : String(d[x]))
  const qItems = () => Q.map((x) => `${x} (d = ${fmtD(x)})`)

  function push(line, note, { extra = [] } = {}) {
    const rows = names.map((x) => {
      const c = color[x]
      let mark = c === null ? 'empty' : c === 'WHITE' ? 'empty' : c === 'GRAY' ? 'gray' : 'black'
      if (x === v && line >= 12 && line <= 17) mark = 'source'
      if (x === u && line >= 11 && line <= 17) mark = 'current'
      const dText = d[x] === null ? '' : d[x] === Infinity ? INF : String(d[x])
      const piText = pi[x] === null && !set.pi ? '' : pi[x] === null ? 'NIL' : pi[x]
      return [
        { text: c ?? '', mark },
        { text: dText, mark },
        { text: piText, mark },
      ]
    })
    const lists = [
      { title: 'Antrean Q (depan ke belakang)', items: qItems(), empty: line >= 8 ? 'kosong' : 'belum dibuat' },
      { title: 'Urutan simpul keluar dari Q', items: [...out], empty: 'belum ada' },
    ]
    if (u !== null && line >= 12 && line <= 17) {
      lists.push({
        title: `Tetangga ${u} (G.Adj[${u}])`,
        items: adj[u].map((x, k) => `${x}${k === vIndex && line >= 12 && v !== null ? ' ← sedang diperiksa' : k < vIndex ? ' (sudah diperiksa)' : ''}`),
        empty: 'kosong',
      })
    }
    lists.push(...extra)
    steps.push({
      line,
      note,
      vars: [
        { name: 's', value: line >= 1 ? s : dash },
        { name: 'u', value: u !== null && line >= 11 ? u : dash },
        { name: 'v', value: v !== null && line >= 12 && line <= 17 ? v : dash },
        { name: 'u.d', value: u !== null && line >= 11 ? fmtD(u) : dash },
        { name: 'v.d', value: v !== null && line >= 14 && line <= 17 ? fmtD(v) : dash },
      ],
      tables: [
        {
          table: {
            caption: 'Atribut tiap simpul: warna, jarak d, dan induk π',
            corner: 'simpul',
            rowHeaders: names,
            colHeaders: ['color', 'd', 'π'],
            cells: rows,
          },
          labels: {
            empty: 'WHITE atau belum diberi nilai',
            gray: 'GRAY: sudah ditemukan, ada di Q',
            black: 'BLACK: selesai diproses',
            current: 'u: simpul yang baru keluar dari Q (warnanya masih GRAY sampai baris 18)',
            source: 'v: tetangga u yang sedang diperiksa',
          },
          legend: ['empty', 'gray', 'black', 'current', 'source'],
        },
      ],
      lists,
    })
  }

  const others = names.filter((x) => x !== s)
  push(1, `Baris 1: perulangan for berlaku untuk setiap simpul selain s = ${s}. Tabel akan memberi nilai awal ke ${others.length} simpul itu, dan baris 2, 3, dan 4 berikut masing-masing ditampilkan satu kali untuk semuanya.`)
  for (const x of others) color[x] = 'WHITE'
  set.color = true
  push(2, `Baris 2: u.color = WHITE untuk setiap simpul selain ${s}. Semuanya belum ditemukan.`)
  for (const x of others) d[x] = Infinity
  push(3, `Baris 3: u.d = ∞ untuk setiap simpul selain ${s}. Jaraknya belum diketahui.`)
  for (const x of others) pi[x] = null
  set.pi = true
  push(4, `Baris 4: u.π = NIL untuk setiap simpul selain ${s}. Belum ada induk.`)
  color[s] = 'GRAY'
  push(5, `Baris 5: ${s}.color = GRAY. Simpul awal sudah ditemukan, tetapi tetangganya belum diperiksa.`)
  d[s] = 0
  push(6, `Baris 6: ${s}.d = 0, karena jarak simpul awal ke dirinya sendiri nol busur.`)
  push(7, `Baris 7: ${s}.π = NIL, karena simpul awal tidak ditemukan dari simpul lain.`)
  push(8, 'Baris 8: Q = ∅. Antrean dibuat dan masih kosong.')
  Q.push(s)
  push(9, `Baris 9: ENQUEUE(Q, ${s}). Q sekarang berisi ${s}.`)

  while (true) {
    u = null
    v = null
    vIndex = -1
    if (Q.length === 0) {
      push(10, 'Baris 10: Q kosong, jadi perulangan while selesai dan prosedur BFS berakhir.')
      break
    }
    push(10, `Baris 10: Q masih berisi ${Q.length} simpul (${Q.join(', ')}), jadi langkah 11 sampai 18 dijalankan.`)
    u = Q.shift()
    out.push(u)
    push(11, `Baris 11: DEQUEUE(Q) mengeluarkan ${u}, simpul paling depan (FIFO). Jaraknya ${fmtD(u)}. Warnanya masih GRAY sampai baris 18.`)
    for (let k = 0; k < adj[u].length; k++) {
      vIndex = k
      v = adj[u][k]
      push(12, `Baris 12: v = ${v}, tetangga ke-${k + 1} dari ${adj[u].length} pada G.Adj[${u}].`)
      if (color[v] === 'WHITE') {
        push(13, `Baris 13: ${v}.color == WHITE bernilai TRUE, jadi baris 14 sampai 17 dijalankan.`)
        color[v] = 'GRAY'
        push(14, `Baris 14: ${v}.color = GRAY. Simpul ${v} baru ditemukan.`)
        d[v] = d[u] + 1
        push(15, `Baris 15: ${v}.d = ${u}.d + 1 = ${d[u]} + 1 = ${d[v]}.`)
        pi[v] = u
        push(16, `Baris 16: ${v}.π = ${u}. Simpul ${v} ditemukan lewat ${u}.`)
        Q.push(v)
        push(17, `Baris 17: ENQUEUE(Q, ${v}). ${v} masuk di belakang antrean, dan Q sekarang berisi ${Q.join(', ')}.`)
      } else {
        push(13, `Baris 13: ${v}.color == WHITE bernilai FALSE, karena ${v} berwarna ${color[v]}. Simpul ini dilewati dan perulangan kembali ke baris 12.`)
      }
    }
    v = null
    vIndex = adj[u].length
    push(12, adj[u].length === 0 ? `Baris 12: G.Adj[${u}] kosong, jadi tidak ada tetangga yang diperiksa. Lanjut ke baris 18.` : `Baris 12: semua tetangga ${u} sudah diperiksa, jadi perulangan for selesai dan lanjut ke baris 18.`)
    color[u] = 'BLACK'
    push(18, `Baris 18: ${u}.color = BLACK. Semua tetangga ${u} sudah diperiksa. Kembali ke baris 10.`)
  }

  // Ringkasan lintasan di langkah terakhir.
  const pathTo = (x) => (pi[x] === null ? [x] : [...pathTo(pi[x]), x])
  const summary = names
    .filter((x) => x !== s)
    .map((x) => (d[x] === Infinity ? `${x}: tidak terjangkau dari ${s} (d = ∞)` : `${x}: ${pathTo(x).join(' → ')} (d = ${d[x]})`))
  const last = steps.at(-1)
  last.lists.push({ title: `Lintasan dari ${s}`, items: summary, empty: 'tidak ada simpul lain' })
  last.note += ` Hasil: ${out.length} simpul terjangkau dari ${s}, dengan urutan keluar dari Q: ${out.join(', ')}.`
  return steps
}

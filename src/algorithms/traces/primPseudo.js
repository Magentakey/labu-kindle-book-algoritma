import { MST_MAX_EDGES, MST_MAX_VERTICES, MST_MAX_WEIGHT, NAME_RE, checkConnected, fmtKey } from './mstCommon.js'

// Pseudocode MST-PRIM(G, w, r) dari materi 12 (Cormen). Nomor baris sama dengan nomor langkah di materi.
// Harus sama persis dengan blok pseudocode Prim di mst.md (dijaga oleh tes).
export const primPseudoCode = [
  'for each u ∈ G.V',
  '    u.key = ∞',
  '    u.π = NIL',
  'r.key = 0',
  'Q = G.V',
  'while Q ≠ ∅',
  '    u = EXTRACT-MIN(Q)',
  '    for each v ∈ G.Adj[u]',
  '        if v ∈ Q and w(u, v) < v.key',
  '            v.π = u',
  '            v.key = w(u, v)',
].join('\n')

const ITEM_RE = /^([A-Za-z0-9]{1,2})\((\d{1,2})\)$/

/**
 * Membaca adjacency-list berbobot dari teks "a: b(4), h(8); b: a(4), c(8)".
 * Tiap simpul dituliskan satu kali, urutan penulisan simpul adalah urutan G.V (dan urutan Q), dan urutan tetangga dipertahankan.
 * Graf tak berarah: tiap sisi harus tercatat di kedua ujungnya dengan bobot sama.
 * @returns {{ ok: true, names: string[], adj: Record<string, Array<{ v: string, w: number }>> } | { ok: false, error: string }}
 */
export function parsePrimInput(text) {
  const parts = String(text ?? '').split(';').map((p) => p.trim()).filter((p) => p !== '')
  if (parts.length === 0) return { ok: false, error: 'Isian G tidak boleh kosong. Contoh: a: b(4), c(2); b: a(4); c: a(2)' }
  if (parts.length < 2) return { ok: false, error: 'Isian G minimal 2 simpul.' }
  if (parts.length > MST_MAX_VERTICES) return { ok: false, error: `Maksimal ${MST_MAX_VERTICES} simpul (Anda mengisi ${parts.length}).` }
  const adj = {}
  const names = []
  for (const part of parts) {
    const k = part.indexOf(':')
    if (k < 0) return { ok: false, error: `Bagian "${part}" belum benar: tulis simpul, titik dua, lalu tetangga dengan bobotnya, misalnya a: b(4), h(8).` }
    const name = part.slice(0, k).trim()
    if (!NAME_RE.test(name)) return { ok: false, error: `Nama simpul "${name}" harus 1 sampai 2 huruf atau angka.` }
    if (name in adj) return { ok: false, error: `Simpul ${name} ditulis lebih dari satu kali.` }
    const items = part.slice(k + 1).replace(/\s+\(/g, '(').split(/[\s,]+/).filter((x) => x !== '')
    const list = []
    for (const it of items) {
      const m = ITEM_RE.exec(it)
      if (!m) return { ok: false, error: `Tetangga "${it}" pada daftar simpul ${name} belum benar. Tulis simpul lalu bobot dalam kurung, misalnya b(4).` }
      list.push({ v: m[1], w: Number(m[2]) })
    }
    adj[name] = list
    names.push(name)
  }
  let entries = 0
  for (const name of names) {
    const seen = new Set()
    for (const { v, w } of adj[name]) {
      entries++
      if (!(v in adj)) return { ok: false, error: `Tetangga "${v}" pada daftar simpul ${name} bukan simpul di G. Tulis dulu "${v}:" sebagai simpul sendiri.` }
      if (v === name) return { ok: false, error: `Simpul ${name} menjadi tetangga dirinya sendiri. Pohon tidak boleh punya loop.` }
      if (seen.has(v)) return { ok: false, error: `Simpul ${v} muncul dua kali pada daftar simpul ${name}.` }
      seen.add(v)
      if (w > MST_MAX_WEIGHT) return { ok: false, error: `Bobot sisi (${name}, ${v}) harus antara 0 dan ${MST_MAX_WEIGHT}.` }
    }
  }
  if (entries > 2 * MST_MAX_EDGES) return { ok: false, error: `Jumlah seluruh isi daftar tetangga maksimal ${2 * MST_MAX_EDGES}, yaitu ${MST_MAX_EDGES} sisi yang masing-masing tercatat dua kali (Anda mengisi ${entries}).` }
  const pairs = []
  for (const u of names) {
    for (const { v, w } of adj[u]) {
      const back = adj[v].find((x) => x.v === u)
      if (!back) return { ok: false, error: `Sisi (${u}, ${v}) hanya tercatat di daftar ${u}. Graf tak berarah: tulis juga ${u}(${w}) pada daftar ${v}.` }
      if (back.w !== w) return { ok: false, error: `Bobot sisi (${u}, ${v}) berbeda: ${w} pada daftar ${u}, tetapi ${back.w} pada daftar ${v}. Keduanya harus sama.` }
      if (names.indexOf(u) < names.indexOf(v)) pairs.push([u, v])
    }
  }
  const lost = checkConnected(names, pairs)
  if (lost) return { ok: false, error: lost }
  return { ok: true, names, adj }
}

/** Pesan kesalahan untuk isian G dan r, atau null bila sah. */
export function checkPrimInput({ G, r }) {
  const p = parsePrimInput(G)
  if (!p.ok) return `Isian G: ${p.error}`
  if (!(r in p.adj)) return `Akar r = ${r} tidak ada di G. Pilih salah satu dari: ${p.names.join(', ')}.`
  return null
}

const dash = '–'

/**
 * Menjalankan MST-PRIM(G, w, r) satu langkah per pembacaan satu baris.
 *
 * Baris 1 sampai 3 (inisialisasi) ditampilkan ringkas: tiap baris satu langkah yang berlaku untuk semua simpul sekaligus.
 * Mulai baris 4, satu langkah sama dengan satu baris yang dibaca: baris 6 dibaca tiap putaran (ditambah satu pemeriksaan akhir
 * saat Q kosong), dan header for di baris 8 dicatat tiap tetangga (ditambah satu pemeriksaan akhir saat tetangga habis).
 * EXTRACT-MIN yang seri diputus menurut urutan Q, yaitu urutan penulisan simpul di G.
 *
 * Dengan n simpul, D = jumlah panjang semua daftar tetangga (2 kali banyak sisi), dan U = banyak pembaruan key (baris 10 dan 11),
 * banyaknya langkah selalu 6 + 3n + 2D + 2U.
 *
 * @param {{ G: string, r: string }} input
 * @returns {import('../traces.js').TraceStep[]}
 */
export function primPseudoTrace({ G, r }) {
  const { names, adj } = parsePrimInput(G) // validasi sudah dilakukan checkPrimInput
  const n = names.length
  const key = {}
  const pi = {}
  let keyShown = false
  let piShown = false
  /** Q berisi simpul yang belum di-extract. Null sebelum baris 5. */
  let inQ = null
  let u = null
  let v = null
  let vIndex = -1
  const steps = []

  for (const x of names) {
    key[x] = null
    pi[x] = null
  }

  const treeEdges = () => names.filter((x) => pi[x] !== null).map((x) => `(${pi[x]}, ${x}) = ${adj[x].find((a) => a.v === pi[x]).w}`)

  function push(line, note) {
    const examining = v !== null && line >= 8 && line <= 11
    const rows = names.map((x) => {
      let mark = inQ && !inQ.has(x) ? 'black' : 'empty'
      if (examining && x === v) mark = 'source'
      if (u !== null && x === u && line >= 7) mark = 'current'
      return [
        { text: keyShown ? fmtKey(key[x]) : '', mark },
        { text: piShown ? (pi[x] === null ? 'NIL' : pi[x]) : '', mark },
      ]
    })
    const lists = []
    if (inQ) {
      const q = names.filter((x) => inQ.has(x))
      lists.push({ title: 'Himpunan Q (urutan simpul, key dalam kurung)', items: q.map((x) => `${x} (${fmtKey(key[x])})`), empty: 'kosong (Q = ∅)' })
    }
    if (u !== null && line >= 8 && line <= 11) {
      lists.push({
        title: `Tetangga ${u} (G.Adj[${u}], bobot dalam kurung)`,
        items: adj[u].map((a, k) => `${a.v} (${a.w})${k === vIndex && v !== null ? ' ← sedang diperiksa' : k < vIndex || (k === vIndex && v === null) ? ' (sudah diperiksa)' : ''}`),
        empty: 'kosong',
      })
    }
    if (piShown) lists.push({ title: 'Sisi tebal (v.π, v) = bobot, saat ini', items: treeEdges(), empty: 'belum ada' })
    const wuv = examining ? adj[u].find((a) => a.v === v).w : null
    steps.push({
      line,
      note,
      vars: [
        { name: 'u', value: u !== null && line >= 7 ? u : dash },
        { name: 'v', value: examining ? v : dash },
        { name: 'u.key', value: u !== null && line >= 7 ? fmtKey(key[u]) : dash },
        { name: 'v.key', value: examining ? fmtKey(key[v]) : dash },
        { name: 'w(u, v)', value: examining ? String(wuv) : dash },
        { name: '|Q|', value: inQ ? String(inQ.size) : dash },
      ],
      tables: [
        {
          table: {
            caption: 'Atribut tiap simpul: key dan induk π',
            corner: 'simpul',
            rowHeaders: names,
            colHeaders: ['key', 'π'],
            cells: rows,
          },
          labels: {
            empty: 'masih di Q',
            black: 'sudah di-extract (keluar dari Q, abu-abu di gambar materi)',
            current: 'u: simpul yang baru di-extract',
            source: 'v: tetangga u yang sedang diperiksa',
          },
          legend: ['empty', 'black', 'current', 'source'],
        },
      ],
      lists,
    })
  }

  push(1, `Baris 1: perulangan for berlaku untuk setiap simpul u ∈ G.V (${n} simpul: ${names.join(', ')}, dalam urutan penulisan G). Baris 2 dan 3 ditampilkan satu kali untuk semua simpul sekaligus.`)
  for (const x of names) key[x] = Infinity
  keyShown = true
  push(2, 'Baris 2: u.key = ∞ untuk semua simpul. Belum ada simpul yang terjangkau dari pohon.')
  for (const x of names) pi[x] = null
  piShown = true
  push(3, 'Baris 3: u.π = NIL untuk semua simpul. Belum ada induk.')
  key[r] = 0
  push(4, `Baris 4: ${r}.key = 0. Akar ${r} satu-satunya simpul dengan key bukan ∞, jadi ia yang pertama di-extract.`)
  inQ = new Set(names)
  push(5, `Baris 5: Q = G.V = {${names.join(', ')}}. Semua ${n} simpul ada di Q.`)

  let round = 0
  while (inQ.size > 0) {
    round++
    u = null
    v = null
    vIndex = -1
    push(6, `Baris 6: Q ≠ ∅ bernilai TRUE (|Q| = ${inQ.size}), jadi putaran ke-${round} dari ${n} dijalankan.`)
    const min = Math.min(...names.filter((x) => inQ.has(x)).map((x) => key[x]))
    const cand = names.filter((x) => inQ.has(x) && key[x] === min)
    u = cand[0]
    inQ.delete(u)
    const tie = cand.length > 1 ? ` Simpul ${cand.join(' dan ')} sama-sama bernilai ${fmtKey(min)}; yang dikeluarkan adalah ${u} karena lebih dulu dalam urutan Q.` : ''
    const rest = names.filter((x) => inQ.has(x))
    push(7, `Baris 7: u = EXTRACT-MIN(Q) = ${u}, simpul di Q dengan key terkecil, yaitu ${u}.key = ${fmtKey(min)}.${tie} Sekarang Q = ${rest.length ? `{${rest.join(', ')}}` : '∅'}.`)
    const list = adj[u]
    for (let k = 0; k < list.length; k++) {
      const { v: nv, w } = list[k]
      v = nv
      vIndex = k
      push(8, `Baris 8: v = ${v}, tetangga ke-${k + 1} dari ${list.length} pada G.Adj[${u}], dengan w(${u}, ${v}) = ${w}.`)
      if (inQ.has(v) && w < key[v]) {
        const old = key[v]
        push(9, `Baris 9: ${v} ∈ Q bernilai TRUE, dan w(${u}, ${v}) = ${w} < ${v}.key = ${fmtKey(old)} bernilai TRUE, jadi baris 10 dan 11 dijalankan.`)
        const oldPi = pi[v]
        pi[v] = u
        push(10, `Baris 10: ${v}.π = ${u}. Sisi (${u}, ${v}) menjadi sisi tebal${oldPi ? `, menggantikan sisi (${oldPi}, ${v}) yang tebal sebelumnya` : ''}.`)
        key[v] = w
        push(11, `Baris 11: ${v}.key = w(${u}, ${v}) = ${w} (sebelumnya ${fmtKey(old)}).`)
      } else {
        const why = !inQ.has(v)
          ? `${v} ∈ Q bernilai FALSE karena ${v} sudah di-extract`
          : `${v} ∈ Q bernilai TRUE, tetapi w(${u}, ${v}) = ${w} tidak kurang dari ${v}.key = ${fmtKey(key[v])}, jadi kondisi bernilai FALSE`
        push(9, `Baris 9: ${why}. Tidak ada perubahan, perulangan kembali ke baris 8.`)
      }
    }
    v = null
    vIndex = list.length
    push(8, list.length === 0 ? `Baris 8: G.Adj[${u}] kosong, jadi tidak ada tetangga yang diperiksa. Kembali ke baris 6.` : `Baris 8: semua tetangga ${u} sudah diperiksa, jadi perulangan for selesai (end for) dan kembali ke baris 6.`)
  }
  u = null
  v = null
  push(6, 'Baris 6: Q ≠ ∅ bernilai FALSE, karena Q = ∅. Perulangan while selesai (end while) dan algoritma Prim selesai dijalankan.')

  const total = names.reduce((s, x) => s + key[x], 0)
  const last = steps.at(-1)
  last.lists.push({ title: 'Pohon rentang minimum: sisi (π, simpul) = bobot', items: treeEdges(), empty: 'tidak ada' })
  last.note += ` Hasil: ${n - 1} sisi pohon dengan total bobot ${total}, yaitu jumlah key semua simpul (${names.map((x) => key[x]).join(' + ')}).`
  return steps
}

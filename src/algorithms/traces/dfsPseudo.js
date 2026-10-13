import { parseAdjacencyInput } from './bfsPseudo.js'

// Pseudocode DFS(G) dan DFS-VISIT(G, u) dari materi 11.2 (Cormen), digabung dalam SATU blok kode.
// Baris 1 sampai 7 adalah DFS(G). Baris 8 sampai 17 adalah DFS-VISIT(G, u), yang di materi bernomor 1 sampai 10
// (nomor di peraga = nomor di materi + DFS_VISIT_OFFSET). Harus sama persis dengan dua blok pseudocode di graph-dfs.md (dijaga oleh tes).
export const dfsPseudoCode = [
  'for each vertex u ∈ G.V',
  '    u.color = WHITE',
  '    u.π = NIL',
  'time = 0',
  'for each vertex u ∈ G.V',
  '    if u.color == WHITE',
  '        DFS-VISIT(G, u)',
  'time = time + 1',
  'u.d = time',
  'u.color = GRAY',
  'for each v ∈ G.Adj[u]',
  '    if v.color == WHITE',
  '        v.π = u',
  '        DFS-VISIT(G, v)',
  'u.color = BLACK',
  'time = time + 1',
  'u.f = time',
].join('\n')

/** Baris DFS-VISIT di peraga = baris DFS-VISIT di materi + 7. */
export const DFS_VISIT_OFFSET = 7

/** Pesan kesalahan untuk isian G, atau null bila sah. Urutan penulisan simpul adalah urutan G.V. */
export function checkDfsInput({ G }) {
  const r = parseAdjacencyInput(G)
  return r.ok ? null : `Isian G: ${r.error}`
}

const dash = '–'

const KIND = { tree: 'tree', B: 'B (back)', F: 'F (forward)', C: 'C (cross)' }

/**
 * Menjalankan DFS(G) satu langkah per pembacaan satu baris.
 *
 * Perulangan inisialisasi (baris 1 sampai 3) ditampilkan ringkas: tiap baris satu langkah yang berlaku untuk semua simpul sekaligus.
 * Header perulangan for di baris 5 dicatat tiap simpul (ditambah satu pemeriksaan akhir), dan header for di baris 11 dicatat
 * tiap tetangga (ditambah satu pemeriksaan akhir saat tetangga habis).
 *
 * Dengan n simpul, D = jumlah panjang semua daftar tetangga, dan R = banyak akar pohon (pemanggilan dari baris 7),
 * banyaknya langkah selalu 5 + 11n + 2D − R. Setiap simpul dikunjungi tepat satu kali, jadi tiap simpul menaikkan time dua kali.
 *
 * @param {{ G: string }} input
 * @returns {import('../traces.js').TraceStep[]}
 */
export function dfsPseudoTrace({ G }) {
  const { names, adj } = parseAdjacencyInput(G) // validasi sudah dilakukan checkDfsInput
  const n = names.length
  const color = {}
  const d = {}
  const f = {}
  const pi = {}
  const set = { pi: false }
  let time = null
  /** Tumpukan pemanggilan DFS-VISIT: tiap bingkai punya u, tetangga v yang sedang diperiksa, dan posisinya. */
  const frames = []
  let loopU = null // simpul u milik DFS(G) di baris 5 sampai 7
  let calls = 0
  const roots = []
  const edges = []
  const finished = []
  const steps = []
  let returnedFrom = null // pemanggilan yang baru saja selesai, dipakai untuk catatan "backtrack"

  for (const x of names) {
    color[x] = null
    d[x] = null
    f[x] = null
    pi[x] = null
  }

  const num = (x) => (x === null ? '' : String(x))

  function push(line, note) {
    const inVisit = frames.length > 0
    const top = frames.at(-1)
    const u = inVisit ? top.u : loopU
    const v = inVisit ? top.v : null
    const showV = v !== null && line >= 11 && line <= 14
    const rows = names.map((x) => {
      const c = color[x]
      let mark = c === 'GRAY' ? 'gray' : c === 'BLACK' ? 'black' : 'empty'
      if (showV && x === v) mark = 'source'
      const current = u !== null && x === u && ((!inVisit && line >= 5 && line <= 7) || (inVisit && line >= 8 && line <= 14))
      if (current) mark = 'current'
      const piText = pi[x] === null && !set.pi ? '' : pi[x] === null ? 'NIL' : pi[x]
      return [
        { text: c ?? '', mark },
        { text: num(d[x]), mark },
        { text: num(f[x]), mark },
        { text: piText, mark },
      ]
    })
    const lists = []
    if (inVisit && line >= 11 && line <= 14) {
      lists.push({
        title: `Tetangga ${u} (G.Adj[${u}])`,
        items: adj[u].map((x, k) => `${x}${k === top.vIndex && showV ? ' ← sedang diperiksa' : k < top.vIndex || (k === top.vIndex && !showV) ? ' (sudah diperiksa)' : ''}`),
        empty: 'kosong',
      })
    }
    lists.push({ title: 'Busur yang sudah diperiksa di baris 12', items: [...edges], empty: 'belum ada' })
    lists.push({ title: 'Urutan simpul selesai (u.f naik)', items: [...finished], empty: 'belum ada' })
    steps.push({
      line,
      note,
      vars: [
        { name: 'time', value: time === null ? dash : String(time) },
        { name: 'u', value: u !== null && line >= 5 ? u : dash },
        { name: 'v', value: showV ? v : dash },
        { name: 'u.d', value: u !== null && d[u] !== null ? String(d[u]) : dash },
        { name: 'u.f', value: u !== null && f[u] !== null ? String(f[u]) : dash },
        { name: 'v.color', value: showV && line >= 12 ? color[v] : dash },
      ],
      stack: ['DFS(G)', ...frames.map((fr) => `DFS-VISIT(G, ${fr.u})`)],
      tables: [
        {
          table: {
            caption: 'Atribut tiap simpul: warna, d, f, dan induk π',
            corner: 'simpul',
            rowHeaders: names,
            colHeaders: ['color', 'd', 'f', 'π'],
            cells: rows,
          },
          labels: {
            empty: 'WHITE atau belum diberi nilai',
            gray: 'GRAY: sudah ditemukan, penelusurannya belum selesai (ada di tumpukan)',
            black: 'BLACK: selesai, u.f sudah diberi nilai',
            current: 'u: simpul yang sedang diproses',
            source: 'v: tetangga u yang sedang diperiksa',
          },
          legend: ['empty', 'gray', 'black', 'current', 'source'],
        },
      ],
      lists,
    })
  }

  function visit(u) {
    calls++
    const callNo = calls
    const depth = frames.length + 1
    const frame = { u, v: null, vIndex: -1 }
    frames.push(frame)
    const tag = (line) => `Baris ${line} (DFS-VISIT baris ${line - DFS_VISIT_OFFSET}, panggilan ke-${callNo}, kedalaman ${depth})`

    time += 1
    push(8, `${tag(8)}: time = time + 1 = ${time}. Simpul ${u}, yang masih WHITE, baru saja ditemukan.`)
    d[u] = time
    push(9, `${tag(9)}: ${u}.d = time = ${time}. Itulah discovery time ${u}.`)
    color[u] = 'GRAY'
    push(10, `${tag(10)}: ${u}.color = GRAY. Simpul ${u} sudah ditemukan, tetapi penelusuran darinya belum selesai.`)

    for (let k = 0; k < adj[u].length; k++) {
      const v = adj[u][k]
      frame.vIndex = k
      frame.v = v
      const back = returnedFrom ? `Pemanggilan DFS-VISIT(G, ${returnedFrom}) sudah selesai (backtrack), jadi ${u} melanjutkan perulangan. ` : ''
      returnedFrom = null
      push(11, `${tag(11)}: ${back}v = ${v}, tetangga ke-${k + 1} dari ${adj[u].length} pada G.Adj[${u}]. Busur (${u}, ${v}) dijelajahi.`)
      const c = color[v]
      if (c === 'WHITE') {
        edges.push(`(${u}, ${v}): ${KIND.tree}`)
        push(12, `${tag(12)}: ${v}.color == WHITE bernilai TRUE, jadi busur (${u}, ${v}) adalah busur tree (bagian dari pohon) dan baris 13 dan 14 dijalankan.`)
        pi[v] = u
        push(13, `${tag(13)}: ${v}.π = ${u}. Induk ${v} adalah ${u}.`)
        push(14, `${tag(14)}: memanggil DFS-VISIT(G, ${v}) secara rekursif. Tumpukan bertambah satu, dan ${u} menunggu sampai ${v} selesai.`)
        visit(v)
        returnedFrom = v
        frame.v = v
      } else {
        const kind = c === 'GRAY' ? 'B' : d[u] < d[v] ? 'F' : 'C'
        edges.push(`(${u}, ${v}): ${KIND[kind]}`)
        const reason =
          c === 'GRAY'
            ? `${v} berwarna GRAY (masih diproses${v === u ? ', yaitu ' + u + ' sendiri' : ', leluhur ' + u}), jadi busur (${u}, ${v}) adalah busur B (back)`
            : d[u] < d[v]
              ? `${v} berwarna BLACK dan ${u}.d = ${d[u]} < ${v}.d = ${d[v]} (${v} keturunan ${u} yang sudah selesai), jadi busur (${u}, ${v}) adalah busur F (forward)`
              : `${v} berwarna BLACK dan ${u}.d = ${d[u]} > ${v}.d = ${d[v]} (${v} bukan keturunan ${u}), jadi busur (${u}, ${v}) adalah busur C (cross)`
        push(12, `${tag(12)}: ${v}.color == WHITE bernilai FALSE, karena ${reason}. Tidak ada pemanggilan, perulangan kembali ke baris 11.`)
      }
    }
    frame.v = null
    frame.vIndex = adj[u].length
    const back = returnedFrom ? `Pemanggilan DFS-VISIT(G, ${returnedFrom}) sudah selesai (backtrack). ` : ''
    returnedFrom = null
    push(
      11,
      adj[u].length === 0
        ? `${tag(11)}: G.Adj[${u}] kosong, jadi tidak ada busur yang dijelajahi. Lanjut ke baris 15.`
        : `${tag(11)}: ${back}semua tetangga ${u} sudah dijelajahi, jadi perulangan for selesai (end for) dan lanjut ke baris 15.`,
    )
    color[u] = 'BLACK'
    push(15, `${tag(15)}: ${u}.color = BLACK. Tidak ada lagi simpul yang bisa ditelusuri dari ${u}.`)
    time += 1
    push(16, `${tag(16)}: time = time + 1 = ${time}.`)
    f[u] = time
    finished.push(`${u} (f = ${time})`)
    const target = frames.length > 1 ? `baris 14 milik DFS-VISIT(G, ${frames.at(-2).u})` : 'baris 7 milik DFS(G)'
    push(17, `${tag(17)}: ${u}.f = time = ${time}. Itulah finishing time ${u}. Pemanggilan ini selesai dan keluar dari tumpukan, kembali ke ${target}.`)
    frames.pop()
  }

  push(1, `Baris 1: perulangan for berlaku untuk setiap simpul u ∈ G.V (${n} simpul: ${names.join(', ')}, dalam urutan penulisan G). Tabel akan diberi nilai awal, dan baris 2 dan 3 ditampilkan satu kali untuk semua simpul sekaligus.`)
  for (const x of names) color[x] = 'WHITE'
  push(2, 'Baris 2: u.color = WHITE untuk semua simpul. Belum ada yang ditemukan.')
  for (const x of names) pi[x] = null
  set.pi = true
  push(3, 'Baris 3: u.π = NIL untuk semua simpul. Belum ada induk.')
  time = 0
  push(4, 'Baris 4: time = 0. Penghitung waktu ini dipakai bersama oleh semua pemanggilan DFS-VISIT.')

  let afterTree = ''
  for (let i = 0; i < n; i++) {
    loopU = names[i]
    const u = loopU
    push(5, `Baris 5: ${afterTree}putaran ke-${i + 1} dari ${n} pada DFS(G), u = ${u}.`)
    afterTree = ''
    if (color[u] === 'WHITE') {
      push(6, `Baris 6: ${u}.color == WHITE bernilai TRUE, jadi baris 7 dijalankan.`)
      roots.push(u)
      push(7, `Baris 7: memanggil DFS-VISIT(G, ${u}). Simpul ${u} menjadi akar pohon ke-${roots.length} pada DFS-forest.`)
      visit(u)
      afterTree = `DFS-VISIT(G, ${u}) sudah selesai, jadi satu pohon selesai dibentuk. `
    } else {
      push(6, `Baris 6: ${u}.color == WHITE bernilai FALSE, karena ${u} berwarna ${color[u]} (sudah masuk pohon sebelumnya). Tidak ada pemanggilan, perulangan kembali ke baris 5.`)
    }
  }
  loopU = null
  push(5, `Baris 5: ${afterTree}semua ${n} simpul sudah diperiksa, jadi perulangan for selesai dan DFS(G) berakhir.`)

  // Ringkasan DFS-forest di langkah terakhir: akar(anak, anak, ...) menurut urutan ditemukan.
  const kids = Object.fromEntries(names.map((x) => [x, []]))
  for (const x of [...names].sort((a, b) => d[a] - d[b])) if (pi[x] !== null) kids[pi[x]].push(x)
  const tree = (x) => x + (kids[x].length ? `(${kids[x].map(tree).join(', ')})` : '')
  const last = steps.at(-1)
  last.lists.push({ title: 'DFS-forest: akar(anak, anak, ...)', items: roots.map((r, i) => `Pohon ke-${i + 1}: ${tree(r)}`), empty: 'tidak ada pohon' })
  last.note += ` Hasil: ${roots.length} pohon dengan akar ${roots.join(', ')}, dan time akhir = ${time} = 2|V| (2 × ${n}).`
  return steps
}

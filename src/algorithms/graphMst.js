import { adjacencyPanel, buildAdj, edgeName, fmtDist, makeView } from './graphCommon.js'

// Nomor baris dipakai oleh steps di bawah. Jalankan `npm test` bila baris diubah.
export const primCode = `function prim(n, edges, start) {
  const adj = Array.from({ length: n }, () => [])
  for (const [u, v, w] of edges) {
    adj[u].push([v, w])
    adj[v].push([u, w])
  }
  const masuk = Array(n).fill(false)
  const kunci = Array(n).fill(Infinity)
  const induk = Array(n).fill(-1)
  kunci[start] = 0
  let total = 0
  for (let k = 0; k < n; k++) {
    let u = -1
    for (let i = 0; i < n; i++) {
      if (!masuk[i] && (u === -1 || kunci[i] < kunci[u])) u = i
    }
    masuk[u] = true
    total += kunci[u]
    for (const [v, w] of adj[u]) {
      if (!masuk[v] && w < kunci[v]) {
        kunci[v] = w
        induk[v] = u
      }
    }
  }
  return total
}`

export const kruskalCode = `function kruskal(n, edges) {
  const induk = Array.from({ length: n }, (_, i) => i)
  const cari = (x) => (induk[x] === x ? x : (induk[x] = cari(induk[x])))
  const urut = [...edges].sort((p, q) => p[2] - q[2])
  const pohon = []
  let total = 0
  for (const [u, v, w] of urut) {
    const a = cari(u)
    const b = cari(v)
    if (a !== b) {
      induk[a] = b
      pohon.push([u, v, w])
      total += w
    }
  }
  return total
}`

const KIND = { directed: false, weighted: true }
const edgeText = (edges, e) => `${edgeName(edges[e], false)} (${edges[e][2]})`

const PRIM_LABELS = {
  normal: 'belum tersentuh (k = kunci = ∞)',
  queued: 'kandidat: kuncinya terbatas, belum di pohon',
  current: 'sedang diproses (baru masuk pohon)',
  visited: 'sudah di pohon',
}
const PRIM_EDGE_LABELS = {
  normal: 'belum jadi kandidat',
  considered: 'sisi kandidat termurah ke simpul di luar pohon',
  chosen: 'sisi pohon rentang minimum',
  rejected: 'dilewati: kedua ujungnya sudah di pohon (akan membentuk siklus)',
}
const KRUSKAL_LABELS = {
  normal: 'masih sendirian (komponen berisi satu simpul)',
  current: 'ujung sisi yang sedang diperiksa',
  visited: 'sudah tergabung dengan simpul lain; [x] = wakil komponen',
}
const KRUSKAL_EDGE_LABELS = {
  normal: 'belum diperiksa',
  considered: 'sedang diperiksa',
  chosen: 'sisi pohon rentang minimum',
  rejected: 'ditolak: kedua ujungnya sudah satu komponen (akan membentuk siklus)',
}

/**
 * Menjalankan algoritma Prim dan merekam tiap langkah. Graf harus terhubung.
 * @param {import('./graphCommon.js').GraphInput} input
 * @returns {import('./graphCommon.js').GraphStep[]}
 */
export function primSteps({ n, edges, start }) {
  const adj = buildAdj(n, edges, false)
  const inTree = Array(n).fill(false)
  const key = Array(n).fill(Infinity)
  const parent = Array(n).fill(-1)
  const via = Array(n).fill(-1) // nomor sisi kandidat terbaik menuju tiap simpul
  const edgeMark = edges.map(() => 'normal')
  const treeEdges = []
  let total = 0
  let cur = null
  key[start] = 0
  /** @type {import('./graphCommon.js').GraphStep[]} */
  const steps = []

  const marks = () => Array.from({ length: n }, (_, i) => (i === cur ? 'current' : inTree[i] ? 'visited' : key[i] !== Infinity ? 'queued' : 'normal'))

  const push = (line, note) => {
    const panels = [
      { type: 'list', title: 'Variabel', items: [`u = ${cur === null ? '–' : cur}`, `total = ${total}`], empty: '' },
      {
        type: 'table',
        caption: 'kunci = bobot sisi termurah dari pohon ke simpul itu',
        headers: ['Simpul', 'kunci', 'induk', 'Status'],
        rows: Array.from({ length: n }, (_, i) => [
          String(i),
          fmtDist(key[i]),
          parent[i] === -1 ? '–' : String(parent[i]),
          inTree[i] ? 'di pohon' : key[i] !== Infinity ? 'kandidat' : 'belum tersentuh',
        ]),
        activeRow: cur === null ? -1 : cur,
      },
      { type: 'list', title: 'Sisi pohon terpilih (bobot)', items: treeEdges.map((e) => edgeText(edges, e)), empty: 'belum ada' },
      adjacencyPanel(adj, cur === null ? -1 : cur, true),
    ]
    steps.push({
      line,
      note,
      view: makeView({ n, edges, ...KIND }, { nodeMark: marks(), nodeSub: key.map((k) => `k=${fmtDist(k)}`), edgeMark, panels, labels: PRIM_LABELS, edgeLabels: PRIM_EDGE_LABELS }),
    })
  }

  push(
    1,
    `Graf tak berarah yang terhubung dengan ${n} simpul dan ${edges.length} sisi. Prim membangun pohon rentang minimum dari simpul ${start}: ` +
      'pohon dibesarkan satu simpul demi satu, dan tiap kali dipilih sisi termurah yang menghubungkan pohon dengan simpul di luarnya.',
  )
  push([2, 3, 4, 5, 6], 'Bangun daftar tetangga. Tiap sisi dicatat dua arah, lengkap dengan bobotnya.')
  push([7, 8, 9, 10, 11], `Belum ada simpul di pohon. kunci semua ∞ (belum ada sisi yang menjangkaunya), kecuali kunci[${start}] = 0 supaya simpul awal dipilih pertama. total = 0.`)

  for (let k = 0; k < n; k++) {
    let u = -1
    for (let i = 0; i < n; i++) if (!inTree[i] && (u === -1 || key[i] < key[u])) u = i
    cur = u
    const tie = Array.from({ length: n }, (_, i) => i).filter((i) => !inTree[i] && key[i] === key[u] && i !== u)
    push(
      [13, 14, 15, 16],
      `Putaran ${k + 1}: dari simpul di luar pohon, pilih yang kuncinya terkecil, yaitu u = ${u} (kunci = ${key[u]}).` +
        (via[u] === -1 ? '' : ` Sisi ${edgeName(edges[via[u]], false)} adalah sisi termurah yang menghubungkan ${u} ke pohon.`) +
        (tie.length > 0 ? ` Kunci ${tie.join(', ')} sama besar, tetapi ${u} bernomor lebih kecil sehingga dipilih lebih dulu.` : ''),
    )

    inTree[u] = true
    total += key[u]
    let dropped = 0
    for (const { v, e } of adj[u]) {
      if (inTree[v] && e !== via[u]) {
        edgeMark[e] = 'rejected'
        dropped++
      }
    }
    if (via[u] !== -1) {
      edgeMark[via[u]] = 'chosen'
      treeEdges.push(via[u])
    }
    push(
      [17, 18],
      `Masukkan ${u} ke pohon, lalu total += ${key[u]} sehingga total = ${total}.` +
        (via[u] === -1 ? ' Simpul awal masuk tanpa sisi.' : ` Sisi ${edgeName(edges[via[u]], false)} resmi menjadi sisi pohon.`) +
        (dropped > 0 ? ` ${dropped} sisi lain dari ${u} ke simpul yang sudah di pohon dilewati, karena akan membentuk siklus.` : ''),
    )

    for (const { v, w, e } of adj[u]) {
      const before = edgeMark[e]
      if (inTree[v]) {
        edgeMark[e] = 'considered'
        push([19, 20], `Tetangga v = ${v} (bobot ${w}): ${v} sudah di pohon, jadi dilewati.`)
        edgeMark[e] = before
      } else if (w < key[v]) {
        const old = via[v]
        if (old !== -1) edgeMark[old] = 'normal'
        const oldKey = key[v]
        key[v] = w
        parent[v] = u
        via[v] = e
        edgeMark[e] = 'considered'
        push(
          [19, 20, 21, 22],
          `Tetangga v = ${v} (bobot ${w}): ${v} di luar pohon dan ${w} < kunci[${v}] = ${fmtDist(oldKey)}, jadi kunci[${v}] = ${w} dan induk[${v}] = ${u}. ` +
            (old === -1 ? `Sisi ${edgeName(edges[e], false)} menjadi kandidat untuk ${v}.` : `Sisi ${edgeName(edges[e], false)} menggantikan kandidat lama yang lebih mahal.`),
        )
      } else {
        edgeMark[e] = 'considered'
        push([19, 20], `Tetangga v = ${v} (bobot ${w}): ${w} < kunci[${v}] = ${fmtDist(key[v])}? Tidak, jadi kandidat lama untuk ${v} tetap dipakai.`)
        edgeMark[e] = before
      }
    }
  }

  cur = null
  push(
    26,
    `Semua ${n} simpul sudah di pohon. Total bobot pohon rentang minimum = ${total}, dari ${treeEdges.length} sisi: ${treeEdges.map((e) => edgeText(edges, e)).join(', ') || 'tidak ada'}.`,
  )
  return steps
}

/**
 * Menjalankan algoritma Kruskal dan merekam tiap langkah. Graf harus terhubung.
 * @param {import('./graphCommon.js').GraphInput} input
 * @returns {import('./graphCommon.js').GraphStep[]}
 */
export function kruskalSteps({ n, edges }) {
  const induk = Array.from({ length: n }, (_, i) => i)
  const find = (x) => (induk[x] === x ? x : (induk[x] = find(induk[x])))
  const rootOf = (x) => {
    while (induk[x] !== x) x = induk[x]
    return x
  }
  const order = edges.map((_, i) => i).sort((a, b) => edges[a][2] - edges[b][2]) // sort JavaScript stabil: bobot sama tetap urut masukan
  const decision = edges.map(() => '–')
  const edgeMark = edges.map(() => 'normal')
  const treeEdges = []
  let total = 0
  let cur = null
  let ra = null
  let rb = null
  /** @type {import('./graphCommon.js').GraphStep[]} */
  const steps = []

  const push = (line, note) => {
    const roots = Array.from({ length: n }, (_, i) => rootOf(i))
    const size = roots.map((r) => roots.filter((x) => x === r).length)
    const ends = cur === null ? [] : [edges[cur][0], edges[cur][1]]
    const comps = [...new Set(roots)].map((r) => `[${r}] = {${roots.map((x, i) => (x === r ? i : -1)).filter((i) => i >= 0).join(', ')}}`)
    const panels = [
      { type: 'list', title: 'Variabel', items: [`a = ${ra ?? '–'}`, `b = ${rb ?? '–'}`, `total = ${total}`], empty: '' },
      { type: 'list', title: 'Komponen (wakil = anggota)', items: comps, empty: '' },
      { type: 'list', title: 'pohon (sisi terpilih)', items: treeEdges.map((e) => edgeText(edges, e)), empty: 'belum ada' },
      {
        type: 'table',
        caption: 'Sisi menurut urutan bobot',
        headers: ['Sisi', 'Bobot', 'Keputusan'],
        rows: order.map((e) => [edgeName(edges[e], false), String(edges[e][2]), decision[e]]),
        activeRow: cur === null ? -1 : order.indexOf(cur),
      },
    ]
    steps.push({
      line,
      note,
      view: makeView(
        { n, edges, ...KIND },
        {
          nodeMark: roots.map((_, i) => (ends.includes(i) ? 'current' : size[i] > 1 ? 'visited' : 'normal')),
          nodeSub: roots.map((r) => `[${r}]`),
          edgeMark,
          panels,
          labels: KRUSKAL_LABELS,
          edgeLabels: KRUSKAL_EDGE_LABELS,
        },
      ),
    })
  }

  push(
    1,
    `Graf tak berarah yang terhubung dengan ${n} simpul dan ${edges.length} sisi. Kruskal memeriksa sisi dari yang paling ringan, ` +
      'dan mengambil sisi itu bila kedua ujungnya masih berada di komponen yang berbeda (tidak membentuk siklus).',
  )
  push([2, 3], 'Awalnya tiap simpul adalah komponen sendiri: induk[i] = i. Fungsi cari(x) mengembalikan wakil komponen tempat x berada. Wakilnya tampil di bawah simpul sebagai [wakil].')
  push(4, `Urutkan sisi menurut bobot, dari yang paling ringan: ${order.map((e) => edgeText(edges, e)).join(', ')}. Bila bobotnya sama, urutan masukan dipertahankan.`)
  push([5, 6], 'pohon dimulai kosong dan total = 0.')

  for (const e of order) {
    const [u, v, w] = edges[e]
    cur = e
    edgeMark[e] = 'considered'
    ra = find(u)
    rb = find(v)
    push([7, 8, 9], `Sisi ${edgeName(edges[e], false)} (bobot ${w}). cari(${u}) = ${ra} dan cari(${v}) = ${rb}.`)
    if (ra !== rb) {
      induk[ra] = rb
      decision[e] = 'dipilih'
      edgeMark[e] = 'chosen'
      treeEdges.push(e)
      total += w
      push(
        [10, 11, 12, 13],
        `${ra} ≠ ${rb}: ujung sisinya berada di komponen berbeda, jadi aman diambil. Gabungkan komponen (induk[${ra}] = ${rb}), masukkan sisi ke pohon, dan total += ${w} sehingga total = ${total}.`,
      )
    } else {
      decision[e] = 'ditolak (siklus)'
      edgeMark[e] = 'rejected'
      push(10, `${ra} = ${rb}: ${u} dan ${v} sudah satu komponen, jadi sisi ini akan membentuk siklus. Sisi dilewati.`)
    }
  }

  cur = null
  ra = null
  rb = null
  push(
    16,
    `Semua sisi sudah diperiksa. Total bobot pohon rentang minimum = ${total}, dari ${treeEdges.length} sisi: ${treeEdges.map((e) => edgeText(edges, e)).join(', ') || 'tidak ada'}. ` +
      'Karena grafnya terhubung, pohonnya mencakup semua simpul (n − 1 sisi).',
  )
  return steps
}

import { adjacencyPanel, buildAdj, makeView } from './graphCommon.js'

// Nomor baris dipakai oleh steps di bawah. Jalankan `npm test` bila baris diubah.
// Kode ini sama dengan solusi soal challenge BFS dan DFS (dan dieksekusi apa adanya di tes).
export const bfsGraphCode = `function bfs(n, edges, start) {
  const adj = Array.from({ length: n }, () => [])
  for (const [u, v] of edges) {
    adj[u].push(v)
    adj[v].push(u)
  }
  adj.forEach((a) => a.sort((p, q) => p - q))
  const dikunjungi = Array(n).fill(false)
  const antrean = [start]
  dikunjungi[start] = true
  const urutan = []
  while (antrean.length > 0) {
    const u = antrean.shift()
    urutan.push(u)
    for (const v of adj[u]) {
      if (!dikunjungi[v]) {
        dikunjungi[v] = true
        antrean.push(v)
      }
    }
  }
  return urutan
}`

export const dfsGraphCode = `function dfs(n, edges, start) {
  const adj = Array.from({ length: n }, () => [])
  for (const [u, v] of edges) {
    adj[u].push(v)
    adj[v].push(u)
  }
  adj.forEach((a) => a.sort((p, q) => p - q))
  const dikunjungi = Array(n).fill(false)
  const urutan = []
  function kunjungi(u) {
    dikunjungi[u] = true
    urutan.push(u)
    for (const v of adj[u]) {
      if (!dikunjungi[v]) kunjungi(v)
    }
  }
  kunjungi(start)
  return urutan
}`

const KIND = { directed: false, weighted: false }

const BFS_LABELS = {
  normal: 'belum ditemukan',
  queued: 'sudah ditemukan, menunggu di antrean',
  current: 'sedang diproses (baru keluar dari antrean)',
  visited: 'selesai diproses (semua tetangganya sudah diperiksa)',
}
const BFS_EDGE_LABELS = {
  normal: 'belum diperiksa',
  considered: 'sedang diperiksa',
  chosen: 'sisi pohon BFS (menemukan simpul baru)',
  rejected: 'bukan sisi pohon (ujungnya sudah ditemukan)',
}
const DFS_LABELS = {
  normal: 'belum dikunjungi',
  current: 'sedang dikunjungi (kunjungi() teratas)',
  waiting: 'menunggu, kunjungi()-nya belum selesai',
  visited: 'selesai (semua tetangganya sudah diperiksa)',
}
const DFS_EDGE_LABELS = {
  normal: 'belum diperiksa',
  considered: 'sedang diperiksa',
  chosen: 'sisi pohon DFS (menuju simpul baru)',
  rejected: 'bukan sisi pohon (ujungnya sudah dikunjungi)',
}

const intro = (n, edges, start, name) =>
  `Graf tak berarah dengan ${n} simpul dan ${edges.length} sisi. ${name} dimulai dari simpul ${start}. ` +
  'Bila ada beberapa tetangga, yang bernomor lebih kecil dikunjungi lebih dulu.'

const finalNote = (n, order, name) => {
  const missing = n - order.length
  return (
    `Selesai. urutan = [${order.join(', ')}]: ${order.length} simpul dikunjungi.` +
    (missing > 0 ? ` ${missing} simpul tidak terjangkau dari simpul awal, jadi tidak masuk urutan (tetap abu-abu).` : ` Semua simpul terjangkau dari simpul awal.`) +
    (name === 'BFS' ? ' Simpul yang lebih dekat dengan simpul awal selalu dikunjungi lebih dulu.' : ' Penelusuran masuk sedalam mungkin lebih dulu, baru mundur.')
  )
}

/**
 * Menjalankan BFS pada graf tak berarah dan merekam tiap langkah.
 * @param {import('./graphCommon.js').GraphInput} input
 * @returns {import('./graphCommon.js').GraphStep[]}
 */
export function bfsGraphSteps({ n, edges, start }) {
  const adj = buildAdj(n, edges, false)
  const nodeMark = Array(n).fill('normal')
  const nodeSub = Array(n).fill('')
  const edgeMark = edges.map(() => 'normal')
  const found = Array(n).fill(false)
  const queue = []
  const order = []
  let u = null
  /** @type {import('./graphCommon.js').GraphStep[]} */
  const steps = []

  const push = (line, note) => {
    const panels = [
      { type: 'list', title: 'Variabel', items: [`start = ${start}`, `u = ${u === null ? '–' : u}`], empty: '' },
      { type: 'list', title: 'antrean (depan ke belakang)', items: queue.map(String), empty: 'kosong' },
      { type: 'list', title: 'urutan (urutan kunjungan)', items: order.map(String), empty: 'belum ada' },
      adjacencyPanel(adj, u === null ? -1 : u, false),
    ]
    steps.push({ line, note, view: makeView({ n, edges, ...KIND }, { nodeMark, nodeSub, edgeMark, panels, labels: BFS_LABELS, edgeLabels: BFS_EDGE_LABELS }) })
  }

  push(1, intro(n, edges, start, 'BFS') + ' BFS memakai antrean: yang ditemukan lebih dulu diproses lebih dulu, sehingga simpul dikunjungi per lapisan jarak.')
  push([2, 3, 4, 5, 6, 7], 'Bangun daftar tetangga: tiap sisi dicatat dua arah, lalu tetangga setiap simpul diurutkan naik.')

  found[start] = true
  nodeMark[start] = 'queued'
  queue.push(start)
  push([8, 9, 10, 11], `antrean berisi simpul awal ${start}, dan ${start} langsung ditandai dikunjungi supaya tidak masuk antrean dua kali. urutan masih kosong.`)

  while (queue.length > 0) {
    u = queue.shift()
    nodeMark[u] = 'current'
    push([12, 13], `Antrean tidak kosong. Ambil u = ${u} dari depan antrean.`)

    order.push(u)
    nodeSub[u] = `#${order.length}`
    push(14, `Catat ${u} ke urutan sebagai kunjungan ke-${order.length}.`)

    for (const { v, e } of adj[u]) {
      const before = edgeMark[e]
      edgeMark[e] = 'considered'
      if (!found[v]) {
        push([15, 16], `Tetangga v = ${v}: dikunjungi[${v}] masih false, jadi ${v} baru ditemukan.`)
        found[v] = true
        nodeMark[v] = 'queued'
        queue.push(v)
        edgeMark[e] = 'chosen'
        push([17, 18], `Tandai ${v} dikunjungi dan masukkan ke antrean paling belakang. Sisi ${u}-${v} menjadi sisi pohon BFS.`)
      } else {
        push([15, 16], `Tetangga v = ${v}: dikunjungi[${v}] sudah true, jadi ${v} dilewati.`)
        edgeMark[e] = before === 'chosen' ? 'chosen' : 'rejected'
      }
    }

    nodeMark[u] = 'visited'
    push(20, `Semua tetangga ${u} sudah diperiksa. ${u} selesai diproses.${queue.length > 0 ? ` Antrean sekarang: ${queue.join(', ')}.` : ' Antrean kosong, jadi perulangan berhenti.'}`)
  }

  u = null
  push(22, finalNote(n, order, 'BFS'))
  return steps
}

/**
 * Menjalankan DFS (rekursif) pada graf tak berarah dan merekam tiap langkah.
 * @param {import('./graphCommon.js').GraphInput} input
 * @returns {import('./graphCommon.js').GraphStep[]}
 */
export function dfsGraphSteps({ n, edges, start }) {
  const adj = buildAdj(n, edges, false)
  const nodeSub = Array(n).fill('')
  const edgeMark = edges.map(() => 'normal')
  const seen = Array(n).fill(false)
  const done = Array(n).fill(false)
  const stack = []
  const order = []
  /** @type {import('./graphCommon.js').GraphStep[]} */
  const steps = []

  const marks = () => Array.from({ length: n }, (_, i) => (done[i] ? 'visited' : stack.includes(i) ? (i === stack[stack.length - 1] ? 'current' : 'waiting') : 'normal'))

  const push = (line, note) => {
    const top = stack.length > 0 ? stack[stack.length - 1] : null
    const panels = [
      { type: 'list', title: 'Variabel', items: [`start = ${start}`, `u = ${top === null ? '–' : top}`], empty: '' },
      { type: 'list', title: 'Tumpukan pemanggilan (bawah ke atas)', items: stack.map((x) => `kunjungi(${x})`), empty: 'kosong' },
      { type: 'list', title: 'urutan (urutan kunjungan)', items: order.map(String), empty: 'belum ada' },
      adjacencyPanel(adj, top === null ? -1 : top, false),
    ]
    steps.push({
      line,
      note,
      view: makeView({ n, edges, ...KIND }, { nodeMark: marks(), nodeSub, edgeMark, panels, labels: DFS_LABELS, edgeLabels: DFS_EDGE_LABELS }),
    })
  }

  function visit(u) {
    stack.push(u)
    seen[u] = true
    order.push(u)
    nodeSub[u] = `#${order.length}`
    push([10, 11, 12], `Masuk kunjungi(${u}): tandai ${u} dikunjungi dan catat sebagai kunjungan ke-${order.length}.`)
    for (const { v, e } of adj[u]) {
      const before = edgeMark[e]
      edgeMark[e] = 'considered'
      if (!seen[v]) {
        push([13, 14], `Tetangga v = ${v}: dikunjungi[${v}] masih false, jadi panggil kunjungi(${v}). Penelusuran masuk lebih dalam sebelum tetangga ${u} yang lain.`)
        edgeMark[e] = 'chosen'
        visit(v)
      } else {
        push([13, 14], `Tetangga v = ${v}: dikunjungi[${v}] sudah true, jadi ${v} dilewati.`)
        edgeMark[e] = before === 'chosen' ? 'chosen' : 'rejected'
      }
    }
    done[u] = true
    stack.pop()
    const back = stack.length > 0 ? stack[stack.length - 1] : null
    push([15, 16], `Semua tetangga ${u} sudah diperiksa, kunjungi(${u}) selesai.${back === null ? ' Tidak ada pemanggil lagi.' : ` Kembali ke kunjungi(${back}) dan lanjut ke tetangganya yang berikutnya.`}`)
  }

  push(1, intro(n, edges, start, 'DFS') + ' DFS memakai rekursi: tiap simpul ditelusuri sedalam mungkin sebelum mundur, dan tumpukan pemanggilan menyimpan jalur menuju simpul sekarang.')
  push([2, 3, 4, 5, 6, 7], 'Bangun daftar tetangga: tiap sisi dicatat dua arah, lalu tetangga setiap simpul diurutkan naik.')
  push([8, 9], 'Siapkan dikunjungi (semua false) dan urutan (kosong).')
  push(17, `Panggil kunjungi(${start}) untuk memulai penelusuran.`)
  visit(start)
  push(18, finalNote(n, order, 'DFS'))
  return steps
}

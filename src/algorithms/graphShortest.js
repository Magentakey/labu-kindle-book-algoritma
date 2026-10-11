import { adjacencyPanel, buildAdj, edgeName, fmtDist, makeView } from './graphCommon.js'

// Nomor baris dipakai oleh steps di bawah. Jalankan `npm test` bila baris diubah.
// Dijkstra mengembalikan format soal challenge (jarak tiap simpul, -1 untuk simpul yang tidak terjangkau).
// Bellman-Ford mengembalikan jarak apa adanya (Infinity untuk tidak terjangkau), karena dengan bobot negatif
// jarak -1 bisa benar-benar terjadi dan tidak boleh tertukar dengan "tidak terjangkau".
export const dijkstraCode = `function dijkstra(n, edges, source) {
  const adj = Array.from({ length: n }, () => [])
  for (const [u, v, w] of edges) adj[u].push([v, w])
  const jarak = Array(n).fill(Infinity)
  const induk = Array(n).fill(-1)
  const selesai = Array(n).fill(false)
  jarak[source] = 0
  for (let k = 0; k < n; k++) {
    let u = -1
    for (let i = 0; i < n; i++) {
      if (!selesai[i] && (u === -1 || jarak[i] < jarak[u])) u = i
    }
    if (jarak[u] === Infinity) break
    selesai[u] = true
    for (const [v, w] of adj[u]) {
      if (jarak[u] + w < jarak[v]) {
        jarak[v] = jarak[u] + w
        induk[v] = u
      }
    }
  }
  return jarak.map((d) => (d === Infinity ? -1 : d))
}`

export const bellmanFordCode = `function bellmanFord(n, edges, source) {
  const jarak = Array(n).fill(Infinity)
  const induk = Array(n).fill(-1)
  jarak[source] = 0
  for (let putaran = 1; putaran < n; putaran++) {
    let berubah = false
    for (const [u, v, w] of edges) {
      if (jarak[u] + w < jarak[v]) {
        jarak[v] = jarak[u] + w
        induk[v] = u
        berubah = true
      }
    }
    if (!berubah) break
  }
  for (const [u, v, w] of edges) {
    if (jarak[u] + w < jarak[v]) return null
  }
  return jarak
}`

const KIND = { directed: true, weighted: true }

const DIJKSTRA_LABELS = {
  normal: 'belum terjangkau (jarak ∞)',
  queued: 'sudah terjangkau, jaraknya masih sementara',
  current: 'sedang diproses (baru dijadikan final)',
  visited: 'jarak sudah final',
}
const DIJKSTRA_EDGE_LABELS = {
  normal: 'bukan bagian jalur terpendek (sejauh ini)',
  considered: 'jalur sementara terbaik menuju simpul yang belum final',
  chosen: 'sisi pada jalur terpendek final',
}
const BELLMAN_LABELS = {
  normal: 'belum terjangkau (jarak ∞)',
  waiting: 'sudah terjangkau, jaraknya masih sementara (bisa turun)',
  current: 'ujung awal (u) sisi yang sedang diperiksa',
  visited: 'jarak sudah final',
}
const BELLMAN_EDGE_LABELS = {
  normal: 'bukan sisi induk',
  considered: 'sedang diperiksa',
  chosen: 'sisi induk: jalur terbaik sementara',
}

const distList = (dist) => dist.map((d, i) => `${i}: ${d === Infinity ? '−1 (tidak terjangkau)' : d}`).join(', ')

/**
 * Menjalankan algoritma Dijkstra pada graf berarah (bobot tidak negatif) dan merekam tiap langkah.
 * @param {import('./graphCommon.js').GraphInput} input  `start` = simpul sumber
 * @returns {import('./graphCommon.js').GraphStep[]}
 */
export function dijkstraSteps({ n, edges, start: source }) {
  const adj = buildAdj(n, edges, true)
  const dist = Array(n).fill(Infinity)
  const parent = Array(n).fill(-1)
  const via = Array(n).fill(-1)
  const done = Array(n).fill(false)
  const edgeMark = edges.map(() => 'normal')
  let cur = null
  dist[source] = 0
  /** @type {import('./graphCommon.js').GraphStep[]} */
  const steps = []

  const marks = () => Array.from({ length: n }, (_, i) => (i === cur ? 'current' : done[i] ? 'visited' : dist[i] !== Infinity ? 'queued' : 'normal'))

  const push = (line, note) => {
    const panels = [
      { type: 'list', title: 'Variabel', items: [`source = ${source}`, `u = ${cur === null ? '–' : cur}`], empty: '' },
      {
        type: 'table',
        caption: 'Jarak dari sumber',
        headers: ['Simpul', 'jarak', 'induk', 'Status'],
        rows: Array.from({ length: n }, (_, i) => [
          String(i),
          fmtDist(dist[i]),
          parent[i] === -1 ? '–' : String(parent[i]),
          done[i] ? 'final' : dist[i] !== Infinity ? 'sementara' : 'belum terjangkau',
        ]),
        activeRow: cur === null ? -1 : cur,
      },
      adjacencyPanel(adj, cur === null ? -1 : cur, true),
    ]
    steps.push({
      line,
      note,
      view: makeView({ n, edges, ...KIND }, { nodeMark: marks(), nodeSub: dist.map((d) => `d = ${fmtDist(d)}`), edgeMark, panels, labels: DIJKSTRA_LABELS, edgeLabels: DIJKSTRA_EDGE_LABELS }),
    })
  }

  push(
    1,
    `Graf berarah dengan ${n} simpul dan ${edges.length} sisi, semua bobot ≥ 0. Dijkstra mencari jarak terpendek dari simpul sumber ${source} ke semua simpul lain: ` +
      'selalu proses simpul terdekat yang jaraknya belum final, lalu periksa apakah lewat simpul itu ada jalan yang lebih pendek (relaksasi). Tanda panah menunjukkan arah sisi.',
  )
  push([2, 3], 'Bangun daftar tetangga keluar: sisi u→v hanya dicatat di u, karena grafnya berarah.')
  push([4, 5, 6, 7], `Semua jarak ∞ (belum terjangkau), induk = −1, belum ada yang selesai, kecuali jarak[${source}] = 0 karena jarak sumber ke dirinya sendiri nol.`)

  for (let k = 0; k < n; k++) {
    let u = -1
    for (let i = 0; i < n; i++) if (!done[i] && (u === -1 || dist[i] < dist[u])) u = i
    cur = u
    push(
      [9, 10, 11, 12],
      `Putaran ${k + 1}: dari simpul yang belum final, pilih yang jaraknya terkecil, yaitu u = ${u} (jarak = ${fmtDist(dist[u])}).`,
    )
    if (dist[u] === Infinity) {
      push(13, `jarak[${u}] = ∞: semua simpul yang tersisa tidak terjangkau dari sumber, jadi perulangan dihentikan (break).`)
      break
    }

    done[u] = true
    if (via[u] !== -1) edgeMark[via[u]] = 'chosen'
    push(14, `Tandai ${u} selesai: jaraknya ${dist[u]} sudah final, karena tidak ada jalan lain yang bisa lebih pendek (semua bobot ≥ 0).${via[u] === -1 ? '' : ` Sisi ${edgeName(edges[via[u]], true)} resmi menjadi bagian jalur terpendek.`}`)

    for (const { v, w, e } of adj[u]) {
      const cand = dist[u] + w
      const before = edgeMark[e]
      if (cand < dist[v]) {
        const old = via[v]
        if (old !== -1) edgeMark[old] = 'normal'
        const oldDist = dist[v]
        dist[v] = cand
        parent[v] = u
        via[v] = e
        edgeMark[e] = 'considered'
        push(
          [15, 16, 17, 18],
          `Sisi ${u}→${v} (bobot ${w}): jarak[${u}] + ${w} = ${cand} < jarak[${v}] = ${fmtDist(oldDist)}, jadi lewat ${u} lebih pendek. jarak[${v}] = ${cand} dan induk[${v}] = ${u}.`,
        )
      } else {
        edgeMark[e] = 'considered'
        push(
          [15, 16],
          `Sisi ${u}→${v} (bobot ${w}): jarak[${u}] + ${w} = ${cand} < jarak[${v}] = ${fmtDist(dist[v])}? Tidak, jadi jarak ${v} tidak berubah.`,
        )
        edgeMark[e] = before
      }
    }
  }

  cur = null
  const unreachable = dist.filter((d) => d === Infinity).length
  push(
    22,
    `Selesai. Jarak terpendek dari sumber ${source}: ${distList(dist)}. ` +
      (unreachable > 0 ? `Simpul yang tidak terjangkau (∞) dikembalikan sebagai −1, seperti pada soal challenge. ` : 'Semua simpul terjangkau. ') +
      'Sisi hijau tebal membentuk pohon jalur terpendek dari sumber.',
  )
  return steps
}

/**
 * Menjalankan algoritma Bellman-Ford pada graf berarah (bobot boleh negatif) dan merekam tiap langkah.
 * @param {import('./graphCommon.js').GraphInput} input  `start` = simpul sumber
 * @returns {import('./graphCommon.js').GraphStep[]}
 */
export function bellmanFordSteps({ n, edges, start: source }) {
  const dist = Array(n).fill(Infinity)
  const parent = Array(n).fill(-1)
  const via = Array(n).fill(-1)
  const edgeMark = edges.map(() => 'normal')
  let cur = null // ujung awal (u) sisi yang sedang diperiksa
  let curEdge = -1
  let finalDist = false
  dist[source] = 0
  /** @type {import('./graphCommon.js').GraphStep[]} */
  const steps = []

  const marks = () => Array.from({ length: n }, (_, i) => (i === cur ? 'current' : dist[i] === Infinity ? 'normal' : finalDist ? 'visited' : 'waiting'))

  const push = (line, note, extra = []) => {
    const panels = [
      { type: 'list', title: 'Variabel', items: [`source = ${source}`, ...extra], empty: '' },
      {
        type: 'table',
        caption: 'Jarak dari sumber',
        headers: ['Simpul', 'jarak', 'induk'],
        rows: Array.from({ length: n }, (_, i) => [String(i), fmtDist(dist[i]), parent[i] === -1 ? '–' : String(parent[i])]),
        activeRow: -1,
      },
      {
        type: 'table',
        caption: 'Sisi (diperiksa menurut urutan masukan)',
        headers: ['Sisi', 'Bobot'],
        rows: edges.map((e) => [edgeName(e, true), String(e[2])]),
        activeRow: curEdge,
      },
    ]
    steps.push({
      line,
      note,
      view: makeView({ n, edges, ...KIND }, { nodeMark: marks(), nodeSub: dist.map((d) => `d = ${fmtDist(d)}`), edgeMark, panels, labels: BELLMAN_LABELS, edgeLabels: BELLMAN_EDGE_LABELS }),
    })
  }

  push(
    1,
    `Graf berarah dengan ${n} simpul dan ${edges.length} sisi; bobot boleh negatif. Bellman-Ford mencari jarak terpendek dari sumber ${source} dengan cara sederhana: ` +
      `berulang kali memeriksa semua sisi (relaksasi). Paling banyak ${Math.max(n - 1, 0)} putaran diperlukan, lalu satu pemeriksaan tambahan untuk mendeteksi siklus negatif.`,
  )
  push([2, 3, 4], `Semua jarak ∞ (belum terjangkau) dan induk = −1, kecuali jarak[${source}] = 0.`)

  for (let p = 1; p < n; p++) {
    let changed = false
    push(
      [5, 6],
      `Putaran ${p} dari paling banyak ${n - 1}: periksa semua ${edges.length} sisi menurut urutan masukan. berubah = false.`,
      [`putaran = ${p}`, 'berubah = false'],
    )
    for (let e = 0; e < edges.length; e++) {
      const [u, v, w] = edges[e]
      cur = u
      curEdge = e
      const before = edgeMark[e]
      const cand = dist[u] + w // Infinity + w tetap Infinity
      const vars = [`putaran = ${p}`, `berubah = ${changed}`]
      if (cand < dist[v]) {
        const old = via[v]
        if (old !== -1) edgeMark[old] = 'normal'
        const oldDist = dist[v]
        dist[v] = cand
        parent[v] = u
        via[v] = e
        edgeMark[e] = 'chosen'
        changed = true
        vars[1] = 'berubah = true'
        push(
          [7, 8, 9, 10, 11],
          `Sisi ${u}→${v} (bobot ${w}): jarak[${u}] + ${w} = ${cand} < jarak[${v}] = ${fmtDist(oldDist)}, jadi jarak[${v}] = ${cand} dan induk[${v}] = ${u}. berubah = true.`,
          vars,
        )
      } else {
        edgeMark[e] = 'considered'
        push(
          [7, 8],
          dist[u] === Infinity
            ? `Sisi ${u}→${v} (bobot ${w}): jarak[${u}] masih ∞ (${u} belum terjangkau), jadi sisi ini belum bisa memperbaiki apa pun.`
            : `Sisi ${u}→${v} (bobot ${w}): jarak[${u}] + ${w} = ${cand} < jarak[${v}] = ${fmtDist(dist[v])}? Tidak, jadi tidak ada perubahan.`,
          vars,
        )
        edgeMark[e] = before
      }
    }
    cur = null
    curEdge = -1
    push(
      14,
      changed
        ? `Putaran ${p} selesai dan ada jarak yang berubah (berubah = true), jadi lanjut ke putaran berikutnya.`
        : `Putaran ${p} selesai tanpa perubahan (berubah = false): jarak sudah stabil, jadi perulangan berhenti lebih awal.`,
      [`putaran = ${p}`, `berubah = ${changed}`],
    )
    if (!changed) break
  }

  // Putaran pemeriksaan: bila masih ada sisi yang bisa memperbaiki jarak, ada siklus negatif yang terjangkau.
  const bad = edges.findIndex(([u, v, w]) => dist[u] + w < dist[v])
  if (bad !== -1) {
    const [u, v, w] = edges[bad]
    cur = u
    curEdge = bad
    edgeMark[bad] = 'considered'
    push(
      [16, 17],
      `Pemeriksaan siklus negatif: sisi ${u}→${v} (bobot ${w}) masih memperbaiki jarak, karena jarak[${u}] + ${w} = ${dist[u] + w} < jarak[${v}] = ${dist[v]}. ` +
        'Padahal semua putaran sudah dijalankan, jadi jarak terus turun tanpa batas: ada siklus negatif yang terjangkau dari sumber. Fungsi mengembalikan null, dan jarak di atas tidak berarti.',
    )
    return steps
  }

  cur = null
  curEdge = -1
  finalDist = true
  push([16, 17, 18], 'Pemeriksaan siklus negatif: tidak ada sisi yang masih bisa memperbaiki jarak, jadi tidak ada siklus negatif yang terjangkau dari sumber dan jarak sudah final.')
  push(
    19,
    `Selesai. Jarak terpendek dari sumber ${source}: ${distList(dist)}. ` +
      (dist.includes(Infinity) ? 'Simpul yang tidak terjangkau tetap ∞. (Fungsi ini sengaja tidak memakai −1 untuk "tidak terjangkau", karena dengan bobot negatif jarak −1 bisa benar-benar terjadi.) ' : '') +
      'Sisi hijau tebal membentuk pohon jalur terpendek dari sumber.',
  )
  return steps
}

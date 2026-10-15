import { BF_MAX_EDGES, BF_MAX_VERTICES, fmtD, parseBellmanFordInput } from './bellmanFordPseudo.js'

// Pseudocode DIJKSTRA(G, w, s), INITIALIZE-SINGLE-SOURCE(G, s), dan RELAX(u, v, w) dari materi 13.2 (Cormen),
// digabung dalam SATU blok kode (pola yang sama dengan materi 13.1).
// Baris 1 sampai 8 adalah DIJKSTRA. Baris 9 sampai 12 adalah INITIALIZE-SINGLE-SOURCE (nomor materi + 8).
// Baris 13 sampai 15 adalah RELAX (nomor materi + 12). Harus sama persis dengan tiga blok pseudocode di dijkstra.md (dijaga oleh tes).
export const dijkstraPseudoCode = [
  'INITIALIZE-SINGLE-SOURCE(G, s)',
  'S = ∅',
  'Q = G.V',
  'while Q ≠ ∅',
  '    u = EXTRACT-MIN(Q)',
  '    S = S ∪ {u}',
  '    for each vertex v ∈ G.Adj[u]',
  '        RELAX(u, v, w)',
  'for each vertex v ∈ G.V',
  '    v.d = ∞',
  '    v.π = NIL',
  's.d = 0',
  'if v.d > u.d + w(u, v)',
  '    v.d = u.d + w(u, v)',
  '    v.π = u',
].join('\n')

export const DJ_INIT_OFFSET = 8
export const DJ_RELAX_OFFSET = 12
export const DJ_MAX_VERTICES = BF_MAX_VERTICES
export const DJ_MAX_EDGES = BF_MAX_EDGES

/** Membaca V dan E. Urutan sisi di E yang berawal dari simpul yang sama menjadi urutan G.Adj[u]. */
export function parseDijkstraInput({ V, E }) {
  const p = parseBellmanFordInput({ V, E })
  if (!p.ok) return p
  const neg = p.edges.find((e) => e.w < 0)
  if (neg) return { ok: false, error: `Isian E: sisi ${neg.u}>${neg.v} berbobot negatif (${fmtD(neg.w)}). Dijkstra tidak memperbolehkan bobot negatif; gunakan peraga Bellman-Ford.` }
  const adj = Object.fromEntries(p.names.map((x) => [x, []]))
  for (const e of p.edges) adj[e.u].push({ v: e.v, w: e.w })
  return { ok: true, names: p.names, edges: p.edges, adj }
}

/** Pesan kesalahan untuk isian V, E, dan s, atau null bila sah. */
export function checkDijkstraInput({ V, E, s }) {
  const p = parseDijkstraInput({ V, E })
  if (!p.ok) return p.error
  if (!p.names.includes(s)) return `Sumber s = ${s} tidak ada di V. Pilih salah satu dari: ${p.names.join(', ')}.`
  return null
}

const dash = '–'

/**
 * Menjalankan DIJKSTRA(G, w, s) satu langkah per pembacaan satu baris, mengikuti pseudocode materi apa adanya
 * (semua |V| simpul di-extract, termasuk simpul yang tak terjangkau, yang ber-d ∞ dan tidak mengubah apa pun).
 * Baris 10 dan 11 ditampilkan ringkas (satu langkah untuk semua simpul). EXTRACT-MIN yang seri diputus menurut urutan Q (urutan V).
 *
 * Dengan n simpul, m sisi, dan U = banyak pembaruan (baris 14 dan 15), banyaknya langkah selalu 8 + 4n + 3m + 2U.
 *
 * @param {{ V: string, E: string, s: string }} input
 * @returns {import('../traces.js').TraceStep[]}
 */
export function dijkstraPseudoTrace({ V, E, s }) {
  const { names, adj } = parseDijkstraInput({ V, E })
  const n = names.length
  const d = {}
  const pi = {}
  let dShown = false
  let piShown = false
  let inQ = null // Q: null sebelum baris 3
  let inS = null // S: null sebelum baris 2
  let u = null
  let v = null
  let vIndex = -1
  let changed = null
  const steps = []
  for (const x of names) {
    d[x] = null
    pi[x] = null
  }
  const weightOf = (a, b) => adj[a].find((e) => e.v === b).w
  const thick = () => names.filter((x) => pi[x] !== null).map((x) => `(${pi[x]}, ${x}) = ${weightOf(pi[x], x)}`)
  const pathTo = (x) => {
    const p = [x]
    while (pi[p[0]] !== null && p.length <= n) p.unshift(pi[p[0]])
    return p
  }

  function push(line, note, extra = []) {
    const examining = v !== null && (line === 7 || line === 8 || (line >= 13 && line <= 15))
    const rows = names.map((x) => {
      let mark = inS && inS.has(x) ? 'black' : 'empty'
      if (examining && x === v) mark = 'source'
      if (u !== null && x === u && line >= 5) mark = 'current'
      if (changed === x && (line === 14 || line === 15)) mark = 'path'
      return [
        { text: dShown ? fmtD(d[x]) : '', mark },
        { text: piShown ? (pi[x] === null ? 'NIL' : pi[x]) : '', mark },
      ]
    })
    const lists = []
    if (inS) lists.push({ title: 'Himpunan S (simpul yang sudah final)', items: [...inS], empty: 'kosong (S = ∅)' })
    if (inQ) lists.push({ title: 'Himpunan Q (urutan simpul, d dalam kurung)', items: names.filter((x) => inQ.has(x)).map((x) => `${x} (${fmtD(d[x])})`), empty: 'kosong (Q = ∅)' })
    if (u !== null && line >= 7 && line <= 15) {
      lists.push({
        title: `Tetangga ${u} (G.Adj[${u}], bobot dalam kurung)`,
        items: adj[u].map((a, k) => `${a.v} (${a.w})${k === vIndex && v !== null ? ' ← sedang diperiksa' : k < vIndex || (k === vIndex && v === null) ? ' (sudah diperiksa)' : ''}`),
        empty: 'kosong',
      })
    }
    if (piShown) lists.push({ title: 'Sisi tebal (v.π, v) = bobot, saat ini', items: thick(), empty: 'belum ada' })
    lists.push(...extra)
    const wuv = examining ? weightOf(u, v) : null
    steps.push({
      line,
      note,
      vars: [
        { name: 'u', value: u !== null && line >= 5 ? u : dash },
        { name: 'v', value: examining ? v : dash },
        { name: 'w(u, v)', value: examining ? fmtD(wuv) : dash },
        { name: 'u.d', value: u !== null && line >= 5 ? fmtD(d[u]) : dash },
        { name: 'v.d', value: examining ? fmtD(d[v]) : dash },
        { name: 'u.d + w(u, v)', value: examining ? fmtD(d[u] + wuv) : dash },
        { name: '|Q|', value: inQ ? String(inQ.size) : dash },
      ],
      tables: [
        {
          table: { caption: 'Atribut tiap simpul: nilai d dan induk π', corner: 'simpul', rowHeaders: names, colHeaders: ['d', 'π'], cells: rows },
          labels: {
            empty: 'masih di Q',
            black: 'sudah di S (final, hitam di gambar materi)',
            current: 'u: simpul yang baru di-extract',
            source: 'v: tetangga u yang sedang diperiksa',
            path: 'v: nilainya baru diubah RELAX',
          },
          legend: ['empty', 'black', 'current', 'source', 'path'],
        },
      ],
      lists,
    })
  }

  push(1, `Baris 1: DIJKSTRA memanggil INITIALIZE-SINGLE-SOURCE(G, s) dengan sumber s = ${s}. Prosedur itu ditulis di baris 9 sampai 12.`)
  push(9, `Baris 9 (baris 1 INITIALIZE-SINGLE-SOURCE): perulangan for berlaku untuk setiap simpul v ∈ G.V (${n} simpul: ${names.join(', ')}). Baris 10 dan 11 ditampilkan satu kali untuk semua simpul sekaligus.`)
  for (const x of names) d[x] = Infinity
  dShown = true
  push(10, 'Baris 10 (baris 2 INITIALIZE-SINGLE-SOURCE): v.d = ∞ untuk semua simpul.')
  piShown = true
  push(11, 'Baris 11 (baris 3 INITIALIZE-SINGLE-SOURCE): v.π = NIL untuk semua simpul.')
  d[s] = 0
  push(12, `Baris 12 (baris 4 INITIALIZE-SINGLE-SOURCE): ${s}.d = 0. Hanya sumber ${s} yang bernilai bukan ∞. Prosedur selesai, kembali ke baris 2.`)
  inS = new Set()
  push(2, 'Baris 2: S = ∅. Belum ada simpul yang final.')
  inQ = new Set(names)
  push(3, `Baris 3: Q = G.V = {${names.join(', ')}}. Semua ${n} simpul ada di Q.`)

  let round = 0
  while (inQ.size > 0) {
    round++
    u = null
    v = null
    vIndex = -1
    changed = null
    push(4, `Baris 4: Q ≠ ∅ bernilai TRUE (|Q| = ${inQ.size}), jadi putaran ke-${round} dari ${n} dijalankan.`)
    let min = Infinity
    for (const x of names) if (inQ.has(x) && d[x] < min) min = d[x]
    const cand = names.filter((x) => inQ.has(x) && d[x] === min)
    u = cand[0]
    inQ.delete(u)
    const tie = cand.length > 1 ? ` Simpul ${cand.join(' dan ')} sama-sama bernilai ${fmtD(min)}; yang dikeluarkan adalah ${u} karena lebih dulu dalam urutan Q.` : ''
    const inf = min === Infinity ? ' Nilai terkecil di Q adalah ∞, artinya simpul ini tidak terjangkau dari sumber, dan RELAX tidak akan mengubah apa pun.' : ''
    const rest = names.filter((x) => inQ.has(x))
    push(5, `Baris 5: u = EXTRACT-MIN(Q) = ${u}, simpul di Q dengan d terkecil, yaitu ${u}.d = ${fmtD(min)}.${tie}${inf} Sekarang Q = ${rest.length ? `{${rest.join(', ')}}` : '∅'}.`)
    inS.add(u)
    push(6, `Baris 6: S = S ∪ {${u}} = {${[...inS].join(', ')}}. Nilai ${u}.d = ${fmtD(d[u])} dianggap final.`)
    const list = adj[u]
    for (let k = 0; k < list.length; k++) {
      const { v: nv, w } = list[k]
      v = nv
      vIndex = k
      changed = null
      push(7, `Baris 7: v = ${v}, tetangga ke-${k + 1} dari ${list.length} pada G.Adj[${u}], dengan w(${u}, ${v}) = ${w}.`)
      push(8, `Baris 8: memanggil RELAX(${u}, ${v}, w) untuk sisi (${u}, ${v}). Prosedur RELAX ditulis di baris 13 sampai 15.`)
      const sum = d[u] + w
      if (d[v] > sum) {
        const old = d[v]
        push(13, `Baris 13 (baris 1 RELAX): v.d > u.d + w(u, v), yaitu ${v}.d = ${fmtD(old)} > ${u}.d + w(${u}, ${v}) = ${fmtD(d[u])} + ${w} = ${fmtD(sum)}, bernilai TRUE. Baris 14 dan 15 dijalankan.`)
        d[v] = sum
        changed = v
        push(14, `Baris 14 (baris 2 RELAX): ${v}.d = ${u}.d + w(${u}, ${v}) = ${fmtD(sum)} (sebelumnya ${fmtD(old)}).`)
        const oldPi = pi[v]
        pi[v] = u
        push(15, `Baris 15 (baris 3 RELAX): ${v}.π = ${u}. Sisi (${u}, ${v}) menjadi sisi tebal${oldPi ? `, menggantikan sisi (${oldPi}, ${v}) yang tebal sebelumnya` : ''}. RELAX selesai, kembali ke baris 7.`)
      } else {
        const why = d[u] === Infinity
          ? `${u}.d = ∞, sehingga ${u}.d + w(${u}, ${v}) = ∞ dan ${v}.d = ${fmtD(d[v])} tidak lebih besar dari ∞`
          : `${v}.d = ${fmtD(d[v])} tidak lebih besar dari ${u}.d + w(${u}, ${v}) = ${fmtD(d[u])} + ${w} = ${fmtD(sum)}${inS.has(v) ? `. Simpul ${v} juga sudah di S, jadi nilainya sudah final` : ''}`
        push(13, `Baris 13 (baris 1 RELAX): v.d > u.d + w(u, v) bernilai FALSE, karena ${why}. Tidak ada perubahan, RELAX selesai dan kembali ke baris 7.`)
      }
    }
    v = null
    changed = null
    vIndex = list.length
    push(7, list.length === 0 ? `Baris 7: G.Adj[${u}] kosong, jadi tidak ada tetangga yang diperiksa. Kembali ke baris 4.` : `Baris 7: semua tetangga ${u} sudah diperiksa, jadi perulangan for selesai (end for) dan kembali ke baris 4.`)
  }
  u = null
  v = null
  const result = names.filter((x) => x !== s).map((x) => (d[x] === Infinity ? `${s} → ${x}: tidak terjangkau (d = ∞)` : `${pathTo(x).join(' – ')}: total bobot ${fmtD(d[x])}`))
  push(4, 'Baris 4: Q ≠ ∅ bernilai FALSE, karena Q = ∅. Perulangan while selesai (end while) dan algoritma Dijkstra selesai dijalankan.', [{ title: `Lintasan terpendek dari ${s}`, items: result }])
  return steps
}

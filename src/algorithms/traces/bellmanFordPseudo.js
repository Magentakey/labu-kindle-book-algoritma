import { NAME_RE } from './mstCommon.js'

// Pseudocode BELLMAN-FORD(G, w, s), INITIALIZE-SINGLE-SOURCE(G, s), dan RELAX(u, v, w) dari materi 13.1 (Cormen),
// digabung dalam SATU blok kode (pola yang sama dengan DFS dan DFS-VISIT di materi 11.2).
// Baris 1 sampai 8 adalah BELLMAN-FORD. Baris 9 sampai 12 adalah INITIALIZE-SINGLE-SOURCE, yang di materi bernomor 1 sampai 4.
// Baris 13 sampai 15 adalah RELAX, yang di materi bernomor 1 sampai 3.
// Harus sama persis dengan tiga blok pseudocode di bellman-ford.md (dijaga oleh tes).
export const bellmanFordPseudoCode = [
  'INITIALIZE-SINGLE-SOURCE(G, s)',
  'for i = 1 to |G.V| − 1',
  '    for each edge (u, v) ∈ G.E',
  '        RELAX(u, v, w)',
  'for each edge (u, v) ∈ G.E',
  '    if v.d > u.d + w(u, v)',
  '        return FALSE',
  'return TRUE',
  'for each vertex v ∈ G.V',
  '    v.d = ∞',
  '    v.π = NIL',
  's.d = 0',
  'if v.d > u.d + w(u, v)',
  '    v.d = u.d + w(u, v)',
  '    v.π = u',
].join('\n')

/** Baris INITIALIZE-SINGLE-SOURCE di peraga = baris di materi + 8. */
export const BF_INIT_OFFSET = 8
/** Baris RELAX di peraga = baris di materi + 12. */
export const BF_RELAX_OFFSET = 12

export const BF_MAX_VERTICES = 7
export const BF_MAX_EDGES = 14
export const BF_MAX_WEIGHT = 99

const EDGE_RE = /^([A-Za-z0-9]{1,2})\s*>\s*([A-Za-z0-9]{1,2})\s*:\s*([-−]?\d{1,3})$/

/** Teks nilai d: ∞ untuk Infinity, dan tanda minus sungguhan (−) seperti di materi. */
export const fmtD = (d) => (d === Infinity ? '∞' : String(d).replace('-', '−'))

/**
 * Membaca isian V (daftar simpul) dan E (daftar sisi berarah "u>v:bobot").
 * Urutan penulisan V adalah urutan G.V, dan urutan penulisan E adalah urutan G.E yang dipakai di setiap loop.
 * @returns {{ ok: true, names: string[], edges: Array<{ u: string, v: string, w: number }> } | { ok: false, error: string }}
 */
export function parseBellmanFordInput({ V, E }) {
  const names = String(V ?? '').split(/[\s,;]+/).filter((x) => x !== '')
  if (names.length === 0) return { ok: false, error: 'Isian V tidak boleh kosong. Contoh: s, t, x, y, z' }
  if (names.length < 2) return { ok: false, error: 'Isian V minimal 2 simpul.' }
  if (names.length > BF_MAX_VERTICES) return { ok: false, error: `Isian V maksimal ${BF_MAX_VERTICES} simpul (Anda mengisi ${names.length}).` }
  for (const x of names) if (!NAME_RE.test(x)) return { ok: false, error: `Isian V: nama simpul "${x}" harus 1 sampai 2 huruf atau angka.` }
  if (new Set(names).size !== names.length) return { ok: false, error: 'Isian V: ada nama simpul yang ditulis lebih dari satu kali.' }

  const tokens = String(E ?? '').split(/[,;]+/).map((t) => t.trim()).filter((t) => t !== '')
  if (tokens.length === 0) return { ok: false, error: 'Isian E tidak boleh kosong. Contoh: s>t:6, t>x:5' }
  if (tokens.length > BF_MAX_EDGES) return { ok: false, error: `Isian E maksimal ${BF_MAX_EDGES} sisi (Anda mengisi ${tokens.length}).` }
  const edges = []
  const seen = new Set()
  for (const t of tokens) {
    const m = EDGE_RE.exec(t)
    if (!m) return { ok: false, error: `Isian E: sisi "${t}" belum benar. Tulis u>v:bobot, misalnya t>x:5 atau x>t:-2.` }
    const [, u, v, ws] = m
    const w = Number(ws.replace('−', '-'))
    if (!names.includes(u)) return { ok: false, error: `Isian E: simpul ${u} pada sisi "${t}" tidak ada di V.` }
    if (!names.includes(v)) return { ok: false, error: `Isian E: simpul ${v} pada sisi "${t}" tidak ada di V.` }
    if (u === v) return { ok: false, error: `Isian E: sisi "${t}" menghubungkan simpul dengan dirinya sendiri. Gunakan simpul yang berbeda.` }
    if (Math.abs(w) > BF_MAX_WEIGHT) return { ok: false, error: `Isian E: bobot sisi "${t}" harus antara −${BF_MAX_WEIGHT} dan ${BF_MAX_WEIGHT}.` }
    const key = `${u}>${v}`
    if (seen.has(key)) return { ok: false, error: `Isian E: sisi dari ${u} ke ${v} ditulis lebih dari satu kali.` }
    seen.add(key)
    edges.push({ u, v, w })
  }
  return { ok: true, names, edges }
}

/** Pesan kesalahan untuk isian V, E, dan s, atau null bila sah. */
export function checkBellmanFordInput({ V, E, s }) {
  const p = parseBellmanFordInput({ V, E })
  if (!p.ok) return p.error
  if (!p.names.includes(s)) return `Sumber s = ${s} tidak ada di V. Pilih salah satu dari: ${p.names.join(', ')}.`
  return null
}

const dash = '–'

/**
 * Menjalankan BELLMAN-FORD(G, w, s) satu langkah per pembacaan satu baris, mengikuti pseudocode materi apa adanya
 * (selalu |V| − 1 loop, tanpa berhenti lebih awal).
 *
 * Baris 9 sampai 11 (inisialisasi) ditampilkan ringkas: tiap baris satu langkah yang berlaku untuk semua simpul sekaligus.
 * Mulai baris 12, satu langkah sama dengan satu baris yang dibaca: header for baris 2 (satu kali per loop, ditambah satu
 * pemeriksaan akhir), header for baris 3 (satu kali per sisi, ditambah satu pemeriksaan akhir tiap loop), pemanggilan RELAX
 * di baris 4, kondisi RELAX di baris 13, dan bila TRUE baris 14 dan 15. Langkah 5 sampai 7 memakai pola yang sama.
 *
 * Dengan n simpul, m sisi, L = n − 1 loop, dan U = banyak pembaruan (baris 14 dan 15):
 * - bila hasilnya TRUE: banyaknya langkah selalu 8 + 2L + 3mL + 2U + 2m,
 * - bila hasilnya FALSE di sisi ke-k pada langkah 5 sampai 7: 7 + 2L + 3mL + 2U + 2k.
 *
 * @param {{ V: string, E: string, s: string }} input
 * @returns {import('../traces.js').TraceStep[]}
 */
export function bellmanFordPseudoTrace({ V, E, s }) {
  const { names, edges } = parseBellmanFordInput({ V, E }) // validasi sudah dilakukan checkBellmanFordInput
  const n = names.length
  const m = edges.length
  const L = n - 1
  const label = (e) => `(${e.u}, ${e.v})`
  const d = {}
  const pi = {}
  let dShown = false
  let piShown = false
  let loop = null // nomor loop (i) saat ini
  let phase = 'bf' // 'bf' = langkah 2 sampai 4, 'check' = langkah 5 sampai 7
  /** Status tiap sisi pada loop ini (atau pada pemeriksaan akhir): wait, true, atau false. */
  let status = edges.map(() => 'wait')
  let cur = -1 // indeks sisi yang sedang diperiksa
  let changed = null // simpul yang baru diubah RELAX
  const steps = []

  for (const x of names) {
    d[x] = null
    pi[x] = null
  }

  const thickEdges = () => names.filter((x) => pi[x] !== null).map((x) => `(${pi[x]}, ${x}) = ${fmtD(edges.find((e) => e.u === pi[x] && e.v === x).w)}`)

  function pathTo(x) {
    const p = [x]
    while (pi[p[0]] !== null && p.length <= n) p.unshift(pi[p[0]]) // batas n: π yang berputar tidak boleh membuat peraga menggantung
    return p
  }

  function push(line, note, extraLists = []) {
    const e = cur >= 0 ? edges[cur] : null
    const examining = e !== null && (line === 3 || line === 4 || line === 5 || line === 6 || line === 7 || (line >= 13 && line <= 15))
    const rows = names.map((x) => {
      let mark = 'empty'
      if (examining && x === e.v) mark = 'source'
      if (examining && x === e.u) mark = 'current'
      if (changed === x && (line === 14 || line === 15)) mark = 'path'
      return [
        { text: dShown ? fmtD(d[x]) : '', mark },
        { text: piShown ? (pi[x] === null ? 'NIL' : pi[x]) : '', mark },
      ]
    })
    const sum = examining ? d[e.u] + e.w : null
    const vars = [
      { name: 'i', value: loop !== null ? String(loop) : dash },
      { name: 'u', value: examining ? e.u : dash },
      { name: 'v', value: examining ? e.v : dash },
      { name: 'w(u, v)', value: examining ? fmtD(e.w) : dash },
      { name: 'u.d', value: examining ? fmtD(d[e.u]) : dash },
      { name: 'v.d', value: examining ? fmtD(d[e.v]) : dash },
      { name: 'u.d + w(u, v)', value: examining ? fmtD(sum) : dash },
    ]
    const lists = [...extraLists]
    if (piShown) lists.unshift({ title: 'Sisi tebal (v.π, v) = bobot, saat ini', items: thickEdges(), empty: 'belum ada' })
    steps.push({
      line,
      note,
      vars,
      tables: [
        {
          table: {
            caption: 'Atribut tiap simpul: nilai d dan induk π',
            corner: 'simpul',
            rowHeaders: names,
            colHeaders: ['d', 'π'],
            cells: rows,
          },
          labels: {
            empty: 'tidak sedang diperiksa',
            current: 'u: ujung awal sisi yang sedang diperiksa',
            source: 'v: ujung akhir sisi yang sedang diperiksa',
            path: 'v: nilainya baru diubah RELAX',
          },
          legend: ['empty', 'current', 'source', 'path'],
        },
        {
          table: {
            caption: phase === 'bf' ? `Sisi menurut urutan G.E dan hasil kondisi RELAX pada loop ${loop ?? '–'}` : 'Sisi menurut urutan G.E dan hasil kondisi pada langkah 6',
            corner: 'sisi',
            rowHeaders: edges.map(label),
            colHeaders: ['bobot', 'kondisi'],
            cells: edges.map((x, i) => {
              const st = status[i]
              const mark = st === 'true' ? 'path' : st === 'false' ? 'unused' : i === cur ? 'current' : 'empty'
              return [
                { text: fmtD(x.w), mark },
                { text: st === 'wait' ? '' : st, mark },
              ]
            }),
          },
          labels: {
            empty: 'belum diperiksa pada putaran ini',
            current: 'sisi yang sedang diperiksa',
            path: 'true: v.d > u.d + w(u, v)',
            unused: 'false: tidak ada perubahan',
          },
          legend: ['empty', 'current', 'path', 'unused'],
        },
      ],
      lists,
    })
  }

  const dInit = (x) => (x === s ? 0 : Infinity)

  push(1, `Baris 1: BELLMAN-FORD memanggil INITIALIZE-SINGLE-SOURCE(G, s) dengan sumber s = ${s}. Prosedur itu ditulis di baris 9 sampai 12.`)
  push(9, `Baris 9 (baris 1 INITIALIZE-SINGLE-SOURCE): perulangan for berlaku untuk setiap simpul v ∈ G.V (${n} simpul: ${names.join(', ')}). Baris 10 dan 11 ditampilkan satu kali untuk semua simpul sekaligus.`)
  for (const x of names) d[x] = Infinity
  dShown = true
  push(10, 'Baris 10 (baris 2 INITIALIZE-SINGLE-SOURCE): v.d = ∞ untuk semua simpul. Belum ada lintasan yang diketahui.')
  for (const x of names) pi[x] = null
  piShown = true
  push(11, 'Baris 11 (baris 3 INITIALIZE-SINGLE-SOURCE): v.π = NIL untuk semua simpul. Belum ada induk.')
  d[s] = dInit(s)
  push(12, `Baris 12 (baris 4 INITIALIZE-SINGLE-SOURCE): ${s}.d = 0. Hanya sumber ${s} yang bernilai bukan ∞. Prosedur selesai, kembali ke baris 2.`)

  for (let i = 1; i <= L; i++) {
    loop = i
    cur = -1
    changed = null
    status = edges.map(() => 'wait')
    push(2, `Baris 2: i = ${i} dari ${L} (|G.V| − 1 = ${n} − 1 = ${L}). Loop ke-${i} dimulai, dan semua ${m} sisi akan diperiksa menurut urutan G.E.`)
    for (let k = 0; k < m; k++) {
      cur = k
      changed = null
      const e = edges[k]
      push(3, `Baris 3: sisi ke-${k + 1} dari ${m}, (u, v) = ${label(e)} dengan w(${e.u}, ${e.v}) = ${fmtD(e.w)}.`)
      push(4, `Baris 4: memanggil RELAX(${e.u}, ${e.v}, w) untuk sisi ${label(e)}. Prosedur RELAX ditulis di baris 13 sampai 15.`)
      const sum = d[e.u] + e.w
      if (d[e.v] > sum) {
        const old = d[e.v]
        status[k] = 'true'
        push(13, `Baris 13 (baris 1 RELAX): v.d > u.d + w(u, v), yaitu ${e.v}.d = ${fmtD(old)} > ${e.u}.d + w(${e.u}, ${e.v}) = ${fmtD(d[e.u])} + (${fmtD(e.w)}) = ${fmtD(sum)}, bernilai TRUE. Baris 14 dan 15 dijalankan.`)
        d[e.v] = sum
        changed = e.v
        push(14, `Baris 14 (baris 2 RELAX): ${e.v}.d = ${e.u}.d + w(${e.u}, ${e.v}) = ${fmtD(sum)} (sebelumnya ${fmtD(old)}).`)
        const oldPi = pi[e.v]
        pi[e.v] = e.u
        push(15, `Baris 15 (baris 3 RELAX): ${e.v}.π = ${e.u}. Sisi ${label(e)} menjadi sisi tebal${oldPi ? `, menggantikan sisi (${oldPi}, ${e.v}) yang tebal sebelumnya` : ''}. RELAX selesai, kembali ke baris 3.`)
      } else {
        status[k] = 'false'
        const why = d[e.u] === Infinity ? `${e.u}.d = ∞, sehingga ${e.u}.d + w(${e.u}, ${e.v}) = ∞ dan ${e.v}.d = ${fmtD(d[e.v])} tidak lebih besar dari ∞` : `${e.v}.d = ${fmtD(d[e.v])} tidak lebih besar dari ${e.u}.d + w(${e.u}, ${e.v}) = ${fmtD(d[e.u])} + (${fmtD(e.w)}) = ${fmtD(sum)}`
        push(13, `Baris 13 (baris 1 RELAX): v.d > u.d + w(u, v) bernilai FALSE, karena ${why}. Tidak ada perubahan, RELAX selesai dan kembali ke baris 3.`)
      }
    }
    cur = -1
    changed = null
    const trueCount = status.filter((x) => x === 'true').length
    push(3, `Baris 3: semua ${m} sisi sudah diperiksa, jadi perulangan for selesai (end for) dan kembali ke baris 2. Pada loop ${i}, kondisi RELAX bernilai true untuk ${trueCount} sisi${trueCount ? `: ${edges.filter((_, k) => status[k] === 'true').map(label).join(', ')}` : ''}.`)
  }
  loop = null
  cur = -1
  changed = null
  push(2, `Baris 2: i sudah melewati ${L}, jadi perulangan for selesai (end for) dan lanjut ke baris 5. Pada langkah 5 sampai 7 sisi diperiksa sekali lagi untuk mencari siklus negatif.`)

  phase = 'check'
  status = edges.map(() => 'wait')
  for (let k = 0; k < m; k++) {
    cur = k
    const e = edges[k]
    push(5, `Baris 5: sisi ke-${k + 1} dari ${m}, (u, v) = ${label(e)} dengan w(${e.u}, ${e.v}) = ${fmtD(e.w)}.`)
    const sum = d[e.u] + e.w
    if (d[e.v] > sum) {
      status[k] = 'true'
      push(6, `Baris 6: v.d > u.d + w(u, v), yaitu ${e.v}.d = ${fmtD(d[e.v])} > ${e.u}.d + w(${e.u}, ${e.v}) = ${fmtD(d[e.u])} + (${fmtD(e.w)}) = ${fmtD(sum)}, bernilai TRUE. Baris 7 dijalankan.`)
      push(
        7,
        `Baris 7: return FALSE. Sesudah ${L} loop, sisi ${label(e)} masih bisa menurunkan ${e.v}.d, artinya ada siklus bernilai negatif yang dapat dicapai dari ${s}. Algoritma Bellman-Ford tidak mendapatkan lintasan terpendek.`,
        [{ title: 'Sisi yang melanggar pada langkah 6', items: [`${label(e)}: ${e.v}.d = ${fmtD(d[e.v])} > ${fmtD(sum)}`] }],
      )
      return steps
    }
    status[k] = 'false'
    push(6, `Baris 6: v.d > u.d + w(u, v) bernilai FALSE, karena ${e.v}.d = ${fmtD(d[e.v])} tidak lebih besar dari ${e.u}.d + w(${e.u}, ${e.v}) = ${fmtD(sum)}. Kembali ke baris 5.`)
  }
  cur = -1
  push(5, `Baris 5: semua ${m} sisi sudah diperiksa dan kondisi baris 6 bernilai FALSE untuk semuanya, jadi perulangan for selesai (end for) dan lanjut ke baris 8.`)
  const result = names
    .filter((x) => x !== s)
    .map((x) => (d[x] === Infinity ? `${s} → ${x}: tidak terjangkau (d = ∞)` : `${pathTo(x).join(' – ')}: total bobot ${fmtD(d[x])}`))
  push(8, `Baris 8: return TRUE. Tidak ada siklus bernilai negatif yang dapat dicapai dari ${s}, jadi d dan π sudah berisi lintasan terpendek dari ${s} ke setiap simpul.`, [
    { title: `Lintasan terpendek dari ${s}`, items: result },
  ])
  return steps
}

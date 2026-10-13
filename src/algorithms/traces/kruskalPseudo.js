import { MST_MAX_EDGES, MST_MAX_VERTICES, MST_MAX_WEIGHT, NAME_RE, checkConnected } from './mstCommon.js'

// Pseudocode MST-KRUSKAL(G, w) dari materi 12 (Cormen). Nomor baris sama dengan nomor langkah di materi.
// Harus sama persis dengan blok pseudocode Kruskal di mst.md (dijaga oleh tes).
export const kruskalPseudoCode = [
  'A = ∅',
  'for each vertex v ∈ G.V',
  '    MAKE-SET(v)',
  'sort the edges of G.E into nondecreasing order by weight w',
  'for each edge (u, v) ∈ G.E, taken in nondecreasing order by weight',
  '    if FIND-SET(u) ≠ FIND-SET(v)',
  '        A = A ∪ {(u, v)}',
  '        UNION(u, v)',
  'return A',
].join('\n')

const EDGE_RE = /^([A-Za-z0-9]{1,2})\s*-\s*([A-Za-z0-9]{1,2})\s*:\s*(\d{1,2})$/

/**
 * Membaca isian V (daftar simpul) dan E (daftar sisi "u-v:bobot").
 * Urutan penulisan V adalah urutan G.V, dan urutan penulisan E adalah urutan G.E sebelum diurutkan.
 * @returns {{ ok: true, names: string[], edges: Array<{ u: string, v: string, w: number }> } | { ok: false, error: string }}
 */
export function parseKruskalInput({ V, E }) {
  const names = String(V ?? '').split(/[\s,;]+/).filter((x) => x !== '')
  if (names.length === 0) return { ok: false, error: 'Isian V tidak boleh kosong. Contoh: a, b, c, d' }
  if (names.length < 2) return { ok: false, error: 'Isian V minimal 2 simpul.' }
  if (names.length > MST_MAX_VERTICES) return { ok: false, error: `Isian V maksimal ${MST_MAX_VERTICES} simpul (Anda mengisi ${names.length}).` }
  for (const x of names) if (!NAME_RE.test(x)) return { ok: false, error: `Isian V: nama simpul "${x}" harus 1 sampai 2 huruf atau angka.` }
  if (new Set(names).size !== names.length) return { ok: false, error: 'Isian V: ada nama simpul yang ditulis lebih dari satu kali.' }

  const tokens = String(E ?? '').split(/[,;]+/).map((t) => t.trim()).filter((t) => t !== '')
  if (tokens.length === 0) return { ok: false, error: 'Isian E tidak boleh kosong. Contoh: a-b:4, b-c:8' }
  if (tokens.length > MST_MAX_EDGES) return { ok: false, error: `Isian E maksimal ${MST_MAX_EDGES} sisi (Anda mengisi ${tokens.length}).` }
  const edges = []
  const seen = new Set()
  for (const t of tokens) {
    const m = EDGE_RE.exec(t)
    if (!m) return { ok: false, error: `Isian E: sisi "${t}" belum benar. Tulis u-v:bobot, misalnya a-b:4.` }
    const [, u, v, ws] = m
    const w = Number(ws)
    if (!names.includes(u)) return { ok: false, error: `Isian E: simpul ${u} pada sisi "${t}" tidak ada di V.` }
    if (!names.includes(v)) return { ok: false, error: `Isian E: simpul ${v} pada sisi "${t}" tidak ada di V.` }
    if (u === v) return { ok: false, error: `Isian E: sisi "${t}" menghubungkan simpul dengan dirinya sendiri. Pohon tidak boleh punya loop.` }
    if (w > MST_MAX_WEIGHT) return { ok: false, error: `Isian E: bobot sisi "${t}" harus antara 0 dan ${MST_MAX_WEIGHT}.` }
    const key = [u, v].sort().join('|')
    if (seen.has(key)) return { ok: false, error: `Isian E: sisi antara ${u} dan ${v} ditulis lebih dari satu kali.` }
    seen.add(key)
    edges.push({ u, v, w })
  }
  const lost = checkConnected(names, edges.map((e) => [e.u, e.v]))
  if (lost) return { ok: false, error: `Isian E: ${lost}` }
  return { ok: true, names, edges }
}

/** Pesan kesalahan untuk isian V dan E, atau null bila sah. */
export function checkKruskalInput(values) {
  const r = parseKruskalInput(values)
  return r.ok ? null : r.error
}

/**
 * Menjalankan MST-KRUSKAL(G, w) satu langkah per pembacaan satu baris.
 *
 * Baris 2 dan 3 (inisialisasi) ditampilkan ringkas: tiap baris satu langkah yang berlaku untuk semua simpul sekaligus.
 * Mulai baris 4, satu langkah sama dengan satu baris yang dibaca, termasuk header for di baris 5 (satu kali per sisi, ditambah
 * satu pemeriksaan akhir saat sisi habis). Pengurutan di baris 4 stabil: sisi berbobot sama tetap menurut urutan penulisan.
 *
 * Dengan n simpul dan m sisi, banyaknya langkah selalu 2m + 2n + 4 (graf terhubung, jadi tepat n − 1 sisi diterima).
 *
 * @param {{ V: string, E: string }} input
 * @returns {import('../traces.js').TraceStep[]}
 */
export function kruskalPseudoTrace({ V, E }) {
  const { names, edges } = parseKruskalInput({ V, E }) // validasi sudah dilakukan checkKruskalInput
  const n = names.length
  const m = edges.length
  const order = new Map(names.map((x, i) => [x, i]))
  const dash = '–'

  /** Himpunan terpisah: tiap simpul menunjuk ke objek Set yang memuatnya. */
  let setOf = null
  let sorted = null
  /** Status tiap sisi terurut: wait, accept, atau reject. */
  let status = []
  let cur = -1 // indeks sisi (terurut) yang sedang diperiksa
  const A = []
  let total = 0
  const steps = []

  const label = (e) => `(${e.u}, ${e.v})`
  const edgeText = (e) => `${label(e)} = ${e.w}`
  const setText = (s) => `{${[...s].sort((a, b) => order.get(a) - order.get(b)).join(', ')}}`
  const groups = () => [...new Set(names.map((x) => setOf[x]))].sort((a, b) => Math.min(...[...a].map((x) => order.get(x))) - Math.min(...[...b].map((x) => order.get(x))))

  function push(line, note) {
    const e = cur >= 0 ? sorted[cur] : null
    const showFind = e !== null && line >= 6 && line <= 8
    const vars = [
      { name: 'u', value: e && line >= 5 ? e.u : dash },
      { name: 'v', value: e && line >= 5 ? e.v : dash },
      { name: 'w(u, v)', value: e && line >= 5 ? String(e.w) : dash },
      { name: 'FIND-SET(u)', value: showFind ? setText(setOf[e.u]) : dash },
      { name: 'FIND-SET(v)', value: showFind ? setText(setOf[e.v]) : dash },
      { name: '|A|', value: String(A.length) },
      { name: 'total bobot A', value: String(total) },
    ]
    const lists = [{ title: 'Himpunan A (sisi terpilih)', items: A.map(edgeText), empty: 'kosong (A = ∅)' }]
    if (setOf) {
      const g = groups()
      lists.push({ title: `Himpunan terpisah (${g.length} himpunan)`, items: g.map(setText), empty: 'belum ada' })
    }
    const step = { line, note, vars, lists }
    if (sorted) {
      step.tables = [
        {
          table: {
            caption: 'Sisi terurut menurut bobot (hasil baris 4)',
            corner: 'sisi',
            rowHeaders: sorted.map(label),
            colHeaders: ['bobot', 'hasil uji'],
            cells: sorted.map((x, i) => {
              const st = status[i]
              const mark = st === 'accept' ? 'path' : st === 'reject' ? 'unused' : i === cur ? 'current' : 'empty'
              return [
                { text: String(x.w), mark },
                { text: st === 'accept' ? 'diterima' : st === 'reject' ? 'ditolak' : '', mark },
              ]
            }),
          },
          labels: {
            empty: 'belum diperiksa',
            current: 'sisi yang sedang diperiksa',
            path: 'diterima: masuk ke A',
            unused: 'ditolak: u dan v sudah satu himpunan',
          },
          legend: ['empty', 'current', 'path', 'unused'],
        },
      ]
    }
    steps.push(step)
  }

  push(1, 'Baris 1: A = ∅. Belum ada sisi yang dipilih.')
  push(2, `Baris 2: perulangan for berlaku untuk setiap simpul v ∈ G.V (${n} simpul: ${names.join(', ')}, dalam urutan penulisan V). Baris 3 ditampilkan satu kali untuk semua simpul sekaligus.`)
  setOf = Object.fromEntries(names.map((x) => [x, new Set([x])]))
  push(3, `Baris 3: MAKE-SET(v) untuk semua simpul membentuk ${n} himpunan, masing-masing berisi satu simpul: ${groups().map(setText).join(', ')}.`)
  sorted = [...edges].sort((p, q) => p.w - q.w) // pengurutan stabil
  status = sorted.map(() => 'wait')
  push(4, `Baris 4: ${m} sisi diurutkan menurut bobot dari kecil ke besar. Sisi berbobot sama tetap menurut urutan penulisan di isian E (pengurutan stabil). Urutannya: ${sorted.map(edgeText).join(', ')}.`)

  for (let i = 0; i < m; i++) {
    cur = i
    const e = sorted[i]
    push(5, `Baris 5: sisi ke-${i + 1} dari ${m}, (u, v) = ${label(e)} dengan bobot ${e.w}.`)
    const su = setOf[e.u]
    const sv = setOf[e.v]
    if (su === sv) {
      status[i] = 'reject'
      push(
        6,
        `Baris 6: FIND-SET(${e.u}) = ${setText(su)} dan FIND-SET(${e.v}) = ${setText(sv)}. Kedua simpul ada di himpunan yang sama, jadi FIND-SET(u) ≠ FIND-SET(v) bernilai FALSE. Sisi ${label(e)} ditolak karena akan membentuk siklus, baris 7 dan 8 dilewati, dan perulangan kembali ke baris 5.`,
      )
    } else {
      push(
        6,
        `Baris 6: FIND-SET(${e.u}) = ${setText(su)} dan FIND-SET(${e.v}) = ${setText(sv)}. Kedua himpunan berbeda, jadi FIND-SET(u) ≠ FIND-SET(v) bernilai TRUE dan baris 7 dan 8 dijalankan.`,
      )
      status[i] = 'accept'
      A.push(e)
      total += e.w
      push(7, `Baris 7: A = A ∪ {${label(e)}}. Sisi ${label(e)} dengan bobot ${e.w} masuk ke A, sehingga |A| = ${A.length} dan total bobot = ${total}.`)
      const merged = new Set([...su, ...sv])
      for (const x of merged) setOf[x] = merged
      push(8, `Baris 8: UNION(${e.u}, ${e.v}) menggabungkan ${setText(su)} dan ${setText(sv)} menjadi ${setText(merged)}. Sekarang ada ${groups().length} himpunan.`)
    }
  }
  cur = -1
  push(5, `Baris 5: semua ${m} sisi sudah diambil, jadi perulangan for selesai (end for) dan lanjut ke baris 9.`)
  const last = `Baris 9: return A. Hasilnya A = {${A.map(label).join(', ')}}, ${A.length} sisi (= n − 1 = ${n - 1}) dengan total bobot ${total}. Semua simpul kini ada dalam satu himpunan ${setText(setOf[names[0]])}.`
  push(9, last)
  return steps
}

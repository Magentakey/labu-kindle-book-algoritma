// Bandingkan dua algoritma: hitungan operasi per langkah, penyelarasan langkah, dan kesimpulan otomatis.

/** Jumlah awal 0 untuk semua metrik. */
const zero = () => ({ comparisons: 0, writes: 0, detail: 0 })

const varOf = (step, name) => step.vars.find((v) => v.name === name)?.value

/**
 * Hitungan kumulatif Insertion Sort di tiap langkah: perbandingan A[i] > key (hanya bila i > 0), pergeseran (baris 5),
 * dan penulisan (pergeseran + menaruh kunci di baris 7). `detail` = jumlah pergeseran.
 */
export function insertionStats(steps) {
  const out = []
  let cur = zero()
  let shifts = 0
  let places = 0
  for (const s of steps) {
    if (s.line === 4 && Number(varOf(s, 'i')) > 0) cur = { ...cur, comparisons: cur.comparisons + 1 }
    if (s.line === 5) shifts += 1
    if (s.line === 7) places += 1
    out.push({ comparisons: cur.comparisons, writes: shifts + places, detail: shifts })
  }
  return out
}

/** Perbandingan dan penulisan satu penggabungan dua bagian terurut (dua penunjuk, tanpa sentinel). */
export function mergeCost(left, right) {
  let i = 0
  let j = 0
  let comparisons = 0
  while (i < left.length && j < right.length) {
    comparisons += 1
    if (left[i] <= right[j]) i += 1
    else j += 1
  }
  return { comparisons, writes: left.length + right.length }
}

/**
 * Hitungan kumulatif Merge Sort di tiap langkah. Setiap kali MERGE dijalankan (baris 5), biayanya dihitung dari isi array
 * pada langkah sebelumnya (sebelum digabung). `detail` = jumlah penulisan.
 */
export function mergeStats(steps) {
  const out = []
  let comparisons = 0
  let writes = 0
  steps.forEach((s, i) => {
    if (s.line === 5 && i > 0) {
      const p = Number(varOf(s, 'p'))
      const q = Number(varOf(s, 'q'))
      const r = Number(varOf(s, 'r'))
      const before = steps[i - 1].array.values
      const c = mergeCost(before.slice(p - 1, q), before.slice(q, r))
      comparisons += c.comparisons
      writes += c.writes
    }
    out.push({ comparisons, writes, detail: writes })
  })
  return out
}

/**
 * Langkah milik satu algoritma saat pemutar gabungan di langkah k: keduanya berjalan serempak, satu langkah per ketukan.
 * Algoritma yang lebih pendek berhenti di langkah terakhirnya dan menunggu, sementara yang lain terus berjalan.
 */
export function alignIndex(k, total, n) {
  if (n <= 0) return 0
  return Math.max(0, Math.min(n - 1, k))
}

const lessBetter = (a, b) => (a === b ? 0 : a < b ? -1 : 1)

/**
 * Kesimpulan otomatis dalam kalimat, mis. "Merge Sort lebih baik dalam jumlah perbandingan daripada Insertion Sort (18 vs 21)".
 * @param {{ name: string, stats: { comparisons: number, writes: number }, big: string }} a
 * @param {{ name: string, stats: { comparisons: number, writes: number }, big: string }} b
 * @param {boolean} done true bila kedua algoritma sudah selesai (kesimpulan akhir), false = sementara
 * @returns {string[]}
 */
export function conclusion(a, b, done) {
  const out = []
  const metric = (label, x, y) => {
    const c = lessBetter(x.stats[label.key], y.stats[label.key])
    if (x.stats[label.key] === 0 && y.stats[label.key] === 0) return
    if (c === 0) out.push(`Keduanya sama dalam ${label.text} (${x.stats[label.key]}).`)
    else {
      const win = c < 0 ? x : y
      const lose = c < 0 ? y : x
      out.push(`${win.name} lebih baik dalam ${label.text} daripada ${lose.name} (${win.stats[label.key]} vs ${lose.stats[label.key]}).`)
    }
  }
  metric({ key: 'comparisons', text: 'jumlah perbandingan' }, a, b)
  metric({ key: 'writes', text: 'jumlah penulisan ke array' }, a, b)
  out.push(`Secara asimtotik ${a.name} ${a.big} dan ${b.name} ${b.big}, jadi pemenangnya bergantung pada ukuran dan susunan data.`)
  out.push(done ? 'Kesimpulan ini dihitung dari seluruh langkah.' : 'Kesimpulan ini baru berdasarkan langkah yang sudah berjalan, dan bisa berubah sampai kedua algoritma selesai.')
  return out
}

const NAMA = { traversal: 'penelusuran', mst: 'pohon rentang minimum', shortest: 'jalur terpendek' }

/**
 * Hitungan kumulatif untuk pasangan graf, satu elemen per langkah. Semua dihitung dari keadaan gambar (`views`, hasil deriveViews):
 * - checks: berapa sisi sudah diperiksa (sisi berstatus "flow"; satu pemeriksaan = satu kali sisi itu mulai diperiksa),
 * - visited: berapa simpul sudah tidak lagi "belum dikunjungi", dan `order` = urutan simpul pertama kali ditemukan,
 * - weight: jumlah bobot sisi yang sudah menjadi sisi pohon,
 * - updates: berapa kali jarak d diperbarui (langkah di baris `updateLine`, bila diberikan).
 * @param {Array<{ line: number }>} steps
 * @param {Array<{ nodes: Array<{ name: string, status: string }>, edges: Array<{ w: number | null, status: string }> }>} views
 * @param {{ updateLine?: number }} [opt]
 */
export function graphStats(steps, views, opt = {}) {
  let checks = 0
  let updates = 0
  let prevFlow = -1
  const order = []
  return steps.map((step, i) => {
    const view = views[i]
    const flow = view.edges.findIndex((e) => e.status === 'flow')
    if (flow >= 0 && (flow !== prevFlow || (i > 0 && step.line < steps[i - 1].line))) checks += 1
    prevFlow = flow
    if (opt.updateLine && step.line === opt.updateLine) updates += 1
    for (const n of view.nodes) if (n.status !== 'unvisited' && !order.includes(n.name)) order.push(n.name)
    const weight = view.edges.reduce((sum, e) => (e.status === 'tree' ? sum + (e.w ?? 0) : sum), 0)
    return { checks, visited: order.length, weight, updates, order: [...order] }
  })
}

/**
 * Kesimpulan otomatis untuk pasangan graf.
 * @param {'traversal' | 'mst' | 'shortest'} topic
 * @param {{ name: string, stats: object, big: string }} a
 * @param {{ name: string, stats: object, big: string }} b
 * @param {boolean} done
 * @returns {string[]}
 */
export function graphConclusion(topic, a, b, done) {
  const out = []
  const sa = a.stats
  const sb = b.stats
  const lines = (label, key) => {
    if (sa[key] === 0 && sb[key] === 0) return
    if (sa[key] === sb[key]) out.push(`Keduanya sama dalam ${label} (${sa[key]}).`)
    else {
      const win = sa[key] < sb[key] ? a : b
      const lose = win === a ? b : a
      out.push(`${win.name} lebih sedikit dalam ${label} daripada ${lose.name} (${win.stats[key]} vs ${lose.stats[key]}).`)
    }
  }
  if (topic === 'traversal') {
    lines('jumlah sisi yang diperiksa', 'checks')
    if (sa.order.length) out.push(`Urutan simpul ditemukan: ${a.name} ${sa.order.join(', ')}; ${b.name} ${sb.order.join(', ')}.`)
    out.push(`${a.name} menjelajah per lapis memakai antrean, ${b.name} masuk sedalam mungkin dulu memakai tumpukan (rekursi), sehingga urutannya berbeda walau biayanya sama.`)
  } else if (topic === 'mst') {
    lines('jumlah sisi yang diperiksa', 'checks')
    if (sa.weight > 0 || sb.weight > 0) {
      if (sa.weight === sb.weight) out.push(`Bobot tree ${done ? 'akhir' : 'sementara'} sama: ${sa.weight}.`)
      else out.push(`Bobot tree sementara berbeda: ${a.name} ${sa.weight}, ${b.name} ${sb.weight}.`)
    }
    out.push(`${a.name} memilih sisi termurah dari seluruh graf (hutan yang menyatu), ${b.name} menumbuhkan satu pohon dari simpul awal.`)
  } else {
    lines('jumlah sisi yang diperiksa', 'checks')
    lines('jumlah pembaruan jarak', 'updates')
    out.push(`${a.name} memproses tiap simpul sekali tetapi tidak boleh ada bobot negatif; ${b.name} mengulang V − 1 putaran dan bisa mendeteksi siklus negatif.`)
  }
  out.push(`Secara asimtotik ${a.name} ${a.big} dan ${b.name} ${b.big}, jadi pemenangnya bergantung pada bentuk graf.`)
  out.push(done ? `Kesimpulan ${NAMA[topic]} ini dihitung dari seluruh langkah.` : 'Kesimpulan ini baru berdasarkan langkah yang sudah berjalan, dan bisa berubah sampai kedua algoritma selesai.')
  return out
}

/** Cara menghitung dan menamai hitungan tiap algoritma yang bisa dibandingkan. `detail` = nama metrik kedua di kartu. */
export const statsById = {
  'insertion-sort': { fn: insertionStats, detail: 'Pergeseran' },
  'merge-sort': { fn: mergeStats, detail: 'Penulisan' },
}

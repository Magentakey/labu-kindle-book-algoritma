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

/** Langkah milik satu algoritma saat pemutar gabungan di langkah k dari `total`: keduanya selesai bersamaan. */
export function alignIndex(k, total, n) {
  if (n <= 1 || total <= 1) return 0
  return Math.min(n - 1, Math.round((k * (n - 1)) / (total - 1)))
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

/** Cara menghitung dan menamai hitungan tiap algoritma yang bisa dibandingkan. `detail` = nama metrik kedua di kartu. */
export const statsById = {
  'insertion-sort': { fn: insertionStats, detail: 'Pergeseran' },
  'merge-sort': { fn: mergeStats, detail: 'Penulisan' },
}

// Geometri batang untuk tampilan array (Insertion Sort, Merge Sort, Binary Search).

/**
 * Tinggi dan posisi tiap batang di kotak `width × height` (titik 0 di dasar). Nilai terkecil tetap punya tinggi minimal,
 * dan semua nilai sama menghasilkan batang setinggi 60% kotak.
 * @returns {Array<{ x: number, y: number, w: number, h: number }>}
 */
export function barLayout(values, width, height, { minRatio = 0.12, gapRatio = 0.28 } = {}) {
  const n = values.length
  if (n === 0) return []
  const slot = width / n
  const w = slot * (1 - gapRatio)
  const lo = Math.min(...values)
  const hi = Math.max(...values)
  return values.map((v, i) => {
    const ratio = hi === lo ? 0.6 : minRatio + (1 - minRatio) * ((v - lo) / (hi - lo))
    const h = ratio * height
    return { x: i * slot + (slot - w) / 2, y: height - h, w, h }
  })
}

/** Kelas warna batang menurut tanda: kelompok semantik (selesai, diproses, dibandingkan, rentang, dibuang, kosong). */
export const BAR_GROUP = {
  normal: 'idle',
  sorted: 'done',
  placed: 'done',
  merged: 'done',
  key: 'active',
  shift: 'shift',
  gap: 'gap',
  compare: 'compare',
  right: 'compare',
  left: 'left',
  range: 'range',
  discarded: 'discarded',
  found: 'done',
  chosen: 'done',
  skipped: 'discarded',
  current: 'active',
  factor: 'compare',
  childLeft: 'left',
  childRight: 'compare',
  newNode: 'active',
}

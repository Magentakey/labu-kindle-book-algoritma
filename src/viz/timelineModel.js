// Garis waktu pemilihan aktivitas: tiap aktivitas satu baris, dari waktu mulai s sampai waktu selesai f.

/**
 * @param {number[]} s waktu mulai
 * @param {number[]} f waktu selesai
 * @param {string[]} marks tanda tiap aktivitas
 * @param {number} width lebar area gambar
 * @returns {{ max: number, ticks: number[], rows: Array<{ label: string, x: number, w: number, mark: string, start: number, finish: number }> }}
 */
export function timelineLayout(s, f, marks, width) {
  const max = Math.max(1, ...f)
  const unit = width / max
  return {
    max,
    ticks: Array.from({ length: max + 1 }, (_, i) => i),
    rows: s.map((start, i) => ({ label: `a${i + 1}`, x: start * unit, w: Math.max((f[i] - start) * unit, 2), mark: marks[i] ?? 'normal', start, finish: f[i] })),
  }
}

// Penempatan label bobot pada sisi graf. Posisinya hanya bergantung pada letak simpul dan sisi (bukan status langkah),
// sehingga label tidak berpindah-pindah saat pengguna maju-mundur antar langkah.

const T_CANDIDATES = [0.5, 0.42, 0.58, 0.34, 0.66, 0.26, 0.74, 0.2, 0.8]
// Label boleh bergeser tegak lurus dari garis (satuan viewBox) bila di atas garis tidak ada tempat; 0 diutamakan.
export const OFFSETS = [0, 20, -20]

/**
 * @param {Array<{ x1: number, y1: number, x2: number, y2: number }>} segments  garis tiap sisi (satuan viewBox)
 * @param {Array<{ x: number, y: number }>} nodes
 * @param {{ nodeHalf: number, chipW: number, chipH: number, width?: number, height?: number }} size
 *   setengah sisi kotak simpul, lebar dan tinggi label, dan ukuran kanvas (label tidak boleh keluar dari kanvas)
 * @returns {Array<{ t: number, off: number, x: number, y: number }>}
 */
export function placeLabels(segments, nodes, { nodeHalf, chipW, chipH, width = Infinity, height = Infinity }) {
  const boxes = nodes.map((n) => ({ x: n.x, y: n.y, w: nodeHalf * 2, h: nodeHalf * 2 }))
  const placed = []
  const overlap = (a, b) => {
    const w = Math.min(a.x + a.w / 2, b.x + b.w / 2) - Math.max(a.x - a.w / 2, b.x - b.w / 2)
    const h = Math.min(a.y + a.h / 2, b.y + b.h / 2) - Math.max(a.y - a.h / 2, b.y - b.h / 2)
    return w > 0 && h > 0 ? w * h : 0
  }
  return segments.map((s) => {
    const len = Math.hypot(s.x2 - s.x1, s.y2 - s.y1) || 1
    const px = -(s.y2 - s.y1) / len
    const py = (s.x2 - s.x1) / len
    let best = null
    for (const off of OFFSETS) {
      for (const t of T_CANDIDATES) {
        const x = s.x1 + (s.x2 - s.x1) * t + px * off
        const y = s.y1 + (s.y2 - s.y1) * t + py * off
        const chip = { x, y, w: chipW, h: chipH }
        let cost = Math.abs(t - 0.5) * 40 + Math.abs(off) * 1.5
        for (const b of boxes) cost += overlap(chip, b) * 3
        for (const c of placed) cost += overlap(chip, c) * 2
        // bagian label yang keluar dari kanvas
        const outX = Math.max(0, chipW / 2 - x) + Math.max(0, x + chipW / 2 - width)
        const outY = Math.max(0, chipH / 2 - y) + Math.max(0, y + chipH / 2 - height)
        cost += (outX + outY) * 30
        if (best === null || cost < best.cost) best = { t, off, x, y, cost }
      }
    }
    placed.push({ x: best.x, y: best.y, w: chipW, h: chipH })
    return { t: best.t, off: best.off, x: best.x, y: best.y }
  })
}

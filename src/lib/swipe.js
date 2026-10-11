/**
 * Arah geser sentuh pada slide: 1 = maju (geser ke kiri), -1 = mundur (geser ke kanan), 0 = bukan geser slide.
 * Geseran yang lebih vertikal daripada horizontal dibiarkan, supaya halaman tetap bisa di-scroll.
 * @param {number} dx  perubahan posisi horizontal (akhir - awal)
 * @param {number} dy  perubahan posisi vertikal
 * @param {number} [threshold] jarak minimal dalam piksel
 */
export function swipeDirection(dx, dy, threshold = 50) {
  if (Math.abs(dx) < threshold) return 0
  if (Math.abs(dx) < Math.abs(dy) * 1.5) return 0
  return dx < 0 ? 1 : -1
}

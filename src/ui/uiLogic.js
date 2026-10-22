// Logika murni komponen dasar (tanpa JSX) supaya bisa dites langsung oleh `node --test`.

/** Tipe chip dari Figma. Gaya tiap tipe ada di Chip.jsx. */
export const chipTypes = ['default', 'prasyarat', 'bab', 'sedang', 'sukses', 'gagal', 'info', 'kode']

export const PROGRESS_SEGMENTS = 8

/** Banyak balok terisi untuk nilai 0 sampai 100 (dibulatkan ke balok terdekat). */
export const filledSegments = (value) => Math.round((Math.min(100, Math.max(0, value)) / 100) * PROGRESS_SEGMENTS)

export const statusLabels = { belum: 'Belum dimulai', sedang: 'Sedang dipelajari', selesai: 'Selesai' }

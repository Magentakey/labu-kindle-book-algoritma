import { STATUS } from '../BarChart/statuses.js'

// Seperti diagram batang, pohon, dan tabel DP: tiap status dibedakan oleh pola isian, simbol, dan teks, bukan hanya warna.
// Pola dan warnanya dipinjam dari STATUS agar konsisten (hatch oranye = sedang dibandingkan, garis hijau = ditemukan/dipilih).
export const TIMELINE_STATUS = {
  normal: { label: 'belum diperiksa', glyph: '', fill: STATUS.normal.fill },
  current: { label: 'sedang diperiksa', glyph: '▶\uFE0E', fill: STATUS.compare.fill },
  selected: { label: 'dipilih', glyph: '✓', fill: STATUS.found.fill },
  rejected: { label: 'ditolak (bentrok)', glyph: '×', fill: STATUS.discarded.fill },
}

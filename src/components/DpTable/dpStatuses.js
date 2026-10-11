import { STATUS } from '../BarChart/statuses.js'

// Seperti diagram batang dan pohon: tiap status dibedakan oleh pola isian, simbol, dan teks, bukan hanya warna.
// Simbol bawaan bisa diganti per sel lewat `cell.glyph` (misalnya panah ↖ ↑ ←). Keterangan bisa diganti lewat `view.labels`.
export const DP_STATUS = {
  empty: { label: 'belum diisi', glyph: '', fill: '#ffffff' },
  filled: { label: 'sudah terisi', glyph: '', fill: '#e7e5e4' },
  current: { label: 'sel yang sedang dihitung', glyph: '▶\uFE0E', fill: STATUS.compare.fill },
  source: { label: 'sel sumber yang dipakai', glyph: '', fill: STATUS.shift.fill },
  path: { label: 'bagian dari jawaban', glyph: '★', fill: STATUS.found.fill },
  unused: {
    label: 'tidak dipakai',
    glyph: '',
    fill: 'repeating-linear-gradient(45deg, #fafaf9 0 4px, #d6d3d1 4px 5px)',
  },
}

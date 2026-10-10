import { STATUS } from '../BarChart/statuses.js'

// Sama seperti diagram batang: tiap status dibedakan oleh pola isian, simbol, dan keterangan teks,
// sehingga warna bukan satu-satunya pembeda (WCAG 1.4.1). Pola dipinjam dari STATUS agar tampilan konsisten.
// Keterangan bisa diganti per visualizer lewat `view.labels`.
export const TREE_STATUS = {
  normal: { label: 'belum diproses', glyph: '', fill: '#e7e5e4' },
  // \uFE0E memaksa ▶ tampil sebagai simbol teks, bukan emoji berwarna.
  current: { label: 'sedang diproses', glyph: '▶\uFE0E', fill: STATUS.compare.fill },
  queued: { label: 'menunggu di antrean', glyph: 'Q', fill: STATUS.shift.fill },
  waiting: { label: 'menunggu, prosesnya belum selesai', glyph: '…', fill: STATUS.right.fill },
  visited: { label: 'sudah selesai', glyph: '✓', fill: STATUS.sorted.fill },
  merged: { label: 'sudah digabung dan terurut', glyph: '=', fill: STATUS.merged.fill },
  base: { label: 'kasus dasar', glyph: 'D', fill: STATUS.key.fill },
  pickA: { label: 'dipilih pertama (terkecil)', glyph: 'm1', fill: STATUS.left.fill },
  pickB: { label: 'dipilih kedua', glyph: 'm2', fill: STATUS.right.fill },
  created: { label: 'simpul gabungan baru', glyph: '+', fill: STATUS.placed.fill },
}

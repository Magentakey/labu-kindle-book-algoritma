import { TREE_STATUS } from '../TreeCanvas/treeStatuses.js'

// Simpul memakai pola yang sama dengan visualizer pohon (pola isian + simbol + teks, bukan hanya warna).
// Keterangan tiap algoritma bisa diganti lewat `view.labels`.
export const GRAPH_NODE_STATUS = {
  normal: TREE_STATUS.normal,
  current: TREE_STATUS.current,
  queued: TREE_STATUS.queued,
  waiting: TREE_STATUS.waiting,
  visited: TREE_STATUS.visited,
}

// Sisi dibedakan oleh tebal garis, pola putus-putus, simbol di label, dan teks, bukan hanya warna.
export const GRAPH_EDGE_STATUS = {
  normal: { label: 'belum diperiksa', glyph: '', stroke: '#78716c', width: 2, dash: '' },
  considered: { label: 'sedang diperiksa', glyph: '?', stroke: '#c2410c', width: 4, dash: '9 5' },
  chosen: { label: 'dipilih', glyph: '✓', stroke: '#047857', width: 6, dash: '' },
  rejected: { label: 'dilewati', glyph: '×', stroke: '#a8a29e', width: 2, dash: '2 6' },
}

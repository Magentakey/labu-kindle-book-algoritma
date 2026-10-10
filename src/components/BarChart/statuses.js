// Setiap status dibedakan oleh 3 hal sekaligus: pola isian, simbol, dan keterangan teks,
// sehingga warna bukan satu-satunya pembeda (WCAG 1.4.1).
export const STATUS = {
  normal: { label: 'belum diproses', glyph: '', fill: '#e7e5e4' },
  sorted: { label: 'sudah terurut', glyph: '✓', fill: '#6ee7b7' },
  compare: {
    label: 'sedang dibandingkan',
    glyph: '?',
    fill: 'repeating-linear-gradient(45deg, #fb923c 0 5px, #9a3412 5px 8px)',
  },
  // Insertion sort
  shift: {
    label: 'baru digeser',
    glyph: '→',
    fill: 'radial-gradient(#0c4a6e 1.6px, transparent 1.7px) 0 0 / 8px 8px, #7dd3fc',
  },
  placed: {
    label: 'baru disisipkan',
    glyph: '↓',
    fill: 'repeating-linear-gradient(0deg, #c4b5fd 0 5px, #4c1d95 5px 7px)',
  },
  key: {
    label: 'key (nilai yang diambil)',
    glyph: 'K',
    fill: 'repeating-linear-gradient(90deg, #fde047 0 5px, #854d0e 5px 7px)',
  },
  // Merge sort
  left: {
    label: 'bagian kiri',
    glyph: 'Ki',
    fill: 'repeating-linear-gradient(135deg, #93c5fd 0 5px, #1e3a8a 5px 7px)',
  },
  right: {
    label: 'bagian kanan',
    glyph: 'Ka',
    fill: 'radial-gradient(#78350f 1.6px, transparent 1.7px) 0 0 / 8px 8px, #fcd34d',
  },
  taken: {
    label: 'sudah dipindah ke penampung',
    glyph: '↓',
    fill:
      'repeating-linear-gradient(0deg, transparent 0 5px, #374151 5px 6px), ' +
      'repeating-linear-gradient(90deg, transparent 0 5px, #374151 5px 6px), #e5e7eb',
  },
  range: {
    label: 'rentang yang sedang diproses',
    glyph: '[ ]',
    fill:
      'repeating-linear-gradient(0deg, transparent 0 7px, #0f766e 7px 8px), ' +
      'repeating-linear-gradient(90deg, #99f6e4 0 7px, #0f766e 7px 8px)',
  },
  merged: {
    label: 'sudah digabung (terurut di dalam bagiannya)',
    glyph: '=',
    fill: 'repeating-linear-gradient(0deg, #a7f3d0 0 8px, #047857 8px 10px)',
  },
  // Binary search
  discarded: {
    label: 'sudah dibuang (pasti bukan x)',
    glyph: '×',
    fill: 'repeating-linear-gradient(45deg, #fafaf9 0 4px, #78716c 4px 5px)',
  },
  found: {
    label: 'ditemukan',
    glyph: '✓',
    fill: 'repeating-linear-gradient(-45deg, #6ee7b7 0 6px, #047857 6px 8px)',
  },
}

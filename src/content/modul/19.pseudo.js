// Pseudocode Modul 19 untuk penanda {{pseudo:id}}: GENERIC-MST (5 baris), sama dengan PDF.

export const pseudo = {
  generic: {
    judul: 'GENERIC-MST',
    label: 'Pseudocode GENERIC-MST',
    header: 'GENERIC-MST(G, w)',
    baris: [
      'A = ∅',
      'while A belum membentuk spanning tree',
      '    cari busur (u, v) yang safe untuk A',
      '    A = A ∪ {(u, v)}',
      'return A',
    ],
  },
}

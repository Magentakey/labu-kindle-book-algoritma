// Pseudocode Modul 22 untuk penanda {{pseudo:id}}: INITIALIZE-SINGLE-SOURCE (4 baris) dan RELAX (3 baris), nomor baris sama dengan PDF.

export const pseudo = {
  init: {
    judul: 'INITIALIZE-SINGLE-SOURCE',
    label: 'Pseudocode INITIALIZE-SINGLE-SOURCE',
    header: 'INITIALIZE-SINGLE-SOURCE(G, s)',
    baris: [
      'for each vertex v ∈ G.V',
      '    v.d = ∞',
      '    v.π = NIL',
      's.d = 0',
    ],
  },
  relax: {
    judul: 'RELAX',
    label: 'Pseudocode RELAX',
    header: 'RELAX(u, v, w)',
    baris: [
      'if v.d > u.d + w(u, v)',
      '    v.d = u.d + w(u, v)',
      '    v.π = u',
    ],
  },
}

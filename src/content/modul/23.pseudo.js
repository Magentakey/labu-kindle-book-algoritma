// Pseudocode Modul 23 untuk penanda {{pseudo:id}}: BELLMAN-FORD (8 baris), nomor baris sama dengan PDF dan dirujuk Tabel 1.

export const pseudo = {
  bf: {
    judul: 'BELLMAN-FORD',
    label: 'Pseudocode BELLMAN-FORD',
    header: 'BELLMAN-FORD(G, w, s)',
    baris: [
      'INITIALIZE-SINGLE-SOURCE(G, s)',
      'for i = 1 to |G.V| - 1',
      '    for each edge (u, v) ∈ G.E',
      '        RELAX(u, v, w)',
      'for each edge (u, v) ∈ G.E',
      '    if v.d > u.d + w(u, v)',
      '        return FALSE',
      'return TRUE',
    ],
  },
}

// Pseudocode Modul 20 untuk penanda {{pseudo:id}}: MST-KRUSKAL (9 baris), nomor baris sama dengan PDF dan dirujuk Tabel 1.

export const pseudo = {
  kruskal: {
    judul: 'MST-KRUSKAL',
    label: 'Pseudocode MST-KRUSKAL',
    header: 'MST-KRUSKAL(G, w)',
    baris: [
      'A = ∅',
      'for each vertex v ∈ G.V',
      '    MAKE-SET(v)',
      'sort the edges of G.E into nondecreasing order by weight w',
      'for each edge (u, v) ∈ G.E, taken in nondecreasing order by weight',
      '    if FIND-SET(u) ≠ FIND-SET(v)',
      '        A = A ∪ {(u, v)}',
      '        UNION(u, v)',
      'return A',
    ],
  },
}

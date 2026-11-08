// Pseudocode Modul 21 untuk penanda {{pseudo:id}}: MST-PRIM (11 baris), nomor baris sama dengan PDF dan dirujuk Tabel 2.

export const pseudo = {
  prim: {
    judul: 'MST-PRIM',
    label: 'Pseudocode MST-PRIM',
    header: 'MST-PRIM(G, w, r)',
    baris: [
      'for each u ∈ G.V',
      '    u.key = ∞',
      '    u.π = NIL',
      'r.key = 0',
      'Q = G.V',
      'while Q ≠ ∅',
      '    u = EXTRACT-MIN(Q)',
      '    for each v ∈ G.Adj[u]',
      '        if v ∈ Q and w(u, v) < v.key',
      '            v.π = u',
      '            v.key = w(u, v)',
    ],
  },
}

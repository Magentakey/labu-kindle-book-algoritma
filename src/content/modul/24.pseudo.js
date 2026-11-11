// Pseudocode Modul 24 untuk penanda {{pseudo:id}}: DIJKSTRA (8 baris), nomor baris sama dengan PDF dan dirujuk Tabel 1.

export const pseudo = {
  dijkstra: {
    judul: 'DIJKSTRA',
    label: 'Pseudocode DIJKSTRA',
    header: 'DIJKSTRA(G, w, s)',
    baris: [
      'INITIALIZE-SINGLE-SOURCE(G, s)',
      'S = ∅',
      'Q = G.V',
      'while Q ≠ ∅',
      '    u = EXTRACT-MIN(Q)',
      '    S = S ∪ {u}',
      '    for each vertex v ∈ G.Adj[u]',
      '        RELAX(u, v, w)',
    ],
  },
}

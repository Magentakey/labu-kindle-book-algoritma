// Pseudocode Modul 18 untuk penanda {{pseudo:id}}. Nomor baris sama dengan PDF (DFS 7 baris, DFS-VISIT 10 baris) dan dirujuk "Keterangan" di 18.md. Diperiksa tes (src/content/modul18.test.js).

export const pseudo = {
  dfs: {
    judul: 'DFS',
    label: 'Pseudocode DFS',
    header: 'DFS(G)',
    baris: [
      'for each vertex u ∈ G.V',
      '    u.color = WHITE',
      '    u.π = NIL',
      'time = 0',
      'for each vertex u ∈ G.V',
      '    if u.color == WHITE',
      '        DFS-VISIT(G, u)',
    ],
  },
  visit: {
    judul: 'DFS-VISIT',
    label: 'Pseudocode DFS-VISIT',
    header: 'DFS-VISIT(G, u)',
    baris: [
      'time = time + 1',
      'u.d = time',
      'u.color = GRAY',
      'for each v ∈ G.Adj[u]',
      '    if v.color == WHITE',
      '        v.π = u',
      '        DFS-VISIT(G, v)',
      'u.color = BLACK',
      'time = time + 1',
      'u.f = time',
    ],
  },
}

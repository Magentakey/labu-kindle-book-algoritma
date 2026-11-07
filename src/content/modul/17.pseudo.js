// Pseudocode Modul 17 untuk penanda {{pseudo:id}}. Nomor baris sama dengan PDF dan dirujuk Tabel 2 di 17.md (langkah 1–18). Diperiksa tes (src/content/modul17.test.js).

export const pseudo = {
  bfs: {
    judul: 'BFS',
    label: 'Pseudocode BFS',
    header: 'BFS(G, s)',
    baris: [
      'for each vertex u ∈ G.V - {s}',
      '    u.color = WHITE',
      '    u.d = ∞',
      '    u.π = NIL',
      's.color = GRAY',
      's.d = 0',
      's.π = NIL',
      'Q = ∅',
      'ENQUEUE(Q, s)',
      'while Q ≠ ∅',
      '    u = DEQUEUE(Q)',
      '    for each v ∈ G.Adj[u]',
      '        if v.color == WHITE',
      '            v.color = GRAY',
      '            v.d = u.d + 1',
      '            v.π = u',
      '            ENQUEUE(Q, v)',
      '    u.color = BLACK',
    ],
  },
  jalur: {
    judul: 'PRINT-PATH',
    label: 'Pseudocode PRINT-PATH',
    header: 'PRINT-PATH(G, s, v)   // mencetak lintasan s ke v (Cormen dkk., 2009)',
    baris: [
      'if v == s',
      '    print s',
      'elseif v.π == NIL',
      '    print "tidak ada lintasan dari" s "ke" v',
      'else PRINT-PATH(G, s, v.π)',
      '    print v',
    ],
  },
}

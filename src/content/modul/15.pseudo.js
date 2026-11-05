// Pseudocode Modul 15 untuk penanda {{pseudo:id}}. Nomor baris sama dengan PDF dan dirujuk teks di 15.md ("Langkah 4–8"). Diperiksa tes (src/content/modul15.test.js).

export const pseudo = {
  huff: {
    judul: 'HUFFMAN',
    label: 'Pseudocode HUFFMAN',
    header: 'HUFFMAN(C)',
    baris: [
      'n = |C|',
      'Q = C',
      'for i = 1 to n - 1',
      '    allocate a new node z',
      '    z.left = x = EXTRACT-MIN(Q)',
      '    z.right = y = EXTRACT-MIN(Q)',
      '    z.freq = x.freq + y.freq',
      '    INSERT(Q, z)',
      'return EXTRACT-MIN(Q)   // akar pohon',
    ],
  },
}

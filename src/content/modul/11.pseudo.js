// Pseudocode Modul 11 untuk penanda {{pseudo:id}}. Nomor baris sama dengan PDF dan dirujuk teks di 11.md ("Baris 1–4", dst.). Isinya diperiksa tes (src/content/modul11.test.js).

export const pseudo = {
  mco: {
    judul: 'MATRIX-CHAIN-ORDER',
    label: 'Pseudocode MATRIX-CHAIN-ORDER',
    header: 'MATRIX-CHAIN-ORDER(p)',
    baris: [
      'n = p.length - 1',
      'let m[1..n, 1..n] and s[1..n-1, 2..n] be new tables',
      'for i = 1 to n',
      '    m[i, i] = 0   // rantai panjang 1',
      'for l = 2 to n   // l adalah panjang rantai',
      '    for i = 1 to n - l + 1',
      '        j = i + l - 1',
      '        m[i, j] = ∞',
      '        for k = i to j - 1   // coba setiap letak pemecah',
      '            q = m[i, k] + m[k + 1, j] + p[i-1] * p[k] * p[j]',
      '            if q < m[i, j]',
      '                m[i, j] = q',
      '                s[i, j] = k',
      'return m and s',
    ],
  },
  pop: {
    judul: 'PRINT-OPTIMAL-PARENS',
    label: 'Pseudocode PRINT-OPTIMAL-PARENS',
    header: 'PRINT-OPTIMAL-PARENS(s, i, j)   // Cormen dkk., 2009',
    baris: [
      'if i == j',
      '    print "A"i',
      'else print "("',
      '    PRINT-OPTIMAL-PARENS(s, i, s[i, j])',
      '    PRINT-OPTIMAL-PARENS(s, s[i, j] + 1, j)',
      '    print ")"',
    ],
  },
}

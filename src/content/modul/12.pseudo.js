// Pseudocode Modul 12 untuk penanda {{pseudo:id}}. Nomor baris sama dengan PDF dan dirujuk teks di 12.md ("Langkah 4–5", dst.). Diperiksa tes (src/content/modul12.test.js).

export const pseudo = {
  lcslen: {
    judul: 'LCS-LENGTH',
    label: 'Pseudocode LCS-LENGTH',
    header: 'LCS-LENGTH(X, Y)',
    baris: [
      'm = X.length',
      'n = Y.length',
      'let b[1..m, 1..n] and c[0..m, 0..n] be new tables',
      'for i = 1 to m',
      '    c[i, 0] = 0',
      'for j = 0 to n',
      '    c[0, j] = 0',
      'for i = 1 to m',
      '    for j = 1 to n',
      '        if x[i] == y[j]',
      '            c[i, j] = c[i-1, j-1] + 1',
      '            b[i, j] = "↖"',
      '        elseif c[i-1, j] ≥ c[i, j-1]',
      '            c[i, j] = c[i-1, j]',
      '            b[i, j] = "↑"',
      '        else c[i, j] = c[i, j-1]',
      '            b[i, j] = "←"',
      'return c and b',
    ],
  },
  plcs: {
    judul: 'PRINT-LCS',
    label: 'Pseudocode PRINT-LCS',
    header: 'PRINT-LCS(b, X, i, j)',
    baris: [
      'if i == 0 or j == 0',
      '    return',
      'if b[i, j] == "↖"',
      '    PRINT-LCS(b, X, i - 1, j - 1)',
      '    print x[i]',
      'elseif b[i, j] == "↑"',
      '    PRINT-LCS(b, X, i - 1, j)',
      'else PRINT-LCS(b, X, i, j - 1)',
    ],
  },
}

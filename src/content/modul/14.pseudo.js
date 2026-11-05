// Pseudocode Modul 14 untuk penanda {{pseudo:id}}. Nomor baris sama dengan PDF dan dirujuk Tabel 2 di 14.md (langkah 1–8). Diperiksa tes (src/content/modul14.test.js).

export const pseudo = {
  gas: {
    judul: 'GREEDY-ACTIVITY-SELECTOR',
    label: 'Pseudocode GREEDY-ACTIVITY-SELECTOR',
    header: 'GREEDY-ACTIVITY-SELECTOR(s, f)',
    baris: [
      'n = s.length',
      'A = {a1}',
      'k = 1',
      'for m = 2 to n',
      '    if s[m] ≥ f[k]',
      '        A = A ∪ {am}',
      '        k = m',
      'return A',
    ],
  },
}

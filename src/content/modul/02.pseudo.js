// Pseudocode Modul 02 untuk penanda {{pseudo:id}}. Isinya diperiksa tes (src/content/modul02.test.js) terhadap tabel dan teks di 02.md.

export const pseudo = {
  jumlahrek: {
    judul: 'JUMLAH_REKURSIF',
    label: 'Pseudocode JUMLAH_REKURSIF',
    header: 'JUMLAH_REKURSIF(A, n)   // jumlah A[1..n]',
    baris: ['if n == 0   // kasus dasar: array kosong', '    return 0', 'return JUMLAH_REKURSIF(A, n - 1) + A[n]   // kasus rekursif, n mengecil'],
  },
  bsiter: {
    judul: 'BINARY-SEARCH (versi iteratif)',
    label: 'Pseudocode BINARY-SEARCH iteratif',
    header: 'BINARY-SEARCH(A, x, p, n)   // versi iteratif',
    baris: ['while p ≤ n', '    mid = ⌊(p + n) / 2⌋', '    if (x == A[mid])', '        return mid', '    else if x > A[mid]', '        p = mid + 1', '    else n = mid - 1', 'return NIL   // bilangan x tidak ditemukan di dalam array A'],
  },
  bsrek: {
    judul: 'BINARY-SEARCH (versi rekursif)',
    label: 'Pseudocode BINARY-SEARCH rekursif',
    header: 'BINARY-SEARCH(A, x, p, n)   // versi rekursif',
    baris: [
      'if p > n',
      '    return NIL   // kasus dasar 1: rentang kosong, x tidak ditemukan',
      'mid = ⌊(p + n) / 2⌋',
      'if (x == A[mid])',
      '    return mid   // kasus dasar 2: x ditemukan',
      'else if x > A[mid]',
      '    return BINARY-SEARCH(A, x, mid + 1, n)',
      'else return BINARY-SEARCH(A, x, p, mid - 1)',
    ],
  },
  rantai12: {
    judul: 'Rantai pemanggilan versi rekursif untuk x = 12',
    nomor: false,
    baris: [
      'BINARY-SEARCH(A, 12, 1, 6)   mid = 3, A[3] = 9 < 12   → panggil (A, 12, 4, 6)',
      'BINARY-SEARCH(A, 12, 4, 6)   mid = 5, A[5] = 14 > 12  → panggil (A, 12, 4, 4)',
      'BINARY-SEARCH(A, 12, 4, 4)   mid = 4, A[4] = 10 < 12  → panggil (A, 12, 5, 4)',
      'BINARY-SEARCH(A, 12, 5, 4)   p > n → return NIL',
      '← NIL   ← NIL   ← NIL   (NIL diteruskan ke atas sampai pemanggil pertama)',
    ],
  },
}

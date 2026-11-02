// Pseudocode Modul 08 untuk penanda {{pseudo:id}}. Isinya diperiksa tes (src/content/modul08.test.js) terhadap implementasi di 08.hitung.js dan teks di 08.md.

export const pseudo = {
  mergesort: {
    judul: 'MERGE_SORT',
    label: 'Pseudocode MERGE_SORT',
    header: 'MERGE_SORT(A, p, r)   // p: indeks pertama, r: indeks terakhir subarray',
    baris: [
      'if p < r   // subarray berisi lebih dari satu elemen',
      '    q = ⌊(p + r) / 2⌋   // divide: indeks tengah, dibulatkan ke bawah',
      '    MERGE_SORT(A, p, q)   // conquer: urutkan A[p..q]',
      '    MERGE_SORT(A, q + 1, r)   // conquer: urutkan A[q+1..r]',
      '    MERGE(A, p, q, r)   // combine: gabungkan dua bagian terurut',
    ],
  },
  merge: {
    judul: 'MERGE',
    label: 'Pseudocode MERGE',
    header: 'MERGE(A, p, q, r)   // A[p..q] dan A[q+1..r] sudah terurut',
    baris: [
      'n1 = q - p + 1   // banyaknya elemen bagian kiri',
      'n2 = r - q   // banyaknya elemen bagian kanan',
      'let L[1..n1 + 1] and R[1..n2 + 1] be new arrays',
      'for i = 1 to n1',
      '    L[i] = A[p + i - 1]   // salin bagian kiri ke L',
      'for j = 1 to n2',
      '    R[j] = A[q + j]   // salin bagian kanan ke R',
      'L[n1 + 1] = ∞   // sentinel (penjaga)',
      'R[n2 + 1] = ∞',
      'i = 1',
      'j = 1',
      'for k = p to r   // isi kembali A[p..r] satu per satu',
      '    if L[i] ≤ R[j]',
      '        A[k] = L[i]',
      '        i = i + 1',
      '    else A[k] = R[j]',
      '        j = j + 1',
    ],
  },
}

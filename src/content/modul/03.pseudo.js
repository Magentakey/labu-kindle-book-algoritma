// Pseudocode Modul 03 untuk penanda {{pseudo:id}}. Isinya diperiksa tes (src/content/modul03.test.js) terhadap tabel cost di 03.md.

export const pseudo = {
  jumlah: {
    judul: 'JUMLAH_n_BIL',
    label: 'Pseudocode JUMLAH_n_BIL',
    header: 'JUMLAH_n_BIL(A)',
    baris: ['jumlah = 0', 'for i = 1 to n', '    jumlah = jumlah + A[i]', 'return jumlah'],
  },
  caribilk: {
    judul: 'CARI_BIL_K',
    label: 'Pseudocode CARI_BIL_K',
    header: 'CARI_BIL_K(A, k)',
    baris: ['for i = 1 to A.length', '    if (k == A[i])', '        then return i', 'return -1'],
  },
  pasangan: {
    judul: 'HITUNG_PASANGAN_SAMA',
    label: 'Pseudocode HITUNG_PASANGAN_SAMA',
    header: 'HITUNG_PASANGAN_SAMA(A)',
    baris: ['hitung = 0', 'for i = 1 to n - 1', '    for j = i + 1 to n', '        if A[i] == A[j]', '            hitung = hitung + 1', 'return hitung'],
  },
}

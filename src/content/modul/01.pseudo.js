// Pseudocode Modul 01 untuk penanda {{pseudo:id}}. Isinya diperiksa tes (src/content/modul01.test.js) terhadap tabel penelusuran di 01.md.

/** Pseudocode. `baris` tanpa nomor; indentasi dengan 4 spasi. */
export const pseudo = {
  finiteness: {
    judul: 'Contoh algoritma yang TIDAK memenuhi finiteness',
    baris: ['i = 1', 'while i > 0', '    i = i + 1   // i selalu positif, perulangan tidak pernah berhenti'],
  },
  bilmax: {
    judul: 'BILANGAN_MAX',
    label: 'Pseudocode BILANGAN_MAX',
    baris: ['max = bil1', 'if (max < bil2)', '    then max = bil2', 'if (max < bil3)', '    then max = bil3', 'return max'],
    header: 'BILANGAN_MAX(bil1, bil2, bil3)',
  },
  luas: {
    judul: 'Contoh runtunan: menghitung luas segitiga',
    baris: ['alas = 8', 'tinggi = 6', 'luas = alas * tinggi / 2   // luas = 24', 'return luas'],
  },
  jumlah: {
    judul: 'JUMLAH_n_BIL',
    label: 'Pseudocode JUMLAH_n_BIL',
    header: 'JUMLAH_n_BIL(A)   // menjumlahkan n bilangan di dalam array A[1..n]',
    baris: ['jumlah = 0', 'for i = 1 to n', '    jumlah = jumlah + A[i]   // jumlah (kiri) = nilai baru; jumlah (kanan) = nilai lama', 'return jumlah'],
  },
}

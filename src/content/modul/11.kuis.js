// Kuis Pemahaman Modul 11 (8 soal) dan kunci serta pembahasannya, dari PDF "11 - Perkalian Rantai Matriks" halaman 9–10.
// Teks memakai Markdown dengan rumus TeX ($...$). Soal 4 (alasan mengisi tabel per panjang rantai) dijawab dengan tulisan lalu dibandingkan
// dengan kunci; soal lain dinilai otomatis. Soal 7 (benar/salah dengan alasan) dinilai pada pilihan Benar/Salah; alasannya ada di pembahasan.
export const kuis11 = {
  judul: 'Perkalian Rantai Matriks',
  modul: '11',
  soal: [
    {
      no: 1,
      tipe: 'pilihan',
      teks: 'Matriks $P$ berukuran $4 \\times 7$ dan $Q$ berukuran $7 \\times 2$. Pernyataan yang benar adalah ...',
      opsi: [
        { id: 'A', teks: '$P \\times Q$ berukuran $7 \\times 7$ dengan 56 operasi perkalian.' },
        { id: 'B', teks: '$P \\times Q$ berukuran $4 \\times 2$ dengan 56 operasi perkalian.' },
        { id: 'C', teks: '$Q \\times P$ dapat dilakukan dan berukuran $7 \\times 7$.' },
        { id: 'D', teks: '$P \\times Q$ tidak dapat dilakukan.' },
      ],
      kunci: 'B',
      pembahasan: '**Jawaban: B.** Kolom $P$ (7) = baris $Q$ (7), hasil berukuran $4 \\times 2$, operasi $4 \\cdot 7 \\cdot 2 = 56$. $Q \\times P$ tidak dapat dilakukan karena kolom $Q$ (2) $\\ne$ baris $P$ (4).',
    },
    {
      no: 2,
      tipe: 'perhitungan',
      teks: '$A_1$ berukuran $10 \\times 100$, $A_2$ berukuran $100 \\times 5$, $A_3$ berukuran $5 \\times 50$. Hitung banyaknya operasi untuk $((A_1A_2)A_3)$ dan $(A_1(A_2A_3))$. Mana yang optimal?',
      isian: [
        { label: '((A1A2)A3) (operasi)', jenis: 'angka', kunci: 7500 },
        { label: '(A1(A2A3)) (operasi)', jenis: 'angka', kunci: 75000 },
        { label: 'Yang optimal', jenis: 'pilih', opsi: ['((A1A2)A3)', '(A1(A2A3))'], kunci: '((A1A2)A3)' },
      ],
      pembahasan:
        '$((A_1A_2)A_3)$: $10 \\cdot 100 \\cdot 5 = 5.000$ (hasil $10 \\times 5$), lalu $10 \\cdot 5 \\cdot 50 = 2.500$; total **7.500**. $(A_1(A_2A_3))$: $100 \\cdot 5 \\cdot 50 = 25.000$ (hasil $100 \\times 50$), lalu $10 \\cdot 100 \\cdot 50 = 50.000$; total **75.000**. Yang optimal $((A_1A_2)A_3)$, sepuluh kali lebih murah.',
    },
    {
      no: 3,
      tipe: 'perhitungan',
      teks: 'Dengan tabel $m$ pada contoh enam matriks, hitung ulang $m[3,5]$ menggunakan rumus $(*)$ dan tentukan $s[3,5]$.',
      isian: [
        { label: 'm[3,5]', jenis: 'angka', kunci: 2500 },
        { label: 's[3,5]', jenis: 'angka', kunci: 3 },
      ],
      pembahasan:
        '$k = 3$: $m[3,3] + m[4,5] + p_2p_3p_5 = 0 + 1.000 + 15 \\cdot 5 \\cdot 20 = 2.500$. $k = 4$: $m[3,4] + m[5,5] + p_2p_4p_5 = 750 + 0 + 15 \\cdot 10 \\cdot 20 = 3.750$. Minimum $m[3,5] = 2.500$ dengan $s[3,5] = 3$, yaitu $A_3(A_4A_5)$.',
    },
    {
      no: 4,
      tipe: 'analisis',
      mandiri: true,
      teks: 'Mengapa tabel $m$ harus diisi berdasarkan panjang rantai $l$, bukan baris demi baris dari $i = 1$?',
      kunciTeks:
        'Rumus m[i, j] membutuhkan m[i, k] dan m[k + 1, j], yaitu rantai yang lebih pendek. Jika diisi baris demi baris mulai i = 1, nilai seperti m[2, j] atau m[3, j] belum tersedia saat menghitung m[1, j]. Pengisian berdasarkan panjang rantai menjamin semua rantai yang lebih pendek sudah dihitung.',
      pembahasan:
        'Rumus $m[i,j]$ membutuhkan $m[i,k]$ dan $m[k+1,j]$, yaitu rantai yang lebih pendek. Jika diisi baris demi baris mulai $i = 1$, nilai seperti $m[2,j]$ atau $m[3,j]$ belum tersedia saat menghitung $m[1,j]$. Pengisian berdasarkan panjang rantai menjamin semua rantai yang lebih pendek sudah dihitung.',
    },
    {
      no: 5,
      tipe: 'penelusuran',
      teks: 'Dengan tabel $s$ pada contoh enam matriks, tentukan urutan perkalian optimal untuk sub-rantai $A_2A_3A_4A_5A_6$. Berapa biayanya?',
      isian: [
        { label: 'Urutan optimal', jenis: 'pilih', opsi: ['((A2A3)((A4A5)A6))', '(A2(A3(A4(A5A6))))', '(((A2A3)A4)(A5A6))', '((A2A3)(A4(A5A6)))'], kunci: '((A2A3)((A4A5)A6))' },
        { label: 'Biaya (operasi)', jenis: 'angka', kunci: 10500 },
      ],
      pembahasan:
        '$s[2,6] = 3$: $(A_2A_3)(A_4A_5A_6)$. $s[2,3] = 2$: $(A_2A_3)$. $s[4,6] = 5$: $((A_4A_5)A_6)$. Urutan: $((A_2A_3)((A_4A_5)A_6))$ dengan biaya $m[2,6] = $ **10.500**. (Cek: $2.625 + 3.500 + 35 \\cdot 5 \\cdot 25 = 2.625 + 3.500 + 4.375 = 10.500$.)',
    },
    {
      no: 6,
      tipe: 'perhitungan',
      teks: 'Jalankan MATRIX-CHAIN-ORDER secara manual untuk $p = \\langle 4, 10, 3, 12, 20, 7 \\rangle$ (lima matriks) sampai diperoleh $m[1,3]$ dan $s[1,3]$.',
      isian: [
        { label: 'm[1,3]', jenis: 'angka', kunci: 264 },
        { label: 's[1,3]', jenis: 'angka', kunci: 2 },
      ],
      pembahasan:
        '$m[1,2] = 4 \\cdot 10 \\cdot 3 = 120$; $m[2,3] = 10 \\cdot 3 \\cdot 12 = 360$. Untuk $m[1,3]$: $k = 1$: $0 + 360 + 4 \\cdot 10 \\cdot 12 = 840$; $k = 2$: $120 + 0 + 4 \\cdot 3 \\cdot 12 = 264$. Jadi $m[1,3] = 264$ dan $s[1,3] = 2$, yaitu $((A_1A_2)A_3)$. (Jika diteruskan sampai akhir, $m[1,5] = 1.344$ dengan urutan $((A_1A_2)((A_3A_4)A_5))$.)',
    },
    {
      no: 7,
      tipe: 'benarsalah',
      teks: '"Karena ada tiga perulangan bersarang, MATRIX-CHAIN-ORDER membutuhkan memori $\\Theta(n^3)$." Benar atau salah? Pikirkan alasannya.',
      opsi: [
        { id: 'Benar', teks: 'Benar' },
        { id: 'Salah', teks: 'Salah' },
      ],
      kunci: 'Salah',
      pembahasan: '**Salah.** Tiga perulangan bersarang menentukan **running time** $\\Theta(n^3)$. Memori ditentukan oleh ukuran tabel $m$ dan $s$, masing-masing $n \\times n$, sehingga memorinya $\\Theta(n^2)$.',
    },
    {
      no: 8,
      tipe: 'pilihan',
      teks: 'Isi $s[i,j]$ menyatakan ...',
      opsi: [
        { id: 'A', teks: 'Banyaknya operasi perkalian minimum untuk $A_i \\cdots A_j$.' },
        { id: 'B', teks: 'Ukuran matriks hasil $A_i \\cdots A_j$.' },
        { id: 'C', teks: 'Letak pemecah $k$ yang memberikan biaya minimum untuk $A_i \\cdots A_j$.' },
        { id: 'D', teks: 'Banyaknya cara menempatkan kurung pada $A_i \\cdots A_j$.' },
      ],
      kunci: 'C',
      pembahasan: '**Jawaban: C.** Pilihan A adalah isi tabel $m$. Ukuran hasil (B) selalu $p_{i-1} \\times p_j$ dan tidak perlu disimpan.',
    },
  ],
}

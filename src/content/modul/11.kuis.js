// Kuis Pemahaman Modul 11 (8 soal pilihan ganda), bersumber dari soal PDF "11 - Perkalian Rantai Matriks" halaman 9–10.
// Teks memakai Markdown dengan rumus TeX ($...$). `kunci` berupa satu id (satu jawaban) atau larik id (banyak jawaban, dinilai utuh).
export const kuis11 = {
  judul: 'Perkalian Rantai Matriks',
  modul: '11',
  soal: [
    {
      no: 1,
      teks: 'Matriks $P$ berukuran $4 \\times 7$ dan $Q$ berukuran $7 \\times 2$. Pernyataan yang benar adalah ...',
      opsi: [
        { id: 'A', teks: '$P \\times Q$ berukuran $7 \\times 7$ dengan 56 operasi perkalian.' },
        { id: 'B', teks: '$P \\times Q$ tidak dapat dilakukan.' },
        { id: 'C', teks: '$Q \\times P$ dapat dilakukan dan berukuran $7 \\times 7$.' },
        { id: 'D', teks: '$P \\times Q$ berukuran $4 \\times 2$ dengan 56 operasi perkalian.' },
      ],
      kunci: 'D',
      pembahasan: '**Jawaban: D.** Kolom $P$ (7) = baris $Q$ (7), hasil berukuran $4 \\times 2$, operasi $4 \\cdot 7 \\cdot 2 = 56$. $Q \\times P$ tidak dapat dilakukan karena kolom $Q$ (2) $\\ne$ baris $P$ (4).',
    },
    {
      no: 2,
      teks: '$A_1$ berukuran $10 \\times 100$, $A_2$ berukuran $100 \\times 5$, $A_3$ berukuran $5 \\times 50$. Pilih **tiga** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: '$((A_1A_2)A_3)$ membutuhkan 7.500 operasi.' },
        { id: 'B', teks: '$(A_1(A_2A_3))$ membutuhkan 75.000 operasi.' },
        { id: 'C', teks: '$((A_1A_2)A_3)$ adalah urutan yang optimal.' },
        { id: 'D', teks: '$(A_1(A_2A_3))$ adalah urutan yang optimal.' },
        { id: 'E', teks: '$((A_1A_2)A_3)$ membutuhkan 5.000 operasi.' },
      ],
      kunci: ['A', 'B', 'C'],
      pembahasan: '**Jawaban: A, B, dan C.** $((A_1A_2)A_3)$: $10 \\cdot 100 \\cdot 5 = 5.000$ (hasil $10 \\times 5$), lalu $10 \\cdot 5 \\cdot 50 = 2.500$; total **7.500** (5.000 hanyalah langkah pertamanya, sehingga E salah). $(A_1(A_2A_3))$: $100 \\cdot 5 \\cdot 50 = 25.000$ (hasil $100 \\times 50$), lalu $10 \\cdot 100 \\cdot 50 = 50.000$; total **75.000**. Yang optimal $((A_1A_2)A_3)$, sepuluh kali lebih murah.',
    },
    {
      no: 3,
      teks: 'Pada contoh enam matriks, nilai $m[3,3] = 0$, $m[4,5] = 1.000$, $m[3,4] = 750$, $m[5,5] = 0$, dan $p_2 = 15$, $p_3 = 5$, $p_4 = 10$, $p_5 = 20$. Hitung $m[3,5]$ dan $s[3,5]$.',
      opsi: [
        { id: 'A', teks: '$m[3,5] = 3.750$ dan $s[3,5] = 4$' },
        { id: 'B', teks: '$m[3,5] = 2.500$ dan $s[3,5] = 3$' },
        { id: 'C', teks: '$m[3,5] = 2.500$ dan $s[3,5] = 4$' },
        { id: 'D', teks: '$m[3,5] = 3.750$ dan $s[3,5] = 3$' },
      ],
      kunci: 'B',
      pembahasan: '**Jawaban: B.** $k = 3$: $m[3,3] + m[4,5] + p_2p_3p_5 = 0 + 1.000 + 15 \\cdot 5 \\cdot 20 = 2.500$. $k = 4$: $m[3,4] + m[5,5] + p_2p_4p_5 = 750 + 0 + 15 \\cdot 10 \\cdot 20 = 3.750$. Minimum $m[3,5] = 2.500$ dengan $s[3,5] = 3$, yaitu $A_3(A_4A_5)$.',
    },
    {
      no: 4,
      teks: 'Mengapa tabel $m$ harus diisi berdasarkan panjang rantai $l$, bukan baris demi baris dari $i = 1$?',
      opsi: [
        { id: 'A', teks: 'Agar memori yang dipakai lebih hemat.' },
        { id: 'B', teks: 'Agar tabel $s$ tidak perlu dibuat.' },
        { id: 'C', teks: 'Karena $m[i,j]$ membutuhkan $m[i,k]$ dan $m[k+1,j]$ (rantai yang lebih pendek), sehingga rantai pendek harus sudah dihitung lebih dulu.' },
        { id: 'D', teks: 'Karena nilai $i$ selalu sama dengan 1.' },
      ],
      kunci: 'C',
      pembahasan: '**Jawaban: C.** Jika diisi baris demi baris mulai $i = 1$, nilai seperti $m[2,j]$ atau $m[3,j]$ belum tersedia saat menghitung $m[1,j]$. Pengisian berdasarkan panjang rantai menjamin semua rantai yang lebih pendek sudah dihitung.',
    },
    {
      no: 5,
      teks: 'Dengan tabel $s$ pada contoh enam matriks, $s[2,6] = 3$, $s[2,3] = 2$, dan $s[4,6] = 5$. Urutan perkalian optimal untuk sub-rantai $A_2A_3A_4A_5A_6$ (biaya $m[2,6] = 10.500$ operasi) adalah ...',
      opsi: [
        { id: 'A', teks: '$((A_2A_3)((A_4A_5)A_6))$' },
        { id: 'B', teks: '$(A_2(A_3(A_4(A_5A_6))))$' },
        { id: 'C', teks: '$(((A_2A_3)A_4)(A_5A_6))$' },
        { id: 'D', teks: '$((A_2A_3)(A_4(A_5A_6)))$' },
      ],
      kunci: 'A',
      pembahasan: '**Jawaban: A.** $s[2,6] = 3$: $(A_2A_3)(A_4A_5A_6)$. $s[2,3] = 2$: $(A_2A_3)$. $s[4,6] = 5$: $((A_4A_5)A_6)$. Urutan: $((A_2A_3)((A_4A_5)A_6))$ dengan biaya $m[2,6] = 10.500$. (Cek: $2.625 + 3.500 + 35 \\cdot 5 \\cdot 25 = 2.625 + 3.500 + 4.375 = 10.500$.)',
    },
    {
      no: 6,
      teks: 'Jalankan MATRIX-CHAIN-ORDER untuk $p = \\langle 4, 10, 3, 12, 20, 7 \\rangle$ (lima matriks). Pilih **dua** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: '$m[1,3] = 840$' },
        { id: 'B', teks: '$m[1,3] = 264$' },
        { id: 'C', teks: '$s[1,3] = 1$' },
        { id: 'D', teks: '$s[1,3] = 2$' },
        { id: 'E', teks: '$m[1,2] = 360$' },
      ],
      kunci: ['B', 'D'],
      pembahasan: '**Jawaban: B dan D.** $m[1,2] = 4 \\cdot 10 \\cdot 3 = 120$ (bukan 360, yang merupakan $m[2,3]$); $m[2,3] = 10 \\cdot 3 \\cdot 12 = 360$. Untuk $m[1,3]$: $k = 1$: $0 + 360 + 4 \\cdot 10 \\cdot 12 = 840$; $k = 2$: $120 + 0 + 4 \\cdot 3 \\cdot 12 = 264$. Jadi $m[1,3] = 264$ dan $s[1,3] = 2$, yaitu $((A_1A_2)A_3)$.',
    },
    {
      no: 7,
      teks: 'MATRIX-CHAIN-ORDER memakai tiga perulangan bersarang dan dua tabel $n \\times n$ ($m$ dan $s$). Pilih **dua** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: 'Running time-nya $\\Theta(n^2)$.' },
        { id: 'B', teks: 'Memori yang dibutuhkan $\\Theta(n)$.' },
        { id: 'C', teks: 'Running time-nya $\\Theta(n^3)$.' },
        { id: 'D', teks: 'Memori yang dibutuhkan $\\Theta(n^3)$.' },
        { id: 'E', teks: 'Memori yang dibutuhkan $\\Theta(n^2)$.' },
      ],
      kunci: ['C', 'E'],
      pembahasan: '**Jawaban: C dan E.** Tiga perulangan bersarang menentukan **running time** $\\Theta(n^3)$. Memori ditentukan oleh ukuran tabel $m$ dan $s$, masing-masing $n \\times n$, sehingga memorinya $\\Theta(n^2)$, bukan $\\Theta(n^3)$.',
    },
    {
      no: 8,
      teks: 'Isi $s[i,j]$ menyatakan ...',
      opsi: [
        { id: 'A', teks: 'Banyaknya operasi perkalian minimum untuk $A_i \\cdots A_j$.' },
        { id: 'B', teks: 'Ukuran matriks hasil $A_i \\cdots A_j$.' },
        { id: 'C', teks: 'Banyaknya cara menempatkan kurung pada $A_i \\cdots A_j$.' },
        { id: 'D', teks: 'Letak pemecah $k$ yang memberikan biaya minimum untuk $A_i \\cdots A_j$.' },
      ],
      kunci: 'D',
      pembahasan: '**Jawaban: D.** Pilihan A adalah isi tabel $m$. Ukuran hasil (B) selalu $p_{i-1} \\times p_j$ dan tidak perlu disimpan.',
    },
  ],
}

// Kuis Pemahaman Modul 10 (7 soal pilihan ganda), bersumber dari soal PDF "10 - Konsep Dynamic Programming" halaman 8–9.
// Teks memakai Markdown dengan rumus TeX ($...$). `kunci` berupa satu id (satu jawaban) atau larik id (banyak jawaban, dinilai utuh).
export const kuis10 = {
  judul: 'Konsep Dynamic Programming',
  modul: '10',
  soal: [
    {
      no: 1,
      teks: 'Ciri yang membedakan masalah yang cocok untuk Dynamic Programming dari masalah yang cocok untuk Divide and Conquer biasa adalah ...',
      opsi: [
        { id: 'A', teks: 'Masalahnya dapat dipecah menjadi dua bagian.' },
        { id: 'B', teks: 'Masalahnya selalu berupa pengurutan.' },
        { id: 'C', teks: 'Masalahnya tidak dapat diselesaikan secara rekursif.' },
        { id: 'D', teks: 'Submasalahnya tumpang tindih sehingga submasalah yang sama muncul berulang kali.' },
      ],
      kunci: 'D',
      pembahasan: '**Jawaban: D.** Divide and Conquer juga memecah masalah (A) dan juga rekursif (C salah). Pembedanya adalah tumpang tindih: Dynamic Programming menyimpan solusi submasalah yang muncul berulang.',
    },
    {
      no: 2,
      teks: 'Tentang *optimal substructure*, pilih **dua** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: 'Solusi optimal harus sama dengan solusi masalah terkecil.' },
        { id: 'B', teks: 'Solusi optimal suatu masalah memuat solusi optimal dari submasalahnya.' },
        { id: 'C', teks: 'Sifat ini hanya berlaku untuk masalah pengurutan.' },
        { id: 'D', teks: 'Sifat ini diperlukan karena Dynamic Programming menyusun solusi besar dari nilai-nilai optimal submasalah yang disimpan di tabel.' },
        { id: 'E', teks: 'Sifat ini diperlukan agar tabel tidak memakai memori.' },
      ],
      kunci: ['B', 'D'],
      pembahasan: '**Jawaban: B dan D.** Jika solusi optimal masalah besar ternyata membutuhkan solusi submasalah yang **tidak** optimal, maka menggabungkan nilai-nilai optimal di tabel tidak akan menghasilkan jawaban yang benar. Sifat ini tidak terbatas pada pengurutan (C) dan tidak berhubungan dengan penghematan memori (E).',
    },
    {
      no: 3,
      teks: 'Rekursi biasa menghitung $F_6$ (bilangan Fibonacci). Pilih **dua** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: '$F_2$ dihitung 3 kali.' },
        { id: 'B', teks: '$F_2$ dihitung 5 kali.' },
        { id: 'C', teks: 'Total pemanggilan rekursifnya 13.' },
        { id: 'D', teks: 'Total pemanggilan rekursifnya 25.' },
        { id: 'E', teks: '$F_2$ dihitung 8 kali.' },
      ],
      kunci: ['B', 'D'],
      pembahasan: '**Jawaban: B dan D.** Banyaknya pemanggilan $F_k$ dalam menghitung $F_n$ adalah $F_{n-k+1}$ (untuk $1 \\le k \\le n$). Untuk $k = 2$, $n = 6$: $F_5 =$ **5 kali**. Total pemanggilan $= 2F_7 - 1 = 2 \\cdot 13 - 1 =$ **25**. Angka 13 adalah $F_7$, bukan total pemanggilan.',
    },
    {
      no: 4,
      teks: 'Dengan tabel harga pemotongan batang di modul ini ($p_1 = 1$, $p_2 = 5$, $p_3 = 8$, $p_4 = 9$, $p_5 = 10$), manakah yang benar tentang $r_5$?',
      opsi: [
        { id: 'A', teks: '$r_5 = 10$, tanpa dipotong.' },
        { id: 'B', teks: '$r_5 = 13$, dipotong menjadi 2 + 3.' },
        { id: 'C', teks: '$r_5 = 11$, dipotong menjadi 1 + 4.' },
        { id: 'D', teks: '$r_5 = 13$, dipotong menjadi 1 + 1 + 3.' },
      ],
      kunci: 'B',
      pembahasan: '**Jawaban: B.** $r_5 = \\max(p_1 + r_4,\\ p_2 + r_3,\\ p_3 + r_2,\\ p_4 + r_1,\\ p_5 + r_0) = \\max(1 + 10,\\ 5 + 8,\\ 8 + 5,\\ 9 + 1,\\ 10 + 0) = \\max(11, 13, 13, 10, 10) = \\mathbf{13}$. Caranya: potongan 2 dan 3 ($5 + 8 = 13$). Potongan 1 + 1 + 3 hanya bernilai $1 + 1 + 8 = 10$.',
    },
    {
      no: 5,
      teks: 'Langkah ke-4 Dynamic Programming adalah menyusun solusi optimal. Pernyataan manakah yang benar?',
      opsi: [
        { id: 'A', teks: 'Langkah ini wajib pada setiap masalah.' },
        { id: 'B', teks: 'Langkah ini tidak pernah diperlukan.' },
        { id: 'C', teks: 'Langkah ini hanya dibutuhkan bila kita ingin mengetahui solusinya, bukan hanya nilai optimalnya.' },
        { id: 'D', teks: 'Langkah ini harus dilakukan sebelum langkah 1.' },
      ],
      kunci: 'C',
      pembahasan: '**Jawaban: C.** Jika yang ditanyakan hanya "berapa operasi minimal" atau "berapa panjang LCS", langkah 1–3 sudah cukup.',
    },
    {
      no: 6,
      teks: 'Sebuah algoritma Dynamic Programming memiliki tabel $n \\times n$, dan setiap sel dihitung dengan memeriksa paling banyak $n$ sel lain. Pilih **dua** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: 'Running time-nya $O(n^2)$.' },
        { id: 'B', teks: 'Running time-nya $O(n^3)$.' },
        { id: 'C', teks: 'Memori yang dibutuhkan $\\Theta(n)$.' },
        { id: 'D', teks: 'Memori yang dibutuhkan $\\Theta(n^2)$.' },
        { id: 'E', teks: 'Memori yang dibutuhkan $\\Theta(n^3)$.' },
      ],
      kunci: ['B', 'D'],
      pembahasan: '**Jawaban: B dan D.** Ada $n^2$ sel, masing-masing butuh $O(n)$ pemeriksaan, sehingga running time-nya $O(n^3)$. Memorinya sebanding dengan ukuran tabel, yaitu $\\Theta(n^2)$. (Ini persis situasi MATRIX-CHAIN-ORDER di Modul 11.)',
    },
    {
      no: 7,
      teks: 'Apa perbedaan utama memoization (top-down) dan bottom-up?',
      opsi: [
        { id: 'A', teks: 'Memoization tetap memakai rekursi tetapi menyimpan hasil; bottom-up mengisi tabel dengan perulangan dari submasalah terkecil.' },
        { id: 'B', teks: 'Memoization tidak menyimpan hasil submasalah.' },
        { id: 'C', teks: 'Bottom-up hanya menghitung submasalah yang dibutuhkan.' },
        { id: 'D', teks: 'Bottom-up selalu lebih lambat secara asimtotik.' },
      ],
      kunci: 'A',
      pembahasan: '**Jawaban: A.** Keduanya menyimpan hasil submasalah (B salah). Justru memoization yang hanya menghitung submasalah yang dibutuhkan (C salah). Running time asimtotik keduanya umumnya sama (D salah).',
    },
  ],
}

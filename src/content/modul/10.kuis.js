// Kuis Pemahaman Modul 10 (7 soal) dan kunci serta pembahasannya, dari PDF "10 - Konsep Dynamic Programming" halaman 8–9.
// Teks memakai Markdown dengan rumus TeX ($...$). Soal 2 (penjelasan optimal substructure) dijawab dengan tulisan lalu dibandingkan dengan kunci;
// soal lain dinilai otomatis.
export const kuis10 = {
  judul: 'Konsep Dynamic Programming',
  modul: '10',
  soal: [
    {
      no: 1,
      tipe: 'pilihan',
      teks: 'Ciri yang membedakan masalah yang cocok untuk Dynamic Programming dari masalah yang cocok untuk Divide and Conquer biasa adalah ...',
      opsi: [
        { id: 'A', teks: 'Masalahnya dapat dipecah menjadi dua bagian.' },
        { id: 'B', teks: 'Submasalahnya tumpang tindih sehingga submasalah yang sama muncul berulang kali.' },
        { id: 'C', teks: 'Masalahnya selalu berupa pengurutan.' },
        { id: 'D', teks: 'Masalahnya tidak dapat diselesaikan secara rekursif.' },
      ],
      kunci: 'B',
      pembahasan: '**Jawaban: B.** Divide and Conquer juga memecah masalah (A) dan juga rekursif (D salah). Pembedanya adalah tumpang tindih: Dynamic Programming menyimpan solusi submasalah yang muncul berulang.',
    },
    {
      no: 2,
      tipe: 'analisis',
      mandiri: true,
      teks: 'Jelaskan dengan kata-katamu sendiri arti *optimal substructure*, dan berikan alasan mengapa sifat ini diperlukan agar Dynamic Programming menghasilkan jawaban yang benar.',
      kunciTeks: 'Optimal substructure berarti solusi optimal suatu masalah memuat solusi optimal dari submasalahnya. Sifat ini diperlukan karena Dynamic Programming menyusun solusi besar dari nilai-nilai optimal submasalah yang disimpan di tabel. Jika solusi optimal masalah besar ternyata membutuhkan solusi submasalah yang tidak optimal, maka menggabungkan nilai-nilai optimal di tabel tidak akan menghasilkan jawaban yang benar.',
      pembahasan:
        '*Optimal substructure* berarti solusi optimal suatu masalah memuat solusi optimal dari submasalahnya. Sifat ini diperlukan karena Dynamic Programming menyusun solusi besar dari nilai-nilai optimal submasalah yang disimpan di tabel. Jika solusi optimal masalah besar ternyata membutuhkan solusi submasalah yang **tidak** optimal, maka menggabungkan nilai-nilai optimal di tabel tidak akan menghasilkan jawaban yang benar.',
    },
    {
      no: 3,
      tipe: 'perhitungan',
      teks: 'Berapa kali $F_2$ dihitung oleh rekursi biasa ketika menghitung $F_6$? Berapa total pemanggilan rekursifnya?',
      isian: [
        { label: 'F₂ dihitung (kali)', jenis: 'angka', kunci: 5 },
        { label: 'Total pemanggilan', jenis: 'angka', kunci: 25 },
      ],
      pembahasan:
        'Banyaknya $F_2$ dihitung: $F_6 \\to F_5, F_4$; secara umum banyaknya pemanggilan $F_k$ dalam menghitung $F_n$ adalah $F_{n-k+1}$ (untuk $1 \\le k \\le n$). Untuk $k = 2$, $n = 6$: $F_5 =$ **5 kali**. Total pemanggilan $= 2F_7 - 1 = 2 \\cdot 13 - 1 =$ **25**.',
    },
    {
      no: 4,
      tipe: 'perhitungan',
      teks: 'Dengan tabel harga pemotongan batang di modul ini, hitung $r_5$ secara manual dan tentukan cara pemotongannya.',
      isian: [
        { label: 'r₅', jenis: 'angka', kunci: 13 },
        { label: 'Cara pemotongan', jenis: 'pilih', opsi: ['2 + 3', '1 + 4', '5 (tanpa dipotong)', '1 + 1 + 3'], kunci: '2 + 3' },
      ],
      pembahasan:
        '$r_5 = \\max(p_1 + r_4,\\ p_2 + r_3,\\ p_3 + r_2,\\ p_4 + r_1,\\ p_5 + r_0) = \\max(1 + 10,\\ 5 + 8,\\ 8 + 5,\\ 9 + 1,\\ 10 + 0) = \\max(11, 13, 13, 10, 10) = \\mathbf{13}$. Caranya: potongan 2 dan 3 ($5 + 8 = 13$).',
    },
    {
      no: 5,
      tipe: 'benarsalah',
      teks: '"Langkah ke-4 Dynamic Programming (menyusun solusi optimal) wajib dilakukan pada setiap masalah." Benar atau salah?',
      opsi: [
        { id: 'Benar', teks: 'Benar' },
        { id: 'Salah', teks: 'Salah' },
      ],
      kunci: 'Salah',
      pembahasan: '**Salah.** Langkah 4 hanya dibutuhkan bila kita ingin mengetahui solusinya, bukan hanya nilainya. Jika yang ditanyakan hanya "berapa operasi minimal" atau "berapa panjang LCS", langkah 1–3 sudah cukup.',
    },
    {
      no: 6,
      tipe: 'perhitungan',
      teks: 'Sebuah algoritma Dynamic Programming memiliki tabel berukuran $n \\times n$, dan setiap sel dihitung dengan memeriksa paling banyak $n$ sel lain. Berapa running time-nya? Berapa memori yang dibutuhkan?',
      isian: [
        { label: 'Running time', jenis: 'pilih', opsi: ['O(n²)', 'O(n³)', 'O(n⁴)'], kunci: 'O(n³)' },
        { label: 'Memori', jenis: 'pilih', opsi: ['Θ(n)', 'Θ(n²)', 'Θ(n³)'], kunci: 'Θ(n²)' },
      ],
      pembahasan: 'Ada $n^2$ sel, masing-masing butuh $O(n)$ pemeriksaan, sehingga running time-nya $O(n^3)$. Memorinya sebanding dengan ukuran tabel, yaitu $\\Theta(n^2)$. (Ini persis situasi MATRIX-CHAIN-ORDER di Modul 11.)',
    },
    {
      no: 7,
      tipe: 'pilihan',
      teks: 'Apa perbedaan utama memoization (top-down) dan bottom-up?',
      opsi: [
        { id: 'A', teks: 'Memoization tidak menyimpan hasil submasalah.' },
        { id: 'B', teks: 'Bottom-up hanya menghitung submasalah yang dibutuhkan.' },
        { id: 'C', teks: 'Memoization tetap memakai rekursi tetapi menyimpan hasil; bottom-up mengisi tabel dengan perulangan dari submasalah terkecil.' },
        { id: 'D', teks: 'Bottom-up selalu lebih lambat secara asimtotik.' },
      ],
      kunci: 'C',
      pembahasan: '**Jawaban: C.** Keduanya menyimpan hasil submasalah (A salah). Justru memoization yang hanya menghitung submasalah yang dibutuhkan (B salah). Running time asimtotik keduanya umumnya sama (D salah).',
    },
  ],
}

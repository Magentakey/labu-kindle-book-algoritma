// Kuis Pemahaman Modul 13 (7 soal pilihan ganda), bersumber dari soal PDF "13 - Konsep Algoritma Greedy" halaman 7–8.
// Teks memakai Markdown dengan rumus TeX ($...$). `kunci` berupa satu id (satu jawaban) atau larik id (banyak jawaban, dinilai utuh).
export const kuis13 = {
  judul: 'Konsep Algoritma Greedy',
  modul: '13',
  soal: [
    {
      no: 1,
      teks: 'Ciri utama algoritma Greedy adalah ...',
      opsi: [
        { id: 'A', teks: 'Mencoba semua kemungkinan solusi lalu memilih yang terbaik.' },
        { id: 'B', teks: 'Memilih yang terlihat terbaik saat ini tanpa meninjau ulang keputusan.' },
        { id: 'C', teks: 'Menyimpan solusi submasalah di tabel.' },
        { id: 'D', teks: 'Selalu menghasilkan solusi optimal.' },
      ],
      kunci: 'B',
      pembahasan: '**Jawaban: B.** Pilihan A adalah brute force, C adalah Dynamic Programming, dan D salah karena Greedy tidak selalu optimal.',
    },
    {
      no: 2,
      teks: 'Dengan pecahan koin $\\{1, 6, 10\\}$ dan jumlah 12, pilih **tiga** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: 'Greedy menghasilkan 3 koin ($10 + 1 + 1$).' },
        { id: 'B', teks: 'Hasil greedy tidak optimal.' },
        { id: 'C', teks: 'Jumlah koin minimal adalah 2 ($6 + 6$).' },
        { id: 'D', teks: 'Greedy menghasilkan 2 koin.' },
        { id: 'E', teks: 'Jumlah koin minimal adalah 3.' },
      ],
      kunci: ['A', 'B', 'C'],
      pembahasan: '**Jawaban: A, B, dan C.** Greedy: $10 + 1 + 1 =$ **3 koin**. Tidak optimal, karena $6 + 6$ hanya **2 koin**.',
    },
    {
      no: 3,
      teks: 'Sebuah algoritma Greedy memberikan jawaban optimal untuk beberapa contoh data. Apa kesimpulan yang tepat?',
      opsi: [
        { id: 'A', teks: 'Algoritma itu terbukti benar.' },
        { id: 'B', teks: 'Algoritma itu terbukti benar bila berhasil pada sedikitnya sepuluh contoh.' },
        { id: 'C', teks: 'Belum terbukti: cukup satu contoh penyangkal untuk menyalahkannya (seperti koin $\\{1, 3, 4\\}$ yang gagal untuk 6), jadi kebenarannya harus dibuktikan, misalnya dengan argumen pertukaran.' },
        { id: 'D', teks: 'Algoritma itu terbukti benar bila berjalan cepat.' },
      ],
      kunci: 'C',
      pembahasan: '**Jawaban: C.** Beberapa contoh yang berhasil tidak membuktikan apa pun; cukup satu contoh penyangkal untuk menunjukkan algoritma salah (seperti koin $\\{1, 3, 4\\}$ yang berhasil untuk banyak jumlah, tetapi gagal untuk 6).',
    },
    {
      no: 4,
      teks: 'Bagaimana perbedaan cara Dynamic Programming dan Greedy mengambil keputusan?',
      opsi: [
        { id: 'A', teks: 'Dynamic Programming memilih sebelum menyelesaikan submasalah, Greedy memilih sesudahnya.' },
        { id: 'B', teks: 'Keduanya memilih sebelum menyelesaikan submasalah.' },
        { id: 'C', teks: 'Keduanya memilih sesudah menyelesaikan semua submasalah.' },
        { id: 'D', teks: 'Dynamic Programming memilih sesudah menyelesaikan submasalah (memakai nilai yang sudah dihitung), sedangkan Greedy memilih sebelum menyelesaikan submasalah.' },
      ],
      kunci: 'D',
      pembahasan: '**Jawaban: D.** Dynamic Programming memilih **sesudah** menyelesaikan submasalah: nilai setiap pilihan bergantung pada solusi submasalah yang sudah dihitung, lalu dipilih yang terbaik. Greedy memilih **sebelum** menyelesaikan submasalah: pilihan diambil berdasarkan informasi saat itu, baru kemudian satu submasalah yang tersisa diselesaikan.',
    },
    {
      no: 5,
      teks: 'Pada contoh knapsack di modul ini, kapasitas tas diubah menjadi 30 kg. Barang 1: 10 kg bernilai 60, barang 2: 20 kg bernilai 100, barang 3: 30 kg bernilai 120. Greedy memilih berdasarkan nilai per kg. Pilih **dua** pernyataan yang benar untuk knapsack 0-1.',
      opsi: [
        { id: 'A', teks: 'Total nilai greedy adalah 120.' },
        { id: 'B', teks: 'Total nilai greedy adalah 160.' },
        { id: 'C', teks: 'Greedy tidak optimal pada kasus ini.' },
        { id: 'D', teks: 'Total nilai optimal adalah 160.' },
        { id: 'E', teks: 'Total nilai optimal adalah 180.' },
      ],
      kunci: ['B', 'D'],
      pembahasan: '**Jawaban: B dan D.** Urutan nilai per kg: barang 1 (6), 2 (5), 3 (4). Greedy: barang 1 (10 kg, 60), barang 2 (20 kg, 100), total berat 30 kg; barang 3 tidak muat. Total **160**. Kemungkinan lain yang muat: barang 3 saja (120), barang 1 + 2 (160). Jadi kali ini greedy **optimal** (160). Ini menunjukkan bahwa greedy kadang berhasil pada knapsack 0-1, tetapi tidak dapat diandalkan.',
    },
    {
      no: 6,
      teks: 'Sifat yang menyatakan "selalu ada solusi optimal yang memuat pilihan greedy pertama" disebut ...',
      opsi: [
        { id: 'A', teks: 'Greedy-choice property' },
        { id: 'B', teks: 'Optimal substructure' },
        { id: 'C', teks: 'Overlapping subproblems' },
        { id: 'D', teks: 'Loop invariant' },
      ],
      kunci: 'A',
      pembahasan: '**Jawaban: A.** Optimal substructure (B) menyatakan solusi optimal tersusun dari solusi optimal submasalah.',
    },
    {
      no: 7,
      teks: 'Tentang pilihan greedy pada algoritma Dijkstra dan Huffman, pilih **dua** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: 'Huffman menggabungkan dua simpul yang frekuensinya paling besar.' },
        { id: 'B', teks: 'Dijkstra mengambil simpul yang jarak sementaranya dari sumber paling kecil di antara simpul yang belum selesai.' },
        { id: 'C', teks: 'Dijkstra mengambil simpul yang jarak sementaranya paling besar.' },
        { id: 'D', teks: 'Huffman menggabungkan simpul berdasarkan urutan abjad karakter.' },
        { id: 'E', teks: 'Huffman menggabungkan dua simpul (karakter atau subpohon) yang frekuensinya paling kecil menjadi satu simpul baru.' },
      ],
      kunci: ['B', 'E'],
      pembahasan: '**Jawaban: B dan E.** **Dijkstra**: mengambil (*extract*) simpul yang jarak sementaranya dari sumber paling kecil di antara simpul yang belum selesai. **Huffman**: menggabungkan dua simpul (karakter atau subpohon) yang frekuensinya paling kecil menjadi satu simpul baru.',
    },
  ],
}

// Kuis Pemahaman Modul 13 (7 soal) dan kunci serta pembahasannya, dari PDF "13 - Konsep Algoritma Greedy" halaman 7–8.
// Teks memakai Markdown dengan rumus TeX ($...$). Soal 4 dan 7 (jawaban uraian) dinilai sendiri dengan membandingkan kunci;
// soal lain dinilai otomatis. Soal 3 (benar/salah dengan alasan) dinilai pada pilihan Benar/Salah; alasannya ada di pembahasan.
export const kuis13 = {
  judul: 'Konsep Algoritma Greedy',
  modul: '13',
  soal: [
    {
      no: 1,
      tipe: 'pilihan',
      teks: 'Ciri utama algoritma Greedy adalah ...',
      opsi: [
        { id: 'A', teks: 'Mencoba semua kemungkinan solusi lalu memilih yang terbaik.' },
        { id: 'B', teks: 'Menyimpan solusi submasalah di tabel.' },
        { id: 'C', teks: 'Memilih yang terlihat terbaik saat ini tanpa meninjau ulang keputusan.' },
        { id: 'D', teks: 'Selalu menghasilkan solusi optimal.' },
      ],
      kunci: 'C',
      pembahasan: '**Jawaban: C.** Pilihan A adalah brute force, B adalah Dynamic Programming, dan D salah karena Greedy tidak selalu optimal.',
    },
    {
      no: 2,
      tipe: 'perhitungan',
      teks: 'Dengan pecahan koin $\\{1, 6, 10\\}$, tentukan hasil greedy untuk jumlah 12. Apakah optimal? Jika tidak, berapa jumlah koin minimal?',
      isian: [
        { label: 'Banyak koin hasil greedy', jenis: 'angka', kunci: 3 },
        { label: 'Apakah greedy optimal?', jenis: 'pilih', opsi: ['Ya', 'Tidak'], kunci: 'Tidak' },
        { label: 'Jumlah koin minimal', jenis: 'angka', kunci: 2 },
      ],
      pembahasan: 'Greedy: $10 + 1 + 1 =$ **3 koin**. Tidak optimal, karena $6 + 6$ hanya **2 koin**.',
    },
    {
      no: 3,
      tipe: 'benarsalah',
      teks: '"Jika sebuah algoritma Greedy memberikan jawaban optimal untuk beberapa contoh data, maka algoritma itu terbukti benar." Benar atau salah? Pikirkan alasannya.',
      opsi: [
        { id: 'Benar', teks: 'Benar' },
        { id: 'Salah', teks: 'Salah' },
      ],
      kunci: 'Salah',
      pembahasan:
        '**Salah.** Beberapa contoh yang berhasil tidak membuktikan apa pun; cukup satu contoh penyangkal untuk menunjukkan algoritma salah (seperti koin $\\{1, 3, 4\\}$ yang berhasil untuk banyak jumlah, tetapi gagal untuk 6). Kebenaran harus dibuktikan, misalnya dengan argumen pertukaran.',
    },
    {
      no: 4,
      tipe: 'analisis',
      mandiri: true,
      teks: 'Jelaskan perbedaan cara Dynamic Programming dan Greedy dalam mengambil keputusan, menggunakan istilah "sebelum" dan "sesudah" menyelesaikan submasalah.',
      kunciTeks:
        'Dynamic Programming memilih sesudah menyelesaikan submasalah: nilai setiap pilihan bergantung pada solusi submasalah yang sudah dihitung, lalu dipilih yang terbaik. Greedy memilih sebelum menyelesaikan submasalah: pilihan diambil berdasarkan informasi saat itu, baru kemudian satu submasalah yang tersisa diselesaikan.',
      pembahasan:
        'Dynamic Programming memilih **sesudah** menyelesaikan submasalah: nilai setiap pilihan bergantung pada solusi submasalah yang sudah dihitung, lalu dipilih yang terbaik. Greedy memilih **sebelum** menyelesaikan submasalah: pilihan diambil berdasarkan informasi saat itu, baru kemudian satu submasalah yang tersisa diselesaikan.',
    },
    {
      no: 5,
      tipe: 'analisis',
      teks: 'Pada contoh knapsack di modul ini, kapasitas tas diubah menjadi 30 kg. Hitung hasil greedy (berdasarkan nilai per kg) untuk knapsack 0-1 dan bandingkan dengan solusi optimalnya.',
      isian: [
        { label: 'Total nilai greedy 0-1', jenis: 'angka', kunci: 160 },
        { label: 'Total nilai optimal 0-1', jenis: 'angka', kunci: 160 },
        { label: 'Apakah greedy optimal?', jenis: 'pilih', opsi: ['Ya', 'Tidak'], kunci: 'Ya' },
      ],
      pembahasan:
        'Urutan nilai per kg: barang 1 (6), 2 (5), 3 (4). Greedy: barang 1 (10 kg, 60), barang 2 (20 kg, 100), total berat 30 kg; barang 3 tidak muat. Total **160**. Kemungkinan lain yang muat: barang 3 saja (120), barang 1 + 2 (160). Jadi kali ini greedy **optimal** (160). Ini menunjukkan bahwa greedy kadang berhasil pada knapsack 0-1, tetapi tidak dapat diandalkan.',
    },
    {
      no: 6,
      tipe: 'pilihan',
      teks: 'Sifat yang menyatakan "selalu ada solusi optimal yang memuat pilihan greedy pertama" disebut ...',
      opsi: [
        { id: 'A', teks: 'Optimal substructure' },
        { id: 'B', teks: 'Overlapping subproblems' },
        { id: 'C', teks: 'Greedy-choice property' },
        { id: 'D', teks: 'Loop invariant' },
      ],
      kunci: 'C',
      pembahasan: '**Jawaban: C.** Optimal substructure (A) menyatakan solusi optimal tersusun dari solusi optimal submasalah.',
    },
    {
      no: 7,
      tipe: 'analisis',
      mandiri: true,
      teks: 'Untuk algoritma Dijkstra dan algoritma Huffman, sebutkan pilihan greedy yang dibuat di setiap langkah.',
      kunciTeks:
        'Dijkstra: mengambil (extract) simpul yang jarak sementaranya dari sumber paling kecil di antara simpul yang belum selesai. Huffman: menggabungkan dua simpul (karakter atau subpohon) yang frekuensinya paling kecil menjadi satu simpul baru.',
      pembahasan:
        '**Dijkstra**: mengambil (*extract*) simpul yang jarak sementaranya dari sumber paling kecil di antara simpul yang belum selesai. **Huffman**: menggabungkan dua simpul (karakter atau subpohon) yang frekuensinya paling kecil menjadi satu simpul baru.',
    },
  ],
}

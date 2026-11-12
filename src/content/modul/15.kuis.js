// Kuis Pemahaman Modul 15 (8 soal pilihan ganda), bersumber dari soal PDF "15 - Kode Huffman" halaman 9–10.
// Teks memakai Markdown dengan rumus TeX ($...$). `kunci` berupa satu id (satu jawaban) atau larik id (banyak jawaban, dinilai utuh).
export const kuis15 = {
  judul: 'Kode Huffman',
  modul: '15',
  soal: [
    {
      no: 1,
      teks: 'Manakah yang merupakan kode prefiks?',
      opsi: [
        { id: 'A', teks: '{0, 01, 11}' },
        { id: 'B', teks: '{1, 10, 100}' },
        { id: 'C', teks: '{0, 10, 110, 111}' },
        { id: 'D', teks: '{00, 0, 11}' },
      ],
      kunci: 'C',
      pembahasan: '**Jawaban: C.** A bukan kode prefiks (0 adalah awalan 01). B bukan (1 awalan 10). D bukan (0 awalan 00).',
    },
    {
      no: 2,
      teks: 'Sebuah berkas berisi 1.000 karakter dari 10 jenis karakter. Pilih **dua** pernyataan yang benar tentang kode panjang tetap.',
      opsi: [
        { id: 'A', teks: 'Dibutuhkan minimum 3 bit per karakter.' },
        { id: 'B', teks: 'Total bit yang dibutuhkan adalah 4.000.' },
        { id: 'C', teks: 'Dibutuhkan minimum 5 bit per karakter.' },
        { id: 'D', teks: 'Dibutuhkan minimum 4 bit per karakter.' },
        { id: 'E', teks: 'Total bit yang dibutuhkan adalah 3.000.' },
      ],
      kunci: ['B', 'D'],
      pembahasan: '**Jawaban: B dan D.** Dibutuhkan $\\lceil \\lg 10 \\rceil = 4$ bit, karena $2^3 = 8 < 10 \\le 16 = 2^4$ (3 bit hanya cukup untuk 8 jenis). Total $1.000 \\times 4 =$ **4.000 bit**.',
    },
    {
      no: 3,
      teks: 'Dengan kode Huffman contoh modul ini ($a = 0$, $b = 101$, $c = 100$, $d = 111$), decode barisan `0101100111` dan encode kata "dad". Pilih **dua** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: 'Hasil decode adalah "bacd".' },
        { id: 'B', teks: 'Hasil decode adalah "abcd".' },
        { id: 'C', teks: 'Encoding "dad" adalah `111011`.' },
        { id: 'D', teks: 'Encoding "dad" adalah `1110111` (7 bit).' },
        { id: 'E', teks: 'Encoding "dad" adalah `0111011`.' },
      ],
      kunci: ['B', 'D'],
      pembahasan: '**Jawaban: B dan D.** `0|101|100|111` = **"abcd"**. Encoding "dad": d = 111, a = 0, d = 111, sehingga `1110111` (7 bit).',
    },
    {
      no: 4,
      teks: 'Bangun pohon Huffman untuk frekuensi A:20, B:10, C:5, D:40, E:25. Pilih **dua** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: 'Total bit (frekuensi $\\times$ panjang kode) adalah 300.' },
        { id: 'B', teks: 'Penggabungan pertama adalah C:5 + B:10 = 15.' },
        { id: 'C', teks: 'Penggabungan pertama adalah A:20 + B:10 = 30.' },
        { id: 'D', teks: 'Total bit (frekuensi $\\times$ panjang kode) adalah 210.' },
        { id: 'E', teks: 'Penggabungan terakhir adalah E:25 + [75] = 100.' },
      ],
      kunci: ['B', 'D'],
      pembahasan: '**Jawaban: B dan D.** Awal: C:5, B:10, A:20, E:25, D:40. (1) C:5 + B:10 = 15. (2) [15] + A:20 = 35. (3) E:25 + [35] = 60. (4) D:40 + [60] = 100. Panjang kode: D = 1, E = 2, A = 3, B = 4, C = 4. Total $= 40 \\cdot 1 + 25 \\cdot 2 + 20 \\cdot 3 + 10 \\cdot 4 + 5 \\cdot 4 = 40 + 50 + 60 + 40 + 20 =$ **210** (kode panjang tetap 3 bit akan memakai 300).',
    },
    {
      no: 5,
      teks: 'Apakah kode yang dihasilkan algoritma Huffman optimal, mengingat Huffman bersifat greedy?',
      opsi: [
        { id: 'A', teks: 'Tidak selalu optimal, seperti algoritma greedy lainnya.' },
        { id: 'B', teks: 'Ya: Huffman telah dibuktikan optimal di antara semua kode prefiks, karena masalahnya memiliki greedy-choice property dan optimal substructure.' },
        { id: 'C', teks: 'Optimal hanya bila semua frekuensi sama.' },
        { id: 'D', teks: 'Optimal hanya dibandingkan dengan kode panjang tetap.' },
      ],
      kunci: 'B',
      pembahasan: '**Jawaban: B.** Tidak semua algoritma greedy optimal, tetapi Huffman telah **dibuktikan** optimal di antara semua kode prefiks.',
    },
    {
      no: 6,
      teks: 'Mengapa pohon kode optimal tidak pernah memiliki simpul dalam dengan satu anak saja?',
      opsi: [
        { id: 'A', teks: 'Agar pohon lebih mudah digambar.' },
        { id: 'B', teks: 'Karena kode harus berpanjang tetap.' },
        { id: 'C', teks: 'Karena simpul beranak satu menambah frekuensi total.' },
        { id: 'D', teks: 'Simpul beranak satu bisa dihapus dan anaknya dinaikkan, sehingga semua kode di bawahnya lebih pendek 1 bit dan total bit berkurang.' },
      ],
      kunci: 'D',
      pembahasan: '**Jawaban: D.** Bit pada busur ke anak tunggal tidak membedakan apa pun. Pada pohon kode tetap di modul ini, simpul "14" di kanan hanya punya satu anak; jika dihilangkan, e dan f cukup memakai kode 2 bit (10 dan 11), sehingga kode tetap 3 bit itu bukan yang optimal.',
    },
    {
      no: 7,
      teks: 'Jika ada 256 jenis karakter, pilih **dua** pernyataan yang benar tentang algoritma HUFFMAN.',
      opsi: [
        { id: 'A', teks: 'Perulangan dijalankan 256 kali.' },
        { id: 'B', teks: 'Banyaknya operasi heap (EXTRACT-MIN dan INSERT) sekitar 765.' },
        { id: 'C', teks: 'Banyaknya operasi heap sekitar 512.' },
        { id: 'D', teks: 'Perulangan dijalankan 255 kali.' },
        { id: 'E', teks: 'Banyaknya operasi heap sekitar 1.024.' },
      ],
      kunci: ['B', 'D'],
      pembahasan: '**Jawaban: B dan D.** Perulangan berjalan $256 - 1 =$ **255 kali**. Setiap putaran: 2 EXTRACT-MIN dan 1 INSERT, total sekitar $3 \\times 255 = 765$ operasi heap, masing-masing $O(\\lg 256) = O(8)$ langkah perbandingan, ditambah pembentukan heap awal.',
    },
    {
      no: 8,
      teks: 'Pada contoh modul ini, karakter mana yang kodenya paling panjang dan mengapa?',
      opsi: [
        { id: 'A', teks: 'e dan f, karena frekuensinya paling kecil sehingga digabung paling awal dan berada paling dalam.' },
        { id: 'B', teks: 'a, karena muncul paling sering.' },
        { id: 'C', teks: 'd, karena berada di urutan terakhir.' },
        { id: 'D', teks: 'Semua sama panjang.' },
      ],
      kunci: 'A',
      pembahasan: '**Jawaban: A.** e (9) dan f (5) adalah dua frekuensi terkecil, sehingga digabung pada loop pertama dan menjadi daun terdalam (kode 4 bit).',
    },
  ],
}

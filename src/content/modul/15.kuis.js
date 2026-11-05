// Kuis Pemahaman Modul 15 (8 soal) dan kunci serta pembahasannya, dari PDF "15 - Kode Huffman" halaman 9–10.
// Teks memakai Markdown dengan rumus TeX ($...$). Soal 6 (jawaban uraian) dinilai sendiri dengan membandingkan kunci; soal lain dinilai otomatis.
// Soal 5 (benar/salah dengan alasan) dinilai pada pilihan Benar/Salah; alasannya ada di pembahasan.
export const kuis15 = {
  judul: 'Kode Huffman',
  modul: '15',
  soal: [
    {
      no: 1,
      tipe: 'pilihan',
      teks: 'Manakah yang merupakan kode prefiks?',
      opsi: [
        { id: 'A', teks: '{0, 01, 11}' },
        { id: 'B', teks: '{0, 10, 110, 111}' },
        { id: 'C', teks: '{1, 10, 100}' },
        { id: 'D', teks: '{00, 0, 11}' },
      ],
      kunci: 'B',
      pembahasan: '**Jawaban: B.** A bukan kode prefiks (0 adalah awalan 01). C bukan (1 awalan 10). D bukan (0 awalan 00).',
    },
    {
      no: 2,
      tipe: 'perhitungan',
      teks: 'Sebuah berkas berisi 1.000 karakter dari 10 jenis karakter. Berapa bit minimum per karakter untuk kode panjang tetap, dan berapa total bitnya?',
      isian: [
        { label: 'Bit minimum per karakter', jenis: 'angka', kunci: 4 },
        { label: 'Total bit', jenis: 'angka', kunci: 4000 },
      ],
      pembahasan: 'Dibutuhkan $\\lceil \\lg 10 \\rceil = 4$ bit, karena $2^3 = 8 < 10 \\le 16 = 2^4$. Total $1.000 \\times 4 =$ **4.000 bit**.',
    },
    {
      no: 3,
      tipe: 'perhitungan',
      teks: 'Dengan kode Huffman contoh modul ini, decode barisan `0101100111`, lalu encode kata "dad".',
      isian: [
        { label: 'Hasil decode', jenis: 'pilih', opsi: ['abcd', 'abdc', 'bacd', 'acbd'], kunci: 'abcd' },
        { label: 'Encoding "dad"', jenis: 'pilih', opsi: ['1110111', '1110011', '0111011', '111011'], kunci: '1110111' },
        { label: 'Panjang encoding (bit)', jenis: 'angka', kunci: 7 },
      ],
      pembahasan: '`0|101|100|111` = **"abcd"**. Encoding "dad": d = 111, a = 0, d = 111, sehingga `1110111` (7 bit).',
    },
    {
      no: 4,
      tipe: 'penelusuran',
      teks: 'Bangun pohon Huffman untuk frekuensi A:20, B:10, C:5, D:40, E:25. Tuliskan urutan penggabungan dan total bit (frekuensi × panjang kode).',
      isian: [
        {
          label: 'Urutan penggabungan',
          jenis: 'pilih',
          opsi: [
            'C:5 + B:10 = 15; [15] + A:20 = 35; E:25 + [35] = 60; D:40 + [60] = 100',
            'A:20 + B:10 = 30; C:5 + [30] = 35; E:25 + [35] = 60; D:40 + [60] = 100',
            'C:5 + B:10 = 15; A:20 + E:25 = 45; [15] + [45] = 60; D:40 + [60] = 100',
            'D:40 + E:25 = 65; A:20 + B:10 = 30; C:5 + [30] = 35; [35] + [65] = 100',
          ],
          kunci: 'C:5 + B:10 = 15; [15] + A:20 = 35; E:25 + [35] = 60; D:40 + [60] = 100',
        },
        { label: 'Total bit', jenis: 'angka', kunci: 210 },
      ],
      pembahasan:
        'Awal: C:5, B:10, A:20, E:25, D:40. (1) C:5 + B:10 = 15. (2) [15] + A:20 = 35. (3) E:25 + [35] = 60. (4) D:40 + [60] = 100. Panjang kode: D = 1, E = 2, A = 3, B = 4, C = 4 (misalnya D = 0, E = 10, A = 111, C = 1100, B = 1101). Total $= 40 \\cdot 1 + 25 \\cdot 2 + 20 \\cdot 3 + 10 \\cdot 4 + 5 \\cdot 4 = 40 + 50 + 60 + 40 + 20 =$ **210**.',
    },
    {
      no: 5,
      tipe: 'benarsalah',
      teks: '"Karena Huffman bersifat greedy, kode yang dihasilkannya tidak selalu optimal." Benar atau salah? Pikirkan alasannya.',
      opsi: [
        { id: 'Benar', teks: 'Benar' },
        { id: 'Salah', teks: 'Salah' },
      ],
      kunci: 'Salah',
      pembahasan: '**Salah.** Tidak semua algoritma greedy optimal, tetapi Huffman telah **dibuktikan** optimal di antara semua kode prefiks, karena masalahnya memiliki greedy-choice property dan optimal substructure.',
    },
    {
      no: 6,
      tipe: 'analisis',
      mandiri: true,
      teks: 'Mengapa pohon kode optimal tidak pernah memiliki simpul dalam dengan satu anak saja? Gunakan pohon kode panjang tetap pada modul ini sebagai contoh.',
      kunciTeks:
        'Jika simpul dalam hanya punya satu anak, bit pada busur ke anak tunggal itu tidak membedakan apa pun. Kita bisa menghapus simpul tersebut dan menaikkan anaknya, sehingga semua kode di bawahnya lebih pendek 1 bit dan total bit berkurang. Pada pohon kode tetap, simpul "14" di kanan hanya punya satu anak; jika dihilangkan, e dan f cukup memakai kode 2 bit (10 dan 11), sehingga kode tetap 3 bit itu bukan yang optimal.',
      pembahasan:
        'Jika simpul dalam hanya punya satu anak, bit pada busur ke anak tunggal itu tidak membedakan apa pun. Kita bisa menghapus simpul tersebut dan menaikkan anaknya, sehingga semua kode di bawahnya lebih pendek 1 bit dan total bit berkurang. Pada pohon kode tetap, simpul "14" di kanan hanya punya satu anak; jika dihilangkan, e dan f cukup memakai kode 2 bit (10 dan 11), sehingga kode tetap 3 bit itu bukan yang optimal.',
    },
    {
      no: 7,
      tipe: 'perhitungan',
      teks: 'Jika ada 256 jenis karakter, berapa kali perulangan HUFFMAN dijalankan? Berapa perkiraan banyaknya operasi heap?',
      isian: [
        { label: 'Banyak putaran perulangan', jenis: 'angka', kunci: 255 },
        { label: 'Perkiraan banyaknya operasi heap (EXTRACT-MIN dan INSERT)', jenis: 'angka', kunci: 765 },
      ],
      pembahasan:
        'Perulangan berjalan $256 - 1 =$ **255 kali**. Setiap putaran: 2 EXTRACT-MIN dan 1 INSERT, total sekitar $3 \\times 255 = 765$ operasi heap, masing-masing $O(\\lg 256) = O(8)$ langkah perbandingan, ditambah pembentukan heap awal.',
    },
    {
      no: 8,
      tipe: 'pilihan',
      teks: 'Pada contoh modul ini, karakter mana yang kodenya paling panjang dan mengapa?',
      opsi: [
        { id: 'A', teks: 'a, karena muncul paling sering.' },
        { id: 'B', teks: 'e dan f, karena frekuensinya paling kecil sehingga digabung paling awal dan berada paling dalam.' },
        { id: 'C', teks: 'd, karena berada di urutan terakhir.' },
        { id: 'D', teks: 'Semua sama panjang.' },
      ],
      kunci: 'B',
      pembahasan: '**Jawaban: B.** e (9) dan f (5) adalah dua frekuensi terkecil, sehingga digabung pada loop pertama dan menjadi daun terdalam (kode 4 bit).',
    },
  ],
}

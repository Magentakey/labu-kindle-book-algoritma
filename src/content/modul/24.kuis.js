// Kuis Pemahaman Modul 24 (7 soal pilihan ganda), bersumber dari soal PDF "24 - Algoritma Dijkstra" halaman 9–10.
// Teks memakai Markdown dengan rumus TeX ($...$). `kunci` berupa satu id (satu jawaban) atau larik id (banyak jawaban, dinilai utuh).

export const kuis24 = {
  judul: 'Algoritma Dijkstra',
  modul: '24',
  soal: [
    {
      no: 1,
      teks: 'Syarat utama agar Dijkstra memberikan hasil yang benar adalah ...',
      opsi: [
        { id: 'A', teks: 'Graf harus tak berarah.' },
        { id: 'B', teks: 'Graf tidak boleh memiliki cycle.' },
        { id: 'C', teks: 'Semua bobot busur tidak negatif.' },
        { id: 'D', teks: 'Banyaknya busur harus lebih sedikit dari banyaknya simpul.' },
      ],
      kunci: 'C',
      pembahasan: '**Jawaban: C.** Dijkstra dapat bekerja pada graf berarah maupun tak berarah dan pada graf yang memiliki cycle. Yang wajib hanyalah bobot nonnegatif.',
    },
    {
      no: 2,
      teks: 'Jalankan Dijkstra dari $A$ pada graf berarah: $(A, B) = 4$, $(A, C) = 1$, $(C, B) = 2$, $(B, D) = 1$, $(C, D) = 5$, $(D, E) = 3$. Pilih **tiga** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: 'Urutan extract adalah A, C, B, D, E.' },
        { id: 'B', teks: '$B.d$ akhir adalah 3.' },
        { id: 'C', teks: '$E.d$ akhir adalah 7.' },
        { id: 'D', teks: 'Lintasan ke $E$ adalah $A \\to B \\to D \\to E$.' },
        { id: 'E', teks: '$D.d$ akhir adalah 6.' },
      ],
      kunci: ['A', 'B', 'C'],
      pembahasan:
        '**Jawaban: A, B, dan C.** Extract A (0): B = 4, C = 1. Extract C (1): B = $\\min(4, 1 + 2) = 3$, D = 6. Extract B (3): D = $\\min(6, 3 + 1) = 4$. Extract D (4): E = 7. Extract E (7). Urutan: **A, C, B, D, E**. Nilai akhir: A 0, B 3, C 1, D 4, E 7. Lintasan ke E: **A → C → B → D → E** ($1 + 2 + 1 + 3 = 7$).',
    },
    {
      no: 3,
      teks: 'Pada penelusuran di modul ini, $t.d$ boleh berubah dari 10 menjadi 8 pada loop 2, tetapi tidak boleh berubah lagi setelah $t$ di-extract pada loop 4. Pilih **tiga** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: 'Perubahan 10 menjadi 8 terjadi karena ditemukan lintasan yang lebih murah lewat simpul $y$.' },
        { id: 'B', teks: 'Sebelum di-extract, $t.d$ adalah estimasi (batas atas) yang masih dapat diperbaiki.' },
        { id: 'C', teks: 'Saat $t$ di-extract, $t.d$ adalah nilai terkecil di $Q$.' },
        { id: 'D', teks: 'Setelah itu, lintasan lain yang melewati simpul di $Q$ masih bisa lebih murah.' },
        { id: 'E', teks: 'Perubahan 10 menjadi 8 terjadi karena ditemukan lintasan yang lebih murah lewat simpul $x$.' },
      ],
      kunci: ['A', 'B', 'C'],
      pembahasan:
        '**Jawaban: A, B, dan C.** Sebelum di-extract, $t.d$ hanyalah estimasi (batas atas) yang dapat diperbaiki bila ditemukan lintasan lebih murah, seperti lewat $y$. Saat $t$ di-extract, $t.d$ adalah nilai terkecil di $Q$; karena semua bobot nonnegatif, lintasan lain yang melewati simpul di $Q$ tidak mungkin lebih murah. Jadi $t.d = \\delta(s, t)$ sudah final.',
    },
    {
      no: 4,
      teks: 'Pernyataan "Jika graf tidak memiliki cycle negatif, Dijkstra tetap benar walaupun ada busur berbobot negatif" adalah ...',
      opsi: [
        { id: 'A', teks: 'Benar, karena tanpa cycle negatif jarak terpendek selalu terdefinisi.' },
        { id: 'B', teks: 'Salah: contoh penyangkal di modul ini tidak memiliki cycle sama sekali, tetapi Dijkstra tetap menghasilkan $c.d = 3$ padahal jarak sebenarnya 2.' },
        { id: 'C', teks: 'Benar, bila graf berarah.' },
        { id: 'D', teks: 'Salah, karena Dijkstra tidak dapat dijalankan pada graf berbobot.' },
      ],
      kunci: 'B',
      pembahasan: '**Jawaban: B.** Contoh penyangkal di modul ini tidak memiliki cycle sama sekali, tetapi Dijkstra tetap menghasilkan $c.d = 3$, padahal jarak sebenarnya 2. Bobot negatif saja sudah dapat membuat Dijkstra salah.',
    },
    {
      no: 5,
      teks: 'Sebuah jaringan jalan memiliki $\\lvert V \\rvert = 10.000$ persimpangan dan $\\lvert E \\rvert = 30.000$ ruas. Pilih **tiga** pernyataan yang benar tentang Dijkstra.',
      opsi: [
        { id: 'A', teks: 'Dengan array, $V^2$ sekitar 100.000.000 langkah.' },
        { id: 'B', teks: 'Dengan binary heap, $(V + E) \\lg V$ sekitar 532.000 langkah ($\\lg 10.000 \\approx 13{,}3$).' },
        { id: 'C', teks: 'Versi binary heap sekitar 190 kali lebih cepat.' },
        { id: 'D', teks: 'Dengan array, $V^2$ sekitar 1.000.000.000 langkah.' },
        { id: 'E', teks: 'Dengan binary heap, langkahnya sekitar 53.200.' },
      ],
      kunci: ['A', 'B', 'C'],
      pembahasan:
        '**Jawaban: A, B, dan C.** Array: $V^2 = 10^8$ langkah. Binary heap: $(10.000 + 30.000) \\times \\lg 10.000 \\approx 40.000 \\times 13{,}3 \\approx 532.000$ langkah. Versi heap sekitar **190 kali** lebih cepat.',
    },
    {
      no: 6,
      teks: 'Pada graf contoh modul ini, bobot busur $(y, t)$ diubah dari 3 menjadi 6. Pilih **tiga** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: '$\\delta(s, t) = 10$ yang baru.' },
        { id: 'B', teks: 'Lintasan ke $t$ adalah $s \\to t$.' },
        { id: 'C', teks: '$\\delta(s, x) = 11$ lewat $s \\to t \\to x$.' },
        { id: 'D', teks: '$\\delta(s, x) = 13$ lewat $s \\to y \\to z \\to x$.' },
        { id: 'E', teks: '$\\delta(s, t) = 11$ lewat $s \\to y \\to t$.' },
      ],
      kunci: ['A', 'B', 'C'],
      pembahasan:
        '**Jawaban: A, B, dan C.** Lintasan ke $t$: langsung $s \\to t = 10$, atau $s \\to y \\to t = 5 + 6 = 11$. Jadi $\\delta(s, t) = $ **10** lewat $s \\to t$. Ke $x$: $s \\to t \\to x = 11$, $s \\to y \\to x = 14$, $s \\to y \\to z \\to x = 5 + 2 + 6 = 13$. Jadi $\\delta(s, x) = $ **11** lewat $s \\to t \\to x$.',
    },
    {
      no: 7,
      teks: 'Apa perbedaan nilai yang disimpan Dijkstra dan Prim untuk setiap simpul?',
      opsi: [
        { id: 'A', teks: 'Tidak ada perbedaan.' },
        { id: 'B', teks: 'Dijkstra menyimpan jumlah busur; Prim menyimpan total bobot.' },
        { id: 'C', teks: 'Prim hanya bekerja pada graf berarah.' },
        { id: 'D', teks: 'Dijkstra menyimpan total bobot lintasan dari sumber; Prim menyimpan bobot satu busur termurah ke tree.' },
      ],
      kunci: 'D',
      pembahasan: '**Jawaban: D.** Inilah satu-satunya perbedaan struktural kedua algoritma, dan perbedaan itu membuat Dijkstra menghasilkan pohon lintasan terpendek sedangkan Prim menghasilkan MST.',
    },
  ],
}

// Kuis Pemahaman Modul 21 (7 soal pilihan ganda), bersumber dari soal PDF "21 - Algoritma Prim" halaman 8–9.
// Teks memakai Markdown dengan rumus TeX ($...$). `kunci` berupa satu id (satu jawaban) atau larik id (banyak jawaban, dinilai utuh).

export const kuis21 = {
  judul: 'Algoritma Prim',
  modul: '21',
  soal: [
    {
      no: 1,
      teks: 'Pada Prim, nilai $v.\\mathit{key}$ untuk simpul $v$ yang masih di $Q$ menyatakan ...',
      opsi: [
        { id: 'A', teks: 'Jarak terpendek dari akar ke $v$.' },
        { id: 'B', teks: 'Banyaknya tetangga $v$.' },
        { id: 'C', teks: 'Bobot busur termurah yang menghubungkan $v$ dengan tree saat ini.' },
        { id: 'D', teks: 'Urutan $v$ di adjacency-list.' },
      ],
      kunci: 'C',
      pembahasan: '**Jawaban: C.** Pilihan A adalah arti $v.d$ pada Dijkstra, bukan key pada Prim.',
    },
    {
      no: 2,
      teks: 'Jalankan Prim dari akar $p$ pada graf dengan busur $(p, q) = 3$, $(p, r) = 1$, $(q, r) = 2$, $(q, s) = 5$, $(r, s) = 4$, $(s, t) = 6$, $(r, t) = 7$. Pilih **tiga** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: 'Extract ke-2 adalah $r$ dengan key 1.' },
        { id: 'B', teks: 'Extract ke-3 adalah $q$ dengan key 2.' },
        { id: 'C', teks: 'Total bobot MST adalah 13.' },
        { id: 'D', teks: 'Extract ke-2 adalah $q$ dengan key 3.' },
        { id: 'E', teks: 'Total bobot MST adalah 14.' },
      ],
      kunci: ['A', 'B', 'C'],
      pembahasan:
        '**Jawaban: A, B, dan C.** Extract $p$ (0): $q.\\mathit{key} = 3$, $r.\\mathit{key} = 1$. Extract $r$ (1): $q.\\mathit{key} = 2$, $s.\\mathit{key} = 4$, $t.\\mathit{key} = 7$. Extract $q$ (2): $w(q, s) = 5 > 4$, tidak berubah. Extract $s$ (4): $t.\\mathit{key} = 6$. Extract $t$ (6). Urutan: **p(0), r(1), q(2), s(4), t(6)**; MST $\\{(r, p), (q, r), (s, r), (t, s)\\}$, total **13**, sama dengan hasil Kruskal pada kuis Modul 20.',
    },
    {
      no: 3,
      teks: 'Pada penelusuran di modul ini, key $h$ mula-mula 8 (dari $a$), turun menjadi 7 pada iterasi 4, lalu turun lagi menjadi 1 pada iterasi 6. Pilih **tiga** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: 'Awalnya $h$ tersambung lewat busur $(a, h)$ dengan key 8.' },
        { id: 'B', teks: 'Setelah $i$ masuk tree, $h.\\mathit{key} = 7$ lewat busur $(i, h)$.' },
        { id: 'C', teks: 'Setelah $g$ masuk tree, $h.\\mathit{key} = 1$ lewat busur $(g, h)$.' },
        { id: 'D', teks: 'Setelah $g$ masuk tree, $h.\\mathit{key} = 1$ lewat busur $(a, h)$.' },
        { id: 'E', teks: 'Key mencerminkan jarak terpendek dari akar $a$ ke $h$.' },
      ],
      kunci: ['A', 'B', 'C'],
      pembahasan:
        '**Jawaban: A, B, dan C.** Awalnya ($h.\\mathit{key} = 8$, $\\pi = a$) cara termurah menyambungkan $h$ adalah lewat busur $(a, h)$. Setelah $i$ masuk tree, ditemukan sambungan lebih murah $(i, h) = 7$. Setelah $g$ masuk tree, ditemukan sambungan yang lebih murah lagi $(g, h) = 1$. Key selalu mencerminkan sambungan termurah yang diketahui sejauh ini ke tree yang terus membesar, bukan jarak dari akar.',
    },
    {
      no: 4,
      teks: 'Pernyataan "Jika Prim dijalankan dari akar yang berbeda, bobot MST yang dihasilkan bisa berbeda" adalah ...',
      opsi: [
        { id: 'A', teks: 'Benar, karena akar menentukan bobot busur pertama.' },
        { id: 'B', teks: 'Benar, bila graf memiliki lebih dari 5 simpul.' },
        { id: 'C', teks: 'Salah, karena urutan extract dan MST juga selalu sama.' },
        { id: 'D', teks: 'Salah: akar berbeda dapat memberi urutan extract atau MST yang berbeda (bila ada bobot sama), tetapi bobot MST selalu sama, yaitu minimum.' },
      ],
      kunci: 'D',
      pembahasan: '**Jawaban: D.** Akar yang berbeda dapat menghasilkan urutan extract dan bahkan MST yang berbeda (bila ada bobot sama), tetapi **bobot** MST selalu sama, yaitu bobot minimum. Pada graf contoh, bobotnya selalu 37.',
    },
    {
      no: 5,
      teks: 'Sebuah graf padat memiliki $\\lvert V \\rvert = 1.000$ dan $\\lvert E \\rvert \\approx 500.000$. Pilih **tiga** pernyataan yang benar tentang Prim.',
      opsi: [
        { id: 'A', teks: 'Dengan array, $V^2$ sekitar 1.000.000 langkah.' },
        { id: 'B', teks: 'Dengan binary heap, $E \\lg V$ sekitar 5.000.000 langkah.' },
        { id: 'C', teks: 'Untuk graf padat ini, array lebih baik.' },
        { id: 'D', teks: 'Untuk graf padat ini, binary heap lebih baik.' },
        { id: 'E', teks: 'Dengan array, $V^2$ sekitar 5.000.000 langkah.' },
      ],
      kunci: ['A', 'B', 'C'],
      pembahasan: '**Jawaban: A, B, dan C.** Array: $V^2 = 10^6$ langkah. Binary heap: $E \\lg V \\approx 500.000 \\times 10 = 5 \\times 10^6$ langkah. Untuk graf padat ini, **array lebih baik** (sekitar 5 kali lebih sedikit).',
    },
    {
      no: 6,
      teks: 'Jalankan Prim pada graf contoh dengan akar $e$ (gunakan aturan abjad bila key sama). Pilih **dua** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: 'Simpul yang di-extract pertama setelah $e$ adalah $d$ dengan key 9.' },
        { id: 'B', teks: 'Simpul yang di-extract pertama setelah $e$ adalah $f$ dengan key 10.' },
        { id: 'C', teks: 'Bobot MST adalah 33.' },
        { id: 'D', teks: 'Bobot MST adalah 37.' },
        { id: 'E', teks: 'MST yang terbentuk tidak memuat busur $(a, h)$.' },
      ],
      kunci: ['A', 'D'],
      pembahasan:
        '**Jawaban: A dan D.** Dari $e$: $Adj[e] = d, f$ memberi $d.\\mathit{key} = 9$, $f.\\mathit{key} = 10$, sehingga yang di-extract pertama setelah $e$ adalah $d$ (key 9). Selanjutnya $c$ (7), $i$ (2), $f$ (4), $g$ (2), $h$ (1), $a$ (8, lewat $(a, h)$ karena $h$ sudah di tree sebelum $b$), $b$ (4). Bobot MST tetap **37** ($9 + 7 + 2 + 4 + 2 + 1 + 8 + 4$). MST yang terbentuk kali ini memuat $(a, h)$, yaitu $T_2$ dari Modul 19.',
    },
    {
      no: 7,
      teks: 'Mengapa pada langkah 9 diperiksa syarat "$v \\in Q$"?',
      opsi: [
        { id: 'A', teks: 'Agar simpul yang sudah masuk tree tidak diperbarui lagi; jika diperbarui, struktur tree bisa rusak.' },
        { id: 'B', teks: 'Agar running time menjadi $O(V)$.' },
        { id: 'C', teks: 'Agar busur berbobot negatif diabaikan.' },
        { id: 'D', teks: 'Karena $Q$ selalu kosong setelah iterasi pertama.' },
      ],
      kunci: 'A',
      pembahasan: '**Jawaban: A.** Simpul yang sudah di-extract sudah memiliki busur tree yang final. Memperbarui $\\pi$-nya dapat membentuk cycle atau memutus tree.',
    },
  ],
}

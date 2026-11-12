// Kuis Pemahaman Modul 23 (7 soal pilihan ganda), bersumber dari soal PDF "23 - Algoritma Bellman-Ford" halaman 8–9.
// Teks memakai Markdown dengan rumus TeX ($...$). `kunci` berupa satu id (satu jawaban) atau larik id (banyak jawaban, dinilai utuh).

export const kuis23 = {
  judul: 'Algoritma Bellman-Ford',
  modul: '23',
  soal: [
    {
      no: 1,
      teks: 'Apa arti Bellman-Ford mengembalikan FALSE?',
      opsi: [
        { id: 'A', teks: 'Graf memiliki busur berbobot negatif.' },
        { id: 'B', teks: 'Ada simpul yang tidak dapat dicapai dari sumber.' },
        { id: 'C', teks: 'Banyaknya putaran kurang dari $\\lvert V \\rvert - 1$.' },
        { id: 'D', teks: 'Graf memiliki cycle berbobot negatif yang dapat dicapai dari sumber, sehingga lintasan terpendek tidak terdefinisi.' },
      ],
      kunci: 'D',
      pembahasan: '**Jawaban: D.** Busur negatif saja (A) tidak menyebabkan FALSE, seperti contoh di modul ini yang menghasilkan TRUE. Simpul yang tidak terjangkau (B) tetap bernilai $\\infty$ dan tidak memicu FALSE.',
    },
    {
      no: 2,
      teks: 'Jalankan Bellman-Ford dari $s$ pada graf dengan busur (dalam urutan ini) $(a, b) = -1$, $(s, a) = 4$, $(s, b) = 2$, $(b, c) = 3$, $(a, c) = 5$. Pilih **tiga** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: 'Banyak putaran adalah 3 ($\\lvert V \\rvert = 4$).' },
        { id: 'B', teks: 'Setelah loop 1: $a.d = 4$, $b.d = 2$, $c.d = 5$.' },
        { id: 'C', teks: 'Nilai kembalian adalah TRUE.' },
        { id: 'D', teks: 'Hasil akhir: $a = 4$, $b = 3$, $c = 5$.' },
        { id: 'E', teks: 'Nilai kembalian adalah FALSE.' },
      ],
      kunci: ['A', 'B', 'C'],
      pembahasan:
        '**Jawaban: A, B, dan C.** $\\lvert V \\rvert = 4$, sehingga 3 putaran. Inisialisasi: $s = 0$, lainnya $\\infty$. Loop 1: $(a, b)$ tidak berubah ($a = \\infty$); $(s, a)$: $a = 4$; $(s, b)$: $b = 2$; $(b, c)$: $c = 5$; $(a, c)$: $4 + 5 = 9 > 5$, tidak berubah. Loop 2: $(a, b)$: $4 - 1 = 3 > 2$, tidak berubah; tidak ada perubahan lain. Loop 3: tidak ada perubahan. Pemeriksaan akhir lolos, sehingga **TRUE** dengan $a = 4$, $b = 2$, $c = 5$.',
    },
    {
      no: 3,
      teks: 'Pada contoh modul ini, urutan busur diubah sehingga $(s,t)$ dan $(s,y)$ diproses **pertama** (busur lainnya tetap dalam urutan semula). Pilih **dua** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: 'Hasil akhir tidak berubah: $t = 2$, $x = 4$, $y = 7$, $z = -2$.' },
        { id: 'B', teks: 'Putaran terakhir yang masih mengubah nilai adalah putaran 3 (pada urutan modul: putaran 4).' },
        { id: 'C', teks: 'Hasil akhir berubah menjadi $t = 6$, $x = 4$, $y = 7$, $z = 2$.' },
        { id: 'D', teks: 'Putaran terakhir yang masih mengubah nilai tetap putaran 4.' },
        { id: 'E', teks: 'Setelah putaran 1, $t.d = 2$.' },
      ],
      kunci: ['A', 'B'],
      pembahasan:
        '**Jawaban: A dan B.** Hasil akhir **tidak berubah** ($t = 2$, $x = 4$, $y = 7$, $z = -2$), karena setelah $\\lvert V \\rvert - 1$ putaran Bellman-Ford selalu benar. Namun nilai bisa final lebih cepat. Dengan $(s,t)$ dan $(s,y)$ di depan, putaran 1 langsung memberi $t = 6$, $y = 7$, lalu $x = 4$, $z = 2$, dan seterusnya; nilai akhir tercapai pada putaran 3 (pada urutan modul: putaran 4), dan putaran sisanya tidak mengubah apa pun.',
    },
    {
      no: 4,
      teks: 'Sebuah graf memiliki 100 simpul dan 2.000 busur. Pilih **dua** pernyataan yang benar tentang Bellman-Ford.',
      opsi: [
        { id: 'A', teks: 'RELAX dipanggil $(100 - 1) \\times 2.000 = 198.000$ kali (langkah 2–4).' },
        { id: 'B', teks: 'Pemeriksaan akhir (langkah 5–7) dilakukan 2.000 kali.' },
        { id: 'C', teks: 'RELAX dipanggil 200.000 kali.' },
        { id: 'D', teks: 'RELAX dipanggil 2.000 kali.' },
        { id: 'E', teks: 'Pemeriksaan akhir dilakukan 198.000 kali.' },
      ],
      kunci: ['A', 'B'],
      pembahasan: '**Jawaban: A dan B.** RELAX: $(100 - 1) \\times 2.000 = $ **198.000** pemanggilan. Pemeriksaan akhir: **2.000**.',
    },
    {
      no: 5,
      teks: 'Pernyataan "Jika sebuah graf tidak memiliki busur berbobot negatif, Bellman-Ford pasti mengembalikan TRUE" adalah ...',
      opsi: [
        { id: 'A', teks: 'Benar: tanpa busur negatif tidak mungkin ada cycle negatif, sehingga pemeriksaan akhir selalu lolos.' },
        { id: 'B', teks: 'Salah, karena cycle positif juga memicu FALSE.' },
        { id: 'C', teks: 'Salah, karena simpul yang tak terjangkau memicu FALSE.' },
        { id: 'D', teks: 'Benar, tetapi hanya bila graf tak berarah.' },
      ],
      kunci: 'A',
      pembahasan: '**Jawaban: A.** Tanpa busur negatif, tidak mungkin ada cycle berbobot negatif, sehingga pemeriksaan akhir selalu lolos. (Walaupun begitu, untuk graf seperti ini Dijkstra lebih efisien.)',
    },
    {
      no: 6,
      teks: 'Graf dengan busur $(s, a) = 1$, $(a, b) = 2$, $(b, a) = -4$. Telusuri $\\lvert V \\rvert - 1 = 2$ putaran (urutan busur seperti tertulis) lalu pemeriksaan akhir. Pilih **tiga** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: 'Setelah loop 1: $a.d = -1$.' },
        { id: 'B', teks: 'Setelah loop 1: $b.d = 3$.' },
        { id: 'C', teks: 'Nilai kembalian adalah FALSE.' },
        { id: 'D', teks: 'Bobot cycle $a \\to b \\to a$ adalah 6.' },
        { id: 'E', teks: 'Nilai kembalian adalah TRUE.' },
      ],
      kunci: ['A', 'B', 'C'],
      pembahasan:
        '**Jawaban: A, B, dan C.** Inisialisasi: $s = 0$, $a = b = \\infty$. Loop 1: $(s, a)$: $a = 1$; $(a, b)$: $b = 3$; $(b, a)$: $3 - 4 = -1 < 1$, sehingga $a = -1$. Loop 2: $(s, a)$ tidak berubah; $(a, b)$: $-1 + 2 = 1 < 3$, sehingga $b = 1$; $(b, a)$: $1 - 4 = -3$, sehingga $a = -3$. Pemeriksaan: $(a, b)$: $b = 1 > a + 2 = -1$ bernilai TRUE, sehingga **return FALSE**. Cycle $a \\to b \\to a$ berbobot $2 - 4 = -2$.',
    },
    {
      no: 7,
      teks: 'Mengapa $z.d$ pada contoh modul ini baru bernilai benar ($-2$) pada putaran ke-4?',
      opsi: [
        { id: 'A', teks: 'Karena bobot $(t, z)$ negatif.' },
        { id: 'B', teks: 'Karena $z$ adalah simpul terakhir dalam abjad.' },
        { id: 'C', teks: 'Karena lintasan terpendek ke $z$ memuat 4 busur, dan dengan urutan busur ini setiap putaran hanya menjamin satu busur tambahan dari lintasan itu.' },
        { id: 'D', teks: 'Karena Bellman-Ford selalu memerlukan tepat 4 putaran.' },
      ],
      kunci: 'C',
      pembahasan:
        '**Jawaban: C.** Lintasan $s \\to y \\to x \\to t \\to z$ memuat 4 busur. Dengan urutan busur dari bahan kuliah, busur-busur lintasan itu menjadi efektif satu per putaran: $(s, y)$ pada loop 1, $(y, x)$ pada loop 2, $(x, t)$ pada loop 3, $(t, z)$ pada loop 4.',
    },
  ],
}

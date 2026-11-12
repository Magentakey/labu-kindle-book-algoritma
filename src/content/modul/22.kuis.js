// Kuis Pemahaman Modul 22 (7 soal pilihan ganda), bersumber dari soal PDF "22 - Konsep Shortest Paths dan Relaksasi" halaman 8–9.
// Teks memakai Markdown dengan rumus TeX ($...$). `kunci` berupa satu id (satu jawaban) atau larik id (banyak jawaban, dinilai utuh).

export const kuis22 = {
  judul: 'Konsep Shortest Paths dan Relaksasi',
  modul: '22',
  soal: [
    {
      no: 1,
      teks: 'Pada graf contoh modul ini, perhatikan lintasan $s \\to y \\to t \\to x \\to z$. Pilih **dua** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: 'Bobot lintasan itu adalah 14.' },
        { id: 'B', teks: 'Jarak terpendek $\\delta(s, z) = 11$.' },
        { id: 'C', teks: 'Lintasan itu merupakan lintasan terpendek ke $z$.' },
        { id: 'D', teks: 'Jarak terpendek $\\delta(s, z) = 14$.' },
        { id: 'E', teks: 'Bobot lintasan itu adalah 11.' },
      ],
      kunci: ['A', 'B'],
      pembahasan: '**Jawaban: A dan B.** $5 + 1 + 6 + 2 = 14$. Karena $\\delta(s, z) = 11$, lintasan ini **bukan** lintasan terpendek.',
    },
    {
      no: 2,
      teks: 'Pernyataan yang benar tentang lintasan terpendek adalah ...',
      opsi: [
        { id: 'A', teks: 'Lintasan terpendek selalu tunggal.' },
        { id: 'B', teks: 'Jarak terpendek $\\delta(s, v)$ tunggal, tetapi lintasannya bisa lebih dari satu.' },
        { id: 'C', teks: 'Lintasan terpendek selalu memiliki busur paling sedikit.' },
        { id: 'D', teks: 'Lintasan terpendek boleh memuat cycle positif.' },
      ],
      kunci: 'B',
      pembahasan:
        '**Jawaban: B.** Pada contoh, $z$ memiliki lima lintasan berbobot 11. Lintasan terpendek berbobot belum tentu memiliki busur paling sedikit (C salah; misalnya $s \\to y \\to z$ dua busur dan $s \\to t \\to y \\to x \\to z$ empat busur sama-sama 11), dan cycle positif selalu dapat dibuang (D salah).',
    },
    {
      no: 3,
      teks: 'Diketahui $u.d = 4$, $v.d = 10$, $w(u, v) = 3$. Pilih **tiga** pernyataan yang benar tentang `RELAX(u, v, w)`.',
      opsi: [
        { id: 'A', teks: 'Bila $v.d$ semula 10, setelah RELAX $v.d = 7$.' },
        { id: 'B', teks: 'Bila $v.d$ semula 10, setelah RELAX $v.\\pi = u$.' },
        { id: 'C', teks: 'Bila $v.d$ semula 7, tidak ada perubahan.' },
        { id: 'D', teks: 'Bila $v.d$ semula 10, $v.d$ tetap 10.' },
        { id: 'E', teks: 'Bila $v.d$ semula 7, $v.\\pi$ menjadi $u$.' },
      ],
      kunci: ['A', 'B', 'C'],
      pembahasan: '**Jawaban: A, B, dan C.** Karena $10 > 4 + 3 = 7$, maka $v.d = 7$ dan $v.\\pi = u$. Jika sebelumnya $v.d = 7$, kondisi $7 > 7$ salah, sehingga **tidak ada perubahan** ($v.d$ tetap 7 dan $v.\\pi$ tetap seperti semula).',
    },
    {
      no: 4,
      teks: 'Pada graf contoh cycle negatif, $\\delta(s, b) = -1$ terdefinisi walaupun ada busur negatif $(a, b) = -4$, sedangkan $\\delta(s, e)$ tidak. Pilih **tiga** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: 'Busur negatif $(a, b)$ dapat mengurangi bobot lintasan $s \\to a \\to b$ berulang tanpa batas.' },
        { id: 'B', teks: 'Bobot lintasan $s \\to a \\to b$ adalah $-1$.' },
        { id: 'C', teks: 'Simpul $e$ berada pada cycle negatif $e \\to f \\to e$ berbobot $-3$.' },
        { id: 'D', teks: '$\\delta(s, e) = -\\infty$.' },
        { id: 'E', teks: '$\\delta(s, e) = -3$.' },
      ],
      kunci: ['B', 'C', 'D'],
      pembahasan:
        '**Jawaban: B, C, dan D.** Busur negatif hanya mengurangi bobot satu kali, sehingga lintasan $s \\to a \\to b$ memiliki bobot tertentu, yaitu $-1$, dan tidak ada cara mengulanginya. Sebaliknya, $e$ berada pada cycle $e \\to f \\to e$ berbobot $-3$; setiap putaran mengelilingi cycle mengurangi bobot 3, tanpa batas bawah, sehingga $\\delta(s, e) = -\\infty$.',
    },
    {
      no: 5,
      teks: 'Pernyataan "Pada graf tanpa cycle negatif dengan 10 simpul, setiap lintasan terpendek memiliki paling banyak 9 busur" adalah ...',
      opsi: [
        { id: 'A', teks: 'Salah, karena lintasan terpendek dapat memuat 10 busur.' },
        { id: 'B', teks: 'Salah, karena jumlah busur tidak dibatasi.' },
        { id: 'C', teks: 'Benar: lintasan terpendek yang terdefinisi tidak memuat cycle, sehingga paling banyak mengunjungi 10 simpul berbeda dan memuat $10 - 1 = 9$ busur.' },
        { id: 'D', teks: 'Benar, tetapi hanya bila semua bobot positif.' },
      ],
      kunci: 'C',
      pembahasan: '**Jawaban: C.** Lintasan terpendek yang terdefinisi tidak memuat cycle, sehingga paling banyak mengunjungi 10 simpul berbeda dan memuat paling banyak $10 - 1 = 9$ busur.',
    },
    {
      no: 6,
      teks: 'Jika $s \\to t \\to y \\to x$ adalah lintasan terpendek ke $x$ dengan bobot 9, pilih **dua** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: 'Bagian $s \\to t \\to y$ adalah lintasan terpendek ke $y$ (substruktur optimal).' },
        { id: 'B', teks: '$\\delta(s, y) = 5$.' },
        { id: 'C', teks: '$\\delta(s, y) = 3$.' },
        { id: 'D', teks: 'Bagian $s \\to t \\to y$ adalah lintasan terpendek ke $z$.' },
        { id: 'E', teks: 'Sifat yang dipakai adalah ketaksamaan segitiga.' },
      ],
      kunci: ['A', 'B'],
      pembahasan: '**Jawaban: A dan B.** Berdasarkan substruktur optimal (bagian dari lintasan terpendek juga lintasan terpendek), $s \\to t \\to y$ adalah lintasan terpendek ke $y$, sehingga $\\delta(s, y) = 3 + 2 = 5$.',
    },
    {
      no: 7,
      teks: 'Mengapa Bellman-Ford cukup merelaksasi semua busur sebanyak $\\lvert V \\rvert - 1$ putaran?',
      opsi: [
        { id: 'A', teks: 'Karena graf selalu memiliki $\\lvert V \\rvert - 1$ busur.' },
        { id: 'B', teks: 'Karena Dijkstra membutuhkan $\\lvert V \\rvert$ putaran.' },
        { id: 'C', teks: 'Karena bobot busur selalu positif.' },
        { id: 'D', teks: 'Karena setiap lintasan terpendek (tanpa cycle) memiliki paling banyak $\\lvert V \\rvert - 1$ busur, dan setiap putaran menjamin satu busur berikutnya dari lintasan itu sudah direlaksasi berurutan.' },
      ],
      kunci: 'D',
      pembahasan:
        '**Jawaban: D.** Ini sifat relaksasi lintasan: pada putaran ke-$i$, busur ke-$i$ dari setiap lintasan terpendek pasti direlaksasi setelah busur ke-$(i - 1)$ direlaksasi. Setelah $\\lvert V \\rvert - 1$ putaran, semua lintasan terpendek (yang paling banyak memuat $\\lvert V \\rvert - 1$ busur) telah direlaksasi berurutan.',
    },
  ],
}

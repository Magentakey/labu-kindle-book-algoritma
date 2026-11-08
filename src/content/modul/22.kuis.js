// Kuis Pemahaman Modul 22 (7 soal) dan kunci serta pembahasannya, dari PDF "22 - Konsep Shortest Paths dan Relaksasi" halaman 8–9.
// Teks memakai Markdown dengan rumus TeX ($...$). Semua soal dinilai otomatis (pilihan atau isian); soal perhitungan, penelusuran, dan analisis (1, 3, 4, 6)
// dinilai dari beberapa isian, bukan uraian. Soal 5 (benar/salah dengan alasan) dinilai pada pilihan Benar/Salah; alasannya ada di pembahasan.

export const kuis22 = {
  judul: 'Konsep Shortest Paths dan Relaksasi',
  modul: '22',
  soal: [
    {
      no: 1,
      tipe: 'perhitungan',
      teks: 'Pada graf contoh modul ini, hitung bobot lintasan $s \\to y \\to t \\to x \\to z$. Apakah lintasan ini lintasan terpendek ke $z$?',
      isian: [
        { label: 'Bobot lintasan s → y → t → x → z', jenis: 'angka', kunci: 14 },
        { label: 'Jarak terpendek δ(s, z)', jenis: 'angka', kunci: 11 },
        { label: 'Apakah lintasan itu lintasan terpendek ke z?', jenis: 'pilih', opsi: ['Ya', 'Bukan'], kunci: 'Bukan' },
      ],
      pembahasan: '$5 + 1 + 6 + 2 = 14$. Karena $\\delta(s, z) = 11$, lintasan ini **bukan** lintasan terpendek.',
    },
    {
      no: 2,
      tipe: 'pilihan',
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
      tipe: 'penelusuran',
      teks: 'Diketahui $u.d = 4$, $v.d = 10$, $w(u, v) = 3$. Apa isi $v.d$ dan $v.\\pi$ setelah `RELAX(u, v, w)`? Bagaimana jika sebelumnya $v.d = 7$?',
      isian: [
        { label: 'v.d setelah RELAX (v.d semula 10)', jenis: 'angka', kunci: 7 },
        { label: 'v.π setelah RELAX (v.d semula 10)', jenis: 'pilih', opsi: ['u', 'NIL', 'tetap seperti semula'], kunci: 'u' },
        { label: 'v.d setelah RELAX bila v.d semula 7', jenis: 'angka', kunci: 7 },
        { label: 'Bila v.d semula 7, apakah ada perubahan?', jenis: 'pilih', opsi: ['Ada perubahan', 'Tidak ada perubahan'], kunci: 'Tidak ada perubahan' },
      ],
      pembahasan: 'Karena $10 > 4 + 3 = 7$, maka $v.d = 7$ dan $v.\\pi = u$. Jika sebelumnya $v.d = 7$, kondisi $7 > 7$ salah, sehingga **tidak ada perubahan** ($v.d$ tetap 7 dan $v.\\pi$ tetap seperti semula).',
    },
    {
      no: 4,
      tipe: 'analisis',
      teks: 'Pada graf contoh cycle negatif, mengapa $\\delta(s, b) = -1$ terdefinisi dengan baik walaupun ada busur negatif $(a, b) = -4$, sedangkan $\\delta(s, e)$ tidak? Jawab dengan melengkapi pernyataan berikut.',
      isian: [
        { label: 'Busur negatif (a, b) mengurangi bobot lintasan s → a → b', jenis: 'pilih', opsi: ['Satu kali saja', 'Berulang tanpa batas'], kunci: 'Satu kali saja' },
        { label: 'Bobot lintasan s → a → b', jenis: 'angka', kunci: -1 },
        { label: 'Simpul e berada pada', jenis: 'pilih', opsi: ['Cycle negatif e → f → e yang dapat dikelilingi berulang', 'Cycle positif', 'Tidak ada cycle'], kunci: 'Cycle negatif e → f → e yang dapat dikelilingi berulang' },
        { label: 'Bobot cycle e → f → e', jenis: 'angka', kunci: -3 },
        { label: 'δ(s, e)', jenis: 'pilih', opsi: ['−∞', '−3', '0'], kunci: '−∞' },
      ],
      pembahasan:
        'Busur negatif hanya mengurangi bobot satu kali, sehingga lintasan $s \\to a \\to b$ memiliki bobot tertentu, yaitu $-1$, dan tidak ada cara mengulanginya. Sebaliknya, $e$ berada pada cycle $e \\to f \\to e$ berbobot $-3$; setiap putaran mengelilingi cycle mengurangi bobot 3, tanpa batas bawah.',
    },
    {
      no: 5,
      tipe: 'benarsalah',
      teks: '"Pada graf tanpa cycle negatif dengan 10 simpul, setiap lintasan terpendek memiliki paling banyak 9 busur." Benar atau salah? Pikirkan alasannya.',
      opsi: [
        { id: 'Benar', teks: 'Benar' },
        { id: 'Salah', teks: 'Salah' },
      ],
      kunci: 'Benar',
      pembahasan: '**Benar.** Lintasan terpendek yang terdefinisi tidak memuat cycle, sehingga paling banyak mengunjungi 10 simpul berbeda dan memuat paling banyak $10 - 1 = 9$ busur.',
    },
    {
      no: 6,
      tipe: 'analisis',
      teks: 'Jika $s \\to t \\to y \\to x$ adalah lintasan terpendek ke $x$ dengan bobot 9, berapa $\\delta(s, y)$? Sifat apa yang kamu gunakan?',
      isian: [
        { label: 'Bagian s → t → y dari lintasan itu adalah lintasan terpendek ke', jenis: 'pilih', opsi: ['t', 'y', 'z'], kunci: 'y' },
        { label: 'δ(s, y)', jenis: 'angka', kunci: 5 },
        {
          label: 'Sifat yang digunakan',
          jenis: 'pilih',
          opsi: ['Substruktur optimal (bagian dari lintasan terpendek juga lintasan terpendek)', 'Ketaksamaan segitiga', 'Sifat batas atas'],
          kunci: 'Substruktur optimal (bagian dari lintasan terpendek juga lintasan terpendek)',
        },
      ],
      pembahasan: 'Berdasarkan substruktur optimal (bagian dari lintasan terpendek juga lintasan terpendek), $s \\to t \\to y$ adalah lintasan terpendek ke $y$, sehingga $\\delta(s, y) = 3 + 2 = 5$.',
    },
    {
      no: 7,
      tipe: 'pilihan',
      teks: 'Mengapa Bellman-Ford cukup merelaksasi semua busur sebanyak $\\lvert V \\rvert - 1$ putaran?',
      opsi: [
        { id: 'A', teks: 'Karena graf selalu memiliki $\\lvert V \\rvert - 1$ busur.' },
        { id: 'B', teks: 'Karena setiap lintasan terpendek (tanpa cycle) memiliki paling banyak $\\lvert V \\rvert - 1$ busur, dan setiap putaran menjamin satu busur berikutnya dari lintasan itu sudah direlaksasi berurutan.' },
        { id: 'C', teks: 'Karena Dijkstra membutuhkan $\\lvert V \\rvert$ putaran.' },
        { id: 'D', teks: 'Karena bobot busur selalu positif.' },
      ],
      kunci: 'B',
      pembahasan:
        '**Jawaban: B.** Ini sifat relaksasi lintasan: pada putaran ke-$i$, busur ke-$i$ dari setiap lintasan terpendek pasti direlaksasi setelah busur ke-$(i - 1)$ direlaksasi. Setelah $\\lvert V \\rvert - 1$ putaran, semua lintasan terpendek (yang paling banyak memuat $\\lvert V \\rvert - 1$ busur) telah direlaksasi berurutan.',
    },
  ],
}

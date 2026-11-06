// Kuis Pemahaman Modul 16 (7 soal) dan kunci serta pembahasannya, dari PDF "16 - Graf dan Representasinya" halaman 7–8.
// Teks memakai Markdown dengan rumus TeX ($...$). Semua soal dinilai otomatis lewat isian atau pilihan; soal 1 (menyusun representasi) dinilai dari
// pilihan adjacency-list dan tiga angka pada matriksnya, soal 5 dan 6 (analisis) dari pilihan dan angka hasil hitung. Soal 4 (benar/salah dengan
// alasan) dinilai pada pilihan Benar/Salah; alasannya ada di pembahasan.
export const kuis16 = {
  judul: 'Graf dan Representasinya',
  modul: '16',
  soal: [
    {
      no: 1,
      tipe: 'penelusuran',
      teks: 'Sebuah graf tak berarah memiliki simpul $\\{a, b, c, d\\}$ dan busur $\\{(a,b), (a,c), (b,c), (c,d)\\}$. Tuliskan adjacency-list dan adjacency-matrix-nya (urutan simpul a, b, c, d).',
      isian: [
        {
          label: 'Adjacency-list',
          jenis: 'pilih',
          opsi: [
            'a → b → c; b → a → c; c → a → b → d; d → c',
            'a → b → c; b → c; c → d; d',
            'a → b → c; b → a → c; c → a → b; d → c',
            'a → b; b → a → c; c → b → d; d → c',
          ],
          kunci: 'a → b → c; b → a → c; c → a → b → d; d → c',
        },
        { label: 'Total panjang semua list', jenis: 'angka', kunci: 8 },
        { label: 'Banyak sel bernilai 1 pada matriks', jenis: 'angka', kunci: 8 },
        { label: 'Apakah matriksnya simetris?', jenis: 'pilih', opsi: ['Ya', 'Tidak'], kunci: 'Ya' },
      ],
      pembahasan:
        'Adjacency-list: $a \\to b \\to c$; $b \\to a \\to c$; $c \\to a \\to b \\to d$; $d \\to c$.\n\n| | a | b | c | d |\n| --- | --- | --- | --- | --- |\n| a | 0 | 1 | 1 | 0 |\n| b | 1 | 0 | 1 | 0 |\n| c | 1 | 1 | 0 | 1 |\n| d | 0 | 0 | 1 | 0 |\n\nMatriksnya simetris karena grafnya tak berarah.',
    },
    {
      no: 2,
      tipe: 'perhitungan',
      teks: 'Graf tak berarah dengan 8 simpul dan 12 busur disimpan sebagai adjacency-list. Berapa total panjang semua list? Berapa banyak sel adjacency-matrix-nya dan berapa yang bernilai 1?',
      isian: [
        { label: 'Total panjang semua list', jenis: 'angka', kunci: 24 },
        { label: 'Banyak sel adjacency-matrix', jenis: 'angka', kunci: 64 },
        { label: 'Banyak sel bernilai 1', jenis: 'angka', kunci: 24 },
      ],
      pembahasan: 'Total panjang list $= 2\\lvert E \\rvert =$ **24**. Matriks berisi $8^2 =$ **64 sel**, dengan **24** sel bernilai 1 (setiap busur menghasilkan dua angka 1: $a_{uv}$ dan $a_{vu}$).',
    },
    {
      no: 3,
      tipe: 'pilihan',
      teks: 'Operasi mana yang lebih cepat dengan adjacency-matrix daripada adjacency-list?',
      opsi: [
        { id: 'A', teks: 'Menelusuri seluruh busur graf jarang.' },
        { id: 'B', teks: 'Memeriksa apakah busur $(u, v)$ ada.' },
        { id: 'C', teks: 'Mendaftar tetangga simpul berderajat kecil.' },
        { id: 'D', teks: 'Menghemat memori pada graf jarang.' },
      ],
      kunci: 'B',
      pembahasan: '**Jawaban: B.** Dengan matriks, cukup melihat $a_{uv}$ dalam waktu $O(1)$. Pilihan A, C, dan D adalah keunggulan adjacency-list.',
    },
    {
      no: 4,
      tipe: 'benarsalah',
      teks: '"Adjacency-matrix graf berarah selalu simetris." Benar atau salah? Berikan contoh dari graf (b).',
      opsi: [
        { id: 'Benar', teks: 'Benar' },
        { id: 'Salah', teks: 'Salah' },
      ],
      kunci: 'Salah',
      pembahasan: '**Salah.** Pada graf (b), $a_{12} = 1$ (busur $1 \\to 2$) tetapi $a_{21} = 0$ (tidak ada busur $2 \\to 1$). Matriks simetris hanya dijamin untuk graf tak berarah.',
    },
    {
      no: 5,
      tipe: 'analisis',
      teks: 'Dari adjacency-matrix graf (b), bagaimana cara menghitung derajat masuk dan derajat keluar suatu simpul? Hitung untuk simpul 2.',
      isian: [
        { label: 'Derajat keluar simpul u dihitung dari', jenis: 'pilih', opsi: ['jumlah angka 1 pada baris u', 'jumlah angka 1 pada kolom u'], kunci: 'jumlah angka 1 pada baris u' },
        { label: 'Derajat masuk simpul u dihitung dari', jenis: 'pilih', opsi: ['jumlah angka 1 pada baris u', 'jumlah angka 1 pada kolom u'], kunci: 'jumlah angka 1 pada kolom u' },
        { label: 'Derajat keluar simpul 2', jenis: 'angka', kunci: 1 },
        { label: 'Derajat masuk simpul 2', jenis: 'angka', kunci: 2 },
      ],
      pembahasan:
        'Derajat keluar simpul $u$ = jumlah angka 1 pada **baris** $u$; derajat masuk = jumlah angka 1 pada **kolom** $u$. Simpul 2: baris 2 berisi satu angka 1 ($a_{25}$), jadi derajat keluar = 1; kolom 2 berisi $a_{12}$ dan $a_{42}$, jadi derajat masuk = 2.',
    },
    {
      no: 6,
      tipe: 'analisis',
      teks: 'Sebuah graf media sosial memiliki 1 juta pengguna (simpul), dan rata-rata setiap pengguna berteman dengan 200 pengguna lain. Representasi mana yang tepat? Hitung perkiraan banyaknya elemen yang disimpan oleh masing-masing representasi.',
      isian: [
        { label: 'Representasi yang tepat', jenis: 'pilih', opsi: ['Adjacency-list', 'Adjacency-matrix'], kunci: 'Adjacency-list' },
        { label: 'Banyak pertemanan |E|', jenis: 'angka', kunci: 100000000 },
        { label: 'Elemen list (2|E|)', jenis: 'angka', kunci: 200000000 },
        { label: 'Sel adjacency-matrix (|V|²)', jenis: 'angka', kunci: 1000000000000 },
      ],
      pembahasan:
        '$\\lvert V \\rvert = 10^6$, $\\lvert E \\rvert \\approx \\frac{10^6 \\times 200}{2} = 10^8$ pertemanan. Adjacency-list menyimpan $10^6$ kepala list ditambah $2\\lvert E \\rvert = 2 \\times 10^8$ elemen. Adjacency-matrix membutuhkan $(10^6)^2 = 10^{12}$ sel, sekitar 5.000 kali lebih banyak. Graf ini jarang, sehingga **adjacency-list** yang tepat.',
    },
    {
      no: 7,
      tipe: 'pilihan',
      teks: 'Sebuah tree memiliki 15 simpul. Berapa banyak busurnya?',
      opsi: [
        { id: 'A', teks: '13' },
        { id: 'B', teks: '14' },
        { id: 'C', teks: '15' },
        { id: 'D', teks: 'Tidak dapat ditentukan' },
      ],
      kunci: 'B',
      pembahasan: '**Jawaban: B.** Tree dengan $\\lvert V \\rvert$ simpul selalu memiliki $\\lvert V \\rvert - 1 = 14$ busur.',
    },
  ],
}

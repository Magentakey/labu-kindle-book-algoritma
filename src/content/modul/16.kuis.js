// Kuis Pemahaman Modul 16 (7 soal pilihan ganda), bersumber dari soal PDF "16 - Graf dan Representasinya" halaman 7–8.
// Teks memakai Markdown dengan rumus TeX ($...$). `kunci` berupa satu id (satu jawaban) atau larik id (banyak jawaban, dinilai utuh).
export const kuis16 = {
  judul: 'Graf dan Representasinya',
  modul: '16',
  soal: [
    {
      no: 1,
      teks: 'Sebuah graf tak berarah memiliki simpul $\\{a, b, c, d\\}$ dan busur $\\{(a,b), (a,c), (b,c), (c,d)\\}$. Pilih **tiga** pernyataan yang benar tentang representasinya.',
      opsi: [
        { id: 'A', teks: 'Total panjang semua adjacency-list adalah 8.' },
        { id: 'B', teks: 'Adjacency-matrix-nya memiliki 8 sel bernilai 1.' },
        { id: 'C', teks: 'Adjacency-matrix-nya simetris.' },
        { id: 'D', teks: 'Total panjang semua adjacency-list adalah 4.' },
        { id: 'E', teks: 'Adjacency-matrix-nya tidak simetris.' },
      ],
      kunci: ['A', 'B', 'C'],
      pembahasan:
        '**Jawaban: A, B, dan C.** Adjacency-list: $a \\to b \\to c$; $b \\to a \\to c$; $c \\to a \\to b \\to d$; $d \\to c$ (total 8).\n\n| | a | b | c | d |\n| --- | --- | --- | --- | --- |\n| a | 0 | 1 | 1 | 0 |\n| b | 1 | 0 | 1 | 0 |\n| c | 1 | 1 | 0 | 1 |\n| d | 0 | 0 | 1 | 0 |\n\nMatriksnya memiliki 8 sel bernilai 1 dan simetris karena grafnya tak berarah.',
    },
    {
      no: 2,
      teks: 'Graf tak berarah dengan 8 simpul dan 12 busur disimpan sebagai adjacency-matrix. Berapa banyak sel yang bernilai 1?',
      opsi: [
        { id: 'A', teks: '12' },
        { id: 'B', teks: '64' },
        { id: 'C', teks: '8' },
        { id: 'D', teks: '24' },
      ],
      kunci: 'D',
      pembahasan: '**Jawaban: D.** Matriks berisi $8^2 = 64$ sel, dan setiap busur menghasilkan dua angka 1 ($a_{uv}$ dan $a_{vu}$), sehingga ada $2 \\times 12 =$ **24** sel bernilai 1 (sama dengan total panjang list $= 2\\lvert E \\rvert$).',
    },
    {
      no: 3,
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
      teks: 'Pernyataan "Adjacency-matrix graf berarah selalu simetris" adalah ...',
      opsi: [
        { id: 'A', teks: 'Benar, karena setiap busur menghasilkan dua angka 1.' },
        { id: 'B', teks: 'Benar, karena matriks selalu persegi.' },
        { id: 'C', teks: 'Salah: pada graf (b), $a_{12} = 1$ tetapi $a_{21} = 0$; simetri hanya dijamin untuk graf tak berarah.' },
        { id: 'D', teks: 'Salah, karena graf berarah tidak dapat disimpan sebagai matriks.' },
      ],
      kunci: 'C',
      pembahasan: '**Jawaban: C.** Pada graf (b), $a_{12} = 1$ (busur $1 \\to 2$) tetapi $a_{21} = 0$ (tidak ada busur $2 \\to 1$). Matriks simetris hanya dijamin untuk graf tak berarah.',
    },
    {
      no: 5,
      teks: 'Pada adjacency-matrix graf (b), pilih **tiga** pernyataan yang benar tentang derajat simpul.',
      opsi: [
        { id: 'A', teks: 'Derajat keluar simpul $u$ adalah jumlah angka 1 pada baris $u$.' },
        { id: 'B', teks: 'Derajat keluar simpul $u$ adalah jumlah angka 1 pada kolom $u$.' },
        { id: 'C', teks: 'Derajat masuk simpul $u$ adalah jumlah angka 1 pada kolom $u$.' },
        { id: 'D', teks: 'Derajat masuk simpul $u$ adalah jumlah angka 1 pada baris $u$.' },
        { id: 'E', teks: 'Derajat masuk simpul 2 adalah 2.' },
      ],
      kunci: ['A', 'C', 'E'],
      pembahasan:
        '**Jawaban: A, C, dan E.** Derajat keluar simpul $u$ = jumlah angka 1 pada **baris** $u$; derajat masuk = jumlah angka 1 pada **kolom** $u$. Simpul 2: baris 2 berisi satu angka 1 ($a_{25}$), jadi derajat keluar = 1; kolom 2 berisi $a_{12}$ dan $a_{42}$, jadi derajat masuk = 2.',
    },
    {
      no: 6,
      teks: 'Sebuah graf media sosial memiliki 1 juta pengguna (simpul), dan rata-rata setiap pengguna berteman dengan 200 pengguna lain. Pilih **dua** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: 'Adjacency-matrix adalah representasi yang tepat.' },
        { id: 'B', teks: 'Adjacency-list adalah representasi yang tepat.' },
        { id: 'C', teks: 'Banyak pertemanan $\\lvert E \\rvert$ kira-kira $10^8$.' },
        { id: 'D', teks: 'Adjacency-matrix menyimpan sekitar $10^8$ sel.' },
        { id: 'E', teks: 'Banyak pertemanan $\\lvert E \\rvert$ kira-kira $2 \\times 10^8$.' },
      ],
      kunci: ['B', 'C'],
      pembahasan:
        '**Jawaban: B dan C.** $\\lvert V \\rvert = 10^6$, $\\lvert E \\rvert \\approx \\frac{10^6 \\times 200}{2} = 10^8$ pertemanan. Adjacency-list menyimpan $10^6$ kepala list ditambah $2\\lvert E \\rvert = 2 \\times 10^8$ elemen. Adjacency-matrix membutuhkan $(10^6)^2 = 10^{12}$ sel, sekitar 5.000 kali lebih banyak. Graf ini jarang, sehingga **adjacency-list** yang tepat.',
    },
    {
      no: 7,
      teks: 'Sebuah tree memiliki 15 simpul. Berapa banyak busurnya?',
      opsi: [
        { id: 'A', teks: '13' },
        { id: 'B', teks: '15' },
        { id: 'C', teks: '14' },
        { id: 'D', teks: 'Tidak dapat ditentukan' },
      ],
      kunci: 'C',
      pembahasan: '**Jawaban: C.** Tree dengan $\\lvert V \\rvert$ simpul selalu memiliki $\\lvert V \\rvert - 1 = 14$ busur.',
    },
  ],
}

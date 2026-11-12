// Kuis Pemahaman Modul 17 (8 soal pilihan ganda), bersumber dari soal PDF "17 - Breadth-First Search (BFS)" halaman 9–10.
// Teks memakai Markdown dengan rumus TeX ($...$). `kunci` berupa satu id (satu jawaban) atau larik id (banyak jawaban, dinilai utuh).
export const kuis17 = {
  judul: 'Breadth-First Search (BFS)',
  modul: '17',
  soal: [
    {
      no: 1,
      teks: 'Struktur data apa yang membuat BFS menelusuri graf secara melebar?',
      opsi: [
        { id: 'A', teks: 'Tumpukan (stack, LIFO)' },
        { id: 'B', teks: 'Antrean (queue, FIFO)' },
        { id: 'C', teks: 'Antrean prioritas' },
        { id: 'D', teks: 'Array terurut' },
      ],
      kunci: 'B',
      pembahasan: '**Jawaban: B.** FIFO menjamin simpul berjarak $k$ dikeluarkan sebelum simpul berjarak $k + 1$. Stack (A) menghasilkan penelusuran mendalam seperti DFS. Antrean prioritas (C) dipakai Dijkstra dan Prim.',
    },
    {
      no: 2,
      teks: 'Jalankan BFS dari simpul 1 pada graf tak berarah Modul 16 dengan adjacency-list $1: 2, 5$; $2: 1, 5, 3, 4$; $3: 2, 4$; $4: 2, 5, 3$; $5: 4, 1, 2$. Pilih **tiga** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: 'Urutan DEQUEUE adalah 1, 2, 5, 3, 4.' },
        { id: 'B', teks: '$d(3) = 2$.' },
        { id: 'C', teks: '$\\pi(3) = 2$.' },
        { id: 'D', teks: '$d(5) = 2$.' },
        { id: 'E', teks: '$\\pi(3) = 1$.' },
      ],
      kunci: ['A', 'B', 'C'],
      pembahasan:
        '**Jawaban: A, B, dan C.** DEQUEUE 1: temukan 2 dan 5 ($d = 1$, $\\pi = 1$); $Q = 2, 5$. DEQUEUE 2: 1 dan 5 sudah tidak WHITE; temukan 3 dan 4 ($d = 2$, $\\pi = 2$); $Q = 5, 3, 4$. DEQUEUE 5, 3, 4: tidak ada simpul WHITE baru. Urutan DEQUEUE: **1, 2, 5, 3, 4**. Hasil: $d(1) = 0$; $d(2) = d(5) = 1$ dengan $\\pi = 1$; $d(3) = d(4) = 2$ dengan $\\pi = 2$.',
    },
    {
      no: 3,
      teks: 'Pada penelusuran di modul ini, mengapa simpul $u$ tidak dimasukkan ke antrean untuk kedua kalinya ketika $x$ diproses pada putaran 5?',
      opsi: [
        { id: 'A', teks: 'Karena $u$ masih WHITE.' },
        { id: 'B', teks: 'Karena $u$ sudah BLACK sejak putaran 1.' },
        { id: 'C', teks: 'Karena $u$ sudah GRAY (ditemukan oleh $t$ pada putaran 4), sedangkan langkah 13 hanya memproses simpul WHITE.' },
        { id: 'D', teks: 'Karena $x$ tidak bertetangga dengan $u$.' },
      ],
      kunci: 'C',
      pembahasan: '**Jawaban: C.** Saat $x$ diproses, $u$ sudah berwarna **GRAY** karena ditemukan oleh $t$ pada putaran 4. Langkah 13 hanya memproses simpul WHITE, sehingga $u$ tidak diubah dan tidak dimasukkan lagi ke antrean.',
    },
    {
      no: 4,
      teks: 'Pernyataan "Jika urutan adjacency-list diubah, nilai $v.d$ hasil BFS dapat berubah" adalah ...',
      opsi: [
        { id: 'A', teks: 'Salah: $v.d$ selalu sama dengan jumlah busur minimum dari $s$ ke $v$; yang dapat berubah hanya predecessor $v.\\pi$.' },
        { id: 'B', teks: 'Benar, karena urutan penemuan menentukan jarak.' },
        { id: 'C', teks: 'Benar, hanya untuk graf berarah.' },
        { id: 'D', teks: 'Salah, karena $v.\\pi$ juga tidak pernah berubah.' },
      ],
      kunci: 'A',
      pembahasan: '**Jawaban: A.** $v.d$ selalu sama dengan jumlah busur minimum dari $s$ ke $v$, berapa pun urutan list. Yang dapat berubah adalah predecessor $v.\\pi$ (bentuk BFS-tree) bila ada beberapa lintasan terpendek.',
    },
    {
      no: 5,
      teks: 'Sebuah graf berarah memiliki 1.000 simpul dan 5.000 busur, disimpan sebagai adjacency-list. Pilih **tiga** pernyataan yang benar tentang BFS.',
      opsi: [
        { id: 'A', teks: 'ENQUEUE dilakukan paling banyak 1.000 kali.' },
        { id: 'B', teks: 'ENQUEUE dilakukan paling banyak 5.000 kali.' },
        { id: 'C', teks: 'Pemeriksaan elemen adjacency-list paling banyak 5.000.' },
        { id: 'D', teks: 'Pemeriksaan elemen adjacency-list paling banyak 1.000.' },
        { id: 'E', teks: 'Total kerja sebanding dengan $V + E = 6.000$.' },
      ],
      kunci: ['A', 'C', 'E'],
      pembahasan: '**Jawaban: A, C, dan E.** ENQUEUE paling banyak **1.000** kali (sekali per simpul, termasuk $s$). Pemeriksaan elemen list paling banyak **5.000** (setiap busur berarah muncul sekali di list). Total kerja sebanding dengan $V + E = 6.000$.',
    },
    {
      no: 6,
      teks: 'Pada graf berbobot, busur $s \\to a$ berbobot 10, sedangkan $s \\to b$ dan $b \\to a$ masing-masing berbobot 1. Pilih **dua** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: 'BFS menemukan lintasan $s \\to a$ berbobot 10.' },
        { id: 'B', teks: 'BFS menemukan lintasan $s \\to b \\to a$.' },
        { id: 'C', teks: 'Lintasan yang ditemukan BFS berbobot minimum.' },
        { id: 'D', teks: 'Bobot minimum sebenarnya dari $s$ ke $a$ adalah 2.' },
        { id: 'E', teks: 'Bobot minimum sebenarnya dari $s$ ke $a$ adalah 10.' },
      ],
      kunci: ['A', 'D'],
      pembahasan: '**Jawaban: A dan D.** BFS memilih $s \\to a$ karena hanya 1 busur ($a.d = 1$). Bobotnya 10, padahal $s \\to b \\to a$ berbobot 2. Jadi lintasan BFS **tidak** berbobot minimum; BFS mengabaikan bobot. Untuk graf berbobot dibutuhkan Dijkstra atau Bellman-Ford.',
    },
    {
      no: 7,
      teks: 'Simpul yang berwarna GRAY pada suatu saat dalam BFS adalah simpul yang ...',
      opsi: [
        { id: 'A', teks: 'Belum ditemukan.' },
        { id: 'B', teks: 'Sudah diperiksa semua tetangganya.' },
        { id: 'C', teks: 'Sudah ditemukan dan masih berada di antrean.' },
        { id: 'D', teks: 'Tidak dapat dicapai dari $s$.' },
      ],
      kunci: 'C',
      pembahasan: '**Jawaban: C.** WHITE = belum ditemukan (A), BLACK = selesai (B). Simpul yang tidak terjangkau tetap WHITE (D).',
    },
    {
      no: 8,
      teks: 'Dengan hasil BFS pada modul ini ($y.\\pi = x$, $x.\\pi = w$, $w.\\pi = s$), lintasan dari $s$ ke $y$ yang dibentuk dari predecessor adalah ...',
      opsi: [
        { id: 'A', teks: '$s \\to w \\to t \\to u \\to y$' },
        { id: 'B', teks: '$s \\to r \\to v \\to y$' },
        { id: 'C', teks: '$s \\to x \\to y$' },
        { id: 'D', teks: '$s \\to w \\to x \\to y$ (3 busur, $y.d = 3$)' },
      ],
      kunci: 'D',
      pembahasan: '**Jawaban: D.** $y.\\pi = x$, $x.\\pi = w$, $w.\\pi = s$. Barisan mundur: $y, x, w, s$. Dibalik: $s \\to w \\to x \\to y$, dengan 3 busur ($y.d = 3$).',
    },
  ],
}

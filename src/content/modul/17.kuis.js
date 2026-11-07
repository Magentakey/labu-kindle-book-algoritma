// Kuis Pemahaman Modul 17 (8 soal) dan kunci serta pembahasannya, dari PDF "17 - Breadth-First Search (BFS)" halaman 9–10.
// Teks memakai Markdown dengan rumus TeX ($...$). Semua soal dinilai otomatis (pilihan, isian angka, atau pilihan jawaban); soal analisis (3 dan 6)
// dinilai dari pilihan alasan dan hasil hitung. Soal 4 (benar/salah dengan alasan) dinilai pada pilihan Benar/Salah; alasannya ada di pembahasan.
export const kuis17 = {
  judul: 'Breadth-First Search (BFS)',
  modul: '17',
  soal: [
    {
      no: 1,
      tipe: 'pilihan',
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
      tipe: 'penelusuran',
      teks: 'Jalankan BFS dari simpul 1 pada graf tak berarah Modul 16 dengan adjacency-list $1: 2, 5$; $2: 1, 5, 3, 4$; $3: 2, 4$; $4: 2, 5, 3$; $5: 4, 1, 2$. Tuliskan urutan DEQUEUE serta $d$ dan $\\pi$ setiap simpul.',
      isian: [
        { label: 'Urutan DEQUEUE', jenis: 'pilih', opsi: ['1, 2, 5, 3, 4', '1, 2, 3, 4, 5', '1, 5, 4, 2, 3', '1, 2, 5, 4, 3'], kunci: '1, 2, 5, 3, 4' },
        { label: 'd(3)', jenis: 'angka', kunci: 2 },
        { label: 'π(3)', jenis: 'angka', kunci: 2 },
        { label: 'd(5)', jenis: 'angka', kunci: 1 },
      ],
      pembahasan:
        'DEQUEUE 1: temukan 2 dan 5 ($d = 1$, $\\pi = 1$); $Q = 2, 5$. DEQUEUE 2: 1 dan 5 sudah tidak WHITE; temukan 3 dan 4 ($d = 2$, $\\pi = 2$); $Q = 5, 3, 4$. DEQUEUE 5, 3, 4: tidak ada simpul WHITE baru. Urutan DEQUEUE: **1, 2, 5, 3, 4**. Hasil: $d(1) = 0$; $d(2) = d(5) = 1$ dengan $\\pi = 1$; $d(3) = d(4) = 2$ dengan $\\pi = 2$.',
    },
    {
      no: 3,
      tipe: 'analisis',
      teks: 'Pada penelusuran di modul ini, mengapa simpul $u$ tidak dimasukkan ke antrean untuk kedua kalinya ketika $x$ diproses pada putaran 5?',
      isian: [
        { label: 'Warna u saat x diproses', jenis: 'pilih', opsi: ['WHITE', 'GRAY', 'BLACK'], kunci: 'GRAY' },
        { label: 'u ditemukan oleh simpul', jenis: 'pilih', opsi: ['t', 'w', 'x', 'y'], kunci: 't' },
        { label: 'Pada putaran nomor', jenis: 'angka', kunci: 4 },
      ],
      pembahasan: 'Saat $x$ diproses, $u$ sudah berwarna **GRAY** karena ditemukan oleh $t$ pada putaran 4. Langkah 13 hanya memproses simpul WHITE, sehingga $u$ tidak diubah dan tidak dimasukkan lagi ke antrean.',
    },
    {
      no: 4,
      tipe: 'benarsalah',
      teks: '"Jika urutan adjacency-list diubah, nilai $v.d$ hasil BFS dapat berubah." Benar atau salah? Pikirkan alasannya.',
      opsi: [
        { id: 'Benar', teks: 'Benar' },
        { id: 'Salah', teks: 'Salah' },
      ],
      kunci: 'Salah',
      pembahasan: '**Salah.** $v.d$ selalu sama dengan jumlah busur minimum dari $s$ ke $v$, berapa pun urutan list. Yang dapat berubah adalah predecessor $v.\\pi$ (bentuk BFS-tree) bila ada beberapa lintasan terpendek.',
    },
    {
      no: 5,
      tipe: 'perhitungan',
      teks: 'Sebuah graf berarah memiliki 1.000 simpul dan 5.000 busur, disimpan sebagai adjacency-list. Berapa kira-kira banyaknya operasi ENQUEUE paling banyak, dan berapa banyak pemeriksaan elemen adjacency-list paling banyak yang dilakukan BFS?',
      isian: [
        { label: 'Banyak ENQUEUE paling banyak', jenis: 'angka', kunci: 1000 },
        { label: 'Banyak pemeriksaan elemen list paling banyak', jenis: 'angka', kunci: 5000 },
        { label: 'Total kerja sebanding dengan V + E =', jenis: 'angka', kunci: 6000 },
      ],
      pembahasan: 'ENQUEUE paling banyak **1.000** kali (sekali per simpul, termasuk $s$). Pemeriksaan elemen list paling banyak **5.000** (setiap busur berarah muncul sekali di list). Total kerja sebanding dengan $V + E = 6.000$.',
    },
    {
      no: 6,
      tipe: 'analisis',
      teks: 'Pada graf berbobot, busur $s \\to a$ berbobot 10, sedangkan $s \\to b$ dan $b \\to a$ masing-masing berbobot 1. Lintasan apa yang ditemukan BFS dari $s$ ke $a$? Apakah lintasan itu berbobot minimum?',
      isian: [
        { label: 'Lintasan yang ditemukan BFS', jenis: 'pilih', opsi: ['s → a', 's → b → a'], kunci: 's → a' },
        { label: 'Bobot lintasan itu', jenis: 'angka', kunci: 10 },
        { label: 'Bobot minimum sebenarnya', jenis: 'angka', kunci: 2 },
        { label: 'Apakah lintasan BFS berbobot minimum?', jenis: 'pilih', opsi: ['Ya', 'Tidak'], kunci: 'Tidak' },
      ],
      pembahasan:
        'BFS memilih $s \\to a$ karena hanya 1 busur ($a.d = 1$). Bobotnya 10, padahal $s \\to b \\to a$ berbobot 2. Jadi lintasan BFS **tidak** berbobot minimum; BFS mengabaikan bobot. Untuk graf berbobot dibutuhkan Dijkstra atau Bellman-Ford.',
    },
    {
      no: 7,
      tipe: 'pilihan',
      teks: 'Simpul yang berwarna GRAY pada suatu saat dalam BFS adalah simpul yang ...',
      opsi: [
        { id: 'A', teks: 'Belum ditemukan.' },
        { id: 'B', teks: 'Sudah ditemukan dan masih berada di antrean.' },
        { id: 'C', teks: 'Sudah diperiksa semua tetangganya.' },
        { id: 'D', teks: 'Tidak dapat dicapai dari $s$.' },
      ],
      kunci: 'B',
      pembahasan: '**Jawaban: B.** WHITE = belum ditemukan (A), BLACK = selesai (C). Simpul yang tidak terjangkau tetap WHITE (D).',
    },
    {
      no: 8,
      tipe: 'penelusuran',
      teks: 'Dengan hasil BFS pada modul ini, gunakan predecessor untuk menyusun lintasan dari $s$ ke $y$ langkah demi langkah.',
      isian: [
        { label: 'Barisan mundur dari y', jenis: 'pilih', opsi: ['y, x, w, s', 'y, u, t, s', 'y, x, t, s', 's, w, x, y'], kunci: 'y, x, w, s' },
        { label: 'Lintasan dari s ke y (dibalik)', jenis: 'pilih', opsi: ['s → w → x → y', 's → w → t → u → y', 's → r → v → y', 's → x → y'], kunci: 's → w → x → y' },
        { label: 'Jumlah busur (y.d)', jenis: 'angka', kunci: 3 },
      ],
      pembahasan: '$y.\\pi = x$, $x.\\pi = w$, $w.\\pi = s$. Barisan mundur: $y, x, w, s$. Dibalik: $s \\to w \\to x \\to y$, dengan 3 busur ($y.d = 3$).',
    },
  ],
}

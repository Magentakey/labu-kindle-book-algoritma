// Kuis Pemahaman Modul 21 (7 soal) dan kunci serta pembahasannya, dari PDF "21 - Algoritma Prim" halaman 8–9.
// Teks memakai Markdown dengan rumus TeX ($...$). Semua soal dinilai otomatis (pilihan atau isian); soal penelusuran dan analisis (2, 3, 5, 6)
// dinilai dari beberapa isian, bukan uraian. Soal 4 (benar/salah dengan alasan) dinilai pada pilihan Benar/Salah; alasannya ada di pembahasan.
const EXTRACT = ['p (0)', 'q (2)', 'r (1)', 's (4)', 't (6)']
const BUSUR_H = ['(a, h)', '(b, h)', '(g, h)', '(i, h)']
const LANGKAH = ['sekitar 500.000 langkah', 'sekitar 1.000.000 langkah', 'sekitar 5.000.000 langkah']

export const kuis21 = {
  judul: 'Algoritma Prim',
  modul: '21',
  soal: [
    {
      no: 1,
      tipe: 'pilihan',
      teks: 'Pada Prim, nilai $v.\\mathit{key}$ untuk simpul $v$ yang masih di $Q$ menyatakan ...',
      opsi: [
        { id: 'A', teks: 'Jarak terpendek dari akar ke $v$.' },
        { id: 'B', teks: 'Bobot busur termurah yang menghubungkan $v$ dengan tree saat ini.' },
        { id: 'C', teks: 'Banyaknya tetangga $v$.' },
        { id: 'D', teks: 'Urutan $v$ di adjacency-list.' },
      ],
      kunci: 'B',
      pembahasan: '**Jawaban: B.** Pilihan A adalah arti $v.d$ pada Dijkstra, bukan key pada Prim.',
    },
    {
      no: 2,
      tipe: 'penelusuran',
      teks: 'Jalankan Prim dari akar $p$ pada graf dengan busur $(p, q) = 3$, $(p, r) = 1$, $(q, r) = 2$, $(q, s) = 5$, $(r, s) = 4$, $(s, t) = 6$, $(r, t) = 7$. Pilih simpul yang di-extract pada setiap iterasi (beserta key-nya) dan isi total bobot MST.',
      isian: [
        { label: 'Extract ke-1', jenis: 'pilih', opsi: EXTRACT, kunci: 'p (0)' },
        { label: 'Extract ke-2', jenis: 'pilih', opsi: EXTRACT, kunci: 'r (1)' },
        { label: 'Extract ke-3', jenis: 'pilih', opsi: EXTRACT, kunci: 'q (2)' },
        { label: 'Extract ke-4', jenis: 'pilih', opsi: EXTRACT, kunci: 's (4)' },
        { label: 'Extract ke-5', jenis: 'pilih', opsi: EXTRACT, kunci: 't (6)' },
        { label: 'Total bobot MST', jenis: 'angka', kunci: 13 },
      ],
      pembahasan:
        'Extract $p$ (0): $q.\\mathit{key} = 3$, $r.\\mathit{key} = 1$. Extract $r$ (1): $q.\\mathit{key} = 2$, $s.\\mathit{key} = 4$, $t.\\mathit{key} = 7$. Extract $q$ (2): $w(q, s) = 5 > 4$, tidak berubah. Extract $s$ (4): $t.\\mathit{key} = 6$. Extract $t$ (6). Urutan: **p(0), r(1), q(2), s(4), t(6)**; MST $\\{(r, p), (q, r), (s, r), (t, s)\\}$, total **13**, sama dengan hasil Kruskal pada kuis Modul 20.',
    },
    {
      no: 3,
      tipe: 'analisis',
      teks: 'Pada iterasi 4 penelusuran di modul ini, key $h$ turun dari 8 menjadi 7, lalu pada iterasi 6 turun lagi menjadi 1. Jelaskan apa arti setiap perubahan itu. Jawab dengan melengkapi pernyataan berikut.',
      isian: [
        { label: 'Awalnya (h.key = 8, π = a), h tersambung lewat busur', jenis: 'pilih', opsi: BUSUR_H, kunci: '(a, h)' },
        { label: 'Setelah i masuk tree, h.key = 7 lewat busur', jenis: 'pilih', opsi: BUSUR_H, kunci: '(i, h)' },
        { label: 'Setelah g masuk tree, h.key = 1 lewat busur', jenis: 'pilih', opsi: BUSUR_H, kunci: '(g, h)' },
        {
          label: 'Key selalu mencerminkan',
          jenis: 'pilih',
          opsi: ['Sambungan termurah yang diketahui sejauh ini ke tree yang terus membesar', 'Jarak terpendek dari akar a ke h', 'Banyaknya tetangga h yang sudah di tree'],
          kunci: 'Sambungan termurah yang diketahui sejauh ini ke tree yang terus membesar',
        },
      ],
      pembahasan:
        'Awalnya ($h.\\mathit{key} = 8$, $\\pi = a$) cara termurah menyambungkan $h$ adalah lewat busur $(a, h)$. Setelah $i$ masuk tree, ditemukan sambungan lebih murah $(i, h) = 7$. Setelah $g$ masuk tree, ditemukan sambungan yang lebih murah lagi $(g, h) = 1$. Key selalu mencerminkan sambungan termurah yang diketahui sejauh ini ke tree yang terus membesar.',
    },
    {
      no: 4,
      tipe: 'benarsalah',
      teks: '"Jika Prim dijalankan dari akar yang berbeda, bobot MST yang dihasilkan bisa berbeda." Benar atau salah? Pikirkan alasannya.',
      opsi: [
        { id: 'Benar', teks: 'Benar' },
        { id: 'Salah', teks: 'Salah' },
      ],
      kunci: 'Salah',
      pembahasan: '**Salah.** Akar yang berbeda dapat menghasilkan urutan extract dan bahkan MST yang berbeda (bila ada bobot sama), tetapi **bobot** MST selalu sama, yaitu bobot minimum. Pada graf contoh, bobotnya selalu 37.',
    },
    {
      no: 5,
      tipe: 'perhitungan',
      teks: 'Sebuah graf padat memiliki $\\lvert V \\rvert = 1.000$ dan $\\lvert E \\rvert \\approx 500.000$. Bandingkan perkiraan running time Prim dengan array ($V^2$) dan dengan binary heap ($E \\lg V$). Mana yang lebih baik?',
      isian: [
        { label: 'Array: V²', jenis: 'pilih', opsi: LANGKAH, kunci: 'sekitar 1.000.000 langkah' },
        { label: 'Binary heap: E lg V (lg 1.000 ≈ 10)', jenis: 'pilih', opsi: LANGKAH, kunci: 'sekitar 5.000.000 langkah' },
        { label: 'Yang lebih baik untuk graf padat ini', jenis: 'pilih', opsi: ['Array', 'Binary heap'], kunci: 'Array' },
        { label: 'Array kira-kira berapa kali lebih sedikit langkahnya', jenis: 'angka', kunci: 5 },
      ],
      pembahasan: 'Array: $V^2 = 10^6$ langkah. Binary heap: $E \\lg V \\approx 500.000 \\times 10 = 5 \\times 10^6$ langkah. Untuk graf padat ini, **array lebih baik** (sekitar 5 kali lebih sedikit).',
    },
    {
      no: 6,
      tipe: 'analisis',
      teks: 'Jalankan Prim pada graf contoh dengan akar $e$ (gunakan aturan abjad bila key sama). Simpul mana yang di-extract pertama kali setelah $e$, dan berapa bobot MST-nya?',
      isian: [
        { label: 'Simpul yang di-extract pertama setelah e', jenis: 'pilih', opsi: ['d', 'f'], kunci: 'd' },
        { label: 'Key simpul itu', jenis: 'angka', kunci: 9 },
        { label: 'Bobot MST', jenis: 'angka', kunci: 37 },
        { label: 'MST yang terbentuk memuat busur (a, h)', jenis: 'pilih', opsi: ['Ya', 'Tidak'], kunci: 'Ya' },
      ],
      pembahasan:
        'Dari $e$: $Adj[e] = d, f$ memberi $d.\\mathit{key} = 9$, $f.\\mathit{key} = 10$, sehingga yang di-extract pertama setelah $e$ adalah $d$ (key 9). Selanjutnya $c$ (7), $i$ (2), $f$ (4), $g$ (2), $h$ (1), $a$ (8, lewat $(a, h)$ karena $h$ sudah di tree sebelum $b$), $b$ (4). Bobot MST tetap **37** ($9 + 7 + 2 + 4 + 2 + 1 + 8 + 4$). MST yang terbentuk kali ini memuat $(a, h)$, yaitu $T_2$ dari Modul 19.',
    },
    {
      no: 7,
      tipe: 'pilihan',
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

// Kuis Pemahaman Modul 24 (7 soal) dan kunci serta pembahasannya, dari PDF "24 - Algoritma Dijkstra" halaman 9–10.
// Teks memakai Markdown dengan rumus TeX ($...$). Semua soal dinilai otomatis (pilihan atau isian); soal penelusuran, analisis, dan perhitungan (2, 3, 5, 6)
// dinilai dari beberapa isian, bukan uraian. Soal 4 (benar/salah dengan alasan) dinilai pada pilihan Benar/Salah; alasannya ada di pembahasan.
const URUT = ['A', 'B', 'C', 'D', 'E']
const LANGKAH_ARRAY = ['sekitar 10.000.000 langkah', 'sekitar 100.000.000 langkah', 'sekitar 1.000.000.000 langkah']
const LANGKAH_HEAP = ['sekitar 53.200 langkah', 'sekitar 532.000 langkah', 'sekitar 5.320.000 langkah']

export const kuis24 = {
  judul: 'Algoritma Dijkstra',
  modul: '24',
  soal: [
    {
      no: 1,
      tipe: 'pilihan',
      teks: 'Syarat utama agar Dijkstra memberikan hasil yang benar adalah ...',
      opsi: [
        { id: 'A', teks: 'Graf harus tak berarah.' },
        { id: 'B', teks: 'Semua bobot busur tidak negatif.' },
        { id: 'C', teks: 'Graf tidak boleh memiliki cycle.' },
        { id: 'D', teks: 'Banyaknya busur harus lebih sedikit dari banyaknya simpul.' },
      ],
      kunci: 'B',
      pembahasan: '**Jawaban: B.** Dijkstra dapat bekerja pada graf berarah maupun tak berarah dan pada graf yang memiliki cycle. Yang wajib hanyalah bobot nonnegatif.',
    },
    {
      no: 2,
      tipe: 'penelusuran',
      teks: 'Jalankan Dijkstra dari $A$ pada graf berarah: $(A, B) = 4$, $(A, C) = 1$, $(C, B) = 2$, $(B, D) = 1$, $(C, D) = 5$, $(D, E) = 3$. Pilih simpul yang di-extract pada setiap iterasi, isi $v.d$ akhir, dan pilih lintasan ke $E$.',
      isian: [
        { label: 'Extract ke-1', jenis: 'pilih', opsi: URUT, kunci: 'A' },
        { label: 'Extract ke-2', jenis: 'pilih', opsi: URUT, kunci: 'C' },
        { label: 'Extract ke-3', jenis: 'pilih', opsi: URUT, kunci: 'B' },
        { label: 'Extract ke-4', jenis: 'pilih', opsi: URUT, kunci: 'D' },
        { label: 'Extract ke-5', jenis: 'pilih', opsi: URUT, kunci: 'E' },
        { label: 'B.d akhir', jenis: 'angka', kunci: 3 },
        { label: 'D.d akhir', jenis: 'angka', kunci: 4 },
        { label: 'E.d akhir', jenis: 'angka', kunci: 7 },
        { label: 'Lintasan ke E', jenis: 'pilih', opsi: ['A → C → B → D → E', 'A → B → D → E', 'A → C → D → E'], kunci: 'A → C → B → D → E' },
      ],
      pembahasan:
        'Extract A (0): B = 4, C = 1. Extract C (1): B = $\\min(4, 1 + 2) = 3$, D = 6. Extract B (3): D = $\\min(6, 3 + 1) = 4$. Extract D (4): E = 7. Extract E (7). Urutan: **A, C, B, D, E**. Nilai akhir: A 0, B 3, C 1, D 4, E 7. Lintasan ke E: **A → C → B → D → E** ($1 + 2 + 1 + 3 = 7$).',
    },
    {
      no: 3,
      tipe: 'analisis',
      teks: 'Pada penelusuran di modul ini, mengapa nilai $t.d$ boleh berubah dari 10 menjadi 8 pada loop 2, tetapi tidak boleh berubah lagi setelah $t$ di-extract pada loop 4? Jawab dengan melengkapi pernyataan berikut.',
      isian: [
        { label: 'Perubahan 10 → 8 terjadi karena ditemukan lintasan yang lebih murah lewat simpul', jenis: 'pilih', opsi: ['y', 'x', 'z'], kunci: 'y' },
        { label: 'Sebelum di-extract, t.d adalah', jenis: 'pilih', opsi: ['Estimasi (batas atas) yang masih dapat diperbaiki', 'Jarak terpendek yang sudah final', 'Jumlah busur dari s'], kunci: 'Estimasi (batas atas) yang masih dapat diperbaiki' },
        { label: 'Saat t di-extract, t.d adalah nilai', jenis: 'pilih', opsi: ['Terkecil di Q', 'Terbesar di Q', 'Sama dengan s.d'], kunci: 'Terkecil di Q' },
        { label: 'Setelah itu, lintasan lain yang melewati simpul di Q bisa lebih murah', jenis: 'pilih', opsi: ['Ya', 'Tidak (semua bobot nonnegatif)'], kunci: 'Tidak (semua bobot nonnegatif)' },
      ],
      pembahasan:
        'Sebelum di-extract, $t.d$ hanyalah estimasi (batas atas) yang dapat diperbaiki bila ditemukan lintasan lebih murah, seperti lewat $y$. Saat $t$ di-extract, $t.d$ adalah nilai terkecil di $Q$; karena semua bobot nonnegatif, lintasan lain yang melewati simpul di $Q$ tidak mungkin lebih murah. Jadi $t.d = \\delta(s, t)$ sudah final.',
    },
    {
      no: 4,
      tipe: 'benarsalah',
      teks: '"Jika graf tidak memiliki cycle negatif, Dijkstra tetap benar walaupun ada busur berbobot negatif." Benar atau salah? Pikirkan alasannya.',
      opsi: [
        { id: 'Benar', teks: 'Benar' },
        { id: 'Salah', teks: 'Salah' },
      ],
      kunci: 'Salah',
      pembahasan: '**Salah.** Contoh penyangkal di modul ini tidak memiliki cycle sama sekali, tetapi Dijkstra tetap menghasilkan $c.d = 3$, padahal jarak sebenarnya 2. Bobot negatif saja sudah dapat membuat Dijkstra salah.',
    },
    {
      no: 5,
      tipe: 'perhitungan',
      teks: 'Sebuah jaringan jalan memiliki $\\lvert V \\rvert = 10.000$ persimpangan dan $\\lvert E \\rvert = 30.000$ ruas. Perkirakan banyaknya langkah Dijkstra dengan array ($V^2$) dan dengan binary heap ($(V + E) \\lg V$). Berapa kali lebih cepat versi heap?',
      isian: [
        { label: 'Array: V²', jenis: 'pilih', opsi: LANGKAH_ARRAY, kunci: 'sekitar 100.000.000 langkah' },
        { label: 'Binary heap: (V + E) lg V (lg 10.000 ≈ 13,3)', jenis: 'pilih', opsi: LANGKAH_HEAP, kunci: 'sekitar 532.000 langkah' },
        { label: 'Versi yang lebih cepat', jenis: 'pilih', opsi: ['Array', 'Binary heap'], kunci: 'Binary heap' },
        { label: 'Seberapa lebih cepat', jenis: 'pilih', opsi: ['sekitar 19 kali', 'sekitar 190 kali', 'sekitar 1.900 kali'], kunci: 'sekitar 190 kali' },
      ],
      pembahasan:
        'Array: $V^2 = 10^8$ langkah. Binary heap: $(10.000 + 30.000) \\times \\lg 10.000 \\approx 40.000 \\times 13{,}3 \\approx 532.000$ langkah. Versi heap sekitar **190 kali** lebih cepat.',
    },
    {
      no: 6,
      tipe: 'analisis',
      teks: 'Pada graf contoh modul ini, bobot busur $(y, t)$ diubah dari 3 menjadi 6. Tentukan jarak terpendek baru ke $t$ dan $x$ beserta lintasannya.',
      isian: [
        { label: 'δ(s, t) baru', jenis: 'angka', kunci: 10 },
        { label: 'Lintasan ke t', jenis: 'pilih', opsi: ['s → t', 's → y → t'], kunci: 's → t' },
        { label: 'δ(s, x) baru', jenis: 'angka', kunci: 11 },
        { label: 'Lintasan ke x', jenis: 'pilih', opsi: ['s → t → x', 's → y → x', 's → y → z → x'], kunci: 's → t → x' },
      ],
      pembahasan:
        'Lintasan ke $t$: langsung $s \\to t = 10$, atau $s \\to y \\to t = 5 + 6 = 11$. Jadi $\\delta(s, t) = $ **10** lewat $s \\to t$. Ke $x$: $s \\to t \\to x = 11$, $s \\to y \\to x = 14$, $s \\to y \\to z \\to x = 5 + 2 + 6 = 13$. Jadi $\\delta(s, x) = $ **11** lewat $s \\to t \\to x$.',
    },
    {
      no: 7,
      tipe: 'pilihan',
      teks: 'Apa perbedaan nilai yang disimpan Dijkstra dan Prim untuk setiap simpul?',
      opsi: [
        { id: 'A', teks: 'Tidak ada perbedaan.' },
        { id: 'B', teks: 'Dijkstra menyimpan total bobot lintasan dari sumber; Prim menyimpan bobot satu busur termurah ke tree.' },
        { id: 'C', teks: 'Dijkstra menyimpan jumlah busur; Prim menyimpan total bobot.' },
        { id: 'D', teks: 'Prim hanya bekerja pada graf berarah.' },
      ],
      kunci: 'B',
      pembahasan: '**Jawaban: B.** Inilah satu-satunya perbedaan struktural kedua algoritma, dan perbedaan itu membuat Dijkstra menghasilkan pohon lintasan terpendek sedangkan Prim menghasilkan MST.',
    },
  ],
}

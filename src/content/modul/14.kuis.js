// Kuis Pemahaman Modul 14 (7 soal) dan kunci serta pembahasannya, dari PDF "14 - Activity-Selection Problem" halaman 9–10.
// Teks memakai Markdown dengan rumus TeX ($...$). Soal 3, 6, dan 7 (jawaban uraian dan pembuktian) dinilai sendiri dengan membandingkan kunci;
// soal lain dinilai otomatis. Soal 4 (benar/salah dengan alasan) dinilai pada pilihan Benar/Salah; alasannya ada di pembahasan.
export const kuis14 = {
  judul: 'Activity-Selection Problem',
  modul: '14',
  soal: [
    {
      no: 1,
      tipe: 'pilihan',
      teks: 'Aktivitas $a_p = [2, 6)$ dan $a_q = [6, 9)$ ...',
      opsi: [
        { id: 'A', teks: 'Tidak kompatibel karena sama-sama memakai pukul 6.' },
        { id: 'B', teks: 'Kompatibel karena $s_q = 6 \\ge f_p = 6$.' },
        { id: 'C', teks: 'Kompatibel hanya jika $a_q$ dipilih lebih dulu.' },
        { id: 'D', teks: 'Tidak dapat ditentukan.' },
      ],
      kunci: 'B',
      pembahasan: '**Jawaban: B.** Selang setengah terbuka $[2, 6)$ tidak memuat titik 6, sehingga $a_q$ boleh mulai tepat pukul 6.',
    },
    {
      no: 2,
      tipe: 'penelusuran',
      teks: 'Jalankan GREEDY-ACTIVITY-SELECTOR pada aktivitas berikut (sudah terurut menurut $f$): $[1, 3), [2, 5), [4, 7), [1, 8), [5, 9), [8, 10), [9, 11), [11, 14), [13, 16)$. Tuliskan himpunan $A$ yang dihasilkan.',
      isian: [
        { label: 'Himpunan A', jenis: 'pilih', opsi: ['{[1, 3), [4, 7), [8, 10), [11, 14)}', '{[1, 3), [4, 7), [8, 10), [13, 16)}', '{[1, 3), [5, 9), [9, 11), [13, 16)}', '{[1, 3), [2, 5), [5, 9), [9, 11)}'], kunci: '{[1, 3), [4, 7), [8, 10), [11, 14)}' },
        { label: 'Banyak aktivitas terpilih', jenis: 'angka', kunci: 4 },
        { label: 'Nilai f[k] terakhir', jenis: 'angka', kunci: 14 },
      ],
      pembahasan:
        '$A = \\{[1, 3)\\}$, $f_k = 3$. $[2, 5)$: $2 \\ge 3$? tidak. $[4, 7)$: $4 \\ge 3$ ya, $f_k = 7$. $[1, 8)$: tidak. $[5, 9)$: tidak. $[8, 10)$: $8 \\ge 7$ ya, $f_k = 10$. $[9, 11)$: tidak. $[11, 14)$: $11 \\ge 10$ ya, $f_k = 14$. $[13, 16)$: tidak. Hasil: $\\{[1, 3), [4, 7), [8, 10), [11, 14)\\}$, 4 aktivitas.',
    },
    {
      no: 3,
      tipe: 'analisis',
      mandiri: true,
      teks: 'Mengapa pada langkah 5 cukup membandingkan $s[m]$ dengan $f[k]$, tidak perlu dengan semua aktivitas di $A$?',
      kunciTeks:
        'Karena aktivitas diproses terurut menurut waktu selesai, a_k (yang terakhir dimasukkan) adalah anggota A dengan waktu selesai terbesar. Jika s[m] ≥ f[k], maka s[m] juga lebih besar atau sama dengan waktu selesai semua anggota A lainnya, sehingga a_m kompatibel dengan semuanya.',
      pembahasan:
        'Karena aktivitas diproses terurut menurut waktu selesai, $a_k$ (yang terakhir dimasukkan) adalah anggota $A$ dengan waktu selesai terbesar. Jika $s[m] \\ge f[k]$, maka $s[m]$ juga lebih besar atau sama dengan waktu selesai semua anggota $A$ lainnya, sehingga $a_m$ kompatibel dengan semuanya.',
    },
    {
      no: 4,
      tipe: 'benarsalah',
      teks: '"Kriteria memilih aktivitas dengan waktu mulai paling awal selalu menghasilkan solusi optimal karena aktivitas itu tidak didahului aktivitas lain." Benar atau salah? Pikirkan alasannya.',
      opsi: [
        { id: 'Benar', teks: 'Benar' },
        { id: 'Salah', teks: 'Salah' },
      ],
      kunci: 'Salah',
      pembahasan: '**Salah.** Pada data bahan kuliah, kriteria ini memilih $[0, 6)$ lebih dulu dan hanya menghasilkan 3 aktivitas, padahal optimalnya 4. Aktivitas yang mulai paling awal bisa saja sangat panjang dan menghalangi banyak aktivitas lain.',
    },
    {
      no: 5,
      tipe: 'perhitungan',
      teks: 'Sebanyak 10.000 aktivitas diberikan dalam keadaan acak (belum terurut). Berapa running time total untuk mendapatkan solusi optimal dengan Greedy? Bagian mana yang dominan?',
      isian: [
        { label: 'Running time total', jenis: 'pilih', opsi: ['Θ(n)', 'O(n lg n)', 'O(n²)'], kunci: 'O(n lg n)' },
        { label: 'Bagian yang dominan', jenis: 'pilih', opsi: ['Pengurutan', 'Seleksi greedy'], kunci: 'Pengurutan' },
        { label: 'Perkiraan n lg n untuk n = 10.000 (dibulatkan ke ribuan terdekat)', jenis: 'angka', kunci: 133000 },
      ],
      pembahasan:
        'Pengurutan $O(n \\lg n)$ ditambah GREEDY-ACTIVITY-SELECTOR $\\Theta(n)$, total $O(n \\lg n)$. Bagian yang dominan adalah **pengurutan**. Untuk $n = 10.000$: sekitar $n \\lg n \\approx 133.000$ langkah dasar untuk mengurutkan, dibanding sekitar $10.000$ langkah untuk seleksi.',
    },
    {
      no: 6,
      tipe: 'analisis',
      mandiri: true,
      teks: 'Buat contoh tiga atau empat aktivitas yang menunjukkan kriteria "pilih aktivitas yang paling sedikit bertabrakan dengan aktivitas lain" bisa gagal, **atau** jelaskan mengapa contoh penyangkal untuk kriteria "mulai paling awal" mudah dibuat.',
      kunciTeks:
        'Contoh untuk kriteria "mulai paling awal": [0, 10), [1, 2), [3, 4). Kriteria ini memilih [0, 10) dan berhenti dengan 1 aktivitas, padahal [1, 2) dan [3, 4) (2 aktivitas) kompatibel. Contoh mudah dibuat karena cukup satu aktivitas panjang yang mulai paling awal. (Untuk kriteria "tabrakan paling sedikit", Kleinberg dan Tardos (2006) juga memberikan contoh penyangkal, tetapi contohnya lebih besar.)',
      pembahasan:
        'Contoh untuk kriteria "mulai paling awal": $[0, 10)$, $[1, 2)$, $[3, 4)$. Kriteria ini memilih $[0, 10)$ dan berhenti dengan 1 aktivitas, padahal $[1, 2)$ dan $[3, 4)$ (2 aktivitas) kompatibel. Contoh mudah dibuat karena cukup satu aktivitas panjang yang mulai paling awal. (Untuk kriteria "tabrakan paling sedikit", Kleinberg dan Tardos (2006) juga memberikan contoh penyangkal, tetapi contohnya lebih besar.)',
    },
    {
      no: 7,
      tipe: 'pembuktian',
      mandiri: true,
      teks: 'Dalam argumen pertukaran, mengapa $A\' = (A - \\{a_j\\}) \\cup \\{a_1\\}$ tetap merupakan himpunan aktivitas yang saling kompatibel?',
      kunciTeks:
        'Semua aktivitas lain di A (selain a_j) mulai setelah a_j selesai, yaitu s ≥ f_j. Karena a_1 selesai paling awal di antara semua aktivitas, f_1 ≤ f_j ≤ s. Jadi a_1 selesai sebelum (atau tepat saat) setiap aktivitas lain di A\' dimulai, sehingga semuanya kompatibel.',
      pembahasan:
        'Semua aktivitas lain di $A$ (selain $a_j$) mulai setelah $a_j$ selesai, yaitu $s \\ge f_j$. Karena $a_1$ selesai paling awal di antara semua aktivitas, $f_1 \\le f_j \\le s$. Jadi $a_1$ selesai sebelum (atau tepat saat) setiap aktivitas lain di $A\'$ dimulai, sehingga semuanya kompatibel.',
    },
  ],
}

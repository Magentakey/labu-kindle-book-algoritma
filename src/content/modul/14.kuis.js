// Kuis Pemahaman Modul 14 (7 soal pilihan ganda), bersumber dari soal PDF "14 - Activity-Selection Problem" halaman 9–10.
// Teks memakai Markdown dengan rumus TeX ($...$). `kunci` berupa satu id (satu jawaban) atau larik id (banyak jawaban, dinilai utuh).
export const kuis14 = {
  judul: 'Activity-Selection Problem',
  modul: '14',
  soal: [
    {
      no: 1,
      teks: 'Aktivitas $a_p = [2, 6)$ dan $a_q = [6, 9)$ ...',
      opsi: [
        { id: 'A', teks: 'Tidak kompatibel karena sama-sama memakai pukul 6.' },
        { id: 'B', teks: 'Tidak dapat ditentukan.' },
        { id: 'C', teks: 'Kompatibel karena $s_q = 6 \\ge f_p = 6$.' },
        { id: 'D', teks: 'Kompatibel hanya jika $a_q$ dipilih lebih dulu.' },
      ],
      kunci: 'C',
      pembahasan: '**Jawaban: C.** Selang setengah terbuka $[2, 6)$ tidak memuat titik 6, sehingga $a_q$ boleh mulai tepat pukul 6.',
    },
    {
      no: 2,
      teks: 'Jalankan GREEDY-ACTIVITY-SELECTOR pada aktivitas berikut (sudah terurut menurut $f$): $[1, 3), [2, 5), [4, 7), [1, 8), [5, 9), [8, 10), [9, 11), [11, 14), [13, 16)$. Pilih **tiga** pernyataan yang benar tentang himpunan $A$ yang dihasilkan.',
      opsi: [
        { id: 'A', teks: '$A$ memuat 4 aktivitas.' },
        { id: 'B', teks: 'Nilai $f_k$ terakhir adalah 14.' },
        { id: 'C', teks: '$A$ memuat $[11, 14)$.' },
        { id: 'D', teks: '$A$ memuat $[13, 16)$.' },
        { id: 'E', teks: '$A$ memuat $[2, 5)$.' },
      ],
      kunci: ['A', 'B', 'C'],
      pembahasan: '**Jawaban: A, B, dan C.** $A = \\{[1, 3)\\}$, $f_k = 3$. $[2, 5)$: $2 \\ge 3$? tidak. $[4, 7)$: $4 \\ge 3$ ya, $f_k = 7$. $[1, 8)$: tidak. $[5, 9)$: tidak. $[8, 10)$: $8 \\ge 7$ ya, $f_k = 10$. $[9, 11)$: tidak. $[11, 14)$: $11 \\ge 10$ ya, $f_k = 14$. $[13, 16)$: tidak. Hasil: $\\{[1, 3), [4, 7), [8, 10), [11, 14)\\}$, 4 aktivitas.',
    },
    {
      no: 3,
      teks: 'Mengapa pada langkah 5 cukup membandingkan $s[m]$ dengan $f[k]$, tidak perlu dengan semua aktivitas di $A$?',
      opsi: [
        { id: 'A', teks: 'Karena aktivitas diproses terurut menurut $f$, sehingga $a_k$ (yang terakhir masuk) punya waktu selesai terbesar di $A$; bila $s[m] \\ge f[k]$ maka $a_m$ kompatibel dengan semua anggota $A$.' },
        { id: 'B', teks: 'Karena aktivitas diurutkan menurut waktu mulai.' },
        { id: 'C', teks: 'Karena $A$ selalu hanya berisi satu aktivitas.' },
        { id: 'D', teks: 'Karena $f[k]$ selalu bernilai 0.' },
      ],
      kunci: 'A',
      pembahasan: '**Jawaban: A.** Jika $s[m] \\ge f[k]$, maka $s[m]$ juga lebih besar atau sama dengan waktu selesai semua anggota $A$ lainnya, sehingga $a_m$ kompatibel dengan semuanya.',
    },
    {
      no: 4,
      teks: 'Apakah kriteria "pilih aktivitas dengan waktu mulai paling awal" selalu menghasilkan solusi optimal?',
      opsi: [
        { id: 'A', teks: 'Ya, karena aktivitas itu tidak didahului aktivitas lain.' },
        { id: 'B', teks: 'Ya, asalkan jumlah aktivitas kurang dari 5.' },
        { id: 'C', teks: 'Ya, asalkan aktivitas sudah terurut menurut waktu selesai.' },
        { id: 'D', teks: 'Tidak: pada data bahan kuliah kriteria ini memilih $[0, 6)$ lebih dulu dan hanya menghasilkan 3 aktivitas padahal optimalnya 4, karena aktivitas yang mulai paling awal bisa sangat panjang.' },
      ],
      kunci: 'D',
      pembahasan: '**Jawaban: D.** Aktivitas yang mulai paling awal bisa saja sangat panjang dan menghalangi banyak aktivitas lain. Kriteria yang benar adalah memilih waktu selesai paling awal.',
    },
    {
      no: 5,
      teks: 'Sebanyak 10.000 aktivitas diberikan dalam keadaan acak (belum terurut). Pilih **dua** pernyataan yang benar tentang solusi optimal dengan Greedy.',
      opsi: [
        { id: 'A', teks: 'Running time totalnya $\\Theta(n)$.' },
        { id: 'B', teks: 'Bagian yang dominan adalah seleksi greedy.' },
        { id: 'C', teks: 'Running time totalnya $O(n \\lg n)$.' },
        { id: 'D', teks: 'Running time totalnya $O(n^2)$.' },
        { id: 'E', teks: 'Bagian yang dominan adalah pengurutan.' },
      ],
      kunci: ['C', 'E'],
      pembahasan: '**Jawaban: C dan E.** Pengurutan $O(n \\lg n)$ ditambah GREEDY-ACTIVITY-SELECTOR $\\Theta(n)$, total $O(n \\lg n)$. Bagian yang dominan adalah **pengurutan**. Untuk $n = 10.000$: sekitar $n \\lg n \\approx 133.000$ langkah dasar untuk mengurutkan, dibanding sekitar $10.000$ langkah untuk seleksi.',
    },
    {
      no: 6,
      teks: 'Contoh aktivitas $[0, 10)$, $[1, 2)$, $[3, 4)$ dipakai untuk menyangkal kriteria "mulai paling awal". Pilih **dua** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: 'Contoh penyangkal seperti ini tidak mungkin dibuat.' },
        { id: 'B', teks: 'Kriteria ini memilih $[0, 10)$ dan berhenti dengan 1 aktivitas, padahal $[1, 2)$ dan $[3, 4)$ kompatibel.' },
        { id: 'C', teks: 'Kriteria ini memilih $[1, 2)$ lebih dulu.' },
        { id: 'D', teks: 'Contoh semacam ini mudah dibuat karena cukup satu aktivitas panjang yang mulai paling awal.' },
        { id: 'E', teks: 'Solusi optimal pada contoh ini hanya 1 aktivitas.' },
      ],
      kunci: ['B', 'D'],
      pembahasan: '**Jawaban: B dan D.** Kriteria "mulai paling awal" memilih $[0, 10)$ dan berhenti dengan 1 aktivitas, padahal $[1, 2)$ dan $[3, 4)$ (2 aktivitas) kompatibel. Contoh mudah dibuat karena cukup satu aktivitas panjang yang mulai paling awal.',
    },
    {
      no: 7,
      teks: 'Dalam argumen pertukaran, mengapa $A\' = (A - \\{a_j\\}) \\cup \\{a_1\\}$ tetap merupakan himpunan aktivitas yang saling kompatibel?',
      opsi: [
        { id: 'A', teks: 'Karena $a_1$ dimulai paling awal.' },
        { id: 'B', teks: 'Karena semua aktivitas lain di $A$ mulai setelah $a_j$ selesai ($s \\ge f_j$) dan $f_1 \\le f_j \\le s$, sehingga $a_1$ selesai sebelum setiap aktivitas lain dimulai.' },
        { id: 'C', teks: 'Karena $a_j$ dihapus tanpa menambah aktivitas lain.' },
        { id: 'D', teks: 'Karena semua aktivitas berdurasi sama.' },
      ],
      kunci: 'B',
      pembahasan: '**Jawaban: B.** Karena $a_1$ selesai paling awal di antara semua aktivitas, $f_1 \\le f_j \\le s$. Jadi $a_1$ selesai sebelum (atau tepat saat) setiap aktivitas lain di $A\'$ dimulai, sehingga semuanya kompatibel.',
    },
  ],
}

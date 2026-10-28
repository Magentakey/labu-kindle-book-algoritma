// Kuis Pemahaman Modul 04 (8 soal) dan kunci serta pembahasannya, dari PDF "04 - Insertion Sort" halaman 9 dan 10.
// Teks memakai Markdown dengan rumus TeX ($...$).
export const kuis04 = {
  judul: 'Insertion Sort',
  modul: '04',
  soal: [
    {
      no: 1,
      tipe: 'penelusuran',
      mandiri: true,
      teks: 'Urutkan $A = (8, 3, 5, 1)$ dengan Insertion Sort. Tuliskan keadaan array setelah setiap putaran $j$ dan nilai $t_j$ untuk setiap $j$.',
      kunciTeks: '$j = 2$: 3, 8, 5, 1 ($t_2 = 2$). $j = 3$: 3, 5, 8, 1 ($t_3 = 2$). $j = 4$: 1, 3, 5, 8 ($t_4 = 4$).',
      pembahasan: 'Pada $j = 3$, key 5 menggeser 8 (satu pergeseran) lalu berhenti karena $3 > 5$ salah, jadi $t_3 = 2$. Pada $j = 4$, key 1 menggeser 8, 5, 3 lalu berhenti karena $i = 0$, jadi $t_4 = 4$.',
    },
    {
      no: 2,
      tipe: 'pilihan',
      teks: 'Mengapa nilai $A[j]$ perlu disimpan di variabel `key` pada baris 2?',
      opsi: [
        { id: 'A', teks: 'Agar perulangan `for` dapat berhenti.' },
        { id: 'B', teks: 'Karena posisi $A[j]$ dapat tertimpa oleh pergeseran pada baris 5.' },
        { id: 'C', teks: 'Karena `key` dipakai untuk menghitung $t_j$.' },
        { id: 'D', teks: 'Agar array dapat diurutkan dari besar ke kecil.' },
      ],
      kunci: 'B',
      pembahasan: '**Jawaban: B.** Pada pergeseran pertama, baris 5 menulis $A[j] = A[j-1]$, sehingga nilai asli $A[j]$ hilang bila tidak disimpan lebih dulu.',
    },
    {
      no: 3,
      tipe: 'perhitungan',
      teks: 'Untuk $n = 6$, berapa total eksekusi baris 4 ($\\sum t_j$) dan baris 5 ($\\sum (t_j - 1)$) pada (a) kasus terbaik dan (b) kasus terburuk?',
      isian: [
        { label: 'Terbaik: Σtj', jenis: 'angka', kunci: 5 },
        { label: 'Terbaik: Σ(tj − 1)', jenis: 'angka', kunci: 0 },
        { label: 'Terburuk: Σtj', jenis: 'angka', kunci: 20 },
        { label: 'Terburuk: Σ(tj − 1)', jenis: 'angka', kunci: 15 },
      ],
      pembahasan: '(a) Kasus terbaik: $\\sum t_j = n - 1 = 5$, $\\sum (t_j - 1) = 0$. (b) Kasus terburuk: $\\sum t_j = \\frac{36 + 6 - 2}{2} = 20$ dan $\\sum (t_j - 1) = \\frac{36 - 6}{2} = 15$. Cek: $t_j = 2, 3, 4, 5, 6$ berjumlah 20, dan pergeserannya $1 + 2 + 3 + 4 + 5 = 15$.',
    },
    {
      no: 4,
      tipe: 'benarsalah',
      teks: '"Baris 1 (`for`) Insertion Sort dijalankan $n - 1$ kali karena $j$ bergerak dari 2 sampai $n$." Benar atau salah?',
      opsi: [
        { id: 'Benar', teks: 'Benar' },
        { id: 'Salah', teks: 'Salah' },
      ],
      kunci: 'Salah',
      pembahasan: '**Salah.** Isi perulangan memang dijalankan $n - 1$ kali, tetapi kepala perulangan dijalankan $n$ **kali**, termasuk pemeriksaan $j = n + 1$ yang mengakhiri perulangan.',
    },
    {
      no: 5,
      tipe: 'analisis',
      teks: 'Array $A = (1, 2, 3, 4, 5, 6, 7, 0)$ hampir terurut: hanya elemen terakhir yang salah tempat. Berapa $\\sum (t_j - 1)$ (banyaknya pergeseran)? Apakah ini kasus terbaik, terburuk, atau di antaranya?',
      isian: [
        { label: 'Σ(tj − 1)', jenis: 'angka', kunci: 7 },
        { label: 'Kasus', jenis: 'pilih', opsi: ['terbaik', 'terburuk', 'di antaranya'], kunci: 'di antaranya' },
      ],
      pembahasan: 'Untuk $j = 2, \\dots, 7$ tidak ada pergeseran. Untuk $j = 8$, key 0 harus melewati ketujuh elemen, sehingga ada 7 pergeseran. Total $\\sum (t_j - 1) = 7$. Ini **di antara** kasus terbaik (0) dan terburuk ($\\frac{64 - 8}{2} = 28$), dan jauh lebih dekat ke kasus terbaik. Banyaknya pergeseran sama dengan banyaknya inversi, yaitu 7 pasangan $(k, 0)$.',
    },
    {
      no: 6,
      tipe: 'pilihan',
      teks: 'Jika kondisi pada baris 4 diubah dari `A[i] > key` menjadi `A[i] ≥ key`, apa akibatnya?',
      opsi: [
        { id: 'A', teks: 'Hasil pengurutan menjadi salah.' },
        { id: 'B', teks: 'Array tetap terurut, tetapi elemen yang bernilai sama bisa bertukar urutan (tidak stabil) dan pergeseran bisa bertambah.' },
        { id: 'C', teks: 'Algoritma tidak pernah berhenti.' },
        { id: 'D', teks: 'Running time kasus terburuk menjadi linier.' },
      ],
      kunci: 'B',
      pembahasan: '**Jawaban: B.** Dengan $\\ge$, elemen yang nilainya sama dengan key juga ikut digeser, sehingga key ditempatkan **sebelum** elemen bernilai sama yang semula di kirinya. Hasilnya tetap terurut tetapi tidak stabil, dan pergeseran bertambah bila ada nilai yang sama. Algoritma tetap berhenti karena $i$ terus berkurang.',
    },
    {
      no: 7,
      tipe: 'analisis',
      mandiri: true,
      teks: 'Jelaskan mengapa $t_j = j$ pada kasus terburuk, bukan $t_j = j - 1$.',
      kunciTeks: 'Key harus melewati semua $j - 1$ elemen di kirinya, sehingga kondisi `while` benar $j - 1$ kali, lalu diperiksa sekali lagi saat $i = 0$ dengan hasil salah. Total pemeriksaan $= (j - 1) + 1 = j$.',
      pembahasan: 'Pada kasus terburuk key harus melewati semua $j - 1$ elemen di kirinya, sehingga kondisi `while` bernilai benar $j - 1$ kali. Setelah itu $i = 0$ dan kondisi diperiksa **sekali lagi** dengan hasil salah. Total pemeriksaan $= (j - 1) + 1 = j$.',
    },
    {
      no: 8,
      tipe: 'perhitungan',
      teks: 'Sebuah program Insertion Sort membutuhkan 0,01 detik untuk mengurutkan 2.000 data yang terurut terbalik. Perkirakan waktunya untuk 20.000 data yang terurut terbalik, dengan asumsi suku $n^2$ dominan.',
      isian: [{ label: 'Waktu (detik)', jenis: 'angka', kunci: 1 }],
      pembahasan: 'Ukuran data naik $\\frac{20000}{2000} = 10$ kali. Karena suku $n^2$ dominan, waktunya naik sekitar $10^2 = 100$ kali, yaitu kira-kira $0{,}01 \\times 100 = 1$ **detik**.',
    },
  ],
}

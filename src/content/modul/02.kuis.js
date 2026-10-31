// Kuis Pemahaman Modul 02 (7 soal) dan kunci serta pembahasannya, dari PDF "02 - Iteratif dan Rekursif" halaman 10 dan 11.
// Teks memakai Markdown dengan rumus TeX ($...$). Soal bertanda `mandiri` dijawab dengan tulisan lalu dibandingkan dengan kunci.
export const kuis02 = {
  judul: 'Iteratif vs Rekursif',
  modul: '02',
  soal: [
    {
      no: 1,
      tipe: 'pilihan',
      teks: 'Unsur apa yang **wajib** ada agar sebuah fungsi rekursif pasti berhenti?',
      opsi: [
        { id: 'A', teks: 'Perulangan `for` di dalam fungsi.' },
        { id: 'B', teks: 'Kasus dasar dan pemanggilan rekursif yang membuat masalah mengecil menuju kasus dasar.' },
        { id: 'C', teks: 'Paling sedikit dua pemanggilan rekursif.' },
        { id: 'D', teks: 'Parameter berupa array.' },
      ],
      kunci: 'B',
      pembahasan: '**Jawaban: B.** Tanpa kasus dasar, rekursi tidak memiliki titik berhenti. Tanpa kemajuan menuju kasus dasar, kasus dasar mungkin tidak pernah tercapai. Banyaknya pemanggilan rekursif (C) dan jenis parameter (D) tidak menentukan apakah fungsi berhenti.',
    },
    {
      no: 2,
      tipe: 'penelusuran',
      mandiri: true,
      teks: 'Telusuri Binary Search iteratif untuk $x = 9$ pada $A = (5, 8, 9, 10, 14, 20)$, $p = 1$, $n = 6$. Tuliskan nilai $p$, $n$, $mid$ pada setiap putaran dan keluarannya.',
      kunciTeks: 'Putaran 1: $p = 1$, $n = 6$, $mid = 3$, $A[3] = 9$. Karena $x = 9 = A[3]$, algoritma langsung mengembalikan 3. Hanya satu perbandingan yang dibutuhkan; ini adalah kasus terbaik Binary Search.',
      pembahasan: 'Putaran 1: $p = 1$, $n = 6$, $mid = 3$, $A[3] = 9$. Karena $x = 9 = A[3]$, algoritma langsung **mengembalikan 3**. Hanya satu perbandingan yang dibutuhkan; ini adalah kasus terbaik Binary Search.',
    },
    {
      no: 3,
      tipe: 'penelusuran',
      mandiri: true,
      teks: 'Telusuri Binary Search rekursif untuk $x = 21$ pada array yang sama. Tuliskan rantai pemanggilan fungsinya. Berapa kedalaman rekursi (banyaknya pemanggilan) yang terjadi?',
      kunciTeks: 'Rantai pemanggilan: (1,6): mid = 3, 21 > 9 → (4,6): mid = 5, 21 > 14 → (6,6): mid = 6, 21 > 20 → (7,6): p > n, kembalikan NIL. Terjadi 4 pemanggilan (3 yang membandingkan elemen ditambah 1 yang mendapati rentang kosong). Hasil akhirnya NIL.',
      pembahasan: 'Rantai pemanggilan: `(1,6)`: mid = 3, $21 > 9$ → `(4,6)`: mid = 5, $21 > 14$ → `(6,6)`: mid = 6, $21 > 20$ → `(7,6)`: $p > n$, kembalikan `NIL`. Terjadi **4 pemanggilan** (3 pemanggilan yang membandingkan elemen ditambah 1 pemanggilan yang mendapati rentang kosong). Hasil akhirnya `NIL`.',
    },
    {
      no: 4,
      tipe: 'benarsalah',
      mandiri: true,
      teks: '"Binary Search tetap memberikan hasil yang benar bila dijalankan pada array $(10, 3, 8, 1, 6)$ untuk mencari $x = 3$." Benar atau salah? Tunjukkan dengan penelusuran.',
      kunciTeks: 'Salah. Putaran 1: p = 1, n = 5, mid = 3, A[3] = 8. Karena 3 < 8, n = 2. Putaran 2: mid = 1, A[1] = 10. Karena 3 < 10, n = 0. Rentang kosong, algoritma mengembalikan NIL, padahal 3 ada di indeks 2. Array tidak terurut sehingga keputusan membuang separuh array tidak sah.',
      pembahasan: '**Salah.** Putaran 1: $p = 1$, $n = 5$, $mid = 3$, $A[3] = 8$. Karena $3 < 8$, maka $n = 2$. Putaran 2: $mid = 1$, $A[1] = 10$. Karena $3 < 10$, maka $n = 0$. Rentang kosong, algoritma mengembalikan `NIL`, padahal 3 ada di indeks 2. Array tidak terurut sehingga keputusan membuang separuh array tidak sah.',
    },
    {
      no: 5,
      tipe: 'perhitungan',
      teks: 'Sebuah array terurut berisi 5.000 elemen. Berapa banyak perbandingan dengan elemen array yang dibutuhkan Binary Search pada kasus terburuk? Bandingkan dengan linear search.',
      isian: [
        { label: 'Binary Search', jenis: 'angka', kunci: 13 },
        { label: 'Linear search', jenis: 'angka', kunci: 5000 },
      ],
      pembahasan: '$\\lfloor \\lg 5000 \\rfloor + 1$. Karena $2^{12} = 4096 \\le 5000 < 8192 = 2^{13}$, maka $\\lfloor \\lg 5000 \\rfloor = 12$, sehingga kasus terburuknya **13 perbandingan**. Linear search pada kasus terburuk membutuhkan 5.000 perbandingan.',
    },
    {
      no: 6,
      tipe: 'analisis',
      mandiri: true,
      teks: 'Fungsi berikut dimaksudkan menghitung $n!$ (faktorial). Temukan kesalahannya dan jelaskan akibatnya ketika dijalankan.\n\n```pseudo\nFAKTORIAL(n)\n1 return n * FAKTORIAL(n - 1)\n```',
      kunciTeks: 'Fungsi tidak memiliki kasus dasar. FAKTORIAL(3) memanggil FAKTORIAL(2), lalu FAKTORIAL(1), FAKTORIAL(0), FAKTORIAL(−1), dan seterusnya tanpa henti. Dalam praktik program akan gagal karena call stack penuh (stack overflow). Perbaikan: tambahkan if n == 0 return 1 sebelum baris rekursif.',
      pembahasan: 'Fungsi tidak memiliki **kasus dasar**. `FAKTORIAL(3)` memanggil `FAKTORIAL(2)`, lalu `FAKTORIAL(1)`, `FAKTORIAL(0)`, `FAKTORIAL(−1)`, dan seterusnya tanpa henti. Dalam praktik program akan gagal karena call stack penuh (*stack overflow*). Perbaikan: tambahkan `if n == 0 return 1` sebelum baris rekursif.',
    },
    {
      no: 7,
      tipe: 'pilihan',
      teks: 'Mengapa versi iteratif Binary Search lebih hemat memori daripada versi rekursif?',
      opsi: [
        { id: 'A', teks: 'Versi iteratif melakukan lebih sedikit perbandingan.' },
        { id: 'B', teks: 'Versi rekursif menyalin seluruh array pada setiap pemanggilan.' },
        { id: 'C', teks: 'Versi rekursif menambah satu lapisan call stack untuk setiap pemanggilan, sedangkan versi iteratif hanya memakai beberapa variabel.' },
        { id: 'D', teks: 'Versi iteratif tidak memerlukan array terurut.' },
      ],
      kunci: 'C',
      pembahasan: '**Jawaban: C.** Kedua versi melakukan perbandingan yang sama banyak (A salah). Pseudocode rekursif hanya meneruskan batas $p$ dan $n$, bukan menyalin array (B salah). Keduanya sama-sama mensyaratkan array terurut (D salah).',
    },
  ],
}

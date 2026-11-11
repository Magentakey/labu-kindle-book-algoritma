// Kuis Pemahaman Modul 02 (7 soal pilihan ganda), bersumber dari soal PDF "02 - Iteratif dan Rekursif" halaman 10–11.
// Teks memakai Markdown dengan rumus TeX ($...$). `kunci` berupa satu id (satu jawaban) atau larik id (banyak jawaban, dinilai utuh).
export const kuis02 = {
  judul: 'Iteratif vs Rekursif',
  modul: '02',
  soal: [
    {
      no: 1,
      teks: 'Agar sebuah fungsi rekursif pasti berhenti, unsur apa saja yang **wajib** ada? Pilih **dua** jawaban.',
      opsi: [
        { id: 'A', teks: 'Kasus dasar yang menghentikan rekursi.' },
        { id: 'B', teks: 'Perulangan `for` di dalam fungsi.' },
        { id: 'C', teks: 'Pemanggilan rekursif yang membuat masalah mengecil menuju kasus dasar.' },
        { id: 'D', teks: 'Paling sedikit dua pemanggilan rekursif.' },
        { id: 'E', teks: 'Parameter berupa array.' },
      ],
      kunci: ['A', 'C'],
      pembahasan: '**Jawaban: A dan C.** Tanpa kasus dasar, rekursi tidak memiliki titik berhenti. Tanpa kemajuan menuju kasus dasar, kasus dasar mungkin tidak pernah tercapai. Perulangan (B), banyaknya pemanggilan rekursif (D), dan jenis parameter (E) tidak menentukan apakah fungsi berhenti.',
    },
    {
      no: 2,
      teks: 'Telusuri Binary Search iteratif untuk $x = 9$ pada $A = (5, 8, 9, 10, 14, 20)$ dengan $p = 1$, $n = 6$. Manakah yang tepat?',
      opsi: [
        { id: 'A', teks: 'Putaran 1: $mid = 3$, lalu lanjut ke putaran 2 karena rentang perlu dipersempit.' },
        { id: 'B', teks: 'Putaran 1: $mid = 3$ dan $A[3] = 9$, sehingga langsung mengembalikan 3 setelah satu perbandingan.' },
        { id: 'C', teks: 'Putaran 1: $mid = 4$ dan algoritma mengembalikan 4.' },
        { id: 'D', teks: 'Putaran 1: $mid = 3$, tetapi algoritma mengembalikan `NIL` karena 9 tidak ditemukan.' },
      ],
      kunci: 'B',
      pembahasan: '**Jawaban: B.** Putaran 1: $p = 1$, $n = 6$, $mid = 3$, $A[3] = 9$. Karena $x = 9 = A[3]$, algoritma langsung **mengembalikan 3**. Hanya satu perbandingan yang dibutuhkan; ini adalah kasus terbaik Binary Search.',
    },
    {
      no: 3,
      teks: 'Telusuri Binary Search **rekursif** untuk $x = 21$ pada array yang sama $A = (5, 8, 9, 10, 14, 20)$. Pilih **dua** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: 'Terjadi 3 pemanggilan fungsi.' },
        { id: 'B', teks: 'Terjadi 4 pemanggilan fungsi.' },
        { id: 'C', teks: 'Fungsi mengembalikan 6 karena 21 lebih besar dari elemen terakhir.' },
        { id: 'D', teks: 'Fungsi mengembalikan `NIL`.' },
        { id: 'E', teks: 'Nilai $mid$ pada pemanggilan pertama adalah 4.' },
      ],
      kunci: ['B', 'D'],
      pembahasan: '**Jawaban: B dan D.** Rantai pemanggilan: `(1,6)`: mid = 3, $21 > 9$ → `(4,6)`: mid = 5, $21 > 14$ → `(6,6)`: mid = 6, $21 > 20$ → `(7,6)`: $p > n$, kembalikan `NIL`. Terjadi **4 pemanggilan** (3 pemanggilan yang membandingkan elemen ditambah 1 pemanggilan yang mendapati rentang kosong). Hasil akhirnya `NIL`, bukan 6 (C). Nilai $mid$ pertama adalah 3, bukan 4 (E).',
    },
    {
      no: 4,
      teks: 'Binary Search dijalankan pada array **tidak terurut** $(10, 3, 8, 1, 6)$ untuk mencari $x = 3$. Pernyataan manakah yang benar?',
      opsi: [
        { id: 'A', teks: 'Mengembalikan 2, karena Binary Search selalu menemukan elemen yang ada.' },
        { id: 'B', teks: 'Mengembalikan 3, karena nilai yang dicari adalah 3.' },
        { id: 'C', teks: 'Tidak pernah berhenti karena array tidak terurut.' },
        { id: 'D', teks: 'Mengembalikan `NIL` walaupun 3 ada di indeks 2, karena array tidak terurut.' },
      ],
      kunci: 'D',
      pembahasan: '**Jawaban: D.** Putaran 1: $p = 1$, $n = 5$, $mid = 3$, $A[3] = 8$. Karena $3 < 8$, maka $n = 2$. Putaran 2: $mid = 1$, $A[1] = 10$. Karena $3 < 10$, maka $n = 0$. Rentang kosong, algoritma mengembalikan `NIL`, padahal 3 ada di indeks 2. Array tidak terurut sehingga keputusan membuang separuh array tidak sah. Algoritma tetap berhenti (C salah).',
    },
    {
      no: 5,
      teks: 'Sebuah array terurut berisi 5.000 elemen. Pilih **dua** pernyataan yang benar tentang banyaknya perbandingan pada kasus terburuk.',
      opsi: [
        { id: 'A', teks: 'Binary Search membutuhkan 13 perbandingan.' },
        { id: 'B', teks: 'Binary Search membutuhkan 12 perbandingan.' },
        { id: 'C', teks: 'Linear search membutuhkan 5.000 perbandingan.' },
        { id: 'D', teks: 'Linear search membutuhkan 2.500 perbandingan.' },
        { id: 'E', teks: 'Binary Search membutuhkan 5.000 perbandingan.' },
      ],
      kunci: ['A', 'C'],
      pembahasan: '**Jawaban: A dan C.** $\\lfloor \\lg 5000 \\rfloor + 1$. Karena $2^{12} = 4096 \\le 5000 < 8192 = 2^{13}$, maka $\\lfloor \\lg 5000 \\rfloor = 12$, sehingga kasus terburuknya **13 perbandingan** (B lupa menambah 1). Linear search pada kasus terburuk membutuhkan **5.000 perbandingan**, bukan separuhnya (D).',
    },
    {
      no: 6,
      teks: 'Fungsi berikut dimaksudkan menghitung $n!$ (faktorial). Apa kesalahannya dan akibatnya?\n\n```pseudo\nFAKTORIAL(n)\n1 return n * FAKTORIAL(n - 1)\n```',
      opsi: [
        { id: 'A', teks: 'Tidak ada kasus dasar, sehingga pemanggilan berlanjut tanpa henti dan program gagal karena call stack penuh.' },
        { id: 'B', teks: 'Faktorial tidak boleh dihitung dengan rekursi.' },
        { id: 'C', teks: 'Operator perkalian seharusnya penjumlahan.' },
        { id: 'D', teks: 'Parameter `n` harus berupa array agar fungsi berhenti.' },
      ],
      kunci: 'A',
      pembahasan: '**Jawaban: A.** Fungsi tidak memiliki **kasus dasar**. `FAKTORIAL(3)` memanggil `FAKTORIAL(2)`, lalu `FAKTORIAL(1)`, `FAKTORIAL(0)`, `FAKTORIAL(−1)`, dan seterusnya tanpa henti. Dalam praktik program akan gagal karena call stack penuh (*stack overflow*). Perbaikan: tambahkan `if n == 0 return 1` sebelum baris rekursif.',
    },
    {
      no: 7,
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

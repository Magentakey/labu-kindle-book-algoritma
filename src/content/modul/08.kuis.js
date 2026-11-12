// Kuis Pemahaman Modul 08 (8 soal pilihan ganda), bersumber dari soal PDF "08 - Divide and Conquer dan Merge Sort" halaman 10–11.
// Teks memakai Markdown dengan rumus TeX ($...$). `kunci` berupa satu id (satu jawaban) atau larik id (banyak jawaban, dinilai utuh).
export const kuis08 = {
  judul: 'Divide and Conquer dan Merge Sort',
  modul: '08',
  soal: [
    {
      no: 1,
      teks: 'Pada Merge Sort, tahap manakah yang benar-benar melakukan pekerjaan "mengurutkan" elemen?',
      opsi: [
        { id: 'A', teks: 'Divide, karena membagi array di tengah.' },
        { id: 'B', teks: 'Kasus dasar, karena subarray satu elemen sudah terurut.' },
        { id: 'C', teks: 'Tidak ada tahap yang mengurutkan.' },
        { id: 'D', teks: 'Combine (MERGE), karena di sinilah elemen dibandingkan dan disusun berurutan.' },
      ],
      kunci: 'D',
      pembahasan: '**Jawaban: D.** Tahap divide hanya menghitung indeks tengah tanpa membandingkan isi array. Seluruh perbandingan dan penyusunan terjadi di MERGE.',
    },
    {
      no: 2,
      teks: 'Perhatikan `MERGE_SORT(A, 1, 6)` pada $A = (5, 2, 4, 6, 1, 3)$. Pembagiannya: $(1, 6)$ dengan $q = 3$, kiri $(1, 3)$ dengan $q = 2$, kanan $(4, 6)$ dengan $q = 5$. Pilih **tiga** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: 'Pemanggilan `MERGE` pertama adalah `MERGE(1,1,2)` yang menghasilkan $(2, 5)$.' },
        { id: 'B', teks: 'Pemanggilan `MERGE` terakhir adalah `MERGE(1,3,6)` yang menggabungkan $(2, 4, 5)$ dan $(1, 3, 6)$.' },
        { id: 'C', teks: 'Seluruhnya terjadi 5 pemanggilan `MERGE`.' },
        { id: 'D', teks: '`MERGE(4,4,5)` menghasilkan $(6, 1)$.' },
        { id: 'E', teks: '`MERGE(1,2,3)` menggabungkan $(2, 5)$ dan $(4)$ menjadi $(2, 5, 4)$.' },
      ],
      kunci: ['A', 'B', 'C'],
      pembahasan: '**Jawaban: A, B, dan C.** Urutan MERGE:\n\n1. `MERGE(1,1,2)`: $(5) + (2) \\to (2, 5)$\n2. `MERGE(1,2,3)`: $(2, 5) + (4) \\to (2, 4, 5)$\n3. `MERGE(4,4,5)`: $(6) + (1) \\to (1, 6)$\n4. `MERGE(4,5,6)`: $(1, 6) + (3) \\to (1, 3, 6)$\n5. `MERGE(1,3,6)`: $(2, 4, 5) + (1, 3, 6) \\to (1, 2, 3, 4, 5, 6)$\n\nPilihan D dan E salah karena hasil MERGE selalu terurut.',
    },
    {
      no: 3,
      teks: 'Telusuri `MERGE(A, 1, 2, 4)` untuk $A = (4, 9, 1, 7)$ dengan $L = (4, 9, \\infty)$ dan $R = (1, 7, \\infty)$. Dari array manakah elemen yang dipilih pada $k = 1, 2, 3, 4$ (berurutan)?',
      opsi: [
        { id: 'A', teks: '$L, L, R, R$' },
        { id: 'B', teks: '$R, R, L, L$' },
        { id: 'C', teks: '$R, L, R, L$' },
        { id: 'D', teks: '$L, R, L, R$' },
      ],
      kunci: 'C',
      pembahasan: '**Jawaban: C.** $k = 1$: 4 vs 1, pilih $R$: 1. $k = 2$: 4 vs 7, pilih $L$: 4. $k = 3$: 9 vs 7, pilih $R$: 7. $k = 4$: 9 vs $\\infty$, pilih $L$: 9. Hasil $A = (1, 4, 7, 9)$.',
    },
    {
      no: 4,
      teks: 'Jika array sudah terurut, bagaimana running time Merge Sort?',
      opsi: [
        { id: 'A', teks: 'Tetap $\\Theta(n \\lg n)$, karena pembagian dan setiap MERGE tetap dilakukan apa pun isinya.' },
        { id: 'B', teks: '$\\Theta(n)$, seperti Insertion Sort pada data terurut.' },
        { id: 'C', teks: '$\\Theta(\\lg n)$, karena array tidak perlu digabung.' },
        { id: 'D', teks: '$\\Theta(n^2)$, karena semua elemen dibandingkan.' },
      ],
      kunci: 'A',
      pembahasan: '**Jawaban: A.** Merge Sort tetap membagi sampai satu elemen dan tetap menjalankan setiap MERGE yang masing-masing menyalin dan memeriksa semua elemen, apa pun isinya. Running time-nya tetap $\\Theta(n \\lg n)$.',
    },
    {
      no: 5,
      teks: 'Tentang sentinel $\\infty$ pada MERGE, pilih **dua** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: 'Sentinel mempercepat Merge Sort dari $\\Theta(n \\lg n)$ menjadi $\\Theta(n)$.' },
        { id: 'B', teks: 'Sentinel memastikan bahwa ketika salah satu dari $L$ atau $R$ habis, perbandingan $L[i] \\le R[j]$ otomatis memilih elemen dari array yang masih tersisa.' },
        { id: 'C', teks: 'Sentinel dipakai untuk menyimpan indeks tengah $q$.' },
        { id: 'D', teks: 'Tanpa sentinel, harus diperiksa dulu apakah $i > n_1$ atau $j > n_2$, atau sisa array yang lain disalin langsung ke $A$.' },
        { id: 'E', teks: 'Sentinel harus bernilai $-\\infty$ agar hasilnya menaik.' },
      ],
      kunci: ['B', 'D'],
      pembahasan: '**Jawaban: B dan D.** Sentinel menyederhanakan penulisan, bukan mengubah orde running time (A salah), tidak menyimpan indeks (C salah), dan bernilai $+\\infty$ supaya tidak pernah terpilih selama masih ada elemen asli (E salah).',
    },
    {
      no: 6,
      teks: 'Untuk $n = 16$, pohon rekursi Merge Sort memiliki tingkat yang masing-masing berbiaya $cn$. Pilih **tiga** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: 'Banyak tingkat adalah $\\lg 16 + 1 = 5$.' },
        { id: 'B', teks: 'Total biaya adalah $80c$.' },
        { id: 'C', teks: 'Sebagai pembanding, $cn^2 = 256c$.' },
        { id: 'D', teks: 'Banyak tingkat adalah 4.' },
        { id: 'E', teks: 'Total biaya adalah $64c$.' },
      ],
      kunci: ['A', 'B', 'C'],
      pembahasan: '**Jawaban: A, B, dan C.** Tingkatnya $\\lg 16 + 1 = 5$. Total biaya $= 5 \\cdot 16c = 80c$. Sebagai pembanding, $cn^2 = 256c$. Untuk $n$ yang lebih besar, misalnya $n = 1024$, perbedaannya jauh lebih mencolok: $11 \\cdot 1024c = 11.264c$ vs $1.048.576c$.',
    },
    {
      no: 7,
      teks: 'Sebuah algoritma Divide and Conquer membagi masalah berukuran $n$ menjadi **tiga** submasalah berukuran $n/3$, dan menggabungkan hasilnya dalam waktu $\\Theta(n)$. Recurrence running time-nya adalah ...',
      opsi: [
        { id: 'A', teks: '$T(n) = T(n/3) + \\Theta(n)$' },
        { id: 'B', teks: '$T(n) = 3T(n/3) + \\Theta(n)$' },
        { id: 'C', teks: '$T(n) = 3T(n) + \\Theta(n/3)$' },
        { id: 'D', teks: '$T(n) = 3T(n/3) + \\Theta(n^2)$' },
      ],
      kunci: 'B',
      pembahasan: '**Jawaban: B.** $T(n) = 3T(n/3) + \\Theta(n)$ untuk $n > 1$, dengan $T(1) = \\Theta(1)$. (Dengan Metode Master di Modul 09, hasilnya juga $\\Theta(n \\lg n)$.)',
    },
    {
      no: 8,
      teks: 'Jika baris 13 MERGE diubah dari `L[i] ≤ R[j]` menjadi `L[i] < R[j]`, apa akibatnya?',
      opsi: [
        { id: 'A', teks: 'Hasil tidak lagi terurut.' },
        { id: 'B', teks: 'Running time menjadi $\\Theta(n^2)$.' },
        { id: 'C', teks: 'Hasil tetap terurut, tetapi Merge Sort tidak lagi stabil.' },
        { id: 'D', teks: 'Algoritma tidak berhenti.' },
      ],
      kunci: 'C',
      pembahasan: '**Jawaban: C.** Ketika $L[i] = R[j]$, versi baru mengambil elemen dari $R$ lebih dulu, sehingga elemen bernilai sama yang semula berada di bagian kiri ditempatkan setelah elemen dari bagian kanan. Urutan nilai tetap benar, tetapi urutan relatif elemen yang sama berubah.',
    },
  ],
}

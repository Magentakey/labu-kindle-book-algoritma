// Kuis Pemahaman Modul 08 (8 soal) dan kunci serta pembahasannya, dari PDF "08 - Divide and Conquer dan Merge Sort" halaman 10–11.
// Teks memakai Markdown dengan rumus TeX ($...$). Soal bertanda `mandiri` dijawab dengan tulisan lalu dibandingkan dengan kunci
// (penelusuran 2 dan 3, analisis 5 dan 7). Soal 1, 4, 6, dan 8 dinilai otomatis.
export const kuis08 = {
  judul: 'Divide and Conquer dan Merge Sort',
  modul: '08',
  soal: [
    {
      no: 1,
      tipe: 'pilihan',
      teks: 'Pada Merge Sort, tahap manakah yang benar-benar melakukan pekerjaan "mengurutkan" elemen?',
      opsi: [
        { id: 'A', teks: 'Divide, karena membagi array di tengah.' },
        { id: 'B', teks: 'Combine (MERGE), karena di sinilah elemen dibandingkan dan disusun berurutan.' },
        { id: 'C', teks: 'Kasus dasar, karena subarray satu elemen sudah terurut.' },
        { id: 'D', teks: 'Tidak ada tahap yang mengurutkan.' },
      ],
      kunci: 'B',
      pembahasan: '**Jawaban: B.** Tahap divide hanya menghitung indeks tengah tanpa membandingkan isi array. Seluruh perbandingan dan penyusunan terjadi di MERGE.',
    },
    {
      no: 2,
      tipe: 'penelusuran',
      mandiri: true,
      teks: 'Tuliskan urutan pemanggilan `MERGE` (dengan parameter $p, q, r$) yang terjadi saat `MERGE_SORT(A, 1, 6)` dijalankan pada $A = (5, 2, 4, 6, 1, 3)$, beserta hasil setiap MERGE.',
      kunciTeks: 'Pembagian: (1, 6) dengan q = 3; kiri (1, 3) dengan q = 2; kanan (4, 6) dengan q = 5. Urutan MERGE: (1) MERGE(1,1,2): (5) + (2) → (2, 5). (2) MERGE(1,2,3): (2, 5) + (4) → (2, 4, 5). (3) MERGE(4,4,5): (6) + (1) → (1, 6). (4) MERGE(4,5,6): (1, 6) + (3) → (1, 3, 6). (5) MERGE(1,3,6): (2, 4, 5) + (1, 3, 6) → (1, 2, 3, 4, 5, 6).',
      pembahasan:
        'Pembagian: $(1, 6)$ dengan $q = 3$; kiri $(1, 3)$ dengan $q = 2$; kanan $(4, 6)$ dengan $q = 5$. Urutan MERGE:\n\n1. `MERGE(1,1,2)`: $(5) + (2) \\to (2, 5)$\n2. `MERGE(1,2,3)`: $(2, 5) + (4) \\to (2, 4, 5)$\n3. `MERGE(4,4,5)`: $(6) + (1) \\to (1, 6)$\n4. `MERGE(4,5,6)`: $(1, 6) + (3) \\to (1, 3, 6)$\n5. `MERGE(1,3,6)`: $(2, 4, 5) + (1, 3, 6) \\to (1, 2, 3, 4, 5, 6)$',
    },
    {
      no: 3,
      tipe: 'penelusuran',
      mandiri: true,
      teks: 'Telusuri `MERGE(A, 1, 2, 4)` untuk $A = (4, 9, 1, 7)$. Tuliskan isi $L$ dan $R$ (termasuk sentinel) serta elemen yang dipilih pada setiap $k$.',
      kunciTeks: 'L = (4, 9, ∞), R = (1, 7, ∞). k = 1: 4 vs 1, pilih R: 1. k = 2: 4 vs 7, pilih L: 4. k = 3: 9 vs 7, pilih R: 7. k = 4: 9 vs ∞, pilih L: 9. Hasil A = (1, 4, 7, 9).',
      pembahasan: '$L = (4, 9, \\infty)$, $R = (1, 7, \\infty)$. $k = 1$: 4 vs 1, pilih $R$: 1. $k = 2$: 4 vs 7, pilih $L$: 4. $k = 3$: 9 vs 7, pilih $R$: 7. $k = 4$: 9 vs $\\infty$, pilih $L$: 9. Hasil $A = (1, 4, 7, 9)$.',
    },
    {
      no: 4,
      tipe: 'benarsalah',
      teks: '"Jika array sudah terurut, Merge Sort berjalan dalam waktu $\\Theta(n)$ seperti Insertion Sort." Benar atau salah?',
      opsi: [
        { id: 'Benar', teks: 'Benar' },
        { id: 'Salah', teks: 'Salah' },
      ],
      kunci: 'Salah',
      pembahasan: '**Salah.** Merge Sort tetap membagi sampai satu elemen dan tetap menjalankan setiap MERGE yang masing-masing menyalin dan memeriksa semua elemen, apa pun isinya. Running time-nya tetap $\\Theta(n \\lg n)$.',
    },
    {
      no: 5,
      tipe: 'analisis',
      mandiri: true,
      teks: 'Apa fungsi sentinel $\\infty$ pada MERGE? Apa yang harus ditambahkan ke pseudocode jika sentinel tidak dipakai?',
      kunciTeks: 'Sentinel memastikan bahwa ketika salah satu dari L atau R sudah habis, perbandingan L[i] ≤ R[j] otomatis memilih elemen dari array yang masih tersisa. Tanpa sentinel, setiap putaran harus memeriksa dulu apakah i > n₁ atau j > n₂, atau setelah salah satu habis, sisa array yang lain disalin langsung ke A.',
      pembahasan:
        'Sentinel memastikan bahwa ketika salah satu dari $L$ atau $R$ sudah habis, perbandingan $L[i] \\le R[j]$ otomatis memilih elemen dari array yang masih tersisa. Tanpa sentinel, setiap putaran harus memeriksa dulu apakah $i > n_1$ atau $j > n_2$, atau setelah salah satu habis, sisa array yang lain disalin langsung ke $A$.',
    },
    {
      no: 6,
      tipe: 'perhitungan',
      teks: 'Untuk $n = 16$, berapa banyak tingkat pada pohon rekursi Merge Sort, dan berapa total biaya bila setiap tingkat berbiaya $cn$? Bandingkan dengan $cn^2$. (Isi total biaya dalam satuan $c$.)',
      isian: [
        { label: 'Banyak tingkat', jenis: 'angka', kunci: 5 },
        { label: 'Total biaya (dalam c)', jenis: 'angka', kunci: 80 },
        { label: 'cn² (dalam c)', jenis: 'angka', kunci: 256 },
      ],
      pembahasan:
        'Tingkatnya $\\lg 16 + 1 = 5$. Total biaya $= 5 \\cdot 16c = 80c$. Sebagai pembanding, $cn^2 = 256c$. Untuk $n$ yang lebih besar, misalnya $n = 1024$, perbedaannya jauh lebih mencolok: $11 \\cdot 1024c = 11.264c$ vs $1.048.576c$.',
    },
    {
      no: 7,
      tipe: 'analisis',
      mandiri: true,
      teks: 'Sebuah algoritma Divide and Conquer membagi masalah berukuran $n$ menjadi **tiga** submasalah berukuran $n/3$, dan menggabungkan hasilnya dalam waktu $\\Theta(n)$. Tuliskan recurrence running time-nya.',
      kunciTeks: 'T(n) = 3T(n/3) + Θ(n) untuk n > 1, dengan T(1) = Θ(1). (Dengan Metode Master di Modul 09, hasilnya juga Θ(n lg n).)',
      pembahasan: '$T(n) = 3T(n/3) + \\Theta(n)$ untuk $n > 1$, dengan $T(1) = \\Theta(1)$. (Dengan Metode Master di Modul 09, hasilnya juga $\\Theta(n \\lg n)$.)',
    },
    {
      no: 8,
      tipe: 'pilihan',
      teks: 'Jika baris 13 MERGE diubah dari `L[i] ≤ R[j]` menjadi `L[i] < R[j]`, apa akibatnya?',
      opsi: [
        { id: 'A', teks: 'Hasil tidak lagi terurut.' },
        { id: 'B', teks: 'Hasil tetap terurut, tetapi Merge Sort tidak lagi stabil.' },
        { id: 'C', teks: 'Running time menjadi $\\Theta(n^2)$.' },
        { id: 'D', teks: 'Algoritma tidak berhenti.' },
      ],
      kunci: 'B',
      pembahasan: '**Jawaban: B.** Ketika $L[i] = R[j]$, versi baru mengambil elemen dari $R$ lebih dulu, sehingga elemen bernilai sama yang semula berada di bagian kiri ditempatkan setelah elemen dari bagian kanan. Urutan nilai tetap benar, tetapi urutan relatif elemen yang sama berubah.',
    },
  ],
}

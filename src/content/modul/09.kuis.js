// Kuis Pemahaman Modul 09 (8 soal) dan kunci serta pembahasannya, dari PDF "09 - Recurrence dan Metode Master" halaman 8–9.
// Teks memakai Markdown dengan rumus TeX ($...$). Soal 1, 2, 3, 4, 5, 6, dan 7 dinilai otomatis (kasus dan solusi dipilih dari daftar);
// soal 8 (alasan Metode Master tidak berlaku) dijawab dengan tulisan lalu dibandingkan dengan kunci.
const KASUS = ['1', '2', '3', 'Tidak berlaku']

export const kuis09 = {
  judul: 'Recurrence dan Metode Master',
  modul: '09',
  soal: [
    {
      no: 1,
      tipe: 'perhitungan',
      teks: 'Tentukan kasus dan solusi Metode Master untuk $T(n) = 16T(n/4) + n$.',
      isian: [
        { label: 'Kasus', jenis: 'pilih', opsi: KASUS, kunci: '1' },
        { label: 'Solusi', jenis: 'pilih', opsi: ['Θ(n)', 'Θ(n lg n)', 'Θ(n²)', 'Θ(n² lg n)'], kunci: 'Θ(n²)' },
      ],
      pembahasan: '$a = 16$, $b = 4$, $g(n) = n^{\\log_4 16} = n^2$, $f(n) = n = O(n^{2-\\varepsilon})$ dengan $\\varepsilon = 1$. **Kasus 1**: $T(n) = \\Theta(n^2)$.',
    },
    {
      no: 2,
      tipe: 'perhitungan',
      teks: 'Tentukan kasus dan solusi untuk $T(n) = 2T(n/4) + \\sqrt{n}$.',
      isian: [
        { label: 'Kasus', jenis: 'pilih', opsi: KASUS, kunci: '2' },
        { label: 'Solusi', jenis: 'pilih', opsi: ['Θ(√n)', 'Θ(√n lg n)', 'Θ(n)', 'Θ(n lg n)'], kunci: 'Θ(√n lg n)' },
      ],
      pembahasan: '$a = 2$, $b = 4$, $g(n) = n^{\\log_4 2} = n^{1/2}$, dan $f(n) = n^{1/2}$. Pangkatnya sama: **kasus 2**, sehingga $T(n) = \\Theta(\\sqrt{n} \\lg n)$.',
    },
    {
      no: 3,
      tipe: 'perhitungan',
      teks: 'Tentukan kasus dan solusi untuk $T(n) = 3T(n/2) + n^2$, termasuk pemeriksaan syarat keteraturan. (Isi $c$ sebagai bilangan desimal.)',
      isian: [
        { label: 'Kasus', jenis: 'pilih', opsi: KASUS, kunci: '3' },
        { label: 'c pada syarat keteraturan (a·f(n/b) ≤ c·f(n))', jenis: 'angka', kunci: 0.75 },
        { label: 'Solusi', jenis: 'pilih', opsi: ['Θ(n^1,585)', 'Θ(n² lg n)', 'Θ(n²)', 'Θ(n³)'], kunci: 'Θ(n²)' },
      ],
      pembahasan:
        '$a = 3$, $b = 2$, $g(n) = n^{\\lg 3} \\approx n^{1{,}585}$, $f(n) = n^2 = \\Omega(n^{1{,}585+\\varepsilon})$ untuk $0 < \\varepsilon \\le 0{,}415$. Syarat keteraturan: $3\\left(\\frac{n}{2}\\right)^2 = \\frac{3}{4}n^2 \\le c\\, n^2$ dengan $c = \\frac{3}{4} < 1$. **Kasus 3**: $T(n) = \\Theta(n^2)$.',
    },
    {
      no: 4,
      tipe: 'pilihan',
      teks: 'Pada recurrence $T(n) = aT(n/b) + f(n)$ untuk sebuah algoritma Divide and Conquer, $f(n)$ menyatakan ...',
      opsi: [
        { id: 'A', teks: 'Banyaknya submasalah.' },
        { id: 'B', teks: 'Ukuran setiap submasalah.' },
        { id: 'C', teks: 'Waktu untuk membagi masalah dan menggabungkan hasil submasalah.' },
        { id: 'D', teks: 'Running time kasus dasar.' },
      ],
      kunci: 'C',
      pembahasan: '**Jawaban: C.** Banyaknya submasalah adalah $a$ dan ukurannya $n/b$. Running time kasus dasar biasanya dianggap $\\Theta(1)$ dan tidak ditulis di $f(n)$.',
    },
    {
      no: 5,
      tipe: 'benarsalah',
      teks: '"Recurrence $T(n) = 2T(n/2) + n \\lg n$ dapat diselesaikan dengan kasus 3 Metode Master karena $n \\lg n$ tumbuh lebih cepat dari $n$." Benar atau salah?',
      opsi: [
        { id: 'Benar', teks: 'Benar' },
        { id: 'Salah', teks: 'Salah' },
      ],
      kunci: 'Salah',
      pembahasan:
        '**Salah.** Kasus 3 menuntut $f(n)$ lebih besar dari $n^{\\log_b a} = n$ **secara polinomial**, yaitu $f(n) = \\Omega(n^{1+\\varepsilon})$ untuk suatu $\\varepsilon > 0$. Perbandingan $\\frac{n \\lg n}{n} = \\lg n$ tumbuh lebih lambat dari $n^{\\varepsilon}$ untuk setiap $\\varepsilon > 0$, sehingga syarat itu tidak terpenuhi. Recurrence ini berada di celah antara kasus 2 dan 3.',
    },
    {
      no: 6,
      tipe: 'analisis',
      teks: 'Sebuah algoritma memecah masalah berukuran $n$ menjadi 4 submasalah berukuran $n/2$ dan menggabungkannya dalam waktu $\\Theta(n)$. Algoritma lain memecah menjadi 3 submasalah berukuran $n/2$ dengan biaya gabung yang sama. Hitung running time keduanya. Mana yang lebih efisien?',
      isian: [
        { label: 'Algoritma dengan 4 submasalah', jenis: 'pilih', opsi: ['Θ(n²)', 'Θ(n^1,585)', 'Θ(n lg n)'], kunci: 'Θ(n²)' },
        { label: 'Algoritma dengan 3 submasalah', jenis: 'pilih', opsi: ['Θ(n²)', 'Θ(n^1,585)', 'Θ(n lg n)'], kunci: 'Θ(n^1,585)' },
        { label: 'Yang lebih efisien', jenis: 'pilih', opsi: ['4 submasalah', '3 submasalah'], kunci: '3 submasalah' },
      ],
      pembahasan:
        'Algoritma pertama: $a = 4$, $b = 2$, $g(n) = n^2$, $f(n) = n$, kasus 1, sehingga $\\Theta(n^2)$. Algoritma kedua: $a = 3$, $b = 2$, $g(n) = n^{\\lg 3} \\approx n^{1{,}585}$, $f(n) = n$, kasus 1, sehingga $\\Theta(n^{\\lg 3}) \\approx \\Theta(n^{1{,}585})$. **Algoritma kedua lebih efisien**: mengurangi satu submasalah menurunkan eksponen dari 2 menjadi sekitar 1,585. (Ide ini dipakai pada algoritma perkalian bilangan bulat besar milik Karatsuba.)',
    },
    {
      no: 7,
      tipe: 'perhitungan',
      teks: 'Tentukan solusi $T(n) = T(n/2) + n$. Algoritma macam apa yang mungkin menghasilkan recurrence ini?',
      isian: [
        { label: 'Kasus', jenis: 'pilih', opsi: KASUS, kunci: '3' },
        { label: 'Solusi', jenis: 'pilih', opsi: ['Θ(1)', 'Θ(lg n)', 'Θ(n)', 'Θ(n lg n)'], kunci: 'Θ(n)' },
      ],
      pembahasan:
        '$a = 1$, $b = 2$, $g(n) = n^0 = 1$, $f(n) = n = \\Omega(n^{0+\\varepsilon})$ dengan $\\varepsilon = 1$. Keteraturan: $f(n/2) = \\frac{n}{2} \\le \\frac{1}{2}n$, sehingga $c = \\frac{1}{2}$. **Kasus 3**: $T(n) = \\Theta(n)$. Contohnya algoritma yang memeriksa seluruh data (biaya $n$), lalu melanjutkan secara rekursif hanya pada separuhnya, seperti varian algoritma seleksi/pencarian yang membuang separuh data pada setiap langkah.',
    },
    {
      no: 8,
      tipe: 'analisis',
      mandiri: true,
      teks: 'Mengapa Metode Master tidak dapat dipakai untuk $T(n) = T(n - 1) + n$? Berapakah solusinya?',
      kunciTeks: 'Ukuran submasalahnya n − 1, bukan n/b untuk suatu konstanta b > 1, sehingga bentuknya tidak sesuai syarat Metode Master. Dengan menjabarkan: T(n) = n + (n − 1) + (n − 2) + ⋯ + 1 = n(n + 1)/2 (ditambah konstanta kasus dasar), sehingga T(n) = Θ(n²).',
      pembahasan:
        'Ukuran submasalahnya $n - 1$, bukan $n/b$ untuk suatu konstanta $b > 1$, sehingga bentuknya tidak sesuai syarat Metode Master. Dengan menjabarkan: $T(n) = n + (n-1) + (n-2) + \\cdots + 1 = \\frac{n(n+1)}{2}$ (ditambah konstanta kasus dasar), sehingga $T(n) = \\Theta(n^2)$.',
    },
  ],
}

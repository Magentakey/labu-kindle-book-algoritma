// Kuis Pemahaman Modul 09 (8 soal pilihan ganda), bersumber dari soal PDF "09 - Recurrence dan Metode Master" halaman 8–9.
// Teks memakai Markdown dengan rumus TeX ($...$). `kunci` berupa satu id (satu jawaban) atau larik id (banyak jawaban, dinilai utuh).
export const kuis09 = {
  judul: 'Recurrence dan Metode Master',
  modul: '09',
  soal: [
    {
      no: 1,
      teks: 'Tentukan kasus dan solusi Metode Master untuk $T(n) = 16T(n/4) + n$.',
      opsi: [
        { id: 'A', teks: 'Kasus 2, $\\Theta(n^2 \\lg n)$' },
        { id: 'B', teks: 'Kasus 1, $\\Theta(n^2)$' },
        { id: 'C', teks: 'Kasus 3, $\\Theta(n)$' },
        { id: 'D', teks: 'Kasus 1, $\\Theta(n)$' },
      ],
      kunci: 'B',
      pembahasan: '**Jawaban: B.** $a = 16$, $b = 4$, $g(n) = n^{\\log_4 16} = n^2$, $f(n) = n = O(n^{2-\\varepsilon})$ dengan $\\varepsilon = 1$. **Kasus 1**: $T(n) = \\Theta(n^2)$.',
    },
    {
      no: 2,
      teks: 'Untuk $T(n) = 2T(n/4) + \\sqrt{n}$, pilih **dua** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: 'Termasuk kasus 1.' },
        { id: 'B', teks: 'Termasuk kasus 2.' },
        { id: 'C', teks: 'Termasuk kasus 3.' },
        { id: 'D', teks: '$T(n) = \\Theta(\\sqrt{n} \\lg n)$.' },
        { id: 'E', teks: '$T(n) = \\Theta(n)$.' },
      ],
      kunci: ['B', 'D'],
      pembahasan: '**Jawaban: B dan D.** $a = 2$, $b = 4$, $g(n) = n^{\\log_4 2} = n^{1/2}$, dan $f(n) = n^{1/2}$. Pangkatnya sama: **kasus 2**, sehingga $T(n) = \\Theta(\\sqrt{n} \\lg n)$.',
    },
    {
      no: 3,
      teks: 'Untuk $T(n) = 3T(n/2) + n^2$, pilih **tiga** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: 'Termasuk kasus 1.' },
        { id: 'B', teks: 'Termasuk kasus 3.' },
        { id: 'C', teks: 'Syarat keteraturan $a f(n/b) \\le c f(n)$ terpenuhi dengan $c = \\frac{3}{4}$.' },
        { id: 'D', teks: '$T(n) = \\Theta(n^{1{,}585})$.' },
        { id: 'E', teks: '$T(n) = \\Theta(n^2)$.' },
      ],
      kunci: ['B', 'C', 'E'],
      pembahasan: '**Jawaban: B, C, dan E.** $a = 3$, $b = 2$, $g(n) = n^{\\lg 3} \\approx n^{1{,}585}$, $f(n) = n^2 = \\Omega(n^{1{,}585+\\varepsilon})$ untuk $0 < \\varepsilon \\le 0{,}415$. Syarat keteraturan: $3\\left(\\frac{n}{2}\\right)^2 = \\frac{3}{4}n^2 \\le c\\, n^2$ dengan $c = \\frac{3}{4} < 1$. **Kasus 3**: $T(n) = \\Theta(n^2)$.',
    },
    {
      no: 4,
      teks: 'Pada recurrence $T(n) = aT(n/b) + f(n)$ untuk sebuah algoritma Divide and Conquer, $f(n)$ menyatakan ...',
      opsi: [
        { id: 'A', teks: 'Banyaknya submasalah.' },
        { id: 'B', teks: 'Ukuran setiap submasalah.' },
        { id: 'C', teks: 'Running time kasus dasar.' },
        { id: 'D', teks: 'Waktu untuk membagi masalah dan menggabungkan hasil submasalah.' },
      ],
      kunci: 'D',
      pembahasan: '**Jawaban: D.** Banyaknya submasalah adalah $a$ dan ukurannya $n/b$. Running time kasus dasar biasanya dianggap $\\Theta(1)$ dan tidak ditulis di $f(n)$.',
    },
    {
      no: 5,
      teks: 'Recurrence $T(n) = 2T(n/2) + n \\lg n$. Pernyataan manakah yang benar?',
      opsi: [
        { id: 'A', teks: 'Dapat diselesaikan dengan kasus 3, karena $n \\lg n$ tumbuh lebih cepat dari $n$.' },
        { id: 'B', teks: 'Dapat diselesaikan dengan kasus 1, karena $n \\lg n$ lebih kecil dari $n^2$.' },
        { id: 'C', teks: 'Tidak dapat memakai kasus 3: $\\frac{n \\lg n}{n} = \\lg n$ tidak tumbuh lebih cepat dari $n^{\\varepsilon}$, sehingga berada di celah antara kasus 2 dan 3.' },
        { id: 'D', teks: 'Dapat diselesaikan dengan kasus 2, dengan hasil $\\Theta(n \\lg n)$.' },
      ],
      kunci: 'C',
      pembahasan: '**Jawaban: C.** Kasus 3 menuntut $f(n)$ lebih besar dari $n^{\\log_b a} = n$ **secara polinomial**, yaitu $f(n) = \\Omega(n^{1+\\varepsilon})$ untuk suatu $\\varepsilon > 0$. Perbandingan $\\frac{n \\lg n}{n} = \\lg n$ tumbuh lebih lambat dari $n^{\\varepsilon}$ untuk setiap $\\varepsilon > 0$, sehingga syarat itu tidak terpenuhi. Kasus 2 juga tidak cocok karena $f(n)$ tidak $\\Theta(n)$.',
    },
    {
      no: 6,
      teks: 'Algoritma pertama memecah masalah menjadi 4 submasalah berukuran $n/2$ dan menggabungkannya dalam $\\Theta(n)$. Algoritma kedua memecah menjadi 3 submasalah berukuran $n/2$ dengan biaya gabung yang sama. Pilih **tiga** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: 'Algoritma pertama berjalan dalam $\\Theta(n^2)$.' },
        { id: 'B', teks: 'Algoritma kedua berjalan dalam $\\Theta(n^{\\lg 3}) \\approx \\Theta(n^{1{,}585})$.' },
        { id: 'C', teks: 'Algoritma kedua lebih efisien.' },
        { id: 'D', teks: 'Algoritma pertama berjalan dalam $\\Theta(n \\lg n)$.' },
        { id: 'E', teks: 'Algoritma pertama lebih efisien.' },
      ],
      kunci: ['A', 'B', 'C'],
      pembahasan: '**Jawaban: A, B, dan C.** Algoritma pertama: $a = 4$, $b = 2$, $g(n) = n^2$, $f(n) = n$, kasus 1, sehingga $\\Theta(n^2)$. Algoritma kedua: $a = 3$, $b = 2$, $g(n) = n^{\\lg 3}$, $f(n) = n$, kasus 1, sehingga $\\Theta(n^{\\lg 3}) \\approx \\Theta(n^{1{,}585})$. **Algoritma kedua lebih efisien**: mengurangi satu submasalah menurunkan eksponen dari 2 menjadi sekitar 1,585. (Ide ini dipakai pada algoritma perkalian bilangan bulat besar milik Karatsuba.)',
    },
    {
      no: 7,
      teks: 'Tentukan kasus dan solusi $T(n) = T(n/2) + n$.',
      opsi: [
        { id: 'A', teks: 'Kasus 3, $\\Theta(n)$' },
        { id: 'B', teks: 'Kasus 2, $\\Theta(n \\lg n)$' },
        { id: 'C', teks: 'Kasus 1, $\\Theta(\\lg n)$' },
        { id: 'D', teks: 'Kasus 3, $\\Theta(n \\lg n)$' },
      ],
      kunci: 'A',
      pembahasan: '**Jawaban: A.** $a = 1$, $b = 2$, $g(n) = n^0 = 1$, $f(n) = n = \\Omega(n^{0+\\varepsilon})$ dengan $\\varepsilon = 1$. Keteraturan: $f(n/2) = \\frac{n}{2} \\le \\frac{1}{2}n$, sehingga $c = \\frac{1}{2}$. **Kasus 3**: $T(n) = \\Theta(n)$. Contohnya algoritma yang memeriksa seluruh data (biaya $n$), lalu melanjutkan secara rekursif hanya pada separuhnya.',
    },
    {
      no: 8,
      teks: 'Mengapa Metode Master tidak dapat dipakai untuk $T(n) = T(n - 1) + n$, dan berapa solusinya?',
      opsi: [
        { id: 'A', teks: 'Karena ukuran submasalahnya $n - 1$ dan bukan $n/b$; solusinya $\\Theta(n)$.' },
        { id: 'B', teks: 'Karena $f(n) = n$ terlalu besar; solusinya $\\Theta(n \\lg n)$.' },
        { id: 'C', teks: 'Karena $a = 1$ tidak diizinkan; solusinya $\\Theta(2^n)$.' },
        { id: 'D', teks: 'Karena ukuran submasalahnya $n - 1$ dan bukan $n/b$; solusinya $\\Theta(n^2)$.' },
      ],
      kunci: 'D',
      pembahasan: '**Jawaban: D.** Ukuran submasalahnya $n - 1$, bukan $n/b$ untuk suatu konstanta $b > 1$, sehingga bentuknya tidak sesuai syarat Metode Master. Dengan menjabarkan: $T(n) = n + (n-1) + (n-2) + \\cdots + 1 = \\frac{n(n+1)}{2}$ (ditambah konstanta kasus dasar), sehingga $T(n) = \\Theta(n^2)$.',
    },
  ],
}

// Kuis Pemahaman Modul 06 (8 soal) dan kunci serta pembahasannya, dari PDF "06 - Notasi Asimtotik (Theta, Big-Oh, Omega)" halaman 9–10.
// Teks memakai Markdown dengan rumus TeX ($...$). Soal bertanda `mandiri` dijawab dengan tulisan lalu dibandingkan dengan kunci:
// pembuktian (1, 2, 7) dan analisis (6) punya banyak jawaban sah, jadi dinilai sendiri. Soal 3, 4, 5, dan 8 dinilai otomatis.
export const kuis06 = {
  judul: 'Notasi Asimtotik Θ, O, Ω',
  modul: '06',
  soal: [
    {
      no: 1,
      tipe: 'pembuktian',
      mandiri: true,
      teks: 'Buktikan $3n^2 + 5n = \\Theta(n^2)$ dengan menentukan $c_1$, $c_2$, dan $n_0$.',
      kunciTeks: 'c₁ = 3, c₂ = 4, n₀ = 5. Membagi dengan n² memberi c₁ ≤ 3 + 5/n ≤ c₂. Nilai 3 + 5/n turun dari 8 (n = 1) menuju 3 dan selalu lebih dari 3, jadi c₁ = 3 berlaku untuk semua n ≥ 1. Untuk batas atas, 3 + 5/n ≤ 4 setara dengan n ≥ 5. (Alternatif: c₁ = 3, c₂ = 8, n₀ = 1.)',
      pembahasan:
        'Bagi dengan $n^2$: $c_1 \\le 3 + \\frac{5}{n} \\le c_2$. Nilai $3 + \\frac{5}{n}$ turun dari 8 ($n = 1$) menuju 3 dan selalu lebih dari 3. Maka $c_1 = 3$ berlaku untuk semua $n \\ge 1$. Untuk batas atas, $3 + \\frac{5}{n} \\le 4 \\iff n \\ge 5$. Salah satu jawaban: $c_1 = 3$, $c_2 = 4$, $n_0 = 5$. (Alternatif: $c_1 = 3$, $c_2 = 8$, $n_0 = 1$.)',
    },
    {
      no: 2,
      tipe: 'pembuktian',
      mandiri: true,
      teks: 'Buktikan $4n + 7 = O(n)$. Tentukan $c$ dan $n_0$.',
      kunciTeks: 'c = 5, n₀ = 7 (dan 4n + 7 ≥ 0 untuk semua n). Membagi dengan n memberi 4 + 7/n ≤ c. Dengan c = 5 diperlukan 7/n ≤ 1, yaitu n ≥ 7. Alternatif: c = 11, n₀ = 1.',
      pembahasan:
        'Bagi dengan $n$: $4 + \\frac{7}{n} \\le c$. Dengan $c = 5$ diperlukan $\\frac{7}{n} \\le 1$, yaitu $n \\ge 7$. Jadi $c = 5$, $n_0 = 7$ (dan $4n + 7 \\ge 0$ untuk semua $n$). Alternatif: $c = 11$, $n_0 = 1$.',
    },
    {
      no: 3,
      tipe: 'pembuktian',
      teks: 'Buktikan $\\frac{1}{2}n^2 - 2n = \\Omega(n^2)$ dengan $c = \\frac{1}{4}$. Berapa $n_0$ terkecil yang dapat dipakai?',
      isian: [{ label: 'n₀ terkecil', jenis: 'angka', kunci: 8 }],
      pembahasan:
        'Perlu $\\frac{1}{4}n^2 \\le \\frac{1}{2}n^2 - 2n$. Bagi dengan $n^2$: $\\frac{1}{4} \\le \\frac{1}{2} - \\frac{2}{n}$, yaitu $\\frac{2}{n} \\le \\frac{1}{4}$, sehingga $n \\ge 8$. Maka $n_0 = 8$. Cek: $n = 8$ memberi $16 \\le 32 - 16 = 16$ (benar), sedangkan $n = 7$ memberi $12{,}25 \\le 10{,}5$ (salah).',
    },
    {
      no: 4,
      tipe: 'benarsalah',
      teks: 'Tentukan benar atau salah: (a) $n \\lg n = O(n^2)$; (b) $n^2 = O(n \\lg n)$; (c) $5 = \\Theta(1)$.',
      isian: [
        { label: '(a) n lg n = O(n²)', jenis: 'pilih', opsi: ['Benar', 'Salah'], kunci: 'Benar' },
        { label: '(b) n² = O(n lg n)', jenis: 'pilih', opsi: ['Benar', 'Salah'], kunci: 'Salah' },
        { label: '(c) 5 = Θ(1)', jenis: 'pilih', opsi: ['Benar', 'Salah'], kunci: 'Benar' },
      ],
      pembahasan:
        '(a) **Benar**: $\\lg n \\le n$ untuk $n \\ge 1$, sehingga $n \\lg n \\le 1 \\cdot n^2$. (b) **Salah**: $n^2 \\le c\\, n \\lg n$ berarti $\\frac{n}{\\lg n} \\le c$, padahal $\\frac{n}{\\lg n}$ terus membesar tanpa batas. (c) **Benar**: $1 \\cdot 1 \\le 5 \\le 5 \\cdot 1$, ambil $c_1 = 1$, $c_2 = 5$, $n_0 = 1$.',
    },
    {
      no: 5,
      tipe: 'pilihan',
      teks: 'Pernyataan mana yang paling tepat tentang Insertion Sort?',
      opsi: [
        { id: 'A', teks: 'Running time Insertion Sort adalah $\\Theta(n^2)$ untuk semua masukan.' },
        { id: 'B', teks: 'Running time Insertion Sort adalah $O(n^2)$ untuk semua masukan, dan kasus terbaiknya $\\Theta(n)$.' },
        { id: 'C', teks: 'Running time Insertion Sort adalah $\\Omega(n^2)$ untuk semua masukan.' },
        { id: 'D', teks: 'Kasus terburuk Insertion Sort adalah $O(n)$.' },
      ],
      kunci: 'B',
      pembahasan: '**Jawaban: B.** Untuk data terurut running time-nya linier, sehingga A dan C salah. D salah karena kasus terburuknya kuadrat.',
    },
    {
      no: 6,
      tipe: 'analisis',
      mandiri: true,
      teks: 'Seorang mahasiswa membuktikan $\\frac{1}{2}n^2 - 3n = O(n^2)$ dengan memilih $c = \\frac{1}{2}$ dan $n_0 = 1$, dengan alasan "$\\frac{1}{2}n^2 - 3n \\le \\frac{1}{2}n^2$ selalu benar". Apa yang kurang tepat dari jawaban itu?',
      kunciTeks: 'Definisi Big-Oh juga mensyaratkan 0 ≤ f(n). Untuk n = 1 sampai 5, ½n² − 3n bernilai negatif (misalnya n = 1 memberi −5/2), sehingga syarat itu dilanggar. Nilai n₀ yang tepat adalah 6. Sisi kanannya (≤ ½n²) memang benar untuk semua n, tetapi itu belum cukup.',
      pembahasan:
        'Definisi Big-Oh juga mensyaratkan $0 \\le f(n)$. Untuk $n = 1$ sampai 5, $\\frac{1}{2}n^2 - 3n$ bernilai negatif (misalnya $n = 1$ memberi $-\\frac{5}{2}$), sehingga syarat itu dilanggar. Nilai $n_0$ yang tepat adalah 6. Sisi kanannya ($\\le \\frac{1}{2}n^2$) memang benar untuk semua $n$, tetapi itu belum cukup.',
    },
    {
      no: 7,
      tipe: 'pembuktian',
      mandiri: true,
      teks: 'Tunjukkan bahwa $n^3 \\ne O(n^2)$.',
      kunciTeks: 'Andaikan ada c, n₀ > 0 sehingga n³ ≤ c n² untuk semua n ≥ n₀. Bagi dengan n²: n ≤ c untuk semua n ≥ n₀. Ini mustahil karena untuk n = max(n₀, ⌈c⌉ + 1) berlaku n > c. Jadi tidak ada konstanta yang memenuhi, dan n³ ≠ O(n²).',
      pembahasan:
        'Andaikan ada $c, n_0 > 0$ sehingga $n^3 \\le c\\, n^2$ untuk semua $n \\ge n_0$. Bagi dengan $n^2$: $n \\le c$ untuk semua $n \\ge n_0$. Ini mustahil karena untuk $n = \\max(n_0, \\lceil c \\rceil + 1)$ berlaku $n > c$. Jadi tidak ada konstanta yang memenuhi, dan $n^3 \\ne O(n^2)$.',
    },
    {
      no: 8,
      tipe: 'pilihan',
      teks: 'Jika $f(n) = O(g(n))$ dan $f(n) = \\Omega(g(n))$, maka ...',
      opsi: [
        { id: 'A', teks: '$f(n) = g(n)$ untuk semua $n$.' },
        { id: 'B', teks: '$f(n) = \\Theta(g(n))$.' },
        { id: 'C', teks: '$g(n) = O(1)$.' },
        { id: 'D', teks: 'Tidak dapat disimpulkan apa pun.' },
      ],
      kunci: 'B',
      pembahasan: '**Jawaban: B**, berdasarkan Teorema 3.1. Pilihan A salah karena notasi asimtotik mengabaikan konstanta dan nilai $n$ kecil; misalnya $2n = \\Theta(n)$ padahal $2n \\ne n$.',
    },
  ],
}

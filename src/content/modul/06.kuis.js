// Kuis Pemahaman Modul 06 (8 soal pilihan ganda), bersumber dari soal PDF "06 - Notasi Asimtotik (Theta, Big-Oh, Omega)" halaman 9–10.
// Teks memakai Markdown dengan rumus TeX ($...$). `kunci` berupa satu id (satu jawaban) atau larik id (banyak jawaban, dinilai utuh).
export const kuis06 = {
  judul: 'Notasi Asimtotik Θ, O, Ω',
  modul: '06',
  soal: [
    {
      no: 1,
      teks: 'Untuk membuktikan $3n^2 + 5n = \\Theta(n^2)$ perlu $c_1 n^2 \\le 3n^2 + 5n \\le c_2 n^2$ untuk semua $n \\ge n_0$. Pilih **dua** pasangan $(c_1, c_2, n_0)$ yang valid.',
      opsi: [
        { id: 'A', teks: '$(3, 4, 5)$' },
        { id: 'B', teks: '$(3, 4, 1)$' },
        { id: 'C', teks: '$(3, 8, 1)$' },
        { id: 'D', teks: '$(4, 8, 1)$' },
        { id: 'E', teks: '$(2, 3, 5)$' },
      ],
      kunci: ['A', 'C'],
      pembahasan: '**Jawaban: A dan C.** Bagi dengan $n^2$: $c_1 \\le 3 + \\frac{5}{n} \\le c_2$. Nilai $3 + \\frac{5}{n}$ turun dari 8 ($n = 1$) menuju 3 dan selalu lebih dari 3. Maka $c_1 = 3$ berlaku untuk semua $n \\ge 1$. Untuk batas atas, $3 + \\frac{5}{n} \\le 4 \\iff n \\ge 5$ (A benar, B salah karena $n = 1$ memberi 8), dan $3 + \\frac{5}{n} \\le 8$ untuk semua $n \\ge 1$ (C benar). D salah karena $c_1 = 4$ gagal untuk $n \\ge 6$; E salah karena $c_2 = 3$ lebih kecil dari nilai yang selalu di atas 3.',
    },
    {
      no: 2,
      teks: 'Untuk membuktikan $4n + 7 = O(n)$ perlu $4n + 7 \\le c\\,n$ untuk semua $n \\ge n_0$. Pasangan $(c, n_0)$ manakah yang valid?',
      opsi: [
        { id: 'A', teks: '$(4, 1000)$' },
        { id: 'B', teks: '$(5, 1)$' },
        { id: 'C', teks: '$(5, 7)$' },
        { id: 'D', teks: '$(3, 7)$' },
      ],
      kunci: 'C',
      pembahasan: '**Jawaban: C.** Bagi dengan $n$: $4 + \\frac{7}{n} \\le c$. Dengan $c = 5$ diperlukan $\\frac{7}{n} \\le 1$, yaitu $n \\ge 7$. Pilihan B gagal pada $n = 1$ ($11 > 5$). Pilihan A dan D gagal karena $4 + \\frac{7}{n}$ selalu lebih dari 4. (Pasangan lain yang valid: $c = 11$, $n_0 = 1$.)',
    },
    {
      no: 3,
      teks: 'Untuk membuktikan $\\frac{1}{2}n^2 - 2n = \\Omega(n^2)$ dengan $c = \\frac{1}{4}$, berapa $n_0$ terkecil yang dapat dipakai?',
      opsi: [
        { id: 'A', teks: '$n_0 = 4$' },
        { id: 'B', teks: '$n_0 = 8$' },
        { id: 'C', teks: '$n_0 = 6$' },
        { id: 'D', teks: '$n_0 = 16$' },
      ],
      kunci: 'B',
      pembahasan: '**Jawaban: B.** Perlu $\\frac{1}{4}n^2 \\le \\frac{1}{2}n^2 - 2n$. Bagi dengan $n^2$: $\\frac{1}{4} \\le \\frac{1}{2} - \\frac{2}{n}$, yaitu $\\frac{2}{n} \\le \\frac{1}{4}$, sehingga $n \\ge 8$. Cek: $n = 8$ memberi $16 \\le 32 - 16 = 16$ (benar), sedangkan $n = 7$ memberi $12{,}25 \\le 10{,}5$ (salah).',
    },
    {
      no: 4,
      teks: 'Pilih **dua** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: '$n^2 = O(n \\lg n)$' },
        { id: 'B', teks: '$n \\lg n = O(n^2)$' },
        { id: 'C', teks: '$n \\lg n = \\Omega(n^2)$' },
        { id: 'D', teks: '$5 = \\Theta(1)$' },
        { id: 'E', teks: '$5 = \\Theta(n)$' },
      ],
      kunci: ['B', 'D'],
      pembahasan: '**Jawaban: B dan D.** (B) $\\lg n \\le n$ untuk $n \\ge 1$, sehingga $n \\lg n \\le 1 \\cdot n^2$. (A) salah: $n^2 \\le c\\, n \\lg n$ berarti $\\frac{n}{\\lg n} \\le c$, padahal $\\frac{n}{\\lg n}$ terus membesar tanpa batas; untuk alasan yang sama C salah. (D) $1 \\cdot 1 \\le 5 \\le 5 \\cdot 1$, ambil $c_1 = 1$, $c_2 = 5$, $n_0 = 1$. (E) salah karena konstanta tidak tumbuh seperti $n$.',
    },
    {
      no: 5,
      teks: 'Pernyataan mana yang paling tepat tentang Insertion Sort?',
      opsi: [
        { id: 'A', teks: 'Running time Insertion Sort adalah $\\Theta(n^2)$ untuk semua masukan.' },
        { id: 'B', teks: 'Running time Insertion Sort adalah $\\Omega(n^2)$ untuk semua masukan.' },
        { id: 'C', teks: 'Running time Insertion Sort adalah $O(n^2)$ untuk semua masukan, dan kasus terbaiknya $\\Theta(n)$.' },
        { id: 'D', teks: 'Kasus terburuk Insertion Sort adalah $O(n)$.' },
      ],
      kunci: 'C',
      pembahasan: '**Jawaban: C.** Untuk data terurut running time-nya linier, sehingga A dan B salah. D salah karena kasus terburuknya kuadrat.',
    },
    {
      no: 6,
      teks: 'Seorang mahasiswa membuktikan $\\frac{1}{2}n^2 - 3n = O(n^2)$ dengan memilih $c = \\frac{1}{2}$ dan $n_0 = 1$, dengan alasan "$\\frac{1}{2}n^2 - 3n \\le \\frac{1}{2}n^2$ selalu benar". Apa yang kurang tepat dari jawaban itu?',
      opsi: [
        { id: 'A', teks: 'Konstanta $c$ harus lebih besar dari 1.' },
        { id: 'B', teks: 'Nilai $n_0$ harus 0.' },
        { id: 'C', teks: 'Sebenarnya $\\frac{1}{2}n^2 - 3n$ bukan $O(n^2)$.' },
        { id: 'D', teks: 'Definisi Big-Oh juga mensyaratkan $0 \\le f(n)$, padahal untuk $n = 1$ sampai 5 nilainya negatif; $n_0$ yang tepat adalah 6.' },
      ],
      kunci: 'D',
      pembahasan: '**Jawaban: D.** Definisi Big-Oh juga mensyaratkan $0 \\le f(n)$. Untuk $n = 1$ sampai 5, $\\frac{1}{2}n^2 - 3n$ bernilai negatif (misalnya $n = 1$ memberi $-\\frac{5}{2}$), sehingga syarat itu dilanggar. Nilai $n_0$ yang tepat adalah 6. Sisi kanannya ($\\le \\frac{1}{2}n^2$) memang benar untuk semua $n$, tetapi itu belum cukup.',
    },
    {
      no: 7,
      teks: 'Untuk menunjukkan $n^3 \\ne O(n^2)$ dipakai pembuktian dengan kontradiksi. Pilih **dua** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: 'Cukup menunjukkan satu nilai $n$ yang membuat $n^3 > c\\,n^2$.' },
        { id: 'B', teks: 'Andaikan ada $c, n_0 > 0$ dengan $n^3 \\le c\\,n^2$ untuk semua $n \\ge n_0$; membagi dengan $n^2$ memberi $n \\le c$.' },
        { id: 'C', teks: 'Pertidaksamaan $n \\le c$ mustahil berlaku untuk semua $n \\ge n_0$, misalnya gagal untuk $n = \\max(n_0, \\lceil c \\rceil + 1)$.' },
        { id: 'D', teks: 'Memilih $c = 1000$ sudah cukup untuk membuktikannya.' },
        { id: 'E', teks: 'Pembuktian ini menunjukkan $n^3 = O(n^2)$.' },
      ],
      kunci: ['B', 'C'],
      pembahasan: '**Jawaban: B dan C.** Andaikan ada $c, n_0 > 0$ sehingga $n^3 \\le c\\, n^2$ untuk semua $n \\ge n_0$. Bagi dengan $n^2$: $n \\le c$ untuk semua $n \\ge n_0$. Ini mustahil karena untuk $n = \\max(n_0, \\lceil c \\rceil + 1)$ berlaku $n > c$. Jadi tidak ada konstanta yang memenuhi. A salah: Big-Oh menuntut satu pasangan $(c, n_0)$ untuk **semua** $n \\ge n_0$, jadi untuk menyangkalnya harus ditunjukkan bahwa **tidak ada** pasangan yang bekerja.',
    },
    {
      no: 8,
      teks: 'Jika $f(n) = O(g(n))$ dan $f(n) = \\Omega(g(n))$, maka ...',
      opsi: [
        { id: 'A', teks: '$f(n) = \\Theta(g(n))$.' },
        { id: 'B', teks: '$f(n) = g(n)$ untuk semua $n$.' },
        { id: 'C', teks: '$g(n) = O(1)$.' },
        { id: 'D', teks: 'Tidak dapat disimpulkan apa pun.' },
      ],
      kunci: 'A',
      pembahasan: '**Jawaban: A**, berdasarkan Teorema 3.1. Pilihan B salah karena notasi asimtotik mengabaikan konstanta dan nilai $n$ kecil; misalnya $2n = \\Theta(n)$ padahal $2n \\ne n$.',
    },
  ],
}

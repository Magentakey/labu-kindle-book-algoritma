// Kuis Pemahaman Modul 07 (7 soal pilihan ganda), bersumber dari soal PDF "07 - Notasi Little-o dan Little-omega" halaman 8–9.
// Teks memakai Markdown dengan rumus TeX ($...$). `kunci` berupa satu id (satu jawaban) atau larik id (banyak jawaban, dinilai utuh).
export const kuis07 = {
  judul: 'Little-o dan Little-ω',
  modul: '07',
  soal: [
    {
      no: 1,
      teks: 'Apa perbedaan utama definisi $O(g(n))$ dan $o(g(n))$?',
      opsi: [
        { id: 'A', teks: '$O$ memakai $<$, sedangkan $o$ memakai $\\le$.' },
        { id: 'B', teks: '$O$ hanya berlaku untuk polinomial.' },
        { id: 'C', teks: '$O$ menuntut ada **satu** konstanta $c$ yang memenuhi, sedangkan $o$ menuntut ketidaksamaan berlaku untuk **setiap** konstanta $c > 0$.' },
        { id: 'D', teks: 'Tidak ada perbedaan, keduanya ditulis berbeda karena kebiasaan saja.' },
      ],
      kunci: 'C',
      pembahasan: '**Jawaban: C.** Selain itu $o$ memakai ketidaksamaan tegas ($<$). Syarat "untuk setiap $c$" membuat $o$ jauh lebih kuat: $f = o(g)$ mengimplikasikan $f = O(g)$, tetapi tidak sebaliknya.',
    },
    {
      no: 2,
      teks: 'Untuk membuktikan $3n + 5 = o(n^2)$, pilih **dua** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: 'Untuk $c = 1$, $n_0 = 4$ sudah cukup.' },
        { id: 'B', teks: '$\\lim \\dfrac{3n + 5}{n^2} = 0$.' },
        { id: 'C', teks: '$\\lim \\dfrac{3n + 5}{n^2} = 3$.' },
        { id: 'D', teks: 'Untuk $c = 1$, $n_0$ terkecil adalah 5.' },
        { id: 'E', teks: '$3n + 5 = \\Theta(n^2)$.' },
      ],
      kunci: ['B', 'D'],
      pembahasan: '**Jawaban: B dan D.** $\\lim \\dfrac{3n + 5}{n^2} = \\lim \\left( \\dfrac{3}{n} + \\dfrac{5}{n^2} \\right) = 0$, jadi $3n + 5 = o(n^2)$. Untuk $c = 1$ perlu $3n + 5 < n^2$. Cek: $n = 4$ memberi $17 < 16$ (salah, sehingga A salah), $n = 5$ memberi $20 < 25$ (benar), dan untuk $n \\ge 5$ selisih $n^2 - 3n - 5$ terus naik. Jadi $n_0 = 5$. Limit 0 juga berarti bukan $\\Theta(n^2)$ (E salah).',
    },
    {
      no: 3,
      teks: 'Pilih **dua** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: '$n^2 = o(n^2)$' },
        { id: 'B', teks: '$n^3 = \\omega(n^2)$' },
        { id: 'C', teks: '$\\lg n = \\omega(1)$' },
        { id: 'D', teks: '$n^2 = \\omega(n^2)$' },
        { id: 'E', teks: '$n = o(\\lg n)$' },
      ],
      kunci: ['B', 'C'],
      pembahasan: '**Jawaban: B dan C.** (B) $\\lim n^3/n^2 = \\lim n = \\infty$. (C) $\\lim \\frac{\\lg n}{1} = \\infty$, artinya $\\lg n$ tumbuh lebih cepat dari konstanta mana pun, walaupun lambat. (A dan D) salah: $\\lim n^2/n^2 = 1$, bukan 0 maupun $\\infty$. (E) salah: $n$ tumbuh lebih cepat dari $\\lg n$.',
    },
    {
      no: 4,
      teks: 'Gunakan uji limit untuk menentukan hubungan $f(n) = n \\lg n$ dan $g(n) = n^{1{,}5}$.',
      opsi: [
        { id: 'A', teks: '$f(n) = \\Theta(g(n))$' },
        { id: 'B', teks: '$f(n) = \\omega(g(n))$' },
        { id: 'C', teks: 'Tidak dapat ditentukan dengan uji limit.' },
        { id: 'D', teks: '$f(n) = o(g(n))$' },
      ],
      kunci: 'D',
      pembahasan: '**Jawaban: D.** $\\dfrac{n \\lg n}{n^{1{,}5}} = \\dfrac{\\lg n}{n^{0{,}5}}$. Dengan L\'Hôpital: $\\lim \\dfrac{1/(n \\ln 2)}{0{,}5\\, n^{-0{,}5}} = \\lim \\dfrac{2}{\\ln 2 \\cdot n^{0{,}5}} = 0$. Jadi $n \\lg n = o(n^{1{,}5})$.',
    },
    {
      no: 5,
      teks: 'Diketahui $f(n) = o(g(n))$. Apakah mungkin $f(n) = \\Omega(g(n))$ juga benar?',
      opsi: [
        { id: 'A', teks: 'Mungkin, bila konstanta $c$ dipilih cukup kecil.' },
        { id: 'B', teks: 'Tidak mungkin: $o$ berarti $\\lim f/g = 0$, sedangkan $\\Omega$ berarti $f/g \\ge c > 0$ untuk $n$ besar, sehingga keduanya bertentangan.' },
        { id: 'C', teks: 'Mungkin, bila $f(n) = g(n)$.' },
        { id: 'D', teks: 'Mungkin, untuk nilai $n$ yang kecil.' },
      ],
      kunci: 'B',
      pembahasan: '**Jawaban: B.** $f = o(g)$ berarti $\\lim f/g = 0$. Jika juga $f = \\Omega(g)$, ada $c > 0$ sehingga $f(n) \\ge c\\, g(n)$ untuk $n$ besar, yaitu $f/g \\ge c > 0$, sehingga limitnya tidak mungkin 0. Kontradiksi. (Analogi: tidak mungkin $a < b$ dan $a \\ge b$ sekaligus.)',
    },
    {
      no: 6,
      teks: 'Hasil $\\lim_{n \\to \\infty} \\dfrac{4n^2 + n}{n^2} = 4$. Kesimpulan yang tepat adalah ...',
      opsi: [
        { id: 'A', teks: '$4n^2 + n = \\Theta(n^2)$' },
        { id: 'B', teks: '$4n^2 + n = o(n^2)$' },
        { id: 'C', teks: '$4n^2 + n = \\omega(n^2)$' },
        { id: 'D', teks: 'Tidak dapat disimpulkan' },
      ],
      kunci: 'A',
      pembahasan: '**Jawaban: A.** Limit berhingga dan positif ($0 < 4 < \\infty$) berarti kedua fungsi tumbuh sama cepat.',
    },
    {
      no: 7,
      teks: 'Perhatikan fungsi $n^2$, $\\lg n$, $2^n$, $n \\lg n$, dan $\\sqrt{n}$. Pilih **dua** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: '$n^2 \\prec n \\lg n$' },
        { id: 'B', teks: '$\\lg n = o(\\sqrt{n})$, karena $\\lim \\dfrac{\\lg n}{\\sqrt{n}} = \\lim \\dfrac{2}{\\ln 2 \\cdot \\sqrt{n}} = 0$' },
        { id: 'C', teks: '$2^n \\prec n^2$' },
        { id: 'D', teks: '$n \\lg n = o(\\sqrt{n})$' },
        { id: 'E', teks: '$n^2 \\prec 2^n$' },
      ],
      kunci: ['B', 'E'],
      pembahasan: '**Jawaban: B dan E.** Urutan dari yang paling lambat tumbuh: $\\lg n \\prec \\sqrt{n} \\prec n \\lg n \\prec n^2 \\prec 2^n$. Untuk $\\lg n$ dan $\\sqrt{n}$: $\\lim \\dfrac{\\lg n}{n^{1/2}} = \\lim \\dfrac{1/(n \\ln 2)}{\\frac{1}{2} n^{-1/2}} = \\lim \\dfrac{2}{\\ln 2 \\cdot \\sqrt{n}} = 0$. Pilihan A, C, dan D membalik urutan tersebut.',
    },
  ],
}

// Kuis Pemahaman Modul 07 (7 soal) dan kunci serta pembahasannya, dari PDF "07 - Notasi Little-o dan Little-omega" halaman 8–9.
// Teks memakai Markdown dengan rumus TeX ($...$). Soal bertanda `mandiri` dijawab dengan tulisan lalu dibandingkan dengan kunci.
// Dinilai otomatis: soal 1, 2 (n₀), 3, 4, 6. Dinilai sendiri: soal 5 (penjelasan) dan 7 (urutan dan alasan limit).
export const kuis07 = {
  judul: 'Little-o dan Little-ω',
  modul: '07',
  soal: [
    {
      no: 1,
      tipe: 'pilihan',
      teks: 'Apa perbedaan utama definisi $O(g(n))$ dan $o(g(n))$?',
      opsi: [
        { id: 'A', teks: '$O$ memakai $<$, sedangkan $o$ memakai $\\le$.' },
        { id: 'B', teks: '$O$ menuntut ada **satu** konstanta $c$ yang memenuhi, sedangkan $o$ menuntut ketidaksamaan berlaku untuk **setiap** konstanta $c > 0$.' },
        { id: 'C', teks: '$O$ hanya berlaku untuk polinomial.' },
        { id: 'D', teks: 'Tidak ada perbedaan, keduanya ditulis berbeda karena kebiasaan saja.' },
      ],
      kunci: 'B',
      pembahasan: '**Jawaban: B.** Selain itu $o$ memakai ketidaksamaan tegas ($<$). Syarat "untuk setiap $c$" membuat $o$ jauh lebih kuat: $f = o(g)$ mengimplikasikan $f = O(g)$, tetapi tidak sebaliknya.',
    },
    {
      no: 2,
      tipe: 'pembuktian',
      teks: 'Buktikan dengan limit bahwa $3n + 5 = o(n^2)$. Lalu, dengan definisi, tentukan $n_0$ untuk $c = 1$.',
      isian: [{ label: 'n₀ untuk c = 1', jenis: 'angka', kunci: 5 }],
      pembahasan:
        '$\\lim \\dfrac{3n + 5}{n^2} = \\lim \\left( \\dfrac{3}{n} + \\dfrac{5}{n^2} \\right) = 0$, jadi $3n + 5 = o(n^2)$. Untuk $c = 1$ perlu $3n + 5 < n^2$. Cek: $n = 4$ memberi $17 < 16$ (salah), $n = 5$ memberi $20 < 25$ (benar), dan untuk $n \\ge 5$ selisih $n^2 - 3n - 5$ terus naik. Jadi $n_0 = 5$.',
    },
    {
      no: 3,
      tipe: 'benarsalah',
      teks: 'Tentukan benar atau salah: (a) $n^2 = o(n^2)$; (b) $n^3 = \\omega(n^2)$; (c) $\\lg n = \\omega(1)$.',
      isian: [
        { label: '(a) n² = o(n²)', jenis: 'pilih', opsi: ['Benar', 'Salah'], kunci: 'Salah' },
        { label: '(b) n³ = ω(n²)', jenis: 'pilih', opsi: ['Benar', 'Salah'], kunci: 'Benar' },
        { label: '(c) lg n = ω(1)', jenis: 'pilih', opsi: ['Benar', 'Salah'], kunci: 'Benar' },
      ],
      pembahasan:
        '(a) **Salah**: $\\lim n^2/n^2 = 1 \\ne 0$. (b) **Benar**: $\\lim n^3/n^2 = \\lim n = \\infty$. (c) **Benar**: $\\lim \\frac{\\lg n}{1} = \\infty$, artinya $\\lg n$ tumbuh lebih cepat dari konstanta mana pun, walaupun lambat.',
    },
    {
      no: 4,
      tipe: 'perhitungan',
      teks: 'Gunakan uji limit untuk menentukan hubungan $f(n) = n \\lg n$ dan $g(n) = n^{1{,}5}$ (apakah $o$, $\\Theta$, atau $\\omega$).',
      isian: [{ label: 'f(n) terhadap g(n)', jenis: 'pilih', opsi: ['o', 'Θ', 'ω'], kunci: 'o' }],
      pembahasan:
        '$\\dfrac{n \\lg n}{n^{1{,}5}} = \\dfrac{\\lg n}{n^{0{,}5}}$. Dengan L\'Hôpital: $\\lim \\dfrac{1/(n \\ln 2)}{0{,}5\\, n^{-0{,}5}} = \\lim \\dfrac{2}{\\ln 2 \\cdot n^{0{,}5}} = 0$. Jadi $n \\lg n = o(n^{1{,}5})$.',
    },
    {
      no: 5,
      tipe: 'analisis',
      mandiri: true,
      teks: 'Diketahui $f(n) = o(g(n))$. Apakah mungkin $f(n) = \\Omega(g(n))$ juga benar? Jelaskan.',
      kunciTeks: 'Tidak mungkin. f = o(g) berarti lim f/g = 0. Jika juga f = Ω(g), ada c > 0 sehingga f(n) ≥ c g(n) untuk n besar, yaitu f/g ≥ c > 0, sehingga limitnya tidak mungkin 0. Kontradiksi. (Analogi: tidak mungkin a < b dan a ≥ b sekaligus.)',
      pembahasan:
        '**Tidak mungkin.** $f = o(g)$ berarti $\\lim f/g = 0$. Jika juga $f = \\Omega(g)$, ada $c > 0$ sehingga $f(n) \\ge c\\, g(n)$ untuk $n$ besar, yaitu $f/g \\ge c > 0$, sehingga limitnya tidak mungkin 0. Kontradiksi. (Analogi: tidak mungkin $a < b$ dan $a \\ge b$ sekaligus.)',
    },
    {
      no: 6,
      tipe: 'pilihan',
      teks: 'Hasil $\\lim_{n \\to \\infty} \\dfrac{4n^2 + n}{n^2} = 4$. Kesimpulan yang tepat adalah ...',
      opsi: [
        { id: 'A', teks: '$4n^2 + n = o(n^2)$' },
        { id: 'B', teks: '$4n^2 + n = \\omega(n^2)$' },
        { id: 'C', teks: '$4n^2 + n = \\Theta(n^2)$' },
        { id: 'D', teks: 'Tidak dapat disimpulkan' },
      ],
      kunci: 'C',
      pembahasan: '**Jawaban: C.** Limit berhingga dan positif ($0 < 4 < \\infty$) berarti kedua fungsi tumbuh sama cepat.',
    },
    {
      no: 7,
      tipe: 'analisis',
      mandiri: true,
      teks: 'Urutkan fungsi berikut dari yang paling lambat tumbuh: $n^2$, $\\lg n$, $2^n$, $n \\lg n$, $\\sqrt{n}$. Berikan satu alasan limit untuk pasangan $\\lg n$ dan $\\sqrt{n}$.',
      kunciTeks: 'Urutan: lg n ≺ √n ≺ n lg n ≺ n² ≺ 2ⁿ. Untuk lg n dan √n: lim (lg n)/n^(1/2) = lim (1/(n ln 2)) / (½ n^(−1/2)) = lim 2/(ln 2 · √n) = 0, jadi lg n = o(√n). (√n ≺ n lg n karena √n/(n lg n) = 1/(√n lg n) → 0.)',
      pembahasan:
        'Urutan: $\\lg n \\prec \\sqrt{n} \\prec n \\lg n \\prec n^2 \\prec 2^n$. Untuk $\\lg n$ dan $\\sqrt{n}$: $\\lim \\dfrac{\\lg n}{n^{1/2}} = \\lim \\dfrac{1/(n \\ln 2)}{\\frac{1}{2} n^{-1/2}} = \\lim \\dfrac{2}{\\ln 2 \\cdot \\sqrt{n}} = 0$, jadi $\\lg n = o(\\sqrt{n})$. ($\\sqrt{n} \\prec n \\lg n$ karena $\\dfrac{\\sqrt{n}}{n \\lg n} = \\dfrac{1}{\\sqrt{n} \\lg n} \\to 0$.)',
    },
  ],
}

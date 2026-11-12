// Kuis Pemahaman Modul 05 (7 soal pilihan ganda), bersumber dari soal PDF "05 - Pertumbuhan Fungsi Running Time" halaman 8–9.
// Teks memakai Markdown dengan rumus TeX ($...$). `kunci` berupa satu id (satu jawaban) atau larik id (banyak jawaban, dinilai utuh).
export const kuis05 = {
  judul: 'Pertumbuhan Fungsi',
  modul: '05',
  soal: [
    {
      no: 1,
      teks: 'Rasio pertumbuhan dari $n = 8$ menjadi $n = 64$. Pilih **tiga** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: '$\\lg n$ tumbuh 2 kali lipat.' },
        { id: 'B', teks: '$n \\lg n$ tumbuh 16 kali lipat.' },
        { id: 'C', teks: '$n^2$ tumbuh 64 kali lipat.' },
        { id: 'D', teks: '$n^2$ tumbuh 8 kali lipat.' },
        { id: 'E', teks: '$\\lg n$ tumbuh 8 kali lipat.' },
      ],
      kunci: ['A', 'B', 'C'],
      pembahasan: '**Jawaban: A, B, dan C.** Perhatikan $64 = 8^2$ dan $\\lg 8 = 3$, $\\lg 64 = 6$.\n\n(a) $\\dfrac{\\lg 64}{\\lg 8} = \\dfrac{6}{3} = 2$. (b) $\\dfrac{64 \\cdot 6}{8 \\cdot 3} = \\dfrac{384}{24} = 16$. (c) $\\dfrac{64^2}{8^2} = 8^2 = 64$. Karena itu D dan E salah.',
    },
    {
      no: 2,
      teks: 'Urutan yang benar dari fungsi yang paling lambat tumbuh ke paling cepat tumbuh adalah ...',
      opsi: [
        { id: 'A', teks: '$n$, $\\lg n$, $n \\lg n$, $2^n$, $n^2$' },
        { id: 'B', teks: '$\\lg n$, $n \\lg n$, $n$, $n^2$, $n!$' },
        { id: 'C', teks: '$\\lg n$, $n$, $n \\lg n$, $n^2$, $2^n$' },
        { id: 'D', teks: '$1$, $n$, $\\lg n$, $n^3$, $2^n$' },
      ],
      kunci: 'C',
      pembahasan: '**Jawaban: C.** $\\lg n \\prec n \\prec n \\lg n \\prec n^2 \\prec 2^n$. Pilihan A keliru menempatkan $2^n$ sebelum $n^2$; B keliru menempatkan $n \\lg n$ sebelum $n$; D keliru menempatkan $\\lg n$ setelah $n$.',
    },
    {
      no: 3,
      teks: 'Algoritma P berjalan dalam $1000n$ langkah dan algoritma Q dalam $n^2$ langkah. Pernyataan manakah yang benar?',
      opsi: [
        { id: 'A', teks: 'P selalu lebih lambat daripada Q karena koefisiennya jauh lebih besar.' },
        { id: 'B', teks: 'Q lebih cepat untuk $n < 1000$, tetapi untuk $n > 1000$ P selalu menang dan selisihnya terus membesar.' },
        { id: 'C', teks: 'P dan Q selalu sama cepat karena keduanya polinomial.' },
        { id: 'D', teks: 'P lebih cepat untuk semua $n$, termasuk $n$ kecil.' },
      ],
      kunci: 'B',
      pembahasan: '**Jawaban: B.** $1000n < n^2$ untuk $n > 1000$. Untuk data kecil ($n < 1000$) algoritma kuadrat memang lebih cepat, tetapi untuk $n > 1000$ algoritma linier selalu menang, dan selisihnya terus membesar. Untuk $n = 10^6$: $10^9$ langkah vs $10^{12}$ langkah.',
    },
    {
      no: 4,
      teks: 'Sebuah algoritma kubik ($cn^3$) memproses 100 data dalam 2 detik. Berapa perkiraan waktunya untuk 400 data?',
      opsi: [
        { id: 'A', teks: '8 detik' },
        { id: 'B', teks: '32 detik' },
        { id: 'C', teks: '512 detik' },
        { id: 'D', teks: '128 detik' },
      ],
      kunci: 'D',
      pembahasan: '**Jawaban: D.** Rasio $= \\dfrac{400^3}{100^3} = 4^3 = 64$. Perkiraan waktu $= 2 \\times 64 = $ **128 detik**. A mengira linier ($2 \\times 4$), B mengira kuadrat ($2 \\times 16$), C mengira pangkat empat ($2 \\times 256$).',
    },
    {
      no: 5,
      teks: 'Algoritma A ($c_4 n \\lg n$) dan algoritma B ($c_5 n^2$) sama-sama membutuhkan $T$ detik untuk $n = 16$. Untuk $n = 256$, pilih **tiga** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: 'Waktu A menjadi $16\\,T$.' },
        { id: 'B', teks: 'Waktu A menjadi $32\\,T$.' },
        { id: 'C', teks: 'Waktu B menjadi $256\\,T$.' },
        { id: 'D', teks: 'Agar setara dengan A, prosesor B harus 8 kali lebih cepat.' },
        { id: 'E', teks: 'Agar setara dengan A, prosesor B harus 32 kali lebih cepat.' },
      ],
      kunci: ['B', 'C', 'D'],
      pembahasan: '**Jawaban: B, C, dan D.** $\\text{Rasio}_A = \\dfrac{256 \\lg 256}{16 \\lg 16} = \\dfrac{256 \\cdot 8}{16 \\cdot 4} = 32$, sehingga A butuh $32\\,T$. $\\text{Rasio}_B = \\dfrac{256^2}{16^2} = 16^2 = 256$, sehingga B butuh $256\\,T$. Prosesor B harus $\\dfrac{256}{32} = 8$ **kali** lebih cepat.',
    },
    {
      no: 6,
      teks: 'Mengapa basis logaritma tidak diperhatikan ketika membicarakan orde pertumbuhan?',
      opsi: [
        { id: 'A', teks: 'Karena semua logaritma bernilai sama.' },
        { id: 'B', teks: 'Karena komputer selalu memakai basis 10.' },
        { id: 'C', teks: 'Karena fungsi logaritma tidak pernah muncul dalam analisis algoritma.' },
        { id: 'D', teks: 'Karena logaritma dengan basis berbeda hanya berselisih faktor konstan.' },
      ],
      kunci: 'D',
      pembahasan: '**Jawaban: D.** $\\log_a n = \\dfrac{\\log_b n}{\\log_b a}$, dan $\\log_b a$ adalah konstanta. Faktor konstan tidak mengubah orde pertumbuhan.',
    },
    {
      no: 7,
      teks: 'Sebuah algoritma brute force berjalan dalam $2^n$ langkah. Komputer baru 1.024 kali lebih cepat. Di komputer lama, dalam satu jam dapat diselesaikan masalah berukuran $n_0$. Pilih **dua** pernyataan yang benar tentang komputer baru.',
      opsi: [
        { id: 'A', teks: 'Ukuran masalah yang dapat diselesaikan menjadi $n_0 + 10$.' },
        { id: 'B', teks: 'Ukuran masalah yang dapat diselesaikan menjadi $1024\\,n_0$.' },
        { id: 'C', teks: 'Dalam satu jam dapat dijalankan $2^{n_0 + 10}$ langkah.' },
        { id: 'D', teks: 'Ukuran masalah yang dapat diselesaikan menjadi $n_0 + 1024$.' },
        { id: 'E', teks: 'Ukuran masalah yang dapat diselesaikan menjadi $n_0 + 32$.' },
      ],
      kunci: ['A', 'C'],
      pembahasan: '**Jawaban: A dan C.** Di komputer baru dapat dijalankan $1024 \\cdot 2^{n_0} = 2^{10} \\cdot 2^{n_0} = 2^{n_0 + 10}$ langkah. Jadi ukuran masalah hanya naik menjadi $n_0 + 10$. Komputer seribu kali lebih cepat hanya menambah 10 pada ukuran masalah: inilah sebabnya algoritma eksponensial tidak dapat "ditolong" dengan perangkat keras.',
    },
  ],
}

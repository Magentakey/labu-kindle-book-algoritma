// Kuis Pemahaman Modul 05 (7 soal) dan kunci serta pembahasannya, dari PDF "05 - Pertumbuhan Fungsi Running Time" halaman 8–9.
// Teks memakai Markdown dengan rumus TeX ($...$). Soal bertanda `mandiri` dijawab dengan tulisan lalu dibandingkan dengan kunci.
// Soal berhitung (1, 4, 5, 7) dijadikan isian angka supaya dinilai otomatis.
export const kuis05 = {
  judul: 'Pertumbuhan Fungsi',
  modul: '05',
  soal: [
    {
      no: 1,
      tipe: 'perhitungan',
      teks: 'Hitung rasio pertumbuhan dari $n = 8$ menjadi $n = 64$ untuk (a) $\\lg n$, (b) $n \\lg n$, (c) $n^2$.',
      isian: [
        { label: '(a) lg n', jenis: 'angka', kunci: 2 },
        { label: '(b) n lg n', jenis: 'angka', kunci: 16 },
        { label: '(c) n²', jenis: 'angka', kunci: 64 },
      ],
      pembahasan: 'Perhatikan $64 = 8^2$ dan $\\lg 8 = 3$, $\\lg 64 = 6$.\n\n(a) $\\dfrac{\\lg 64}{\\lg 8} = \\dfrac{6}{3} = 2$. (b) $\\dfrac{64 \\cdot 6}{8 \\cdot 3} = \\dfrac{384}{24} = 16$. (c) $\\dfrac{64^2}{8^2} = 8^2 = 64$.',
    },
    {
      no: 2,
      tipe: 'pilihan',
      teks: 'Urutan yang benar dari fungsi yang paling lambat tumbuh ke paling cepat tumbuh adalah ...',
      opsi: [
        { id: 'A', teks: '$n$, $\\lg n$, $n \\lg n$, $2^n$, $n^2$' },
        { id: 'B', teks: '$\\lg n$, $n$, $n \\lg n$, $n^2$, $2^n$' },
        { id: 'C', teks: '$\\lg n$, $n \\lg n$, $n$, $n^2$, $n!$' },
        { id: 'D', teks: '$1$, $n$, $\\lg n$, $n^3$, $2^n$' },
      ],
      kunci: 'B',
      pembahasan: '**Jawaban: B.** $\\lg n \\prec n \\prec n \\lg n \\prec n^2 \\prec 2^n$. Pilihan A keliru menempatkan $2^n$ sebelum $n^2$; C keliru menempatkan $n \\lg n$ sebelum $n$; D keliru menempatkan $\\lg n$ setelah $n$.',
    },
    {
      no: 3,
      tipe: 'benarsalah',
      mandiri: true,
      teks: '"Algoritma dengan running time $1000n$ selalu lebih lambat daripada algoritma dengan running time $n^2$, karena koefisiennya jauh lebih besar." Benar atau salah?',
      kunciTeks: 'Salah. 1000n < n² untuk n > 1000. Untuk data kecil (n < 1000) algoritma kuadrat memang lebih cepat, tetapi untuk n > 1000 algoritma linier selalu menang, dan selisihnya terus membesar. Untuk n = 10⁶: 10⁹ langkah vs 10¹² langkah.',
      pembahasan: '**Salah.** $1000n < n^2$ untuk $n > 1000$. Untuk data kecil ($n < 1000$) algoritma kuadrat memang lebih cepat, tetapi untuk $n > 1000$ algoritma linier selalu menang, dan selisihnya terus membesar. Untuk $n = 10^6$: $10^9$ langkah vs $10^{12}$ langkah.',
    },
    {
      no: 4,
      tipe: 'perhitungan',
      teks: 'Sebuah algoritma kubik ($cn^3$) memproses 100 data dalam 2 detik. Berapa perkiraan waktunya untuk 400 data?',
      isian: [{ label: 'Waktu (detik)', jenis: 'angka', kunci: 128 }],
      pembahasan: 'Rasio $= \\dfrac{400^3}{100^3} = 4^3 = 64$. Perkiraan waktu $= 2 \\times 64 = $ **128 detik**.',
    },
    {
      no: 5,
      tipe: 'analisis',
      teks: 'Algoritma A ($c_4 n \\lg n$) dan algoritma B ($c_5 n^2$) sama-sama membutuhkan $T$ detik untuk $n = 16$. Untuk $n = 256$: (a) hitung waktu A dan B; (b) berapa kali lebih cepat prosesor yang dibutuhkan B agar setara dengan A?',
      isian: [
        { label: '(a) Waktu A (kali T)', jenis: 'angka', kunci: 32 },
        { label: '(a) Waktu B (kali T)', jenis: 'angka', kunci: 256 },
        { label: '(b) Prosesor B harus lebih cepat (kali)', jenis: 'angka', kunci: 8 },
      ],
      pembahasan: '(a) $\\text{Rasio}_A = \\dfrac{256 \\lg 256}{16 \\lg 16} = \\dfrac{256 \\cdot 8}{16 \\cdot 4} = 32$, sehingga A butuh $32\\,T$ detik. $\\text{Rasio}_B = \\dfrac{256^2}{16^2} = 16^2 = 256$, sehingga B butuh $256\\,T$ detik. (b) Prosesor B harus $\\dfrac{256}{32} = $ **8 kali** lebih cepat.',
    },
    {
      no: 6,
      tipe: 'pilihan',
      teks: 'Mengapa basis logaritma tidak diperhatikan ketika membicarakan orde pertumbuhan?',
      opsi: [
        { id: 'A', teks: 'Karena semua logaritma bernilai sama.' },
        { id: 'B', teks: 'Karena logaritma dengan basis berbeda hanya berselisih faktor konstan.' },
        { id: 'C', teks: 'Karena komputer selalu memakai basis 10.' },
        { id: 'D', teks: 'Karena fungsi logaritma tidak pernah muncul dalam analisis algoritma.' },
      ],
      kunci: 'B',
      pembahasan: '**Jawaban: B.** $\\log_a n = \\dfrac{\\log_b n}{\\log_b a}$, dan $\\log_b a$ adalah konstanta. Faktor konstan tidak mengubah orde pertumbuhan.',
    },
    {
      no: 7,
      tipe: 'analisis',
      teks: 'Sebuah algoritma brute force berjalan dalam $2^n$ langkah. Komputer baru 1.024 kali lebih cepat. Jika di komputer lama dalam satu jam kita dapat menyelesaikan masalah berukuran $n_0$, berapa ukuran masalah yang dapat diselesaikan di komputer baru dalam satu jam?',
      isian: [{ label: 'Ukuran baru = n₀ + ...', jenis: 'angka', kunci: 10 }],
      pembahasan: 'Di komputer baru, dalam satu jam dapat dijalankan $1024 \\cdot 2^{n_0} = 2^{10} \\cdot 2^{n_0} = 2^{n_0 + 10}$ langkah. Jadi ukuran masalah hanya naik menjadi $n_0 + 10$. Komputer seribu kali lebih cepat hanya menambah 10 pada ukuran masalah: inilah sebabnya algoritma eksponensial tidak dapat "ditolong" dengan perangkat keras.',
    },
  ],
}

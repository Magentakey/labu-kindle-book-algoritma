// Kuis Pemahaman Modul 03 (7 soal) dan kunci serta pembahasannya, dari PDF "03 - Konsep Running Time" halaman 8–10.
// Teks memakai Markdown dengan rumus TeX ($...$). Soal bertanda `mandiri` dijawab dengan tulisan lalu dibandingkan dengan kunci.
// Soal 6 (a)–(c) dijadikan tiga isian supaya dinilai otomatis.
export const kuis03 = {
  judul: 'Konsep Running Time',
  modul: '03',
  soal: [
    {
      no: 1,
      tipe: 'pilihan',
      teks: 'Mengapa running time dinyatakan dengan konstanta $c_i$ dan bukan dalam detik?',
      opsi: [
        { id: 'A', teks: 'Karena konstanta lebih mudah dihitung daripada detik.' },
        { id: 'B', teks: 'Agar analisis menggambarkan sifat algoritma dan tidak bergantung pada mesin, bahasa, atau kompiler.' },
        { id: 'C', teks: 'Karena semua baris pseudocode membutuhkan waktu yang persis sama.' },
        { id: 'D', teks: 'Karena komputer tidak dapat mengukur waktu secara akurat.' },
      ],
      kunci: 'B',
      pembahasan: '**Jawaban: B.** Nilai $c_i$ mewakili biaya yang bergantung pada mesin. Dengan menjaganya sebagai simbol, kita fokus pada berapa kali setiap baris dijalankan, yang merupakan sifat algoritma. Pilihan C keliru: baris yang berbeda boleh memiliki cost berbeda.',
    },
    {
      no: 2,
      tipe: 'perhitungan',
      mandiri: true,
      teks: 'Sebuah perulangan ditulis `for j = 3 to n` dengan $n \\ge 3$ dan berakhir normal. Berapa kali kepala perulangan dijalankan, dan berapa kali isinya dijalankan?',
      kunciTeks: 'Isi perulangan dijalankan untuk j = 3, 4, ..., n, yaitu n − 2 kali. Kepala perulangan dijalankan satu kali lebih banyak, yaitu n − 1 kali (termasuk pemeriksaan j = n + 1 yang menghentikan perulangan).',
      pembahasan: 'Isi perulangan dijalankan untuk $j = 3, 4, \\dots, n$, yaitu $n - 2$ **kali**. Kepala perulangan dijalankan satu kali lebih banyak, yaitu $n - 1$ **kali** (termasuk pemeriksaan $j = n + 1$ yang menghentikan perulangan).',
    },
    {
      no: 3,
      tipe: 'perhitungan',
      mandiri: true,
      teks: 'Tentukan jumlah operasi setiap baris dan running time $T(n)$ algoritma berikut, lalu sederhanakan menjadi bentuk umum.\n\n```pseudo\nRATA_RATA(A)\n1 total = 0\n2 for i = 1 to n\n3     total = total + A[i]\n4 rata = total / n\n5 return rata\n```',
      kunciTeks: 'Jumlah operasi: baris 1 → 1, baris 2 → n + 1, baris 3 → n, baris 4 → 1, baris 5 → 1. T(n) = c1 + c2(n + 1) + c3 n + c4 + c5 = (c2 + c3)n + (c1 + c2 + c4 + c5) = an + b, fungsi linier.',
      pembahasan: 'Jumlah operasi: baris 1 → 1, baris 2 → $n + 1$, baris 3 → $n$, baris 4 → 1, baris 5 → 1.\n\n$T(n) = c_1 + c_2(n + 1) + c_3 n + c_4 + c_5 = (c_2 + c_3)n + (c_1 + c_2 + c_4 + c_5) = an + b$, fungsi **linier**.',
    },
    {
      no: 4,
      tipe: 'benarsalah',
      mandiri: true,
      teks: '"Kasus terbaik `CARI_BIL_K` terjadi ketika array berukuran kecil." Benar atau salah?',
      kunciTeks: 'Salah. Kasus terbaik dan terburuk dibandingkan untuk ukuran masukan n yang sama. Kasus terbaik CARI_BIL_K adalah ketika k berada di A[1], sehingga algoritma selesai setelah satu perbandingan, berapa pun besarnya n.',
      pembahasan: '**Salah.** Kasus terbaik dan terburuk dibandingkan untuk ukuran masukan $n$ yang **sama**. Kasus terbaik `CARI_BIL_K` adalah ketika $k$ berada di $A[1]$, sehingga algoritma selesai setelah satu perbandingan, berapa pun besarnya $n$.',
    },
    {
      no: 5,
      tipe: 'perhitungan',
      mandiri: true,
      teks: 'Berapa kali baris `x = x + 1` dijalankan oleh potongan berikut sebagai fungsi $n$? Apa orde pertumbuhannya?\n\n```pseudo\nPotongan algoritma\nfor i = 1 to n\n    for j = 1 to i\n        x = x + 1\n```',
      kunciTeks: 'Untuk i tertentu, baris itu dijalankan i kali. Totalnya 1 + 2 + ... + n = n(n + 1)/2 kali. Karena suku dominannya n²/2, orde pertumbuhannya kuadrat.',
      pembahasan: 'Untuk $i$ tertentu, baris itu dijalankan $i$ kali. Totalnya $1 + 2 + \\cdots + n = \\frac{n(n+1)}{2}$ kali. Karena suku dominannya $\\frac{n^2}{2}$, orde pertumbuhannya **kuadrat**.',
    },
    {
      no: 6,
      tipe: 'analisis',
      teks: 'Algoritma P memiliki running time $T_P(n) = 50n + 1000$ dan algoritma Q memiliki $T_Q(n) = 2n^2$ (satuan langkah). (a) Untuk $n = 10$, mana yang lebih cepat? (b) Untuk $n = 100$? (c) Mulai nilai $n$ berapa P selalu lebih cepat?',
      isian: [
        { label: '(a) n = 10, lebih cepat', jenis: 'pilih', opsi: ['P', 'Q'], kunci: 'Q' },
        { label: '(b) n = 100, lebih cepat', jenis: 'pilih', opsi: ['P', 'Q'], kunci: 'P' },
        { label: '(c) P selalu lebih cepat mulai n =', jenis: 'angka', kunci: 39 },
      ],
      pembahasan: '(a) $n = 10$: $T_P = 1500$, $T_Q = 200$, **Q lebih cepat**. (b) $n = 100$: $T_P = 6000$, $T_Q = 20000$, **P lebih cepat**. (c) P lebih cepat bila $50n + 1000 < 2n^2$, yaitu $n^2 - 25n - 500 > 0$. Akar positifnya $n = \\frac{25 + \\sqrt{625 + 2000}}{2} \\approx 38{,}1$. Jadi untuk $n \\ge 39$ P selalu lebih cepat. (Cek: $n = 38$ memberi 2900 vs 2888, Q masih sedikit lebih cepat; $n = 39$ memberi 2950 vs 3042, P lebih cepat.) Ini menggambarkan bahwa untuk $n$ besar, orde pertumbuhan lebih menentukan daripada konstanta.',
    },
    {
      no: 7,
      tipe: 'pilihan',
      teks: 'Alasan yang **bukan** merupakan alasan utama analisis berfokus pada kasus terburuk adalah ...',
      opsi: [
        { id: 'A', teks: 'Kasus terburuk memberikan batas atas yang dijamin untuk semua masukan.' },
        { id: 'B', teks: 'Kasus terburuk sering terjadi dalam praktik.' },
        { id: 'C', teks: 'Kasus terburuk selalu jauh lebih mudah dihitung daripada kasus terbaik.' },
        { id: 'D', teks: 'Kasus rata-rata sering memiliki orde yang sama dengan kasus terburuk.' },
      ],
      kunci: 'C',
      pembahasan: '**Jawaban: C.** Kasus terburuk tidak selalu lebih mudah dihitung. Alasan sebenarnya adalah A, B, dan D, sebagaimana dijelaskan Cormen dkk. (2009).',
    },
  ],
}

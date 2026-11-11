// Kuis Pemahaman Modul 03 (7 soal pilihan ganda), bersumber dari soal PDF "03 - Konsep Running Time" halaman 8–10.
// Teks memakai Markdown dengan rumus TeX ($...$). `kunci` berupa satu id (satu jawaban) atau larik id (banyak jawaban, dinilai utuh).
export const kuis03 = {
  judul: 'Konsep Running Time',
  modul: '03',
  soal: [
    {
      no: 1,
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
      teks: 'Sebuah perulangan ditulis `for j = 3 to n` dengan $n \\ge 3$ dan berakhir normal. Pilih **dua** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: 'Isi perulangan dijalankan $n - 2$ kali.' },
        { id: 'B', teks: 'Isi perulangan dijalankan $n - 1$ kali.' },
        { id: 'C', teks: 'Kepala perulangan dijalankan $n - 1$ kali.' },
        { id: 'D', teks: 'Kepala perulangan dijalankan $n$ kali.' },
        { id: 'E', teks: 'Kepala perulangan dijalankan $n - 2$ kali.' },
      ],
      kunci: ['A', 'C'],
      pembahasan: '**Jawaban: A dan C.** Isi perulangan dijalankan untuk $j = 3, 4, \\dots, n$, yaitu $n - 2$ **kali**. Kepala perulangan dijalankan satu kali lebih banyak, yaitu $n - 1$ **kali** (termasuk pemeriksaan $j = n + 1$ yang menghentikan perulangan).',
    },
    {
      no: 3,
      teks: 'Perhatikan algoritma berikut. Berapa kali baris 1 sampai 5 dijalankan (berurutan)?\n\n```pseudo\nRATA_RATA(A)\n1 total = 0\n2 for i = 1 to n\n3     total = total + A[i]\n4 rata = total / n\n5 return rata\n```',
      opsi: [
        { id: 'A', teks: '$1, n, n, 1, 1$' },
        { id: 'B', teks: '$1, n + 1, n + 1, 1, 1$' },
        { id: 'C', teks: '$1, n + 1, n, 1, 1$' },
        { id: 'D', teks: '$1, n, n + 1, 1, 1$' },
      ],
      kunci: 'C',
      pembahasan: '**Jawaban: C.** Jumlah operasi: baris 1 → 1, baris 2 → $n + 1$, baris 3 → $n$, baris 4 → 1, baris 5 → 1.\n\n$T(n) = c_1 + c_2(n + 1) + c_3 n + c_4 + c_5 = (c_2 + c_3)n + (c_1 + c_2 + c_4 + c_5) = an + b$, fungsi **linier**.',
    },
    {
      no: 4,
      teks: 'Manakah pernyataan yang benar tentang kasus terbaik `CARI_BIL_K`?',
      opsi: [
        { id: 'A', teks: 'Terjadi ketika $k$ tidak ada di dalam array.' },
        { id: 'B', teks: 'Terjadi ketika array berukuran kecil.' },
        { id: 'C', teks: 'Tidak ada kasus terbaik, hanya kasus terburuk.' },
        { id: 'D', teks: 'Terjadi ketika $k$ berada di $A[1]$, sehingga selesai setelah satu perbandingan, berapa pun besarnya $n$.' },
      ],
      kunci: 'D',
      pembahasan: '**Jawaban: D.** Kasus terbaik dan terburuk dibandingkan untuk ukuran masukan $n$ yang **sama**. Kasus terbaik `CARI_BIL_K` adalah ketika $k$ berada di $A[1]$, sehingga algoritma selesai setelah satu perbandingan, berapa pun besarnya $n$. Kasus $k$ tidak ada justru kasus terburuk.',
    },
    {
      no: 5,
      teks: 'Perhatikan potongan berikut. Pilih **dua** pernyataan yang benar.\n\n```pseudo\nPotongan algoritma\nfor i = 1 to n\n    for j = 1 to i\n        x = x + 1\n```',
      opsi: [
        { id: 'A', teks: 'Baris `x = x + 1` dijalankan $n^2$ kali.' },
        { id: 'B', teks: 'Baris `x = x + 1` dijalankan $\\frac{n(n+1)}{2}$ kali.' },
        { id: 'C', teks: 'Orde pertumbuhannya linier.' },
        { id: 'D', teks: 'Orde pertumbuhannya kuadrat.' },
        { id: 'E', teks: 'Baris `x = x + 1` dijalankan $n$ kali.' },
      ],
      kunci: ['B', 'D'],
      pembahasan: '**Jawaban: B dan D.** Untuk $i$ tertentu, baris itu dijalankan $i$ kali. Totalnya $1 + 2 + \\cdots + n = \\frac{n(n+1)}{2}$ kali. Karena suku dominannya $\\frac{n^2}{2}$, orde pertumbuhannya **kuadrat**. Banyaknya eksekusi bukan $n^2$ (A) maupun $n$ (E).',
    },
    {
      no: 6,
      teks: 'Algoritma P memiliki running time $T_P(n) = 50n + 1000$ dan algoritma Q memiliki $T_Q(n) = 2n^2$ (satuan langkah). Pilih **tiga** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: 'Untuk $n = 10$, P lebih cepat daripada Q.' },
        { id: 'B', teks: 'Untuk $n = 10$, Q lebih cepat daripada P.' },
        { id: 'C', teks: 'Untuk $n = 100$, P lebih cepat daripada Q.' },
        { id: 'D', teks: 'P selalu lebih cepat daripada Q mulai $n = 39$.' },
        { id: 'E', teks: 'P selalu lebih cepat daripada Q mulai $n = 38$.' },
      ],
      kunci: ['B', 'C', 'D'],
      pembahasan: '**Jawaban: B, C, dan D.** $n = 10$: $T_P = 1500$, $T_Q = 200$, **Q lebih cepat**. $n = 100$: $T_P = 6000$, $T_Q = 20000$, **P lebih cepat**. P lebih cepat bila $50n + 1000 < 2n^2$, yaitu $n^2 - 25n - 500 > 0$. Akar positifnya $n = \\frac{25 + \\sqrt{625 + 2000}}{2} \\approx 38{,}1$. Jadi untuk $n \\ge 39$ P selalu lebih cepat. (Cek: $n = 38$ memberi 2900 vs 2888, Q masih sedikit lebih cepat; $n = 39$ memberi 2950 vs 3042, P lebih cepat.) Ini menggambarkan bahwa untuk $n$ besar, orde pertumbuhan lebih menentukan daripada konstanta.',
    },
    {
      no: 7,
      teks: 'Alasan yang **bukan** merupakan alasan utama analisis berfokus pada kasus terburuk adalah ...',
      opsi: [
        { id: 'A', teks: 'Kasus terburuk selalu jauh lebih mudah dihitung daripada kasus terbaik.' },
        { id: 'B', teks: 'Kasus terburuk memberikan batas atas yang dijamin untuk semua masukan.' },
        { id: 'C', teks: 'Kasus terburuk sering terjadi dalam praktik.' },
        { id: 'D', teks: 'Kasus rata-rata sering memiliki orde yang sama dengan kasus terburuk.' },
      ],
      kunci: 'A',
      pembahasan: '**Jawaban: A.** Kasus terburuk tidak selalu lebih mudah dihitung. Alasan sebenarnya adalah B, C, dan D, sebagaimana dijelaskan Cormen dkk. (2009).',
    },
  ],
}

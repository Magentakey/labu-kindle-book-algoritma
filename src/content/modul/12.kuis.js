// Kuis Pemahaman Modul 12 (8 soal) dan kunci serta pembahasannya, dari PDF "12 - Longest Common Subsequence" halaman 9–11.
// Teks memakai Markdown dengan rumus TeX ($...$). Soal 5 (alasan PRINT-LCS memanggil dirinya sebelum mencetak) dijawab dengan tulisan lalu
// dibandingkan dengan kunci; soal lain dinilai otomatis. Soal 4 (benar/salah dengan alasan) dinilai pada pilihan Benar/Salah; alasannya ada di pembahasan.
export const kuis12 = {
  judul: 'Longest Common Subsequence',
  modul: '12',
  soal: [
    {
      no: 1,
      tipe: 'pilihan',
      teks: 'Manakah yang merupakan subbarisan dari $X = \\langle K, O, M, P, U, T, E, R \\rangle$?',
      opsi: [
        { id: 'A', teks: '$\\langle K, P, O, T \\rangle$' },
        { id: 'B', teks: '$\\langle O, P, T, R \\rangle$' },
        { id: 'C', teks: '$\\langle M, O, U, R \\rangle$' },
        { id: 'D', teks: '$\\langle T, U, E, R \\rangle$' },
      ],
      kunci: 'B',
      pembahasan: '**Jawaban: B.** O (ke-2), P (ke-4), T (ke-6), R (ke-8) muncul dengan urutan yang sama. A salah karena P muncul setelah O di $X$, bukan sebelumnya. C salah karena O muncul sebelum M. D salah karena U muncul sebelum T.',
    },
    {
      no: 2,
      tipe: 'perhitungan',
      teks: 'Isi tabel $c$ lengkap untuk $X = \\langle A, B, C, D, E \\rangle$ dan $Y = \\langle A, C, E \\rangle$. Berapa panjang LCS dan apa LCS-nya?',
      isian: [
        { label: 'c[3,2]', jenis: 'angka', kunci: 2 },
        { label: 'Panjang LCS', jenis: 'angka', kunci: 3 },
        { label: 'LCS-nya', jenis: 'pilih', opsi: ['ACE', 'ABC', 'ADE', 'CE'], kunci: 'ACE' },
      ],
      pembahasan:
        '| | 0 | A | C | E |\n| --- | --- | --- | --- | --- |\n| 0 | 0 | 0 | 0 | 0 |\n| 1 A | 0 | 1 ↖ | 1 ← | 1 ← |\n| 2 B | 0 | 1 ↑ | 1 ↑ | 1 ↑ |\n| 3 C | 0 | 1 ↑ | 2 ↖ | 2 ← |\n| 4 D | 0 | 1 ↑ | 2 ↑ | 2 ↑ |\n| 5 E | 0 | 1 ↑ | 2 ↑ | 3 ↖ |\n\nPanjang LCS $= c[5,3] = 3$, dan LCS-nya $\\langle A, C, E \\rangle$ (seluruh $Y$ adalah subbarisan dari $X$).',
    },
    {
      no: 3,
      tipe: 'perhitungan',
      teks: 'Pada tabel contoh di modul ini, hitung $c[5,2]$ dan $b[5,2]$ menggunakan rumus rekursif, dengan menunjukkan sel-sel yang dipakai.',
      isian: [
        { label: 'c[5,2]', jenis: 'angka', kunci: 2 },
        { label: 'b[5,2]', jenis: 'pilih', opsi: ['↖', '↑', '←'], kunci: '↖' },
      ],
      pembahasan: '$x_5 = D = y_2$, sehingga $c[5,2] = c[4,1] + 1 = 1 + 1 = 2$ dan $b[5,2] = $ ↖. Sel yang dipakai hanya sel diagonal $c[4,1]$.',
    },
    {
      no: 4,
      tipe: 'benarsalah',
      teks: '"Karena LCS-LENGTH memakai Dynamic Programming, LCS yang dihasilkannya selalu tunggal." Benar atau salah? Pikirkan alasannya.',
      opsi: [
        { id: 'Benar', teks: 'Benar' },
        { id: 'Salah', teks: 'Salah' },
      ],
      kunci: 'Salah',
      pembahasan: '**Salah.** Bisa ada beberapa LCS dengan panjang yang sama, misalnya BCBA dan BDAB pada contoh modul ini. LCS-LENGTH menjamin panjang yang maksimum; aturan pemilihan ketika nilai sama (↑ atau ←) menentukan LCS mana yang dicetak.',
    },
    {
      no: 5,
      tipe: 'analisis',
      mandiri: true,
      teks: 'Mengapa PRINT-LCS memanggil dirinya sendiri **sebelum** perintah `print x[i]`, bukan sesudahnya? Apa yang terjadi jika urutannya dibalik?',
      kunciTeks:
        'PRINT-LCS menelusuri dari belakang (i = m) ke depan. Dengan memanggil rekursi lebih dulu, pencetakan ditunda sampai semua elemen yang lebih awal sudah dicetak, sehingga LCS tercetak dalam urutan yang benar (dari depan ke belakang). Jika urutannya dibalik, LCS tercetak terbalik, yaitu "ABCB" untuk contoh di modul ini.',
      pembahasan:
        'PRINT-LCS menelusuri dari belakang ($i = m$) ke depan. Dengan memanggil rekursi lebih dulu, pencetakan ditunda sampai semua elemen yang lebih awal sudah dicetak, sehingga LCS tercetak dalam urutan yang benar (dari depan ke belakang). Jika urutannya dibalik, LCS tercetak terbalik, yaitu "ABCB" untuk contoh di modul ini.',
    },
    {
      no: 6,
      tipe: 'perhitungan',
      teks: 'Tentukan panjang LCS dari $X$ = "KASUR" dan $Y$ = "RUSAK". Jelaskan mengapa hasilnya kecil walaupun kedua kata memakai huruf yang sama.',
      isian: [{ label: 'Panjang LCS', jenis: 'angka', kunci: 1 }],
      pembahasan:
        'Panjang LCS $=$ **1** (misalnya "K" saja). Walaupun hurufnya sama, urutannya terbalik: "RUSAK" adalah kebalikan "KASUR". Subbarisan persekutuan harus mempertahankan urutan, dan tidak ada dua huruf berbeda yang urutannya sama di kedua kata.',
    },
    {
      no: 7,
      tipe: 'perhitungan',
      teks: 'Dua untaian DNA masing-masing sepanjang 1.000 dan 2.000 basa. Berapa banyak sel tabel $c$ yang diisi LCS-LENGTH? Bandingkan dengan banyaknya subbarisan untaian pertama yang harus diperiksa secara brute force.',
      isian: [
        { label: 'Banyak sel yang dihitung', jenis: 'angka', kunci: 2000000 },
        { label: 'Eksponen k pada 2^1000 ≈ 10^k (dibulatkan ke bilangan bulat)', jenis: 'angka', kunci: 301 },
      ],
      pembahasan:
        'Banyaknya sel yang dihitung $1.000 \\times 2.000 = 2.000.000$ (tabel lengkap berukuran $1.001 \\times 2.001$ termasuk baris dan kolom 0). Brute force harus memeriksa $2^{1000} \\approx 10^{301}$ subbarisan dari untaian pertama, angka yang mustahil dikerjakan.',
    },
    {
      no: 8,
      tipe: 'pilihan',
      teks: 'Tanda "↑" pada $b[i,j]$ berarti ...',
      opsi: [
        { id: 'A', teks: '$x_i = y_j$ dan $x_i$ termasuk LCS.' },
        { id: 'B', teks: '$x_i \\ne y_j$ dan nilai $c[i,j]$ diambil dari $c[i-1,j]$; elemen $x_i$ tidak dipakai.' },
        { id: 'C', teks: '$x_i \\ne y_j$ dan nilai $c[i,j]$ diambil dari $c[i,j-1]$.' },
        { id: 'D', teks: 'Penelusuran PRINT-LCS berhenti.' },
      ],
      kunci: 'B',
      pembahasan: '**Jawaban: B.** Pilihan A menggambarkan "↖", pilihan C menggambarkan "←".',
    },
  ],
}

// Kuis Pemahaman Modul 12 (8 soal pilihan ganda), bersumber dari soal PDF "12 - Longest Common Subsequence" halaman 9–11.
// Teks memakai Markdown dengan rumus TeX ($...$). `kunci` berupa satu id (satu jawaban) atau larik id (banyak jawaban, dinilai utuh).
export const kuis12 = {
  judul: 'Longest Common Subsequence',
  modul: '12',
  soal: [
    {
      no: 1,
      teks: 'Manakah yang merupakan subbarisan dari $X = \\langle K, O, M, P, U, T, E, R \\rangle$?',
      opsi: [
        { id: 'A', teks: '$\\langle K, P, O, T \\rangle$' },
        { id: 'B', teks: '$\\langle M, O, U, R \\rangle$' },
        { id: 'C', teks: '$\\langle O, P, T, R \\rangle$' },
        { id: 'D', teks: '$\\langle T, U, E, R \\rangle$' },
      ],
      kunci: 'C',
      pembahasan: '**Jawaban: C.** O (ke-2), P (ke-4), T (ke-6), R (ke-8) muncul dengan urutan yang sama. A salah karena P muncul setelah O di $X$, bukan sebelumnya. B salah karena O muncul sebelum M. D salah karena U muncul sebelum T.',
    },
    {
      no: 2,
      teks: 'Isi tabel $c$ untuk $X = \\langle A, B, C, D, E \\rangle$ dan $Y = \\langle A, C, E \\rangle$. Pilih **tiga** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: '$c[3,2] = 2$' },
        { id: 'B', teks: 'Panjang LCS adalah 3.' },
        { id: 'C', teks: 'LCS-nya adalah $\\langle A, C, E \\rangle$.' },
        { id: 'D', teks: 'LCS-nya adalah $\\langle A, B, C \\rangle$.' },
        { id: 'E', teks: 'Panjang LCS adalah 2.' },
      ],
      kunci: ['A', 'B', 'C'],
      pembahasan:
        '**Jawaban: A, B, dan C.**\n\n| | 0 | A | C | E |\n| --- | --- | --- | --- | --- |\n| 0 | 0 | 0 | 0 | 0 |\n| 1 A | 0 | 1 ↖ | 1 ← | 1 ← |\n| 2 B | 0 | 1 ↑ | 1 ↑ | 1 ↑ |\n| 3 C | 0 | 1 ↑ | 2 ↖ | 2 ← |\n| 4 D | 0 | 1 ↑ | 2 ↑ | 2 ↑ |\n| 5 E | 0 | 1 ↑ | 2 ↑ | 3 ↖ |\n\nPanjang LCS $= c[5,3] = 3$, dan LCS-nya $\\langle A, C, E \\rangle$ (seluruh $Y$ adalah subbarisan dari $X$). $\\langle A, B, C \\rangle$ bukan subbarisan $Y$.',
    },
    {
      no: 3,
      teks: 'Pada tabel contoh di modul ini, $x_5 = D = y_2$ dan $c[4,1] = 1$. Berapa $c[5,2]$ dan tanda $b[5,2]$?',
      opsi: [
        { id: 'A', teks: '$c[5,2] = 2$ dan $b[5,2] = $ ↖' },
        { id: 'B', teks: '$c[5,2] = 2$ dan $b[5,2] = $ ↑' },
        { id: 'C', teks: '$c[5,2] = 1$ dan $b[5,2] = $ ↖' },
        { id: 'D', teks: '$c[5,2] = 3$ dan $b[5,2] = $ ←' },
      ],
      kunci: 'A',
      pembahasan: '**Jawaban: A.** $x_5 = D = y_2$, sehingga $c[5,2] = c[4,1] + 1 = 1 + 1 = 2$ dan $b[5,2] = $ ↖. Sel yang dipakai hanya sel diagonal $c[4,1]$.',
    },
    {
      no: 4,
      teks: 'Apakah LCS yang dihasilkan LCS-LENGTH selalu tunggal karena memakai Dynamic Programming?',
      opsi: [
        { id: 'A', teks: 'Ya, LCS selalu tunggal.' },
        { id: 'B', teks: 'Tidak, bisa ada beberapa LCS dengan panjang yang sama, misalnya BCBA dan BDAB pada contoh modul ini; aturan pemilihan saat nilai sama menentukan mana yang dicetak.' },
        { id: 'C', teks: 'Tidak, LCS selalu tepat dua.' },
        { id: 'D', teks: 'Ya, tetapi hanya bila kedua untaian sama panjang.' },
      ],
      kunci: 'B',
      pembahasan: '**Jawaban: B.** LCS-LENGTH menjamin panjang yang maksimum; aturan pemilihan ketika nilai sama (↑ atau ←) menentukan LCS mana yang dicetak.',
    },
    {
      no: 5,
      teks: 'Mengapa PRINT-LCS memanggil dirinya sendiri **sebelum** perintah `print x[i]`, bukan sesudahnya?',
      opsi: [
        { id: 'A', teks: 'Agar program berjalan lebih cepat.' },
        { id: 'B', teks: 'Agar memori yang dipakai lebih sedikit.' },
        { id: 'C', teks: 'Jika urutannya dibalik, program tidak akan berhenti.' },
        { id: 'D', teks: 'Penelusuran berjalan dari belakang ke depan; memanggil rekursi dulu menunda pencetakan sampai elemen awal tercetak, sehingga LCS keluar berurutan. Bila dibalik, LCS tercetak terbalik.' },
      ],
      kunci: 'D',
      pembahasan: '**Jawaban: D.** PRINT-LCS menelusuri dari belakang ($i = m$) ke depan. Jika urutannya dibalik, LCS tercetak terbalik, yaitu "ABCB" untuk contoh di modul ini. Kecepatan dan memori tidak berubah, dan program tetap berhenti.',
    },
    {
      no: 6,
      teks: 'Berapa panjang LCS dari $X$ = "KASUR" dan $Y$ = "RUSAK"?',
      opsi: [
        { id: 'A', teks: '5' },
        { id: 'B', teks: '1' },
        { id: 'C', teks: '3' },
        { id: 'D', teks: '2' },
      ],
      kunci: 'B',
      pembahasan: '**Jawaban: B.** Panjang LCS $=$ **1** (misalnya "K" saja). Walaupun hurufnya sama, urutannya terbalik: "RUSAK" adalah kebalikan "KASUR". Subbarisan persekutuan harus mempertahankan urutan, dan tidak ada dua huruf berbeda yang urutannya sama di kedua kata.',
    },
    {
      no: 7,
      teks: 'Dua untaian DNA masing-masing sepanjang 1.000 dan 2.000 basa. Pilih **dua** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: 'LCS-LENGTH menghitung 3.000 sel tabel $c$.' },
        { id: 'B', teks: 'LCS-LENGTH menghitung $1.000 \\times 2.000 = 2.000.000$ sel tabel $c$.' },
        { id: 'C', teks: 'Brute force memeriksa $2^{1000} \\approx 10^{1000}$ subbarisan.' },
        { id: 'D', teks: 'Brute force harus memeriksa $2^{1000} \\approx 10^{301}$ subbarisan dari untaian pertama.' },
        { id: 'E', teks: 'LCS-LENGTH menghitung 20.000.000 sel tabel $c$.' },
      ],
      kunci: ['B', 'D'],
      pembahasan: '**Jawaban: B dan D.** Banyaknya sel yang dihitung $1.000 \\times 2.000 = 2.000.000$ (tabel lengkap berukuran $1.001 \\times 2.001$ termasuk baris dan kolom 0). Brute force harus memeriksa $2^{1000} \\approx 10^{301}$ subbarisan dari untaian pertama, angka yang mustahil dikerjakan.',
    },
    {
      no: 8,
      teks: 'Tanda "↑" pada $b[i,j]$ berarti ...',
      opsi: [
        { id: 'A', teks: '$x_i = y_j$ dan $x_i$ termasuk LCS.' },
        { id: 'B', teks: '$x_i \\ne y_j$ dan nilai $c[i,j]$ diambil dari $c[i,j-1]$.' },
        { id: 'C', teks: '$x_i \\ne y_j$ dan nilai $c[i,j]$ diambil dari $c[i-1,j]$; elemen $x_i$ tidak dipakai.' },
        { id: 'D', teks: 'Penelusuran PRINT-LCS berhenti.' },
      ],
      kunci: 'C',
      pembahasan: '**Jawaban: C.** Pilihan A menggambarkan "↖", pilihan B menggambarkan "←".',
    },
  ],
}

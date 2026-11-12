// Kuis Pemahaman Modul 04 (8 soal pilihan ganda), bersumber dari soal PDF "04 - Insertion Sort" halaman 9–10.
// Teks memakai Markdown dengan rumus TeX ($...$). `kunci` berupa satu id (satu jawaban) atau larik id (banyak jawaban, dinilai utuh).
export const kuis04 = {
  judul: 'Insertion Sort',
  modul: '04',
  soal: [
    {
      no: 1,
      teks: 'Urutkan $A = (8, 3, 5, 1)$ dengan Insertion Sort. Pilih **dua** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: 'Setelah putaran $j = 2$, array menjadi $(3, 8, 5, 1)$.' },
        { id: 'B', teks: 'Nilai $t_3 = 3$.' },
        { id: 'C', teks: 'Nilai $t_4 = 4$.' },
        { id: 'D', teks: 'Setelah putaran $j = 3$, array menjadi $(3, 8, 5, 1)$.' },
        { id: 'E', teks: 'Array akhirnya adalah $(1, 3, 8, 5)$.' },
      ],
      kunci: ['A', 'C'],
      pembahasan: '**Jawaban: A dan C.** $j = 2$: 3, 8, 5, 1 ($t_2 = 2$). $j = 3$: 3, 5, 8, 1 ($t_3 = 2$, bukan 3: key 5 menggeser 8 lalu berhenti karena $3 > 5$ salah). $j = 4$: 1, 3, 5, 8 ($t_4 = 4$: key 1 menggeser 8, 5, 3 lalu berhenti karena $i = 0$). Karena itu B, D, dan E salah.',
    },
    {
      no: 2,
      teks: 'Mengapa nilai $A[j]$ perlu disimpan di variabel `key` pada baris 2?',
      opsi: [
        { id: 'A', teks: 'Agar perulangan `for` dapat berhenti.' },
        { id: 'B', teks: 'Karena `key` dipakai untuk menghitung $t_j$.' },
        { id: 'C', teks: 'Karena posisi $A[j]$ dapat tertimpa oleh pergeseran pada baris 5.' },
        { id: 'D', teks: 'Agar array dapat diurutkan dari besar ke kecil.' },
      ],
      kunci: 'C',
      pembahasan: '**Jawaban: C.** Pada pergeseran pertama, baris 5 menulis $A[j] = A[j-1]$, sehingga nilai asli $A[j]$ hilang bila tidak disimpan lebih dulu.',
    },
    {
      no: 3,
      teks: 'Untuk $n = 6$, pilih **tiga** pernyataan yang benar tentang total eksekusi baris 4 ($\\sum t_j$) dan baris 5 ($\\sum (t_j - 1)$).',
      opsi: [
        { id: 'A', teks: 'Kasus terbaik: $\\sum t_j = 5$.' },
        { id: 'B', teks: 'Kasus terbaik: $\\sum (t_j - 1) = 5$.' },
        { id: 'C', teks: 'Kasus terburuk: $\\sum t_j = 20$.' },
        { id: 'D', teks: 'Kasus terburuk: $\\sum (t_j - 1) = 15$.' },
        { id: 'E', teks: 'Kasus terburuk: $\\sum t_j = 15$.' },
      ],
      kunci: ['A', 'C', 'D'],
      pembahasan: '**Jawaban: A, C, dan D.** Kasus terbaik: $\\sum t_j = n - 1 = 5$, $\\sum (t_j - 1) = 0$ (B salah). Kasus terburuk: $\\sum t_j = \\frac{36 + 6 - 2}{2} = 20$ dan $\\sum (t_j - 1) = \\frac{36 - 6}{2} = 15$ (E salah). Cek: $t_j = 2, 3, 4, 5, 6$ berjumlah 20, dan pergeserannya $1 + 2 + 3 + 4 + 5 = 15$.',
    },
    {
      no: 4,
      teks: 'Baris 1 (`for j = 2 to n`) pada Insertion Sort. Pernyataan manakah yang benar?',
      opsi: [
        { id: 'A', teks: 'Kepala perulangan dan isinya sama-sama dijalankan $n - 1$ kali.' },
        { id: 'B', teks: 'Kepala perulangan dijalankan $n + 1$ kali.' },
        { id: 'C', teks: 'Kepala perulangan dijalankan $n - 2$ kali.' },
        { id: 'D', teks: 'Isi perulangan dijalankan $n - 1$ kali, sedangkan kepala perulangan dijalankan $n$ kali karena ada pemeriksaan $j = n + 1$ yang mengakhiri perulangan.' },
      ],
      kunci: 'D',
      pembahasan: '**Jawaban: D.** Isi perulangan memang dijalankan $n - 1$ kali, tetapi kepala perulangan dijalankan $n$ **kali**, termasuk pemeriksaan $j = n + 1$ yang mengakhiri perulangan.',
    },
    {
      no: 5,
      teks: 'Array $A = (1, 2, 3, 4, 5, 6, 7, 0)$ hampir terurut: hanya elemen terakhir yang salah tempat. Pilih **dua** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: 'Ini adalah kasus terbaik.' },
        { id: 'B', teks: 'Banyaknya pergeseran $\\sum (t_j - 1) = 7$.' },
        { id: 'C', teks: 'Banyaknya pergeseran $\\sum (t_j - 1) = 28$.' },
        { id: 'D', teks: 'Ini adalah kasus di antara terbaik dan terburuk, jauh lebih dekat ke kasus terbaik.' },
        { id: 'E', teks: 'Ini adalah kasus terburuk.' },
      ],
      kunci: ['B', 'D'],
      pembahasan: '**Jawaban: B dan D.** Untuk $j = 2, \\dots, 7$ tidak ada pergeseran. Untuk $j = 8$, key 0 harus melewati ketujuh elemen, sehingga ada 7 pergeseran. Ini **di antara** kasus terbaik (0) dan terburuk ($\\frac{64 - 8}{2} = 28$), dan jauh lebih dekat ke kasus terbaik. Banyaknya pergeseran sama dengan banyaknya inversi, yaitu 7 pasangan $(k, 0)$.',
    },
    {
      no: 6,
      teks: 'Jika kondisi pada baris 4 diubah dari `A[i] > key` menjadi `A[i] ≥ key`, apa akibatnya?',
      opsi: [
        { id: 'A', teks: 'Array tetap terurut, tetapi elemen yang bernilai sama bisa bertukar urutan (tidak stabil) dan pergeseran bisa bertambah.' },
        { id: 'B', teks: 'Hasil pengurutan menjadi salah.' },
        { id: 'C', teks: 'Algoritma tidak pernah berhenti.' },
        { id: 'D', teks: 'Running time kasus terburuk menjadi linier.' },
      ],
      kunci: 'A',
      pembahasan: '**Jawaban: A.** Dengan $\\ge$, elemen yang nilainya sama dengan key juga ikut digeser, sehingga key ditempatkan **sebelum** elemen bernilai sama yang semula di kirinya. Hasilnya tetap terurut tetapi tidak stabil, dan pergeseran bertambah bila ada nilai yang sama. Algoritma tetap berhenti karena $i$ terus berkurang.',
    },
    {
      no: 7,
      teks: 'Mengapa pada kasus terburuk $t_j = j$, bukan $t_j = j - 1$?',
      opsi: [
        { id: 'A', teks: 'Karena kondisi `while` hanya diperiksa $j - 1$ kali dan pemeriksaan $i = 0$ tidak dihitung.' },
        { id: 'B', teks: 'Karena key melewati $j - 1$ elemen sehingga kondisi benar $j - 1$ kali, lalu diperiksa sekali lagi saat $i = 0$ dengan hasil salah: $(j - 1) + 1 = j$.' },
        { id: 'C', teks: 'Karena $j$ dimulai dari 2, sehingga hasilnya selalu bergeser satu.' },
        { id: 'D', teks: 'Karena baris 2 ikut dihitung sebagai satu pemeriksaan `while`.' },
      ],
      kunci: 'B',
      pembahasan: '**Jawaban: B.** Pada kasus terburuk key harus melewati semua $j - 1$ elemen di kirinya, sehingga kondisi `while` bernilai benar $j - 1$ kali. Setelah itu $i = 0$ dan kondisi diperiksa **sekali lagi** dengan hasil salah. Total pemeriksaan $= (j - 1) + 1 = j$.',
    },
    {
      no: 8,
      teks: 'Sebuah program Insertion Sort membutuhkan 0,01 detik untuk mengurutkan 2.000 data yang terurut terbalik. Perkirakan waktunya untuk 20.000 data yang terurut terbalik, dengan asumsi suku $n^2$ dominan.',
      opsi: [
        { id: 'A', teks: '0,1 detik' },
        { id: 'B', teks: '10 detik' },
        { id: 'C', teks: '100 detik' },
        { id: 'D', teks: '1 detik' },
      ],
      kunci: 'D',
      pembahasan: '**Jawaban: D.** Ukuran data naik $\\frac{20000}{2000} = 10$ kali. Karena suku $n^2$ dominan, waktunya naik sekitar $10^2 = 100$ kali, yaitu kira-kira $0{,}01 \\times 100 = 1$ **detik**. A mengira pertumbuhannya linier; B mengira pertumbuhannya kubik.',
    },
  ],
}

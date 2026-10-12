## A. Dynamic Programming

Materi ini mengacu pada buku Thomas H. Cormen, *Introduction to Algorithms*, halaman 359. ***Dynamic Programming*** digunakan untuk menyelesaikan permasalahan optimasi yang memberikan banyak solusi, dan setiap solusi memiliki nilai masing-masing. Dengan algoritma *Dynamic Programming* dapat ditentukan solusi yang bernilai optimal, yaitu maksimal atau minimal.

*Dynamic Programming* menyelesaikan suatu permasalahan dengan menggabungkan solusi-solusi submasalah. Solusi dari setiap submasalah disimpan dalam tabel, sehingga saat menghitung solusi submasalah yang lebih besar, hasil dari submasalah yang lebih kecil tinggal dipakai.

Penyelesaian permasalahan optimasi dengan *Dynamic Programming* mengikuti empat langkah berikut. Geser slide satu per satu untuk membacanya.

:::steps Empat langkah Dynamic Programming
::slide 1. Karakterisasi struktur solusi optimal
Pelajari bagaimana solusi optimal tersusun dari solusi optimal submasalahnya.

::slide 2. Definisikan nilai solusi optimal secara rekursif
Tulis nilai solusi optimal sebagai rumus yang memakai nilai solusi optimal submasalah yang lebih kecil.

::slide 3. Hitung nilai solusi optimal
Biasanya dengan cara ***bottom-up***: mulai dari submasalah terkecil, lalu naik ke submasalah yang lebih besar, dan simpan hasilnya di tabel.

::slide 4. Susun solusi optimal
Susun solusi optimal itu sendiri dari informasi hasil perhitungan.
:::

Langkah 1 sampai 3 adalah urutan langkah untuk menemukan **nilai** solusi optimal. Langkah 4 hanya dilakukan jika solusi optimalnya sendiri diperlukan, bukan hanya nilainya.

Dua permasalahan dipakai sebagai contoh penerapan *Dynamic Programming*:

| Permasalahan | Dibahas di |
| --- | --- |
| Perkalian Rantai Matriks (*Matrix-Chain Multiplication*) | Materi ini |
| Subbarisan Persekutuan Terpanjang (*Longest Common Subsequence*) | Materi berikutnya |

:::quiz Cek pemahaman: Dynamic Programming
::question Apa yang disimpan dalam tabel pada Dynamic Programming?
- [ ] Soal-soal latihan yang sudah dikerjakan
- [x] Solusi dari submasalah, supaya bisa dipakai lagi saat menghitung submasalah yang lebih besar
- [ ] Semua solusi yang tidak optimal
::explain
Solusi setiap submasalah disimpan dalam tabel. Saat menghitung solusi submasalah yang lebih besar, hasil submasalah yang lebih kecil tinggal diambil dari tabel.
::question Langkah mana yang hanya dilakukan bila solusi optimalnya sendiri diperlukan, bukan hanya nilainya?
- [ ] Langkah 1: karakterisasi struktur solusi optimal
- [ ] Langkah 3: hitung nilai solusi optimal
- [x] Langkah 4: susun solusi optimal dari informasi hasil perhitungan
::explain
Langkah 1 sampai 3 sudah cukup untuk menemukan nilai solusi optimal. Langkah 4 menyusun solusinya dari informasi yang dicatat selama perhitungan.
:::

## B. Perkalian Rantai Matriks

Daftar pustaka: Cormen, *Introduction to Algorithms*, halaman 370. Misalkan diberikan barisan matriks $(A_1, A_2, A_3, \ldots, A_n)$. **Perkalian rantai matriks** adalah perkalian $A_1 \times A_2 \times A_3 \times \ldots \times A_n$. Hasilnya didapat dengan **mengalikan dua matriks sekali jalan**, berulang-ulang, sampai seluruh rantai menjadi satu matriks.

Perkalian itu bisa dilakukan dengan beberapa urutan. Untuk $A_1 \times A_2 \times A_3 \times A_4$ ada 5 cara, yang dibedakan oleh tanda kurungnya:

| Cara | Urutan pengurungan |
| --- | --- |
| 1 | $(A_1 \times (A_2 \times (A_3 \times A_4)))$ |
| 2 | $(A_1 \times ((A_2 \times A_3) \times A_4))$ |
| 3 | $((A_1 \times A_2) \times (A_3 \times A_4))$ |
| 4 | $((A_1 \times (A_2 \times A_3)) \times A_4)$ |
| 5 | $(((A_1 \times A_2) \times A_3) \times A_4)$ |

Sebelum memilih urutan, kita perlu tahu syarat agar dua matriks bisa dikalikan.

### Syarat dan Hasil Perkalian Dua Matriks

Matriks A dan matriks B **dapat dikalikan apabila jumlah kolom matriks A sama dengan jumlah baris matriks B**.

- Matriks A berukuran $5 \times 4$ dan matriks B berukuran $4 \times 8$. Perkalian $A \times B$ dapat dilakukan karena jumlah kolom A sama dengan jumlah baris B, yaitu sama-sama 4.
- Matriks C berukuran $3 \times 2$ dan matriks D berukuran $4 \times 3$. Perkalian $C \times D$ tidak dapat dilakukan karena jumlah kolom C (2) tidak sama dengan jumlah baris D (4). Namun $D \times C$ dapat dilakukan, sebab kolom D (3) sama dengan baris C (3).

Hasil perkalian dua matriks adalah matriks yang jumlah barisnya sama dengan jumlah baris matriks di kiri, dan jumlah kolomnya sama dengan jumlah kolom matriks di kanan. Jadi jika A berukuran $m \times n$ dan B berukuran $n \times r$, hasil $A \times B$ adalah matriks C berukuran $m \times r$:

$$
A_{m \times n} \times B_{n \times r} = C_{m \times r}
$$

### Cara Mengalikan Dua Matriks

Misalkan A berukuran $3 \times 3$ dan B berukuran $3 \times 2$. Setiap isi hasil perkalian didapat dengan mengalikan satu baris A dengan satu kolom B sesuai urutannya, lalu menjumlahkan hasilnya.

![Perkalian matriks A berukuran 3 kali 3 dengan elemen a sampai i, dan B berukuran 3 kali 2 dengan elemen p sampai u. Baris pertama A (a, b, c) dikalikan sesuai urutan dengan kolom pertama B (p, r, t) menghasilkan ap + br + ct. Hasil perkalian berukuran 3 kali 2 dengan enam isi, misalnya baris pertama kolom kedua adalah aq + bs + cu.](/materi/dp-rantai-matriks/perkalian-matriks.png)

### Jumlah Operasi Perkalian

Pada contoh di atas, hasilnya berukuran $3 \times 2$, jadi ada 6 isi. Tiap isi memerlukan 3 perkalian, sehingga seluruhnya ada $3 \times 3 \times 2 = 18$ operasi perkalian. Secara umum:

> Jika A berukuran $m \times n$ dan B berukuran $n \times r$, maka mengalikan A dan B memerlukan $m \times n \times r$ operasi perkalian.

Contohnya, A berukuran $20 \times 5$ dan B berukuran $5 \times 4$ memerlukan $20 \times 5 \times 4 = 400$ operasi perkalian.

Mengapa yang dihitung hanya operasi perkalian? Bagi komputer, perkalian membutuhkan waktu lebih lama daripada penjumlahan. Penjumlahan $5 + 3$ langsung memberi hasil 8, sedangkan perkalian $5 \times 3$ dalam gambaran sederhana dihitung sebagai $3 + 3 + 3 + 3 + 3$. Karena itu, mencari solusi optimal perkalian rantai matriks berarti:

> Mencari **jumlah operasi perkalian paling minimal** dalam mengalikan $A_1 \times A_2 \times A_3 \times \ldots \times A_n$.

:::quiz Cek pemahaman: perkalian dua matriks
::question Matriks A berukuran 5 x 4 dan matriks B berukuran 4 x 8. Berapa ukuran hasil A x B?
- [ ] 4 x 4
- [x] 5 x 8
- [ ] 8 x 5
::explain
Hasilnya punya jumlah baris matriks kiri (5) dan jumlah kolom matriks kanan (8), jadi berukuran $5 \times 8$.
::question Matriks C berukuran 3 x 2 dan matriks D berukuran 4 x 3. Perkalian mana yang dapat dilakukan?
- [ ] C x D
- [x] D x C
- [ ] Keduanya dapat dilakukan
::explain
Syaratnya, jumlah kolom matriks kiri sama dengan jumlah baris matriks kanan. Pada $D \times C$, kolom D (3) sama dengan baris C (3). Pada $C \times D$, kolom C (2) tidak sama dengan baris D (4).
::question Berapa operasi perkalian untuk mengalikan matriks berukuran 20 x 5 dengan matriks berukuran 5 x 4?
- [ ] 29
- [ ] 100
- [x] 400
::explain
Jumlah operasi perkalian adalah $m \times n \times r = 20 \times 5 \times 4 = 400$.
:::

## C. Contoh: Tiga Matriks

Misalkan $A_1$ berukuran $2 \times 3$, $A_2$ berukuran $3 \times 8$, dan $A_3$ berukuran $8 \times 5$. Berapa jumlah operasi perkalian minimal untuk mengalikan $A_1 \times A_2 \times A_3$?

Pertama, periksa apakah setiap dua matriks yang berurutan memenuhi syarat perkalian. Kolom $A_1$ (3) sama dengan baris $A_2$ (3), dan kolom $A_2$ (8) sama dengan baris $A_3$ (8), jadi syaratnya terpenuhi. Ada dua cara mengalikannya. Geser slide untuk membandingkan keduanya.

:::steps Dua cara mengalikan A₁ × A₂ × A₃
::slide Cara 1: A₁ × (A₂ × A₃)
Kalikan $A_2 \times A_3$ lebih dulu. Hasilnya matriks B berukuran $3 \times 5$, dengan $3 \times 8 \times 5 = 120$ operasi perkalian.

Kemudian kalikan $A_1 \times B$, yaitu $2 \times 3 \times 5 = 30$ operasi perkalian.

Jumlah seluruhnya $120 + 30 = 150$ operasi perkalian.

::slide Cara 2: (A₁ × A₂) × A₃
Kalikan $A_1 \times A_2$ lebih dulu. Hasilnya matriks C berukuran $2 \times 8$, dengan $2 \times 3 \times 8 = 48$ operasi perkalian.

Kemudian kalikan $C \times A_3$, yaitu $2 \times 8 \times 5 = 80$ operasi perkalian.

Jumlah seluruhnya $48 + 80 = 128$ operasi perkalian.

::slide Kesimpulan
Jumlah operasi perkalian minimal untuk $A_1 \times A_2 \times A_3$ adalah **128**, didapat dengan cara 2, yaitu $((A_1 \times A_2) \times A_3)$.

Padahal hasil akhirnya sama saja. Urutan pengurungan hanya memengaruhi banyaknya operasi, dan itulah yang dioptimalkan.
:::

:::quiz Cek pemahaman: memilih urutan
::question Matriks $A_1$ berukuran 10 x 30, $A_2$ berukuran 30 x 5, dan $A_3$ berukuran 5 x 60. Berapa operasi perkalian untuk $((A_1 \times A_2) \times A_3)$?
- [ ] 1.500
- [x] 4.500
- [ ] 27.000
::explain
$A_1 \times A_2$ memerlukan $10 \times 30 \times 5 = 1.500$ operasi dan hasilnya berukuran $10 \times 5$. Kemudian $(10 \times 5) \times A_3$ memerlukan $10 \times 5 \times 60 = 3.000$ operasi. Jumlahnya $1.500 + 3.000 = 4.500$.
::question Pada soal yang sama, berapa operasi perkalian untuk $(A_1 \times (A_2 \times A_3))$, dan mana yang lebih hemat?
- [ ] 4.500, sama hemat dengan urutan sebelumnya
- [x] 27.000, jauh lebih boros daripada urutan sebelumnya
- [ ] 3.000, lebih hemat daripada urutan sebelumnya
::explain
$A_2 \times A_3$ memerlukan $30 \times 5 \times 60 = 9.000$ operasi dan hasilnya berukuran $30 \times 60$. Kemudian $A_1 \times (30 \times 60)$ memerlukan $10 \times 30 \times 60 = 18.000$ operasi. Jumlahnya $9.000 + 18.000 = 27.000$, enam kali lebih banyak.
:::

## D. Algoritma Matrix-Chain-Order

Daftar pustaka: Cormen, *Introduction to Algorithms*, halaman 372 sampai 377. Misalkan ada 6 matriks dengan ukuran sebagai berikut.

| Matriks | $A_1$ | $A_2$ | $A_3$ | $A_4$ | $A_5$ | $A_6$ |
| --- | --- | --- | --- | --- | --- | --- |
| Ukuran | $30 \times 35$ | $35 \times 15$ | $15 \times 5$ | $5 \times 10$ | $10 \times 20$ | $20 \times 25$ |

Untuk mengalikan $A_1 \times A_2 \times \ldots \times A_6$, rantai dipecah menjadi dua bagian. Ada 5 kemungkinan tempat memecah, yang disebut $k$:

| Cara | Pemecahan | Titik pecah |
| --- | --- | --- |
| 1 | $A_1 \times (A_2 \times A_3 \times A_4 \times A_5 \times A_6)$ | $k = 1$ |
| 2 | $(A_1 \times A_2) \times (A_3 \times A_4 \times A_5 \times A_6)$ | $k = 2$ |
| 3 | $(A_1 \times A_2 \times A_3) \times (A_4 \times A_5 \times A_6)$ | $k = 3$ |
| 4 | $(A_1 \times A_2 \times A_3 \times A_4) \times (A_5 \times A_6)$ | $k = 4$ |
| 5 | $(A_1 \times A_2 \times A_3 \times A_4 \times A_5) \times A_6$ | $k = 5$ |

Pada setiap cara, bagian yang masih terdiri dari lebih dari dua matriks harus dipecah lagi, sampai tersisa perkalian dua matriks. Mencari urutan termurah dengan mencoba semuanya secara manual terlalu lama. Masalah ini diselesaikan dengan algoritma **Matrix-Chain-Order**.

### Barisan p sebagai masukan

Setiap matriks $A_i$ berukuran $p_{i-1} \times p_i$. Untuk 6 matriks di atas, ukuran-ukuran itu disusun dalam barisan $p = \{p_0, p_1, p_2, p_3, p_4, p_5, p_6\}$:

$$
p = \{30, 35, 15, 5, 10, 20, 25\}
$$

Barisan $p$ inilah **masukan** algoritma. Perhatikan bahwa $p$ berisi $n + 1$ bilangan untuk $n$ matriks.

### Pseudocode

Berikut pseudocode MATRIX-CHAIN-ORDER(p) dengan 14 baris. Tanda $\infty$ pada baris 8 menyatakan bilangan yang lebih besar dari semua biaya.

```pseudocode
n = p.length - 1
let m[1..n, 1..n] and s[1..n-1, 2..n] be new tables
for i = 1 to n
    m[i, i] = 0
for l = 2 to n                      // l adalah panjang rantai
    for i = 1 to n - l + 1
        j = i + l - 1
        m[i, j] = ∞
        for k = i to j - 1
            q = m[i, k] + m[k+1, j] + p[i-1] * p[k] * p[j]
            if q < m[i, j]
                m[i, j] = q
                s[i, j] = k
return m and s
```

Penjelasan tiap bagian, dengan nomor yang sama seperti nomor baris di pinggir blok kode:

:::steps Arti tiap langkah MATRIX-CHAIN-ORDER
::slide Langkah 1 dan 2: persiapan
Baris 1 menghitung banyak matriks, $n = p.length - 1$ (untuk $p$ di atas, $n = 6$). Baris 2 menyiapkan dua tabel: tabel $m$ berisi biaya minimum, dan tabel $s$ berisi titik pecah $k$ terbaik.

::slide Langkah 3 dan 4: rantai satu matriks
Satu matriks tidak perlu dikalikan, jadi biayanya 0: $m[i,i] = 0$ untuk semua $i$. Ini adalah kasus dasar, yaitu isi diagonal tabel $m$.

::slide Langkah 5: panjang rantai
Variabel $l$ adalah panjang rantai, dari 2 sampai $n$. Jadi tabel diisi dari rantai terpendek ke rantai terpanjang (*bottom-up*). Saat rantai sepanjang $l$ dihitung, semua rantai yang lebih pendek sudah ada di tabel.

::slide Langkah 6 dan 7: batas rantai
Untuk panjang $l$, rantai dimulai dari $A_i$ dan berakhir di $A_j$ dengan $j = i + l - 1$. Misalnya $l = 2$ dan $i = 1$ memberi $j = 2$, yaitu rantai $A_1 A_2$.

::slide Langkah 8: nilai awal
$m[i,j]$ diisi $\infty$ sebelum dicoba. Dengan begitu, titik pecah pertama yang dicoba pasti lebih kecil dan langsung dipilih.

::slide Langkah 9 dan 10: mencoba tiap titik pecah
Variabel $k$ mencoba setiap titik pecah dari $i$ sampai $j - 1$. Untuk tiap $k$, biayanya adalah biaya rantai kiri, ditambah biaya rantai kanan, ditambah biaya mengalikan dua hasilnya:

$$
q = m[i,k] + m[k+1,j] + p_{i-1} \, p_k \, p_j
$$

::slide Langkah 11 sampai 13: menyimpan yang terbaik
Jika $q$ lebih kecil dari $m[i,j]$ yang tersimpan, biaya baru disimpan di $m[i,j]$ dan titik pecahnya disimpan di $s[i,j]$.

::slide Langkah 14: hasil
Algoritma mengembalikan tabel $m$ dan tabel $s$. Biaya minimum seluruh rantai ada di $m[1,n]$.
:::

:::quiz Cek pemahaman: algoritma Matrix-Chain-Order
::question Untuk 6 matriks, berapa banyak bilangan dalam barisan p?
- [ ] 6
- [x] 7
- [ ] 12
::explain
Matriks $A_i$ berukuran $p_{i-1} \times p_i$, jadi $n$ matriks memerlukan $p_0$ sampai $p_n$, yaitu $n + 1 = 7$ bilangan.
::question Pada langkah 5 sampai 7, jika $l = 3$ dan $i = 2$, berapa $j$?
- [ ] 3
- [ ] 5
- [x] 4
::explain
$j = i + l - 1 = 2 + 3 - 1 = 4$. Jadi yang dihitung adalah $m[2,4]$, yaitu rantai $A_2 A_3 A_4$.
::question Mengapa tabel diisi mulai dari panjang rantai $l = 2$, bukan langsung dari rantai terpanjang?
- [ ] Supaya algoritmanya lebih pendek
- [x] Karena menghitung rantai sepanjang $l$ memerlukan hasil rantai yang lebih pendek, yang harus sudah ada di tabel
- [ ] Karena rantai terpanjang tidak bisa dihitung
::explain
Biaya $m[i,j]$ memakai $m[i,k]$ dan $m[k+1,j]$, yang rantainya lebih pendek. Itulah cara kerja *bottom-up*.
:::

## E. Tabel m dan Tabel s

Hasil menjalankan MATRIX-CHAIN-ORDER untuk $p = \{30, 35, 15, 5, 10, 20, 25\}$ berupa tabel $m$ dan tabel $s$. Gambar berikut menyusunnya sebagai segitiga: $i$ dibaca ke kiri-bawah, $j$ dibaca ke kanan-bawah, dan diagonal paling bawah adalah $m[i,i] = 0$.

![Tabel m dan tabel s untuk enam matriks A1 sampai A6, berbentuk segitiga. Tabel m: diagonal bawah semuanya 0, lalu 15.750, 2.625, 750, 1.000, 5.000 untuk rantai dua matriks, 7.875, 4.375, 2.500, 3.500 untuk tiga matriks, 9.375, 7.125, 5.375 untuk empat matriks, 11.875 dan 10.500 untuk lima matriks, dan 15.125 di puncak. Tabel s: 1, 2, 3, 4, 5 untuk dua matriks, 1, 3, 3, 5 untuk tiga matriks, 3, 3, 3 untuk empat matriks, 3 dan 3 untuk lima matriks, dan 3 di puncak.](/materi/dp-rantai-matriks/tabel-m-s.png)

Isi yang sama dalam bentuk tabel biasa, dengan baris untuk $i$ dan kolom untuk $j$:

| Tabel m: i \ j | 1 | 2 | 3 | 4 | 5 | 6 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 0 | 15.750 | 7.875 | 9.375 | 11.875 | 15.125 |
| 2 | – | 0 | 2.625 | 4.375 | 7.125 | 10.500 |
| 3 | – | – | 0 | 750 | 2.500 | 5.375 |
| 4 | – | – | – | 0 | 1.000 | 3.500 |
| 5 | – | – | – | – | 0 | 5.000 |
| 6 | – | – | – | – | – | 0 |

| Tabel s: i \ j | 2 | 3 | 4 | 5 | 6 |
| --- | --- | --- | --- | --- | --- |
| 1 | 1 | 1 | 3 | 3 | 3 |
| 2 | – | 2 | 3 | 3 | 3 |
| 3 | – | – | 3 | 3 | 3 |
| 4 | – | – | – | 4 | 5 |
| 5 | – | – | – | – | 5 |

### Tabel m: biaya minimum

Isi $m[i,j]$ adalah jumlah operasi perkalian paling minimal untuk mengalikan rantai $A_i \ldots A_j$. Menurut langkah 2 *Dynamic Programming* (Cormen halaman 374), nilainya dihitung dengan rumus rekursif berikut, yang kita sebut persamaan (\*):

$$
m[i,j] =
\begin{cases}
0 & \text{jika } i = j \\
\min\limits_{i \le k < j} \left\{ m[i,k] + m[k+1,j] + p_{i-1} \, p_k \, p_j \right\} & \text{jika } i < j
\end{cases}
$$

Di sini $k$ adalah kemungkinan letak pemecahan rantai. Dua contoh berikut menunjukkan cara memakainya.

:::steps Contoh 1: menghitung m[1,2]
::slide Langkah 1: baca isi tabel
Pada tabel $m$, isi $m[1,2] = 15.750$. Rantainya $A_1 \times A_2$, yaitu hanya dua matriks.

::slide Langkah 2: tentukan nilai k
Untuk rantai dua matriks hanya ada 1 kemungkinan, yaitu $k = 1$ (dari $i = 1$ sampai $j - 1 = 1$).

::slide Langkah 3: hitung dengan persamaan (\*)
$$
\begin{aligned}
m[1,2] &= m[1,1] + m[2,2] + p_0 \, p_1 \, p_2 \\
&= 0 + 0 + 30 \times 35 \times 15 \\
&= 15.750
\end{aligned}
$$

Hasilnya sama dengan jumlah operasi perkalian dua matriks $30 \times 35$ dan $35 \times 15$.
:::

:::steps Contoh 2: menghitung m[2,5]
::slide Langkah 1: rantai dan titik pecah
Pada tabel $m$, isi $m[2,5] = 7.125$. Rantainya $A_2 \times A_3 \times A_4 \times A_5$ dengan 3 kemungkinan titik pecah, yaitu $k = 2$, $k = 3$, dan $k = 4$.

::slide Langkah 2: hitung biaya tiap k
$$
\begin{aligned}
k = 2: \; & m[2,2] + m[3,5] + p_1 \, p_2 \, p_5 = 0 + 2.500 + 35 \times 15 \times 20 = 13.000 \\
k = 3: \; & m[2,3] + m[4,5] + p_1 \, p_3 \, p_5 = 2.625 + 1.000 + 35 \times 5 \times 20 = 7.125 \\
k = 4: \; & m[2,4] + m[5,5] + p_1 \, p_4 \, p_5 = 4.375 + 0 + 35 \times 10 \times 20 = 11.375
\end{aligned}
$$

::slide Langkah 3: ambil yang minimum
Dari ketiganya, nilai terkecil adalah 7.125 pada $k = 3$. Jadi $m[2,5] = 7.125$, dan titik pecah terbaiknya $k = 3$ disimpan di tabel $s$.
:::

### Tabel s: titik pecah terbaik

Isi $s[i,j]$ adalah bilangan $k$ (titik pecah) yang memberikan jumlah operasi perkalian paling minimal untuk rantai $A_i \ldots A_j$. Contohnya $s[2,5] = 3$, artinya $A_2 \times A_3 \times A_4 \times A_5$ paling hemat dikalikan sebagai $(A_2 \times A_3) \times (A_4 \times A_5)$. Nilai 3 ini persis $k$ terbaik yang kita temukan pada Contoh 2.

### Menyusun urutan perkalian dari tabel s

Inilah langkah 4 *Dynamic Programming*: menyusun solusi optimal. Mulailah dari $s[1,6]$, lalu pecah bagian kiri dan kanan dengan cara yang sama.

:::steps Menyusun urutan pengurungan dari tabel s
::slide Langkah 1: pecah seluruh rantai
Dari tabel $s$, $s[1,6] = 3$. Rantai dipecah di $k = 3$: $(A_1 \times A_2 \times A_3) \times (A_4 \times A_5 \times A_6)$.

::slide Langkah 2: pecah bagian kiri
Untuk $A_1 \times A_2 \times A_3$ didapat $s[1,3] = 1$. Dipecah di $k = 1$: $A_1 \times (A_2 \times A_3)$.

::slide Langkah 3: pecah bagian kanan
Untuk $A_4 \times A_5 \times A_6$ didapat $s[4,6] = 5$. Dipecah di $k = 5$: $(A_4 \times A_5) \times A_6$.

::slide Langkah 4: gabungkan
Urutan perkalian yang optimal adalah:

$$
(A_1 \times (A_2 \times A_3)) \times ((A_4 \times A_5) \times A_6)
$$

dengan jumlah operasi perkalian minimal $m[1,6] = 15.125$.
:::

:::quiz Cek pemahaman: tabel m dan tabel s
::question Berapa nilai m[2,3], yaitu biaya mengalikan matriks A2 (35 x 15) dengan A3 (15 x 5)?
- [ ] 525
- [x] 2.625
- [ ] 15.750
::explain
Hanya ada $k = 2$, sehingga $m[2,3] = m[2,2] + m[3,3] + p_1 \, p_2 \, p_3 = 0 + 0 + 35 \times 15 \times 5 = 2.625$.
::question Berapa nilai m[3,4], yaitu biaya mengalikan A3 (15 x 5) dengan A4 (5 x 10)?
- [ ] 75
- [x] 750
- [ ] 2.625
::explain
Hanya ada $k = 3$, sehingga $m[3,4] = 0 + 0 + p_2 \, p_3 \, p_4 = 15 \times 5 \times 10 = 750$.
::question Tabel s berisi s[4,6] = 5. Apa artinya?
- [ ] Mengalikan A4 sampai A6 memerlukan 5 operasi perkalian
- [x] Rantai A4 x A5 x A6 paling hemat dipecah menjadi (A4 x A5) x A6
- [ ] Ada 5 cara mengalikan A4 sampai A6
::explain
Isi tabel $s$ adalah titik pecah $k$ terbaik, bukan biaya dan bukan banyak cara. Pecah di $k = 5$ berarti $A_4 \times A_5$ dikalikan lebih dulu, lalu hasilnya dikalikan dengan $A_6$.
::question Tabel m dan tabel s dipakai untuk apa?
- [ ] Keduanya berisi biaya minimum dengan nilai yang berbeda
- [ ] Tabel s untuk biaya minimum, tabel m untuk menyusun urutan perkaliannya
- [x] Tabel m untuk biaya minimum, tabel s untuk menyusun urutan perkaliannya
::explain
Tabel $m$ menyimpan biaya minimum tiap rantai. Tabel $s$ menyimpan titik pecah terbaiknya, dan dipakai pada langkah 4 untuk menyusun urutan pengurungan.
:::

## F. Mencoba Visualisasi Tabel

Visualisasi di bawah ini mengisi tabel $m$ sel demi sel, persis seperti yang kita hitung secara manual. Isian awalnya adalah contoh materi ini, yaitu $p = \{30, 35, 15, 5, 10, 20, 25\}$, jadi hasil akhirnya harus sama: biaya 15.125 dengan urutan $((A_1(A_2A_3))((A_4A_5)A_6))$.

Beberapa hal agar tidak bingung membandingkan dengan pseudocode:

- Isian ukuran matriks bernama `dims`, sama dengan $p$ di materi. Isi 3 sampai 7 angka (2 sampai 6 matriks), tiap angka 1 sampai 99. Contoh siap pakai ada di panel "Ubah masukan".
- Kode di visualisasi memakai nama `panjang` untuk $l$, dan nomor barisnya berbeda dari pseudocode materi karena kodenya memuat baris pembuatan tabel dan fungsi `kurung`. Tabel dan indeksnya tetap mulai dari 1 seperti di materi.
- Setiap sel $m[i,j]$ dicoba untuk tiap titik pecah $k$. Dua sel yang dipakai ditandai **Ki** ($m[i,k]$) dan **Ka** ($m[k+1,j]$), dan angka kecil di bawah isi sel adalah $k$ terbaik, yaitu isi tabel $s$.
- Di langkah terakhir, sel yang terpakai pada urutan optimal ditandai ★ dan urutan pengurungannya ditulis di panel hasil.

::visualizer

## G. Rangkuman

| Hal | Isi |
| --- | --- |
| Masalah | Mencari urutan pengurungan $A_1 \times A_2 \times \ldots \times A_n$ dengan jumlah operasi perkalian paling minimal |
| Syarat perkalian dua matriks | Kolom matriks kiri sama dengan baris matriks kanan |
| Biaya mengalikan dua matriks | $A_{m \times n} \times B_{n \times r}$ memerlukan $m \times n \times r$ perkalian, hasilnya $C_{m \times r}$ |
| Masukan algoritma | Barisan $p_0, p_1, \ldots, p_n$ dengan $A_i$ berukuran $p_{i-1} \times p_i$ |
| Tabel m | $m[i,j]$ adalah biaya minimum rantai $A_i \ldots A_j$, dan $m[1,n]$ adalah jawaban |
| Rumus tabel m | $m[i,i] = 0$, dan $m[i,j]$ adalah minimum dari $m[i,k] + m[k+1,j] + p_{i-1} p_k p_j$ untuk $i \le k < j$ |
| Tabel s | $s[i,j]$ adalah titik pecah $k$ terbaik, dipakai untuk menyusun urutan pengurungan |
| Urutan pengisian | Dari panjang rantai $l = 2$ sampai $n$ (*bottom-up*) |
| Hasil contoh | $m[1,6] = 15.125$ dengan urutan $((A_1(A_2A_3))((A_4A_5)A_6))$ |

Cara cepat mengingat: **tabel m menjawab "berapa", tabel s menjawab "bagaimana"**. Sekarang coba kerjakan soal challenge di bawah.

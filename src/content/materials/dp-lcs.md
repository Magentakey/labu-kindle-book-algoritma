## A. Longest Common Subsequence

Daftar pustaka: Cormen, *Introduction to Algorithms*, halaman 390 sampai 396. ***Longest Common Subsequence*** (LCS) adalah permasalahan mencari **subbarisan persekutuan terpanjang** dari dua barisan yang diberikan.

### Subbarisan

Subbarisan (*subsequence*) adalah barisan yang diambil dari barisan lain dengan **urutan tetap dipertahankan**, tetapi anggotanya tidak harus berdampingan. Misalnya $\{A, C, E\}$ adalah subbarisan dari $\{A, B, C, D, E\}$, sedangkan $\{A, E, C\}$ bukan, karena urutannya terbalik. Subbarisan **persekutuan** adalah subbarisan yang dimiliki kedua barisan sekaligus.

### Mencari dengan Brute Force

Misalkan diberikan dua barisan string:

$$
X = \{A, B, C, B, D, A, B\} = \{x_1, x_2, x_3, x_4, x_5, x_6, x_7\}
$$

$$
Y = \{B, D, C, A, B, A\} = \{y_1, y_2, y_3, y_4, y_5, y_6\}
$$

Secara *brute force* (mencoba segala kemungkinan solusi), kita bisa mencari anggota yang sama antara $X$ dan $Y$. Berikut tujuh di antaranya:

| No | Subbarisan persekutuan | Diambil dari $X$ | Diambil dari $Y$ |
| --- | --- | --- | --- |
| 1 | $\{A, B, A\}$ | $\{x_1, x_2, x_6\}$ | $\{y_4, y_5, y_6\}$ |
| 2 | $\{B, C, B, A\}$ | $\{x_2, x_3, x_4, x_6\}$ | $\{y_1, y_3, y_5, y_6\}$ |
| 3 | $\{C, B, A\}$ | $\{x_3, x_4, x_6\}$ | $\{y_3, y_5, y_6\}$ |
| 4 | $\{B, D, A, B\}$ | $\{x_4, x_5, x_6, x_7\}$ | $\{y_1, y_2, y_4, y_5\}$ |
| 5 | $\{D, A, B\}$ | $\{x_5, x_6, x_7\}$ | $\{y_2, y_4, y_5\}$ |
| 6 | $\{A, B\}$ | $\{x_6, x_7\}$ | $\{y_4, y_5\}$ |
| 7 | $\{B\}$ | $\{x_7\}$ | $\{y_1\}$ |

Dari tabel di atas, subbarisan persekutuan terpanjang adalah $\{B, C, B, A\}$ dan $\{B, D, A, B\}$, masing-masing 4 anggota. Jika semua kemungkinan dicoba, ada satu lagi yang sama panjang, yaitu $\{B, C, A, B\}$, dan tidak ada yang lebih panjang dari 4. Jadi LCS tidak selalu tunggal, tetapi **panjangnya** selalu sama.

Cara ini cepat menjadi tidak praktis. Barisan $X$ dengan $m$ anggota punya $2^m$ subbarisan (termasuk yang kosong), dan tiap subbarisan harus dicek apakah ada di $Y$. Untuk $m = 7$ saja ada 128 kandidat. Karena itu dipakai *Dynamic Programming*.

:::quiz Cek pemahaman: subbarisan persekutuan
::question Manakah yang merupakan subbarisan dari {A, B, C, D, E}?
- [ ] {A, E, C}
- [x] {A, C, E}
- [ ] {A, C, F}
::explain
Subbarisan harus mempertahankan urutan. {A, C, E} mengikuti urutan A, C, E pada barisan asal. {A, E, C} membalik urutan, dan F tidak ada di barisan asal.
::question Berapa panjang subbarisan persekutuan terpanjang dari X = {A, B, C, B, D, A, B} dan Y = {B, D, C, A, B, A}?
- [ ] 3
- [x] 4
- [ ] 5
::explain
Subbarisan terpanjang yang ditemukan adalah {B, C, B, A} dan {B, D, A, B}, masing-masing 4 anggota.
:::

## B. Algoritma LCS-LENGTH

Dengan algoritma *Dynamic Programming*, subbarisan persekutuan terpanjang dari $X = \{x_1, x_2, \ldots, x_m\}$ dan $Y = \{y_1, y_2, \ldots, y_n\}$ dicari dengan algoritma **LCS-LENGTH**. Masukannya adalah barisan $X$ dan barisan $Y$. Hasil langkah-langkahnya disimpan dalam dua tabel:

- **tabel c**: $c[i,j]$ adalah panjang LCS dari $i$ anggota pertama $X$ dan $j$ anggota pertama $Y$. Jadi $c[m,n]$ adalah panjang LCS dari seluruh $X$ dan $Y$.
- **tabel b**: $b[i,j]$ adalah tanda panah ($\nwarrow$, $\uparrow$, atau $\leftarrow$) yang mencatat dari sel mana $c[i,j]$ didapat. Tabel ini dipakai nanti untuk menyusun LCS-nya.

### Pseudocode

Berikut pseudocode LCS-LENGTH(X, Y) dengan 18 baris. Indeks tabel mulai dari 1, sama seperti pada dokumen.

```pseudocode
m = X.length
n = Y.length
let b[1..m, 1..n] and c[0..m, 0..n] be new tables
for i = 1 to m
    c[i, 0] = 0
for j = 0 to n
    c[0, j] = 0
for i = 1 to m
    for j = 1 to n
        if x_i == y_j
            c[i, j] = c[i-1, j-1] + 1
            b[i, j] = "↖"
        elseif c[i-1, j] >= c[i, j-1]
            c[i, j] = c[i-1, j]
            b[i, j] = "↑"
        else c[i, j] = c[i, j-1]
            b[i, j] = "←"
return c and b
```

Penjelasan tiap bagian, dengan nomor yang sama seperti nomor baris di pinggir blok kode:

:::steps Arti tiap langkah LCS-LENGTH
::slide Langkah 1 sampai 3: persiapan
Baris 1 dan 2 menghitung panjang kedua barisan, $m$ dan $n$. Baris 3 menyiapkan dua tabel: tabel $b$ berukuran $m \times n$ (indeks 1 sampai $m$ dan 1 sampai $n$), dan tabel $c$ berukuran $(m+1) \times (n+1)$ (indeks 0 sampai $m$ dan 0 sampai $n$).

::slide Langkah 4 sampai 7: baris 0 dan kolom 0
Langkah 4 dan 5 mengisi $c[i,0] = 0$ untuk $i = 1, 2, \ldots, m$, yaitu kolom 0. Langkah 6 dan 7 mengisi $c[0,j] = 0$ untuk $j = 0, 1, \ldots, n$, yaitu baris 0.

Artinya, LCS antara suatu barisan dan barisan kosong panjangnya 0. Ini adalah kasus dasar.

::slide Langkah 8 dan 9: mengisi sel yang lain
Dua perulangan bersarang mengisi $c[i,j]$ dan $b[i,j]$ untuk $i = 1, 2, \ldots, m$ dan $j = 1, 2, \ldots, n$, baris demi baris dari kiri ke kanan. Untuk tiap sel ada **3 kemungkinan**, yang dipilih oleh langkah 10, 13, dan 16.

::slide Langkah 10 sampai 12: anggota sama
Jika anggota ke-$i$ barisan $X$ sama dengan anggota ke-$j$ barisan $Y$ ($x_i = y_j$), maka:

- Langkah 11: $c[i,j] = c[i-1,j-1] + 1$, yaitu isi sel kiri-atas ditambah 1.
- Langkah 12: $b[i,j] = \nwarrow$.

Jika langkah 10 *False*, lanjut ke langkah 13.

::slide Langkah 13 sampai 15: sel atas lebih besar atau sama
Jika $c[i-1,j] \geq c[i,j-1]$, maka:

- Langkah 14: $c[i,j] = c[i-1,j]$, yaitu isi sel di atasnya.
- Langkah 15: $b[i,j] = \uparrow$.

Jika langkah 13 *False*, lanjut ke langkah 16.

::slide Langkah 16 dan 17: selain itu
- Langkah 16: $c[i,j] = c[i,j-1]$, yaitu isi sel di kirinya.
- Langkah 17: $b[i,j] = \leftarrow$.

::slide Langkah 18: hasil
Setelah perulangan di langkah 8 selesai (semua sel terisi), langkah 18 mengembalikan tabel $c$ dan tabel $b$.
:::

:::quiz Cek pemahaman: algoritma LCS-LENGTH
::question Berapa isi $c[i,0]$ dan $c[0,j]$?
- [x] 0
- [ ] 1
- [ ] Bergantung pada anggota barisannya
::explain
Langkah 4 sampai 7 mengisi seluruh baris 0 dan kolom 0 dengan 0, karena LCS dengan barisan kosong panjangnya 0.
::question Jika $x_i = y_j$, berapa isi $c[i,j]$?
- [ ] $c[i-1,j] + c[i,j-1] + 1$
- [x] $c[i-1,j-1] + 1$
- [ ] $\max(c[i-1,j], c[i,j-1])$
::explain
Anggota yang sama memperpanjang LCS dari sel kiri-atas sebanyak satu, sehingga $c[i,j] = c[i-1,j-1] + 1$ (langkah 11).
::question Anggota $x_i$ dan $y_j$ berbeda, dan $c[i-1,j] \geq c[i,j-1]$. Apa isi $b[i,j]$?
- [ ] $\nwarrow$
- [x] $\uparrow$
- [ ] $\leftarrow$
::explain
Pada langkah 13 sampai 15, jika sel atas lebih besar atau sama dengan sel kiri maka $c[i,j]$ diambil dari sel atas dan $b[i,j] = \uparrow$.
:::

## C. Tabel c dan Tabel b untuk Contoh

Tabel berikut adalah hasil menjalankan langkah 4 sampai 17 LCS-LENGTH untuk $X = \{A, B, C, B, D, A, B\}$ dan $Y = \{B, D, C, A, B, A\}$. Di setiap sel, angka adalah isi tabel $c$ dan panah adalah isi tabel $b$.

![Tabel c dan b untuk X = ABCBDAB (baris, i dari 1 sampai 7) dan Y = BDCABA (kolom, j dari 1 sampai 6). Baris 0 dan kolom 0 berisi 0. Isi tiap sel ditulis sebagai arah panah lalu angka. Baris 1 (A): atas 0, atas 0, atas 0, diagonal 1, kiri 1, diagonal 1. Baris 2 (B): diagonal 1, kiri 1, kiri 1, atas 1, diagonal 2, kiri 2. Baris 3 (C): atas 1, atas 1, diagonal 2, kiri 2, atas 2, atas 2. Baris 4 (B): diagonal 1, atas 1, atas 2, atas 2, diagonal 3, kiri 3. Baris 5 (D): atas 1, diagonal 2, atas 2, atas 2, atas 3, atas 3. Baris 6 (A): atas 1, atas 2, atas 2, diagonal 3, atas 3, diagonal 4. Baris 7 (B): diagonal 1, atas 2, atas 2, atas 3, diagonal 4, atas 4. Sel berlatar abu-abu menandai jalur penelusuran PRINT-LCS.](/materi/dp-lcs/tabel-c-b.png)

Isi yang sama dalam bentuk tabel teks, supaya bisa dibaca pembaca layar. Tanda $\nwarrow$ ditulis ↖︎, $\uparrow$ ditulis ↑︎, dan $\leftarrow$ ditulis ←︎:

| Tabel c dan b: i ↓, j → | 0 | 1 (B) | 2 (D) | 3 (C) | 4 (A) | 5 (B) | 6 (A) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 1 (A) | 0 | ↑︎0 | ↑︎0 | ↑︎0 | ↖︎1 | ←︎1 | ↖︎1 |
| 2 (B) | 0 | ↖︎1 | ←︎1 | ←︎1 | ↑︎1 | ↖︎2 | ←︎2 |
| 3 (C) | 0 | ↑︎1 | ↑︎1 | ↖︎2 | ←︎2 | ↑︎2 | ↑︎2 |
| 4 (B) | 0 | ↖︎1 | ↑︎1 | ↑︎2 | ↑︎2 | ↖︎3 | ←︎3 |
| 5 (D) | 0 | ↑︎1 | ↖︎2 | ↑︎2 | ↑︎2 | ↑︎3 | ↑︎3 |
| 6 (A) | 0 | ↑︎1 | ↑︎2 | ↑︎2 | ↖︎3 | ↑︎3 | ↖︎4 |
| 7 (B) | 0 | ↖︎1 | ↑︎2 | ↑︎2 | ↑︎3 | ↖︎4 | ↑︎4 |

Sel kanan-bawah $c[7,6] = 4$ adalah panjang LCS dari $X$ dan $Y$, sama dengan hasil *brute force* di bagian A. Sel berlatar abu-abu pada gambar adalah sel yang akan dilewati algoritma PRINT-LCS di bagian D.

Agar jelas dari mana tiap isi tabel berasal, berikut tiga sel yang dihitung satu per satu. Masing-masing mewakili satu dari tiga kemungkinan.

:::steps Menghitung tiga sel contoh
::slide Sel c[2,1]: anggota sama (langkah 10 sampai 12)
$x_2 = B$ dan $y_1 = B$, jadi $x_2 = y_1$. Maka $c[2,1] = c[1,0] + 1 = 0 + 1 = 1$ dan $b[2,1] = \nwarrow$.

::slide Sel c[1,1]: sel atas menang (langkah 13 sampai 15)
$x_1 = A$ dan $y_1 = B$ berbeda. Bandingkan $c[0,1] = 0$ dengan $c[1,0] = 0$. Karena $0 \geq 0$, maka $c[1,1] = c[0,1] = 0$ dan $b[1,1] = \uparrow$. Perhatikan bahwa saat nilainya sama, yang dipilih selalu sel atas.

::slide Sel c[2,2]: sel kiri menang (langkah 16 dan 17)
$x_2 = B$ dan $y_2 = D$ berbeda. Bandingkan $c[1,2] = 0$ dengan $c[2,1] = 1$. Karena $0 \geq 1$ salah, maka $c[2,2] = c[2,1] = 1$ dan $b[2,2] = \leftarrow$.
:::

:::quiz Cek pemahaman: tabel c dan b
::question Berapa panjang LCS dari $X$ dan $Y$ pada contoh, menurut tabel c?
- [ ] 3
- [x] 4
- [ ] 6
::explain
Panjang LCS ada di sel kanan-bawah, $c[7,6] = 4$.
::question Pada contoh, $x_2 = B$ dan $y_2 = D$ berbeda, dengan $c[1,2] = 0$ dan $c[2,1] = 1$. Apa isi $b[2,2]$?
- [ ] $\nwarrow$
- [ ] $\uparrow$
- [x] $\leftarrow$
::explain
$c[1,2] \geq c[2,1]$ bernilai salah ($0 < 1$), jadi langkah 16 dan 17 dijalankan: $c[2,2] = c[2,1] = 1$ dan $b[2,2] = \leftarrow$.
::question Pada contoh, $x_5 = D$ dan $y_2 = D$. Apa isi $b[5,2]$?
- [x] $\nwarrow$
- [ ] $\uparrow$
- [ ] $\leftarrow$
::explain
Karena $x_5 = y_2$, langkah 10 sampai 12 dijalankan: $c[5,2] = c[4,1] + 1 = 1 + 1 = 2$ dan $b[5,2] = \nwarrow$.
::question Pada contoh, $x_4 = B$ dan $y_3 = C$ berbeda, dengan $c[3,3] = 2$ dan $c[4,2] = 1$. Berapa $c[4,3]$?
- [ ] 1
- [x] 2
- [ ] 3
::explain
Karena $c[3,3] \geq c[4,2]$ ($2 \geq 1$), maka $c[4,3] = c[3,3] = 2$ dan $b[4,3] = \uparrow$.
:::

## D. Algoritma PRINT-LCS

LCS-LENGTH hanya menghasilkan **panjang** LCS. Untuk mendapatkan subbarisannya sendiri, dipakai algoritma **PRINT-LCS** $(b, X, i, j)$ yang membaca tabel $b$. Pemanggilan awalnya memakai ukuran penuh, yaitu PRINT-LCS$(b, X, X.length, Y.length)$. Untuk contoh kita, itu PRINT-LCS$(b, X, 7, 6)$.

### Pseudocode

Berikut pseudocode PRINT-LCS(b, X, i, j) dengan 8 baris. Algoritma ini memanggil dirinya sendiri (rekursif):

```pseudocode
if i == 0 or j == 0
    return
if b[i, j] == "↖"
    PRINT-LCS(b, X, i-1, j-1)
    print x_i
elseif b[i, j] == "↑"
    PRINT-LCS(b, X, i-1, j)
else PRINT-LCS(b, X, i, j-1)
```

:::steps Arti tiap langkah PRINT-LCS
::slide Langkah 1 dan 2: berhenti
Jika $i = 0$ atau $j = 0$, penelusuran sudah sampai tepi tabel. Langkah 2 adalah **return**, yaitu kembali ke pemanggil sebelumnya (langkah 4, 7, atau 8).

::slide Langkah 3 sampai 5: panah diagonal
Jika $b[i,j] = \nwarrow$, anggota $x_i$ termasuk LCS. Langkah 4 memanggil PRINT-LCS$(b, X, i-1, j-1)$. **Setelah pemanggilan itu kembali**, langkah 5 mencetak $x_i$.

::slide Langkah 6 dan 7: panah ke atas
Jika $b[i,j] = \uparrow$, panggil PRINT-LCS$(b, X, i-1, j)$ tanpa mencetak apa pun.

::slide Langkah 8: panah ke kiri
Selain itu ($b[i,j] = \leftarrow$), panggil PRINT-LCS$(b, X, i, j-1)$ tanpa mencetak apa pun.
:::

Karena $x_i$ dicetak **sesudah** pemanggilan rekursifnya kembali, anggota LCS tercetak dari depan ke belakang, walaupun penelusuran tabelnya dimulai dari sel kanan-bawah $b[7,6]$ dan bergerak ke atas atau ke kiri.

### Contoh: PRINT-LCS(b, X, 7, 6)

Dengan tabel $b$ dari bagian C, berikut urutan pemanggilannya sampai $i = 0$ atau $j = 0$. Kolom "Baris" menunjukkan langkah yang dijalankan.

| Pemanggilan | Isi $b[i,j]$ | Baris yang dijalankan | Pemanggilan berikutnya |
| --- | --- | --- | --- |
| PRINT-LCS(b, X, 7, 6) | ↑︎ | 1 (False), 3 (False), 6 (True), 7 | PRINT-LCS(b, X, 6, 6) |
| PRINT-LCS(b, X, 6, 6) | ↖︎ | 1 (False), 3 (True), 4 | PRINT-LCS(b, X, 5, 5) |
| PRINT-LCS(b, X, 5, 5) | ↑︎ | 1 (False), 3 (False), 6 (True), 7 | PRINT-LCS(b, X, 4, 5) |
| PRINT-LCS(b, X, 4, 5) | ↖︎ | 1 (False), 3 (True), 4 | PRINT-LCS(b, X, 3, 4) |
| PRINT-LCS(b, X, 3, 4) | ←︎ | 1 (False), 3 (False), 6 (False), 8 | PRINT-LCS(b, X, 3, 3) |
| PRINT-LCS(b, X, 3, 3) | ↖︎ | 1 (False), 3 (True), 4 | PRINT-LCS(b, X, 2, 2) |
| PRINT-LCS(b, X, 2, 2) | ←︎ | 1 (False), 3 (False), 6 (False), 8 | PRINT-LCS(b, X, 2, 1) |
| PRINT-LCS(b, X, 2, 1) | ↖︎ | 1 (False), 3 (True), 4 | PRINT-LCS(b, X, 1, 0) |
| PRINT-LCS(b, X, 1, 0) | tidak dibaca | 1 (True), 2 | return |

Setelah PRINT-LCS(b, X, 1, 0) melakukan **return**, setiap pemanggilan kembali satu per satu ke pemanggilnya. Geser slide untuk melihat apa yang tercetak.

:::steps Kembali dan mencetak
::slide Kembali ke PRINT-LCS(b, X, 2, 1)
Pemanggilan ini memanggil lewat langkah 4, jadi lanjut ke langkah 5: cetak $x_2$, yaitu **B**.

::slide Kembali ke (2, 2), lalu (3, 3)
PRINT-LCS(b, X, 2, 2) memanggil lewat langkah 8, jadi tidak ada yang dicetak dan langsung kembali. PRINT-LCS(b, X, 3, 3) memanggil lewat langkah 4, jadi cetak $x_3$, yaitu **C**.

::slide Kembali ke (3, 4), lalu (4, 5)
PRINT-LCS(b, X, 3, 4) memanggil lewat langkah 8, jadi tidak ada yang dicetak. PRINT-LCS(b, X, 4, 5) memanggil lewat langkah 4, jadi cetak $x_4$, yaitu **B**.

::slide Kembali ke (5, 5), lalu (6, 6)
PRINT-LCS(b, X, 5, 5) memanggil lewat langkah 7, jadi tidak ada yang dicetak. PRINT-LCS(b, X, 6, 6) memanggil lewat langkah 4, jadi cetak $x_6$, yaitu **A**.

::slide Selesai di PRINT-LCS(b, X, 7, 6)
PRINT-LCS(b, X, 7, 6) memanggil lewat langkah 7, jadi tidak ada yang dicetak, lalu algoritma selesai. Urutan yang tercetak adalah B, C, B, A. Jadi LCS-nya adalah $\{B, C, B, A\}$.
:::

Dari tiga LCS yang mungkin, algoritma ini menghasilkan $\{B, C, B, A\}$. LCS yang didapat bergantung pada aturan seri di langkah 13: saat $c[i-1,j] = c[i,j-1]$, yang dipilih adalah sel atas.

:::quiz Cek pemahaman: algoritma PRINT-LCS
::question Apa yang dicetak oleh PRINT-LCS(b, X, 7, 6) pada contoh?
- [ ] B, D, A, B
- [x] B, C, B, A
- [ ] A, B, A
::explain
Anggota yang tercetak adalah $x_2 = B$, $x_3 = C$, $x_4 = B$, dan $x_6 = A$, yaitu $\{B, C, B, A\}$.
::question Kapan PRINT-LCS mencetak $x_i$?
- [x] Setelah pemanggilan rekursif kembali, jika $b[i,j] = \nwarrow$
- [ ] Setiap kali dipanggil
- [ ] Jika $b[i,j] = \uparrow$ atau $b[i,j] = \leftarrow$
::explain
Langkah 5 hanya dijalankan pada cabang $b[i,j] = \nwarrow$, dan letaknya sesudah pemanggilan rekursif di langkah 4.
::question Pada PRINT-LCS(b, X, 3, 4), isi $b[3,4]$ adalah $\leftarrow$. Pemanggilan berikutnya yang mana?
- [ ] PRINT-LCS(b, X, 2, 3)
- [ ] PRINT-LCS(b, X, 2, 4)
- [x] PRINT-LCS(b, X, 3, 3)
::explain
Panah $\leftarrow$ menjalankan langkah 8: PRINT-LCS$(b, X, i, j-1)$, jadi dari $(3, 4)$ menjadi $(3, 3)$.
:::

## E. Mencoba Visualisasi Tabel

Visualisasi di bawah ini mengisi tabel sel demi sel, lalu menelusuri balik untuk menyusun LCS. Isian awalnya adalah contoh materi ini, yaitu $X$ = ABCBDAB dan $Y$ = BDCABA, jadi hasil akhirnya harus sama: panjang 4 dengan LCS BCBA.

Beberapa hal agar tidak bingung membandingkan dengan pseudocode:

- Isian bernama `x` dan `y`, sama dengan $X$ dan $Y$ di materi. Masing-masing 1 sampai 7 karakter, hanya huruf dan angka. Contoh siap pakai ada di panel "Ubah masukan".
- Tabel di visualisasi bernama `t`, sama dengan tabel $c$ di materi. Baris dan kolom tabelnya mulai dari 0, sedangkan karakter di kode dibaca dengan `x[i - 1]` karena indeks string JavaScript mulai dari 0.
- Tidak ada tabel $b$ terpisah. Panah ($\nwarrow$, $\uparrow$, $\leftarrow$) ditulis kecil di dalam sel, di samping angkanya, sehingga satu sel menyimpan isi $c[i,j]$ dan $b[i,j]$ sekaligus.
- Penelusuran balik di visualisasi memakai perulangan `while`, bukan pemanggilan rekursif seperti PRINT-LCS. Jalurnya dan hasilnya sama, dan aturan serinya juga sama: saat nilainya sama, naik ke sel atas. Hasil sementaranya ditulis dari belakang, jadi stringnya bertambah ke arah kiri.

::visualizer

## F. Rangkuman

| Hal | Isi |
| --- | --- |
| Masalah | Mencari subbarisan persekutuan terpanjang (LCS) dari dua barisan $X$ dan $Y$ |
| Subbarisan | Barisan yang diambil dengan urutan tetap, anggotanya tidak harus berdampingan |
| Algoritma LCS-LENGTH | Mengisi tabel $c$ (panjang LCS) dan tabel $b$ (panah asal) dengan *Dynamic Programming* |
| Kasus dasar | $c[i,0] = 0$ dan $c[0,j] = 0$ |
| Jika $x_i = y_j$ | $c[i,j] = c[i-1,j-1] + 1$ dan $b[i,j] = \nwarrow$ |
| Jika $x_i \neq y_j$ dan $c[i-1,j] \geq c[i,j-1]$ | $c[i,j] = c[i-1,j]$ dan $b[i,j] = \uparrow$ |
| Jika $x_i \neq y_j$ dan $c[i-1,j] < c[i,j-1]$ | $c[i,j] = c[i,j-1]$ dan $b[i,j] = \leftarrow$ |
| Panjang LCS | Ada di sel kanan-bawah, $c[m,n]$ |
| Algoritma PRINT-LCS | Mengikuti panah tabel $b$ dari $b[m,n]$, dan mencetak $x_i$ setiap kali bertemu $\nwarrow$ |
| Hasil contoh | $c[7,6] = 4$ dengan LCS $\{B, C, B, A\}$ |

Cara cepat mengingat: **tabel c menjawab "berapa panjangnya", tabel b menjawab "anggotanya apa saja"**. Sekarang coba kerjakan soal challenge di bawah.

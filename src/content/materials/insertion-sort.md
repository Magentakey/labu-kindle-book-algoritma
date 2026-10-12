## A. Algoritma Insertion Sort

Algoritma **Insertion Sort** adalah algoritma untuk mengurutkan *n* bilangan dari kecil ke besar. Masukannya berupa *array* A yang berisi *n* bilangan sembarang.

### Array dan Indeks

Sebagai contoh, barisan bilangan 10, 20, 30, 40 disimpan dalam *array* A berukuran $1\times 4$. Angka 1, 2, 3, 4 disebut **indeks** *array* A, sedangkan nilai 10, 20, 30, 40 disebut **isi** *array* A pada indeks tersebut.

| Indeks | 1 | 2 | 3 | 4 |
| --- | --- | --- | --- | --- |
| A | 10 | 20 | 30 | 40 |

Jadi A[1] = 10, A[2] = 20, A[3] = 30, dan A[4] = 40. Pada materi ini indeks *array* dimulai dari **1**.

### Pseudocode Insertion Sort

Berikut bentuk *pseudocode* algoritma **INSERTION_SORT(A)**, dengan parameter masukan berupa *array* A satu dimensi yang berisi *n* bilangan. Nomor di samping kode adalah nomor langkah yang dipakai pada seluruh keterangan di materi ini.

```text
for j = 2 to length[A]
  key = A[j]
  i = j - 1
  while i > 0 and A[i] > key
    A[i + 1] = A[i]
    i = i - 1
  A[i + 1] = key
```

Geser satu per satu dengan tombol panah untuk membaca keterangan tiap langkah.

:::steps Keterangan tujuh langkah Insertion Sort
::slide Langkah 1: perulangan for
*Looping* **for** mengulang langkah 2 sampai 7 untuk $j = 2$ sampai dengan panjang *array* A. Saat $j$ = panjang *array* A + 1, perulangan berakhir (**end for**) dan algoritma Insertion Sort selesai dijalankan.

Perulangan mulai dari $j = 2$ karena A[1], satu-satunya elemen di bagian kiri pada awalnya, sudah dianggap terurut.

::slide Langkah 2 dan 3: inisialisasi
- **Langkah 2:** nilai variabel `key` sama dengan isi *array* A pada indeks $j$, yaitu `key = A[j]`.
- **Langkah 3:** nilai variabel `i` sama dengan $j$ dikurang 1, yaitu `i = j - 1`.

::slide Langkah 4: perulangan while
*Looping* **while** mengulang selama dipenuhi `i > 0` **dan** `A[i] > key`.

- Jika kondisi ini TRUE, algoritma menjalankan langkah 5 dan langkah 6.
- Jika kondisi ini FALSE, perulangan berakhir (**end while**) dan algoritma lanjut ke langkah 7.

::slide Langkah 5 dan 6: menggeser elemen
- **Langkah 5:** isi *array* A pada indeks $i + 1$ diberi nilai yang sama dengan isi *array* pada indeks $i$. Artinya elemen itu digeser satu tempat ke kanan.
- **Langkah 6:** nilai variabel `i` yang baru sama dengan nilai `i` yang lama dikurang 1.

::slide Langkah 7: menyisipkan key
Isi *array* pada indeks $i + 1$ diberi nilai sama dengan nilai variabel `key`. Inilah saat `key` disisipkan ke tempat yang tepat.
:::

### Contoh: Mengurutkan 12, 10, 15, 7

Tuliskan langkah-langkah algoritma Insertion Sort untuk mengurutkan bilangan 12, 10, 15, 7. Bilangan-bilangan itu disimpan dalam *array* A satu dimensi:

| Indeks | 1 | 2 | 3 | 4 |
| --- | --- | --- | --- | --- |
| A | 12 | 10 | 15 | 7 |

Jalankan langkah demi langkah dengan tombol **Berikutnya**. Nomor baris pada peraga sama dengan nomor langkah di atas. Perhatikan baris mana yang dilewati saat kondisi `while` bernilai FALSE, dan bagaimana sel `key`, celah, dan elemen yang digeser berubah pada *array*.

::trace insertion-sort

Hasil tiap loop pada contoh ini bisa Anda cocokkan dengan peraga di atas.

:::reveal Lihat hasil tiap loop
| Loop | $j$ | key | $i$ saat while berhenti | Isi array sesudah langkah 7 |
| --- | --- | --- | --- | --- |
| 1 | 2 | 10 | 0 | 10, 12, 15, 7 |
| 2 | 3 | 15 | 2 | 10, 12, 15, 7 |
| 3 | 4 | 7 | 0 | 7, 10, 12, 15 |
| 4 | 5 | – | – | end for, selesai |

- **Loop 1:** `key` = 10. Karena $12 > 10$, elemen 12 digeser ke indeks 2. Kemudian $i = 0$ sehingga `while` berhenti, dan 10 disisipkan di indeks 1.
- **Loop 2:** `key` = 15. Karena $12 > 15$ bernilai FALSE (True and False menghasilkan False), `while` langsung berhenti dan 15 tetap di indeks 3.
- **Loop 3:** `key` = 7. Elemen 15, 12, dan 10 berturut-turut lebih besar dari 7, sehingga ketiganya digeser satu tempat ke kanan. Setelah $i = 0$, 7 disisipkan di indeks 1.
- **Loop 4:** $j = 5$ lebih besar dari panjang *array*, jadi **end for** dan algoritma selesai.

Hasil akhirnya adalah *array* A = 7, 10, 12, 15.
:::

:::quiz Cek pemahaman: Insertion Sort
::question Mengapa perulangan for pada INSERTION_SORT dimulai dari $j = 2$, bukan $j = 1$?
- [x] Karena A[1] sendirian sudah dianggap terurut, jadi tidak perlu disisipkan
- [ ] Karena indeks array dimulai dari 2
- [ ] Karena A[1] selalu elemen terkecil
::explain
Pada awalnya bagian kiri hanya berisi A[1]. Satu elemen saja pasti sudah terurut, sehingga pengambilan `key` dimulai dari elemen kedua.
::question Pada contoh 12, 10, 15, 7, berapa kali langkah 5 (`A[i + 1] = A[i]`) dijalankan saat $j = 4$ dan key = 7?
- [ ] 1 kali
- [ ] 2 kali
- [x] 3 kali
::explain
Elemen 15, 12, dan 10 semuanya lebih besar dari 7, sehingga masing-masing digeser satu tempat ke kanan: 3 kali.
::question Pada loop dengan $j = 3$ (key = 15), mengapa langkah 5 tidak dijalankan?
- [x] Karena A[2] = 12 > 15 bernilai FALSE, sehingga while langsung berhenti
- [ ] Karena $i = 0$ pada saat itu
- [ ] Karena key lebih kecil dari A[2]
::explain
Pada loop itu $i = 2$ dan A[2] = 12. Kondisi `12 > 15` FALSE, jadi `while` berhenti tanpa menggeser apa pun, dan 15 disisipkan kembali di indeks 3.
:::

Diagram batang berikut memperlihatkan Insertion Sort dengan tinggi batang sebagai nilai bilangan. Ada dua mode: **Ringkas** menampilkan langkah per bagian visual, sedangkan mode **Tepat** menampilkan satu langkah untuk setiap kali sebuah baris kode dibaca, lengkap dengan tabel hitungan eksekusi tiap baris. Mode Tepat adalah jembatan menuju bagian analisis *running time* berikutnya. Dua hal perlu diperhatikan agar tidak membingungkan:

- Pada visualisasi, indeks *array* dimulai dari **0** seperti *array* JavaScript, sedangkan pseudocode dan peraga di atas memulai indeks dari **1** seperti di materi.
- Nama variabel perulangan tertukar. Visualisasi memakai `i` untuk perulangan luar dan `j` untuk perulangan dalam, sedangkan di materi `j` adalah perulangan luar dan `i` perulangan dalam. Kondisi `j >= 0` pada visualisasi sama dengan `i > 0` pada pseudocode.

::visualizer

## B. Analisis Running Time

Untuk menentukan ***running time*** algoritma Insertion Sort, tetapkan dua hal untuk setiap langkah algoritma:

- **Cost**: waktu yang dibutuhkan komputer dalam menyelesaikan (membaca) satu kali langkah itu.
- **Jumlah operasi**: banyaknya langkah itu dibaca oleh komputer selama algoritma dijalankan.

### Cost dan Jumlah Operasi

Tabel berikut memuat cost dan jumlah operasi untuk setiap langkah INSERTION_SORT(A).

| Langkah | Pseudocode | Cost | Jumlah operasi |
| --- | --- | --- | --- |
| 1 | `for j = 2 to length[A]` | $c_1$ | $n$ |
| 2 | `key = A[j]` | $c_2$ | $n - 1$ |
| 3 | `i = j - 1` | $c_3$ | $n - 1$ |
| 4 | `while i > 0 and A[i] > key` | $c_4$ | $\sum t_j$ |
| 5 | `A[i + 1] = A[i]` | $c_5$ | $\sum (t_j - 1)$ |
| 6 | `i = i - 1` | $c_6$ | $\sum (t_j - 1)$ |
| 7 | `A[i + 1] = key` | $c_7$ | $n - 1$ |

Semua $\sum$ pada tabel dihitung untuk $j = 2$ sampai $n$. Geser slide berikut untuk memahami dari mana tiap jumlah operasi berasal.

:::steps Cara membaca kolom jumlah operasi
::slide Langkah 1: n kali
Cost $c_1$ menyatakan waktu yang dibutuhkan komputer untuk membaca langkah 1. Jumlah operasi $n$ berarti langkah 1 terbaca sebanyak $n$ kali selama algoritma berjalan, yaitu untuk $j = 2$ sampai panjang *array* A (sebanyak $n - 1$ kali), ditambah 1 kali saat **end for**.

::slide Langkah 2, 3, dan 7: n − 1 kali
Ketiga langkah ini terbaca saat $j = 2$ sampai $j = n$, jadi sebanyak ($n - 1$) kali. Saat $j = n + 1$ terjadi **end for**, akibatnya langkah 2, 3, dan 7 tidak terbaca.

::slide Langkah 4: Σ tⱼ kali
Pada langkah 4 terdapat pernyataan **while** di dalam pernyataan **for** (langkah 1).

**$t_j$** menyatakan banyaknya pembacaan langkah 4 ("while ...") untuk setiap $j$. Jadi jumlah operasi langkah 4 adalah jumlah semua $t_j$ untuk $j = 2$, 3, 4, ..., $n$:

$$
\sum_{j=2}^{n} t_j = t_2 + t_3 + t_4 + \ldots + t_n
$$

::slide Langkah 5 dan 6: Σ (tⱼ − 1) kali
Langkah 5 dan 6 hanya terbaca sebanyak ($t_j - 1$) kali untuk setiap $j$, sebab pada pembacaan **while** yang terakhir (FALSE), langkah 5 dan 6 tidak terbaca.
:::

### Rumus Running Time T(n)

*Running time* algoritma Insertion Sort adalah jumlah dari hasil perkalian antara cost dan jumlah operasi pada setiap langkah:

$$
\begin{aligned}
T(n) &= c_1 \cdot n + c_2 \cdot (n-1) + c_3 \cdot (n-1) + c_4 \cdot \sum_{j=2}^{n} t_j \\
&\quad + c_5 \cdot \sum_{j=2}^{n} (t_j - 1) + c_6 \cdot \sum_{j=2}^{n} (t_j - 1) + c_7 \cdot (n-1)
\end{aligned}
$$

Nilai $t_j$ bergantung pada susunan bilangan di dalam *array*, sehingga *running time* juga bergantung pada susunan itu. Itulah sebabnya dibedakan **kasus terbaik** (*best case*) dan **kasus terburuk** (*worst case*). Pada peraga di bagian berikut, tabel cost dan jumlah operasi terisi seiring langkah berjalan, jadi Anda bisa mencocokkan angkanya dengan rumus di atas.

### Kasus Terbaik (Best Case)

*Best case* terjadi apabila bilangan di dalam *array* **sudah terurut dari kecil ke besar**, sehingga untuk setiap $j$ langkah 4 ("while ...") hanya terbaca 1 kali.

Contoh: *array* A = 2, 4, 12, 15, 30. Jalankan sampai akhir dan perhatikan angka di kolom "Terbaca sejauh ini".

::trace insertion-sort-best

Terlihat bahwa langkah 4 hanya terbaca 1 kali untuk setiap loop (setiap $j$), dan langkah 5 serta 6 tidak pernah terbaca. Jadi pada *best case*, $t_j = 1$ dan $t_j - 1 = 0$ untuk setiap $j$, sehingga:

$$
\begin{aligned}
\sum_{j=2}^{n} t_j &= \sum_{j=2}^{n} 1 = 1 + 1 + 1 + \ldots + 1 = (n-1) \\
\sum_{j=2}^{n} (t_j - 1) &= 0
\end{aligned}
$$

Perhatikan bahwa $j$ mulai dari 2, berarti ada penjumlahan 1 sebanyak ($n - 1$) kali. Dengan $n = 5$, hasilnya 4, sama dengan angka di kolom langkah 4 pada peraga. Jadi *running time* untuk *best case*:

$$
\begin{aligned}
T(n) &= c_1 \cdot n + c_2 \cdot (n-1) + c_3 \cdot (n-1) + c_4 \cdot (n-1) + c_5 \cdot 0 + c_6 \cdot 0 + c_7 \cdot (n-1) \\
&= c_1 n + c_2 n - c_2 + c_3 n - c_3 + c_4 n - c_4 + c_7 n - c_7 \\
&= (c_1 + c_2 + c_3 + c_4 + c_7) \cdot n + (-c_2 - c_3 - c_4 - c_7)
\end{aligned}
$$

Anggap $(c_1 + c_2 + c_3 + c_4 + c_7) = a$ dan $(-c_2 - c_3 - c_4 - c_7) = b$, dengan $a$ dan $b$ konstanta. Maka:

**$T(n) = an + b$**, yaitu fungsi *running time* berbentuk fungsi **linier**.

### Kasus Terburuk (Worst Case)

*Worst case* terjadi apabila bilangan di dalam *array* **sudah terurut dari besar ke kecil**, sehingga untuk setiap $j$ langkah 4 ("while ...") terbaca sebanyak $j$ kali.

Contoh: *array* A = 30, 15, 12, 4, 2. Pada setiap loop, `key` bergeser sampai ke ujung kiri *array*.

::trace insertion-sort-worst

Terlihat bahwa pada setiap loop (setiap $j$), langkah 4 terbaca $j$ kali. Jadi pada *worst case*, $t_j = j$ untuk setiap $j$, sehingga:

$$
\sum_{j=2}^{n} t_j = \sum_{j=2}^{n} j = 2 + 3 + 4 + \ldots + n
$$

Ingat bahwa $1 + 2 + 3 + \ldots + n = \frac{n(n+1)}{2}$ (deret hitung). Berarti:

$$
\sum_{j=2}^{n} t_j = \frac{n(n+1)}{2} - 1 = \frac{n^2 + n - 2}{2}
$$

Selanjutnya:

$$
\begin{aligned}
\sum_{j=2}^{n} (t_j - 1) &= \sum_{j=2}^{n} t_j - \sum_{j=2}^{n} 1 \\
&= \frac{n^2 + n - 2}{2} - (n-1) \\
&= \frac{n^2 + n - 2 - 2(n-1)}{2} \\
&= \frac{n^2 - n}{2}
\end{aligned}
$$

Dengan $n = 5$, $\sum t_j = \frac{25 + 5 - 2}{2} = 14$ dan $\sum (t_j - 1) = \frac{25 - 5}{2} = 10$, sama dengan angka di kolom langkah 4, 5, dan 6 pada peraga. Jadi *running time* untuk *worst case*:

$$
\begin{aligned}
T(n) &= c_1 \cdot n + c_2 \cdot (n-1) + c_3 \cdot (n-1) + c_4 \cdot \frac{n^2 + n - 2}{2} + c_5 \cdot \frac{n^2 - n}{2} + c_6 \cdot \frac{n^2 - n}{2} + c_7 \cdot (n-1) \\
&= \left(\frac{c_4 + c_5 + c_6}{2}\right) \cdot n^2 + \left(c_1 + c_2 + c_3 + \frac{c_4 - c_5 - c_6}{2} + c_7\right) \cdot n + (-c_2 - c_3 - c_4 - c_7)
\end{aligned}
$$

Anggap $\frac{c_4 + c_5 + c_6}{2} = a$, $\left(c_1 + c_2 + c_3 + \frac{c_4 - c_5 - c_6}{2} + c_7\right) = b$, dan $(-c_2 - c_3 - c_4 - c_7) = c$, dengan $a$, $b$, dan $c$ konstanta. Maka:

**$T(n) = an^2 + bn + c$**, yaitu fungsi *running time* berbentuk fungsi **kuadrat**.

### Rangkuman Best Case dan Worst Case

| Kasus | Susunan array | $t_j$ | $\sum t_j$ | Bentuk $T(n)$ |
| --- | --- | --- | --- | --- |
| Terbaik | Terurut dari kecil ke besar | 1 | $n - 1$ | $an + b$ (linier) |
| Terburuk | Terurut dari besar ke kecil | $j$ | $\frac{n^2 + n - 2}{2}$ | $an^2 + bn + c$ (kuadrat) |

Susunan lain berada di antara keduanya. Misalnya 12, 10, 15, 7 pada contoh awal menghasilkan $\sum t_j = 7$, lebih besar dari $n - 1 = 3$ dan lebih kecil dari $\frac{n^2 + n - 2}{2} = 9$. Coba masukan Anda sendiri pada peraga di atas.

Geser ukuran input *n* untuk melihat perbedaan laju pertumbuhan fungsi linier (*best case*) dan kuadrat (*worst case*).

::growth n, n^2

:::quiz Cek pemahaman: analisis running time
::question Berapa kali langkah 1 (`for j = 2 to length[A]`) terbaca untuk array berisi $n$ bilangan?
- [ ] $n - 1$ kali
- [x] $n$ kali
- [ ] $n + 1$ kali
::explain
Langkah 1 terbaca untuk $j = 2$ sampai $n$ (sebanyak $n - 1$ kali), ditambah 1 kali saat $j = n + 1$ yang menyebabkan **end for**. Totalnya $n$ kali.
::question Pada best case, berapa nilai $t_j$ untuk setiap $j$?
- [x] 1
- [ ] $j$
- [ ] 0
::explain
Pada *array* yang sudah terurut, kondisi `while` langsung FALSE pada pembacaan pertama, jadi langkah 4 terbaca tepat 1 kali untuk setiap $j$.
::question Mengapa langkah 5 dan 6 terbaca ($t_j - 1$) kali, bukan $t_j$ kali?
- [x] Karena pada pembacaan while yang terakhir (FALSE), langkah 5 dan 6 tidak dijalankan
- [ ] Karena langkah 5 dan 6 hanya dijalankan pada $j = 2$
- [ ] Karena cost langkah 5 dan 6 lebih kecil
::explain
Dari $t_j$ kali langkah 4 dibaca, hanya pembacaan terakhir yang FALSE. Sebanyak ($t_j - 1$) pembacaan sisanya TRUE dan diikuti langkah 5 dan 6.
::question Bentuk fungsi running time Insertion Sort pada worst case adalah?
- [ ] Linier, $an + b$
- [x] Kuadrat, $an^2 + bn + c$
- [ ] Konstan
::explain
Pada *worst case* $t_j = j$, sehingga $\sum t_j$ memuat suku $n^2$. Hasilnya fungsi kuadrat.
:::

## C. Contoh Soal: Mencari Bilangan k

Buat algoritma dalam bentuk *pseudocode* untuk menyelidiki apakah dalam suatu *array* A yang berisi *n* bilangan sembarang terdapat bilangan $k$. Jika ya, kembalikan (*return*) $i$, dengan $i$ adalah indeks dari *array* A. Jika tidak terdapat bilangan $k$, kembalikan -1. Carilah fungsi *running time* untuk kasus terburuk (*worst case*) dari algoritma tersebut, yaitu apabila tidak didapat bilangan $k$ pada *array* A.

### Pseudocode

Berikut *pseudocode* **CARI_BIL_K(A, $k$)**, dengan parameter masukan berupa *n* bilangan yang disimpan dalam *array* A, dan bilangan $k$.

```text
for i = 1 to A.length
  if (k == A[i])
    then return i
return -1
```

Jalankan peraga berikut. Isian awalnya adalah kasus terburuk, yaitu $k$ tidak ada di *array*. Coba juga tombol contoh lain untuk melihat apa yang terjadi bila $k$ ditemukan.

::trace cari-bil-k

### Running Time Kasus Terburuk

Pada kasus terburuk, $k$ tidak ada di dalam *array* A. Cost dan jumlah operasi setiap langkah:

| Langkah | Pseudocode | Cost | Jumlah operasi |
| --- | --- | --- | --- |
| 1 | `for i = 1 to length[A]` | $c_1$ | $n + 1$ |
| 2 | `if (k == A[i])` | $c_2$ | $n$ |
| 3 | `then return i` | $c_3$ | 0 |
| 4 | `return -1` | $c_4$ | 1 |

- **Langkah 1** terbaca $n + 1$ kali: untuk $i = 1$ sampai $n$, ditambah 1 kali saat $i = n + 1$ yang mengakhiri perulangan.
- **Langkah 2** terbaca $n$ kali, sekali untuk setiap $i$, dan selalu bernilai FALSE karena $k$ tidak ada.
- **Langkah 3** tidak pernah terbaca (0 kali), sebab kondisi pada langkah 2 tidak pernah TRUE.
- **Langkah 4** terbaca 1 kali, yaitu setelah perulangan selesai.

Coba turunkan fungsi *running time* $T(n)$ dari tabel di atas, lalu bandingkan dengan jawaban berikut.

:::reveal Lihat penurunan T(n)
$$
\begin{aligned}
T(n) &= c_1 \cdot (n+1) + c_2 \cdot n + c_3 \cdot 0 + c_4 \cdot 1 \\
&= c_1 \cdot (n+1) + c_2 \cdot n + c_4 \cdot 1 \\
&= (c_1 + c_2) \cdot n + (c_1 + c_4) \cdot 1
\end{aligned}
$$

Ganti ($c_1 + c_2$) dengan konstanta $a$, dan ($c_1 + c_4$) dengan konstanta $b$, sehingga didapat:

**$T(n) = an + b$**, yaitu fungsi *running time* berbentuk fungsi **linier**.
:::

:::quiz Cek pemahaman: CARI_BIL_K
::question Pada kasus terburuk CARI_BIL_K, berapa kali langkah 2 (`if (k == A[i])`) terbaca?
- [ ] $n - 1$ kali
- [x] $n$ kali
- [ ] $n + 1$ kali
::explain
Langkah 2 terbaca sekali untuk setiap $i = 1$ sampai $n$. Sedangkan langkah 1 terbaca $n + 1$ kali karena memeriksa kondisi perulangan sekali lagi saat $i = n + 1$.
::question Jika $k$ ada di indeks pertama array (kasus terbaik), berapa kali langkah 2 terbaca?
- [x] 1 kali
- [ ] $n$ kali
- [ ] $n + 1$ kali
::explain
Pada $i = 1$ kondisi `k == A[1]` langsung TRUE, algoritma menjalankan `return 1` dan berhenti. Langkah 2 hanya terbaca 1 kali.
:::

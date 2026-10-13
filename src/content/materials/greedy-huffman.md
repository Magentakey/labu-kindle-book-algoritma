## A. Kompresi Data

Daftar pustaka: Cormen, *Introduction to Algorithms*, halaman 428 sampai 433. **Kompresi data** adalah teknik untuk memperkecil ukuran data dibandingkan ukuran aslinya. Teknik ini dipakai pada komputer karena setiap karakter disimpan sebagai deretan bit. Pada ASCII, tiap karakter memakai **8 bit (1 byte)**. Misalnya huruf A bernilai desimal 65, yang dalam biner adalah `01000001`. Kompresi mengurangi jumlah bit yang dibutuhkan tiap karakter, sehingga ruang penyimpanan (*memory*) yang dipakai lebih kecil.

### Contoh Masalah

Sebuah berkas berisi **100.000 karakter** yang terdiri atas 6 jenis karakter, yaitu a, b, c, d, e, dan f. Frekuensi kemunculan tiap karakter (dalam ribuan) adalah:

| Karakter | a | b | c | d | e | f |
| --- | --- | --- | --- | --- | --- | --- |
| Frekuensi (ribuan) | 45 | 13 | 12 | 16 | 9 | 5 |

Data ini bisa dikodekan dengan dua cara. *Fixed-length codeword* memberi **panjang bit yang sama** untuk semua karakter. *Variable-length codeword* memberi **panjang bit yang berbeda-beda** menurut karakter.

| Karakter | a | b | c | d | e | f |
| --- | --- | --- | --- | --- | --- | --- |
| Frekuensi (ribuan) | 45 | 13 | 12 | 16 | 9 | 5 |
| *Fixed-length codeword* | 000 | 001 | 010 | 011 | 100 | 101 |
| *Variable-length codeword* | 0 | 101 | 100 | 111 | 1101 | 1100 |

### Menghitung Panjang Bit

Ada tiga cara menyimpan 100.000 karakter tersebut. Frekuensi pada tabel dalam ribuan, jadi hasil perkalian di bawah juga dalam ribuan bit.

| Cara | Perhitungan | Total bit |
| --- | --- | --- |
| Tanpa kompresi (ASCII) | $100.000 \times 8$ | 800.000 |
| *Fixed-length codeword* | $100.000 \times 3$ | 300.000 |
| *Variable-length codeword* | $45 \times 1 + 13 \times 3 + 12 \times 3 + 16 \times 3 + 9 \times 4 + 5 \times 4 = 224$ ribu | 224.000 |

Untuk 6 jenis karakter, panjang bit yang sama paling sedikit **3 bit** per karakter, karena 2 bit hanya cukup untuk 4 kode berbeda ($2^2 = 4 < 6$) dan 3 bit cukup untuk 8 kode ($2^3 = 8 \geq 6$).

Tingkat efisiensi penghematan *variable-length codeword* dibandingkan *fixed-length codeword*:

$$
\frac{300.000 - 224.000}{300.000} \times 100\% = \frac{76.000}{300.000} \times 100\% \approx 25{,}3\%
$$

Dokumen materi membulatkannya menjadi 25%. Dibandingkan ASCII (800.000 bit), penghematannya jauh lebih besar, yaitu $\frac{800.000 - 224.000}{800.000} = 72\%$.

Kode *variable-length* seperti di tabel ini diperoleh dengan **pengkodean Huffman**, yang dibahas di bagian berikutnya.

:::quiz Cek pemahaman: kompresi data
::question Berapa bit yang dibutuhkan tiap karakter pada *fixed-length codeword* untuk 6 jenis karakter?
- [ ] 2 bit
- [x] 3 bit
- [ ] 6 bit
::explain
Dengan $b$ bit hanya ada $2^b$ kode berbeda. Untuk 6 karakter dibutuhkan $2^b \geq 6$, sehingga $b = 3$ (2 bit hanya cukup untuk 4 kode).
::question Berapa total bit untuk 100.000 karakter contoh jika memakai *variable-length codeword* pada tabel?
- [ ] 300.000 bit
- [x] 224.000 bit
- [ ] 800.000 bit
::explain
Totalnya $(45 \times 1 + 13 \times 3 + 12 \times 3 + 16 \times 3 + 9 \times 4 + 5 \times 4) \times 1000 = 224 \times 1000$. Angka 300.000 adalah *fixed-length* dan 800.000 adalah ASCII tanpa kompresi.
::question Mengapa karakter a (frekuensi 45) diberi kode terpendek, yaitu 1 bit?
- [ ] Karena a adalah huruf pertama dalam alfabet
- [x] Karena karakter yang paling sering muncul sebaiknya memakai bit paling sedikit
- [ ] Karena semua kode harus dimulai dari 0
::explain
Total bit adalah jumlah (frekuensi $\times$ panjang kode). Memberi kode pendek kepada karakter yang paling sering muncul membuat total itu paling kecil.
:::

## B. Kode Huffman dan Sifat Prefiks

Pengkodean Huffman memakai kode dengan **panjang bit yang berbeda-beda**. Karakter dengan frekuensi kemunculan **tinggi** mendapat kode **paling pendek**, sedangkan karakter dengan frekuensi **paling rendah** mendapat kode **paling panjang**.

Syarat penting: kode Huffman sebuah karakter **tidak boleh menjadi prefiks** (awalan) dari kode karakter lain. Kode yang memenuhi syarat ini disebut **kode prefiks** (*prefix code*).

Pada contoh, kodenya adalah a = 0, b = 101, c = 100, d = 111, e = 1101, dan f = 1100.

- Karakter a berkode `0` (1 bit). Kode lain, yang panjangnya 3 atau 4 bit, tidak ada yang diawali `0`.
- Karakter b berkode `101` (3 bit). Kode yang panjangnya 4 bit, yaitu e dan f, tidak ada yang diawali `101`.

Karena tidak ada kode yang menjadi awalan kode lain, deretan bit hasil kompresi **selalu bisa dikembalikan (*decode*)** tanpa ambiguitas dan tanpa tanda pemisah antar karakter.

:::reveal Lihat contoh decode: 10111011000
Baca bit dari kiri, lalu potong setiap kali bit yang terkumpul sama dengan satu kode:

| Bit yang terbaca | Kode yang cocok | Karakter |
| --- | --- | --- |
| `101` | 101 | b |
| `1101` | 1101 | e |
| `100` | 100 | c |
| `0` | 0 | a |

Hasilnya "beca". Panjang total $3 + 4 + 3 + 1 = 11$ bit, sama dengan panjang `10111011000`. Pemotongan ini tidak pernah bimbang karena sifat prefiks: begitu bit yang terkumpul sama dengan satu kode, tidak mungkin ada kode lain yang lebih panjang dan diawali bit yang sama.
:::

:::quiz Cek pemahaman: sifat prefiks
::question Mana pasangan kode yang **melanggar** sifat prefiks?
- [ ] 0 dan 101
- [ ] 100 dan 1101
- [x] 11 dan 1101
::explain
Kode `11` adalah awalan dari `1101`, jadi deretan bit yang diawali `11` bisa berarti karakter berkode `11` atau awal dari karakter berkode `1101`. Pada dua pasangan lain tidak ada kode yang menjadi awalan kode lain.
::question Hasil decode `1100` pada kode contoh adalah...
- [ ] ba
- [x] f
- [ ] ca
::explain
`1100` adalah kode karakter f. Dibaca dari kiri, bit `1`, `11`, dan `110` tidak cocok dengan kode mana pun, sedangkan `1100` cocok dengan kode f.
:::

## C. Algoritma HUFFMAN

Algoritma HUFFMAN membangun pohon biner dari bawah ke atas dengan cara **menggabungkan dua simpul berfrekuensi terkecil** berulang kali. Ini algoritma Greedy: pada setiap langkah dipilih dua simpul yang terlihat paling baik saat itu, yaitu yang frekuensinya paling kecil.

### Pseudocode

Berikut pseudocode HUFFMAN(C) dengan 9 baris.

```pseudocode
n = |C|
Q = C
for i = 1 to n - 1
    allocate a new node z
    z.left = x = EXTRACT-MIN(Q)
    z.right = y = EXTRACT-MIN(Q)
    z.freq = x.freq + y.freq
    INSERT(Q, z)
return EXTRACT-MIN(Q)    // return the root of the tree
```

Keterangan:

| Notasi | Arti |
| --- | --- |
| $C$ | Himpunan jenis karakter beserta frekuensi kemunculan tiap karakter |
| $\lvert C \rvert$ | Banyaknya elemen pada himpunan $C$ |
| $Q$ | Antrean prioritas, yaitu himpunan yang selalu terurut naik menurut frekuensi |
| EXTRACT-MIN($Q$) | Mengeluarkan satu elemen dari $Q$ yang frekuensinya paling kecil |
| INSERT($Q$, $z$) | Memasukkan $z$ ke $Q$ pada urutan yang sesuai dengan frekuensinya |

Penjelasan tiap langkah, dengan nomor yang sama seperti nomor baris di pinggir blok kode:

:::steps Arti tiap langkah HUFFMAN
::slide Langkah 1: banyak karakter
$n$ diisi dengan banyaknya jenis karakter di $C$. Pada contoh, $n = 6$.

::slide Langkah 2: antrean awal
$Q$ diisi dengan semua karakter di $C$, tersusun naik menurut frekuensi. Pada contoh: f:5, e:9, c:12, b:13, d:16, a:45. Tiap karakter ini adalah simpul daun.

::slide Langkah 3: perulangan
Perulangan dijalankan $n - 1$ kali, dan tiap putaran menggabungkan dua simpul menjadi satu. Jadi jumlah simpul di $Q$ berkurang satu tiap putaran, dari $n$ menjadi 1. Pada contoh, perulangan berjalan 5 kali.

::slide Langkah 4: simpul baru
Dibuat simpul baru $z$ yang akan menjadi induk dari dua simpul terkecil.

::slide Langkah 5: anak kiri
EXTRACT-MIN($Q$) mengeluarkan simpul berfrekuensi terkecil, disimpan di $x$, dan menjadi **anak kiri** $z$.

::slide Langkah 6: anak kanan
EXTRACT-MIN($Q$) sekali lagi mengeluarkan simpul berfrekuensi terkecil berikutnya, disimpan di $y$, dan menjadi **anak kanan** $z$.

::slide Langkah 7: frekuensi simpul baru
Frekuensi $z$ adalah jumlah frekuensi kedua anaknya: $z.freq = x.freq + y.freq$.

::slide Langkah 8: kembali ke antrean
$z$ dimasukkan kembali ke $Q$ pada urutan yang sesuai frekuensinya. Setelah itu perulangan kembali ke langkah 3 untuk putaran berikutnya.

::slide Langkah 9: hasil
Setelah $n - 1$ putaran, $Q$ hanya berisi satu simpul, yaitu **akar** pohon Huffman. Simpul itu dikeluarkan dan dikembalikan sebagai hasil.
:::

:::quiz Cek pemahaman: prosedur HUFFMAN
::question Berapa kali perulangan pada langkah 3 dijalankan jika ada 6 jenis karakter?
- [ ] 6 kali
- [x] 5 kali
- [ ] 7 kali
::explain
Perulangan berjalan $n - 1 = 5$ kali. Tiap putaran mengganti dua simpul dengan satu simpul gabungan, jadi isi $Q$ turun dari 6 menjadi 1 setelah 5 putaran.
::question Simpul yang dikeluarkan pertama oleh EXTRACT-MIN pada tiap putaran menjadi...
- [x] Anak kiri $z$
- [ ] Anak kanan $z$
- [ ] Akar pohon
::explain
Pada langkah 5, hasil EXTRACT-MIN pertama disimpan di $x$ dan menjadi $z.left$. Hasil kedua di langkah 6 menjadi $z.right$.
::question Apa isi $Q$ setelah perulangan selesai?
- [ ] Semua daun pohon
- [x] Satu simpul, yaitu akar pohon Huffman
- [ ] Kosong
::explain
Langkah 9 memanggil EXTRACT-MIN sekali lagi untuk mengambil satu-satunya simpul yang tersisa di $Q$, yaitu akar pohon Huffman.
:::

## D. Contoh Penelusuran

Berikut hasil tiap langkah HUFFMAN untuk data pada bagian A: a:45, b:13, c:12, d:16, e:9, f:5. Gambar menunjukkan isi $Q$ dari kiri ke kanan. Pohon kecil adalah simpul gabungan. Angka 0 dan 1 pada garis menandai anak kiri dan anak kanan.

:::steps Isi Q pada tiap tahap
::slide Setelah langkah 2: antrean awal
$Q$ berisi enam daun yang sudah terurut naik menurut frekuensi.

![Antrean Q berisi enam simpul daun terurut naik: f:5, e:9, c:12, b:13, d:16, a:45.](/materi/greedy-huffman/q-awal.png)

::slide Putaran 1 (i = 1)
Dikeluarkan f:5 (anak kiri) dan e:9 (anak kanan). Simpul baru bernilai $5 + 9 = 14$ disisipkan di antara b:13 dan d:16.

![Q setelah putaran 1, dari kiri ke kanan: c:12, b:13, simpul 14 dengan anak kiri f:5 dan anak kanan e:9, d:16, a:45.](/materi/greedy-huffman/q-loop1.png)

::slide Putaran 2 (i = 2)
Dikeluarkan c:12 (anak kiri) dan b:13 (anak kanan). Simpul baru bernilai $12 + 13 = 25$ disisipkan di antara d:16 dan a:45.

![Q setelah putaran 2, dari kiri ke kanan: simpul 14 dengan anak f:5 dan e:9, d:16, simpul 25 dengan anak kiri c:12 dan anak kanan b:13, a:45.](/materi/greedy-huffman/q-loop2.png)

::slide Putaran 3 (i = 3)
Dikeluarkan simpul 14 (anak kiri) dan d:16 (anak kanan). Simpul baru bernilai $14 + 16 = 30$ disisipkan di antara simpul 25 dan a:45.

![Q setelah putaran 3, dari kiri ke kanan: simpul 25 dengan anak c:12 dan b:13, simpul 30 dengan anak kiri simpul 14 (anak f:5 dan e:9) dan anak kanan d:16, a:45.](/materi/greedy-huffman/q-loop3.png)

::slide Putaran 4 (i = 4)
Dikeluarkan simpul 25 (anak kiri) dan simpul 30 (anak kanan). Simpul baru bernilai $25 + 30 = 55$. Sekarang $Q$ hanya berisi a:45 dan simpul 55.

![Q setelah putaran 4: a:45, lalu simpul 55 dengan anak kiri simpul 25 (anak c:12 dan b:13) dan anak kanan simpul 30 (anak kiri simpul 14 dengan anak f:5 dan e:9, anak kanan d:16).](/materi/greedy-huffman/q-loop4.png)

::slide Putaran 5 (i = 5)
Dikeluarkan a:45 (anak kiri) dan simpul 55 (anak kanan). Simpul baru bernilai $45 + 55 = 100$ menjadi **akar** pohon. Langkah 9 mengembalikannya.

![Pohon Huffman akhir. Akar 100 beranak kiri a:45 dan beranak kanan simpul 55. Simpul 55 beranak kiri simpul 25 (anak c:12 dan b:13) dan beranak kanan simpul 30. Simpul 30 beranak kiri simpul 14 (anak f:5 dan e:9) dan beranak kanan d:16. Garis ke anak kiri berlabel 0 dan ke anak kanan berlabel 1.](/materi/greedy-huffman/pohon-huffman.png)
:::

Tabel berikut meringkas keenam tahap itu, dengan isi $Q$ ditulis dari frekuensi terkecil.

| Tahap | Yang digabung ($x$, $y$) | $z.freq$ | Isi $Q$ sesudahnya |
| --- | --- | --- | --- |
| Langkah 2 | | | f:5, e:9, c:12, b:13, d:16, a:45 |
| $i = 1$ | f:5 dan e:9 | 14 | c:12, b:13, 14, d:16, a:45 |
| $i = 2$ | c:12 dan b:13 | 25 | 14, d:16, 25, a:45 |
| $i = 3$ | 14 dan d:16 | 30 | 25, 30, a:45 |
| $i = 4$ | 25 dan 30 | 55 | a:45, 55 |
| $i = 5$ | a:45 dan 55 | 100 | 100 (akar) |

:::quiz Cek pemahaman: penelusuran
::question Pada putaran 1, dua simpul mana yang digabung?
- [ ] a:45 dan d:16
- [x] f:5 dan e:9
- [ ] c:12 dan b:13
::explain
Dua frekuensi terkecil pada antrean awal adalah f:5 dan e:9. Gabungannya bernilai 14.
::question Pada putaran 3, simpul baru bernilai 30. Dari gabungan apa?
- [ ] 25 dan d:16
- [x] 14 dan d:16
- [ ] 14 dan 25
::explain
Sebelum putaran 3, $Q$ berisi 14, d:16, 25, a:45. Dua yang terkecil adalah 14 dan d:16, jumlahnya 30.
::question Mengapa pada putaran 5 a:45 menjadi anak kiri dan simpul 55 menjadi anak kanan?
- [ ] Karena a adalah huruf dan 55 adalah angka
- [x] Karena a:45 lebih kecil dari 55, jadi dikeluarkan lebih dulu oleh EXTRACT-MIN
- [ ] Karena simpul daun selalu di kiri
::explain
Anak kiri adalah hasil EXTRACT-MIN pertama, yaitu simpul yang frekuensinya paling kecil. Karena $45 < 55$, a:45 keluar lebih dulu dan menjadi anak kiri.
:::

### Peraga: Penelusuran HUFFMAN

Peraga di bawah ini menjalankan pseudocode HUFFMAN baris demi baris. Nomor baris yang menyala sama dengan nomor langkah di bagian C. Isian awalnya adalah contoh materi (a:45, b:13, c:12, d:16, e:9, f:5), jadi seluruh langkahnya (34 langkah) bisa dibandingkan dengan slide dan tabel di atas.

- Daftar **Isi Q** menunjukkan antrean yang selalu terurut naik. Daun ditulis `simbol:frekuensi` (misalnya f:5), dan simbol gabungan ditulis `zk:frekuensi`, dengan $k$ putaran pembuatannya (misalnya z1:14).
- Setelah baris 5 dan 6, array kedua menunjukkan simpul **x** (anak kiri) dan **y** (anak kanan) yang baru dikeluarkan dari Q. Setelah baris 8, simpul baru **z** bertanda di dalam Q.
- Di langkah terakhir muncul kode tiap simbol dan biaya totalnya.
- Isiannya pasangan `simbol:frekuensi` dipisah koma, 2 sampai 8 simbol berbeda, frekuensi 1 sampai 99. Coba tombol "Frekuensi sama" untuk melihat aturan seri: simpul yang lebih dulu dibuat dikeluarkan lebih dulu.

::trace huffman

## E. Kode Huffman dari Pohon

Pohon Huffman yang sudah jadi dipakai untuk membaca kode tiap karakter. Beri label **0** pada garis ke anak kiri dan **1** pada garis ke anak kanan. Kode sebuah karakter adalah deretan label dari **akar** sampai **daun** karakter itu.

| Karakter | Jalur dari akar | Kode | Panjang |
| --- | --- | --- | --- |
| a | kiri | `0` | 1 |
| b | kanan, kiri, kanan | `101` | 3 |
| c | kanan, kiri, kiri | `100` | 3 |
| d | kanan, kanan, kanan | `111` | 3 |
| e | kanan, kanan, kiri, kanan | `1101` | 4 |
| f | kanan, kanan, kiri, kiri | `1100` | 4 |

Hasilnya sama dengan *variable-length codeword* pada bagian A. Sifat prefiks otomatis terpenuhi, karena semua karakter berada di **daun**. Jalur menuju sebuah daun tidak pernah melewati daun lain, jadi kode sebuah karakter tidak mungkin menjadi awalan kode karakter lain.

### Menghitung Biaya dari Tabel Kode

Biaya total adalah jumlah (frekuensi $\times$ panjang kode) untuk semua karakter:

| Karakter | Frekuensi (ribuan) | Kode | Panjang | Frekuensi $\times$ panjang |
| --- | --- | --- | --- | --- |
| a | 45 | `0` | 1 | 45 |
| b | 13 | `101` | 3 | 39 |
| c | 12 | `100` | 3 | 36 |
| d | 16 | `111` | 3 | 48 |
| e | 9 | `1101` | 4 | 36 |
| f | 5 | `1100` | 4 | 20 |
| **Total** | | | | **224** |

### Menghitung Biaya dari Simpul Gabungan

Ada cara yang lebih cepat: jumlahkan **frekuensi semua simpul gabungan** yang dibuat HUFFMAN, yaitu nilai $z.freq$ pada tiap putaran:

$$
14 + 25 + 30 + 55 + 100 = 224
$$

Hasilnya sama dengan 224. Alasannya, sebuah daun yang berada di kedalaman $d$ punya tepat $d$ simpul gabungan di atasnya, dan frekuensi daun itu ikut dijumlahkan di tiap simpul gabungan tersebut. Jadi frekuensi daun terhitung sebanyak $d$ kali, sama dengan frekuensi $\times$ panjang kodenya. Cara inilah yang dipakai pada soal challenge di akhir materi.

### Perbandingan dengan Pohon Panjang Bit Tetap

Gambar berikut adalah pohon biner untuk *fixed-length codeword* (a = 000, b = 001, c = 010, d = 011, e = 100, f = 101). Semua daun berada di kedalaman yang sama, yaitu 3.

![Pohon biner untuk kode panjang bit tetap. Akar 100 beranak kiri simpul 86 dan beranak kanan simpul 14. Simpul 86 beranak kiri simpul 58 (anak a:45 dan b:13) dan beranak kanan simpul 28 (anak c:12 dan d:16). Simpul 14 hanya punya anak kiri, yaitu simpul 14 lain yang beranak e:9 dan f:5. Semua daun berada di kedalaman 3.](/materi/greedy-huffman/pohon-panjang-tetap.png)

Perhatikan simpul 14 di sisi kanan akar: simpul itu hanya punya **satu anak**. Pohon seperti ini boros, karena kode `11` tidak dipakai sama sekali. Pohon Huffman tidak punya simpul yang beranak tunggal. Tiap simpul dalamnya selalu punya dua anak, karena dibuat dari penggabungan dua simpul. Selain itu, karakter a yang paling sering muncul berada di kedalaman 1, bukan 3.

### Waktu Eksekusi

Perulangan berjalan $n - 1$ kali. Tiap putaran memanggil EXTRACT-MIN dua kali dan INSERT satu kali. Jika $Q$ diimplementasikan sebagai *min-heap*, ketiga operasi itu masing-masing $O(\lg n)$, sehingga seluruh algoritma membutuhkan waktu $O(n \lg n)$. Jika $Q$ berupa array terurut seperti pada gambar-gambar di bagian D, INSERT butuh $O(n)$ dan totalnya $O(n^2)$.

:::quiz Cek pemahaman: kode dan biaya
::question Berapa kode Huffman untuk karakter d pada contoh?
- [ ] `101`
- [x] `111`
- [ ] `1101`
::explain
Dari akar ke d: kanan (ke simpul 55), kanan (ke simpul 30), kanan (ke d). Labelnya 1, 1, 1.
::question Jika frekuensi f naik sehingga jadi karakter yang paling sering muncul, apa yang terjadi pada kodenya?
- [ ] Tetap 1100
- [x] Cenderung menjadi lebih pendek
- [ ] Cenderung menjadi lebih panjang
::explain
Huffman memberi kode paling pendek kepada karakter yang paling sering muncul. Karena frekuensi besar baru digabung belakangan, daunnya berakhir dekat akar.
::question Jumlah semua nilai $z.freq$ pada contoh adalah $14 + 25 + 30 + 55 + 100$. Apa arti hasilnya?
- [ ] Banyaknya karakter berbeda
- [x] Biaya total kode, sama dengan jumlah (frekuensi $\times$ panjang kode)
- [ ] Tinggi pohon
::explain
Tiap daun dihitung sebanyak kedalamannya, yaitu panjang kodenya. Hasilnya 224, sama dengan total pada tabel kode.
::question Berapa total bit yang dihemat kode Huffman dibandingkan *fixed-length* pada contoh ini?
- [ ] 224.000 bit
- [ ] 124.000 bit
- [x] 76.000 bit
::explain
$300.000 - 224.000 = 76.000$ bit, atau sekitar 25,3% dari ukuran *fixed-length*.
:::

## F. Mencoba Visualisasi

Visualisasi di bawah ini menjalankan algoritma HUFFMAN langkah demi langkah. Pohon-pohon yang sudah ada digambar **berdampingan**: yang sedang diproses di kiri, disusul isi antrean prioritas dari frekuensi terkecil. Panel antrean menunjukkan isi $Q$ pada tiap langkah.

Beberapa hal agar tidak bingung membandingkan dengan materi:

- Isian awal memakai frekuensi yang sama dengan contoh, tetapi **namanya lain**: A:5, B:9, C:12, D:13, E:16, F:45. Jadi A di visualisasi adalah f di materi, B adalah e, C adalah c, D adalah b, E adalah d, dan F adalah a. Pohon akhirnya sama, dan kode yang tampil (F = `0`, C = `100`, D = `101`, E = `111`, B = `1101`, A = `1100`) sama dengan tabel di bagian E.
- Isiannya pasangan `simbol:frekuensi` dipisah koma. Setiap simbol satu karakter dan berbeda-beda, jumlahnya 2 sampai 8 simbol, dan frekuensinya 1 sampai 99.
- Jika dua simpul berfrekuensi sama, simpul yang **lebih dulu dibuat** dikeluarkan lebih dulu. Coba contoh siap pakai "Frekuensi sama (4 simbol)" di panel "Ubah masukan" untuk melihat pengaruhnya. Aturan seri ini tidak ditentukan oleh pseudocode, dan bentuk pohonnya bisa berbeda tergantung aturan itu, tetapi biaya totalnya tetap sama.
- Kode di visualisasi memakai nama `kiri` dan `kanan` serta `queue.extractMin()` dan `queue.insert()`. Isinya sama dengan pseudocode di bagian C, tetapi nomor barisnya berbeda.

::visualizer

## G. Rangkuman

| Hal | Isi |
| --- | --- |
| Kompresi data | Memperkecil ukuran data dengan mengurangi bit per karakter |
| *Fixed-length codeword* | Semua karakter berkode sama panjang. Contoh: 6 karakter, 3 bit, 300.000 bit |
| *Variable-length codeword* | Panjang kode berbeda-beda. Pada contoh 224.000 bit, hemat sekitar 25,3% |
| Kode Huffman | Karakter yang sering muncul dapat kode pendek, yang jarang muncul dapat kode panjang |
| Kode prefiks | Tidak ada kode yang menjadi awalan kode lain, sehingga selalu bisa di-*decode* |
| HUFFMAN($C$) | Ulangi $n - 1$ kali: ambil dua simpul berfrekuensi terkecil, gabungkan, masukkan kembali |
| Pohon | Daun adalah karakter. Anak kiri berlabel 0, anak kanan berlabel 1 |
| Hasil contoh | a = `0`, b = `101`, c = `100`, d = `111`, e = `1101`, f = `1100` |
| Biaya | $\sum f(c) \cdot$ panjang kode $= 224$, sama dengan jumlah semua $z.freq$ |
| Waktu | $O(n \lg n)$ dengan *min-heap* |

Cara cepat mengingat: **gabungkan dua yang terkecil, ulangi sampai tinggal satu**. Sekarang coba kerjakan soal challenge di bawah.

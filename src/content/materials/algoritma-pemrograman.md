## A. Pendahuluan

Dalam sejarahnya, algoritma ditemukan oleh Al-Khawarizmi untuk memecahkan serangkaian rumus yang kompleks pada masanya. Beberapa waktu kemudian, algoritma diterapkan pada mesin oleh Alan Turing untuk membuktikan bahwa mesin juga dapat menerapkan algoritma yang ada.

Pilih tab di bawah untuk membaca pengertian algoritma, pemrograman, dan hubungan keduanya.

:::tabs Algoritma, pemrograman, dan hubungan keduanya
::tab Algoritma
**Algoritma** adalah urutan langkah logis yang digunakan untuk menyelesaikan suatu masalah.

Dalam penyelesaian masalah menggunakan komputer, algoritma adalah urutan langkah-langkah komputasi untuk mengubah **input** (masukan) menjadi **output** (keluaran). Algoritma dibutuhkan untuk memerintah komputer melakukan langkah-langkah tertentu dalam menyelesaikan masalah.

::tab Pemrograman
**Pemrograman** adalah proses menciptakan program komputer dengan menggunakan bahasa pemrograman yang sesuai. **Program** adalah kumpulan instruksi yang mengikuti algoritma untuk menginstruksikan komputer melakukan tugas tertentu.

Pemrograman mencakup:

- menulis kode,
- menguji program,
- *debugging*, yaitu proses mengidentifikasi dan menghapus *bug* atau *error* di dalam kode,
- membuat solusi yang dapat dijalankan oleh komputer.

::tab Hubungan keduanya
Dalam rangka menciptakan program, algoritma digunakan sebagai panduan untuk merancang instruksi-instruksi yang efisien dan logis dalam bahasa pemrograman tertentu.

Algoritma memberikan panduan tentang **apa yang harus dilakukan** oleh program, sedangkan pemrograman melibatkan **menerjemahkan** panduan tersebut ke dalam bahasa yang bisa dimengerti oleh komputer.
:::

### Karakteristik Algoritma

Dalam menyelesaikan suatu masalah, algoritma memiliki enam karakteristik penting. Geser satu per satu dengan tombol panah.

:::steps Enam karakteristik algoritma
::slide Finiteness (Keterbatasan)
Algoritma harus memiliki jumlah langkah yang **terbatas**, artinya harus dapat diselesaikan dalam jumlah langkah yang terbatas.

Program yang tidak pernah berhenti atau tidak ada batasnya merupakan program dengan isi algoritma yang salah. Itulah mengapa algoritma harus mempunyai ciri *finiteness*.

::slide Input (Masukan)
Sebuah algoritma memiliki **nol atau lebih** *input*.

*Input* adalah besaran nilai yang diberikan kepada algoritma sebelum dijalankan.

::slide Output (Keluaran)
Sebuah algoritma memiliki **satu atau lebih** *output*.

*Output* adalah besaran nilai yang memiliki hubungan dengan *input*, yaitu berupa solusi atau penyelesaian dari suatu masalah.

**Contoh:** algoritma untuk menghitung luas segitiga diberi dua *input*, yaitu alas = 8 dan tinggi = 6. Maka *output*-nya harus 24.

::slide Definiteness (Kepastian)
Setiap langkah harus didefinisikan secara tepat dan tidak boleh membingungkan (*ambiguous*). Dengan kata lain, pembuat program harus mengerti apa tujuan yang dimaksud.

**Contoh 1:** saat membuat algoritma untuk menghitung luas segitiga, pembuat program harus tahu bahwa yang di-*input*-kan adalah angka, bukan teks.

**Contoh 2:** algoritma untuk menghitung **banyak bilangan** dari *n* bilangan sembarang yang dijadikan masukan memerlukan langkah berikut:

- Buat variabel bernama `jumlahbil` dengan nilai awal nol (`jumlahbil = 0`).
- Setiap membaca satu masukan, lakukan `jumlahbil = jumlahbil + 1`.

::slide Effectiveness (Keefektifan)
Setiap langkah dalam algoritma harus dapat dilakukan dengan jelas dan dalam waktu yang wajar. Dengan kata lain, algoritma harus **efektif** dan **efisien**.

- Setiap langkah sesederhana mungkin, sehingga dapat dikerjakan dalam waktu yang relatif efisien dan masuk akal.
- Algoritma dikatakan **efisien** jika waktu prosesnya relatif lebih singkat dan penggunaan memorinya lebih sedikit.
- Algoritma dikatakan **efektif** apabila ia mempunyai solusi dari permasalahan yang diselesaikan, dan sesuai dengan masalah yang dihadapi.

::slide Structured (Terstruktur)
Algoritma harus terstruktur: urutan baris langkahnya disusun secara sistematis, sehingga proses penyelesaiannya tidak kemana-mana atau berbelit-belit dan relatif lebih singkat.

Bagian dari proses tersebut dapat dibedakan dengan jelas, yaitu ***input***, ***proses***, dan ***output***. Dengan demikian, kita lebih mudah memeriksa ulang algoritma.
:::

:::quiz Cek pemahaman: karakteristik algoritma
::question Sebuah program berulang tanpa pernah berhenti. Karakteristik algoritma mana yang dilanggar?
- [x] Finiteness (keterbatasan)
- [ ] Definiteness (kepastian)
- [ ] Structured (terstruktur)
::explain
Algoritma harus selesai dalam jumlah langkah yang terbatas. Program yang tidak pernah berhenti melanggar *finiteness*.
::question Algoritma luas segitiga diberi alas 8 dan tinggi 6. Berapa output yang benar?
- [ ] 14
- [ ] 48
- [x] 24
::explain
$\text{Luas segitiga} = \frac{1}{2} \times \text{alas} \times \text{tinggi} = \frac{1}{2} \times 8 \times 6 = 24$.
::question Berapa jumlah input dan output yang dimiliki sebuah algoritma?
- [ ] Tepat satu input dan tepat satu output
- [x] Nol atau lebih input, dan satu atau lebih output
- [ ] Satu atau lebih input, dan nol atau lebih output
::explain
Algoritma boleh tidak memiliki input, tetapi harus menghasilkan minimal satu output yang berupa solusi masalahnya.
:::

## B. Cara Penulisan Algoritma

Ada tiga cara menuliskan algoritma. Untuk membandingkannya, kita memakai satu masalah yang sama: **menentukan bilangan terbesar dari tiga bilangan sembarang**.

:::tabs Tiga cara menulis algoritma
::tab Naratif
Ditulis dalam bahasa natural (bahasa Indonesia, bahasa Inggris, atau bahasa manusia lainnya). Kendalanya, cara ini sering membingungkan (*ambiguous*).

Langkah-langkahnya dalam bahasa Indonesia:

1. Ambil bilangan pertama dan tetapkan `maks` sama dengan bilangan pertama.
2. Ambil bilangan kedua dan bandingkan dengan `maks`.
3. Apabila bilangan kedua lebih besar dari `maks`, tetapkan `maks` sama dengan bilangan kedua.
4. Ambil bilangan ketiga dan bandingkan dengan `maks`.
5. Apabila bilangan ketiga lebih besar dari `maks`, tetapkan `maks` sama dengan bilangan ketiga.
6. Variabel `maks` berisi bilangan terbesar.
7. Tayangkan hasilnya.

::tab Flowchart
*Flowchart* (diagram alir) menyajikan algoritma dalam urutan simbol-simbol khusus yang digambarkan sesuai arah tanda panah. Secara visual mudah dipahami, tetapi merepotkan dibuat jika algoritmanya panjang.

![Diagram alir menentukan bilangan terbesar dari tiga bilangan: mulai, masukan bil1, bil2, bil3, lalu max sama dengan bil1, jika max lebih kecil dari bil2 maka max sama dengan bil2, jika max lebih kecil dari bil3 maka max sama dengan bil3, BilTerbesar sama dengan max, tampilkan BilTerbesar, selesai.](/materi/algoritma-pemrograman/flowchart-bilangan-terbesar.png)

**Gambar 1.** Bentuk *flowchart* untuk menentukan bilangan terbesar dari tiga bilangan sembarang.

Urutan simbol pada diagram, dari atas ke bawah:

1. **Mulai.**
2. **Masukan:** bil1, bil2, bil3, max, BilTerbesar.
3. **Proses:** max = bil1.
4. **Keputusan:** apakah max < bil2? Jika **Ya**, max = bil2. Jika **Tidak**, lanjut ke langkah berikutnya.
5. **Keputusan:** apakah max < bil3? Jika **Ya**, max = bil3. Jika **Tidak**, lanjut ke langkah berikutnya.
6. **Proses:** BilTerbesar = max.
7. **Keluaran:** tampilkan BilTerbesar.
8. **Selesai.**

::tab Pseudocode
Penulisannya mendekati bahasa pemrograman, tetapi sulit dimengerti oleh orang yang tidak mengerti pemrograman. *Pseudocode* tidak spesifik terhadap satu bahasa pemrograman, sehingga algoritma ini dapat diterjemahkan ke bahasa pemrograman apa pun yang dipakai dalam suatu program.

```text
BILANGAN_MAX(bil1, bil2, bil3)
1  max = bil1
2  if (max < bil2)
3      then max = bil2
4  if (max < bil3)
5      then max = bil3
6  return max
```

Keterangan:

- `BILANGAN_MAX( )` disebut **nama fungsi** atau *method*.
- Variabel di dalam tanda kurung, yaitu `bil1`, `bil2`, dan `bil3`, disebut **parameter masukan**.
:::

### Aturan Menulis Pseudocode

Jika tanda "=" menjadi persyaratan dalam pernyataan `if` atau `while`, tulis dengan tanda sama dengan dua kali (`==`).

| Pernyataan | Pseudocode |
| --- | --- |
| jika n modulo 2 sama dengan 0 | `if (n mod 2 == 0)` |
| jika max lebih kecil dari bil2, maka max sama dengan bil2 | `if (max < bil2)` lalu `then max = bil2` |

Jika sebuah pernyataan masih menjadi bagian dari pengulangan (*looping*) atau *true conditional*, tulis lebih menjorok ke dalam:

```text
if (max < bil2)
    then max = bil2
```

### Menjalankan Algoritma

Untuk mengetahui apakah algoritma menghasilkan *output* yang benar, algoritma dijalankan dengan memberikan nilai masukan. Misalkan `bil1 = 7`, `bil2 = 4`, dan `bil3 = 10`, maka nilai `max` yang dihasilkan adalah 10.

Jalankan langkah demi langkah dengan tombol **Berikutnya**, lalu coba nilai lain. Perhatikan baris mana yang dilewati saat kondisinya FALSE.

::trace bilangan-max

**Kesimpulan:** algoritma `BILANGAN_MAX(bil1, bil2, bil3)` menghasilkan *output* yang benar.

## C. Struktur Algoritma

Struktur algoritma adalah cara algoritma diorganisasi dan diatur. Struktur yang baik membuat algoritma lebih efisien, mudah dipahami, dan mudah diubah jika diperlukan. Ada tiga struktur yang sering digunakan:

:::tabs Tiga struktur algoritma
::tab Berurutan (Sequential)
Struktur algoritma paling sederhana: langkah-langkah dieksekusi **secara berurutan**, satu demi satu.

**Contoh:** menghitung luas segitiga.

```text
1  baca alas, tinggi
2  luas = alas * tinggi / 2
3  tampilkan luas
```

::tab Percabangan (Selection)
Struktur ini dipakai untuk **mengambil keputusan** berdasarkan kondisi tertentu. Biasanya diimplementasikan dengan pernyataan `if-else` atau `switch`. Algoritma memilih salah satu cabang eksekusi berdasarkan kondisi yang terpenuhi.

**Contoh:** lihat kembali algoritma untuk menentukan bilangan terbesar dari tiga bilangan pada bagian B. Baris `if (max < bil2)` dan `if (max < bil3)` memilih apakah nilai `max` perlu diganti.

::tab Pengulangan (Iteration/Loop)
Struktur ini memungkinkan algoritma **mengulang** sekelompok langkah sampai kondisi tertentu terpenuhi. Ada berbagai jenis *loop*, seperti `for`, `while`, dan `do-while`.

**Contoh masalah:** tentukan jumlah dari *n* bilangan yang tersimpan dalam sebuah *array* (larik) A berukuran $1 \times n$. Misalkan ada 3 bilangan yang tersimpan sebagai berikut:

| Index | 1 | 2 | 3 |
| --- | --- | --- | --- |
| A | 20 | 35 | 15 |

Jadi A[1] = 20, A[2] = 35, dan A[3] = 15. Algoritmanya dalam bentuk *pseudocode*:

```text
JUMLAH_n_BIL(A)
1  jumlah = 0
2  for i = 1 to n
3      jumlah = jumlah + A[i]
4  return jumlah
```

Pada baris 3, `jumlah` di ruas kiri adalah nilai `jumlah` yang baru, sedangkan `jumlah` di ruas kanan adalah nilai `jumlah` yang lama.

Langkah 2 untuk i = 1, 2, dan 3 akan mengulang langkah 3. Pada saat i = 4, algoritma langsung menjalankan langkah 4. Dengan masukan 20, 35, dan 15, hasil langkah 3 berturut-turut adalah 20, 55, dan 70, sehingga hasil akhirnya `jumlah = 70`.

Coba jalankan sendiri:

::trace jumlah-n-bil
:::

:::quiz Cek pemahaman: struktur algoritma
::question Pada JUMLAH_n_BIL dengan n = 3, berapa kali baris `jumlah = jumlah + A[i]` dijalankan?
- [ ] 1 kali
- [x] 3 kali
- [ ] 4 kali
::explain
Baris itu dijalankan untuk i = 1, 2, dan 3. Pada i = 4 kondisi perulangan tidak terpenuhi, sehingga algoritma langsung ke baris 4.
::question Struktur algoritma apa yang dipakai pernyataan `if` pada BILANGAN_MAX?
- [ ] Berurutan (sequential)
- [x] Percabangan (selection)
- [ ] Pengulangan (loop)
::explain
Pernyataan `if` memilih satu cabang eksekusi berdasarkan kondisi, yaitu struktur percabangan.
:::

## D. Kompleksitas Algoritma

Kompleksitas algoritma mengacu pada analisis tentang seberapa efisien suatu algoritma dalam hal waktu dan ruang yang dibutuhkan untuk menyelesaikan masalah seiring dengan ukuran *input*-nya. Notasi kompleksitas di bawah ini ditulis dalam bentuk Big-Oh ($O$).

Geser ukuran input *n* dan perhatikan bagaimana nilai tiap kelas tumbuh. Kelas yang tumbuh paling lambat adalah yang paling efisien.

::growth

Semakin rendah kompleksitas algoritma, semakin efisien algoritma tersebut dalam menangani *input* yang besar. Sebagai contoh, dalam permasalahan pengurutan bilangan, algoritma *Merge-Sort* lebih efisien dibanding algoritma *Insertion-Sort*.

:::quiz Cek pemahaman: kompleksitas
::question Untuk mengurutkan input yang sangat besar, algoritma mana yang lebih efisien?
- [ ] Insertion-Sort dengan $O(n^2)$
- [x] Merge-Sort dengan $O(n \log n)$
- [ ] Keduanya sama saja
::explain
Untuk $n$ besar, $n \log n$ tumbuh jauh lebih lambat daripada $n^2$. Coba geser nilai $n$ pada tabel di atas untuk melihat bedanya.
::question Mengakses elemen array dengan indeks tertentu termasuk kompleksitas apa?
- [x] $O(1)$, konstanta
- [ ] $O(n)$, linier
- [ ] $O(\log n)$, logaritmik
::explain
Waktu aksesnya tetap, tidak bergantung pada ukuran array.
:::

## E. Algoritma Iteratif dan Rekursif

Dalam membuat algoritma sebagai langkah penyelesaian suatu permasalahan, dapat digunakan langkah penyelesaian secara iteratif atau secara rekursif.

- **Algoritma iteratif** adalah pendekatan yang menggunakan perulangan atau iterasi untuk mengulangi langkah-langkah dalam penyelesaian masalah.
- **Algoritma rekursif** adalah pendekatan di mana sebuah fungsi memanggil dirinya sendiri untuk menyelesaikan masalah yang lebih kecil dari masalah asalnya.

### Contoh: Binary Search

Selidiki apakah suatu bilangan sembarang x terdapat di dalam array A yang berisi n bilangan dan sudah terurut dari kecil ke besar. Di sini p adalah indeks pertama array A dan n adalah indeks terakhirnya. Tanda $\lfloor\,\rfloor$ berarti pembulatan ke bawah.

:::tabs Binary Search: iteratif dan rekursif
::tab Iteratif
Penyelesaian dengan algoritma *Binary-Search* secara **iteratif**:

```text
BINARY-SEARCH(A, x, p, n)
1  while p ≤ n
2      mid = ⌊(p + n) / 2⌋
3      if (x == A[mid])
4          return mid
5      else if x > A[mid]
6          p = mid + 1
7      else n = mid - 1
8  return NIL   // bilangan x tidak ditemukan di dalam array A
```

::trace binary-search-iteratif

::tab Rekursif
Penyelesaian dengan algoritma *Binary-Search* secara **rekursif**:

```text
BINARY-SEARCH(A, x, p, n)
1  if p > n
2      return NIL   // bilangan x tidak ditemukan di dalam array A
3  mid = ⌊(p + n) / 2⌋
4  if (x == A[mid])
5      return mid
6  else if x > A[mid]
7      return BINARY-SEARCH(A, x, mid + 1, n)
8  else return BINARY-SEARCH(A, x, p, mid - 1)
```

::trace binary-search-rekursif
:::

Dua peraga di atas menelusuri **pseudocode** baris demi baris. Untuk melihat bagaimana rentang pencarian menyempit pada diagram batang, lanjutkan ke visualisasi berikut. Dua hal perlu diperhatikan agar tidak membingungkan:

- Pada visualisasi, indeks array dimulai dari **0** seperti array JavaScript, sedangkan pseudocode dan peraga di atas memulai indeks dari **1** seperti di materi.
- Variabel `p` dan `n` pada pseudocode bernama `lo` dan `hi` pada kode visualisasi.

::visualizer

## F. Latihan Binary Search

Jalankan algoritma *Binary-Search* secara iteratif maupun rekursif, jika diberikan *input* bilangan x = 12 dan array A berisi bilangan (5, 8, 9, 10, 14, 20). Langkah algoritma benar jika hasil *output* adalah NIL.

Dua peraga pseudocode dan visualisasi batang sudah terisi dengan soal ini, jadi Anda bisa mencocokkan hasil Anda dengan menekan **Berikutnya** sampai akhir.

:::reveal Lihat jawaban latihan
Dengan x = 12 dan A = (5, 8, 9, 10, 14, 20), pemeriksaan berlangsung seperti ini:

| p | n | mid | A[mid] | Perbandingan | Tindakan |
| --- | --- | --- | --- | --- | --- |
| 1 | 6 | 3 | 9 | 12 > 9 | p = mid + 1 = 4 |
| 4 | 6 | 5 | 14 | 12 < 14 | n = mid - 1 = 4 |
| 4 | 4 | 4 | 10 | 12 > 10 | p = mid + 1 = 5 |
| 5 | 4 | – | – | p > n | return NIL |

Pada pemeriksaan terakhir p = 5 lebih besar dari n = 4, sehingga rentang pencarian kosong dan algoritma mengembalikan **NIL**. Bilangan 12 memang tidak ada di dalam array A.
:::

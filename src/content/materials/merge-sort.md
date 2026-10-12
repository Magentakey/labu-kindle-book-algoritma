## A. Konsep Divide and Conquer

Materi ini mengacu pada buku Thomas H. Cormen, halaman 30 sampai 37. Algoritma *Divide and Conquer* menyelesaikan suatu masalah dalam tiga tahap. Geser slide satu per satu untuk membacanya.

:::steps Tiga tahap Divide and Conquer
::slide 1. Divide
***Divide*** : membagi masalah menjadi beberapa submasalah.

::slide 2. Conquer
***Conquer*** : menyelesaikan masing-masing submasalah (secara rekursif).

::slide 3. Combine
***Combine*** : menggabungkan solusi masing-masing submasalah sehingga membentuk solusi masalah semula.
:::

Algoritma *Divide and Conquer* diterapkan, antara lain, pada permasalahan mengurutkan n bilangan (*sorting*) yang disimpan dalam sebuah *array* A satu dimensi (berukuran 1 x n). Contohnya adalah algoritma **Merge Sort**, yaitu mengurutkan n bilangan yang disimpan dalam *array* A dari kecil ke besar.

| Tahap | Secara umum | Pada Merge Sort |
| --- | --- | --- |
| Divide | Membagi masalah menjadi beberapa submasalah | Membagi *array* A yang berisi n bilangan menjadi 2 *sub-array* |
| Conquer | Menyelesaikan tiap submasalah secara rekursif | Mengurutkan bilangan di dalam masing-masing *sub-array* (secara rekursif) |
| Combine | Menggabungkan solusi submasalah | Menggabungkan kedua *sub-array* sehingga n bilangan di dalam *array* A terurut dari kecil ke besar |

:::quiz Cek pemahaman: Divide and Conquer
::question Pada Merge Sort, tahap apa yang menggabungkan dua sub-array yang sudah terurut menjadi satu array terurut?
- [ ] Divide
- [ ] Conquer
- [x] Combine
::explain
Tahap Combine menggabungkan solusi dari tiap sub-array, yaitu dua array yang sudah terurut, menjadi satu array terurut.
::question Pada Merge Sort, apa yang dilakukan tahap Conquer?
- [ ] Membagi array menjadi dua bagian
- [x] Mengurutkan bilangan di dalam masing-masing sub-array secara rekursif
- [ ] Menggabungkan dua array yang sudah terurut
::explain
Conquer menyelesaikan tiap submasalah, yaitu mengurutkan masing-masing sub-array dengan memanggil algoritma yang sama.
:::

## B. Algoritma Merge Sort

Berikut pseudocode Merge Sort dengan nama fungsi MERGE_SORT(A, p, r). A adalah *array* yang akan diurutkan, p adalah indeks pertama, dan r adalah indeks terakhir dari bagian *array* A yang diurutkan.

```pseudocode
if p < r
    then q = ⌊(p + r)/2⌋
    MERGE_SORT(A, p, q)
    MERGE_SORT(A, q+1, r)
    MERGE(A, p, q, r)
```

Penjelasan tiap langkah, dengan nomor yang sama seperti nomor baris di pinggir blok kode:

:::steps Arti tiap langkah MERGE_SORT
::slide Langkah 1: if p < r
Jika nilai p lebih kecil dari nilai r, bagian *array* itu berisi lebih dari satu bilangan sehingga masih perlu dibagi. Jika tidak (p sama dengan r), bagian itu hanya berisi satu bilangan dan sudah terurut, sehingga fungsi langsung selesai. Inilah kasus dasar rekursi.

::slide Langkah 2: q = ⌊(p + r)/2⌋
Membagi *array* A menjadi 2 *sub-array*. Tanda ⌊ ⌋ menyatakan pembulatan ke bawah, misalnya ⌊7/2⌋ = 3.

::slide Langkah 3: MERGE_SORT(A, p, q)
Fungsi memanggil dirinya sendiri sampai bilangan di dalam *array* A pada indeks p sampai q terurut dari kecil ke besar.

::slide Langkah 4: MERGE_SORT(A, q+1, r)
Fungsi memanggil dirinya sendiri sampai bilangan di dalam *array* A pada indeks q+1 sampai r terurut dari kecil ke besar.

::slide Langkah 5: MERGE(A, p, q, r)
Algoritma untuk menggabungkan dua *sub-array* yang masing-masing berisi bilangan yang sudah terurut dari kecil ke besar, menjadi satu *array* berisi bilangan yang sudah terurut dari kecil ke besar.
:::

### Contoh: Array dengan 7 Bilangan

Misalkan *array* A berisi 7 bilangan, yaitu:

```text
38  27  43  3  9  82  10
```

Gambar berikut menunjukkan pembagian *array* (panah merah ke bawah) sampai tiap bagian berisi satu bilangan, lalu penggabungan (panah hijau ke atas) sampai seluruh bilangan terurut.

![Diagram Merge Sort pada array 38, 27, 43, 3, 9, 82, 10. Array dibagi menjadi 38 27 43 3 dan 9 82 10, lalu terus dibagi sampai tiap bagian berisi satu bilangan. Penggabungan menghasilkan 27 38, 3 43, 9 82, dan 10, lalu 3 27 38 43 dan 9 10 82, dan akhirnya 3 9 10 27 38 43 82.](/materi/merge-sort/diagram-merge-sort.png)

Pada contoh di atas:

- p awal adalah 1 dan r awal adalah 7.
- Pada langkah 2 didapat nilai q = ⌊(1 + 7)/2⌋ = 4.
- Langkah 3 dan 4 adalah pemanggilan fungsi terhadap dirinya sendiri, jadi kembali ke langkah 1 dengan nilai p dan r yang baru. Pemanggilan itu berhenti apabila nilai p tidak lagi lebih kecil dari r. Artinya isi bilangan pada *array* A di indeks 1 sampai q dan di indeks q+1 sampai r masing-masing sudah terurut dari kecil ke besar.
- Langkah 5, MERGE(A, p, q, r), menggabungkan dua bagian (*array* A indeks p sampai q dengan *array* A indeks q+1 sampai r) menjadi satu *array* A yang berisi bilangan sudah terurut dari kecil ke besar.

### Algoritma MERGE

Pseudocode MERGE(A, p, q, r) ada di buku Thomas H. Cormen pada halaman 31, dan penjelasannya dibaca dari halaman 30 sampai 33. Gambar berikut memuat pseudocode itu.

![Pseudocode MERGE(A, p, q, r) dari buku Cormen halaman 31, 17 baris. Baris 1 sampai 2 menghitung n1 = q − p + 1 dan n2 = r − q. Baris 3 sampai 7 membuat array L dan R lalu menyalin A[p..q] ke L dan A[q+1..r] ke R. Baris 8 sampai 9 mengisi elemen terakhir L dan R dengan tak hingga. Baris 10 sampai 11 mengisi i dan j dengan 1. Baris 12 sampai 17 mengisi A[k] untuk k dari p sampai r dengan L[i] bila L[i] ≤ R[j], dan dengan R[j] bila tidak, sambil menambah i atau j.](/materi/merge-sort/pseudocode-merge.png)

Gagasannya, dua bagian yang sudah terurut disalin ke *array* L dan R, lalu tiap elemen A[k] diisi dengan yang lebih kecil dari elemen terdepan L dan R. Elemen terakhir L dan R diisi ∞ sebagai penanda, sehingga salah satu bagian yang habis lebih dulu tidak perlu diperiksa secara khusus.

:::quiz Cek pemahaman: algoritma Merge Sort
::question Pada MERGE_SORT(A, 1, 7), berapa nilai q pada langkah 2?
- [ ] 3
- [x] 4
- [ ] 7
::explain
q = ⌊(1 + 7)/2⌋ = ⌊8/2⌋ = 4. Jadi array dibagi menjadi indeks 1 sampai 4 dan indeks 5 sampai 7.
::question Pada MERGE_SORT(A, 3, 3), apa yang terjadi?
- [ ] Array dibagi menjadi dua bagian
- [x] Syarat p < r tidak terpenuhi, sehingga fungsi langsung selesai tanpa memanggil apa pun
- [ ] MERGE dipanggil dengan q = 3
::explain
Karena 3 tidak lebih kecil dari 3, bagian itu hanya berisi satu bilangan dan sudah terurut. Inilah kasus dasar rekursi.
::question Untuk apa elemen ∞ diisi di akhir array L dan R pada MERGE?
- [ ] Supaya array L dan R berukuran sama
- [x] Sebagai penanda, sehingga salah satu bagian yang habis lebih dulu tidak perlu diperiksa secara khusus
- [ ] Supaya hasil penggabungan terurut menurun
::explain
Nilai ∞ lebih besar dari semua bilangan di array. Setelah salah satu bagian habis, perbandingan selalu memilih elemen bagian yang lain.
:::

## C. Analisis Running Time

Running time Merge Sort disusun dari tiga tahap:

:::steps Menyusun running time Merge Sort
::slide 1. Divide: D(n)
Pada proses ***divide***, yaitu membagi persoalan menjadi 2 bagian, *running time*nya adalah konstanta, ditulis D(n) = Θ(1).

::slide 2. Conquer: 2T(n/2)
Pada proses ***conquer***, yaitu menyelesaikan setiap bagian, masing-masing bagian terdiri dari n/2 bilangan, maka *running time* untuk proses *conquer* adalah 2T(n/2).

::slide 3. Combine: C(n)
Pada proses ***combine***, yaitu menggabungkan 2 bagian yang sudah terurut menjadi n bilangan yang terurut, *running time*nya adalah Θ(n), ditulis C(n) = Θ(n).

::slide 4. Jumlahkan ketiganya
*Running time* dari proses pengurutan n bilangan menggunakan algoritma *divide and conquer* adalah:

```text
T(n) = D(n) + 2T(n/2) + C(n)
T(n) = Θ(1) + 2T(n/2) + Θ(n)
     = 2T(n/2) + Θ(n) + Θ(1)
     = 2T(n/2) + Θ(n),   untuk n > 1
```

Suku Θ(1) diserap oleh Θ(n) karena suku yang tumbuh paling cepat yang menentukan.
:::

Bentuk *running time* di atas disebut bentuk **recurrence**, yaitu suatu fungsi *running time* yang di dalamnya mengandung fungsi *running time*. Cara menyelesaikan recurrence dibahas pada materi 7.

:::quiz Cek pemahaman: running time Merge Sort
::question Berapa running time tahap Combine pada Merge Sort?
- [ ] Θ(1)
- [x] Θ(n)
- [ ] 2T(n/2)
::explain
Menggabungkan dua bagian terurut menjadi n bilangan terurut harus menyentuh setiap bilangan, sehingga C(n) = Θ(n). Tahap Divide sendiri hanya Θ(1).
::question Mengapa tahap Conquer bernilai 2T(n/2)?
- [ ] Karena array dibagi menjadi n bagian
- [x] Karena ada dua submasalah, masing-masing berukuran n/2
- [ ] Karena tahap ini selalu memakan waktu 2 satuan
::explain
Array dibagi menjadi dua sub-array berukuran sekitar n/2, dan masing-masing diurutkan dengan algoritma yang sama, sehingga totalnya 2T(n/2).
:::

## D. Contoh Soal

Tuliskan langkah-langkah algoritma Merge Sort dalam mengurutkan bilangan-bilangan {3, 10, 8, 20, 5}. Awalnya A = 3 10 8 20 5 dan pemanggilan pertama adalah MERGE_SORT(A, 1, 5). Geser slide satu per satu, mengikuti urutan pemanggilan fungsi.

:::steps Penelusuran MERGE_SORT(A, 1, 5)
::slide 1. MERGE_SORT(A, 1, 5)
1. if p < r: **True**, sebab 1 < 5.
2. q = ⌊(1 + 5)/2⌋ = 3.
3. MERGE_SORT(A, 1, 3).

::slide 2. MERGE_SORT(A, 1, 3)
1. if p < r: **True**, sebab 1 < 3.
2. q = ⌊(1 + 3)/2⌋ = 2.
3. MERGE_SORT(A, 1, 2).

::slide 3. MERGE_SORT(A, 1, 2)
1. if p < r: **True**, sebab 1 < 2.
2. q = ⌊(1 + 2)/2⌋ = 1.
3. MERGE_SORT(A, 1, 1).

::slide 4. MERGE_SORT(A, 1, 1)
1. if p < r: **False**, sebab 1 tidak lebih kecil dari 1.

Kembali ke fungsi yang memanggil MERGE_SORT(A, 1, 1), yaitu MERGE_SORT(A, 1, 2), lanjut langkah 4.

::slide 5. Kembali ke MERGE_SORT(A, 1, 2)
4. MERGE_SORT(A, 2, 2): if p < r **False**, sebab 2 tidak lebih kecil dari 2. Kembali ke MERGE_SORT(A, 1, 2), lanjut langkah 5.
5. MERGE(A, 1, 1, 2), yaitu menggabungkan bilangan 3 dan bilangan 10 menjadi satu *array* terurut:

```text
A = 3  10  8  20  5
```

Langkah 5 selesai, berarti MERGE_SORT(A, 1, 2) selesai. Kembali ke MERGE_SORT(A, 1, 3), lanjut langkah 4.

::slide 6. Kembali ke MERGE_SORT(A, 1, 3)
4. MERGE_SORT(A, 3, 3): if p < r **False**, sebab 3 tidak lebih kecil dari 3. Kembali ke MERGE_SORT(A, 1, 3), lanjut langkah 5.
5. MERGE(A, 1, 2, 3), yaitu menggabungkan *array* 3 10 dengan bilangan 8 menjadi satu *array* terurut:

```text
A = 3  8  10  20  5
```
:::

**Latihan:** lanjutkan langkah-langkah di atas sampai didapat *array* yang berisi bilangan terurut: 3, 5, 8, 10, 20. Setelah mencoba sendiri, bukalah kelanjutannya di bawah.

:::reveal Lihat kelanjutan penelusuran sampai terurut
Setelah MERGE_SORT(A, 1, 3) selesai, kembali ke MERGE_SORT(A, 1, 5), lanjut langkah 4.

**MERGE_SORT(A, 4, 5)**

1. if p < r: True, sebab 4 < 5.
2. q = ⌊(4 + 5)/2⌋ = 4.
3. MERGE_SORT(A, 4, 4): if p < r False, sebab 4 tidak lebih kecil dari 4. Kembali, lanjut langkah 4.
4. MERGE_SORT(A, 5, 5): if p < r False, sebab 5 tidak lebih kecil dari 5. Kembali, lanjut langkah 5.
5. MERGE(A, 4, 4, 5), yaitu menggabungkan bilangan 20 dan bilangan 5 menjadi 5 20:

```text
A = 3  8  10  5  20
```

Kembali ke MERGE_SORT(A, 1, 5), lanjut langkah 5.

**MERGE(A, 1, 3, 5)** menggabungkan *array* 3 8 10 dengan *array* 5 20. Perbandingan berturut-turut mengambil 3, lalu 5, lalu 8, lalu 10, lalu 20, sehingga didapat:

```text
A = 3  5  8  10  20
```

Langkah 5 selesai, berarti MERGE_SORT(A, 1, 5) selesai dan *array* sudah terurut dari kecil ke besar.
:::

### Peraga: Penelusuran MERGE_SORT

Setelah mencoba sendiri, jalankan peraga berikut. Isian awalnya adalah contoh soal di atas, jadi hasilnya bisa dibandingkan dengan slide dan kelanjutan latihan. Geser langkah satu per satu dan perhatikan tiga hal:

- Baris yang menyala sama dengan nomor langkah pada pseudocode, dan nilai p, q, r di tabel adalah milik pemanggilan yang sedang berjalan.
- Tumpukan panggilan bertambah saat langkah 3 atau 4 memanggil MERGE_SORT lagi, dan berkurang saat pemanggilan selesai.
- MERGE (langkah 5) baru dikerjakan sesudah kedua bagian selesai, sehingga bilangan yang sudah terurut bertambah dari bawah ke atas.

Peraga ini menampilkan MERGE sebagai satu langkah. Cara kerja di dalamnya ada di gambar pseudocode MERGE pada bagian B. Peraga menerima sampai 8 bilangan dan memakai indeks mulai dari 1, sama dengan materi.

::trace merge-sort

Tahap *combine* inilah yang dikerjakan pada soal challenge di akhir materi, yaitu menggabungkan dua *array* yang sudah terurut.

:::quiz Cek pemahaman: penelusuran contoh soal
::question Pada MERGE_SORT(A, 4, 5), berapa nilai q?
- [ ] 5
- [x] 4
- [ ] 3
::explain
q = ⌊(4 + 5)/2⌋ = ⌊9/2⌋ = 4, sehingga array dibagi menjadi indeks 4 dan indeks 5.
::question Setelah MERGE(A, 1, 2, 3) pada contoh, seperti apa isi A?
- [ ] 3 10 8 20 5
- [x] 3 8 10 20 5
- [ ] 3 5 8 10 20
::explain
Bagian 3 10 digabung dengan 8 menjadi 3 8 10. Bilangan 20 dan 5 di indeks 4 dan 5 belum disentuh.
:::

## E. Mencoba Visualisasi Merge Sort

Dua visualisasi di bawah memperlihatkan Merge Sort yang sama dari dua sisi: diagram batang pada *array*, dan pohon pemanggilan rekursi. Ada beberapa hal yang bisa dicoba:

- Isi *array* dengan 38 27 43 3 9 82 10, yaitu contoh pada gambar di bagian B, lalu bandingkan dengan gambar tersebut. Isian dibatasi sampai 8 bilangan.
- Isi *array* dengan 3 10 8 20 5, yaitu contoh soal di bagian D, lalu ikuti urutan pemanggilan di pohon.
- Perhatikan bahwa pohon pemanggilan selalu terbagi dua pada tiap tingkat, sesuai tahap Divide.

Kode di visualisasi berbeda sedikit dari pseudocode di materi ini. Indeksnya mulai dari 0, bukan 1, dan batasnya bernama lo dan hi, bukan p dan r. Kodenya memakai satu *array* penampung sementara, bukan dua *array* L dan R dengan ∞. Cara kerjanya sama: dua bagian terurut digabung dengan mengambil yang lebih kecil dari ujung depan keduanya.

::visualizer

## F. Rangkuman

| Hal | Isi |
| --- | --- |
| Tiga tahap | Divide (bagi), Conquer (selesaikan secara rekursif), Combine (gabungkan) |
| Divide pada Merge Sort | q = ⌊(p + r)/2⌋, running time D(n) = Θ(1) |
| Conquer pada Merge Sort | Dua pemanggilan MERGE_SORT berukuran sekitar n/2, running time 2T(n/2) |
| Combine pada Merge Sort | MERGE(A, p, q, r), running time C(n) = Θ(n) |
| Kasus dasar | p tidak lebih kecil dari r: bagian berisi satu bilangan dan sudah terurut |
| Recurrence | T(n) = 2T(n/2) + Θ(n), untuk n > 1 |

- Merge Sort mengurutkan *array* dengan membaginya terus sampai tiap bagian berisi satu bilangan, lalu menggabungkannya kembali dalam keadaan terurut.
- Tahap yang paling banyak bekerja adalah *combine*, karena menggabungkan dua bagian terurut harus menyentuh setiap bilangan.
- Bentuk recurrence T(n) = 2T(n/2) + Θ(n) diselesaikan pada materi 7.

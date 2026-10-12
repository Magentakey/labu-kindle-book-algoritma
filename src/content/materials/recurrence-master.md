## A. Fungsi Running Time Berbentuk Recurrence

Materi ini mengacu pada buku Thomas H. Cormen, halaman 83 sampai 96. Suatu fungsi *running time* yang di dalamnya mengandung fungsi *running time* itu sendiri disebut fungsi *running time* berbentuk ***recurrence***.

Pada materi 6 sudah dibahas algoritma Merge Sort, dengan fungsi *running time* berbentuk *recurrence*, yaitu:

```text
T(n) = 2T(n/2) + Θ(n),   untuk n > 1
```

Ada tiga metode untuk menentukan notasi asimtotik dari fungsi *running time* berbentuk *recurrence*:

| No | Metode | Nama dalam buku |
| --- | --- | --- |
| 1 | Metode substitusi | *Substitution Method* |
| 2 | Metode pohon rekursif | *Recursion-Tree Method* |
| 3 | Metode Master | *Master Method* |

Pembahasan di materi ini hanya memakai **metode Master**. Metode pohon rekursif tetap bisa dilihat lewat visualisasi di bagian G, untuk memahami dari mana tiga kasus Metode Master berasal.

:::quiz Cek pemahaman: recurrence
::question Manakah yang merupakan fungsi running time berbentuk recurrence?
- [ ] T(n) = 3n² + 5n + 2
- [x] T(n) = 2T(n/2) + Θ(n)
- [ ] T(n) = Θ(n log n)
::explain
Pada pilihan kedua, T muncul di kedua ruas: ruas kanan memuat T(n/2). Dua pilihan lain tidak memuat fungsi running time itu sendiri di ruas kanan.
::question Metode apa yang dipakai pada materi ini untuk menentukan notasi asimtotik dari recurrence?
- [ ] Metode substitusi
- [ ] Metode pohon rekursif
- [x] Metode Master
::explain
Dari tiga metode yang ada, materi ini hanya memakai Metode Master. Pohon rekursif dipakai di bagian G hanya sebagai gambaran.
:::

## B. Metode Master

Metode Master dapat dipakai bila fungsi *running time* T(n) berbentuk:

```text
T(n) = aT(n/b) + f(n)
```

Artinya masing-masing bagian berikut:

| Bagian | Arti |
| --- | --- |
| a ≥ 1 | Banyaknya submasalah |
| b > 1 | Faktor pembagi ukuran masalah, jadi tiap submasalah berukuran n/b |
| f(n) | Waktu untuk membagi masalah dan menggabungkan hasil submasalah |

Kunci metode ini adalah membandingkan f(n) dengan fungsi pembanding g(n):

```text
g(n) = n^(log_b a)
```

Hasilnya ditentukan oleh tiga kasus. Perhatikan bahwa hanya satu kasus yang berlaku, sesuai hasil perbandingan f(n) dengan g(n).

| Kasus | Perbandingan f(n) dengan g(n) | Hasil T(n) |
| --- | --- | --- |
| 1 | f(n) = O(n^(log_b a − ε)) untuk suatu ε > 0, jadi f(n) lebih kecil | Θ(n^(log_b a)) |
| 2 | f(n) = Θ(n^(log_b a)), jadi f(n) sama dengan g(n) | Θ(n^(log_b a) · log n) |
| 3 | f(n) = Ω(n^(log_b a + ε)) untuk suatu ε > 0, jadi f(n) lebih besar, **dan** a·f(n/b) ≤ c·f(n) untuk suatu c < 1 | Θ(f(n)) |

ε adalah bilangan positif yang kecil. Cukup ada satu ε yang memenuhi.

Langkah umum memakai Metode Master selalu sama. Geser slide satu per satu.

:::steps Langkah memakai Metode Master
::slide 1. Tentukan a, b, dan f(n)
Ubah recurrence ke bentuk T(n) = aT(n/b) + f(n), lalu baca nilai a, b, dan f(n). Pastikan a ≥ 1 dan b > 1. Bila bentuknya T(3n/5), tulis 3n/5 = n/(5/3), sehingga b = 5/3.

::slide 2. Hitung g(n)
```text
g(n) = n^(log_b a)
```
Hitung log_b a, lalu tulis g(n) sebagai n berpangkat bilangan itu. Misalnya log₂ 4 = 2 sehingga g(n) = n².

::slide 3. Bandingkan pangkat n pada f(n) dan g(n)
Bandingkan pangkat n pada f(n) dengan pangkat n pada g(n):

- f(n) berpangkat **lebih kecil** → kasus 1.
- f(n) berpangkat **sama** → kasus 2.
- f(n) berpangkat **lebih besar** → kasus 3.

::slide 4. Periksa syarat tambahan dan tulis hasilnya
Pada kasus 3, periksa juga a·f(n/b) ≤ c·f(n) untuk suatu c < 1. Bila terpenuhi, hasilnya Θ(f(n)). Pada kasus 1 hasilnya Θ(n^(log_b a)), dan pada kasus 2 hasilnya Θ(n^(log_b a) · log n).
:::

:::quiz Cek pemahaman: bentuk Metode Master
::question Pada T(n) = 4T(n/2) + n, berapa nilai a dan b?
- [x] a = 4 dan b = 2
- [ ] a = 2 dan b = 4
- [ ] a = 4 dan b = 1
::explain
Bentuknya aT(n/b): a = 4 adalah banyaknya submasalah, dan b = 2 sebab ukuran tiap submasalah n/2.
::question Pada T(n) = 2T(n/2) + n, berapa g(n) = n^(log_b a)?
- [ ] n²
- [x] n
- [ ] 1
::explain
log₂ 2 = 1, jadi g(n) = n¹ = n.
::question Manakah recurrence yang bisa diselesaikan dengan Metode Master?
- [ ] T(n) = T(n − 1) + n
- [x] T(n) = 3T(n/2) + n²
- [ ] T(n) = T(n − 1) + T(n − 2)
::explain
Metode Master hanya untuk bentuk aT(n/b) + f(n), yaitu ukuran masalah dibagi dengan b. Pilihan pertama dan ketiga mengurangi ukuran masalah, bukan membaginya.
:::

## C. Kasus 1: f(n) Lebih Kecil dari g(n)

Pada kasus 1, f(n) = O(n^(log_b a − ε)) untuk suatu ε > 0. Artinya f(n) tumbuh lebih lambat dari g(n) = n^(log_b a). Fungsi f(n) dibatasi dari atas oleh c·n^(log_b a − ε), jadi pangkat n pada f(n) lebih kecil dari pangkat n pada g(n).

Hasilnya:

```text
T(n) = Θ(n^(log_b a))
```

### Contoh Kasus 1: T(n) = 2T(n/2) + √n

Tentukan notasi kompleksitas dari T(n) = 2T(n/2) + √n.

:::steps Penyelesaian T(n) = 2T(n/2) + √n
::slide 1. Tentukan a, b, dan f(n)
```text
a = 2,  b = 2,  f(n) = √n = n^(1/2)
```
Bentuknya aT(n/b) + f(n), jadi memenuhi syarat Metode Master.

::slide 2. Hitung g(n)
```text
g(n) = n^(log_b a) = n^(log₂ 2) = n
```

::slide 3. Bandingkan
Pangkat n pada f(n) = n^(1/2) lebih kecil daripada pangkat n pada g(n) = n. Syarat kasus 1 terpenuhi:

```text
f(n) = O(n^(1 − ε))
untuk 0 < ε ≤ 1/2
```

::slide 4. Simpulkan
Berlaku kasus 1, sehingga:

```text
T(n) = Θ(n^(log_b a)) = Θ(n)
```
:::

:::quiz Cek pemahaman: kasus 1
::question Pada kasus 1, bagaimana bentuk hasil T(n)?
- [ ] Θ(f(n))
- [x] Θ(n^(log_b a))
- [ ] Θ(n^(log_b a) · log n)
::explain
Pada kasus 1, f(n) lebih kecil dari g(n), jadi g(n) yang menentukan: T(n) = Θ(n^(log_b a)).
::question Tentukan notasi kompleksitas dari T(n) = 8T(n/2) + n².
- [ ] Θ(n²)
- [ ] Θ(n² log n)
- [x] Θ(n³)
::explain
a = 8 dan b = 2 sehingga g(n) = n^(log₂ 8) = n³. Pangkat n pada f(n) = n² lebih kecil dari 3, jadi kasus 1: T(n) = Θ(n³).
:::

## D. Kasus 2: f(n) Sama dengan g(n)

Pada kasus 2, f(n) = Θ(g(n)) dengan g(n) = n^(log_b a). Fungsi f(n) dibatasi dari bawah oleh c₁·g(n) dan dari atas oleh c₂·g(n), jadi f(n) dan g(n) tumbuh sama cepat.

Hasilnya:

```text
T(n) = Θ(n^(log_b a) · log n)
```

### Contoh Kasus 2: T(n) = 4T(n/2) + n²

Tentukan notasi kompleksitas dari T(n) = 4T(n/2) + n².

:::steps Penyelesaian T(n) = 4T(n/2) + n²
::slide 1. Tentukan a, b, dan f(n)
```text
a = 4,  b = 2,  f(n) = n²
```
Bentuknya aT(n/b) + f(n), jadi memenuhi syarat Metode Master.

::slide 2. Hitung g(n)
```text
g(n) = n^(log_b a) = n^(log₂ 4) = n²
```

::slide 3. Bandingkan
Pangkat n pada f(n) sama dengan pangkat n pada g(n), yaitu f(n) = g(n) = n². Syarat kasus 2 terpenuhi.

::slide 4. Simpulkan
Berlaku kasus 2, sehingga:

```text
T(n) = Θ(n^(log_b a) · log n)
     = Θ(n² · log n)
```
:::

Recurrence Merge Sort pada materi 6, yaitu T(n) = 2T(n/2) + Θ(n), juga termasuk kasus 2: a = 2 dan b = 2 sehingga g(n) = n^(log₂ 2) = n, dan f(n) = Θ(n) = g(n). Hasilnya Θ(n log n).

:::quiz Cek pemahaman: kasus 2
::question Kapan kasus 2 berlaku?
- [ ] Bila f(n) tumbuh lebih lambat dari n^(log_b a)
- [x] Bila f(n) = Θ(n^(log_b a))
- [ ] Bila f(n) tumbuh lebih cepat dari n^(log_b a)
::explain
Kasus 2 berlaku bila f(n) dan g(n) = n^(log_b a) tumbuh sama cepat, yaitu f(n) = Θ(g(n)).
::question Tentukan notasi kompleksitas dari T(n) = 3T(n/3) + n.
- [ ] Θ(n)
- [x] Θ(n log n)
- [ ] Θ(n²)
::explain
a = 3 dan b = 3 sehingga g(n) = n^(log₃ 3) = n. Karena f(n) = n = g(n), berlaku kasus 2: T(n) = Θ(n log n).
:::

## E. Kasus 3: f(n) Lebih Besar dari g(n)

Pada kasus 3, f(n) = Ω(n^(log_b a + ε)) untuk suatu ε > 0. Artinya f(n) tumbuh lebih cepat dari g(n) = n^(log_b a): f(n) dibatasi dari bawah oleh c·n^(log_b a + ε), jadi pangkat n pada f(n) lebih besar dari pangkat n pada g(n).

Kasus 3 punya **satu syarat tambahan**:

```text
a·f(n/b) ≤ c·f(n),  c < 1
```

Bila kedua syarat terpenuhi, hasilnya:

```text
T(n) = Θ(f(n))
```

### Contoh Kasus 3: T(n) = T(3n/5) + n

Tentukan notasi kompleksitas dari T(n) = T(3n/5) + n.

:::steps Penyelesaian T(n) = T(3n/5) + n
::slide 1. Tentukan a, b, dan f(n)
Karena 3n/5 = n/(5/3), maka:

```text
a = 1,  b = 5/3,  f(n) = n
```
Bentuknya aT(n/b) + f(n) dengan a ≥ 1 dan b > 1, jadi memenuhi syarat Metode Master.

::slide 2. Hitung g(n)
```text
g(n) = n^(log_b a)
     = n^(log_(5/3) 1)
     = n^(log_(5/3) (5/3)⁰)
     = n⁰
```
Pangkat nol dari bilangan berapa pun adalah 1, jadi log_(5/3) 1 = 0 dan g(n) = 1.

::slide 3. Bandingkan
Pangkat n pada f(n) = n lebih besar daripada pangkat n pada g(n) = n⁰. Syarat pertama kasus 3 terpenuhi:

```text
f(n) = Ω(n^(0 + ε))
untuk 0 < ε ≤ 1
```

::slide 4. Periksa syarat tambahan
```text
a·f(n/b) = f(n/(5/3)) = n/(5/3) = (3/5)·n
```
Ambil c = 3/5, sehingga a·f(n/b) ≤ c·f(n) dengan c < 1. Syarat tambahan terpenuhi.

::slide 5. Simpulkan
Berlaku kasus 3, sehingga:

```text
T(n) = Θ(f(n)) = Θ(n)
```
:::

:::reveal Mengapa kasus 3 butuh syarat tambahan a·f(n/b) ≤ c·f(n)?
Syarat itu memastikan biaya pada tiap tingkat rekursi mengecil dengan perbandingan tetap, yaitu paling besar c kali biaya tingkat di atasnya. Jumlah biaya semua tingkat lalu paling banyak berupa deret geometri dengan suku pertama f(n), sehingga totalnya tetap Θ(f(n)).

Pada contoh di atas biaya tiap tingkat menjadi 3/5 kali tingkat sebelumnya. Tanpa syarat itu, f(n) yang lebih besar dari g(n) saja belum menjamin hasil Θ(f(n)).
:::

:::quiz Cek pemahaman: kasus 3
::question Pada T(n) = T(n/2) + n, berapa nilai g(n) = n^(log_b a)?
- [ ] n
- [x] 1
- [ ] n²
::explain
a = 1 dan b = 2, jadi log₂ 1 = 0 dan g(n) = n⁰ = 1.
::question Pada T(n) = T(n/2) + n, syarat tambahan kasus 3 dipenuhi dengan c = ...
- [x] 1/2
- [ ] 2
- [ ] 3/2
::explain
a·f(n/b) = 1 · (n/2) = (1/2)·n, jadi c = 1/2 yang lebih kecil dari 1. Hasilnya Θ(f(n)) = Θ(n).
::question Tentukan notasi kompleksitas dari T(n) = 3T(n/2) + n².
- [ ] Θ(n^(log₂ 3))
- [ ] Θ(n² log n)
- [x] Θ(n²)
::explain
log₂ 3 ≈ 1,58 sehingga g(n) ≈ n^1,58, lebih kecil dari f(n) = n². Syarat tambahan: 3·(n/2)² = (3/4)·n², jadi c = 3/4 < 1. Berlaku kasus 3: T(n) = Θ(n²).
:::

## F. Contoh Soal

Tentukan notasi kompleksitas dari fungsi *running time* berbentuk:

1. T(n) = 9T(n/3) + n
2. T(n) = 5T(n/2) + n³

Coba kerjakan sendiri dengan empat langkah di bagian B. Setelah itu bukalah penyelesaiannya di bawah.

:::reveal Lihat penyelesaian soal 1: T(n) = 9T(n/3) + n
T(n) = 9T(n/3) + n memiliki a = 9, b = 3, dan f(n) = n, sehingga memenuhi syarat Metode Master.

```text
f(n) = n
g(n) = n^(log_b a) = n^(log₃ 9) = n²
```

Pangkat n pada f(n) lebih kecil daripada pangkat n pada g(n), dan memenuhi:

```text
f(n) = O(n^(2 − ε))
untuk 0 < ε ≤ 1
```

Berlaku kasus 1, sehingga:

```text
T(n) = Θ(n^(log_b a)) = Θ(n²)
```
:::

:::reveal Lihat penyelesaian soal 2: T(n) = 5T(n/2) + n³
T(n) = 5T(n/2) + n³ memiliki a = 5, b = 2, dan f(n) = n³.

```text
f(n) = n³
g(n) = n^(log_b a) = n^(log₂ 5) ≈ n^2,32
```

Pangkat n pada f(n) lebih besar daripada pangkat n pada g(n), dan memenuhi:

```text
f(n) = Ω(n^(2,32 + ε))
untuk 0 < ε ≤ 0,67
```

Periksa syarat tambahan:

```text
a·f(n/b) = 5·(n/2)³ = (5/8)·n³
```

Ambil c = 5/8, sehingga a·f(n/b) ≤ c·f(n) dengan c < 1. Berlaku kasus 3, sehingga:

```text
T(n) = Θ(f(n)) = Θ(n³)
```
:::

:::quiz Cek pemahaman: latihan lain
::question Tentukan notasi kompleksitas dari T(n) = 16T(n/4) + n.
- [x] Θ(n²)
- [ ] Θ(n)
- [ ] Θ(n log n)
::explain
a = 16 dan b = 4 sehingga g(n) = n^(log₄ 16) = n². Pangkat n pada f(n) = n lebih kecil, jadi kasus 1: T(n) = Θ(n²).
::question Tentukan notasi kompleksitas dari T(n) = 2T(n/2) + n³.
- [ ] Θ(n)
- [ ] Θ(n log n)
- [x] Θ(n³)
::explain
g(n) = n^(log₂ 2) = n, lebih kecil dari f(n) = n³. Syarat tambahan: 2·(n/2)³ = (1/4)·n³, jadi c = 1/4 < 1. Berlaku kasus 3: T(n) = Θ(n³).
:::

:::reveal Catatan: tidak semua recurrence tercakup tiga kasus
Tiga kasus tidak mencakup semua f(n). Contohnya T(n) = 2T(n/2) + n log n. Di sini g(n) = n, dan f(n) = n log n memang tumbuh lebih cepat dari g(n), tetapi hanya lebih cepat sebesar faktor log n, bukan sebesar n^ε untuk suatu ε > 0. Jadi tidak ada kasus yang berlaku, dan Metode Master tidak bisa dipakai pada recurrence itu. Untuk soal seperti itu dipakai metode lain, misalnya metode substitusi.
:::

## G. Mencoba Visualisasi Pohon Rekursi

Visualisasi di bawah membuka pohon rekursi untuk T(n) = a·T(n/b) + nᶜ, level demi level, dengan tabel biaya tiap level. Ukuran masalah dibuat n = bᵏ, dan kasus dasar (n = 1) berbiaya 1. Dari pohon ini terlihat asal tiga kasus Metode Master: letak biaya terbesar menentukan hasilnya.

| Contoh siap pakai | Kasus | Biaya terbesar ada di |
| --- | --- | --- |
| Merge sort: T(n) = 2T(n/2) + n | 2 | Sama di setiap level, jadi dikali jumlah level (log n) |
| Binary search: T(n) = T(n/2) + 1 | 2 | Sama di setiap level, jadi Θ(log n) |
| Daun dominan: T(n) = 3T(n/2) + n | 1 | Level terbawah (daun) |
| Akar dominan: T(n) = 2T(n/2) + n² | 3 | Level teratas (akar) |

Contoh-contoh di tabel itu ada di panel "Ubah masukan" di bawah visualisasi, bersama isian untuk a, b, c, dan k. Ada beberapa hal yang bisa dicoba:

- Visualisasi mulai dengan contoh Merge Sort. Perhatikan bahwa total biaya tiap level sama (n). Itulah sebabnya hasilnya Θ(n log n).
- Pilih contoh daun dominan di panel itu, lalu perhatikan bahwa total biaya naik pada tiap level ke bawah.
- Pilih contoh akar dominan, lalu perhatikan bahwa total biaya turun pada tiap level ke bawah.
- Isian dibatasi: a dari 1 sampai 3, b dari 2 sampai 4, c dari 0 sampai 2, dan kedalaman k dari 1 sampai 3. Jadi f(n) di visualisasi hanya berbentuk nᶜ.

Kode di visualisasi adalah pola rekursi umum, bukan pseudocode tertentu. Pohon pada visualisasi adalah pohon untuk satu n tertentu, sedangkan Metode Master menyatakan hasilnya untuk n yang sangat besar.

::visualizer

## H. Rangkuman

| Hal | Isi |
| --- | --- |
| Bentuk | T(n) = aT(n/b) + f(n), dengan a ≥ 1 dan b > 1 |
| Fungsi pembanding | g(n) = n^(log_b a) |
| Kasus 1 | f(n) = O(n^(log_b a − ε)), hasil Θ(n^(log_b a)) |
| Kasus 2 | f(n) = Θ(n^(log_b a)), hasil Θ(n^(log_b a) · log n) |
| Kasus 3 | f(n) = Ω(n^(log_b a + ε)) dan a·f(n/b) ≤ c·f(n) untuk c < 1, hasil Θ(f(n)) |

- Cara cepat memilih kasus: bandingkan pangkat n pada f(n) dengan pangkat n pada g(n). Lebih kecil berarti kasus 1, sama berarti kasus 2, dan lebih besar berarti kasus 3 (setelah memeriksa syarat tambahan).
- Di pohon rekursi, kasus 1 berarti daun yang terbesar, kasus 2 berarti tiap level sama besar, dan kasus 3 berarti akar yang terbesar.
- Merge Sort, T(n) = 2T(n/2) + Θ(n), adalah kasus 2 dengan hasil Θ(n log n).
- Soal challenge di akhir menghitung T(n) = 2T(n/2) + n langsung dari rekurensnya, lalu hasilnya bisa dibandingkan dengan Θ(n log n) dari kasus 2.

## A. Pengantar Notasi Asimtotik

Dilihat dari laju pertumbuhan fungsi *running time*, suatu fungsi *running time* f(n) dapat digolongkan ke dalam salah satu notasi asimtotik. Ada 3 notasi asimtotik untuk menggolongkan fungsi *running time*:

| No | Notasi | Nama | Arti singkat |
| --- | --- | --- | --- |
| 1 | Θ | Theta | Batas atas dan batas bawah sekaligus (batas ketat) |
| 2 | O | Big Oh | Batas atas |
| 3 | Ω | Omega | Batas bawah |

Pada pertemuan sebelumnya sudah dijelaskan bahwa bentuk *worst case running time* algoritma Insertion Sort adalah T(n) = an² + bn + c, yang dalam bentuk notasi ditulis T(n) = Θ(n²). Materi ini menjelaskan arti notasi itu secara tepat dan cara membuktikannya dengan definisi.

Ketiga notasi punya pola pembuktian yang sama:

1. Tulis f(n) dan g(n) dari soal.
2. Tulis pertaksamaan yang diminta definisi, lalu bagi semua ruas dengan g(n).
3. Masukkan n = 1, 2, 3, … sampai nilainya memenuhi, untuk mendapatkan n₀.
4. Lihat nilai untuk n yang sangat besar, untuk menentukan konstanta c (atau c₁ dan c₂).

:::quiz Cek pemahaman: tiga notasi
::question Notasi mana yang menyatakan batas atas dan batas bawah sekaligus?
- [x] Θ (Theta)
- [ ] O (Big Oh)
- [ ] Ω (Omega)
::explain
Theta menjepit f(n) di antara c₁g(n) di bawah dan c₂g(n) di atas, sehingga disebut batas ketat.
::question Notasi Big Oh menggambarkan batas apa dari f(n)?
- [ ] Batas bawah
- [x] Batas atas
- [ ] Batas atas dan bawah sekaligus
::explain
Pada Big Oh, f(n) tidak pernah melebihi c·g(n) untuk n ≥ n₀, sehingga g(n) menjadi batas atas.
:::

## B. Notasi Theta (Θ)

Apabila diberikan fungsi g(n) yang dinotasikan dalam himpunan fungsi Θ(g(n)), fungsi *running time* f(n) dikatakan masuk dalam himpunan Θ(g(n)) jika dan hanya jika:

```text
Θ(g(n)) = { f(n) | terdapat konstanta positif c₁, c₂, dan n₀ sedemikian sehingga
                   0 ≤ c₁g(n) ≤ f(n) ≤ c₂g(n), untuk semua n ≥ n₀ }
```

Bentuk f(n) = Θ(g(n)) digambarkan dalam grafik berikut. n adalah banyaknya data bilangan yang di-input. Fungsi *running time* f(n) dikatakan mempunyai fungsi batas atas c₂g(n) dan fungsi batas bawah c₁g(n).

![Grafik f(n) = Θ(g(n)): kurva f(n) terletak di antara kurva batas bawah c₁g(n) dan batas atas c₂g(n) mulai dari garis putus-putus n₀ ke kanan.](/materi/notasi-asimtotik/grafik-theta.png)

### Contoh Θ: 2n² − 3n + 1 = Θ(n²)

Tunjukkan bahwa 2n² − 3n + 1 = Θ(n²). Geser slide satu per satu untuk mengikuti pembuktiannya.

:::steps Pembuktian 2n² − 3n + 1 = Θ(n²)
::slide 1. Tentukan f(n) dan g(n)
```text
f(n) = 2n² − 3n + 1
g(n) = n²
```

Dari definisi Θ, kita harus mencari konstanta positif c₁, c₂, dan n₀ sedemikian sehingga:

```text
0 ≤ c₁n² ≤ 2n² − 3n + 1 ≤ c₂n²   untuk semua n ≥ n₀
```

::slide 2. Bagi semua ruas dengan n²
```text
c₁ ≤ 2n²/n² − 3n/n² + 1/n² ≤ c₂

c₁ ≤ 2 − 3/n + 1/n² ≤ c₂
```

Selanjutnya masukkan n = 1, 2, 3, … ke bentuk 2 − 3/n + 1/n² untuk mendapatkan c₁, c₂, dan n₀.

::slide 3. Coba nilai n satu per satu
```text
n = 1: 2 − 3/1 + 1/1² = 2 − 3 + 1 = 0
n = 2: 2 − 3/2 + 1/2² = 2 − 3/2 + 1/4 = (8 − 6 + 1)/4 = 3/4   (nilai > 0, tetapkan n₀ = 2)
n = 3: 2 − 3/3 + 1/3² = 2 − 1 + 1/9 = (18 − 9 + 1)/9 = 10/9
...
n = ∞: 2 − 3/∞ + 1/∞ = 2 − 0 + 0 = 2
```

Pada n = 1 nilainya 0, belum positif, sehingga c₁ tidak bisa positif. Mulai n = 2 nilainya positif dan terus naik mendekati 2.

::slide 4. Tetapkan c₁, c₂, dan n₀
Agar c₁ ≤ 2 − 3/n + 1/n² ≤ c₂ untuk semua n ≥ n₀, tetapkan:

```text
c₁ = 3/4,  c₂ = 2,  n₀ = 2
```

Jadi dipenuhi 0 ≤ c₁n² ≤ 2n² − 3n + 1 ≤ c₂n² untuk semua n ≥ n₀.

Dengan demikian **terbukti** bahwa 2n² − 3n + 1 = Θ(n²).
:::

Sekarang coba sendiri. Isian di bawah sudah berisi contoh di atas (c₁ = 3/4 dan c₂ = 2). Perhatikan baris n = 1 yang nilainya 0, lalu ganti c₁ menjadi 1 dan lihat n₀ bergeser menjadi 3. Coba juga c₂ = 1: batas atasnya akhirnya terlewati sehingga tidak ada n₀.

::bound Theta ; 2, -3, 1 ; n^2 ; 3/4, 2

:::quiz Cek pemahaman: notasi Theta
::question Pada pembuktian 2n² − 3n + 1 = Θ(n²), mengapa n₀ ditetapkan 2 dan bukan 1?
- [ ] Karena n harus selalu genap
- [x] Karena pada n = 1 nilai 2 − 3/n + 1/n² sama dengan 0, padahal c₁ harus positif
- [ ] Karena n₀ selalu bernilai 2 untuk fungsi kuadrat
::explain
Konstanta c₁ harus positif dan c₁ ≤ 2 − 3/n + 1/n². Pada n = 1 nilainya 0, sehingga tidak ada c₁ positif yang cocok. Mulai n = 2 nilainya 3/4, dan seterusnya naik.
::question Untuk n yang sangat besar, nilai 2 − 3/n + 1/n² mendekati...
- [ ] 0
- [x] 2
- [ ] 3/4
::explain
Suku 3/n dan 1/n² mengecil menuju 0 saat n membesar, sehingga nilainya mendekati 2. Itulah sebabnya c₂ = 2 sudah cukup sebagai batas atas.
::question Dalam definisi Θ, apakah konstanta c₁ dan c₂ boleh bernilai negatif?
- [ ] Boleh
- [x] Tidak, keduanya harus konstanta positif
- [ ] Hanya c₁ yang boleh negatif
::explain
Definisi mensyaratkan konstanta positif c₁, c₂, dan n₀.
:::

## C. Notasi Big Oh (O)

Apabila diberikan fungsi g(n), fungsi *running time* f(n) dikatakan masuk dalam himpunan O(g(n)) jika dan hanya jika:

```text
O(g(n)) = { f(n) | terdapat konstanta positif c dan n₀ sedemikian sehingga
                   0 ≤ f(n) ≤ c·g(n), untuk semua n ≥ n₀ }
```

Bentuk f(n) = O(g(n)) digambarkan dalam grafik berikut. Fungsi *running time* f(n) dikatakan mempunyai fungsi batas atas c·g(n).

![Grafik f(n) = O(g(n)): kurva f(n) berada di bawah atau sama dengan kurva batas atas c·g(n) mulai dari garis putus-putus n₀ ke kanan.](/materi/notasi-asimtotik/grafik-big-o.png)

### Contoh O: ½n² − 3n = O(n²)

Tunjukkan bahwa ½n² − 3n = O(n²).

:::steps Pembuktian ½n² − 3n = O(n²)
::slide 1. Tentukan f(n) dan g(n)
```text
f(n) = ½n² − 3n
g(n) = n²
```

Dari definisi O, kita harus mencari konstanta positif c dan n₀ sedemikian sehingga:

```text
0 ≤ ½n² − 3n ≤ c·n²   untuk semua n ≥ n₀
```

::slide 2. Bagi semua ruas dengan n²
```text
½n²/n² − 3n/n² ≤ c

½ − 3/n ≤ c
```

Selanjutnya masukkan n = 1, 2, 3, … untuk mendapatkan c dan n₀. Syarat 0 ≤ f(n) ikut menentukan n₀: nilai ½ − 3/n tidak boleh negatif.

::slide 3. Coba nilai n satu per satu
```text
n = 1: ½ − 3/1 = −5/2 < 0   (tidak mungkin n₀ = 1)
n = 2: ½ − 3/2 = −1   < 0   (tidak mungkin n₀ = 2)
n = 3: ½ − 3/3 = −1/2 < 0   (tidak mungkin n₀ = 3)
n = 4: ½ − 3/4 = −1/4 < 0   (tidak mungkin n₀ = 4)
n = 5: ½ − 3/5 = −1/10 < 0  (tidak mungkin n₀ = 5)
n = 6: ½ − 3/6 = 0          (ambil n₀ = 6)
n = 7: ½ − 3/7 = 1/14
...
n = ∞: ½ − 3/∞ = ½
```

Selama nilainya negatif, ½n² − 3n < 0 sehingga syarat 0 ≤ f(n) dilanggar. Nilai pertama yang tidak negatif muncul pada n = 6.

::slide 4. Tetapkan c dan n₀
Agar ½ − 3/n ≤ c untuk semua n ≥ n₀, tetapkan:

```text
c = ½,  n₀ = 6
```

Jadi dipenuhi 0 ≤ ½n² − 3n ≤ c·n² untuk semua n ≥ n₀.

Dengan demikian **terbukti** bahwa ½n² − 3n = O(n²).
:::

Isian di bawah berisi contoh di atas (c = ½). Amati bahwa baris n = 1 sampai 5 bernilai negatif, sehingga syarat 0 ≤ f(n) baru terpenuhi mulai n₀ = 6. Coba ganti c menjadi 1/4: batas atasnya akhirnya terlewati sehingga tidak ada n₀.

::bound O ; 1/2, -3, 0 ; n^2 ; 1/2

:::quiz Cek pemahaman: notasi Big Oh
::question Pada pembuktian ½n² − 3n = O(n²), nilai n₀ = 6 dipilih karena...
- [x] mulai n = 6 nilai ½ − 3/n tidak lagi negatif, sehingga 0 ≤ f(n) terpenuhi
- [ ] c harus sama dengan 6
- [ ] fungsi kuadrat selalu memiliki n₀ = 6
::explain
Untuk n < 6 nilai ½n² − 3n negatif, sehingga syarat 0 ≤ f(n) dilanggar. Pada n = 6 nilainya tepat 0, dan sesudahnya positif.
::question Nilai ½ − 3/n untuk n yang sangat besar mendekati...
- [ ] 0
- [x] ½
- [ ] 3
::explain
Suku 3/n menuju 0, sehingga nilainya mendekati ½. Karena nilainya tidak pernah melebihi ½, c = ½ memenuhi.
:::

## D. Notasi Omega (Ω)

Apabila diberikan fungsi g(n), fungsi *running time* f(n) dikatakan masuk dalam himpunan Ω(g(n)) jika dan hanya jika:

```text
Ω(g(n)) = { f(n) | terdapat konstanta positif c dan n₀ sedemikian sehingga
                   0 ≤ c·g(n) ≤ f(n), untuk semua n ≥ n₀ }
```

Bentuk f(n) = Ω(g(n)) digambarkan dalam grafik berikut. Fungsi *running time* f(n) dikatakan mempunyai fungsi batas bawah c·g(n).

![Grafik f(n) = Ω(g(n)): kurva f(n) berada di atas atau sama dengan kurva batas bawah c·g(n) mulai dari garis putus-putus n₀ ke kanan.](/materi/notasi-asimtotik/grafik-omega.png)

### Contoh Ω: 10n − 20 = Ω(n)

Tunjukkan bahwa 10n − 20 = Ω(n).

:::steps Pembuktian 10n − 20 = Ω(n)
::slide 1. Tentukan f(n) dan g(n)
```text
f(n) = 10n − 20
g(n) = n
```

Dari definisi Ω, kita harus mencari konstanta positif c dan n₀ sedemikian sehingga:

```text
0 ≤ c·n ≤ 10n − 20   untuk semua n ≥ n₀
```

::slide 2. Bagi semua ruas dengan n
```text
c ≤ 10 − 20/n
```

Selanjutnya masukkan n = 1, 2, 3, … untuk mendapatkan c dan n₀.

::slide 3. Coba nilai n satu per satu
```text
n = 1: 10 − 20/1 = −10
n = 2: 10 − 20/2 = 0
n = 3: 10 − 20/3 = (30 − 20)/3 = 10/3   (nilai > 0, tetapkan n₀ = 3)
n = 4: 10 − 20/4 = 5
...
n = ∞: 10 − 20/∞ = 10
```

Pada n = 1 nilainya negatif dan pada n = 2 tepat 0, belum ada c positif yang cocok. Mulai n = 3 nilainya positif dan terus naik.

::slide 4. Tetapkan c dan n₀
Agar c ≤ 10 − 20/n untuk semua n ≥ n₀, tetapkan:

```text
c = 10/3,  n₀ = 3
```

Jadi dipenuhi 0 ≤ c·n ≤ 10n − 20 untuk semua n ≥ n₀.

Dengan demikian **terbukti** bahwa 10n − 20 = Ω(n).
:::

Isian di bawah berisi contoh di atas (c = 10/3). Coba naikkan c menjadi 5 dan lihat n₀ bergeser menjadi 4, lalu menjadi 20 untuk c = 9, agar terlihat bahwa c yang lebih besar membutuhkan n₀ yang lebih besar. Coba juga c = 11: nilainya melampaui koefisien n pada f(n), sehingga tidak ada n₀.

::bound Omega ; 0, 10, -20 ; n ; 10/3

:::quiz Cek pemahaman: notasi Omega
::question Pada pembuktian 10n − 20 = Ω(n), mengapa c = 10/3 dan n₀ = 3 dipilih?
- [ ] Karena n = 2 sudah memberi c positif
- [x] Karena nilai 10 − 20/n pertama kali positif pada n = 3, yaitu 10/3, dan terus naik sesudahnya
- [ ] Karena c selalu harus lebih kecil dari 1
::explain
Pada n = 2 nilainya 0 sehingga c tidak bisa positif. Pada n = 3 nilainya 10/3, dan untuk n yang lebih besar nilainya naik (5, 6, …) sehingga c = 10/3 tetap memenuhi.
::question Batas bawah c·n yang dipakai pada contoh ini memiliki bentuk apa?
- [x] Linier, karena g(n) = n
- [ ] Kuadrat, karena g(n) = n²
- [ ] Konstanta
::explain
Soal meminta 10n − 20 = Ω(n), jadi g(n) = n dan batas bawahnya c·n.
:::

## E. Mencoba Grafik Batas Asimtotik

Grafik di bawah menggambar f(n) = a·n² + b·n + c yang terjepit di antara c₁·n² dan c₂·n². Atur nilai a, b, c, c₁, dan c₂, lalu geser n yang disorot. Titik n₀, yaitu n terkecil sehingga batas berlaku untuk semua n sesudahnya, ditandai di grafik. Ada beberapa hal yang bisa dicoba:

- Pilih contoh soal bawaan: f(n) = 3n² + 10n + 5 dengan c₁ = 1 dan c₂ = 4 menghasilkan n₀ = 11. Ini sama dengan contoh pada soal challenge di akhir materi.
- Pilih notasi O saja, atau Ω saja, lalu amati bahwa hanya satu batas yang dibutuhkan.
- Pilih c₂ yang terlalu kecil (di bawah a). Perhatikan bahwa batas atas akhirnya terlewati oleh f(n), sehingga tidak ada n₀.
- Pilih c₁ yang lebih besar dari a. Batas bawahnya akhirnya terlewati oleh f(n) juga.

::visualizer

## F. Rangkuman

| Notasi | Syarat untuk semua n ≥ n₀ | Batas yang diberikan | Contoh di materi |
| --- | --- | --- | --- |
| Θ(g(n)) | 0 ≤ c₁g(n) ≤ f(n) ≤ c₂g(n) | Atas dan bawah (ketat) | 2n² − 3n + 1 = Θ(n²) |
| O(g(n)) | 0 ≤ f(n) ≤ c·g(n) | Atas | ½n² − 3n = O(n²) |
| Ω(g(n)) | 0 ≤ c·g(n) ≤ f(n) | Bawah | 10n − 20 = Ω(n) |

- Notasi asimtotik menggolongkan fungsi *running time* f(n) berdasarkan laju pertumbuhannya untuk n yang besar.
- Pembuktian dengan definisi dilakukan dengan membagi pertaksamaan dengan g(n), mencoba n = 1, 2, 3, …, lalu menetapkan n₀ dan konstanta dari nilai yang memenuhi dan nilai untuk n menuju tak hingga.
- Konstanta pada definisi harus positif, dan pertaksamaan hanya perlu berlaku mulai n₀, bukan untuk semua n.

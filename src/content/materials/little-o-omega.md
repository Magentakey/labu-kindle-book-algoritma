## A. Pengantar: Batas yang Ketat dan yang Tidak Ketat

Batas atas asimtotik suatu fungsi *running time* yang diberikan oleh notasi Big-Oh (O) kemungkinan merupakan *asymptotically tight* dan kemungkinan juga tidak *asymptotically tight*.

Suatu fungsi f(n) dikatakan *asymptotically tight* terhadap fungsi g(n) jika batas atas f(n) secara ketat mendekati g(n) saat nilai n sangat besar. Dua contoh pada batas yang sama, yaitu O(n²):

| Pernyataan | Ketat? | Alasan |
| --- | --- | --- |
| 2n² = O(n²) | Ya | f(n) dan g(n) tumbuh sama cepat, hanya berbeda konstanta 2 |
| 2n = O(n²) | Tidak | f(n) tumbuh jauh lebih lambat daripada g(n), batas n² terlalu longgar |

Untuk menyatakan batas atas yang **tidak** *asymptotically tight*, dipakai notasi Little-Oh (o). Analoginya, untuk batas bawah yang tidak *asymptotically tight* dipakai notasi Little-Omega (ω).

| No | Notasi | Nama | Arti singkat |
| --- | --- | --- | --- |
| 1 | o | Little-Oh | Batas atas yang tidak ketat: f(n) tumbuh lebih lambat dari g(n) |
| 2 | ω | Little-Omega | Batas bawah yang tidak ketat: f(n) tumbuh lebih cepat dari g(n) |

:::quiz Cek pemahaman: batas yang ketat
::question Manakah pernyataan yang batas atasnya TIDAK asymptotically tight?
- [ ] 2n² = O(n²)
- [x] 2n = O(n²)
- [ ] 5n² + 3n = O(n²)
::explain
Pada 2n = O(n²), fungsi n² tumbuh jauh lebih cepat daripada 2n, sehingga batasnya terlalu longgar. Dua pilihan lain memiliki bentuk n² yang sama dengan g(n), jadi batasnya ketat.
::question Notasi mana yang dipakai untuk menyatakan batas atas yang tidak asymptotically tight?
- [x] Little-Oh (o)
- [ ] Little-Omega (ω)
- [ ] Theta (Θ)
::explain
Little-Oh (o) khusus untuk batas atas yang tidak ketat. Little-Omega (ω) dipakai untuk batas bawah yang tidak ketat.
:::

## B. Notasi Little-Oh (o)

Apabila diberikan fungsi g(n), fungsi *running time* f(n) dikatakan masuk dalam himpunan o(g(n)) jika dan hanya jika:

```text
o(g(n)) = { f(n) | untuk sembarang konstanta positif c terdapat n₀ > 0
                   sedemikian sehingga 0 ≤ f(n) < c·g(n), untuk semua n ≥ n₀ }
```

Perbedaan terpenting dengan Big-Oh: pada Big-Oh cukup **ada satu** konstanta c, sedangkan pada Little-Oh pertaksamaan harus berlaku untuk **sembarang** c > 0, sekecil apa pun. Karena itu:

- 2n = o(n²), tetapi 2n² ≠ o(n²).
- f(n) = o(g(n)) menunjukkan bahwa limit f(n)/g(n) untuk n menuju tak hingga sama dengan 0.
- Fungsi *running time* f(n) tumbuh lebih lambat dibandingkan fungsi *running time* g(n).

### Contoh o: 2n = o(n²)

Tunjukkan bahwa 2n = o(n²). Geser slide satu per satu untuk mengikuti pembuktiannya.

:::steps Pembuktian 2n = o(n²)
::slide 1. Tentukan f(n) dan g(n)
```text
f(n) = 2n
g(n) = n²
```

::slide 2. Ingat syarat limit
f(n) = o(g(n)) menunjukkan bahwa:

```text
lim (n → ∞) f(n) / g(n) = 0
```

::slide 3. Hitung limitnya
```text
lim (n → ∞) f(n) / g(n) = lim (n → ∞) 2n / n²
                        = lim (n → ∞) 2 / n
                        = 2 / ∞
                        = 0
```

::slide 4. Simpulkan
Karena limit f(n) / g(n) = 0, maka dengan demikian **benar** bahwa 2n = o(n²).
:::

### Hubungan Limit dengan Definisi: Mencari n₀

Limit sama dengan 0 berarti pertaksamaan 2n < c·n² berlaku untuk n yang cukup besar, **berapa pun** c-nya. Bagi kedua ruas dengan n, maka syaratnya menjadi 2 < c·n, yaitu n > 2/c. Semakin kecil c, semakin besar n₀ yang dibutuhkan, tetapi n₀ selalu ada:

| c | Syarat n > 2/c | n₀ terkecil |
| --- | --- | --- |
| 4 | n > 0,5 | 1 |
| 2 | n > 1 | 2 |
| 1 | n > 2 | 3 |
| 0,5 | n > 4 | 5 |
| 0,1 | n > 20 | 21 |

Coba sendiri. Isian di bawah berisi f(n) = 2n, g(n) = n², dan c = 0,5, sama dengan baris pada tabel di atas (n₀ = 5). Ganti c menjadi 0,1 dan lihat n₀ bergeser menjadi 21. Lalu ganti f(n) menjadi 2n^2 dengan c = 1: limitnya menjadi 2 dan pertaksamaan f(n) < c·g(n) tidak pernah terpenuhi.

::limit 2n ; n^2 ; 1/2

:::reveal Lihat penjelasan: mengapa 2n² ≠ o(n²)
Pada f(n) = 2n² dan g(n) = n², limitnya bukan 0:

```text
lim (n → ∞) 2n² / n² = lim (n → ∞) 2 = 2
```

Dari sisi definisi, ambil c = 1. Syarat 2n² < 1·n² tidak pernah terpenuhi untuk n berapa pun, sehingga tidak ada n₀. Cukup satu nilai c yang gagal untuk membatalkan o, karena definisi menuntut **semua** c > 0.

Namun 2n² = O(n²) tetap benar, karena pada Big-Oh cukup ada satu c (misalnya c = 2 atau c = 3).
:::

:::quiz Cek pemahaman: notasi Little-Oh
::question Nilai limit f(n)/g(n) untuk n menuju tak hingga pada f(n) = o(g(n)) adalah...
- [x] 0
- [ ] Bilangan positif tertentu, misalnya 2
- [ ] Tak hingga
::explain
Little-Oh berarti f(n) tumbuh lebih lambat daripada g(n), sehingga rasio f(n)/g(n) mengecil menuju 0.
::question Pada pembuktian 2n = o(n²), mengapa n₀ untuk c = 0,1 jauh lebih besar daripada untuk c = 4?
- [ ] Karena c yang kecil membuat f(n) lebih besar
- [x] Karena syaratnya n > 2/c, jadi c yang kecil menuntut n yang lebih besar
- [ ] Karena n₀ selalu sama untuk semua c
::explain
2n < c·n² sama dengan n > 2/c. Untuk c = 4 cukup n ≥ 1, sedangkan untuk c = 0,1 harus n ≥ 21.
::question Mengapa 2n² ≠ o(n²)?
- [ ] Karena 2n² tumbuh lebih lambat dari n²
- [x] Karena limit 2n²/n² adalah 2, bukan 0, dan untuk c = 1 syarat 2n² < c·n² tidak pernah terpenuhi
- [ ] Karena notasi o hanya berlaku untuk fungsi linier
::explain
Little-Oh menuntut limit 0. Di sini limitnya 2, sehingga f(n) dan g(n) tumbuh sama cepat dan batasnya ketat (Θ), bukan o.
:::

## C. Notasi Little-Omega (ω)

Dengan analogi seperti Little-Oh, untuk menunjukkan batas bawah suatu fungsi *running time* yang tidak *asymptotically tight* digunakan notasi Little-Omega (ω). Fungsi *running time* f(n) dikatakan masuk dalam himpunan ω(g(n)) jika dan hanya jika:

```text
ω(g(n)) = { f(n) | untuk sembarang konstanta positif c terdapat n₀ > 0
                   sedemikian sehingga 0 ≤ c·g(n) < f(n), untuk semua n ≥ n₀ }
```

Contoh: n²/2 = ω(n), tetapi n²/2 ≠ ω(n²). Penjelasannya:

- f(n) = ω(g(n)) menunjukkan bahwa limit f(n)/g(n) untuk n menuju tak hingga sama dengan tak hingga.
- Fungsi *running time* f(n) tumbuh lebih cepat dibandingkan fungsi *running time* g(n).

### Contoh ω: n²/2 = ω(n)

Tunjukkan bahwa n²/2 = ω(n).

:::steps Pembuktian n²/2 = ω(n)
::slide 1. Tentukan f(n) dan g(n)
```text
f(n) = n²/2
g(n) = n
```

::slide 2. Ingat syarat limit
f(n) = ω(g(n)) menunjukkan bahwa:

```text
lim (n → ∞) f(n) / g(n) = ∞
```

::slide 3. Hitung limitnya
```text
lim (n → ∞) f(n) / g(n) = lim (n → ∞) (n²/2) / n
                        = lim (n → ∞) n / 2
                        = ∞
```

::slide 4. Simpulkan
Karena limit f(n) / g(n) = ∞, maka dengan demikian **benar** bahwa n²/2 = ω(n).
:::

### Hubungan Limit dengan Definisi: Mencari n₀

Pertaksamaan c·n < n²/2 menjadi n > 2c setelah kedua ruas dibagi n/2. Semakin besar c, semakin besar n₀ yang dibutuhkan, tetapi n₀ selalu ada:

| c | Syarat n > 2c | n₀ terkecil |
| --- | --- | --- |
| 0,5 | n > 1 | 2 |
| 1 | n > 2 | 3 |
| 10 | n > 20 | 21 |
| 100 | n > 200 | 201 |

Isian di bawah berisi f(n) = n²/2, g(n) = n, dan c = 10, sama dengan baris pada tabel di atas (n₀ = 21). Ganti c menjadi 100 dan lihat n₀ bergeser menjadi 201. Lalu ganti g(n) menjadi n^2 dengan c = 1: limitnya menjadi 1/2 dan pertaksamaan c·g(n) < f(n) tidak pernah terpenuhi.

::limit n^2/2 ; n ; 10

:::reveal Lihat penjelasan: mengapa n²/2 ≠ ω(n²)
Pada f(n) = n²/2 dan g(n) = n², limitnya bukan tak hingga:

```text
lim (n → ∞) (n²/2) / n² = lim (n → ∞) 1/2 = 1/2
```

Dari sisi definisi, ambil c = 1. Syarat c·n² < n²/2, yaitu n² < n²/2, tidak pernah terpenuhi, sehingga tidak ada n₀. Satu nilai c yang gagal sudah cukup untuk membatalkan ω.

Namun n²/2 = Ω(n²) tetap benar, bahkan n²/2 = Θ(n²), karena rasionya mendatar di ½.
:::

:::quiz Cek pemahaman: notasi Little-Omega
::question Nilai limit f(n)/g(n) untuk n menuju tak hingga pada f(n) = ω(g(n)) adalah...
- [ ] 0
- [ ] Bilangan positif tertentu
- [x] Tak hingga
::explain
Little-Omega berarti f(n) tumbuh lebih cepat daripada g(n), sehingga rasio f(n)/g(n) membesar tanpa batas.
::question Pada pembuktian n²/2 = ω(n), syarat pertaksamaan c·n < n²/2 setara dengan...
- [ ] n < 2c
- [x] n > 2c
- [ ] n > c/2
::explain
Bagi kedua ruas dengan n/2 (positif), didapat 2c < n.
::question Manakah yang benar?
- [ ] n²/2 = ω(n²)
- [x] n²/2 = ω(n) dan n²/2 = Θ(n²)
- [ ] n²/2 = o(n)
::explain
n²/2 tumbuh lebih cepat daripada n (ω), tetapi sama cepat dengan n² (Θ), sehingga bukan ω(n²). Ia juga bukan o(n), karena o berarti lebih lambat.
:::

### Klasifikasikan Sendiri

Pemeriksa yang sama bisa dipakai untuk fungsi mana pun. Hasil limitnya langsung menentukan golongannya: 0 berarti o, tak hingga berarti ω, dan bilangan positif tertentu berarti Θ. Isian di bawah berisi 3n² + 5 melawan 7n², yaitu contoh kedua pada soal challenge di akhir materi. Derajat kedua polinom sama, jadi hasilnya Θ. Perhatikan bahwa pada c = 4 pertaksamaan f(n) < c·g(n) terpenuhi sejak n₀ = 1, dan pada c = 1/2 sejak n₀ = 4. Namun pada c = 1/10 pertaksamaan itu gagal. Satu c yang gagal sudah cukup untuk membuktikan bahwa 3n² + 5 bukan o(7n²).

::limit 3n^2 + 5 ; 7n^2 ; 4

## D. Mencoba Grafik Rasio

Grafik di bawah menggambar rasio f(n)/g(n) untuk pasangan fungsi pilihan Anda, dan menandai n₀ untuk nilai c yang dipilih. Ada beberapa hal yang bisa dicoba:

- Pilih contoh bawaan n = o(n²). Rasionya terus mengecil menuju 0, dan untuk c yang makin kecil n₀ bergeser ke kanan.
- Pilih n² = ω(n). Rasionya terus membesar, dan untuk c yang makin besar n₀ bergeser ke kanan.
- Pilih n² dan n². Rasionya mendatar, jadi hubungannya Θ, bukan o dan bukan ω.
- Pilih n melawan n log n dengan c kecil. Rasionya memang menuju 0, tetapi butuh n yang sangat besar.

::visualizer

## E. Rangkuman

| Notasi | Syarat untuk semua n ≥ n₀ | Nilai limit f(n) / g(n) | Artinya | Contoh di materi |
| --- | --- | --- | --- | --- |
| o(g(n)) | 0 ≤ f(n) < c·g(n), untuk sembarang c > 0 | 0 | f tumbuh lebih lambat dari g | 2n = o(n²) |
| ω(g(n)) | 0 ≤ c·g(n) < f(n), untuk sembarang c > 0 | ∞ | f tumbuh lebih cepat dari g | n²/2 = ω(n) |

- Little-Oh dan Little-Omega adalah batas yang **tidak ketat**. Perbedaan dengan Big-Oh dan Omega: syaratnya berlaku untuk **sembarang** konstanta c > 0, bukan hanya satu c.
- Cara cepat membuktikannya adalah menghitung limit f(n)/g(n): hasil 0 berarti o, hasil tak hingga berarti ω, dan hasil bilangan positif tertentu berarti Θ (bukan o dan bukan ω).
- o termasuk O, dan ω termasuk Ω. Jika f(n) = o(g(n)), maka f(n) = O(g(n)) juga benar, tetapi tidak sebaliknya.

## A. Pertumbuhan Fungsi Running Time

*Running time* dari suatu algoritma membentuk sebuah fungsi, yaitu fungsi f(n). Pada analisis algoritma Insertion Sort di pertemuan ke-2, didapat bentuk fungsi *running time* untuk *best case* dan *worst case*, yaitu fungsi **linier** dan fungsi **kuadrat**.

Setiap fungsi tumbuh sesuai kenaikan nilai n. Materi ini membahas cara membandingkan laju pertumbuhan fungsi-fungsi tersebut, supaya kita bisa menilai algoritma mana yang tetap cepat saat datanya membesar.

### Bentuk-Bentuk Umum Fungsi Running Time

Bentuk-bentuk umum fungsi *running time* antara lain sebagai berikut, dengan c adalah konstanta.

| No | Fungsi | Nama |
| --- | --- | --- |
| 1 | c | Fungsi konstanta |
| 2 | c₂ lg n | Fungsi logaritma |
| 3 | c₃ n | Fungsi linier |
| 4 | c₄ n lg n | Fungsi n lg n |
| 5 | c₅ n² | Fungsi kuadrat |
| 6 | c₆ n³ | Fungsi kubik |
| 7 | c₇ 2ⁿ | Fungsi eksponensial |
| 8 | c₈ n! | Fungsi faktorial |

Geser ukuran input n dan lihat nilai tiap fungsi. Daftar di atas sudah tersusun dari fungsi yang paling lambat tumbuh sampai yang paling cepat.

::growth

:::quiz Cek pemahaman: bentuk fungsi running time
::question Insertion Sort pada kasus terburuk (worst case) memiliki fungsi running time berbentuk apa?
- [ ] Linier
- [x] Kuadrat
- [ ] Eksponensial
::explain
Pada pertemuan ke-2, kasus terbaik Insertion Sort berbentuk linier dan kasus terburuknya berbentuk kuadrat.
::question Di antara n lg n, n³, dan 2ⁿ, fungsi mana yang tumbuh paling cepat untuk n yang besar?
- [ ] n lg n
- [ ] n³
- [x] 2ⁿ
::explain
Fungsi eksponensial pada akhirnya selalu melampaui fungsi polinomial seperti n³. Urutan dari yang paling lambat: n lg n, n³, 2ⁿ.
:::

## B. Rasio Kenaikan Fungsi

Laju pertumbuhan setiap fungsi dapat dihitung menggunakan **rasio**, yaitu perbandingan nilai fungsi sesudah dan sebelum n dinaikkan:

```text
Rasio = f(n₂) / f(n₁)
```

Sebagai contoh, kita hitung rasio kenaikan dari n = 5 menjadi n = 25 untuk kedelapan fungsi *running time* di atas. Geser slide satu per satu. Perhatikan bahwa konstanta c selalu habis terbagi, sehingga rasio hanya ditentukan oleh bentuk fungsinya.

### Penurunan Rasio untuk n = 5 menjadi n = 25

:::steps Rasio kenaikan n = 5 menjadi n = 25
::slide 1. Fungsi konstanta: f(n) = c
```text
f(n)  = c
f(5)  = c
f(25) = c

Rasio = f(25) / f(5) = c / c = 1
```

Fungsi konstanta tidak naik sama sekali, jadi rasionya 1.

::slide 2. Fungsi logaritma: f(n) = c₂ lg n
```text
f(n)  = c₂ lg n
f(5)  = c₂ lg 5
f(25) = c₂ lg 25

Rasio = (c₂ lg 25) / (c₂ lg 5)
      = lg 5² / lg 5
      = 2 lg 5 / lg 5
      = 2
```

Catatan penting tentang logaritma:

- Sifat logaritma: **lg xᵃ = a lg x**.
- lg x adalah logaritma basis 2 dari x, sedangkan log x adalah logaritma basis 10 dari x.
- Logaritma basis b ditulis log_b x = (log x) / (log b), dengan b adalah basis logaritma. Untuk b = 2, log_b x ditulis sebagai lg x.

::slide 3. Fungsi linier: f(n) = c₃ n
```text
f(n)  = c₃ n
f(5)  = c₃ · 5
f(25) = c₃ · 25

Rasio = (c₃ · 25) / (c₃ · 5) = 5
```

::slide 4. Fungsi n lg n: f(n) = c₄ n lg n
```text
f(n)  = c₄ n lg n
f(5)  = c₄ · 5 lg 5
f(25) = c₄ · 25 lg 25

Rasio = (c₄ · 25 lg 25) / (c₄ · 5 lg 5)
      = 25 lg 5² / (5 lg 5)
      = 25 · 2 lg 5 / (5 lg 5)
      = 50 / 5
      = 10
```

::slide 5. Fungsi kuadrat: f(n) = c₅ n²
```text
f(n)  = c₅ n²
f(5)  = c₅ · 5²
f(25) = c₅ · 25²

Rasio = (c₅ · 25²) / (c₅ · 5²) = 5² = 25
```

::slide 6. Fungsi kubik: f(n) = c₆ n³
```text
f(n)  = c₆ n³
f(5)  = c₆ · 5³
f(25) = c₆ · 25³

Rasio = (c₆ · 25³) / (c₆ · 5³) = 5³ = 125
```

::slide 7. Fungsi eksponensial: f(n) = c₇ 2ⁿ
```text
f(n)  = c₇ 2ⁿ
f(5)  = c₇ · 2⁵
f(25) = c₇ · 2²⁵

Rasio = (c₇ · 2²⁵) / (c₇ · 2⁵) = 2^(25 − 5) = 2²⁰
```

Nilainya 2²⁰ = 1.048.576, artinya waktunya menjadi satu juta kali lebih lama.

::slide 8. Fungsi faktorial: f(n) = c₈ n!
```text
f(n)  = c₈ n!
f(5)  = c₈ · 5!
f(25) = c₈ · 25!

Rasio = (c₈ · 25!) / (c₈ · 5!)
      = (25 · 24 · 23 · 22 · … · 6 · 5!) / 5!
      = 25 · 24 · 23 · … · 6
```

Hasil perkaliannya sekitar 1,29 × 10²³.
:::

### Rangkuman Rasio

| Fungsi | Rumus rasio | Nilai rasio |
| --- | --- | --- |
| c | c / c | 1 |
| c₂ lg n | lg 5² / lg 5 | 2 |
| c₃ n | 25 / 5 | 5 |
| c₄ n lg n | 25 · 2 lg 5 / (5 lg 5) | 10 |
| c₅ n² | 5² | 25 |
| c₆ n³ | 5³ | 125 |
| c₇ 2ⁿ | 2²⁰ | 1.048.576 |
| c₈ n! | 25 · 24 · 23 · … · 6 | sekitar 1,29 × 10²³ |

Semakin kecil nilai rasio, berarti *running time* algoritma tersebut semakin cepat, karena waktunya naik lebih sedikit saat n membesar.

### Coba Hitung Sendiri

Tabel di bawah sudah terisi dengan n = 5 menjadi n = 25 sehingga cocok dengan rangkuman di atas. Ganti n awal dan n akhir untuk melihat bagaimana rasionya berubah.

::ratio

:::quiz Cek pemahaman: rasio kenaikan
::question Rasio kenaikan fungsi linier f(n) = c₃ n dari n = 5 menjadi n = 25 adalah...
- [ ] 1
- [x] 5
- [ ] 25
::explain
Rasio = (c₃ · 25) / (c₃ · 5) = 5. Data menjadi 5 kali lebih banyak, dan waktunya ikut menjadi 5 kali lebih lama.
::question Rasio kenaikan fungsi kuadrat f(n) = c₅ n² dari n = 5 menjadi n = 25 adalah...
- [ ] 5
- [x] 25
- [ ] 125
::explain
Rasio = (c₅ · 25²) / (c₅ · 5²) = 5² = 25.
::question Apakah nilai konstanta c memengaruhi rasio kenaikan?
- [ ] Ya, c yang besar membuat rasionya lebih besar
- [x] Tidak, c selalu habis dibagi pada f(n₂) / f(n₁)
- [ ] Hanya untuk fungsi kuadrat
::explain
c muncul di pembilang dan penyebut, sehingga saling menghapus. Karena itu rasio hanya bergantung pada bentuk fungsinya.
::question Algoritma P memiliki rasio 10 dan algoritma Q memiliki rasio 125 untuk kenaikan n yang sama. Mana yang running time-nya lebih cepat?
- [x] Algoritma P, karena rasionya lebih kecil
- [ ] Algoritma Q, karena rasionya lebih besar
- [ ] Keduanya sama cepat
::explain
Semakin kecil rasio, semakin sedikit waktu bertambah saat n membesar, sehingga running time-nya semakin cepat.
:::

## C. Contoh Soal: Memilih Algoritma atau Komputer yang Lebih Cepat

Algoritma A dengan f(n) = c₄ n lg n dan algoritma B dengan f(n) = c₅ n² membutuhkan waktu yang sama, yaitu T detik, untuk mengurutkan data sebanyak n = 4.

- **a.** Berapa waktu yang dibutuhkan algoritma A dan B jika datanya sebanyak n = 1024, dan keduanya dijalankan di komputer yang sama?
- **b.** Jika algoritma B dijalankan di komputer dengan kecepatan processor 20 kali lebih cepat dibandingkan komputer yang digunakan algoritma A, mana yang lebih efisien: penggunaan komputer dengan processor yang lebih cepat, atau pemilihan algoritma yang tepat?

Kerjakan dulu di kertas. Setelah itu buka jawabannya, atau cocokkan rasionya dengan penghitung berikut, yang sudah diisi n = 4 menjadi n = 1024 untuk n lg n dan n².

::ratio n log n, n^2 ; 4, 1024

:::reveal Lihat jawaban a: kedua algoritma di komputer yang sama
Untuk n = 4, kedua algoritma membutuhkan waktu T detik. Kita hitung rasio kenaikan dari n = 4 menjadi n = 1024.

**Algoritma A:** f(n) = c₄ n lg n

```text
f(4)    = c₄ · 4 lg 4
f(1024) = c₄ · 1024 lg 1024

Rasio = (c₄ · 1024 lg 1024) / (c₄ · 4 lg 4)
      = 1024 lg 4⁵ / (4 lg 4)
      = 1024 · 5 lg 4 / (4 lg 4)
      = 1280
```

**Algoritma B:** f(n) = c₅ n²

```text
f(4)    = c₅ · 4²
f(1024) = c₅ · 1024²

Rasio = (c₅ · 1024²) / (c₅ · 4²)
      = (4⁵)² / 4²
      = 65536
```

Rasio kenaikan dari n = 4 menjadi n = 1024 untuk algoritma A adalah 1280, sedangkan untuk algoritma B adalah 65536.

**Jadi,** waktu untuk mengurutkan n = 1024 data adalah **1280 × T detik** untuk algoritma A dan **65536 × T detik** untuk algoritma B.
:::

:::reveal Lihat jawaban b: processor lebih cepat atau algoritma tepat
Algoritma B dijalankan di komputer yang 20 kali lebih cepat, sehingga waktu yang dibutuhkan untuk n = 1024 menjadi:

```text
65536 T / 20 = 3276,8 T detik
```

Algoritma A tetap membutuhkan 1280 T detik, sehingga hasilnya **masih lebih cepat algoritma A**.

**Kesimpulan:** lebih efisien memilih algoritma yang tepat daripada memakai komputer dengan processor yang lebih cepat.

Catatan: jika komputernya hanya 2 kali lebih cepat, waktu algoritma B menjadi 65536 T / 2 = 32768 T detik. Kesimpulannya sama, bahkan selisihnya makin besar.
:::

:::quiz Cek pemahaman: contoh soal
::question Untuk algoritma A (c₄ n lg n), berapa rasio kenaikan dari n = 4 menjadi n = 1024?
- [ ] 256
- [x] 1280
- [ ] 65536
::explain
Rasio = 1024 lg 1024 / (4 lg 4) = 1024 · 10 / (4 · 2) = 1280. Perhatikan bahwa lg 1024 = 10 dan lg 4 = 2.
::question Mengapa algoritma B tetap kalah walaupun dijalankan di komputer yang jauh lebih cepat?
- [ ] Karena konstanta c₅ pasti lebih besar dari c₄
- [x] Karena n² tumbuh jauh lebih cepat daripada n lg n, dan percepatan processor hanya mengurangi waktu dengan faktor tetap
- [ ] Karena komputer yang lebih cepat tidak memengaruhi waktu
::explain
Processor yang lebih cepat hanya membagi waktu dengan faktor tetap (20 kali), sedangkan selisih laju pertumbuhan n² dan n lg n terus membesar saat n bertambah.
:::

## D. Grafik Pertumbuhan Fungsi

Rasio memberi tahu seberapa cepat suatu fungsi tumbuh, tetapi belum menunjukkan **kapan** satu fungsi mulai mengalahkan fungsi lain. Untuk itu kita membandingkan kurvanya langsung.

Pilih Fungsi A dan Fungsi B, atur pengali c pada A, lalu geser n yang disorot. Titik tempat kurva saling menyalip ditandai di grafik. Ada beberapa hal yang bisa dicoba:

- Pilih kombinasi bawaan, yaitu n² melawan 2ⁿ dengan c = 1. Pada n = 1 sampai 4, 2ⁿ belum selalu lebih besar (n = 2 dan n = 4 sama besar, n = 3 masih lebih kecil). Mulai n = 5, 2ⁿ selalu lebih besar. Ini sama dengan soal challenge di akhir materi.
- Naikkan pengali c pada A. Perhatikan bahwa titik persilangan bergeser ke kanan, tetapi 2ⁿ tetap akhirnya menang.
- Ganti Fungsi A menjadi n lg n dan Fungsi B menjadi n², lalu bandingkan dengan contoh soal di bagian C.

::visualizer

## E. Rangkuman

- *Running time* algoritma berbentuk fungsi f(n). Bentuk umumnya: konstanta, logaritma, linier, n lg n, kuadrat, kubik, eksponensial, dan faktorial.
- Laju pertumbuhan fungsi dihitung dengan rasio f(n₂) / f(n₁). Konstanta c habis dibagi, jadi rasio hanya bergantung pada bentuk fungsinya.
- Semakin kecil rasio, semakin cepat *running time* algoritma tersebut.
- Fungsi yang tumbuh lebih lambat pada akhirnya selalu menang atas fungsi yang tumbuh lebih cepat, walaupun konstanta atau kecepatan komputernya lebih kecil. Memilih algoritma yang tepat lebih efisien daripada sekadar memakai komputer yang lebih cepat.

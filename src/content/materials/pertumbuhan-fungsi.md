## A. Pertumbuhan Fungsi Running Time

*Running time* dari suatu algoritma membentuk sebuah fungsi, yaitu fungsi $f(n)$. Pada analisis algoritma Insertion Sort di pertemuan ke-2, didapat bentuk fungsi *running time* untuk *best case* dan *worst case*, yaitu fungsi **linier** dan fungsi **kuadrat**.

Setiap fungsi tumbuh sesuai kenaikan nilai $n$. Materi ini membahas cara membandingkan laju pertumbuhan fungsi-fungsi tersebut, supaya kita bisa menilai algoritma mana yang tetap cepat saat datanya membesar.

### Bentuk-Bentuk Umum Fungsi Running Time

Bentuk-bentuk umum fungsi *running time* antara lain sebagai berikut, dengan $c$ adalah konstanta.

| No | Fungsi | Nama |
| --- | --- | --- |
| 1 | $c$ | Fungsi konstanta |
| 2 | $c_2 \lg n$ | Fungsi logaritma |
| 3 | $c_3 n$ | Fungsi linier |
| 4 | $c_4 n \lg n$ | Fungsi $n \lg n$ |
| 5 | $c_5 n^2$ | Fungsi kuadrat |
| 6 | $c_6 n^3$ | Fungsi kubik |
| 7 | $c_7 2^n$ | Fungsi eksponensial |
| 8 | $c_8 n!$ | Fungsi faktorial |

Geser ukuran input $n$ dan lihat nilai tiap fungsi. Daftar di atas sudah tersusun dari fungsi yang paling lambat tumbuh sampai yang paling cepat.

::growth

:::quiz Cek pemahaman: bentuk fungsi running time
::question Insertion Sort pada kasus terburuk (worst case) memiliki fungsi running time berbentuk apa?
- [ ] Linier
- [x] Kuadrat
- [ ] Eksponensial
::explain
Pada pertemuan ke-2, kasus terbaik Insertion Sort berbentuk linier dan kasus terburuknya berbentuk kuadrat.
::question Di antara $n \lg n$, $n^3$, dan $2^n$, fungsi mana yang tumbuh paling cepat untuk $n$ yang besar?
- [ ] $n \lg n$
- [ ] $n^3$
- [x] $2^n$
::explain
Fungsi eksponensial pada akhirnya selalu melampaui fungsi polinomial seperti $n^3$. Urutan dari yang paling lambat: $n \lg n$, $n^3$, $2^n$.
:::

## B. Rasio Kenaikan Fungsi

Laju pertumbuhan setiap fungsi dapat dihitung menggunakan **rasio**, yaitu perbandingan nilai fungsi sesudah dan sebelum $n$ dinaikkan:

$$
\begin{aligned}
\text{Rasio} &= \frac{f(n_2)}{f(n_1)}
\end{aligned}
$$

Sebagai contoh, kita hitung rasio kenaikan dari $n = 5$ menjadi $n = 25$ untuk kedelapan fungsi *running time* di atas. Geser slide satu per satu. Perhatikan bahwa konstanta $c$ selalu habis terbagi, sehingga rasio hanya ditentukan oleh bentuk fungsinya.

### Penurunan Rasio untuk n = 5 menjadi n = 25

:::steps Rasio kenaikan n = 5 menjadi n = 25
::slide 1. Fungsi konstanta: f(n) = c
$$
\begin{aligned}
f(n) &= c \\
f(5) &= c \\
f(25) &= c \\[4pt]
\text{Rasio} &= \frac{f(25)}{f(5)} = \frac{c}{c} = 1
\end{aligned}
$$

Fungsi konstanta tidak naik sama sekali, jadi rasionya 1.

::slide 2. Fungsi logaritma: f(n) = c₂ lg n
$$
\begin{aligned}
f(n) &= c_2 \lg n \\
f(5) &= c_2 \lg 5 \\
f(25) &= c_2 \lg 25 \\[4pt]
\text{Rasio} &= \frac{c_2 \lg 25}{c_2 \lg 5} \\
&= \frac{\lg 5^2}{\lg 5} \\
&= \frac{2 \lg 5}{\lg 5} \\
&= 2
\end{aligned}
$$

Catatan penting tentang logaritma:

- Sifat logaritma: **$\lg x^a = a \lg x$**.
- $\lg x$ adalah logaritma basis 2 dari $x$, sedangkan $\log x$ adalah logaritma basis 10 dari $x$.
- Logaritma basis $b$ ditulis $\log_b x = \frac{\log x}{\log b}$, dengan $b$ adalah basis logaritma. Untuk $b = 2$, $\log_b x$ ditulis sebagai $\lg x$.

::slide 3. Fungsi linier: f(n) = c₃ n
$$
\begin{aligned}
f(n) &= c_3 n \\
f(5) &= c_3 \cdot 5 \\
f(25) &= c_3 \cdot 25 \\[4pt]
\text{Rasio} &= \frac{c_3 \cdot 25}{c_3 \cdot 5} = 5
\end{aligned}
$$

::slide 4. Fungsi n lg n: f(n) = c₄ n lg n
$$
\begin{aligned}
f(n) &= c_4 n \lg n \\
f(5) &= c_4 \cdot 5 \lg 5 \\
f(25) &= c_4 \cdot 25 \lg 25 \\[4pt]
\text{Rasio} &= \frac{c_4 \cdot 25 \lg 25}{c_4 \cdot 5 \lg 5} \\
&= \frac{25 \lg 5^2}{5 \lg 5} \\
&= \frac{25 \cdot 2 \lg 5}{5 \lg 5} \\
&= \frac{50}{5} \\
&= 10
\end{aligned}
$$

::slide 5. Fungsi kuadrat: f(n) = c₅ n²
$$
\begin{aligned}
f(n) &= c_5 n^2 \\
f(5) &= c_5 \cdot 5^2 \\
f(25) &= c_5 \cdot 25^2 \\[4pt]
\text{Rasio} &= \frac{c_5 \cdot 25^2}{c_5 \cdot 5^2} = 5^2 = 25
\end{aligned}
$$

::slide 6. Fungsi kubik: f(n) = c₆ n³
$$
\begin{aligned}
f(n) &= c_6 n^3 \\
f(5) &= c_6 \cdot 5^3 \\
f(25) &= c_6 \cdot 25^3 \\[4pt]
\text{Rasio} &= \frac{c_6 \cdot 25^3}{c_6 \cdot 5^3} = 5^3 = 125
\end{aligned}
$$

::slide 7. Fungsi eksponensial: f(n) = c₇ 2ⁿ
$$
\begin{aligned}
f(n) &= c_7 2^n \\
f(5) &= c_7 \cdot 2^5 \\
f(25) &= c_7 \cdot 2^{25} \\[4pt]
\text{Rasio} &= \frac{c_7 \cdot 2^{25}}{c_7 \cdot 2^5} = 2^{25 - 5} = 2^{20}
\end{aligned}
$$

Nilainya $2^{20} = 1.048.576$, artinya waktunya menjadi satu juta kali lebih lama.

::slide 8. Fungsi faktorial: f(n) = c₈ n!
$$
\begin{aligned}
f(n) &= c_8 n! \\
f(5) &= c_8 \cdot 5! \\
f(25) &= c_8 \cdot 25! \\[4pt]
\text{Rasio} &= \frac{c_8 \cdot 25!}{c_8 \cdot 5!} \\
&= \frac{25 \cdot 24 \cdot 23 \cdot 22 \cdot \ldots \cdot 6 \cdot 5!}{5!} \\
&= 25 \cdot 24 \cdot 23 \cdot \ldots \cdot 6
\end{aligned}
$$

Hasil perkaliannya sekitar $1{,}29 \times 10^{23}$.
:::

### Rangkuman Rasio

| Fungsi | Rumus rasio | Nilai rasio |
| --- | --- | --- |
| $c$ | $\frac{c}{c}$ | 1 |
| $c_2 \lg n$ | $\frac{\lg 5^2}{\lg 5}$ | 2 |
| $c_3 n$ | $\frac{25}{5}$ | 5 |
| $c_4 n \lg n$ | $\frac{25 \cdot 2 \lg 5}{5 \lg 5}$ | 10 |
| $c_5 n^2$ | $5^2$ | 25 |
| $c_6 n^3$ | $5^3$ | 125 |
| $c_7 2^n$ | $2^{20}$ | 1.048.576 |
| $c_8 n!$ | $25 \cdot 24 \cdot 23 \cdot \ldots \cdot 6$ | sekitar $1{,}29 \times 10^{23}$ |

Semakin kecil nilai rasio, berarti *running time* algoritma tersebut semakin cepat, karena waktunya naik lebih sedikit saat $n$ membesar.

### Coba Hitung Sendiri

Tabel di bawah sudah terisi dengan $n = 5$ menjadi $n = 25$ sehingga cocok dengan rangkuman di atas. Ganti $n$ awal dan $n$ akhir untuk melihat bagaimana rasionya berubah.

::ratio

:::quiz Cek pemahaman: rasio kenaikan
::question Rasio kenaikan fungsi linier $f(n) = c_3 n$ dari $n = 5$ menjadi $n = 25$ adalah...
- [ ] 1
- [x] 5
- [ ] 25
::explain
$\text{Rasio} = \frac{c_3 \cdot 25}{c_3 \cdot 5} = 5$. Data menjadi 5 kali lebih banyak, dan waktunya ikut menjadi 5 kali lebih lama.
::question Rasio kenaikan fungsi kuadrat $f(n) = c_5 n^2$ dari $n = 5$ menjadi $n = 25$ adalah...
- [ ] 5
- [x] 25
- [ ] 125
::explain
$\text{Rasio} = \frac{c_5 \cdot 25^2}{c_5 \cdot 5^2} = 5^2 = 25$.
::question Apakah nilai konstanta $c$ memengaruhi rasio kenaikan?
- [ ] Ya, $c$ yang besar membuat rasionya lebih besar
- [x] Tidak, $c$ selalu habis dibagi pada $\frac{f(n_2)}{f(n_1)}$
- [ ] Hanya untuk fungsi kuadrat
::explain
$c$ muncul di pembilang dan penyebut, sehingga saling menghapus. Karena itu rasio hanya bergantung pada bentuk fungsinya.
::question Algoritma P memiliki rasio 10 dan algoritma Q memiliki rasio 125 untuk kenaikan $n$ yang sama. Mana yang running time-nya lebih cepat?
- [x] Algoritma P, karena rasionya lebih kecil
- [ ] Algoritma Q, karena rasionya lebih besar
- [ ] Keduanya sama cepat
::explain
Semakin kecil rasio, semakin sedikit waktu bertambah saat $n$ membesar, sehingga running time-nya semakin cepat.
:::

## C. Contoh Soal: Memilih Algoritma atau Komputer yang Lebih Cepat

Algoritma A dengan $f(n) = c_4 n \lg n$ dan algoritma B dengan $f(n) = c_5 n^2$ membutuhkan waktu yang sama, yaitu $T$ detik, untuk mengurutkan data sebanyak $n = 4$.

- **a.** Berapa waktu yang dibutuhkan algoritma A dan B jika datanya sebanyak $n = 1024$, dan keduanya dijalankan di komputer yang sama?
- **b.** Jika algoritma B dijalankan di komputer dengan kecepatan processor 20 kali lebih cepat dibandingkan komputer yang digunakan algoritma A, mana yang lebih efisien: penggunaan komputer dengan processor yang lebih cepat, atau pemilihan algoritma yang tepat?

Kerjakan dulu di kertas. Setelah itu buka jawabannya, atau cocokkan rasionya dengan penghitung berikut, yang sudah diisi $n = 4$ menjadi $n = 1024$ untuk $n \lg n$ dan $n^2$.

::ratio n log n, n^2 ; 4, 1024

:::reveal Lihat jawaban a: kedua algoritma di komputer yang sama
Untuk $n = 4$, kedua algoritma membutuhkan waktu $T$ detik. Kita hitung rasio kenaikan dari $n = 4$ menjadi $n = 1024$.

**Algoritma A:** $f(n) = c_4 n \lg n$

$$
\begin{aligned}
f(4) &= c_4 \cdot 4 \lg 4 \\
f(1024) &= c_4 \cdot 1024 \lg 1024 \\[4pt]
\text{Rasio} &= \frac{c_4 \cdot 1024 \lg 1024}{c_4 \cdot 4 \lg 4} \\
&= \frac{1024 \lg 4^5}{4 \lg 4} \\
&= \frac{1024 \cdot 5 \lg 4}{4 \lg 4} \\
&= 1280
\end{aligned}
$$

**Algoritma B:** $f(n) = c_5 n^2$

$$
\begin{aligned}
f(4) &= c_5 \cdot 4^2 \\
f(1024) &= c_5 \cdot 1024^2 \\[4pt]
\text{Rasio} &= \frac{c_5 \cdot 1024^2}{c_5 \cdot 4^2} \\
&= \frac{(4^5)^2}{4^2} \\
&= 65536
\end{aligned}
$$

Rasio kenaikan dari $n = 4$ menjadi $n = 1024$ untuk algoritma A adalah 1280, sedangkan untuk algoritma B adalah 65536.

**Jadi,** waktu untuk mengurutkan $n = 1024$ data adalah **$1280\,T$ detik** untuk algoritma A dan **$65536\,T$ detik** untuk algoritma B.
:::

:::reveal Lihat jawaban b: processor lebih cepat atau algoritma tepat
Algoritma B dijalankan di komputer yang 20 kali lebih cepat, sehingga waktu yang dibutuhkan untuk $n = 1024$ menjadi:

$$
\frac{65536\,T}{20} = 3276{,}8\,T \text{ detik}
$$

Algoritma A tetap membutuhkan $1280\,T$ detik, sehingga hasilnya **masih lebih cepat algoritma A**.

**Kesimpulan:** lebih efisien memilih algoritma yang tepat daripada memakai komputer dengan processor yang lebih cepat.

Catatan: jika komputernya hanya 2 kali lebih cepat, waktu algoritma B menjadi $\frac{65536\,T}{2} = 32768\,T$ detik. Kesimpulannya sama, bahkan selisihnya makin besar.
:::

:::quiz Cek pemahaman: contoh soal
::question Untuk algoritma A ($c_4 n \lg n$), berapa rasio kenaikan dari $n = 4$ menjadi $n = 1024$?
- [ ] 256
- [x] 1280
- [ ] 65536
::explain
$\text{Rasio} = \frac{1024 \lg 1024}{4 \lg 4} = \frac{1024 \cdot 10}{4 \cdot 2} = 1280$. Perhatikan bahwa $\lg 1024 = 10$ dan $\lg 4 = 2$.
::question Mengapa algoritma B tetap kalah walaupun dijalankan di komputer yang jauh lebih cepat?
- [ ] Karena konstanta $c_5$ pasti lebih besar dari $c_4$
- [x] Karena $n^2$ tumbuh jauh lebih cepat daripada $n \lg n$, dan percepatan processor hanya mengurangi waktu dengan faktor tetap
- [ ] Karena komputer yang lebih cepat tidak memengaruhi waktu
::explain
Processor yang lebih cepat hanya membagi waktu dengan faktor tetap (20 kali), sedangkan selisih laju pertumbuhan $n^2$ dan $n \lg n$ terus membesar saat $n$ bertambah.
:::

## D. Grafik Pertumbuhan Fungsi

Rasio memberi tahu seberapa cepat suatu fungsi tumbuh, tetapi belum menunjukkan **kapan** satu fungsi mulai mengalahkan fungsi lain. Untuk itu kita membandingkan kurvanya langsung.

Pilih Fungsi A dan Fungsi B, atur pengali $c$ pada A, lalu geser $n$ yang disorot. Titik tempat kurva saling menyalip ditandai di grafik. Ada beberapa hal yang bisa dicoba:

- Pilih kombinasi bawaan, yaitu $n^2$ melawan $2^n$ dengan $c = 1$. Pada $n = 1$ sampai 4, $2^n$ belum selalu lebih besar ($n = 2$ dan $n = 4$ sama besar, $n = 3$ masih lebih kecil). Mulai $n = 5$, $2^n$ selalu lebih besar. Ini sama dengan soal challenge di akhir materi.
- Naikkan pengali $c$ pada A. Perhatikan bahwa titik persilangan bergeser ke kanan, tetapi $2^n$ tetap akhirnya menang.
- Ganti Fungsi A menjadi $n \lg n$ dan Fungsi B menjadi $n^2$, lalu bandingkan dengan contoh soal di bagian C.

::visualizer

## E. Rangkuman

- *Running time* algoritma berbentuk fungsi $f(n)$. Bentuk umumnya: konstanta, logaritma, linier, $n \lg n$, kuadrat, kubik, eksponensial, dan faktorial.
- Laju pertumbuhan fungsi dihitung dengan rasio $\frac{f(n_2)}{f(n_1)}$. Konstanta $c$ habis dibagi, jadi rasio hanya bergantung pada bentuk fungsinya.
- Semakin kecil rasio, semakin cepat *running time* algoritma tersebut.
- Fungsi yang tumbuh lebih lambat pada akhirnya selalu menang atas fungsi yang tumbuh lebih cepat, walaupun konstanta atau kecepatan komputernya lebih kecil. Memilih algoritma yang tepat lebih efisien daripada sekadar memakai komputer yang lebih cepat.

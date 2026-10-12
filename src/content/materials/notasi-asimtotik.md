## A. Pengantar Notasi Asimtotik

Dilihat dari laju pertumbuhan fungsi *running time*, suatu fungsi *running time* $f(n)$ dapat digolongkan ke dalam salah satu notasi asimtotik. Ada 3 notasi asimtotik untuk menggolongkan fungsi *running time*:

| No | Notasi | Nama | Arti singkat |
| --- | --- | --- | --- |
| 1 | $\Theta$ | Theta | Batas atas dan batas bawah sekaligus (batas ketat) |
| 2 | $O$ | Big Oh | Batas atas |
| 3 | $\Omega$ | Omega | Batas bawah |

Pada pertemuan sebelumnya sudah dijelaskan bahwa bentuk *worst case running time* algoritma Insertion Sort adalah $T(n) = an^2 + bn + c$, yang dalam bentuk notasi ditulis $T(n) = \Theta(n^2)$. Materi ini menjelaskan arti notasi itu secara tepat dan cara membuktikannya dengan definisi.

Ketiga notasi punya pola pembuktian yang sama:

1. Tulis $f(n)$ dan $g(n)$ dari soal.
2. Tulis pertaksamaan yang diminta definisi, lalu bagi semua ruas dengan $g(n)$.
3. Masukkan $n = 1, 2, 3, \ldots$ sampai nilainya memenuhi, untuk mendapatkan $n_0$.
4. Lihat nilai untuk $n$ yang sangat besar, untuk menentukan konstanta $c$ (atau $c_1$ dan $c_2$).

:::quiz Cek pemahaman: tiga notasi
::question Notasi mana yang menyatakan batas atas dan batas bawah sekaligus?
- [x] $\Theta$ (Theta)
- [ ] $O$ (Big Oh)
- [ ] $\Omega$ (Omega)
::explain
Theta menjepit $f(n)$ di antara $c_1g(n)$ di bawah dan $c_2g(n)$ di atas, sehingga disebut batas ketat.
::question Notasi Big Oh menggambarkan batas apa dari $f(n)$?
- [ ] Batas bawah
- [x] Batas atas
- [ ] Batas atas dan bawah sekaligus
::explain
Pada Big Oh, $f(n)$ tidak pernah melebihi $c\cdot g(n)$ untuk $n \ge n_0$, sehingga $g(n)$ menjadi batas atas.
:::

## B. Notasi Theta (Θ)

Apabila diberikan fungsi $g(n)$ yang dinotasikan dalam himpunan fungsi $\Theta(g(n))$, fungsi *running time* $f(n)$ dikatakan masuk dalam himpunan $\Theta(g(n))$ jika dan hanya jika:

$$
\begin{aligned}
\Theta(g(n)) = \{\, f(n) \mid{}& \text{terdapat konstanta positif } c_1, c_2, \text{ dan } n_0 \text{ sedemikian sehingga}  \\
& 0 \le c_1 g(n) \le f(n) \le c_2 g(n), \text{ untuk semua } n \ge n_0 \,\}
\end{aligned}
$$

Bentuk $f(n) = \Theta(g(n))$ digambarkan dalam grafik berikut. $n$ adalah banyaknya data bilangan yang di-input. Fungsi *running time* $f(n)$ dikatakan mempunyai fungsi batas atas $c_2g(n)$ dan fungsi batas bawah $c_1g(n)$.

![Grafik f(n) = Θ(g(n)): kurva f(n) terletak di antara kurva batas bawah c₁g(n) dan batas atas c₂g(n) mulai dari garis putus-putus n₀ ke kanan.](/materi/notasi-asimtotik/grafik-theta.png)

### Contoh Θ: 2n² − 3n + 1 = Θ(n²)

Tunjukkan bahwa $2n^2 - 3n + 1 = \Theta(n^2)$. Geser slide satu per satu untuk mengikuti pembuktiannya.

:::steps Pembuktian 2n² − 3n + 1 = Θ(n²)
::slide 1. Tentukan f(n) dan g(n)
$$
\begin{aligned}
f(n) &= 2n^2 - 3n + 1 \\
g(n) &= n^2
\end{aligned}
$$

Dari definisi $\Theta$, kita harus mencari konstanta positif $c_1$, $c_2$, dan $n_0$ sedemikian sehingga:

$$
0 \le c_1 n^2 \le 2n^2 - 3n + 1 \le c_2 n^2 \quad \text{untuk semua } n \ge n_0
$$

::slide 2. Bagi semua ruas dengan n²
$$
\begin{aligned}
c_1 &\le \frac{2n^2}{n^2} - \frac{3n}{n^2} + \frac{1}{n^2} \le c_2 \\
c_1 &\le 2 - \frac{3}{n} + \frac{1}{n^2} \le c_2
\end{aligned}
$$

Selanjutnya masukkan $n = 1, 2, 3, \ldots$ ke bentuk $2 - \frac{3}{n} + \frac{1}{n^2}$ untuk mendapatkan $c_1$, $c_2$, dan $n_0$.

::slide 3. Coba nilai n satu per satu
$$
\begin{aligned}
n = 1:\; & 2 - \frac{3}{1} + \frac{1}{1^2} = 2 - 3 + 1 = 0 \\
n = 2:\; & 2 - \frac{3}{2} + \frac{1}{2^2} = 2 - \frac{3}{2} + \frac{1}{4} = \frac{8 - 6 + 1}{4} = \frac{3}{4} \quad \text{(nilai } > 0 \text{, tetapkan } n_0 = 2\text{)} \\
n = 3:\; & 2 - \frac{3}{3} + \frac{1}{3^2} = 2 - 1 + \frac{1}{9} = \frac{18 - 9 + 1}{9} = \frac{10}{9} \\
& \vdots \\
n = \infty:\; & 2 - \frac{3}{\infty} + \frac{1}{\infty} = 2 - 0 + 0 = 2
\end{aligned}
$$

Pada $n = 1$ nilainya 0, belum positif, sehingga $c_1$ tidak bisa positif. Mulai $n = 2$ nilainya positif dan terus naik mendekati 2.

::slide 4. Tetapkan c₁, c₂, dan n₀
Agar $c_1 \le 2 - \frac{3}{n} + \frac{1}{n^2} \le c_2$ untuk semua $n \ge n_0$, tetapkan:

$$
c_1 = \frac{3}{4}, \quad c_2 = 2, \quad n_0 = 2
$$

Jadi dipenuhi $0 \le c_1n^2 \le 2n^2 - 3n + 1 \le c_2n^2$ untuk semua $n \ge n_0$.

Dengan demikian **terbukti** bahwa $2n^2 - 3n + 1 = \Theta(n^2)$.
:::

Sekarang coba sendiri. Isian di bawah sudah berisi contoh di atas ($c_1 = \frac{3}{4}$ dan $c_2 = 2$). Perhatikan baris $n = 1$ yang nilainya 0, lalu ganti $c_1$ menjadi 1 dan lihat $n_0$ bergeser menjadi 3. Coba juga $c_2 = 1$: batas atasnya akhirnya terlewati sehingga tidak ada $n_0$.

::bound Theta ; 2, -3, 1 ; n^2 ; 3/4, 2

:::quiz Cek pemahaman: notasi Theta
::question Pada pembuktian $2n^2 - 3n + 1 = \Theta(n^2)$, mengapa $n_0$ ditetapkan 2 dan bukan 1?
- [ ] Karena $n$ harus selalu genap
- [x] Karena pada $n = 1$ nilai $2 - \frac{3}{n} + \frac{1}{n^2}$ sama dengan 0, padahal $c_1$ harus positif
- [ ] Karena $n_0$ selalu bernilai 2 untuk fungsi kuadrat
::explain
Konstanta $c_1$ harus positif dan $c_1 \le 2 - \frac{3}{n} + \frac{1}{n^2}$. Pada $n = 1$ nilainya 0, sehingga tidak ada $c_1$ positif yang cocok. Mulai $n = 2$ nilainya $\frac{3}{4}$, dan seterusnya naik.
::question Untuk $n$ yang sangat besar, nilai $2 - \frac{3}{n} + \frac{1}{n^2}$ mendekati...
- [ ] 0
- [x] 2
- [ ] $\frac{3}{4}$
::explain
Suku $\frac{3}{n}$ dan $\frac{1}{n^2}$ mengecil menuju 0 saat $n$ membesar, sehingga nilainya mendekati 2. Itulah sebabnya $c_2 = 2$ sudah cukup sebagai batas atas.
::question Dalam definisi $\Theta$, apakah konstanta $c_1$ dan $c_2$ boleh bernilai negatif?
- [ ] Boleh
- [x] Tidak, keduanya harus konstanta positif
- [ ] Hanya $c_1$ yang boleh negatif
::explain
Definisi mensyaratkan konstanta positif $c_1$, $c_2$, dan $n_0$.
:::

## C. Notasi Big Oh (O)

Apabila diberikan fungsi $g(n)$, fungsi *running time* $f(n)$ dikatakan masuk dalam himpunan $O(g(n))$ jika dan hanya jika:

$$
\begin{aligned}
O(g(n)) = \{\, f(n) \mid{}& \text{terdapat konstanta positif } c \text{ dan } n_0 \text{ sedemikian sehingga}  \\
& 0 \le f(n) \le c \cdot g(n), \text{ untuk semua } n \ge n_0 \,\}
\end{aligned}
$$

Bentuk $f(n) = O(g(n))$ digambarkan dalam grafik berikut. Fungsi *running time* $f(n)$ dikatakan mempunyai fungsi batas atas $c\cdot g(n)$.

![Grafik f(n) = O(g(n)): kurva f(n) berada di bawah atau sama dengan kurva batas atas c·g(n) mulai dari garis putus-putus n₀ ke kanan.](/materi/notasi-asimtotik/grafik-big-o.png)

### Contoh O: ½n² − 3n = O(n²)

Tunjukkan bahwa $\frac{1}{2}n^2 - 3n = O(n^2)$.

:::steps Pembuktian ½n² − 3n = O(n²)
::slide 1. Tentukan f(n) dan g(n)
$$
\begin{aligned}
f(n) &= \frac{1}{2}n^2 - 3n \\
g(n) &= n^2
\end{aligned}
$$

Dari definisi $O$, kita harus mencari konstanta positif $c$ dan $n_0$ sedemikian sehingga:

$$
0 \le \frac{1}{2}n^2 - 3n \le c \cdot n^2 \quad \text{untuk semua } n \ge n_0
$$

::slide 2. Bagi semua ruas dengan n²
$$
\begin{aligned}
\frac{\frac{1}{2}n^2}{n^2} - \frac{3n}{n^2} &\le c \\
\frac{1}{2} - \frac{3}{n} &\le c
\end{aligned}
$$

Selanjutnya masukkan $n = 1, 2, 3, \ldots$ untuk mendapatkan $c$ dan $n_0$. Syarat $0 \le f(n)$ ikut menentukan $n_0$: nilai $\frac{1}{2} - \frac{3}{n}$ tidak boleh negatif.

::slide 3. Coba nilai n satu per satu
$$
\begin{aligned}
n = 1:\; & \frac{1}{2} - \frac{3}{1} = -\frac{5}{2} < 0 \quad \text{(tidak mungkin } n_0 = 1\text{)} \\
n = 2:\; & \frac{1}{2} - \frac{3}{2} = -1 < 0 \quad \text{(tidak mungkin } n_0 = 2\text{)} \\
n = 3:\; & \frac{1}{2} - \frac{3}{3} = -\frac{1}{2} < 0 \quad \text{(tidak mungkin } n_0 = 3\text{)} \\
n = 4:\; & \frac{1}{2} - \frac{3}{4} = -\frac{1}{4} < 0 \quad \text{(tidak mungkin } n_0 = 4\text{)} \\
n = 5:\; & \frac{1}{2} - \frac{3}{5} = -\frac{1}{10} < 0 \quad \text{(tidak mungkin } n_0 = 5\text{)} \\
n = 6:\; & \frac{1}{2} - \frac{3}{6} = 0 \quad \text{(ambil } n_0 = 6\text{)} \\
n = 7:\; & \frac{1}{2} - \frac{3}{7} = \frac{1}{14} \\
& \vdots \\
n = \infty:\; & \frac{1}{2} - \frac{3}{\infty} = \frac{1}{2}
\end{aligned}
$$

Selama nilainya negatif, $\frac{1}{2}n^2 - 3n < 0$ sehingga syarat $0 \le f(n)$ dilanggar. Nilai pertama yang tidak negatif muncul pada $n = 6$.

::slide 4. Tetapkan c dan n₀
Agar $\frac{1}{2} - \frac{3}{n} \le c$ untuk semua $n \ge n_0$, tetapkan:

$$
c = \frac{1}{2}, \quad n_0 = 6
$$

Jadi dipenuhi $0 \le \frac{1}{2}n^2 - 3n \le c\cdot n^2$ untuk semua $n \ge n_0$.

Dengan demikian **terbukti** bahwa $\frac{1}{2}n^2 - 3n = O(n^2)$.
:::

Isian di bawah berisi contoh di atas ($c = \frac{1}{2}$). Amati bahwa baris $n = 1$ sampai 5 bernilai negatif, sehingga syarat $0 \le f(n)$ baru terpenuhi mulai $n_0 = 6$. Coba ganti $c$ menjadi $\frac{1}{4}$: batas atasnya akhirnya terlewati sehingga tidak ada $n_0$.

::bound O ; 1/2, -3, 0 ; n^2 ; 1/2

:::quiz Cek pemahaman: notasi Big Oh
::question Pada pembuktian $\frac{1}{2}n^2 - 3n = O(n^2)$, nilai $n_0 = 6$ dipilih karena...
- [x] mulai $n = 6$ nilai $\frac{1}{2} - \frac{3}{n}$ tidak lagi negatif, sehingga $0 \le f(n)$ terpenuhi
- [ ] $c$ harus sama dengan 6
- [ ] fungsi kuadrat selalu memiliki $n_0 = 6$
::explain
Untuk $n < 6$ nilai $\frac{1}{2}n^2 - 3n$ negatif, sehingga syarat $0 \le f(n)$ dilanggar. Pada $n = 6$ nilainya tepat 0, dan sesudahnya positif.
::question Nilai $\frac{1}{2} - \frac{3}{n}$ untuk $n$ yang sangat besar mendekati...
- [ ] 0
- [x] $\frac{1}{2}$
- [ ] 3
::explain
Suku $\frac{3}{n}$ menuju 0, sehingga nilainya mendekati $\frac{1}{2}$. Karena nilainya tidak pernah melebihi $\frac{1}{2}$, $c = \frac{1}{2}$ memenuhi.
:::

## D. Notasi Omega (Ω)

Apabila diberikan fungsi $g(n)$, fungsi *running time* $f(n)$ dikatakan masuk dalam himpunan $\Omega(g(n))$ jika dan hanya jika:

$$
\begin{aligned}
\Omega(g(n)) = \{\, f(n) \mid{}& \text{terdapat konstanta positif } c \text{ dan } n_0 \text{ sedemikian sehingga}  \\
& 0 \le c \cdot g(n) \le f(n), \text{ untuk semua } n \ge n_0 \,\}
\end{aligned}
$$

Bentuk $f(n) = \Omega(g(n))$ digambarkan dalam grafik berikut. Fungsi *running time* $f(n)$ dikatakan mempunyai fungsi batas bawah $c\cdot g(n)$.

![Grafik f(n) = Ω(g(n)): kurva f(n) berada di atas atau sama dengan kurva batas bawah c·g(n) mulai dari garis putus-putus n₀ ke kanan.](/materi/notasi-asimtotik/grafik-omega.png)

### Contoh Ω: 10n − 20 = Ω(n)

Tunjukkan bahwa $10n - 20 = \Omega(n)$.

:::steps Pembuktian 10n − 20 = Ω(n)
::slide 1. Tentukan f(n) dan g(n)
$$
\begin{aligned}
f(n) &= 10n - 20 \\
g(n) &= n
\end{aligned}
$$

Dari definisi $\Omega$, kita harus mencari konstanta positif $c$ dan $n_0$ sedemikian sehingga:

$$
0 \le c \cdot n \le 10n - 20 \quad \text{untuk semua } n \ge n_0
$$

::slide 2. Bagi semua ruas dengan n
$$
c \le 10 - \frac{20}{n}
$$

Selanjutnya masukkan $n = 1, 2, 3, \ldots$ untuk mendapatkan $c$ dan $n_0$.

::slide 3. Coba nilai n satu per satu
$$
\begin{aligned}
n = 1:\; & 10 - \frac{20}{1} = -10 \\
n = 2:\; & 10 - \frac{20}{2} = 0 \\
n = 3:\; & 10 - \frac{20}{3} = \frac{30 - 20}{3} = \frac{10}{3} \quad \text{(nilai } > 0 \text{, tetapkan } n_0 = 3\text{)} \\
n = 4:\; & 10 - \frac{20}{4} = 5 \\
& \vdots \\
n = \infty:\; & 10 - \frac{20}{\infty} = 10
\end{aligned}
$$

Pada $n = 1$ nilainya negatif dan pada $n = 2$ tepat 0, belum ada $c$ positif yang cocok. Mulai $n = 3$ nilainya positif dan terus naik.

::slide 4. Tetapkan c dan n₀
Agar $c \le 10 - \frac{20}{n}$ untuk semua $n \ge n_0$, tetapkan:

$$
c = \frac{10}{3}, \quad n_0 = 3
$$

Jadi dipenuhi $0 \le c\cdot n \le 10n - 20$ untuk semua $n \ge n_0$.

Dengan demikian **terbukti** bahwa $10n - 20 = \Omega(n)$.
:::

Isian di bawah berisi contoh di atas ($c = \frac{10}{3}$). Coba naikkan $c$ menjadi 5 dan lihat $n_0$ bergeser menjadi 4, lalu menjadi 20 untuk $c = 9$, agar terlihat bahwa $c$ yang lebih besar membutuhkan $n_0$ yang lebih besar. Coba juga $c = 11$: nilainya melampaui koefisien $n$ pada $f(n)$, sehingga tidak ada $n_0$.

::bound Omega ; 0, 10, -20 ; n ; 10/3

:::quiz Cek pemahaman: notasi Omega
::question Pada pembuktian $10n - 20 = \Omega(n)$, mengapa $c = \frac{10}{3}$ dan $n_0 = 3$ dipilih?
- [ ] Karena $n = 2$ sudah memberi $c$ positif
- [x] Karena nilai $10 - \frac{20}{n}$ pertama kali positif pada $n = 3$, yaitu $\frac{10}{3}$, dan terus naik sesudahnya
- [ ] Karena $c$ selalu harus lebih kecil dari 1
::explain
Pada $n = 2$ nilainya 0 sehingga $c$ tidak bisa positif. Pada $n = 3$ nilainya $\frac{10}{3}$, dan untuk $n$ yang lebih besar nilainya naik (5, 6, …) sehingga $c = \frac{10}{3}$ tetap memenuhi.
::question Batas bawah $c\cdot n$ yang dipakai pada contoh ini memiliki bentuk apa?
- [x] Linier, karena $g(n) = n$
- [ ] Kuadrat, karena $g(n) = n^2$
- [ ] Konstanta
::explain
Soal meminta $10n - 20 = \Omega(n)$, jadi $g(n) = n$ dan batas bawahnya $c\cdot n$.
:::

## E. Mencoba Grafik Batas Asimtotik

Grafik di bawah menggambar $f(n) = a\cdot n^2 + b\cdot n + c$ yang terjepit di antara $c_1\cdot n^2$ dan $c_2\cdot n^2$. Atur nilai $a$, $b$, $c$, $c_1$, dan $c_2$, lalu geser $n$ yang disorot. Titik $n_0$, yaitu $n$ terkecil sehingga batas berlaku untuk semua $n$ sesudahnya, ditandai di grafik. Ada beberapa hal yang bisa dicoba:

- Pilih contoh soal bawaan: $f(n) = 3n^2 + 10n + 5$ dengan $c_1 = 1$ dan $c_2 = 4$ menghasilkan $n_0 = 11$. Ini sama dengan contoh pada soal challenge di akhir materi.
- Pilih notasi $O$ saja, atau $\Omega$ saja, lalu amati bahwa hanya satu batas yang dibutuhkan.
- Pilih $c_2$ yang terlalu kecil (di bawah $a$). Perhatikan bahwa batas atas akhirnya terlewati oleh $f(n)$, sehingga tidak ada $n_0$.
- Pilih $c_1$ yang lebih besar dari $a$. Batas bawahnya akhirnya terlewati oleh $f(n)$ juga.

::visualizer

## F. Rangkuman

| Notasi | Syarat untuk semua $n \ge n_0$ | Batas yang diberikan | Contoh di materi |
| --- | --- | --- | --- |
| $\Theta(g(n))$ | $0 \le c_1g(n) \le f(n) \le c_2g(n)$ | Atas dan bawah (ketat) | $2n^2 - 3n + 1 = \Theta(n^2)$ |
| $O(g(n))$ | $0 \le f(n) \le c\cdot g(n)$ | Atas | $\frac{1}{2}n^2 - 3n = O(n^2)$ |
| $\Omega(g(n))$ | $0 \le c\cdot g(n) \le f(n)$ | Bawah | $10n - 20 = \Omega(n)$ |

- Notasi asimtotik menggolongkan fungsi *running time* $f(n)$ berdasarkan laju pertumbuhannya untuk $n$ yang besar.
- Pembuktian dengan definisi dilakukan dengan membagi pertaksamaan dengan $g(n)$, mencoba $n = 1, 2, 3, \ldots$, lalu menetapkan $n_0$ dan konstanta dari nilai yang memenuhi dan nilai untuk $n$ menuju tak hingga.
- Konstanta pada definisi harus positif, dan pertaksamaan hanya perlu berlaku mulai $n_0$, bukan untuk semua $n$.

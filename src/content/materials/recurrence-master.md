## A. Fungsi Running Time Berbentuk Recurrence

Materi ini mengacu pada buku Thomas H. Cormen, halaman 83 sampai 96. Suatu fungsi *running time* yang di dalamnya mengandung fungsi *running time* itu sendiri disebut fungsi *running time* berbentuk ***recurrence***.

Pada materi 6 sudah dibahas algoritma Merge Sort, dengan fungsi *running time* berbentuk *recurrence*, yaitu:

$$
T(n) = 2T\left(\frac{n}{2}\right) + \Theta(n), \quad \text{untuk } n > 1
$$

Ada tiga metode untuk menentukan notasi asimtotik dari fungsi *running time* berbentuk *recurrence*:

| No | Metode | Nama dalam buku |
| --- | --- | --- |
| 1 | Metode substitusi | *Substitution Method* |
| 2 | Metode pohon rekursif | *Recursion-Tree Method* |
| 3 | Metode Master | *Master Method* |

Pembahasan di materi ini hanya memakai **metode Master**. Metode pohon rekursif tetap bisa dilihat lewat visualisasi di bagian G, untuk memahami dari mana tiga kasus Metode Master berasal.

:::quiz Cek pemahaman: recurrence
::question Manakah yang merupakan fungsi running time berbentuk recurrence?
- [ ] $T(n) = 3n^2 + 5n + 2$
- [x] $T(n) = 2T\left(\frac{n}{2}\right) + \Theta (n)$
- [ ] $T(n) = \Theta (n \log n)$
::explain
Pada pilihan kedua, $T$ muncul di kedua ruas: ruas kanan memuat $T\left(\frac{n}{2}\right)$. Dua pilihan lain tidak memuat fungsi running time itu sendiri di ruas kanan.
::question Metode apa yang dipakai pada materi ini untuk menentukan notasi asimtotik dari recurrence?
- [ ] Metode substitusi
- [ ] Metode pohon rekursif
- [x] Metode Master
::explain
Dari tiga metode yang ada, materi ini hanya memakai Metode Master. Pohon rekursif dipakai di bagian G hanya sebagai gambaran.
:::

## B. Metode Master

Metode Master dapat dipakai bila fungsi *running time* $T(n)$ berbentuk:

$$
T(n) = aT\left(\frac{n}{b}\right) + f(n)
$$

Artinya masing-masing bagian berikut:

| Bagian | Arti |
| --- | --- |
| $a \ge 1$ | Banyaknya submasalah |
| $b > 1$ | Faktor pembagi ukuran masalah, jadi tiap submasalah berukuran $\frac{n}{b}$ |
| $f(n)$ | Waktu untuk membagi masalah dan menggabungkan hasil submasalah |

Kunci metode ini adalah membandingkan $f(n)$ dengan fungsi pembanding $g(n)$:

$$
g(n) = n^{\log_b a}
$$

Hasilnya ditentukan oleh tiga kasus. Perhatikan bahwa hanya satu kasus yang berlaku, sesuai hasil perbandingan $f(n)$ dengan $g(n)$.

| Kasus | Perbandingan $f(n)$ dengan $g(n)$ | Hasil $T(n)$ |
| --- | --- | --- |
| 1 | $f(n) = O(n^{\log_b a - \epsilon })$ untuk suatu $\epsilon > 0$, jadi $f(n)$ lebih kecil | $\Theta (n^{\log_b a})$ |
| 2 | $f(n) = \Theta (n^{\log_b a})$, jadi $f(n)$ sama dengan $g(n)$ | $\Theta (n^{\log_b a} \cdot \log n)$ |
| 3 | $f(n) = \Omega (n^{\log_b a + \epsilon })$ untuk suatu $\epsilon > 0$, jadi $f(n)$ lebih besar, **dan** $a\cdot f\left(\frac{n}{b}\right) \le c\cdot f(n)$ untuk suatu $c < 1$ | $\Theta (f(n))$ |

$\epsilon$ adalah bilangan positif yang kecil. Cukup ada satu $\epsilon$ yang memenuhi.

Langkah umum memakai Metode Master selalu sama. Geser slide satu per satu.

:::steps Langkah memakai Metode Master
::slide 1. Tentukan a, b, dan f(n)
Ubah recurrence ke bentuk $T(n) = aT\left(\frac{n}{b}\right) + f(n)$, lalu baca nilai $a$, $b$, dan $f(n)$. Pastikan $a \ge 1$ dan $b > 1$. Bila bentuknya $T\left(\frac{3n}{5}\right)$, tulis $\frac{3n}{5} = \frac{n}{5/3}$, sehingga $b = \frac{5}{3}$.

::slide 2. Hitung g(n)
$$
g(n) = n^{\log_b a}
$$
Hitung $\log_b a$, lalu tulis $g(n)$ sebagai $n$ berpangkat bilangan itu. Misalnya $\log_2 4 = 2$ sehingga $g(n) = n^2$.

::slide 3. Bandingkan pangkat n pada f(n) dan g(n)
Bandingkan pangkat $n$ pada $f(n)$ dengan pangkat $n$ pada $g(n)$:

- $f(n)$ berpangkat **lebih kecil** → kasus 1.
- $f(n)$ berpangkat **sama** → kasus 2.
- $f(n)$ berpangkat **lebih besar** → kasus 3.

::slide 4. Periksa syarat tambahan dan tulis hasilnya
Pada kasus 3, periksa juga $a\cdot f\left(\frac{n}{b}\right) \le c\cdot f(n)$ untuk suatu $c < 1$. Bila terpenuhi, hasilnya $\Theta (f(n))$. Pada kasus 1 hasilnya $\Theta (n^{\log_b a})$, dan pada kasus 2 hasilnya $\Theta (n^{\log_b a} \cdot \log n)$.
:::

:::quiz Cek pemahaman: bentuk Metode Master
::question Pada $T(n) = 4T\left(\frac{n}{2}\right) + n$, berapa nilai $a$ dan $b$?
- [x] $a = 4$ dan $b = 2$
- [ ] $a = 2$ dan $b = 4$
- [ ] $a = 4$ dan $b = 1$
::explain
Bentuknya $aT\left(\frac{n}{b}\right)$: $a = 4$ adalah banyaknya submasalah, dan $b = 2$ sebab ukuran tiap submasalah $\frac{n}{2}$.
::question Pada $T(n) = 2T\left(\frac{n}{2}\right) + n$, berapa $g(n) = n^{\log_b a}$?
- [ ] $n^2$
- [x] $n$
- [ ] 1
::explain
$\log_2 2 = 1$, jadi $g(n) = n^1 = n$.
::question Manakah recurrence yang bisa diselesaikan dengan Metode Master?
- [ ] $T(n) = T(n - 1) + n$
- [x] $T(n) = 3T\left(\frac{n}{2}\right) + n^2$
- [ ] $T(n) = T(n - 1) + T(n - 2)$
::explain
Metode Master hanya untuk bentuk $aT\left(\frac{n}{b}\right) + f(n)$, yaitu ukuran masalah dibagi dengan $b$. Pilihan pertama dan ketiga mengurangi ukuran masalah, bukan membaginya.
:::

## C. Kasus 1: f(n) Lebih Kecil dari g(n)

Pada kasus 1, $f(n) = O(n^{\log_b a - \epsilon })$ untuk suatu $\epsilon > 0$. Artinya $f(n)$ tumbuh lebih lambat dari $g(n) = n^{\log_b a}$. Fungsi $f(n)$ dibatasi dari atas oleh $c\cdot n^{\log_b a - \epsilon }$, jadi pangkat $n$ pada $f(n)$ lebih kecil dari pangkat $n$ pada $g(n)$.

Hasilnya:

$$
T(n) = \Theta\left(n^{\log_b a}\right)
$$

### Contoh Kasus 1: T(n) = 2T(n/2) + √n

Tentukan notasi kompleksitas dari $T(n) = 2T\left(\frac{n}{2}\right) + \sqrt{n}$.

:::steps Penyelesaian T(n) = 2T(n/2) + √n
::slide 1. Tentukan a, b, dan f(n)
$$
a = 2, \quad b = 2, \quad f(n) = \sqrt{n} = n^{1/2}
$$
Bentuknya $aT\left(\frac{n}{b}\right) + f(n)$, jadi memenuhi syarat Metode Master.

::slide 2. Hitung g(n)
$$
g(n) = n^{\log_b a} = n^{\log_2 2} = n
$$

::slide 3. Bandingkan
Pangkat $n$ pada $f(n) = n^{\frac{1}{2}}$ lebih kecil daripada pangkat $n$ pada $g(n) = n$. Syarat kasus 1 terpenuhi:

$$
\begin{aligned}
f(n) &= O\left(n^{1-\epsilon}\right) \\
&\quad \text{untuk } 0 < \epsilon \le \tfrac{1}{2}
\end{aligned}
$$

::slide 4. Simpulkan
Berlaku kasus 1, sehingga:

$$
T(n) = \Theta\left(n^{\log_b a}\right) = \Theta(n)
$$
:::

:::quiz Cek pemahaman: kasus 1
::question Pada kasus 1, bagaimana bentuk hasil $T(n)$?
- [ ] $\Theta (f(n))$
- [x] $\Theta (n^{\log_b a})$
- [ ] $\Theta (n^{\log_b a} \cdot \log n)$
::explain
Pada kasus 1, $f(n)$ lebih kecil dari $g(n)$, jadi $g(n)$ yang menentukan: $T(n) = \Theta (n^{\log_b a})$.
::question Tentukan notasi kompleksitas dari $T(n) = 8T\left(\frac{n}{2}\right) + n^2$.
- [ ] $\Theta (n^2)$
- [ ] $\Theta (n^2 \log n)$
- [x] $\Theta (n^3)$
::explain
$a = 8$ dan $b = 2$ sehingga $g(n) = n^{\log_2 8} = n^3$. Pangkat $n$ pada $f(n) = n^2$ lebih kecil dari 3, jadi kasus 1: $T(n) = \Theta (n^3)$.
:::

## D. Kasus 2: f(n) Sama dengan g(n)

Pada kasus 2, $f(n) = \Theta (g(n))$ dengan $g(n) = n^{\log_b a}$. Fungsi $f(n)$ dibatasi dari bawah oleh $c_1\cdot g(n)$ dan dari atas oleh $c_2\cdot g(n)$, jadi $f(n)$ dan $g(n)$ tumbuh sama cepat.

Hasilnya:

$$
T(n) = \Theta\left(n^{\log_b a} \cdot \log n\right)
$$

### Contoh Kasus 2: T(n) = 4T(n/2) + n²

Tentukan notasi kompleksitas dari $T(n) = 4T\left(\frac{n}{2}\right) + n^2$.

:::steps Penyelesaian T(n) = 4T(n/2) + n²
::slide 1. Tentukan a, b, dan f(n)
$$
a = 4, \quad b = 2, \quad f(n) = n^2
$$
Bentuknya $aT\left(\frac{n}{b}\right) + f(n)$, jadi memenuhi syarat Metode Master.

::slide 2. Hitung g(n)
$$
g(n) = n^{\log_b a} = n^{\log_2 4} = n^2
$$

::slide 3. Bandingkan
Pangkat $n$ pada $f(n)$ sama dengan pangkat $n$ pada $g(n)$, yaitu $f(n) = g(n) = n^2$. Syarat kasus 2 terpenuhi.

::slide 4. Simpulkan
Berlaku kasus 2, sehingga:

$$
\begin{aligned}
T(n) &= \Theta\left(n^{\log_b a} \cdot \log n\right) \\
&= \Theta\left(n^2 \cdot \log n\right)
\end{aligned}
$$
:::

Recurrence Merge Sort pada materi 6, yaitu $T(n) = 2T\left(\frac{n}{2}\right) + \Theta (n)$, juga termasuk kasus 2: $a = 2$ dan $b = 2$ sehingga $g(n) = n^{\log_2 2} = n$, dan $f(n) = \Theta (n) = g(n)$. Hasilnya $\Theta (n \log n)$.

:::quiz Cek pemahaman: kasus 2
::question Kapan kasus 2 berlaku?
- [ ] Bila $f(n)$ tumbuh lebih lambat dari $n^{\log_b a}$
- [x] Bila $f(n) = \Theta (n^{\log_b a})$
- [ ] Bila $f(n)$ tumbuh lebih cepat dari $n^{\log_b a}$
::explain
Kasus 2 berlaku bila $f(n)$ dan $g(n) = n^{\log_b a}$ tumbuh sama cepat, yaitu $f(n) = \Theta (g(n))$.
::question Tentukan notasi kompleksitas dari $T(n) = 3T\left(\frac{n}{3}\right) + n$.
- [ ] $\Theta (n)$
- [x] $\Theta (n \log n)$
- [ ] $\Theta (n^2)$
::explain
$a = 3$ dan $b = 3$ sehingga $g(n) = n^{\log_3 3} = n$. Karena $f(n) = n = g(n)$, berlaku kasus 2: $T(n) = \Theta (n \log n)$.
:::

## E. Kasus 3: f(n) Lebih Besar dari g(n)

Pada kasus 3, $f(n) = \Omega (n^{\log_b a + \epsilon })$ untuk suatu $\epsilon > 0$. Artinya $f(n)$ tumbuh lebih cepat dari $g(n) = n^{\log_b a}$: $f(n)$ dibatasi dari bawah oleh $c\cdot n^{\log_b a + \epsilon }$, jadi pangkat $n$ pada $f(n)$ lebih besar dari pangkat $n$ pada $g(n)$.

Kasus 3 punya **satu syarat tambahan**:

$$
a \cdot f\left(\frac{n}{b}\right) \le c \cdot f(n), \quad c < 1
$$

Bila kedua syarat terpenuhi, hasilnya:

$$
T(n) = \Theta(f(n))
$$

### Contoh Kasus 3: T(n) = T(3n/5) + n

Tentukan notasi kompleksitas dari $T(n) = T\left(\frac{3n}{5}\right) + n$.

:::steps Penyelesaian T(n) = T(3n/5) + n
::slide 1. Tentukan a, b, dan f(n)
Karena $\frac{3n}{5} = \frac{n}{5/3}$, maka:

$$
a = 1, \quad b = \frac{5}{3}, \quad f(n) = n
$$
Bentuknya $aT\left(\frac{n}{b}\right) + f(n)$ dengan $a \ge 1$ dan $b > 1$, jadi memenuhi syarat Metode Master.

::slide 2. Hitung g(n)
$$
\begin{aligned}
g(n) &= n^{\log_b a} \\
&= n^{\log_{5/3} 1} \\
&= n^{\log_{5/3} \left(\frac{5}{3}\right)^{0}} \\
&= n^0
\end{aligned}
$$
Pangkat nol dari bilangan berapa pun adalah 1, jadi $\log_{5/3} 1 = 0$ dan $g(n) = 1$.

::slide 3. Bandingkan
Pangkat $n$ pada $f(n) = n$ lebih besar daripada pangkat $n$ pada $g(n) = n^0$. Syarat pertama kasus 3 terpenuhi:

$$
\begin{aligned}
f(n) &= \Omega\left(n^{0+\epsilon}\right) \\
&\quad \text{untuk } 0 < \epsilon \le 1
\end{aligned}
$$

::slide 4. Periksa syarat tambahan
$$
a \cdot f\left(\frac{n}{b}\right) = f\left(\frac{n}{5/3}\right) = \frac{n}{5/3} = \frac{3}{5} \cdot n
$$
Ambil $c = \frac{3}{5}$, sehingga $a\cdot f\left(\frac{n}{b}\right) \le c\cdot f(n)$ dengan $c < 1$. Syarat tambahan terpenuhi.

::slide 5. Simpulkan
Berlaku kasus 3, sehingga:

$$
T(n) = \Theta(f(n)) = \Theta(n)
$$
:::

:::reveal Mengapa kasus 3 butuh syarat tambahan a·f(n/b) ≤ c·f(n)?
Syarat itu memastikan biaya pada tiap tingkat rekursi mengecil dengan perbandingan tetap, yaitu paling besar $c$ kali biaya tingkat di atasnya. Jumlah biaya semua tingkat lalu paling banyak berupa deret geometri dengan suku pertama $f(n)$, sehingga totalnya tetap $\Theta (f(n))$.

Pada contoh di atas biaya tiap tingkat menjadi $\frac{3}{5}$ kali tingkat sebelumnya. Tanpa syarat itu, $f(n)$ yang lebih besar dari $g(n)$ saja belum menjamin hasil $\Theta (f(n))$.
:::

:::quiz Cek pemahaman: kasus 3
::question Pada $T(n) = T\left(\frac{n}{2}\right) + n$, berapa nilai $g(n) = n^{\log_b a}$?
- [ ] $n$
- [x] 1
- [ ] $n^2$
::explain
$a = 1$ dan $b = 2$, jadi $\log_2 1 = 0$ dan $g(n) = n^0 = 1$.
::question Pada $T(n) = T\left(\frac{n}{2}\right) + n$, syarat tambahan kasus 3 dipenuhi dengan $c$ = ...
- [x] $\frac{1}{2}$
- [ ] 2
- [ ] $\frac{3}{2}$
::explain
$a\cdot f\left(\frac{n}{b}\right) = 1 \cdot (\frac{n}{2}) = (\frac{1}{2})\cdot n$, jadi $c = \frac{1}{2}$ yang lebih kecil dari 1. Hasilnya $\Theta (f(n)) = \Theta (n)$.
::question Tentukan notasi kompleksitas dari $T(n) = 3T\left(\frac{n}{2}\right) + n^2$.
- [ ] $\Theta (n^{\log_2 3})$
- [ ] $\Theta (n^2 \log n)$
- [x] $\Theta (n^2)$
::explain
$\log_2 3 \approx 1{,}58$ sehingga $g(n) \approx n^{1{,}58}$, lebih kecil dari $f(n) = n^2$. Syarat tambahan: $3 \cdot \left(\frac{n}{2}\right)^2 = \frac{3}{4} \cdot n^2$, jadi $c = \frac{3}{4} < 1$. Berlaku kasus 3: $T(n) = \Theta (n^2)$.
:::

## F. Contoh Soal

Tentukan notasi kompleksitas dari fungsi *running time* berbentuk:

1. $T(n) = 9T\left(\frac{n}{3}\right) + n$
2. $T(n) = 5T\left(\frac{n}{2}\right) + n^3$

Coba kerjakan sendiri dengan empat langkah di bagian B. Setelah itu bukalah penyelesaiannya di bawah.

:::reveal Lihat penyelesaian soal 1: T(n) = 9T(n/3) + n
$T(n) = 9T\left(\frac{n}{3}\right) + n$ memiliki $a = 9$, $b = 3$, dan $f(n) = n$, sehingga memenuhi syarat Metode Master.

$$
\begin{aligned}
f(n) &= n \\
g(n) &= n^{\log_b a} = n^{\log_3 9} = n^2
\end{aligned}
$$

Pangkat $n$ pada $f(n)$ lebih kecil daripada pangkat $n$ pada $g(n)$, dan memenuhi:

$$
\begin{aligned}
f(n) &= O\left(n^{2-\epsilon}\right) \\
&\quad \text{untuk } 0 < \epsilon \le 1
\end{aligned}
$$

Berlaku kasus 1, sehingga:

$$
T(n) = \Theta\left(n^{\log_b a}\right) = \Theta\left(n^2\right)
$$
:::

:::reveal Lihat penyelesaian soal 2: T(n) = 5T(n/2) + n³
$T(n) = 5T\left(\frac{n}{2}\right) + n^3$ memiliki $a = 5$, $b = 2$, dan $f(n) = n^3$.

$$
\begin{aligned}
f(n) &= n^3 \\
g(n) &= n^{\log_b a} = n^{\log_2 5} \approx n^{2{,}32}
\end{aligned}
$$

Pangkat $n$ pada $f(n)$ lebih besar daripada pangkat $n$ pada $g(n)$, dan memenuhi:

$$
\begin{aligned}
f(n) &= \Omega\left(n^{2{,}32+\epsilon}\right) \\
&\quad \text{untuk } 0 < \epsilon \le 0{,}67
\end{aligned}
$$

Periksa syarat tambahan:

$$
a \cdot f\left(\frac{n}{b}\right) = 5 \cdot \left(\frac{n}{2}\right)^3 = \frac{5}{8} \cdot n^3
$$

Ambil $c = \frac{5}{8}$, sehingga $a\cdot f\left(\frac{n}{b}\right) \le c\cdot f(n)$ dengan $c < 1$. Berlaku kasus 3, sehingga:

$$
T(n) = \Theta(f(n)) = \Theta\left(n^3\right)
$$
:::

:::quiz Cek pemahaman: latihan lain
::question Tentukan notasi kompleksitas dari $T(n) = 16T\left(\frac{n}{4}\right) + n$.
- [x] $\Theta (n^2)$
- [ ] $\Theta (n)$
- [ ] $\Theta (n \log n)$
::explain
$a = 16$ dan $b = 4$ sehingga $g(n) = n^{\log_4 16} = n^2$. Pangkat $n$ pada $f(n) = n$ lebih kecil, jadi kasus 1: $T(n) = \Theta (n^2)$.
::question Tentukan notasi kompleksitas dari $T(n) = 2T\left(\frac{n}{2}\right) + n^3$.
- [ ] $\Theta (n)$
- [ ] $\Theta (n \log n)$
- [x] $\Theta (n^3)$
::explain
$g(n) = n^{\log_2 2} = n$, lebih kecil dari $f(n) = n^3$. Syarat tambahan: $2 \cdot \left(\frac{n}{2}\right)^3 = \frac{1}{4} \cdot n^3$, jadi $c = \frac{1}{4} < 1$. Berlaku kasus 3: $T(n) = \Theta (n^3)$.
:::

:::reveal Catatan: tidak semua recurrence tercakup tiga kasus
Tiga kasus tidak mencakup semua $f(n)$. Contohnya $T(n) = 2T\left(\frac{n}{2}\right) + n \log n$. Di sini $g(n) = n$, dan $f(n) = n \log n$ memang tumbuh lebih cepat dari $g(n)$, tetapi hanya lebih cepat sebesar faktor $\log n$, bukan sebesar $n^\epsilon$ untuk suatu $\epsilon > 0$. Jadi tidak ada kasus yang berlaku, dan Metode Master tidak bisa dipakai pada recurrence itu. Untuk soal seperti itu dipakai metode lain, misalnya metode substitusi.
:::

### Mencoba Penentu Kasus Metode Master

Peraga di bawah mengerjakan empat langkah di bagian B untuk recurrence apa pun yang Anda isi. Isi $a$, $b$, dan $f(n)$, lalu baca langkah penyelesaiannya satu per satu: nilai $g(n)$, perbandingan pangkat $n$, rentang $\epsilon$, syarat tambahan kasus 3, dan hasil $\Theta$. Isian awal adalah soal 2 di atas, yaitu $T(n) = 5T\left(\frac{n}{2}\right) + n^3$.

::master 5 ; 2 ; n^3

Beberapa isian yang bisa dicoba (tombol "Kembalikan contoh" memulihkan isian awal):

| $a$ ; $b$ ; $f(n)$ | Recurrence | Kasus | Hasil |
| --- | --- | --- | --- |
| `9 ; 3 ; n` | $T(n) = 9T\left(\frac{n}{3}\right) + n$ | 1 | $\Theta (n^2)$ |
| `4 ; 2 ; n^2` | $T(n) = 4T\left(\frac{n}{2}\right) + n^2$ | 2 | $\Theta (n^2 \cdot \log n)$ |
| `1 ; 5/3 ; n` | $T(n) = T\left(\frac{3n}{5}\right) + n$ | 3 | $\Theta (n)$ |
| `3 ; 2 ; n` | $T(n) = 3T\left(\frac{n}{2}\right) + n$ | 1 | $\Theta(n^{\log_2 3}) \approx \Theta(n^{1{,}58})$ |
| `2 ; 2 ; n log n` | $T(n) = 2T\left(\frac{n}{2}\right) + n \log n$ | tidak ada | Metode Master tidak bisa dipakai |

Beberapa hal yang perlu diketahui tentang isiannya:

- $a$ adalah bilangan bulat 1 sampai 99, dan $b$ boleh pecahan. Untuk $T\left(\frac{3n}{5}\right)$ tulis $b = \frac{5}{3}$, seperti di contoh kasus 3.
- $f(n)$ berbentuk $n^p$ dengan $p \ge 0$, boleh pecahan atau desimal (`n^1,5`, `√n`), dan boleh dikali $\log n$ sampai pangkat 3 (`n log n`, `n² log n`). Koefisien di depannya, misalnya $3n^2$, tidak memengaruhi hasil $\Theta$.
- Bila pangkat $n$ pada $f(n)$ sama dengan $g(n)$ tetapi $f(n)$ punya faktor $\log n$ tambahan, hasilnya "tidak ada kasus yang berlaku", sama seperti catatan $T(n) = 2T\left(\frac{n}{2}\right) + n \log n$ di atas.
- Bila $\epsilon$ dan $c$ tidak bisa ditulis sebagai pecahan sederhana (misalnya karena $\log_2 5$ bukan bilangan bulat), peraga menulis perkiraan desimal dan batas $\epsilon$ dibulatkan ke bawah, jadi nilainya pasti memenuhi.

## G. Mencoba Visualisasi Pohon Rekursi

Visualisasi di bawah membuka pohon rekursi untuk $T(n) = a\cdot T\left(\frac{n}{b}\right)$ + nᶜ, level demi level, dengan tabel biaya tiap level. Ukuran masalah dibuat $n = b^k$, dan kasus dasar ($n = 1$) berbiaya 1. Dari pohon ini terlihat asal tiga kasus Metode Master: letak biaya terbesar menentukan hasilnya.

| Contoh siap pakai | Kasus | Biaya terbesar ada di |
| --- | --- | --- |
| Merge sort: $T(n) = 2T\left(\frac{n}{2}\right) + n$ | 2 | Sama di setiap level, jadi dikali jumlah level ($\log n$) |
| Binary search: $T(n) = T\left(\frac{n}{2}\right) + 1$ | 2 | Sama di setiap level, jadi $\Theta (\log n)$ |
| Daun dominan: $T(n) = 3T\left(\frac{n}{2}\right) + n$ | 1 | Level terbawah (daun) |
| Akar dominan: $T(n) = 2T\left(\frac{n}{2}\right) + n^2$ | 3 | Level teratas (akar) |

Contoh-contoh di tabel itu ada di panel "Ubah masukan" di bawah visualisasi, bersama isian untuk $a$, $b$, $c$, dan $k$. Ada beberapa hal yang bisa dicoba:

- Visualisasi mulai dengan contoh Merge Sort. Perhatikan bahwa total biaya tiap level sama ($n$). Itulah sebabnya hasilnya $\Theta (n \log n)$.
- Pilih contoh daun dominan di panel itu, lalu perhatikan bahwa total biaya naik pada tiap level ke bawah.
- Pilih contoh akar dominan, lalu perhatikan bahwa total biaya turun pada tiap level ke bawah.
- Isian dibatasi: $a$ dari 1 sampai 3, $b$ dari 2 sampai 4, $c$ dari 0 sampai 2, dan kedalaman $k$ dari 1 sampai 3. Jadi $f(n)$ di visualisasi hanya berbentuk $n^c$.

Kode di visualisasi adalah pola rekursi umum, bukan pseudocode tertentu. Pohon pada visualisasi adalah pohon untuk satu $n$ tertentu, sedangkan Metode Master menyatakan hasilnya untuk $n$ yang sangat besar.

::visualizer

## H. Rangkuman

| Hal | Isi |
| --- | --- |
| Bentuk | $T(n) = aT\left(\frac{n}{b}\right) + f(n)$, dengan $a \ge 1$ dan $b > 1$ |
| Fungsi pembanding | $g(n) = n^{\log_b a}$ |
| Kasus 1 | $f(n) = O(n^{\log_b a - \epsilon })$, hasil $\Theta (n^{\log_b a})$ |
| Kasus 2 | $f(n) = \Theta (n^{\log_b a})$, hasil $\Theta (n^{\log_b a} \cdot \log n)$ |
| Kasus 3 | $f(n) = \Omega (n^{\log_b a + \epsilon })$ dan $a\cdot f\left(\frac{n}{b}\right) \le c\cdot f(n)$ untuk $c < 1$, hasil $\Theta (f(n))$ |

- Cara cepat memilih kasus: bandingkan pangkat $n$ pada $f(n)$ dengan pangkat $n$ pada $g(n)$. Lebih kecil berarti kasus 1, sama berarti kasus 2, dan lebih besar berarti kasus 3 (setelah memeriksa syarat tambahan).
- Di pohon rekursi, kasus 1 berarti daun yang terbesar, kasus 2 berarti tiap level sama besar, dan kasus 3 berarti akar yang terbesar.
- Merge Sort, $T(n) = 2T\left(\frac{n}{2}\right) + \Theta (n)$, adalah kasus 2 dengan hasil $\Theta (n \log n)$.
- Soal challenge di akhir menghitung $T(n) = 2T\left(\frac{n}{2}\right) + n$ langsung dari rekurensnya, lalu hasilnya bisa dibandingkan dengan $\Theta (n \log n)$ dari kasus 2.

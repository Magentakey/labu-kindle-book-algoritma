## A. Pengantar: Batas yang Ketat dan yang Tidak Ketat

Batas atas asimtotik suatu fungsi *running time* yang diberikan oleh notasi Big-Oh ($O$) kemungkinan merupakan *asymptotically tight* dan kemungkinan juga tidak *asymptotically tight*.

Suatu fungsi $f(n)$ dikatakan *asymptotically tight* terhadap fungsi $g(n)$ jika batas atas $f(n)$ secara ketat mendekati $g(n)$ saat nilai $n$ sangat besar. Dua contoh pada batas yang sama, yaitu $O(n^2)$:

| Pernyataan | Ketat? | Alasan |
| --- | --- | --- |
| $2n^2 = O(n^2)$ | Ya | $f(n)$ dan $g(n)$ tumbuh sama cepat, hanya berbeda konstanta 2 |
| $2n = O(n^2)$ | Tidak | $f(n)$ tumbuh jauh lebih lambat daripada $g(n)$, batas $n^2$ terlalu longgar |

Untuk menyatakan batas atas yang **tidak** *asymptotically tight*, dipakai notasi Little-Oh ($o$). Analoginya, untuk batas bawah yang tidak *asymptotically tight* dipakai notasi Little-Omega ($\omega$).

| No | Notasi | Nama | Arti singkat |
| --- | --- | --- | --- |
| 1 | $o$ | Little-Oh | Batas atas yang tidak ketat: $f(n)$ tumbuh lebih lambat dari $g(n)$ |
| 2 | $\omega$ | Little-Omega | Batas bawah yang tidak ketat: $f(n)$ tumbuh lebih cepat dari $g(n)$ |

:::quiz Cek pemahaman: batas yang ketat
::question Manakah pernyataan yang batas atasnya TIDAK asymptotically tight?
- [ ] $2n^2 = O(n^2)$
- [x] $2n = O(n^2)$
- [ ] $5n^2 + 3n = O(n^2)$
::explain
Pada $2n = O(n^2)$, fungsi $n^2$ tumbuh jauh lebih cepat daripada $2n$, sehingga batasnya terlalu longgar. Dua pilihan lain memiliki bentuk $n^2$ yang sama dengan $g(n)$, jadi batasnya ketat.
::question Notasi mana yang dipakai untuk menyatakan batas atas yang tidak asymptotically tight?
- [x] Little-Oh ($o$)
- [ ] Little-Omega ($\omega$)
- [ ] Theta ($\Theta$)
::explain
Little-Oh ($o$) khusus untuk batas atas yang tidak ketat. Little-Omega ($\omega$) dipakai untuk batas bawah yang tidak ketat.
:::

## B. Notasi Little-Oh (o)

Apabila diberikan fungsi $g(n)$, fungsi *running time* $f(n)$ dikatakan masuk dalam himpunan $o(g(n))$ jika dan hanya jika:

$$
\begin{aligned}
o(g(n)) = \{\, f(n) \mid{}& \text{untuk sembarang konstanta positif } c \text{ terdapat } n_0 > 0 \text{ sedemikian sehingga} \\
& 0 \le f(n) < c \cdot g(n), \text{ untuk semua } n \ge n_0 \,\}
\end{aligned}
$$

Perbedaan terpenting dengan Big-Oh: pada Big-Oh cukup **ada satu** konstanta $c$, sedangkan pada Little-Oh pertaksamaan harus berlaku untuk **sembarang** $c > 0$, sekecil apa pun. Karena itu:

- $2n = o(n^2)$, tetapi $2n^2 \ne o(n^2)$.
- $f(n) = o(g(n))$ menunjukkan bahwa limit $\frac{f(n)}{g(n)}$ untuk $n$ menuju tak hingga sama dengan 0.
- Fungsi *running time* $f(n)$ tumbuh lebih lambat dibandingkan fungsi *running time* $g(n)$.

### Contoh o: 2n = o(n²)

Tunjukkan bahwa $2n = o(n^2)$. Geser slide satu per satu untuk mengikuti pembuktiannya.

:::steps Pembuktian 2n = o(n²)
::slide 1. Tentukan f(n) dan g(n)
$$
\begin{aligned}
f(n) &= 2n \\
g(n) &= n^2
\end{aligned}
$$

::slide 2. Ingat syarat limit
$f(n) = o(g(n))$ menunjukkan bahwa:

$$
\begin{aligned}
\lim_{n \to \infty} \frac{f(n)}{g(n)} &= 0
\end{aligned}
$$

::slide 3. Hitung limitnya
$$
\begin{aligned}
\lim_{n \to \infty} \frac{f(n)}{g(n)} &= \lim_{n \to \infty} \frac{2n}{n^2} \\
&= \lim_{n \to \infty} \frac{2}{n} \\
&= \frac{2}{\infty} \\
&= 0
\end{aligned}
$$

::slide 4. Simpulkan
Karena limit $\frac{f(n)}{g(n)} = 0$, maka dengan demikian **benar** bahwa $2n = o(n^2)$.
:::

### Hubungan Limit dengan Definisi: Mencari n₀

Limit sama dengan 0 berarti pertaksamaan $2n < c\cdot n^2$ berlaku untuk $n$ yang cukup besar, **berapa pun** $c$-nya. Bagi kedua ruas dengan $n$, maka syaratnya menjadi $2 < c\cdot n$, yaitu $n > \frac{2}{c}$. Semakin kecil $c$, semakin besar $n_0$ yang dibutuhkan, tetapi $n_0$ selalu ada:

| $c$ | Syarat $n > \frac{2}{c}$ | $n_0$ terkecil |
| --- | --- | --- |
| 4 | $n > 0{,}5$ | 1 |
| 2 | $n > 1$ | 2 |
| 1 | $n > 2$ | 3 |
| 0,5 | $n > 4$ | 5 |
| 0,1 | $n > 20$ | 21 |

Coba sendiri. Isian di bawah berisi $f(n) = 2n$, $g(n) = n^2$, dan $c = 0{,}5$, sama dengan baris pada tabel di atas ($n_0 = 5$). Ganti $c$ menjadi 0,1 dan lihat $n_0$ bergeser menjadi 21. Lalu ganti $f(n)$ menjadi `2n^2` dengan $c = 1$: limitnya menjadi 2 dan pertaksamaan $f(n) < c\cdot g(n)$ tidak pernah terpenuhi.

::limit 2n ; n^2 ; 1/2

:::reveal Lihat penjelasan: mengapa 2n² ≠ o(n²)
Pada $f(n) = 2n^2$ dan $g(n) = n^2$, limitnya bukan 0:

$$
\begin{aligned}
\lim_{n \to \infty} \frac{2n^2}{n^2} &= \lim_{n \to \infty} 2 = 2
\end{aligned}
$$

Dari sisi definisi, ambil $c = 1$. Syarat $2n^2 < 1\cdot n^2$ tidak pernah terpenuhi untuk $n$ berapa pun, sehingga tidak ada $n_0$. Cukup satu nilai $c$ yang gagal untuk membatalkan $o$, karena definisi menuntut **semua** $c > 0$.

Namun $2n^2 = O(n^2)$ tetap benar, karena pada Big-Oh cukup ada satu $c$ (misalnya $c = 2$ atau $c = 3$).
:::

:::quiz Cek pemahaman: notasi Little-Oh
::question Nilai limit $\frac{f(n)}{g(n)}$ untuk $n$ menuju tak hingga pada $f(n) = o(g(n))$ adalah...
- [x] 0
- [ ] Bilangan positif tertentu, misalnya 2
- [ ] Tak hingga
::explain
Little-Oh berarti $f(n)$ tumbuh lebih lambat daripada $g(n)$, sehingga rasio $\frac{f(n)}{g(n)}$ mengecil menuju 0.
::question Pada pembuktian $2n = o(n^2)$, mengapa $n_0$ untuk $c = 0{,}1$ jauh lebih besar daripada untuk $c = 4$?
- [ ] Karena $c$ yang kecil membuat $f(n)$ lebih besar
- [x] Karena syaratnya $n > \frac{2}{c}$, jadi $c$ yang kecil menuntut $n$ yang lebih besar
- [ ] Karena $n_0$ selalu sama untuk semua $c$
::explain
$2n < c\cdot n^2$ sama dengan $n > \frac{2}{c}$. Untuk $c = 4$ cukup $n \ge 1$, sedangkan untuk $c = 0{,}1$ harus $n \ge 21$.
::question Mengapa $2n^2 \ne o(n^2)$?
- [ ] Karena $2n^2$ tumbuh lebih lambat dari $n^2$
- [x] Karena limit $\frac{2n^2}{n^2}$ adalah 2, bukan 0, dan untuk $c = 1$ syarat $2n^2 < c\cdot n^2$ tidak pernah terpenuhi
- [ ] Karena notasi $o$ hanya berlaku untuk fungsi linier
::explain
Little-Oh menuntut limit 0. Di sini limitnya 2, sehingga $f(n)$ dan $g(n)$ tumbuh sama cepat dan batasnya ketat ($\Theta$), bukan $o$.
:::

## C. Notasi Little-Omega (ω)

Dengan analogi seperti Little-Oh, untuk menunjukkan batas bawah suatu fungsi *running time* yang tidak *asymptotically tight* digunakan notasi Little-Omega ($\omega$). Fungsi *running time* $f(n)$ dikatakan masuk dalam himpunan $\omega (g(n))$ jika dan hanya jika:

$$
\begin{aligned}
\omega(g(n)) = \{\, f(n) \mid{}& \text{untuk sembarang konstanta positif } c \text{ terdapat } n_0 > 0 \text{ sedemikian sehingga} \\
& 0 \le c \cdot g(n) < f(n), \text{ untuk semua } n \ge n_0 \,\}
\end{aligned}
$$

Contoh: $\frac{n^2}{2} = \omega (n)$, tetapi $\frac{n^2}{2} \ne \omega (n^2)$. Penjelasannya:

- $f(n) = \omega (g(n))$ menunjukkan bahwa limit $\frac{f(n)}{g(n)}$ untuk $n$ menuju tak hingga sama dengan tak hingga.
- Fungsi *running time* $f(n)$ tumbuh lebih cepat dibandingkan fungsi *running time* $g(n)$.

### Contoh ω: n²/2 = ω(n)

Tunjukkan bahwa $\frac{n^2}{2} = \omega (n)$.

:::steps Pembuktian n²/2 = ω(n)
::slide 1. Tentukan f(n) dan g(n)
$$
\begin{aligned}
f(n) &= \frac{n^2}{2} \\
g(n) &= n
\end{aligned}
$$

::slide 2. Ingat syarat limit
$f(n) = \omega (g(n))$ menunjukkan bahwa:

$$
\begin{aligned}
\lim_{n \to \infty} \frac{f(n)}{g(n)} &= \infty
\end{aligned}
$$

::slide 3. Hitung limitnya
$$
\begin{aligned}
\lim_{n \to \infty} \frac{f(n)}{g(n)} &= \lim_{n \to \infty} \frac{\frac{n^2}{2}}{n} \\
&= \lim_{n \to \infty} \frac{n}{2} \\
&= \infty
\end{aligned}
$$

::slide 4. Simpulkan
Karena limit $\frac{f(n)}{g(n)} = \infty$, maka dengan demikian **benar** bahwa $\frac{n^2}{2} = \omega (n)$.
:::

### Hubungan Limit dengan Definisi: Mencari n₀

Pertaksamaan $c\cdot n < \frac{n^2}{2}$ menjadi $n > 2c$ setelah kedua ruas dibagi $\frac{n}{2}$. Semakin besar $c$, semakin besar $n_0$ yang dibutuhkan, tetapi $n_0$ selalu ada:

| $c$ | Syarat $n > 2c$ | $n_0$ terkecil |
| --- | --- | --- |
| 0,5 | $n > 1$ | 2 |
| 1 | $n > 2$ | 3 |
| 10 | $n > 20$ | 21 |
| 100 | $n > 200$ | 201 |

Isian di bawah berisi $f(n) = \frac{n^2}{2}$, $g(n) = n$, dan $c = 10$, sama dengan baris pada tabel di atas ($n_0 = 21$). Ganti $c$ menjadi 100 dan lihat $n_0$ bergeser menjadi 201. Lalu ganti $g(n)$ menjadi `n^2` dengan $c = 1$: limitnya menjadi $\frac{1}{2}$ dan pertaksamaan $c\cdot g(n) < f(n)$ tidak pernah terpenuhi.

::limit n^2/2 ; n ; 10

:::reveal Lihat penjelasan: mengapa n²/2 ≠ ω(n²)
Pada $f(n) = \frac{n^2}{2}$ dan $g(n) = n^2$, limitnya bukan tak hingga:

$$
\begin{aligned}
\lim_{n \to \infty} \frac{\frac{n^2}{2}}{n^2} &= \lim_{n \to \infty} \frac{1}{2} = \frac{1}{2}
\end{aligned}
$$

Dari sisi definisi, ambil $c = 1$. Syarat $c\cdot n^2 < \frac{n^2}{2}$, yaitu $n^2 < \frac{n^2}{2}$, tidak pernah terpenuhi, sehingga tidak ada $n_0$. Satu nilai $c$ yang gagal sudah cukup untuk membatalkan $\omega$.

Namun $\frac{n^2}{2} = \Omega (n^2)$ tetap benar, bahkan $\frac{n^2}{2} = \Theta (n^2)$, karena rasionya mendatar di $\frac{1}{2}$.
:::

:::quiz Cek pemahaman: notasi Little-Omega
::question Nilai limit $\frac{f(n)}{g(n)}$ untuk $n$ menuju tak hingga pada $f(n) = \omega (g(n))$ adalah...
- [ ] 0
- [ ] Bilangan positif tertentu
- [x] Tak hingga
::explain
Little-Omega berarti $f(n)$ tumbuh lebih cepat daripada $g(n)$, sehingga rasio $\frac{f(n)}{g(n)}$ membesar tanpa batas.
::question Pada pembuktian $\frac{n^2}{2} = \omega (n)$, syarat pertaksamaan $c\cdot n < \frac{n^2}{2}$ setara dengan...
- [ ] $n < 2c$
- [x] $n > 2c$
- [ ] $n > \frac{c}{2}$
::explain
Bagi kedua ruas dengan $\frac{n}{2}$ (positif), didapat $2c < n$.
::question Manakah yang benar?
- [ ] $\frac{n^2}{2} = \omega (n^2)$
- [x] $\frac{n^2}{2} = \omega (n)$ dan $\frac{n^2}{2} = \Theta (n^2)$
- [ ] $\frac{n^2}{2} = o(n)$
::explain
$\frac{n^2}{2}$ tumbuh lebih cepat daripada $n$ ($\omega$), tetapi sama cepat dengan $n^2$ ($\Theta$), sehingga bukan $\omega (n^2)$. Ia juga bukan $o(n)$, karena $o$ berarti lebih lambat.
:::

### Klasifikasikan Sendiri

Pemeriksa yang sama bisa dipakai untuk fungsi mana pun. Hasil limitnya langsung menentukan golongannya: 0 berarti $o$, tak hingga berarti $\omega$, dan bilangan positif tertentu berarti $\Theta$. Isian di bawah berisi $3n^2 + 5$ melawan $7n^2$, yaitu contoh kedua pada soal challenge di akhir materi. Derajat kedua polinom sama, jadi hasilnya $\Theta$. Perhatikan bahwa pada $c = 4$ pertaksamaan $f(n) < c\cdot g(n)$ terpenuhi sejak $n_0 = 1$, dan pada $c = \frac{1}{2}$ sejak $n_0 = 4$. Namun pada $c = \frac{1}{10}$ pertaksamaan itu gagal. Satu $c$ yang gagal sudah cukup untuk membuktikan bahwa $3n^2 + 5$ bukan $o(7n^2)$.

::limit 3n^2 + 5 ; 7n^2 ; 4

## D. Mencoba Grafik Rasio

Grafik di bawah menggambar rasio $\frac{f(n)}{g(n)}$ untuk pasangan fungsi pilihan Anda, dan menandai $n_0$ untuk nilai $c$ yang dipilih. Ada beberapa hal yang bisa dicoba:

- Pilih contoh bawaan $n = o(n^2)$. Rasionya terus mengecil menuju 0, dan untuk $c$ yang makin kecil $n_0$ bergeser ke kanan.
- Pilih $n^2 = \omega (n)$. Rasionya terus membesar, dan untuk $c$ yang makin besar $n_0$ bergeser ke kanan.
- Pilih $n^2$ dan $n^2$. Rasionya mendatar, jadi hubungannya $\Theta$, bukan $o$ dan bukan $\omega$.
- Pilih $n$ melawan $n \log n$ dengan $c$ kecil. Rasionya memang menuju 0, tetapi butuh $n$ yang sangat besar.

::visualizer

## E. Rangkuman

| Notasi | Syarat untuk semua $n \ge n_0$ | Nilai limit $\frac{f(n)}{g(n)}$ | Artinya | Contoh di materi |
| --- | --- | --- | --- | --- |
| $o(g(n))$ | $0 \le f(n) < c\cdot g(n)$, untuk sembarang $c > 0$ | 0 | $f$ tumbuh lebih lambat dari $g$ | $2n = o(n^2)$ |
| $\omega (g(n))$ | $0 \le c\cdot g(n) < f(n)$, untuk sembarang $c > 0$ | $\infty$ | $f$ tumbuh lebih cepat dari $g$ | $\frac{n^2}{2} = \omega (n)$ |

- Little-Oh dan Little-Omega adalah batas yang **tidak ketat**. Perbedaan dengan Big-Oh dan Omega: syaratnya berlaku untuk **sembarang** konstanta $c > 0$, bukan hanya satu $c$.
- Cara cepat membuktikannya adalah menghitung limit $\frac{f(n)}{g(n)}$: hasil 0 berarti $o$, hasil tak hingga berarti $\omega$, dan hasil bilangan positif tertentu berarti $\Theta$ (bukan $o$ dan bukan $\omega$).
- $o$ termasuk $O$, dan $\omega$ termasuk $\Omega$. Jika $f(n) = o(g(n))$, maka $f(n) = O(g(n))$ juga benar, tetapi tidak sebaliknya.

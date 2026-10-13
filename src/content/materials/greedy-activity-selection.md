## A. Algoritma Greedy

Daftar pustaka: Cormen, *Introduction to Algorithms*, halaman 414 sampai 421. Algoritma untuk menyelesaikan **permasalahan optimasi** biasanya melalui serangkaian langkah, dengan serangkaian pilihan di setiap langkah. Untuk banyak permasalahan optimasi, memakai *Dynamic Programming* untuk menentukan pilihan terbaik dianggap berlebihan. Masalah yang sama bisa diselesaikan dengan algoritma yang lebih sederhana dan lebih efisien, yaitu **algoritma Greedy**.

Pada setiap langkah, algoritma Greedy selalu membuat pilihan yang **terlihat paling baik saat itu**. Artinya pilihan itu optimal secara **lokal**, dengan harapan mengarah ke solusi yang optimal secara **global**.

Algoritma Greedy **tidak selalu menghasilkan solusi optimal**. Meski begitu, algoritma ini cukup kuat dan bekerja baik untuk berbagai masalah. Beberapa contohnya:

| Masalah yang bisa diselesaikan Greedy | Dibahas di |
| --- | --- |
| *An activity-selection problem* | Materi 10.1 (materi ini) |
| Kompresi data dengan pengkodean Huffman | Materi 10.2 |
| *Minimum spanning tree* | Materi 12 |
| *Shortest path single source* dengan algoritma Dijkstra | Materi 13 |

:::quiz Cek pemahaman: algoritma Greedy
::question Apa yang dilakukan algoritma Greedy pada setiap langkah?
- [ ] Mencoba semua pilihan lalu mengambil yang terbaik
- [x] Memilih yang terlihat paling baik saat itu
- [ ] Menyimpan hasil submasalah dalam tabel
::explain
Greedy membuat pilihan yang optimal secara lokal pada setiap langkah. Mencoba semua pilihan adalah *brute force*, dan menyimpan hasil submasalah dalam tabel adalah *Dynamic Programming*.
::question Apakah pilihan yang optimal secara lokal selalu menghasilkan solusi yang optimal secara global?
- [ ] Ya, selalu
- [x] Tidak selalu
- [ ] Tidak pernah
::explain
Greedy hanya berharap pilihan lokal mengarah ke solusi global yang optimal. Untuk sebagian masalah itu benar, untuk sebagian lain tidak. Di bagian F ada contoh urutan data yang membuat hasilnya tidak optimal.
:::

## B. An Activity-Selection Problem

Permasalahan di sini adalah menjadwalkan beberapa aktivitas yang membutuhkan **sumber daya yang sama**, sehingga didapat jumlah kegiatan yang **maksimal** dan **kompatibel** (tidak tumpang tindih). Ini termasuk permasalahan optimasi. Selain dengan *Dynamic Programming*, masalah ini juga bisa diselesaikan dengan algoritma Greedy, dan itulah yang dibahas di sini.

### Definisi

Misalkan himpunan $S = \{a_1, a_2, a_3, \ldots, a_n\}$ terdiri dari $n$ aktivitas yang memakai sumber daya yang sama, yaitu ruang kuliah yang hanya melayani **satu aktivitas pada satu waktu**. Setiap aktivitas $a_i$ punya:

- waktu mulai (*start time*) $s_i$ dan waktu selesai (*finish time*) $f_i$, dengan $0 \leq s_i < f_i < \infty$.
- selang waktu **setengah terbuka** $[s_i, f_i)$, yaitu waktu $s_i$ ikut dipakai dan waktu $f_i$ tidak.

Aktivitas $a_i$ dan $a_j$ **kompatibel** jika selang $[s_i, f_i)$ dan $[s_j, f_j)$ tidak tumpang tindih, yaitu jika

$$
s_j \geq f_i \quad \text{atau} \quad s_i \geq f_j
$$

Pada masalah ini dipilih **subset terbesar** dari aktivitas yang saling kompatibel. Diasumsikan aktivitas sudah **terurut naik menurut finish time**:

$$
f_1 \leq f_2 \leq f_3 \leq \cdots \leq f_{n-1} \leq f_n
$$

### Contoh Himpunan Aktivitas

Pandang himpunan $S$ berikut. Contoh ini dipakai di seluruh materi, dan sama dengan contoh bawaan visualisasi di bagian G.

| $i$ | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| $s_i$ | 1 | 3 | 0 | 5 | 3 | 5 | 6 | 8 | 8 | 2 | 12 |
| $f_i$ | 4 | 5 | 6 | 7 | 9 | 9 | 10 | 11 | 12 | 14 | 16 |

Beberapa pasangan untuk melatih pemeriksaan kompatibel:

| Pasangan | Selang | Pemeriksaan | Hasil |
| --- | --- | --- | --- |
| $a_1$ dan $a_4$ | $[1, 4)$ dan $[5, 7)$ | $s_4 = 5 \geq f_1 = 4$ | Kompatibel |
| $a_1$ dan $a_2$ | $[1, 4)$ dan $[3, 5)$ | $s_2 = 3 < f_1 = 4$ dan $s_1 = 1 < f_2 = 5$ | Tumpang tindih |
| $a_3$ dan $a_7$ | $[0, 6)$ dan $[6, 10)$ | $s_7 = 6 \geq f_3 = 6$ | Kompatibel (hanya bersentuhan) |

:::quiz Cek pemahaman: aktivitas kompatibel
::question Aktivitas $a_3$ berjalan pada $[0, 6)$ dan $a_7$ pada $[6, 10)$. Apakah keduanya kompatibel?
- [x] Ya, karena $s_7 \geq f_3$
- [ ] Tidak, karena keduanya bersentuhan di waktu 6
- [ ] Tidak, karena $a_7$ selesai lebih lama
::explain
Selangnya setengah terbuka, jadi waktu 6 tidak dipakai $a_3$. Syaratnya $s_7 = 6 \geq f_3 = 6$ terpenuhi, sehingga keduanya kompatibel.
::question Aktivitas $a_1$ berjalan pada $[1, 4)$ dan $a_2$ pada $[3, 5)$. Apakah keduanya kompatibel?
- [ ] Ya, karena $s_2 \geq f_1$
- [x] Tidak, karena kedua selang tumpang tindih
- [ ] Ya, karena $f_2 > f_1$
::explain
$s_2 = 3$ lebih kecil dari $f_1 = 4$, dan $s_1 = 1$ lebih kecil dari $f_2 = 5$. Tidak ada satu pun syarat kompatibel yang terpenuhi, jadi selangnya tumpang tindih di waktu 3 sampai 4.
::question Apa yang harus diasumsikan tentang aktivitas pada prosedur GREEDY-ACTIVITY-SELECTOR?
- [ ] Sudah terurut naik menurut start time
- [x] Sudah terurut naik menurut finish time
- [ ] Sudah terurut naik menurut durasi
::explain
Prosedurnya mengasumsikan $f_1 \leq f_2 \leq \cdots \leq f_n$. Bagian F menunjukkan apa yang terjadi bila data diurutkan dengan cara lain.
:::

## C. Memilih Secara Manual

Setelah aktivitas pertama ditentukan, aktivitas berikutnya harus memenuhi syarat: **waktu mulainya tidak lebih awal dari waktu selesai aktivitas sebelumnya**. Berikut tiga contoh pemilihan dari himpunan $S$ di atas. Angka yang dicetak tebal pada tabel adalah aktivitas yang dipilih.

:::steps Tiga contoh pemilihan
::slide Aktivitas pertama a3 (start time paling kecil, yaitu 0)
Aktivitas $a_3$ berjalan pada $[0, 6)$. Berikutnya dipilih $a_7$ pada $[6, 10)$, lalu $a_{11}$ pada $[12, 16)$. Subset yang bisa dipilih adalah $\{a_3, a_7, a_{11}\}$, berukuran 3.

| $i$ | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| $s_i$ | 1 | 3 | **0** | 5 | 3 | 5 | **6** | 8 | 8 | 2 | **12** |
| $f_i$ | 4 | 5 | **6** | 7 | 9 | 9 | **10** | 11 | 12 | 14 | **16** |

::slide Aktivitas pertama a1
Aktivitas $a_1$ berjalan pada $[1, 4)$. Salah satu subset yang bisa dipilih adalah $\{a_1, a_4, a_8, a_{11}\}$, berukuran 4.

| $i$ | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| $s_i$ | **1** | 3 | 0 | **5** | 3 | 5 | 6 | **8** | 8 | 2 | **12** |
| $f_i$ | **4** | 5 | 6 | **7** | 9 | 9 | 10 | **11** | 12 | 14 | **16** |

::slide Aktivitas pertama a2
Aktivitas $a_2$ berjalan pada $[3, 5)$. Salah satu subset yang bisa dipilih adalah $\{a_2, a_4, a_8, a_{11}\}$, berukuran 4.

| $i$ | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| $s_i$ | 1 | **3** | 0 | **5** | 3 | 5 | 6 | **8** | 8 | 2 | **12** |
| $f_i$ | 4 | **5** | 6 | **7** | 9 | 9 | 10 | **11** | 12 | 14 | **16** |
:::

Dari contoh di atas, ukuran subset bisa 3 atau 4. Jika semua kemungkinan himpunan bagian dari 11 aktivitas dicoba, ukuran terbesar yang saling kompatibel adalah **4**. Jadi pada contoh ini subset terpanjang berukuran 4, dan pilihan aktivitas pertama menentukan apakah kita sampai ke ukuran itu.

:::quiz Cek pemahaman: memilih secara manual
::question Jika aktivitas pertama yang dipilih adalah $a_3$ dan kemudian $a_7$ dan $a_{11}$, berapa ukuran subsetnya?
- [ ] 2
- [x] 3
- [ ] 4
::explain
Subsetnya $\{a_3, a_7, a_{11}\}$ berukuran 3, lebih kecil dari ukuran maksimum 4.
::question Berapa ukuran maksimum subset aktivitas saling kompatibel pada himpunan contoh?
- [ ] 3
- [x] 4
- [ ] 5
::explain
Contohnya $\{a_1, a_4, a_8, a_{11}\}$. Tidak ada subset kompatibel yang berukuran 5.
:::

## D. Solusi Greedy

Memilih subset terbesar yang saling kompatibel bisa diselesaikan dengan prosedur **GREEDY-ACTIVITY-SELECTOR**. Aktivitas pada masukan diasumsikan **sudah terurut menurut finish time**. Jika belum terurut, diperlukan waktu $O(n \lg n)$ untuk mengurutkannya lebih dulu. Masukannya berupa array $s$ dan $f$ yang berisi start time dan finish time tiap aktivitas $a_i$.

### Pseudocode

Berikut pseudocode GREEDY-ACTIVITY-SELECTOR(s, f) dengan 8 baris. Setiap aktivitas yang dipilih dimasukkan ke himpunan $A$, dan himpunan $A$ inilah hasil akhirnya.

```pseudocode
n = s.length
A = {a_1}
k = 1
for m = 2 to n
    if s[m] >= f[k]
        A = A ∪ {a_m}
        k = m
return A
```

Penjelasan tiap langkah, dengan nomor yang sama seperti nomor baris di pinggir blok kode:

:::steps Arti tiap langkah GREEDY-ACTIVITY-SELECTOR
::slide Langkah 1: banyak aktivitas
$n$ diisi dengan panjang array $s$, yaitu banyak aktivitas.

::slide Langkah 2: aktivitas pertama
Himpunan $A$ diawali dengan $\{a_1\}$. Prosedur ini **selalu memilih $a_1$ lebih dulu**. Karena data terurut menurut finish time, $a_1$ adalah aktivitas yang selesai paling awal.

::slide Langkah 3: penanda aktivitas terakhir
$k = 1$. Variabel $k$ menunjuk aktivitas terakhir yang dipilih, sehingga $f_k$ adalah finish time terbesar di antara semua aktivitas dalam $A$.

::slide Langkah 4: perulangan
Variabel $m$ berjalan dari 2 sampai $n$ untuk memilih aktivitas baru yang kompatibel dengan aktivitas yang sudah ada di $A$. Langkah 4 sampai 7 adalah badan perulangan ini.

::slide Langkah 5: cek kompatibel
Jika $s[m] \geq f[k]$, aktivitas $a_m$ mulai pada atau setelah aktivitas terakhir selesai, sehingga lanjut ke langkah 6 dan 7. Jika tidak, $a_m$ dilewati dan perulangan kembali ke langkah 4 dengan $m$ berikutnya.

::slide Langkah 6 dan 7: memilih a_m
Langkah 6 menambahkan $a_m$ ke himpunan $A$. Langkah 7 mengisi $k = m$, artinya aktivitas terakhir yang dipilih sekarang adalah $a_m$ dan finish time terbesar menjadi $f_k = f_m$.

::slide Langkah 8: hasil
Setelah perulangan selesai, himpunan $A$ dikembalikan. $A$ berisi aktivitas-aktivitas yang dipilih, dengan jumlah aktivitas maksimum.
:::

:::quiz Cek pemahaman: prosedur GREEDY-ACTIVITY-SELECTOR
::question Apa fungsi variabel $k$?
- [ ] Menghitung banyak aktivitas yang dipilih
- [x] Menunjuk aktivitas terakhir yang dipilih
- [ ] Menunjuk aktivitas yang sedang diperiksa
::explain
$k$ menunjuk aktivitas terakhir di $A$, sehingga $f[k]$ adalah finish time terbesar. Aktivitas yang sedang diperiksa ditunjuk oleh $m$.
::question Jika $s[m] \geq f[k]$ bernilai False, apa yang terjadi?
- [ ] $a_m$ dimasukkan ke $A$ dan $k = m$
- [x] $a_m$ dilewati dan perulangan lanjut ke $m$ berikutnya
- [ ] Prosedur berhenti dan mengembalikan $A$
::explain
Pada False, langkah 6 dan 7 dilewati. $A$ dan $k$ tidak berubah, lalu perulangan kembali ke langkah 4.
::question Pada langkah mana prosedur mengembalikan hasil?
- [ ] Langkah 2
- [ ] Langkah 7
- [x] Langkah 8
::explain
Langkah 8 dijalankan setelah perulangan selesai: return $A$.
:::

## E. Contoh Penelusuran

Aktivitas pada contoh sudah terurut menurut finish time, yaitu $f = \{4, 5, 6, 7, 9, 9, 10, 11, 12, 14, 16\}$. Penelusurannya:

1. $n = 11$.
2. $A = \{a_1\}$.
3. $k = 1$.

Lalu perulangan langkah 4 sampai 7. Kolom "Hasil" adalah nilai $s[m] \geq f[k]$ pada langkah 5:

| Loop | $m$ | Cek $s[m] \geq f[k]$ | Hasil | Isi $A$ dan $k$ sesudahnya |
| --- | --- | --- | --- | --- |
| 1 | 2 | $s[2] = 3$, $f[1] = 4$ | False | tidak berubah ($k = 1$) |
| 2 | 3 | $s[3] = 0$, $f[1] = 4$ | False | tidak berubah ($k = 1$) |
| 3 | 4 | $s[4] = 5$, $f[1] = 4$ | True | $A = \{a_{1}, a_{4}\}$, $k = 4$ |
| 4 | 5 | $s[5] = 3$, $f[4] = 7$ | False | tidak berubah ($k = 4$) |
| 5 | 6 | $s[6] = 5$, $f[4] = 7$ | False | tidak berubah ($k = 4$) |
| 6 | 7 | $s[7] = 6$, $f[4] = 7$ | False | tidak berubah ($k = 4$) |
| 7 | 8 | $s[8] = 8$, $f[4] = 7$ | True | $A = \{a_{1}, a_{4}, a_{8}\}$, $k = 8$ |
| 8 | 9 | $s[9] = 8$, $f[8] = 11$ | False | tidak berubah ($k = 8$) |
| 9 | 10 | $s[10] = 2$, $f[8] = 11$ | False | tidak berubah ($k = 8$) |
| 10 | 11 | $s[11] = 12$, $f[8] = 11$ | True | $A = \{a_{1}, a_{4}, a_{8}, a_{11}\}$, $k = 11$ |
| selesai | 12 | $m = 12$ lebih besar dari $n = 11$ | perulangan berhenti | lanjut ke langkah 8 |

Setelah perulangan selesai, langkah 8 mengembalikan $A = \{a_1, a_4, a_8, a_{11}\}$, yaitu 4 aktivitas. Hasil ini sama dengan ukuran maksimum yang ditemukan secara manual di bagian C.

### Waktu Eksekusi

Perulangan di langkah 4 berjalan $n - 1$ kali, dan tiap putaran hanya membandingkan dua angka, mengisi $A$, dan mengisi $k$. Jadi prosedur ini memerlukan waktu $\Theta(n)$, dengan asumsi aktivitas sudah terurut naik menurut finish time. Jika data belum terurut, pengurutan yang memerlukan $O(n \lg n)$ menjadi bagian yang paling lama.

:::quiz Cek pemahaman: penelusuran
::question Pada penelusuran contoh, pada $m = 4$ dilakukan pengecekan $s[4] = 5 \geq f[1] = 4$. Apa hasilnya?
- [x] True, jadi $A = \{a_1, a_4\}$ dan $k = 4$
- [ ] False, jadi $A$ tidak berubah
- [ ] True, tetapi $k$ tetap 1
::explain
$5 \geq 4$ benar, sehingga langkah 6 dan 7 dijalankan: $A = \{a_1, a_4\}$ dan $k = 4$.
::question Pada $m = 7$ ($k = 4$), mengapa $a_7$ tidak dipilih?
- [ ] Karena $s[7] = 6$ lebih besar dari $f[4] = 7$
- [x] Karena $s[7] = 6$ lebih kecil dari $f[4] = 7$
- [ ] Karena $a_7$ sudah ada di $A$
::explain
$a_7$ mulai pada waktu 6, padahal $a_4$ baru selesai pada waktu 7, jadi keduanya tumpang tindih.
::question Berapa waktu prosedur GREEDY-ACTIVITY-SELECTOR jika aktivitas sudah terurut menurut finish time?
- [ ] $\Theta(\lg n)$
- [x] $\Theta(n)$
- [ ] $\Theta(n^2)$
::explain
Perulangan berjalan $n - 1$ kali dengan pekerjaan tetap tiap putaran, sehingga waktunya $\Theta(n)$.
:::

## F. Latihan: Urutan Selain Finish Time

Prosedur GREEDY-ACTIVITY-SELECTOR mengasumsikan data terurut menurut finish time. Bagaimana jika data diurutkan dengan cara lain? Susunlah tabel dengan aktivitas terurut naik menurut:

- a. start time ($s_i$)
- b. durasi ($d_i$), dengan $d_i = f_i - s_i$. Contohnya jika $s_1 = 1$ dan $f_1 = 4$, maka $d_1 = 3$.

Apakah hasil himpunan $A$? Apakah memberikan jumlah aktivitas maksimum, yaitu 4? Coba kerjakan dulu, lalu buka jawabannya.

:::reveal Lihat jawaban a: urut menurut start time
Aktivitas terurut naik menurut start time, $s_1 \leq s_2 \leq \cdots \leq s_{11}$. Nomor $i$ pada tabel adalah nomor baru setelah pengurutan.

| $i$ | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| $s_i$ | 0 | 1 | 2 | 3 | 3 | 5 | 5 | 6 | 8 | 8 | 12 |
| $f_i$ | 6 | 4 | 14 | 5 | 9 | 7 | 9 | 10 | 11 | 12 | 16 |

Dengan prosedur yang sama didapat $A = \{a_1, a_8, a_{11}\}$. Prosedur memilih $a_1$ pada $[0, 6)$ lebih dulu, lalu harus menunggu sampai $a_8$ pada $[6, 10)$, dan setelah itu $a_{11}$. Hanya **3 aktivitas**, jadi solusinya **tidak optimal** (maksimumnya 4).
:::

:::reveal Lihat jawaban b: urut menurut durasi
Aktivitas terurut naik menurut durasi, $d_1 \leq d_2 \leq \cdots \leq d_{11}$.

| $i$ | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| $s_i$ | 3 | 5 | 1 | 8 | 5 | 6 | 8 | 12 | 0 | 3 | 2 |
| $f_i$ | 5 | 7 | 4 | 11 | 9 | 10 | 12 | 16 | 6 | 9 | 14 |
| $d_i$ | 2 | 2 | 3 | 3 | 4 | 4 | 4 | 4 | 6 | 6 | 12 |

Didapat $A = \{a_1, a_2, a_4, a_8\}$, yaitu **4 aktivitas**, jadi hasilnya optimal.
:::

Hasil optimal pada b **kebetulan**: urutan durasi tidak menjamin optimal. Contoh tiga aktivitas berikut sudah terurut menurut durasi:

| $i$ | 1 | 2 | 3 |
| --- | --- | --- | --- |
| $s_i$ | 4 | 0 | 5 |
| $f_i$ | 6 | 5 | 10 |
| $d_i$ | 2 | 5 | 5 |

Prosedur memilih $a_1$ pada $[4, 6)$, lalu $a_2$ pada $[0, 5)$ dan $a_3$ pada $[5, 10)$ sama-sama dilewati karena mulai sebelum 6. Hasilnya hanya 1 aktivitas. Padahal $a_2$ dan $a_3$ saling kompatibel (hanya bersentuhan di waktu 5), sehingga maksimumnya 2.

Pada start time, hasilnya jelas tidak optimal. Pada durasi, hasilnya tidak selalu optimal. Karena itu urutan menurut **finish time** yang dipakai: aktivitas yang selesai paling awal menyisakan waktu paling banyak untuk aktivitas berikutnya.

### Peraga: Penelusuran GREEDY-ACTIVITY-SELECTOR

Peraga di bawah menjalankan pseudocode GREEDY-ACTIVITY-SELECTOR baris demi baris dengan array $s$ dan $f$ yang bisa Anda isi sendiri. Berbeda dengan visualisasi di bagian G, peraga ini **tidak mengurutkan data lebih dulu**. Data dibaca persis menurut urutan masukan, sehingga latihan di atas bisa diulang dan hasilnya bisa dibandingkan.

- Isian awalnya himpunan $S$ di materi ini (31 langkah, hasil $\{a_1, a_4, a_8, a_{11}\}$). Penelusurannya sama dengan tabel di bagian E.
- Empat tombol contoh siap pakai: contoh materi, latihan a (urut start time, hasil 3 aktivitas), latihan b (urut durasi, hasil 4 aktivitas), dan contoh tandingan tiga aktivitas (hasil hanya 1).
- Pada langkah terakhir, peraga menyebut apakah jumlah aktivitas yang terpilih sama dengan maksimum untuk data itu. Pada latihan a dan contoh tandingan, jawabannya tidak.
- Peraga menerima 1 sampai 12 aktivitas dan waktu 0 sampai 30. Kedua array harus sama panjang, dan tiap $f_i$ harus lebih besar dari $s_i$. Nomor aktivitas ditulis $a_1$ sampai $a_n$ menurut urutan masukan, dan indeks array dimulai dari 1, sama dengan pseudocode.
- Sel yang dipilih ditandai **A**, sel yang dilewati ditandai **×**, dan dua sel yang dibandingkan di baris 5 ($s[m]$ dan $f[k]$) ditandai **?**.

::trace greedy-activity-selector

:::quiz Cek pemahaman: urutan data
::question Jika data diurutkan menurut start time pada himpunan contoh, berapa aktivitas yang dipilih prosedur?
- [ ] 4, dan hasilnya optimal
- [x] 3, dan hasilnya tidak optimal
- [ ] 2, dan hasilnya tidak optimal
::explain
Hasilnya $A = \{a_1, a_8, a_{11}\}$, hanya 3 aktivitas, sedangkan maksimumnya 4.
::question Pada data contoh yang diurutkan menurut durasi, hasilnya 4 aktivitas. Apa kesimpulan yang benar?
- [ ] Urutan menurut durasi selalu menghasilkan solusi optimal
- [x] Pada data ini hasilnya optimal, tetapi tidak dijamin untuk data lain
- [ ] Urutan menurut durasi selalu menghasilkan solusi tidak optimal
::explain
Pada contoh tiga aktivitas di atas, urutan menurut durasi hanya memilih 1 aktivitas padahal maksimumnya 2.
:::

## G. Mencoba Visualisasi

Visualisasi di bawah ini menggambar tiap aktivitas sebagai batang pada sumbu waktu, satu baris per aktivitas. Isian awalnya adalah himpunan $S$ di materi ini, jadi hasil akhirnya harus sama: $a_1$, $a_4$, $a_8$, $a_{11}$ (4 aktivitas).

Beberapa hal agar tidak bingung membandingkan dengan pseudocode:

- Isiannya dua baris, `start` dan `finish`, sama dengan array $s$ dan $f$. Contoh siap pakai ada di panel "Ubah masukan". Jumlah aktivitas 1 sampai 12, waktu 0 sampai 30, dan finish harus lebih besar dari start.
- Visualisasi **selalu mengurutkan lebih dulu menurut finish time**, jadi data yang belum terurut pun diterima dan batangnya berpindah baris. Karena itu visualisasi ini tidak bisa dipakai untuk mengulang latihan di bagian F. Untuk latihan itu, pakai peraga penelusuran di bagian F, yang membaca data menurut urutan masukan.
- Visualisasi menamai aktivitas $a_1$ sampai $a_n$ menurut urutan masukan, sedangkan di kodenya $a_1$ adalah indeks 0. Sebelum pengurutan, $a_i$ pada visualisasi adalah $a_i$ pada tabel isian Anda.
- Kodenya tidak memakai $k$. Waktu selesai aktivitas terakhir yang dipilih disimpan di variabel `akhir` (awalnya tak hingga negatif, sehingga aktivitas pertama pasti terpilih), dan yang terpilih ditaruh di array `pilih`. Garis putus-putus bertanda "akhir" menunjukkan nilai itu: batang yang mulainya di kiri garis bentrok.

::visualizer

## H. Rangkuman

| Hal | Isi |
| --- | --- |
| Algoritma Greedy | Memilih yang terlihat paling baik saat itu (optimal lokal), berharap mengarah ke optimal global. Tidak selalu optimal |
| *Activity-selection problem* | Memilih subset terbesar dari aktivitas yang saling kompatibel pada satu sumber daya |
| Selang aktivitas | Setengah terbuka $[s_i, f_i)$ dengan $0 \leq s_i < f_i < \infty$ |
| Kompatibel | $s_j \geq f_i$ atau $s_i \geq f_j$ |
| Asumsi | Aktivitas terurut naik menurut finish time, $f_1 \leq f_2 \leq \cdots \leq f_n$ |
| GREEDY-ACTIVITY-SELECTOR | Pilih $a_1$, lalu tiap $a_m$ dengan $s[m] \geq f[k]$ dipilih dan $k = m$ |
| Waktu | $\Theta(n)$ jika sudah terurut, ditambah $O(n \lg n)$ bila perlu diurutkan |
| Hasil contoh | $A = \{a_1, a_4, a_8, a_{11}\}$, 4 aktivitas (optimal) |
| Urutan start time | 3 aktivitas, tidak optimal |
| Urutan durasi | Hasil 4 pada contoh, tetapi tidak dijamin optimal |

Cara cepat mengingat: **urutkan menurut waktu selesai, lalu ambil aktivitas pertama yang tidak bentrok**. Sekarang coba kerjakan soal challenge di bawah.

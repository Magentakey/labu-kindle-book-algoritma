## A. Algoritma Dijkstra

Daftar pustaka: Cormen, *Introduction to Algorithms*, halaman 658 sampai 664. Algoritma ***Dijkstra*** mempunyai tujuan yang sama dengan Bellman-Ford (materi 13.1), yaitu mencari lintasan dari satu simpul sumber $s$ ke simpul-simpul lain dengan **total bobot minimum**. Perbedaannya: pada Dijkstra **tidak diperbolehkan ada bobot sisi (*edge*) yang negatif**.

Bagian ini memakai notasi yang sama dengan materi 13.1: $G$ adalah graf berarah berbobot dengan himpunan simpul $V$ dan himpunan sisi $E$, $s$ adalah simpul awal (*source*), $u$ dan $v$ adalah anggota $V$, dan $w(u,v)$ adalah bobot sisi $(u,v) \in E$. Dijkstra memakai dua prosedur bantu yang **sama persis** dengan Bellman-Ford, yaitu INITIALIZE-SINGLE-SOURCE dan RELAX.

### Pseudocode

```pseudocode
INITIALIZE-SINGLE-SOURCE(G, s)
S = ∅
Q = G.V
while Q ≠ ∅
    u = EXTRACT-MIN(Q)
    S = S ∪ {u}
    for each vertex v ∈ G.Adj[u]
        RELAX(u, v, w)
```

```pseudocode
for each vertex v ∈ G.V
    v.d = ∞
    v.π = NIL
s.d = 0
```

```pseudocode
if v.d > u.d + w(u, v)
    v.d = u.d + w(u, v)
    v.π = u
```

Blok pertama adalah DIJKSTRA$(G, w, s)$ dengan 8 baris, blok kedua adalah INITIALIZE-SINGLE-SOURCE$(G, s)$ dengan 4 baris, dan blok ketiga adalah RELAX$(u, v, w)$ dengan 3 baris. Parameter masukannya adalah graf $G$ dalam bentuk ***adjacency list***, bobot tiap sisi di $E$, dan simpul awal $s$.

| Notasi | Arti |
| --- | --- |
| $v.d$ | Perkiraan bobot lintasan terpendek dari $s$ ke $v$ yang diketahui sejauh ini |
| $v.\pi$ | *Predecessor* (induk) dari $v$ pada lintasan itu, atau NIL bila belum ada |
| $S$ | Himpunan simpul yang bobot lintasan terpendeknya dari $s$ sudah final |
| $Q$ | Himpunan simpul yang belum masuk $S$ (antrean prioritas menurut $v.d$) |

:::steps Arti tiap langkah DIJKSTRA
::slide Langkah 1: INITIALIZE-SINGLE-SOURCE
Setiap simpul diberi jarak dari simpul awal $v.d = \infty$, *predecessor* $v.\pi = \text{NIL}$, dan simpul awal diberi $s.d = 0$. Prosedur ini sama dengan yang dipakai Bellman-Ford.

::slide Langkah 2: S = ∅
Himpunan $S$ dimulai kosong. $S$ berisi simpul-simpul yang lintasan terpendek dari $s$ sudah ditemukan, dan akan bertambah satu simpul di tiap putaran.

::slide Langkah 3: Q = G.V
Himpunan $Q$ diisi semua simpul anggota $V$. Jadi pada awalnya $Q$ berisi semua simpul dan $S$ kosong, dan selalu berlaku $Q = V - S$.

::slide Langkah 4: while Q ≠ ∅
Langkah 4 sampai 8 adalah perulangan ***while***. Selama $Q$ tidak kosong, langkah 5 sampai 8 dijalankan. Karena tiap putaran memindahkan satu simpul dari $Q$ ke $S$, perulangan ini berjalan tepat $\lvert V \rvert$ kali.

::slide Langkah 5 dan 6: ambil simpul terkecil
Langkah 5: $u = \text{EXTRACT-MIN}(Q)$ mengeluarkan dari $Q$ simpul dengan $v.d$ **terkecil**. Pada putaran pertama itu adalah $s$, karena hanya $s$ yang bernilai 0. Langkah 6: simpul $u$ dimasukkan ke $S$, dan sejak saat itu $u.d$ dianggap final.

::slide Langkah 7 dan 8: RELAX tetangga u
Langkah 7 adalah perulangan ***for*** atas setiap simpul $v$ pada *adjacency list* dari $u$, dan langkah 8 memanggil RELAX$(u, v, w)$. Bila $v.d > u.d + w(u,v)$, maka $v.d$ diganti menjadi $u.d + w(u,v)$ dan $v.\pi = u$. Bila tidak, kembali ke langkah 7.
:::

:::quiz Cek pemahaman: algoritma Dijkstra
::question Apa perbedaan utama persyaratan Dijkstra dibandingkan Bellman-Ford?
- [ ] Dijkstra hanya bekerja pada graf tak berarah
- [x] Dijkstra tidak memperbolehkan bobot sisi negatif
- [ ] Dijkstra tidak memakai prosedur RELAX
::explain
Tujuannya sama dan prosedur RELAX-nya juga sama. Bedanya, Dijkstra mensyaratkan semua bobot sisi tidak negatif, sedangkan Bellman-Ford membolehkannya.
::question Pada langkah 5, simpul mana yang dikeluarkan dari $Q$?
- [ ] Simpul yang paling awal ditulis di graf
- [x] Simpul di $Q$ dengan nilai $v.d$ terkecil
- [ ] Simpul dengan jumlah tetangga terbanyak
::explain
EXTRACT-MIN selalu mengeluarkan simpul dengan $v.d$ terkecil di $Q$. Karena itu Dijkstra disebut algoritma yang selalu memilih simpul "terdekat" berikutnya.
::question Graf berarah punya 6 simpul. Berapa kali perulangan *while* (langkah 4 sampai 8) berjalan?
- [ ] 5 kali
- [x] 6 kali
- [ ] Sebanyak jumlah sisinya
::explain
Tiap putaran memindahkan tepat satu simpul dari $Q$ ke $S$, dan $Q$ awalnya berisi semua $\lvert V \rvert = 6$ simpul. Jadi perulangan berjalan 6 kali. Perhatikan bedanya dengan Bellman-Ford yang mengulang $\lvert V \rvert - 1$ kali.
::question Himpunan $S$ pada Dijkstra berisi...
- [ ] Semua simpul pada graf sejak awal
- [x] Simpul-simpul yang lintasan terpendek dari $s$ sudah final
- [ ] Sisi-sisi yang bobotnya negatif
::explain
$S$ dimulai kosong dan bertambah satu simpul tiap putaran. Simpul di $S$ sudah dikeluarkan dari $Q$, dan nilai $v.d$-nya dianggap final.
:::

## B. Contoh Dijkstra

Diberikan graf berarah berbobot $G = (V, E)$ berikut. Tentukan lintasan terpendek dari simpul awal $s$ ke simpul-simpul lain dengan algoritma Dijkstra.

![Graf berarah berbobot dengan simpul s, t, x, y, dan z. Sisi dan bobotnya: s ke t 10, s ke y 5, t ke x 1, t ke y 2, y ke t 3, y ke x 9, y ke z 2, x ke z 4, z ke x 6, dan z ke s 7.](/materi/dijkstra/contoh-graf.png)

Langkah pertama adalah merepresentasikan graf $G$ dalam bentuk *adjacency list*. Urutan tetangga pada daftar menentukan urutan RELAX di langkah 7.

| Simpul $u$ | $G.Adj[u]$ (dengan bobot) |
| --- | --- |
| $s$ | $t$ (10), $y$ (5) |
| $t$ | $x$ (1), $y$ (2) |
| $x$ | $z$ (4) |
| $y$ | $x$ (9), $z$ (2), $t$ (3) |
| $z$ | $s$ (7), $x$ (6) |

### Penelusuran langkah demi langkah

Pada gambar tiap loop, angka di dalam simpul adalah $v.d$. **Simpul hitam** sudah masuk $S$, **simpul abu-abu** adalah simpul di $Q$ dengan nilai terkecil (yang akan di-*extract* pada loop berikutnya), dan simpul putih masih di $Q$. Sisi tebal abu-abu menunjukkan *predecessor* ($v.\pi = u$), dan simpul bergaris tebal adalah simpul yang nilainya baru berubah pada loop itu.

:::steps Penelusuran Dijkstra pada contoh
::slide Langkah 1 sampai 3: inisialisasi
Hasil langkah 1: semua simpul bernilai $\infty$ kecuali simpul awal $s$ yang bernilai 0, dan semua *predecessor* NIL. Hasil langkah 2: $S = \emptyset$. Hasil langkah 3: $Q = \{s, t, x, y, z\}$.

![Graf contoh setelah INITIALIZE-SINGLE-SOURCE. Nilai d: s = 0, t = ∞, x = ∞, y = ∞, z = ∞. Simpul s berwarna abu-abu karena paling kecil di Q. Belum ada sisi tebal.](/materi/dijkstra/dj-00.png)

::slide Loop 1
Langkah 5: $u = \text{EXTRACT-MIN}(Q) = s$, simpul di $Q$ dengan $v.d$ terkecil (s.d = 0). Langkah 6: $S = \{s\}$ dan $Q = \{t, x, y, z\}$.

Langkah 7: $G.Adj[s] = (t, y)$. Langkah 8: RELAX$(u,v,w)$ dijalankan untuk tiap tetangga.

| Sisi $(u,v)$ | $u.d + w(u,v)$ | $v.d$ sebelum | Kondisi RELAX baris 1 |
| --- | --- | --- | --- |
| $(s,t)$ | $0 + 10 = 10$ | $\infty$ | *true*: $t.d = 10$, $t.\pi = s$ |
| $(s,y)$ | $0 + 5 = 5$ | $\infty$ | *true*: $y.d = 5$, $y.\pi = s$ |

Kondisi pada baris 1 RELAX bernilai *true* untuk sisi $(s,t)$, $(s,y)$.

Hasil loop 1: $s.d = 0$, $t.d = 10$, $x.d = \infty$, $y.d = 5$, $z.d = \infty$. Simpul terkecil di $Q$ adalah $y$ (abu-abu), yang akan di-*extract* pada loop berikutnya.

![Graf contoh setelah loop 1. Nilai d: s = 0, t = 10, x = ∞, y = 5, z = ∞. Simpul hitam (di S): s. Simpul y abu-abu karena paling kecil di Q. Sisi tebal (v.π = u): s→t, s→y.](/materi/dijkstra/dj-01.png)

::slide Loop 2
Langkah 5: $u = \text{EXTRACT-MIN}(Q) = y$, simpul di $Q$ dengan $v.d$ terkecil (y.d = 5). Langkah 6: $S = \{s, y\}$ dan $Q = \{t, x, z\}$.

Langkah 7: $G.Adj[y] = (x, z, t)$. Langkah 8: RELAX$(u,v,w)$ dijalankan untuk tiap tetangga.

| Sisi $(u,v)$ | $u.d + w(u,v)$ | $v.d$ sebelum | Kondisi RELAX baris 1 |
| --- | --- | --- | --- |
| $(y,x)$ | $5 + 9 = 14$ | $\infty$ | *true*: $x.d = 14$, $x.\pi = y$ |
| $(y,z)$ | $5 + 2 = 7$ | $\infty$ | *true*: $z.d = 7$, $z.\pi = y$ |
| $(y,t)$ | $5 + 3 = 8$ | $10$ | *true*: $t.d = 8$, $t.\pi = y$ |

Kondisi pada baris 1 RELAX bernilai *true* untuk sisi $(y,x)$, $(y,z)$, $(y,t)$.

Hasil loop 2: $s.d = 0$, $t.d = 8$, $x.d = 14$, $y.d = 5$, $z.d = 7$. Simpul terkecil di $Q$ adalah $z$ (abu-abu), yang akan di-*extract* pada loop berikutnya.

![Graf contoh setelah loop 2. Nilai d: s = 0, t = 8, x = 14, y = 5, z = 7. Simpul hitam (di S): s, y. Simpul z abu-abu karena paling kecil di Q. Sisi tebal (v.π = u): y→t, y→x, s→y, y→z.](/materi/dijkstra/dj-02.png)

::slide Loop 3
Langkah 5: $u = \text{EXTRACT-MIN}(Q) = z$, simpul di $Q$ dengan $v.d$ terkecil (z.d = 7). Langkah 6: $S = \{s, y, z\}$ dan $Q = \{t, x\}$.

Langkah 7: $G.Adj[z] = (s, x)$. Langkah 8: RELAX$(u,v,w)$ dijalankan untuk tiap tetangga.

| Sisi $(u,v)$ | $u.d + w(u,v)$ | $v.d$ sebelum | Kondisi RELAX baris 1 |
| --- | --- | --- | --- |
| $(z,s)$ | $7 + 7 = 14$ | $0$ | *false* |
| $(z,x)$ | $7 + 6 = 13$ | $14$ | *true*: $x.d = 13$, $x.\pi = z$ |

Kondisi pada baris 1 RELAX bernilai *true* untuk sisi $(z,x)$.

Hasil loop 3: $s.d = 0$, $t.d = 8$, $x.d = 13$, $y.d = 5$, $z.d = 7$. Simpul terkecil di $Q$ adalah $t$ (abu-abu), yang akan di-*extract* pada loop berikutnya.

![Graf contoh setelah loop 3. Nilai d: s = 0, t = 8, x = 13, y = 5, z = 7. Simpul hitam (di S): s, y, z. Simpul t abu-abu karena paling kecil di Q. Sisi tebal (v.π = u): y→t, z→x, s→y, y→z.](/materi/dijkstra/dj-03.png)

::slide Loop 4
Langkah 5: $u = \text{EXTRACT-MIN}(Q) = t$, simpul di $Q$ dengan $v.d$ terkecil (t.d = 8). Langkah 6: $S = \{s, y, z, t\}$ dan $Q = \{x\}$.

Langkah 7: $G.Adj[t] = (x, y)$. Langkah 8: RELAX$(u,v,w)$ dijalankan untuk tiap tetangga.

| Sisi $(u,v)$ | $u.d + w(u,v)$ | $v.d$ sebelum | Kondisi RELAX baris 1 |
| --- | --- | --- | --- |
| $(t,x)$ | $8 + 1 = 9$ | $13$ | *true*: $x.d = 9$, $x.\pi = t$ |
| $(t,y)$ | $8 + 2 = 10$ | $5$ | *false* |

Kondisi pada baris 1 RELAX bernilai *true* untuk sisi $(t,x)$.

Hasil loop 4: $s.d = 0$, $t.d = 8$, $x.d = 9$, $y.d = 5$, $z.d = 7$. Simpul terkecil di $Q$ adalah $x$ (abu-abu), yang akan di-*extract* pada loop berikutnya.

![Graf contoh setelah loop 4. Nilai d: s = 0, t = 8, x = 9, y = 5, z = 7. Simpul hitam (di S): s, y, z, t. Simpul x abu-abu karena paling kecil di Q. Sisi tebal (v.π = u): y→t, t→x, s→y, y→z.](/materi/dijkstra/dj-04.png)

::slide Loop 5
Langkah 5: $u = \text{EXTRACT-MIN}(Q) = x$, simpul di $Q$ dengan $v.d$ terkecil (x.d = 9). Langkah 6: $S = \{s, y, z, t, x\}$ dan $Q = \emptyset$.

Langkah 7: $G.Adj[x] = (z)$. Langkah 8: RELAX$(u,v,w)$ dijalankan untuk tiap tetangga.

| Sisi $(u,v)$ | $u.d + w(u,v)$ | $v.d$ sebelum | Kondisi RELAX baris 1 |
| --- | --- | --- | --- |
| $(x,z)$ | $9 + 4 = 13$ | $7$ | *false* |

Kondisi pada baris 1 RELAX bernilai *false* untuk semua sisi, jadi tidak ada nilai yang berubah.

Hasil loop 5: $s.d = 0$, $t.d = 8$, $x.d = 9$, $y.d = 5$, $z.d = 7$. $Q$ sudah kosong.

![Graf contoh setelah loop 5. Nilai d: s = 0, t = 8, x = 9, y = 5, z = 7. Simpul hitam (di S): s, y, z, t, x. Sisi tebal (v.π = u): y→t, t→x, s→y, y→z.](/materi/dijkstra/dj-05.png)

::slide Loop 6: end while
Langkah 4: $Q \neq \emptyset$ bernilai *false*, karena $Q = \emptyset$. Perulangan *while* selesai (*end while*) dan pseudocode Dijkstra selesai dijalankan.
:::

### Hasil penelusuran

Nilai $v.d$ dan himpunan $S$, $Q$ sesudah tiap loop pada contoh:

| Sesudah | $s.d$ | $t.d$ | $x.d$ | $y.d$ | $z.d$ | $S$ | $Q$ |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Langkah 1 sampai 3 | $0$ | $\infty$ | $\infty$ | $\infty$ | $\infty$ | $\emptyset$ | $\{s, t, x, y, z\}$ |
| Loop 1 ($u = s$) | $0$ | $10$ | $\infty$ | $5$ | $\infty$ | $\{s\}$ | $\{t, x, y, z\}$ |
| Loop 2 ($u = y$) | $0$ | $8$ | $14$ | $5$ | $7$ | $\{s, y\}$ | $\{t, x, z\}$ |
| Loop 3 ($u = z$) | $0$ | $8$ | $13$ | $5$ | $7$ | $\{s, y, z\}$ | $\{t, x\}$ |
| Loop 4 ($u = t$) | $0$ | $8$ | $9$ | $5$ | $7$ | $\{s, y, z, t\}$ | $\{x\}$ |
| Loop 5 ($u = x$) | $0$ | $8$ | $9$ | $5$ | $7$ | $\{s, y, z, t, x\}$ | $\emptyset$ |

Simpul keluar dari $Q$ menurut urutan $s, y, z, t, x$, yaitu urutan nilai $v.d$ yang makin besar: $0, 5, 7, 8, 9$. Lintasan terpendek diperoleh dengan menelusuri *predecessor* $v.\pi$ mundur dari $v$ sampai $s$:

| Tujuan | $v.d$ | $v.\pi$ | Lintasan terpendek dari $s$ | Perhitungan bobot |
| --- | --- | --- | --- | --- |
| $t$ | $8$ | $y$ | $s \to y \to t$ | $5 + 3 = 8$ |
| $x$ | $9$ | $t$ | $s \to y \to t \to x$ | $5 + 3 + 1 = 9$ |
| $y$ | $5$ | $s$ | $s \to y$ | $5 = 5$ |
| $z$ | $7$ | $y$ | $s \to y \to z$ | $5 + 2 = 7$ |

Dari $s$ ke $t$ lintasan terpendeknya $s \to y \to t$ dengan total bobot 8. Ke $x$ lintasannya $s \to y \to t \to x$ dengan total bobot 9, ke $y$ lintasannya $s \to y$ dengan total bobot 5, dan ke $z$ lintasannya $s \to y \to z$ dengan total bobot 7. Perhatikan bahwa sisi langsung $(s,t)$ berbobot 10 lebih mahal daripada lewat $y$ ($5 + 3 = 8$), dan $t.d$ turun dari 10 menjadi 8 pada loop 2.

:::reveal Mengapa x.d turun dua kali, dari 14 ke 13 lalu ke 9?
Nilai $x.d$ pertama kali diisi pada loop 2 lewat $y$: $5 + 9 = 14$. Pada loop 3, simpul $z$ memberi jalur yang lebih murah, $7 + 6 = 13$. Pada loop 4, simpul $t$ (yang nilainya sudah turun menjadi 8 di loop 2) memberi jalur terbaik, $8 + 1 = 9$. Nilai $x.d$ boleh terus turun selama $x$ masih di $Q$. Setelah $x$ di-*extract* (loop 5), nilainya final: sisi $(x,z)$ di loop 5 memberi $9 + 4 = 13$ yang tidak lebih kecil dari $z.d = 7$, jadi tidak ada perubahan.
:::

:::reveal Mengapa urutan tetangga pada Adj tidak memengaruhi hasil akhir?
Dalam satu loop, RELAX hanya menurunkan $v.d$ bila jalur lewat $u$ lebih murah, jadi urutan tetangga tidak mengubah nilai akhir. Urutan hanya memengaruhi urutan kejadian di dalam loop. Pada contoh, $Adj[y] = (x, z, t)$, dan bila ditulis $(t, x, z)$ hasil loop 2 tetap $t.d = 8$, $x.d = 14$, $z.d = 7$. Yang bisa berpengaruh hanya bila dua simpul di $Q$ punya $v.d$ sama: EXTRACT-MIN boleh memilih salah satunya, dan lintasan terpendek yang dihasilkan bisa berbeda, tetapi total bobotnya tetap sama.
:::

### Peraga: Penelusuran Dijkstra

Peraga ini menjalankan pseudocode DIJKSTRA$(G, w, s)$ baris demi baris pada graf berarah berbobot yang Anda isi. Isian awalnya adalah contoh di bagian B dengan urutan tetangga yang sama dengan *adjacency list*, jadi nilai $v.d$, himpunan $S$, dan himpunan $Q$ tiap loop sama dengan gambar loop 1 sampai 5 di atas.

- Kode di peraga menggabungkan tiga prosedur dalam satu blok: **baris 1 sampai 8 adalah DIJKSTRA, baris 9 sampai 12 adalah INITIALIZE-SINGLE-SOURCE, dan baris 13 sampai 15 adalah RELAX**. Nomor baris di peraga = nomor baris di bagian A ditambah 8 untuk INITIALIZE-SINGLE-SOURCE, dan ditambah 12 untuk RELAX. Saat baris 1 dibaca, penelusuran berpindah ke baris 9 sampai 12, dan saat baris 8 dibaca, penelusuran berpindah ke baris 13 sampai 15, lalu kembali.
- Tabel **Atribut tiap simpul** menunjukkan $v.d$ dan $v.\pi$. Simpul yang sudah di $S$ bertanda hitam (seperti simpul hitam di gambar), $u$ yang baru di-*extract* dan $v$ yang sedang diperiksa bertanda khusus, dan simpul yang nilainya baru diubah RELAX bertanda tebal, jadi statusnya tidak hanya dibedakan lewat warna.
- Daftar **Himpunan S** dan **Himpunan Q** (dengan nilai $d$ dalam kurung) menunjukkan simpul mana yang sudah final dan mana yang masih menunggu. Daftar **Tetangga u** menunjukkan $G.Adj[u]$ dan tetangga mana yang sedang diperiksa.
- Peraga mengikuti pseudocode **apa adanya**: perulangan *while* berjalan tepat $\lvert V \rvert$ kali, dan simpul yang tidak terjangkau tetap di-*extract* (nilainya $\infty$ dan RELAX tidak mengubah apa pun). Bila dua simpul di $Q$ bernilai sama, yang lebih dulu dalam urutan V dikeluarkan lebih dulu. Dengan $n$ simpul, $m$ sisi, dan $U$ = banyak pembaruan (baris 14 dan 15), banyaknya langkah selalu $8 + 4n + 3m + 2U$, yaitu 72 langkah untuk contoh ($n = 5$, $m = 10$, $U = 7$).
- Simpul ditulis di isian V, sisi berarah di isian E sebagai `u>v:bobot`, dan sumber di isian s. **Urutan penulisan sisi yang berawal dari simpul sama adalah urutan $G.Adj[u]$.** Coba tombol "Urutan Adj[y] lain": loop 2 berjalan dengan urutan berbeda, tetapi hasil akhirnya sama. Coba juga "Nilai seri di Q" dan "Ada simpul yang tidak terjangkau". **Bobot negatif ditolak** (gunakan peraga Bellman-Ford di materi 13.1). Maksimal 7 simpul dan 14 sisi, bobot 0 sampai 99.

::trace dijkstra

:::quiz Cek pemahaman: contoh Dijkstra
::question Pada loop 1, nilai apa yang didapat setelah RELAX dari simpul $s$?
- [ ] $t.d = 5$ dan $y.d = 10$
- [x] $t.d = 10$ dan $y.d = 5$
- [ ] $t.d = 10$ dan $y.d = 7$
::explain
$Adj[s] = (t, y)$ dengan $w(s,t) = 10$ dan $w(s,y) = 5$. Karena $s.d = 0$, hasilnya $t.d = 0 + 10 = 10$ dan $y.d = 0 + 5 = 5$.
::question Mengapa simpul $y$ yang di-*extract* pada loop 2?
- [ ] Karena $y$ ditulis lebih dulu daripada $t$
- [x] Karena $y.d = 5$ adalah yang terkecil di $Q = \{t, x, y, z\}$
- [ ] Karena $y$ punya tetangga paling banyak
::explain
Sesudah loop 1, $t.d = 10$, $x.d = \infty$, $y.d = 5$, dan $z.d = \infty$. Nilai terkecil adalah $y.d = 5$, jadi $y$ yang di-*extract*.
::question Berapa $t.d$ sesudah loop 2, dan mengapa turun dari 10?
- [ ] 10, karena tidak berubah
- [x] 8, karena $y.d + w(y,t) = 5 + 3 = 8$ lebih kecil dari 10
- [ ] 7, karena $y.d + w(y,z) = 7$
::explain
Pada loop 2, RELAX$(y, t, w)$ menghitung $5 + 3 = 8$ yang lebih kecil dari $t.d = 10$, sehingga $t.d = 8$ dan $t.\pi = y$. Nilai 7 adalah milik $z$, bukan $t$.
::question Berapa bobot lintasan terpendek dari $s$ ke $x$, dan lewat mana?
- [ ] 14, lewat $s \to y \to x$
- [ ] 13, lewat $s \to y \to z \to x$
- [x] 9, lewat $s \to y \to t \to x$
::explain
Nilai akhir $x.d = 9$ dengan $x.\pi = t$, $t.\pi = y$, dan $y.\pi = s$. Lintasannya $s \to y \to t \to x$ dengan bobot $5 + 3 + 1 = 9$. Nilai 14 dan 13 adalah nilai sementara yang kemudian turun.
::question Pada loop 5 ($u = x$), mengapa $z.d$ tetap 7?
- [ ] Karena $z$ sudah di $S$ sehingga sisi $(x,z)$ diabaikan
- [x] Karena $x.d + w(x,z) = 9 + 4 = 13$ tidak lebih kecil dari $z.d = 7$
- [ ] Karena $x$ tidak punya tetangga
::explain
Kondisi RELAX $v.d > u.d + w(u,v)$ menjadi $7 > 13$, yaitu *false*, jadi tidak ada perubahan. RELAX tetap dipanggil untuk $z$ walaupun $z$ sudah di $S$, tetapi tidak mengubah nilai.
:::

## C. Mengapa Bobot Negatif Dilarang, dan Running Time

Bagian ini tambahan dari buku Cormen (tidak ada di dokumen kuliah).

### Contoh Dijkstra gagal pada bobot negatif

Dijkstra menganggap $u.d$ sudah final begitu $u$ di-*extract*. Anggapan itu benar hanya bila semua bobot tidak negatif, sebab lewat simpul lain nilai tidak mungkin turun. Bila ada sisi negatif, anggapan itu bisa salah. Contoh kecil dengan simpul $s$, $a$, $b$, $c$ dan sisi $(s,a)$ berbobot 3, $(s,b)$ berbobot 4, $(a,c)$ berbobot 1, dan $(b,a)$ berbobot $-2$. Urutan simpul di $Q$ adalah $s, a, b, c$, dan seri diputus menurut urutan itu.

| Loop | $u$ | Perubahan RELAX | $a.d$ | $b.d$ | $c.d$ |
| --- | --- | --- | --- | --- | --- |
| Awal | | | $\infty$ | $\infty$ | $\infty$ |
| 1 | $s$ | $a.d = 3$, $b.d = 4$ | $3$ | $4$ | $\infty$ |
| 2 | $a$ | $c.d = 3 + 1 = 4$ | $3$ | $4$ | $4$ |
| 3 | $b$ | $a.d = 4 + (-2) = 2$ | $2$ | $4$ | $4$ |
| 4 | $c$ | tidak ada | $2$ | $4$ | $4$ |

Pada loop 2, $a$ di-*extract* dan dianggap final dengan $a.d = 3$, lalu $c.d = 4$ dihitung dari nilai itu. Pada loop 3, sisi negatif $(b,a)$ menurunkan $a.d$ menjadi 2, tetapi $c$ tidak ikut diperbarui karena $a$ sudah tidak diproses lagi. Hasil akhirnya $c.d = 4$, padahal lintasan $s \to b \to a \to c$ berbobot $4 + (-2) + 1 = 3$. Bellman-Ford memberi $c.d = 3$ pada graf yang sama, karena ia me-RELAX semua sisi berulang kali.

### Analisis running time

Biaya Dijkstra bergantung pada cara menyimpan $Q$. Dengan $\lvert V \rvert$ simpul dan $\lvert E \rvert$ sisi, RELAX dipanggil sekali per sisi, dan EXTRACT-MIN dipanggil $\lvert V \rvert$ kali.

| Penyimpanan $Q$ | EXTRACT-MIN | Running time total |
| --- | --- | --- |
| Larik biasa (dipindai) | $O(V)$ per panggilan | $O(V^2 + E) = O(V^2)$ |
| *Binary min-heap* | $O(\lg V)$ per panggilan | $O((V + E) \lg V)$ |
| *Fibonacci heap* | $O(\lg V)$ teramortisasi | $O(V \lg V + E)$ |

Untuk graf rapat ($\lvert E \rvert$ mendekati $\lvert V \rvert^2$) larik biasa sudah cukup baik, sedangkan untuk graf jarang *heap* lebih cepat. Bandingkan dengan Bellman-Ford yang $\Theta(VE)$: Dijkstra jauh lebih cepat, tetapi hanya untuk bobot tidak negatif.

:::quiz Cek pemahaman: bobot negatif dan running time
::question Mengapa Dijkstra bisa salah bila ada sisi berbobot negatif?
- [ ] Karena Dijkstra tidak memakai RELAX
- [x] Karena simpul yang sudah di-*extract* dianggap final, padahal nilainya masih bisa turun lewat sisi negatif
- [ ] Karena Dijkstra hanya memeriksa sisi dari $s$
::explain
Dijkstra tidak pernah memproses ulang simpul yang sudah di $S$. Pada contoh, $a.d$ turun dari 3 menjadi 2 setelah $a$ di $S$, sehingga $c.d$ yang dihitung dari $a.d = 3$ tertinggal.
::question Pada contoh $s$, $a$, $b$, $c$, berapa $c.d$ yang dihasilkan Dijkstra, dan berapa yang benar?
- [ ] Dijkstra 3, yang benar 4
- [x] Dijkstra 4, yang benar 3
- [ ] Keduanya 4
::explain
Dijkstra menghasilkan $c.d = 4$ lewat $s \to a \to c$, sedangkan lintasan terpendek sebenarnya $s \to b \to a \to c$ dengan bobot $4 - 2 + 1 = 3$.
::question Dengan $Q$ berupa larik biasa yang dipindai, berapa running time Dijkstra?
- [ ] $\Theta(VE)$
- [x] $O(V^2 + E)$, yaitu $O(V^2)$
- [ ] $O(\lg V)$
::explain
EXTRACT-MIN memindai larik sehingga $O(V)$ dan dipanggil $V$ kali, jadi $O(V^2)$. RELAX total $O(E)$. Jumlahnya $O(V^2 + E) = O(V^2)$.
:::

## D. Mencoba Visualisasi

Visualisasi di bawah ini menjalankan Dijkstra pada graf berarah berbobot yang Anda isi. Tiap langkah menyorot baris kode, mewarnai simpul dan sisi, serta menampilkan nilai jarak yang sedang berubah.

Beberapa hal agar tidak bingung membandingkan dengan materi:

- Simpul pada visualisasi **bernomor 0 sampai $n - 1$**, bukan huruf. Pada contoh materi, $s, t, x, y, z$ adalah 0, 1, 2, 3, 4, sehingga $(s,t)$ ditulis `0>1:10` dan $(z,s)$ ditulis `4>0:7`. Sisi ditulis `u>v:bobot` yang berarti panah dari $u$ ke $v$, dan dua arah antara simpul yang sama ditulis sebagai dua sisi.
- Bobot bilangan bulat dari 0 sampai 99, dengan $n$ maksimal 9 dan sisi maksimal 16. **Bobot negatif ditolak** oleh visualisasi Dijkstra. Untuk bobot negatif, pakai visualisasi Bellman-Ford di materi 13.1.
- Contoh bawaan "Contoh klasik (5 simpul)" adalah graf contoh materi ini, tetapi sisi ditulis menurut urutan lain: $Adj[y]$ menjadi $(t, x, z)$, bukan $(x, z, t)$ seperti di bagian B. Hasil akhirnya sama ($t = 8$, $x = 9$, $y = 5$, $z = 7$). Untuk mengulang urutan materi, tulis `0>1:10, 0>3:5, 1>2:1, 1>3:2, 3>2:9, 3>4:2, 3>1:3, 2>4:4, 4>0:7, 4>2:6`.
- Visualisasi ini menunjukkan jalannya algoritma pada graf. Untuk menelusuri **pseudocode bagian A baris demi baris** (termasuk INITIALIZE-SINGLE-SOURCE dan RELAX) pada contoh materi, gunakan peraga penelusuran di akhir bagian B.
- Kodenya berbentuk JavaScript, jadi nomor barisnya berbeda dari pseudocode di bagian A. Himpunan $S$ diwakili larik `selesai`, dan EXTRACT-MIN dilakukan dengan **memindai larik** (tanpa antrean prioritas), sehingga waktunya $O(V^2)$ seperti pada bagian C. Bila nilai sama, simpul bernomor lebih kecil dipilih lebih dulu.
- Simpul yang tidak terjangkau dari $s$ tetap bernilai $\infty$ pada tampilan. Kodenya berhenti (`break`) bila nilai terkecil di $Q$ adalah $\infty$, dan pada nilai kembaliannya simpul itu ditulis $-1$.

::visualizer

## E. Rangkuman

| Hal | Isi |
| --- | --- |
| Masalah | Lintasan terpendek dari satu sumber $s$ ke semua simpul pada graf berarah berbobot |
| Syarat | Semua bobot sisi **tidak negatif** |
| Dijkstra | INITIALIZE-SINGLE-SOURCE, lalu selama $Q \neq \emptyset$: ambil $u$ dengan $u.d$ terkecil, masukkan ke $S$, dan RELAX semua tetangga $u$ |
| RELAX | Bila $v.d > u.d + w(u,v)$, maka $v.d = u.d + w(u,v)$ dan $v.\pi = u$ |
| Banyak putaran | Tepat $\lvert V \rvert$ putaran *while* (Bellman-Ford: $\lvert V \rvert - 1$ loop) |
| Contoh | $t.d = 8$, $x.d = 9$, $y.d = 5$, $z.d = 7$ |
| Running time | $O(V^2)$ dengan larik, $O((V + E) \lg V)$ dengan *binary heap* |

Cara cepat mengingat: **Dijkstra selalu mengambil simpul terdekat berikutnya yang belum final, mengunci nilainya, lalu me-RELAX tetangganya. Ini aman hanya bila tidak ada sisi negatif**. Bila ada bobot negatif, gunakan Bellman-Ford (materi 13.1).

## A. Graf

Daftar pustaka: Cormen, *Introduction to Algorithms*, halaman 589 sampai 598. Sebuah **graf** dinotasikan sebagai himpunan $G = (V, E)$. $V$ adalah himpunan ***vertex*** (simpul) dan $E$ adalah himpunan ***edge*** (busur). Graf bisa digambarkan sebagai **graf berarah** (*directed graph*) atau **graf tak berarah** (*undirected graph*).

| Istilah | Arti |
| --- | --- |
| *Vertex* (simpul) | Titik pada graf, digambar sebagai lingkaran bernomor atau berhuruf |
| *Edge* (busur) | Garis yang menghubungkan dua simpul |
| Graf tak berarah | Busur tidak punya arah: busur antara $u$ dan $v$ sama saja dengan busur antara $v$ dan $u$ |
| Graf berarah | Busur punya arah: $(u, v)$ berarti dari $u$ menuju $v$, dan berbeda dari $(v, u)$ |
| $\lvert V \rvert$ dan $\lvert E \rvert$ | Banyaknya simpul dan banyaknya busur |

Kedua jenis graf bisa disimpan dalam bentuk ***adjacency-list*** atau ***adjacency-matrix***. Gambar 1 adalah graf tak berarah dan Gambar 2 adalah graf berarah, masing-masing dengan kedua representasinya.

![Gambar 1. (a) Graf tak berarah dengan 5 simpul dan 7 busur: 1-2, 1-5, 2-3, 2-4, 2-5, 3-4, dan 4-5. (b) Representasi adjacency-list: simpul 1 berisi 2 lalu 5, simpul 2 berisi 1, 5, 3, lalu 4, simpul 3 berisi 2 lalu 4, simpul 4 berisi 2, 5, lalu 3, simpul 5 berisi 4, 1, lalu 2. (c) Representasi adjacency-matrix berukuran 5 kali 5 yang simetris.](/materi/graph-bfs/graf-tak-berarah.png)

Gambar 1: (a) graf tak berarah, (b) bentuk *adjacency-list*, (c) bentuk *adjacency-matrix*.

![Gambar 2. (a) Graf berarah dengan 6 simpul dan 8 busur: 1 ke 2, 1 ke 4, 2 ke 5, 3 ke 5, 3 ke 6, 4 ke 2, 5 ke 4, dan 6 ke 6 (busur yang kembali ke simpul yang sama). (b) Representasi adjacency-list: simpul 1 berisi 2 lalu 4, simpul 2 berisi 5, simpul 3 berisi 6 lalu 5, simpul 4 berisi 2, simpul 5 berisi 4, simpul 6 berisi 6. (c) Representasi adjacency-matrix berukuran 6 kali 6 yang tidak simetris.](/materi/graph-bfs/graf-berarah.png)

Gambar 2: (a) graf berarah, (b) bentuk *adjacency-list*, (c) bentuk *adjacency-matrix*.

Perhatikan simpul 6 pada Gambar 2. Busurnya keluar dari simpul 6 dan masuk lagi ke simpul 6, sehingga $(6, 6) \in E$.

:::quiz Cek pemahaman: graf
::question Berapa jumlah busur pada graf tak berarah di Gambar 1?
- [ ] 5
- [x] 7
- [ ] 14
::explain
Busurnya 1-2, 1-5, 2-3, 2-4, 2-5, 3-4, dan 4-5, jadi $\lvert E \rvert = 7$. Angka 5 adalah banyaknya simpul, dan 14 muncul nanti sebagai jumlah panjang seluruh *adjacency-list* karena tiap busur tercatat dua kali.
::question Berapa jumlah busur pada graf berarah di Gambar 2?
- [ ] 6
- [x] 8
- [ ] 7
::explain
Busurnya (1,2), (1,4), (2,5), (3,5), (3,6), (4,2), (5,4), dan (6,6), jadi $\lvert E \rvert = 8$. Busur (6,6) yang kembali ke simpul yang sama juga dihitung satu busur.
::question Pada graf tak berarah, bagaimana hubungan busur $(u, v)$ dan $(v, u)$?
- [x] Keduanya adalah busur yang sama
- [ ] Keduanya busur berbeda, dan keduanya harus digambar
- [ ] Hanya salah satunya yang boleh ada
::explain
Pada graf tak berarah, busur tidak punya arah, jadi $(u, v)$ dan $(v, u)$ menyebut busur yang sama. Pada graf berarah keduanya berbeda.
:::

## B. Representasi Adjacency-List

Representasi ***adjacency-list*** dari graf $G = (V, E)$ terdiri dari sebuah *array* $Adj$ yang punya satu isian untuk tiap simpul di $V$. Untuk setiap $u \in V$, $Adj[u]$ berisi semua simpul $v$ yang busur $(u, v)$-nya ada di $E$. Dengan kata lain, $Adj[u]$ adalah daftar **tetangga** $u$.

Urutan penulisan *adjacency-list* **tidak harus terurut** menurut nomor simpul. Hasil BFS nanti bergantung pada urutan ini, jadi urutan di tabel berikut sengaja ditulis sama seperti di Gambar 1 dan Gambar 2.

*Adjacency-list* graf tak berarah pada Gambar 1:

| Simpul $u$ | $Adj[u]$ |
| --- | --- |
| 1 | 2, 5 |
| 2 | 1, 5, 3, 4 |
| 3 | 2, 4 |
| 4 | 2, 5, 3 |
| 5 | 4, 1, 2 |

*Adjacency-list* graf berarah pada Gambar 2:

| Simpul $u$ | $Adj[u]$ |
| --- | --- |
| 1 | 2, 4 |
| 2 | 5 |
| 3 | 6, 5 |
| 4 | 2 |
| 5 | 4 |
| 6 | 6 |

Dokumen menulis daftar dengan simpul asalnya di depan, misalnya $Adj[2]$ pada Gambar 1 ditulis $2 \rightarrow 1 \rightarrow 5 \rightarrow 3 \rightarrow 4$ dan $Adj[3]$ pada Gambar 2 ditulis $3 \rightarrow 6 \rightarrow 5$. Angka paling depan itu hanyalah kepala daftar, yaitu simpul $u$ sendiri. Isi $Adj[2]$ adalah 1, 5, 3, 4 dan isi $Adj[3]$ adalah 6, 5.

Jumlah panjang seluruh daftar:

- Graf tak berarah: $2 + 4 + 2 + 3 + 3 = 14 = 2 \lvert E \rvert$, karena tiap busur muncul di dua daftar (di daftar kedua ujungnya).
- Graf berarah: $2 + 1 + 2 + 1 + 1 + 1 = 8 = \lvert E \rvert$, karena tiap busur muncul sekali, di daftar simpul asalnya.

Pada kedua kasus, jumlah panjang seluruh daftar adalah $O(E)$. Fakta ini dipakai pada analisis waktu BFS di bagian F.

:::quiz Cek pemahaman: adjacency-list
::question Apa isi $Adj[2]$ pada graf tak berarah di Gambar 1?
- [ ] 1, 3, 4
- [x] 1, 5, 3, 4
- [ ] 2, 1, 5, 3, 4
::explain
Simpul 2 punya empat tetangga, yaitu 1, 5, 3, dan 4, sesuai urutan di gambar. Angka 2 di depan pada penulisan $2 \rightarrow 1 \rightarrow 5 \rightarrow 3 \rightarrow 4$ hanyalah kepala daftar, bukan anggota $Adj[2]$.
::question Apa isi $Adj[3]$ pada graf berarah di Gambar 2?
- [ ] 5, 6
- [x] 6, 5
- [ ] 6
::explain
Busur yang keluar dari simpul 3 adalah (3,6) dan (3,5). Urutannya di gambar adalah 6 lalu 5. Pada graf berarah, hanya busur yang **keluar** dari $u$ yang masuk ke $Adj[u]$.
::question Mengapa jumlah panjang seluruh *adjacency-list* pada graf tak berarah Gambar 1 adalah 14, bukan 7?
- [ ] Karena ada simpul yang terhubung ke dirinya sendiri
- [x] Karena setiap busur tercatat dua kali, di daftar kedua ujungnya
- [ ] Karena graf tak berarah selalu punya 14 busur
::explain
Busur 1-2, misalnya, muncul di $Adj[1]$ (sebagai 2) dan di $Adj[2]$ (sebagai 1). Jadi 7 busur menghasilkan $2 \times 7 = 14$ isian.
:::

## C. Representasi Adjacency-Matrix

Representasi ***adjacency-matrix*** dari graf $G = (V, E)$ adalah matriks $A = (a_{ij})$ berukuran $\lvert V \rvert \times \lvert V \rvert$ dengan

$$
a_{ij} = \begin{cases} 1, & \text{jika } (i, j) \in E \\ 0, & \text{jika } (i, j) \notin E \end{cases}
$$

Baris $i$ dan kolom $j$ dibaca sebagai "ada busur dari simpul $i$ ke simpul $j$ atau tidak".

*Adjacency-matrix* graf tak berarah pada Gambar 1:

| $i \backslash j$ | 1 | 2 | 3 | 4 | 5 |
| --- | --- | --- | --- | --- | --- |
| 1 | 0 | 1 | 0 | 0 | 1 |
| 2 | 1 | 0 | 1 | 1 | 1 |
| 3 | 0 | 1 | 0 | 1 | 0 |
| 4 | 0 | 1 | 1 | 0 | 1 |
| 5 | 1 | 1 | 0 | 1 | 0 |

*Adjacency-matrix* graf berarah pada Gambar 2:

| $i \backslash j$ | 1 | 2 | 3 | 4 | 5 | 6 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 0 | 1 | 0 | 1 | 0 | 0 |
| 2 | 0 | 0 | 0 | 0 | 1 | 0 |
| 3 | 0 | 0 | 0 | 0 | 1 | 1 |
| 4 | 0 | 1 | 0 | 0 | 0 | 0 |
| 5 | 0 | 0 | 0 | 1 | 0 | 0 |
| 6 | 0 | 0 | 0 | 0 | 0 | 1 |

Matriks graf tak berarah **simetris** ($a_{ij} = a_{ji}$), karena busurnya tidak punya arah. Matriks graf berarah tidak harus simetris. Misalnya $a_{35} = 1$ karena ada busur $(3, 5)$, tetapi $a_{53} = 0$ karena tidak ada busur $(5, 3)$. Busur dari simpul ke dirinya sendiri muncul di diagonal: $a_{66} = 1$.

Perbandingan kedua representasi:

| Hal | *Adjacency-list* | *Adjacency-matrix* |
| --- | --- | --- |
| Ruang yang dipakai | $O(V + E)$ | $\Theta(V^2)$ |
| Cara mencari semua tetangga $u$ | Baca $Adj[u]$ | Baca satu baris penuh, $\lvert V \rvert$ sel |
| Cocok untuk | Graf jarang ($\lvert E \rvert$ jauh lebih kecil dari $\lvert V \rvert^2$) | Graf padat, atau bila perlu cepat tahu apakah busur $(i, j)$ ada |

Prosedur BFS di materi ini memakai masukan graf dalam bentuk ***adjacency-list***.

:::quiz Cek pemahaman: adjacency-matrix
::question Nilai $a_{ij}$ sama dengan 1 jika...
- [ ] $i = j$
- [x] $(i, j) \in E$
- [ ] $(i, j) \notin E$
::explain
Isi 1 berarti ada busur dari simpul $i$ ke simpul $j$. Isi 0 berarti busur itu tidak ada.
::question Berapa nilai $a_{53}$ pada matriks graf berarah di Gambar 2?
- [x] 0
- [ ] 1
- [ ] 5
::explain
Tidak ada busur $(5, 3)$ pada Gambar 2. Yang ada adalah $(3, 5)$, sehingga $a_{35} = 1$ tetapi $a_{53} = 0$. Matriks graf berarah tidak harus simetris.
::question Berapa banyak sel pada *adjacency-matrix* graf dengan $\lvert V \rvert = 5$?
- [ ] 5
- [ ] $\lvert V \rvert + \lvert E \rvert$
- [x] 25
::explain
Matriksnya berukuran $5 \times 5$, jadi 25 sel, berapa pun banyaknya busur. Itu sebabnya ruangnya $\Theta(V^2)$.
:::

## D. Algoritma BFS

Algoritma ***Breadth First Search*** (BFS) dipakai untuk menelusuri graf. Pada pembahasan ini, BFS dipakai untuk mencari lintasan dari suatu simpul awal $s$ ke simpul-simpul lain dengan **jumlah busur paling sedikit**. Prosedurnya BFS$(G, s)$ dengan 18 baris, dan graf $G$ diberikan dalam bentuk *adjacency-list*.

### Pseudocode

Berikut pseudocode BFS$(G, s)$. Nomor baris di pinggir sama dengan nomor langkah yang dijelaskan di bawah.

```pseudocode
for each vertex u ∈ G.V − {s}
    u.color = WHITE
    u.d = ∞
    u.π = NIL
s.color = GRAY
s.d = 0
s.π = NIL
Q = ∅
ENQUEUE(Q, s)
while Q ≠ ∅
    u = DEQUEUE(Q)
    for each v ∈ G.Adj[u]
        if v.color == WHITE
            v.color = GRAY
            v.d = u.d + 1
            v.π = u
            ENQUEUE(Q, v)
    u.color = BLACK
```

Prosedur ini punya dua masukan, yaitu graf $G$ dan simpul awal (*source vertex*) $s$. Tiap simpul $u$ punya tiga atribut:

| Atribut | Arti |
| --- | --- |
| $u.color$ | Warna simpul $u$ |
| $u.d$ | Jarak dari simpul $s$ ke simpul $u$, yaitu jumlah busur pada lintasan dari $s$ ke $u$ |
| $u.\pi$ | *Predecessor* (induk, *parent*) simpul $u$. Untuk simpul awal $s$, induknya NIL |

Warna simpul menunjukkan seberapa jauh simpul itu sudah diproses:

| Warna | Arti |
| --- | --- |
| WHITE | Belum ditemukan |
| GRAY | Sudah ditemukan dan sedang menunggu di antrean $Q$ (atau baru keluar dari antrean dan tetangganya sedang diperiksa) |
| BLACK | Selesai: semua tetangganya sudah diperiksa |

Ada dua fungsi antrean $Q$ yang dipakai:

| Fungsi | Arti |
| --- | --- |
| ENQUEUE$(Q, x)$ | Memasukkan simpul $x$ ke belakang antrean $Q$. Pada BFS, simpul yang dimasukkan selalu simpul yang baru diberi warna GRAY |
| DEQUEUE$(Q)$ | Mengeluarkan satu simpul dari depan $Q$ dengan aturan *First In First Out* (FIFO): yang masuk lebih dulu keluar lebih dulu |

Penjelasan tiap langkah, dengan nomor yang sama seperti nomor baris di pinggir blok kode:

:::steps Arti tiap langkah BFS
::slide Langkah 1 sampai 4: simpul selain s
Untuk setiap simpul $u$ anggota $V$ kecuali simpul awal $s$: warnanya diberi WHITE (belum ditemukan), $u.d = \infty$ (jaraknya belum diketahui), dan induknya $u.\pi$ = NIL.

::slide Langkah 5: warna simpul awal
Simpul awal $s$ diberi warna GRAY. Artinya $s$ sudah ditemukan, tetapi tetangganya belum diperiksa.

::slide Langkah 6 dan 7: jarak dan induk s
$s.d = 0$, karena jarak $s$ ke dirinya sendiri nol busur. Induk $s$ adalah NIL, karena $s$ adalah awal penelusuran dan tidak ditemukan dari simpul lain.

::slide Langkah 8 dan 9: antrean awal
$Q$ dikosongkan, lalu ENQUEUE$(Q, s)$ memasukkan $s$. Setelah langkah 9, $Q$ hanya berisi simpul awal $s$.

::slide Langkah 10: perulangan while
Langkah 11 sampai 18 diulang selama $Q$ masih berisi simpul. Jika $Q$ sudah kosong, perulangan berhenti dan prosedur BFS selesai.

::slide Langkah 11: ambil dari antrean
$u$ adalah simpul yang dikeluarkan dari $Q$ dengan aturan FIFO, yaitu simpul yang sudah paling lama menunggu.

::slide Langkah 12: tetangga u
Perulangan *for* berlaku untuk setiap simpul $v$ anggota $G.Adj[u]$, sesuai urutan *adjacency-list*. Selama masih ada $v$ yang belum diperiksa, lanjut ke langkah 13. Jika tetangga sudah habis, perulangan *for* selesai dan lanjut ke langkah 18.

::slide Langkah 13: hanya simpul WHITE
Jika $v$ berwarna WHITE, jalankan langkah 14 sampai 17. Jika $v$ tidak WHITE (artinya sudah pernah ditemukan), simpul itu dilewati dan perulangan kembali ke langkah 12 untuk tetangga berikutnya.

::slide Langkah 14: warna GRAY
Simpul $v$ yang baru ditemukan diberi warna GRAY.

::slide Langkah 15: jarak v
$v.d = u.d + 1$. Jarak $v$ adalah jarak $u$ ditambah satu busur, yaitu busur $(u, v)$.

::slide Langkah 16: induk v
$v.\pi = u$. Simpul $v$ ditemukan lewat $u$, jadi $u$ adalah induk $v$.

::slide Langkah 17: masuk antrean
ENQUEUE$(Q, v)$ memasukkan $v$ ke belakang antrean, lalu perulangan kembali ke langkah 12.

::slide Langkah 18: warna BLACK
Langkah ini dijalankan setelah perulangan *for* di langkah 12 selesai. Simpul $u$ diberi warna BLACK karena semua tetangganya sudah diperiksa. Setelah itu kembali ke langkah 10.
:::

:::quiz Cek pemahaman: prosedur BFS
::question Apa warna simpul awal $s$ setelah langkah 5, dan apa isi $Q$ setelah langkah 9?
- [ ] WHITE, dan $Q$ kosong
- [x] GRAY, dan $Q$ berisi $s$
- [ ] BLACK, dan $Q$ berisi $s$
::explain
Langkah 5 memberi $s$ warna GRAY, dan langkah 9 memasukkannya ke $Q$. Warna BLACK baru diberikan di langkah 18, setelah semua tetangganya diperiksa.
::question Simpul $u$ dikeluarkan dari $Q$ pada langkah 11. Nilai $v.d$ pada langkah 15 adalah...
- [ ] $u.d - 1$
- [x] $u.d + 1$
- [ ] $0$
::explain
Simpul $v$ ditemukan lewat busur $(u, v)$, jadi satu busur lebih jauh dari $s$ dibandingkan $u$: $v.d = u.d + 1$.
::question Mengapa langkah 13 hanya memproses simpul $v$ yang berwarna WHITE?
- [ ] Karena simpul WHITE selalu yang paling dekat
- [x] Karena simpul yang bukan WHITE sudah pernah ditemukan dan tidak boleh masuk antrean dua kali
- [ ] Karena simpul GRAY dan BLACK tidak punya tetangga
::explain
Warna selain WHITE menandakan simpul itu sudah ditemukan. Memasukkannya lagi akan membuat jaraknya ditimpa dengan nilai yang tidak lebih kecil, dan simpul diproses berulang kali.
::question Kapan perulangan *while* di langkah 10 berhenti?
- [ ] Setelah $\lvert V \rvert$ kali putaran, apa pun yang terjadi
- [x] Ketika $Q$ kosong
- [ ] Ketika semua simpul berwarna GRAY
::explain
Perulangan berjalan selama $Q \neq \emptyset$. Saat $Q$ kosong, tidak ada lagi simpul GRAY yang menunggu untuk diproses.
:::

## E. Contoh Penelusuran

Diberikan graf $G = (V, E)$ dengan 8 simpul $r, s, t, u, v, w, x, y$ dan 10 busur tak berarah: $r$-$s$, $r$-$v$, $s$-$w$, $t$-$u$, $t$-$w$, $t$-$x$, $u$-$x$, $u$-$y$, $w$-$x$, dan $x$-$y$. Graf ini tergambar pada panel (a) tiap gambar di bawah, dengan $r, s, t, u$ di baris atas dan $v, w, x, y$ di baris bawah.

Tentukan lintasan dari simpul $s$ ke simpul-simpul lain dengan prosedur BFS$(G, s)$.

### Adjacency-list masukan

Sebelum menjalankan BFS, graf dinyatakan dalam bentuk *adjacency-list* berikut. Urutan isi tiap daftar menentukan urutan simpul masuk antrean.

| Simpul $u$ | $Adj[u]$ |
| --- | --- |
| $s$ | $w, r$ |
| $r$ | $s, v$ |
| $t$ | $u, w, x$ |
| $u$ | $t, x, y$ |
| $v$ | $r$ |
| $w$ | $s, t, x$ |
| $x$ | $t, u, y, w$ |
| $y$ | $x, u$ |

### Penelusuran Gambar 3

Gambar 3 menunjukkan graf setelah tiap tahap. Angka di dalam lingkaran adalah $u.d$. Simpul putih adalah WHITE, simpul abu-abu adalah GRAY, dan simpul hitam adalah BLACK. Garis abu-abu yang tebal menandai busur pohon BFS, yaitu busur dari $v.\pi$ ke $v$. Isi $Q$ digambar di samping graf, dengan jarak masing-masing simpul tertulis di bawahnya.

Panel (a) adalah hasil langkah 1 sampai 9. Panel (b) sampai (i) adalah hasil tiap putaran *while* (langkah 10 sampai 18). Pada awal tiap putaran, jika langkah 10 bernilai *true* maka lanjut ke langkah 11. Jika bernilai *false* maka prosedur BFS selesai.

:::steps Gambar 3: graf dan Q pada tiap tahap
::slide (a) Setelah langkah 1 sampai 9
Hanya $s$ yang berwarna GRAY dengan $s.d = 0$. Simpul lain WHITE dengan jarak $\infty$. $Q$ berisi $s$ saja.

![Gambar 3(a). Graf dengan simpul r, s, t, u di baris atas dan v, w, x, y di baris bawah. Simpul s berwarna abu-abu berjarak 0, simpul lainnya putih berjarak tak hingga. Antrean Q berisi s dengan jarak 0.](/materi/graph-bfs/bfs-a.png)

::slide (b) Putaran 1: u = s
$s$ keluar dari $Q$. $Adj[s] = \{w, r\}$, dan keduanya WHITE, jadi $w$ lalu $r$ masuk $Q$ dengan jarak 1 dan induk $s$. Setelah itu $s$ menjadi BLACK.

![Gambar 3(b). Simpul s hitam berjarak 0. Simpul r dan w abu-abu berjarak 1, dihubungkan ke s dengan garis tebal. Antrean Q dari depan ke belakang: w dengan jarak 1, r dengan jarak 1.](/materi/graph-bfs/bfs-b.png)

::slide (c) Putaran 2: u = w
$w$ keluar dari $Q$. $Adj[w] = \{s, t, x\}$. Simpul $s$ sudah BLACK, jadi dilewati. Simpul $t$ dan $x$ masih WHITE, jadi masuk $Q$ dengan jarak 2 dan induk $w$. Setelah itu $w$ menjadi BLACK.

![Gambar 3(c). Simpul s dan w hitam. Simpul r abu-abu berjarak 1, simpul t dan x abu-abu berjarak 2 dengan garis tebal ke w. Antrean Q: r dengan jarak 1, t dengan jarak 2, x dengan jarak 2.](/materi/graph-bfs/bfs-c.png)

::slide (d) Putaran 3: u = r
$r$ keluar dari $Q$. $Adj[r] = \{s, v\}$. Simpul $s$ sudah BLACK, jadi dilewati. Simpul $v$ WHITE, jadi masuk $Q$ dengan jarak 2 dan induk $r$. Setelah itu $r$ menjadi BLACK.

![Gambar 3(d). Simpul r, s, dan w hitam. Simpul v, t, dan x abu-abu berjarak 2. Antrean Q: t dengan jarak 2, x dengan jarak 2, v dengan jarak 2.](/materi/graph-bfs/bfs-d.png)

::slide (e) Putaran 4: u = t
$t$ keluar dari $Q$. $Adj[t] = \{u, w, x\}$. Simpul $u$ WHITE, jadi masuk $Q$ dengan jarak 3 dan induk $t$. Simpul $w$ sudah BLACK dan $x$ sudah GRAY, jadi keduanya dilewati. Setelah itu $t$ menjadi BLACK.

![Gambar 3(e). Simpul r, s, t, dan w hitam. Simpul v dan x abu-abu berjarak 2, simpul u abu-abu berjarak 3 dengan garis tebal ke t. Antrean Q: x dengan jarak 2, v dengan jarak 2, u dengan jarak 3.](/materi/graph-bfs/bfs-e.png)

::slide (f) Putaran 5: u = x
$x$ keluar dari $Q$. $Adj[x] = \{t, u, y, w\}$. Simpul $t$ dan $w$ sudah BLACK, dan $u$ sudah GRAY, jadi ketiganya dilewati. Simpul $y$ WHITE, jadi masuk $Q$ dengan jarak 3 dan induk $x$. Setelah itu $x$ menjadi BLACK.

![Gambar 3(f). Simpul r, s, t, w, dan x hitam. Simpul v abu-abu berjarak 2, simpul u dan y abu-abu berjarak 3 dengan garis tebal dari y ke x. Antrean Q: v dengan jarak 2, u dengan jarak 3, y dengan jarak 3.](/materi/graph-bfs/bfs-f.png)

::slide (g) Putaran 6: u = v
$v$ keluar dari $Q$. $Adj[v] = \{r\}$, dan $r$ sudah BLACK, jadi tidak ada simpul baru. $v$ menjadi BLACK.

![Gambar 3(g). Simpul r, s, t, v, w, dan x hitam. Simpul u dan y abu-abu berjarak 3. Antrean Q: u dengan jarak 3, y dengan jarak 3.](/materi/graph-bfs/bfs-g.png)

::slide (h) Putaran 7: u = u
$u$ keluar dari $Q$. $Adj[u] = \{t, x, y\}$. Simpul $t$ dan $x$ sudah BLACK dan $y$ sudah GRAY, jadi tidak ada simpul baru. $u$ menjadi BLACK.

![Gambar 3(h). Semua simpul hitam kecuali y yang abu-abu berjarak 3. Antrean Q berisi y dengan jarak 3.](/materi/graph-bfs/bfs-h.png)

::slide (i) Putaran 8: u = y
$y$ keluar dari $Q$. $Adj[y] = \{x, u\}$, dan keduanya sudah BLACK, jadi tidak ada simpul baru. $y$ menjadi BLACK. Sekarang $Q$ kosong, langkah 10 bernilai *false*, dan prosedur selesai.

![Gambar 3(i). Semua simpul hitam. Jaraknya: s 0, r 1, w 1, t 2, x 2, v 2, u 3, y 3. Antrean Q kosong.](/materi/graph-bfs/bfs-i.png)
:::

Tabel berikut meringkas delapan putaran itu. Kolom terakhir menunjukkan isi $Q$ dari depan ke belakang setelah putaran selesai.

| Putaran | $u$ | Simpul baru (induk $u$) | $Q$ sesudahnya |
| --- | --- | --- | --- |
| Awal | | | $s$ |
| 1 | $s$ | $w$ (jarak 1), $r$ (jarak 1) | $w, r$ |
| 2 | $w$ | $t$ (jarak 2), $x$ (jarak 2) | $r, t, x$ |
| 3 | $r$ | $v$ (jarak 2) | $t, x, v$ |
| 4 | $t$ | $u$ (jarak 3) | $x, v, u$ |
| 5 | $x$ | $y$ (jarak 3) | $v, u, y$ |
| 6 | $v$ | tidak ada | $u, y$ |
| 7 | $u$ | tidak ada | $y$ |
| 8 | $y$ | tidak ada | kosong |

### Hasil Lintasan

Nilai akhir tiap simpul adalah sebagai berikut.

| Simpul | $v.d$ | $v.\pi$ | Lintasan dari $s$ | Panjang |
| --- | --- | --- | --- | --- |
| $r$ | 1 | $s$ | $s \rightarrow r$ | 1 |
| $t$ | 2 | $w$ | $s \rightarrow w \rightarrow t$ | 2 |
| $u$ | 3 | $t$ | $s \rightarrow w \rightarrow t \rightarrow u$ | 3 |
| $v$ | 2 | $r$ | $s \rightarrow r \rightarrow v$ | 2 |
| $w$ | 1 | $s$ | $s \rightarrow w$ | 1 |
| $x$ | 2 | $w$ | $s \rightarrow w \rightarrow x$ | 2 |
| $y$ | 3 | $x$ | $s \rightarrow w \rightarrow x \rightarrow y$ | 3 |

Lintasan didapat dengan menelusuri $\pi$ **mundur** dari simpul tujuan sampai ke $s$. Misalnya untuk $y$: $y.\pi = x$, $x.\pi = w$, $w.\pi = s$, sehingga lintasannya $s \rightarrow w \rightarrow x \rightarrow y$. Panjangnya sama dengan $y.d = 3$.

Lintasan ini adalah lintasan **dengan busur paling sedikit**. Pada graf tak berbobot seperti ini, itu sama dengan lintasan terpendek. Untuk graf berbobot, lintasan terpendek dicari dengan algoritma lain, yaitu Dijkstra dan Bellman-Ford di materi 13.

:::quiz Cek pemahaman: penelusuran
::question Setelah putaran 1 ($u = s$), apa isi $Q$ dari depan ke belakang?
- [ ] $r, w$
- [x] $w, r$
- [ ] $s, w, r$
::explain
$Adj[s]$ ditulis $w, r$, jadi $w$ ditemukan lebih dulu dan masuk antrean lebih dulu. Simpul $s$ sudah keluar dari $Q$ di langkah 11, jadi tidak ada lagi di $Q$.
::question Berapa nilai $u.d$ untuk simpul $u$ pada contoh ini?
- [ ] 2
- [x] 3
- [ ] 4
::explain
Lintasan terpendek ke $u$ adalah $s \rightarrow w \rightarrow t \rightarrow u$, tiga busur. Simpul $u$ ditemukan di putaran 4, saat $t$ ($t.d = 2$) diproses, sehingga $u.d = 2 + 1 = 3$.
::question Pada putaran 5 ($u = x$), mengapa simpul $t$ tidak masuk $Q$ lagi?
- [ ] Karena $t$ bukan tetangga $x$
- [x] Karena $t$ sudah BLACK, jadi bukan WHITE di langkah 13
- [ ] Karena $Q$ sudah penuh
::explain
$t$ adalah tetangga $x$, tetapi $t$ sudah diproses di putaran 4 dan berwarna BLACK. Langkah 13 hanya memasukkan simpul WHITE.
::question Berapa kali perulangan *while* (langkah 10 sampai 18) dijalankan pada contoh ini?
- [ ] 7 kali
- [x] 8 kali
- [ ] 10 kali
::explain
Tiap simpul masuk $Q$ tepat sekali dan keluar sekali, dan ada 8 simpul yang terjangkau dari $s$. Jadi perulangan berjalan 8 kali, sama dengan banyaknya panel (b) sampai (i).
::question Jika kita ingin lintasan dari $s$ ke $y$, simpul mana yang dilewati sebelum $y$?
- [ ] $u$
- [x] $x$
- [ ] $t$
::explain
$y.\pi = x$, jadi $y$ ditemukan lewat $x$. Lintasannya $s \rightarrow w \rightarrow x \rightarrow y$.
:::

## F. Analisis Running Time

Waktu yang dibutuhkan BFS dihitung dalam $\lvert V \rvert$ (banyak simpul) dan $\lvert E \rvert$ (banyak busur). Dalam notasi $O$, $\lvert V \rvert$ ditulis $V$ dan $\lvert E \rvert$ ditulis $E$.

:::steps Menghitung running time BFS
::slide Inisialisasi: langkah 1 sampai 9
Langkah 1 sampai 4 mengunjungi tiap simpul satu kali, dan langkah 5 sampai 9 hanya beberapa baris yang masing-masing butuh waktu konstan. Jadi inisialisasi membutuhkan waktu $O(V)$.

::slide ENQUEUE dan DEQUEUE
Sebuah simpul hanya masuk antrean ketika berwarna WHITE, dan langsung berubah menjadi GRAY. Karena itu tiap simpul masuk $Q$ **paling banyak satu kali**, dan keluar paling banyak satu kali. ENQUEUE dan DEQUEUE masing-masing $O(1)$, sehingga seluruh operasi antrean memberi total $O(V)$.

::slide Menelusuri adjacency-list
$Adj[u]$ dibaca (langkah 12) hanya ketika $u$ keluar dari $Q$, dan itu terjadi sekali untuk tiap simpul. Jumlah panjang seluruh *adjacency-list* adalah $\lvert E \rvert$ pada graf berarah, atau $2 \lvert E \rvert$ pada graf tak berarah. Jadi seluruh pembacaan daftar tetangga memberi waktu $O(E)$.

::slide Total
Langkah 10 sampai 18 membutuhkan $O(V) + O(E)$, dan inisialisasi membutuhkan $O(V)$. Jumlahnya adalah running time BFS:

$$
O(V + E)
$$

Waktu ini **linier** terhadap ukuran graf yang direpresentasikan sebagai *adjacency-list*.
:::

Dokumen menulis jumlah panjang seluruh *adjacency-list* "sebanyak *edge*". Untuk graf tak berarah sebenarnya $2 \lvert E \rvert$, seperti pada Gambar 1. Hasil akhirnya tidak berubah, karena $O(2E) = O(E)$.

:::quiz Cek pemahaman: running time BFS
::question Mengapa tiap simpul masuk antrean paling banyak satu kali?
- [ ] Karena antrean hanya muat $\lvert V \rvert$ simpul
- [x] Karena hanya simpul WHITE yang dimasukkan, dan simpul itu langsung menjadi GRAY
- [ ] Karena simpul BLACK dihapus dari graf
::explain
Setelah masuk antrean, warna simpul bukan WHITE lagi, sehingga langkah 13 tidak akan memasukkannya untuk kedua kalinya.
::question Apa running time BFS dengan masukan *adjacency-list*?
- [ ] $O(V^2)$
- [x] $O(V + E)$
- [ ] $O(E^2)$
::explain
Waktu inisialisasi dan operasi antrean masing-masing $O(V)$, dan pembacaan seluruh *adjacency-list* $O(E)$. Jumlahnya $O(V + E)$.
::question Bagian mana dari BFS yang menyumbang $O(E)$?
- [ ] Inisialisasi di langkah 1 sampai 9
- [ ] ENQUEUE dan DEQUEUE
- [x] Pembacaan seluruh *adjacency-list* di langkah 12
::explain
Tiap daftar $Adj[u]$ dibaca sekali, dan jumlah panjang semua daftar itu sebanding dengan $\lvert E \rvert$.
:::

## G. Mencoba Visualisasi

Visualisasi di bawah ini menjalankan BFS pada graf, lalu menampilkan juga BFS pada pohon biner sebagai kasus khusus. Pada graf, tiap langkah menyorot baris kode, mewarnai simpul, dan menunjukkan isi antrean serta urutan kunjungan.

Beberapa hal agar tidak bingung membandingkan dengan materi:

- Simpul pada visualisasi **bernomor 0 sampai $n - 1$**, bukan berhuruf seperti $r, s, t, \ldots$ dan indeks mulai dari 0. Kodenya berbentuk JavaScript, jadi nomor barisnya berbeda dari pseudocode di bagian D.
- Kode visualisasi tidak memakai tiga warna dan tidak menghitung $u.d$ maupun $u.\pi$. Ia memakai larik `dikunjungi` yang bernilai `true` begitu simpul masuk antrean (setara dengan WHITE menjadi GRAY), dan hanya mencatat **urutan kunjungan**. Simpul yang sedang diproses (baru keluar dari antrean) tetap GRAY di materi, dan simpul yang sudah selesai setara dengan BLACK.
- Tetangga selalu diperiksa dari yang **bernomor lebih kecil**. Pada materi, urutannya mengikuti *adjacency-list*, misalnya $Adj[s] = w, r$. Karena itu, untuk meniru contoh bagian E, nomor simpulnya perlu dipilih agar urutan tetangganya sama.
- Contoh bagian E dapat dicoba di panel "Ubah masukan" dengan pemetaan $s = 0$, $w = 1$, $r = 2$, $t = 3$, $x = 4$, $v = 5$, $u = 6$, $y = 7$. Isilah jumlah simpul 8, sisi `0-1, 0-2, 1-3, 1-4, 2-5, 3-4, 3-6, 4-6, 4-7, 6-7`, dan simpul awal 0. Urutan kunjungannya 0, 1, 2, 3, 4, 5, 6, 7, yaitu $s, w, r, t, x, v, u, y$, sama dengan urutan simpul keluar dari $Q$ di Gambar 3.
- Tombol "Acak" dan contoh siap pakai juga ada di panel "Ubah masukan". Graf boleh tidak terhubung, dan simpul yang tidak terjangkau dari simpul awal tidak ikut dikunjungi.

::visualizer

## H. Rangkuman

| Hal | Isi |
| --- | --- |
| Graf | $G = (V, E)$, bisa berarah atau tak berarah |
| *Adjacency-list* | *Array* $Adj$: $Adj[u]$ berisi tetangga $u$. Ruang $O(V + E)$ |
| *Adjacency-matrix* | Matriks $\lvert V \rvert \times \lvert V \rvert$ berisi 0 dan 1. Ruang $\Theta(V^2)$ |
| BFS$(G, s)$ | Menelusuri graf per lapisan jarak dari simpul awal $s$, memakai antrean FIFO |
| Warna simpul | WHITE (belum ditemukan), GRAY (di antrean), BLACK (selesai) |
| Atribut | $u.d$ jarak dari $s$, $u.\pi$ induk, $u.color$ warna |
| Hasil | Lintasan dari $s$ dengan jumlah busur paling sedikit, diperoleh dengan menelusuri $\pi$ mundur |
| Contoh | Dari $s$: $r$ dan $w$ berjarak 1, $t, v, x$ berjarak 2, $u$ dan $y$ berjarak 3 |
| Running time | $O(V + E)$ |

Cara cepat mengingat: **ambil dari depan antrean, tandai tetangga baru, masukkan ke belakang antrean, ulangi sampai antrean kosong**. Sekarang coba kerjakan soal challenge di bawah.

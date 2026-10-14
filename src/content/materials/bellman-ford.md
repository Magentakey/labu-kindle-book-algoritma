## A. Masalah Single-Source Shortest Path

Daftar pustaka: Cormen, *Introduction to Algorithms*, halaman 643 sampai 654. Bila diberikan graf **berarah** berbobot $G = (V, E)$, tujuan masalah ***Single-Source Shortest Path*** (lintasan terpendek dari satu sumber) adalah mencari lintasan terpendek dari satu simpul sumber (*source vertex*) $s \in V$ ke setiap simpul $v \in V$.

Kata "terpendek" di sini berarti **total bobot sisi pada lintasan paling kecil**, bukan paling sedikit sisinya. Bobot sebuah lintasan adalah jumlah bobot sisi yang dilewatinya.

Contoh di bagian ini memakai graf berarah berbobot dengan 5 simpul ($s$, $t$, $x$, $y$, $z$) dan 10 sisi. Angka di samping panah adalah bobot sisi. Permasalahannya: bagaimana mendapatkan lintasan terpendek dari $s$ ke $t$, $x$, $y$, dan $z$.

![Graf berarah berbobot dengan simpul s, t, x, y, dan z. Sisi dan bobotnya: s ke t 3, s ke y 5, t ke x 6, t ke y 2, y ke t 1, y ke x 4, y ke z 6, x ke z 2, z ke x 7, dan z ke s 3.](/materi/bellman-ford/graf-sssp.png)

Dengan menghitung bobot semua lintasan yang mungkin, hasilnya dapat digambar sebagai graf yang sisi lintasannya ditebalkan. Gambar (a) dan (b) di bawah adalah dua contoh. Angka di dalam simpul adalah bobot lintasan terpendek dari $s$ ke simpul itu.

![Gambar (a): pohon lintasan terpendek dari s. Nilai: s = 0, t = 3, x = 9, y = 5, z = 11. Sisi tebal: s ke t, t ke x, s ke y, dan y ke z.](/materi/bellman-ford/lintasan-a.png)

![Gambar (b): pohon lintasan terpendek lain dari s dengan nilai yang sama: s = 0, t = 3, x = 9, y = 5, z = 11. Sisi tebal: s ke t, t ke y, y ke x, dan x ke z.](/materi/bellman-ford/lintasan-b.png)

| Tujuan | Lintasan pada (a) | Lintasan pada (b) | Total bobot |
| --- | --- | --- | --- |
| $t$ | $s \to t$ | $s \to t$ | 3 |
| $x$ | $s \to t \to x$ | $s \to t \to y \to x$ | 9 |
| $y$ | $s \to y$ | $s \to t \to y$ | 5 |
| $z$ | $s \to y \to z$ | $s \to t \to y \to x \to z$ | 11 |

Perhatikan bahwa total bobot untuk tiap tujuan **sama** pada (a) dan (b), hanya lintasannya yang berbeda. Jadi lintasan terpendek tidak selalu unik, tetapi bobot terpendeknya selalu sama. Pada graf ini sebenarnya ada lebih dari dua lintasan sama pendek: ke $x$ ada tiga ($s \to t \to x$, $s \to t \to y \to x$, dan $s \to y \to x$, semuanya berbobot 9), dan ke $z$ ada lima, sehingga (a) dan (b) hanyalah dua contoh yang sah.

Graf sekecil ini masih bisa dihitung dengan mendaftar semua lintasan. Pada graf besar jumlah lintasannya sangat banyak, sehingga permasalahan sebenarnya adalah **mendapatkan lintasan terpendek tanpa menghitung bobot semua kemungkinan lintasan**. Ada dua algoritma untuk itu:

| Hal | Algoritma Bellman-Ford | Algoritma Dijkstra |
| --- | --- | --- |
| Bobot sisi negatif | Boleh | Tidak boleh |
| Dibahas di | Materi 13.1 (materi ini) | Materi 13.2 |

:::quiz Cek pemahaman: masalah lintasan terpendek
::question Apa arti "lintasan terpendek" pada graf berarah berbobot?
- [ ] Lintasan dengan sisi paling sedikit
- [x] Lintasan dengan total bobot sisi paling kecil
- [ ] Lintasan yang melewati simpul paling sedikit
::explain
Yang dibandingkan adalah jumlah bobot sisi pada lintasan, bukan banyaknya sisi atau simpul. Lintasan terpendek adalah yang jumlah bobotnya minimum.
::question Pada contoh, berapa bobot lintasan terpendek dari $s$ ke $z$?
- [ ] 9
- [ ] 8
- [x] 11
::explain
Pada gambar (a), $s \to y \to z$ berbobot $5 + 6 = 11$. Pada gambar (b), $s \to t \to y \to x \to z$ berbobot $3 + 2 + 4 + 2 = 11$. Lintasannya berbeda, bobotnya sama.
::question Mengapa gambar (a) dan (b) berbeda padahal keduanya menunjukkan lintasan terpendek dari $s$?
- [x] Karena ada lebih dari satu lintasan dengan bobot terpendek yang sama, dan masing-masing gambar memilih salah satunya
- [ ] Karena salah satu gambar pasti salah hitung
- [ ] Karena graf (b) memiliki sisi tambahan
::explain
Lintasan terpendek tidak harus unik. Selama bobotnya sama-sama minimum, beberapa lintasan boleh sama baiknya.
::question Algoritma yang membolehkan sisi bernilai negatif adalah...
- [ ] Dijkstra
- [x] Bellman-Ford
- [ ] Keduanya
::explain
Bellman-Ford membolehkan bobot sisi negatif. Dijkstra (materi 13.2) tidak memperbolehkan bobot negatif.
:::

## B. Algoritma Bellman-Ford

Algoritma ***Bellman-Ford*** mencari lintasan terpendek dari satu sumber dan **membolehkan sisi (*edge*) berbobot negatif**. Hasil akhirnya berupa nilai logika:

- `return TRUE` bila pada graf **tidak** terdapat siklus (*cycle*) bernilai negatif yang dapat dicapai dari $s$. Artinya algoritma berhasil mendapatkan lintasan terpendek dari $s$ ke setiap simpul $v \in V$.
- `return FALSE` bila pada graf terdapat siklus bernilai negatif. Artinya tidak didapatkan lintasan terpendek dari $s$ ke setiap simpul.

### Siklus bernilai negatif dan positif

Siklus adalah lintasan tertutup, dan bobotnya adalah jumlah bobot sisi pada siklus itu. Pada graf berikut, siklus $c \to d \to c$ berbobot $6 + (-3) = 3$ sehingga **positif**, sedangkan siklus $e \to f \to e$ berbobot $3 + (-6) = -3$ sehingga **negatif**.

![Graf berarah dengan sumber s dan simpul tujuan g. Sisi dan bobotnya: s ke a 3, a ke b −4, b ke g 4, s ke c 5, c ke d 6, d ke c −3, d ke g 8, s ke e 2, e ke f 3, f ke e −6, dan f ke g 7. Siklus c, d, c berbobot 3 (positif) dan siklus e, f, e berbobot −3 (negatif).](/materi/bellman-ford/siklus.png)

Siklus positif tidak mengganggu: memutarinya hanya menambah bobot, sehingga lintasan terpendek tidak pernah memakainya. Siklus negatif berbahaya: tiap kali memutarinya, bobot lintasan turun lagi. Bila siklus negatif dapat dicapai dari $s$, bobot lintasan ke simpul sesudahnya dapat diturunkan terus-menerus, sehingga **tidak ada lintasan terpendek**. Itulah yang dilaporkan Bellman-Ford dengan `return FALSE`.

### Pseudocode

Bellman-Ford memakai dua prosedur bantu, INITIALIZE-SINGLE-SOURCE dan RELAX. Berikut bentuk lengkapnya.

```pseudocode
INITIALIZE-SINGLE-SOURCE(G, s)
for i = 1 to |G.V| − 1
    for each edge (u, v) ∈ G.E
        RELAX(u, v, w)
for each edge (u, v) ∈ G.E
    if v.d > u.d + w(u, v)
        return FALSE
return TRUE
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

Blok pertama adalah BELLMAN-FORD$(G, w, s)$ dengan 8 baris, blok kedua adalah INITIALIZE-SINGLE-SOURCE$(G, s)$ dengan 4 baris, dan blok ketiga adalah RELAX$(u, v, w)$ dengan 3 baris. $G$ adalah graf berarah berbobot dengan himpunan simpul $V$ dan himpunan sisi $E$, $w$ adalah bobot sisi, dan $s$ adalah simpul sumber.

| Notasi | Arti |
| --- | --- |
| $v.d$ | Perkiraan bobot lintasan terpendek dari $s$ ke $v$ yang diketahui sejauh ini |
| $v.\pi$ | *Predecessor* (induk) dari $v$ pada lintasan itu, atau NIL bila belum ada |
| $w(u,v)$ | Bobot sisi dari $u$ ke $v$ |

:::steps Arti tiap langkah BELLMAN-FORD
::slide Langkah 1: INITIALIZE-SINGLE-SOURCE
Memanggil INITIALIZE-SINGLE-SOURCE$(G, s)$. Hasil baris 1 sampai 4 prosedur itu: semua simpul bernilai tak hingga ($v.d = \infty$), semua simpul belum punya *predecessor* ($v.\pi = \text{NIL}$), dan sumber bernilai nol ($s.d = 0$).

::slide Langkah 2: ulangi |V| − 1 kali
Langkah 3 dan 4 diulang sebanyak jumlah simpul dikurangi satu ($\lvert G.V \rvert - 1$), dengan $i = 1, 2, \dots$. Satu putaran ini disebut *loop*.

Penjelasan tambahan dari Cormen (tidak ada di dokumen dosen): lintasan terpendek yang tidak memuat siklus punya paling banyak $\lvert V \rvert - 1$ sisi. Setelah loop ke-$i$, nilai $v.d$ sudah paling kecil untuk semua lintasan yang memakai paling banyak $i$ sisi, sehingga setelah $\lvert V \rvert - 1$ loop semua lintasan terpendek sudah benar.

::slide Langkah 3 dan 4: RELAX untuk tiap sisi
Pada tiap loop, untuk setiap sisi $(u,v) \in G.E$ dipanggil RELAX$(u,v,w)$. Urutan sisi **bebas**, ditentukan lebih dulu, dan urutan yang sama dipakai di setiap loop.

::slide Prosedur RELAX
Baris 1 membandingkan nilai $v$ dengan nilai $u$ ditambah bobot sisi $(u,v)$. Bila $v.d > u.d + w(u,v)$ (*true*), lintasan ke $v$ lewat $u$ lebih murah, sehingga nilai $v$ yang lama diganti menjadi $u.d + w(u,v)$ (baris 2) dan *predecessor* $v$ menjadi $u$ (baris 3). Bila *false*, tidak ada yang berubah.

Bila $u.d = \infty$, maka $u.d + w(u,v) = \infty$ dan tidak pernah lebih kecil dari $v.d$, jadi sisi dari simpul yang belum terjangkau tidak mengubah apa pun.

::slide Langkah 5 sampai 7: periksa siklus negatif
Sesudah semua loop, untuk setiap sisi $(u,v)$ diselidiki apakah masih ada $v.d > u.d + w(u,v)$ (langkah 6). Bila *true* untuk satu sisi saja, jalankan langkah 7: `return FALSE`, artinya ada siklus bernilai negatif dan lintasan terpendek tidak didapat. Bila *false*, perulangan kembali ke langkah 5 untuk sisi berikutnya.

::slide Langkah 8: return TRUE
Bila semua sisi memberi *false* pada langkah 6, setelah *end for* pada langkah 5 dijalankan langkah 8: `return TRUE`. Artinya tidak ada siklus bernilai negatif, dan Bellman-Ford berhasil mendapatkan lintasan terpendek dari $s$ ke setiap simpul $v \in V$.
:::

:::quiz Cek pemahaman: algoritma Bellman-Ford
::question Graf berarah punya 5 simpul. Berapa kali langkah 3 dan 4 diulang?
- [ ] 5 kali
- [x] 4 kali
- [ ] 10 kali
::explain
Perulangan pada langkah 2 berjalan dari $i = 1$ sampai $\lvert G.V \rvert - 1 = 4$, jadi ada 4 loop.
::question Setelah INITIALIZE-SINGLE-SOURCE$(G, s)$, berapa nilai $v.d$ untuk simpul $v \ne s$?
- [ ] 0
- [x] $\infty$
- [ ] NIL
::explain
Semua simpul diberi $v.d = \infty$, kecuali sumber yang diberi $s.d = 0$. NIL adalah nilai awal $v.\pi$, bukan $v.d$.
::question RELAX$(u,v,w)$ mengubah $v.d$ bila...
- [ ] $v.d < u.d + w(u,v)$
- [x] $v.d > u.d + w(u,v)$
- [ ] $u.d > v.d$
::explain
Bila $v.d$ lebih besar daripada $u.d + w(u,v)$, ada lintasan yang lebih murah ke $v$ lewat $u$, sehingga $v.d$ diganti dan $v.\pi$ menjadi $u$.
::question Sisi $(a,b)$ berbobot 4 dan sisi $(b,a)$ berbobot $-7$. Siklus $a \to b \to a$ bernilai...
- [ ] Positif, bobotnya 11
- [x] Negatif, bobotnya $-3$
- [ ] Nol
::explain
Bobot siklus adalah jumlah bobot sisinya: $4 + (-7) = -3$. Hasilnya negatif.
::question Bellman-Ford mengembalikan FALSE. Apa artinya?
- [ ] Sumber tidak bisa mencapai simpul mana pun
- [x] Ada siklus bernilai negatif, sehingga lintasan terpendek tidak didapat
- [ ] Semua sisi berbobot positif
::explain
Langkah 7 (`return FALSE`) dijalankan bila setelah semua loop masih ada sisi dengan $v.d > u.d + w(u,v)$. Itu tanda ada siklus negatif yang terjangkau dari $s$.
:::

## C. Contoh Bellman-Ford

Diberikan graf berarah berbobot $G = (V, E)$ berikut. Apa hasil algoritma Bellman-Ford dengan sumber $s$? Bila `return TRUE`, tuliskan lintasan terpendek dari $s$ ke simpul-simpul lain.

![Graf berarah berbobot dengan simpul s, t, x, y, dan z. Sisi dan bobotnya: s ke t 6, s ke y 7, t ke x 5, x ke t −2, t ke y 8, t ke z −4, y ke x −3, y ke z 9, z ke x 7, dan z ke s 2.](/materi/bellman-ford/contoh-graf.png)

Pada langkah 3, sisi diproses menurut urutan yang **bebas dan ditentukan terlebih dahulu**. Contoh ini memakai urutan berikut di setiap loop.

| No | Sisi $(u,v)$ | Bobot $w(u,v)$ |
| --- | --- | --- |
| 1 | $(t,x)$ | $5$ |
| 2 | $(t,y)$ | $8$ |
| 3 | $(t,z)$ | $-4$ |
| 4 | $(x,t)$ | $-2$ |
| 5 | $(y,x)$ | $-3$ |
| 6 | $(y,z)$ | $9$ |
| 7 | $(z,x)$ | $7$ |
| 8 | $(z,s)$ | $2$ |
| 9 | $(s,t)$ | $6$ |
| 10 | $(s,y)$ | $7$ |

### Penelusuran langkah demi langkah

Pada gambar tiap loop, angka di dalam simpul adalah $v.d$, sisi tebal abu-abu menunjukkan *predecessor* ($v.\pi = u$), dan simpul bergaris tebal adalah simpul yang nilainya baru berubah pada loop itu.

:::steps Penelusuran Bellman-Ford pada contoh
::slide Langkah 1: inisialisasi
INITIALIZE-SINGLE-SOURCE$(G, s)$ menghasilkan $s.d = 0$ dan $v.d = \infty$ untuk semua simpul lain. Semua *predecessor* NIL, jadi belum ada sisi tebal.

![Graf contoh setelah INITIALIZE-SINGLE-SOURCE. Nilai d: s = 0, t = ∞, x = ∞, y = ∞, z = ∞. Belum ada sisi tebal karena semua predecessor NIL.](/materi/bellman-ford/bf-00.png)

::slide Loop 1 (i = 1)
Langkah 2: $i = 1$. Langkah 3 dan 4: RELAX$(u,v,w)$ dijalankan untuk tiap sisi menurut urutan di atas.

| Sisi $(u,v)$ | $u.d + w(u,v)$ | $v.d$ sebelum | Kondisi RELAX baris 1 |
| --- | --- | --- | --- |
| $(t,x)$ | $\infty + 5 = \infty$ | $\infty$ | *false* |
| $(t,y)$ | $\infty + 8 = \infty$ | $\infty$ | *false* |
| $(t,z)$ | $\infty + (-4) = \infty$ | $\infty$ | *false* |
| $(x,t)$ | $\infty + (-2) = \infty$ | $\infty$ | *false* |
| $(y,x)$ | $\infty + (-3) = \infty$ | $\infty$ | *false* |
| $(y,z)$ | $\infty + 9 = \infty$ | $\infty$ | *false* |
| $(z,x)$ | $\infty + 7 = \infty$ | $\infty$ | *false* |
| $(z,s)$ | $\infty + 2 = \infty$ | $0$ | *false* |
| $(s,t)$ | $0 + 6 = 6$ | $\infty$ | *true*: $t.d = 6$, $t.\pi = s$ |
| $(s,y)$ | $0 + 7 = 7$ | $\infty$ | *true*: $y.d = 7$, $y.\pi = s$ |

Kondisi pada baris 1 RELAX bernilai *true* hanya untuk sisi $(s,t)$, dan $(s,y)$. Pada loop ini hanya sumber $s$ yang sudah punya jarak, dan sisi dari $s$ kebetulan berada di urutan paling akhir, jadi sisi lain masih membaca $\infty$.

Hasil loop 1: $s.d = 0$, $t.d = 6$, $x.d = \infty$, $y.d = 7$, $z.d = \infty$.

![Graf contoh setelah loop 1. Nilai d: s = 0, t = 6, x = ∞, y = 7, z = ∞. Sisi tebal (v.π = u): s→t, dan s→y.](/materi/bellman-ford/bf-01.png)

::slide Loop 2 (i = 2)
Langkah 2: $i = 2$. Langkah 3 dan 4: RELAX$(u,v,w)$ dijalankan untuk tiap sisi menurut urutan di atas.

| Sisi $(u,v)$ | $u.d + w(u,v)$ | $v.d$ sebelum | Kondisi RELAX baris 1 |
| --- | --- | --- | --- |
| $(t,x)$ | $6 + 5 = 11$ | $\infty$ | *true*: $x.d = 11$, $x.\pi = t$ |
| $(t,y)$ | $6 + 8 = 14$ | $7$ | *false* |
| $(t,z)$ | $6 + (-4) = 2$ | $\infty$ | *true*: $z.d = 2$, $z.\pi = t$ |
| $(x,t)$ | $11 + (-2) = 9$ | $6$ | *false* |
| $(y,x)$ | $7 + (-3) = 4$ | $11$ | *true*: $x.d = 4$, $x.\pi = y$ |
| $(y,z)$ | $7 + 9 = 16$ | $2$ | *false* |
| $(z,x)$ | $2 + 7 = 9$ | $4$ | *false* |
| $(z,s)$ | $2 + 2 = 4$ | $0$ | *false* |
| $(s,t)$ | $0 + 6 = 6$ | $6$ | *false* |
| $(s,y)$ | $0 + 7 = 7$ | $7$ | *false* |

Kondisi pada baris 1 RELAX bernilai *true* hanya untuk sisi $(t,x)$, $(t,z)$, dan $(y,x)$. Nilai $x.d$ berubah dua kali pada loop ini: dari $\infty$ menjadi 11 oleh $(t,x)$, lalu menjadi 4 oleh $(y,x)$ yang lebih murah.

Hasil loop 2: $s.d = 0$, $t.d = 6$, $x.d = 4$, $y.d = 7$, $z.d = 2$.

![Graf contoh setelah loop 2. Nilai d: s = 0, t = 6, x = 4, y = 7, z = 2. Sisi tebal (v.π = u): s→t, y→x, s→y, dan t→z.](/materi/bellman-ford/bf-02.png)

::slide Loop 3 (i = 3)
Langkah 2: $i = 3$. Langkah 3 dan 4: RELAX$(u,v,w)$ dijalankan untuk tiap sisi menurut urutan di atas.

| Sisi $(u,v)$ | $u.d + w(u,v)$ | $v.d$ sebelum | Kondisi RELAX baris 1 |
| --- | --- | --- | --- |
| $(t,x)$ | $6 + 5 = 11$ | $4$ | *false* |
| $(t,y)$ | $6 + 8 = 14$ | $7$ | *false* |
| $(t,z)$ | $6 + (-4) = 2$ | $2$ | *false* |
| $(x,t)$ | $4 + (-2) = 2$ | $6$ | *true*: $t.d = 2$, $t.\pi = x$ |
| $(y,x)$ | $7 + (-3) = 4$ | $4$ | *false* |
| $(y,z)$ | $7 + 9 = 16$ | $2$ | *false* |
| $(z,x)$ | $2 + 7 = 9$ | $4$ | *false* |
| $(z,s)$ | $2 + 2 = 4$ | $0$ | *false* |
| $(s,t)$ | $0 + 6 = 6$ | $2$ | *false* |
| $(s,y)$ | $0 + 7 = 7$ | $7$ | *false* |

Kondisi pada baris 1 RELAX bernilai *true* hanya untuk sisi $(x,t)$. Sisi $(x,t)$ bobotnya $-2$, jadi lintasan $s \to y \to x \to t$ lebih murah daripada $s \to t$ langsung: $4 + (-2) = 2 < 6$.

Hasil loop 3: $s.d = 0$, $t.d = 2$, $x.d = 4$, $y.d = 7$, $z.d = 2$.

![Graf contoh setelah loop 3. Nilai d: s = 0, t = 2, x = 4, y = 7, z = 2. Sisi tebal (v.π = u): x→t, y→x, s→y, dan t→z.](/materi/bellman-ford/bf-03.png)

::slide Loop 4 (i = 4)
Langkah 2: $i = 4$. Langkah 3 dan 4: RELAX$(u,v,w)$ dijalankan untuk tiap sisi menurut urutan di atas.

| Sisi $(u,v)$ | $u.d + w(u,v)$ | $v.d$ sebelum | Kondisi RELAX baris 1 |
| --- | --- | --- | --- |
| $(t,x)$ | $2 + 5 = 7$ | $4$ | *false* |
| $(t,y)$ | $2 + 8 = 10$ | $7$ | *false* |
| $(t,z)$ | $2 + (-4) = -2$ | $2$ | *true*: $z.d = -2$, $z.\pi = t$ |
| $(x,t)$ | $4 + (-2) = 2$ | $2$ | *false* |
| $(y,x)$ | $7 + (-3) = 4$ | $4$ | *false* |
| $(y,z)$ | $7 + 9 = 16$ | $-2$ | *false* |
| $(z,x)$ | $-2 + 7 = 5$ | $4$ | *false* |
| $(z,s)$ | $-2 + 2 = 0$ | $0$ | *false* |
| $(s,t)$ | $0 + 6 = 6$ | $2$ | *false* |
| $(s,y)$ | $0 + 7 = 7$ | $7$ | *false* |

Kondisi pada baris 1 RELAX bernilai *true* hanya untuk sisi $(t,z)$. Sisi $(t,z)$ bobotnya $-4$, jadi $z.d$ turun dari 2 menjadi $2 + (-4) = -2$. Perubahan ini baru mungkin karena $t.d$ sudah turun di loop 3.

Hasil loop 4: $s.d = 0$, $t.d = 2$, $x.d = 4$, $y.d = 7$, $z.d = -2$.

![Graf contoh setelah loop 4. Nilai d: s = 0, t = 2, x = 4, y = 7, z = −2. Sisi tebal (v.π = u): x→t, y→x, s→y, dan t→z.](/materi/bellman-ford/bf-04.png)

::slide Loop 5: end for
Nilai $i$ sudah melewati $\lvert G.V \rvert - 1 = 4$, sehingga perulangan *for* pada langkah 2 berakhir (*end for*) dan algoritma lanjut ke langkah 5.

::slide Langkah 5 sampai 8: periksa siklus negatif
Untuk setiap sisi menurut urutan yang sama, diperiksa apakah $v.d > u.d + w(u,v)$ (langkah 6). Dengan nilai akhir $s.d = 0$, $t.d = 2$, $x.d = 4$, $y.d = 7$, $z.d = -2$:

| Sisi $(u,v)$ | $u.d + w(u,v)$ | $v.d$ | $v.d > u.d + w(u,v)$? |
| --- | --- | --- | --- |
| $(t,x)$ | $2 + 5 = 7$ | $4$ | *false* |
| $(t,y)$ | $2 + 8 = 10$ | $7$ | *false* |
| $(t,z)$ | $2 + (-4) = -2$ | $-2$ | *false* |
| $(x,t)$ | $4 + (-2) = 2$ | $2$ | *false* |
| $(y,x)$ | $7 + (-3) = 4$ | $4$ | *false* |
| $(y,z)$ | $7 + 9 = 16$ | $-2$ | *false* |
| $(z,x)$ | $-2 + 7 = 5$ | $4$ | *false* |
| $(z,s)$ | $-2 + 2 = 0$ | $0$ | *false* |
| $(s,t)$ | $0 + 6 = 6$ | $2$ | *false* |
| $(s,y)$ | $0 + 7 = 7$ | $7$ | *false* |

Langkah 6 bernilai *false* untuk **semua** sisi, sehingga langkah 7 tidak pernah dijalankan. Setelah *end for* pada langkah 5, langkah 8 dijalankan: **`return TRUE`**.
:::

### Hasil penelusuran

Nilai $v.d$ setelah tiap loop pada contoh:

| Sesudah | $s.d$ | $t.d$ | $x.d$ | $y.d$ | $z.d$ |
| --- | --- | --- | --- | --- | --- |
| Langkah 1 (inisialisasi) | $0$ | $\infty$ | $\infty$ | $\infty$ | $\infty$ |
| Loop 1 | $0$ | $6$ | $\infty$ | $7$ | $\infty$ |
| Loop 2 | $0$ | $6$ | $4$ | $7$ | $2$ |
| Loop 3 | $0$ | $2$ | $4$ | $7$ | $2$ |
| Loop 4 | $0$ | $2$ | $4$ | $7$ | $-2$ |

Hasilnya `return TRUE`, artinya tidak ada siklus bernilai negatif yang terjangkau dari $s$. Lintasan terpendek diperoleh dengan menelusuri *predecessor* $v.\pi$ mundur dari $v$ sampai $s$:

| Tujuan | $v.d$ | $v.\pi$ | Lintasan terpendek dari $s$ | Perhitungan bobot |
| --- | --- | --- | --- | --- |
| $t$ | $2$ | $x$ | $s \to y \to x \to t$ | $7 + (-3) + (-2) = 2$ |
| $x$ | $4$ | $y$ | $s \to y \to x$ | $7 + (-3) = 4$ |
| $y$ | $7$ | $s$ | $s \to y$ | $7 = 7$ |
| $z$ | $-2$ | $t$ | $s \to y \to x \to t \to z$ | $7 + (-3) + (-2) + (-4) = -2$ |

Dari $s$ ke $t$ lintasan terpendeknya $s \to y \to x \to t$ dengan total bobot 2. Ke $x$ lintasannya $s \to y \to x$ dengan total bobot 4, ke $y$ lintasannya $s \to y$ dengan total bobot 7, dan ke $z$ lintasannya $s \to y \to x \to t \to z$ dengan total bobot $-2$. Bobot negatif membuat lintasan yang lebih panjang justru lebih murah: ke $z$ lewat empat sisi lebih murah daripada lewat satu sisi mana pun.

:::reveal Mengapa hasil akhirnya tetap sama bila urutan sisi diubah?
Setelah $\lvert V \rvert - 1$ loop semua nilai sudah benar, apa pun urutan sisinya. Urutan hanya menentukan **seberapa cepat** nilai itu tercapai. Bila urutannya dimulai dari sisi pada lintasan terpendek, yaitu $(s,y)$, $(y,x)$, $(x,t)$, $(t,z)$, lalu sisi lainnya, semua $v.d$ sudah final setelah loop 1 dan loop 2 sampai 4 tidak mengubah apa pun. Pseudocode tetap menjalankan keempat loop karena ia tidak tahu kapan berhenti. Pada urutan materi, nilai final baru tercapai di loop 4.
:::

### Contoh siklus negatif: hasil FALSE (tambahan)

Dokumen dosen tidak menjalankan contoh yang hasilnya `return FALSE`. Berikut contoh kecil tambahan dengan tiga simpul $s$, $a$, $b$ dan sisi $(s,a)$ berbobot 1, $(a,b)$ berbobot $-3$, dan $(b,a)$ berbobot 1. Siklus $a \to b \to a$ berbobot $-3 + 1 = -2$ (negatif) dan dapat dicapai dari $s$.

![Graf berarah dengan tiga simpul. Sisi dan bobotnya: s ke a 1, a ke b −3, dan b ke a 1. Siklus a, b, a berbobot −2.](/materi/bellman-ford/siklus-kecil.png)

Dengan $\lvert V \rvert - 1 = 2$ loop dan urutan sisi $(s,a)$, $(a,b)$, $(b,a)$:

| Sesudah | $a.d$ | $b.d$ |
| --- | --- | --- |
| Langkah 1 (inisialisasi) | $\infty$ | $\infty$ |
| Loop 1 | $-1$ | $-2$ |
| Loop 2 | $-3$ | $-4$ |

Nilai terus turun di setiap loop, dan tidak akan berhenti turun berapa pun banyak loop. Pada langkah 5 sampai 7, sisi $(s,a)$ masih *false* ($0 + 1 = 1$ tidak kurang dari $-3$), tetapi sisi $(a,b)$ memberi $a.d + w(a,b) = -3 + (-3) = -6$ yang masih lebih kecil dari $b.d = -4$. Kondisi $v.d > u.d + w(u,v)$ bernilai *true*, sehingga langkah 7 dijalankan: **`return FALSE`**.

### Peraga: Penelusuran Bellman-Ford

Peraga ini menjalankan pseudocode BELLMAN-FORD$(G, w, s)$ baris demi baris pada graf berarah berbobot yang Anda isi. Isian awalnya adalah contoh di bagian C dengan urutan sisi di tabel, jadi sisi yang bernilai *true* pada tiap loop, nilai $v.d$ dan $v.\pi$ sesudah tiap loop, dan hasil akhirnya sama dengan gambar loop 1 sampai 4 di atas.

- Kode di peraga menggabungkan tiga prosedur dalam satu blok: **baris 1 sampai 8 adalah BELLMAN-FORD, baris 9 sampai 12 adalah INITIALIZE-SINGLE-SOURCE, dan baris 13 sampai 15 adalah RELAX**. Nomor baris di peraga = nomor baris di bagian B ditambah 8 untuk INITIALIZE-SINGLE-SOURCE, dan ditambah 12 untuk RELAX. Saat baris 1 dibaca, penelusuran berpindah ke baris 9 sampai 12, dan saat baris 4 dibaca, penelusuran berpindah ke baris 13 sampai 15, lalu kembali.
- Tabel **Atribut tiap simpul** menunjukkan $v.d$ dan $v.\pi$. Simpul $u$ yang sedang diperiksa bertanda ▶, simpul $v$ bertanda khusus, dan simpul yang nilainya baru diubah RELAX bertanda tebal, jadi statusnya tidak hanya dibedakan lewat warna. Daftar **Sisi tebal** adalah sisi $(v.\pi, v)$ saat ini, yaitu sisi yang digambar tebal pada gambar loop.
- Tabel **Sisi menurut urutan G.E** menunjukkan hasil kondisi RELAX tiap sisi pada loop yang sedang berjalan, *true* atau *false*, sama dengan tabel di bagian C. Tabel itu dikosongkan lagi di awal tiap loop. Pada langkah 5 sampai 7 tabel yang sama dipakai untuk pemeriksaan siklus negatif. Di langkah akhir muncul lintasan terpendek, atau sisi yang membuktikan adanya siklus negatif.
- Peraga mengikuti pseudocode **apa adanya**: selalu $\lvert V \rvert - 1$ loop tanpa berhenti lebih awal. Baris 9 sampai 11 ditampilkan ringkas, satu langkah untuk semua simpul. Mulai baris 12, satu langkah sama dengan satu baris yang dibaca, termasuk header *for* baris 3 tiap sisi (ditambah satu pemeriksaan akhir tiap loop). Dengan $n$ simpul, $m$ sisi, $L = n - 1$, dan $U$ = banyak pembaruan (baris 14 dan 15), banyaknya langkah untuk hasil TRUE adalah $8 + 2L + 3mL + 2U + 2m$, yaitu 170 langkah untuk contoh ($L = 4$, $m = 10$, $U = 7$).
- Simpul ditulis di isian V, sisi berarah ditulis di isian E sebagai `u>v:bobot` (bobot boleh negatif), dan sumber di isian s. **Urutan penulisan sisi adalah urutan G.E** di tiap loop. Coba tombol "Urutan sisi lain": loop yang berbeda, tetapi hasil akhirnya sama. Coba juga tombol "Siklus negatif" untuk melihat langkah 5 sampai 7 berakhir di `return FALSE`. Graf boleh punya simpul yang tidak terjangkau dari $s$. Maksimal 7 simpul dan 14 sisi, bobot $-99$ sampai 99.

::trace bellman-ford

:::quiz Cek pemahaman: contoh Bellman-Ford
::question Pada loop 1 contoh, kondisi RELAX bernilai *true* untuk sisi mana saja?
- [ ] $(t,x)$ dan $(t,y)$
- [ ] Semua sepuluh sisi
- [x] $(s,t)$ dan $(s,y)$
::explain
Sisi $(s,t)$ dan $(s,y)$ berada di urutan paling akhir. Sebelum keduanya, semua simpul selain $s$ masih bernilai $\infty$, sehingga sisi yang lain tidak mengubah apa pun. Hasilnya $t.d = 6$ dan $y.d = 7$.
::question Berapa $x.d$ sesudah loop 2?
- [ ] 11
- [x] 4
- [ ] $\infty$
::explain
Pada loop 2, sisi $(t,x)$ lebih dulu menurunkan $x.d$ menjadi $6 + 5 = 11$, lalu sisi $(y,x)$ menurunkannya lagi menjadi $7 + (-3) = 4$. Nilai akhir loop 2 adalah 4.
::question Mengapa $t.d$ turun dari 6 menjadi 2 pada loop 3?
- [ ] Karena sisi $(s,t)$ diganti bobotnya
- [x] Karena sisi $(x,t)$ bobotnya $-2$ dan $x.d = 4$, sehingga $4 + (-2) = 2 < 6$
- [ ] Karena $t$ dipilih sebagai sumber
::explain
RELAX$(x,t,w)$ menemukan lintasan $s \to y \to x \to t$ yang lebih murah daripada $s \to t$ langsung.
::question Apa hasil Bellman-Ford pada contoh, dan berapa $z.d$?
- [x] `return TRUE`, $z.d = -2$
- [ ] `return TRUE`, $z.d = 2$
- [ ] `return FALSE`, karena ada sisi berbobot negatif
::explain
Langkah 6 bernilai *false* untuk semua sisi, jadi hasilnya `return TRUE`. Sisi berbobot negatif saja tidak membuat hasil FALSE, yang menentukan adalah ada atau tidaknya siklus negatif. Nilai akhirnya $z.d = -2$ lewat $s \to y \to x \to t \to z$.
::question Pada contoh siklus negatif $s$, $a$, $b$, mengapa hasilnya `return FALSE`?
- [ ] Karena ada sisi berbobot negatif
- [x] Karena setelah semua loop masih ada sisi $(a,b)$ dengan $b.d > a.d + w(a,b)$
- [ ] Karena sumber tidak punya sisi keluar
::explain
Siklus $a \to b \to a$ berbobot $-2$, sehingga tiap loop menurunkan $a.d$ dan $b.d$ lagi. Setelah $\lvert V \rvert - 1$ loop, sisi $(a,b)$ masih memberi $-4 > -6$, dan itu memicu `return FALSE`.
:::

## D. Analisis Running Time

Running time Bellman-Ford dihitung dari berapa kali tiap langkah dibaca, dengan $\lvert V \rvert$ simpul dan $\lvert E \rvert$ sisi.

:::steps Menghitung running time Bellman-Ford
::slide Langkah 1: Θ(V)
Baris 1 prosedur INITIALIZE-SINGLE-SOURCE (*for each vertex*) dibaca $\lvert V \rvert + 1$ kali, yaitu sekali per simpul ditambah satu pemeriksaan akhir. Hasilnya $\Theta(V)$.

::slide Langkah 2: Θ(V)
Perulangan *for* pada langkah 2 dibaca $(\lvert G.V \rvert - 1) + 1 = \lvert V \rvert$ kali. Hasilnya $\Theta(V)$.

::slide Langkah 2 sampai 4: Θ(VE)
Pada langkah 3, perulangan *for* dibaca $\lvert E \rvert + 1$ kali **untuk setiap loop** langkah 2, dan RELAX dipanggil $\lvert E \rvert$ kali per loop. Satu loop memberi $\Theta(E)$, dan ada $\lvert G.V \rvert - 1$ loop. Akibatnya langkah 2 sampai 4 memberi $\Theta(VE)$.

::slide Langkah 5 sampai 7: Θ(E)
Pada langkah 5 terdapat pengulangan *for* sebanyak $\lvert E \rvert + 1$, sehingga memberi $\Theta(E)$.

::slide Total
Running time Bellman-Ford adalah $\Theta(V) + \Theta(VE) + \Theta(E) = \Theta(VE)$, karena $\Theta(VE)$ mendominasi dua suku lainnya.
:::

Untuk contoh materi ($\lvert V \rvert = 5$, $\lvert E \rvert = 10$, hasil `return TRUE`), banyak pembacaan tiap baris adalah:

| Baris yang dibaca | Rumus | Contoh |
| --- | --- | --- |
| INITIALIZE-SINGLE-SOURCE baris 1 | $\lvert V \rvert + 1$ | 6 |
| BELLMAN-FORD baris 2 | $\lvert V \rvert$ | 5 |
| BELLMAN-FORD baris 3 | $(\lvert V \rvert - 1)(\lvert E \rvert + 1)$ | 44 |
| BELLMAN-FORD baris 4 (RELAX) | $(\lvert V \rvert - 1)\lvert E \rvert$ | 40 |
| BELLMAN-FORD baris 5 | $\lvert E \rvert + 1$ | 11 |
| BELLMAN-FORD baris 6 | $\lvert E \rvert$ | 10 |
| BELLMAN-FORD baris 7 | 0 (hanya dijalankan bila ada siklus negatif) | 0 |
| BELLMAN-FORD baris 8 | 1 | 1 |

:::quiz Cek pemahaman: running time Bellman-Ford
::question Berapa running time algoritma Bellman-Ford?
- [ ] $\Theta(V + E)$
- [x] $\Theta(VE)$
- [ ] $\Theta(E)$
::explain
Langkah 2 sampai 4 memproses semua $\lvert E \rvert$ sisi sebanyak $\lvert V \rvert - 1$ kali, jadi $\Theta(VE)$. Suku $\Theta(V)$ dan $\Theta(E)$ dari langkah lain lebih kecil.
::question Pada tiap loop langkah 2, perulangan *for* pada langkah 3 dibaca berapa kali?
- [x] $\lvert E \rvert + 1$ kali
- [ ] $\lvert E \rvert$ kali
- [ ] $\lvert V \rvert - 1$ kali
::explain
Sebanyak satu kali per sisi, ditambah satu pemeriksaan terakhir yang menyatakan sisi sudah habis (*end for*).
::question Untuk $\lvert V \rvert = 5$ dan $\lvert E \rvert = 10$ dengan hasil TRUE, berapa kali RELAX dipanggil?
- [ ] 10
- [x] 40
- [ ] 50
::explain
RELAX dipanggil untuk tiap sisi di tiap loop: $(\lvert V \rvert - 1)\lvert E \rvert = 4 \times 10 = 40$.
:::

## E. Mencoba Visualisasi

Visualisasi di bawah ini menjalankan Bellman-Ford pada graf berarah berbobot yang Anda isi. Tiap langkah menyorot baris kode, mewarnai simpul dan sisi, serta menampilkan nilai jarak yang sedang berubah.

Beberapa hal agar tidak bingung membandingkan dengan materi:

- Simpul pada visualisasi **bernomor 0 sampai $n - 1$**, bukan huruf. Pada contoh materi, $s, t, x, y, z$ adalah 0, 1, 2, 3, 4, sehingga $(s,t)$ ditulis `0>1:6` dan $(z,s)$ ditulis `4>0:2`. Sisi ditulis `u>v:bobot` yang berarti panah dari $u$ ke $v$, dan dua arah antara simpul yang sama ditulis sebagai dua sisi.
- Bobot bilangan bulat dari $-9$ sampai 99, dengan $n$ maksimal 9 dan sisi maksimal 16. Bobot negatif hanya didukung visualisasi Bellman-Ford.
- Visualisasi memproses sisi **menurut urutan penulisan**. Contoh bawaan "Bobot negatif tanpa siklus negatif" menulis sisi dari $s$ lebih dulu, sehingga urutannya berbeda dari tabel di bagian C. Hasil akhirnya sama ($t = 2$, $x = 4$, $y = 7$, $z = -2$). Untuk mengulang tabel materi, tulis sisi menurut urutan bagian C: `1>2:5, 1>3:8, 1>4:-4, 2>1:-2, 3>2:-3, 3>4:9, 4>2:7, 4>0:2, 0>1:6, 0>3:7`.
- Kodenya berbentuk JavaScript, jadi nomor barisnya berbeda dari pseudocode di bagian B. Kodenya mengembalikan larik jarak (padanan `return TRUE` dengan nilai $v.d$) atau `null` (padanan `return FALSE`).
- Kode pada visualisasi **berhenti lebih awal** (`break`) bila satu loop tidak mengubah nilai apa pun, sedangkan pseudocode materi selalu menjalankan $\lvert V \rvert - 1$ loop. Hasilnya sama, hanya jumlah loop yang ditampilkan bisa lebih sedikit.
- Contoh bawaan "Siklus negatif (jarak tak terhingga turun)" adalah contoh tiga simpul di akhir bagian C: `0>1:1, 1>2:-3, 2>1:1`.
- Visualisasi ini menunjukkan jalannya algoritma pada graf. Untuk menelusuri **pseudocode bagian B baris demi baris** (termasuk INITIALIZE-SINGLE-SOURCE dan RELAX) pada contoh materi, gunakan peraga penelusuran di akhir bagian C.

::visualizer

## F. Rangkuman

| Hal | Isi |
| --- | --- |
| Masalah | Mencari lintasan terpendek dari satu sumber $s$ ke semua simpul pada graf berarah berbobot |
| Bellman-Ford | INITIALIZE-SINGLE-SOURCE, lalu $\lvert V \rvert - 1$ loop yang me-RELAX semua sisi, lalu memeriksa tiap sisi sekali lagi |
| RELAX | Bila $v.d > u.d + w(u,v)$, maka $v.d = u.d + w(u,v)$ dan $v.\pi = u$ |
| Hasil | `return TRUE` (lintasan terpendek didapat, $v.d$ dan $v.\pi$ siap dipakai) atau `return FALSE` (ada siklus negatif yang terjangkau dari $s$) |
| Bobot negatif | Boleh, asalkan tidak ada siklus negatif yang terjangkau dari $s$ |
| Contoh | `return TRUE` dengan $t.d = 2$, $x.d = 4$, $y.d = 7$, $z.d = -2$ |
| Urutan sisi | Bebas, hasil akhirnya sama |
| Running time | $\Theta(VE)$ |

Cara cepat mengingat: **Bellman-Ford melonggarkan (RELAX) semua sisi berulang-ulang sebanyak $\lvert V \rvert - 1$ kali, lalu memeriksa sekali lagi apakah masih ada sisi yang bisa dilonggarkan: bila masih ada, berarti ada siklus negatif**. Materi 13.2 membahas Dijkstra, algoritma lintasan terpendek yang tidak memperbolehkan bobot sisi negatif.

## A. Konsep Depth First Search

Daftar pustaka: Cormen, *Introduction to Algorithms*, halaman 603 sampai 610. Seperti BFS, algoritma ***Depth First Search*** (DFS) dipakai untuk menelusuri graf. Bedanya, BFS menelusuri simpul secara **melebar**, sedangkan DFS menelusuri dari suatu simpul secara **mendalam** sampai tidak ada lagi simpul yang bisa ditelusuri.

Jika sudah sampai di simpul yang tidak bisa menelusuri ke simpul lain, DFS melakukan ***backtrack***: mundur sampai ketemu simpul yang masih punya cabang (sesuai *adjacency-list*) yang belum ditelusuri. Proses ini berlanjut sampai semua simpul yang bisa dicapai dari simpul awal ditemukan.

Jika masih ada simpul yang tersisa, DFS memilih salah satunya sebagai simpul awal yang baru, lalu menelusuri lagi. Proses berulang sampai semua simpul sudah ditemukan. Karena itu hasilnya tidak selalu satu pohon:

| Hal | BFS | DFS |
| --- | --- | --- |
| Arah penelusuran | Melebar, lapisan demi lapisan | Mendalam, lalu *backtrack* |
| Struktur data | Antrean $Q$ (FIFO) | Rekursi (tumpukan pemanggilan) |
| Hasil | Satu pohon BFS dari simpul awal $s$ | Satu atau lebih pohon, disebut ***DFS-forest*** |
| Simpul awal | Satu simpul $s$ | Semua simpul bisa menjadi akar |
| Atribut waktu | Jarak $u.d$ | Dua *timestamp*: $u.d$ dan $u.f$ |

### Warna simpul

DFS juga memberi warna pada simpul:

| Warna | Arti |
| --- | --- |
| WHITE | Belum ditemukan. Semua simpul berwarna WHITE di awal |
| GRAY | Sudah ditemukan, tetapi penelusuran dari simpul itu belum selesai |
| BLACK | Selesai: tidak ada lagi simpul yang bisa ditelusuri dari simpul itu |

### Timestamp

Setiap simpul $u$ punya dua *timestamp*, yaitu bilangan bulat dari penghitung global $time$:

- **Discovery time** $u.d$: nilai $time$ ketika $u$ pertama kali ditemukan. Pada saat itu warna $u$ menjadi GRAY.
- **Finishing time** $u.f$: nilai $time$ ketika semua *adjacency-list* $u$ sudah selesai ditelusuri. Pada saat itu warna $u$ menjadi BLACK.

Karena $u.d$ selalu lebih dulu daripada $u.f$, selalu berlaku $u.d < u.f$.

:::quiz Cek pemahaman: konsep DFS
::question Apa yang dilakukan DFS ketika sudah sampai di simpul yang tidak bisa menelusuri ke simpul lain?
- [ ] Berhenti dan selesai
- [x] *Backtrack*: mundur sampai ketemu simpul yang masih punya cabang
- [ ] Mengulang dari simpul awal yang sama
::explain
DFS mundur ke simpul sebelumnya sampai ketemu simpul yang masih punya tetangga yang belum ditelusuri. Berhenti hanya ketika semua simpul yang terjangkau sudah selesai.
::question Kapan simpul $u$ berwarna GRAY dan mendapat $u.d$?
- [ ] Saat semua tetangganya selesai ditelusuri
- [x] Saat $u$ pertama kali ditemukan
- [ ] Saat $u$ dikeluarkan dari antrean
::explain
Warna GRAY dan $u.d$ diberikan ketika $u$ pertama kali ditemukan. Saat semua tetangganya selesai, $u$ menjadi BLACK dan mendapat $u.f$. DFS tidak memakai antrean.
::question Hasil DFS yang terdiri dari lebih dari satu pohon disebut...
- [ ] *DFS-tree*
- [x] *DFS-forest*
- [ ] *Spanning-list*
::explain
Setiap kali DFS memulai dari simpul WHITE yang baru, terbentuk satu pohon baru. Kumpulan pohon itu disebut *DFS-forest*.
:::

## B. Algoritma DFS dan DFS-VISIT

Algoritma DFS terdiri dari dua prosedur: DFS$(G)$ yang mengulang untuk setiap simpul, dan DFS-VISIT$(G, u)$ yang menelusuri secara rekursif dari satu simpul.

### Pseudocode

Pertama prosedur DFS$(G)$. Nomor baris di pinggir sama dengan nomor langkah yang dijelaskan di bawah.

```pseudocode
for each vertex u ∈ G.V
    u.color = WHITE
    u.π = NIL
time = 0
for each vertex u ∈ G.V
    if u.color == WHITE
        DFS-VISIT(G, u)
```

Kedua prosedur DFS-VISIT$(G, u)$, yang dipanggil dari baris 7 prosedur DFS$(G)$ dan dari dirinya sendiri. Nomor barisnya dimulai lagi dari 1.

```pseudocode
time = time + 1
u.d = time
u.color = GRAY
for each v ∈ G.Adj[u]
    if v.color == WHITE
        v.π = u
        DFS-VISIT(G, v)
u.color = BLACK
time = time + 1
u.f = time
```

Di buku Cormen, baris-baris DFS-VISIT diberi komentar: baris 1 menandai bahwa simpul $u$ yang WHITE baru saja ditemukan, baris 4 berarti *explore edge* $(u, v)$, dan baris 8 berarti $u$ dihitamkan karena sudah selesai.

:::steps Arti tiap langkah DFS(G)
::slide Langkah 1 sampai 3: inisialisasi
Setiap simpul $u$ anggota $V$ diberi warna WHITE dan induknya $u.\pi$ = NIL. Tidak ada simpul yang dikecualikan, berbeda dari BFS yang memperlakukan simpul awal $s$ secara khusus.

::slide Langkah 4: waktu awal
$time = 0$. Variabel $time$ adalah penghitung global yang dipakai bersama oleh seluruh pemanggilan DFS-VISIT.

::slide Langkah 5 sampai 7: simpul awal yang baru
Untuk setiap simpul $u \in V$ (dalam urutan $V$), periksa warnanya. Jika $u$ berwarna WHITE, panggil DFS-VISIT$(G, u)$. Setiap simpul yang dipanggil dari langkah 7 menjadi **akar** (*root*) satu pohon pada *DFS-forest*.
:::

:::steps Arti tiap langkah DFS-VISIT(G, u)
::slide Langkah 1: waktu bertambah
Pada pemanggilan pertama, warna $u$ adalah WHITE. $time$ ditambah 1, yaitu $time = time + 1$.

::slide Langkah 2 dan 3: simpul ditemukan
$u.d = time$ (*discovery time*), dan warna $u$ menjadi GRAY.

::slide Langkah 4: menelusuri tetangga
Perulangan *for* berlaku untuk setiap simpul $v$ anggota $G.Adj[u]$ (*explore edge* $(u, v)$), lalu langkah 5 sampai 7 dijalankan. Jika semua tetangga sudah ditelusuri (*end for*), lanjut ke langkah 8.

::slide Langkah 5 sampai 7: tetangga WHITE
Jika $v$ berwarna WHITE, induk $v$ adalah $u$ (langkah 6), lalu DFS-VISIT$(G, v)$ dipanggil. Fungsi ini **rekursif**, yaitu memanggil dirinya sendiri. Jika $v$ bukan WHITE, simpul itu dilewati dan perulangan kembali ke langkah 4 untuk tetangga berikutnya.

::slide Langkah 8 sampai 10: selesai
Warna $u$ menjadi BLACK, $time$ ditambah 1, dan $u.f = time$ (*finishing time*). Setelah itu pemanggilan ini selesai dan kendali kembali ke pemanggilnya (*backtrack*).
:::

:::quiz Cek pemahaman: prosedur DFS
::question Pemanggilan DFS-VISIT$(G, u)$ yang pertama kali berjalan pada graf mulai dari $time = 0$. Berapa nilai $u.d$ untuk simpul pertama itu?
- [ ] 0
- [x] 1
- [ ] 2
::explain
Langkah 1 menaikkan $time$ dari 0 menjadi 1, dan langkah 2 mengisi $u.d = 1$.
::question Mengapa langkah 5 DFS-VISIT hanya memanggil DFS-VISIT$(G, v)$ bila $v$ WHITE?
- [ ] Karena simpul GRAY dan BLACK tidak punya tetangga
- [x] Karena simpul yang bukan WHITE sudah ditemukan dan tidak boleh ditemukan lagi
- [ ] Karena simpul WHITE selalu bernomor paling kecil
::explain
Simpul GRAY sedang ditelusuri (masih ada di tumpukan pemanggilan) dan simpul BLACK sudah selesai. Memanggilnya lagi akan menimpa $v.d$ dan $v.\pi$.
::question Apa yang terjadi pada langkah 8 sampai 10 DFS-VISIT?
- [ ] $u$ menjadi GRAY dan $u.d$ diisi
- [x] $u$ menjadi BLACK, $time$ bertambah 1, dan $u.f = time$
- [ ] $u$ menjadi WHITE kembali
::explain
Langkah 8 sampai 10 dijalankan ketika semua tetangga $u$ sudah ditelusuri. Warna BLACK berarti $u$ selesai, dan $u.f$ mencatat saat itu.
::question Apa arti *finishing time* $u.f$?
- [ ] Saat $u$ pertama kali ditemukan
- [x] Nilai $time$ ketika semua *adjacency-list* $u$ sudah selesai ditelusuri
- [ ] Jarak $u$ dari simpul awal
::explain
$u.f$ dicatat di langkah 10, setelah perulangan atas $G.Adj[u]$ selesai. Dokumen menyebutnya waktu ketika $u$ "ditemukan terakhir kali", yaitu saat $u$ selesai diproses.
:::

## C. Analisis Running Time

Waktu DFS dihitung dari dua bagian.

:::steps Menghitung running time DFS
::slide Perulangan di DFS(G)
Perulangan pada langkah 1 sampai 3 dan langkah 5 sampai 7 prosedur DFS$(G)$ masing-masing mengunjungi tiap simpul satu kali, jadi memberi waktu $\Theta(V)$.

::slide Pemanggilan DFS-VISIT
DFS-VISIT$(G, u)$ dipanggil **tepat satu kali** untuk tiap simpul, karena hanya simpul WHITE yang dipanggil dan simpul itu langsung menjadi GRAY (langkah 3). Pada tiap pemanggilan, perulangan langkah 4 menelusuri seluruh $G.Adj[u]$. Jumlah panjang seluruh *adjacency-list* adalah $\lvert E \rvert$ pada graf berarah, atau $2 \lvert E \rvert$ pada graf tak berarah. Jadi seluruh pemanggilan DFS-VISIT memberi waktu $\Theta(E)$.

::slide Total
Jumlah kedua bagian adalah running time DFS:

$$
\Theta(V + E)
$$

Seperti BFS, waktunya linier terhadap ukuran graf yang disimpan sebagai *adjacency-list*.
:::

:::quiz Cek pemahaman: running time DFS
::question Berapa kali DFS-VISIT dipanggil untuk satu simpul tertentu?
- [ ] Sebanyak jumlah tetangganya
- [x] Tepat satu kali
- [ ] Paling sedikit dua kali, saat masuk dan saat keluar
::explain
Hanya simpul WHITE yang dipanggil, dan pemanggilan pertama langsung mengubahnya menjadi GRAY. Tetangga yang bukan WHITE hanya dilewati.
::question Bagian mana yang memberi waktu $\Theta(E)$?
- [ ] Dua perulangan di DFS$(G)$
- [x] Perulangan langkah 4 DFS-VISIT yang menelusuri seluruh *adjacency-list*
- [ ] Penambahan $time$ di langkah 1 dan 9
::explain
Setiap *adjacency-list* ditelusuri sekali, dan jumlah panjang seluruhnya sebanding dengan $\lvert E \rvert$. Dua perulangan di DFS$(G)$ memberi $\Theta(V)$, dan penambahan $time$ hanya $O(1)$ per pemanggilan.
::question Berapa running time DFS dengan masukan *adjacency-list*?
- [ ] $\Theta(V \cdot E)$
- [x] $\Theta(V + E)$
- [ ] $\Theta(V^2)$
::explain
$\Theta(V)$ dari dua perulangan di DFS$(G)$ ditambah $\Theta(E)$ dari seluruh pemanggilan DFS-VISIT.
:::

## D. Contoh Soal

Tuliskan graf berarah dan *DFS-forest* yang didapat dari penelusuran DFS terhadap graf berarah $G = (V, E)$ berikut. Simpulnya $u, v, w$ di baris atas dan $x, y, z$ di baris bawah, dengan 8 busur: $(u, v)$, $(u, x)$, $(v, y)$, $(w, y)$, $(w, z)$, $(x, v)$, $(y, x)$, dan $(z, z)$. Busur $(z, z)$ berawal dan berakhir di simpul $z$ yang sama.

### Adjacency-list masukan

| Simpul $u$ | $Adj[u]$ |
| --- | --- |
| $u$ | $v, x$ |
| $v$ | $y$ |
| $w$ | $y, z$ |
| $x$ | $v$ |
| $y$ | $x$ |
| $z$ | $z$ |

Simpul diperiksa pada langkah 5 DFS$(G)$ dalam urutan $u, v, w, x, y, z$.

### Penelusuran

Gambar berikut menunjukkan graf setelah tiap tahap. Angka di dalam simpul berbentuk $d/f$: sebelum garis miring adalah $u.d$, dan sesudahnya adalah $u.f$ (kosong selama belum selesai). Simpul putih adalah WHITE, abu-abu adalah GRAY, dan hitam adalah BLACK. Garis abu-abu tebal menandai busur pohon. Busur putus-putus berlabel adalah busur yang bukan busur pohon: **B** (*Back*), **F** (*Forward*), dan **C** (*Cross*).

Awalnya semua simpul WHITE dengan $\pi$ = NIL (langkah 1 sampai 3 DFS$(G)$) dan $time = 0$ (langkah 4).

:::steps Penelusuran DFS(G) langkah demi langkah
::slide 1. DFS(G): u = u, lalu DFS-VISIT(G, u)
Langkah 5 DFS$(G)$, putaran 1: $u = u$. Langkah 6: $u$ WHITE, bernilai *true*. Langkah 7: panggil DFS-VISIT$(G, u)$.

DFS-VISIT$(G, u)$ langkah 1 sampai 3: $time = 1$, $u.d = 1$, dan $u$ menjadi GRAY.

![Penelusuran 1. Simpul u abu-abu dengan label 1/. Simpul v, w, x, y, dan z putih. Busurnya: u ke v, u ke x, v ke y, w ke y, w ke z, x ke v, y ke x, dan z ke z.](/materi/graph-dfs/dfs-01.png)

::slide 2. Busur (u, v): v ditemukan
Langkah 4: $Adj[u] = \{v, x\}$. Yang pertama diambil adalah $v$ (*explore edge* $(u, v)$). Langkah 5: $v$ WHITE, bernilai *true*. Langkah 6: $v.\pi = u$. Langkah 7: panggil DFS-VISIT$(G, v)$.

DFS-VISIT$(G, v)$ langkah 1 sampai 3: $time = 2$, $v.d = 2$, dan $v$ menjadi GRAY.

![Penelusuran 2. Simpul u berlabel 1/ dan v berlabel 2/ keduanya abu-abu, dihubungkan busur u ke v yang digaris tebal. Simpul lain putih.](/materi/graph-dfs/dfs-02.png)

::slide 3. Busur (v, y): y ditemukan
Langkah 4: $Adj[v] = \{y\}$, *explore edge* $(v, y)$. Langkah 5: $y$ WHITE, *true*. Langkah 6: $y.\pi = v$. Langkah 7: panggil DFS-VISIT$(G, y)$.

DFS-VISIT$(G, y)$ langkah 1 sampai 3: $time = 3$, $y.d = 3$, dan $y$ menjadi GRAY.

![Penelusuran 3. Simpul u berlabel 1/, v berlabel 2/, dan y berlabel 3/ abu-abu. Busur u ke v dan v ke y digaris tebal. Simpul x, w, dan z putih.](/materi/graph-dfs/dfs-03.png)

::slide 4. Busur (y, x): x ditemukan
Langkah 4: $Adj[y] = \{x\}$, *explore edge* $(y, x)$. Langkah 5: $x$ WHITE, *true*. Langkah 6: $x.\pi = y$. Langkah 7: panggil DFS-VISIT$(G, x)$.

DFS-VISIT$(G, x)$ langkah 1 sampai 3: $time = 4$, $x.d = 4$, dan $x$ menjadi GRAY.

![Penelusuran 4. Simpul u 1/, v 2/, y 3/, dan x 4/ abu-abu. Busur u ke v, v ke y, dan y ke x digaris tebal. Simpul w dan z putih.](/materi/graph-dfs/dfs-04.png)

::slide 5. Busur (x, v): busur Back
Langkah 4: $Adj[x] = \{v\}$, *explore edge* $(x, v)$. Langkah 5: $v$ berwarna GRAY, jadi bernilai *false*. Karena itu dilakukan *backtrack* ke langkah 4. Busur $(x, v)$ menuju simpul GRAY, yaitu leluhur $x$ yang masih diproses, dan digambar putus-putus berlabel **B** (*Back*).

![Penelusuran 5. Sama seperti sebelumnya, ditambah busur putus-putus berlabel B dari x ke v.](/materi/graph-dfs/dfs-05.png)

::slide 6. x selesai
Langkah 4: *end for*, tidak ada lagi anggota $Adj[x]$, lanjut ke langkah 8. Langkah 8: $x$ menjadi BLACK. Langkah 9: $time = 5$. Langkah 10: $x.f = 5$.

![Penelusuran 6. Simpul x hitam berlabel 4/5. Simpul u 1/, v 2/, dan y 3/ abu-abu.](/materi/graph-dfs/dfs-06.png)

::slide 7. y selesai
*Backtrack* ke langkah 4 pada DFS-VISIT$(G, y)$. *End for*, tidak ada lagi anggota $Adj[y]$. Langkah 8: $y$ menjadi BLACK. Langkah 9: $time = 6$. Langkah 10: $y.f = 6$.

![Penelusuran 7. Simpul x hitam 4/5 dan y hitam 3/6. Simpul u 1/ dan v 2/ abu-abu.](/materi/graph-dfs/dfs-07.png)

::slide 8. v selesai
*Backtrack* ke langkah 4 pada DFS-VISIT$(G, v)$. *End for*, tidak ada lagi anggota $Adj[v]$. Langkah 8: $v$ menjadi BLACK. Langkah 9: $time = 7$. Langkah 10: $v.f = 7$.

![Penelusuran 8. Simpul v hitam 2/7, y hitam 3/6, dan x hitam 4/5. Simpul u berlabel 1/ masih abu-abu.](/materi/graph-dfs/dfs-08.png)

::slide 9. Busur (u, x): busur Forward
*Backtrack* ke langkah 4 pada DFS-VISIT$(G, u)$. Anggota kedua $Adj[u]$ adalah $x$ (*explore edge* $(u, x)$). Langkah 5: $x$ berwarna BLACK, jadi bernilai *false*, dan dilakukan *backtrack*. Busur $(u, x)$ menuju keturunan $u$ yang sudah selesai, dan digambar putus-putus berlabel **F** (*Forward*).

![Penelusuran 9. Ditambahkan busur putus-putus berlabel F dari u ke x. Busur B dari x ke v tetap ada.](/materi/graph-dfs/dfs-09.png)

::slide 10. u selesai: pohon pertama
Langkah 4: *end for*, tidak ada lagi anggota $Adj[u]$. Langkah 8: $u$ menjadi BLACK. Langkah 9: $time = 8$. Langkah 10: $u.f = 8$.

Satu pohon terbentuk dari putaran 1 langkah 5 DFS$(G)$, yaitu pohon berakar di $u$.

![Penelusuran 10. Simpul u hitam 1/8, v 2/7, y 3/6, dan x 4/5 semuanya hitam. Simpul w dan z putih.](/materi/graph-dfs/dfs-10.png)

::slide 11. Kembali ke DFS(G): w ditemukan
Kembali ke langkah 5 DFS$(G)$. Putaran 2: $u = v$, langkah 6 *false* karena $v$ sudah BLACK. Putaran 3: $u = w$, langkah 6 *true*, langkah 7 memanggil DFS-VISIT$(G, w)$.

DFS-VISIT$(G, w)$ langkah 1 sampai 3: $time = 9$, $w.d = 9$, dan $w$ menjadi GRAY.

![Penelusuran 11. Simpul w abu-abu berlabel 9/. Simpul u, v, y, dan x hitam. Simpul z putih.](/materi/graph-dfs/dfs-11.png)

::slide 12. Busur (w, y): busur Cross
Langkah 4: $Adj[w] = \{y, z\}$. Anggota pertama adalah $y$ (*explore edge* $(w, y)$). Langkah 5: $y$ berwarna BLACK, jadi *false*, dan dilakukan *backtrack*. Busur $(w, y)$ menuju simpul yang sudah selesai di pohon lain, dan digambar putus-putus berlabel **C** (*Cross*).

![Penelusuran 12. Ditambahkan busur putus-putus berlabel C dari w ke y.](/materi/graph-dfs/dfs-12.png)

::slide 13. Busur (w, z): z ditemukan
Anggota berikutnya adalah $z$ (*explore edge* $(w, z)$). Langkah 5: $z$ WHITE, *true*. Langkah 6: $z.\pi = w$. Langkah 7: panggil DFS-VISIT$(G, z)$.

DFS-VISIT$(G, z)$ langkah 1 sampai 3: $time = 10$, $z.d = 10$, dan $z$ menjadi GRAY.

![Penelusuran 13. Simpul w 9/ dan z 10/ abu-abu, dihubungkan busur w ke z yang digaris tebal.](/materi/graph-dfs/dfs-13.png)

::slide 14. Busur (z, z): busur Back
Langkah 4: $Adj[z] = \{z\}$, *explore edge* $(z, z)$. Langkah 5: $z$ berwarna GRAY, jadi *false*, dan dilakukan *backtrack*. Busur $(z, z)$ menuju simpul GRAY (dirinya sendiri), dan digambar putus-putus berlabel **B** (*Back*).

![Penelusuran 14. Ditambahkan busur putus-putus berlabel B dari z kembali ke z.](/materi/graph-dfs/dfs-14.png)

::slide 15. z selesai
Langkah 4: *end for*, tidak ada lagi anggota $Adj[z]$. Langkah 8: $z$ menjadi BLACK. Langkah 9: $time = 11$. Langkah 10: $z.f = 11$.

![Penelusuran 15. Simpul z hitam berlabel 10/11. Simpul w masih abu-abu berlabel 9/.](/materi/graph-dfs/dfs-15.png)

::slide 16. w selesai: pohon kedua
*Backtrack* ke langkah 4 pada DFS-VISIT$(G, w)$. *End for*, tidak ada lagi anggota $Adj[w]$. Langkah 8: $w$ menjadi BLACK. Langkah 9: $time = 12$. Langkah 10: $w.f = 12$.

Dua pohon terbentuk dari langkah 5 DFS$(G)$: putaran 1 untuk $u$ dan putaran 3 untuk $w$.

![Penelusuran 16. Semua simpul hitam: u 1/8, v 2/7, w 9/12, x 4/5, y 3/6, dan z 10/11.](/materi/graph-dfs/dfs-16.png)
:::

Kembali ke langkah 5 DFS$(G)$ untuk sisa simpul. Putaran 4: $u = x$, langkah 6 *false*. Putaran 5: $u = y$, langkah 6 *false*. Putaran 6: $u = z$, langkah 6 *false*. Putaran 7: *end for*. Prosedur DFS$(G)$ selesai.

### Hasil penelusuran

Hasil yang didapat adalah graf berarah dengan label waktu dan jenis busur, serta *DFS-forest*. Graf berarah akhirnya sebagai berikut.

![Graf berarah hasil DFS. Simpul u berlabel 1/8, v 2/7, w 9/12, x 4/5, y 3/6, dan z 10/11. Busur pohon digaris tebal: u ke v, v ke y, y ke x, dan w ke z. Busur putus-putus: F dari u ke x, B dari x ke v, C dari w ke y, dan B dari z ke dirinya sendiri.](/materi/graph-dfs/graf-akhir.png)

*DFS-forest* terdiri dari **2 pohon**, dengan akar simpul $u$ dan simpul $w$. Pohon pertama berisi $u \rightarrow v \rightarrow y \rightarrow x$ dan pohon kedua berisi $w \rightarrow z$. Busur selain busur pohon digambar sebagai garis berlabel.

![DFS-forest dua pohon. Pohon pertama berakar di u dengan rantai u ke v ke y ke x. Pohon kedua berakar di w dengan satu anak z. Busur lain berlabel: F dari u ke x, B dari x ke v, C dari w ke y, dan B dari z ke dirinya sendiri.](/materi/graph-dfs/dfs-forest.png)

Nilai akhir tiap simpul:

| Simpul | $d$ | $f$ | $\pi$ | Interval $[d, f]$ |
| --- | --- | --- | --- | --- |
| $u$ | 1 | 8 | NIL | $[1, 8]$ |
| $v$ | 2 | 7 | $u$ | $[2, 7]$ |
| $w$ | 9 | 12 | NIL | $[9, 12]$ |
| $x$ | 4 | 5 | $y$ | $[4, 5]$ |
| $y$ | 3 | 6 | $v$ | $[3, 6]$ |
| $z$ | 10 | 11 | $w$ | $[10, 11]$ |

Perhatikan bahwa interval $[d, f]$ simpul selalu **bersarang atau terpisah**, tidak pernah bersilangan sebagian. Pada pohon pertama, $[4, 5]$ ada di dalam $[3, 6]$, yang ada di dalam $[2, 7]$, yang ada di dalam $[1, 8]$. Interval $[10, 11]$ ada di dalam $[9, 12]$, dan kedua pohon tidak saling tumpang tindih. Nilai $time$ terakhir adalah 12, yaitu $2 \lvert V \rvert$, karena tiap simpul menaikkan $time$ dua kali.

Jenis tiap busur ditentukan oleh warna simpul tujuan pada saat busur itu dijelajahi (langkah 4 DFS-VISIT):

| Warna $v$ saat $(u, v)$ dijelajahi | Jenis busur | Arti |
| --- | --- | --- |
| WHITE | *Tree* | Busur menjadi bagian pohon |
| GRAY | **B** (*Back*) | Menuju leluhur $u$ yang masih diproses, atau $u$ sendiri |
| BLACK dan $u.d < v.d$ | **F** (*Forward*) | Menuju keturunan $u$ yang sudah selesai |
| BLACK dan $u.d > v.d$ | **C** (*Cross*) | Menuju simpul yang sudah selesai di cabang atau pohon lain |

Penerapannya pada 8 busur contoh, dalam urutan dijelajahi:

| Busur | Warna tujuan | Jenis |
| --- | --- | --- |
| $(u, v)$ | WHITE | *Tree* |
| $(v, y)$ | WHITE | *Tree* |
| $(y, x)$ | WHITE | *Tree* |
| $(x, v)$ | GRAY | **B** |
| $(u, x)$ | BLACK, $u.d = 1 < x.d = 4$ | **F** |
| $(w, y)$ | BLACK, $w.d = 9 > y.d = 3$ | **C** |
| $(w, z)$ | WHITE | *Tree* |
| $(z, z)$ | GRAY | **B** |

:::quiz Cek pemahaman: contoh DFS
::question Berapa nilai $u.f$ pada contoh?
- [ ] 5
- [ ] 7
- [x] 8
::explain
Simpul $u$ adalah yang pertama ditemukan dan yang terakhir selesai di pohon pertamanya. Ia selesai setelah $v$ ($v.f = 7$), jadi $time$ menjadi 8 dan $u.f = 8$.
::question Busur $(u, x)$ pada contoh berjenis...
- [ ] *Back*
- [x] *Forward*
- [ ] *Cross*
::explain
Saat $(u, x)$ dijelajahi, $x$ sudah BLACK (dari penelusuran lewat $v$ dan $y$) dan $u.d = 1 < x.d = 4$. Jadi busur menuju keturunan yang sudah selesai, yaitu *Forward*.
::question Busur $(w, y)$ berjenis *Cross*. Mengapa bukan *Forward*?
- [ ] Karena $y$ berwarna WHITE
- [x] Karena $y$ BLACK tetapi $w.d = 9 > y.d = 3$ ($y$ bukan keturunan $w$)
- [ ] Karena $w$ dan $y$ bertetangga
::explain
*Forward* menuju keturunan, yaitu simpul dengan $d$ lebih besar dari $d$ simpul asal. Di sini $y$ ditemukan jauh sebelum $w$ dan berada di pohon lain, jadi busur itu *Cross*.
::question Berapa pohon pada *DFS-forest* contoh, dan apa akarnya?
- [ ] 1 pohon, akarnya $u$
- [x] 2 pohon, akarnya $u$ dan $w$
- [ ] 3 pohon, akarnya $u$, $v$, dan $w$
::explain
Langkah 7 DFS$(G)$ dipanggil untuk $u$ (putaran 1) dan $w$ (putaran 3). Simpul $v$ sudah BLACK saat diperiksa pada putaran 2, jadi tidak menjadi akar.
::question Berapa nilai $z.d$ dan $z.f$?
- [x] 10 dan 11
- [ ] 9 dan 12
- [ ] 10 dan 12
::explain
Setelah $w.d = 9$, simpul $z$ ditemukan ($time = 10$) dan langsung selesai karena hanya punya busur $(z, z)$ ke dirinya sendiri ($time = 11$). Simpul $w$ baru selesai sesudahnya, dengan $w.f = 12$.
:::

## E. Mencoba Visualisasi

Visualisasi di bawah ini menjalankan DFS pada graf, lalu menampilkan juga DFS pada pohon biner sebagai kasus khusus. Pada graf, tiap langkah menyorot baris kode, mewarnai simpul, dan menunjukkan tumpukan pemanggilan serta urutan kunjungan.

Beberapa hal agar tidak bingung membandingkan dengan materi:

- Visualisasi graf hanya menerima graf **tak berarah**, sedangkan contoh bagian D adalah graf berarah. Hasilnya tidak bisa dibandingkan langsung dengan contoh itu.
- Visualisasi **bernomor 0 sampai $n - 1$** dan indeks mulai dari 0. Kodenya berbentuk JavaScript, jadi nomor barisnya berbeda dari pseudocode di bagian B.
- Visualisasi menelusuri dari **satu simpul awal** saja (*start*), tanpa langkah DFS$(G)$ yang mengulang untuk simpul sisanya. Karena itu ia tidak membentuk *DFS-forest*, dan simpul yang tidak terjangkau dari simpul awal tidak ikut dikunjungi.
- Kodenya tidak menghitung $u.d$, $u.f$, maupun $u.\pi$. Ia memakai larik `dikunjungi` dan mencatat **urutan kunjungan**, yaitu urutan $u.d$ naik. Angka kecil `#k` di bawah simpul adalah kunjungan ke-$k$. Tumpukan pemanggilan menunjukkan simpul GRAY di materi.
- Tetangga selalu diperiksa dari yang **bernomor lebih kecil**. Pada materi, urutannya mengikuti *adjacency-list*, misalnya $Adj[u] = v, x$.
- Tombol "Acak" dan contoh siap pakai ada di panel "Ubah masukan". Contoh "Dua komponen" menunjukkan bahwa simpul yang tidak terjangkau tidak dikunjungi.

::visualizer

## F. Rangkuman

| Hal | Isi |
| --- | --- |
| DFS | Menelusuri graf sedalam mungkin, lalu *backtrack*. Memakai rekursi |
| DFS$(G)$ | Menginisialisasi semua simpul (WHITE, $\pi$ = NIL, $time = 0$), lalu memanggil DFS-VISIT untuk tiap simpul WHITE |
| DFS-VISIT$(G, u)$ | Memberi $u.d$ dan GRAY, menelusuri $Adj[u]$ rekursif untuk tetangga WHITE, lalu BLACK dan $u.f$ |
| Warna | WHITE belum ditemukan, GRAY sedang ditelusuri, BLACK selesai |
| *Timestamp* | $u.d$ (ditemukan) dan $u.f$ (selesai), dengan $1 \le u.d < u.f \le 2 \lvert V \rvert$ |
| Hasil | *DFS-forest*: satu atau lebih pohon, dengan akar tiap pemanggilan dari langkah 7 DFS$(G)$ |
| Jenis busur | *Tree* (tujuan WHITE), **B** (GRAY), **F** (BLACK, $u.d < v.d$), **C** (BLACK, $u.d > v.d$) |
| Contoh | Dua pohon berakar $u$ dan $w$, dengan $u$ 1/8, $v$ 2/7, $w$ 9/12, $x$ 4/5, $y$ 3/6, dan $z$ 10/11 |
| Running time | $\Theta(V + E)$ |

Cara cepat mengingat: **masuk sedalam mungkin lewat tetangga WHITE, tandai waktu saat masuk dan saat selesai, lalu mundur**. Sekarang coba kerjakan soal challenge di bawah.

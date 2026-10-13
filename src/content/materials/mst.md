## A. Konsep Minimum Spanning Tree

Daftar pustaka: Cormen, *Introduction to Algorithms*, halaman 624 sampai 637. Misalkan diberikan graf **tak berarah** $G = (V, E)$ yang setiap sisinya (*edge*) diberi bobot $w(u, v)$. Tujuan ***Minimum Spanning Tree*** (MST, pohon rentang minimum) adalah membangun satu *tree* yang menghubungkan semua simpul (*vertex*) dengan **total bobot minimum**.

Ada dua istilah yang perlu dipahami:

- ***Spanning tree*** (pohon rentang): himpunan sisi yang menghubungkan semua simpul dan **tidak mengandung siklus** (lintasan tertutup). Pada graf terhubung dengan $\lvert V \rvert$ simpul, sebuah pohon rentang selalu punya tepat $\lvert V \rvert - 1$ sisi.
- ***Minimum***: dari semua pohon rentang yang mungkin, dipilih yang jumlah bobot sisinya paling kecil.

Contoh di materi ini memakai graf tak berarah berbobot dengan 9 simpul ($a$ sampai $i$) dan 14 sisi. Angka di samping garis adalah bobot sisi.

![Graf tak berarah berbobot dengan 9 simpul a sampai i dan 14 sisi. Sisi dan bobotnya: (a,b) 4, (a,h) 8, (b,c) 8, (b,h) 11, (c,d) 7, (c,i) 2, (c,f) 4, (d,e) 9, (d,f) 14, (e,f) 10, (f,g) 2, (g,h) 1, (g,i) 6, dan (h,i) 7.](/materi/mst/graf.png)

Himpunan sisi yang menghubungkan semua simpul dengan total bobot minimum pada graf di atas adalah

$$
A = \{(a,b), (b,c), (c,d), (c,f), (c,i), (d,e), (f,g), (g,h)\}
$$

dengan total bobot minimum $4 + 8 + 7 + 4 + 2 + 9 + 2 + 1 = 37$. Sisi pada $A$ digambar tebal.

![Graf yang sama dengan sisi pohon rentang minimum digambar tebal: (a,b) 4, (b,c) 8, (c,d) 7, (c,f) 4, (c,i) 2, (d,e) 9, (f,g) 2, dan (g,h) 1. Totalnya 37.](/materi/mst/mst-akhir.png)

Ada dua cara membangun *tree* seperti ini:

| Hal | Algoritma Kruskal | Algoritma Prim |
| --- | --- | --- |
| Cara kerja | Mengurutkan semua sisi, lalu menambahkan sisi dari yang paling ringan bila tidak membentuk siklus | Membesarkan satu pohon dari simpul awal (akar) dengan sisi paling murah yang menuju simpul di luar pohon |
| Yang dipegang | Kumpulan himpunan simpul (hutan yang menyatu pelan-pelan) | Satu pohon dan antrean prioritas $Q$ |
| Simpul awal | Tidak perlu | Perlu akar $r$ |
| Struktur data | *Disjoint set* (MAKE-SET, FIND-SET, UNION) | Antrean prioritas (EXTRACT-MIN) dan *adjacency-list* |

Keduanya bersifat ***greedy***: pada tiap langkah memilih sisi yang paling ringan di antara pilihan yang aman. Karena itu hasilnya selalu pohon rentang dengan bobot minimum.

:::quiz Cek pemahaman: konsep MST
::question Graf terhubung punya 9 simpul. Berapa sisi pada pohon rentangnya?
- [ ] 7
- [x] 8
- [ ] 9
::explain
Pohon dengan $n$ simpul punya $n - 1$ sisi. Dengan 9 simpul, pohon rentangnya punya 8 sisi, sama dengan banyak anggota $A$ pada contoh.
::question Apa yang diminimumkan oleh MST?
- [ ] Jumlah simpul pada pohon
- [x] Total bobot sisi pada pohon
- [ ] Banyak sisi pada pohon
::explain
Semua pohon rentang graf terhubung punya jumlah sisi yang sama ($n - 1$). Yang berbeda adalah total bobotnya, dan MST adalah yang terkecil.
::question Mengapa pohon rentang tidak boleh mengandung siklus?
- [ ] Karena sisi pada siklus selalu berbobot besar
- [x] Karena pohon adalah graf terhubung tanpa lintasan tertutup, dan sisi pada siklus berlebihan untuk menghubungkan simpul
- [ ] Karena siklus hanya ada pada graf berarah
::explain
Bila ada siklus, satu sisi di dalamnya bisa dibuang tanpa memutus hubungan antarsimpul, sehingga total bobot masih bisa diturunkan. Karena itu MST tidak pernah memuat siklus.
::question Dua algoritma yang dipakai untuk membangun MST adalah...
- [x] Kruskal dan Prim
- [ ] BFS dan DFS
- [ ] Huffman dan Kruskal
::explain
BFS dan DFS menelusuri graf (materi 11), sedangkan Kruskal dan Prim membangun pohon rentang minimum.
:::

## B. Algoritma Kruskal

Algoritma Kruskal memandang tiap simpul sebagai pohon tersendiri, lalu menggabungkan pohon-pohon itu dengan sisi paling ringan yang tidak membentuk siklus.

### Pseudocode

Prosedur MST-KRUSKAL$(G, w)$. Nomor baris di pinggir sama dengan nomor langkah yang dijelaskan di bawah.

```pseudocode
A = ∅
for each vertex v ∈ G.V
    MAKE-SET(v)
sort the edges of G.E into nondecreasing order by weight w
for each edge (u, v) ∈ G.E, taken in nondecreasing order by weight
    if FIND-SET(u) ≠ FIND-SET(v)
        A = A ∪ {(u, v)}
        UNION(u, v)
return A
```

$(G, w)$ adalah masukan algoritma: $G$ graf tak berarah yang terdiri dari himpunan simpul dan himpunan sisi, dan $w$ adalah bobot tiap sisi.

### Tiga operasi himpunan

| Operasi | Arti |
| --- | --- |
| MAKE-SET$(v)$ | Membentuk himpunan (*tree*) yang berisi hanya satu simpul $v$ |
| FIND-SET$(u)$ | Mencari himpunan yang memuat simpul $u$ |
| UNION$(u, v)$ | Menggabungkan himpunan yang memuat $u$ dan himpunan yang memuat $v$ menjadi satu |

:::steps Arti tiap langkah MST-KRUSKAL
::slide Langkah 1: himpunan A
$A$ adalah himpunan sisi yang terpilih untuk membangun *tree* dengan total bobot minimum. Awalnya $A$ kosong.

::slide Langkah 2 dan 3: satu himpunan per simpul
Untuk tiap simpul $v$ anggota $G.V$, panggil MAKE-SET$(v)$. Hasilnya terbentuk himpunan sebanyak simpul, masing-masing berisi satu simpul. Untuk graf contoh dengan 9 simpul: $\{a\}, \{b\}, \{c\}, \{d\}, \{e\}, \{f\}, \{g\}, \{h\}, \{i\}$.

::slide Langkah 4: urutkan sisi
Semua sisi $G.E$ diurutkan menurut bobot dari **kecil ke besar** (*nondecreasing*). Sisi yang bobotnya sama boleh berurutan dengan cara apa pun.

::slide Langkah 5: ambil sisi satu per satu
Untuk tiap sisi $(u, v)$ menurut urutan dari langkah 4, jalankan langkah 6. Bila semua sisi sudah diambil (*end for*), lanjut ke langkah 9.

::slide Langkah 6: uji siklus
Panggil FIND-SET$(u)$ dan FIND-SET$(v)$. Jika himpunan yang memuat $u$ **tidak sama** dengan himpunan yang memuat $v$, hasilnya *true* dan lanjut ke langkah 7. Jika sama, hasilnya *false*: sisi itu akan membentuk siklus, sehingga dilewati dan perulangan kembali ke langkah 5.

::slide Langkah 7 dan 8: terima sisi
Sisi $(u, v)$ dimasukkan ke $A$ (langkah 7), lalu UNION$(u, v)$ menggabungkan himpunan $u$ dan himpunan $v$ menjadi satu (langkah 8).

::slide Langkah 9: hasil
Setelah semua sisi diperiksa, kembalikan $A$. Himpunan $A$ berisi sisi-sisi pohon rentang minimum.
:::

:::quiz Cek pemahaman: algoritma Kruskal
::question Apa isi himpunan $A$ pada awal algoritma Kruskal?
- [x] Kosong ($\emptyset$)
- [ ] Sisi paling ringan
- [ ] Semua sisi graf
::explain
Langkah 1 menetapkan $A = \emptyset$. Sisi dimasukkan satu per satu di langkah 7.
::question Apa yang dilakukan MAKE-SET$(v)$?
- [ ] Menggabungkan $v$ dengan tetangganya
- [x] Membentuk himpunan yang berisi hanya simpul $v$
- [ ] Menghapus $v$ dari graf
::explain
Langkah 2 dan 3 memanggil MAKE-SET untuk tiap simpul, sehingga di awal ada sebanyak $\lvert V \rvert$ himpunan yang masing-masing berisi satu simpul.
::question Sisi $(u, v)$ dimasukkan ke $A$ bila...
- [ ] Bobotnya paling kecil di seluruh graf
- [x] FIND-SET$(u) \ne$ FIND-SET$(v)$
- [ ] $u$ dan $v$ bertetangga
::explain
Syarat itu berarti $u$ dan $v$ masih berada di himpunan berbeda. Jika sudah satu himpunan, keduanya sudah terhubung lewat sisi lain dan menambah sisi ini membentuk siklus.
::question Mengapa sisi diurutkan dari bobot kecil ke besar di langkah 4?
- [ ] Supaya UNION berjalan lebih cepat
- [x] Supaya sisi ringan dicoba lebih dulu, sehingga sisi yang diterima adalah yang paling murah yang aman
- [ ] Supaya graf menjadi terhubung
::explain
Kruskal bersifat *greedy*. Dengan mencoba sisi ringan lebih dulu, tiap sisi yang lolos uji siklus adalah sisi paling murah yang masih boleh menghubungkan dua himpunan berbeda.
:::

## C. Contoh Kruskal

Gunakan algoritma Kruskal untuk mencari MST dari graf pada bagian A.

### Langkah 1 sampai 4

Langkah 1: $A = \emptyset$. Langkah 2 dan 3: tiap simpul membentuk himpunan sendiri, yaitu 9 himpunan $\{a\}, \{b\}, \{c\}, \{d\}, \{e\}, \{f\}, \{g\}, \{h\}, \{i\}$.

Langkah 4 mengurutkan 14 sisi menurut bobot dari kecil ke besar:

| Urutan | Sisi dan bobotnya |
| --- | --- |
| 1 | $(h,g) = 1$ |
| 2 sampai 3 | $(c,i) = 2$, $(g,f) = 2$ |
| 4 sampai 5 | $(a,b) = 4$, $(c,f) = 4$ |
| 6 | $(g,i) = 6$ |
| 7 sampai 8 | $(c,d) = 7$, $(h,i) = 7$ |
| 9 sampai 10 | $(b,c) = 8$, $(a,h) = 8$ |
| 11 | $(d,e) = 9$ |
| 12 | $(e,f) = 10$ |
| 13 | $(b,h) = 11$ |
| 14 | $(d,f) = 14$ |

Ada pasangan sisi yang bobotnya sama. Urutan di dalam pasangan itu bebas, dan materi ini mengikuti urutan di atas.

### Penelusuran langkah 5 sampai 9

Gambar berikut menunjukkan graf setelah tiap sisi diperiksa pada langkah 5. Garis **putus-putus hitam** adalah sisi yang sedang diperiksa, dan tulisan di bawah gambar menyebut hasilnya. Garis **abu-abu tebal** adalah sisi yang sudah masuk $A$.

:::steps Penelusuran Kruskal sisi demi sisi
::slide 1. Sisi (h, g) = 1: diterima
Langkah 5, putaran 1: sisi $(h, g)$ dengan bobot 1. Langkah 6: FIND-SET$(h)$ = {h} dan FIND-SET$(g)$ = {g}. Kedua himpunan berbeda, jadi langkah 6 bernilai *true*. Langkah 7: $A$ bertambah menjadi 1 sisi. Langkah 8: UNION$(h, g)$ menggabungkan {h} dan {g} menjadi {g,h}. Sisi digambar tebal.

![Kruskal 1. Sisi (h,g) bobot 1 diberi garis putus-putus hitam dan diterima. Sisi tebal di A: (h,g).](/materi/mst/kruskal-01.png)

::slide 2. Sisi (c, i) = 2: diterima
Langkah 5, putaran 2: sisi $(c, i)$ dengan bobot 2. Langkah 6: FIND-SET$(c)$ = {c} dan FIND-SET$(i)$ = {i}. Kedua himpunan berbeda, jadi langkah 6 bernilai *true*. Langkah 7: $A$ bertambah menjadi 2 sisi. Langkah 8: UNION$(c, i)$ menggabungkan {c} dan {i} menjadi {c,i}. Sisi digambar tebal.

![Kruskal 2. Sisi (c,i) bobot 2 diberi garis putus-putus hitam dan diterima. Sisi tebal di A: (h,g), (c,i).](/materi/mst/kruskal-02.png)

::slide 3. Sisi (g, f) = 2: diterima
Langkah 5, putaran 3: sisi $(g, f)$ dengan bobot 2. Langkah 6: FIND-SET$(g)$ = {g,h} dan FIND-SET$(f)$ = {f}. Kedua himpunan berbeda, jadi langkah 6 bernilai *true*. Langkah 7: $A$ bertambah menjadi 3 sisi. Langkah 8: UNION$(g, f)$ menggabungkan {g,h} dan {f} menjadi {f,g,h}. Sisi digambar tebal.

![Kruskal 3. Sisi (g,f) bobot 2 diberi garis putus-putus hitam dan diterima. Sisi tebal di A: (h,g), (c,i), (g,f).](/materi/mst/kruskal-03.png)

::slide 4. Sisi (a, b) = 4: diterima
Langkah 5, putaran 4: sisi $(a, b)$ dengan bobot 4. Langkah 6: FIND-SET$(a)$ = {a} dan FIND-SET$(b)$ = {b}. Kedua himpunan berbeda, jadi langkah 6 bernilai *true*. Langkah 7: $A$ bertambah menjadi 4 sisi. Langkah 8: UNION$(a, b)$ menggabungkan {a} dan {b} menjadi {a,b}. Sisi digambar tebal.

![Kruskal 4. Sisi (a,b) bobot 4 diberi garis putus-putus hitam dan diterima. Sisi tebal di A: (h,g), (c,i), (g,f), (a,b).](/materi/mst/kruskal-04.png)

::slide 5. Sisi (c, f) = 4: diterima
Langkah 5, putaran 5: sisi $(c, f)$ dengan bobot 4. Langkah 6: FIND-SET$(c)$ = {c,i} dan FIND-SET$(f)$ = {f,g,h}. Kedua himpunan berbeda, jadi langkah 6 bernilai *true*. Langkah 7: $A$ bertambah menjadi 5 sisi. Langkah 8: UNION$(c, f)$ menggabungkan {c,i} dan {f,g,h} menjadi {c,f,g,h,i}. Sisi digambar tebal.

![Kruskal 5. Sisi (c,f) bobot 4 diberi garis putus-putus hitam dan diterima. Sisi tebal di A: (h,g), (c,i), (g,f), (a,b), (c,f).](/materi/mst/kruskal-05.png)

::slide 6. Sisi (g, i) = 6: ditolak
Langkah 5, putaran 6: sisi $(g, i)$ dengan bobot 6. Langkah 6: FIND-SET$(g)$ = {c,f,g,h,i} dan FIND-SET$(i)$ = {c,f,g,h,i}. Kedua simpul sudah berada di himpunan yang sama, jadi langkah 6 bernilai *false* dan sisi dilewati (kembali ke langkah 5). Jika sisi ini dimasukkan, akan terbentuk siklus.

![Kruskal 6. Sisi (g,i) bobot 6 diberi garis putus-putus hitam dan ditolak. Sisi tebal di A: (h,g), (c,i), (g,f), (a,b), (c,f).](/materi/mst/kruskal-06.png)

::slide 7. Sisi (c, d) = 7: diterima
Langkah 5, putaran 7: sisi $(c, d)$ dengan bobot 7. Langkah 6: FIND-SET$(c)$ = {c,f,g,h,i} dan FIND-SET$(d)$ = {d}. Kedua himpunan berbeda, jadi langkah 6 bernilai *true*. Langkah 7: $A$ bertambah menjadi 6 sisi. Langkah 8: UNION$(c, d)$ menggabungkan {c,f,g,h,i} dan {d} menjadi {c,d,f,g,h,i}. Sisi digambar tebal.

![Kruskal 7. Sisi (c,d) bobot 7 diberi garis putus-putus hitam dan diterima. Sisi tebal di A: (h,g), (c,i), (g,f), (a,b), (c,f), (c,d).](/materi/mst/kruskal-07.png)

::slide 8. Sisi (h, i) = 7: ditolak
Langkah 5, putaran 8: sisi $(h, i)$ dengan bobot 7. Langkah 6: FIND-SET$(h)$ = {c,d,f,g,h,i} dan FIND-SET$(i)$ = {c,d,f,g,h,i}. Kedua simpul sudah berada di himpunan yang sama, jadi langkah 6 bernilai *false* dan sisi dilewati (kembali ke langkah 5). Jika sisi ini dimasukkan, akan terbentuk siklus.

![Kruskal 8. Sisi (h,i) bobot 7 diberi garis putus-putus hitam dan ditolak. Sisi tebal di A: (h,g), (c,i), (g,f), (a,b), (c,f), (c,d).](/materi/mst/kruskal-08.png)

::slide 9. Sisi (b, c) = 8: diterima
Langkah 5, putaran 9: sisi $(b, c)$ dengan bobot 8. Langkah 6: FIND-SET$(b)$ = {a,b} dan FIND-SET$(c)$ = {c,d,f,g,h,i}. Kedua himpunan berbeda, jadi langkah 6 bernilai *true*. Langkah 7: $A$ bertambah menjadi 7 sisi. Langkah 8: UNION$(b, c)$ menggabungkan {a,b} dan {c,d,f,g,h,i} menjadi {a,b,c,d,f,g,h,i}. Sisi digambar tebal.

![Kruskal 9. Sisi (b,c) bobot 8 diberi garis putus-putus hitam dan diterima. Sisi tebal di A: (h,g), (c,i), (g,f), (a,b), (c,f), (c,d), (b,c).](/materi/mst/kruskal-09.png)

::slide 10. Sisi (a, h) = 8: ditolak
Langkah 5, putaran 10: sisi $(a, h)$ dengan bobot 8. Langkah 6: FIND-SET$(a)$ = {a,b,c,d,f,g,h,i} dan FIND-SET$(h)$ = {a,b,c,d,f,g,h,i}. Kedua simpul sudah berada di himpunan yang sama, jadi langkah 6 bernilai *false* dan sisi dilewati (kembali ke langkah 5). Jika sisi ini dimasukkan, akan terbentuk siklus.

![Kruskal 10. Sisi (a,h) bobot 8 diberi garis putus-putus hitam dan ditolak. Sisi tebal di A: (h,g), (c,i), (g,f), (a,b), (c,f), (c,d), (b,c).](/materi/mst/kruskal-10.png)

::slide 11. Sisi (d, e) = 9: diterima
Langkah 5, putaran 11: sisi $(d, e)$ dengan bobot 9. Langkah 6: FIND-SET$(d)$ = {a,b,c,d,f,g,h,i} dan FIND-SET$(e)$ = {e}. Kedua himpunan berbeda, jadi langkah 6 bernilai *true*. Langkah 7: $A$ bertambah menjadi 8 sisi. Langkah 8: UNION$(d, e)$ menggabungkan {a,b,c,d,f,g,h,i} dan {e} menjadi {a,b,c,d,e,f,g,h,i}. Sisi digambar tebal.

![Kruskal 11. Sisi (d,e) bobot 9 diberi garis putus-putus hitam dan diterima. Sisi tebal di A: (h,g), (c,i), (g,f), (a,b), (c,f), (c,d), (b,c), (d,e).](/materi/mst/kruskal-11.png)

::slide 12. Sisi (e, f) = 10: ditolak
Langkah 5, putaran 12: sisi $(e, f)$ dengan bobot 10. Langkah 6: FIND-SET$(e)$ = {a,b,c,d,e,f,g,h,i} dan FIND-SET$(f)$ = {a,b,c,d,e,f,g,h,i}. Kedua simpul sudah berada di himpunan yang sama, jadi langkah 6 bernilai *false* dan sisi dilewati (kembali ke langkah 5). Jika sisi ini dimasukkan, akan terbentuk siklus.

![Kruskal 12. Sisi (e,f) bobot 10 diberi garis putus-putus hitam dan ditolak. Sisi tebal di A: (h,g), (c,i), (g,f), (a,b), (c,f), (c,d), (b,c), (d,e).](/materi/mst/kruskal-12.png)

::slide 13. Sisi (b, h) = 11: ditolak
Langkah 5, putaran 13: sisi $(b, h)$ dengan bobot 11. Langkah 6: FIND-SET$(b)$ = {a,b,c,d,e,f,g,h,i} dan FIND-SET$(h)$ = {a,b,c,d,e,f,g,h,i}. Kedua simpul sudah berada di himpunan yang sama, jadi langkah 6 bernilai *false* dan sisi dilewati (kembali ke langkah 5). Jika sisi ini dimasukkan, akan terbentuk siklus.

![Kruskal 13. Sisi (b,h) bobot 11 diberi garis putus-putus hitam dan ditolak. Sisi tebal di A: (h,g), (c,i), (g,f), (a,b), (c,f), (c,d), (b,c), (d,e).](/materi/mst/kruskal-13.png)

::slide 14. Sisi (d, f) = 14: ditolak
Langkah 5, putaran 14: sisi $(d, f)$ dengan bobot 14. Langkah 6: FIND-SET$(d)$ = {a,b,c,d,e,f,g,h,i} dan FIND-SET$(f)$ = {a,b,c,d,e,f,g,h,i}. Kedua simpul sudah berada di himpunan yang sama, jadi langkah 6 bernilai *false* dan sisi dilewati (kembali ke langkah 5). Jika sisi ini dimasukkan, akan terbentuk siklus. Semua sisi sudah diperiksa (*end for* di langkah 5), lanjut ke langkah 9: kembalikan $A$.

![Kruskal 14. Sisi (d,f) bobot 14 diberi garis putus-putus hitam dan ditolak. Sisi tebal di A: (h,g), (c,i), (g,f), (a,b), (c,f), (c,d), (b,c), (d,e).](/materi/mst/kruskal-14.png)
:::

### Hasil penelusuran

Hasil langkah 9 adalah $A = \{(h,g), (c,i), (g,f), (a,b), (c,f), (c,d), (b,c), (d,e)\}$ dengan total bobot $1 + 2 + 2 + 4 + 4 + 7 + 8 + 9 = 37$. Hasil yang sama dapat ditulis sebagai tabel:

| Sisi | Bobot | FIND-SET(u) ≠ FIND-SET(v) | Himpunan A | Himpunan hasil UNION |
| --- | --- | --- | --- | --- |
| (h,g) | 1 | *true* | {(h,g)} | {a},{b},{c},{d},{e},{f},{g,h},{i} |
| (c,i) | 2 | *true* | {(h,g),(c,i)} | {a},{b},{c,i},{d},{e},{f},{g,h} |
| (g,f) | 2 | *true* | {(h,g),(c,i),(g,f)} | {a},{b},{c,i},{d},{e},{f,g,h} |
| (a,b) | 4 | *true* | {(h,g),(c,i),(g,f),(a,b)} | {a,b},{c,i},{d},{e},{f,g,h} |
| (c,f) | 4 | *true* | {(h,g),(c,i),(g,f),(a,b),(c,f)} | {a,b},{c,f,g,h,i},{d},{e} |
| (g,i) | 6 | *false* | {(h,g),(c,i),(g,f),(a,b),(c,f)} | {a,b},{c,f,g,h,i},{d},{e} |
| (c,d) | 7 | *true* | {(h,g),(c,i),(g,f),(a,b),(c,f),(c,d)} | {a,b},{c,d,f,g,h,i},{e} |
| (h,i) | 7 | *false* | {(h,g),(c,i),(g,f),(a,b),(c,f),(c,d)} | {a,b},{c,d,f,g,h,i},{e} |
| (b,c) | 8 | *true* | {(h,g),(c,i),(g,f),(a,b),(c,f),(c,d),(b,c)} | {a,b,c,d,f,g,h,i},{e} |
| (a,h) | 8 | *false* | {(h,g),(c,i),(g,f),(a,b),(c,f),(c,d),(b,c)} | {a,b,c,d,f,g,h,i},{e} |
| (d,e) | 9 | *true* | {(h,g),(c,i),(g,f),(a,b),(c,f),(c,d),(b,c),(d,e)} | {a,b,c,d,e,f,g,h,i} |
| (e,f) | 10 | *false* | {(h,g),(c,i),(g,f),(a,b),(c,f),(c,d),(b,c),(d,e)} | {a,b,c,d,e,f,g,h,i} |
| (b,h) | 11 | *false* | {(h,g),(c,i),(g,f),(a,b),(c,f),(c,d),(b,c),(d,e)} | {a,b,c,d,e,f,g,h,i} |
| (d,f) | 14 | *false* | {(h,g),(c,i),(g,f),(a,b),(c,f),(c,d),(b,c),(d,e)} | {a,b,c,d,e,f,g,h,i} |

Perhatikan beberapa hal pada tabel:

- Sisi pada kolom $A$ hanya bertambah ketika hasil uji *true*, dan pada saat itu jumlah himpunan berkurang satu. Dari 9 himpunan di awal, 8 kali UNION menyisakan 1 himpunan.
- Sisi $(g,i) = 6$ ditolak karena $g$ dan $i$ sudah satu himpunan lewat $\{c,f,g,h,i\}$. Sisi $(h,i) = 7$, $(a,h) = 8$, $(e,f) = 10$, $(b,h) = 11$, dan $(d,f) = 14$ ditolak dengan alasan yang sama. Jadi ada 6 sisi ditolak dan 8 sisi diterima.
- Setelah sisi ke-8 diterima, semua simpul sudah satu himpunan. Sisi sisanya pasti ditolak, tetapi algoritma tetap memeriksanya sampai langkah 5 selesai.

:::reveal Mengapa hasilnya tetap 37 bila (a,h) dicoba lebih dulu daripada (b,c)?
Bobot $(b,c)$ dan $(a,h)$ sama-sama 8, jadi urutannya bebas. Bila $(a,h)$ dicoba lebih dulu, sisi itu diterima (sebab $a$ dan $h$ masih di himpunan berbeda), lalu $(b,c)$ ditolak karena $b$ dan $c$ sudah satu himpunan. Pohonnya berbeda, yaitu $(a,h)$ menggantikan $(b,c)$, tetapi total bobotnya tetap $37$. Jadi MST **tidak selalu unik** bila ada bobot yang sama, walaupun total bobot minimumnya selalu sama. Gambar buku Cormen untuk contoh ini memakai urutan $(a,h)$ lebih dulu.
:::

:::quiz Cek pemahaman: contoh Kruskal
::question Sisi mana yang diperiksa paling awal pada contoh?
- [x] $(h,g)$ dengan bobot 1
- [ ] $(a,b)$ dengan bobot 4
- [ ] $(d,f)$ dengan bobot 14
::explain
Sisi diurutkan dari bobot terkecil. Bobot terkecil adalah 1, yaitu sisi $(h,g)$, dan sisi ini langsung diterima.
::question Mengapa sisi $(g,i) = 6$ ditolak?
- [ ] Karena bobot 6 terlalu besar
- [x] Karena $g$ dan $i$ sudah berada di himpunan yang sama
- [ ] Karena $g$ dan $i$ tidak bertetangga
::explain
Saat $(g,i)$ diperiksa, himpunannya adalah $\{a,b\}$, $\{c,f,g,h,i\}$, $\{d\}$, dan $\{e\}$. Simpul $g$ dan $i$ ada di himpunan yang sama, jadi FIND-SET$(g) =$ FIND-SET$(i)$ dan sisi ini akan membentuk siklus.
::question Berapa sisi yang ditolak pada contoh?
- [ ] 5
- [x] 6
- [ ] 8
::explain
Dari 14 sisi, 8 diterima (jumlah simpul dikurangi 1), sehingga $14 - 8 = 6$ ditolak.
::question Berapa total bobot MST hasil Kruskal pada contoh?
- [ ] 35
- [x] 37
- [ ] 41
::explain
Jumlah bobot 8 sisi pada $A$: $1 + 2 + 2 + 4 + 4 + 7 + 8 + 9 = 37$.
:::

### Peraga: Penelusuran Kruskal

Peraga ini menjalankan pseudocode MST-KRUSKAL$(G, w)$ baris demi baris pada graf yang Anda isi. Isian awalnya adalah contoh di bagian C, dengan sisi sudah ditulis menurut urutan hasil langkah 4, jadi sisi yang diterima, himpunan $A$, dan himpunan terpisah pada tiap langkah sama dengan tabel hasil di atas.

- Tabel **Sisi terurut menurut bobot** muncul setelah langkah 4. Sisi yang sedang diperiksa bertanda ▶, sisi yang diterima bertanda ★ dan tertulis "diterima", dan sisi yang ditolak berpola garis diagonal dan tertulis "ditolak", jadi statusnya tidak hanya dibedakan lewat warna.
- Daftar **Himpunan terpisah** menunjukkan hasil MAKE-SET dan UNION saat ini, dan daftar **Himpunan A** menunjukkan sisi yang sudah dipilih. Pada langkah 6, variabel FIND-SET$(u)$ dan FIND-SET$(v)$ menunjukkan isi kedua himpunan yang dibandingkan. Bila keduanya sama, sisi ditolak dan langkah 7 dan 8 dilewati.
- Baris 2 dan 3 (perulangan inisialisasi) ditampilkan ringkas: tiap baris satu langkah yang berlaku untuk semua simpul sekaligus. Mulai baris 4, satu langkah sama dengan satu baris yang dibaca, termasuk baris 5 saat sisi sudah habis (*end for*). Karena itu graf dengan $n$ simpul dan $m$ sisi selalu memakai $2m + 2n + 4$ langkah, yaitu 50 langkah untuk contoh.
- Simpul ditulis di isian V, dan sisi ditulis di isian E sebagai `u-v:bobot`, misalnya `a-b:4`. **Sisi berbobot sama tetap menurut urutan penulisannya** (pengurutan stabil). Coba tombol "Urutan seperti gambar buku": sisi $(a,h)$ ditulis sebelum $(b,c)$, jadi $(a,h)$ diterima dan $(b,c)$ ditolak. Pohonnya berbeda, tetapi total bobotnya tetap 37, seperti pada jawaban lipat di atas. Graf harus terhubung, maksimal 9 simpul dan 16 sisi, dengan bobot 0 sampai 99.

::trace mst-kruskal

## D. Algoritma Prim

Algoritma Prim membangun satu pohon yang dimulai dari simpul awal (akar $r$). Pada tiap langkah, pohon dibesarkan dengan menambahkan simpul di luar pohon yang paling murah dijangkau dari pohon.

### Pseudocode

Prosedur MST-PRIM$(G, w, r)$. Nomor baris di pinggir sama dengan nomor langkah yang dijelaskan di bawah.

```pseudocode
for each u ∈ G.V
    u.key = ∞
    u.π = NIL
r.key = 0
Q = G.V
while Q ≠ ∅
    u = EXTRACT-MIN(Q)
    for each v ∈ G.Adj[u]
        if v ∈ Q and w(u, v) < v.key
            v.π = u
            v.key = w(u, v)
```

$(G, w, r)$ adalah masukan algoritma: $G$ graf tak berarah yang disimpan sebagai *adjacency-list*, $w$ bobot tiap sisi, dan $r$ simpul awal (akar).

### Atribut dan notasi

| Notasi | Arti |
| --- | --- |
| $u.key$ | Nilai simpul $u$: bobot sisi termurah yang sejauh ini menghubungkan $u$ ke pohon |
| $u.\pi$ | *Predecessor* (*parent*) simpul $u$ pada pohon |
| $Adj[u]$ | Simpul-simpul tetangga $u$ pada *adjacency-list* |
| $w(u, v)$ | Bobot sisi $(u, v)$ |
| $Q$ | Himpunan simpul yang belum masuk pohon (antrean prioritas menurut $key$) |

:::steps Arti tiap langkah MST-PRIM
::slide Langkah 1 sampai 4: inisialisasi
Semua simpul diberi $key = \infty$ dan $\pi$ = NIL (tidak ada *parent*), kecuali akar $r$ yang diberi $r.key = 0$ supaya akar dikeluarkan lebih dulu.

::slide Langkah 5: himpunan Q
$Q$ berisi semua simpul graf $G$.

::slide Langkah 6: perulangan while
Selama $Q$ tidak kosong, jalankan langkah 7 dan 8. Jika $Q$ kosong (*end while*), algoritma Prim selesai.

::slide Langkah 7: EXTRACT-MIN
EXTRACT-MIN$(Q)$ mengeluarkan satu simpul $u$ dari $Q$ yang nilai $key$-nya terkecil. Pada putaran pertama, simpul yang dikeluarkan adalah akar. Bila ada beberapa simpul dengan $key$ sama, yang dipilih menurut urutan simpul di $Q$.

::slide Langkah 8: tetangga u
Perulangan *for*: simpul $v$ diambil menurut urutan *adjacency-list* $Adj[u]$, dengan $u$ simpul yang baru dikeluarkan di langkah 7. Selama ada $v$, lanjut ke langkah 9. Jika tetangga habis (*end for*), kembali ke langkah 6.

::slide Langkah 9: uji perbaikan
Jika $v$ masih ada di $Q$ **dan** $w(u, v) < v.key$, hasilnya *true* dan lanjut ke langkah 10 dan 11. Jika *false*, kembali ke langkah 8 untuk tetangga berikutnya.

::slide Langkah 10 dan 11: perbarui v
$v.\pi = u$ (pada gambar graf, sisi $(u, v)$ menjadi kandidat sisi pohon), lalu $v.key = w(u, v)$.
:::

:::quiz Cek pemahaman: algoritma Prim
::question Apa nilai $key$ awal akar $r$ dan simpul lainnya?
- [ ] Semuanya $\infty$
- [x] $r.key = 0$ dan simpul lain $\infty$
- [ ] Semuanya 0
::explain
Langkah 1 sampai 4 memberi $\infty$ pada semua simpul, lalu langkah 4 mengubah $r.key$ menjadi 0 supaya EXTRACT-MIN pertama mengeluarkan akar.
::question Apa yang dikeluarkan EXTRACT-MIN$(Q)$?
- [ ] Simpul dengan nomor terkecil
- [x] Simpul di $Q$ dengan $key$ terkecil
- [ ] Simpul dengan tetangga terbanyak
::explain
EXTRACT-MIN memilih menurut nilai $key$, yaitu bobot sisi termurah yang diketahui menuju simpul itu dari pohon.
::question Kapan $v.key$ dan $v.\pi$ diperbarui?
- [ ] Setiap kali $v$ menjadi tetangga $u$
- [x] Jika $v \in Q$ dan $w(u, v) < v.key$
- [ ] Jika $v$ sudah di-extract dari $Q$
::explain
Hanya simpul yang masih di $Q$ yang boleh diperbarui, dan hanya bila sisi $(u, v)$ lebih murah daripada kandidat yang sudah ada.
::question Mengapa langkah 9 mensyaratkan $v \in Q$?
- [ ] Supaya $Q$ tidak pernah kosong
- [x] Supaya simpul yang sudah di pohon tidak dimasukkan lagi, yang akan membentuk siklus
- [ ] Supaya $key$ selalu bernilai $\infty$
::explain
Simpul yang sudah di-extract sudah menjadi bagian pohon. Menyambungnya lagi dengan sisi lain akan membentuk siklus.
:::

## E. Contoh Prim

Gunakan algoritma Prim dengan akar $a$ untuk mencari MST dari graf yang sama pada bagian A.

### Adjacency-list masukan

| Simpul $u$ | $Adj[u]$ |
| --- | --- |
| $a$ | $b, h$ |
| $b$ | $a, c, h$ |
| $c$ | $b, i, f, d$ |
| $d$ | $c, e, f$ |
| $e$ | $d, f$ |
| $f$ | $c, d, e, g$ |
| $g$ | $f, h, i$ |
| $h$ | $a, b, g, i$ |
| $i$ | $c, g, h$ |

Urutan $Adj[u]$ menentukan urutan simpul $v$ diperiksa di langkah 8. Dalam $Q$, simpul diurutkan $a, b, c, d, e, f, g, h, i$, dan urutan itu dipakai untuk memutus seri pada EXTRACT-MIN.

### Penelusuran

Pada gambar, **angka di dalam simpul** adalah nilai $key$ dan huruf di luar simpul adalah namanya. Simpul **abu-abu** sudah di-extract dari $Q$, dan simpul yang baru di-extract diberi garis tepi tebal. Sisi **abu-abu tebal** adalah sisi $(v.\pi, v)$ untuk simpul $v$ yang sudah di-extract, yaitu sisi pohon rentang minimum yang sudah terbentuk.

:::steps Penelusuran Prim putaran demi putaran
::slide 0. Inisialisasi (langkah 1 sampai 5)
Langkah 1 sampai 4: semua simpul diberi $key = \infty$ dan $\pi$ = NIL, kecuali akar $r = a$ yang diberi $a.key = 0$. Langkah 5: $Q = \{a, b, c, d, e, f, g, h, i\}$. Angka di dalam simpul adalah nilai $key$, sedangkan huruf di luar simpul adalah namanya.

![Prim 0. Inisialisasi. Simpul a bernilai 0 dan semua simpul lain bernilai tak hingga. Belum ada simpul yang di-extract dan belum ada sisi tebal.](/materi/mst/prim-00.png)

::slide 1. EXTRACT-MIN: a
Langkah 6: $Q \ne \emptyset$, jadi *true*. Langkah 7: EXTRACT-MIN$(Q)$ mengeluarkan $u = a$, yaitu akar dengan $key = 0$. Sekarang $Q = \{b, c, d, e, f, g, h, i\}$.

Langkah 8 sampai 11 untuk tiap $v \in Adj[a]$, yaitu $b, h$:

- $v = b$: $b \in Q$ dan $w(a, b) = 4 < b.key = \infty$, jadi *true*. Langkah 10: $b.\pi = a$. Langkah 11: $b.key = 4$.
- $v = h$: $h \in Q$ dan $w(a, h) = 8 < h.key = \infty$, jadi *true*. Langkah 10: $h.\pi = a$. Langkah 11: $h.key = 8$.

Setelah *end for*, kembali ke langkah 6.

![Prim 1. Simpul a di-extract dan menjadi abu-abu bergaris tebal. Nilai key tiap simpul: a=0, b=4, c=∞, d=∞, e=∞, f=∞, g=∞, h=8, i=∞. Sisi pohon tebal: belum ada.](/materi/mst/prim-01.png)

::slide 2. EXTRACT-MIN: b
Langkah 6: $Q \ne \emptyset$, jadi *true*. Langkah 7: EXTRACT-MIN$(Q)$ mengeluarkan $u = b$ dengan $key = 4$. Sekarang $Q = \{c, d, e, f, g, h, i\}$.

Langkah 8 sampai 11 untuk tiap $v \in Adj[b]$, yaitu $a, c, h$:

- $v = a$: $a$ sudah di-extract (tidak ada di $Q$), langkah 9 *false*.
- $v = c$: $c \in Q$ dan $w(b, c) = 8 < c.key = \infty$, jadi *true*. Langkah 10: $c.\pi = b$. Langkah 11: $c.key = 8$.
- $v = h$: $h \in Q$ tetapi $w(b, h) = 11$ tidak kurang dari $h.key = 8$, langkah 9 *false*, tidak ada perubahan.

Setelah *end for*, kembali ke langkah 6.

![Prim 2. Simpul b di-extract dan menjadi abu-abu bergaris tebal. Nilai key tiap simpul: a=0, b=4, c=8, d=∞, e=∞, f=∞, g=∞, h=8, i=∞. Sisi pohon tebal: (a,b).](/materi/mst/prim-02.png)

::slide 3. EXTRACT-MIN: c
Langkah 6: $Q \ne \emptyset$, jadi *true*. Langkah 7: EXTRACT-MIN$(Q)$ mengeluarkan $u = c$ dengan $key = 8$. Simpul $c$ dan $h$ sama-sama bernilai 8; yang dikeluarkan adalah $c$ karena lebih dulu dalam urutan $Q$. Sekarang $Q = \{d, e, f, g, h, i\}$.

Langkah 8 sampai 11 untuk tiap $v \in Adj[c]$, yaitu $b, i, f, d$:

- $v = b$: $b$ sudah di-extract (tidak ada di $Q$), langkah 9 *false*.
- $v = i$: $i \in Q$ dan $w(c, i) = 2 < i.key = \infty$, jadi *true*. Langkah 10: $i.\pi = c$. Langkah 11: $i.key = 2$.
- $v = f$: $f \in Q$ dan $w(c, f) = 4 < f.key = \infty$, jadi *true*. Langkah 10: $f.\pi = c$. Langkah 11: $f.key = 4$.
- $v = d$: $d \in Q$ dan $w(c, d) = 7 < d.key = \infty$, jadi *true*. Langkah 10: $d.\pi = c$. Langkah 11: $d.key = 7$.

Setelah *end for*, kembali ke langkah 6.

![Prim 3. Simpul c di-extract dan menjadi abu-abu bergaris tebal. Nilai key tiap simpul: a=0, b=4, c=8, d=7, e=∞, f=4, g=∞, h=8, i=2. Sisi pohon tebal: (a,b), (b,c).](/materi/mst/prim-03.png)

::slide 4. EXTRACT-MIN: i
Langkah 6: $Q \ne \emptyset$, jadi *true*. Langkah 7: EXTRACT-MIN$(Q)$ mengeluarkan $u = i$ dengan $key = 2$. Sekarang $Q = \{d, e, f, g, h\}$.

Langkah 8 sampai 11 untuk tiap $v \in Adj[i]$, yaitu $c, g, h$:

- $v = c$: $c$ sudah di-extract (tidak ada di $Q$), langkah 9 *false*.
- $v = g$: $g \in Q$ dan $w(i, g) = 6 < g.key = \infty$, jadi *true*. Langkah 10: $g.\pi = i$. Langkah 11: $g.key = 6$.
- $v = h$: $h \in Q$ dan $w(i, h) = 7 < h.key = 8$, jadi *true*. Langkah 10: $h.\pi = i$. Langkah 11: $h.key = 7$.

Setelah *end for*, kembali ke langkah 6.

![Prim 4. Simpul i di-extract dan menjadi abu-abu bergaris tebal. Nilai key tiap simpul: a=0, b=4, c=8, d=7, e=∞, f=4, g=6, h=7, i=2. Sisi pohon tebal: (a,b), (b,c), (c,i).](/materi/mst/prim-04.png)

::slide 5. EXTRACT-MIN: f
Langkah 6: $Q \ne \emptyset$, jadi *true*. Langkah 7: EXTRACT-MIN$(Q)$ mengeluarkan $u = f$ dengan $key = 4$. Sekarang $Q = \{d, e, g, h\}$.

Langkah 8 sampai 11 untuk tiap $v \in Adj[f]$, yaitu $c, d, e, g$:

- $v = c$: $c$ sudah di-extract (tidak ada di $Q$), langkah 9 *false*.
- $v = d$: $d \in Q$ tetapi $w(f, d) = 14$ tidak kurang dari $d.key = 7$, langkah 9 *false*, tidak ada perubahan.
- $v = e$: $e \in Q$ dan $w(f, e) = 10 < e.key = \infty$, jadi *true*. Langkah 10: $e.\pi = f$. Langkah 11: $e.key = 10$.
- $v = g$: $g \in Q$ dan $w(f, g) = 2 < g.key = 6$, jadi *true*. Langkah 10: $g.\pi = f$. Langkah 11: $g.key = 2$.

Setelah *end for*, kembali ke langkah 6.

![Prim 5. Simpul f di-extract dan menjadi abu-abu bergaris tebal. Nilai key tiap simpul: a=0, b=4, c=8, d=7, e=10, f=4, g=2, h=7, i=2. Sisi pohon tebal: (a,b), (b,c), (c,f), (c,i).](/materi/mst/prim-05.png)

::slide 6. EXTRACT-MIN: g
Langkah 6: $Q \ne \emptyset$, jadi *true*. Langkah 7: EXTRACT-MIN$(Q)$ mengeluarkan $u = g$ dengan $key = 2$. Sekarang $Q = \{d, e, h\}$.

Langkah 8 sampai 11 untuk tiap $v \in Adj[g]$, yaitu $f, h, i$:

- $v = f$: $f$ sudah di-extract (tidak ada di $Q$), langkah 9 *false*.
- $v = h$: $h \in Q$ dan $w(g, h) = 1 < h.key = 7$, jadi *true*. Langkah 10: $h.\pi = g$. Langkah 11: $h.key = 1$.
- $v = i$: $i$ sudah di-extract (tidak ada di $Q$), langkah 9 *false*.

Setelah *end for*, kembali ke langkah 6.

![Prim 6. Simpul g di-extract dan menjadi abu-abu bergaris tebal. Nilai key tiap simpul: a=0, b=4, c=8, d=7, e=10, f=4, g=2, h=1, i=2. Sisi pohon tebal: (a,b), (b,c), (c,f), (f,g), (c,i).](/materi/mst/prim-06.png)

::slide 7. EXTRACT-MIN: h
Langkah 6: $Q \ne \emptyset$, jadi *true*. Langkah 7: EXTRACT-MIN$(Q)$ mengeluarkan $u = h$ dengan $key = 1$. Sekarang $Q = \{d, e\}$.

Langkah 8 sampai 11 untuk tiap $v \in Adj[h]$, yaitu $a, b, g, i$:

- $v = a$: $a$ sudah di-extract (tidak ada di $Q$), langkah 9 *false*.
- $v = b$: $b$ sudah di-extract (tidak ada di $Q$), langkah 9 *false*.
- $v = g$: $g$ sudah di-extract (tidak ada di $Q$), langkah 9 *false*.
- $v = i$: $i$ sudah di-extract (tidak ada di $Q$), langkah 9 *false*.

Setelah *end for*, kembali ke langkah 6.

![Prim 7. Simpul h di-extract dan menjadi abu-abu bergaris tebal. Nilai key tiap simpul: a=0, b=4, c=8, d=7, e=10, f=4, g=2, h=1, i=2. Sisi pohon tebal: (a,b), (b,c), (c,f), (f,g), (g,h), (c,i).](/materi/mst/prim-07.png)

::slide 8. EXTRACT-MIN: d
Langkah 6: $Q \ne \emptyset$, jadi *true*. Langkah 7: EXTRACT-MIN$(Q)$ mengeluarkan $u = d$ dengan $key = 7$. Sekarang $Q = \{e\}$.

Langkah 8 sampai 11 untuk tiap $v \in Adj[d]$, yaitu $c, e, f$:

- $v = c$: $c$ sudah di-extract (tidak ada di $Q$), langkah 9 *false*.
- $v = e$: $e \in Q$ dan $w(d, e) = 9 < e.key = 10$, jadi *true*. Langkah 10: $e.\pi = d$. Langkah 11: $e.key = 9$.
- $v = f$: $f$ sudah di-extract (tidak ada di $Q$), langkah 9 *false*.

Setelah *end for*, kembali ke langkah 6.

![Prim 8. Simpul d di-extract dan menjadi abu-abu bergaris tebal. Nilai key tiap simpul: a=0, b=4, c=8, d=7, e=9, f=4, g=2, h=1, i=2. Sisi pohon tebal: (a,b), (b,c), (c,d), (c,f), (f,g), (g,h), (c,i).](/materi/mst/prim-08.png)

::slide 9. EXTRACT-MIN: e
Langkah 6: $Q \ne \emptyset$, jadi *true*. Langkah 7: EXTRACT-MIN$(Q)$ mengeluarkan $u = e$ dengan $key = 9$. Sekarang $Q = \emptyset$.

Langkah 8 sampai 11 untuk tiap $v \in Adj[e]$, yaitu $d, f$:

- $v = d$: $d$ sudah di-extract (tidak ada di $Q$), langkah 9 *false*.
- $v = f$: $f$ sudah di-extract (tidak ada di $Q$), langkah 9 *false*.

Setelah *end for*, kembali ke langkah 6: $Q = \emptyset$ (*end while*), algoritma Prim selesai.

![Prim 9. Simpul e di-extract dan menjadi abu-abu bergaris tebal. Nilai key tiap simpul: a=0, b=4, c=8, d=7, e=9, f=4, g=2, h=1, i=2. Sisi pohon tebal: (a,b), (b,c), (c,d), (d,e), (c,f), (f,g), (g,h), (c,i).](/materi/mst/prim-09.png)
:::

### Hasil penelusuran

Urutan simpul yang di-extract adalah $a, b, c, i, f, g, h, d, e$. Ringkasan perubahan tiap putaran:

| Loop | $u$ (EXTRACT-MIN) | $u.key$ | Perubahan di langkah 10 dan 11 |
| --- | --- | --- | --- |
| 1 | $a$ | 0 | $b$: $key = 4$, $\pi = a$; $h$: $key = 8$, $\pi = a$ |
| 2 | $b$ | 4 | $c$: $key = 8$, $\pi = b$ |
| 3 | $c$ | 8 | $i$: $key = 2$, $\pi = c$; $f$: $key = 4$, $\pi = c$; $d$: $key = 7$, $\pi = c$ |
| 4 | $i$ | 2 | $g$: $key = 6$, $\pi = i$; $h$: $key = 7$, $\pi = i$ |
| 5 | $f$ | 4 | $e$: $key = 10$, $\pi = f$; $g$: $key = 2$, $\pi = f$ |
| 6 | $g$ | 2 | $h$: $key = 1$, $\pi = g$ |
| 7 | $h$ | 1 | tidak ada |
| 8 | $d$ | 7 | $e$: $key = 9$, $\pi = d$ |
| 9 | $e$ | 9 | tidak ada |

Nilai akhir tiap simpul:

| Simpul | $key$ | $\pi$ | Sisi pohon $(\pi, \text{simpul})$ |
| --- | --- | --- | --- |
| $a$ | 0 | NIL | – |
| $b$ | 4 | $a$ | $(a, b)$ |
| $c$ | 8 | $b$ | $(b, c)$ |
| $d$ | 7 | $c$ | $(c, d)$ |
| $e$ | 9 | $d$ | $(d, e)$ |
| $f$ | 4 | $c$ | $(c, f)$ |
| $g$ | 2 | $f$ | $(f, g)$ |
| $h$ | 1 | $g$ | $(g, h)$ |
| $i$ | 2 | $c$ | $(c, i)$ |

Tree yang terbentuk adalah $\{(a,b), (b,c), (c,d), (c,f), (c,i), (d,e), (f,g), (g,h)\}$ dengan total bobot $4 + 8 + 7 + 4 + 2 + 9 + 2 + 1 = 37$, yaitu jumlah $key$ semua simpul. Himpunan ini sama dengan hasil Kruskal.

:::quiz Cek pemahaman: contoh Prim
::question Bagaimana urutan simpul yang di-extract pada contoh dengan akar $a$?
- [x] $a, b, c, i, f, g, h, d, e$
- [ ] $a, b, h, c, i, f, g, d, e$
- [ ] $a, b, c, d, e, f, g, h, i$
::explain
Pada tiap putaran yang dikeluarkan adalah simpul dengan $key$ terkecil di $Q$, bukan simpul menurut abjad. Karena itu setelah $c$ keluar, $i$ ($key = 2$) dan $f$ ($key = 4$) lebih dulu daripada $d$ ($key = 7$).
::question Pada putaran 3, $c.key$ dan $h.key$ sama-sama 8. Mengapa yang di-extract $c$?
- [ ] Karena $c$ punya lebih banyak tetangga
- [x] Karena $c$ lebih dulu daripada $h$ dalam urutan simpul di $Q$
- [ ] Karena sisi $(b,c)$ lebih ringan daripada $(a,h)$
::explain
Bobot kedua sisi sama-sama 8, jadi seri diputus menurut urutan simpul di $Q$. Bila $h$ yang dikeluarkan lebih dulu, pohon yang terbentuk bisa berbeda, tetapi total bobotnya tetap 37.
::question Mengapa $h.key$ turun dari 8 menjadi 7, lalu menjadi 1?
- [ ] Karena bobot sisi $(a,h)$ berubah
- [x] Karena di putaran 4 sisi $(i,h) = 7 < 8$, dan di putaran 6 sisi $(g,h) = 1 < 7$
- [ ] Karena $h$ sudah di-extract
::explain
Langkah 9 *true* setiap kali ada sisi yang lebih murah menuju $h$ selagi $h$ masih di $Q$. Setelah $h.key$ menjadi 1, tidak ada sisi yang lebih murah lagi, dan $h$ di-extract di putaran 7.
::question Berapa $e.key$ dan $e.\pi$ pada hasil akhir?
- [ ] 10 dan $f$
- [x] 9 dan $d$
- [ ] 9 dan $f$
::explain
Pada putaran 5, $f$ memberi $e.key = 10$. Pada putaran 8, $d$ memberi $w(d,e) = 9 < 10$, jadi $e.key = 9$ dan $e.\pi = d$.
::question Berapa total bobot MST pada contoh?
- [ ] 35
- [x] 37
- [ ] 41
::explain
Jumlah $key$ semua simpul: $0 + 4 + 8 + 7 + 9 + 4 + 2 + 1 + 2 = 37$.
:::

### Peraga: Penelusuran Prim

Peraga ini menjalankan pseudocode MST-PRIM$(G, w, r)$ baris demi baris pada graf berbobot yang Anda isi. Isian awalnya adalah contoh di bagian E (akar $a$), jadi nilai $key$ pada akhir tiap putaran sama dengan panel (a) sampai (i) dan dengan tabel perubahan di atas.

- Tabel **Atribut tiap simpul** menunjukkan $key$ dan $\pi$ tiap simpul. Simpul yang masih di $Q$ berlatar putih, simpul yang sudah di-extract bertanda ● (abu-abu pada gambar), simpul $u$ yang baru di-extract bertanda ▶, dan tetangga $v$ yang sedang diperiksa bertanda khusus, jadi statusnya tidak hanya dibedakan lewat warna.
- Daftar **Himpunan Q** menuliskan simpul yang tersisa menurut urutan penulisan, dengan $key$ di dalam kurung. Daftar **Tetangga** menunjukkan $Adj[u]$ beserta bobotnya, dan daftar **Sisi tebal** adalah sisi $(v.\pi, v)$ saat ini, yaitu sisi yang digambar tebal pada panel materi. Saat langkah 10 mengganti $h.\pi$ dari $a$ menjadi $i$ lalu $g$, sisi tebalnya ikut berganti. Di langkah terakhir muncul pohon rentang minimum dan totalnya.
- Baris 1 sampai 3 (perulangan inisialisasi) ditampilkan ringkas: tiap baris satu langkah yang berlaku untuk semua simpul sekaligus. Mulai baris 4, satu langkah sama dengan satu baris yang dibaca, termasuk header *for* di baris 8 tiap tetangga (ditambah satu pemeriksaan akhir saat tetangga habis) dan baris 6 saat $Q$ sudah kosong. Dengan $n$ simpul, $D$ = jumlah panjang semua $Adj$, dan $U$ = banyak pembaruan $key$, banyaknya langkah selalu $6 + 3n + 2D + 2U$, yaitu 113 langkah untuk contoh.
- Isiannya *adjacency-list* berbobot: simpul, titik dua, lalu tetangga dengan bobot dalam kurung, dipisah titik koma, misalnya `a: b(4), h(8)`. Tulis tiap sisi di kedua daftar dengan bobot yang sama. **Urutan penulisan simpul adalah urutan $Q$**, yang memutus seri EXTRACT-MIN: pada contoh, $c$ dan $h$ sama-sama bernilai 8, dan $c$ keluar lebih dulu karena ditulis lebih dulu. Coba tombol "akar e": urutan extract berubah, tetapi total bobotnya tetap 37. Graf harus terhubung, maksimal 9 simpul dan 16 sisi, dengan bobot 0 sampai 99.

::trace mst-prim

## F. Analisis Running Time

Bagian ini tambahan dari buku Cormen (tidak ada di dokumen kuliah). Ringkasan ini untuk graf terhubung dengan $\lvert V \rvert$ simpul dan $\lvert E \rvert$ sisi, sehingga $\lvert E \rvert \ge \lvert V \rvert - 1$.

:::steps Menghitung running time Kruskal dan Prim
::slide Kruskal
Langkah 4 mengurutkan $\lvert E \rvert$ sisi, yang memakan $O(E \lg E)$. Karena $\lvert E \rvert < \lvert V \rvert^2$, berlaku $\lg E = O(\lg V)$, jadi pengurutan memakan $O(E \lg V)$. Operasi MAKE-SET, FIND-SET, dan UNION pada *disjoint-set forest* dengan *union by rank* dan *path compression* hanya memakan $O(E \, \alpha(V))$, dengan $\alpha$ fungsi yang tumbuh sangat lambat, sehingga pengurutan yang mendominasi.

$$
O(E \lg V)
$$

::slide Prim
Waktunya bergantung pada struktur data $Q$. Dengan *binary min-heap*, inisialisasi memakan $O(V)$, tiap EXTRACT-MIN memakan $O(\lg V)$ untuk $\lvert V \rvert$ simpul, dan tiap pembaruan $key$ memakan $O(\lg V)$ untuk paling banyak $\lvert E \rvert$ sisi.

$$
O(E \lg V)
$$

Dengan *Fibonacci heap*, waktunya turun menjadi $O(E + V \lg V)$, yang lebih baik untuk graf padat. Bila $Q$ hanya larik biasa yang dipindai linier tiap kali, waktunya $O(V^2)$.
:::

:::quiz Cek pemahaman: running time MST
::question Bagian mana yang mendominasi waktu Kruskal?
- [ ] MAKE-SET untuk tiap simpul
- [x] Pengurutan sisi di langkah 4
- [ ] Pengembalian $A$ di langkah 9
::explain
Pengurutan memakan $O(E \lg E) = O(E \lg V)$, sedangkan operasi himpunan hanya $O(E \, \alpha(V))$.
::question Berapa running time Prim dengan *binary min-heap*?
- [ ] $O(V^2)$
- [x] $O(E \lg V)$
- [ ] $O(V + E)$
::explain
Ada $\lvert V \rvert$ EXTRACT-MIN dan paling banyak $\lvert E \rvert$ pembaruan $key$, masing-masing $O(\lg V)$.
:::

## G. Mencoba Visualisasi

Visualisasi di bawah ini menjalankan algoritma Prim dan Kruskal pada graf berbobot yang Anda isi. Tiap langkah menyorot baris kode, mewarnai simpul dan sisi, serta menampilkan tabel atau himpunan yang sedang dipakai.

Beberapa hal agar tidak bingung membandingkan dengan materi:

- Simpul pada visualisasi **bernomor 0 sampai $n - 1$**, bukan huruf. Pada contoh klasik, $a$ sampai $i$ adalah 0 sampai 8, jadi $(a,b)$ ditulis `0-1` dan $(c,i)$ ditulis `2-8`. Kodenya berbentuk JavaScript, jadi nomor barisnya berbeda dari pseudocode di bagian B dan D.
- Sisi ditulis `u-v:bobot` dan graf harus **terhubung**. Bobot bilangan bulat 0 sampai 99, dengan n maksimal 9 dan sisi maksimal 16.
- Kruskal pada visualisasi mengurutkan sisi dengan **urutan stabil**: sisi berbobot sama tetap menurut urutan penulisannya. Pada contoh klasik, `0-7` $(a,h)$ ditulis sebelum `1-2` $(b,c)$, sehingga $(a,h)$ diterima dan $(b,c)$ ditolak. Pohonnya berbeda dari tabel di bagian C, tetapi total bobotnya tetap 37, seperti dibahas di jawaban lipat bagian C.
- Prim pada visualisasi memilih simpul dengan $key$ terkecil lewat **pemindaian larik**, bukan antrean prioritas. Hasilnya sama, hanya waktunya $O(V^2)$. Bila $key$ sama, simpul bernomor lebih kecil dipilih lebih dulu, sama dengan urutan $Q$ di bagian E. Urutan tetangga mengikuti urutan penulisan sisi, jadi urutan $Adj[c]$ bisa berbeda dari tabel bagian E, tetapi pohon dan total bobotnya sama.
- Tombol contoh dan isian ada di panel "Ubah masukan". Contoh "Semua bobot sama" menunjukkan MST yang tidak unik.
- Visualisasi ini menunjukkan jalannya algoritma pada graf. Untuk menelusuri **pseudocode bagian B dan D baris demi baris** pada contoh materi, gunakan peraga penelusuran di akhir bagian C (Kruskal) dan bagian E (Prim).

::visualizer

## H. Rangkuman

| Hal | Isi |
| --- | --- |
| MST | Pohon yang menghubungkan semua simpul graf tak berarah berbobot dengan total bobot minimum, tanpa siklus, dengan $\lvert V \rvert - 1$ sisi |
| Kruskal | Urutkan sisi. Terima sisi bila FIND-SET$(u) \ne$ FIND-SET$(v)$, lalu UNION$(u, v)$ |
| Prim | Mulai dari akar $r$ dengan $r.key = 0$. EXTRACT-MIN simpul dengan $key$ terkecil, lalu perbarui $key$ dan $\pi$ tetangganya yang masih di $Q$ bila $w(u, v) < v.key$ |
| Struktur data | Kruskal: *disjoint set*. Prim: antrean prioritas dan *adjacency-list* |
| Contoh | Himpunan $A = \{(a,b), (b,c), (c,d), (c,f), (c,i), (d,e), (f,g), (g,h)\}$ dengan total bobot 37 |
| Seri bobot | MST bisa tidak unik, tetapi total bobot minimumnya selalu sama |
| Running time | Kruskal $O(E \lg V)$. Prim $O(E \lg V)$ dengan *binary heap* |

Cara cepat mengingat: **Kruskal menambah sisi paling ringan yang tidak membentuk siklus, sedangkan Prim membesarkan satu pohon lewat sisi paling murah ke simpul di luarnya**. Sekarang coba kerjakan soal challenge di bawah.

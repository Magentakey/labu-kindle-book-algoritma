# Panduan Visualizer Pohon

Visualizer pohon menggambar pohon (atau hutan) berdampingan dengan kode yang barisnya menyala, plus kontrol
Sebelumnya, Berikutnya, Putar otomatis, dan slider. Cara kerjanya sama dengan visualizer diagram batang.

## Yang sudah ada

| Kunci di `materials.json` | Materi | Isi |
| --- | --- | --- |
| `mergeSortTree` | 6 (Merge Sort) | Pohon rekursi: tiap simpul = satu pemanggilan `mergeSort(lo, hi)` |
| `recurrenceTree` | 7 (Recurrence & Master) | Pohon rekursi T(n) = a·T(n/b) + nᶜ, dibuka per level, dengan tabel biaya per level |
| `huffmanTree` | 10.2 (Huffman) | Hutan pohon yang digabung, antrean prioritas, dan kode tiap simbol |
| `bfsTree` | 11.1 (BFS) | Penelusuran per level pada pohon biner, dengan isi antrean |
| `dfsTree` | 11.2 (DFS) | Penelusuran preorder pada pohon biner, dengan isi tumpukan pemanggilan |

Satu materi boleh punya beberapa visualizer: `"visualizer": ["mergeSort", "mergeSortTree"]`.

Pohon biner ditulis dalam urutan level, `null` untuk anak yang tidak ada. Pohon pada gambar contoh adalah
`1, 2, 3, 4, 5`: 1 punya anak 2 dan 3, lalu 2 punya anak 4 dan 5.

## Menambah algoritma berbentuk pohon

1. Buat `src/algorithms/<nama>.js` yang mengekspor kode (teks) dan fungsi `buildSteps(masukan)`.
   Setiap langkah berbentuk:

   ```js
   {
     line: 5,                 // baris kode yang menyala (mulai dari 1), atau null
     note: 'Penjelasan singkat langkah ini.',
     view: {
       nodes: [{ id, parent, label, sub, edge, mark, side, hidden }],
       panels: [{ type: 'list', title, items, empty }, { type: 'table', caption, headers, rows, activeRow }],
       labels: { current: 'keterangan khusus untuk status ini' },
     },
   }
   ```

   - `parent` adalah `id` induk (`null` untuk akar). Urutan anak mengikuti urutan di array `nodes`.
   - `mark` adalah kunci pada `TREE_STATUS` (`src/components/TreeCanvas/treeStatuses.js`).
     Tiap status dibedakan oleh pola, simbol, dan teks, tidak hanya warna.
   - `side` (`'l'` atau `'r'`) menjaga posisi kiri/kanan pada pohon biner yang anaknya tunggal.
   - `hidden: true` menyembunyikan simpul tetapi tetap menyisakan tempatnya (dipakai pohon rekursi yang dibuka bertahap).
2. Daftarkan di `src/algorithms/registry.js` dengan `kind: 'tree'`, lengkap dengan `parseInput`, `formatInput`,
   `initialInput`, `presets`, dan `legend`. Contoh ada pada entri `bfsTree` dan `huffmanTree`.
3. Isi field `visualizer` materi di `src/content/materials.json` dengan kunci tadi.
4. Tambahkan tes di `src/algorithms/treeSteps.test.js`. Fungsi `checkSteps` di sana sudah memeriksa nomor baris,
   id simpul, status, dan tabrakan posisi untuk setiap langkah.

Jangan menambah atau menghapus baris pada kode tanpa menyesuaikan nomor `line` di langkah. `npm test` akan menangkap kesalahannya.

## Jenis visualizer lain

Field `kind` pada entri `registry.js` memilih komponen yang dipakai halaman Materi:

| `kind` | Komponen | Dipakai untuk |
| --- | --- | --- |
| (tanpa kind) | `AlgoVisualizer` | Diagram batang: insertion sort, merge sort |
| `tree` | `TreeVisualizer` | Pohon: BFS, DFS, Huffman, pohon rekursi |
| `search` | `SearchVisualizer` | Binary search (array terurut, nilai x, diagram batang) |
| `table` | `DpVisualizer` | Tabel DP: LCS (`lcsTable`) dan rantai matriks (`matrixChainTable`) |
| `plot` | `AsymptoticGraph` | Grafik fungsi untuk materi 3 sampai 5 (lihat bagian "Grafik asimtotik") |
| `timeline` | `TimelineVisualizer` | Garis waktu aktivitas untuk materi 10.1 (lihat bagian "Garis waktu Activity Selection") |
| `graph` | `GraphVisualizer` | Graf untuk materi 11.1, 11.2, 12, dan 13 (lihat bagian "Visualizer graf") |

Visualizer `table` menerima langkah berbentuk `{ line, note, view: { table, panels, labels } }`, dengan
`table = { caption, corner, rowHeaders, colHeaders, cells }` dan setiap sel `{ text, sub, mark, glyph }`.
`mark` adalah kunci pada `DP_STATUS` (`src/components/DpTable/dpStatuses.js`): `empty`, `filled`, `current`, `source`, `path`, `unused`.
Isian masukannya didaftarkan lewat `fields` (satu isian teks per kunci), misalnya `x` dan `y` untuk LCS.

## Grafik asimtotik (materi 3 sampai 5)

Berbeda dari visualizer lain, grafik ini tidak berjalan per langkah. Pembaca menggeser slider dan langsung melihat kurvanya berubah,
jadi tidak ada kode yang menyala dan tidak ada tombol Berikutnya. Ada tiga mode, dipilih lewat `mode` pada entri `registry.js`:

| Kunci di `materials.json` | Materi | `mode` | Isi |
| --- | --- | --- | --- |
| `growthPlot` | 3 (Pertumbuhan Fungsi) | `compare` | Dua fungsi A dan B (A bisa dikali konstanta c), kurva pembanding lain, dan titik di mana kurva saling menyalip |
| `boundPlot` | 4 (Θ, O, Ω) | `bound` | f(n) = a·n² + b·n + c terjepit di antara c1·n² dan c2·n², dengan n₀ untuk O, Ω, atau Θ |
| `littlePlot` | 5 (o dan ω) | `little` | Rasio f(n)/g(n) terhadap garis c, dengan n₀ untuk definisi o dan ω |

Entri registry untuk `kind: 'plot'` berisi `mode`, `title`, `initialInput`, `initialView` (`n`, `xMax`, `scale`), dan `presets`.
Bentuk `initialInput` bergantung pada mode: `{ a, b, mult, extras }` untuk `compare` (a dan b adalah kunci di `FUNCTIONS`),
`{ a, b, c, c1, c2, notation }` untuk `bound`, dan `{ f, g, ci }` untuk `little` (`ci` adalah indeks pada `C_VALUES`).

Semua perhitungannya ada di `src/lib/asymptotic.js` sebagai fungsi murni dan dites di `asymptotic.test.js`. Tes itu mencocokkan hasilnya dengan
kunci jawaban soal challenge materi 3 dan 4, jadi grafik dan soal tidak bisa saling bertentangan. Kelas fungsi baru (misalnya n·log²n)
ditambahkan di `FUNCTIONS` dengan `rank` yang benar, ditambah gayanya di `FN_STYLE` pada `AsymptoticGraph.jsx`.

Kurva dibedakan oleh pola garis, bentuk penanda, dan legenda teks, tidak hanya warna. Seluruh isi grafik juga tersedia sebagai tabel nilai di bawahnya.

## Garis waktu Activity Selection (materi 10.1)

Kunci `activitySelection` di `materials.json`. Aktivitas digambar sebagai batang pada sumbu waktu yang sama, satu baris per aktivitas
(dinamai a1, a2, ... menurut urutan masukan; di kode, a1 adalah indeks 0). Algoritmanya sama dengan solusi soal challenge:
urutkan menurut waktu selesai, lalu ambil aktivitas yang `start[i] >= akhir`.

- Garis putus-putus vertikal menandai `akhir`, yaitu waktu selesai aktivitas terpilih yang terakhir. Batang yang mulainya di kiri garis itu bentrok.
- Baris paling bawah ("Jadwal") menumpuk aktivitas terpilih dalam satu lajur. Panel di bawahnya berisi daftar `pilih` dan tabel keputusan tiap aktivitas.
- Satu langkah = satu baris kode yang berjalan. Baris 3 dan 4 (inisialisasi) digabung dalam satu langkah, jadi `line` bisa berupa larik `[3, 4]`.
  Jumlah langkahnya 4 + 2n + 2k untuk n aktivitas dan k yang terpilih (contoh klasik: 34).
- Status batang (`TIMELINE_STATUS` di `src/components/TimelineChart/timelineStatuses.js`): `normal`, `current`, `selected`, `rejected`.
  Seperti visualizer lain, tiap status dibedakan oleh pola, simbol, dan teks, tidak hanya warna.
- Isian masukan ada dua, `start` dan `finish`, sama dengan parameter soal challenge. Batasnya 1 sampai 12 aktivitas, waktu bilangan bulat 0 sampai 30, dan `finish` harus lebih besar dari `start`.
  Data tidak harus terurut. Contoh siap pakai mencakup data klasik, data tidak terurut dari soal challenge, aktivitas yang hanya bersentuhan, dan kasus saat aktivitas yang paling awal mulai bukan pilihan terbaik.

Garis waktu memakai HTML/CSS (bukan SVG) agar ukuran huruf tetap terbaca di layar sempit, dan daftarnya adalah `<ol>` sungguhan dengan teks tersembunyi untuk pembaca layar.
Tes di `src/algorithms/activitySelection.test.js` mencocokkan hasil dengan pembanding yang mencoba semua himpunan bagian dan dengan semua test case soal challenge,
sehingga visualizer dan soal tidak bisa saling bertentangan.

## Visualizer graf (materi 11.1, 11.2, 12, dan 13)

Enam entri `kind: 'graph'` di `registry.js`, semuanya memakai `GraphVisualizer` dan `GraphCanvas`:

| Kunci di `materials.json` | Materi | Graf | Hasil |
| --- | --- | --- | --- |
| `bfsGraph`, `dfsGraph` | 11.1, 11.2 | tak berarah, tanpa bobot, boleh tidak terhubung | urutan kunjungan |
| `prim`, `kruskal` | 12 | tak berarah, berbobot 0 sampai 99, harus terhubung | total bobot pohon rentang minimum |
| `dijkstra`, `bellmanFord` | 13 | berarah, berbobot (Dijkstra 0 sampai 99, Bellman-Ford −9 sampai 99) | jarak dari sumber |

Materi 11.1 dan 11.2 tetap menampilkan visualizer pohon (`bfsTree`, `dfsTree`) sesudah visualizer graf.

- **Masukan** berupa tiga isian teks yang sama dengan parameter soal challenge: jumlah simpul `n`, daftar sisi, dan simpul awal (`start` atau `source`).
  Sisi ditulis `u-v` (tak berarah), `u-v:bobot` (berbobot), atau `u>v:bobot` (berarah). Batasnya: n maksimal 9, sisi maksimal 16, tanpa sisi ke diri sendiri dan tanpa sisi ganda.
  Pembaca masukan, pemformat, dan pengacak ada di `src/algorithms/graphCommon.js` (`parseGraphFields`, `formatGraphInput`, `randomGraph`) dan dikonfigurasi per algoritma lewat objek `kind` di `registry.js`.
- **Letak simpul** otomatis melingkar (`layoutCircle`), jadi tidak ada koordinat yang perlu ditulis. Label bobot ditempatkan oleh `src/lib/graphLabels.js` agar menghindari simpul dan label lain.
- **Status** (`src/components/GraphCanvas/graphStatuses.js`): simpul memakai pola yang sama dengan pohon (`normal`, `queued`, `current`, `waiting`, `visited`); sisi punya `normal`, `considered`, `chosen`, `rejected`
  yang dibedakan oleh tebal garis, pola putus-putus, simbol, dan teks. Arti tiap status berbeda per algoritma, dan diisi lewat `view.labels` dan `view.edgeLabels`.
- Satu langkah = satu baris kode yang berjalan (atau beberapa baris yang selalu berjalan bersama, misalnya membangun daftar tetangga). Panel di bawah gambar menampilkan antrean, tumpukan, tabel jarak, atau urutan sisi.
- **Kode yang tampil dieksekusi apa adanya di tes** (`src/algorithms/graph.test.js`) dan dicocokkan dengan semua test case soal challenge. Hasil juga dicocokkan dengan pembanding independen pada graf acak:
  brute force semua himpunan sisi untuk MST, dan Floyd-Warshall untuk Dijkstra dan Bellman-Ford (termasuk bobot negatif dan deteksi siklus negatif).
- **Bellman-Ford mengembalikan `Infinity`, bukan −1, untuk simpul yang tidak terjangkau**, karena dengan bobot negatif jarak −1 bisa benar-benar terjadi. Dijkstra tetap memakai −1 seperti soal challenge.
- Menambah visualizer graf baru = menulis fungsi langkah yang menghasilkan `{ line, note, view }` dengan `makeView(...)`, lalu satu entri di `registry.js` memakai `graphEntry(kind, {...})`.

## Belum tercakup

Tabel DP untuk materi lain (misalnya knapsack) bisa memakai `kind: 'table'` yang sama. Visualizer graf belum mendukung posisi simpul buatan sendiri (selalu melingkar) dan belum mendukung graf lebih dari 9 simpul.

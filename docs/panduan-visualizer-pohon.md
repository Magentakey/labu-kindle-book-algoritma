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

## Belum tercakup

Tabel DP untuk materi lain (misalnya knapsack) bisa memakai `kind: 'table'` yang sama. MST (Prim, Kruskal) dan Dijkstra bekerja pada graf, bukan pohon, sehingga butuh visualizer graf tersendiri
(simpul bebas posisi, sisi berbobot, dan sisi yang terpilih).

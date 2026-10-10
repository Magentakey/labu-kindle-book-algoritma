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

## Belum tercakup

MST (Prim, Kruskal) dan Dijkstra bekerja pada graf, bukan pohon, sehingga butuh visualizer graf tersendiri
(simpul bebas posisi, sisi berbobot, dan sisi yang terpilih).

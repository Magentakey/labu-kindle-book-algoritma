# Panduan Komponen Interaktif

Selain teks biasa, file materi (`src/content/materials/<id>.md`) bisa memakai komponen interaktif. Semuanya ditulis
dengan penanda di barisnya sendiri, dan **dicek otomatis** oleh `npm run check:content` dan `npm test`.
Contoh pemakaian lengkap ada di `src/content/materials/algoritma-pemrograman.md`.

Dua bentuk penanda:

- **Blok** dibuka dengan `:::nama Judul` dan ditutup dengan `:::` di baris sendiri. Blok berisi teks Markdown biasa.
- **Penanda satu baris** ditulis `::nama argumen`, tanpa penutup.

Aturan umum: tulis penanda di barisnya sendiri dengan baris kosong di atas dan bawahnya. Blok **tidak boleh bersarang**
(tidak ada blok di dalam blok). Penanda satu baris `::trace` dan `::growth` boleh ditaruh di dalam blok.
Penanda di dalam blok kode (` ``` `) diabaikan.

Visualizer langkah demi langkah (`::visualizer`: diagram batang, pohon, tabel DP, binary search, grafik asimtotik, garis waktu, graf) berbeda dari
komponen di panduan ini. Cara memakai dan menambahnya ada di [`docs/panduan-visualizer-pohon.md`](panduan-visualizer-pohon.md)
dan [`docs/panduan-menulis-materi.md`](panduan-menulis-materi.md).

## Ringkasan

| Komponen | Cara menulis | Cocok untuk |
| --- | --- | --- |
| Slide bernomor | `:::steps` dengan `::slide` | Daftar hal yang dibaca satu per satu (ciri, tahapan) |
| Tab | `:::tabs` dengan `::tab` | Beberapa cara atau versi dari satu hal (naratif, flowchart, pseudocode) |
| Jawaban lipat | `:::reveal` | Kunci jawaban, bukti panjang, penjelasan tambahan |
| Kuis | `:::quiz` dengan `::question` | Cek pemahaman pilihan ganda |
| Penjelajah pertumbuhan | `::growth` | Membandingkan O(1), O(log n), O(n), dan seterusnya |
| Peraga pseudocode | `::trace id` | Menjalankan pseudocode baris demi baris dengan masukan sendiri |
| Pemeriksa batas asimtotik | `::bound Notasi ; p, q, r ; g ; konstanta` | Mencari n₀ untuk Θ, O, atau Ω dengan tabel f(n)/g(n) |
| Pemeriksa limit o dan ω | `::limit f ; g ; c` | Menentukan limit f(n)/g(n) dan n₀ untuk c tertentu |
| Penentu kasus Metode Master | `::master a ; b ; f` | Menyelesaikan T(n) = aT(n/b) + f(n) langkah demi langkah dan menentukan kasus 1, 2, atau 3 |

## Slide bernomor: `:::steps`

Kartu dengan lingkaran bernomor dan panah « » untuk berpindah slide. Bisa dengan tombol, panah keyboard, atau geser jari.

```text
:::steps Enam karakteristik algoritma
::slide Finiteness (Keterbatasan)
Isi slide pertama. Boleh berisi **teks tebal**, daftar, dan tabel.

::slide Input (Masukan)
Isi slide kedua.
:::
```

- Judul blok (setelah `:::steps`) dibacakan pembaca layar sebagai nama komponen.
- Setiap `::slide` butuh judul. Minimal 2 slide.
- Teks sebelum `::slide` pertama tidak ditampilkan.

## Tab: `:::tabs`

```text
:::tabs Tiga cara menulis algoritma
::tab Naratif
Isi tab pertama.

::tab Pseudocode
Isi tab kedua, boleh memuat blok kode dan ::trace.
:::
```

- Isi semua tab tetap dimuat, jadi peraga di dalam tab tidak kehilangan posisinya saat pindah tab.
- Keyboard: panah kiri/kanan pindah tab, Home dan End ke tab pertama dan terakhir.
- Minimal 2 tab. Tiap `::tab` butuh judul.

## Jawaban lipat: `:::reveal`

```text
:::reveal Lihat jawaban latihan
Isi yang disembunyikan sampai pembaca membukanya.
:::
```

Judul wajib karena menjadi teks tombol buka-tutup.

## Kuis: `:::quiz`

```text
:::quiz Cek pemahaman
::question Berapa 2 + 2?
- [ ] 3
- [x] 4
- [ ] 5
::explain
Penjelasan yang tampil sesudah pembaca memeriksa jawabannya.

::question Pertanyaan berikutnya?
- [x] Ya
- [ ] Tidak
:::
```

- Tiap pertanyaan punya **minimal 2 pilihan dan tepat satu** pilihan benar `[x]`.
- `::explain` bersifat opsional dan boleh berisi Markdown. Penjelasan tampil baik saat jawaban benar maupun salah.
- Pertanyaan dan pilihan berupa teks biasa. Tulis `kode` di antara backtick bila perlu; Markdown lain tidak diproses.
- Hasil benar atau salah selalu dituliskan dengan kata ("Benar." / "Belum tepat."), bukan hanya warna.

## Penjelajah pertumbuhan: `::growth`

Tabel interaktif dengan penggeser ukuran input *n* yang menampilkan nilai tiap kelas kompleksitas beserta contoh algoritmanya.

```text
::growth
::growth 1, log n, n, n log n, n^2
```

Tanpa argumen, semua kelas ditampilkan. Kelas yang tersedia: `1`, `log n`, `n`, `n log n`, `n^2`, `n^3`, `2^n`, `n!`.
Menambah kelas baru: edit `src/lib/growth.js`.

## Pemeriksa batas asimtotik: `::bound`

Pembaca mengisi f(n) = p·n² + q·n + r, memilih g(n) dan konstanta, lalu melihat tabel f(n) / g(n) untuk n = 1, 2, 3, …
beserta n₀ terkecil, seperti langkah mencoba nilai n pada pembuktian dengan definisi (materi 4).

```text
::bound Theta ; 2, -3, 1 ; n^2 ; 3/4, 2
::bound O ; 1/2, -3, 0 ; n^2 ; 1/2
::bound Omega ; 0, 10, -20 ; n ; 10/3
```

Empat bagian dipisah titik koma:

1. **Notasi:** `Theta`, `O`, atau `Omega`.
2. **Koefisien f(n):** tiga bilangan `p, q, r` untuk p·n² + q·n + r (boleh negatif).
3. **g(n):** `1`, `n`, `n^2`, atau `n^3`. Bagian ini boleh dihilangkan, bawaannya `n^2`.
4. **Konstanta:** `c₁, c₂` untuk Theta, atau satu `c` untuk O dan Omega. Harus positif.

- Bilangan boleh bulat (`-3`), pecahan (`3/4`), atau desimal (`0,5`). Batas: bilangan bulat sampai 3 digit, penyebut sampai 2 digit.
- Isian di materi menjadi isian awal. Tombol "Kembalikan contoh" memulihkannya. Argumen yang salah ditolak oleh `npm run check:content`.
- n₀ dihitung eksak dengan bilangan rasional, bukan dengan memeriksa sampai n tertentu. Bila n₀ lebih dari 100000, pemeriksa
  menampilkan "lebih dari 100000" dan tidak menebak.
- Rumusnya ada di `src/lib/boundCheck.js` dan dites di `src/lib/boundCheck.test.js`, termasuk dengan pembanding brute force.
- Boleh dipakai berkali-kali di satu materi. Sama dengan `::ratio`, penanda ini boleh ditaruh di dalam blok.

## Pemeriksa limit o dan ω: `::limit`

Pembaca mengisi f(n), g(n), dan c, lalu melihat nilai limit f(n)/g(n), golongannya (o, ω, atau Θ), dan n₀ terkecil untuk
c itu, seperti pada pembuktian dengan limit di materi 5. Tabelnya membandingkan f(n) dengan c·g(n) untuk n = 1, 2, 3, …

```text
::limit 2n ; n^2 ; 1/2
::limit n^2/2 ; n ; 10
::limit 3n^2 + 5 ; 7n^2 ; 4
```

Tiga bagian dipisah titik koma, yaitu `f(n) ; g(n) ; c`:

- **f(n) dan g(n)** adalah polinom berpangkat paling tinggi 3, ditulis seperti di materi: `2n`, `n^2` (atau `n²`), `n²/2`,
  `3n^2 + 10n + 5`, `1/2n^2 - 3n`. Suku dengan pangkat tertinggi harus positif karena keduanya fungsi *running time*.
- **c** adalah konstanta positif: bilangan bulat (`2`), pecahan (`3/4`), atau desimal (`0,5`). Bilangan bulat sampai 3 digit,
  penyebut sampai 2 digit.
- Golongan ditentukan dari derajat dan koefisien terdepan: derajat f lebih kecil berarti o, lebih besar berarti ω, dan sama
  berarti Θ (bukan o dan bukan ω). Bagian ini sama dengan solusi soal challenge materi 5.
- Untuk c yang dipilih, n₀ dihitung eksak dengan bilangan rasional untuk dua pertaksamaan sekaligus, yaitu
  0 ≤ f(n) < c·g(n) (o) dan 0 ≤ c·g(n) < f(n) (ω). Pada Θ selalu ada c yang gagal, dan itu yang ditunjukkan sebagai alasan
  mengapa bukan o atau ω. Bila n₀ lebih dari 100000, pemeriksa menulis "lebih dari 100000" dan tidak menebak.
- Isian di materi menjadi isian awal, dan tombol "Kembalikan contoh" memulihkannya. Argumen yang salah ditolak oleh
  `npm run check:content`.
- Mesinnya ada di `src/lib/limitCheck.js` (memakai bilangan rasional dari `src/lib/boundCheck.js`) dan dites di
  `src/lib/limitCheck.test.js`, termasuk dengan pembanding brute force.

## Penentu kasus Metode Master: `::master`

Pembaca mengisi a, b, dan f(n) untuk T(n) = a·T(n/b) + f(n), lalu membaca penyelesaiannya langkah demi langkah seperti slide
di materi 7: tentukan a, b, f(n); hitung g(n) = n^(log_b a); bandingkan; periksa syarat tambahan (hanya kasus 3); simpulkan.

```text
::master 5 ; 2 ; n^3
::master 1 ; 5/3 ; n
::master 2 ; 2 ; n log n
```

Tiga bagian dipisah titik koma, yaitu `a ; b ; f(n)`:

- **a** adalah bilangan bulat 1 sampai 99.
- **b** adalah bilangan lebih dari 1, boleh pecahan atau desimal (`3`, `5/3`, `1,5`). Untuk T(3n/5) tulis `5/3`.
- **f(n)** berbentuk n^p dengan p ≥ 0 dan boleh dikali log n sampai pangkat 3. Contoh: `n`, `n^2` (atau `n²`), `n^1,5`, `n^(3/2)`,
  `√n`, `1`, `log n`, `n log n`, `n^2 log^2 n`. **Pangkat pecahan wajib memakai kurung** (`n^(3/2)`), sebab `n^3/2` dibaca n³/2.
  Koefisien di depan (`3n^2`) boleh ada dan tidak memengaruhi hasil Θ.
- Perbandingan p dengan log_b a dilakukan eksak dengan bilangan bulat besar (a^s dibanding b^r untuk p = r/s), bukan dengan
  desimal. Jadi kasus 2 tidak terlewat saat log_b a tepat sama dengan p (misalnya T(n) = 2T(n/4) + √n).
- log_b a yang rasional ditulis eksak (`n^2`), yang lain ditulis `n^(log₂ 5) ≈ n^2,32`. Batas ε yang tidak eksak dibulatkan
  **ke bawah** (0,679 menjadi 0,67), jadi nilai yang ditampilkan pasti memenuhi.
- Faktor log: kasus 1 dan 3 tetap berlaku (ε harus **lebih kecil** dari selisih pangkat, tidak boleh sama). Bila pangkat n pada
  f(n) sama dengan g(n) tetapi ada faktor log, hasilnya "tidak ada kasus yang berlaku", sesuai tiga kasus yang diajarkan di materi.
- Isian di materi menjadi isian awal. Tombol "Kembalikan contoh" memulihkannya. Argumen yang salah ditolak oleh
  `npm run check:content`. Boleh dipakai berkali-kali di satu materi dan boleh ditaruh di dalam blok.
- Mesinnya ada di `src/lib/masterCase.js` dan dites di `src/lib/masterCase.test.js`, termasuk dengan perhitungan numerik T(n)
  level demi level pada lebih dari 700 kombinasi.

## Peraga pseudocode: `::trace id`

Pembaca mengisi masukan, lalu menjalankan pseudocode baris demi baris sambil melihat nilai variabel, array, dan
(untuk rekursi) tumpukan panggilan.

```text
::trace bilangan-max
```

Id yang tersedia: `bilangan-max`, `jumlah-n-bil`, `binary-search-iteratif`, `binary-search-rekursif`, `insertion-sort`,
`insertion-sort-best`, `insertion-sort-worst`, `cari-bil-k`, `merge-sort`, `matrix-chain-order`, `lcs-length`, `print-lcs`, `greedy-activity-selector`, `huffman`, `bfs`, `dfs`.

Nomor baris pada peraga **sama dengan nomor langkah di materi**, jadi tulis pseudocode di materi dengan nomor yang sama.

Blok kode selalu menampilkan nomor baris otomatis di pinggir. Agar nomornya sama dengan nomor langkah, tulis pseudocode
di materi **tanpa nomor sendiri dan tanpa baris judul fungsi** (sebut nama fungsinya di kalimat sebelum blok), seperti di
`insertion-sort.md`. Kalau tidak, pembaca melihat dua kolom nomor yang tidak sejajar.

### Peraga dengan tabel cost dan jumlah operasi

Untuk materi analisis *running time*, peraga bisa menampilkan tabel cost dan jumlah operasi tiap baris, seperti tabel di
materi. Tabel itu muncul bila definisi peraga punya `cost` dan setiap langkah punya `counts` (berapa kali tiap baris sudah
terbaca sampai langkah itu). Dipakai oleh `insertion-sort`, `insertion-sort-best`, `insertion-sort-worst`, dan `cari-bil-k`.

```javascript
cost: {
  formulaLabel: 'Jumlah operasi',            // judul kolom rumus
  note: 'Keterangan singkat di atas tabel.',
  rows: [{ line: 1, cost: 'c₁', formula: 'n' }, /* satu entri per baris kode, berurutan */],
}
```

`presets` (opsional) menambah tombol contoh masukan siap pakai di atas peraga:
`presets: [{ label: 'Kasus terbaik: 2, 4, 12', values: { A: '2, 4, 12' } }]`. Kunci di `values` harus sama dengan `key` isian.
Judul peraga (`title`) harus unik di antara semua peraga karena dipakai sebagai nama bagian oleh pembaca layar, dan tesnya
akan gagal bila ada yang kembar.

### Peraga rekursif dengan tumpukan panggilan

`binary-search-rekursif` dan `merge-sort` mengisi `stack` pada tiap langkah (daftar teks, panggilan terdalam di akhir).
Tabel variabel menampilkan p, q, r milik **pemanggilan yang sedang berjalan**, jadi nilainya kembali ke milik pemanggil
saat pemanggilan selesai. `merge-sort` menampilkan MERGE sebagai satu langkah (baris 5), dan status sel `left`/`right`
(dibagi), `sorted` (satu bilangan), serta `merged` (hasil MERGE) menunjukkan bagian yang sudah terurut. Banyak langkahnya
6n − 5, dan tesnya membandingkan urutan pemanggilan serta isi A tiap MERGE dengan eksekusi independen dari pseudocode.

### Peraga dengan tabel DP

`matrix-chain-order` (materi 8) mengisi `tables` pada tiap langkah: daftar `{ table, labels, legend }` yang ditampilkan dengan komponen
`DpTable` di bawah kode dan variabel (dua kolom di layar lebar). Bentuk `table` sama dengan visualizer tabel DP
(`caption`, `corner`, `rowHeaders`, `colHeaders`, `cells` berisi `{ text, sub, mark, glyph }`). Peraga ini menampilkan tabel m dan s,
dan barisan p sebagai array berindeks 0 dengan status `factor` untuk tiga nilai yang dikalikan pada baris 10.

- Masukan `p` berupa 3 sampai 7 bilangan bulat positif (2 sampai 6 matriks). Isian awalnya contoh materi (240 langkah).
- Tiap baris perulangan dibaca sekali tiap putaran ditambah sekali saat kondisinya tidak terpenuhi lagi, seperti `jumlah-n-bil`.
- Tesnya (`traces.matrixChain.test.js`) membandingkan urutan baris dengan eksekusi pseudocode apa adanya pada 300 barisan acak,
  dan tabel m dan s akhir dengan hitungan semua urutan pengurungan.
- Pseudocode peraga harus sama persis dengan blok pseudocode di `dp-rantai-matriks.md`, dan ada tes yang menjaganya.

### Peraga string dengan tabel c dan b: `lcs-length` dan `print-lcs`

Dua peraga materi 9 (LCS) memakai masukan **teks**: isian `kind: 'text'` dengan `max` (batas karakter). `runTrace` hanya
menerima huruf dan angka, 1 sampai `max` karakter (di sini 7, sama dengan visualizer tabel LCS), dan pesan galatnya menyebut
nama isian. Kuncinya `X` dan `Y`, jadi tombol contoh (`presets`) memakai `{ X: '...', Y: '...' }`.

- `lcs-length` (18 baris) mengisi satu tabel yang memuat c dan b sekaligus: angka adalah c[i,j], panah kecil (`sub`) adalah b[i,j].
  Tabel baru tampil sesudah baris 3. Sel yang diisi ditandai `current`, dan sel sumbernya ditandai `source` dengan glyph panah
  (↖ di baris 11, ↑ dan ← di baris 13, lalu satu sel di baris 14 atau 16). Contoh materi 247 langkah.
- `print-lcs` (8 baris) menghitung tabel b lebih dulu (tidak ditelusuri), lalu menelusurinya rekursif seperti `merge-sort`:
  `stack` bertambah di baris 4, 7, 8 dan berkurang saat selesai, dan baris variabel `Tercetak` hanya bertambah di baris 5.
  Sel pemanggilan berjalan ditandai `current`, sel yang pernah dimasuki `path`. Contoh materi 34 langkah.
- Panah ditulis dengan `\uFE0E` agar tampil sebagai simbol teks, bukan emoji berwarna.
- Tesnya (`traces.lcs.test.js`) membandingkan urutan baris dengan eksekusi pseudocode apa adanya pada 300 pasangan string acak,
  tabel akhir dengan hitungan rekursi murni, dan urutan pemanggilan serta huruf tercetak dengan PRINT-LCS referensi.
  `dp-lcs.test.js` menjaga pseudocode peraga sama persis dengan blok di materi dan angka langkah yang tertulis di teks.

### Peraga dengan dua array: `greedy-activity-selector`

Peraga materi 10.1 menjalankan GREEDY-ACTIVITY-SELECTOR (8 baris) menurut **urutan masukan, tanpa pengurutan**. Itu pembeda dari
visualizer garis waktu, yang selalu mengurutkan menurut finish time lebih dulu. Jadi latihan bagian F (urut start time atau durasi)
bisa diulang dan hasilnya tidak optimal.

- Langkah boleh memuat `arrays` (daftar array dengan judul berbeda) sebagai pengganti `array`. Peraga ini menampilkan array `s` dan `f`;
  legenda status hanya dicetak di bawah array pertama.
- Isian bertipe `array` boleh punya `limits` (`maxLength`, `minValue`, `maxValue`) yang diteruskan ke `parseArrayInput`. Peraga ini memakai
  batas yang sama dengan visualizer: 1 sampai 12 aktivitas, waktu 0 sampai 30. Kedua array harus sama panjang dan tiap `f[i] > s[i]`.
- Status baru: `chosen` (masuk ke A, glyph A) dan `skipped` (dilewati karena bentrok, glyph ×). Dua sel yang dibandingkan di baris 5
  (`s[m]` dan `f[k]`) memakai `compare`, dan `m` di baris 4 memakai `current`.
- Header perulangan (baris 4) dicatat tiap putaran, termasuk pemeriksaan terakhir saat `m > n`. Banyak langkah:
  3 + 2(n − 1) + 2(|A| − 1) + 2. Contoh materi 31 langkah.
- Langkah terakhir menyebut apakah jumlah aktivitas yang terpilih sama dengan maksimum untuk data itu (dihitung dengan mengurutkan menurut
  finish time, dan dicek ke brute force di tes). Empat tombol contoh: contoh materi (4), latihan a (3, tidak optimal), latihan b (4), dan
  contoh tandingan tiga aktivitas (1 padahal maksimumnya 2).
- Tesnya (`traces.greedy.test.js`) membandingkan urutan baris dengan eksekusi pseudocode apa adanya pada 300 masukan acak, kalimat
  "optimal" atau "TIDAK optimal" dengan brute force semua himpunan bagian, dan memastikan A hanya berubah di baris 2 dan 6 serta k di baris 3 dan 7.
  `greedy-activity-selection.test.js` menjaga pseudocode peraga sama persis dengan blok di materi, dan tombol contoh sama dengan tabel latihan.

### Peraga dengan antrean dan pohon: `huffman`

Peraga materi 10.2 menjalankan HUFFMAN(C) (9 baris). Isiannya pasangan `simbol:frekuensi` (contoh `a:45, b:13`), 2 sampai 8 simbol
berbeda dan frekuensi 1 sampai 99, sama dengan visualizer pohon Huffman.

- Isian bertipe `free` adalah teks bebas. Bentuknya diperiksa oleh `validate` (di sini `checkHuffmanInput`), bukan oleh `runTrace`.
- Langkah boleh memuat `lists`: daftar teks berjudul unik di bawah tabel variabel. Peraga ini memakainya untuk isi Q,
  simpul gabungan yang sudah dibuat, dan (di langkah terakhir) kode Huffman tiap simbol.
- Status baru: `childLeft` (x, anak kiri), `childRight` (y, anak kanan), dan `newNode` (z yang baru dimasukkan ke Q).
- Antrean diurutkan naik menurut frekuensi. Bila seri, simpul yang lebih dulu dibuat didahulukan, sama dengan visualizer.
  Daun ditulis `simbol:frekuensi` dan simpul gabungan `zk:frekuensi` (k = nomor putaran).
- Header perulangan (baris 3) dicatat tiap putaran, termasuk pemeriksaan terakhir. Banyak langkah: 6n - 2.
- Tes `traces.huffman.test.js` membandingkan urutan baris dan isi Q dengan eksekusi pseudocode pada 300 masukan acak, serta kode,
  sifat prefiks, dan biaya (sama dengan jumlah semua z.freq) pada 200 masukan acak.

### Peraga graf dengan tabel atribut: `bfs`

`::trace bfs` menjalankan BFS(G, s) pada graf yang ditulis sebagai adjacency-list.

- Isian: `G` (isian bebas, `simpul: tetangga, tetangga; simpul: ...`, maksimal 8 simpul dan 30 isi daftar, nama simpul 1 sampai 2 huruf atau angka,
  daftar boleh kosong) dan `s` (simpul awal). Pembaca isian ada di `parseAdjacencyInput` (`traces/bfsPseudo.js`). Urutan tetangga dipertahankan,
  karena urutan itu menentukan urutan masuk antrean. Graf berarah juga diterima.
- Tabel atribut (`step.tables`, memakai `DpTable`): satu baris per simpul dengan kolom `color`, `d`, dan `π`. Status sel memakai pola, simbol, dan teks:
  `empty` (WHITE), `gray` (GRAY, ◐), `black` (BLACK, ●), `current` (u) dan `source` (v). Status `gray` dan `black` ditambahkan ke `dpStatuses.js`.
- Daftar teks: isi Q (dengan jarak), urutan simpul keluar dari Q, tetangga u (yang sudah dan sedang diperiksa), dan di langkah terakhir lintasan dari s.
- Baris 1 sampai 4 ditampilkan ringkas: satu langkah per baris untuk semua simpul selain s. Header while (baris 10) dicatat tiap putaran termasuk
  pemeriksaan terakhir, header for (baris 12) tiap tetangga ditambah satu pemeriksaan terakhir, dan baris 13 tiap tetangga.
  Banyak langkah: 6 + 8R + 2D (R simpul terjangkau, D jumlah panjang daftar tetangga simpul terjangkau). Contoh materi: 110 langkah.
- Tes `traces.bfs.test.js` membandingkan urutan baris dan isi Q dengan eksekusi pseudocode pada 300 graf acak, jarak dengan Floyd-Warshall pada 200 graf,
  perubahan atribut hanya di baris yang benar, dan hasil contoh materi dengan Gambar 3.

### Peraga dua prosedur dengan tumpukan dan tabel atribut: `dfs`

`::trace dfs` menjalankan DFS(G) dan DFS-VISIT(G, u) pada graf berarah yang ditulis sebagai adjacency-list.

- **Satu blok kode 17 baris**: baris 1 sampai 7 adalah DFS(G) dan baris 8 sampai 17 adalah DFS-VISIT(G, u). Di materi, DFS-VISIT bernomor 1 sampai 10,
  jadi nomor peraga = nomor materi + `DFS_VISIT_OFFSET` (7). Catatan langkah untuk baris 8 sampai 17 berbentuk `Baris 11 (DFS-VISIT baris 4, panggilan ke-2, kedalaman 3): ...`,
  supaya cocok dengan kedua penomoran (tes umum mewajibkan catatan diawali `Baris <nomor peraga>`). Pseudocode peraga harus sama dengan gabungan dua blok di `graph-dfs.md`.
- Isian: hanya `G` (isian bebas, aturan sama dengan BFS lewat `parseAdjacencyInput`; tidak ada simpul awal). **Urutan penulisan simpul adalah urutan G.V**, yang menentukan
  akar pohon, dan urutan tetangga adalah urutan Adj. Pemeriksa: `checkDfsInput` (`traces/dfsPseudo.js`).
- Tabel atribut (`DpTable`): `color`, `d`, `f`, `π` per simpul, dengan status yang sama seperti BFS (`empty`, `gray`, `black`, `current`, `source`).
  `current` dipakai di baris 5 sampai 7 (u milik DFS(G)) dan baris 8 sampai 14, jadi di baris 15 sampai 17 simpul terlihat berubah menjadi BLACK.
  Tidak ada status baru di `dpStatuses.js`.
- `step.stack`: `DFS(G)` di dasar, lalu satu `DFS-VISIT(G, u)` per simpul GRAY. Bingkai ditambah saat baris 14 (atau 7) selesai dan dibuang setelah baris 17.
- Daftar teks: tetangga u (baris 11 sampai 14), busur yang sudah diperiksa di baris 12 beserta jenisnya (tree, B, F, C, diputuskan dari warna tujuan dan `u.d < v.d`),
  urutan simpul selesai, dan di langkah terakhir DFS-forest dalam bentuk akar(anak, anak).
- Baris 1 sampai 3 ditampilkan ringkas. Header for baris 5 dicatat tiap simpul (ditambah satu pemeriksaan akhir), dan header for baris 11 tiap tetangga
  (ditambah satu pemeriksaan akhir). Banyak langkah: 5 + 11n + 2D − R (n simpul, D jumlah panjang semua daftar tetangga, R banyak akar). Contoh materi: 85 langkah.
- Graf tak berarah harus ditulis di kedua daftar. Tiap arah dijelajahi sebagai busur sendiri, jadi satu sisi bisa tercatat dua kali, dan sisi kedua itu bisa berjenis F.
- Tes `traces.dfs.test.js` membandingkan urutan baris dan kedalaman tumpukan dengan DFS rekursif pada 300 graf acak, memeriksa timestamp (menutup 1 sampai 2n, interval
  bersarang atau terpisah, jenis busur sesuai interval) pada 200 graf, perubahan atribut hanya di baris yang benar, dan hasil contoh dengan bagian D materi 11.2.

### Menambah peraga baru

1. Buat pembangun langkah di `src/algorithms/traces/<nama>.js`: fungsi yang menerima masukan dan mengembalikan daftar
   langkah `{ line, note, vars, array }`. Catatan setiap langkah diawali `Baris N:`.
2. Daftarkan di `src/algorithms/traces.js` (judul, pseudocode, isian masukan, dan `build`). Langkah boleh memuat `counts`
   bila peraga memakai tabel cost (lihat bagian di atas).
3. Tambahkan tes di `src/algorithms/traces.test.js`. **Bandingkan hasil akhirnya dengan implementasi biasa** untuk banyak
   masukan acak, supaya peraga tidak mengajarkan hal yang salah.
4. Pakai di materi dengan `::trace <id>`.

## Yang dicek otomatis

`npm run check:content` melaporkan, antara lain: blok tidak ditutup, blok bersarang, `::slide`/`::tab`/`::question` di
luar blok yang benar, kurang dari 2 slide atau tab, judul item kosong, kuis tanpa jawaban benar atau dengan lebih dari
satu jawaban benar, id `::trace` yang tidak ada, kelas `::growth` yang tidak dikenal, dan gambar yang belum ada di `public/`.

## Aksesibilitas

Semua komponen sudah mengikuti pola ARIA dan bisa dipakai dengan keyboard. Agar tetap begitu:

- Beri judul yang bermakna pada setiap blok dan item.
- Jangan menaruh informasi penting hanya di warna. Komponen memakai teks dan simbol untuk status.
- Gambar diagram wajib punya teks alternatif yang menjelaskan isinya, dan sebaiknya diikuti uraian teks langkah-langkahnya.

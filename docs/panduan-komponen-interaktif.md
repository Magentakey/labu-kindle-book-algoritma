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

## Peraga pseudocode: `::trace id`

Pembaca mengisi masukan, lalu menjalankan pseudocode baris demi baris sambil melihat nilai variabel, array, dan
(untuk rekursi) tumpukan panggilan.

```text
::trace bilangan-max
```

Id yang tersedia: `bilangan-max`, `jumlah-n-bil`, `binary-search-iteratif`, `binary-search-rekursif`, `insertion-sort`,
`insertion-sort-best`, `insertion-sort-worst`, `cari-bil-k`.

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

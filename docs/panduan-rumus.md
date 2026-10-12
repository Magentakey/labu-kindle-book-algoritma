# Panduan menulis rumus (MathJax)

Teks materi dan teks kuis mendukung rumus TeX yang dirender MathJax sebagai SVG.

## Cara menulis

| Kebutuhan | Tulis | Hasil |
| --- | --- | --- |
| Rumus di dalam kalimat | `$T(n) = \Theta(n^2)$` | rumus sebaris |
| Rumus yang berdiri sendiri | baris `$$`, isi rumus, baris `$$` | rumus di tengah, bisa digeser keyboard |
| Beberapa baris sejajar | `\begin{aligned} a &= 1 \\ b &= 2 \end{aligned}` di dalam `$$` | sejajar di tanda `&` |
| Kata biasa di dalam rumus | `\text{untuk semua } n \ge n_0` | huruf tegak |
| Tanda dolar biasa | `\$5` | $5 |

Contoh rumus tampil (tanpa baris kosong di dalamnya):

```text
$$
0 \le c_1 n^2 \le 2n^2 - 3n + 1 \le c_2 n^2 \quad \text{untuk semua } n \ge n_0
$$
```

Simbol yang sering dipakai: `\Theta`, `\Omega`, `\le`, `\ge`, `\cdot`, `\infty`, `\ldots`, `\frac{a}{b}`, `n^2`, `n_0`, `\log_2 n`, `\sqrt{n}`, `\lceil n \rceil`.

## Aturan

- Pembuka dan penutup `$` harus di baris yang sama. Pemeriksa (`npm run check:content` dan `npm test`) menandai `$` yang tidak berpasangan sebagai error.
- Baris `$$` harus berdiri sendiri. Jangan beri baris kosong di dalam rumus tampil.
- Jangan pakai rumus di judul (`##`, `###`), judul `:::steps`, dan judul `::slide`. Judul dipakai daftar isi dan tampil apa adanya, jadi tulis dengan Unicode (`Θ(n²)`, `n₀`).
- Di teks kuis (soal, pilihan, penjelasan) pakai rumus sebaris saja. Rumus `$$` di dalam tombol pilihan tidak didukung.
- Pembatas `\( \)` dan `\[ \]` tidak dikenali.
- Perintah yang bisa menyisipkan tautan, gaya, atau ekstensi (`\href`, `\class`, `\style`, `\require`, `\unicode`) ditolak.
- Rumus yang salah tampil sebagai catatan merah berisi pesan galat, dan `npm test` gagal.

## Aksesibilitas

Gambar SVG rumus disembunyikan dari pembaca layar. Sebagai gantinya tiap rumus punya `aria-label` berbahasa Indonesia, misalnya "T ( n ) sama dengan Theta ( n kuadrat )". Bacaan dibuat otomatis oleh `speak()` di `src/lib/rehypeMath.js`. Pecahan, pangkat, indeks bawah, dan simbol umum dikenali. Rumus rumit bisa terbaca kurang natural, jadi untuk hasil penting tetap tulis kalimat penjelasnya di teks.

## Cara kerja dan ukuran

- `src/lib/rehypeMath.js` mengubah rumus menjadi SVG (tanpa font eksternal, jalan offline).
- `MarkdownView` memuat MathJax hanya bila teks berisi `$`. Bundle utama tidak bertambah. Chunk MathJax sekitar 1,6 MB (570 kB terkompresi) dan ikut di-precache PWA.
- `vite.config.js` mendefinisikan `PACKAGE_VERSION` karena MathJax kalau tidak akan memanggil `eval('require')`.
- Paket TeX (`ams`, `noerrors`) di-import eksplisit di `rehypeMath.js`. Jangan dihapus: bundler membuangnya dan `aligned` berhenti bekerja (ada tesnya).

## Yang tetap teks biasa

- Pseudocode dan isi array (mis. `A = 3 10 8 20 5`, `q = ⌊(p + r)/2⌋` di blok kode): tetap di blok kode atau teks biasa, karena itu kode, bukan rumus.
- Isian peraga (`::limit`, `::master`, `::bound`, `::ratio`, `::growth`) dan teks yang menjelaskan cara mengetiknya: tulis dengan backtick, mis. `n^2`.
- Hasil di dalam komponen interaktif (hasil `::bound`, `::master`, `::limit`, tabel `::trace`) dan soal challenge belum memakai MathJax.

## Menulis tes untuk teks berisi rumus

Tes lama yang mencari string Unicode di teks materi perlu disesuaikan. Contohnya ada di `recurrence-master.test.js`: fungsi `norm()` mengubah TeX dan Unicode ke bentuk polos sebelum dibandingkan, sehingga asersi tetap membaca rumus yang sama dengan definisinya.

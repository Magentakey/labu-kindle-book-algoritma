# Panduan Menulis Materi

Setiap materi adalah satu file Markdown. Aplikasi menampilkannya dengan susunan:
**teks, visualisasi, teks, soal challenge** (mockup 1).

## Langkah cepat

1. Salin `docs/template-materi.md` ke `src/content/materials/<id>.md`.
   `<id>` harus sama persis dengan field `id` di `src/content/materials.json`
   (contoh: `insertion-sort.md`, `merge-sort.md`).
2. Ganti isinya dengan materi Anda.
3. Ubah `"hasText"` materi itu menjadi `true` di `materials.json`.
4. Jalankan `npm run check:content`. Perbaiki semua **ERROR**. **SARAN** boleh ditunda tetapi sebaiknya diperbaiki.
5. Jalankan `npm run dev`, buka materinya, dan baca hasilnya di layar lebar dan layar HP.

## Aturan penulisan

Aturan ini dijaga otomatis oleh `npm run check:content` dan `npm test`. Alasannya hampir selalu aksesibilitas
(pembaca layar dan keyboard) atau karena sesuatu tidak akan tampil.

| Aturan | Cara menulis | Mengapa |
| --- | --- | --- |
| Judul mulai dari `##` | `## Pengertian`, lalu `### Contoh` | Judul halaman (`h1`) sudah dibuat aplikasi |
| Jangan melompati tingkat judul | `##` lalu `###` lalu `####`, bukan `##` langsung ke `####` | Pembaca layar memakai urutan judul sebagai daftar isi |
| Judul pakai `##`, bukan teks tebal atau garis bawah | `## Judul`, bukan `**Judul**` | Teks tebal tidak dikenal sebagai judul |
| Satu baris kosong sebelum `---` | `Paragraf`, baris kosong, `---` | `---` tepat di bawah teks menjadikannya judul |
| Tabel punya judul kolom terisi | `\| Kasus \| Waktu \|` | Pembaca layar membacakan nama kolom di setiap sel |
| Gambar punya teks alternatif | `![Grafik n log n melawan n kuadrat](/materi/id/gambar.png)` | Pengguna yang tidak melihat gambar tetap paham isinya |
| Blok kode punya nama bahasa | tiga backtick lalu `javascript` | Pewarnaan sintaks. Pseudocode: `text` |
| Tautan punya teks bermakna | `[Wikipedia: Merge sort](https://...)` | Jangan "klik di sini". Daftar tautan dibaca tanpa konteks |
| Tanpa HTML | tidak ada `<div>`, `<br>`, `<img>` | HTML mentah dibuang demi keamanan |
| Rumus pakai simbol Unicode | `Θ(n²)`, `O(n log n)`, `≤`, `log₂ n` | LaTeX tidak didukung |

## Penanda tempat fitur interaktif

Tulis di barisnya sendiri, dengan baris kosong di atas dan bawahnya:

```text
::visualizer
::challenge
```

- `::visualizer` menempatkan visualisasi langkah demi langkah di titik itu. Hanya untuk materi yang punya `visualizer` di `materials.json`.
- `::challenge` menempatkan soal challenge di titik itu. Hanya untuk materi yang punya `challenge`.
- Tanpa penanda, visualisasi tampil setelah semua teks dan challenge paling akhir.
- Satu penanda per materi. Teks setelah penanda sebaiknya diawali judul `##`.

## Bahasa blok kode

Diwarnai: `javascript` (`js`), `typescript` (`ts`), `python` (`py`), `c`, `cpp`, `go`, `rust`, `kotlin`, `swift`,
`json`, `css`, `html`, `xml`, `yaml`, `sql`, `markdown`, `text`.

Alias: `java` diwarnai sebagai `cpp`. `pseudocode`, `bash`, dan `sh` tampil polos. Bahasa lain tampil polos dan diberi SARAN.

## Gambar

1. Simpan di `public/materi/<id-materi>/nama.png` (huruf kecil, tanpa spasi).
2. Rujuk dengan awalan `/materi/`: `![Deskripsi](/materi/insertion-sort/nama.png)`.
3. Kompres sebelum diunggah. Gambar ikut disimpan untuk mode offline, jadi usahakan di bawah 200 KB per gambar.

## Contoh pesan dari pemeriksa

```text
insertion-sort.md
  ERROR   baris 12: Gambar tanpa teks alternatif. ...  [image-alt]
  SARAN   baris 30: Blok kode tanpa nama bahasa. ...  [code-lang]
```

ERROR membuat `npm test` gagal (dan deploy tidak boleh dilanjutkan). SARAN tidak.

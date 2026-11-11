# Menambah modul materi baru

Contoh yang sudah ada: Modul 04 (Insertion Sort, dengan peraga khusus), Modul 01 (Konsep Dasar Algoritma, modul konsep tanpa visualizer), dan Modul 02 (Iteratif dan Rekursif, memakai gambar dari data hitung dan visualizer Binary Search yang sudah ada).

## Berkas yang perlu dibuat atau diubah

| Berkas | Isi |
| --- | --- |
| `public/modul-NN-judul.pdf` | PDF modul asli (dipakai tombol "Lihat PDF asli" dan "Unduh PDF"). |
| `src/content/modul/NN.md` | Teks modul. Format di bawah. |
| `src/content/modul/NN.kuis.js` | Kuis pemahaman: `export const kuisNN = { judul, modul, soal: [...] }`. |
| `src/content/modul/NN.blok.js` | Opsional. Mengekspor `pseudo` (data pseudocode) dan `gambar` (komponen) untuk penanda `{{pseudo:id}}` dan `{{gambar:id}}`. Komponen gambar ditulis di berkas `.jsx` terpisah. |
| `src/content/modul/index.js` | Daftarkan `teks`, `kuis`, dan (bila ada) `blok`, `tantangan`. |
| `src/data/modul.js` | Entri modul: judul, ringkasan, prasyarat, tujuan, halaman, soal, menit, `pdf`. `algoritmaId: null` bila belum ada visualizer. `tabs` boleh menimpa tulisan tab. |
| `src/data/quiz.js` | Entri kuis di halaman Quiz: tingkat (`easy`, `medium`, `hard`, `complex`), jenis soal, `thumb`. |
| `src/content/modulNN.test.js` | Tes isi (lihat "Tes" di bawah). |

Judul modul di `src/data/credit.js` (peta belajar) sudah lengkap untuk 24 modul; tes memastikan judulnya sama dengan `src/data/modul.js`.

## Format teks (`NN.md`)

```
@@ id | EYEBROW | Judul bagian         awal bagian
{{callout:benar|Judul}} ... {{/callout}}   catatan (jenis: benar, coba)
{{pseudo:id}}  {{gambar:id}}               blok dari NN.blok.js
```

- Enam id bagian yang dikenali tab dan penghitung kemajuan: `pendahuluan`, `algoritma`, `penelusuran`, `analisis`, `makna`, `kesimpulan`. Bagian dengan id lain (mis. `karakteristik`) tetap tampil, hanya tidak punya tab sendiri. Bagian `referensi` wajib ada.
- Modul dengan lebih dari enam bagian (mis. Modul 06 punya sembilan) memakai id lain, mis. `hubungan`, `penerapan`, `berguna`, untuk bagian yang tidak punya tab. Bagian itu tetap tampil di teks dan daftar isi.
- Tulisan tab bisa disesuaikan per modul lewat `tabs` di `src/data/modul.js` (lihat Modul 01).
- Rumus memakai TeX (`$...$`). Blok kode memakai pagar ```` ```python ````, ```` ```text ```` (keluaran), atau ```` ```pseudo ````.
- Penanda `{{kode}}`, `{{loops}}`, `{{kasus}}`, `{{tantangan}}` khusus Modul 04.

## Jenis soal kuis

`pilihan` dan `benarsalah` (opsi + `kunci`), `perhitungan`/`penelusuran`/`analisis` dengan `isian` (angka atau pilih, dinilai otomatis), serta soal `mandiri: true` (jawaban ditulis lalu dibandingkan dengan `kunciTeks`; pengguna menilai sendiri). Jenis tambahan `rancang` untuk soal merancang algoritma, dan `pembuktian` untuk soal membuktikan (biasanya `mandiri`, karena konstanta yang sah tidak tunggal; bagian yang punya jawaban pasti, mis. "n₀ terkecil", dijadikan `isian`).

## Tes

Salin pola `src/content/modul01.test.js`: cocokkan setiap angka di tabel dan kunci kuis dengan simulasi mandiri, jalankan program contoh sungguhan (Python) dan bandingkan keluarannya, dan periksa metadata terhadap katalog di Modul 00 (halaman dan jumlah soal). Setelah itu jalankan `npm test`, `npm run build`, dan `npm run audit:a11y`.

Jalankan audit juga sekali terhadap server dev (`npm run dev`, lalu `AUDIT_URL=http://127.0.0.1:5173/labu-kindle-book-algoritma/ npm run audit:a11y`). Di mode dev React StrictMode menjalankan efek dua kali, dan audit memeriksa bahwa halaman modul terbuka di atas (tidak tergulir ke kuis atau bagian lain oleh efek).

Tes yang menjalankan Python (`cariPython()` di `src/test/python.js`) di-skip otomatis bila Python 3 tidak ditemukan. Di Windows nama perintahnya bisa `python` atau `py`, bukan `python3`.

## Catatan penulisan yang pernah menimbulkan masalah

- **Rumus blok** ditulis `$$` di baris sendiri, rumusnya di baris berikutnya, lalu `$$` penutup. Rumus `$$...$$` dalam satu baris menjadi rumus sebaris yang tidak bisa digulir dan melebarkan halaman di HP. Rumus panjang di dalam butir daftar: pecah butirnya, tulis rumus sebagai blok yang menjorok dua spasi. Tes `modulContent.test.js` dan audit (pemeriksaan reflow 390px) menjaga hal ini.
- **Penanda `{{callout:...}}`** hanya mengenal jenis `benar` dan `coba`. Kotak "Definisi" dan "Catatan" memakai `benar`.
- **Soal kuis** dengan beberapa bagian yang bisa dinilai otomatis (mis. Soal 6 Modul 03) dipecah jadi `isian` (angka atau `pilih`) supaya tidak harus dinilai sendiri.

## Visualizer "penjelajah" (halaman interaktif non-langkah)

Konsep yang tidak punya langkah eksekusi tetapi tetap enak dieksplorasi (mis. Pohon Recurrence di Modul 09) tidak cocok dengan pemutar langkah. Untuk itu ada "penjelajah": halaman bebas di `/algoritma/:id`. Kalau konsepnya hanya perhitungan atau pembuktian tanpa algoritma bertahap (Modul 05 dan 06), lebih baik tanpa visualizer: isi `algoritmaId: null` dan jangan buat kartu galeri.

1. Tulis model hitung murni tanpa React (contoh: `src/viz/masterModel.js`) beserta tesnya. Cocokkan angkanya dengan tabel di PDF modul.
2. Tulis halaman (contoh: `src/viz/PenjelajahPohon.jsx`) memakai `PenjelajahShell` untuk kepala halaman. Setiap grafik wajib punya padanan tabel, nama/deskripsi (`role="img"`), dan pembeda selain warna.
3. Daftarkan id di `src/viz/penjelajahIds.js` dan komponen lazy di `src/viz/penjelajah.js`. Di `src/data/algoritma.js` set `viz: true` pada kartunya (dan `thumb` bila perlu gambar baru di `src/ui/Thumb.jsx`).
4. Modul yang menautkannya cukup mengisi `algoritmaId` di `src/data/modul.js`. Komponen grafik yang sama bisa dipakai ulang sebagai gambar di teks modul (lihat `05.gambar.jsx`, yang memakai `GrafikPertumbuhan`).
5. Tambahkan rutenya, dan keadaan interaktif yang penting, ke `scripts/a11y-audit.mjs`.

## Teks polos dan teks TeX

- Dirender sebagai **teks biasa** (tanpa TeX, jadi tidak boleh memuat `$` atau `\`): `judul`, `judulPanjang`, `ringkas`, dan `prasyaratTeks` di `src/data/modul.js`, serta **judul callout** (`{{callout:benar|Judul}}`). Pakai simbol Unicode (Θ, ², √, ≤).
- Dirender sebagai **Markdown dengan TeX**: isi teks modul (`NN.md`), judul sub-bagian `###`, `tujuan`, dan teks soal/pembahasan kuis.
- Tes `modulNN.test.js` menjaga ini supaya tidak muncul `$\Theta$` mentah di layar.

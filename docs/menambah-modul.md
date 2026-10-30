# Menambah modul materi baru

Contoh yang sudah ada: Modul 04 (Insertion Sort, dengan peraga khusus) dan Modul 01 (Konsep Dasar Algoritma, modul konsep tanpa visualizer).

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
- Tulisan tab bisa disesuaikan per modul lewat `tabs` di `src/data/modul.js` (lihat Modul 01).
- Rumus memakai TeX (`$...$`). Blok kode memakai pagar ```` ```python ````, ```` ```text ```` (keluaran), atau ```` ```pseudo ````.
- Penanda `{{kode}}`, `{{loops}}`, `{{kasus}}`, `{{tantangan}}` khusus Modul 04.

## Jenis soal kuis

`pilihan` dan `benarsalah` (opsi + `kunci`), `perhitungan`/`penelusuran`/`analisis` dengan `isian` (angka atau pilih, dinilai otomatis), serta soal `mandiri: true` (jawaban ditulis lalu dibandingkan dengan `kunciTeks`; pengguna menilai sendiri). Jenis tambahan `rancang` untuk soal merancang algoritma.

## Tes

Salin pola `src/content/modul01.test.js`: cocokkan setiap angka di tabel dan kunci kuis dengan simulasi mandiri, jalankan program contoh sungguhan (Python) dan bandingkan keluarannya, dan periksa metadata terhadap katalog di Modul 00 (halaman dan jumlah soal). Setelah itu jalankan `npm test`, `npm run build`, dan `npm run audit:a11y`.

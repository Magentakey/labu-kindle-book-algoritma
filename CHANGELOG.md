# Changelog

Semua perubahan penting pada LABU — Kindle Book Algoritma dicatat di sini. Format mengikuti [Keep a Changelog](https://keepachangelog.com/id-ID/1.1.0/) dan penomoran versi mengikuti [Semantic Versioning](https://semver.org/lang/id/). Ringkasan yang sama tampil di halaman **Credit → Tentang LABU** di dalam aplikasi (`src/data/credit.js`).

Tanggal dan isi rilis disusun dari riwayat commit repositori. Versi sebelum 1.1.0 diberi nomor setelah kejadian (retrospektif) dengan mengelompokkan commit per tahap pengerjaan.

## [1.1.0] - 2026-11-26

### Ditambahkan
- Bagian **Identitas** di halaman **Credit**: logo dan nama kampus (Institut Teknologi Indonesia), program studi, mata kuliah (Perancangan dan Analisis Algoritma, Ganjil 2026/2027), periode pengerjaan, dan dua dosen. Kartu tim pengembang kini memuat NRP tiap anggota.
- Komponen `DropdownMenu` (menu disclosure yang bisa dipakai dengan keyboard) di `src/ui`.

### Diubah
- Halaman **Algoritma**: blok kategori (Pencarian, Sorting, Analisis, Dynamic Programming, Greedy, Penelusuran Graf, Minimum Spanning Tree, Shortest Path) dihapus. Seluruh 17 algoritma tampil dalam satu daftar tanpa filter secara bawaan, dan label kategori tetap ada di tiap kartu.
- Halaman **Algoritma**: filter kategori yang tadinya deretan tombol kini menjadi menu dropdown **Kategori**, bawaan "Semua".
- Halaman **Algoritma**: empat tombol perbandingan (Insertion Sort vs Merge Sort, BFS vs DFS, Kruskal vs Prim, Dijkstra vs Bellman-Ford) digabung menjadi satu menu dropdown **Algoritma perbandingan**. Dropdown bisa dioperasikan dengan keyboard (Esc menutup dan mengembalikan fokus) dan ditutup saat klik di luar.
- Teks pengantar halaman **Materi** dan **Quiz** tidak lagi menyebut "modul direncanakan" karena seluruh 24 modul sudah tersedia.
- Halaman **Credit**: changelog diperbarui sampai rilis terbaru, memuat tanggal, dan rilis lama dilipat dalam daftar "Riwayat lebih lama".
- Nomor versi `package.json` diselaraskan dengan rilis (1.1.0).

### Diperbaiki
- Progres belajar di halaman modul (mis. Modul 02) tidak terbaca di daftar **Materi**: kemajuan mandek di sekitar 50% karena hanya bagian yang sedang aktif yang dicatat, sedangkan bagian pendek di akhir halaman (Makna, Kesimpulan, Referensi) tidak pernah naik ke garis baca. Kini semua bagian yang sudah dicapai atau dilewati dicatat, termasuk saat pengguna menggulir cepat atau lompat lewat tab, dan sampai di dasar halaman berarti semua bagian sudah dilihat.

### Dihapus
- Kotak "Modul lain sedang disiapkan" di bagian bawah halaman **Materi**.
- Kotak "Kuis modul lain sedang disiapkan" di bagian bawah halaman **Quiz**.
- Kalimat "Modul lain sedang disiapkan" pada kartu "Blok berikutnya" di Credit.

### Dokumentasi
- Menambah `CHANGELOG.md` (berkas ini) dan memperbarui `README.md`.

## [1.0.0] - 2026-11-12

### Ditambahkan
- Tantangan kode untuk 21 modul (editor CodeMirror, kasus uji, dan solusi pembanding).
- **Bandingkan** untuk BFS vs DFS, Kruskal vs Prim, dan Dijkstra vs Bellman-Ford, melengkapi Insertion Sort vs Merge Sort.
- `README.md` dengan alamat deploy, tim, fitur, perintah, dan panduan kontribusi.

### Diubah
- Kuis seluruh modul menjadi pilihan ganda (jawaban tunggal dan banyak jawaban) dengan koreksi langsung, bunyi umpan balik yang lebih keras, dan tingkat Hard.

## [0.9.0] - 2026-11-12

### Ditambahkan
- Visualizer pohon recurrence, konsep Dynamic Programming, konsep Greedy, dan representasi graf, semuanya memakai template langkah yang sama.

### Dihapus
- Visualizer pertumbuhan fungsi, batas asimtotik, dan little-o/little-omega (Modul 5, 6, dan 7 kini tanpa visualizer).

### Diperbaiki
- Panel kode visualizer tidak lagi menggulir halaman secara otomatis.

## [0.8.0] - 2026-11-06 s.d. 2026-11-11

### Ditambahkan
- Modul 16 Graf dan Representasinya, 17 Breadth-First Search, 18 Depth-First Search.
- Modul 19 Konsep Minimum Spanning Tree, 20 Algoritma Kruskal, 21 Algoritma Prim.
- Modul 22 Konsep Shortest Path dan Relaksasi, 23 Algoritma Bellman-Ford, 24 Algoritma Dijkstra.
- Gambar keadaan graf per langkah (graf berarah, DFS-forest, graf berbobot, potongan/cut, keadaan himpunan S dan antrean Q) beserta modelnya.

### Diperbaiki
- Tampilan tanda minus Unicode di kuis; warna pada beberapa komponen.

## [0.7.0] - 2026-11-02 s.d. 2026-11-05

### Ditambahkan
- Modul 08 Divide and Conquer (Merge Sort), 09 Recurrence dan Metode Master, 10 Konsep Dynamic Programming, 11 Perkalian Rantai Matriks, 12 Longest Common Subsequence, 13 Konsep Algoritma Greedy, 14 Activity-Selection, dan 15 Kode Huffman.
- Penjelajah pohon recurrence, penjelajah konsep DP dan Greedy, tabel c/b dengan jalur PRINT-LCS, pohon pemecahan optimal, garis waktu aktivitas, dan pohon kode.

### Diperbaiki
- Kontras teks yang memuat rumus.

## [0.6.0] - 2026-10-31 s.d. 2026-11-02

### Ditambahkan
- Modul 01 Konsep Dasar Algoritma, 02 Iteratif dan Rekursif, 03 Konsep Running Time, 05 Pertumbuhan Fungsi, 06 Notasi Asimtotik, dan 07 Notasi Little-o dan Little-Omega.
- Panduan menambah modul (`docs/menambah-modul.md`) dan data modul dari Modul 00.

### Diperbaiki
- Tampilan dropdown di mode gelap; rumus yang melebar di HP (Modul 02–04) dan galeri algoritma; loncat ke kuis saat membuka materi; normalisasi CRLF pada tes modul; tes Python lintas OS.

## [0.5.0] - 2026-10-30

### Ditambahkan
- Halaman **Quiz** (daftar, kuis, hasil) dan **Credit** (progres belajar, glosarium, peta belajar, tim, dan sumber).

### Diperbaiki
- Mode gelap tantangan, dialog materi lama, audit aksesibilitas, serta tes render dan acak berbiji.

## [0.4.0] - 2026-10-29

### Ditambahkan
- Halaman **Materi** (daftar modul, kartu "Lanjutkan belajar"), Modul 04 Insertion Sort, kuis modul, dan kemajuan belajar.

## [0.3.0] - 2026-10-24 s.d. 2026-10-25

### Ditambahkan
- Halaman visualizer graf (pseudocode, simpul A–F) dan visualizer batang, tabel, garis waktu, dan pohon Huffman.
- Fitur **Bandingkan** dua algoritma.

## [0.2.0] - 2026-10-23

### Ditambahkan
- Galeri algoritma, navbar atas, dan bottom nav di HP.
- State PWA dan umpan balik; antarmuka diselaraskan dengan style guide v1.0.

## [0.1.0] - 2026-10-22

### Ditambahkan
- Fondasi desain ulang: token desain, tema terang dan gelap, ikon, maskot, dan komponen dasar.

## [0.0.1] - 2026-10-07 s.d. 2026-10-15

### Ditambahkan
- Inisialisasi proyek Vite + React, Tailwind, React Router, dan alur deploy ke GitHub Pages.
- PWA (manifest, service worker, ikon), dasar aksesibilitas, dan lint jsx-a11y.
- Visualizer algoritma (Insertion Sort, Merge Sort, pohon, graf, DP, garis waktu), mode tantangan kode dengan Web Worker, MathJax, dan materi awal dengan peraga.

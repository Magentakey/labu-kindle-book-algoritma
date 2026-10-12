# Panduan Penghitung Rasio (`::ratio`)

Komponen untuk materi 3 (Pertumbuhan Fungsi Running Time). Pembaca mengisi **n awal** dan **n akhir**, lalu tabel menampilkan rasio
kenaikan f(n akhir) / f(n awal) untuk tiap kelas fungsi, lengkap dengan penurunannya.
Cara kerjanya sama dengan penanda `::growth` di [`panduan-komponen-interaktif.md`](panduan-komponen-interaktif.md), dan bisa dipakai di mana saja
(juga di dalam `:::steps`, `:::tabs`, dan `:::reveal`).

## Cara menulis

```text
::ratio
::ratio n log n, n^2
::ratio n log n, n^2 ; 4, 1024
```

Bentuknya `::ratio kelas1, kelas2 ; n awal, n akhir`. Dua bagian itu opsional dan dipisah titik koma.

| Penulisan | Hasil |
| --- | --- |
| `::ratio` | Semua delapan kelas, n = 5 menjadi n = 25 (contoh di materi 3) |
| `::ratio n, n^2` | Hanya kelas yang disebut, n = 5 menjadi n = 25 |
| `::ratio n log n, n^2 ; 4, 1024` | Kelas yang disebut, n = 4 menjadi n = 1024 |
| `::ratio ; 3, 9` | Semua kelas, n = 3 menjadi n = 9 |

Kelas yang tersedia sama dengan `::growth`: `1`, `log n`, `n`, `n log n`, `n^2`, `n^3`, `2^n`, `n!`. Pembaca bebas mengganti isian awal dan
menekan **Kembalikan contoh** untuk kembali ke nilai yang ditulis di materi.

## Aturan masukan

- n awal dan n akhir bilangan bulat, `1 ≤ n awal < n akhir ≤ 1024`.
- lg 1 = 0, jadi untuk n awal = 1 baris `log n` dan `n log n` ditampilkan "tidak terdefinisi" (rasio –). Kelas lain tetap dihitung.
- Rasio n! hanya dihitung sampai n akhir = 170, karena 171! sudah tidak terhingga di JavaScript.
- Rasio dihitung dengan rumus tertutup (misalnya 2^(n₂ − n₁)), bukan dengan membagi dua bilangan raksasa, sehingga 2ⁿ tidak meluap.
- Masukan tidak sah menampilkan pesan galat yang menyebut sebabnya, dan tabel disembunyikan sampai masukan diperbaiki.

Penanda yang salah ditangkap oleh `npm run check:content`: kelas tidak dikenal (`ratio-unknown`), dan n yang tidak sah atau tidak lengkap (`ratio-n`).

## Kode

| Berkas | Isi |
| --- | --- |
| `src/lib/ratio.js` | Fungsi murni: `ratioValue`, `ratioFormula`, `ratioRows`, `ratioSummary`, `validateRatioInput`, `parseRatioArgs` |
| `src/components/Interactive/RatioExplorer.jsx` | Tampilan: dua isian, tombol kembalikan, dan tabel |
| `src/lib/ratio.test.js` | Tes: cocok dengan tabel materi 3, dengan perhitungan langsung f(n₂)/f(n₁) pada banyak pasangan n, dan batas masukan |

Tabelnya adalah tabel HTML sungguhan dengan judul kolom dan judul baris, bisa digeser dengan keyboard di layar sempit, dan kolom **Rasio**
sengaja diletakkan sebelum **Penurunan rasio** supaya angkanya tetap terlihat di HP. Komponennya memakai `role="group"` (bukan `<section>`)
karena satu halaman bisa memuat lebih dari satu penghitung dan landmark kembar dilaporkan oleh axe.

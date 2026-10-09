## Pengertian

Jelaskan konsep utama materi dalam dua sampai tiga kalimat. Tulis istilah penting dengan **huruf tebal** saat pertama kali muncul, misalnya **running time** dan **kasus terburuk**.

Gunakan paragraf pendek. Satu paragraf membahas satu gagasan.

## Cara Kerja

Gunakan daftar bernomor untuk langkah yang berurutan:

1. Ambil elemen berikutnya dari bagian yang belum terurut.
2. Bandingkan dengan elemen di bagian yang sudah terurut.
3. Sisipkan pada posisi yang benar.

Gunakan daftar biasa untuk hal yang tidak berurutan:

- Stabil: urutan elemen kembar tidak berubah.
- In-place: tidak butuh memori tambahan sebanding dengan n.

::visualizer

## Analisis Running Time

Tulis rumus dengan simbol Unicode, bukan LaTeX: Θ(n²), O(n log n), Ω(n), T(n) = 2T(n/2) + Θ(n).

| Kasus | Kondisi data | Running time |
| --- | --- | --- |
| Terbaik | Sudah terurut | Θ(n) |
| Rata-rata | Acak | Θ(n²) |
| Terburuk | Terbalik | Θ(n²) |

Setiap tabel wajib punya baris judul kolom yang terisi.

### Contoh Kode

Beri nama bahasa pada setiap blok kode. Untuk pseudocode, pakai `text`.

```javascript
function maks(arr) {
  let hasil = arr[0]
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > hasil) hasil = arr[i]
  }
  return hasil
}
```

```text
INSERTION-SORT(A)
  for j = 2 to A.length
    key = A[j]
    i = j - 1
    while i > 0 and A[i] > key
      A[i + 1] = A[i]
      i = i - 1
    A[i + 1] = key
```

> Catatan: kutipan seperti ini cocok untuk kesalahan umum atau hal yang sering keliru.

### Gambar

Gambar disimpan di folder `public/materi/<id-materi>/`. Teks dalam kurung siku wajib menjelaskan isi gambar untuk pengguna pembaca layar.

![Grafik perbandingan pertumbuhan n, n log n, dan n kuadrat](/materi/contoh/pertumbuhan.png)

Untuk tautan, tulis nama tujuannya: [Dokumentasi Insertion Sort di Wikipedia](https://id.wikipedia.org/wiki/Insertion_sort).

::challenge

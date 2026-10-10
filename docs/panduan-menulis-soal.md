# Panduan Menulis Soal Challenge

Setiap soal adalah satu file di `src/content/challenges/<id>.json`. `<id>` harus sama dengan isi kolom `challenge` materinya di `src/content/materials.json`. Materi yang file soalnya belum ada otomatis menampilkan "Soal challenge segera hadir." (daftarnya dijaga di `COMING_SOON` pada `src/content/content.test.js`).

## Format

```json
{
  "id": "insertion-sort",
  "title": "Urutkan Array Naik",
  "description": "Tulis fungsi solve(arr) yang ...\nContoh: solve([3, 1, 2]) mengembalikan [1, 2, 3].",
  "starterCode": "function solve(arr) {\n  // tulis kode Anda di sini\n}\n",
  "solution": "function solve(arr) {\n  // ... jawaban contoh lengkap dengan komentar\n}\n",
  "testCases": [
    { "input": [[3, 1, 2]], "expected": [1, 2, 3] },
    { "input": [[]], "expected": [] }
  ]
}
```

- Mahasiswa selalu menulis fungsi bernama **`solve`** (JavaScript, sinkron).
- `input` adalah **daftar argumen**. `solve([3, 1, 2])` ditulis `"input": [[3, 1, 2]]`, sedangkan `solve(a, b)` ditulis `"input": [[1, 2], [3, 4]]`.
- `expected` adalah nilai yang harus dikembalikan. Perbandingan memakai kesamaan isi (urutan array berpengaruh, urutan kunci objek tidak).
- `description` boleh berisi `\n` untuk pindah baris. Teks biasa saja, tanpa Markdown.
- `solution` adalah **jawaban contoh** yang muncul saat mahasiswa menekan "Lihat jawaban contoh" (hanya baca, bisa disalin ke editor). Karena dibaca mahasiswa, tulis rapi, dengan indentasi 2 spasi dan komentar singkat yang menjelaskan langkah-langkahnya.

## Aturan

1. **Hanya nilai yang bisa disimpan di JSON.** Tidak ada `Infinity`, `NaN`, atau `undefined`. Untuk "tidak terjangkau" pakai `-1`, dan tulis aturannya di deskripsi.
2. **Jawaban harus tunggal dan pasti.** Jika ada beberapa jawaban benar (misalnya urutan BFS), tentukan aturan pemilihannya di deskripsi, seperti "kunjungi tetangga bernomor lebih kecil dulu".
3. **Minimal 4 test case**, termasuk kasus tepi: kosong, satu elemen, kembar, sudah terurut, kebalikan, tidak terhubung, dan sebagainya.
4. **Sertakan satu contoh** di deskripsi, dan pastikan contohnya benar.
5. **Kode awal tidak boleh lulus** semua test case.
6. **Nama keluaran berupa teks sebaiknya mudah diketik di HP.** Pakai "big-O" atau "theta", jangan "Θ" atau "Ω".

## Jawaban contoh (wajib)

Setiap soal harus punya field `solution`. `npm test` memastikan jawaban contoh lulus semua test case dan kode awal tidak. Jika Anda menulis soal tanpa `solution`, `npm test` akan gagal. Jawaban contoh ikut terunduh bersama soalnya, jadi **jangan menyimpan soal ujian rahasia di repo ini**.

Saran: hitung nilai `expected` dengan cara yang **berbeda** dari jawaban contoh (misalnya brute force), supaya kesalahan di salah satunya ketahuan.

## Mencoba

```bash
npm test          # memeriksa format, jawaban acuan, dan daftar "segera hadir"
npm run dev       # buka materinya, tulis jawaban, tekan "Jalankan kode"
```

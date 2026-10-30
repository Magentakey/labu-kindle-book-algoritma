# Pengujian dan aksesibilitas

## Tes otomatis

`npm test` menjalankan semua `*.test.js` dengan `node --test`.

- **Tes logika**: `src/lib`, `src/data`, `src/algorithms`, `src/content`.
- **Tes render** (`src/test/render.test.js`): halaman dan komponen `.jsx` dimuat lewat Vite SSR (`src/test/ssr.js`) dan dirender ke HTML, lalu strukturnya diperiksa (judul, tautan, nama aksesibel, `alt`, status sebagai teks). Efek (`useEffect`) tidak berjalan di SSR; yang diuji adalah keluaran render awal. Halaman yang membaca `window` saat render (mis. galeri Algoritma) belum bisa diuji dengan cara ini.
- **Tes kontras** (`src/styles/tokens.contrast.test.js`): membaca `tokens.css` dan memastikan pasangan warna penting memenuhi 4,5 : 1 di mode terang dan gelap. Menambah token warna baru untuk teks? Tambahkan pasangannya di tes ini.

### Tes acak

Tes yang memakai masukan acak memakai `src/lib/testRandom.js` (`rand()`), bukan `Math.random()`. Bijinya tetap, jadi hasil `npm test` selalu sama. Untuk berburu kasus langka:

```bash
TEST_SEED=random npm test      # biji acak; biji yang dipakai dicetak
TEST_SEED=123 npm test         # ulangi biji tertentu
```

Bila sebuah biji gagal, simpan angkanya, perbaiki, lalu jadikan kasus itu tes tersendiri.

## Audit aksesibilitas (axe-core)

`scripts/a11y-audit.mjs` membuka semua halaman utama di Chromium dalam mode terang dan gelap, termasuk keadaan interaktif (kuis berjalan, hasil kuis, tantangan kode dengan hasil, dialog konfirmasi), lalu menjalankan axe-core dengan aturan WCAG 2.0 sampai 2.2 level A dan AA.

```bash
npm run build
npx vite preview --port 4173        # terminal 1
npm run audit:a11y                  # terminal 2
```

Pertama kali: `npx playwright-core install chromium`. Variabel opsional: `AUDIT_URL`, `AUDIT_ONLY` (potongan nama rute), `CHROMIUM_PATH`.

Batas: axe hanya menangkap sebagian masalah (kira-kira sepertiga). Urutan fokus, kualitas teks alternatif, dan pengalaman dengan pembaca layar tetap perlu diuji manual (NVDA, VoiceOver, atau TalkBack).

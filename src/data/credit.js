// Isi halaman Credit. Sebagian masih sementara dan ditandai "TODO tim" supaya mudah dicari dan diganti.
// Sumber desain: Figma "Credit · konten penuh". Judul 24 modul dan angka koleksi dicocokkan dengan "Modul 00 · Indeks dan Peta Belajar".

/** Judul singkat 24 modul (peta belajar), dikelompokkan per bab. `konsep` = modul konsep umum (pintu masuk bab). */
export const petaBab = [
  { bab: 'Bab I', modul: [[1, 'Konsep Dasar Algoritma', true], [2, 'Iteratif dan Rekursif']] },
  { bab: 'Bab II', modul: [[3, 'Konsep Running Time', true], [4, 'Insertion Sort'], [5, 'Pertumbuhan Fungsi'], [6, 'Notasi Asimtotik'], [7, 'Notasi Little-o dan Little-Omega']] }, // judul sesuai katalog di Modul 00
  { bab: 'Bab III', modul: [[8, 'Divide and Conquer', true], [9, 'Recurrence dan Metode Master']] }, // judul sesuai katalog di Modul 00
  { bab: 'Bab IV', modul: [[10, 'Konsep Dynamic Programming', true], [11, 'Perkalian Rantai Matriks'], [12, 'Longest Common Subsequence']] },
  { bab: 'Bab V', modul: [[13, 'Konsep Algoritma Greedy', true], [14, 'Activity-Selection'], [15, 'Kode Huffman']] },
  { bab: 'Bab VI-a', modul: [[16, 'Graf dan Representasinya', true], [17, 'Breadth-First Search'], [18, 'Depth-First Search']] },
  { bab: 'Bab VI-b', modul: [[19, 'Konsep Minimum Spanning Tree', true], [20, 'Algoritma Kruskal'], [21, 'Algoritma Prim']] },
  { bab: 'Bab VI-c', modul: [[22, 'Konsep Shortest Path', true], [23, 'Algoritma Bellman-Ford'], [24, 'Algoritma Dijkstra']] },
].map((b) => ({ bab: b.bab, modul: b.modul.map(([no, judul, konsep]) => ({ no, id: String(no).padStart(2, '0'), judul, konsep: Boolean(konsep) })) }))

export const glosarium = [
  { istilah: 'Running time', arti: 'Banyaknya langkah dasar yang dijalankan algoritma sebagai fungsi ukuran masukan $n$, ditulis $T(n)$.', modul: '03' },
  { istilah: 'Big-O ($O$)', arti: 'Batas atas asimtotik: $f(n) = O(g(n))$ jika $f(n) \\le c \\cdot g(n)$ untuk semua $n \\ge n_0$.', modul: '06' },
  { istilah: 'Invarian perulangan', arti: 'Sifat yang selalu benar di awal setiap putaran perulangan; dipakai untuk membuktikan algoritma benar.', modul: '04' },
  { istilah: 'Memoization', arti: 'Menyimpan hasil submasalah yang sudah dihitung agar tidak dihitung ulang.', modul: '10' },
  { istilah: 'Relaksasi (RELAX)', arti: 'Memperbarui $v.d$ jika lintasan melalui $u$ lebih pendek: $v.d > u.d + w(u, v)$.', modul: '22' },
  { istilah: 'Safe edge', arti: 'Busur yang aman ditambahkan ke himpunan tanpa merusak sifat subset MST.', modul: '19' },
]

// Foto sudah dipotong persegi (public/tim). Peran ditulis ulang dari desain Canva: "Documenter" dan "PM & Designer".
// NRP diberikan oleh tim; nama dan peran sesuai Stakeholder Register dan README.
export const tim = [
  { nama: 'Ramdhany Sunarto', nrp: '1152800005', peran: 'Programmer', foto: 'tim/ramdhany.jpg' },
  { nama: 'Muhammad Andi Rizky Maulana Ibrahim', nrp: '1152800022', peran: 'Analyst', foto: 'tim/andi.jpg' },
  { nama: 'Iqbal Andrianto', nrp: '1152800014', peran: 'Project Manager & Designer', foto: 'tim/iqbal.jpg' },
  { nama: 'Gilang Putra Wardana', nrp: '1152800013', peran: 'Documenter', foto: 'tim/gilang.jpg' },
]

/** Identitas akademik proyek (bagian "Identitas" di Credit). Periode mengikuti Stakeholder Register LABU; mata kuliah dan daftar dosen sesuai konfirmasi tim. */
export const identitas = {
  logo: 'logo-iti.png',
  kampus: 'Institut Teknologi Indonesia',
  prodi: 'Teknik Informatika',
  mataKuliah: 'Interaksi Manusia dan Komputer, Ganjil 2026/2027',
  proyek: 'LABU - Kindle Book Algoritma (Labu I-Learning Algoritma)',
  periode: '7 Oktober – -',
  dosen: [
    { nama: 'Melani Indriasari, S.T., M.Kom.', peran: 'Dosen pengajar tugas proyek' },
    { nama: 'Dra. Endang Ratnawati Djuwitaningrum, M.Kom.', peran: 'Dosen mata kuliah algoritma' },
  ],
}

export const sumber = [
  'Modul PAA: 24 modul PDF (248 halaman, 178 soal) yang dikembangkan dari 16 bahan kuliah Perancangan dan Analisis Algoritma.',
  'Cormen dkk. (2009) Introduction to Algorithms, 3rd ed. · Knuth (1997) TAOCP Vol. 1 · Sedgewick & Wayne (2011) Algorithms, 4th ed. · Dijkstra (1959).',
  'Aset: logo pixel-art dan maskot labu LABU (tim pengembang).',
  'Font: Poppins, JetBrains Mono, Silkscreen (Google Fonts, SIL Open Font License).',
  'Library: React, Vite, Tailwind CSS, React Router, react-markdown, MathJax (rumus), CodeMirror (editor kode), Prism (pewarna kode), dan service worker untuk mode offline.',
]

export const tentang = {
  cerita: 'Si labu yang kalem (mata ^ ^, pipi merona) menemani kamu belajar: berpikir saat kamu memilih, tersenyum saat jawabanmu benar, kaget saat salah, dan merayakan setiap blok yang tersusun.',
  versi: '1.1.0', // samakan dengan package.json dan CHANGELOG.md
  // Terbaru di atas. Ringkasan dari riwayat commit; rincian lengkap ada di CHANGELOG.md di repositori.
  changelog: [
    { versi: '1.1.0', tanggal: '26 Nov 2026', teks: 'Halaman Algoritma: semua algoritma tampil dalam satu daftar tanpa blok kategori, filter kategori dan perbandingan algoritma jadi menu dropdown. Credit memuat identitas kampus, mata kuliah, dosen, dan NRP tim. Progres belajar di halaman modul kini tercatat sampai bagian akhir. Keterangan "modul lain sedang disiapkan" dihapus karena 24 modul sudah lengkap. Changelog dan README diperbarui.' },
    { versi: '1.0.0', tanggal: '12 Nov 2026', teks: 'Rilis lengkap: 24 modul, kuis pilihan ganda dengan koreksi langsung dan tingkat Hard, tantangan kode di 21 modul, dan Bandingkan untuk 4 pasangan algoritma (Insertion vs Merge, BFS vs DFS, Kruskal vs Prim, Dijkstra vs Bellman-Ford). README ditulis.' },
    { versi: '0.9.0', tanggal: '12 Nov 2026', teks: 'Visualizer pohon recurrence, konsep DP, konsep greedy, dan representasi graf memakai template langkah. Visualizer Modul 5, 6, dan 7 dihapus. Panel kode tidak lagi menggulir halaman sendiri.' },
    { versi: '0.8.0', tanggal: '6–11 Nov 2026', teks: 'Modul 16–24: graf dan representasinya, BFS, DFS, konsep MST, Kruskal, Prim, konsep shortest path, Bellman-Ford, dan Dijkstra, lengkap dengan gambar keadaan graf per langkah.' },
    { versi: '0.7.0', tanggal: '2–5 Nov 2026', teks: 'Modul 08–15: Divide and Conquer, Recurrence dan Metode Master, Dynamic Programming, Perkalian Rantai Matriks, LCS, Greedy, Activity-Selection, dan Kode Huffman.' },
    { versi: '0.6.0', tanggal: '31 Okt–2 Nov 2026', teks: 'Modul 01–03 dan 05–07: konsep dasar, iteratif dan rekursif, running time, pertumbuhan fungsi, notasi asimtotik, dan little-o/little-omega. Panduan menambah modul.' },
    { versi: '0.5.0', tanggal: '30 Okt 2026', teks: 'Halaman Quiz dan Credit: daftar kuis per tingkat, progres belajar, glosarium, peta belajar, dan tim. Perbaikan mode gelap tantangan dan audit aksesibilitas.' },
    { versi: '0.4.0', tanggal: '29 Okt 2026', teks: 'Halaman Materi: Modul 04 Insertion Sort dengan kuis pemahaman dan kemajuan belajar.' },
    { versi: '0.3.0', tanggal: '24–25 Okt 2026', teks: 'Visualizer algoritma graf, batang, tabel, garis waktu, dan Huffman, serta Bandingkan dua algoritma.' },
    { versi: '0.2.0', tanggal: '23 Okt 2026', teks: 'Galeri algoritma, navbar dan bottom nav, state PWA dan umpan balik, selaras style guide v1.0.' },
    { versi: '0.1.0', tanggal: '22 Okt 2026', teks: 'Fondasi desain ulang: token, tema terang dan gelap, ikon, maskot, dan komponen dasar.' },
    { versi: '0.0.1', tanggal: '7–15 Okt 2026', teks: 'Prototipe awal: proyek Vite + React, deploy GitHub Pages, PWA, visualizer algoritma, mode tantangan kode, dan materi awal.' },
  ],
}

/** Berkas PDF Modul 00 (indeks, peta belajar, katalog, dan ringkasan koreksi terhadap bahan sumber). */
export const pdfModul00 = 'modul-00-indeks-dan-peta-belajar.pdf'

/** Tab bagian di halaman Credit (urutan sama dengan urutan bagian di halaman). */
export const creditTabs = [
  { id: 'progres', tab: 'Progres Belajar' },
  { id: 'glosarium', tab: 'Glosarium' },
  { id: 'peta', tab: 'Peta Belajar' },
  { id: 'identitas', tab: 'Identitas' },
  { id: 'tim', tab: 'Tim Pengembang' },
  { id: 'sumber', tab: 'Sumber & Referensi' },
  { id: 'tentang', tab: 'Tentang LABU' },
]

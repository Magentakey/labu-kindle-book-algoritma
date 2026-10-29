// Isi halaman Credit. Sebagian masih sementara dan ditandai "TODO tim" supaya mudah dicari dan diganti.
// Sumber desain: Figma "Credit · konten penuh". Judul 24 modul diambil dari peta belajar di desain.

/** Judul singkat 24 modul (peta belajar), dikelompokkan per bab. `konsep` = modul konsep umum (pintu masuk bab). */
export const petaBab = [
  { bab: 'Bab I', modul: [[1, 'Konsep Dasar Algoritma', true], [2, 'Iteratif dan Rekursif']] },
  { bab: 'Bab II', modul: [[3, 'Konsep Running Time', true], [4, 'Insertion Sort'], [5, 'Pertumbuhan Fungsi'], [6, 'Notasi Asimtotik'], [7, 'Notasi Little-o dan Little-ω']] }, // TODO tim: judul 07 dipotong di desain, cocokkan dengan PDF
  { bab: 'Bab III', modul: [[8, 'Divide and Conquer', true], [9, 'Recurrence dan Metode Master']] }, // TODO tim: judul 09 dipotong di desain, cocokkan dengan PDF
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
export const tim = [
  { nama: 'Ramdhany Sunarto', peran: 'Programmer', foto: 'tim/ramdhany.jpg' },
  { nama: 'Muhammad Andi Rizky Maulana Ibrahim', peran: 'Analyst', foto: 'tim/andi.jpg' },
  { nama: 'Iqbal Andrianto', peran: 'Project Manager & Designer', foto: 'tim/iqbal.jpg' },
  { nama: 'Gilang Putra Wardana', peran: 'Documenter', foto: 'tim/gilang.jpg' },
]

export const sumber = [
  'Modul PAA: 24 modul PDF yang dikembangkan dari bahan kuliah Perancangan dan Analisis Algoritma.', // TODO tim: cantumkan jumlah halaman, soal, dan bahan kuliah bila sudah final
  'Cormen dkk. (2009) Introduction to Algorithms, 3rd ed. · Knuth (1997) TAOCP Vol. 1 · Sedgewick & Wayne (2011) Algorithms, 4th ed. · Dijkstra (1959).',
  'Aset: logo pixel-art dan maskot labu LABU (tim pengembang).',
  'Font: Poppins, JetBrains Mono, Silkscreen (Google Fonts, SIL Open Font License).',
  'Library: React, Vite, Tailwind CSS, React Router, react-markdown, MathJax (rumus), CodeMirror (editor kode), Prism (pewarna kode), dan service worker untuk mode offline.',
]

export const tentang = {
  cerita: 'Si labu yang kalem (mata ^ ^, pipi merona) menemani kamu belajar: berpikir saat kamu memilih, tersenyum saat jawabanmu benar, kaget saat salah, dan merayakan setiap blok yang tersusun.',
  versi: '0.5.0', // TODO tim: samakan dengan nomor rilis
  changelog: [
    { versi: '0.5.0', teks: 'Halaman Quiz dan Credit: daftar kuis per tingkat, progres belajar, glosarium, peta belajar, dan tim.' },
    { versi: '0.4.0', teks: 'Halaman Materi: Modul 04 Insertion Sort dengan kuis pemahaman dan kemajuan belajar.' },
    { versi: '0.3.0', teks: 'Visualizer algoritma graf, batang, tabel, garis waktu, dan Huffman.' },
  ],
}

/** Tab bagian di halaman Credit (urutan sama dengan urutan bagian di halaman). */
export const creditTabs = [
  { id: 'progres', tab: 'Progres Belajar' },
  { id: 'glosarium', tab: 'Glosarium' },
  { id: 'peta', tab: 'Peta Belajar' },
  { id: 'tim', tab: 'Tim Pengembang' },
  { id: 'sumber', tab: 'Sumber & Referensi' },
  { id: 'tentang', tab: 'Tentang LABU' },
]

// Daftar algoritma di Galeri (halaman utama). Sumber: desain Figma "Desktop · Algoritma · Galeri (konten penuh)".
// `modul` = nomor modul materi baru (00 sampai 24). `href` sementara menunjuk ke materi lama yang berisi visualizer-nya,
// sampai halaman visualizer mandiri (/algoritma/:id) dibuat di Tahap 3.

/** Kategori: `label` untuk filter, `title` untuk judul grup di galeri. Urutan = urutan tampil. */
export const kategori = [
  { id: 'pencarian', label: 'Pencarian', title: 'Pencarian' },
  { id: 'sorting', label: 'Sorting', title: 'Sorting' },
  { id: 'analisis', label: 'Analisis', title: 'Analisis' },
  { id: 'dp', label: 'DP', title: 'Dynamic Programming' },
  { id: 'greedy', label: 'Greedy', title: 'Greedy' },
  { id: 'graf', label: 'Graf', title: 'Penelusuran Graf' },
  { id: 'mst', label: 'MST', title: 'Minimum Spanning Tree' },
  { id: 'shortest-path', label: 'Shortest Path', title: 'Shortest Path' },
]

/** `thumb`: gambar kartu (bars, tree, graph, table). `pumpkin` = belum ada gambar, pakai maskot labu. */
export const algoritma = [
  { id: 'binary-search', kategori: 'pencarian', judul: 'Binary Search', deskripsi: 'Mencari nilai pada array terurut dengan membelah ruang pencarian menjadi dua.', kompleksitas: 'O(log n)', paradigma: 'Divide & conquer', modul: 2, thumb: 'bars', href: '/materi/algoritma-pemrograman', viz: true },
  { id: 'insertion-sort', kategori: 'sorting', judul: 'Insertion Sort', deskripsi: 'Menyisipkan setiap elemen ke posisi yang tepat di bagian kiri yang sudah terurut.', kompleksitas: 'O(n²)', paradigma: 'Inkremental', modul: 4, thumb: 'bars', href: '/materi/insertion-sort', viz: true },
  { id: 'merge-sort', kategori: 'sorting', judul: 'Merge Sort', deskripsi: 'Membelah array, mengurutkan tiap bagian secara rekursif, lalu menggabungkannya (array & pohon rekursi).', kompleksitas: 'Θ(n lg n)', paradigma: 'Divide and Conquer', modul: 8, thumb: 'tree', href: '/materi/merge-sort', viz: true },
  { id: 'pertumbuhan-fungsi', kategori: 'analisis', judul: 'Pertumbuhan Fungsi', deskripsi: 'Membandingkan laju pertumbuhan fungsi running time saat n membesar.', kompleksitas: 'lg n … 2ⁿ', paradigma: 'Analisis', modul: 5, thumb: 'pumpkin', href: '/materi/pertumbuhan-fungsi' },
  { id: 'batas-asimtotik', kategori: 'analisis', judul: 'Batas Θ / O / Ω', deskripsi: 'Menunjukkan batas ketat, batas atas, dan batas bawah pada plot.', kompleksitas: 'c₁g(n) ≤ f(n) ≤ c₂g(n)', paradigma: 'Notasi asimtotik', modul: 6, thumb: 'pumpkin', href: '/materi/notasi-asimtotik' },
  { id: 'little-o-omega', kategori: 'analisis', judul: 'Little-o / ω', deskripsi: 'Batas yang tidak ketat, dibandingkan lewat limit.', kompleksitas: 'lim f/g', paradigma: 'Notasi asimtotik', modul: 7, thumb: 'pumpkin', href: '/materi/little-o-omega' },
  { id: 'pohon-recurrence', kategori: 'analisis', judul: 'Pohon Recurrence', deskripsi: 'Menggambar pohon rekursi dan menjumlahkan biaya tiap level.', kompleksitas: 'T(n) = aT(n/b) + f(n)', paradigma: 'Recurrence', modul: 9, thumb: 'tree', href: '/materi/recurrence-master' },
  { id: 'matrix-chain', kategori: 'dp', judul: 'Matrix-Chain Multiplication', deskripsi: 'Mencari urutan perkalian matriks dengan operasi skalar paling sedikit.', kompleksitas: 'Θ(n³)', paradigma: 'Dynamic Programming', modul: 11, thumb: 'table', href: '/materi/dp-rantai-matriks', viz: true },
  { id: 'lcs', kategori: 'dp', judul: 'LCS', deskripsi: 'Mengisi tabel c[i, j] lalu menelusuri kembali subbarisan terpanjang.', kompleksitas: 'Θ(mn)', paradigma: 'Dynamic Programming', modul: 12, thumb: 'table', href: '/materi/dp-lcs', viz: true },
  { id: 'activity-selection', kategori: 'greedy', judul: 'Activity-Selection', deskripsi: 'Memilih aktivitas yang paling cepat selesai dan tidak bertabrakan.', kompleksitas: 'Θ(n)', paradigma: 'Greedy', modul: 14, thumb: 'bars', href: '/materi/greedy-activity-selection', viz: true },
  { id: 'kode-huffman', kategori: 'greedy', judul: 'Kode Huffman', deskripsi: 'Menggabungkan dua frekuensi terkecil berulang kali menjadi pohon kode.', kompleksitas: 'O(n lg n)', paradigma: 'Greedy', modul: 15, thumb: 'tree', href: '/materi/greedy-huffman', viz: true },
  { id: 'bfs', kategori: 'graf', judul: 'BFS', deskripsi: 'Menelusuri graf lapis demi lapis memakai antrean (FIFO).', kompleksitas: 'O(V + E)', paradigma: 'Penelusuran', modul: 17, thumb: 'graph', href: '/materi/graph-bfs', viz: true },
  { id: 'dfs', kategori: 'graf', judul: 'DFS', deskripsi: 'Menelusuri sedalam mungkin lalu backtrack, mencatat waktu d/f.', kompleksitas: 'O(V + E)', paradigma: 'Penelusuran', modul: 18, thumb: 'graph', href: '/materi/graph-dfs', viz: true },
  { id: 'kruskal', kategori: 'mst', judul: 'Kruskal', deskripsi: 'Memilih busur teringan yang tidak membentuk cycle sampai semua simpul terhubung.', kompleksitas: 'O(E lg V)', paradigma: 'Greedy', modul: 20, thumb: 'graph', href: '/materi/mst', viz: true },
  { id: 'prim', kategori: 'mst', judul: 'Prim', deskripsi: 'Menumbuhkan satu tree dengan selalu mengambil simpul terdekat.', kompleksitas: 'O(E lg V)', paradigma: 'Greedy', modul: 21, thumb: 'graph', href: '/materi/mst', viz: true },
  { id: 'bellman-ford', kategori: 'shortest-path', judul: 'Bellman-Ford', deskripsi: 'Merelaksasi semua busur V − 1 kali dan mendeteksi cycle negatif.', kompleksitas: 'O(VE)', paradigma: 'Relaksasi berulang', modul: 23, thumb: 'graph', href: '/materi/bellman-ford', viz: true },
  { id: 'dijkstra', kategori: 'shortest-path', judul: 'Dijkstra', deskripsi: 'Selalu menyelesaikan simpul dengan jarak terkecil lebih dulu (bobot nonnegatif).', kompleksitas: 'O((V + E) lg V)', paradigma: 'Greedy', modul: 24, thumb: 'graph', href: '/materi/dijkstra', viz: true },
]

/** Tujuan kartu: halaman visualizer baru bila sudah ada (`viz`), jika belum ke materi lama yang memuat visualizer-nya. */
export const algoritmaHref = (a) => (a.viz ? `/algoritma/${a.id}` : a.href)

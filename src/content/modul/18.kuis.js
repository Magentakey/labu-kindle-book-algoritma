// Kuis Pemahaman Modul 18 (8 soal pilihan ganda), bersumber dari soal PDF "18 - Depth-First Search (DFS)" halaman 9–10.
// Teks memakai Markdown dengan rumus TeX ($...$). `kunci` berupa satu id (satu jawaban) atau larik id (banyak jawaban, dinilai utuh).
export const kuis18 = {
  judul: 'Depth-First Search (DFS)',
  modul: '18',
  soal: [
    {
      no: 1,
      teks: 'Pada DFS, simpul yang berwarna GRAY adalah simpul yang ...',
      opsi: [
        { id: 'A', teks: 'Belum ditemukan.' },
        { id: 'B', teks: 'Sudah selesai ditelusuri.' },
        { id: 'C', teks: 'Sudah ditemukan, tetapi DFS-VISIT-nya belum selesai (masih berada di call stack).' },
        { id: 'D', teks: 'Tidak dapat dicapai.' },
      ],
      kunci: 'C',
      pembahasan: '**Jawaban: C.** GRAY berarti simpul sedang "dikunjungi": sudah ditemukan, dan pemanggilan DFS-VISIT-nya masih aktif karena tetangganya belum selesai ditelusuri.',
    },
    {
      no: 2,
      teks: 'Jalankan DFS pada graf berarah Modul 16 dengan adjacency-list $1: 2, 4$; $2: 5$; $3: 6, 5$; $4: 2$; $5: 4$; $6: 6$, dengan urutan simpul 1 sampai 6 pada perulangan DFS. Pilih **tiga** pernyataan yang benar tentang $d/f$.',
      opsi: [
        { id: 'A', teks: 'Simpul 1: 1/8.' },
        { id: 'B', teks: 'Simpul 4: 4/5.' },
        { id: 'C', teks: 'Simpul 3: 9/12.' },
        { id: 'D', teks: 'Simpul 5: 5/6.' },
        { id: 'E', teks: 'Simpul 6: 10/12.' },
      ],
      kunci: ['A', 'B', 'C'],
      pembahasan:
        '**Jawaban: A, B, dan C.** DFS-VISIT(1): $1.d = 1 \\to 2$ ($2.d = 2$) $\\to 5$ ($5.d = 3$) $\\to 4$ ($4.d = 4$); $Adj[4] = 2$ GRAY; $4.f = 5$, $5.f = 6$, $2.f = 7$; kembali ke 1: tetangga 4 BLACK; $1.f = 8$. DFS-VISIT(3): $3.d = 9 \\to 6$ ($6.d = 10$), self-loop; $6.f = 11$; tetangga 5 BLACK; $3.f = 12$. Hasil: **1: 1/8, 2: 2/7, 3: 9/12, 4: 4/5, 5: 3/6, 6: 10/11**.',
    },
    {
      no: 3,
      teks: 'Pada soal nomor 2, klasifikasikan busur $(4, 2)$, $(1, 4)$, dan $(3, 5)$. Pilih **tiga** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: '$(4, 2)$ adalah back edge.' },
        { id: 'B', teks: '$(1, 4)$ adalah cross edge.' },
        { id: 'C', teks: '$(1, 4)$ adalah forward edge.' },
        { id: 'D', teks: '$(3, 5)$ adalah cross edge.' },
        { id: 'E', teks: '$(3, 5)$ adalah tree edge.' },
      ],
      kunci: ['A', 'C', 'D'],
      pembahasan:
        '**Jawaban: A, C, dan D.** $(4, 2)$: saat diperiksa, 2 masih GRAY, sehingga **back edge** (cycle $2 \\to 5 \\to 4 \\to 2$). $(1, 4)$: 4 sudah BLACK dan $1.d = 1 < 4.d = 4$, sehingga **forward edge**. $(3, 5)$: 5 BLACK dan $3.d = 9 > 5.d = 3$, sehingga **cross edge**.',
    },
    {
      no: 4,
      teks: 'Pernyataan "Pada DFS, mungkin saja terjadi $u.d = 2$, $u.f = 7$, $v.d = 5$, $v.f = 9$" adalah ...',
      opsi: [
        { id: 'A', teks: 'Benar, karena $u$ dan $v$ berada di tree yang berbeda.' },
        { id: 'B', teks: 'Salah: selang $[2, 7]$ dan $[5, 9]$ tumpang tindih sebagian, padahal menurut teorema tanda kurung selang dua simpul selalu bersarang atau saling lepas.' },
        { id: 'C', teks: 'Benar, selama $u.f < v.f$.' },
        { id: 'D', teks: 'Salah, karena $d$ harus selalu lebih kecil dari 5.' },
      ],
      kunci: 'B',
      pembahasan: '**Jawaban: B.** Selang $[2, 7]$ dan $[5, 9]$ tumpang tindih sebagian. Menurut teorema tanda kurung, selang dua simpul selalu bersarang atau saling lepas.',
    },
    {
      no: 5,
      teks: 'Sebuah graf berarah memiliki 7 simpul. Berapa nilai timestamp terbesar yang muncul setelah DFS selesai?',
      opsi: [
        { id: 'A', teks: '7' },
        { id: 'B', teks: '8' },
        { id: 'C', teks: '12' },
        { id: 'D', teks: '14' },
      ],
      kunci: 'D',
      pembahasan: '**Jawaban: D.** Timestamp terbesar adalah $2 \\times 7 = 14$, karena `time` bertambah tepat dua kali untuk setiap simpul: sekali saat ditemukan dan sekali saat selesai.',
    },
    {
      no: 6,
      teks: 'Pada contoh modul ini, urutan perulangan pada DFS(G) diubah menjadi $w, u, v, x, y, z$. Pilih **dua** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: 'Busur $(w, y)$ menjadi back edge.' },
        { id: 'B', teks: 'Busur $(w, y)$ menjadi tree edge.' },
        { id: 'C', teks: 'DFS-forest berisi 2 tree (akar $w$ dan $u$).' },
        { id: 'D', teks: 'DFS-forest berisi 1 tree.' },
        { id: 'E', teks: 'DFS-forest berisi 3 tree.' },
      ],
      kunci: ['B', 'C'],
      pembahasan:
        '**Jawaban: B dan C.** Dimulai dari $w$: $w.d = 1$, lalu $y$ ($w \\to y$ jadi **tree edge**), $y \\to x$, $x \\to v$ (tree), $v$ ke $y$ GRAY (back), lalu $z$ dari $w$. Kemudian $u$ menjadi akar tree baru, dan $(u, v)$, $(u, x)$ menjadi cross edge. Jadi DFS-forest tetap berisi **2 tree** (akar $w$ dan $u$), tetapi bentuknya berbeda.',
    },
    {
      no: 7,
      teks: 'Graf berarah tidak memiliki cycle jika dan hanya jika DFS ...',
      opsi: [
        { id: 'A', teks: 'Tidak menghasilkan forward edge.' },
        { id: 'B', teks: 'Hanya menghasilkan satu tree.' },
        { id: 'C', teks: 'Tidak menghasilkan cross edge.' },
        { id: 'D', teks: 'Tidak menghasilkan back edge.' },
      ],
      kunci: 'D',
      pembahasan: '**Jawaban: D.** Back edge menuju leluhur yang masih GRAY selalu menutup sebuah cycle, dan sebaliknya setiap cycle pasti menghasilkan back edge.',
    },
    {
      no: 8,
      teks: 'Tentang arti atribut $u.d$ pada BFS dan DFS, pilih **dua** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: 'Pada BFS, $u.d$ adalah jarak (jumlah busur) dari $s$.' },
        { id: 'B', teks: 'Pada DFS, $u.d$ adalah waktu selesai.' },
        { id: 'C', teks: 'Pada DFS, $u.d$ adalah waktu ditemukan.' },
        { id: 'D', teks: 'Pada BFS, $u.d$ adalah waktu ditemukan.' },
        { id: 'E', teks: 'Pada BFS, nilai $u.d$ selalu unik untuk setiap simpul.' },
      ],
      kunci: ['A', 'C'],
      pembahasan:
        '**Jawaban: A dan C.** (1) Pada BFS, $u.d$ adalah **jarak** (jumlah busur) dari $s$; pada DFS, $u.d$ adalah **waktu ditemukan**. (2) Pada BFS nilainya dapat sama untuk banyak simpul (satu lapis), sedangkan pada DFS setiap timestamp unik dan ada pasangannya $u.f$.',
    },
  ],
}

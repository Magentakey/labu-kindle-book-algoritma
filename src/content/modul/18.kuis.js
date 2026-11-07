// Kuis Pemahaman Modul 18 (8 soal) dan kunci serta pembahasannya, dari PDF "18 - Depth-First Search (DFS)" halaman 9–10.
// Teks memakai Markdown dengan rumus TeX ($...$). Semua soal dinilai otomatis (pilihan, isian angka, atau pilihan jawaban); soal analisis (3, 6, dan 8)
// dinilai dari beberapa isian, bukan uraian. Soal 4 (benar/salah dengan alasan) dinilai pada pilihan Benar/Salah; alasannya ada di pembahasan.
const JENIS = ['Tree', 'Back', 'Forward', 'Cross']
const DF = ['1/8', '2/7', '3/6', '4/5', '9/12', '10/11']

export const kuis18 = {
  judul: 'Depth-First Search (DFS)',
  modul: '18',
  soal: [
    {
      no: 1,
      tipe: 'pilihan',
      teks: 'Pada DFS, simpul yang berwarna GRAY adalah simpul yang ...',
      opsi: [
        { id: 'A', teks: 'Belum ditemukan.' },
        { id: 'B', teks: 'Sudah ditemukan, tetapi DFS-VISIT-nya belum selesai (masih berada di call stack).' },
        { id: 'C', teks: 'Sudah selesai ditelusuri.' },
        { id: 'D', teks: 'Tidak dapat dicapai.' },
      ],
      kunci: 'B',
      pembahasan: '**Jawaban: B.** GRAY berarti simpul sedang "dikunjungi": sudah ditemukan, dan pemanggilan DFS-VISIT-nya masih aktif karena tetangganya belum selesai ditelusuri.',
    },
    {
      no: 2,
      tipe: 'penelusuran',
      teks: 'Jalankan DFS pada graf berarah Modul 16 dengan adjacency-list $1: 2, 4$; $2: 5$; $3: 6, 5$; $4: 2$; $5: 4$; $6: 6$, dengan urutan simpul 1 sampai 6 pada perulangan DFS. Pilih $d/f$ setiap simpul.',
      isian: [
        { label: 'd/f simpul 1', jenis: 'pilih', opsi: DF, kunci: '1/8' },
        { label: 'd/f simpul 2', jenis: 'pilih', opsi: DF, kunci: '2/7' },
        { label: 'd/f simpul 3', jenis: 'pilih', opsi: DF, kunci: '9/12' },
        { label: 'd/f simpul 4', jenis: 'pilih', opsi: DF, kunci: '4/5' },
        { label: 'd/f simpul 5', jenis: 'pilih', opsi: DF, kunci: '3/6' },
        { label: 'd/f simpul 6', jenis: 'pilih', opsi: DF, kunci: '10/11' },
      ],
      pembahasan:
        'DFS-VISIT(1): $1.d = 1 \\to 2$ ($2.d = 2$) $\\to 5$ ($5.d = 3$) $\\to 4$ ($4.d = 4$); $Adj[4] = 2$ GRAY; $4.f = 5$, $5.f = 6$, $2.f = 7$; kembali ke 1: tetangga 4 BLACK; $1.f = 8$. DFS-VISIT(3): $3.d = 9 \\to 6$ ($6.d = 10$), self-loop; $6.f = 11$; tetangga 5 BLACK; $3.f = 12$. Hasil: **1: 1/8, 2: 2/7, 3: 9/12, 4: 4/5, 5: 3/6, 6: 10/11**.',
    },
    {
      no: 3,
      tipe: 'analisis',
      teks: 'Pada soal nomor 2, klasifikasikan busur $(4, 2)$, $(1, 4)$, dan $(3, 5)$.',
      isian: [
        { label: 'Jenis busur (4, 2)', jenis: 'pilih', opsi: JENIS, kunci: 'Back' },
        { label: 'Jenis busur (1, 4)', jenis: 'pilih', opsi: JENIS, kunci: 'Forward' },
        { label: 'Jenis busur (3, 5)', jenis: 'pilih', opsi: JENIS, kunci: 'Cross' },
      ],
      pembahasan:
        '$(4, 2)$: saat diperiksa, 2 masih GRAY, sehingga **back edge** (cycle $2 \\to 5 \\to 4 \\to 2$). $(1, 4)$: 4 sudah BLACK dan $1.d = 1 < 4.d = 4$, sehingga **forward edge**. $(3, 5)$: 5 BLACK dan $3.d = 9 > 5.d = 3$, sehingga **cross edge**.',
    },
    {
      no: 4,
      tipe: 'benarsalah',
      teks: '"Pada DFS, mungkin saja terjadi $u.d = 2$, $u.f = 7$, $v.d = 5$, $v.f = 9$." Benar atau salah? Pikirkan alasannya.',
      opsi: [
        { id: 'Benar', teks: 'Benar' },
        { id: 'Salah', teks: 'Salah' },
      ],
      kunci: 'Salah',
      pembahasan: '**Salah.** Selang $[2, 7]$ dan $[5, 9]$ tumpang tindih sebagian. Menurut teorema tanda kurung, selang dua simpul selalu bersarang atau saling lepas.',
    },
    {
      no: 5,
      tipe: 'perhitungan',
      teks: 'Sebuah graf berarah memiliki 7 simpul. Berapa nilai timestamp terbesar yang muncul setelah DFS selesai? Mengapa?',
      isian: [
        { label: 'Timestamp terbesar', jenis: 'angka', kunci: 14 },
        {
          label: 'Alasannya',
          jenis: 'pilih',
          opsi: ['time bertambah dua kali untuk setiap simpul (saat ditemukan dan saat selesai)', 'time bertambah satu kali untuk setiap busur', 'time sama dengan banyaknya tree di DFS-forest'],
          kunci: 'time bertambah dua kali untuk setiap simpul (saat ditemukan dan saat selesai)',
        },
      ],
      pembahasan: 'Timestamp terbesar adalah $2 \\times 7 = 14$, karena `time` bertambah tepat dua kali untuk setiap simpul: sekali saat ditemukan dan sekali saat selesai.',
    },
    {
      no: 6,
      tipe: 'analisis',
      teks: 'Pada contoh modul ini, jika urutan perulangan pada DFS(G) diubah menjadi $w, u, v, x, y, z$, busur $(w, y)$ akan menjadi jenis apa? Berapa banyak tree di DFS-forest?',
      isian: [
        { label: 'Jenis busur (w, y)', jenis: 'pilih', opsi: JENIS, kunci: 'Tree' },
        { label: 'Jenis busur (u, v)', jenis: 'pilih', opsi: JENIS, kunci: 'Cross' },
        { label: 'Banyak tree di DFS-forest', jenis: 'angka', kunci: 2 },
      ],
      pembahasan:
        'Dimulai dari $w$: $w.d = 1$, lalu $y$ ($w \\to y$ jadi **tree edge**), $y \\to x$, $x \\to v$ (tree), $v$ ke $y$ GRAY (back), lalu $z$ dari $w$. Kemudian $u$ menjadi akar tree baru, dan $(u, v)$, $(u, x)$ menjadi cross edge. Jadi $(w, y)$ menjadi **tree edge**, dan DFS-forest tetap berisi **2 tree** (akar $w$ dan $u$), tetapi bentuknya berbeda.',
    },
    {
      no: 7,
      tipe: 'pilihan',
      teks: 'Graf berarah tidak memiliki cycle jika dan hanya jika DFS ...',
      opsi: [
        { id: 'A', teks: 'Tidak menghasilkan forward edge.' },
        { id: 'B', teks: 'Tidak menghasilkan back edge.' },
        { id: 'C', teks: 'Hanya menghasilkan satu tree.' },
        { id: 'D', teks: 'Tidak menghasilkan cross edge.' },
      ],
      kunci: 'B',
      pembahasan: '**Jawaban: B.** Back edge menuju leluhur yang masih GRAY selalu menutup sebuah cycle, dan sebaliknya setiap cycle pasti menghasilkan back edge.',
    },
    {
      no: 8,
      tipe: 'analisis',
      teks: 'Sebutkan dua perbedaan arti atribut $u.d$ pada BFS dan DFS. Jawab dengan melengkapi pernyataan berikut.',
      isian: [
        { label: 'Arti u.d pada BFS', jenis: 'pilih', opsi: ['Jarak (jumlah busur) dari s', 'Waktu ditemukan', 'Waktu selesai'], kunci: 'Jarak (jumlah busur) dari s' },
        { label: 'Arti u.d pada DFS', jenis: 'pilih', opsi: ['Jarak (jumlah busur) dari s', 'Waktu ditemukan', 'Waktu selesai'], kunci: 'Waktu ditemukan' },
        { label: 'Nilai u.d pada BFS dapat sama untuk banyak simpul', jenis: 'pilih', opsi: ['Ya', 'Tidak'], kunci: 'Ya' },
        { label: 'Setiap timestamp pada DFS bernilai unik dan berpasangan dengan u.f', jenis: 'pilih', opsi: ['Ya', 'Tidak'], kunci: 'Ya' },
      ],
      pembahasan:
        '(1) Pada BFS, $u.d$ adalah **jarak** (jumlah busur) dari $s$; pada DFS, $u.d$ adalah **waktu ditemukan**. (2) Pada BFS nilainya dapat sama untuk banyak simpul (satu lapis), sedangkan pada DFS setiap timestamp unik dan ada pasangannya $u.f$.',
    },
  ],
}

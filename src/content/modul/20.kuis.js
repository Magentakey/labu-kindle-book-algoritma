// Kuis Pemahaman Modul 20 (7 soal pilihan ganda), bersumber dari soal PDF "20 - Algoritma Kruskal" halaman 8–9.
// Teks memakai Markdown dengan rumus TeX ($...$). `kunci` berupa satu id (satu jawaban) atau larik id (banyak jawaban, dinilai utuh).

export const kuis20 = {
  judul: 'Algoritma Kruskal',
  modul: '20',
  soal: [
    {
      no: 1,
      teks: 'Pada Kruskal, busur $(u, v)$ ditolak jika ...',
      opsi: [
        { id: 'A', teks: 'Bobotnya lebih besar dari busur sebelumnya.' },
        { id: 'B', teks: 'FIND-SET(u) = FIND-SET(v), yaitu $u$ dan $v$ sudah berada di tree yang sama.' },
        { id: 'C', teks: 'Salah satu simpulnya sudah pernah dipakai.' },
        { id: 'D', teks: '$A$ sudah berisi lebih dari $\\lvert V \\rvert / 2$ busur.' },
      ],
      kunci: 'B',
      pembahasan: '**Jawaban: B.** Busur ditolak hanya jika kedua ujungnya sudah satu tree, karena menambahkannya membentuk cycle. Bobot selalu tidak menurun karena busur diproses terurut (A bukan alasan), dan sebuah simpul boleh dipakai berkali-kali (C salah).',
    },
    {
      no: 2,
      teks: 'Jalankan Kruskal pada graf dengan busur $(p, q) = 3$, $(p, r) = 1$, $(q, r) = 2$, $(q, s) = 5$, $(r, s) = 4$, $(s, t) = 6$, $(r, t) = 7$. Pilih **tiga** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: 'Busur $(p, r) = 1$ diterima.' },
        { id: 'B', teks: 'Busur $(p, q) = 3$ ditolak.' },
        { id: 'C', teks: 'Total bobot MST adalah 13.' },
        { id: 'D', teks: 'Busur $(q, s) = 5$ diterima.' },
        { id: 'E', teks: 'Total bobot MST adalah 15.' },
      ],
      kunci: ['A', 'B', 'C'],
      pembahasan:
        '**Jawaban: A, B, dan C.** Urutan: $(p, r) = 1$ diterima; $(q, r) = 2$ diterima; $(p, q) = 3$ **ditolak** (p, q sudah terhubung lewat r); $(r, s) = 4$ diterima; $(q, s) = 5$ **ditolak**; $(s, t) = 6$ diterima; $(r, t) = 7$ **ditolak**. MST: $\\{(p, r), (q, r), (r, s), (s, t)\\}$, total bobot $1 + 2 + 4 + 6 = $ **13**.',
    },
    {
      no: 3,
      teks: 'Pada penelusuran di modul ini, saat busur $(h, i)$ diproses, $h$ dan $i$ sudah terhubung. Cycle apa yang akan terbentuk jika busur $(h, i)$ diterima?',
      opsi: [
        { id: 'A', teks: '$h \\to g \\to i \\to h$' },
        { id: 'B', teks: '$h \\to a \\to b \\to c \\to i \\to h$' },
        { id: 'C', teks: '$h \\to i \\to h$' },
        { id: 'D', teks: '$h \\to g \\to f \\to c \\to i \\to h$' },
      ],
      kunci: 'D',
      pembahasan: '**Jawaban: D.** Saat $(h, i)$ diproses, $h$ dan $i$ sudah terhubung lewat $h - g - f - c - i$. Menambahkan $(h, i)$ membentuk cycle $h \\to g \\to f \\to c \\to i \\to h$.',
    },
    {
      no: 4,
      teks: 'Pernyataan "Kruskal dapat berhenti lebih awal begitu $A$ berisi $\\lvert V \\rvert - 1$ busur" adalah ...',
      opsi: [
        { id: 'A', teks: 'Benar: tree dengan $\\lvert V \\rvert$ simpul memiliki tepat $\\lvert V \\rvert - 1$ busur, sehingga busur berikutnya pasti ditolak.' },
        { id: 'B', teks: 'Salah, karena semua busur harus diperiksa agar MST benar.' },
        { id: 'C', teks: 'Benar, tetapi hanya bila semua bobot busur berbeda.' },
        { id: 'D', teks: 'Salah, karena penghentian dini mengubah orde running time menjadi $O(V)$.' },
      ],
      kunci: 'A',
      pembahasan:
        '**Jawaban: A.** Tree dengan $\\lvert V \\rvert$ simpul memiliki tepat $\\lvert V \\rvert - 1$ busur, jadi setelah busur ke-$(\\lvert V \\rvert - 1)$ diterima, semua busur berikutnya pasti ditolak. Pada contoh, setelah $(d, e)$ diterima, sisa busur $(e, f)$, $(b, h)$, $(d, f)$ tidak perlu diperiksa. Penghentian dini ini tidak mengubah orde running time karena pengurutan tetap dominan.',
    },
    {
      no: 5,
      teks: 'Sebuah graf memiliki $\\lvert V \\rvert = 1.000$ dan $\\lvert E \\rvert = 50.000$. Pilih **dua** pernyataan yang benar tentang Kruskal.',
      opsi: [
        { id: 'A', teks: 'Tahap pengurutan sekitar $E \\lg E \\approx 780.000$ langkah.' },
        { id: 'B', teks: 'Tahap pemrosesan busur sekitar 780.000 langkah.' },
        { id: 'C', teks: 'Bagian yang dominan adalah pengurutan.' },
        { id: 'D', teks: 'Bagian yang dominan adalah pemrosesan busur.' },
        { id: 'E', teks: 'Tahap pengurutan hanya sekitar 50.000 langkah.' },
      ],
      kunci: ['A', 'C'],
      pembahasan:
        '**Jawaban: A dan C.** Pengurutan: sekitar $E \\lg E = 50.000 \\times \\lg 50.000 \\approx 50.000 \\times 15{,}6 \\approx 780.000$ langkah. Pemrosesan busur: sekitar $E \\cdot \\alpha(V) \\le 50.000 \\times 4 = 200.000$ langkah. Bagian yang **dominan adalah pengurutan**.',
    },
    {
      no: 6,
      teks: 'Setelah Kruskal selesai pada graf contoh, bobot busur $(e, f)$ diturunkan dari 10 menjadi 5. Pilih **tiga** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: 'Sebelumnya $(e, f)$ berstatus diterima.' },
        { id: 'B', teks: 'Sekarang $(e, f)$ diterima.' },
        { id: 'C', teks: 'Sekarang $(d, e)$ ditolak.' },
        { id: 'D', teks: 'Bobot MST yang baru adalah 33.' },
        { id: 'E', teks: 'Bobot MST tetap 37.' },
      ],
      kunci: ['B', 'C', 'D'],
      pembahasan:
        '**Jawaban: B, C, dan D.** Dengan bobot 5, $(e, f)$ diproses setelah $(c, f) = 4$ dan sebelum $(g, i) = 6$. Saat itu $e$ masih sendirian, sehingga $(e, f)$ **diterima** (sebelumnya ditolak). Selanjutnya $(d, e) = 9$ akan **ditolak**, karena $d$ sudah terhubung dengan $e$ lewat $d - c - f - e$. MST baru berbobot $37 - 9 + 5 = $ **33**.',
    },
    {
      no: 7,
      teks: 'Selama Kruskal berjalan, himpunan $A$ selalu berbentuk ...',
      opsi: [
        { id: 'A', teks: 'Satu tree yang terhubung.' },
        { id: 'B', teks: 'Graf yang mungkin memiliki cycle.' },
        { id: 'C', teks: 'Forest (kumpulan tree) yang tidak memiliki cycle.' },
        { id: 'D', teks: 'Lintasan dari $a$ ke $e$.' },
      ],
      kunci: 'C',
      pembahasan: '**Jawaban: C.** $A$ dimulai sebagai $\\lvert V \\rvert$ tree berukuran satu dan tidak pernah memuat cycle; tree-tree itu menyatu sedikit demi sedikit hingga menjadi satu tree di akhir.',
    },
  ],
}

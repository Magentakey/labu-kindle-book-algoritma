// Kuis Pemahaman Modul 20 (7 soal) dan kunci serta pembahasannya, dari PDF "20 - Algoritma Kruskal" halaman 8–9.
// Teks memakai Markdown dengan rumus TeX ($...$). Semua soal dinilai otomatis (pilihan atau isian); soal penelusuran dan analisis (2, 3, 5, 6)
// dinilai dari beberapa isian, bukan uraian. Soal 4 (benar/salah dengan alasan) dinilai pada pilihan Benar/Salah; alasannya ada di pembahasan.
const STATUS = ['Diterima', 'Ditolak']
const ANGKA = ['sekitar 50.000', 'sekitar 200.000', 'sekitar 780.000']

export const kuis20 = {
  judul: 'Algoritma Kruskal',
  modul: '20',
  soal: [
    {
      no: 1,
      tipe: 'pilihan',
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
      tipe: 'penelusuran',
      teks: 'Jalankan Kruskal pada graf dengan busur $(p, q) = 3$, $(p, r) = 1$, $(q, r) = 2$, $(q, s) = 5$, $(r, s) = 4$, $(s, t) = 6$, $(r, t) = 7$. Pilih status setiap busur (dalam urutan Kruskal) dan isi total bobot MST.',
      isian: [
        { label: 'Busur (p, r) = 1', jenis: 'pilih', opsi: STATUS, kunci: 'Diterima' },
        { label: 'Busur (q, r) = 2', jenis: 'pilih', opsi: STATUS, kunci: 'Diterima' },
        { label: 'Busur (p, q) = 3', jenis: 'pilih', opsi: STATUS, kunci: 'Ditolak' },
        { label: 'Busur (r, s) = 4', jenis: 'pilih', opsi: STATUS, kunci: 'Diterima' },
        { label: 'Busur (q, s) = 5', jenis: 'pilih', opsi: STATUS, kunci: 'Ditolak' },
        { label: 'Busur (s, t) = 6', jenis: 'pilih', opsi: STATUS, kunci: 'Diterima' },
        { label: 'Busur (r, t) = 7', jenis: 'pilih', opsi: STATUS, kunci: 'Ditolak' },
        { label: 'Total bobot MST', jenis: 'angka', kunci: 13 },
      ],
      pembahasan:
        'Urutan: $(p, r) = 1$ diterima; $(q, r) = 2$ diterima; $(p, q) = 3$ **ditolak** (p, q sudah terhubung lewat r); $(r, s) = 4$ diterima; $(q, s) = 5$ **ditolak**; $(s, t) = 6$ diterima; $(r, t) = 7$ **ditolak**. MST: $\\{(p, r), (q, r), (r, s), (s, t)\\}$, total bobot $1 + 2 + 4 + 6 = $ **13**.',
    },
    {
      no: 3,
      tipe: 'analisis',
      teks: 'Pada penelusuran di modul ini, jelaskan cycle apa yang akan terbentuk jika busur $(h, i)$ diterima. Jawab dengan memilih pernyataan yang tepat.',
      isian: [
        { label: 'Saat (h, i) diproses, h dan i sudah terhubung', jenis: 'pilih', opsi: ['Ya', 'Tidak'], kunci: 'Ya' },
        { label: 'Lintasan di A yang sudah menghubungkan h dan i', jenis: 'pilih', opsi: ['h − g − f − c − i', 'h − a − b − c − i', 'h − g − i'], kunci: 'h − g − f − c − i' },
        { label: 'Cycle yang terbentuk jika (h, i) diterima', jenis: 'pilih', opsi: ['h → g → f → c → i → h', 'h → g → i → h', 'h → a → b → c → i → h'], kunci: 'h → g → f → c → i → h' },
      ],
      pembahasan: 'Saat $(h, i)$ diproses, $h$ dan $i$ sudah terhubung lewat $h - g - f - c - i$. Menambahkan $(h, i)$ membentuk cycle $h \\to g \\to f \\to c \\to i \\to h$.',
    },
    {
      no: 4,
      tipe: 'benarsalah',
      teks: '"Kruskal dapat berhenti lebih awal begitu $A$ berisi $\\lvert V \\rvert - 1$ busur." Benar atau salah? Pikirkan alasannya.',
      opsi: [
        { id: 'Benar', teks: 'Benar' },
        { id: 'Salah', teks: 'Salah' },
      ],
      kunci: 'Benar',
      pembahasan:
        '**Benar.** Tree dengan $\\lvert V \\rvert$ simpul memiliki tepat $\\lvert V \\rvert - 1$ busur, jadi setelah busur ke-$(\\lvert V \\rvert - 1)$ diterima, semua busur berikutnya pasti ditolak. Pada contoh, setelah $(d, e)$ diterima, sisa busur $(e, f)$, $(b, h)$, $(d, f)$ tidak perlu diperiksa. Penghentian dini ini tidak mengubah orde running time karena pengurutan tetap dominan.',
    },
    {
      no: 5,
      tipe: 'perhitungan',
      teks: 'Sebuah graf memiliki $\\lvert V \\rvert = 1.000$ dan $\\lvert E \\rvert = 50.000$. Perkirakan banyaknya operasi untuk tahap pengurutan dan untuk tahap pemrosesan busur. Bagian mana yang dominan?',
      isian: [
        { label: 'Pengurutan: E lg E', jenis: 'pilih', opsi: ANGKA, kunci: 'sekitar 780.000' },
        { label: 'Pemrosesan busur: paling banyak E · α(V) dengan α ≤ 4', jenis: 'pilih', opsi: ANGKA, kunci: 'sekitar 200.000' },
        { label: 'Bagian yang dominan', jenis: 'pilih', opsi: ['Pengurutan', 'Pemrosesan busur'], kunci: 'Pengurutan' },
      ],
      pembahasan:
        'Pengurutan: sekitar $E \\lg E = 50.000 \\times \\lg 50.000 \\approx 50.000 \\times 15{,}6 \\approx 780.000$ langkah. Pemrosesan busur: sekitar $E \\cdot \\alpha(V) \\le 50.000 \\times 4 = 200.000$ langkah. Bagian yang **dominan adalah pengurutan**.',
    },
    {
      no: 6,
      tipe: 'analisis',
      teks: 'Setelah Kruskal selesai pada graf contoh, bobot busur $(e, f)$ diturunkan dari 10 menjadi 5. Busur mana yang akan berubah status? Berapa bobot MST yang baru?',
      isian: [
        { label: 'Status (e, f) sebelumnya', jenis: 'pilih', opsi: STATUS, kunci: 'Ditolak' },
        { label: 'Status (e, f) sekarang', jenis: 'pilih', opsi: STATUS, kunci: 'Diterima' },
        { label: 'Status (d, e) sekarang', jenis: 'pilih', opsi: STATUS, kunci: 'Ditolak' },
        { label: 'Bobot MST yang baru', jenis: 'angka', kunci: 33 },
      ],
      pembahasan:
        'Dengan bobot 5, $(e, f)$ diproses setelah $(c, f) = 4$ dan sebelum $(g, i) = 6$. Saat itu $e$ masih sendirian, sehingga $(e, f)$ **diterima**. Selanjutnya $(d, e) = 9$ akan **ditolak**, karena $d$ sudah terhubung dengan $e$ lewat $d - c - f - e$. MST baru berbobot $37 - 9 + 5 = $ **33**.',
    },
    {
      no: 7,
      tipe: 'pilihan',
      teks: 'Selama Kruskal berjalan, himpunan $A$ selalu berbentuk ...',
      opsi: [
        { id: 'A', teks: 'Satu tree yang terhubung.' },
        { id: 'B', teks: 'Forest (kumpulan tree) yang tidak memiliki cycle.' },
        { id: 'C', teks: 'Graf yang mungkin memiliki cycle.' },
        { id: 'D', teks: 'Lintasan dari $a$ ke $e$.' },
      ],
      kunci: 'B',
      pembahasan: '**Jawaban: B.** $A$ dimulai sebagai $\\lvert V \\rvert$ tree berukuran satu dan tidak pernah memuat cycle; tree-tree itu menyatu sedikit demi sedikit hingga menjadi satu tree di akhir.',
    },
  ],
}

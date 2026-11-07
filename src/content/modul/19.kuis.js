// Kuis Pemahaman Modul 19 (7 soal) dan kunci serta pembahasannya, dari PDF "19 - Konsep Minimum Spanning Tree" halaman 7–8.
// Teks memakai Markdown dengan rumus TeX ($...$). Semua soal dinilai otomatis (pilihan, isian angka, atau pilihan jawaban); soal analisis (2, 3, 5, 7)
// dinilai dari beberapa isian, bukan uraian. Soal 4 (benar/salah dengan alasan) dinilai pada pilihan Benar/Salah; alasannya ada di pembahasan.

export const kuis19 = {
  judul: 'Konsep Minimum Spanning Tree (MST)',
  modul: '19',
  soal: [
    {
      no: 1,
      tipe: 'pilihan',
      teks: 'Sebuah graf terhubung memiliki 12 simpul dan 30 busur. Berapa banyak busur pada MST-nya?',
      opsi: [
        { id: 'A', teks: '11' },
        { id: 'B', teks: '12' },
        { id: 'C', teks: '29' },
        { id: 'D', teks: '30' },
      ],
      kunci: 'A',
      pembahasan: '**Jawaban: A.** MST adalah tree yang menjangkau semua 12 simpul, sehingga memiliki $12 - 1 = 11$ busur, berapa pun banyaknya busur graf semula.',
    },
    {
      no: 2,
      tipe: 'analisis',
      teks: 'Jelaskan mengapa solusi masalah "jaringan kabel termurah yang menghubungkan semua kota" tidak mungkin memuat cycle (asumsikan semua biaya positif). Jawab dengan melengkapi pernyataan berikut.',
      isian: [
        { label: 'Bila jaringan memuat cycle, melepas satu kabel di cycle itu membuat semua kota tetap terhubung', jenis: 'pilih', opsi: ['Ya', 'Tidak'], kunci: 'Ya' },
        { label: 'Biaya total setelah kabel itu dilepas (biaya positif)', jenis: 'pilih', opsi: ['Berkurang', 'Tetap', 'Bertambah'], kunci: 'Berkurang' },
        { label: 'Bentuk jaringan termurah', jenis: 'pilih', opsi: ['Tree', 'Graf dengan cycle', 'Hutan yang terputus'], kunci: 'Tree' },
      ],
      pembahasan:
        'Jika jaringan memuat cycle, salah satu kabel di cycle itu dapat dilepas dan semua kota tetap terhubung, karena dua ujung kabel tersebut masih terhubung lewat sisa cycle. Biaya totalnya berkurang (biaya positif), sehingga jaringan semula bukan yang termurah. Jadi jaringan termurah tidak memiliki cycle, yaitu berbentuk tree.',
    },
    {
      no: 3,
      tipe: 'analisis',
      teks: 'Pada graf contoh, perhatikan cut $S = \\{a\\}$ dan $V - S$ = simpul lainnya, dengan $A = \\emptyset$. Apa saja crossing edge-nya, dan busur mana yang dijamin safe?',
      isian: [
        { label: 'Banyak crossing edge', jenis: 'angka', kunci: 2 },
        { label: 'Bobot light edge', jenis: 'angka', kunci: 4 },
        { label: 'Busur yang dijamin safe', jenis: 'pilih', opsi: ['(a, b)', '(a, h)', '(a, b) dan (a, h)'], kunci: '(a, b)' },
      ],
      pembahasan:
        'Crossing edge: $(a, b)$ berbobot 4 dan $(a, h)$ berbobot 8. Cut ini *respects* $A = \\emptyset$, dan light edge-nya adalah $(a, b)$, sehingga $(a, b)$ dijamin safe, artinya ada MST yang memuatnya. (Inilah langkah pertama Prim dengan akar $a$.)',
    },
    {
      no: 4,
      tipe: 'benarsalah',
      teks: '"Jika bobot busur sebuah graf terhubung semuanya berbeda, MST-nya tunggal." Benar atau salah? Pikirkan alasannya.',
      opsi: [
        { id: 'Benar', teks: 'Benar' },
        { id: 'Salah', teks: 'Salah' },
      ],
      kunci: 'Benar',
      pembahasan:
        '**Benar.** Ini sifat yang dikenal luas (lihat latihan pada Cormen dkk., 2009, Bab 23.1). Ketidaktunggalan MST hanya dapat terjadi bila ada busur berbobot sama yang dapat saling menggantikan, seperti $(a, h)$ dan $(b, c)$ pada contoh.',
    },
    {
      no: 5,
      tipe: 'analisis',
      teks: 'Pada graf contoh, bobot busur $(b, c)$ diubah dari 8 menjadi 9. Bagaimana pengaruhnya terhadap MST dan bobot totalnya?',
      isian: [
        { label: 'Bobot T1 (yang memakai (b, c)) sekarang', jenis: 'angka', kunci: 38 },
        { label: 'Bobot T2 (yang memakai (a, h))', jenis: 'angka', kunci: 37 },
        { label: 'Banyak MST sekarang', jenis: 'angka', kunci: 1 },
        { label: 'MST yang tersisa', jenis: 'pilih', opsi: ['T1', 'T2'], kunci: 'T2' },
      ],
      pembahasan: 'MST $T_1$ (yang memakai $(b, c)$) bobotnya menjadi 38, sedangkan $T_2$ (yang memakai $(a, h)$) tetap 37. Jadi MST-nya menjadi **tunggal**, yaitu $T_2$, dengan bobot tetap **37**.',
    },
    {
      no: 6,
      tipe: 'pilihan',
      teks: 'Perbedaan utama Kruskal dan Prim selama algoritma berjalan adalah ...',
      opsi: [
        { id: 'A', teks: 'Kruskal hanya untuk graf berarah.' },
        { id: 'B', teks: 'Kruskal memelihara forest yang lama-kelamaan menyatu; Prim memelihara satu tree yang terus tumbuh.' },
        { id: 'C', teks: 'Prim tidak bersifat greedy.' },
        { id: 'D', teks: 'Kruskal selalu menghasilkan bobot yang lebih kecil.' },
      ],
      kunci: 'B',
      pembahasan: '**Jawaban: B.** Keduanya untuk graf tak berarah (A salah), keduanya greedy (C salah), dan keduanya menghasilkan MST dengan bobot minimum yang sama (D salah).',
    },
    {
      no: 7,
      tipe: 'analisis',
      teks: 'Tunjukkan dengan contoh dari graf bahan kuliah bahwa lintasan antara dua simpul di dalam MST belum tentu lintasan terpendek antara kedua simpul tersebut.',
      isian: [
        { label: 'Lintasan a ke h di dalam MST T1', jenis: 'pilih', opsi: ['a → b → c → f → g → h', 'a → h', 'a → b → h'], kunci: 'a → b → c → f → g → h' },
        { label: 'Bobot lintasan itu', jenis: 'angka', kunci: 19 },
        { label: 'Bobot busur langsung (a, h)', jenis: 'angka', kunci: 8 },
        { label: 'Lintasan di dalam MST itu adalah lintasan terpendek', jenis: 'pilih', opsi: ['Ya', 'Tidak'], kunci: 'Tidak' },
      ],
      pembahasan:
        'Di MST $T_1$, lintasan dari $a$ ke $h$ adalah $a \\to b \\to c \\to f \\to g \\to h$ dengan bobot $4 + 8 + 4 + 2 + 1 = 19$. Padahal busur langsung $(a, h)$ berbobot 8. Jadi lintasan di dalam MST tidak harus lintasan terpendek.',
    },
  ],
}

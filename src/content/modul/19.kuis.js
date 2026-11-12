// Kuis Pemahaman Modul 19 (7 soal pilihan ganda), bersumber dari soal PDF "19 - Konsep Minimum Spanning Tree" halaman 7–8.
// Teks memakai Markdown dengan rumus TeX ($...$). `kunci` berupa satu id (satu jawaban) atau larik id (banyak jawaban, dinilai utuh).

export const kuis19 = {
  judul: 'Konsep Minimum Spanning Tree (MST)',
  modul: '19',
  soal: [
    {
      no: 1,
      teks: 'Sebuah graf terhubung memiliki 12 simpul dan 30 busur. Berapa banyak busur pada MST-nya?',
      opsi: [
        { id: 'A', teks: '12' },
        { id: 'B', teks: '30' },
        { id: 'C', teks: '11' },
        { id: 'D', teks: '29' },
      ],
      kunci: 'C',
      pembahasan: '**Jawaban: C.** MST adalah tree yang menjangkau semua 12 simpul, sehingga memiliki $12 - 1 = 11$ busur, berapa pun banyaknya busur graf semula.',
    },
    {
      no: 2,
      teks: 'Mengapa jaringan kabel termurah yang menghubungkan semua kota tidak mungkin memuat cycle (biaya semua kabel positif)? Pilih **tiga** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: 'Bila jaringan memuat cycle, melepas satu kabel di cycle itu membuat semua kota tetap terhubung.' },
        { id: 'B', teks: 'Biaya total setelah kabel itu dilepas berkurang.' },
        { id: 'C', teks: 'Bentuk jaringan termurah adalah tree.' },
        { id: 'D', teks: 'Biaya total setelah kabel itu dilepas bertambah.' },
        { id: 'E', teks: 'Bentuk jaringan termurah adalah hutan yang terputus.' },
      ],
      kunci: ['A', 'B', 'C'],
      pembahasan:
        '**Jawaban: A, B, dan C.** Jika jaringan memuat cycle, salah satu kabel di cycle itu dapat dilepas dan semua kota tetap terhubung, karena dua ujung kabel tersebut masih terhubung lewat sisa cycle. Biaya totalnya berkurang (biaya positif), sehingga jaringan semula bukan yang termurah. Jadi jaringan termurah tidak memiliki cycle, yaitu berbentuk tree.',
    },
    {
      no: 3,
      teks: 'Pada graf contoh, perhatikan cut $S = \\{a\\}$ dan $V - S$ = simpul lainnya, dengan $A = \\emptyset$. Pilih **tiga** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: 'Ada 2 crossing edge, yaitu $(a, b)$ dan $(a, h)$.' },
        { id: 'B', teks: 'Light edge-nya berbobot 4.' },
        { id: 'C', teks: 'Busur $(a, b)$ dijamin safe.' },
        { id: 'D', teks: 'Busur $(a, h)$ dijamin safe.' },
        { id: 'E', teks: 'Ada 3 crossing edge.' },
      ],
      kunci: ['A', 'B', 'C'],
      pembahasan:
        '**Jawaban: A, B, dan C.** Crossing edge: $(a, b)$ berbobot 4 dan $(a, h)$ berbobot 8. Cut ini *respects* $A = \\emptyset$, dan light edge-nya adalah $(a, b)$, sehingga $(a, b)$ dijamin safe, artinya ada MST yang memuatnya. (Inilah langkah pertama Prim dengan akar $a$.)',
    },
    {
      no: 4,
      teks: 'Pernyataan "Jika bobot busur sebuah graf terhubung semuanya berbeda, MST-nya tunggal" adalah ...',
      opsi: [
        { id: 'A', teks: 'Salah, karena MST selalu lebih dari satu.' },
        { id: 'B', teks: 'Benar: ketidaktunggalan MST hanya dapat terjadi bila ada busur berbobot sama yang dapat saling menggantikan.' },
        { id: 'C', teks: 'Salah, karena graf terhubung selalu memiliki banyak spanning tree berbobot sama.' },
        { id: 'D', teks: 'Benar, tetapi hanya bila graf tidak memiliki cycle.' },
      ],
      kunci: 'B',
      pembahasan:
        '**Jawaban: B.** Ini sifat yang dikenal luas (lihat latihan pada Cormen dkk., 2009, Bab 23.1). Ketidaktunggalan MST hanya dapat terjadi bila ada busur berbobot sama yang dapat saling menggantikan, seperti $(a, h)$ dan $(b, c)$ pada contoh.',
    },
    {
      no: 5,
      teks: 'Pada graf contoh, bobot busur $(b, c)$ diubah dari 8 menjadi 9. Pilih **tiga** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: 'Bobot $T_1$ (yang memakai $(b, c)$) sekarang 38.' },
        { id: 'B', teks: 'Bobot $T_2$ (yang memakai $(a, h)$) tetap 37.' },
        { id: 'C', teks: 'MST sekarang tunggal, yaitu $T_2$.' },
        { id: 'D', teks: 'Bobot $T_1$ tetap 37.' },
        { id: 'E', teks: 'MST sekarang masih dua.' },
      ],
      kunci: ['A', 'B', 'C'],
      pembahasan: '**Jawaban: A, B, dan C.** MST $T_1$ (yang memakai $(b, c)$) bobotnya menjadi 38, sedangkan $T_2$ (yang memakai $(a, h)$) tetap 37. Jadi MST-nya menjadi **tunggal**, yaitu $T_2$, dengan bobot tetap **37**.',
    },
    {
      no: 6,
      teks: 'Perbedaan utama Kruskal dan Prim selama algoritma berjalan adalah ...',
      opsi: [
        { id: 'A', teks: 'Kruskal hanya untuk graf berarah.' },
        { id: 'B', teks: 'Prim tidak bersifat greedy.' },
        { id: 'C', teks: 'Kruskal selalu menghasilkan bobot yang lebih kecil.' },
        { id: 'D', teks: 'Kruskal memelihara forest yang lama-kelamaan menyatu; Prim memelihara satu tree yang terus tumbuh.' },
      ],
      kunci: 'D',
      pembahasan: '**Jawaban: D.** Keduanya untuk graf tak berarah (A salah), keduanya greedy (B salah), dan keduanya menghasilkan MST dengan bobot minimum yang sama (C salah).',
    },
    {
      no: 7,
      teks: 'Dari graf bahan kuliah, lintasan dari $a$ ke $h$ di dalam MST $T_1$ adalah $a \\to b \\to c \\to f \\to g \\to h$. Pilih **dua** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: 'Bobot lintasan itu adalah $4 + 8 + 4 + 2 + 1 = 19$.' },
        { id: 'B', teks: 'Busur langsung $(a, h)$ hanya berbobot 8, sehingga lintasan di dalam MST belum tentu lintasan terpendek.' },
        { id: 'C', teks: 'Lintasan di dalam MST selalu merupakan lintasan terpendek.' },
        { id: 'D', teks: 'Bobot lintasan itu adalah 8.' },
        { id: 'E', teks: 'Bobot busur langsung $(a, h)$ adalah 19.' },
      ],
      kunci: ['A', 'B'],
      pembahasan:
        '**Jawaban: A dan B.** Di MST $T_1$, lintasan dari $a$ ke $h$ adalah $a \\to b \\to c \\to f \\to g \\to h$ dengan bobot $4 + 8 + 4 + 2 + 1 = 19$. Padahal busur langsung $(a, h)$ berbobot 8. Jadi lintasan di dalam MST tidak harus lintasan terpendek.',
    },
  ],
}

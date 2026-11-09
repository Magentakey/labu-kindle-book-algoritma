// Kuis Pemahaman Modul 23 (7 soal) dan kunci serta pembahasannya, dari PDF "23 - Algoritma Bellman-Ford" halaman 8–9.
// Teks memakai Markdown dengan rumus TeX ($...$). Semua soal dinilai otomatis (pilihan atau isian); soal penelusuran, analisis, dan perhitungan (2, 3, 4, 6)
// dinilai dari beberapa isian, bukan uraian. Soal 5 (benar/salah dengan alasan) dinilai pada pilihan Benar/Salah; alasannya ada di pembahasan.
const NILAI = ['∞', '1', '2', '4', '5', '9']
const YT = ['Ya', 'Tidak']

export const kuis23 = {
  judul: 'Algoritma Bellman-Ford',
  modul: '23',
  soal: [
    {
      no: 1,
      tipe: 'pilihan',
      teks: 'Apa arti Bellman-Ford mengembalikan FALSE?',
      opsi: [
        { id: 'A', teks: 'Graf memiliki busur berbobot negatif.' },
        { id: 'B', teks: 'Graf memiliki cycle berbobot negatif yang dapat dicapai dari sumber, sehingga lintasan terpendek tidak terdefinisi.' },
        { id: 'C', teks: 'Ada simpul yang tidak dapat dicapai dari sumber.' },
        { id: 'D', teks: 'Banyaknya putaran kurang dari $\\lvert V \\rvert - 1$.' },
      ],
      kunci: 'B',
      pembahasan: '**Jawaban: B.** Busur negatif saja (A) tidak menyebabkan FALSE, seperti contoh di modul ini yang menghasilkan TRUE. Simpul yang tidak terjangkau (C) tetap bernilai $\\infty$ dan tidak memicu FALSE.',
    },
    {
      no: 2,
      tipe: 'penelusuran',
      teks: 'Jalankan Bellman-Ford dari $s$ pada graf dengan busur (dalam urutan ini) $(a, b) = -1$, $(s, a) = 4$, $(s, b) = 2$, $(b, c) = 3$, $(a, c) = 5$. Tuliskan $v.d$ setelah setiap putaran dan hasil akhirnya.',
      isian: [
        { label: 'Banyak putaran (|V| = 4)', jenis: 'angka', kunci: 3 },
        { label: 'a.d setelah loop 1', jenis: 'pilih', opsi: NILAI, kunci: '4' },
        { label: 'b.d setelah loop 1', jenis: 'pilih', opsi: NILAI, kunci: '2' },
        { label: 'c.d setelah loop 1', jenis: 'pilih', opsi: NILAI, kunci: '5' },
        { label: 'Apakah loop 2 mengubah sebuah nilai?', jenis: 'pilih', opsi: YT, kunci: 'Tidak' },
        { label: 'Apakah loop 3 mengubah sebuah nilai?', jenis: 'pilih', opsi: YT, kunci: 'Tidak' },
        { label: 'Nilai kembalian', jenis: 'pilih', opsi: ['TRUE', 'FALSE'], kunci: 'TRUE' },
        { label: 'Hasil akhir', jenis: 'pilih', opsi: ['a = 4, b = 2, c = 5', 'a = 4, b = 3, c = 5', 'a = 3, b = 2, c = 5'], kunci: 'a = 4, b = 2, c = 5' },
      ],
      pembahasan:
        '$\\lvert V \\rvert = 4$, sehingga 3 putaran. Inisialisasi: $s = 0$, lainnya $\\infty$. Loop 1: $(a, b)$ tidak berubah ($a = \\infty$); $(s, a)$: $a = 4$; $(s, b)$: $b = 2$; $(b, c)$: $c = 5$; $(a, c)$: $4 + 5 = 9 > 5$, tidak berubah. Loop 2: $(a, b)$: $4 - 1 = 3 > 2$, tidak berubah; tidak ada perubahan lain. Loop 3: tidak ada perubahan. Pemeriksaan akhir lolos, sehingga **TRUE** dengan $a = 4$, $b = 2$, $c = 5$.',
    },
    {
      no: 3,
      tipe: 'analisis',
      teks: 'Pada contoh modul ini, jika urutan busur diubah sehingga $(s,t)$ dan $(s,y)$ diproses **pertama**, apakah hasil akhirnya berubah? Apakah nilai bisa final lebih cepat? (Busur lainnya tetap dalam urutan semula.)',
      isian: [
        { label: 'Apakah hasil akhir berubah?', jenis: 'pilih', opsi: YT, kunci: 'Tidak' },
        { label: 'Hasil akhir', jenis: 'pilih', opsi: ['t = 2, x = 4, y = 7, z = −2', 't = 6, x = 4, y = 7, z = 2', 't = 2, x = 11, y = 7, z = 2'], kunci: 't = 2, x = 4, y = 7, z = −2' },
        { label: 't.d setelah putaran 1 (urutan baru)', jenis: 'angka', kunci: 6 },
        { label: 'x.d setelah putaran 1 (urutan baru)', jenis: 'angka', kunci: 4 },
        { label: 'z.d setelah putaran 1 (urutan baru)', jenis: 'angka', kunci: 2 },
        { label: 'Putaran terakhir yang masih mengubah nilai (urutan baru)', jenis: 'angka', kunci: 3 },
        { label: 'Putaran terakhir yang masih mengubah nilai (urutan di modul)', jenis: 'angka', kunci: 4 },
      ],
      pembahasan:
        'Hasil akhir **tidak berubah** ($t = 2$, $x = 4$, $y = 7$, $z = -2$), karena setelah $\\lvert V \\rvert - 1$ putaran Bellman-Ford selalu benar. Namun nilai bisa final lebih cepat. Dengan $(s,t)$ dan $(s,y)$ di depan, putaran 1 langsung memberi $t = 6$, $y = 7$, lalu $x = 4$, $z = 2$, dan seterusnya; nilai akhir tercapai dalam putaran yang lebih sedikit, dan putaran sisanya tidak mengubah apa pun.',
    },
    {
      no: 4,
      tipe: 'perhitungan',
      teks: 'Sebuah graf memiliki 100 simpul dan 2.000 busur. Berapa banyak pemanggilan RELAX yang dilakukan Bellman-Ford (langkah 2–4)? Berapa pemeriksaan pada langkah 5–7?',
      isian: [
        { label: 'Banyak pemanggilan RELAX (langkah 2–4)', jenis: 'angka', kunci: 198000 },
        { label: 'Banyak pemeriksaan (langkah 5–7)', jenis: 'angka', kunci: 2000 },
      ],
      pembahasan: 'RELAX: $(100 - 1) \\times 2.000 = $ **198.000** pemanggilan. Pemeriksaan akhir: **2.000**.',
    },
    {
      no: 5,
      tipe: 'benarsalah',
      teks: '"Jika sebuah graf tidak memiliki busur berbobot negatif, Bellman-Ford pasti mengembalikan TRUE." Benar atau salah? Pikirkan alasannya.',
      opsi: [
        { id: 'Benar', teks: 'Benar' },
        { id: 'Salah', teks: 'Salah' },
      ],
      kunci: 'Benar',
      pembahasan: '**Benar.** Tanpa busur negatif, tidak mungkin ada cycle berbobot negatif, sehingga pemeriksaan akhir selalu lolos. (Walaupun begitu, untuk graf seperti ini Dijkstra lebih efisien.)',
    },
    {
      no: 6,
      tipe: 'analisis',
      teks: 'Graf dengan busur $(s, a) = 1$, $(a, b) = 2$, $(b, a) = -4$. Tunjukkan bahwa Bellman-Ford mengembalikan FALSE dengan menelusuri $\\lvert V \\rvert - 1 = 2$ putaran (urutan busur seperti tertulis) lalu pemeriksaan akhir.',
      isian: [
        { label: 'a.d setelah loop 1', jenis: 'angka', kunci: -1 },
        { label: 'b.d setelah loop 1', jenis: 'angka', kunci: 3 },
        { label: 'a.d setelah loop 2', jenis: 'angka', kunci: -3 },
        { label: 'b.d setelah loop 2', jenis: 'angka', kunci: 1 },
        { label: 'Pemeriksaan (a, b): apakah b.d > a.d + 2?', jenis: 'pilih', opsi: ['TRUE', 'FALSE'], kunci: 'TRUE' },
        { label: 'Nilai kembalian', jenis: 'pilih', opsi: ['TRUE', 'FALSE'], kunci: 'FALSE' },
        { label: 'Bobot cycle a → b → a', jenis: 'angka', kunci: -2 },
      ],
      pembahasan:
        'Inisialisasi: $s = 0$, $a = b = \\infty$. Loop 1: $(s, a)$: $a = 1$; $(a, b)$: $b = 3$; $(b, a)$: $3 - 4 = -1 < 1$, sehingga $a = -1$. Loop 2: $(s, a)$ tidak berubah; $(a, b)$: $-1 + 2 = 1 < 3$, sehingga $b = 1$; $(b, a)$: $1 - 4 = -3$, sehingga $a = -3$. Pemeriksaan: $(a, b)$: $b = 1 > a + 2 = -1$ bernilai TRUE, sehingga **return FALSE**. Cycle $a \\to b \\to a$ berbobot $2 - 4 = -2$.',
    },
    {
      no: 7,
      tipe: 'pilihan',
      teks: 'Mengapa $z.d$ pada contoh modul ini baru bernilai benar ($-2$) pada putaran ke-4?',
      opsi: [
        { id: 'A', teks: 'Karena bobot $(t, z)$ negatif.' },
        { id: 'B', teks: 'Karena lintasan terpendek ke $z$ memuat 4 busur, dan dengan urutan busur ini setiap putaran hanya menjamin satu busur tambahan dari lintasan itu.' },
        { id: 'C', teks: 'Karena $z$ adalah simpul terakhir dalam abjad.' },
        { id: 'D', teks: 'Karena Bellman-Ford selalu memerlukan tepat 4 putaran.' },
      ],
      kunci: 'B',
      pembahasan:
        '**Jawaban: B.** Lintasan $s \\to y \\to x \\to t \\to z$ memuat 4 busur. Dengan urutan busur dari bahan kuliah, busur-busur lintasan itu menjadi efektif satu per putaran: $(s, y)$ pada loop 1, $(y, x)$ pada loop 2, $(x, t)$ pada loop 3, $(t, z)$ pada loop 4.',
    },
  ],
}

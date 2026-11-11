// Kuis Pemahaman Modul 01 (8 soal pilihan ganda), bersumber dari soal PDF "01 - Konsep Dasar Algoritma" halaman 12–14.
// Teks memakai Markdown dengan rumus TeX ($...$). `kunci` berupa satu id (satu jawaban) atau larik id (banyak jawaban, dinilai utuh).
export const kuis01 = {
  judul: 'Konsep Dasar Algoritma',
  modul: '01',
  soal: [
    {
      no: 1,
      teks: 'Manakah pernyataan yang paling tepat tentang hubungan algoritma dan program?',
      opsi: [
        { id: 'A', teks: 'Algoritma adalah program yang sudah dikompilasi.' },
        { id: 'B', teks: 'Satu algoritma hanya dapat diterjemahkan ke satu bahasa pemrograman.' },
        { id: 'C', teks: 'Program adalah wujud konkret algoritma dalam suatu bahasa pemrograman.' },
        { id: 'D', teks: 'Algoritma dan program adalah istilah yang sepenuhnya sama.' },
      ],
      kunci: 'C',
      pembahasan: '**Jawaban: C.** Program adalah terjemahan algoritma ke bahasa pemrograman tertentu. Pilihan B salah karena satu algoritma dapat diterjemahkan ke banyak bahasa. Pilihan A dan D mencampuradukkan rancangan (algoritma) dengan wujudnya (program).',
    },
    {
      no: 2,
      teks: 'Perhatikan langkah berikut: "1) Isi `x` dengan 10. 2) Selama `x` tidak sama dengan 0, kurangi `x` dengan 3." Pilih **dua** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: 'Nilai `x` berturut-turut adalah 10, 7, 4, 1, −2, −5, ...' },
        { id: 'B', teks: 'Perulangan berhenti ketika `x` mencapai 0.' },
        { id: 'C', teks: 'Langkah ini melanggar karakteristik *finiteness*.' },
        { id: 'D', teks: 'Langkah ini melanggar karakteristik *definiteness* karena instruksinya tidak jelas.' },
        { id: 'E', teks: 'Mengganti nilai awal `x` menjadi 11 membuat perulangan berhenti.' },
      ],
      kunci: ['A', 'C'],
      pembahasan: '**Jawaban: A dan C.** Nilai `x` melompati 0 dan tidak pernah sama dengan 0, sehingga kondisi "`x` tidak sama dengan 0" selalu benar dan perulangan tidak pernah berhenti (melanggar ***finiteness***). B salah karena 0 tidak pernah tercapai. D salah: instruksinya jelas, masalahnya ada pada keterhentian. E salah: dari 11 nilai `x` menjadi 11, 8, 5, 2, −1, ... dan tetap melompati 0. Perbaikannya, misalnya, mengganti kondisi menjadi "selama `x > 0`".',
    },
    {
      no: 3,
      teks: 'Manakah pernyataan yang benar tentang masukan (*input*) dan keluaran (*output*) sebuah algoritma?',
      opsi: [
        { id: 'A', teks: 'Algoritma wajib memiliki minimal satu masukan dan satu keluaran.' },
        { id: 'B', teks: 'Algoritma wajib memiliki minimal satu masukan, sedangkan keluaran boleh tidak ada.' },
        { id: 'C', teks: 'Algoritma boleh tidak memiliki keluaran asalkan memiliki masukan.' },
        { id: 'D', teks: 'Algoritma memiliki nol atau lebih masukan dan minimal satu keluaran.' },
      ],
      kunci: 'D',
      pembahasan: '**Jawaban: D.** Algoritma memiliki **nol** atau lebih masukan. Contoh algoritma tanpa masukan: mencetak bilangan 1 sampai 10, atau mencetak sepuluh bilangan prima pertama. Yang wajib minimal satu adalah keluaran, sehingga A, B, dan C salah.',
    },
    {
      no: 4,
      teks: 'Dalam konvensi pseudocode modul ini, apa perbedaan `a = b` dan `a == b`?',
      opsi: [
        { id: 'A', teks: 'Keduanya sama-sama memeriksa apakah `a` sama dengan `b`.' },
        { id: 'B', teks: '`a = b` mengisi `a` dengan nilai `b`; `a == b` memeriksa kesamaan dan menghasilkan TRUE/FALSE.' },
        { id: 'C', teks: '`a = b` memeriksa kesamaan; `a == b` mengisi nilai.' },
        { id: 'D', teks: '`a == b` hanya dipakai di dalam perulangan `for`.' },
      ],
      kunci: 'B',
      pembahasan: '**Jawaban: B.** Satu tanda sama dengan adalah pemberian nilai (*assignment*). Dua tanda sama dengan adalah perbandingan yang menghasilkan nilai logika TRUE atau FALSE, dan dipakai di dalam kondisi `if` atau `while`.',
    },
    {
      no: 5,
      teks: 'Telusuri `BILANGAN_MAX(5, 12, 8)` berikut. Pilih **dua** pernyataan yang benar.\n\n```pseudo\nBILANGAN_MAX(bil1, bil2, bil3)\n1 max = bil1\n2 if (max < bil2)\n3     then max = bil2\n4 if (max < bil3)\n5     then max = bil3\n6 return max\n```',
      opsi: [
        { id: 'A', teks: 'Keluarannya adalah 12.' },
        { id: 'B', teks: 'Perintah pemberian nilai ke `max` dijalankan 3 kali.' },
        { id: 'C', teks: 'Baris 3 dijalankan, sedangkan baris 5 dilewati.' },
        { id: 'D', teks: 'Baris 5 dijalankan karena $12 < 8$ bernilai TRUE.' },
        { id: 'E', teks: 'Keluarannya adalah 8.' },
      ],
      kunci: ['A', 'C'],
      pembahasan: '**Jawaban: A dan C.** Baris 1: `max = 5`. Baris 2: $5 < 12$ TRUE, sehingga baris 3 memberi `max = 12`. Baris 4: $12 < 8$ FALSE, sehingga baris 5 dilewati. Baris 6 mengembalikan **12**. Pemberian nilai ke `max` terjadi **2 kali** (baris 1 dan baris 3), bukan 3 kali (B salah). D dan E salah karena $12 < 8$ FALSE dan keluarannya 12.',
    },
    {
      no: 6,
      teks: 'Jalankan `JUMLAH_n_BIL` untuk $A = [4, -2, 9, 1]$. Manakah yang tepat untuk (keluaran, berapa kali baris `for` diperiksa, berapa kali `jumlah = jumlah + A[i]` dijalankan)?',
      opsi: [
        { id: 'A', teks: '12, 4 kali, 4 kali' },
        { id: 'B', teks: '12, 5 kali, 5 kali' },
        { id: 'C', teks: '12, 5 kali, 4 kali' },
        { id: 'D', teks: '11, 5 kali, 4 kali' },
      ],
      kunci: 'C',
      pembahasan: '**Jawaban: C.** Nilai `jumlah` berturut-turut 0, 4, 2, 11, 12, sehingga keluarannya **12**. Baris `for` diperiksa **5 kali** ($i = 1, 2, 3, 4$ bernilai benar, ditambah $i = 5$ yang menghentikan perulangan). Isi perulangan dijalankan **4 kali**. Secara umum, untuk $n$ data, baris `for` diperiksa $n + 1$ kali dan isinya dijalankan $n$ kali.',
    },
    {
      no: 7,
      teks: 'Kamu merancang `BILANGAN_MIN(bil1, bil2, bil3)` yang mengembalikan bilangan terkecil dari tiga bilangan. Pilih **dua** pernyataan yang benar.',
      opsi: [
        { id: 'A', teks: 'Cukup memakai runtunan dan percabangan: `min = bil1`, lalu dua pernyataan `if` yang membandingkannya dengan `bil2` dan `bil3`.' },
        { id: 'B', teks: 'Rancangan ini wajib memakai perulangan karena ada tiga bilangan.' },
        { id: 'C', teks: 'Untuk masukan (4, 9, 2), rancangan tersebut mengembalikan 2.' },
        { id: 'D', teks: 'Satu pernyataan `if` yang membandingkan `bil1` dengan `bil2` sudah cukup.' },
        { id: 'E', teks: '`min` sebaiknya diawali 0 agar lebih aman.' },
      ],
      kunci: ['A', 'C'],
      pembahasan: '**Jawaban: A dan C.** Salah satu rancangan yang benar:\n\n```pseudo\nBILANGAN_MIN(bil1, bil2, bil3)\n1 min = bil1\n2 if (min > bil2)\n3     then min = bil2\n4 if (min > bil3)\n5     then min = bil3\n6 return min\n```\n\nStruktur yang digunakan: **runtunan** dan **percabangan**. Untuk (4, 9, 2): `min` = 4, tetap 4 setelah dibandingkan dengan 9, lalu menjadi 2. B salah karena jumlah bilangan tetap tiga. D salah karena `bil3` tidak ikut dibandingkan. E salah: bila semua bilangan positif, `min` = 0 akan mengembalikan 0 yang bukan anggota masukan.',
    },
    {
      no: 8,
      teks: 'Sebuah algoritma mengurutkan $n$ data dengan mencoba seluruh $n!$ kemungkinan susunan lalu memilih susunan yang urut. Pernyataan yang paling tepat adalah ...',
      opsi: [
        { id: 'A', teks: 'Algoritma ini tidak memenuhi *output*.' },
        { id: 'B', teks: 'Algoritma ini efisien karena pasti menemukan jawaban.' },
        { id: 'C', teks: 'Algoritma ini tidak memenuhi *finiteness*.' },
        { id: 'D', teks: 'Algoritma ini benar dan berhenti, tetapi sangat tidak efisien untuk $n$ besar.' },
      ],
      kunci: 'D',
      pembahasan: '**Jawaban: D.** Banyaknya susunan memang besar tetapi tetap terbatas, sehingga algoritma pasti berhenti (*finiteness* terpenuhi) dan menghasilkan keluaran yang benar. Masalahnya ada pada efisiensi. Untuk $n = 20$ saja, $20! \\approx 2{,}4 \\times 10^{18}$ susunan. Ini contoh bahwa algoritma yang benar dan efektif belum tentu efisien.',
    },
  ],
}

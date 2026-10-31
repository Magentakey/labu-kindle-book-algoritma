// Daftar modul materi baru (24 modul direncanakan). Saat ini baru Modul 01 (Konsep Dasar Algoritma) dan Modul 04 (Insertion Sort) yang sudah ditulis.
// Sumber metadata: PDF modul, "00 - Indeks dan Peta Belajar", dan desain Figma Materi.

export const TOTAL_MODUL = 24
export const PASS_PERCENT = 70

/** Bagian halaman modul (urutan sama dengan tab di bar atas). `kuis` ditangani halaman, bukan teks modul. */
export const sections = [
  { id: 'pendahuluan', tab: '1 Pendahuluan' },
  { id: 'algoritma', tab: '2 Algoritma' },
  { id: 'penelusuran', tab: '3 Penelusuran' },
  { id: 'analisis', tab: '4 Analisis' },
  { id: 'makna', tab: '5 Makna' },
  { id: 'kesimpulan', tab: '6 Kesimpulan' },
  { id: 'kuis', tab: 'Kuis' },
  { id: 'referensi', tab: 'Referensi' },
]

/** Daftar tab untuk satu modul: bagian yang sama untuk semua modul, tetapi tulisan tab boleh disesuaikan lewat `m.tabs` (id bagian → teks tab). */
export const tabsOf = (m) => sections.map((s) => (m.tabs?.[s.id] ? { ...s, tab: m.tabs[s.id] } : s))

export const modul = [
  {
    no: 1,
    id: '01',
    bab: 'BAB I',
    topik: 'DASAR ALGORITMA',
    judul: 'Konsep Dasar Algoritma',
    judulPanjang: 'Konsep Dasar Algoritma: Definisi, Karakteristik, Representasi, dan Struktur',
    ringkas: 'Fondasi untuk seluruh modul: apa itu algoritma, syarat algoritma yang baik, cara menuliskannya, dan tiga struktur pembangunnya.',
    prasyarat: [],
    prasyaratTeks: 'Tidak ada prasyarat khusus. Modul ini adalah titik awal.',
    materiAsal: 'PENGERTIAN ALGORITMA PEMROGRAMAN (bagian A–C)',
    posisi: { urutan: ['01', '02', '03'], aktif: 0, catatan: 'Modul pertama. Menjadi dasar Modul 02 (Iteratif & Rekursif) dan Modul 03 (Running Time).' },
    halaman: 14,
    soal: 8,
    menit: 45, // perkiraan: sekitar 3 menit per halaman, seperti Modul 04
    pdf: 'modul-01-konsep-dasar-algoritma.pdf',
    algoritmaId: null, // modul konsep: belum ada visualizer
    // Struktur PDF Modul 01 (bagian 2–5 berupa pembahasan inti) dipetakan ke enam bagian yang sama dengan modul lain.
    tabs: { algoritma: '2 Konsep', penelusuran: '3 Penulisan', analisis: '4 Penelusuran', makna: '5 Hubungan' },
    tujuan: [
      'Menjelaskan pengertian algoritma, program, dan pemrograman serta hubungan ketiganya.',
      'Mengidentifikasi enam karakteristik algoritma dan mengenali algoritma yang melanggarnya.',
      'Menuliskan algoritma dalam bentuk naratif, flowchart, dan pseudocode.',
      'Membedakan struktur runtunan, percabangan, dan perulangan, lalu menelusuri (*trace*) algoritma sederhana langkah demi langkah.',
    ],
  },
  {
    no: 2,
    id: '02',
    bab: 'BAB I',
    topik: 'DASAR ALGORITMA',
    judul: 'Iteratif dan Rekursif',
    judulPanjang: 'Algoritma Iteratif dan Rekursif: Studi Kasus Binary Search',
    ringkas: 'Dua cara mengulang pekerjaan: dengan perulangan atau dengan fungsi yang memanggil dirinya sendiri.',
    prasyarat: [1],
    prasyaratTeks: 'Modul 01: pseudocode, struktur percabangan dan perulangan, penelusuran algoritma.',
    materiAsal: 'PENGERTIAN ALGORITMA PEMROGRAMAN (bagian Algoritma Iteratif dan Rekursif)',
    posisi: { urutan: ['01', '02', '08 · 09', '12 · 18'], aktif: 1, catatan: 'Modul kedua. Konsep rekursi dipakai lagi pada Divide and Conquer (Modul 08), Recurrence (Modul 09), DFS (Modul 18), dan PRINT-LCS (Modul 12).' },
    halaman: 12,
    soal: 7,
    menit: 40, // perkiraan: sekitar 3 menit per halaman, seperti Modul 04
    pdf: 'modul-02-iteratif-dan-rekursif.pdf',
    algoritmaId: 'binary-search',
    // Struktur PDF: 1 Pendahuluan, 2 Iteratif dan Rekursif, 3 Binary Search, 4 Penelusuran, 5 Seberapa Cepat, 6 Kesimpulan.
    tabs: { algoritma: '2 Iteratif & Rekursif', penelusuran: '3 Binary Search', analisis: '4 Penelusuran', makna: '5 Kecepatan' },
    tujuan: [
      'Membedakan pendekatan iteratif dan rekursif beserta kelebihan dan kekurangannya.',
      'Mengidentifikasi kasus dasar (*base case*) dan kasus rekursif pada sebuah fungsi rekursif.',
      'Menjelaskan cara kerja Binary Search serta syarat yang harus dipenuhi masukannya.',
      'Menelusuri Binary Search versi iteratif maupun rekursif, termasuk tumpukan pemanggilan fungsi.',
      'Menjelaskan mengapa Binary Search membutuhkan paling banyak $\\lfloor \\lg n \\rfloor + 1$ perbandingan.',
    ],
  },
  {
    no: 4,
    id: '04',
    bab: 'BAB II',
    topik: 'ANALISIS RUNNING TIME',
    judul: 'Insertion Sort',
    judulPanjang: 'Insertion Sort: Cara Kerja dan Analisis Running Time',
    ringkas: 'Algoritma pengurutan pertama kita, lengkap dengan penurunan running time kasus terbaik (linier) dan terburuk (kuadrat).',
    prasyarat: [3],
    prasyaratTeks: 'Modul 03: metode cost × jumlah operasi, kasus terbaik dan terburuk, deret aritmetika.',
    materiAsal: 'Materi 2. ALGORITMA INSERTION SORT dan RUNNING TIME',
    posisi: { urutan: ['03', '04', '05 · 06', '08'], aktif: 1, catatan: 'Penerapan khusus Modul 03; hasilnya (linier vs kuadrat) dipakai sebagai contoh di Modul 05–06 dan dibandingkan dengan Merge Sort di Modul 08.' },
    halaman: 11,
    soal: 8,
    menit: 35,
    pdf: 'modul-04-insertion-sort.pdf',
    algoritmaId: 'insertion-sort',
    tujuan: [
      'Menjelaskan gagasan Insertion Sort dan arti setiap baris pseudocode-nya.',
      'Menelusuri Insertion Sort pada array kecil dan mencatat keadaan array setiap putaran.',
      'Menyusun tabel cost × jumlah operasi dengan variabel $t_j$.',
      'Menurunkan running time kasus terbaik $T(n) = an + b$ dan kasus terburuk $T(n) = an^2 + bn + c$.',
      'Menentukan jenis masukan yang menghasilkan kasus terbaik dan terburuk.',
    ],
  },
]

export const modulById = (id) => modul.find((m) => m.id === id) ?? null
export const modulLabel = (m) => `Modul ${m.id}`
/** Modul sebelumnya/berikutnya menurut nomor (null bila modul itu belum tersedia). Modul tidak dilompati: setelah 01 yang berikutnya adalah 02, bukan 04. */
export const neighbors = (id) => {
  const no = modulById(id)?.no
  return { prev: modul.find((m) => m.no === no - 1) ?? null, next: modul.find((m) => m.no === no + 1) ?? null }
}

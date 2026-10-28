// Daftar modul materi baru (24 modul direncanakan). Saat ini baru Modul 04 (Insertion Sort) yang sudah ditulis.
// Sumber metadata: PDF "04 - Insertion Sort" dan desain Figma Materi.

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

export const modul = [
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
/** Modul sebelumnya/berikutnya yang sudah tersedia (kosong bila belum ada). */
export const neighbors = (id) => {
  const i = modul.findIndex((m) => m.id === id)
  return { prev: modul[i - 1] ?? null, next: modul[i + 1] ?? null }
}

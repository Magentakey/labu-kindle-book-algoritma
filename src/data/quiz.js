// Daftar kuis di halaman Quiz. Satu kuis per modul. Saat ini baru kuis Modul 04 (Insertion Sort) yang tersedia.
// Tingkat: Easy (konsep dasar), Medium (penelusuran dan perhitungan), Hard, Complex. Sumber desain: Figma "Quiz · Daftar (grup Steam)".

export const tingkat = [
  { id: 'easy', label: 'Easy', warna: 'mint' },
  { id: 'medium', label: 'Medium', warna: 'kuning' },
  { id: 'hard', label: 'Hard', warna: 'oranye' },
  { id: 'complex', label: 'Complex', warna: 'merah' },
]

export const tingkatById = (id) => tingkat.find((t) => t.id === id) ?? null

/** Jenis soal yang bisa disaring (sama dengan label di kuis). */
export const tipeSoal = [
  { id: 'pilihan', label: 'Pilihan Ganda' },
  { id: 'penelusuran', label: 'Penelusuran' },
  { id: 'perhitungan', label: 'Perhitungan' },
  { id: 'benarsalah', label: 'Benar/Salah' },
  { id: 'analisis', label: 'Analisis' },
  { id: 'rancang', label: 'Merancang' },
]

export const daftarKuis = [
  {
    id: '01',
    modul: '01',
    judul: 'Konsep Dasar Algoritma',
    tingkat: 'easy',
    soal: 8,
    menit: 8,
    tipe: ['pilihan', 'analisis', 'benarsalah', 'penelusuran', 'rancang'],
    thumb: 'pumpkin',
  },
  {
    id: '04',
    modul: '04',
    judul: 'Telusuri Insertion Sort',
    tingkat: 'medium',
    soal: 8,
    menit: 8,
    tipe: ['penelusuran', 'pilihan', 'perhitungan', 'benarsalah', 'analisis'],
    thumb: 'bars',
  },
]

export const kuisById = (id) => daftarKuis.find((k) => k.id === id) ?? null

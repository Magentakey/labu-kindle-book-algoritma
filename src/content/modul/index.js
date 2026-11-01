// Pendaftaran isi modul. Teks dimuat saat dibutuhkan (dynamic import) agar tidak membebani halaman daftar.
export const modulKonten = {
  '05': {
    teks: () => import('./05.md?raw').then((m) => m.default),
    kuis: () => import('./05.kuis.js').then((m) => m.kuis05),
    blok: () => import('./05.blok.js'),
  },
  '03': {
    teks: () => import('./03.md?raw').then((m) => m.default),
    kuis: () => import('./03.kuis.js').then((m) => m.kuis03),
    blok: () => import('./03.blok.js'),
  },
  '02': {
    teks: () => import('./02.md?raw').then((m) => m.default),
    kuis: () => import('./02.kuis.js').then((m) => m.kuis02),
    blok: () => import('./02.blok.js'),
  },
  '01': {
    teks: () => import('./01.md?raw').then((m) => m.default),
    kuis: () => import('./01.kuis.js').then((m) => m.kuis01),
    blok: () => import('./01.blok.js'), // { pseudo: {...}, gambar: {...} } untuk penanda {{pseudo:id}} dan {{gambar:id}}
  },
  '04': {
    teks: () => import('./04.md?raw').then((m) => m.default),
    kuis: () => import('./04.kuis.js').then((m) => m.kuis04),
    tantangan: () => import('./04.tantangan.json').then((m) => m.default),
  },
}

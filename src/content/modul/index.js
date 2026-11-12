// Pendaftaran isi modul. Teks dimuat saat dibutuhkan (dynamic import) agar tidak membebani halaman daftar.
export const modulKonten = {
  '24': {
    teks: () => import('./24.md?raw').then((m) => m.default),
    kuis: () => import('./24.kuis.js').then((m) => m.kuis24),
    blok: () => import('./24.blok.js'),
    tantangan: () => import('./24.tantangan.json').then((m) => m.default),
  },
  '23': {
    teks: () => import('./23.md?raw').then((m) => m.default),
    kuis: () => import('./23.kuis.js').then((m) => m.kuis23),
    blok: () => import('./23.blok.js'),
    tantangan: () => import('./23.tantangan.json').then((m) => m.default),
  },
  '22': {
    teks: () => import('./22.md?raw').then((m) => m.default),
    kuis: () => import('./22.kuis.js').then((m) => m.kuis22),
    blok: () => import('./22.blok.js'),
    tantangan: () => import('./22.tantangan.json').then((m) => m.default),
  },
  '21': {
    teks: () => import('./21.md?raw').then((m) => m.default),
    kuis: () => import('./21.kuis.js').then((m) => m.kuis21),
    blok: () => import('./21.blok.js'),
    tantangan: () => import('./21.tantangan.json').then((m) => m.default),
  },
  '20': {
    teks: () => import('./20.md?raw').then((m) => m.default),
    kuis: () => import('./20.kuis.js').then((m) => m.kuis20),
    blok: () => import('./20.blok.js'),
    tantangan: () => import('./20.tantangan.json').then((m) => m.default),
  },
  '19': {
    teks: () => import('./19.md?raw').then((m) => m.default),
    kuis: () => import('./19.kuis.js').then((m) => m.kuis19),
    blok: () => import('./19.blok.js'),
  },
  '18': {
    teks: () => import('./18.md?raw').then((m) => m.default),
    kuis: () => import('./18.kuis.js').then((m) => m.kuis18),
    blok: () => import('./18.blok.js'),
    tantangan: () => import('./18.tantangan.json').then((m) => m.default),
  },
  '17': {
    teks: () => import('./17.md?raw').then((m) => m.default),
    kuis: () => import('./17.kuis.js').then((m) => m.kuis17),
    blok: () => import('./17.blok.js'),
    tantangan: () => import('./17.tantangan.json').then((m) => m.default),
  },
  '16': {
    teks: () => import('./16.md?raw').then((m) => m.default),
    kuis: () => import('./16.kuis.js').then((m) => m.kuis16),
    blok: () => import('./16.blok.js'),
    tantangan: () => import('./16.tantangan.json').then((m) => m.default),
  },
  '15': {
    teks: () => import('./15.md?raw').then((m) => m.default),
    kuis: () => import('./15.kuis.js').then((m) => m.kuis15),
    blok: () => import('./15.blok.js'),
    tantangan: () => import('./15.tantangan.json').then((m) => m.default),
  },
  '14': {
    teks: () => import('./14.md?raw').then((m) => m.default),
    kuis: () => import('./14.kuis.js').then((m) => m.kuis14),
    blok: () => import('./14.blok.js'),
    tantangan: () => import('./14.tantangan.json').then((m) => m.default),
  },
  '13': {
    teks: () => import('./13.md?raw').then((m) => m.default),
    kuis: () => import('./13.kuis.js').then((m) => m.kuis13),
    tantangan: () => import('./13.tantangan.json').then((m) => m.default),
  },
  '12': {
    teks: () => import('./12.md?raw').then((m) => m.default),
    kuis: () => import('./12.kuis.js').then((m) => m.kuis12),
    blok: () => import('./12.blok.js'),
    tantangan: () => import('./12.tantangan.json').then((m) => m.default),
  },
  '11': {
    teks: () => import('./11.md?raw').then((m) => m.default),
    kuis: () => import('./11.kuis.js').then((m) => m.kuis11),
    blok: () => import('./11.blok.js'),
    tantangan: () => import('./11.tantangan.json').then((m) => m.default),
  },
  '10': {
    teks: () => import('./10.md?raw').then((m) => m.default),
    kuis: () => import('./10.kuis.js').then((m) => m.kuis10),
    blok: () => import('./10.blok.js'),
    tantangan: () => import('./10.tantangan.json').then((m) => m.default),
  },
  '09': {
    teks: () => import('./09.md?raw').then((m) => m.default),
    kuis: () => import('./09.kuis.js').then((m) => m.kuis09),
    tantangan: () => import('./09.tantangan.json').then((m) => m.default),
  },
  '08': {
    teks: () => import('./08.md?raw').then((m) => m.default),
    kuis: () => import('./08.kuis.js').then((m) => m.kuis08),
    blok: () => import('./08.blok.js'),
    tantangan: () => import('./08.tantangan.json').then((m) => m.default),
  },
  '07': {
    teks: () => import('./07.md?raw').then((m) => m.default),
    kuis: () => import('./07.kuis.js').then((m) => m.kuis07),
    tantangan: () => import('./07.tantangan.json').then((m) => m.default),
  },
  '06': {
    teks: () => import('./06.md?raw').then((m) => m.default),
    kuis: () => import('./06.kuis.js').then((m) => m.kuis06),
    blok: () => import('./06.blok.js'),
    tantangan: () => import('./06.tantangan.json').then((m) => m.default),
  },
  '05': {
    teks: () => import('./05.md?raw').then((m) => m.default),
    kuis: () => import('./05.kuis.js').then((m) => m.kuis05),
    blok: () => import('./05.blok.js'),
    tantangan: () => import('./05.tantangan.json').then((m) => m.default),
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
    tantangan: () => import('./02.tantangan.json').then((m) => m.default),
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

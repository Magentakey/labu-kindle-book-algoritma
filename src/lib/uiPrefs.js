import { createStore } from './storage.js'

// Preferensi tampilan kecil yang diingat antarkunjungan (memakai penyimpanan aman dari storage.js).
const store = createStore()

export const sidebarPref = {
  /** @returns {boolean} true bila pengguna terakhir menyembunyikan sidebar di layar lebar */
  wasHidden: () => store.get('sidebar') === 'hidden',
  remember: (open) => store.set('sidebar', open ? 'shown' : 'hidden'),
}

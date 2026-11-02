import { lazy } from 'react'

// Registri penjelajah: id algoritma → komponen halaman (dimuat lazy). Daftar id ada di penjelajahIds.js supaya bisa dites tanpa React.
export const penjelajah = {
  'pertumbuhan-fungsi': lazy(() => import('./PenjelajahPertumbuhan.jsx')),
  'batas-asimtotik': lazy(() => import('./PenjelajahBatas.jsx')),
  'little-o-omega': lazy(() => import('./PenjelajahLimit.jsx')),
  'pohon-recurrence': lazy(() => import('./PenjelajahPohon.jsx')),
}

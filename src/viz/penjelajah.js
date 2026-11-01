import { lazy } from 'react'

// Registri penjelajah: id algoritma → komponen halaman (dimuat lazy). Daftar id ada di penjelajahIds.js supaya bisa dites tanpa React.
export const penjelajah = {
  'pertumbuhan-fungsi': lazy(() => import('./PenjelajahPertumbuhan.jsx')),
  'batas-asimtotik': lazy(() => import('./PenjelajahBatas.jsx')),
}

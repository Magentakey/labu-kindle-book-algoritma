import { lazy } from 'react'

// Registri penjelajah: id algoritma → komponen halaman (dimuat lazy). Daftar id ada di penjelajahIds.js supaya bisa dites tanpa React.
export const penjelajah = {
  'little-o-omega': lazy(() => import('./PenjelajahLimit.jsx')),
  'pohon-recurrence': lazy(() => import('./PenjelajahPohon.jsx')),
  'konsep-dp': lazy(() => import('./PenjelajahDP.jsx')),
  'konsep-greedy': lazy(() => import('./PenjelajahGreedy.jsx')),
  'representasi-graf': lazy(() => import('./PenjelajahGraf.jsx')),
}

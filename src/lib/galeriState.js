// Status lipat/buka grup kategori di Galeri disimpan di perangkat (style guide: "collapse grup ... state disimpan").
import { kategori } from '../data/algoritma.js'

export const GALERI_TUTUP_KEY = 'labu-galeri-tutup'

/** Membaca id kategori yang sedang dilipat. Nilai rusak atau id yang tidak dikenal diabaikan. */
export function readCollapsed(storage) {
  try {
    const raw = JSON.parse(storage?.getItem(GALERI_TUTUP_KEY) ?? '[]')
    const valid = new Set(kategori.map((k) => k.id))
    return new Set(Array.isArray(raw) ? raw.filter((id) => valid.has(id)) : [])
  } catch {
    return new Set()
  }
}

export function writeCollapsed(storage, set) {
  try {
    storage?.setItem(GALERI_TUTUP_KEY, JSON.stringify([...set]))
  } catch {
    // penyimpanan tidak tersedia: status lipat hanya berlaku selama halaman terbuka
  }
}

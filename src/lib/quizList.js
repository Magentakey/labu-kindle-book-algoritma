// Logika daftar Quiz: status tiap kuis dari kemajuan, penyaringan, pengelompokan menurut tingkat, dan ringkasan.
import { tingkat } from '../data/quiz.js'

const norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

/**
 * Status kuis dari data kemajuan satu modul: 'belum' (belum dicoba), 'lulus' (pernah lulus), atau 'gagal' (sudah dicoba, belum lulus).
 * @param {{ kuis?: { attempts?: number, passed?: boolean } } | undefined} entry
 */
export function statusKuis(entry) {
  const k = entry?.kuis
  if (!k || !(k.attempts > 0)) return 'belum'
  return k.passed ? 'lulus' : 'gagal'
}

/** Teks skor terbaik di kartu, mis. "Terbaik 8/8 · Lulus"; null bila belum dicoba. */
export function labelTerbaik(entry) {
  const k = entry?.kuis
  if (!k?.best) return null
  return `Terbaik ${k.best.skor}/${k.best.total} · ${k.passed ? 'Lulus' : 'Belum lulus'}`
}

/**
 * Menyaring daftar kuis.
 * @param {Array<object>} daftar
 * @param {Record<string, object>} progres kemajuan menurut id modul
 * @param {{ q?: string, modul?: string, status?: string, tipe?: string[] }} f `modul` dan `status` bernilai 'semua' untuk tanpa saring; `tipe` kosong = semua jenis
 */
export function saring(daftar, progres, f = {}) {
  const q = norm(f.q ?? '').trim()
  const tipe = f.tipe ?? []
  return daftar.filter((k) => {
    if (f.modul && f.modul !== 'semua' && k.modul !== f.modul) return false
    if (f.status && f.status !== 'semua' && statusKuis(progres[k.modul]) !== f.status) return false
    if (tipe.length > 0 && !tipe.some((t) => k.tipe.includes(t))) return false
    if (q && !norm(`${k.judul} modul ${k.modul} ${k.tingkat}`).includes(q)) return false
    return true
  })
}

/** Mengelompokkan menurut tingkat dengan urutan tetap Easy → Complex. Hanya kelompok yang berisi yang dikembalikan. */
export function kelompokkan(daftar) {
  return tingkat.map((t) => ({ ...t, items: daftar.filter((k) => k.tingkat === t.id) })).filter((g) => g.items.length > 0)
}

/** Ringkasan di kepala halaman: jumlah kuis, soal, modul, yang lulus, dan rata-rata skor terbaik (null bila belum ada yang dicoba). */
export function ringkasan(daftar, progres) {
  const dicoba = daftar.map((k) => progres[k.modul]?.kuis?.best).filter(Boolean)
  return {
    kuis: daftar.length,
    soal: daftar.reduce((n, k) => n + k.soal, 0),
    modul: new Set(daftar.map((k) => k.modul)).size,
    lulus: daftar.filter((k) => statusKuis(progres[k.modul]) === 'lulus').length,
    dicoba: dicoba.length,
    rataRata: dicoba.length ? Math.round(dicoba.reduce((n, b) => n + b.persen, 0) / dicoba.length) : null,
  }
}

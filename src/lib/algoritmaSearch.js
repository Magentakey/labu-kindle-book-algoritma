// Pencarian, penyaringan, pengelompokan, dan saran ejaan untuk Galeri Algoritma (logika murni, bisa dites).
import { algoritma as semua, kategori } from '../data/algoritma.js'

const SUP = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', ⁿ: 'n' }
const SUB = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9' }
const GREEK = { Θ: 'theta', θ: 'theta', Ω: 'omega', ω: 'omega' }

/** Menyamakan teks untuk dicari: huruf kecil, tanpa aksen dan spasi, O(n²) → o(n2), Θ → theta, ω → omega. */
export function normalize(s) {
  return String(s ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹ⁿ]/g, (c) => SUP[c])
    .replace(/[₀₁₂₃₄₅₆₇₈₉]/g, (c) => SUB[c])
    .replace(/[ΘθΩω]/g, (c) => GREEK[c])
    .replace(/−/g, '-')
    .toLowerCase()
    .replace(/\s+/g, '')
}

const kategoriById = Object.fromEntries(kategori.map((k) => [k.id, k]))
const padModul = (n) => String(n).padStart(2, '0')

/** Teks yang dicari untuk satu algoritma: judul, deskripsi, kompleksitas, paradigma, kategori, dan "modul NN". */
export const searchText = (a) => normalize([a.judul, a.deskripsi, a.kompleksitas, a.paradigma, kategoriById[a.kategori].title, kategoriById[a.kategori].label, `modul${padModul(a.modul)}`].join(' '))

/** Menyaring menurut teks cari dan kategori (`'semua'` = semua kategori). Urutan asli dipertahankan. */
export function filterAlgoritma(query = '', kategoriId = 'semua', daftar = semua) {
  const q = normalize(query)
  return daftar.filter((a) => (kategoriId === 'semua' || a.kategori === kategoriId) && (q === '' || searchText(a).includes(q)))
}

/** Mengelompokkan per kategori menurut urutan `kategori`, melewati kategori yang kosong. */
export function groupByKategori(daftar) {
  return kategori.map((k) => ({ ...k, items: daftar.filter((a) => a.kategori === k.id) })).filter((g) => g.items.length > 0)
}

/** Jarak edit (Levenshtein) antara dua teks. */
export function editDistance(a, b) {
  const m = a.length
  const n = b.length
  let prev = Array.from({ length: n + 1 }, (_, j) => j)
  for (let i = 1; i <= m; i++) {
    const cur = [i]
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    prev = cur
  }
  return prev[n]
}

/**
 * Saran "Mungkin maksudmu" saat pencarian kosong: algoritma yang judulnya paling mirip dengan ejaan pengguna,
 * lalu satu algoritma lain dari kategori yang sama. Maksimal `max` saran; kosong bila tidak ada yang cukup mirip.
 */
export function suggest(query, max = 2, daftar = semua) {
  const q = normalize(query)
  if (q.length < 2) return []
  let best = null
  for (const a of daftar) {
    const t = normalize(a.judul)
    const d = Math.min(editDistance(q, t), ...a.judul.split(/[\s/-]+/).map((w) => editDistance(q, normalize(w))))
    if (best === null || d < best.d) best = { a, d }
  }
  if (!best || best.d > Math.max(1, Math.ceil(q.length * 0.4))) return []
  const sama = daftar.filter((a) => a.kategori === best.a.kategori && a.id !== best.a.id)
  return [best.a, ...sama].slice(0, max)
}

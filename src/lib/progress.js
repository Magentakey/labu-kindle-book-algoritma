// Kemajuan belajar per modul, disimpan di perangkat (tanpa akun). Dibaca daftar Materi, halaman modul, dan Credit.
import { sections } from '../data/modul.js'

export const PROGRESS_KEY = 'labu-progres-modul'

/** Bagian yang dihitung "dibaca" lewat gulir. `kuis` dihitung selesai hanya bila kuisnya lulus. */
export const READ_SECTIONS = sections.filter((s) => s.id !== 'kuis').map((s) => s.id)

const empty = () => ({ visited: [], last: null, kuis: { attempts: 0, best: null, passed: false, hasil: null } })

/** Membaca semua kemajuan. Data rusak atau tidak dikenal diabaikan. @returns {Record<string, ReturnType<typeof empty>>} */
export function readAll(storage) {
  try {
    const raw = JSON.parse(storage?.getItem(PROGRESS_KEY) ?? '{}')
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
    const out = {}
    for (const [id, e] of Object.entries(raw)) {
      if (!e || typeof e !== 'object') continue
      out[id] = {
        visited: Array.isArray(e.visited) ? e.visited.filter((v) => READ_SECTIONS.includes(v)) : [],
        last: e.last && sections.some((s) => s.id === e.last.section) && Number.isFinite(e.last.at) ? { section: e.last.section, at: e.last.at } : null,
        kuis: { ...empty().kuis, ...(e.kuis && typeof e.kuis === 'object' ? e.kuis : {}) },
      }
    }
    return out
  } catch {
    return {}
  }
}

export function writeAll(storage, all) {
  try {
    storage?.setItem(PROGRESS_KEY, JSON.stringify(all))
  } catch {
    // penyimpanan tidak tersedia: kemajuan hanya berlaku selama halaman terbuka
  }
}

export const entryOf = (all, id) => all[id] ?? empty()

/** Menandai bagian sudah dibaca dan menjadikannya posisi terakhir. */
export function markRead(all, id, section, now = Date.now()) {
  const e = entryOf(all, id)
  const visited = READ_SECTIONS.includes(section) && !e.visited.includes(section) ? [...e.visited, section] : e.visited
  return { ...all, [id]: { ...e, visited, last: { section, at: now } } }
}

/** Mencatat satu percobaan kuis: jumlah percobaan, skor terbaik, lulus, dan hasil terakhir. */
export function recordKuis(all, id, hasil, now = Date.now()) {
  const e = entryOf(all, id)
  const better = !e.kuis.best || hasil.persen > e.kuis.best.persen
  return {
    ...all,
    [id]: {
      ...e,
      kuis: {
        attempts: e.kuis.attempts + 1,
        best: better ? { skor: hasil.skor, total: hasil.total, persen: hasil.persen } : e.kuis.best,
        passed: e.kuis.passed || hasil.lulus,
        hasil: { ...hasil, at: now },
      },
    },
  }
}

/** Persen kemajuan 0 sampai 100: bagian dibaca ditambah kuis lulus, dari 8 bagian. */
export function percent(entry) {
  const done = entry.visited.length + (entry.kuis.passed ? 1 : 0)
  return Math.round((done / sections.length) * 100)
}

/** 'belum' (belum ada kemajuan), 'sedang', atau 'selesai' (semua bagian dibaca dan kuis lulus). */
export function status(entry) {
  const p = percent(entry)
  return p === 0 ? 'belum' : p >= 100 ? 'selesai' : 'sedang'
}

/** Modul yang terakhir dibuka dan belum selesai, untuk kartu "Lanjutkan belajar". */
export function lastOpened(all) {
  const rows = Object.entries(all)
    .filter(([, e]) => e.last && status(e) !== 'selesai')
    .sort((a, b) => b[1].last.at - a[1].last.at)
  return rows[0] ? { id: rows[0][0], entry: rows[0][1] } : null
}

/** "2 jam lalu", "3 hari lalu", atau "baru saja". */
export function timeAgo(then, now = Date.now()) {
  const s = Math.max(0, Math.round((now - then) / 1000))
  if (s < 60) return 'baru saja'
  const m = Math.round(s / 60)
  if (m < 60) return `${m} menit lalu`
  const h = Math.round(m / 60)
  if (h < 24) return `${h} jam lalu`
  return `${Math.round(h / 24)} hari lalu`
}

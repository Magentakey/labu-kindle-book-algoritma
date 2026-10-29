// Catatan hari belajar untuk streak. Disimpan di perangkat (tanpa akun); satu hari dihitung bila ada bagian modul
// dibaca atau kuis dikerjakan pada hari itu (menurut zona waktu perangkat).

export const AKTIVITAS_KEY = 'labu-aktivitas'
const MAKS_HARI = 400

/** Tanggal lokal "2026-10-30" untuk sebuah waktu (ms). */
export function hariKey(ms) {
  const d = new Date(ms)
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/
const keyToDay = (k) => Math.round(Date.UTC(+k.slice(0, 4), +k.slice(5, 7) - 1, +k.slice(8, 10)) / 86400000)

/** Membaca daftar hari (urut naik, tanpa duplikat). Data rusak diabaikan. @returns {string[]} */
export function readHari(storage) {
  try {
    const raw = JSON.parse(storage?.getItem(AKTIVITAS_KEY) ?? '[]')
    if (!Array.isArray(raw)) return []
    return [...new Set(raw.filter((k) => typeof k === 'string' && DAY_RE.test(k)))].sort()
  } catch {
    return []
  }
}

export function writeHari(storage, hari) {
  try {
    storage?.setItem(AKTIVITAS_KEY, JSON.stringify(hari))
  } catch {
    // penyimpanan tidak tersedia: streak hanya berlaku selama halaman terbuka
  }
}

/** Menambahkan hari dari waktu `now`. Mengembalikan larik yang sama bila hari itu sudah tercatat. */
export function tambahHari(hari, now = Date.now()) {
  const k = hariKey(now)
  if (hari.includes(k)) return hari
  return [...hari, k].sort().slice(-MAKS_HARI)
}

/** Panjang rangkaian hari berturut-turut yang berakhir pada indeks `end` (hari terurut). */
function runEndingAt(hari, end) {
  let n = 1
  for (let i = end; i > 0 && keyToDay(hari[i]) - keyToDay(hari[i - 1]) === 1; i--) n++
  return n
}

/**
 * Streak sekarang: rangkaian hari berturut-turut yang berakhir hari ini atau kemarin (kemarin masih dihitung
 * agar streak tidak tampak putus sebelum pengguna sempat belajar hari ini). `hariIni` = apakah hari ini sudah tercatat.
 */
export function streakSekarang(hari, now = Date.now()) {
  if (hari.length === 0) return { hari: 0, hariIni: false }
  const today = hariKey(now)
  const last = hari[hari.length - 1]
  const selisih = keyToDay(today) - keyToDay(last)
  if (selisih > 1 || selisih < 0) return { hari: 0, hariIni: false }
  return { hari: runEndingAt(hari, hari.length - 1), hariIni: selisih === 0 }
}

/** Rangkaian terpanjang sepanjang catatan. */
export function rekorStreak(hari) {
  let best = 0
  for (let i = 0; i < hari.length; i++) best = Math.max(best, runEndingAt(hari, i))
  return best
}

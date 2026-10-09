export const MAX_LENGTH = 8
export const MIN_VALUE = -99
export const MAX_VALUE = 99

/**
 * Membaca teks isian pengguna menjadi array bilangan bulat.
 * @param {string} text  contoh: "5, 2, 4" atau "5 2 4"
 * @returns {{ ok: true, values: number[] } | { ok: false, error: string }}
 */
export function parseArrayInput(text) {
  const raw = String(text).trim()
  if (raw === '') return { ok: false, error: 'Isi minimal satu angka.' }

  const parts = raw.split(/[\s,;]+/).filter(Boolean)
  if (parts.length === 0) return { ok: false, error: 'Isi minimal satu angka.' }
  const values = []
  for (const p of parts) {
    if (!/^-?\d+$/.test(p)) {
      return { ok: false, error: `"${p}" bukan bilangan bulat. Pisahkan angka dengan koma.` }
    }
    const v = Number(p)
    if (v < MIN_VALUE || v > MAX_VALUE) {
      return { ok: false, error: `Angka ${p} di luar rentang ${MIN_VALUE} sampai ${MAX_VALUE}.` }
    }
    values.push(v)
  }
  if (values.length > MAX_LENGTH) {
    return { ok: false, error: `Maksimal ${MAX_LENGTH} angka (Anda mengisi ${values.length}).` }
  }
  return { ok: true, values }
}

/**
 * Membuat array acak berisi bilangan bulat 1 sampai 20.
 * @param {number} [length]
 * @param {() => number} [rng]  fungsi acak [0,1), bisa diganti saat tes
 */
export function randomArray(length = 6, rng = Math.random) {
  return Array.from({ length }, () => 1 + Math.floor(rng() * 20))
}
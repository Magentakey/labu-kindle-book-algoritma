// Logika tema terang/gelap (murni, bisa dites). Tampilannya diatur oleh src/styles/tokens.css lewat data-theme di <html>.
// Skrip kecil di index.html memakai kunci dan aturan yang sama agar halaman tidak berkedip saat dimuat.

export const THEME_KEY = 'labu-theme'
export const PREFERENCES = ['system', 'light', 'dark']

/** Membaca pilihan tersimpan. Nilai selain 'light' dan 'dark' dianggap 'system' (ikuti perangkat). */
export function readPreference(storage) {
  try {
    const v = storage?.getItem(THEME_KEY)
    return v === 'light' || v === 'dark' ? v : 'system'
  } catch {
    return 'system'
  }
}

/** Tema yang benar-benar dipakai: 'light' atau 'dark'. */
export function resolveTheme(preference, systemPrefersDark) {
  if (preference === 'light' || preference === 'dark') return preference
  return systemPrefersDark ? 'dark' : 'light'
}

/** Tombol bulan/matahari selalu berpindah ke kebalikan dari tema yang sedang tampil, dan menjadikannya pilihan tetap. */
export function oppositeTheme(resolved) {
  return resolved === 'dark' ? 'light' : 'dark'
}

/** Menyimpan pilihan. 'system' menghapus pilihan tersimpan. */
export function writePreference(storage, preference) {
  try {
    if (preference === 'light' || preference === 'dark') storage?.setItem(THEME_KEY, preference)
    else storage?.removeItem(THEME_KEY)
  } catch {
    // penyimpanan tidak tersedia (mode privat): pilihan hanya berlaku selama halaman terbuka
  }
}

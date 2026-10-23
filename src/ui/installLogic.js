// Banner "Pasang LABU": setelah pengguna menekan "Nanti", banner tidak muncul lagi selama beberapa hari.
export const INSTALL_DISMISS_KEY = 'labu-pasang-ditunda'
export const INSTALL_DISMISS_DAYS = 14
const DAY = 24 * 60 * 60 * 1000

/** True bila banner masih ditunda (belum lewat INSTALL_DISMISS_DAYS sejak "Nanti"). */
export function isInstallDismissed(storage, now = Date.now()) {
  try {
    const t = Number(storage?.getItem(INSTALL_DISMISS_KEY))
    return Number.isFinite(t) && t > 0 && now - t < INSTALL_DISMISS_DAYS * DAY && now >= t
  } catch {
    return false
  }
}

export function dismissInstall(storage, now = Date.now()) {
  try {
    storage?.setItem(INSTALL_DISMISS_KEY, String(now))
  } catch {
    // penyimpanan tidak tersedia: banner hanya tertutup selama halaman terbuka
  }
}

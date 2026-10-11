import { useCallback, useState, useSyncExternalStore } from 'react'
import { sidebarPref } from '../../lib/uiPrefs.js'

/** Layar lebar (Tailwind `lg`): sidebar menempel di kiri. Di bawahnya sidebar menjadi laci yang menutupi halaman. */
export const DESKTOP_QUERY = '(min-width: 1024px)'

function subscribe(onChange) {
  const mq = window.matchMedia(DESKTOP_QUERY)
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}

/** @returns {boolean} true bila layar selebar desktop (ikut berubah saat layar diputar atau jendela diubah) */
export function useIsDesktop() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => false,
  )
}

/**
 * Status buka/tutup sidebar.
 * Awalnya terbuka di layar lebar (kecuali pengguna terakhir menyembunyikannya) dan tertutup di layar sempit.
 * Pilihan pengguna di layar lebar diingat; di layar sempit laci selalu mulai tertutup.
 */
export function useSidebar() {
  const desktop = useIsDesktop()
  const [open, setOpenState] = useState(() => window.matchMedia(DESKTOP_QUERY).matches && !sidebarPref.wasHidden())
  const setOpen = useCallback(
    (next) => {
      setOpenState(next)
      if (desktop) sidebarPref.remember(next)
    },
    [desktop],
  )
  return { open, setOpen, desktop }
}

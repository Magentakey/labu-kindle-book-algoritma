import { useSyncExternalStore } from 'react'
import { oppositeTheme, readPreference, resolveTheme, writePreference } from './theme.js'

// Satu penyimpanan bersama agar semua komponen (tombol tema di header dan HP) selalu sinkron.
const media = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null
let preference = typeof window !== 'undefined' ? readPreference(window.localStorage) : 'system'
const listeners = new Set()

const resolved = () => resolveTheme(preference, Boolean(media?.matches))

function apply() {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.theme = resolved()
}

function emit() {
  apply()
  listeners.forEach((l) => l())
}

media?.addEventListener?.('change', () => {
  if (preference === 'system') emit()
})

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** @returns {{ theme: 'light' | 'dark', preference: 'system' | 'light' | 'dark', toggle: () => void, setPreference: (p: string) => void }} */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, resolved, () => 'light')
  return {
    theme,
    preference,
    toggle: () => {
      preference = oppositeTheme(resolved())
      writePreference(window.localStorage, preference)
      emit()
    },
    setPreference: (p) => {
      preference = p
      writePreference(window.localStorage, p)
      emit()
    },
  }
}

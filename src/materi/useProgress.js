import { useSyncExternalStore } from 'react'
import { entryOf, markRead as markReadPure, readAll, recordKuis as recordKuisPure, writeAll } from '../lib/progress.js'

// Satu penyimpanan bersama: daftar Materi, halaman modul, dan Credit selalu membaca data yang sama.
const storage = typeof window !== 'undefined' ? window.localStorage : undefined
let all = readAll(storage)
const listeners = new Set()

function commit(next) {
  all = next
  writeAll(storage, all)
  listeners.forEach((l) => l())
}

const subscribe = (l) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

/** Menandai bagian dibaca. Tidak menyimpan ulang bila bagian itu sudah menjadi posisi terakhir. */
export function markRead(id, section) {
  const e = entryOf(all, id)
  if (e.last?.section === section && e.visited.includes(section)) return
  commit(markReadPure(all, id, section))
}

export function recordKuis(id, hasil) {
  commit(recordKuisPure(all, id, hasil))
}

/** @returns {ReturnType<typeof readAll>} */
export const useProgress = () => useSyncExternalStore(subscribe, () => all, () => all)

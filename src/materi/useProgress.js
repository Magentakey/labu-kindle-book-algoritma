import { useSyncExternalStore } from 'react'
import { readHari, tambahHari, writeHari } from '../lib/aktivitas.js'
import { entryOf, markRead as markReadPure, markReadMany as markReadManyPure, readAll, recordKuis as recordKuisPure, writeAll } from '../lib/progress.js'

// Satu penyimpanan bersama: daftar Materi, halaman modul, dan Credit selalu membaca data yang sama.
const storage = typeof window !== 'undefined' ? window.localStorage : undefined
let all = readAll(storage)
const listeners = new Set()

// Hari belajar untuk streak: tercatat setiap kali ada kemajuan (bagian dibaca atau kuis dikerjakan).
let hari = readHari(storage)

function commit(next) {
  all = next
  writeAll(storage, all)
  const baru = tambahHari(hari)
  if (baru !== hari) {
    hari = baru
    writeHari(storage, hari)
  }
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

/** Menandai semua bagian yang sudah dicapai atau dilewati (urut dari atas) sebagai dibaca; `terakhir` jadi posisi terakhir. */
export function markSeen(id, terakhir, dilihat) {
  const next = markReadManyPure(all, id, dilihat, terakhir)
  if (next !== all) commit(next)
}

export function recordKuis(id, hasil) {
  commit(recordKuisPure(all, id, hasil))
}

/** @returns {ReturnType<typeof readAll>} */
export const useProgress = () => useSyncExternalStore(subscribe, () => all, () => all)

/** Daftar hari belajar (urut naik) untuk menghitung streak. @returns {string[]} */
export const useHariBelajar = () => useSyncExternalStore(subscribe, () => hari, () => hari)

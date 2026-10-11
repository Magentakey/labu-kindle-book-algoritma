import { useEffect, useState } from 'react'

/** Garis acuan dari atas layar: judul yang sudah melewatinya dianggap "sedang dibaca". */
const READING_LINE = 0.3

/**
 * Menentukan bagian mana yang sedang dibaca, dari posisi gulir.
 * Elemen dicari lewat id saat gulir terjadi, karena isi halaman dimuat bertahap.
 * @param {string[]} ids  id judul, berurutan dari atas halaman
 * @returns {string | null}
 */
export function useActiveSection(ids) {
  const key = ids.join('|')
  const [active, setActive] = useState(null)

  useEffect(() => {
    const list = key ? key.split('|') : []
    if (list.length === 0) return undefined
    let frame = 0

    const update = () => {
      frame = 0
      const line = window.innerHeight * READING_LINE
      let current = list[0]
      let lastFound = null
      for (const id of list) {
        const el = document.getElementById(id)
        if (!el) continue
        lastFound = id
        if (el.getBoundingClientRect().top <= line) current = id
      }
      // Di dasar halaman, bagian terakhir (yang sering terlalu pendek untuk mencapai garis) dianggap aktif.
      if (lastFound && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        current = lastFound
      }
      setActive(current)
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    schedule()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    // Tinggi halaman berubah saat visualizer dan editor selesai dimuat.
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule)
    observer?.observe(document.body)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      observer?.disconnect()
    }
  }, [key])

  return active
}

import { useEffect, useState } from 'react'

const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/** Garis baca: sebuah bagian dianggap sudah dicapai bila ujung atasnya sudah naik sampai garis ini (di bawah bar yang menempel). */
export const GARIS_BACA = 170
const UJUNG_BAWAH = 4 // toleransi piksel untuk "sudah sampai dasar halaman"

/**
 * Bagian yang sedang dibaca (yang paling dekat di bawah bar atas), persen gulir halaman, dan `dilihat`: semua bagian yang sudah
 * dicapai atau dilewati. Bagian pendek di dasar halaman tidak pernah bisa naik sampai garis baca, jadi sampai di dasar halaman
 * berarti semua bagian yang ada sudah dilihat.
 */
export function useScrollSpy(ids) {
  const [state, setState] = useState({ aktif: ids[0], baca: 0, dilihat: [] })
  useEffect(() => {
    let frame = 0
    const hitung = () => {
      frame = 0
      let aktif = ids[0]
      const max = document.documentElement.scrollHeight - window.innerHeight
      const diDasar = max - window.scrollY <= UJUNG_BAWAH
      const dilihat = []
      for (const id of ids) {
        const el = document.getElementById(`sec-${id}`)
        if (!el) continue
        const dicapai = el.getBoundingClientRect().top <= GARIS_BACA
        if (dicapai) aktif = id
        if (dicapai || diDasar) dilihat.push(id)
      }
      const baca = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0
      setState((s) => (s.aktif === aktif && s.dilihat.length === dilihat.length && Math.abs(s.baca - baca) < 0.5 ? s : { aktif, baca, dilihat }))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(hitung)
    }
    hitung()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [ids])
  return state
}

export const gulirKe = (id) => document.getElementById(`sec-${id}`)?.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' })


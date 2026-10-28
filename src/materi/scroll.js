import { useEffect, useState } from 'react'

const reduced = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

/** Bagian yang sedang dibaca (yang paling dekat di bawah bar atas) dan persen gulir halaman. */
export function useScrollSpy(ids) {
  const [state, setState] = useState({ aktif: ids[0], baca: 0 })
  useEffect(() => {
    let frame = 0
    const hitung = () => {
      frame = 0
      let aktif = ids[0]
      for (const id of ids) {
        const el = document.getElementById(`sec-${id}`)
        if (el && el.getBoundingClientRect().top <= 170) aktif = id
      }
      const max = document.documentElement.scrollHeight - window.innerHeight
      const baca = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0
      setState((s) => (s.aktif === aktif && Math.abs(s.baca - baca) < 0.5 ? s : { aktif, baca }))
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


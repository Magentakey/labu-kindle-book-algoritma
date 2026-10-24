import { useCallback, useEffect, useState } from 'react'
import { SPEED_STOPS, clampIndex, delayFor } from './playerLogic.js'

/**
 * Pemutar langkah untuk visualizer. Mode "otomatis" berjalan sendiri sesuai kecepatan dan berhenti di langkah terakhir;
 * mode "frame" tidak pernah berjalan sendiri (hanya maju/mundur manual). Berpindah langkah manual menghentikan putar otomatis.
 * @param {number} total banyak langkah
 */
export function usePlayer(total) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [mode, setModeState] = useState('otomatis')
  const last = Math.max(total - 1, 0)
  const i = clampIndex(index, total)
  const atEnd = i >= last
  const running = playing && mode === 'otomatis' && !atEnd

  useEffect(() => {
    if (!running) return undefined
    const t = setTimeout(() => setIndex((n) => Math.min(n + 1, last)), delayFor(speed))
    return () => clearTimeout(t)
  }, [running, i, speed, last])

  const jump = useCallback((n) => {
    setPlaying(false)
    setIndex(clampIndex(n, total))
  }, [total])
  const toggle = useCallback(() => {
    if (mode !== 'otomatis') return
    if (running) setPlaying(false)
    else {
      if (atEnd) setIndex(0)
      setPlaying(true)
    }
  }, [mode, running, atEnd])
  const reset = useCallback(() => {
    setIndex(0)
    setPlaying(false)
  }, [])
  const setMode = useCallback((m) => {
    setModeState(m)
    if (m !== 'otomatis') setPlaying(false)
  }, [])

  return { index: i, last, total, atStart: i <= 0, atEnd, running, speed, setSpeed, speedStops: SPEED_STOPS, mode, setMode, jump, toggle, reset }
}

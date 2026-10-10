import { useEffect, useState } from 'react'

// Jeda antar langkah saat putar otomatis (milidetik).
export const SPEEDS = [
  { key: 'slow', label: 'Lambat', ms: 1600 },
  { key: 'normal', label: 'Normal', ms: 900 },
  { key: 'fast', label: 'Cepat', ms: 400 },
]

/**
 * Status pemutar langkah (sebelumnya/berikutnya/slider/putar otomatis) untuk daftar `steps`.
 * Perilakunya sama dengan AlgoVisualizer: navigasi manual menghentikan putar otomatis,
 * dan putar otomatis berhenti sendiri di langkah terakhir.
 * @param {Array<{ note: string }>} steps
 */
export function useStepPlayer(steps) {
  const [no, setNo] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState('normal')
  const [pauseNote, setPauseNote] = useState('')

  const last = steps.length - 1
  const index = Math.min(no, last)
  const atStart = index <= 0
  const atEnd = index >= last
  // `playing` = niat pengguna; `running` = benar-benar berjalan.
  const running = playing && !atEnd
  const delay = SPEEDS.find((x) => x.key === speed).ms

  useEffect(() => {
    if (!running) return
    const timer = setTimeout(() => setNo((n) => Math.min(n + 1, last)), delay)
    return () => clearTimeout(timer)
  }, [running, index, delay, last])

  function jump(n) {
    setPlaying(false)
    setPauseNote('')
    setNo(Math.min(Math.max(n, 0), last))
  }

  function toggle() {
    if (running) {
      setPlaying(false)
      setPauseNote(`Dijeda di langkah ${index + 1} dari ${steps.length}. ${steps[index].note}`)
      return
    }
    if (atEnd) setNo(0)
    setPauseNote('')
    setPlaying(true)
  }

  /** Kembali ke langkah 1, misalnya setelah masukan diganti. */
  function reset(note = '') {
    setNo(0)
    setPlaying(false)
    setPauseNote(note)
  }

  let status = pauseNote
  if (running) status = 'Putar otomatis berjalan.'
  else if (playing && atEnd) status = 'Putar otomatis selesai di langkah terakhir.'

  return { index, last, total: steps.length, atStart, atEnd, running, speed, setSpeed, status, jump, toggle, reset }
}

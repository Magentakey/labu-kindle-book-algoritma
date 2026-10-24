// Logika murni pemutar langkah visualizer (Figma: Kontrol). Kecepatan 0,25× sampai 4×, dua mode: Otomatis dan Frame-by-frame.
export const SPEED_STOPS = [0.25, 0.5, 1, 2, 4]
export const BASE_DELAY_MS = 800
export const MODES = [
  { id: 'otomatis', label: 'Otomatis' },
  { id: 'frame', label: 'Frame-by-frame' },
]

/** Jeda antar langkah (ms) untuk kecepatan tertentu: makin cepat makin singkat. */
export const delayFor = (speed) => Math.round(BASE_DELAY_MS / speed)

export const clampIndex = (i, total) => Math.min(Math.max(i, 0), Math.max(total - 1, 0))

/** Teks kecepatan, mis. 0.25 → "0,25×", 1 → "1×". */
export const speedLabel = (speed) => `${String(speed).replace('.', ',')}×`

/** Teks status di bilah kontrol HP: "23 / 41 · 1× · Otomatis". */
export const compactStatus = ({ index, total, speed, mode }) => `${index + 1} / ${total} · ${speedLabel(speed)} · ${MODES.find((m) => m.id === mode)?.label ?? ''}`

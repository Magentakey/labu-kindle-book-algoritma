import { scanLines } from './markdownLines.js'

/** Penanda yang boleh ditulis penulis materi, masing-masing di barisnya sendiri. */
export const MARKERS = {
  '::visualizer': 'visualizer',
  '::challenge': 'challenge',
}

/**
 * Memecah teks materi menjadi urutan bagian halaman:
 * teks, visualizer, teks, challenge (sesuai mockup 1).
 *
 * - Penanda hanya dihitung bila materi memang punya fiturnya (hasVisualizer / hasChallenge).
 * - Penanda ganda: hanya yang pertama dipakai.
 * - Fitur tanpa penanda ditempatkan otomatis: visualizer setelah teks, challenge paling akhir.
 * - Penanda di dalam blok kode tidak dianggap penanda.
 *
 * @param {string} source
 * @param {{ hasVisualizer?: boolean, hasChallenge?: boolean }} [features]
 * @returns {Array<{ type: 'markdown', text: string } | { type: 'visualizer' } | { type: 'challenge' }>}
 */
export function splitContent(source, { hasVisualizer = false, hasChallenge = false } = {}) {
  const allowed = { visualizer: hasVisualizer, challenge: hasChallenge }
  const { lines } = scanLines(source)
  const segments = []
  const placed = new Set()
  let buffer = []

  const flush = () => {
    const text = buffer.join('\n').trim()
    if (text) segments.push({ type: 'markdown', text })
    buffer = []
  }

  for (const line of lines) {
    const type = !line.inFence ? MARKERS[line.text.trim()] : undefined
    if (!type) {
      buffer.push(line.text)
      continue
    }
    if (!allowed[type] || placed.has(type)) continue // dibuang
    flush()
    segments.push({ type })
    placed.add(type)
  }
  flush()

  if (hasVisualizer && !placed.has('visualizer')) {
    const at = segments.findIndex((s) => s.type === 'challenge')
    if (at === -1) segments.push({ type: 'visualizer' })
    else segments.splice(at, 0, { type: 'visualizer' })
  }
  if (hasChallenge && !placed.has('challenge')) segments.push({ type: 'challenge' })

  return segments
}

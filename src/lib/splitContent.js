import { scanLines } from './markdownLines.js'
import { parseRatioArgs } from './ratio.js'
import { parseBoundArgs } from './boundCheck.js'
import { parseLimitArgs } from './limitCheck.js'

/**
 * Penanda satu baris untuk fitur halaman (tanpa argumen). Tetap diekspor untuk pemeriksa aturan penulisan.
 */
export const MARKERS = {
  '::visualizer': 'visualizer',
  '::challenge': 'challenge',
}

/**
 * Komponen berisi (blok): dibuka dengan `:::nama judul` dan ditutup dengan `:::`.
 * `item` = penanda yang memisahkan isi blok menjadi bagian-bagian (slide, tab, pertanyaan).
 */
export const CONTAINERS = {
  steps: { item: 'slide', label: 'slide' },
  tabs: { item: 'tab', label: 'tab' },
  reveal: { item: null, label: null },
  quiz: { item: 'question', label: 'pertanyaan' },
}

/** Penanda satu baris dengan argumen, boleh dipakai di mana saja (juga di dalam blok). */
export const LEAF_MARKERS = ['growth', 'trace', 'ratio', 'bound', 'limit']

const OPEN = /^:::\s*([a-z]+)\b\s*(.*)$/
const MARKER = /^::([a-z]+)(?!:)\b\s*(.*)$/

/**
 * Menguraikan satu baris (sudah di-trim) menjadi petunjuk:
 *  `:::` → tutup blok, `:::nama judul` → buka blok, `::nama argumen` → penanda, selain itu null.
 * @param {string} trimmed
 * @returns {{ kind: 'close' } | { kind: 'open', name: string, args: string } | { kind: 'marker', name: string, args: string } | null}
 */
export function parseDirective(trimmed) {
  if (trimmed === ':::') return { kind: 'close' }
  const open = OPEN.exec(trimmed)
  if (open) return { kind: 'open', name: open[1], args: open[2].trim() }
  if (trimmed.startsWith(':::')) return null
  const marker = MARKER.exec(trimmed)
  if (marker) return { kind: 'marker', name: marker[1], args: marker[2].trim() }
  return null
}

const directiveOf = (line) => (line.inFence ? null : parseDirective(line.text.trim()))

function leafSegment(d) {
  if (d.name === 'growth') {
    const keys = d.args ? d.args.split(',').map((k) => k.trim()).filter(Boolean) : null
    return { type: 'growth', keys }
  }
  if (d.name === 'ratio') {
    const { keys, n1, n2 } = parseRatioArgs(d.args)
    return { type: 'ratio', keys, n1, n2 }
  }
  if (d.name === 'bound') {
    const { notation, coefs, g, consts } = parseBoundArgs(d.args)
    return { type: 'bound', notation, coefs, g, consts }
  }
  if (d.name === 'limit') {
    const { f, g, c } = parseLimitArgs(d.args)
    return { type: 'limit', f, g, c }
  }
  return { type: 'trace', id: d.args }
}

/** Isi item/blok: teks Markdown dan penanda satu baris (growth, trace, ratio, bound, limit). */
function parseInline(lines) {
  const segments = []
  let buffer = []
  const flush = () => {
    const text = buffer.join('\n').trim()
    if (text) segments.push({ type: 'markdown', text })
    buffer = []
  }
  for (const line of lines) {
    const d = directiveOf(line)
    if (d?.kind === 'marker' && LEAF_MARKERS.includes(d.name)) {
      flush()
      segments.push(leafSegment(d))
    } else {
      buffer.push(line.text)
    }
  }
  flush()
  return segments
}

function splitItems(body, itemName) {
  const items = []
  let current = null
  for (const line of body) {
    const d = directiveOf(line)
    if (d?.kind === 'marker' && d.name === itemName) {
      current = { title: d.args, lines: [] }
      items.push(current)
    } else if (current) {
      current.lines.push(line)
    }
  }
  return items.map((it) => ({ title: it.title, segments: parseInline(it.lines) }))
}

const OPTION = /^\s*[-*]\s+\[( |x|X)\]\s+(.*)$/

function parseQuiz(body) {
  const questions = []
  let current = null
  let explaining = false
  for (const line of body) {
    const d = directiveOf(line)
    if (d?.kind === 'marker' && d.name === 'question') {
      current = { prompt: d.args, options: [], explanationLines: [] }
      questions.push(current)
      explaining = false
      continue
    }
    if (!current) continue
    if (d?.kind === 'marker' && d.name === 'explain') {
      explaining = true
      if (d.args) current.explanationLines.push(d.args)
      continue
    }
    if (explaining) {
      current.explanationLines.push(line.text)
      continue
    }
    const m = OPTION.exec(line.text)
    if (m) current.options.push({ text: m[2].trim(), correct: m[1].toLowerCase() === 'x' })
  }
  return questions.map((q) => ({ prompt: q.prompt, options: q.options, explanation: q.explanationLines.join('\n').trim() }))
}

function buildContainer({ name, args, body }) {
  if (name === 'reveal') return { type: 'reveal', title: args, segments: parseInline(body) }
  if (name === 'quiz') return { type: 'quiz', title: args, questions: parseQuiz(body) }
  return { type: name, title: args, items: splitItems(body, CONTAINERS[name].item) }
}

/**
 * Memecah teks materi menjadi urutan bagian halaman.
 *
 * Bagian bertipe: markdown, visualizer, challenge, growth, trace, dan blok steps / tabs / reveal / quiz.
 *
 * - `::visualizer` dan `::challenge` hanya dihitung bila materi memang punya fiturnya (hasVisualizer / hasChallenge).
 * - Penanda ganda: hanya yang pertama dipakai.
 * - Fitur tanpa penanda ditempatkan otomatis: visualizer setelah teks, challenge paling akhir.
 * - Penanda dan blok di dalam blok kode tidak dianggap.
 * - Blok yang tidak ditutup berlangsung sampai akhir file (pemeriksa aturan melaporkannya sebagai error).
 * - Blok tidak boleh bersarang; baris `:::nama` di dalam blok dianggap isi biasa.
 *
 * @param {string} source
 * @param {{ hasVisualizer?: boolean, hasChallenge?: boolean }} [features]
 */
export function splitContent(source, { hasVisualizer = false, hasChallenge = false } = {}) {
  const allowed = { visualizer: hasVisualizer, challenge: hasChallenge }
  const { lines } = scanLines(source)
  const segments = []
  const placed = new Set()
  let buffer = []
  let box = null

  const flush = () => {
    const text = buffer.join('\n').trim()
    if (text) segments.push({ type: 'markdown', text })
    buffer = []
  }

  for (const line of lines) {
    const d = directiveOf(line)

    if (box) {
      if (d?.kind === 'close') {
        segments.push(buildContainer(box))
        box = null
      } else {
        box.body.push(line)
      }
      continue
    }

    if (d?.kind === 'open' && CONTAINERS[d.name]) {
      flush()
      box = { name: d.name, args: d.args, body: [] }
      continue
    }

    if (d?.kind === 'marker') {
      const type = MARKERS[`::${d.name}`]
      if (type && d.args === '') {
        if (!allowed[type] || placed.has(type)) continue // dibuang
        flush()
        segments.push({ type })
        placed.add(type)
        continue
      }
      if (LEAF_MARKERS.includes(d.name)) {
        flush()
        segments.push(leafSegment(d))
        continue
      }
    }

    buffer.push(line.text)
  }
  if (box) segments.push(buildContainer(box))
  flush()

  if (hasVisualizer && !placed.has('visualizer')) {
    const at = segments.findIndex((s) => s.type === 'challenge')
    if (at === -1) segments.push({ type: 'visualizer' })
    else segments.splice(at, 0, { type: 'visualizer' })
  }
  if (hasChallenge && !placed.has('challenge')) segments.push({ type: 'challenge' })

  return segments
}

import { scanLines } from './markdownLines.js'

// Daftar isi sidebar materi.
//
// Sumbernya hanya materi yang sedang dibuka: judul `##` (tingkat 2) dan `###` (tingkat 3) di teks
// Markdown, ditambah bagian halaman "Visualisasi" dan "Soal Challenge" bila materi memilikinya.
// Judul di dalam blok (tabs, steps, quiz, reveal) tidak ikut karena bukan bagian utama halaman.

/** Penanda "id" yang aman dipakai di HTML dan tetap terbaca (huruf Yunani, aksen, dsb. dipertahankan). */
export function slugify(text) {
  const slug = String(text ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'bagian'
}

/**
 * Id unik untuk deretan judul dalam satu potongan Markdown.
 * Dipakai bersama oleh daftar isi dan plugin yang memberi id pada judul, supaya keduanya selalu sama.
 * @param {string[]} texts  teks polos tiap judul, berurutan
 * @param {string} prefix   awalan unik per potongan (mis. "b0"), mencegah id kembar antarpotongan
 */
export function headingIds(texts, prefix) {
  const seen = new Map()
  return texts.map((text) => {
    const base = `${prefix}-${slugify(text)}`
    const n = (seen.get(base) ?? 0) + 1
    seen.set(base, n)
    return n === 1 ? base : `${base}-${n}`
  })
}

/** Membuang sintaks Markdown sebaris dari teks judul: tautan, tebal/miring, kode, dan # penutup. */
export function plainHeadingText(raw) {
  return String(raw ?? '')
    .replace(/\s+#+\s*$/, '')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[`*]/g, '')
    // Garis bawah hanya penanda miring bila di tepi kata; di tengah kata (MERGE_SORT) ia bagian dari teks, seperti di CommonMark.
    .replace(/(^|[^\p{L}\p{N}])_+|_+(?=[^\p{L}\p{N}]|$)/gu, '$1')
    .replace(/\\(.)/g, '$1')
    .trim()
}

const ATX = /^ {0,3}(#{1,3})\s+(.+?)\s*$/

/**
 * Judul tingkat 1 sampai 3 di teks Markdown (di luar blok kode), dengan tingkat sama seperti tampilan:
 * `#` dan `##` sama-sama tampil sebagai tingkat 2, `###` tingkat 3.
 * @returns {{ level: 2 | 3, text: string }[]}
 */
export function markdownHeadings(markdown) {
  const out = []
  for (const line of scanLines(markdown).lines) {
    if (line.inFence) continue
    const m = ATX.exec(line.text)
    if (!m) continue
    const text = plainHeadingText(m[2])
    if (text) out.push({ level: m[1].length === 3 ? 3 : 2, text })
  }
  return out
}

/**
 * @typedef {Object} TocItem
 * @property {string} id
 * @property {string} text
 * @property {2 | 3} level
 * @property {'text' | 'visualizer' | 'challenge'} kind
 */

/**
 * Menyusun daftar isi dari bagian halaman hasil splitContent().
 * @param {{ type: string, text?: string }[]} segments
 * @param {{ visualizers?: { id: string, title?: string }[] }} [options]
 *   `visualizers`: visualizer materi ini. Bila lebih dari satu dan punya judul, masing-masing jadi anak "Visualisasi".
 * @returns {TocItem[]}
 */
export function buildToc(segments, { visualizers = [] } = {}) {
  /** @type {TocItem[]} */
  const items = []
  segments.forEach((seg, i) => {
    if (seg.type === 'markdown') {
      const found = markdownHeadings(seg.text)
      const ids = headingIds(
        found.map((h) => h.text),
        `b${i}`,
      )
      found.forEach((h, n) => items.push({ id: ids[n], text: h.text, level: h.level, kind: 'text' }))
    } else if (seg.type === 'visualizer') {
      items.push({ id: 'sec-visual', text: 'Visualisasi', level: 2, kind: 'visualizer' })
      if (visualizers.length > 1) {
        for (const v of visualizers) {
          if (v.title) items.push({ id: `vis-${v.id}`, text: v.title, level: 3, kind: 'visualizer' })
        }
      }
    } else if (seg.type === 'challenge') {
      items.push({ id: 'sec-soal', text: 'Soal Challenge', level: 2, kind: 'challenge' })
    }
  })
  return items
}

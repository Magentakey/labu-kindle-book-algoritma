import { scanLines } from './markdownLines.js'
import { MARKERS } from './splitContent.js'
import { SUPPORTED_LANGUAGES, isKnownLanguage } from './codeLanguages.js'

/**
 * @typedef {Object} Issue
 * @property {number} line
 * @property {'error'|'warning'} severity
 * @property {string} rule
 * @property {string} message
 */

const HEADING = /^ {0,3}(#{1,6})(?=\s|$)\s*(.*?)\s*$/
const TABLE_DELIMITER = /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/
const BOLD_ONLY_LINE = /^\s*(\*\*|__)[^*_]+(\*\*|__)\s*:?\s*$/
const RAW_HTML = /<\/?[a-zA-Z][\w-]*(\s[^>]*)?\/?>/
const LATEX = /\$\$|\\\(|\\\[|\\(frac|sum|Theta|Omega|theta|omega|cdot|infty|lim|leq|geq)\b/
const VAGUE_LINK = /^(klik|klik di sini|klik disini|di sini|disini|link|tautan|here|click here|baca selengkapnya|selengkapnya)$/i

const withoutInlineCode = (text) => text.replace(/`[^`]*`/g, '')

/**
 * Memeriksa satu file materi terhadap aturan penulisan di docs/panduan-menulis-materi.md.
 * Error = akan merusak tampilan atau aksesibilitas (npm test gagal).
 * Warning = sebaiknya diperbaiki, tetapi halaman tetap berfungsi.
 *
 * @param {string} md
 * @returns {Issue[]}
 */
export function checkMarkdown(md) {
  const { lines, unclosedFenceLine } = scanLines(md)
  /** @type {Issue[]} */
  const issues = []
  const add = (line, severity, rule, message) => issues.push({ line, severity, rule, message })

  let lastLevel = 1 // judul halaman (h1) sudah dipakai aplikasi, jadi isi mulai dari ##
  let afterMarker = false
  const seenMarkers = new Set()

  lines.forEach((l, idx) => {
    const prev = idx > 0 ? lines[idx - 1] : null

    if (l.fence === 'open') {
      const lang = l.info.split(/\s+/)[0]
      if (!lang) {
        add(l.no, 'warning', 'code-lang', 'Blok kode tanpa nama bahasa. Tulis ```javascript, ```python, atau ```text untuk pseudocode.')
      } else if (!isKnownLanguage(lang)) {
        add(l.no, 'warning', 'code-lang-unsupported', `Bahasa "${lang}" tidak diwarnai dan akan tampil polos. Pilih salah satu: ${SUPPORTED_LANGUAGES.join(', ')}.`)
      }
    }
    if (l.inFence) return

    const text = l.text
    const trimmed = text.trim()

    // Penanda tempat visualizer / challenge
    if (trimmed.startsWith('::')) {
      const type = MARKERS[trimmed]
      if (!type) {
        add(l.no, 'error', 'marker-unknown', `Penanda "${trimmed}" tidak dikenal. Yang tersedia: ${Object.keys(MARKERS).join(', ')}.`)
      } else if (seenMarkers.has(type)) {
        add(l.no, 'error', 'marker-duplicate', `Penanda ${trimmed} sudah dipakai sebelumnya. Hanya satu per materi.`)
      } else {
        seenMarkers.add(type)
        afterMarker = true
        lastLevel = 1
      }
      return
    }

    // Judul
    const h = HEADING.exec(text)
    if (h) {
      const level = h[1].length
      const title = h[2].replace(/\s+#+\s*$/, '').trim()
      if (level === 1) {
        add(l.no, 'error', 'heading-h1', 'Jangan pakai satu "#". Judul halaman sudah dibuat aplikasi. Mulai dari "##".')
      } else if (level > lastLevel + 1) {
        add(l.no, 'error', 'heading-skip', `Tingkat judul melompat (dari ${lastLevel === 1 ? 'judul halaman' : '#'.repeat(lastLevel)} ke ${'#'.repeat(level)}). Turun satu tingkat saja per langkah.`)
      }
      if (!title) add(l.no, 'error', 'heading-empty', 'Judul kosong.')
      lastLevel = Math.max(level, 2)
      afterMarker = false
      return
    }

    if (afterMarker && trimmed) {
      add(l.no, 'warning', 'heading-after-marker', 'Teks setelah penanda sebaiknya diawali judul "##", supaya tidak terbaca sebagai bagian dari bagian Visualisasi/Soal.')
      afterMarker = false
    }

    // Judul gaya Setext (garis bawah ===)
    if (/^=+\s*$/.test(trimmed) && prev && prev.text.trim() && !prev.inFence) {
      add(l.no, 'error', 'heading-setext', 'Judul dengan garis "===" tidak didukung konsisten. Pakai "##".')
    } else if (
      /^-{2,}\s*$/.test(trimmed) && prev && prev.text.trim() && !prev.inFence &&
      !prev.text.includes('|') && !/^\s*([-*+>]|\d+[.)])\s/.test(prev.text) && !HEADING.test(prev.text)
    ) {
      add(l.no, 'error', 'heading-setext', 'Garis "---" tepat di bawah teks menjadikannya judul. Beri satu baris kosong sebelum garis, atau pakai "##".')
    }

    // Tabel: baris pemisah harus didahului baris judul kolom yang terisi
    if (text.includes('|') && TABLE_DELIMITER.test(text) && prev && prev.text.includes('|')) {
      const cells = prev.text.trim().replace(/^\|/, '').replace(/\|$/, '').split('|')
      if (cells.some((c) => !c.trim())) {
        add(prev.no, 'error', 'table-header', 'Judul kolom tabel ada yang kosong. Pembaca layar butuh nama untuk setiap kolom.')
      }
    }

    const plain = withoutInlineCode(text)

    if (BOLD_ONLY_LINE.test(plain) && prev && !prev.text.trim()) {
      add(l.no, 'warning', 'bold-as-heading', 'Teks tebal satu baris terlihat seperti judul, tetapi tidak dikenali sebagai judul. Pakai "##" atau "###".')
    }

    if (RAW_HTML.test(plain)) {
      add(l.no, 'error', 'raw-html', 'Tag HTML tidak ditampilkan (akan hilang). Pakai sintaks Markdown.')
    }

    for (const m of plain.matchAll(/!\[([^\]]*)\]\(/g)) {
      if (!m[1].trim()) add(l.no, 'error', 'image-alt', 'Gambar tanpa teks alternatif. Tulis deskripsi di dalam [ ], misalnya ![Grafik n log n melawan n kuadrat](...).')
    }

    for (const m of plain.matchAll(/(?<!!)\[([^\]]*)\]\(([^)]*)\)/g)) {
      const label = m[1].trim()
      if (!label) add(l.no, 'error', 'link-empty', 'Tautan tanpa teks.')
      else if (VAGUE_LINK.test(label)) add(l.no, 'warning', 'link-vague', `Teks tautan "${label}" tidak menjelaskan tujuan. Tulis nama halaman yang dituju.`)
    }

    if (LATEX.test(plain)) {
      add(l.no, 'warning', 'latex', 'Rumus LaTeX tidak didukung. Tulis rumus dengan simbol Unicode (Θ, Ω, ≤, ², log₂) atau dalam `kode`.')
    }
  })

  if (unclosedFenceLine) {
    add(unclosedFenceLine, 'error', 'code-unclosed', 'Blok kode tidak ditutup. Seluruh teks sesudahnya akan ikut menjadi kode.')
  }

  return issues.sort((a, b) => a.line - b.line)
}

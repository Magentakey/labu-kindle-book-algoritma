import { scanLines } from './markdownLines.js'
import { CONTAINERS, LEAF_MARKERS, MARKERS, parseDirective } from './splitContent.js'
import { TRACE_IDS } from '../algorithms/traces.js'
import { GROWTH_KEYS } from './growth.js'
import { parseRatioArgs } from './ratio.js'
import { parseBoundArgs } from './boundCheck.js'
import { parseLimitArgs } from './limitCheck.js'
import { parseMasterArgs } from './masterCase.js'
import { quizProblem } from './quiz.js'
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

const OPTION_LINE = /^\s*[-*]\s+\[( |x|X)\]\s+(.*)$/
const ITEM_MARKERS = ['slide', 'tab', 'question', 'explain']
const CONTAINER_NAMES = Object.keys(CONTAINERS)

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
  /** Blok yang sedang terbuka: { name, line, items, hasContent, q } */
  let box = null

  const finishQuestion = () => {
    if (!box?.q) return
    const problem = quizProblem({ prompt: box.q.prompt, options: box.q.options })
    if (problem) add(box.q.line, 'error', 'quiz-question', `Pertanyaan kuis tidak sah: ${problem}.`)
    box.q = null
  }

  const closeBox = () => {
    finishQuestion()
    const { name, line, items } = box
    const label = CONTAINERS[name].label
    if ((name === 'steps' || name === 'tabs') && items < 2) {
      add(line, 'error', 'block-few-items', `Blok :::${name} butuh minimal 2 ${label} (ada ${items}). Tulis ::${CONTAINERS[name].item} Judul untuk tiap ${label}.`)
    }
    if (name === 'quiz' && items < 1) add(line, 'error', 'block-few-items', 'Blok :::quiz butuh minimal 1 pertanyaan. Tulis ::question Teks pertanyaan.')
    box = null
  }

  function handleDirective(l, trimmed) {
    const d = parseDirective(trimmed)
    if (!d) {
      add(l.no, 'error', 'marker-unknown', `Baris diawali "::" tetapi bukan penanda yang dikenal: "${trimmed}".`)
      return
    }

    if (d.kind === 'close') {
      if (box) closeBox()
      else add(l.no, 'error', 'block-stray-close', 'Penutup ":::" tanpa blok yang dibuka.')
      return
    }

    if (d.kind === 'open') {
      if (box) {
        add(l.no, 'error', 'block-nested', `Blok tidak boleh bersarang: tutup :::${box.name} (baris ${box.line}) dengan ":::" sebelum membuka blok baru.`)
      } else if (!CONTAINERS[d.name]) {
        add(l.no, 'error', 'block-unknown', `Blok ":::${d.name}" tidak dikenal. Yang tersedia: ${CONTAINER_NAMES.map((n) => `:::${n}`).join(', ')}.`)
      } else {
        box = { name: d.name, line: l.no, items: 0, hasContent: false, q: null }
        if (!d.args) {
          const severity = d.name === 'reveal' ? 'error' : 'warning'
          add(l.no, severity, 'block-title', `Beri judul pada blok: ":::${d.name} Judul". Judul dibacakan pembaca layar${d.name === 'reveal' ? ' dan menjadi teks tombol buka-tutup' : ''}.`)
        }
      }
      return
    }

    const { name, args } = d

    if (MARKERS[`::${name}`]) {
      const type = MARKERS[`::${name}`]
      if (args) add(l.no, 'error', 'marker-unknown', `Penanda ::${name} tidak memakai tambahan teks ("${args}").`)
      else if (box) add(l.no, 'error', 'marker-in-block', `::${name} tidak boleh di dalam blok :::${box.name}. Tulis di luar blok.`)
      else if (seenMarkers.has(type)) add(l.no, 'error', 'marker-duplicate', `Penanda ::${name} sudah dipakai sebelumnya. Hanya satu per materi.`)
      else {
        seenMarkers.add(type)
        afterMarker = true
        lastLevel = 1
      }
      return
    }

    if (LEAF_MARKERS.includes(name)) {
      if (name === 'trace') {
        if (!args) add(l.no, 'error', 'trace-id', `::trace butuh id peraga. Yang tersedia: ${TRACE_IDS.join(', ')}.`)
        else if (!TRACE_IDS.includes(args)) add(l.no, 'error', 'trace-unknown', `Peraga "${args}" tidak ada. Yang tersedia: ${TRACE_IDS.join(', ')}.`)
      } else if (name === 'ratio') {
        const { keys, bad } = parseRatioArgs(args)
        for (const key of keys ?? []) {
          if (!GROWTH_KEYS.includes(key)) add(l.no, 'error', 'ratio-unknown', `Kelas "${key}" tidak dikenal untuk ::ratio. Yang tersedia: ${GROWTH_KEYS.join(', ')}.`)
        }
        if (bad) add(l.no, 'error', 'ratio-n', `::ratio: ${bad}`)
      } else if (name === 'limit') {
        const { bad } = parseLimitArgs(args)
        if (bad) add(l.no, 'error', 'limit-args', `::limit: ${bad}`)
      } else if (name === 'master') {
        const { bad } = parseMasterArgs(args)
        if (bad) add(l.no, 'error', 'master-args', `::master: ${bad}`)
      } else if (name === 'bound') {
        const { bad } = parseBoundArgs(args)
        if (bad) add(l.no, 'error', 'bound-args', `::bound: ${bad}`)
      } else {
        for (const key of args ? args.split(',').map((k) => k.trim()).filter(Boolean) : []) {
          if (!GROWTH_KEYS.includes(key)) add(l.no, 'error', 'growth-unknown', `Kelas "${key}" tidak dikenal untuk ::growth. Yang tersedia: ${GROWTH_KEYS.join(', ')}.`)
        }
      }
      if (box) box.hasContent = true
      return
    }

    if (ITEM_MARKERS.includes(name)) {
      if (name === 'explain') {
        if (box?.name === 'quiz' && box.q) box.q.explaining = true
        else add(l.no, 'error', 'item-outside', '::explain hanya boleh sesudah ::question di dalam blok :::quiz.')
        return
      }
      if (!box || CONTAINERS[box.name].item !== name) {
        const owner = Object.entries(CONTAINERS).find(([, c]) => c.item === name)?.[0]
        add(l.no, 'error', 'item-outside', `::${name} hanya boleh di dalam blok :::${owner}.`)
        return
      }
      if (!args) add(l.no, 'error', 'item-title', `::${name} butuh judul. Contoh: ::${name} Judul.`)
      if (name === 'question') {
        finishQuestion()
        box.q = { line: l.no, prompt: args, options: [], explaining: false }
      }
      box.items++
      box.hasContent = true
      return
    }

    add(l.no, 'error', 'marker-unknown', `Penanda ::${name} tidak dikenal. Yang tersedia: ${[...Object.keys(MARKERS), ...LEAF_MARKERS.map((n) => `::${n}`), ...ITEM_MARKERS.map((n) => `::${n}`)].join(', ')}.`)
  }

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

    // Penanda dan blok (::nama, :::nama, :::)
    if (trimmed.startsWith('::')) {
      handleDirective(l, trimmed)
      return
    }

    // Isi di dalam blok
    if (box && trimmed) {
      if (CONTAINERS[box.name].item && box.items === 0) {
        add(l.no, 'warning', 'block-intro-ignored', `Teks sebelum ::${CONTAINERS[box.name].item} pertama di dalam :::${box.name} tidak ditampilkan. Pindahkan ke luar blok.`)
      }
      if (box.name === 'quiz' && box.q && !box.q.explaining) {
        const m = OPTION_LINE.exec(text)
        if (m) box.q.options.push({ text: m[2].trim(), correct: m[1].toLowerCase() === 'x' })
      }
      if (box.name !== 'quiz') box.hasContent = true
    }

    // Judul
    const h = HEADING.exec(text)
    if (h && box) {
      add(l.no, 'warning', 'heading-in-block', `Judul di dalam blok :::${box.name} merusak urutan judul halaman. Pakai judul item (::${CONTAINERS[box.name].item ?? 'slide'} Judul) atau teks biasa.`)
      return
    }
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

  if (box) {
    add(box.line, 'error', 'block-unclosed', `Blok :::${box.name} tidak ditutup. Tambahkan baris ":::" di akhir blok.`)
    finishQuestion()
  }

  if (unclosedFenceLine) {
    add(unclosedFenceLine, 'error', 'code-unclosed', 'Blok kode tidak ditutup. Seluruh teks sesudahnya akan ikut menjadi kode.')
  }

  return issues.sort((a, b) => a.line - b.line)
}

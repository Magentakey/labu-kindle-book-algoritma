/**
 * Saklar peraga penelusuran kode (penanda `::trace`).
 *
 * `false` = semua peraga disembunyikan dari halaman materi, termasuk teks pengantarnya
 * (subbagian "### Peraga: ..." atau paragraf penutup tepat di atas peraga). Visualisasi (`::visualizer`) tetap tampil.
 * Isi file materi (.md), komponen, dan tes tidak berubah, jadi untuk memunculkan kembali cukup ubah menjadi `true`.
 */
export const SHOW_TRACES = false

const LEAD_IN = /peraga|jalankan|tombol \*\*Berikutnya\*\*/i

/** Membuang pengantar peraga di ujung bawah satu teks Markdown yang diikuti `::trace`. */
export function stripTraceLeadIn(text) {
  const lines = text.split('\n')
  let heading = -1
  lines.forEach((l, i) => {
    if (/^#{2,4}\s+Peraga\b/.test(l)) heading = i
  })
  if (heading >= 0) return lines.slice(0, heading).join('\n').trimEnd()
  const blocks = text.trimEnd().split(/\n{2,}/)
  const last = blocks.at(-1) ?? ''
  if (blocks.length > 0 && !/^(```|\||#)/.test(last) && LEAD_IN.test(last)) blocks.pop()
  return blocks.join('\n\n')
}

/** Frasa yang dibuang atau disederhanakan agar kalimat tetap utuh tanpa peraga. */
const REWRITES = [
  [/,\s*sama dengan angka di kolom [^.]*? pada peraga\./g, '.'],
  [/pseudocode dan peraga di atas/g, 'pseudocode'],
  [/Dua peraga pseudocode dan visualisasi batang/g, 'Visualisasi batang'],
]

/** Membuang kalimat yang menyebut peraga dari satu teks Markdown. Baris yang jadi kosong ikut dibuang. */
export function scrubTraceMentions(text) {
  const kept = []
  for (const line of text.split('\n')) {
    if (!/peraga/i.test(line)) {
      kept.push(line)
      continue
    }
    let l = line
    for (const [from, to] of REWRITES) l = l.replace(from, to)
    if (/peraga/i.test(l)) {
      const lead = /^(\s*(?:[-*]|\d+\.)\s+)/.exec(l)?.[1] ?? ''
      const sentences = l.slice(lead.length).split(/(?<=[.!?])\s+/).filter((x) => !/peraga/i.test(x))
      l = sentences.length ? lead + sentences.join(' ') : ''
    }
    if (l.trim() !== '') kept.push(l)
  }
  return kept.join('\n')
}

/** Membuang paragraf pertama setelah `::trace` bila isinya lanjutan penjelasan peraga. */
export function stripTraceTail(text) {
  const blocks = text.split(/\n{2,}/)
  const first = blocks[0] ?? ''
  if (/^(```|\||#)/.test(first)) return text
  if (/^Beberapa hal yang bisa diamati/.test(first)) {
    // pengantar daftar pengamatan peraga, beserta daftar butirnya
    blocks.shift()
    while (blocks.length && /^\s*(?:[-*]|\d+\.)\s/.test(blocks[0])) blocks.shift()
    if (blocks.length && /menghasilkan \d+ langkah/.test(blocks[0])) blocks.shift()
  } else if (/peraga|menghasilkan \d+ langkah/i.test(first)) {
    blocks.shift()
  }
  return blocks.join('\n\n')
}

/** Mengembalikan bagian halaman tanpa peraga `::trace` (dan tanpa pengantarnya). Bagian lain tidak diubah. */
export function hideTraces(segments) {
  const hasTrace = segments.some((x) => x.type === 'trace')
  const out = []
  segments.forEach((seg, i) => {
    if (seg.type === 'trace') return
    const prev = segments[i - 1]
    const next = segments[i + 1]
    let cur = seg
    if (seg.type === 'markdown') {
      let text = seg.text
      if (next?.type === 'trace') text = stripTraceLeadIn(text)
      if (prev?.type === 'trace') text = stripTraceTail(text)
      if (hasTrace) text = scrubTraceMentions(text)
      text = text.trim()
      if (!text) return
      cur = { ...seg, text }
    }
    if (cur.items) cur = { ...cur, items: cur.items.map((it) => ({ ...it, segments: hideTraces(it.segments) })) }
    out.push(cur)
  })
  return out
}

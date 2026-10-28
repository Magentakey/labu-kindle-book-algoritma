// Memecah teks modul menjadi bagian (section) dan blok. Format teks:
//   @@ id | EYEBROW | Judul           awal bagian (eyebrow boleh kosong)
//   {{kode}} {{loops}} {{kasus}} {{tantangan}}   penanda komponen khusus (satu baris sendiri)
//   {{callout:jenis|Judul}} ... {{/callout}}      kotak catatan (jenis: benar, coba)

const SLOTS = new Set(['kode', 'loops', 'kasus', 'tantangan'])

/** @returns {Array<{ id: string, eyebrow: string, judul: string, blok: Array<{ type: 'md', text: string } | { type: 'slot', name: string } | { type: 'callout', jenis: string, judul: string, text: string }> }>} */
export function parseModul(text) {
  const sections = []
  let cur = null
  let buf = []
  let callout = null
  const flush = () => {
    const t = buf.join('\n').trim()
    if (t && cur) cur.blok.push({ type: 'md', text: t })
    buf = []
  }
  for (const line of text.split('\n')) {
    const head = /^@@\s*([\w-]+)\s*\|\s*(.*?)\s*\|\s*(.+?)\s*$/.exec(line)
    if (head && !callout) {
      flush()
      cur = { id: head[1], eyebrow: head[2], judul: head[3], blok: [] }
      sections.push(cur)
      continue
    }
    if (!cur) continue
    const open = /^\{\{callout:(\w+)\|(.+)\}\}\s*$/.exec(line)
    if (open && !callout) {
      flush()
      callout = { type: 'callout', jenis: open[1], judul: open[2].trim(), text: '' }
      continue
    }
    if (/^\{\{\/callout\}\}\s*$/.test(line) && callout) {
      callout.text = buf.join('\n').trim()
      buf = []
      cur.blok.push(callout)
      callout = null
      continue
    }
    const slot = /^\{\{(\w+)\}\}\s*$/.exec(line)
    if (slot && SLOTS.has(slot[1]) && !callout) {
      flush()
      cur.blok.push({ type: 'slot', name: slot[1] })
      continue
    }
    buf.push(line)
  }
  flush()
  return sections
}

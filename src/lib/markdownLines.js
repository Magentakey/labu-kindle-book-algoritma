/**
 * Memecah teks Markdown menjadi baris dan menandai baris yang berada di dalam
 * blok kode berpagar (``` atau ~~~). Dipakai bersama oleh pemecah konten dan
 * pemeriksa aturan penulisan supaya keduanya sepakat mana yang "kode".
 */

/** Menyeragamkan akhir baris (file dari Windows memakai CRLF) dan membuang BOM. */
export function normalizeNewlines(text) {
  return String(text ?? '').replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n')
}

/**
 * @typedef {Object} MdLine
 * @property {number} no          nomor baris (mulai dari 1)
 * @property {string} text
 * @property {boolean} inFence    true untuk pagar pembuka, isi, dan pagar penutup
 * @property {'open'|'close'|null} fence
 * @property {string} info        teks setelah pagar pembuka (nama bahasa), kosong jika bukan pagar pembuka
 */

/**
 * @param {string} md
 * @returns {{ lines: MdLine[], unclosedFenceLine: number|null }}
 */
export function scanLines(md) {
  const raw = normalizeNewlines(md).split('\n')
  /** @type {MdLine[]} */
  const lines = []
  let open = null // { char, len, no }

  raw.forEach((text, i) => {
    const no = i + 1
    const m = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(text)
    if (!open) {
      // Pagar pembuka berpagar backtick tidak boleh memuat backtick lagi di info string.
      if (m && !(m[1][0] === '`' && m[2].includes('`'))) {
        open = { char: m[1][0], len: m[1].length, no }
        lines.push({ no, text, inFence: true, fence: 'open', info: m[2].trim() })
      } else {
        lines.push({ no, text, inFence: false, fence: null, info: '' })
      }
      return
    }
    const closes = m && m[1][0] === open.char && m[1].length >= open.len && m[2].trim() === ''
    if (closes) {
      open = null
      lines.push({ no, text, inFence: true, fence: 'close', info: '' })
    } else {
      lines.push({ no, text, inFence: true, fence: null, info: '' })
    }
  })

  return { lines, unclosedFenceLine: open ? open.no : null }
}

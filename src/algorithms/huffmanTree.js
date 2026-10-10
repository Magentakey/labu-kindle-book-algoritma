export const huffmanTreeCode = `function huffman(chars) {
  const queue = buatAntreanPrioritas(chars)
  while (queue.size() > 1) {
    const kiri = queue.extractMin()
    const kanan = queue.extractMin()
    const induk = new Node(kiri.freq + kanan.freq, kiri, kanan)
    queue.insert(induk)
  }
  return queue.extractMin()
}`

export const huffmanTreeLines = huffmanTreeCode.split('\n').length

export const MAX_SYMBOLS = 8
export const MIN_SYMBOLS = 2
export const MAX_FREQ = 99

const LABELS = {
  normal: 'ada di antrean prioritas',
  pickA: 'diambil pertama (frekuensi terkecil), menjadi anak kiri',
  pickB: 'diambil kedua, menjadi anak kanan',
  created: 'simpul gabungan baru',
  visited: 'bagian dari pohon Huffman akhir',
}

/**
 * Membaca isian seperti "A:5, B:9, C:12". Satu simbol = satu karakter.
 * @param {string} text
 * @returns {{ ok: true, value: Array<{ sym: string, freq: number }> } | { ok: false, error: string }}
 */
export function parseHuffmanInput(text) {
  const raw = String(text).trim()
  if (raw === '') return { ok: false, error: 'Isi minimal dua simbol, contoh: A:5, B:9.' }
  const parts = raw.split(/[\s,;]+/).filter(Boolean)
  const value = []
  const seen = new Set()
  for (const p of parts) {
    const m = /^(\S):(\d+)$/.exec(p)
    if (!m) return { ok: false, error: `"${p}" tidak sesuai format simbol:frekuensi. Contoh: A:5 (satu karakter, titik dua, angka).` }
    const freq = Number(m[2])
    if (freq < 1 || freq > MAX_FREQ) return { ok: false, error: `Frekuensi ${m[2]} di luar rentang 1 sampai ${MAX_FREQ}.` }
    if (seen.has(m[1])) return { ok: false, error: `Simbol "${m[1]}" muncul lebih dari sekali.` }
    seen.add(m[1])
    value.push({ sym: m[1], freq })
  }
  if (value.length < MIN_SYMBOLS) return { ok: false, error: `Isi minimal ${MIN_SYMBOLS} simbol.` }
  if (value.length > MAX_SYMBOLS) return { ok: false, error: `Maksimal ${MAX_SYMBOLS} simbol (Anda mengisi ${value.length}).` }
  return { ok: true, value }
}

/** @param {Array<{ sym: string, freq: number }>} items */
export const formatHuffmanInput = (items) => items.map((x) => `${x.sym}:${x.freq}`).join(', ')

/**
 * Kode Huffman tiap simbol dari pohon akhir (kiri = 0, kanan = 1).
 * @param {{ sym?: string, left?: any, right?: any }} root
 * @returns {Record<string, string>}
 */
export function huffmanCodes(root) {
  const codes = {}
  const walk = (node, bits) => {
    if (!node.left) codes[node.sym] = bits || '0'
    else {
      walk(node.left, bits + '0')
      walk(node.right, bits + '1')
    }
  }
  walk(root, '')
  return codes
}

/**
 * Menjalankan algoritma Huffman dan merekam tiap langkah. Pohon-pohon yang ada digambar berdampingan
 * (hutan): yang sedang diproses di kiri, disusul isi antrean prioritas dari frekuensi terkecil.
 * Jika frekuensi sama, simpul yang lebih dulu dibuat didahulukan.
 * @param {Array<{ sym: string, freq: number }>} items
 * @returns {import('./bfsTree.js').TreeStep[]}
 */
export function huffmanTreeSteps(items) {
  let seq = 0
  let internal = 0
  const make = (init) => ({ id: '', freq: 0, seq: seq++, mark: 'normal', left: null, right: null, ...init })
  const queue = items.map((x) => make({ id: `s-${x.sym}`, sym: x.sym, freq: x.freq }))
  const byFreq = (a, b) => a.freq - b.freq || a.seq - b.seq
  queue.sort(byFreq)

  /** @type {any[]} */
  let picked = []
  const label = (n) => (n.sym ?? String(n.freq))
  const name = (n) => (n.sym ? `${n.sym} (${n.freq})` : `simpul gabungan ${n.freq}`)

  const flatten = () => {
    const out = []
    const walk = (n, parent, edge) => {
      out.push({
        id: n.id,
        parent,
        label: label(n),
        sub: n.sym ? `frek. ${n.freq}` : '',
        edge,
        mark: n.mark,
      })
      if (n.left) walk(n.left, n.id, '0')
      if (n.right) walk(n.right, n.id, '1')
    }
    for (const r of [...picked, ...queue]) walk(r, null, undefined)
    return out
  }

  /** @type {import('./bfsTree.js').TreeStep[]} */
  const steps = []
  const push = (line, note, extraPanels = []) =>
    steps.push({
      line,
      note,
      view: {
        labels: LABELS,
        nodes: flatten(),
        panels: [
          {
            type: 'list',
            title: 'Antrean prioritas (frekuensi terkecil di kiri)',
            items: queue.map((n) => `${n.sym ?? '•'} ${n.freq}`),
            empty: 'kosong',
          },
          ...extraPanels,
        ],
      },
    })

  push(
    2,
    `Buat antrean prioritas berisi ${queue.length} simpul daun, diurutkan dari frekuensi terkecil: ${queue.map(name).join(', ')}.`,
  )

  while (queue.length > 1) {
    push(3, `Antrean berisi ${queue.length} simpul (lebih dari 1), jadi perulangan berlanjut.`)

    const a = queue.shift()
    a.mark = 'pickA'
    picked = [a]
    push(4, `Ambil simpul terkecil: ${name(a)}. Ia akan menjadi anak kiri (sisi 0).`)

    const b = queue.shift()
    b.mark = 'pickB'
    picked = [a, b]
    push(5, `Ambil simpul terkecil berikutnya: ${name(b)}. Ia akan menjadi anak kanan (sisi 1).`)

    const parent = make({ id: `m${++internal}`, freq: a.freq + b.freq, left: a, right: b, mark: 'created' })
    a.mark = 'normal'
    b.mark = 'normal'
    picked = [parent]
    push(6, `Buat simpul induk dengan frekuensi ${a.freq} + ${b.freq} = ${parent.freq}. Kirinya ${name(a)}, kanannya ${name(b)}.`)

    picked = []
    queue.push(parent)
    queue.sort(byFreq)
    push(7, `Masukkan simpul induk (${parent.freq}) kembali ke antrean prioritas. Posisinya mengikuti urutan frekuensi.`)
  }

  const root = queue.shift()
  const markAll = (n) => {
    n.mark = 'visited'
    if (n.left) markAll(n.left)
    if (n.right) markAll(n.right)
  }
  markAll(root)
  picked = [root]
  const codes = huffmanCodes(root)
  const ordered = items.map((x) => x.sym).sort((p, q) => codes[p].length - codes[q].length || p.localeCompare(q))
  push(
    9,
    `Antrean tersisa satu simpul, yaitu akar dengan frekuensi ${root.freq}. Pohon Huffman selesai. ` +
      `Kode tiap simbol dibaca dari akar ke daun (kiri 0, kanan 1): ${ordered.map((s) => `${s} = ${codes[s]}`).join(', ')}.`,
    [{ type: 'list', title: 'Kode Huffman', items: ordered.map((s) => `${s} = ${codes[s]}`), empty: '' }],
  )
  return steps
}
